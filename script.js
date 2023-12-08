let canvas; 
let gl;

let near = -1;
let far = 1;
let left = -1;
let right = 1;
let ytop = 1;
let bottom = -1;
let currAngle = 0;

let radius = 0.1;  //MUST NOT BE ZERO
let theta  = 0.0;
let phi    = 0.0;
let rotation_by_5_deg = 5.0 * Math.PI/180.0;
const TRANSLATION_STEP = .1;

let at = vec3(0.0, 0.0, 0.0);
let up = vec3(0.0, 1.0, 0.0);
let eye = vec3(0.0, 0.0, -1.0);
let uniformModelView, uniformProjection;
let modelViewMatrix, projectionMatrix;           

//Leave light properties and position unchanged
//Ldr, Ldg, Ldb, Lsr, Lsg, Lsb, Lar, Lag, Lab
let lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 ); // white light
let lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
let lightSpecular = vec4( 0.9, 0.9, 0.9, 1.0 );

//Position is in homogeneous coordinates
//If w =1.0, we are specifying a finite (x,y,z) location
//If w =0.0, light at infinity
let lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );

///Material properties with ambient, diffuse, specular
//You should declare these for each 3d shape; think of using arrays
let materialDiffuse =  vec4( 0.2, 0.2, 1.0, 1.0); 
let materialAmbient =  vec4( 1.0, 1.0, 1.0, 1.0 ); 
let materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
 //metallic?
let materialShininess = 100.0;          
let ammo = 100;
//global variables to help us with vertex array objects
let program;
let vao;
let shape;
let arenaGround;
let enemies;
let bullet;
let keyboard = [];

function init(){

  //Get graphics context
    let canvas = document.getElementById( "gl-canvas" );
  let  options = {  // no need for alpha channel, but note depth buffer enabling
    alpha: false,
    depth: true  //NOTE THIS
  };

  gl = canvas.getContext("webgl2", options);
    if ( !gl ) { alert( "WebGL 2.0 isn't available" ); }

  //Load shaders
  program = initShaders( gl, "vertex-shader", "fragment-shader" );
  gl.useProgram( program );

    shape = [
        {
            positions: createSphereVertices(0.15, 50, 50).positions, //Sphere
            normals: createSphereVertices(0.5, 50, 50).normals,
            indices: createSphereVertices(0.5, 50, 50).indices,
            materialAmbient: vec4( 0.0, 1.0, 0.0, 1.0),
            materialDiffuse: vec4( 0.0, 1.0, 0.0, 1.0),
            materialSpecular: vec4( 1.0, 1.0, 1.0, 1.0),
            materialShininess: 100.0,
            modelViewMatrix: null,
            translation: translate(0, 0, 0),
            vao: null
        }
    ];

    arenaGround = [
        { //Ground1
            positions: createCubeVertices(1.0).positions,
            normals: createCubeVertices(1.0).normals,
            indices: createCubeVertices(1.0).indices,
            materialAmbient: vec4(0.0, 1.0, 0.0, 1.0), // Brown ambient color
            materialDiffuse: vec4(0.0, 1.0, 0.0, 1.0), // Brown diffuse color
            materialSpecular: vec4(1.0, 1.0, 1.0, 1.0),
            materialShininess: 100.0,
            modelViewMatrix: null,
            translation: translate(0, -0.9, 0),
            vao: null
        },
        {
            positions: createCubeVertices(1.0).positions,
            normals: createCubeVertices(1.0).normals,
            indices: createCubeVertices(1.0).indices,
            materialAmbient: vec4(0.0, 1.0, 0.0, 1.0), // Brown ambient color
            materialDiffuse: vec4(0.0, 1.0, 0.0, 1.0), // Brown diffuse color
            materialSpecular: vec4(1.0, 1.0, 1.0, 1.0),
            materialShininess: 100.0,
            modelViewMatrix: null,
            translation: translate(1, -0.9, 0),
            vao: null
        },
        {
            positions: createCubeVertices(1.0).positions,
            normals: createCubeVertices(1.0).normals,
            indices: createCubeVertices(1.0).indices,
            materialAmbient: vec4(0.0, 1.0, 0.0, 1.0), // Brown ambient color
            materialDiffuse: vec4(0.0, 1.0, 0.0, 1.0), // Brown diffuse color
            materialSpecular: vec4(1.0, 1.0, 1.0, 1.0),
            materialShininess: 100.0,
            modelViewMatrix: null,
            translation: translate(-1, -0.9, 0),
            vao: null
        },
        {
            positions: createCubeVertices(1.0).positions,
            normals: createCubeVertices(1.0).normals,
            indices: createCubeVertices(1.0).indices,
            materialAmbient: vec4(0.0, 1.0, 0.0, 1.0), // Brown ambient color
            materialDiffuse: vec4(0.0, 1.0, 0.0, 1.0), // Brown diffuse color
            materialSpecular: vec4(1.0, 1.0, 1.0, 1.0),
            materialShininess: 100.0,
            modelViewMatrix: null,
            translation: translate(0, -0.9, 1),
            vao: null
        },
        {
            positions: createCubeVertices(1.0).positions,
            normals: createCubeVertices(1.0).normals,
            indices: createCubeVertices(1.0).indices,
            materialAmbient: vec4(0.0, 1.0, 0.0, 1.0), // Brown ambient color
            materialDiffuse: vec4(0.0, 1.0, 0.0, 1.0), // Brown diffuse color
            materialSpecular: vec4(1.0, 1.0, 1.0, 1.0),
            materialShininess: 100.0,
            modelViewMatrix: null,
            translation: translate(0, -0.9, -1),
            vao: null
        },
        {
            positions: createCubeVertices(1.0).positions,
            normals: createCubeVertices(1.0).normals,
            indices: createCubeVertices(1.0).indices,
            materialAmbient: vec4(0.0, 1.0, 0.0, 1.0), // Brown ambient color
            materialDiffuse: vec4(0.0, 1.0, 0.0, 1.0), // Brown diffuse color
            materialSpecular: vec4(1.0, 1.0, 1.0, 1.0),
            materialShininess: 100.0,
            modelViewMatrix: null,
            translation: translate(1, -0.9, 1),
            vao: null
        },
        {
            positions: createCubeVertices(1.0).positions,
            normals: createCubeVertices(1.0).normals,
            indices: createCubeVertices(1.0).indices,
            materialAmbient: vec4(0.0, 1.0, 0.0, 1.0), // Brown ambient color
            materialDiffuse: vec4(0.0, 1.0, 0.0, 1.0), // Brown diffuse color
            materialSpecular: vec4(1.0, 1.0, 1.0, 1.0),
            materialShininess: 100.0,
            modelViewMatrix: null,
            translation: translate(-1, -0.9, 1),
            vao: null
        },
        {
            positions: createCubeVertices(1.0).positions,
            normals: createCubeVertices(1.0).normals,
            indices: createCubeVertices(1.0).indices,
            materialAmbient: vec4(0.0, 1.0, 0.0, 1.0), // Brown ambient color
            materialDiffuse: vec4(0.0, 1.0, 0.0, 1.0), // Brown diffuse color
            materialSpecular: vec4(1.0, 1.0, 1.0, 1.0),
            materialShininess: 100.0,
            modelViewMatrix: null,
            translation: translate(1, -0.9, -1),
            vao: null
        },
        {
            positions: createCubeVertices(1.0).positions,
            normals: createCubeVertices(1.0).normals,
            indices: createCubeVertices(1.0).indices,
            materialAmbient: vec4(0.0, 1.0, 0.0, 1.0), // Brown ambient color
            materialDiffuse: vec4(0.0, 1.0, 0.0, 1.0), // Brown diffuse color
            materialSpecular: vec4(1.0, 1.0, 1.0, 1.0),
            materialShininess: 100.0,
            modelViewMatrix: null,
            translation: translate(-1, -0.9, -1),
            vao: null
        },  
    ];

    let enemySize = .5;
    let divisions = 5;
    enemies = [
        {
            positions: createTruncatedConeVertices(enemySize/4, enemySize/4, enemySize, divisions, divisions, true, true).positions,
            normals: createTruncatedConeVertices(enemySize/4, enemySize/4, enemySize, divisions, divisions, true, true).normals,
            indices: createTruncatedConeVertices(enemySize/4, enemySize/4, enemySize, divisions, divisions, true, true).indices,
            materialAmbient: vec4( 1.0, 0.0, 0.0, 1.0),//make red
            materialDiffuse: vec4( 1.0, 0.0, 0.0, 1.0),//make red
            materialSpecular: vec4( 1.0, 0.0, 1.0, 1.0),// make red
            materialShininess: 100.0,
            modelViewMatrix: null,
            translation: translate(0, 0, 1),
            vao: null
        },
        { 
            positions: createTruncatedConeVertices(enemySize/4, enemySize/4, enemySize, divisions, divisions, true, true).positions,
            normals: createTruncatedConeVertices(enemySize/4, enemySize/4, enemySize, divisions, divisions, true, true).normals,
            indices: createTruncatedConeVertices(enemySize/4, enemySize/4, enemySize, divisions, divisions, true, true).indices,
            materialAmbient: vec4( 1.0, 0.0, 0.0, 1.0),//make red
            materialDiffuse: vec4( 1.0, 0.0, 0.0, 1.0),//make red
            materialSpecular: vec4( 1.0, 0.0, 1.0, 1.0),// make red
            materialShininess: 100.0,
            modelViewMatrix: null,
            translation: translate(-1, 0, 1),
            vao: null
        },
        { 
            positions: createTruncatedConeVertices(enemySize/4, enemySize/4, enemySize, divisions, divisions, true, true).positions,
            normals: createTruncatedConeVertices(enemySize/4, enemySize/4, enemySize, divisions, divisions, true, true).normals,
            indices: createTruncatedConeVertices(enemySize/4, enemySize/4, enemySize, divisions, divisions, true, true).indices,
            materialAmbient: vec4( 1.0, 0.0, 0.0, 1.0),//make red
            materialDiffuse: vec4( 1.0, 0.0, 0.0, 1.0),//make red
            materialSpecular: vec4( 1.0, 0.0, 1.0, 1.0),// make red
            materialShininess: 100.0,
            modelViewMatrix: null,
            translation: translate(1, 0, 1),
            vao: null
        }
    ];

    bulletSize = 1;
    bullet = [
        {
            positions: createTruncatedConeVertices(bulletSize/3, 0, bulletSize, divisions, divisions, true, false).positions,
            normals: createTruncatedConeVertices(bulletSize/3, 0, bulletSize, divisions, divisions, true, false).normals,
            indices: createTruncatedConeVertices(bulletSize/3, 0, bulletSize, divisions, divisions, true, false).indices,
            materialAmbient: vec4( 1.0, 0.2, 0.1, 1.0),//make red
            materialDiffuse: vec4( 1.0, 0.2, 0.1, 1.0),//make red
            materialSpecular: vec4( 1.0, 0.2, 1.0, 1.0),// make red
            materialShininess: 100.0,
            modelViewMatrix: null,
            translation: translate(0, 1, 0),
            bulletInMotion: false,
            vao: null
        }
    ];

    //make bullet
    for(let i = 0; i < bullet.length; i++) {
        bullet[i].vao = setUpVertexObject(bullet[i]);
    }

    for(let i = 0; i < enemies.length; i++) {
        enemies[i].vao = setUpVertexObject(enemies[i]);
    }

    for (let i = 0; i < arenaGround.length; i++) {
        arenaGround[i].vao = setUpVertexObject(arenaGround[i]);
    }

    //set up uniform variables
    uniformModelView = gl.getUniformLocation(program, "u_modelViewMatrix");
    uniformProjection = gl.getUniformLocation(program, "u_projectionMatrix");

    //set up screen
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height); 
    gl.clearColor(0, 0, 0, 1); 

    //click

    canvas.addEventListener("click", function(event){
        bullet[0].translation *= translate(eye[0], eye[1]+1, eye[2]);
        bullet[0].bulletInMotion = true;
        draw();
    });

    document.onkeydown = function(ev) { playerMovement(ev); };
    modelViewMatrix = lookAt(eye, at, up);

    //Enable depth testing    
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1.0, 2.0);     

    draw();
}

function draw(){

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    projectionMatrix = perspective(30, gl.canvas.height/gl.canvas.width, 0.5, 100);   
    gl.uniformMatrix4fv( uniformProjection, false, flatten(projectionMatrix) );
    modelViewMatrix = lookAt(eye, at, up);
    //For the lab, you will need to draw multiple vertex array objects
    //The default parametric shapes all draw at the origin; you may need to use model matrices for each of them to place them in the scene
    //These model matrices should be combined with the view matrix to get the modelview matrix for each shape
    //arenaGround draw
    for (let i = 0; i < arenaGround.length; i++) {
        arenaGround[i].modelViewMatrix = lookAt(eye, at, up);
        arenaGround[i].modelViewMatrix = mult(arenaGround[i].modelViewMatrix, arenaGround[i].translation);
        gl.uniformMatrix4fv(uniformModelView, false, flatten(arenaGround[i].modelViewMatrix));
        drawVertexObject(arenaGround[i].vao, arenaGround[i].indices.length, arenaGround[i].materialAmbient, arenaGround[i].materialDiffuse, arenaGround[i].materialSpecular, arenaGround[i].materialShininess);
    }
    //draw enemies
    for(let i = 0; i < enemies.length; i++) {
        enemies[i].modelViewMatrix = lookAt(eye, at, up);
        enemies[i].modelViewMatrix = mult(enemies[i].modelViewMatrix, enemies[i].translation);
        gl.uniformMatrix4fv(uniformModelView, false, flatten(enemies[i].modelViewMatrix));
        drawVertexObject(enemies[i].vao, enemies[i].indices.length, enemies[i].materialAmbient, enemies[i].materialDiffuse, enemies[i].materialSpecular, enemies[i].materialShininess);
    }
        //bullet.translation = mult(bullet.translation, translate(.01,0,0));
        bullet.modelViewMatrix = lookAt(eye, at, up);
        bullet.modelViewMatrix = mult(bullet.modelViewMatrix, bullet.translation);
        gl.uniformMatrix4fv(uniformModelView, false, flatten(bullet.modelViewMatrix));
        drawVertexObject(bullet.vao, bullet.indices.length, bullet.materialAmbient, bullet.materialDiffuse, bullet.materialSpecular, bullet.materialShininess);

    requestAnimationFrame( draw );
}

function playerMovement(event) {
    const speed = 0.1; // Adjust the speed as needed

    switch (event.keyCode) {
        case 65: // a
        if (at[0] <= 1.5) {
            //find translation orthogonal to at vector and up
            eyeAtCross = cross(eye - at, eye - up);
            speed *= eyeAtCross[0];
            at[0]  += speed;
            eye[0] += speed;
            speed = .1;
            speed *= eyeAtCross[2];
            at[2]  += speed
            eye[2]  += speed
        }
            break;
        case 68: // d
        if (at[0] >= -1.5) {
            at[0]  -= speed;
            eye[0] -= speed;
        }
            break;
        case 87: // w
            at[2]  += speed;
            eye[2] += speed;
            break;
        case 83: // s
            at[2]  -= speed;
            eye[2] -= speed;
            break;
        case 81: //q
            turnLeft();
            break;
        case 69: //e
            turnRight();
            break;
        default:
            return;
    }
    rotationShift = [0,0];
    draw(); // Redraw the scene after updating the eye position
}

function turnLeft() {
    //get rid of old shift
    //let rotationShift = [-Math.cos(currAngle / 180 * Math.PI), -Math.sin(currAngle/ 180 * Math.PI)];
    currAngle += 2;
    at[0] = eye[0] + Math.sin(currAngle / 180 * Math.PI);
    at[2] = eye[2] + Math.cos(currAngle / 180 * Math.PI);
}

function turnRight() {
    currAngle -= 2;
    at[0] = eye[0] + Math.sin(currAngle / 180 * Math.PI);
    at[2] = eye[2] + Math.cos(currAngle / 180 * Math.PI);
}

//Loads a VAO and draws it
function drawVertexObject(vao, iLength, mA, mD, mS, s){
    let ambientProduct = mult(lightAmbient, mA);
    let diffuseProduct = mult(lightDiffuse, mD);
    let specularProduct = mult(lightSpecular, mS);
    gl.uniform1f(gl.getUniformLocation(program, "shininess"),s);
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct) );	
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition) );    

    gl.bindVertexArray(vao);
    gl.drawElements( gl.TRIANGLES, iLength, gl.UNSIGNED_SHORT, 0 );     
}

//Sets up a VAO 
function setUpVertexObject(shape){
    let indices = shape.indices;
    let vertices = shape.positions;
    let normals = shape.normals;

    vao = gl.createVertexArray(); 
    gl.bindVertexArray(vao); 

    //set up index buffer, if using
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());    
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STREAM_DRAW);

    //For each attribute (e.g. each of vertices, normal, color, etc.)

    //set up vertices buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); 
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STREAM_DRAW);
    let attributeCoords  = gl.getAttribLocation(program, "a_coords"); 
    gl.vertexAttribPointer(attributeCoords, 3, gl.FLOAT, false, 0, 0);  
    gl.enableVertexAttribArray(attributeCoords);

    //set up normals buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); 
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STREAM_DRAW);
    let attributeNormals = gl.getAttribLocation( program, "a_normals" );
    gl.vertexAttribPointer( attributeNormals, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( attributeNormals );

    //finalize the vao; not required, but considered good practice
    gl.bindVertexArray(null); 
    return vao;
}

