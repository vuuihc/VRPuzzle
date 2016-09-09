import 'babel-polyfill';
import Game from "./game.js"
let game = new Game()

const loop = ()=>{
    game.render()
}
loop()
