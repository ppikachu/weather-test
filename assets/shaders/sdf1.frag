#ifdef GL_ES
precision mediump float;
#endif

// glslviewer assets/sdf1.frag public/images/DSC0787_sq.jpg -l

uniform float u_time;
uniform float u_scroll;
uniform sampler2D u_tex0;
uniform vec2 u_resolution;
uniform float textureAspect;
vec3 u_colorA = vec3(1.0, 0.0, 0.0);
vec3 u_colorB = vec3(0.0, 0.0, 1.0);

#define U_SPEED 1.3
#define MAX_X .3
#define PLUS_X 0.5
#define PI 3.1416
#define u_damping .9

#include "lygia/draw/digits.glsl"
#include "lygia/sdf/lineSDF.glsl"
#include "lygia/math/smootherstep.glsl"
#include "lygia/math/map.glsl"
#include "lygia/color/blend.glsl"
#include "lygia/distort/chromaAB.glsl"

float value; // the value to add inertia to
float velocity; // the current velocity of the value

float updateInertia(float target) {
	// update the velocity based on the difference between the current value and the target value
	velocity += (target - value) * u_damping;
	// update the value based on the velocity
	value += velocity;
	return value;
}

void main(){
	//FIT TEXTURE
	float scaleX = 1.0, scaleY = 1.0;
	float frameAspect = u_resolution.x / u_resolution.y;
	float textureFrameRatio = textureAspect / frameAspect;
	if(textureFrameRatio>1.0) scaleX = 1.0 / textureFrameRatio;
	else scaleY = textureFrameRatio;
	vec2 st = vec2(scaleX, scaleY) * (gl_FragCoord.xy/u_resolution.xy - 0.5) + 0.5;
	//draw!
	vec3 color = vec3(0.0);  
	vec2 poss1 = vec2(cos(u_time*U_SPEED)*MAX_X+PLUS_X, 0.);
	vec2 poss2 = vec2(sin(u_time*U_SPEED)*MAX_X+PLUS_X, 0.);
	float c = lineSDF(st, poss1, vec2(poss1.x+.1,1.));
	float d = lineSDF(st, poss2, vec2(poss2.x-.1,1.));
	// fx on / slap photo:
	//TODO implementar la inercia del desfase RGB!
	float toscroll = map(sin(u_scroll*PI), 0.,1., 0.,10.);
	// float scroll = updateInertia(2000.);
	color = chromaAB(u_tex0, st, 1.- st, toscroll);
	//some blend:
	// color = blendLinearDodge(color, vec3(0.,.0,c), .5);
	// color = blendLinearDodge(color, vec3(d,0.,.0), .5);
	//add blend:
	// color = blendAdd(color, vec3(0.,.0,c), .5);
	// color = blendAdd(color, vec3(d,0.,.0), .5);
	color = blendAdd(color, vec3(u_colorA.r * c, u_colorA.g * c, u_colorA.b * c), .5);
	color = blendAdd(color, vec3(u_colorB.r * d, u_colorB.g * d, u_colorB.b * d), .5);

	//cyberpunk blend:
	// color *= blendColorDodge(color, vec3(0.,.0,c), .9);
	// color *= blendColorDodge(color, vec3(d,0.,.0), .9);

	//post (tv lines):
	// float d4 = sin((st.y + u_time * .01) * 1024.);
	// color = blendMultiply(color, vec3(d4),.05);

	// debug:
	vec2 debug_pos = vec2(-0.65,-0.05);
	color += digits(st + debug_pos, textureAspect);
	// color += digits(st - vec2(0.05,0.05), updateInertia(2000.));
	
	//output:
	gl_FragColor = vec4(vec3(color), 1.0);
}