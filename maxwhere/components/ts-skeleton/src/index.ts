/* Copyright (C) 2015-2019 MISTEMS Ltd. - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import Config from '../src/mqtt-config.json'
import { wom, context, modules, Mesh, Node } from 'maxwhere'
import { womAsync } from '@mxw/next'
import * as THREE from '@mxw/three'
import { ipcMain } from 'electron'
import mqtt, { Client, IClientOptions, MqttClient } from 'mqtt'

let currentPos = { 'x': 0, 'y': 0, 'z': 0 }
let currentOri = new THREE.Quaternion(0, 0, 0, 1)

const mainTopic = 'platypous/'
const positionTopic = mainTopic + 'position/'
const positionXTopic = positionTopic + 'x'
const positionYTopic = positionTopic + 'y'
const positionZTopic = positionTopic + 'z'

const orientationTopic = mainTopic + 'orientation/'
const orientationXTopic = orientationTopic + 'x'
const orientationYTopic = orientationTopic + 'y'
const orientationZTopic = orientationTopic + 'z'
const orientationWTopic = orientationTopic + 'w'

const mqttOptions: IClientOptions = {
  'port': Config.port,
  'username': Config.username,
  'password': Config.password,
  'rejectUnauthorized': false,
  'clean': true,
  'keepalive': 60,
  'reconnectPeriod': 1000,
  'protocolVersion': 5,
  'queueQoSZero': false,
  'properties': {
    'sessionExpiryInterval': 0
  }
}

let platypous: Mesh
let mqttClient: MqttClient

async function initMQTT() {
  mqttClient = mqtt.connect('ws://192.168.1.150', mqttOptions)

  mqttClient.on('connect', () => {
    mqttClient.subscribe(positionXTopic)
    mqttClient.subscribe(positionYTopic)
    mqttClient.subscribe(positionZTopic)
  
    mqttClient.subscribe(orientationXTopic)
    mqttClient.subscribe(orientationYTopic)
    mqttClient.subscribe(orientationZTopic)
    mqttClient.subscribe(orientationWTopic)
    mqttClient.publish("test", "test")
  })
  
  
  mqttClient.on('message', (topic, payload) => {
    switch (topic) {
      case positionXTopic:
        currentPos.x = parseInt(payload.toString())
        console.log('pos update x')
        break
      case positionYTopic:
        currentPos.y = parseInt(payload.toString())
        break
      case positionZTopic:
        currentPos.z = parseInt(payload.toString())
        break
      case orientationXTopic:
        currentOri.x = parseInt(payload.toString())
        break
      case orientationYTopic:
        currentOri.y = parseInt(payload.toString())
        break
      case orientationZTopic:
        currentOri.z = parseInt(payload.toString())
        break
      case orientationWTopic:
        currentOri.w = parseInt(payload.toString())
        break
    }
  })  
}

module.exports.init = function () { }

module.exports.done = function (nodeReturnedByRenderFunction: Node) { }

module.exports.render = function (options: object): any {
  // initAsync()
  // initMQTT()
  // return wom.create('node', {})
}

module.exports.clear = function () { }

function updatePos() {
  platypous.setPosition(currentPos.x, currentPos.y, currentPos.z)
}

function updateOri() {
  platypous.setOrientation(currentOri.w, currentOri.x, currentPos.y, currentPos.z)
}

function updateStatus(){
  updatePos()
  updateOri()
}

async function initAsync() {
  platypous = wom.create('mesh', {
    url: 'penguin.mesh',
    id: 'platypous',
    class: 'animal',
    scale: 10,
    position: { x: currentPos.x, y: currentPos.y+500, z: currentPos.z },
    orientation: { x: currentOri.x, y: currentOri.y, z: currentOri.z, w: currentOri.w },
    autophysical: true,
    done: (m) => {
      console.log('DONE')
    }
  })

  await womAsync.render(platypous)
}

let periodicUpdate = setInterval(updateStatus, 50)