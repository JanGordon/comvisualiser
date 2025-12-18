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

    multiplyScalar(a: number) {
        return new Vector2(this.x * a, this.y * a)
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
    velocity: Vector2 = new Vector2()
    draw(ctx: CanvasRenderingContext2D, offset: Vector2): Error | null {
        for (let i of this.shapes) {
            i.draw(ctx, offset.add(this.position))
            let com = i.centreOfMass().add(offset).add(this.position)
            ctx.fillStyle = "orange"
            ctx.beginPath()
            ctx.ellipse(com.x, -com.y, 2, 2, 0, 0, 360)
            ctx.fill()
        }


        let totalCOM = this.centreOfMass().add(offset).add(this.position)
        ctx.fillStyle = "red"
        ctx.beginPath()
        ctx.ellipse(totalCOM.x, -totalCOM.y, 5, 5, 0, 0, 360)
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
        console.log("vert force: ", totalForce.y)

        // calculate acceleration
        let acceleration = new Vector2(totalForce.x / this.mass(), totalForce.y / this.mass())
        this.velocity = this.velocity.add(acceleration.multiplyScalar(dt))
        

        // update position
        this.position = this.position.add(this.velocity.multiplyScalar(dt))
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
                direction: new Vector2(0, -9.81),
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
        ctx.moveTo(this.from.x * scaleX + offset.x, -(this.from.y * scaleY + offset.y))
        ctx.lineTo(this.to.x * scaleX + offset.x, -(this.to.y * scaleY + offset.y))
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
        ctx.ellipse(this.centre.x * scaleX + offset.x, -(this.centre.y * scaleY + offset.y), this.radius.x * scaleX, this.radius.y * scaleY, 0, 0, 360)
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

var scaleX = 100; // 500 pixels per metre
var scaleY = 100; // 500 pixels per metre

var transform = new Vector2(0, 0) // in metres


export class Renderer {
    ctx: CanvasRenderingContext2D
    shapes: Composite[] = [
        // new Composite(new Vector2(0,0),
        //     new Line(new Vector2(0,0), new Vector2(100,100), 1),
        //     new Ellipse(new Vector2(100, 100), new Vector2(100, 100), 1),
        //     // new Ellipse(new Vector2(100, 200), new Vector2(50, 50), 1),
        // ),

        new Composite(new Vector2(0,0),
            // new Line(new Vector2(0,0), new Vector2(1,1), 1),
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
        transform.x = this.ctx.canvas.width/2
        transform.y = -this.ctx.canvas.height/2
        let dt = (t - this.lt) / (60 * 1000)
        this.lt = t
        this.ctx.clearRect(0,0, this.ctx.canvas.width, this.ctx.canvas.height)
        for (let i of this.shapes) {
            i.draw(this.ctx, transform)
        }
        this.physicsStep(dt)
        requestAnimationFrame((t)=>this.draw(t))
    }

    physicsStep(dt: number) {
        // need to see what forces need to be applied
        




        for (let i of this.shapes) {
            let f = -9.8 * i.mass()
            i.appliedForces = [{
                direction: new Vector2(0, f),

                position: i.centreOfMass()
            }]
            console.log("mass:", f)
            i.physicsStep(dt)
        }
    }

}
