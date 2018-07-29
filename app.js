var gl;
var canvas;
var program;
var final_textures=[];
var final_indices=[];
var cam=[0,0,-25];
var loadfunc = function(objname,imagename,mesh,callback){
	loadTextResource('./shader.vs.glsl', function (vsErr, vsText) {
		if (vsErr) {
			alert('Fatal error getting vertex shader (see console)');
			console.error(vsErr);
		} else {
			loadTextResource('./shader.fs.glsl', function (fsErr, fsText) {
				if (fsErr) {
					alert('Fatal error getting fragment shader (see console)');
					console.error(fsErr);
				} else {
					loadJSONResource(objname, function (modelErr, modelObj) {
						if (modelErr) {
							alert('Fatal error getting Susan model (see console)');
							console.error(fsErr);
						} else {
							loadImage(imagename, function (imgErr, img) {
								if (imgErr) {
									alert('Fatal error getting Susan texture (see console)');
									console.error(imgErr);
								} else { 
									RunDemo(vsText, fsText, img, modelObj,mesh);
									callback(null);
								}
							});
						}
					});
				}
			});
		}
	});
}
var InitDemo = function () {
	loadfunc('./Shark.json','./greatwhiteshark.png',2,function(err){
	/*	if(err==null)
		{
			loadfunc('./Shark.json','./greatwhiteshark.png',0,function(err){
			main();
			});
		}*/
		main();
		
	});
	//loadfunc('./Grass_02.json','./grass_diff.png');
};

window.addEventListener("keydown", keyDownTextField, false);

function keyDownTextField(e) {
var keyCode = e.keyCode;
         if (keyCode == 87) {
         	cam[2]++;
        }
        if(keyCode == 65){
        	cam[0]++;
        }
        if(keyCode == 68){
        	cam[0]--;
          }
        if(keyCode == 83){
        	cam[2]--;
        } 

}


var RunDemo = function (vertexShaderText, fragmentShaderText, SusanImage, SusanModel,mesh) {
	console.log('This is working');

	canvas = document.getElementById('game-surface');
	gl = canvas.getContext('webgl');

	if (!gl) {
		console.log('WebGL not supported, falling back on experimental-webgl');
		gl = canvas.getContext('experimental-webgl');
	}

	if (!gl) {
		alert('Your browser does not support WebGL');
	}

	gl.clearColor(0.75, 0.85, 0.8, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.frontFace(gl.CCW);
	gl.cullFace(gl.BACK);

	//
	// Create shaders
	// 
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

	gl.shaderSource(vertexShader, vertexShaderText);
	gl.shaderSource(fragmentShader, fragmentShaderText);

	gl.compileShader(vertexShader);
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
		return;
	}

	gl.compileShader(fragmentShader);
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
		return;
	}

	program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error('ERROR linking program!', gl.getProgramInfoLog(program));
		return;
	}
	gl.validateProgram(program);
	if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
		console.error('ERROR validating program!', gl.getProgramInfoLog(program));
		return;
	}

	//
	// Create buffer
	//
	//for (var i = 2; i >= 0; i--) 
	//{
		
	var susanVertices = SusanModel.meshes[mesh].vertices ;
	// susanVertices = susanVertices.concat(SusanModel.meshes[1].vertices);
	// susanVertices = susanVertices.concat(SusanModel.meshes[0].vertices);

	var susanIndices = [].concat.apply([], SusanModel.meshes[mesh].faces);
	// susanIndices = susanIndices.concat([].concat.apply([], SusanModel.meshes[1].faces));
	// susanIndices = susanIndices.concat([].concat.apply([], SusanModel.meshes[0].faces));

	var susanTexCoords = SusanModel.meshes[mesh].texturecoords[0];
	// susanTexCoords = susanTexCoords.concat(SusanModel.meshes[1].texturecoords[0]);
	// susanTexCoords = susanTexCoords.concat(SusanModel.meshes[0].texturecoords[0]);

	var susanPosVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, susanPosVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(susanVertices), gl.STATIC_DRAW);

	var susanTexCoordVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, susanTexCoordVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(susanTexCoords), gl.STATIC_DRAW);

	var susanIndexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, susanIndexBufferObject);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(susanIndices), gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, susanPosVertexBufferObject);
	var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
	gl.vertexAttribPointer(
		positionAttribLocation, // Attribute location
		3, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		3 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		0 // Offset from the beginning of a single vertex to this attribute
	);
	gl.enableVertexAttribArray(positionAttribLocation);

	gl.bindBuffer(gl.ARRAY_BUFFER, susanTexCoordVertexBufferObject);
	var texCoordAttribLocation = gl.getAttribLocation(program, 'vertTexCoord');
	gl.vertexAttribPointer(
		texCoordAttribLocation, // Attribute location
		2, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		2 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		0
	);
	gl.enableVertexAttribArray(texCoordAttribLocation);
//}
	//
	// Create texture
	//
	var susanTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, susanTexture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texImage2D(
		gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
		gl.UNSIGNED_BYTE,
		SusanImage
	);
	gl.bindTexture(gl.TEXTURE_2D, null);
	final_textures[mesh]=susanTexture;
	final_indices[mesh]=susanIndices;
	gl.useProgram(program);

	var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
	var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
	var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

	var worldMatrix = new Float32Array(16);
	var viewMatrix = new Float32Array(16);
	var projMatrix = new Float32Array(16);
	mat4.identity(worldMatrix);
	mat4.lookAt(viewMatrix, [0, 0, -25], [0, 0, 0], [0, 1, 0]);
	mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);

	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

	var xRotationMatrix = new Float32Array(16);
	var RotationMatrix = new Float32Array(16);
	var mvMatrix=new Float32Array(16);
	var Trans_scale_Matrix=new Float32Array(16);
	var scle=0.25;
	var x_pos0=0.0,y_pos0=0.0,z_pos0=0.0;
	var x_pos1=4.0,y_pos1=4.0,z_pos1=0.0;
	var x_pos2=-4.0,y_pos2=4.0,z_pos2=0.0;
	var identityMatrix = new Float32Array(16);
	mat4.identity(identityMatrix);
	var angle = 0;
	var loop = function () {

		var scale_Matrix=new Float32Array([
		scle,0.0,0.0,0.0,
		0.0,scle,0.0,0.0,
		0.0,0.0,scle,0.0,
		0.0,0.0,0.0,1.0
		]);
		scle+=0.0001;
		mat4.lookAt(viewMatrix, cam, [0, 0, 500], [0, 1, 0]);
		mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);

		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
		gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
		gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

		
		gl.clearColor(0.75, 0.85, 0.8, 1.0);
		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
		angle = performance.now() / 1000 / 6 * 2 * Math.PI;
		//---------------------------------------------------------------
		//FISH___1
		var r=(Math.random() * (0.1 - 0.0000)).toFixed(5);
		//console.log(r);
		var x=(Math.random() * (r-0.0)).toFixed(5);
		var y=(Math.random() * (Math.sqrt((r*r)-(x*x))-0.0)).toFixed(5);
		var z=(Math.random() * (Math.sqrt((r*r)-(x*x)-(y*y))-0.0)).toFixed(5);
		//console.log(x+"   "+"  "+y+"  "+z);
		//x_pos=parseFloat(x_pos)-parseFloat(x);
		y_pos0=parseFloat(y_pos0)+0.05	*parseFloat(y);
		z_pos0=parseFloat(z_pos0)+(0.5*parseFloat(z));
		console.log(x_pos0+"   "+y_pos0+"  "+z_pos0);
		//translate
		//var translation;
		//vec3.set (translation, 3, 4, 0.0);
		mat4.translate (mvMatrix, identityMatrix, [x_pos0,y_pos0,z_pos0]);
		//console.log(mvMatrix);
		//mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
		mat4.rotate(RotationMatrix, identityMatrix, 90, [0, 1, 0]);
		mat4.mul(Trans_scale_Matrix, mvMatrix, scale_Matrix);
		mat4.mul(worldMatrix, RotationMatrix, Trans_scale_Matrix);
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

		gl.bindTexture(gl.TEXTURE_2D, final_textures[2]);
		gl.activeTexture(gl.TEXTURE0);

		gl.drawElements(gl.TRIANGLES, final_indices[2].length, gl.UNSIGNED_SHORT, 0);

	/*	gl.bindTexture(gl.TEXTURE_2D, final_textures[0]);
		gl.activeTexture(gl.TEXTURE0);

		gl.drawElements(gl.TRIANGLES, final_indices[0].length, gl.UNSIGNED_SHORT, 0);*/


		//---------------------------------------------------------------
		//FISH_2
		r=(Math.random() * (0.1 - 0.0000)).toFixed(5);
		//console.log(r);
		x=(Math.random() * (r-0.0)).toFixed(5);
		y=(Math.random() * (Math.sqrt((r*r)-(x*x))-0.0)).toFixed(5);
		z=(Math.random() * (Math.sqrt((r*r)-(x*x)-(y*y))-0.0)).toFixed(5);
		//console.log(x+"   "+"  "+y+"  "+z);
		//x_pos=parseFloat(x_pos)-parseFloat(x);
		y_pos1=parseFloat(y_pos1)-0.05*parseFloat(y);
		z_pos1=parseFloat(z_pos1)+0.5*parseFloat(z);
		//console.log(x_pos+"   "+y_pos+"  "+z_pos);
		//translate
		//var translation;
		//vec3.set (translation, 3, 4, 0.0);
		mat4.translate (mvMatrix, identityMatrix, [x_pos1,y_pos1,z_pos1]);
		//console.log(mvMatrix);
		//mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
		mat4.rotate(RotationMatrix, identityMatrix, 90, [0, 1, 0]);
		mat4.mul(Trans_scale_Matrix, mvMatrix, scale_Matrix);
		mat4.mul(worldMatrix, RotationMatrix, Trans_scale_Matrix);
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);


		gl.bindTexture(gl.TEXTURE_2D, final_textures[2]);
		gl.activeTexture(gl.TEXTURE0);

		gl.drawElements(gl.TRIANGLES, final_indices[2].length, gl.UNSIGNED_SHORT, 0);



		r=(Math.random() * (0.1 - 0.0000)).toFixed(5);
		//console.log(r);
		x=(Math.random() * (r-0.0)).toFixed(5);
		y=(Math.random() * (Math.sqrt((r*r)-(x*x))-0.0)).toFixed(5);
		z=(Math.random() * (Math.sqrt((r*r)-(x*x)-(y*y))-0.0)).toFixed(5);
		//console.log(x+"   "+"  "+y+"  "+z);
		//x_pos2=parseFloat(x_pos)-parseFloat(x);
		y_pos2=parseFloat(y_pos2)-0.05*parseFloat(y);
		z_pos2=parseFloat(z_pos2)-0.5*parseFloat(z);
		//console.log(x_pos+"   "+y_pos+"  "+z_pos);
		//translate
		//var translation;
		//vec3.set (translation, 3, 4, 0.0);
		mat4.translate (mvMatrix, identityMatrix, [x_pos2,y_pos2,z_pos2]);
		//console.log(mvMatrix);
		//mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
		mat4.rotate(RotationMatrix, identityMatrix, -90, [0, 1, 0]);
		mat4.mul(Trans_scale_Matrix, mvMatrix, scale_Matrix);
		mat4.mul(worldMatrix, Trans_scale_Matrix, RotationMatrix);
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);


		gl.bindTexture(gl.TEXTURE_2D, final_textures[2]);
		gl.activeTexture(gl.TEXTURE0);

		gl.drawElements(gl.TRIANGLES, final_indices[2].length, gl.UNSIGNED_SHORT, 0);


	/*	gl.bindTexture(gl.TEXTURE_2D, final_textures[0]);
		gl.activeTexture(gl.TEXTURE0);

		gl.drawElements(gl.TRIANGLES, final_indices[0].length, gl.UNSIGNED_SHORT, 0);*/

		requestAnimationFrame(loop);
	};
	requestAnimationFrame(loop);
};