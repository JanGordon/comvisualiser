export class Vector2 {
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