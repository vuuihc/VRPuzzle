import 'babel-polyfill';
import Game from "./game.js"
let game = new Game()
const initDashboard = ()=>{
    const screenWidth = window.innerWidth,
      screenHeight = window.innerHeight
    let handImg = document.querySelector("#pin>img")
    handImg.style.width = 0.12 * screenWidth + "px"
    handImg.style.height = 0.12 * screenHeight+ "px"
    handImg.style.left = 0.46 * screenWidth+ "px"
    handImg.style.top = 0.34 * screenHeight + "px"
    /*width: 32vw;*/
    /*height: 10vh;*/
    /*bottom: 9vh;*/
    /*left: 34vw;*/
    let button = document.querySelector("#pin>button")
    button.style.width = 0.32 * screenWidth
    button.style.height = 0.1 * screenHeight
    button.style.left = 0.34 * screenWidth
    button.style.bottom = 0.1 * screenHeight
}
const loop = ()=>{
    initDashboard()
    game.render()
}
loop()
