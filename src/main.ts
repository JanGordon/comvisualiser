import { renderApp } from "kleinui"
import { button, canvas, container, header1, listItem, textInput } from "kleinui/elements"
import { Renderer } from "./renderer"
import { dependableValue, dynamicNode } from "kleindynamic"


const c = new canvas()
const ctx = c.getContext("2d")!
const r = new Renderer(ctx)


export const simulationStatus = new dependableValue(false, "sim")


const app = new container(
    new header1("Centre of Mass Visualiser").addStyle("text-align: center; font-weight: 1em; font-family: monospace;"),
    c.addStyle("width: 100%; height: 100vh; position: absolute; top: 0; left: 0"),
    new container(
        new button("Reset").addEventListener("click", ()=>{
            simulationStatus.V = false
            r.resetSimulation()
        }),
        new dynamicNode(()=>
            new button(simulationStatus.V ? "Stop Simulation" : "Start Simulation").addEventListener("click", ()=>{
                if (simulationStatus.V) {
                    simulationStatus.V = false
                } else {
                    simulationStatus.V = true
                }
            })
        , simulationStatus).node
    ).addStyle("position: absolute; bottom: 0; padding: 1em;")

    
)


renderApp(app, document.getElementById("app")!)

function re() {
    c.htmlNode.width = c.htmlNode.clientWidth
    c.htmlNode.height = c.htmlNode.clientHeight
}
re()
// ctx.translate(0.5, 0.5);


function debounce(f: ()=>void, delay: number) {
    let timer = 0;
    return () => {
        clearTimeout(timer);
        timer = setTimeout(() => f(), delay);
    }
}

const ro = new ResizeObserver(debounce(re, 10))
ro.observe(c.canvas)





r.draw(1/60)

for (let composite of r.shapes) {

}



