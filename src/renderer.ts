import { textInput } from "kleinui/elements"
import { simulationStatus } from "./main"
import { Vector2 } from "./utils"



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
    fixed: boolean
    appliedForces: Force[]
    type = "composite"
    name: string
    shapes: (Composite | Shape)[] = []
    initialPosition: Vector2
    position: Vector2
    initialRotation: number = 0
    rotation: number = 0 // about the centre of mass
    initialVelocity: Vector2 = new Vector2()
    velocity: Vector2 = new Vector2()
    draw(ctx: CanvasRenderingContext2D, offset: Vector2): Error | null {
        for (let i of this.shapes) {
            i.draw(ctx, offset.add(this.position))
            let com = i.centreOfMass().add(offset).add(this.position)
            ctx.fillStyle = "orange"
            ctx.beginPath()
            ctx.ellipse(com.x * scaleX, -com.y * scaleY, 2, 2, 0, 0, 360)
            ctx.fill()
        }


        let totalCOM = this.centreOfMass().add(offset).add(this.position)
        ctx.fillStyle = "red"
        ctx.beginPath()
        ctx.ellipse(totalCOM.x * scaleX, -totalCOM.y * scaleY, 5, 5, 0, 0, 360)
        ctx.fill()
        return null
    }
    centreOfMass(): Vector2 {
        let totalMass = 0
        let weightedCOM = new Vector2()
        for (let i of this.shapes) {
            let m = i.mass()
            console.log(m)
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
        // calculate moments about com
        let com = this.centreOfMass()
        let totalMoment = 0;
        for (let f of this.appliedForces) {
            totalMoment += Math.abs(f.position.x - com.x) * f.direction.x
        }

        // calculate vertical forces
        let totalForce = new Vector2();
        for (let f of this.appliedForces) {
            totalForce = totalForce.add(f.direction)
        }

        if (!this.fixed) {
            // calculate acceleration
            let acceleration = new Vector2(totalForce.x / this.mass(), totalForce.y / this.mass())
            this.velocity = this.velocity.add(acceleration.multiplyScalar(dt))
        
            // update position
            this.position = this.position.add(this.velocity.multiplyScalar(dt))
        
        }
        for (let i of this.shapes) {
            if (i.type == "composite") {
                (i as Composite).physicsStep(dt)
            }
        }
    }

    constructor(position: Vector2, fixed: boolean, ...items: (Composite | Shape)[]) {
        this.shapes = items
        this.position = position
        this.initialPosition = position.copy()
        this.name = `composite ${compositeIndex}`
        compositeIndex++
        this.appliedForces = [
            {
                direction: new Vector2(0, -9.81),
                position: this.centreOfMass()
            }
        ]
        this.fixed = fixed
    }

    resetSimulation() {
        this.position = this.initialPosition.copy()
        this.velocity = this.initialVelocity.copy();
        this.rotation = this.initialRotation;
        
        for (let i of this.shapes) {
            if (i.type == "composite") {
                (i as Composite).position = (i as Composite).initialPosition.copy();
                (i as Composite).velocity = (i as Composite).initialVelocity.copy();
                (i as Composite).rotation = (i as Composite).initialRotation;
            }
        }
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
        ctx.moveTo((this.from.x + offset.x) * scaleX , -(this.from.y + offset.y) * scaleY)
        ctx.lineTo((this.to.x + offset.x) * scaleX , -(this.to.y + offset.y) * scaleY)
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
        return Math.abs(this.to.length() - this.from.length()) * this.density
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
        ctx.ellipse((this.centre.x + offset.x) * scaleX , -(this.centre.y + offset.y) * scaleY , this.radius.x * scaleX, this.radius.y * scaleY, 0, 0, 360)
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

var scaleX = 10; // 500 pixels per metre
var scaleY = 10; // 500 pixels per metre

var transform = new Vector2(0, 0) // in metres


export class Renderer {
    ctx: CanvasRenderingContext2D
    shapes: Composite[] = [
        // new Composite(new Vector2(0,0),
        //     new Line(new Vector2(0,0), new Vector2(100,100), 1),
        //     new Ellipse(new Vector2(100, 100), new Vector2(100, 100), 1),
        //     // new Ellipse(new Vector2(100, 200), new Vector2(50, 50), 1),
        // ),

        new Composite(new Vector2(0,0), true,
            new Line(new Vector2(-10,-8), new Vector2(10,4), 1),

        ),

        new Composite(new Vector2(0,0), false,
            new Ellipse(new Vector2(0, 0), new Vector2(1, 1), 1),
            // new Ellipse(new Vector2(1, 2), new Vector2(0.5, 0.5), 1),


            // new Composite(new Vector2(0,0),
            //     new Line(new Vector2(0,0), new Vector2(1,0.5), 1),
            // )
        )
        
    ]


    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx
    }

    
    lt = 0
    draw(t: number) {
        transform.x = (this.ctx.canvas.width/2)/scaleX
        transform.y = (-this.ctx.canvas.height/2)/scaleY
        let dt = (t - this.lt) / 1000
        this.lt = t
        this.ctx.clearRect(0,0, this.ctx.canvas.width, this.ctx.canvas.height)
        for (let i of this.shapes) {
            i.draw(this.ctx, transform)
        }
        if (simulationStatus.V) {
            this.physicsStep(dt)
        }
        requestAnimationFrame((t)=>this.draw(t))
    }

    physicsStep(dt: number) {
        // need to see what forces need to be applied
        // to each composite at what point
        // well check colliosns for each of teh shapes

        // for (let i of this.shapes) {
        //     let distance = 
        // }



        for (let i of this.shapes) {
            if (!i.fixed) {
                let f = -9.8 * i.mass()
                i.appliedForces = [
                    {
                        direction: new Vector2(0, f),
                        position: i.centreOfMass()
                    },
                    {
                        direction: new Vector2(-20, 0),
                        position: i.centreOfMass()
                    },
                ]
                i.physicsStep(dt)
            }
            
        }
    }

    resetSimulation() {
        for (let i of this.shapes) {
            i.resetSimulation()
        }
    }

}
