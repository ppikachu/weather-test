#extension GL_OES_standard_derivatives : enable
#ifdef GL_ES
precision highp float;
#endif

// glslviewer commands:
// glslviewer rain.frag ../../public/images/TimeToForest_3.png -e is_day,1 -e precip_mm,10 -e temp_c,26 -e hrs,12 -e debug,on -e textures,off -l -x 10 -y 80 -w 256 -h 256
// glslviewer rain.frag ../../public/images/TimeToForest_3.png -e is_day,1 -e precip_mm,10 -e temp_c,26 -e hrs,12 -e debug,on -e textures,off -l -x 10 -y 80 -w 256 -h 256 -E sequence,10,20

// https://www.shadertoy.com/view/tlSBDw

// #region credits
// Heartfelt - by Martijn Steinrucken aka BigWings - 2017
// Email:countfrolic@gmail.com Twitter:@The_ArtOfCode
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.

// A video of the effect can be found here:
// https://www.youtube.com/watch?v=uiF5Tlw22PI&feature=youtu.be
// #endregion credits

uniform vec2 u_resolution;
uniform sampler2D u_tex0;
uniform bool hd_normals;
uniform vec2 u_tex0Resolution;
uniform float u_time;
uniform float thunder;
uniform float precip_mm;
uniform float temp_c;
uniform float hrs;
uniform float humidity;

// #define DIGITS_SIZE vec2(.05, .06)
#define BOXBLUR_2D
#define BOXBLUR_ITERATIONS 4
// #define hd_normals
#include "lygia/filter/boxBlur.glsl"
// #define GAUSSIANBLUR_2D
// #include "lygia/filter/gaussianBlur.glsl"
#include "lygia/math.glsl"
#include "lygia/generative/cnoise.glsl"
#include "lygia/color/palette.glsl"
#include "lygia/color/palette/spectral.glsl"
#include "lygia/draw/digits.glsl"

// shadertoy emulation
#define S(a, b, t) smoothstep(a, b, t)

vec3 N13(float p) {
	//  from DAVE HOSKINS
	vec3 p3 = fract(vec3(p) * vec3(.1031,.11369,.13787));
	p3 += dot(p3, p3.yzx + 19.19);
	return fract(vec3((p3.x + p3.y)*p3.z, (p3.x+p3.z)*p3.y, (p3.y+p3.z)*p3.x));
}

float N(float t) {
	return fract(sin(t*12345.564)*7658.76);
}

float Saw(float b, float t) {
	return S(0., b, t)*S(1., b, t);
}

vec2 DropLayer2(vec2 uv, float t) {
	uv.y += t*0.75;
	vec2 a = vec2(6., 1.);
	vec2 grid = a*2.;
	vec2 id = floor(uv*grid);
	
	float colShift = N(id.x); 
	uv.y += colShift;
	
	id = floor(uv*grid);
	vec3 n = N13(id.x*35.2+id.y*2376.1);
	vec2 st = fract(uv*grid)-vec2(.5, 0);
	
	float x = n.x-.5;
	
	float y = uv.y*20.;
	float wiggle = sin(y+sin(y));
	x += wiggle*(.5-abs(x))*(n.z-.5);
	x *= .7;
	float ti = fract(t+n.z);
	y = (Saw(.85, ti)-.5)*.9+.5;
	vec2 p = vec2(x, y);
	
	float d = length((st-p)*a.yx);
	
	float mainDrop = S(.4, .0, d);
	
	float r = sqrt(S(1., y, st.y));
	float cd = abs(st.x-x);
	float trail = S(.23*r, .15*r*r, cd);
	float trailFront = S(-.02, .02, st.y-y);
	trail *= trailFront*r*r;
	
	y = uv.y;
	float trail2 = S(.2*r, .0, cd);
	float droplets = max(0., (sin(y*(1.-y)*120.)-st.y))*trail2*trailFront*n.z;
	y = fract(y*10.)+(st.y-.5);
	float dd = length(st-vec2(x, y));
	droplets = S(.3, 0., dd);
	float m = mainDrop+droplets*r*trailFront;
	
	return vec2(m, trail);
}

float StaticDrops(vec2 uv, float t) {
	uv *= 40.;
	
	vec2 id = floor(uv);
	uv = fract(uv)-.5;
	vec3 n = N13(id.x*107.45+id.y*3543.654);
	vec2 p = (n.xy-.5)*.7;
	float d = length(uv-p);
	
	float fade = Saw(.025, fract(t+n.z));
	float c = S(.3, 0., d)*fract(n.z*10.)*fade;
	return c;
}

vec2 Drops(vec2 uv, float t, float l0, float l1, float l2) {
	float s = StaticDrops(uv, t)*l0; 
	vec2 m1 = DropLayer2(uv, t)*l1;
	vec2 m2 = DropLayer2(uv*1.85, t)*l2;
	
	float c = s+m1.x+m2.x;
	c = S(.3, 1., c);
	
	return vec2(c, max(m1.y*l0, m2.y*l1));
}
void main() {
	vec3 col = vec3(0.);
	vec2 st = gl_FragCoord.xy / u_resolution.xy;
	vec2 uv = (gl_FragCoord.xy -.5 * u_resolution.xy) / u_resolution.y;
	float t = u_time * .2;
	
	float fade = S(0., 3., u_time);						// fade in at the start
	float story = 0.;
	float blurmask = 0.; 												// new focus
	float rainAmount = precip_mm * .05;					// adjust the amount of rain
	float dMaxBlur = 0.;
	float minBlur = .1;
	float staticDrops = S(-.5, 1.5, rainAmount)*2.;
	float layer1 = S(.25, .75, rainAmount);
	float layer2 = S(.0, .5, rainAmount);
	vec2 c = Drops(uv, t, staticDrops, layer1, layer2);

	vec2 normal = vec2(.0);
	// cheap normals (3x cheaper, but 2 times shittier ;))
	if (!hd_normals) {
		normal = vec2(dFdx(c.x), dFdy(c.x));
	}
	// expensive normals
	else {
		vec2 e = vec2(.001, 0.);
		float cx = Drops(uv+e, t, staticDrops, layer1, layer2).x;
		float cy = Drops(uv+e.yx, t, staticDrops, layer1, layer2).x;
		normal = vec2(cx-c.x, cy-c.x);
	}
	
	//FIT TEXTURE
	float scaleX = 1.0, scaleY = 1.0;
	float frameAspect = u_resolution.x / u_resolution.y;
	float textureFrameRatio = (u_tex0Resolution.x / u_tex0Resolution.y) / frameAspect;
	if (textureFrameRatio>1.0) scaleX = 1.0 / textureFrameRatio;
	else scaleY = textureFrameRatio;
	vec2 v_texcoord_aspect = vec2(scaleX, scaleY) * (st - 0.5) + 0.5;
	
	// raining!
	if (precip_mm > 0.0) {
		float fog = humidity * (map(temp_c, 0., 40., 1., 0.)) * .015;						// adjust the fog. increase fog by humidity
		float maxBlur = smoothstep(.0, 1., fog);								// adjust the blur.
		dMaxBlur = maxBlur;
		float lightning = 0.;
		blurmask = mix(maxBlur-c.y, minBlur, S(.1, .8, c.x));		// new focus
		float kernel_size = max(1.0, blurmask * 3.);
		col = boxBlur(
			u_tex0,
			v_texcoord_aspect+normal,
			vec2(blurmask * .005)
			// ,int(kernel_size)
		).rgb;
		// col = vec3(normal.x,normal.y,0.);			// debug normals
		// col = vec3(c.x, c.y, .0);							// debug c
		// col = vec3(maxBlur - c.y);							// debug c
		// col = vec3(minBlur);							// debug c
		// col = vec3(blurmask);									// debug focus
		// col = vec3(S(.1, .9, c.x));											// debug blurmask
		// col = vec3(heat);											// debug heat
		// col = vec3(blurmask * 100.);						// debug blurmask
		// col = gaussianBlur(u_tex0, v_texcoord_aspect+normal, vec2(blurmask * .002), int(kernel_size)).rgb;

		t = (u_time+3.)*.5;																						// make time sync with first lightning
		lightning = sin(t*sin(t*10.));																// lighting flicker
		lightning *= pow(max(0., sin(t+sin(t))), 10.);								// lightning flash
		col *= 1. + lightning*fade*mix(1., .1, story*story)*thunder;	// composite lightning
	}
	// not raining!
	else {
		float fadeheat = .0001;
		float heat = cnoise(vec2(v_texcoord_aspect.x * 4., v_texcoord_aspect.y * 3. - u_time*2.))*.5+.5;
		blurmask = heat * (1. - st.y) * temp_c * fadeheat;
		col = boxBlur(u_tex0, v_texcoord_aspect + blurmask, vec2(blurmask)).rgb;

		float heatloop = map(temp_c, 10., 40., -.2, .6) * (sin(t * sin(t*.1))*.1 + .8);
		col.r += st.y * heatloop;						// heat
	}
	
	// float daynightime = fract(u_time * .2);
	float daynightime = map(hrs, 0., 24., 0., 1.);
	float correctedcurve = parabola(daynightime, 2.);
	vec3 hrsspectrum = spectral((1. - correctedcurve) * .5 + .5, .4) + vec3(.0, .1, .5);

	// these always on!
	col *= vec3(hrsspectrum);						// day-night cycle
	col *= 1.-dot(st -= .5, st);				// vignette
	col *= fade;												// composite start and end fade
	// til here!

	// debug:
 	// vec2 debug_pos = vec2(-.5, -.5);
	// col += digits(v_texcoord_aspect + debug_pos + vec2(0., -.05), u_resolution.x);
	// col += digits(v_texcoord_aspect + debug_pos, u_resolution.y);

	// if (hd_normals) {
	// 	col += digits(v_texcoord_aspect + debug_pos, 1.);
	// }
	// col += digits(v_texcoord_aspect + debug_pos, daynightime * 24.);
	// col += digits(v_texcoord_aspect + debug_pos + vec2(0., -.1), dMaxBlur);
	// col += digits(v_texcoord_aspect + debug_pos + vec2(0., -.05), minBlur);

	gl_FragColor = vec4(col, 1.);
}