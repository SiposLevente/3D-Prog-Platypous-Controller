<p align="center">
  <img
    src="images/Python-01.jpg"
    alt="drawing" 
    width="400"
  />
</p>

# Python scripts

>mqtt_subscribe_publish_move.py

>mqtt_web_controller.py

<br />

## Main Parts Of The mqtt_subscribe_publish_move.py

<br />

>Need a python extension which allow us to connect to mqtt brokers. The name of this extension is paho.<br />
[Download instruction](https://linux-packages.com/ubuntu-focal-fossa/package/python3-paho-mqtt)

>It needs to be installed on the robot.<br />
In the robot github documentation we can see that this is installed under [RUN python3 -m pip install --upgrade](https://github.com/ABC-iRobotics/PlatypOUs-Mobile-Robot-Platform/blob/devel/docker/Dockerfile)


<p align="center">
  <img
    src="images/paho.png"
    alt="drawing"
    width="800"
  />
</p>

<br />

>This is where the script setup the [subscribe](http://docs.ros.org/en/noetic/api/nav_msgs/html/msg/Odometry.html) and [publish](http://docs.ros.org/en/melodic/api/geometry_msgs/html/msg/Twist.html) methodes.

<p align="center">
  <img
    src="images/sub_pub.png"
    alt="drawing"
    width="800"
  />
</p>

<br />

>This is where the MQTT datas are given. Our MQTT configuration description is available under android_app file [here](https://github.com/SiposLevente/3D-Prog-Platypous-Controller/tree/main/android_app).

>Be careful if you want to change this part, because we used tls and for this we needed to improt certifi. If you use other config be in mind for what to change.

<p align="center">
  <img
    src="images/cerifi.png"
    alt="drawing"
    width="800"
  />
</p>

<br />

>We publish the robot odometry datas back to the MQTT server.<br />
Name conversions: "from_platypous/x", "from_platypous/y", "from_platypous/z".

<p align="center">
  <img
    src="images/publish2.png"
    alt="drawing"
    width="800"
  />
</p>

<br />

<pre>
The z part is unimportant in all the parts, because the robot does not lift up or even if it rose, it could not perceive.
</pre>

<br />

## Important part to use correctly this program in this form

<br />
<pre>
Publish your x, y and z datas under the <mark> to_platypous/ </mark> topic in order to go in the given direction.
</pre>

<pre>
Subscibe your x, y and z datas on the <mark> from_platypous/</mark> topic in order to use the robot real time location in other project.
</pre>

Pictures taken by [carbon.now](https://carbon.now.sh/)