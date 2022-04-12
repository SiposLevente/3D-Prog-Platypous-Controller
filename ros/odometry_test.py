#!/usr/bin/env python3
import rospy
import time
import math
from geometry_msgs.msg import Twist
from nav_msgs.msg import Odometry

class PlatypousMain:
    def __init__(self):
        rospy.init_node('odometry', anonymous=True)
        self.twist_pub = rospy.Publisher('/cmd_vel/nav', Twist, queue_size=10)
        rospy.Subscriber("/odometry/wheel", Odometry, self.cb_scan_cp)
    
    # Callback function to receive scan datas
    def cb_scan_cp(self, msg):
        self.scan_cp = msg

    def scan(self):
        time.sleep(1)
        p = self.scan_cp
        
        self.twist_pub = rospy.Publisher('/cmd_vel/nav', Twist, queue_size=10)
        vel_msg = Twist()
        vel_msg.linear.x = 0.5
        self.twist_pub.publish(vel_msg)


        print(str(p.pose))



if __name__ == '__main__':
    pm = PlatypousMain()
    pm.scan()

    #while not rospy.is_shutdown():
    #   pm.scan()

    #source ~/catkin_ws/devel/setup.bash
    #clear
    #rosrun ros_project test.py
