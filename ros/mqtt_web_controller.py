import paho.mqtt.client as mqttClient
import time
import certifi
import rospy
import math
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
        self.x_topic = self.main_topic+"orientation/x"
        self.y_topic = self.main_topic+"orientation/y"
        self.z_topic = self.main_topic+"orientation/z"
        self.use_topic = self.main_topic+"inUse"
        self.platypous_topic = "platypous/"
        self.platypous_position_topic = self.platypous_topic + "position/"
        self.platypous_orientation_topic = self.platypous_topic + "orientation/"
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
            

            self.publish_platypous_position(client)
            self.publish_platypous_orientation(client)

            client.on_message = self.on_message

            if abs(float(Orientation.x)) > 18:
                vel_msg.linear.x = float(Orientation.x)/50
            if abs(float(Orientation.y)) > 18:
                vel_msg.angular.z = -float(Orientation.y)/50
            self.twist_pub.publish(vel_msg)

    def publish_platypous_position(self, client):
        pose_data = self.odometry_cp.pose.pose.position
        client.publish(self.platypous_position_topic + "x", pose_data.x)
        client.publish(self.platypous_position_topic + "y", pose_data.y)
        client.publish(self.platypous_position_topic + "z", pose_data.z)

    def publish_platypous_orientation(self, client):
        pose_data = self.odometry_cp.pose.pose.orientation

        data_x = pose_data.x
        data_y = pose_data.y
        data_z = pose_data.z
        data_w = pose_data.w

        rotation_data = self.euler_from_quaternion(float(data_x), float(data_y), float(data_z), float(data_w))
        
        client.publish(self.platypous_orientation_topic + "x", rotation_data[0])
        client.publish(self.platypous_orientation_topic + "y", rotation_data[1])
        client.publish(self.platypous_orientation_topic + "z", rotation_data[2])


    def euler_from_quaternion(self, x, y, z, w):
        t0 = +2.0 * (w * x + y * z)
        t1 = +1.0 - 2.0 * (x * x + y * y)
        roll_x = math.atan2(t0, t1)
     
        t2 = +2.0 * (w * y - z * x)
        t2 = +1.0 if t2 > +1.0 else t2
        t2 = -1.0 if t2 < -1.0 else t2
        pitch_y = math.asin(t2)
     
        t3 = +2.0 * (w * z + x * y)
        t4 = +1.0 - 2.0 * (y * y + z * z)
        yaw_z = math.atan2(t3, t4)
     
        return math.degrees(roll_x), math.degrees(pitch_y), math.degrees(yaw_z)

if __name__ == '__main__':
    controller = Platypous_Controller()
    controller.start()
