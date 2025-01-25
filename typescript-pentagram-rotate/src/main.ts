import complete from './fallingAndRandomGenerator'
import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<canvas id="fill"></canvas>
`

const canvasFill = document.getElementById("fill") as HTMLCanvasElement
canvasFill.width = 1000 //window.innerWidth
canvasFill.height = 1000 //window.innerHeight

complete()