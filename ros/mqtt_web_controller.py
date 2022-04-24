import paho.mqtt.client as mqttClient
import time
import certifi
import rospy
from geometry_msgs.msg import Twist
from nav_msgs.msg import Odometry

TIMEOUT_TIME = 1

class Orientation:
    x = 0.0
    y = 0.0
    z = 0.0

class Platypous_Controller:
    def __init__(self):
        rospy.init_node('mqtt_subscriber', anonymous=True)
        rospy.sleep(1)
        rospy.Subscriber("/driver/wheel_odometry",
                         Odometry, self.cb_odometry_cp)
        self.twist_pub = rospy.Publisher('/cmd_vel/nav', Twist, queue_size=10)
        self.main_topic = "controller/"
        self.x_topic = "controller/orientation/x"
        self.y_topic = "controller/orientation/y"
        self.z_topic = "controller/orientation/z"
        self.use_topic = "controller/inUse"
        self.platypous_topic = "platypous/"
        self.connected = False
        self.timeout = TIMEOUT_TIME

    def cb_odometry_cp(self, msg):
        self.odometry_cp = msg

    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print("Connected to broker")
            self.connected = True  # Signal connection
            client.subscribe(self.x_topic)
            client.subscribe(self.y_topic)
            client.subscribe(self.z_topic)
            client.subscribe(self.use_topic)
        else:
            print("Connection failed")

        while self.connected != True:  # Wait for connection
            time.sleep(0.1)

    # The callback for when a PUBLISH message is received from the server.
    def on_message(self, client, userdata, msg):
        if self.x_topic in msg.topic:
            Orientation.x = self.get_val_from_message(msg.payload)
        elif self.y_topic in msg.topic:
            Orientation.y = self.get_val_from_message(msg.payload)
        elif self.z_topic in msg.topic:
            Orientation.z = self.get_val_from_message(msg.payload)
        elif self.use_topic in msg.topic:
            msg = self.get_val_from_message(msg.payload)
            if msg == "released":
                Orientation.x = 0
                Orientation.y = 0
                Orientation.z = 0
            else:
                self.timeout = TIMEOUT_TIME

    def get_val_from_message(self, value):
        return str(value).split("b'")[1].split("'")[0]

    def start(self):
        self.connected = False

        broker_address = "192.168.1.150"
        port = 1883
        # user = "Ponti"
        # password = "n3vSLVTpecC!QhP"

        client = mqttClient.Client("Python")  # create new instance
        # client.tls_set(certifi.where())
        # set username and password
        #client.username_pw_set(user, password=password)
        client.on_connect = self.on_connect  # attach function to callback
        client.connect(broker_address, port=port)  # connect to broker

        client.loop_start()  # start the loop
        while not rospy.is_shutdown():
            vel_msg = Twist()
            self.timeout -= 1
            if self.timeout == 0:
                Orientation.x = 0
                Orientation.y = 0
                Orientation.z = 0
            time.sleep(1)
            odometry_data = self.odometry_cp
            positions = str(odometry_data.pose).split()

            self.publish_platypous_positon("x", positions, client)
            self.publish_platypous_positon("y", positions, client)
            self.publish_platypous_positon("z", positions, client)

            client.on_message = self.on_message

            print("X: " + str(Orientation.x) + " Y: " + str(Orientation.y) + " Z: " + str(Orientation.z))

            if abs(float(Orientation().z)) > 10:
                vel_msg.linear.x = -float(Orientation.z)/50
            if abs(float(Orientation().x)) > 10:
                vel_msg.angular.z = -float(Orientation.x)/50
            self.twist_pub.publish(vel_msg)

    def publish_platypous_positon(self, value, positions, client):
        value_index = positions.index(value + ":")
        value = positions[value_index+1]
        client.publish(self.platypous_topic +
                       positions[value_index].split(":")[0], value)

if __name__ == '__main__':
    controller = Platypous_Controller()
    controller.start()