import { textInput } from "kleinui/elements"

class Vector2 {
    x: number
    y: number
    constructor(x?: number, y?: number) {
        this.x = x ? x : 0
        this.y = y ? y : 0
    }

    copy() {
        return new Vector2(this.x, this.y)
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }
}

interface Shape {
    strokeStyle: string
    draw(ctx: CanvasRenderingContext2D): Error | null

    // returns the relative vector pcoordinates of the cetnre of teh mass of teh volume
    centreOfMass(): Vector2

    // volume(): number
    mass(): number
    density: number
    // volume(): number
}


class Line implements Shape {
    strokeStyle: string = "black"
    from: Vector2
    to: Vector2
    density: number

    draw(ctx: CanvasRenderingContext2D) {
        console.log("drawing line")
        ctx.beginPath()
        ctx.moveTo(this.from.x, this.from.y)
        ctx.lineTo(this.to.x, this.to.y)
        ctx.stroke()
        ctx.closePath()
        return null
    }

    centreOfMass() {
        return new Vector2((this.from.x + this.to.x)/2, (this.from.y + this.to.y) / 2)
    }

    constructor(from: Vector2, to: Vector2, density: number) {
        this.from = from
        this.to = to
        this.density = density
    }

    mass() {
        return this.to.length() - this.from.length() * this.density
    }
    
}

class Ellipse implements Shape {
    strokeStyle: string = "black"
    centre: Vector2
    radius: Vector2
    density: number

    draw(ctx: CanvasRenderingContext2D) {
        console.log("drawing line")
        ctx.beginPath()
        ctx.ellipse(this.centre.x, this.centre.y, this.radius.x, this.radius.y, 0, 0, 360)
        ctx.stroke()
        ctx.closePath()
        return null
    }

    centreOfMass() {
        return this.centre.copy()
    }

    constructor(centre: Vector2, radius: Vector2, density: number) {
        this.centre = centre
        this.radius = radius
        this.density = density
        
    }

    mass() {
        return Math.PI * this.radius.x * this.radius.x * this.density
    }
}




class Renderer {
    ctx: CanvasRenderingContext2D
    shapes: Shape[] = [
        new Line(new Vector2(0,0), new Vector2(100,100), 1),
        new Ellipse(new Vector2(100, 100), new Vector2(100, 100), 1),
        new Ellipse(new Vector2(100, 200), new Vector2(50, 50), 1),
    ]


    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx
    }

    draw() {
        let totalMass = 0
        let weightedCOM = new Vector2()
        for (let i of this.shapes) {
            let m = i.mass()
            console.log(m)
            let com = i.centreOfMass()
            totalMass += m
            weightedCOM.x += m * com.x
            weightedCOM.y += m * com.y

            this.ctx.strokeStyle = i.strokeStyle
            i.draw(this.ctx)


            
            this.ctx.fillStyle = "orange"
            this.ctx.beginPath()
            this.ctx.ellipse(com.x, com.y, 5, 5, 0, 0, 360)
            this.ctx.fill()
        }

        let totalCOM = new Vector2(weightedCOM.x / totalMass, weightedCOM.y / totalMass)

        this.ctx.fillStyle = "red"
        this.ctx.beginPath()
        this.ctx.ellipse(totalCOM.x, totalCOM.y, 5, 5, 0, 0, 360)
        this.ctx.fill()

    }

}


export function initialiseRenderer(ctx: CanvasRenderingContext2D) {
    console.log("Initialising canvas renderer")
    const r = new Renderer(ctx)
    r.draw()
}