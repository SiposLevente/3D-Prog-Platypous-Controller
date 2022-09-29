#!/usr/bin/env python3
import paho.mqtt.client as mqttClient
import time
import certifi
import rospy
from geometry_msgs.msg import Twist
from nav_msgs.msg import Odometry

TIMEOUT_DEFAULT_VAL = 5
timeout = TIMEOUT_DEFAULT_VAL

class Main:
    def __init__(self):
        rospy.init_node('mqtt_subscriber', anonymous=True)
        self.twist_pub = rospy.Publisher('/cmd_vel/nav', Twist, queue_size=10)
        rospy.Subscriber("/odometry/wheel", Odometry, self.cb_odometry_cp)
        global timeout
        timeout = TIMEOUT_DEFAULT_VAL

    def cb_odometry_cp(self, msg):
        self.odometry_cp = msg

    def on_connect(client, userdata, flags, rc):
        if rc == 0:
            print("Connected to broker")
            global Connected  # Use global variable
            Connected = True  # Signal connection
            client.subscribe("to_platypous/x")
            client.subscribe("to_platypous/y")
            client.subscribe("to_platypous/z")
        else:
            print("Connection failed")

        while Connected != True:  # Wait for connection
            time.sleep(0.1)

    # The callback for when a PUBLISH message is received from the server.
    def on_message(client, userdata, msg):
        global timeout
        timeout = TIMEOUT_DEFAULT_VAL
        if "to_platypous/x" in msg.topic:
            x_value = msg.payload
            Values.x_value = str(x_value).split("b'")[1].split("'")[0]
        elif "to_platypous/y" in msg.topic:
            y_value = msg.payload
            Values.y_value = str(y_value).split("b'")[1].split("'")[0]
        elif "to_platypous/z" in msg.topic:
            z_value = msg.payload
            Values.z_value = str(z_value).split("b'")[1].split("'")[0]

    def pub(self):
        vel_msg = Twist()
        global Connected
        global timeout
        Connected = False  # global variable for the state of the connection

        broker_address = "10.8.8.187"
        port = 1883
        user = ""
        password = ""

        client = mqttClient.Client("Python")  # create new instance
        #client.tls_set(certifi.where())
        # set username and password
        client.username_pw_set(user, password=password)
        client.on_connect = Main.on_connect  # attach function to callback
        client.connect(broker_address, port=port)  # connect to broker

        client.loop_start()  # start the loop
        while not rospy.is_shutdown():
            time.sleep(0.1)
            o = self.odometry_cp
            if timeout > 0:
                timeout -= 1
            if timeout == 0:
                client.publish("to_platypous/x", 0)
                client.publish("to_platypous/y", 0)
                client.publish("to_platypous/z", 0)

            x = o.pose.pose.position.x
            y = o.pose.pose.position.y
            z = o.pose.pose.position.z

            f = "from_platypous/"

            # client.publish(f + "x", str(x))
            # client.publish(f + "y", str(y))
            # client.publish(f + "z", str(z))

            client.on_message = Main.on_message
            y_val = -float(Values.y_value)/20
            x_val = float(Values.x_value)/10


            if (y_val > 0.5):
                y_val = 0.5
            if (x_val > 1.0):
                x_val = 1.0

            if (y_val < -0.5):
                y_val = -0.5
            if (x_val < -1.0):
                x_val = -1.0

            vel_msg.linear.x = y_val
            vel_msg.angular.z = x_val
            self.twist_pub.publish(vel_msg)


class Values:
    x_value = 0.0
    y_value = 0.0
    z_value = 0.0


if __name__ == '__main__':
    main = Main()
    main.pub()

    # source ~/catkin_ws/devel/setup.bash
    # clear
    # rosrun ros_project mqtt.py