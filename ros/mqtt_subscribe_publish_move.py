#!/usr/bin/env python3
import paho.mqtt.client as mqttClient
import time
import certifi
import rospy
from geometry_msgs.msg import Twist
from nav_msgs.msg import Odometry


class Platypous_Controller:
    def __init__(self):
        rospy.init_node('mqtt_subscriber', anonymous=True)
        self.twist_pub = rospy.Publisher('/cmd_vel/nav', Twist, queue_size=10)
        self.main_topic = "controller/"
        self.x_topic = "controller/orientation/x"
        self.y_topic = "controller/orientation/y"
        self.z_topic = "controller/orientation/z"
        self.platypous_topic = "platypous/"
        self.connected = False
        rospy.Subscriber("/odometry/wheel", Odometry, self.cb_odometry_cp)

    def cb_odometry_cp(self, msg):
        self.odometry_cp = msg

    def on_connect(client, userdata, flags, rc):
        if rc == 0:
            print("Connected to broker")
            self.connected = True  # Signal connection
            client.subscribe(self.x_topic)
            client.subscribe(self.y_topic)
            client.subscribe(self.z_topic)
        else:
            print("Connection failed")

        while self.connected != True:  # Wait for connection
            time.sleep(0.1)

    # The callback for when a PUBLISH message is received from the server.
    def on_message(client, userdata, msg):
        if self.x_topic in msg.topic:
            x = msg.payload
            print(x)  # debug
            Orientation.x = str(x).split("b'")[1].split("'")[0]
        elif self.y_topic in msg.topic:
            y = msg.payload
            print(y)  # debug
            Orientation.y = str(y).split("b'")[1].split("'")[0]
        elif self.z_topic in msg.topic:
            z = msg.payload
            print(z)  # debug
            Orientation.z = str(z).split("b'")[1].split("'")[0]

    def start(self):
        vel_msg = Twist()
        self.connected = False

        broker_address = "192.168.1.150"
        port = 1883
        # user = "Ponti"
        # password = "n3vSLVTpecC!QhP"

        client = mqttClient.Client("Python")  # create new instance
        # client.tls_set(certifi.where())
        # set username and password
        # client.username_pw_set(user, password=password)
        client.on_connect = self.on_connect  # attach function to callback
        client.connect(broker_address, port=port)  # connect to broker

        client.loop_start()  # start the loop
        while not rospy.is_shutdown():
            time.sleep(1)
            odometry_data = self.odometry_cp
            positions = str(odometry_data.pose).split()

            # --------------------------------------------

            x_index = positions.index("x:")
            y_index = positions.index("y:")
            z_index = positions.index("z:")

            x = positions[x_index+1]
            y = positions[y_index+1]
            z = positions[z_index+1]

            client.publish(self.platypous_topic +
                           positions[x_index].split(":")[0], x)
            client.publish(self.platypous_topic +
                           positions[y_index].split(":")[0], y)
            client.publish(self.platypous_topic +
                           positions[z_index].split(":")[0], z)

            # --------------------------------------------

            client.on_message = self.on_message

            print("X: " + str(Orientation.x) + " Y: " +
                  str(Orientation.y) + " Z: " + str(Orientation.z))

            vel_msg.linear.x = float(Orientation.y)/10
            vel_msg.angular.z = float(Orientation.x)/10
            self.twist_pub.publish(vel_msg)


class Orientation:
    x = 0.0
    y = 0.0
    z = 0.0


if __name__ == '__main__':
    controller = Platypous_Controller()
    controller.start()

    # source ~/catkin_ws/devel/setup.bash
    # clear
    # rosrun ros_project mqtt.py
