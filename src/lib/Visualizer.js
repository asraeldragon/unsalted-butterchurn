import butterchurn from 'butterchurn'
import butterchurnPresets from 'butterchurn-presets'
import butterchurnPresetsExtra from 'butterchurn-presets/lib/butterchurnPresetsExtra.min'
import { showError, errorToMessage } from './errors'

export default class Visualizer {
  static defaultOptions = {
    presetRotateTime: 25.0,
    presetBlendTime: 3.0,
    fps: 60,
    width: 1920,
    height: 1080,
    volumeMultiplier: 1.25,
    audioDeviceName: '',
    debugShowAudioDeviceNames: false,

    pixelRatio: window.devicePixelRatio ?? 1,
    textureRatio: 1,
    meshHeight: 48,
    meshWidth: 36,
  }

  constructor(options) {
    this.options = Object.assign({}, Visualizer.defaultOptions, options)

    this.audioContext = new AudioContext()

    // Rendering vars
    this.rendering = false
    this.lastFrame = 0
    this.render = this.render.bind(this)
    this.changeFps(this.options.fps)

    // Presets vars
    this.presets = Object.assign({}, butterchurnPresets.getPresets(), butterchurnPresetsExtra.getPresets())
    this.presetKeys = Object.keys(this.presets)
    this.presetRotate = this.presetRotate.bind(this)
  }

  async init(canvas) {
    this.visualizer = butterchurn.createVisualizer(this.audioContext, canvas, {
      width: this.options.width,
      height: this.options.height,

      pixelRatio: this.options.pixelRatio,
      textureRatio: this.options.textureRatio,

      meshWidth: this.options.meshWidth,
      meshHeight: this.options.meshHeight,
    })

    this.micNode = await this.connectMic()

    this.changeAudio(this.micNode)
    this.renderStart()
    this.presetRotationStart()
  }

  async connectMic() {
    try {
      if( !navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices ) {
        throw new Error('enumerateDevices() not supported.')
      }

      // Figure out what audio device to grab-- default device, or ask user, or use URL param
      const constraints = { audio: true }
      if( this.options.debugShowAudioDeviceNames ) {
        // The user needs help figuring out the audio device name.
        // Don't try to grab a specific one and just show them all in the error box.
        const allDevices = await navigator.mediaDevices.enumerateDevices()
        console.log('debugging devices:', allDevices)
        showError(
          allDevices.filter(device => device.kind === 'audioinput')
            .map(device => device.label)
            .join('\n')
        )
        // Set the box to allow pointer events so the user can highlight and copy paste
        document.getElementById('error').style.pointerEvents = 'all'
      } else if( this.options.audioDeviceName ) {
        // Attempt to get one specific microphone
        const allDevices = await navigator.mediaDevices.enumerateDevices()

        const device = allDevices.find(device => device.label === this.options.audioDeviceName)
        constraints.audio = { deviceId: device.deviceId }
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      if( !stream ) {
        throw new Error('Unable to get mic: Stream was empty!')
      }

      const micSourceNode = this.audioContext.createMediaStreamSource(stream)

      this.audioContext.resume()

      // Amplify the mic source
      const gainNode = this.audioContext.createGain()
      gainNode.gain.value = this.options.volumeMultiplier
      micSourceNode.connect(gainNode)

      return gainNode
    } catch (err) {
      showError('Failed to listen to mic: ' + errorToMessage(err))
      throw err
    }
  }

  changeAudio(audioNode) {
    if( this.playingNode ) {
      this.playingNode.disconnect()
    }

    this.playingNode = audioNode
    this.visualizer.connectAudio(this.playingNode)
  }

  // Rendering functions
  changeFps(fps) {
    this.fpsInterval = 1000 / fps
  }

  renderStart(fps = this.options.fps) {
    this.rendering = true
    window.requestAnimationFrame(this.render)
    this.presetRotate(0)
  }

  renderStop() {
    this.rendering = false
  }

  render(timestamp) {
    if( !this.rendering ) { return }
    if( timestamp - this.lastFrame >= this.fpsInterval ) {
      this.visualizer.render()
      this.lastFrame = timestamp
    }

    window.requestAnimationFrame(this.render)
  }

  // Preset handling functions
  presetRotationStart(rotateSecs = this.options.presetRotateTime) {
    this.presetRotationHandle = window.setInterval(this.presetRotate, rotateSecs * 1000)
  }

  presetRotationStop() {
    if( this.presetRotationHandle ) {
      window.clearInterval(this.presetRotationHandle)
    }
  }

  presetRotate(blendSecs = this.options.presetBlendTime) {
    const nextPreset = this.presetKeys[Math.floor(Math.random() * this.presetKeys.length)]
    this.visualizer.loadPreset(this.presets[nextPreset], blendSecs)
  }

  // Misc functions
  resize(width, height) {
    this.visualizer.setRendererSize(width, height)
  }
}
