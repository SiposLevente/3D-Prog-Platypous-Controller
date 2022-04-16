#!/usr/bin/env python3
import paho.mqtt.client as mqttClient
import time
import certifi
import rospy
from geometry_msgs.msg import Twist
from nav_msgs.msg import Odometry

class Main:
    def __init__(self):
        rospy.init_node('mqtt_subscriber', anonymous=True)
        self.twist_pub = rospy.Publisher('/cmd_vel/nav', Twist, queue_size=10)
        rospy.Subscriber("/odometry/wheel", Odometry, self.cb_odometry_cp)

    def cb_odometry_cp(self, msg):
        self.odometry_cp = msg


    def on_connect(client, userdata, flags, rc):    
        if rc == 0:    
            print("Connected to broker")    
            global Connected                #Use global variable
            Connected = True                #Signal connection
            client.subscribe("xAccel")
            client.subscribe("yAccel")
            client.subscribe("zAccel")
        else:    
            print("Connection failed")
        
        while Connected != True:    #Wait for connection
            time.sleep(0.1)

    def on_message(client, userdata, msg):  # The callback for when a PUBLISH message is received from the server.
        if "xAccel" in msg.topic:
            x_value = msg.payload
            Values.x_value = str(x_value).split("b'")[1].split("'")[0]
        elif "yAccel" in msg.topic:
            y_value = msg.payload
            Values.y_value = str(y_value).split("b'")[1].split("'")[0]
        elif "zAccel" in msg.topic:
            z_value = msg.payload
            Values.z_value = str(z_value).split("b'")[1].split("'")[0]

    def pub(self):
        vel_msg = Twist()
        global Connected
        Connected = False   #global variable for the state of the connection
        
        broker_address= "d6b5f80560aa4c889516ecf66760dcae.s2.eu.hivemq.cloud"
        port = 8883
        user = "Ponti"
        password = "n3vSLVTpecC!QhP"

        client = mqttClient.Client("Python")               #create new instance
        client.tls_set(certifi.where())
        client.username_pw_set(user, password=password)    #set username and password
        client.on_connect = Main.on_connect                      #attach function to callback
        client.connect(broker_address, port=port)          #connect to broker
        
        client.loop_start()        #start the loop
        while not rospy.is_shutdown():
            time.sleep(1)
            o = self.odometry_cp
            positions = str(o.pose).split()
            x_index = positions.index("x:")
            y_index = positions.index("y:")
            z_index = positions.index("z:")

            x = positions[x_index+1]
            y = positions[y_index+1]
            z = positions[z_index+1]

            f = "from_platypous/"

            client.publish(f + positions[x_index].split(":")[0], x)
            client.publish(f + positions[y_index].split(":")[0], y)
            client.publish(f + positions[z_index].split(":")[0], z)

            client.on_message = Main.on_message
            print("X: " + str(Values.x_value) + " Y: " + str(Values.y_value) + " Z: " + str(Values.z_value))
            vel_msg.linear.x = float(Values.y_value)/10
            vel_msg.angular.z = float(Values.x_value)/10
            self.twist_pub.publish(vel_msg)
            
class Values:
    x_value = 0.0
    y_value = 0.0
    z_value = 0.0


if __name__ == '__main__':
    main = Main()
    main.pub()
    


    #source ~/catkin_ws/devel/setup.bash
    #clear
    #rosrun ros_project mqtt.py