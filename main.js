function getLcaPath(n1, n2) {

    if (n1.depth < n2.depth) {
        [n1, n2] = [n2, n1];
    }
    let pointsFromN1 = [];
    let pointsFromN2 = [];
    while (n1.depth > n2.depth) {
        pointsFromN1.push(n1.point);
        n1 = n1.parent;
    }

    while (n1 != n2) {
        pointsFromN1.push(n1.point);
        pointsFromN2.push(n2.point);
        n1 = n1.parent;
        n2 = n2.parent;
    }

    pointsFromN1.push(n1.point);
    return pointsFromN1.concat(pointsFromN2.reverse());
}


function createTest() {
    let A = new Tree(new Point(100, 100), 1);
    let B = new Tree(new Point(200, 100), 1);
    let C = new Tree(new Point(300, 100), 1);
    let D = new Tree(new Point(100, 300), 1);
    let E = new Tree(new Point(200, 300), 1);
    let F = new Tree(new Point(300, 300), 1);
    let O = new Tree(new Point(200, 200), 0);
    O.appendChild(A);
    O.appendChild(B);
    O.appendChild(C);
    O.appendChild(D);
    O.appendChild(E);
    O.appendChild(F);
    return O;
}


function render() {
    //let tree = createTest();
    let tree = Tree.create();
    let nodes = tree.allNodes;
    nodes.forEach(function (node) {
        renderNode(node);
    });
    for (let n1 = 0; n1 < nodes.length; n1++) {
        for (let n2 = 0; n2 < n1; n2++) {
            let rawPoints = getLcaPath(nodes[n1], nodes[n2]);
            let points = makePath(rawPoints);
            renderPath(points);
        }
    }
}

class Point {
    constructor(x, y) {
        this.x_ = x;
        this.y_ = y;
    }

    get x() {
        return this.x_;
    }

    get y() {
        return this.y_;
    }
}

function makePath(rawPoints) {
    const beta = 0.75;
    let points = [];
    const n = rawPoints.length;
    const p0 = rawPoints[0];
    const pn_1 = rawPoints[n - 1];
    for (let i = 0; i < n; i++) {
        // P_i = beta * P_i + (1 - beta) * (P_0 + (i)/(N-1)*(P_{N-1}-P_0))

        let p = rawPoints[i];
        let x = beta * p.x + (1 - beta) * (p0.x + (i / (n - 1)) * (pn_1.x - p0.x));
        let y = beta * p.y + (1 - beta) * (p0.y + (i / (n - 1)) * (pn_1.y - p0.y));
        points.push(new Point(x, y));
    }
    return points;
}

function renderPath(points) {
    let canvas = document.getElementById('mainCanvas');

    let pathString = '';
    if (points.length == 2) {
        pathString += 'M' + points[0].x + ' ' + points[0].y + ' ';
        pathString += 'L' + points[1].x + ' ' + points[1].y;
    } else if (points.length == 3) {
        pathString += 'M' + points[0].x + ' ' + points[0].y + ' ';
        pathString += 'Q' + points[1].x + ' ' + points[1].y;
        pathString += ', ' + points[2].x + ' ' + points[2].y;
    } else if (points.length >= 4) {
        pathString += 'M' + points[0].x + ' ' + points[0].y + ' ';
        pathString += 'C' + points[1].x + ' ' + points[1].y;
        for (let i = 2; i < points.length; i++) {
            pathString += ', ' + points[i].x + ' ' + points[i].y;
        }
    }

    let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    path.setAttribute('d', pathString);
    path.setAttribute('class', 'p');
    canvas.appendChild(path);
}

function renderNode(node) {
    let canvas = document.getElementById('mainCanvas');
    let path = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
    path.setAttribute('cx', node.point.x);
    path.setAttribute('cy', node.point.y);
    path.setAttribute('r', 8 - node.depth);
    //path.setAttribute('r', 1);
    path.setAttribute('class', 'c');
    canvas.appendChild(path);
}

class Tree {
    constructor(point, depth) {
        this.point_ = point;
        this.depth_ = depth;
        this.children_ = [];
        this.parent_ = null;
    }

    get point() {
        return this.point_;
    }

    get depth() {
        return this.depth_;
    }

    get parent() {
        return this.parent_;
    }

    appendChild(child) {
        child.parent_ = this;
        this.children_.push(child);
    }

    get children() {
        return this.children_;
    }

    get allNodes() {
        let nodes = [this];
        this.children.forEach(function (child) {
            let nodesOfChild = child.allNodes;
            nodes = nodes.concat(nodesOfChild);
        });
        return nodes;
    }

    static create_(depthMax, depth, offset, scale) {
        const fanOut = 3;
        const point =
            (depth == 0) ? offset : new Point(
            offset.x + (Math.random() - 0.5) * scale,
            offset.y + (Math.random() - 0.5) * scale
        );
        const nextScale = scale / (fanOut / 1.7);

        if (depth < depthMax) {
            let n = Math.trunc(1 + Math.random() * fanOut);
            if (n > 0) {
                let tree = new Tree(point, depth);
                for (let i = 0; i < n; i++) {
                    let child = Tree.create_(depthMax, depth + 1, point, nextScale);
                    tree.appendChild(child);
                }
                return tree;
            }
        } else {
            return new Tree(point, depth);
        }
    }

    static create() {
        return Tree.create_(4, 0, new Point(300, 300), 600);
    }
}
