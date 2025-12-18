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

    add(a: Vector2) {
        return new Vector2(this.x + a.x, this.y + a.y)
    }
}

interface Shape {
    type: string
    draw(ctx: CanvasRenderingContext2D, offset: Vector2): Error | null

    // returns the relative vector pcoordinates of the cetnre of teh mass of teh volume
    centreOfMass(): Vector2

    // volume(): number
    mass(): number
    density: number
    // volume(): number
}

var compositeIndex = 0;

type Force = {
    direction: Vector2
    position: Vector2
}

class Composite {
    appliedForces: Force[]
    type = "composite"
    name: string
    shapes: (Composite | Shape)[] = []
    position: Vector2
    rotation: number = 0 // about the centre of mass
    draw(ctx: CanvasRenderingContext2D, offset: Vector2): Error | null {
        for (let i of this.shapes) {
            i.draw(ctx, offset.add(this.position))
            let com = i.centreOfMass().add(offset).add(this.position)
            ctx.fillStyle = "orange"
            ctx.beginPath()
            ctx.ellipse(com.x, com.y, 2, 2, 0, 0, 360)
            ctx.fill()
        }

        let totalCOM = this.centreOfMass().add(offset).add(this.position)
        ctx.fillStyle = "red"
        ctx.beginPath()
        ctx.ellipse(totalCOM.x, totalCOM.y, 5, 5, 0, 0, 360)
        ctx.fill()
        return null
    }
    centreOfMass(): Vector2 {
        let totalMass = 0
        let weightedCOM = new Vector2()
        for (let i of this.shapes) {
            let m = i.mass()
            let com = i.centreOfMass()
            totalMass += m
            weightedCOM.x += m * com.x
            weightedCOM.y += m * com.y
        }

        return new Vector2(weightedCOM.x / totalMass, weightedCOM.y / totalMass)
    }
    mass(): number {
        let totalMass = 0
        for (let i of this.shapes) {
           totalMass += i.mass()
        }
        return totalMass
    }

    physicsStep(dt: number) {
        // calculate moments 
        let com = this.centreOfMass()
        let totalMoment = 0; // about com
        for (let f of this.appliedForces) {
            totalMoment = Math.abs(f.position.x - com.x) * f.direction.x
        }
        
        for (let i of this.shapes) {
            if (i.type == "composite") {
                (i as Composite).physicsStep(dt)
            }
        }
    }

    constructor(position: Vector2, ...items: (Composite | Shape)[]) {
        this.shapes = items
        this.position = position
        this.name = `composite ${compositeIndex}`
        compositeIndex++
        this.appliedForces = [
            {
                direction: new Vector2(0 -9.81),
                position: this.centreOfMass()
            }
        ]
    }
}


class Line implements Shape {
    type = "shape"
    strokeStyle: string = "black"
    from: Vector2 // relative
    to: Vector2 // relative
    density: number

    draw(ctx: CanvasRenderingContext2D, offset: Vector2) {
        ctx.strokeStyle = this.strokeStyle
        ctx.beginPath()
        ctx.moveTo(this.from.x + offset.x, this.from.y + offset.y)
        ctx.lineTo(this.to.x + offset.x, this.to.y + offset.y)
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
    type = "shape"
    strokeStyle: string = "black"
    centre: Vector2 // relative
    radius: Vector2
    density: number

    draw(ctx: CanvasRenderingContext2D, offset: Vector2) {
        ctx.strokeStyle = this.strokeStyle
        ctx.beginPath()
        ctx.ellipse(this.centre.x + offset.x, this.centre.y + offset.y, this.radius.x, this.radius.y, 0, 0, 360)
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




export class Renderer {
    ctx: CanvasRenderingContext2D
    shapes: Composite[] = [
        // new Composite(new Vector2(0,0),
        //     new Line(new Vector2(0,0), new Vector2(100,100), 1),
        //     new Ellipse(new Vector2(100, 100), new Vector2(100, 100), 1),
        //     // new Ellipse(new Vector2(100, 200), new Vector2(50, 50), 1),
        // ),

        new Composite(new Vector2(100,0),
            new Line(new Vector2(0,0), new Vector2(100,100), 1),
            new Ellipse(new Vector2(100, 100), new Vector2(100, 100), 1),
            new Ellipse(new Vector2(100, 200), new Vector2(50, 50), 1),


            new Composite(new Vector2(0,0),
                new Line(new Vector2(0,0), new Vector2(100,5), 1),
            )
        )
        
    ]


    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx
    }

    

    draw(dt: number) {
        this.ctx.clearRect(0,0, this.ctx.canvas.width, this.ctx.canvas.height)
        for (let i of this.shapes) {
            i.draw(this.ctx, new Vector2())
        }
        requestAnimationFrame((dt)=>this.draw(dt))
    }

    physicsStep(dt: number) {
        for (let i of this.shapes) {
            i.physicsStep(dt)
        }
    }

}
