import { renderApp } from "kleinui"
import { canvas, container, header1, listItem, textInput } from "kleinui/elements"
import { Renderer } from "./renderer"

const c = new canvas()
const ctx = c.getContext("2d")!
const r = new Renderer(ctx)


const app = new container(
    new header1("Centre of Mass Visualiser"),
    c.addStyle("width: calc(100% - 4em); aspect-ratio: 16 / 9; margin: 2em; max-height: 60vh;"),
    
)


renderApp(app, document.getElementById("app")!)


c.htmlNode.width = c.htmlNode.clientWidth
c.htmlNode.height = c.htmlNode.clientHeight
ctx.translate(0.5, 0.5);

document.addEventListener("resize", () => {
    c.htmlNode.width = c.htmlNode.clientWidth * 10
    c.htmlNode.height = c.htmlNode.clientHeight * 10
    ctx.translate(0.5, 0.5);
})


r.draw(1/60)

for (let composite of r.shapes) {

}



