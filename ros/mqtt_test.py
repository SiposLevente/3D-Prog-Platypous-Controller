#!/usr/bin/env python3
import paho.mqtt.client as mqttClient
import time
import certifi

 
def on_connect(client, userdata, flags, rc):
 
    if rc == 0:
 
        print("Connected to broker")
 
        global Connected                #Use global variable
        Connected = True                #Signal connection 
 
    else:
 
        print("Connection failed")
 
Connected = False   #global variable for the state of the connection
 
broker_address= "d6b5f80560aa4c889516ecf66760dcae.s2.eu.hivemq.cloud"
port = 8883
user = "Ponti"
password = "n3vSLVTpecC!QhP"

client = mqttClient.Client("Python")               #create new instance
client.tls_set(certifi.where())
client.username_pw_set(user, password=password)    #set username and password
client.on_connect= on_connect                      #attach function to callback
client.connect(broker_address, port=port)          #connect to broker
 
client.loop_start()        #start the loop
 
while Connected != True:    #Wait for connection
    time.sleep(0.1)
 
try:
    while True:
 
        value = "asd"
        client.publish("python/test",value)
 
except KeyboardInterrupt:
 
    client.disconnect()
    client.loop_stop()


    #source ~/catkin_ws/devel/setup.bash
    #clear
    #rosrun ros_project mqtt_test.py