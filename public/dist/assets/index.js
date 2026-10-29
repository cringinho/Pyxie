var Vg=Object.defineProperty;var Gg=(t,e,n)=>e in t?Vg(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n;var we=(t,e,n)=>Gg(t,typeof e!="symbol"?e+"":e,n);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&i(a)}).observe(document,{childList:!0,subtree:!0});function n(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(r){if(r.ep)return;r.ep=!0;const s=n(r);fetch(r.href,s)}})();function Wg(t){return t&&t.__esModule&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}var Fm={exports:{}},Pl={},Om={exports:{}},Ge={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Oa=Symbol.for("react.element"),Xg=Symbol.for("react.portal"),qg=Symbol.for("react.fragment"),$g=Symbol.for("react.strict_mode"),Yg=Symbol.for("react.profiler"),Kg=Symbol.for("react.provider"),Zg=Symbol.for("react.context"),Qg=Symbol.for("react.forward_ref"),Jg=Symbol.for("react.suspense"),ev=Symbol.for("react.memo"),tv=Symbol.for("react.lazy"),gf=Symbol.iterator;function nv(t){return t===null||typeof t!="object"?null:(t=gf&&t[gf]||t["@@iterator"],typeof t=="function"?t:null)}var zm={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},jm=Object.assign,Bm={};function Is(t,e,n){this.props=t,this.context=e,this.refs=Bm,this.updater=n||zm}Is.prototype.isReactComponent={};Is.prototype.setState=function(t,e){if(typeof t!="object"&&typeof t!="function"&&t!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,t,e,"setState")};Is.prototype.forceUpdate=function(t){this.updater.enqueueForceUpdate(this,t,"forceUpdate")};function Hm(){}Hm.prototype=Is.prototype;function Kd(t,e,n){this.props=t,this.context=e,this.refs=Bm,this.updater=n||zm}var Zd=Kd.prototype=new Hm;Zd.constructor=Kd;jm(Zd,Is.prototype);Zd.isPureReactComponent=!0;var vf=Array.isArray,Vm=Object.prototype.hasOwnProperty,Qd={current:null},Gm={key:!0,ref:!0,__self:!0,__source:!0};function Wm(t,e,n){var i,r={},s=null,a=null;if(e!=null)for(i in e.ref!==void 0&&(a=e.ref),e.key!==void 0&&(s=""+e.key),e)Vm.call(e,i)&&!Gm.hasOwnProperty(i)&&(r[i]=e[i]);var o=arguments.length-2;if(o===1)r.children=n;else if(1<o){for(var c=Array(o),u=0;u<o;u++)c[u]=arguments[u+2];r.children=c}if(t&&t.defaultProps)for(i in o=t.defaultProps,o)r[i]===void 0&&(r[i]=o[i]);return{$$typeof:Oa,type:t,key:s,ref:a,props:r,_owner:Qd.current}}function iv(t,e){return{$$typeof:Oa,type:t.type,key:e,ref:t.ref,props:t.props,_owner:t._owner}}function Jd(t){return typeof t=="object"&&t!==null&&t.$$typeof===Oa}function rv(t){var e={"=":"=0",":":"=2"};return"$"+t.replace(/[=:]/g,function(n){return e[n]})}var _f=/\/+/g;function ic(t,e){return typeof t=="object"&&t!==null&&t.key!=null?rv(""+t.key):e.toString(36)}function Fo(t,e,n,i,r){var s=typeof t;(s==="undefined"||s==="boolean")&&(t=null);var a=!1;if(t===null)a=!0;else switch(s){case"string":case"number":a=!0;break;case"object":switch(t.$$typeof){case Oa:case Xg:a=!0}}if(a)return a=t,r=r(a),t=i===""?"."+ic(a,0):i,vf(r)?(n="",t!=null&&(n=t.replace(_f,"$&/")+"/"),Fo(r,e,n,"",function(u){return u})):r!=null&&(Jd(r)&&(r=iv(r,n+(!r.key||a&&a.key===r.key?"":(""+r.key).replace(_f,"$&/")+"/")+t)),e.push(r)),1;if(a=0,i=i===""?".":i+":",vf(t))for(var o=0;o<t.length;o++){s=t[o];var c=i+ic(s,o);a+=Fo(s,e,n,c,r)}else if(c=nv(t),typeof c=="function")for(t=c.call(t),o=0;!(s=t.next()).done;)s=s.value,c=i+ic(s,o++),a+=Fo(s,e,n,c,r);else if(s==="object")throw e=String(t),Error("Objects are not valid as a React child (found: "+(e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)+"). If you meant to render a collection of children, use an array instead.");return a}function Ka(t,e,n){if(t==null)return t;var i=[],r=0;return Fo(t,i,"","",function(s){return e.call(n,s,r++)}),i}function sv(t){if(t._status===-1){var e=t._result;e=e(),e.then(function(n){(t._status===0||t._status===-1)&&(t._status=1,t._result=n)},function(n){(t._status===0||t._status===-1)&&(t._status=2,t._result=n)}),t._status===-1&&(t._status=0,t._result=e)}if(t._status===1)return t._result.default;throw t._result}var Kt={current:null},Oo={transition:null},av={ReactCurrentDispatcher:Kt,ReactCurrentBatchConfig:Oo,ReactCurrentOwner:Qd};function Xm(){throw Error("act(...) is not supported in production builds of React.")}Ge.Children={map:Ka,forEach:function(t,e,n){Ka(t,function(){e.apply(this,arguments)},n)},count:function(t){var e=0;return Ka(t,function(){e++}),e},toArray:function(t){return Ka(t,function(e){return e})||[]},only:function(t){if(!Jd(t))throw Error("React.Children.only expected to receive a single React element child.");return t}};Ge.Component=Is;Ge.Fragment=qg;Ge.Profiler=Yg;Ge.PureComponent=Kd;Ge.StrictMode=$g;Ge.Suspense=Jg;Ge.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=av;Ge.act=Xm;Ge.cloneElement=function(t,e,n){if(t==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+t+".");var i=jm({},t.props),r=t.key,s=t.ref,a=t._owner;if(e!=null){if(e.ref!==void 0&&(s=e.ref,a=Qd.current),e.key!==void 0&&(r=""+e.key),t.type&&t.type.defaultProps)var o=t.type.defaultProps;for(c in e)Vm.call(e,c)&&!Gm.hasOwnProperty(c)&&(i[c]=e[c]===void 0&&o!==void 0?o[c]:e[c])}var c=arguments.length-2;if(c===1)i.children=n;else if(1<c){o=Array(c);for(var u=0;u<c;u++)o[u]=arguments[u+2];i.children=o}return{$$typeof:Oa,type:t.type,key:r,ref:s,props:i,_owner:a}};Ge.createContext=function(t){return t={$$typeof:Zg,_currentValue:t,_currentValue2:t,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},t.Provider={$$typeof:Kg,_context:t},t.Consumer=t};Ge.createElement=Wm;Ge.createFactory=function(t){var e=Wm.bind(null,t);return e.type=t,e};Ge.createRef=function(){return{current:null}};Ge.forwardRef=function(t){return{$$typeof:Qg,render:t}};Ge.isValidElement=Jd;Ge.lazy=function(t){return{$$typeof:tv,_payload:{_status:-1,_result:t},_init:sv}};Ge.memo=function(t,e){return{$$typeof:ev,type:t,compare:e===void 0?null:e}};Ge.startTransition=function(t){var e=Oo.transition;Oo.transition={};try{t()}finally{Oo.transition=e}};Ge.unstable_act=Xm;Ge.useCallback=function(t,e){return Kt.current.useCallback(t,e)};Ge.useContext=function(t){return Kt.current.useContext(t)};Ge.useDebugValue=function(){};Ge.useDeferredValue=function(t){return Kt.current.useDeferredValue(t)};Ge.useEffect=function(t,e){return Kt.current.useEffect(t,e)};Ge.useId=function(){return Kt.current.useId()};Ge.useImperativeHandle=function(t,e,n){return Kt.current.useImperativeHandle(t,e,n)};Ge.useInsertionEffect=function(t,e){return Kt.current.useInsertionEffect(t,e)};Ge.useLayoutEffect=function(t,e){return Kt.current.useLayoutEffect(t,e)};Ge.useMemo=function(t,e){return Kt.current.useMemo(t,e)};Ge.useReducer=function(t,e,n){return Kt.current.useReducer(t,e,n)};Ge.useRef=function(t){return Kt.current.useRef(t)};Ge.useState=function(t){return Kt.current.useState(t)};Ge.useSyncExternalStore=function(t,e,n){return Kt.current.useSyncExternalStore(t,e,n)};Ge.useTransition=function(){return Kt.current.useTransition()};Ge.version="18.3.1";Om.exports=Ge;var ne=Om.exports;const ov=Wg(ne);/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var lv=ne,cv=Symbol.for("react.element"),uv=Symbol.for("react.fragment"),dv=Object.prototype.hasOwnProperty,hv=lv.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,fv={key:!0,ref:!0,__self:!0,__source:!0};function qm(t,e,n){var i,r={},s=null,a=null;n!==void 0&&(s=""+n),e.key!==void 0&&(s=""+e.key),e.ref!==void 0&&(a=e.ref);for(i in e)dv.call(e,i)&&!fv.hasOwnProperty(i)&&(r[i]=e[i]);if(t&&t.defaultProps)for(i in e=t.defaultProps,e)r[i]===void 0&&(r[i]=e[i]);return{$$typeof:cv,type:t,key:s,ref:a,props:r,_owner:hv.current}}Pl.Fragment=uv;Pl.jsx=qm;Pl.jsxs=qm;Fm.exports=Pl;var l=Fm.exports,lu={},$m={exports:{}},gn={},Ym={exports:{}},Km={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */(function(t){function e(D,J){var ee=D.length;D.push(J);e:for(;0<ee;){var z=ee-1>>>1,le=D[z];if(0<r(le,J))D[z]=J,D[ee]=le,ee=z;else break e}}function n(D){return D.length===0?null:D[0]}function i(D){if(D.length===0)return null;var J=D[0],ee=D.pop();if(ee!==J){D[0]=ee;e:for(var z=0,le=D.length,Ae=le>>>1;z<Ae;){var G=2*(z+1)-1,re=D[G],ue=G+1,me=D[ue];if(0>r(re,ee))ue<le&&0>r(me,re)?(D[z]=me,D[ue]=ee,z=ue):(D[z]=re,D[G]=ee,z=G);else if(ue<le&&0>r(me,ee))D[z]=me,D[ue]=ee,z=ue;else break e}}return J}function r(D,J){var ee=D.sortIndex-J.sortIndex;return ee!==0?ee:D.id-J.id}if(typeof performance=="object"&&typeof performance.now=="function"){var s=performance;t.unstable_now=function(){return s.now()}}else{var a=Date,o=a.now();t.unstable_now=function(){return a.now()-o}}var c=[],u=[],f=1,p=null,h=3,x=!1,_=!1,S=!1,m=typeof setTimeout=="function"?setTimeout:null,d=typeof clearTimeout=="function"?clearTimeout:null,g=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function v(D){for(var J=n(u);J!==null;){if(J.callback===null)i(u);else if(J.startTime<=D)i(u),J.sortIndex=J.expirationTime,e(c,J);else break;J=n(u)}}function w(D){if(S=!1,v(D),!_)if(n(c)!==null)_=!0,W(R);else{var J=n(u);J!==null&&Y(w,J.startTime-D)}}function R(D,J){_=!1,S&&(S=!1,d(N),N=-1),x=!0;var ee=h;try{for(v(J),p=n(c);p!==null&&(!(p.expirationTime>J)||D&&!b());){var z=p.callback;if(typeof z=="function"){p.callback=null,h=p.priorityLevel;var le=z(p.expirationTime<=J);J=t.unstable_now(),typeof le=="function"?p.callback=le:p===n(c)&&i(c),v(J)}else i(c);p=n(c)}if(p!==null)var Ae=!0;else{var G=n(u);G!==null&&Y(w,G.startTime-J),Ae=!1}return Ae}finally{p=null,h=ee,x=!1}}var E=!1,A=null,N=-1,F=5,y=-1;function b(){return!(t.unstable_now()-y<F)}function O(){if(A!==null){var D=t.unstable_now();y=D;var J=!0;try{J=A(!0,D)}finally{J?V():(E=!1,A=null)}}else E=!1}var V;if(typeof g=="function")V=function(){g(O)};else if(typeof MessageChannel<"u"){var q=new MessageChannel,Q=q.port2;q.port1.onmessage=O,V=function(){Q.postMessage(null)}}else V=function(){m(O,0)};function W(D){A=D,E||(E=!0,V())}function Y(D,J){N=m(function(){D(t.unstable_now())},J)}t.unstable_IdlePriority=5,t.unstable_ImmediatePriority=1,t.unstable_LowPriority=4,t.unstable_NormalPriority=3,t.unstable_Profiling=null,t.unstable_UserBlockingPriority=2,t.unstable_cancelCallback=function(D){D.callback=null},t.unstable_continueExecution=function(){_||x||(_=!0,W(R))},t.unstable_forceFrameRate=function(D){0>D||125<D?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):F=0<D?Math.floor(1e3/D):5},t.unstable_getCurrentPriorityLevel=function(){return h},t.unstable_getFirstCallbackNode=function(){return n(c)},t.unstable_next=function(D){switch(h){case 1:case 2:case 3:var J=3;break;default:J=h}var ee=h;h=J;try{return D()}finally{h=ee}},t.unstable_pauseExecution=function(){},t.unstable_requestPaint=function(){},t.unstable_runWithPriority=function(D,J){switch(D){case 1:case 2:case 3:case 4:case 5:break;default:D=3}var ee=h;h=D;try{return J()}finally{h=ee}},t.unstable_scheduleCallback=function(D,J,ee){var z=t.unstable_now();switch(typeof ee=="object"&&ee!==null?(ee=ee.delay,ee=typeof ee=="number"&&0<ee?z+ee:z):ee=z,D){case 1:var le=-1;break;case 2:le=250;break;case 5:le=1073741823;break;case 4:le=1e4;break;default:le=5e3}return le=ee+le,D={id:f++,callback:J,priorityLevel:D,startTime:ee,expirationTime:le,sortIndex:-1},ee>z?(D.sortIndex=ee,e(u,D),n(c)===null&&D===n(u)&&(S?(d(N),N=-1):S=!0,Y(w,ee-z))):(D.sortIndex=le,e(c,D),_||x||(_=!0,W(R))),D},t.unstable_shouldYield=b,t.unstable_wrapCallback=function(D){var J=h;return function(){var ee=h;h=J;try{return D.apply(this,arguments)}finally{h=ee}}}})(Km);Ym.exports=Km;var pv=Ym.exports;/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var mv=ne,xn=pv;function ae(t){for(var e="https://reactjs.org/docs/error-decoder.html?invariant="+t,n=1;n<arguments.length;n++)e+="&args[]="+encodeURIComponent(arguments[n]);return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var Zm=new Set,va={};function Rr(t,e){gs(t,e),gs(t+"Capture",e)}function gs(t,e){for(va[t]=e,t=0;t<e.length;t++)Zm.add(e[t])}var pi=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),cu=Object.prototype.hasOwnProperty,xv=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,yf={},Sf={};function gv(t){return cu.call(Sf,t)?!0:cu.call(yf,t)?!1:xv.test(t)?Sf[t]=!0:(yf[t]=!0,!1)}function vv(t,e,n,i){if(n!==null&&n.type===0)return!1;switch(typeof e){case"function":case"symbol":return!0;case"boolean":return i?!1:n!==null?!n.acceptsBooleans:(t=t.toLowerCase().slice(0,5),t!=="data-"&&t!=="aria-");default:return!1}}function _v(t,e,n,i){if(e===null||typeof e>"u"||vv(t,e,n,i))return!0;if(i)return!1;if(n!==null)switch(n.type){case 3:return!e;case 4:return e===!1;case 5:return isNaN(e);case 6:return isNaN(e)||1>e}return!1}function Zt(t,e,n,i,r,s,a){this.acceptsBooleans=e===2||e===3||e===4,this.attributeName=i,this.attributeNamespace=r,this.mustUseProperty=n,this.propertyName=t,this.type=e,this.sanitizeURL=s,this.removeEmptyString=a}var kt={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(t){kt[t]=new Zt(t,0,!1,t,null,!1,!1)});[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(t){var e=t[0];kt[e]=new Zt(e,1,!1,t[1],null,!1,!1)});["contentEditable","draggable","spellCheck","value"].forEach(function(t){kt[t]=new Zt(t,2,!1,t.toLowerCase(),null,!1,!1)});["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(t){kt[t]=new Zt(t,2,!1,t,null,!1,!1)});"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(t){kt[t]=new Zt(t,3,!1,t.toLowerCase(),null,!1,!1)});["checked","multiple","muted","selected"].forEach(function(t){kt[t]=new Zt(t,3,!0,t,null,!1,!1)});["capture","download"].forEach(function(t){kt[t]=new Zt(t,4,!1,t,null,!1,!1)});["cols","rows","size","span"].forEach(function(t){kt[t]=new Zt(t,6,!1,t,null,!1,!1)});["rowSpan","start"].forEach(function(t){kt[t]=new Zt(t,5,!1,t.toLowerCase(),null,!1,!1)});var eh=/[\-:]([a-z])/g;function th(t){return t[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(t){var e=t.replace(eh,th);kt[e]=new Zt(e,1,!1,t,null,!1,!1)});"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(t){var e=t.replace(eh,th);kt[e]=new Zt(e,1,!1,t,"http://www.w3.org/1999/xlink",!1,!1)});["xml:base","xml:lang","xml:space"].forEach(function(t){var e=t.replace(eh,th);kt[e]=new Zt(e,1,!1,t,"http://www.w3.org/XML/1998/namespace",!1,!1)});["tabIndex","crossOrigin"].forEach(function(t){kt[t]=new Zt(t,1,!1,t.toLowerCase(),null,!1,!1)});kt.xlinkHref=new Zt("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1);["src","href","action","formAction"].forEach(function(t){kt[t]=new Zt(t,1,!1,t.toLowerCase(),null,!0,!0)});function nh(t,e,n,i){var r=kt.hasOwnProperty(e)?kt[e]:null;(r!==null?r.type!==0:i||!(2<e.length)||e[0]!=="o"&&e[0]!=="O"||e[1]!=="n"&&e[1]!=="N")&&(_v(e,n,r,i)&&(n=null),i||r===null?gv(e)&&(n===null?t.removeAttribute(e):t.setAttribute(e,""+n)):r.mustUseProperty?t[r.propertyName]=n===null?r.type===3?!1:"":n:(e=r.attributeName,i=r.attributeNamespace,n===null?t.removeAttribute(e):(r=r.type,n=r===3||r===4&&n===!0?"":""+n,i?t.setAttributeNS(i,e,n):t.setAttribute(e,n))))}var yi=mv.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,Za=Symbol.for("react.element"),$r=Symbol.for("react.portal"),Yr=Symbol.for("react.fragment"),ih=Symbol.for("react.strict_mode"),uu=Symbol.for("react.profiler"),Qm=Symbol.for("react.provider"),Jm=Symbol.for("react.context"),rh=Symbol.for("react.forward_ref"),du=Symbol.for("react.suspense"),hu=Symbol.for("react.suspense_list"),sh=Symbol.for("react.memo"),Ri=Symbol.for("react.lazy"),e0=Symbol.for("react.offscreen"),wf=Symbol.iterator;function Bs(t){return t===null||typeof t!="object"?null:(t=wf&&t[wf]||t["@@iterator"],typeof t=="function"?t:null)}var xt=Object.assign,rc;function na(t){if(rc===void 0)try{throw Error()}catch(n){var e=n.stack.trim().match(/\n( *(at )?)/);rc=e&&e[1]||""}return`
`+rc+t}var sc=!1;function ac(t,e){if(!t||sc)return"";sc=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(e)if(e=function(){throw Error()},Object.defineProperty(e.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(e,[])}catch(u){var i=u}Reflect.construct(t,[],e)}else{try{e.call()}catch(u){i=u}t.call(e.prototype)}else{try{throw Error()}catch(u){i=u}t()}}catch(u){if(u&&i&&typeof u.stack=="string"){for(var r=u.stack.split(`
`),s=i.stack.split(`
`),a=r.length-1,o=s.length-1;1<=a&&0<=o&&r[a]!==s[o];)o--;for(;1<=a&&0<=o;a--,o--)if(r[a]!==s[o]){if(a!==1||o!==1)do if(a--,o--,0>o||r[a]!==s[o]){var c=`
`+r[a].replace(" at new "," at ");return t.displayName&&c.includes("<anonymous>")&&(c=c.replace("<anonymous>",t.displayName)),c}while(1<=a&&0<=o);break}}}finally{sc=!1,Error.prepareStackTrace=n}return(t=t?t.displayName||t.name:"")?na(t):""}function yv(t){switch(t.tag){case 5:return na(t.type);case 16:return na("Lazy");case 13:return na("Suspense");case 19:return na("SuspenseList");case 0:case 2:case 15:return t=ac(t.type,!1),t;case 11:return t=ac(t.type.render,!1),t;case 1:return t=ac(t.type,!0),t;default:return""}}function fu(t){if(t==null)return null;if(typeof t=="function")return t.displayName||t.name||null;if(typeof t=="string")return t;switch(t){case Yr:return"Fragment";case $r:return"Portal";case uu:return"Profiler";case ih:return"StrictMode";case du:return"Suspense";case hu:return"SuspenseList"}if(typeof t=="object")switch(t.$$typeof){case Jm:return(t.displayName||"Context")+".Consumer";case Qm:return(t._context.displayName||"Context")+".Provider";case rh:var e=t.render;return t=t.displayName,t||(t=e.displayName||e.name||"",t=t!==""?"ForwardRef("+t+")":"ForwardRef"),t;case sh:return e=t.displayName||null,e!==null?e:fu(t.type)||"Memo";case Ri:e=t._payload,t=t._init;try{return fu(t(e))}catch{}}return null}function Sv(t){var e=t.type;switch(t.tag){case 24:return"Cache";case 9:return(e.displayName||"Context")+".Consumer";case 10:return(e._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return t=e.render,t=t.displayName||t.name||"",e.displayName||(t!==""?"ForwardRef("+t+")":"ForwardRef");case 7:return"Fragment";case 5:return e;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return fu(e);case 8:return e===ih?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof e=="function")return e.displayName||e.name||null;if(typeof e=="string")return e}return null}function $i(t){switch(typeof t){case"boolean":case"number":case"string":case"undefined":return t;case"object":return t;default:return""}}function t0(t){var e=t.type;return(t=t.nodeName)&&t.toLowerCase()==="input"&&(e==="checkbox"||e==="radio")}function wv(t){var e=t0(t)?"checked":"value",n=Object.getOwnPropertyDescriptor(t.constructor.prototype,e),i=""+t[e];if(!t.hasOwnProperty(e)&&typeof n<"u"&&typeof n.get=="function"&&typeof n.set=="function"){var r=n.get,s=n.set;return Object.defineProperty(t,e,{configurable:!0,get:function(){return r.call(this)},set:function(a){i=""+a,s.call(this,a)}}),Object.defineProperty(t,e,{enumerable:n.enumerable}),{getValue:function(){return i},setValue:function(a){i=""+a},stopTracking:function(){t._valueTracker=null,delete t[e]}}}}function Qa(t){t._valueTracker||(t._valueTracker=wv(t))}function n0(t){if(!t)return!1;var e=t._valueTracker;if(!e)return!0;var n=e.getValue(),i="";return t&&(i=t0(t)?t.checked?"true":"false":t.value),t=i,t!==n?(e.setValue(t),!0):!1}function nl(t){if(t=t||(typeof document<"u"?document:void 0),typeof t>"u")return null;try{return t.activeElement||t.body}catch{return t.body}}function pu(t,e){var n=e.checked;return xt({},e,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:n??t._wrapperState.initialChecked})}function Mf(t,e){var n=e.defaultValue==null?"":e.defaultValue,i=e.checked!=null?e.checked:e.defaultChecked;n=$i(e.value!=null?e.value:n),t._wrapperState={initialChecked:i,initialValue:n,controlled:e.type==="checkbox"||e.type==="radio"?e.checked!=null:e.value!=null}}function i0(t,e){e=e.checked,e!=null&&nh(t,"checked",e,!1)}function mu(t,e){i0(t,e);var n=$i(e.value),i=e.type;if(n!=null)i==="number"?(n===0&&t.value===""||t.value!=n)&&(t.value=""+n):t.value!==""+n&&(t.value=""+n);else if(i==="submit"||i==="reset"){t.removeAttribute("value");return}e.hasOwnProperty("value")?xu(t,e.type,n):e.hasOwnProperty("defaultValue")&&xu(t,e.type,$i(e.defaultValue)),e.checked==null&&e.defaultChecked!=null&&(t.defaultChecked=!!e.defaultChecked)}function bf(t,e,n){if(e.hasOwnProperty("value")||e.hasOwnProperty("defaultValue")){var i=e.type;if(!(i!=="submit"&&i!=="reset"||e.value!==void 0&&e.value!==null))return;e=""+t._wrapperState.initialValue,n||e===t.value||(t.value=e),t.defaultValue=e}n=t.name,n!==""&&(t.name=""),t.defaultChecked=!!t._wrapperState.initialChecked,n!==""&&(t.name=n)}function xu(t,e,n){(e!=="number"||nl(t.ownerDocument)!==t)&&(n==null?t.defaultValue=""+t._wrapperState.initialValue:t.defaultValue!==""+n&&(t.defaultValue=""+n))}var ia=Array.isArray;function os(t,e,n,i){if(t=t.options,e){e={};for(var r=0;r<n.length;r++)e["$"+n[r]]=!0;for(n=0;n<t.length;n++)r=e.hasOwnProperty("$"+t[n].value),t[n].selected!==r&&(t[n].selected=r),r&&i&&(t[n].defaultSelected=!0)}else{for(n=""+$i(n),e=null,r=0;r<t.length;r++){if(t[r].value===n){t[r].selected=!0,i&&(t[r].defaultSelected=!0);return}e!==null||t[r].disabled||(e=t[r])}e!==null&&(e.selected=!0)}}function gu(t,e){if(e.dangerouslySetInnerHTML!=null)throw Error(ae(91));return xt({},e,{value:void 0,defaultValue:void 0,children:""+t._wrapperState.initialValue})}function Ef(t,e){var n=e.value;if(n==null){if(n=e.children,e=e.defaultValue,n!=null){if(e!=null)throw Error(ae(92));if(ia(n)){if(1<n.length)throw Error(ae(93));n=n[0]}e=n}e==null&&(e=""),n=e}t._wrapperState={initialValue:$i(n)}}function r0(t,e){var n=$i(e.value),i=$i(e.defaultValue);n!=null&&(n=""+n,n!==t.value&&(t.value=n),e.defaultValue==null&&t.defaultValue!==n&&(t.defaultValue=n)),i!=null&&(t.defaultValue=""+i)}function Tf(t){var e=t.textContent;e===t._wrapperState.initialValue&&e!==""&&e!==null&&(t.value=e)}function s0(t){switch(t){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function vu(t,e){return t==null||t==="http://www.w3.org/1999/xhtml"?s0(e):t==="http://www.w3.org/2000/svg"&&e==="foreignObject"?"http://www.w3.org/1999/xhtml":t}var Ja,a0=function(t){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(e,n,i,r){MSApp.execUnsafeLocalFunction(function(){return t(e,n,i,r)})}:t}(function(t,e){if(t.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in t)t.innerHTML=e;else{for(Ja=Ja||document.createElement("div"),Ja.innerHTML="<svg>"+e.valueOf().toString()+"</svg>",e=Ja.firstChild;t.firstChild;)t.removeChild(t.firstChild);for(;e.firstChild;)t.appendChild(e.firstChild)}});function _a(t,e){if(e){var n=t.firstChild;if(n&&n===t.lastChild&&n.nodeType===3){n.nodeValue=e;return}}t.textContent=e}var la={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},Mv=["Webkit","ms","Moz","O"];Object.keys(la).forEach(function(t){Mv.forEach(function(e){e=e+t.charAt(0).toUpperCase()+t.substring(1),la[e]=la[t]})});function o0(t,e,n){return e==null||typeof e=="boolean"||e===""?"":n||typeof e!="number"||e===0||la.hasOwnProperty(t)&&la[t]?(""+e).trim():e+"px"}function l0(t,e){t=t.style;for(var n in e)if(e.hasOwnProperty(n)){var i=n.indexOf("--")===0,r=o0(n,e[n],i);n==="float"&&(n="cssFloat"),i?t.setProperty(n,r):t[n]=r}}var bv=xt({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function _u(t,e){if(e){if(bv[t]&&(e.children!=null||e.dangerouslySetInnerHTML!=null))throw Error(ae(137,t));if(e.dangerouslySetInnerHTML!=null){if(e.children!=null)throw Error(ae(60));if(typeof e.dangerouslySetInnerHTML!="object"||!("__html"in e.dangerouslySetInnerHTML))throw Error(ae(61))}if(e.style!=null&&typeof e.style!="object")throw Error(ae(62))}}function yu(t,e){if(t.indexOf("-")===-1)return typeof e.is=="string";switch(t){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var Su=null;function ah(t){return t=t.target||t.srcElement||window,t.correspondingUseElement&&(t=t.correspondingUseElement),t.nodeType===3?t.parentNode:t}var wu=null,ls=null,cs=null;function Af(t){if(t=Ba(t)){if(typeof wu!="function")throw Error(ae(280));var e=t.stateNode;e&&(e=Ul(e),wu(t.stateNode,t.type,e))}}function c0(t){ls?cs?cs.push(t):cs=[t]:ls=t}function u0(){if(ls){var t=ls,e=cs;if(cs=ls=null,Af(t),e)for(t=0;t<e.length;t++)Af(e[t])}}function d0(t,e){return t(e)}function h0(){}var oc=!1;function f0(t,e,n){if(oc)return t(e,n);oc=!0;try{return d0(t,e,n)}finally{oc=!1,(ls!==null||cs!==null)&&(h0(),u0())}}function ya(t,e){var n=t.stateNode;if(n===null)return null;var i=Ul(n);if(i===null)return null;n=i[e];e:switch(e){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(i=!i.disabled)||(t=t.type,i=!(t==="button"||t==="input"||t==="select"||t==="textarea")),t=!i;break e;default:t=!1}if(t)return null;if(n&&typeof n!="function")throw Error(ae(231,e,typeof n));return n}var Mu=!1;if(pi)try{var Hs={};Object.defineProperty(Hs,"passive",{get:function(){Mu=!0}}),window.addEventListener("test",Hs,Hs),window.removeEventListener("test",Hs,Hs)}catch{Mu=!1}function Ev(t,e,n,i,r,s,a,o,c){var u=Array.prototype.slice.call(arguments,3);try{e.apply(n,u)}catch(f){this.onError(f)}}var ca=!1,il=null,rl=!1,bu=null,Tv={onError:function(t){ca=!0,il=t}};function Av(t,e,n,i,r,s,a,o,c){ca=!1,il=null,Ev.apply(Tv,arguments)}function Cv(t,e,n,i,r,s,a,o,c){if(Av.apply(this,arguments),ca){if(ca){var u=il;ca=!1,il=null}else throw Error(ae(198));rl||(rl=!0,bu=u)}}function Pr(t){var e=t,n=t;if(t.alternate)for(;e.return;)e=e.return;else{t=e;do e=t,e.flags&4098&&(n=e.return),t=e.return;while(t)}return e.tag===3?n:null}function p0(t){if(t.tag===13){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function Cf(t){if(Pr(t)!==t)throw Error(ae(188))}function Nv(t){var e=t.alternate;if(!e){if(e=Pr(t),e===null)throw Error(ae(188));return e!==t?null:t}for(var n=t,i=e;;){var r=n.return;if(r===null)break;var s=r.alternate;if(s===null){if(i=r.return,i!==null){n=i;continue}break}if(r.child===s.child){for(s=r.child;s;){if(s===n)return Cf(r),t;if(s===i)return Cf(r),e;s=s.sibling}throw Error(ae(188))}if(n.return!==i.return)n=r,i=s;else{for(var a=!1,o=r.child;o;){if(o===n){a=!0,n=r,i=s;break}if(o===i){a=!0,i=r,n=s;break}o=o.sibling}if(!a){for(o=s.child;o;){if(o===n){a=!0,n=s,i=r;break}if(o===i){a=!0,i=s,n=r;break}o=o.sibling}if(!a)throw Error(ae(189))}}if(n.alternate!==i)throw Error(ae(190))}if(n.tag!==3)throw Error(ae(188));return n.stateNode.current===n?t:e}function m0(t){return t=Nv(t),t!==null?x0(t):null}function x0(t){if(t.tag===5||t.tag===6)return t;for(t=t.child;t!==null;){var e=x0(t);if(e!==null)return e;t=t.sibling}return null}var g0=xn.unstable_scheduleCallback,Nf=xn.unstable_cancelCallback,Rv=xn.unstable_shouldYield,Pv=xn.unstable_requestPaint,yt=xn.unstable_now,Lv=xn.unstable_getCurrentPriorityLevel,oh=xn.unstable_ImmediatePriority,v0=xn.unstable_UserBlockingPriority,sl=xn.unstable_NormalPriority,Dv=xn.unstable_LowPriority,_0=xn.unstable_IdlePriority,Ll=null,Kn=null;function kv(t){if(Kn&&typeof Kn.onCommitFiberRoot=="function")try{Kn.onCommitFiberRoot(Ll,t,void 0,(t.current.flags&128)===128)}catch{}}var Hn=Math.clz32?Math.clz32:Fv,Iv=Math.log,Uv=Math.LN2;function Fv(t){return t>>>=0,t===0?32:31-(Iv(t)/Uv|0)|0}var eo=64,to=4194304;function ra(t){switch(t&-t){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return t&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return t}}function al(t,e){var n=t.pendingLanes;if(n===0)return 0;var i=0,r=t.suspendedLanes,s=t.pingedLanes,a=n&268435455;if(a!==0){var o=a&~r;o!==0?i=ra(o):(s&=a,s!==0&&(i=ra(s)))}else a=n&~r,a!==0?i=ra(a):s!==0&&(i=ra(s));if(i===0)return 0;if(e!==0&&e!==i&&!(e&r)&&(r=i&-i,s=e&-e,r>=s||r===16&&(s&4194240)!==0))return e;if(i&4&&(i|=n&16),e=t.entangledLanes,e!==0)for(t=t.entanglements,e&=i;0<e;)n=31-Hn(e),r=1<<n,i|=t[n],e&=~r;return i}function Ov(t,e){switch(t){case 1:case 2:case 4:return e+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function zv(t,e){for(var n=t.suspendedLanes,i=t.pingedLanes,r=t.expirationTimes,s=t.pendingLanes;0<s;){var a=31-Hn(s),o=1<<a,c=r[a];c===-1?(!(o&n)||o&i)&&(r[a]=Ov(o,e)):c<=e&&(t.expiredLanes|=o),s&=~o}}function Eu(t){return t=t.pendingLanes&-1073741825,t!==0?t:t&1073741824?1073741824:0}function y0(){var t=eo;return eo<<=1,!(eo&4194240)&&(eo=64),t}function lc(t){for(var e=[],n=0;31>n;n++)e.push(t);return e}function za(t,e,n){t.pendingLanes|=e,e!==536870912&&(t.suspendedLanes=0,t.pingedLanes=0),t=t.eventTimes,e=31-Hn(e),t[e]=n}function jv(t,e){var n=t.pendingLanes&~e;t.pendingLanes=e,t.suspendedLanes=0,t.pingedLanes=0,t.expiredLanes&=e,t.mutableReadLanes&=e,t.entangledLanes&=e,e=t.entanglements;var i=t.eventTimes;for(t=t.expirationTimes;0<n;){var r=31-Hn(n),s=1<<r;e[r]=0,i[r]=-1,t[r]=-1,n&=~s}}function lh(t,e){var n=t.entangledLanes|=e;for(t=t.entanglements;n;){var i=31-Hn(n),r=1<<i;r&e|t[i]&e&&(t[i]|=e),n&=~r}}var it=0;function S0(t){return t&=-t,1<t?4<t?t&268435455?16:536870912:4:1}var w0,ch,M0,b0,E0,Tu=!1,no=[],Oi=null,zi=null,ji=null,Sa=new Map,wa=new Map,Di=[],Bv="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function Rf(t,e){switch(t){case"focusin":case"focusout":Oi=null;break;case"dragenter":case"dragleave":zi=null;break;case"mouseover":case"mouseout":ji=null;break;case"pointerover":case"pointerout":Sa.delete(e.pointerId);break;case"gotpointercapture":case"lostpointercapture":wa.delete(e.pointerId)}}function Vs(t,e,n,i,r,s){return t===null||t.nativeEvent!==s?(t={blockedOn:e,domEventName:n,eventSystemFlags:i,nativeEvent:s,targetContainers:[r]},e!==null&&(e=Ba(e),e!==null&&ch(e)),t):(t.eventSystemFlags|=i,e=t.targetContainers,r!==null&&e.indexOf(r)===-1&&e.push(r),t)}function Hv(t,e,n,i,r){switch(e){case"focusin":return Oi=Vs(Oi,t,e,n,i,r),!0;case"dragenter":return zi=Vs(zi,t,e,n,i,r),!0;case"mouseover":return ji=Vs(ji,t,e,n,i,r),!0;case"pointerover":var s=r.pointerId;return Sa.set(s,Vs(Sa.get(s)||null,t,e,n,i,r)),!0;case"gotpointercapture":return s=r.pointerId,wa.set(s,Vs(wa.get(s)||null,t,e,n,i,r)),!0}return!1}function T0(t){var e=xr(t.target);if(e!==null){var n=Pr(e);if(n!==null){if(e=n.tag,e===13){if(e=p0(n),e!==null){t.blockedOn=e,E0(t.priority,function(){M0(n)});return}}else if(e===3&&n.stateNode.current.memoizedState.isDehydrated){t.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}t.blockedOn=null}function zo(t){if(t.blockedOn!==null)return!1;for(var e=t.targetContainers;0<e.length;){var n=Au(t.domEventName,t.eventSystemFlags,e[0],t.nativeEvent);if(n===null){n=t.nativeEvent;var i=new n.constructor(n.type,n);Su=i,n.target.dispatchEvent(i),Su=null}else return e=Ba(n),e!==null&&ch(e),t.blockedOn=n,!1;e.shift()}return!0}function Pf(t,e,n){zo(t)&&n.delete(e)}function Vv(){Tu=!1,Oi!==null&&zo(Oi)&&(Oi=null),zi!==null&&zo(zi)&&(zi=null),ji!==null&&zo(ji)&&(ji=null),Sa.forEach(Pf),wa.forEach(Pf)}function Gs(t,e){t.blockedOn===e&&(t.blockedOn=null,Tu||(Tu=!0,xn.unstable_scheduleCallback(xn.unstable_NormalPriority,Vv)))}function Ma(t){function e(r){return Gs(r,t)}if(0<no.length){Gs(no[0],t);for(var n=1;n<no.length;n++){var i=no[n];i.blockedOn===t&&(i.blockedOn=null)}}for(Oi!==null&&Gs(Oi,t),zi!==null&&Gs(zi,t),ji!==null&&Gs(ji,t),Sa.forEach(e),wa.forEach(e),n=0;n<Di.length;n++)i=Di[n],i.blockedOn===t&&(i.blockedOn=null);for(;0<Di.length&&(n=Di[0],n.blockedOn===null);)T0(n),n.blockedOn===null&&Di.shift()}var us=yi.ReactCurrentBatchConfig,ol=!0;function Gv(t,e,n,i){var r=it,s=us.transition;us.transition=null;try{it=1,uh(t,e,n,i)}finally{it=r,us.transition=s}}function Wv(t,e,n,i){var r=it,s=us.transition;us.transition=null;try{it=4,uh(t,e,n,i)}finally{it=r,us.transition=s}}function uh(t,e,n,i){if(ol){var r=Au(t,e,n,i);if(r===null)vc(t,e,i,ll,n),Rf(t,i);else if(Hv(r,t,e,n,i))i.stopPropagation();else if(Rf(t,i),e&4&&-1<Bv.indexOf(t)){for(;r!==null;){var s=Ba(r);if(s!==null&&w0(s),s=Au(t,e,n,i),s===null&&vc(t,e,i,ll,n),s===r)break;r=s}r!==null&&i.stopPropagation()}else vc(t,e,i,null,n)}}var ll=null;function Au(t,e,n,i){if(ll=null,t=ah(i),t=xr(t),t!==null)if(e=Pr(t),e===null)t=null;else if(n=e.tag,n===13){if(t=p0(e),t!==null)return t;t=null}else if(n===3){if(e.stateNode.current.memoizedState.isDehydrated)return e.tag===3?e.stateNode.containerInfo:null;t=null}else e!==t&&(t=null);return ll=t,null}function A0(t){switch(t){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(Lv()){case oh:return 1;case v0:return 4;case sl:case Dv:return 16;case _0:return 536870912;default:return 16}default:return 16}}var Ui=null,dh=null,jo=null;function C0(){if(jo)return jo;var t,e=dh,n=e.length,i,r="value"in Ui?Ui.value:Ui.textContent,s=r.length;for(t=0;t<n&&e[t]===r[t];t++);var a=n-t;for(i=1;i<=a&&e[n-i]===r[s-i];i++);return jo=r.slice(t,1<i?1-i:void 0)}function Bo(t){var e=t.keyCode;return"charCode"in t?(t=t.charCode,t===0&&e===13&&(t=13)):t=e,t===10&&(t=13),32<=t||t===13?t:0}function io(){return!0}function Lf(){return!1}function vn(t){function e(n,i,r,s,a){this._reactName=n,this._targetInst=r,this.type=i,this.nativeEvent=s,this.target=a,this.currentTarget=null;for(var o in t)t.hasOwnProperty(o)&&(n=t[o],this[o]=n?n(s):s[o]);return this.isDefaultPrevented=(s.defaultPrevented!=null?s.defaultPrevented:s.returnValue===!1)?io:Lf,this.isPropagationStopped=Lf,this}return xt(e.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=io)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=io)},persist:function(){},isPersistent:io}),e}var Us={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(t){return t.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},hh=vn(Us),ja=xt({},Us,{view:0,detail:0}),Xv=vn(ja),cc,uc,Ws,Dl=xt({},ja,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:fh,button:0,buttons:0,relatedTarget:function(t){return t.relatedTarget===void 0?t.fromElement===t.srcElement?t.toElement:t.fromElement:t.relatedTarget},movementX:function(t){return"movementX"in t?t.movementX:(t!==Ws&&(Ws&&t.type==="mousemove"?(cc=t.screenX-Ws.screenX,uc=t.screenY-Ws.screenY):uc=cc=0,Ws=t),cc)},movementY:function(t){return"movementY"in t?t.movementY:uc}}),Df=vn(Dl),qv=xt({},Dl,{dataTransfer:0}),$v=vn(qv),Yv=xt({},ja,{relatedTarget:0}),dc=vn(Yv),Kv=xt({},Us,{animationName:0,elapsedTime:0,pseudoElement:0}),Zv=vn(Kv),Qv=xt({},Us,{clipboardData:function(t){return"clipboardData"in t?t.clipboardData:window.clipboardData}}),Jv=vn(Qv),e_=xt({},Us,{data:0}),kf=vn(e_),t_={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},n_={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},i_={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function r_(t){var e=this.nativeEvent;return e.getModifierState?e.getModifierState(t):(t=i_[t])?!!e[t]:!1}function fh(){return r_}var s_=xt({},ja,{key:function(t){if(t.key){var e=t_[t.key]||t.key;if(e!=="Unidentified")return e}return t.type==="keypress"?(t=Bo(t),t===13?"Enter":String.fromCharCode(t)):t.type==="keydown"||t.type==="keyup"?n_[t.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:fh,charCode:function(t){return t.type==="keypress"?Bo(t):0},keyCode:function(t){return t.type==="keydown"||t.type==="keyup"?t.keyCode:0},which:function(t){return t.type==="keypress"?Bo(t):t.type==="keydown"||t.type==="keyup"?t.keyCode:0}}),a_=vn(s_),o_=xt({},Dl,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),If=vn(o_),l_=xt({},ja,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:fh}),c_=vn(l_),u_=xt({},Us,{propertyName:0,elapsedTime:0,pseudoElement:0}),d_=vn(u_),h_=xt({},Dl,{deltaX:function(t){return"deltaX"in t?t.deltaX:"wheelDeltaX"in t?-t.wheelDeltaX:0},deltaY:function(t){return"deltaY"in t?t.deltaY:"wheelDeltaY"in t?-t.wheelDeltaY:"wheelDelta"in t?-t.wheelDelta:0},deltaZ:0,deltaMode:0}),f_=vn(h_),p_=[9,13,27,32],ph=pi&&"CompositionEvent"in window,ua=null;pi&&"documentMode"in document&&(ua=document.documentMode);var m_=pi&&"TextEvent"in window&&!ua,N0=pi&&(!ph||ua&&8<ua&&11>=ua),Uf=" ",Ff=!1;function R0(t,e){switch(t){case"keyup":return p_.indexOf(e.keyCode)!==-1;case"keydown":return e.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function P0(t){return t=t.detail,typeof t=="object"&&"data"in t?t.data:null}var Kr=!1;function x_(t,e){switch(t){case"compositionend":return P0(e);case"keypress":return e.which!==32?null:(Ff=!0,Uf);case"textInput":return t=e.data,t===Uf&&Ff?null:t;default:return null}}function g_(t,e){if(Kr)return t==="compositionend"||!ph&&R0(t,e)?(t=C0(),jo=dh=Ui=null,Kr=!1,t):null;switch(t){case"paste":return null;case"keypress":if(!(e.ctrlKey||e.altKey||e.metaKey)||e.ctrlKey&&e.altKey){if(e.char&&1<e.char.length)return e.char;if(e.which)return String.fromCharCode(e.which)}return null;case"compositionend":return N0&&e.locale!=="ko"?null:e.data;default:return null}}var v_={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Of(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e==="input"?!!v_[t.type]:e==="textarea"}function L0(t,e,n,i){c0(i),e=cl(e,"onChange"),0<e.length&&(n=new hh("onChange","change",null,n,i),t.push({event:n,listeners:e}))}var da=null,ba=null;function __(t){V0(t,0)}function kl(t){var e=Jr(t);if(n0(e))return t}function y_(t,e){if(t==="change")return e}var D0=!1;if(pi){var hc;if(pi){var fc="oninput"in document;if(!fc){var zf=document.createElement("div");zf.setAttribute("oninput","return;"),fc=typeof zf.oninput=="function"}hc=fc}else hc=!1;D0=hc&&(!document.documentMode||9<document.documentMode)}function jf(){da&&(da.detachEvent("onpropertychange",k0),ba=da=null)}function k0(t){if(t.propertyName==="value"&&kl(ba)){var e=[];L0(e,ba,t,ah(t)),f0(__,e)}}function S_(t,e,n){t==="focusin"?(jf(),da=e,ba=n,da.attachEvent("onpropertychange",k0)):t==="focusout"&&jf()}function w_(t){if(t==="selectionchange"||t==="keyup"||t==="keydown")return kl(ba)}function M_(t,e){if(t==="click")return kl(e)}function b_(t,e){if(t==="input"||t==="change")return kl(e)}function E_(t,e){return t===e&&(t!==0||1/t===1/e)||t!==t&&e!==e}var Gn=typeof Object.is=="function"?Object.is:E_;function Ea(t,e){if(Gn(t,e))return!0;if(typeof t!="object"||t===null||typeof e!="object"||e===null)return!1;var n=Object.keys(t),i=Object.keys(e);if(n.length!==i.length)return!1;for(i=0;i<n.length;i++){var r=n[i];if(!cu.call(e,r)||!Gn(t[r],e[r]))return!1}return!0}function Bf(t){for(;t&&t.firstChild;)t=t.firstChild;return t}function Hf(t,e){var n=Bf(t);t=0;for(var i;n;){if(n.nodeType===3){if(i=t+n.textContent.length,t<=e&&i>=e)return{node:n,offset:e-t};t=i}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=Bf(n)}}function I0(t,e){return t&&e?t===e?!0:t&&t.nodeType===3?!1:e&&e.nodeType===3?I0(t,e.parentNode):"contains"in t?t.contains(e):t.compareDocumentPosition?!!(t.compareDocumentPosition(e)&16):!1:!1}function U0(){for(var t=window,e=nl();e instanceof t.HTMLIFrameElement;){try{var n=typeof e.contentWindow.location.href=="string"}catch{n=!1}if(n)t=e.contentWindow;else break;e=nl(t.document)}return e}function mh(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e&&(e==="input"&&(t.type==="text"||t.type==="search"||t.type==="tel"||t.type==="url"||t.type==="password")||e==="textarea"||t.contentEditable==="true")}function T_(t){var e=U0(),n=t.focusedElem,i=t.selectionRange;if(e!==n&&n&&n.ownerDocument&&I0(n.ownerDocument.documentElement,n)){if(i!==null&&mh(n)){if(e=i.start,t=i.end,t===void 0&&(t=e),"selectionStart"in n)n.selectionStart=e,n.selectionEnd=Math.min(t,n.value.length);else if(t=(e=n.ownerDocument||document)&&e.defaultView||window,t.getSelection){t=t.getSelection();var r=n.textContent.length,s=Math.min(i.start,r);i=i.end===void 0?s:Math.min(i.end,r),!t.extend&&s>i&&(r=i,i=s,s=r),r=Hf(n,s);var a=Hf(n,i);r&&a&&(t.rangeCount!==1||t.anchorNode!==r.node||t.anchorOffset!==r.offset||t.focusNode!==a.node||t.focusOffset!==a.offset)&&(e=e.createRange(),e.setStart(r.node,r.offset),t.removeAllRanges(),s>i?(t.addRange(e),t.extend(a.node,a.offset)):(e.setEnd(a.node,a.offset),t.addRange(e)))}}for(e=[],t=n;t=t.parentNode;)t.nodeType===1&&e.push({element:t,left:t.scrollLeft,top:t.scrollTop});for(typeof n.focus=="function"&&n.focus(),n=0;n<e.length;n++)t=e[n],t.element.scrollLeft=t.left,t.element.scrollTop=t.top}}var A_=pi&&"documentMode"in document&&11>=document.documentMode,Zr=null,Cu=null,ha=null,Nu=!1;function Vf(t,e,n){var i=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;Nu||Zr==null||Zr!==nl(i)||(i=Zr,"selectionStart"in i&&mh(i)?i={start:i.selectionStart,end:i.selectionEnd}:(i=(i.ownerDocument&&i.ownerDocument.defaultView||window).getSelection(),i={anchorNode:i.anchorNode,anchorOffset:i.anchorOffset,focusNode:i.focusNode,focusOffset:i.focusOffset}),ha&&Ea(ha,i)||(ha=i,i=cl(Cu,"onSelect"),0<i.length&&(e=new hh("onSelect","select",null,e,n),t.push({event:e,listeners:i}),e.target=Zr)))}function ro(t,e){var n={};return n[t.toLowerCase()]=e.toLowerCase(),n["Webkit"+t]="webkit"+e,n["Moz"+t]="moz"+e,n}var Qr={animationend:ro("Animation","AnimationEnd"),animationiteration:ro("Animation","AnimationIteration"),animationstart:ro("Animation","AnimationStart"),transitionend:ro("Transition","TransitionEnd")},pc={},F0={};pi&&(F0=document.createElement("div").style,"AnimationEvent"in window||(delete Qr.animationend.animation,delete Qr.animationiteration.animation,delete Qr.animationstart.animation),"TransitionEvent"in window||delete Qr.transitionend.transition);function Il(t){if(pc[t])return pc[t];if(!Qr[t])return t;var e=Qr[t],n;for(n in e)if(e.hasOwnProperty(n)&&n in F0)return pc[t]=e[n];return t}var O0=Il("animationend"),z0=Il("animationiteration"),j0=Il("animationstart"),B0=Il("transitionend"),H0=new Map,Gf="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function Qi(t,e){H0.set(t,e),Rr(e,[t])}for(var mc=0;mc<Gf.length;mc++){var xc=Gf[mc],C_=xc.toLowerCase(),N_=xc[0].toUpperCase()+xc.slice(1);Qi(C_,"on"+N_)}Qi(O0,"onAnimationEnd");Qi(z0,"onAnimationIteration");Qi(j0,"onAnimationStart");Qi("dblclick","onDoubleClick");Qi("focusin","onFocus");Qi("focusout","onBlur");Qi(B0,"onTransitionEnd");gs("onMouseEnter",["mouseout","mouseover"]);gs("onMouseLeave",["mouseout","mouseover"]);gs("onPointerEnter",["pointerout","pointerover"]);gs("onPointerLeave",["pointerout","pointerover"]);Rr("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));Rr("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));Rr("onBeforeInput",["compositionend","keypress","textInput","paste"]);Rr("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));Rr("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));Rr("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var sa="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),R_=new Set("cancel close invalid load scroll toggle".split(" ").concat(sa));function Wf(t,e,n){var i=t.type||"unknown-event";t.currentTarget=n,Cv(i,e,void 0,t),t.currentTarget=null}function V0(t,e){e=(e&4)!==0;for(var n=0;n<t.length;n++){var i=t[n],r=i.event;i=i.listeners;e:{var s=void 0;if(e)for(var a=i.length-1;0<=a;a--){var o=i[a],c=o.instance,u=o.currentTarget;if(o=o.listener,c!==s&&r.isPropagationStopped())break e;Wf(r,o,u),s=c}else for(a=0;a<i.length;a++){if(o=i[a],c=o.instance,u=o.currentTarget,o=o.listener,c!==s&&r.isPropagationStopped())break e;Wf(r,o,u),s=c}}}if(rl)throw t=bu,rl=!1,bu=null,t}function lt(t,e){var n=e[ku];n===void 0&&(n=e[ku]=new Set);var i=t+"__bubble";n.has(i)||(G0(e,t,2,!1),n.add(i))}function gc(t,e,n){var i=0;e&&(i|=4),G0(n,t,i,e)}var so="_reactListening"+Math.random().toString(36).slice(2);function Ta(t){if(!t[so]){t[so]=!0,Zm.forEach(function(n){n!=="selectionchange"&&(R_.has(n)||gc(n,!1,t),gc(n,!0,t))});var e=t.nodeType===9?t:t.ownerDocument;e===null||e[so]||(e[so]=!0,gc("selectionchange",!1,e))}}function G0(t,e,n,i){switch(A0(e)){case 1:var r=Gv;break;case 4:r=Wv;break;default:r=uh}n=r.bind(null,e,n,t),r=void 0,!Mu||e!=="touchstart"&&e!=="touchmove"&&e!=="wheel"||(r=!0),i?r!==void 0?t.addEventListener(e,n,{capture:!0,passive:r}):t.addEventListener(e,n,!0):r!==void 0?t.addEventListener(e,n,{passive:r}):t.addEventListener(e,n,!1)}function vc(t,e,n,i,r){var s=i;if(!(e&1)&&!(e&2)&&i!==null)e:for(;;){if(i===null)return;var a=i.tag;if(a===3||a===4){var o=i.stateNode.containerInfo;if(o===r||o.nodeType===8&&o.parentNode===r)break;if(a===4)for(a=i.return;a!==null;){var c=a.tag;if((c===3||c===4)&&(c=a.stateNode.containerInfo,c===r||c.nodeType===8&&c.parentNode===r))return;a=a.return}for(;o!==null;){if(a=xr(o),a===null)return;if(c=a.tag,c===5||c===6){i=s=a;continue e}o=o.parentNode}}i=i.return}f0(function(){var u=s,f=ah(n),p=[];e:{var h=H0.get(t);if(h!==void 0){var x=hh,_=t;switch(t){case"keypress":if(Bo(n)===0)break e;case"keydown":case"keyup":x=a_;break;case"focusin":_="focus",x=dc;break;case"focusout":_="blur",x=dc;break;case"beforeblur":case"afterblur":x=dc;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":x=Df;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":x=$v;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":x=c_;break;case O0:case z0:case j0:x=Zv;break;case B0:x=d_;break;case"scroll":x=Xv;break;case"wheel":x=f_;break;case"copy":case"cut":case"paste":x=Jv;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":x=If}var S=(e&4)!==0,m=!S&&t==="scroll",d=S?h!==null?h+"Capture":null:h;S=[];for(var g=u,v;g!==null;){v=g;var w=v.stateNode;if(v.tag===5&&w!==null&&(v=w,d!==null&&(w=ya(g,d),w!=null&&S.push(Aa(g,w,v)))),m)break;g=g.return}0<S.length&&(h=new x(h,_,null,n,f),p.push({event:h,listeners:S}))}}if(!(e&7)){e:{if(h=t==="mouseover"||t==="pointerover",x=t==="mouseout"||t==="pointerout",h&&n!==Su&&(_=n.relatedTarget||n.fromElement)&&(xr(_)||_[mi]))break e;if((x||h)&&(h=f.window===f?f:(h=f.ownerDocument)?h.defaultView||h.parentWindow:window,x?(_=n.relatedTarget||n.toElement,x=u,_=_?xr(_):null,_!==null&&(m=Pr(_),_!==m||_.tag!==5&&_.tag!==6)&&(_=null)):(x=null,_=u),x!==_)){if(S=Df,w="onMouseLeave",d="onMouseEnter",g="mouse",(t==="pointerout"||t==="pointerover")&&(S=If,w="onPointerLeave",d="onPointerEnter",g="pointer"),m=x==null?h:Jr(x),v=_==null?h:Jr(_),h=new S(w,g+"leave",x,n,f),h.target=m,h.relatedTarget=v,w=null,xr(f)===u&&(S=new S(d,g+"enter",_,n,f),S.target=v,S.relatedTarget=m,w=S),m=w,x&&_)t:{for(S=x,d=_,g=0,v=S;v;v=Dr(v))g++;for(v=0,w=d;w;w=Dr(w))v++;for(;0<g-v;)S=Dr(S),g--;for(;0<v-g;)d=Dr(d),v--;for(;g--;){if(S===d||d!==null&&S===d.alternate)break t;S=Dr(S),d=Dr(d)}S=null}else S=null;x!==null&&Xf(p,h,x,S,!1),_!==null&&m!==null&&Xf(p,m,_,S,!0)}}e:{if(h=u?Jr(u):window,x=h.nodeName&&h.nodeName.toLowerCase(),x==="select"||x==="input"&&h.type==="file")var R=y_;else if(Of(h))if(D0)R=b_;else{R=w_;var E=S_}else(x=h.nodeName)&&x.toLowerCase()==="input"&&(h.type==="checkbox"||h.type==="radio")&&(R=M_);if(R&&(R=R(t,u))){L0(p,R,n,f);break e}E&&E(t,h,u),t==="focusout"&&(E=h._wrapperState)&&E.controlled&&h.type==="number"&&xu(h,"number",h.value)}switch(E=u?Jr(u):window,t){case"focusin":(Of(E)||E.contentEditable==="true")&&(Zr=E,Cu=u,ha=null);break;case"focusout":ha=Cu=Zr=null;break;case"mousedown":Nu=!0;break;case"contextmenu":case"mouseup":case"dragend":Nu=!1,Vf(p,n,f);break;case"selectionchange":if(A_)break;case"keydown":case"keyup":Vf(p,n,f)}var A;if(ph)e:{switch(t){case"compositionstart":var N="onCompositionStart";break e;case"compositionend":N="onCompositionEnd";break e;case"compositionupdate":N="onCompositionUpdate";break e}N=void 0}else Kr?R0(t,n)&&(N="onCompositionEnd"):t==="keydown"&&n.keyCode===229&&(N="onCompositionStart");N&&(N0&&n.locale!=="ko"&&(Kr||N!=="onCompositionStart"?N==="onCompositionEnd"&&Kr&&(A=C0()):(Ui=f,dh="value"in Ui?Ui.value:Ui.textContent,Kr=!0)),E=cl(u,N),0<E.length&&(N=new kf(N,t,null,n,f),p.push({event:N,listeners:E}),A?N.data=A:(A=P0(n),A!==null&&(N.data=A)))),(A=m_?x_(t,n):g_(t,n))&&(u=cl(u,"onBeforeInput"),0<u.length&&(f=new kf("onBeforeInput","beforeinput",null,n,f),p.push({event:f,listeners:u}),f.data=A))}V0(p,e)})}function Aa(t,e,n){return{instance:t,listener:e,currentTarget:n}}function cl(t,e){for(var n=e+"Capture",i=[];t!==null;){var r=t,s=r.stateNode;r.tag===5&&s!==null&&(r=s,s=ya(t,n),s!=null&&i.unshift(Aa(t,s,r)),s=ya(t,e),s!=null&&i.push(Aa(t,s,r))),t=t.return}return i}function Dr(t){if(t===null)return null;do t=t.return;while(t&&t.tag!==5);return t||null}function Xf(t,e,n,i,r){for(var s=e._reactName,a=[];n!==null&&n!==i;){var o=n,c=o.alternate,u=o.stateNode;if(c!==null&&c===i)break;o.tag===5&&u!==null&&(o=u,r?(c=ya(n,s),c!=null&&a.unshift(Aa(n,c,o))):r||(c=ya(n,s),c!=null&&a.push(Aa(n,c,o)))),n=n.return}a.length!==0&&t.push({event:e,listeners:a})}var P_=/\r\n?/g,L_=/\u0000|\uFFFD/g;function qf(t){return(typeof t=="string"?t:""+t).replace(P_,`
`).replace(L_,"")}function ao(t,e,n){if(e=qf(e),qf(t)!==e&&n)throw Error(ae(425))}function ul(){}var Ru=null,Pu=null;function Lu(t,e){return t==="textarea"||t==="noscript"||typeof e.children=="string"||typeof e.children=="number"||typeof e.dangerouslySetInnerHTML=="object"&&e.dangerouslySetInnerHTML!==null&&e.dangerouslySetInnerHTML.__html!=null}var Du=typeof setTimeout=="function"?setTimeout:void 0,D_=typeof clearTimeout=="function"?clearTimeout:void 0,$f=typeof Promise=="function"?Promise:void 0,k_=typeof queueMicrotask=="function"?queueMicrotask:typeof $f<"u"?function(t){return $f.resolve(null).then(t).catch(I_)}:Du;function I_(t){setTimeout(function(){throw t})}function _c(t,e){var n=e,i=0;do{var r=n.nextSibling;if(t.removeChild(n),r&&r.nodeType===8)if(n=r.data,n==="/$"){if(i===0){t.removeChild(r),Ma(e);return}i--}else n!=="$"&&n!=="$?"&&n!=="$!"||i++;n=r}while(n);Ma(e)}function Bi(t){for(;t!=null;t=t.nextSibling){var e=t.nodeType;if(e===1||e===3)break;if(e===8){if(e=t.data,e==="$"||e==="$!"||e==="$?")break;if(e==="/$")return null}}return t}function Yf(t){t=t.previousSibling;for(var e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="$"||n==="$!"||n==="$?"){if(e===0)return t;e--}else n==="/$"&&e++}t=t.previousSibling}return null}var Fs=Math.random().toString(36).slice(2),Yn="__reactFiber$"+Fs,Ca="__reactProps$"+Fs,mi="__reactContainer$"+Fs,ku="__reactEvents$"+Fs,U_="__reactListeners$"+Fs,F_="__reactHandles$"+Fs;function xr(t){var e=t[Yn];if(e)return e;for(var n=t.parentNode;n;){if(e=n[mi]||n[Yn]){if(n=e.alternate,e.child!==null||n!==null&&n.child!==null)for(t=Yf(t);t!==null;){if(n=t[Yn])return n;t=Yf(t)}return e}t=n,n=t.parentNode}return null}function Ba(t){return t=t[Yn]||t[mi],!t||t.tag!==5&&t.tag!==6&&t.tag!==13&&t.tag!==3?null:t}function Jr(t){if(t.tag===5||t.tag===6)return t.stateNode;throw Error(ae(33))}function Ul(t){return t[Ca]||null}var Iu=[],es=-1;function Ji(t){return{current:t}}function ut(t){0>es||(t.current=Iu[es],Iu[es]=null,es--)}function at(t,e){es++,Iu[es]=t.current,t.current=e}var Yi={},Ht=Ji(Yi),sn=Ji(!1),Mr=Yi;function vs(t,e){var n=t.type.contextTypes;if(!n)return Yi;var i=t.stateNode;if(i&&i.__reactInternalMemoizedUnmaskedChildContext===e)return i.__reactInternalMemoizedMaskedChildContext;var r={},s;for(s in n)r[s]=e[s];return i&&(t=t.stateNode,t.__reactInternalMemoizedUnmaskedChildContext=e,t.__reactInternalMemoizedMaskedChildContext=r),r}function an(t){return t=t.childContextTypes,t!=null}function dl(){ut(sn),ut(Ht)}function Kf(t,e,n){if(Ht.current!==Yi)throw Error(ae(168));at(Ht,e),at(sn,n)}function W0(t,e,n){var i=t.stateNode;if(e=e.childContextTypes,typeof i.getChildContext!="function")return n;i=i.getChildContext();for(var r in i)if(!(r in e))throw Error(ae(108,Sv(t)||"Unknown",r));return xt({},n,i)}function hl(t){return t=(t=t.stateNode)&&t.__reactInternalMemoizedMergedChildContext||Yi,Mr=Ht.current,at(Ht,t),at(sn,sn.current),!0}function Zf(t,e,n){var i=t.stateNode;if(!i)throw Error(ae(169));n?(t=W0(t,e,Mr),i.__reactInternalMemoizedMergedChildContext=t,ut(sn),ut(Ht),at(Ht,t)):ut(sn),at(sn,n)}var oi=null,Fl=!1,yc=!1;function X0(t){oi===null?oi=[t]:oi.push(t)}function O_(t){Fl=!0,X0(t)}function er(){if(!yc&&oi!==null){yc=!0;var t=0,e=it;try{var n=oi;for(it=1;t<n.length;t++){var i=n[t];do i=i(!0);while(i!==null)}oi=null,Fl=!1}catch(r){throw oi!==null&&(oi=oi.slice(t+1)),g0(oh,er),r}finally{it=e,yc=!1}}return null}var ts=[],ns=0,fl=null,pl=0,Sn=[],wn=0,br=null,li=1,ci="";function ur(t,e){ts[ns++]=pl,ts[ns++]=fl,fl=t,pl=e}function q0(t,e,n){Sn[wn++]=li,Sn[wn++]=ci,Sn[wn++]=br,br=t;var i=li;t=ci;var r=32-Hn(i)-1;i&=~(1<<r),n+=1;var s=32-Hn(e)+r;if(30<s){var a=r-r%5;s=(i&(1<<a)-1).toString(32),i>>=a,r-=a,li=1<<32-Hn(e)+r|n<<r|i,ci=s+t}else li=1<<s|n<<r|i,ci=t}function xh(t){t.return!==null&&(ur(t,1),q0(t,1,0))}function gh(t){for(;t===fl;)fl=ts[--ns],ts[ns]=null,pl=ts[--ns],ts[ns]=null;for(;t===br;)br=Sn[--wn],Sn[wn]=null,ci=Sn[--wn],Sn[wn]=null,li=Sn[--wn],Sn[wn]=null}var mn=null,pn=null,ht=!1,On=null;function $0(t,e){var n=bn(5,null,null,0);n.elementType="DELETED",n.stateNode=e,n.return=t,e=t.deletions,e===null?(t.deletions=[n],t.flags|=16):e.push(n)}function Qf(t,e){switch(t.tag){case 5:var n=t.type;return e=e.nodeType!==1||n.toLowerCase()!==e.nodeName.toLowerCase()?null:e,e!==null?(t.stateNode=e,mn=t,pn=Bi(e.firstChild),!0):!1;case 6:return e=t.pendingProps===""||e.nodeType!==3?null:e,e!==null?(t.stateNode=e,mn=t,pn=null,!0):!1;case 13:return e=e.nodeType!==8?null:e,e!==null?(n=br!==null?{id:li,overflow:ci}:null,t.memoizedState={dehydrated:e,treeContext:n,retryLane:1073741824},n=bn(18,null,null,0),n.stateNode=e,n.return=t,t.child=n,mn=t,pn=null,!0):!1;default:return!1}}function Uu(t){return(t.mode&1)!==0&&(t.flags&128)===0}function Fu(t){if(ht){var e=pn;if(e){var n=e;if(!Qf(t,e)){if(Uu(t))throw Error(ae(418));e=Bi(n.nextSibling);var i=mn;e&&Qf(t,e)?$0(i,n):(t.flags=t.flags&-4097|2,ht=!1,mn=t)}}else{if(Uu(t))throw Error(ae(418));t.flags=t.flags&-4097|2,ht=!1,mn=t}}}function Jf(t){for(t=t.return;t!==null&&t.tag!==5&&t.tag!==3&&t.tag!==13;)t=t.return;mn=t}function oo(t){if(t!==mn)return!1;if(!ht)return Jf(t),ht=!0,!1;var e;if((e=t.tag!==3)&&!(e=t.tag!==5)&&(e=t.type,e=e!=="head"&&e!=="body"&&!Lu(t.type,t.memoizedProps)),e&&(e=pn)){if(Uu(t))throw Y0(),Error(ae(418));for(;e;)$0(t,e),e=Bi(e.nextSibling)}if(Jf(t),t.tag===13){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(ae(317));e:{for(t=t.nextSibling,e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="/$"){if(e===0){pn=Bi(t.nextSibling);break e}e--}else n!=="$"&&n!=="$!"&&n!=="$?"||e++}t=t.nextSibling}pn=null}}else pn=mn?Bi(t.stateNode.nextSibling):null;return!0}function Y0(){for(var t=pn;t;)t=Bi(t.nextSibling)}function _s(){pn=mn=null,ht=!1}function vh(t){On===null?On=[t]:On.push(t)}var z_=yi.ReactCurrentBatchConfig;function Xs(t,e,n){if(t=n.ref,t!==null&&typeof t!="function"&&typeof t!="object"){if(n._owner){if(n=n._owner,n){if(n.tag!==1)throw Error(ae(309));var i=n.stateNode}if(!i)throw Error(ae(147,t));var r=i,s=""+t;return e!==null&&e.ref!==null&&typeof e.ref=="function"&&e.ref._stringRef===s?e.ref:(e=function(a){var o=r.refs;a===null?delete o[s]:o[s]=a},e._stringRef=s,e)}if(typeof t!="string")throw Error(ae(284));if(!n._owner)throw Error(ae(290,t))}return t}function lo(t,e){throw t=Object.prototype.toString.call(e),Error(ae(31,t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t))}function ep(t){var e=t._init;return e(t._payload)}function K0(t){function e(d,g){if(t){var v=d.deletions;v===null?(d.deletions=[g],d.flags|=16):v.push(g)}}function n(d,g){if(!t)return null;for(;g!==null;)e(d,g),g=g.sibling;return null}function i(d,g){for(d=new Map;g!==null;)g.key!==null?d.set(g.key,g):d.set(g.index,g),g=g.sibling;return d}function r(d,g){return d=Wi(d,g),d.index=0,d.sibling=null,d}function s(d,g,v){return d.index=v,t?(v=d.alternate,v!==null?(v=v.index,v<g?(d.flags|=2,g):v):(d.flags|=2,g)):(d.flags|=1048576,g)}function a(d){return t&&d.alternate===null&&(d.flags|=2),d}function o(d,g,v,w){return g===null||g.tag!==6?(g=Ac(v,d.mode,w),g.return=d,g):(g=r(g,v),g.return=d,g)}function c(d,g,v,w){var R=v.type;return R===Yr?f(d,g,v.props.children,w,v.key):g!==null&&(g.elementType===R||typeof R=="object"&&R!==null&&R.$$typeof===Ri&&ep(R)===g.type)?(w=r(g,v.props),w.ref=Xs(d,g,v),w.return=d,w):(w=$o(v.type,v.key,v.props,null,d.mode,w),w.ref=Xs(d,g,v),w.return=d,w)}function u(d,g,v,w){return g===null||g.tag!==4||g.stateNode.containerInfo!==v.containerInfo||g.stateNode.implementation!==v.implementation?(g=Cc(v,d.mode,w),g.return=d,g):(g=r(g,v.children||[]),g.return=d,g)}function f(d,g,v,w,R){return g===null||g.tag!==7?(g=wr(v,d.mode,w,R),g.return=d,g):(g=r(g,v),g.return=d,g)}function p(d,g,v){if(typeof g=="string"&&g!==""||typeof g=="number")return g=Ac(""+g,d.mode,v),g.return=d,g;if(typeof g=="object"&&g!==null){switch(g.$$typeof){case Za:return v=$o(g.type,g.key,g.props,null,d.mode,v),v.ref=Xs(d,null,g),v.return=d,v;case $r:return g=Cc(g,d.mode,v),g.return=d,g;case Ri:var w=g._init;return p(d,w(g._payload),v)}if(ia(g)||Bs(g))return g=wr(g,d.mode,v,null),g.return=d,g;lo(d,g)}return null}function h(d,g,v,w){var R=g!==null?g.key:null;if(typeof v=="string"&&v!==""||typeof v=="number")return R!==null?null:o(d,g,""+v,w);if(typeof v=="object"&&v!==null){switch(v.$$typeof){case Za:return v.key===R?c(d,g,v,w):null;case $r:return v.key===R?u(d,g,v,w):null;case Ri:return R=v._init,h(d,g,R(v._payload),w)}if(ia(v)||Bs(v))return R!==null?null:f(d,g,v,w,null);lo(d,v)}return null}function x(d,g,v,w,R){if(typeof w=="string"&&w!==""||typeof w=="number")return d=d.get(v)||null,o(g,d,""+w,R);if(typeof w=="object"&&w!==null){switch(w.$$typeof){case Za:return d=d.get(w.key===null?v:w.key)||null,c(g,d,w,R);case $r:return d=d.get(w.key===null?v:w.key)||null,u(g,d,w,R);case Ri:var E=w._init;return x(d,g,v,E(w._payload),R)}if(ia(w)||Bs(w))return d=d.get(v)||null,f(g,d,w,R,null);lo(g,w)}return null}function _(d,g,v,w){for(var R=null,E=null,A=g,N=g=0,F=null;A!==null&&N<v.length;N++){A.index>N?(F=A,A=null):F=A.sibling;var y=h(d,A,v[N],w);if(y===null){A===null&&(A=F);break}t&&A&&y.alternate===null&&e(d,A),g=s(y,g,N),E===null?R=y:E.sibling=y,E=y,A=F}if(N===v.length)return n(d,A),ht&&ur(d,N),R;if(A===null){for(;N<v.length;N++)A=p(d,v[N],w),A!==null&&(g=s(A,g,N),E===null?R=A:E.sibling=A,E=A);return ht&&ur(d,N),R}for(A=i(d,A);N<v.length;N++)F=x(A,d,N,v[N],w),F!==null&&(t&&F.alternate!==null&&A.delete(F.key===null?N:F.key),g=s(F,g,N),E===null?R=F:E.sibling=F,E=F);return t&&A.forEach(function(b){return e(d,b)}),ht&&ur(d,N),R}function S(d,g,v,w){var R=Bs(v);if(typeof R!="function")throw Error(ae(150));if(v=R.call(v),v==null)throw Error(ae(151));for(var E=R=null,A=g,N=g=0,F=null,y=v.next();A!==null&&!y.done;N++,y=v.next()){A.index>N?(F=A,A=null):F=A.sibling;var b=h(d,A,y.value,w);if(b===null){A===null&&(A=F);break}t&&A&&b.alternate===null&&e(d,A),g=s(b,g,N),E===null?R=b:E.sibling=b,E=b,A=F}if(y.done)return n(d,A),ht&&ur(d,N),R;if(A===null){for(;!y.done;N++,y=v.next())y=p(d,y.value,w),y!==null&&(g=s(y,g,N),E===null?R=y:E.sibling=y,E=y);return ht&&ur(d,N),R}for(A=i(d,A);!y.done;N++,y=v.next())y=x(A,d,N,y.value,w),y!==null&&(t&&y.alternate!==null&&A.delete(y.key===null?N:y.key),g=s(y,g,N),E===null?R=y:E.sibling=y,E=y);return t&&A.forEach(function(O){return e(d,O)}),ht&&ur(d,N),R}function m(d,g,v,w){if(typeof v=="object"&&v!==null&&v.type===Yr&&v.key===null&&(v=v.props.children),typeof v=="object"&&v!==null){switch(v.$$typeof){case Za:e:{for(var R=v.key,E=g;E!==null;){if(E.key===R){if(R=v.type,R===Yr){if(E.tag===7){n(d,E.sibling),g=r(E,v.props.children),g.return=d,d=g;break e}}else if(E.elementType===R||typeof R=="object"&&R!==null&&R.$$typeof===Ri&&ep(R)===E.type){n(d,E.sibling),g=r(E,v.props),g.ref=Xs(d,E,v),g.return=d,d=g;break e}n(d,E);break}else e(d,E);E=E.sibling}v.type===Yr?(g=wr(v.props.children,d.mode,w,v.key),g.return=d,d=g):(w=$o(v.type,v.key,v.props,null,d.mode,w),w.ref=Xs(d,g,v),w.return=d,d=w)}return a(d);case $r:e:{for(E=v.key;g!==null;){if(g.key===E)if(g.tag===4&&g.stateNode.containerInfo===v.containerInfo&&g.stateNode.implementation===v.implementation){n(d,g.sibling),g=r(g,v.children||[]),g.return=d,d=g;break e}else{n(d,g);break}else e(d,g);g=g.sibling}g=Cc(v,d.mode,w),g.return=d,d=g}return a(d);case Ri:return E=v._init,m(d,g,E(v._payload),w)}if(ia(v))return _(d,g,v,w);if(Bs(v))return S(d,g,v,w);lo(d,v)}return typeof v=="string"&&v!==""||typeof v=="number"?(v=""+v,g!==null&&g.tag===6?(n(d,g.sibling),g=r(g,v),g.return=d,d=g):(n(d,g),g=Ac(v,d.mode,w),g.return=d,d=g),a(d)):n(d,g)}return m}var ys=K0(!0),Z0=K0(!1),ml=Ji(null),xl=null,is=null,_h=null;function yh(){_h=is=xl=null}function Sh(t){var e=ml.current;ut(ml),t._currentValue=e}function Ou(t,e,n){for(;t!==null;){var i=t.alternate;if((t.childLanes&e)!==e?(t.childLanes|=e,i!==null&&(i.childLanes|=e)):i!==null&&(i.childLanes&e)!==e&&(i.childLanes|=e),t===n)break;t=t.return}}function ds(t,e){xl=t,_h=is=null,t=t.dependencies,t!==null&&t.firstContext!==null&&(t.lanes&e&&(rn=!0),t.firstContext=null)}function Cn(t){var e=t._currentValue;if(_h!==t)if(t={context:t,memoizedValue:e,next:null},is===null){if(xl===null)throw Error(ae(308));is=t,xl.dependencies={lanes:0,firstContext:t}}else is=is.next=t;return e}var gr=null;function wh(t){gr===null?gr=[t]:gr.push(t)}function Q0(t,e,n,i){var r=e.interleaved;return r===null?(n.next=n,wh(e)):(n.next=r.next,r.next=n),e.interleaved=n,xi(t,i)}function xi(t,e){t.lanes|=e;var n=t.alternate;for(n!==null&&(n.lanes|=e),n=t,t=t.return;t!==null;)t.childLanes|=e,n=t.alternate,n!==null&&(n.childLanes|=e),n=t,t=t.return;return n.tag===3?n.stateNode:null}var Pi=!1;function Mh(t){t.updateQueue={baseState:t.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function J0(t,e){t=t.updateQueue,e.updateQueue===t&&(e.updateQueue={baseState:t.baseState,firstBaseUpdate:t.firstBaseUpdate,lastBaseUpdate:t.lastBaseUpdate,shared:t.shared,effects:t.effects})}function fi(t,e){return{eventTime:t,lane:e,tag:0,payload:null,callback:null,next:null}}function Hi(t,e,n){var i=t.updateQueue;if(i===null)return null;if(i=i.shared,Ke&2){var r=i.pending;return r===null?e.next=e:(e.next=r.next,r.next=e),i.pending=e,xi(t,n)}return r=i.interleaved,r===null?(e.next=e,wh(i)):(e.next=r.next,r.next=e),i.interleaved=e,xi(t,n)}function Ho(t,e,n){if(e=e.updateQueue,e!==null&&(e=e.shared,(n&4194240)!==0)){var i=e.lanes;i&=t.pendingLanes,n|=i,e.lanes=n,lh(t,n)}}function tp(t,e){var n=t.updateQueue,i=t.alternate;if(i!==null&&(i=i.updateQueue,n===i)){var r=null,s=null;if(n=n.firstBaseUpdate,n!==null){do{var a={eventTime:n.eventTime,lane:n.lane,tag:n.tag,payload:n.payload,callback:n.callback,next:null};s===null?r=s=a:s=s.next=a,n=n.next}while(n!==null);s===null?r=s=e:s=s.next=e}else r=s=e;n={baseState:i.baseState,firstBaseUpdate:r,lastBaseUpdate:s,shared:i.shared,effects:i.effects},t.updateQueue=n;return}t=n.lastBaseUpdate,t===null?n.firstBaseUpdate=e:t.next=e,n.lastBaseUpdate=e}function gl(t,e,n,i){var r=t.updateQueue;Pi=!1;var s=r.firstBaseUpdate,a=r.lastBaseUpdate,o=r.shared.pending;if(o!==null){r.shared.pending=null;var c=o,u=c.next;c.next=null,a===null?s=u:a.next=u,a=c;var f=t.alternate;f!==null&&(f=f.updateQueue,o=f.lastBaseUpdate,o!==a&&(o===null?f.firstBaseUpdate=u:o.next=u,f.lastBaseUpdate=c))}if(s!==null){var p=r.baseState;a=0,f=u=c=null,o=s;do{var h=o.lane,x=o.eventTime;if((i&h)===h){f!==null&&(f=f.next={eventTime:x,lane:0,tag:o.tag,payload:o.payload,callback:o.callback,next:null});e:{var _=t,S=o;switch(h=e,x=n,S.tag){case 1:if(_=S.payload,typeof _=="function"){p=_.call(x,p,h);break e}p=_;break e;case 3:_.flags=_.flags&-65537|128;case 0:if(_=S.payload,h=typeof _=="function"?_.call(x,p,h):_,h==null)break e;p=xt({},p,h);break e;case 2:Pi=!0}}o.callback!==null&&o.lane!==0&&(t.flags|=64,h=r.effects,h===null?r.effects=[o]:h.push(o))}else x={eventTime:x,lane:h,tag:o.tag,payload:o.payload,callback:o.callback,next:null},f===null?(u=f=x,c=p):f=f.next=x,a|=h;if(o=o.next,o===null){if(o=r.shared.pending,o===null)break;h=o,o=h.next,h.next=null,r.lastBaseUpdate=h,r.shared.pending=null}}while(!0);if(f===null&&(c=p),r.baseState=c,r.firstBaseUpdate=u,r.lastBaseUpdate=f,e=r.shared.interleaved,e!==null){r=e;do a|=r.lane,r=r.next;while(r!==e)}else s===null&&(r.shared.lanes=0);Tr|=a,t.lanes=a,t.memoizedState=p}}function np(t,e,n){if(t=e.effects,e.effects=null,t!==null)for(e=0;e<t.length;e++){var i=t[e],r=i.callback;if(r!==null){if(i.callback=null,i=n,typeof r!="function")throw Error(ae(191,r));r.call(i)}}}var Ha={},Zn=Ji(Ha),Na=Ji(Ha),Ra=Ji(Ha);function vr(t){if(t===Ha)throw Error(ae(174));return t}function bh(t,e){switch(at(Ra,e),at(Na,t),at(Zn,Ha),t=e.nodeType,t){case 9:case 11:e=(e=e.documentElement)?e.namespaceURI:vu(null,"");break;default:t=t===8?e.parentNode:e,e=t.namespaceURI||null,t=t.tagName,e=vu(e,t)}ut(Zn),at(Zn,e)}function Ss(){ut(Zn),ut(Na),ut(Ra)}function ex(t){vr(Ra.current);var e=vr(Zn.current),n=vu(e,t.type);e!==n&&(at(Na,t),at(Zn,n))}function Eh(t){Na.current===t&&(ut(Zn),ut(Na))}var pt=Ji(0);function vl(t){for(var e=t;e!==null;){if(e.tag===13){var n=e.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||n.data==="$?"||n.data==="$!"))return e}else if(e.tag===19&&e.memoizedProps.revealOrder!==void 0){if(e.flags&128)return e}else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return null;e=e.return}e.sibling.return=e.return,e=e.sibling}return null}var Sc=[];function Th(){for(var t=0;t<Sc.length;t++)Sc[t]._workInProgressVersionPrimary=null;Sc.length=0}var Vo=yi.ReactCurrentDispatcher,wc=yi.ReactCurrentBatchConfig,Er=0,mt=null,bt=null,Nt=null,_l=!1,fa=!1,Pa=0,j_=0;function It(){throw Error(ae(321))}function Ah(t,e){if(e===null)return!1;for(var n=0;n<e.length&&n<t.length;n++)if(!Gn(t[n],e[n]))return!1;return!0}function Ch(t,e,n,i,r,s){if(Er=s,mt=e,e.memoizedState=null,e.updateQueue=null,e.lanes=0,Vo.current=t===null||t.memoizedState===null?G_:W_,t=n(i,r),fa){s=0;do{if(fa=!1,Pa=0,25<=s)throw Error(ae(301));s+=1,Nt=bt=null,e.updateQueue=null,Vo.current=X_,t=n(i,r)}while(fa)}if(Vo.current=yl,e=bt!==null&&bt.next!==null,Er=0,Nt=bt=mt=null,_l=!1,e)throw Error(ae(300));return t}function Nh(){var t=Pa!==0;return Pa=0,t}function Xn(){var t={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Nt===null?mt.memoizedState=Nt=t:Nt=Nt.next=t,Nt}function Nn(){if(bt===null){var t=mt.alternate;t=t!==null?t.memoizedState:null}else t=bt.next;var e=Nt===null?mt.memoizedState:Nt.next;if(e!==null)Nt=e,bt=t;else{if(t===null)throw Error(ae(310));bt=t,t={memoizedState:bt.memoizedState,baseState:bt.baseState,baseQueue:bt.baseQueue,queue:bt.queue,next:null},Nt===null?mt.memoizedState=Nt=t:Nt=Nt.next=t}return Nt}function La(t,e){return typeof e=="function"?e(t):e}function Mc(t){var e=Nn(),n=e.queue;if(n===null)throw Error(ae(311));n.lastRenderedReducer=t;var i=bt,r=i.baseQueue,s=n.pending;if(s!==null){if(r!==null){var a=r.next;r.next=s.next,s.next=a}i.baseQueue=r=s,n.pending=null}if(r!==null){s=r.next,i=i.baseState;var o=a=null,c=null,u=s;do{var f=u.lane;if((Er&f)===f)c!==null&&(c=c.next={lane:0,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null}),i=u.hasEagerState?u.eagerState:t(i,u.action);else{var p={lane:f,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null};c===null?(o=c=p,a=i):c=c.next=p,mt.lanes|=f,Tr|=f}u=u.next}while(u!==null&&u!==s);c===null?a=i:c.next=o,Gn(i,e.memoizedState)||(rn=!0),e.memoizedState=i,e.baseState=a,e.baseQueue=c,n.lastRenderedState=i}if(t=n.interleaved,t!==null){r=t;do s=r.lane,mt.lanes|=s,Tr|=s,r=r.next;while(r!==t)}else r===null&&(n.lanes=0);return[e.memoizedState,n.dispatch]}function bc(t){var e=Nn(),n=e.queue;if(n===null)throw Error(ae(311));n.lastRenderedReducer=t;var i=n.dispatch,r=n.pending,s=e.memoizedState;if(r!==null){n.pending=null;var a=r=r.next;do s=t(s,a.action),a=a.next;while(a!==r);Gn(s,e.memoizedState)||(rn=!0),e.memoizedState=s,e.baseQueue===null&&(e.baseState=s),n.lastRenderedState=s}return[s,i]}function tx(){}function nx(t,e){var n=mt,i=Nn(),r=e(),s=!Gn(i.memoizedState,r);if(s&&(i.memoizedState=r,rn=!0),i=i.queue,Rh(sx.bind(null,n,i,t),[t]),i.getSnapshot!==e||s||Nt!==null&&Nt.memoizedState.tag&1){if(n.flags|=2048,Da(9,rx.bind(null,n,i,r,e),void 0,null),Rt===null)throw Error(ae(349));Er&30||ix(n,e,r)}return r}function ix(t,e,n){t.flags|=16384,t={getSnapshot:e,value:n},e=mt.updateQueue,e===null?(e={lastEffect:null,stores:null},mt.updateQueue=e,e.stores=[t]):(n=e.stores,n===null?e.stores=[t]:n.push(t))}function rx(t,e,n,i){e.value=n,e.getSnapshot=i,ax(e)&&ox(t)}function sx(t,e,n){return n(function(){ax(e)&&ox(t)})}function ax(t){var e=t.getSnapshot;t=t.value;try{var n=e();return!Gn(t,n)}catch{return!0}}function ox(t){var e=xi(t,1);e!==null&&Vn(e,t,1,-1)}function ip(t){var e=Xn();return typeof t=="function"&&(t=t()),e.memoizedState=e.baseState=t,t={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:La,lastRenderedState:t},e.queue=t,t=t.dispatch=V_.bind(null,mt,t),[e.memoizedState,t]}function Da(t,e,n,i){return t={tag:t,create:e,destroy:n,deps:i,next:null},e=mt.updateQueue,e===null?(e={lastEffect:null,stores:null},mt.updateQueue=e,e.lastEffect=t.next=t):(n=e.lastEffect,n===null?e.lastEffect=t.next=t:(i=n.next,n.next=t,t.next=i,e.lastEffect=t)),t}function lx(){return Nn().memoizedState}function Go(t,e,n,i){var r=Xn();mt.flags|=t,r.memoizedState=Da(1|e,n,void 0,i===void 0?null:i)}function Ol(t,e,n,i){var r=Nn();i=i===void 0?null:i;var s=void 0;if(bt!==null){var a=bt.memoizedState;if(s=a.destroy,i!==null&&Ah(i,a.deps)){r.memoizedState=Da(e,n,s,i);return}}mt.flags|=t,r.memoizedState=Da(1|e,n,s,i)}function rp(t,e){return Go(8390656,8,t,e)}function Rh(t,e){return Ol(2048,8,t,e)}function cx(t,e){return Ol(4,2,t,e)}function ux(t,e){return Ol(4,4,t,e)}function dx(t,e){if(typeof e=="function")return t=t(),e(t),function(){e(null)};if(e!=null)return t=t(),e.current=t,function(){e.current=null}}function hx(t,e,n){return n=n!=null?n.concat([t]):null,Ol(4,4,dx.bind(null,e,t),n)}function Ph(){}function fx(t,e){var n=Nn();e=e===void 0?null:e;var i=n.memoizedState;return i!==null&&e!==null&&Ah(e,i[1])?i[0]:(n.memoizedState=[t,e],t)}function px(t,e){var n=Nn();e=e===void 0?null:e;var i=n.memoizedState;return i!==null&&e!==null&&Ah(e,i[1])?i[0]:(t=t(),n.memoizedState=[t,e],t)}function mx(t,e,n){return Er&21?(Gn(n,e)||(n=y0(),mt.lanes|=n,Tr|=n,t.baseState=!0),e):(t.baseState&&(t.baseState=!1,rn=!0),t.memoizedState=n)}function B_(t,e){var n=it;it=n!==0&&4>n?n:4,t(!0);var i=wc.transition;wc.transition={};try{t(!1),e()}finally{it=n,wc.transition=i}}function xx(){return Nn().memoizedState}function H_(t,e,n){var i=Gi(t);if(n={lane:i,action:n,hasEagerState:!1,eagerState:null,next:null},gx(t))vx(e,n);else if(n=Q0(t,e,n,i),n!==null){var r=Xt();Vn(n,t,i,r),_x(n,e,i)}}function V_(t,e,n){var i=Gi(t),r={lane:i,action:n,hasEagerState:!1,eagerState:null,next:null};if(gx(t))vx(e,r);else{var s=t.alternate;if(t.lanes===0&&(s===null||s.lanes===0)&&(s=e.lastRenderedReducer,s!==null))try{var a=e.lastRenderedState,o=s(a,n);if(r.hasEagerState=!0,r.eagerState=o,Gn(o,a)){var c=e.interleaved;c===null?(r.next=r,wh(e)):(r.next=c.next,c.next=r),e.interleaved=r;return}}catch{}finally{}n=Q0(t,e,r,i),n!==null&&(r=Xt(),Vn(n,t,i,r),_x(n,e,i))}}function gx(t){var e=t.alternate;return t===mt||e!==null&&e===mt}function vx(t,e){fa=_l=!0;var n=t.pending;n===null?e.next=e:(e.next=n.next,n.next=e),t.pending=e}function _x(t,e,n){if(n&4194240){var i=e.lanes;i&=t.pendingLanes,n|=i,e.lanes=n,lh(t,n)}}var yl={readContext:Cn,useCallback:It,useContext:It,useEffect:It,useImperativeHandle:It,useInsertionEffect:It,useLayoutEffect:It,useMemo:It,useReducer:It,useRef:It,useState:It,useDebugValue:It,useDeferredValue:It,useTransition:It,useMutableSource:It,useSyncExternalStore:It,useId:It,unstable_isNewReconciler:!1},G_={readContext:Cn,useCallback:function(t,e){return Xn().memoizedState=[t,e===void 0?null:e],t},useContext:Cn,useEffect:rp,useImperativeHandle:function(t,e,n){return n=n!=null?n.concat([t]):null,Go(4194308,4,dx.bind(null,e,t),n)},useLayoutEffect:function(t,e){return Go(4194308,4,t,e)},useInsertionEffect:function(t,e){return Go(4,2,t,e)},useMemo:function(t,e){var n=Xn();return e=e===void 0?null:e,t=t(),n.memoizedState=[t,e],t},useReducer:function(t,e,n){var i=Xn();return e=n!==void 0?n(e):e,i.memoizedState=i.baseState=e,t={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:t,lastRenderedState:e},i.queue=t,t=t.dispatch=H_.bind(null,mt,t),[i.memoizedState,t]},useRef:function(t){var e=Xn();return t={current:t},e.memoizedState=t},useState:ip,useDebugValue:Ph,useDeferredValue:function(t){return Xn().memoizedState=t},useTransition:function(){var t=ip(!1),e=t[0];return t=B_.bind(null,t[1]),Xn().memoizedState=t,[e,t]},useMutableSource:function(){},useSyncExternalStore:function(t,e,n){var i=mt,r=Xn();if(ht){if(n===void 0)throw Error(ae(407));n=n()}else{if(n=e(),Rt===null)throw Error(ae(349));Er&30||ix(i,e,n)}r.memoizedState=n;var s={value:n,getSnapshot:e};return r.queue=s,rp(sx.bind(null,i,s,t),[t]),i.flags|=2048,Da(9,rx.bind(null,i,s,n,e),void 0,null),n},useId:function(){var t=Xn(),e=Rt.identifierPrefix;if(ht){var n=ci,i=li;n=(i&~(1<<32-Hn(i)-1)).toString(32)+n,e=":"+e+"R"+n,n=Pa++,0<n&&(e+="H"+n.toString(32)),e+=":"}else n=j_++,e=":"+e+"r"+n.toString(32)+":";return t.memoizedState=e},unstable_isNewReconciler:!1},W_={readContext:Cn,useCallback:fx,useContext:Cn,useEffect:Rh,useImperativeHandle:hx,useInsertionEffect:cx,useLayoutEffect:ux,useMemo:px,useReducer:Mc,useRef:lx,useState:function(){return Mc(La)},useDebugValue:Ph,useDeferredValue:function(t){var e=Nn();return mx(e,bt.memoizedState,t)},useTransition:function(){var t=Mc(La)[0],e=Nn().memoizedState;return[t,e]},useMutableSource:tx,useSyncExternalStore:nx,useId:xx,unstable_isNewReconciler:!1},X_={readContext:Cn,useCallback:fx,useContext:Cn,useEffect:Rh,useImperativeHandle:hx,useInsertionEffect:cx,useLayoutEffect:ux,useMemo:px,useReducer:bc,useRef:lx,useState:function(){return bc(La)},useDebugValue:Ph,useDeferredValue:function(t){var e=Nn();return bt===null?e.memoizedState=t:mx(e,bt.memoizedState,t)},useTransition:function(){var t=bc(La)[0],e=Nn().memoizedState;return[t,e]},useMutableSource:tx,useSyncExternalStore:nx,useId:xx,unstable_isNewReconciler:!1};function Un(t,e){if(t&&t.defaultProps){e=xt({},e),t=t.defaultProps;for(var n in t)e[n]===void 0&&(e[n]=t[n]);return e}return e}function zu(t,e,n,i){e=t.memoizedState,n=n(i,e),n=n==null?e:xt({},e,n),t.memoizedState=n,t.lanes===0&&(t.updateQueue.baseState=n)}var zl={isMounted:function(t){return(t=t._reactInternals)?Pr(t)===t:!1},enqueueSetState:function(t,e,n){t=t._reactInternals;var i=Xt(),r=Gi(t),s=fi(i,r);s.payload=e,n!=null&&(s.callback=n),e=Hi(t,s,r),e!==null&&(Vn(e,t,r,i),Ho(e,t,r))},enqueueReplaceState:function(t,e,n){t=t._reactInternals;var i=Xt(),r=Gi(t),s=fi(i,r);s.tag=1,s.payload=e,n!=null&&(s.callback=n),e=Hi(t,s,r),e!==null&&(Vn(e,t,r,i),Ho(e,t,r))},enqueueForceUpdate:function(t,e){t=t._reactInternals;var n=Xt(),i=Gi(t),r=fi(n,i);r.tag=2,e!=null&&(r.callback=e),e=Hi(t,r,i),e!==null&&(Vn(e,t,i,n),Ho(e,t,i))}};function sp(t,e,n,i,r,s,a){return t=t.stateNode,typeof t.shouldComponentUpdate=="function"?t.shouldComponentUpdate(i,s,a):e.prototype&&e.prototype.isPureReactComponent?!Ea(n,i)||!Ea(r,s):!0}function yx(t,e,n){var i=!1,r=Yi,s=e.contextType;return typeof s=="object"&&s!==null?s=Cn(s):(r=an(e)?Mr:Ht.current,i=e.contextTypes,s=(i=i!=null)?vs(t,r):Yi),e=new e(n,s),t.memoizedState=e.state!==null&&e.state!==void 0?e.state:null,e.updater=zl,t.stateNode=e,e._reactInternals=t,i&&(t=t.stateNode,t.__reactInternalMemoizedUnmaskedChildContext=r,t.__reactInternalMemoizedMaskedChildContext=s),e}function ap(t,e,n,i){t=e.state,typeof e.componentWillReceiveProps=="function"&&e.componentWillReceiveProps(n,i),typeof e.UNSAFE_componentWillReceiveProps=="function"&&e.UNSAFE_componentWillReceiveProps(n,i),e.state!==t&&zl.enqueueReplaceState(e,e.state,null)}function ju(t,e,n,i){var r=t.stateNode;r.props=n,r.state=t.memoizedState,r.refs={},Mh(t);var s=e.contextType;typeof s=="object"&&s!==null?r.context=Cn(s):(s=an(e)?Mr:Ht.current,r.context=vs(t,s)),r.state=t.memoizedState,s=e.getDerivedStateFromProps,typeof s=="function"&&(zu(t,e,s,n),r.state=t.memoizedState),typeof e.getDerivedStateFromProps=="function"||typeof r.getSnapshotBeforeUpdate=="function"||typeof r.UNSAFE_componentWillMount!="function"&&typeof r.componentWillMount!="function"||(e=r.state,typeof r.componentWillMount=="function"&&r.componentWillMount(),typeof r.UNSAFE_componentWillMount=="function"&&r.UNSAFE_componentWillMount(),e!==r.state&&zl.enqueueReplaceState(r,r.state,null),gl(t,n,r,i),r.state=t.memoizedState),typeof r.componentDidMount=="function"&&(t.flags|=4194308)}function ws(t,e){try{var n="",i=e;do n+=yv(i),i=i.return;while(i);var r=n}catch(s){r=`
Error generating stack: `+s.message+`
`+s.stack}return{value:t,source:e,stack:r,digest:null}}function Ec(t,e,n){return{value:t,source:null,stack:n??null,digest:e??null}}function Bu(t,e){try{console.error(e.value)}catch(n){setTimeout(function(){throw n})}}var q_=typeof WeakMap=="function"?WeakMap:Map;function Sx(t,e,n){n=fi(-1,n),n.tag=3,n.payload={element:null};var i=e.value;return n.callback=function(){wl||(wl=!0,Zu=i),Bu(t,e)},n}function wx(t,e,n){n=fi(-1,n),n.tag=3;var i=t.type.getDerivedStateFromError;if(typeof i=="function"){var r=e.value;n.payload=function(){return i(r)},n.callback=function(){Bu(t,e)}}var s=t.stateNode;return s!==null&&typeof s.componentDidCatch=="function"&&(n.callback=function(){Bu(t,e),typeof i!="function"&&(Vi===null?Vi=new Set([this]):Vi.add(this));var a=e.stack;this.componentDidCatch(e.value,{componentStack:a!==null?a:""})}),n}function op(t,e,n){var i=t.pingCache;if(i===null){i=t.pingCache=new q_;var r=new Set;i.set(e,r)}else r=i.get(e),r===void 0&&(r=new Set,i.set(e,r));r.has(n)||(r.add(n),t=oy.bind(null,t,e,n),e.then(t,t))}function lp(t){do{var e;if((e=t.tag===13)&&(e=t.memoizedState,e=e!==null?e.dehydrated!==null:!0),e)return t;t=t.return}while(t!==null);return null}function cp(t,e,n,i,r){return t.mode&1?(t.flags|=65536,t.lanes=r,t):(t===e?t.flags|=65536:(t.flags|=128,n.flags|=131072,n.flags&=-52805,n.tag===1&&(n.alternate===null?n.tag=17:(e=fi(-1,1),e.tag=2,Hi(n,e,1))),n.lanes|=1),t)}var $_=yi.ReactCurrentOwner,rn=!1;function Wt(t,e,n,i){e.child=t===null?Z0(e,null,n,i):ys(e,t.child,n,i)}function up(t,e,n,i,r){n=n.render;var s=e.ref;return ds(e,r),i=Ch(t,e,n,i,s,r),n=Nh(),t!==null&&!rn?(e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~r,gi(t,e,r)):(ht&&n&&xh(e),e.flags|=1,Wt(t,e,i,r),e.child)}function dp(t,e,n,i,r){if(t===null){var s=n.type;return typeof s=="function"&&!zh(s)&&s.defaultProps===void 0&&n.compare===null&&n.defaultProps===void 0?(e.tag=15,e.type=s,Mx(t,e,s,i,r)):(t=$o(n.type,null,i,e,e.mode,r),t.ref=e.ref,t.return=e,e.child=t)}if(s=t.child,!(t.lanes&r)){var a=s.memoizedProps;if(n=n.compare,n=n!==null?n:Ea,n(a,i)&&t.ref===e.ref)return gi(t,e,r)}return e.flags|=1,t=Wi(s,i),t.ref=e.ref,t.return=e,e.child=t}function Mx(t,e,n,i,r){if(t!==null){var s=t.memoizedProps;if(Ea(s,i)&&t.ref===e.ref)if(rn=!1,e.pendingProps=i=s,(t.lanes&r)!==0)t.flags&131072&&(rn=!0);else return e.lanes=t.lanes,gi(t,e,r)}return Hu(t,e,n,i,r)}function bx(t,e,n){var i=e.pendingProps,r=i.children,s=t!==null?t.memoizedState:null;if(i.mode==="hidden")if(!(e.mode&1))e.memoizedState={baseLanes:0,cachePool:null,transitions:null},at(ss,hn),hn|=n;else{if(!(n&1073741824))return t=s!==null?s.baseLanes|n:n,e.lanes=e.childLanes=1073741824,e.memoizedState={baseLanes:t,cachePool:null,transitions:null},e.updateQueue=null,at(ss,hn),hn|=t,null;e.memoizedState={baseLanes:0,cachePool:null,transitions:null},i=s!==null?s.baseLanes:n,at(ss,hn),hn|=i}else s!==null?(i=s.baseLanes|n,e.memoizedState=null):i=n,at(ss,hn),hn|=i;return Wt(t,e,r,n),e.child}function Ex(t,e){var n=e.ref;(t===null&&n!==null||t!==null&&t.ref!==n)&&(e.flags|=512,e.flags|=2097152)}function Hu(t,e,n,i,r){var s=an(n)?Mr:Ht.current;return s=vs(e,s),ds(e,r),n=Ch(t,e,n,i,s,r),i=Nh(),t!==null&&!rn?(e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~r,gi(t,e,r)):(ht&&i&&xh(e),e.flags|=1,Wt(t,e,n,r),e.child)}function hp(t,e,n,i,r){if(an(n)){var s=!0;hl(e)}else s=!1;if(ds(e,r),e.stateNode===null)Wo(t,e),yx(e,n,i),ju(e,n,i,r),i=!0;else if(t===null){var a=e.stateNode,o=e.memoizedProps;a.props=o;var c=a.context,u=n.contextType;typeof u=="object"&&u!==null?u=Cn(u):(u=an(n)?Mr:Ht.current,u=vs(e,u));var f=n.getDerivedStateFromProps,p=typeof f=="function"||typeof a.getSnapshotBeforeUpdate=="function";p||typeof a.UNSAFE_componentWillReceiveProps!="function"&&typeof a.componentWillReceiveProps!="function"||(o!==i||c!==u)&&ap(e,a,i,u),Pi=!1;var h=e.memoizedState;a.state=h,gl(e,i,a,r),c=e.memoizedState,o!==i||h!==c||sn.current||Pi?(typeof f=="function"&&(zu(e,n,f,i),c=e.memoizedState),(o=Pi||sp(e,n,o,i,h,c,u))?(p||typeof a.UNSAFE_componentWillMount!="function"&&typeof a.componentWillMount!="function"||(typeof a.componentWillMount=="function"&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount=="function"&&a.UNSAFE_componentWillMount()),typeof a.componentDidMount=="function"&&(e.flags|=4194308)):(typeof a.componentDidMount=="function"&&(e.flags|=4194308),e.memoizedProps=i,e.memoizedState=c),a.props=i,a.state=c,a.context=u,i=o):(typeof a.componentDidMount=="function"&&(e.flags|=4194308),i=!1)}else{a=e.stateNode,J0(t,e),o=e.memoizedProps,u=e.type===e.elementType?o:Un(e.type,o),a.props=u,p=e.pendingProps,h=a.context,c=n.contextType,typeof c=="object"&&c!==null?c=Cn(c):(c=an(n)?Mr:Ht.current,c=vs(e,c));var x=n.getDerivedStateFromProps;(f=typeof x=="function"||typeof a.getSnapshotBeforeUpdate=="function")||typeof a.UNSAFE_componentWillReceiveProps!="function"&&typeof a.componentWillReceiveProps!="function"||(o!==p||h!==c)&&ap(e,a,i,c),Pi=!1,h=e.memoizedState,a.state=h,gl(e,i,a,r);var _=e.memoizedState;o!==p||h!==_||sn.current||Pi?(typeof x=="function"&&(zu(e,n,x,i),_=e.memoizedState),(u=Pi||sp(e,n,u,i,h,_,c)||!1)?(f||typeof a.UNSAFE_componentWillUpdate!="function"&&typeof a.componentWillUpdate!="function"||(typeof a.componentWillUpdate=="function"&&a.componentWillUpdate(i,_,c),typeof a.UNSAFE_componentWillUpdate=="function"&&a.UNSAFE_componentWillUpdate(i,_,c)),typeof a.componentDidUpdate=="function"&&(e.flags|=4),typeof a.getSnapshotBeforeUpdate=="function"&&(e.flags|=1024)):(typeof a.componentDidUpdate!="function"||o===t.memoizedProps&&h===t.memoizedState||(e.flags|=4),typeof a.getSnapshotBeforeUpdate!="function"||o===t.memoizedProps&&h===t.memoizedState||(e.flags|=1024),e.memoizedProps=i,e.memoizedState=_),a.props=i,a.state=_,a.context=c,i=u):(typeof a.componentDidUpdate!="function"||o===t.memoizedProps&&h===t.memoizedState||(e.flags|=4),typeof a.getSnapshotBeforeUpdate!="function"||o===t.memoizedProps&&h===t.memoizedState||(e.flags|=1024),i=!1)}return Vu(t,e,n,i,s,r)}function Vu(t,e,n,i,r,s){Ex(t,e);var a=(e.flags&128)!==0;if(!i&&!a)return r&&Zf(e,n,!1),gi(t,e,s);i=e.stateNode,$_.current=e;var o=a&&typeof n.getDerivedStateFromError!="function"?null:i.render();return e.flags|=1,t!==null&&a?(e.child=ys(e,t.child,null,s),e.child=ys(e,null,o,s)):Wt(t,e,o,s),e.memoizedState=i.state,r&&Zf(e,n,!0),e.child}function Tx(t){var e=t.stateNode;e.pendingContext?Kf(t,e.pendingContext,e.pendingContext!==e.context):e.context&&Kf(t,e.context,!1),bh(t,e.containerInfo)}function fp(t,e,n,i,r){return _s(),vh(r),e.flags|=256,Wt(t,e,n,i),e.child}var Gu={dehydrated:null,treeContext:null,retryLane:0};function Wu(t){return{baseLanes:t,cachePool:null,transitions:null}}function Ax(t,e,n){var i=e.pendingProps,r=pt.current,s=!1,a=(e.flags&128)!==0,o;if((o=a)||(o=t!==null&&t.memoizedState===null?!1:(r&2)!==0),o?(s=!0,e.flags&=-129):(t===null||t.memoizedState!==null)&&(r|=1),at(pt,r&1),t===null)return Fu(e),t=e.memoizedState,t!==null&&(t=t.dehydrated,t!==null)?(e.mode&1?t.data==="$!"?e.lanes=8:e.lanes=1073741824:e.lanes=1,null):(a=i.children,t=i.fallback,s?(i=e.mode,s=e.child,a={mode:"hidden",children:a},!(i&1)&&s!==null?(s.childLanes=0,s.pendingProps=a):s=Hl(a,i,0,null),t=wr(t,i,n,null),s.return=e,t.return=e,s.sibling=t,e.child=s,e.child.memoizedState=Wu(n),e.memoizedState=Gu,t):Lh(e,a));if(r=t.memoizedState,r!==null&&(o=r.dehydrated,o!==null))return Y_(t,e,a,i,o,r,n);if(s){s=i.fallback,a=e.mode,r=t.child,o=r.sibling;var c={mode:"hidden",children:i.children};return!(a&1)&&e.child!==r?(i=e.child,i.childLanes=0,i.pendingProps=c,e.deletions=null):(i=Wi(r,c),i.subtreeFlags=r.subtreeFlags&14680064),o!==null?s=Wi(o,s):(s=wr(s,a,n,null),s.flags|=2),s.return=e,i.return=e,i.sibling=s,e.child=i,i=s,s=e.child,a=t.child.memoizedState,a=a===null?Wu(n):{baseLanes:a.baseLanes|n,cachePool:null,transitions:a.transitions},s.memoizedState=a,s.childLanes=t.childLanes&~n,e.memoizedState=Gu,i}return s=t.child,t=s.sibling,i=Wi(s,{mode:"visible",children:i.children}),!(e.mode&1)&&(i.lanes=n),i.return=e,i.sibling=null,t!==null&&(n=e.deletions,n===null?(e.deletions=[t],e.flags|=16):n.push(t)),e.child=i,e.memoizedState=null,i}function Lh(t,e){return e=Hl({mode:"visible",children:e},t.mode,0,null),e.return=t,t.child=e}function co(t,e,n,i){return i!==null&&vh(i),ys(e,t.child,null,n),t=Lh(e,e.pendingProps.children),t.flags|=2,e.memoizedState=null,t}function Y_(t,e,n,i,r,s,a){if(n)return e.flags&256?(e.flags&=-257,i=Ec(Error(ae(422))),co(t,e,a,i)):e.memoizedState!==null?(e.child=t.child,e.flags|=128,null):(s=i.fallback,r=e.mode,i=Hl({mode:"visible",children:i.children},r,0,null),s=wr(s,r,a,null),s.flags|=2,i.return=e,s.return=e,i.sibling=s,e.child=i,e.mode&1&&ys(e,t.child,null,a),e.child.memoizedState=Wu(a),e.memoizedState=Gu,s);if(!(e.mode&1))return co(t,e,a,null);if(r.data==="$!"){if(i=r.nextSibling&&r.nextSibling.dataset,i)var o=i.dgst;return i=o,s=Error(ae(419)),i=Ec(s,i,void 0),co(t,e,a,i)}if(o=(a&t.childLanes)!==0,rn||o){if(i=Rt,i!==null){switch(a&-a){case 4:r=2;break;case 16:r=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:r=32;break;case 536870912:r=268435456;break;default:r=0}r=r&(i.suspendedLanes|a)?0:r,r!==0&&r!==s.retryLane&&(s.retryLane=r,xi(t,r),Vn(i,t,r,-1))}return Oh(),i=Ec(Error(ae(421))),co(t,e,a,i)}return r.data==="$?"?(e.flags|=128,e.child=t.child,e=ly.bind(null,t),r._reactRetry=e,null):(t=s.treeContext,pn=Bi(r.nextSibling),mn=e,ht=!0,On=null,t!==null&&(Sn[wn++]=li,Sn[wn++]=ci,Sn[wn++]=br,li=t.id,ci=t.overflow,br=e),e=Lh(e,i.children),e.flags|=4096,e)}function pp(t,e,n){t.lanes|=e;var i=t.alternate;i!==null&&(i.lanes|=e),Ou(t.return,e,n)}function Tc(t,e,n,i,r){var s=t.memoizedState;s===null?t.memoizedState={isBackwards:e,rendering:null,renderingStartTime:0,last:i,tail:n,tailMode:r}:(s.isBackwards=e,s.rendering=null,s.renderingStartTime=0,s.last=i,s.tail=n,s.tailMode=r)}function Cx(t,e,n){var i=e.pendingProps,r=i.revealOrder,s=i.tail;if(Wt(t,e,i.children,n),i=pt.current,i&2)i=i&1|2,e.flags|=128;else{if(t!==null&&t.flags&128)e:for(t=e.child;t!==null;){if(t.tag===13)t.memoizedState!==null&&pp(t,n,e);else if(t.tag===19)pp(t,n,e);else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break e;for(;t.sibling===null;){if(t.return===null||t.return===e)break e;t=t.return}t.sibling.return=t.return,t=t.sibling}i&=1}if(at(pt,i),!(e.mode&1))e.memoizedState=null;else switch(r){case"forwards":for(n=e.child,r=null;n!==null;)t=n.alternate,t!==null&&vl(t)===null&&(r=n),n=n.sibling;n=r,n===null?(r=e.child,e.child=null):(r=n.sibling,n.sibling=null),Tc(e,!1,r,n,s);break;case"backwards":for(n=null,r=e.child,e.child=null;r!==null;){if(t=r.alternate,t!==null&&vl(t)===null){e.child=r;break}t=r.sibling,r.sibling=n,n=r,r=t}Tc(e,!0,n,null,s);break;case"together":Tc(e,!1,null,null,void 0);break;default:e.memoizedState=null}return e.child}function Wo(t,e){!(e.mode&1)&&t!==null&&(t.alternate=null,e.alternate=null,e.flags|=2)}function gi(t,e,n){if(t!==null&&(e.dependencies=t.dependencies),Tr|=e.lanes,!(n&e.childLanes))return null;if(t!==null&&e.child!==t.child)throw Error(ae(153));if(e.child!==null){for(t=e.child,n=Wi(t,t.pendingProps),e.child=n,n.return=e;t.sibling!==null;)t=t.sibling,n=n.sibling=Wi(t,t.pendingProps),n.return=e;n.sibling=null}return e.child}function K_(t,e,n){switch(e.tag){case 3:Tx(e),_s();break;case 5:ex(e);break;case 1:an(e.type)&&hl(e);break;case 4:bh(e,e.stateNode.containerInfo);break;case 10:var i=e.type._context,r=e.memoizedProps.value;at(ml,i._currentValue),i._currentValue=r;break;case 13:if(i=e.memoizedState,i!==null)return i.dehydrated!==null?(at(pt,pt.current&1),e.flags|=128,null):n&e.child.childLanes?Ax(t,e,n):(at(pt,pt.current&1),t=gi(t,e,n),t!==null?t.sibling:null);at(pt,pt.current&1);break;case 19:if(i=(n&e.childLanes)!==0,t.flags&128){if(i)return Cx(t,e,n);e.flags|=128}if(r=e.memoizedState,r!==null&&(r.rendering=null,r.tail=null,r.lastEffect=null),at(pt,pt.current),i)break;return null;case 22:case 23:return e.lanes=0,bx(t,e,n)}return gi(t,e,n)}var Nx,Xu,Rx,Px;Nx=function(t,e){for(var n=e.child;n!==null;){if(n.tag===5||n.tag===6)t.appendChild(n.stateNode);else if(n.tag!==4&&n.child!==null){n.child.return=n,n=n.child;continue}if(n===e)break;for(;n.sibling===null;){if(n.return===null||n.return===e)return;n=n.return}n.sibling.return=n.return,n=n.sibling}};Xu=function(){};Rx=function(t,e,n,i){var r=t.memoizedProps;if(r!==i){t=e.stateNode,vr(Zn.current);var s=null;switch(n){case"input":r=pu(t,r),i=pu(t,i),s=[];break;case"select":r=xt({},r,{value:void 0}),i=xt({},i,{value:void 0}),s=[];break;case"textarea":r=gu(t,r),i=gu(t,i),s=[];break;default:typeof r.onClick!="function"&&typeof i.onClick=="function"&&(t.onclick=ul)}_u(n,i);var a;n=null;for(u in r)if(!i.hasOwnProperty(u)&&r.hasOwnProperty(u)&&r[u]!=null)if(u==="style"){var o=r[u];for(a in o)o.hasOwnProperty(a)&&(n||(n={}),n[a]="")}else u!=="dangerouslySetInnerHTML"&&u!=="children"&&u!=="suppressContentEditableWarning"&&u!=="suppressHydrationWarning"&&u!=="autoFocus"&&(va.hasOwnProperty(u)?s||(s=[]):(s=s||[]).push(u,null));for(u in i){var c=i[u];if(o=r!=null?r[u]:void 0,i.hasOwnProperty(u)&&c!==o&&(c!=null||o!=null))if(u==="style")if(o){for(a in o)!o.hasOwnProperty(a)||c&&c.hasOwnProperty(a)||(n||(n={}),n[a]="");for(a in c)c.hasOwnProperty(a)&&o[a]!==c[a]&&(n||(n={}),n[a]=c[a])}else n||(s||(s=[]),s.push(u,n)),n=c;else u==="dangerouslySetInnerHTML"?(c=c?c.__html:void 0,o=o?o.__html:void 0,c!=null&&o!==c&&(s=s||[]).push(u,c)):u==="children"?typeof c!="string"&&typeof c!="number"||(s=s||[]).push(u,""+c):u!=="suppressContentEditableWarning"&&u!=="suppressHydrationWarning"&&(va.hasOwnProperty(u)?(c!=null&&u==="onScroll"&&lt("scroll",t),s||o===c||(s=[])):(s=s||[]).push(u,c))}n&&(s=s||[]).push("style",n);var u=s;(e.updateQueue=u)&&(e.flags|=4)}};Px=function(t,e,n,i){n!==i&&(e.flags|=4)};function qs(t,e){if(!ht)switch(t.tailMode){case"hidden":e=t.tail;for(var n=null;e!==null;)e.alternate!==null&&(n=e),e=e.sibling;n===null?t.tail=null:n.sibling=null;break;case"collapsed":n=t.tail;for(var i=null;n!==null;)n.alternate!==null&&(i=n),n=n.sibling;i===null?e||t.tail===null?t.tail=null:t.tail.sibling=null:i.sibling=null}}function Ut(t){var e=t.alternate!==null&&t.alternate.child===t.child,n=0,i=0;if(e)for(var r=t.child;r!==null;)n|=r.lanes|r.childLanes,i|=r.subtreeFlags&14680064,i|=r.flags&14680064,r.return=t,r=r.sibling;else for(r=t.child;r!==null;)n|=r.lanes|r.childLanes,i|=r.subtreeFlags,i|=r.flags,r.return=t,r=r.sibling;return t.subtreeFlags|=i,t.childLanes=n,e}function Z_(t,e,n){var i=e.pendingProps;switch(gh(e),e.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return Ut(e),null;case 1:return an(e.type)&&dl(),Ut(e),null;case 3:return i=e.stateNode,Ss(),ut(sn),ut(Ht),Th(),i.pendingContext&&(i.context=i.pendingContext,i.pendingContext=null),(t===null||t.child===null)&&(oo(e)?e.flags|=4:t===null||t.memoizedState.isDehydrated&&!(e.flags&256)||(e.flags|=1024,On!==null&&(ed(On),On=null))),Xu(t,e),Ut(e),null;case 5:Eh(e);var r=vr(Ra.current);if(n=e.type,t!==null&&e.stateNode!=null)Rx(t,e,n,i,r),t.ref!==e.ref&&(e.flags|=512,e.flags|=2097152);else{if(!i){if(e.stateNode===null)throw Error(ae(166));return Ut(e),null}if(t=vr(Zn.current),oo(e)){i=e.stateNode,n=e.type;var s=e.memoizedProps;switch(i[Yn]=e,i[Ca]=s,t=(e.mode&1)!==0,n){case"dialog":lt("cancel",i),lt("close",i);break;case"iframe":case"object":case"embed":lt("load",i);break;case"video":case"audio":for(r=0;r<sa.length;r++)lt(sa[r],i);break;case"source":lt("error",i);break;case"img":case"image":case"link":lt("error",i),lt("load",i);break;case"details":lt("toggle",i);break;case"input":Mf(i,s),lt("invalid",i);break;case"select":i._wrapperState={wasMultiple:!!s.multiple},lt("invalid",i);break;case"textarea":Ef(i,s),lt("invalid",i)}_u(n,s),r=null;for(var a in s)if(s.hasOwnProperty(a)){var o=s[a];a==="children"?typeof o=="string"?i.textContent!==o&&(s.suppressHydrationWarning!==!0&&ao(i.textContent,o,t),r=["children",o]):typeof o=="number"&&i.textContent!==""+o&&(s.suppressHydrationWarning!==!0&&ao(i.textContent,o,t),r=["children",""+o]):va.hasOwnProperty(a)&&o!=null&&a==="onScroll"&&lt("scroll",i)}switch(n){case"input":Qa(i),bf(i,s,!0);break;case"textarea":Qa(i),Tf(i);break;case"select":case"option":break;default:typeof s.onClick=="function"&&(i.onclick=ul)}i=r,e.updateQueue=i,i!==null&&(e.flags|=4)}else{a=r.nodeType===9?r:r.ownerDocument,t==="http://www.w3.org/1999/xhtml"&&(t=s0(n)),t==="http://www.w3.org/1999/xhtml"?n==="script"?(t=a.createElement("div"),t.innerHTML="<script><\/script>",t=t.removeChild(t.firstChild)):typeof i.is=="string"?t=a.createElement(n,{is:i.is}):(t=a.createElement(n),n==="select"&&(a=t,i.multiple?a.multiple=!0:i.size&&(a.size=i.size))):t=a.createElementNS(t,n),t[Yn]=e,t[Ca]=i,Nx(t,e,!1,!1),e.stateNode=t;e:{switch(a=yu(n,i),n){case"dialog":lt("cancel",t),lt("close",t),r=i;break;case"iframe":case"object":case"embed":lt("load",t),r=i;break;case"video":case"audio":for(r=0;r<sa.length;r++)lt(sa[r],t);r=i;break;case"source":lt("error",t),r=i;break;case"img":case"image":case"link":lt("error",t),lt("load",t),r=i;break;case"details":lt("toggle",t),r=i;break;case"input":Mf(t,i),r=pu(t,i),lt("invalid",t);break;case"option":r=i;break;case"select":t._wrapperState={wasMultiple:!!i.multiple},r=xt({},i,{value:void 0}),lt("invalid",t);break;case"textarea":Ef(t,i),r=gu(t,i),lt("invalid",t);break;default:r=i}_u(n,r),o=r;for(s in o)if(o.hasOwnProperty(s)){var c=o[s];s==="style"?l0(t,c):s==="dangerouslySetInnerHTML"?(c=c?c.__html:void 0,c!=null&&a0(t,c)):s==="children"?typeof c=="string"?(n!=="textarea"||c!=="")&&_a(t,c):typeof c=="number"&&_a(t,""+c):s!=="suppressContentEditableWarning"&&s!=="suppressHydrationWarning"&&s!=="autoFocus"&&(va.hasOwnProperty(s)?c!=null&&s==="onScroll"&&lt("scroll",t):c!=null&&nh(t,s,c,a))}switch(n){case"input":Qa(t),bf(t,i,!1);break;case"textarea":Qa(t),Tf(t);break;case"option":i.value!=null&&t.setAttribute("value",""+$i(i.value));break;case"select":t.multiple=!!i.multiple,s=i.value,s!=null?os(t,!!i.multiple,s,!1):i.defaultValue!=null&&os(t,!!i.multiple,i.defaultValue,!0);break;default:typeof r.onClick=="function"&&(t.onclick=ul)}switch(n){case"button":case"input":case"select":case"textarea":i=!!i.autoFocus;break e;case"img":i=!0;break e;default:i=!1}}i&&(e.flags|=4)}e.ref!==null&&(e.flags|=512,e.flags|=2097152)}return Ut(e),null;case 6:if(t&&e.stateNode!=null)Px(t,e,t.memoizedProps,i);else{if(typeof i!="string"&&e.stateNode===null)throw Error(ae(166));if(n=vr(Ra.current),vr(Zn.current),oo(e)){if(i=e.stateNode,n=e.memoizedProps,i[Yn]=e,(s=i.nodeValue!==n)&&(t=mn,t!==null))switch(t.tag){case 3:ao(i.nodeValue,n,(t.mode&1)!==0);break;case 5:t.memoizedProps.suppressHydrationWarning!==!0&&ao(i.nodeValue,n,(t.mode&1)!==0)}s&&(e.flags|=4)}else i=(n.nodeType===9?n:n.ownerDocument).createTextNode(i),i[Yn]=e,e.stateNode=i}return Ut(e),null;case 13:if(ut(pt),i=e.memoizedState,t===null||t.memoizedState!==null&&t.memoizedState.dehydrated!==null){if(ht&&pn!==null&&e.mode&1&&!(e.flags&128))Y0(),_s(),e.flags|=98560,s=!1;else if(s=oo(e),i!==null&&i.dehydrated!==null){if(t===null){if(!s)throw Error(ae(318));if(s=e.memoizedState,s=s!==null?s.dehydrated:null,!s)throw Error(ae(317));s[Yn]=e}else _s(),!(e.flags&128)&&(e.memoizedState=null),e.flags|=4;Ut(e),s=!1}else On!==null&&(ed(On),On=null),s=!0;if(!s)return e.flags&65536?e:null}return e.flags&128?(e.lanes=n,e):(i=i!==null,i!==(t!==null&&t.memoizedState!==null)&&i&&(e.child.flags|=8192,e.mode&1&&(t===null||pt.current&1?Et===0&&(Et=3):Oh())),e.updateQueue!==null&&(e.flags|=4),Ut(e),null);case 4:return Ss(),Xu(t,e),t===null&&Ta(e.stateNode.containerInfo),Ut(e),null;case 10:return Sh(e.type._context),Ut(e),null;case 17:return an(e.type)&&dl(),Ut(e),null;case 19:if(ut(pt),s=e.memoizedState,s===null)return Ut(e),null;if(i=(e.flags&128)!==0,a=s.rendering,a===null)if(i)qs(s,!1);else{if(Et!==0||t!==null&&t.flags&128)for(t=e.child;t!==null;){if(a=vl(t),a!==null){for(e.flags|=128,qs(s,!1),i=a.updateQueue,i!==null&&(e.updateQueue=i,e.flags|=4),e.subtreeFlags=0,i=n,n=e.child;n!==null;)s=n,t=i,s.flags&=14680066,a=s.alternate,a===null?(s.childLanes=0,s.lanes=t,s.child=null,s.subtreeFlags=0,s.memoizedProps=null,s.memoizedState=null,s.updateQueue=null,s.dependencies=null,s.stateNode=null):(s.childLanes=a.childLanes,s.lanes=a.lanes,s.child=a.child,s.subtreeFlags=0,s.deletions=null,s.memoizedProps=a.memoizedProps,s.memoizedState=a.memoizedState,s.updateQueue=a.updateQueue,s.type=a.type,t=a.dependencies,s.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),n=n.sibling;return at(pt,pt.current&1|2),e.child}t=t.sibling}s.tail!==null&&yt()>Ms&&(e.flags|=128,i=!0,qs(s,!1),e.lanes=4194304)}else{if(!i)if(t=vl(a),t!==null){if(e.flags|=128,i=!0,n=t.updateQueue,n!==null&&(e.updateQueue=n,e.flags|=4),qs(s,!0),s.tail===null&&s.tailMode==="hidden"&&!a.alternate&&!ht)return Ut(e),null}else 2*yt()-s.renderingStartTime>Ms&&n!==1073741824&&(e.flags|=128,i=!0,qs(s,!1),e.lanes=4194304);s.isBackwards?(a.sibling=e.child,e.child=a):(n=s.last,n!==null?n.sibling=a:e.child=a,s.last=a)}return s.tail!==null?(e=s.tail,s.rendering=e,s.tail=e.sibling,s.renderingStartTime=yt(),e.sibling=null,n=pt.current,at(pt,i?n&1|2:n&1),e):(Ut(e),null);case 22:case 23:return Fh(),i=e.memoizedState!==null,t!==null&&t.memoizedState!==null!==i&&(e.flags|=8192),i&&e.mode&1?hn&1073741824&&(Ut(e),e.subtreeFlags&6&&(e.flags|=8192)):Ut(e),null;case 24:return null;case 25:return null}throw Error(ae(156,e.tag))}function Q_(t,e){switch(gh(e),e.tag){case 1:return an(e.type)&&dl(),t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 3:return Ss(),ut(sn),ut(Ht),Th(),t=e.flags,t&65536&&!(t&128)?(e.flags=t&-65537|128,e):null;case 5:return Eh(e),null;case 13:if(ut(pt),t=e.memoizedState,t!==null&&t.dehydrated!==null){if(e.alternate===null)throw Error(ae(340));_s()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 19:return ut(pt),null;case 4:return Ss(),null;case 10:return Sh(e.type._context),null;case 22:case 23:return Fh(),null;case 24:return null;default:return null}}var uo=!1,jt=!1,J_=typeof WeakSet=="function"?WeakSet:Set,_e=null;function rs(t,e){var n=t.ref;if(n!==null)if(typeof n=="function")try{n(null)}catch(i){vt(t,e,i)}else n.current=null}function qu(t,e,n){try{n()}catch(i){vt(t,e,i)}}var mp=!1;function ey(t,e){if(Ru=ol,t=U0(),mh(t)){if("selectionStart"in t)var n={start:t.selectionStart,end:t.selectionEnd};else e:{n=(n=t.ownerDocument)&&n.defaultView||window;var i=n.getSelection&&n.getSelection();if(i&&i.rangeCount!==0){n=i.anchorNode;var r=i.anchorOffset,s=i.focusNode;i=i.focusOffset;try{n.nodeType,s.nodeType}catch{n=null;break e}var a=0,o=-1,c=-1,u=0,f=0,p=t,h=null;t:for(;;){for(var x;p!==n||r!==0&&p.nodeType!==3||(o=a+r),p!==s||i!==0&&p.nodeType!==3||(c=a+i),p.nodeType===3&&(a+=p.nodeValue.length),(x=p.firstChild)!==null;)h=p,p=x;for(;;){if(p===t)break t;if(h===n&&++u===r&&(o=a),h===s&&++f===i&&(c=a),(x=p.nextSibling)!==null)break;p=h,h=p.parentNode}p=x}n=o===-1||c===-1?null:{start:o,end:c}}else n=null}n=n||{start:0,end:0}}else n=null;for(Pu={focusedElem:t,selectionRange:n},ol=!1,_e=e;_e!==null;)if(e=_e,t=e.child,(e.subtreeFlags&1028)!==0&&t!==null)t.return=e,_e=t;else for(;_e!==null;){e=_e;try{var _=e.alternate;if(e.flags&1024)switch(e.tag){case 0:case 11:case 15:break;case 1:if(_!==null){var S=_.memoizedProps,m=_.memoizedState,d=e.stateNode,g=d.getSnapshotBeforeUpdate(e.elementType===e.type?S:Un(e.type,S),m);d.__reactInternalSnapshotBeforeUpdate=g}break;case 3:var v=e.stateNode.containerInfo;v.nodeType===1?v.textContent="":v.nodeType===9&&v.documentElement&&v.removeChild(v.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(ae(163))}}catch(w){vt(e,e.return,w)}if(t=e.sibling,t!==null){t.return=e.return,_e=t;break}_e=e.return}return _=mp,mp=!1,_}function pa(t,e,n){var i=e.updateQueue;if(i=i!==null?i.lastEffect:null,i!==null){var r=i=i.next;do{if((r.tag&t)===t){var s=r.destroy;r.destroy=void 0,s!==void 0&&qu(e,n,s)}r=r.next}while(r!==i)}}function jl(t,e){if(e=e.updateQueue,e=e!==null?e.lastEffect:null,e!==null){var n=e=e.next;do{if((n.tag&t)===t){var i=n.create;n.destroy=i()}n=n.next}while(n!==e)}}function $u(t){var e=t.ref;if(e!==null){var n=t.stateNode;switch(t.tag){case 5:t=n;break;default:t=n}typeof e=="function"?e(t):e.current=t}}function Lx(t){var e=t.alternate;e!==null&&(t.alternate=null,Lx(e)),t.child=null,t.deletions=null,t.sibling=null,t.tag===5&&(e=t.stateNode,e!==null&&(delete e[Yn],delete e[Ca],delete e[ku],delete e[U_],delete e[F_])),t.stateNode=null,t.return=null,t.dependencies=null,t.memoizedProps=null,t.memoizedState=null,t.pendingProps=null,t.stateNode=null,t.updateQueue=null}function Dx(t){return t.tag===5||t.tag===3||t.tag===4}function xp(t){e:for(;;){for(;t.sibling===null;){if(t.return===null||Dx(t.return))return null;t=t.return}for(t.sibling.return=t.return,t=t.sibling;t.tag!==5&&t.tag!==6&&t.tag!==18;){if(t.flags&2||t.child===null||t.tag===4)continue e;t.child.return=t,t=t.child}if(!(t.flags&2))return t.stateNode}}function Yu(t,e,n){var i=t.tag;if(i===5||i===6)t=t.stateNode,e?n.nodeType===8?n.parentNode.insertBefore(t,e):n.insertBefore(t,e):(n.nodeType===8?(e=n.parentNode,e.insertBefore(t,n)):(e=n,e.appendChild(t)),n=n._reactRootContainer,n!=null||e.onclick!==null||(e.onclick=ul));else if(i!==4&&(t=t.child,t!==null))for(Yu(t,e,n),t=t.sibling;t!==null;)Yu(t,e,n),t=t.sibling}function Ku(t,e,n){var i=t.tag;if(i===5||i===6)t=t.stateNode,e?n.insertBefore(t,e):n.appendChild(t);else if(i!==4&&(t=t.child,t!==null))for(Ku(t,e,n),t=t.sibling;t!==null;)Ku(t,e,n),t=t.sibling}var Lt=null,Fn=!1;function wi(t,e,n){for(n=n.child;n!==null;)kx(t,e,n),n=n.sibling}function kx(t,e,n){if(Kn&&typeof Kn.onCommitFiberUnmount=="function")try{Kn.onCommitFiberUnmount(Ll,n)}catch{}switch(n.tag){case 5:jt||rs(n,e);case 6:var i=Lt,r=Fn;Lt=null,wi(t,e,n),Lt=i,Fn=r,Lt!==null&&(Fn?(t=Lt,n=n.stateNode,t.nodeType===8?t.parentNode.removeChild(n):t.removeChild(n)):Lt.removeChild(n.stateNode));break;case 18:Lt!==null&&(Fn?(t=Lt,n=n.stateNode,t.nodeType===8?_c(t.parentNode,n):t.nodeType===1&&_c(t,n),Ma(t)):_c(Lt,n.stateNode));break;case 4:i=Lt,r=Fn,Lt=n.stateNode.containerInfo,Fn=!0,wi(t,e,n),Lt=i,Fn=r;break;case 0:case 11:case 14:case 15:if(!jt&&(i=n.updateQueue,i!==null&&(i=i.lastEffect,i!==null))){r=i=i.next;do{var s=r,a=s.destroy;s=s.tag,a!==void 0&&(s&2||s&4)&&qu(n,e,a),r=r.next}while(r!==i)}wi(t,e,n);break;case 1:if(!jt&&(rs(n,e),i=n.stateNode,typeof i.componentWillUnmount=="function"))try{i.props=n.memoizedProps,i.state=n.memoizedState,i.componentWillUnmount()}catch(o){vt(n,e,o)}wi(t,e,n);break;case 21:wi(t,e,n);break;case 22:n.mode&1?(jt=(i=jt)||n.memoizedState!==null,wi(t,e,n),jt=i):wi(t,e,n);break;default:wi(t,e,n)}}function gp(t){var e=t.updateQueue;if(e!==null){t.updateQueue=null;var n=t.stateNode;n===null&&(n=t.stateNode=new J_),e.forEach(function(i){var r=cy.bind(null,t,i);n.has(i)||(n.add(i),i.then(r,r))})}}function Ln(t,e){var n=e.deletions;if(n!==null)for(var i=0;i<n.length;i++){var r=n[i];try{var s=t,a=e,o=a;e:for(;o!==null;){switch(o.tag){case 5:Lt=o.stateNode,Fn=!1;break e;case 3:Lt=o.stateNode.containerInfo,Fn=!0;break e;case 4:Lt=o.stateNode.containerInfo,Fn=!0;break e}o=o.return}if(Lt===null)throw Error(ae(160));kx(s,a,r),Lt=null,Fn=!1;var c=r.alternate;c!==null&&(c.return=null),r.return=null}catch(u){vt(r,e,u)}}if(e.subtreeFlags&12854)for(e=e.child;e!==null;)Ix(e,t),e=e.sibling}function Ix(t,e){var n=t.alternate,i=t.flags;switch(t.tag){case 0:case 11:case 14:case 15:if(Ln(e,t),Wn(t),i&4){try{pa(3,t,t.return),jl(3,t)}catch(S){vt(t,t.return,S)}try{pa(5,t,t.return)}catch(S){vt(t,t.return,S)}}break;case 1:Ln(e,t),Wn(t),i&512&&n!==null&&rs(n,n.return);break;case 5:if(Ln(e,t),Wn(t),i&512&&n!==null&&rs(n,n.return),t.flags&32){var r=t.stateNode;try{_a(r,"")}catch(S){vt(t,t.return,S)}}if(i&4&&(r=t.stateNode,r!=null)){var s=t.memoizedProps,a=n!==null?n.memoizedProps:s,o=t.type,c=t.updateQueue;if(t.updateQueue=null,c!==null)try{o==="input"&&s.type==="radio"&&s.name!=null&&i0(r,s),yu(o,a);var u=yu(o,s);for(a=0;a<c.length;a+=2){var f=c[a],p=c[a+1];f==="style"?l0(r,p):f==="dangerouslySetInnerHTML"?a0(r,p):f==="children"?_a(r,p):nh(r,f,p,u)}switch(o){case"input":mu(r,s);break;case"textarea":r0(r,s);break;case"select":var h=r._wrapperState.wasMultiple;r._wrapperState.wasMultiple=!!s.multiple;var x=s.value;x!=null?os(r,!!s.multiple,x,!1):h!==!!s.multiple&&(s.defaultValue!=null?os(r,!!s.multiple,s.defaultValue,!0):os(r,!!s.multiple,s.multiple?[]:"",!1))}r[Ca]=s}catch(S){vt(t,t.return,S)}}break;case 6:if(Ln(e,t),Wn(t),i&4){if(t.stateNode===null)throw Error(ae(162));r=t.stateNode,s=t.memoizedProps;try{r.nodeValue=s}catch(S){vt(t,t.return,S)}}break;case 3:if(Ln(e,t),Wn(t),i&4&&n!==null&&n.memoizedState.isDehydrated)try{Ma(e.containerInfo)}catch(S){vt(t,t.return,S)}break;case 4:Ln(e,t),Wn(t);break;case 13:Ln(e,t),Wn(t),r=t.child,r.flags&8192&&(s=r.memoizedState!==null,r.stateNode.isHidden=s,!s||r.alternate!==null&&r.alternate.memoizedState!==null||(Ih=yt())),i&4&&gp(t);break;case 22:if(f=n!==null&&n.memoizedState!==null,t.mode&1?(jt=(u=jt)||f,Ln(e,t),jt=u):Ln(e,t),Wn(t),i&8192){if(u=t.memoizedState!==null,(t.stateNode.isHidden=u)&&!f&&t.mode&1)for(_e=t,f=t.child;f!==null;){for(p=_e=f;_e!==null;){switch(h=_e,x=h.child,h.tag){case 0:case 11:case 14:case 15:pa(4,h,h.return);break;case 1:rs(h,h.return);var _=h.stateNode;if(typeof _.componentWillUnmount=="function"){i=h,n=h.return;try{e=i,_.props=e.memoizedProps,_.state=e.memoizedState,_.componentWillUnmount()}catch(S){vt(i,n,S)}}break;case 5:rs(h,h.return);break;case 22:if(h.memoizedState!==null){_p(p);continue}}x!==null?(x.return=h,_e=x):_p(p)}f=f.sibling}e:for(f=null,p=t;;){if(p.tag===5){if(f===null){f=p;try{r=p.stateNode,u?(s=r.style,typeof s.setProperty=="function"?s.setProperty("display","none","important"):s.display="none"):(o=p.stateNode,c=p.memoizedProps.style,a=c!=null&&c.hasOwnProperty("display")?c.display:null,o.style.display=o0("display",a))}catch(S){vt(t,t.return,S)}}}else if(p.tag===6){if(f===null)try{p.stateNode.nodeValue=u?"":p.memoizedProps}catch(S){vt(t,t.return,S)}}else if((p.tag!==22&&p.tag!==23||p.memoizedState===null||p===t)&&p.child!==null){p.child.return=p,p=p.child;continue}if(p===t)break e;for(;p.sibling===null;){if(p.return===null||p.return===t)break e;f===p&&(f=null),p=p.return}f===p&&(f=null),p.sibling.return=p.return,p=p.sibling}}break;case 19:Ln(e,t),Wn(t),i&4&&gp(t);break;case 21:break;default:Ln(e,t),Wn(t)}}function Wn(t){var e=t.flags;if(e&2){try{e:{for(var n=t.return;n!==null;){if(Dx(n)){var i=n;break e}n=n.return}throw Error(ae(160))}switch(i.tag){case 5:var r=i.stateNode;i.flags&32&&(_a(r,""),i.flags&=-33);var s=xp(t);Ku(t,s,r);break;case 3:case 4:var a=i.stateNode.containerInfo,o=xp(t);Yu(t,o,a);break;default:throw Error(ae(161))}}catch(c){vt(t,t.return,c)}t.flags&=-3}e&4096&&(t.flags&=-4097)}function ty(t,e,n){_e=t,Ux(t)}function Ux(t,e,n){for(var i=(t.mode&1)!==0;_e!==null;){var r=_e,s=r.child;if(r.tag===22&&i){var a=r.memoizedState!==null||uo;if(!a){var o=r.alternate,c=o!==null&&o.memoizedState!==null||jt;o=uo;var u=jt;if(uo=a,(jt=c)&&!u)for(_e=r;_e!==null;)a=_e,c=a.child,a.tag===22&&a.memoizedState!==null?yp(r):c!==null?(c.return=a,_e=c):yp(r);for(;s!==null;)_e=s,Ux(s),s=s.sibling;_e=r,uo=o,jt=u}vp(t)}else r.subtreeFlags&8772&&s!==null?(s.return=r,_e=s):vp(t)}}function vp(t){for(;_e!==null;){var e=_e;if(e.flags&8772){var n=e.alternate;try{if(e.flags&8772)switch(e.tag){case 0:case 11:case 15:jt||jl(5,e);break;case 1:var i=e.stateNode;if(e.flags&4&&!jt)if(n===null)i.componentDidMount();else{var r=e.elementType===e.type?n.memoizedProps:Un(e.type,n.memoizedProps);i.componentDidUpdate(r,n.memoizedState,i.__reactInternalSnapshotBeforeUpdate)}var s=e.updateQueue;s!==null&&np(e,s,i);break;case 3:var a=e.updateQueue;if(a!==null){if(n=null,e.child!==null)switch(e.child.tag){case 5:n=e.child.stateNode;break;case 1:n=e.child.stateNode}np(e,a,n)}break;case 5:var o=e.stateNode;if(n===null&&e.flags&4){n=o;var c=e.memoizedProps;switch(e.type){case"button":case"input":case"select":case"textarea":c.autoFocus&&n.focus();break;case"img":c.src&&(n.src=c.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(e.memoizedState===null){var u=e.alternate;if(u!==null){var f=u.memoizedState;if(f!==null){var p=f.dehydrated;p!==null&&Ma(p)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(ae(163))}jt||e.flags&512&&$u(e)}catch(h){vt(e,e.return,h)}}if(e===t){_e=null;break}if(n=e.sibling,n!==null){n.return=e.return,_e=n;break}_e=e.return}}function _p(t){for(;_e!==null;){var e=_e;if(e===t){_e=null;break}var n=e.sibling;if(n!==null){n.return=e.return,_e=n;break}_e=e.return}}function yp(t){for(;_e!==null;){var e=_e;try{switch(e.tag){case 0:case 11:case 15:var n=e.return;try{jl(4,e)}catch(c){vt(e,n,c)}break;case 1:var i=e.stateNode;if(typeof i.componentDidMount=="function"){var r=e.return;try{i.componentDidMount()}catch(c){vt(e,r,c)}}var s=e.return;try{$u(e)}catch(c){vt(e,s,c)}break;case 5:var a=e.return;try{$u(e)}catch(c){vt(e,a,c)}}}catch(c){vt(e,e.return,c)}if(e===t){_e=null;break}var o=e.sibling;if(o!==null){o.return=e.return,_e=o;break}_e=e.return}}var ny=Math.ceil,Sl=yi.ReactCurrentDispatcher,Dh=yi.ReactCurrentOwner,Tn=yi.ReactCurrentBatchConfig,Ke=0,Rt=null,Mt=null,Dt=0,hn=0,ss=Ji(0),Et=0,ka=null,Tr=0,Bl=0,kh=0,ma=null,tn=null,Ih=0,Ms=1/0,ai=null,wl=!1,Zu=null,Vi=null,ho=!1,Fi=null,Ml=0,xa=0,Qu=null,Xo=-1,qo=0;function Xt(){return Ke&6?yt():Xo!==-1?Xo:Xo=yt()}function Gi(t){return t.mode&1?Ke&2&&Dt!==0?Dt&-Dt:z_.transition!==null?(qo===0&&(qo=y0()),qo):(t=it,t!==0||(t=window.event,t=t===void 0?16:A0(t.type)),t):1}function Vn(t,e,n,i){if(50<xa)throw xa=0,Qu=null,Error(ae(185));za(t,n,i),(!(Ke&2)||t!==Rt)&&(t===Rt&&(!(Ke&2)&&(Bl|=n),Et===4&&ki(t,Dt)),on(t,i),n===1&&Ke===0&&!(e.mode&1)&&(Ms=yt()+500,Fl&&er()))}function on(t,e){var n=t.callbackNode;zv(t,e);var i=al(t,t===Rt?Dt:0);if(i===0)n!==null&&Nf(n),t.callbackNode=null,t.callbackPriority=0;else if(e=i&-i,t.callbackPriority!==e){if(n!=null&&Nf(n),e===1)t.tag===0?O_(Sp.bind(null,t)):X0(Sp.bind(null,t)),k_(function(){!(Ke&6)&&er()}),n=null;else{switch(S0(i)){case 1:n=oh;break;case 4:n=v0;break;case 16:n=sl;break;case 536870912:n=_0;break;default:n=sl}n=Gx(n,Fx.bind(null,t))}t.callbackPriority=e,t.callbackNode=n}}function Fx(t,e){if(Xo=-1,qo=0,Ke&6)throw Error(ae(327));var n=t.callbackNode;if(hs()&&t.callbackNode!==n)return null;var i=al(t,t===Rt?Dt:0);if(i===0)return null;if(i&30||i&t.expiredLanes||e)e=bl(t,i);else{e=i;var r=Ke;Ke|=2;var s=zx();(Rt!==t||Dt!==e)&&(ai=null,Ms=yt()+500,Sr(t,e));do try{sy();break}catch(o){Ox(t,o)}while(!0);yh(),Sl.current=s,Ke=r,Mt!==null?e=0:(Rt=null,Dt=0,e=Et)}if(e!==0){if(e===2&&(r=Eu(t),r!==0&&(i=r,e=Ju(t,r))),e===1)throw n=ka,Sr(t,0),ki(t,i),on(t,yt()),n;if(e===6)ki(t,i);else{if(r=t.current.alternate,!(i&30)&&!iy(r)&&(e=bl(t,i),e===2&&(s=Eu(t),s!==0&&(i=s,e=Ju(t,s))),e===1))throw n=ka,Sr(t,0),ki(t,i),on(t,yt()),n;switch(t.finishedWork=r,t.finishedLanes=i,e){case 0:case 1:throw Error(ae(345));case 2:dr(t,tn,ai);break;case 3:if(ki(t,i),(i&130023424)===i&&(e=Ih+500-yt(),10<e)){if(al(t,0)!==0)break;if(r=t.suspendedLanes,(r&i)!==i){Xt(),t.pingedLanes|=t.suspendedLanes&r;break}t.timeoutHandle=Du(dr.bind(null,t,tn,ai),e);break}dr(t,tn,ai);break;case 4:if(ki(t,i),(i&4194240)===i)break;for(e=t.eventTimes,r=-1;0<i;){var a=31-Hn(i);s=1<<a,a=e[a],a>r&&(r=a),i&=~s}if(i=r,i=yt()-i,i=(120>i?120:480>i?480:1080>i?1080:1920>i?1920:3e3>i?3e3:4320>i?4320:1960*ny(i/1960))-i,10<i){t.timeoutHandle=Du(dr.bind(null,t,tn,ai),i);break}dr(t,tn,ai);break;case 5:dr(t,tn,ai);break;default:throw Error(ae(329))}}}return on(t,yt()),t.callbackNode===n?Fx.bind(null,t):null}function Ju(t,e){var n=ma;return t.current.memoizedState.isDehydrated&&(Sr(t,e).flags|=256),t=bl(t,e),t!==2&&(e=tn,tn=n,e!==null&&ed(e)),t}function ed(t){tn===null?tn=t:tn.push.apply(tn,t)}function iy(t){for(var e=t;;){if(e.flags&16384){var n=e.updateQueue;if(n!==null&&(n=n.stores,n!==null))for(var i=0;i<n.length;i++){var r=n[i],s=r.getSnapshot;r=r.value;try{if(!Gn(s(),r))return!1}catch{return!1}}}if(n=e.child,e.subtreeFlags&16384&&n!==null)n.return=e,e=n;else{if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return!0;e=e.return}e.sibling.return=e.return,e=e.sibling}}return!0}function ki(t,e){for(e&=~kh,e&=~Bl,t.suspendedLanes|=e,t.pingedLanes&=~e,t=t.expirationTimes;0<e;){var n=31-Hn(e),i=1<<n;t[n]=-1,e&=~i}}function Sp(t){if(Ke&6)throw Error(ae(327));hs();var e=al(t,0);if(!(e&1))return on(t,yt()),null;var n=bl(t,e);if(t.tag!==0&&n===2){var i=Eu(t);i!==0&&(e=i,n=Ju(t,i))}if(n===1)throw n=ka,Sr(t,0),ki(t,e),on(t,yt()),n;if(n===6)throw Error(ae(345));return t.finishedWork=t.current.alternate,t.finishedLanes=e,dr(t,tn,ai),on(t,yt()),null}function Uh(t,e){var n=Ke;Ke|=1;try{return t(e)}finally{Ke=n,Ke===0&&(Ms=yt()+500,Fl&&er())}}function Ar(t){Fi!==null&&Fi.tag===0&&!(Ke&6)&&hs();var e=Ke;Ke|=1;var n=Tn.transition,i=it;try{if(Tn.transition=null,it=1,t)return t()}finally{it=i,Tn.transition=n,Ke=e,!(Ke&6)&&er()}}function Fh(){hn=ss.current,ut(ss)}function Sr(t,e){t.finishedWork=null,t.finishedLanes=0;var n=t.timeoutHandle;if(n!==-1&&(t.timeoutHandle=-1,D_(n)),Mt!==null)for(n=Mt.return;n!==null;){var i=n;switch(gh(i),i.tag){case 1:i=i.type.childContextTypes,i!=null&&dl();break;case 3:Ss(),ut(sn),ut(Ht),Th();break;case 5:Eh(i);break;case 4:Ss();break;case 13:ut(pt);break;case 19:ut(pt);break;case 10:Sh(i.type._context);break;case 22:case 23:Fh()}n=n.return}if(Rt=t,Mt=t=Wi(t.current,null),Dt=hn=e,Et=0,ka=null,kh=Bl=Tr=0,tn=ma=null,gr!==null){for(e=0;e<gr.length;e++)if(n=gr[e],i=n.interleaved,i!==null){n.interleaved=null;var r=i.next,s=n.pending;if(s!==null){var a=s.next;s.next=r,i.next=a}n.pending=i}gr=null}return t}function Ox(t,e){do{var n=Mt;try{if(yh(),Vo.current=yl,_l){for(var i=mt.memoizedState;i!==null;){var r=i.queue;r!==null&&(r.pending=null),i=i.next}_l=!1}if(Er=0,Nt=bt=mt=null,fa=!1,Pa=0,Dh.current=null,n===null||n.return===null){Et=1,ka=e,Mt=null;break}e:{var s=t,a=n.return,o=n,c=e;if(e=Dt,o.flags|=32768,c!==null&&typeof c=="object"&&typeof c.then=="function"){var u=c,f=o,p=f.tag;if(!(f.mode&1)&&(p===0||p===11||p===15)){var h=f.alternate;h?(f.updateQueue=h.updateQueue,f.memoizedState=h.memoizedState,f.lanes=h.lanes):(f.updateQueue=null,f.memoizedState=null)}var x=lp(a);if(x!==null){x.flags&=-257,cp(x,a,o,s,e),x.mode&1&&op(s,u,e),e=x,c=u;var _=e.updateQueue;if(_===null){var S=new Set;S.add(c),e.updateQueue=S}else _.add(c);break e}else{if(!(e&1)){op(s,u,e),Oh();break e}c=Error(ae(426))}}else if(ht&&o.mode&1){var m=lp(a);if(m!==null){!(m.flags&65536)&&(m.flags|=256),cp(m,a,o,s,e),vh(ws(c,o));break e}}s=c=ws(c,o),Et!==4&&(Et=2),ma===null?ma=[s]:ma.push(s),s=a;do{switch(s.tag){case 3:s.flags|=65536,e&=-e,s.lanes|=e;var d=Sx(s,c,e);tp(s,d);break e;case 1:o=c;var g=s.type,v=s.stateNode;if(!(s.flags&128)&&(typeof g.getDerivedStateFromError=="function"||v!==null&&typeof v.componentDidCatch=="function"&&(Vi===null||!Vi.has(v)))){s.flags|=65536,e&=-e,s.lanes|=e;var w=wx(s,o,e);tp(s,w);break e}}s=s.return}while(s!==null)}Bx(n)}catch(R){e=R,Mt===n&&n!==null&&(Mt=n=n.return);continue}break}while(!0)}function zx(){var t=Sl.current;return Sl.current=yl,t===null?yl:t}function Oh(){(Et===0||Et===3||Et===2)&&(Et=4),Rt===null||!(Tr&268435455)&&!(Bl&268435455)||ki(Rt,Dt)}function bl(t,e){var n=Ke;Ke|=2;var i=zx();(Rt!==t||Dt!==e)&&(ai=null,Sr(t,e));do try{ry();break}catch(r){Ox(t,r)}while(!0);if(yh(),Ke=n,Sl.current=i,Mt!==null)throw Error(ae(261));return Rt=null,Dt=0,Et}function ry(){for(;Mt!==null;)jx(Mt)}function sy(){for(;Mt!==null&&!Rv();)jx(Mt)}function jx(t){var e=Vx(t.alternate,t,hn);t.memoizedProps=t.pendingProps,e===null?Bx(t):Mt=e,Dh.current=null}function Bx(t){var e=t;do{var n=e.alternate;if(t=e.return,e.flags&32768){if(n=Q_(n,e),n!==null){n.flags&=32767,Mt=n;return}if(t!==null)t.flags|=32768,t.subtreeFlags=0,t.deletions=null;else{Et=6,Mt=null;return}}else if(n=Z_(n,e,hn),n!==null){Mt=n;return}if(e=e.sibling,e!==null){Mt=e;return}Mt=e=t}while(e!==null);Et===0&&(Et=5)}function dr(t,e,n){var i=it,r=Tn.transition;try{Tn.transition=null,it=1,ay(t,e,n,i)}finally{Tn.transition=r,it=i}return null}function ay(t,e,n,i){do hs();while(Fi!==null);if(Ke&6)throw Error(ae(327));n=t.finishedWork;var r=t.finishedLanes;if(n===null)return null;if(t.finishedWork=null,t.finishedLanes=0,n===t.current)throw Error(ae(177));t.callbackNode=null,t.callbackPriority=0;var s=n.lanes|n.childLanes;if(jv(t,s),t===Rt&&(Mt=Rt=null,Dt=0),!(n.subtreeFlags&2064)&&!(n.flags&2064)||ho||(ho=!0,Gx(sl,function(){return hs(),null})),s=(n.flags&15990)!==0,n.subtreeFlags&15990||s){s=Tn.transition,Tn.transition=null;var a=it;it=1;var o=Ke;Ke|=4,Dh.current=null,ey(t,n),Ix(n,t),T_(Pu),ol=!!Ru,Pu=Ru=null,t.current=n,ty(n),Pv(),Ke=o,it=a,Tn.transition=s}else t.current=n;if(ho&&(ho=!1,Fi=t,Ml=r),s=t.pendingLanes,s===0&&(Vi=null),kv(n.stateNode),on(t,yt()),e!==null)for(i=t.onRecoverableError,n=0;n<e.length;n++)r=e[n],i(r.value,{componentStack:r.stack,digest:r.digest});if(wl)throw wl=!1,t=Zu,Zu=null,t;return Ml&1&&t.tag!==0&&hs(),s=t.pendingLanes,s&1?t===Qu?xa++:(xa=0,Qu=t):xa=0,er(),null}function hs(){if(Fi!==null){var t=S0(Ml),e=Tn.transition,n=it;try{if(Tn.transition=null,it=16>t?16:t,Fi===null)var i=!1;else{if(t=Fi,Fi=null,Ml=0,Ke&6)throw Error(ae(331));var r=Ke;for(Ke|=4,_e=t.current;_e!==null;){var s=_e,a=s.child;if(_e.flags&16){var o=s.deletions;if(o!==null){for(var c=0;c<o.length;c++){var u=o[c];for(_e=u;_e!==null;){var f=_e;switch(f.tag){case 0:case 11:case 15:pa(8,f,s)}var p=f.child;if(p!==null)p.return=f,_e=p;else for(;_e!==null;){f=_e;var h=f.sibling,x=f.return;if(Lx(f),f===u){_e=null;break}if(h!==null){h.return=x,_e=h;break}_e=x}}}var _=s.alternate;if(_!==null){var S=_.child;if(S!==null){_.child=null;do{var m=S.sibling;S.sibling=null,S=m}while(S!==null)}}_e=s}}if(s.subtreeFlags&2064&&a!==null)a.return=s,_e=a;else e:for(;_e!==null;){if(s=_e,s.flags&2048)switch(s.tag){case 0:case 11:case 15:pa(9,s,s.return)}var d=s.sibling;if(d!==null){d.return=s.return,_e=d;break e}_e=s.return}}var g=t.current;for(_e=g;_e!==null;){a=_e;var v=a.child;if(a.subtreeFlags&2064&&v!==null)v.return=a,_e=v;else e:for(a=g;_e!==null;){if(o=_e,o.flags&2048)try{switch(o.tag){case 0:case 11:case 15:jl(9,o)}}catch(R){vt(o,o.return,R)}if(o===a){_e=null;break e}var w=o.sibling;if(w!==null){w.return=o.return,_e=w;break e}_e=o.return}}if(Ke=r,er(),Kn&&typeof Kn.onPostCommitFiberRoot=="function")try{Kn.onPostCommitFiberRoot(Ll,t)}catch{}i=!0}return i}finally{it=n,Tn.transition=e}}return!1}function wp(t,e,n){e=ws(n,e),e=Sx(t,e,1),t=Hi(t,e,1),e=Xt(),t!==null&&(za(t,1,e),on(t,e))}function vt(t,e,n){if(t.tag===3)wp(t,t,n);else for(;e!==null;){if(e.tag===3){wp(e,t,n);break}else if(e.tag===1){var i=e.stateNode;if(typeof e.type.getDerivedStateFromError=="function"||typeof i.componentDidCatch=="function"&&(Vi===null||!Vi.has(i))){t=ws(n,t),t=wx(e,t,1),e=Hi(e,t,1),t=Xt(),e!==null&&(za(e,1,t),on(e,t));break}}e=e.return}}function oy(t,e,n){var i=t.pingCache;i!==null&&i.delete(e),e=Xt(),t.pingedLanes|=t.suspendedLanes&n,Rt===t&&(Dt&n)===n&&(Et===4||Et===3&&(Dt&130023424)===Dt&&500>yt()-Ih?Sr(t,0):kh|=n),on(t,e)}function Hx(t,e){e===0&&(t.mode&1?(e=to,to<<=1,!(to&130023424)&&(to=4194304)):e=1);var n=Xt();t=xi(t,e),t!==null&&(za(t,e,n),on(t,n))}function ly(t){var e=t.memoizedState,n=0;e!==null&&(n=e.retryLane),Hx(t,n)}function cy(t,e){var n=0;switch(t.tag){case 13:var i=t.stateNode,r=t.memoizedState;r!==null&&(n=r.retryLane);break;case 19:i=t.stateNode;break;default:throw Error(ae(314))}i!==null&&i.delete(e),Hx(t,n)}var Vx;Vx=function(t,e,n){if(t!==null)if(t.memoizedProps!==e.pendingProps||sn.current)rn=!0;else{if(!(t.lanes&n)&&!(e.flags&128))return rn=!1,K_(t,e,n);rn=!!(t.flags&131072)}else rn=!1,ht&&e.flags&1048576&&q0(e,pl,e.index);switch(e.lanes=0,e.tag){case 2:var i=e.type;Wo(t,e),t=e.pendingProps;var r=vs(e,Ht.current);ds(e,n),r=Ch(null,e,i,t,r,n);var s=Nh();return e.flags|=1,typeof r=="object"&&r!==null&&typeof r.render=="function"&&r.$$typeof===void 0?(e.tag=1,e.memoizedState=null,e.updateQueue=null,an(i)?(s=!0,hl(e)):s=!1,e.memoizedState=r.state!==null&&r.state!==void 0?r.state:null,Mh(e),r.updater=zl,e.stateNode=r,r._reactInternals=e,ju(e,i,t,n),e=Vu(null,e,i,!0,s,n)):(e.tag=0,ht&&s&&xh(e),Wt(null,e,r,n),e=e.child),e;case 16:i=e.elementType;e:{switch(Wo(t,e),t=e.pendingProps,r=i._init,i=r(i._payload),e.type=i,r=e.tag=dy(i),t=Un(i,t),r){case 0:e=Hu(null,e,i,t,n);break e;case 1:e=hp(null,e,i,t,n);break e;case 11:e=up(null,e,i,t,n);break e;case 14:e=dp(null,e,i,Un(i.type,t),n);break e}throw Error(ae(306,i,""))}return e;case 0:return i=e.type,r=e.pendingProps,r=e.elementType===i?r:Un(i,r),Hu(t,e,i,r,n);case 1:return i=e.type,r=e.pendingProps,r=e.elementType===i?r:Un(i,r),hp(t,e,i,r,n);case 3:e:{if(Tx(e),t===null)throw Error(ae(387));i=e.pendingProps,s=e.memoizedState,r=s.element,J0(t,e),gl(e,i,null,n);var a=e.memoizedState;if(i=a.element,s.isDehydrated)if(s={element:i,isDehydrated:!1,cache:a.cache,pendingSuspenseBoundaries:a.pendingSuspenseBoundaries,transitions:a.transitions},e.updateQueue.baseState=s,e.memoizedState=s,e.flags&256){r=ws(Error(ae(423)),e),e=fp(t,e,i,n,r);break e}else if(i!==r){r=ws(Error(ae(424)),e),e=fp(t,e,i,n,r);break e}else for(pn=Bi(e.stateNode.containerInfo.firstChild),mn=e,ht=!0,On=null,n=Z0(e,null,i,n),e.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling;else{if(_s(),i===r){e=gi(t,e,n);break e}Wt(t,e,i,n)}e=e.child}return e;case 5:return ex(e),t===null&&Fu(e),i=e.type,r=e.pendingProps,s=t!==null?t.memoizedProps:null,a=r.children,Lu(i,r)?a=null:s!==null&&Lu(i,s)&&(e.flags|=32),Ex(t,e),Wt(t,e,a,n),e.child;case 6:return t===null&&Fu(e),null;case 13:return Ax(t,e,n);case 4:return bh(e,e.stateNode.containerInfo),i=e.pendingProps,t===null?e.child=ys(e,null,i,n):Wt(t,e,i,n),e.child;case 11:return i=e.type,r=e.pendingProps,r=e.elementType===i?r:Un(i,r),up(t,e,i,r,n);case 7:return Wt(t,e,e.pendingProps,n),e.child;case 8:return Wt(t,e,e.pendingProps.children,n),e.child;case 12:return Wt(t,e,e.pendingProps.children,n),e.child;case 10:e:{if(i=e.type._context,r=e.pendingProps,s=e.memoizedProps,a=r.value,at(ml,i._currentValue),i._currentValue=a,s!==null)if(Gn(s.value,a)){if(s.children===r.children&&!sn.current){e=gi(t,e,n);break e}}else for(s=e.child,s!==null&&(s.return=e);s!==null;){var o=s.dependencies;if(o!==null){a=s.child;for(var c=o.firstContext;c!==null;){if(c.context===i){if(s.tag===1){c=fi(-1,n&-n),c.tag=2;var u=s.updateQueue;if(u!==null){u=u.shared;var f=u.pending;f===null?c.next=c:(c.next=f.next,f.next=c),u.pending=c}}s.lanes|=n,c=s.alternate,c!==null&&(c.lanes|=n),Ou(s.return,n,e),o.lanes|=n;break}c=c.next}}else if(s.tag===10)a=s.type===e.type?null:s.child;else if(s.tag===18){if(a=s.return,a===null)throw Error(ae(341));a.lanes|=n,o=a.alternate,o!==null&&(o.lanes|=n),Ou(a,n,e),a=s.sibling}else a=s.child;if(a!==null)a.return=s;else for(a=s;a!==null;){if(a===e){a=null;break}if(s=a.sibling,s!==null){s.return=a.return,a=s;break}a=a.return}s=a}Wt(t,e,r.children,n),e=e.child}return e;case 9:return r=e.type,i=e.pendingProps.children,ds(e,n),r=Cn(r),i=i(r),e.flags|=1,Wt(t,e,i,n),e.child;case 14:return i=e.type,r=Un(i,e.pendingProps),r=Un(i.type,r),dp(t,e,i,r,n);case 15:return Mx(t,e,e.type,e.pendingProps,n);case 17:return i=e.type,r=e.pendingProps,r=e.elementType===i?r:Un(i,r),Wo(t,e),e.tag=1,an(i)?(t=!0,hl(e)):t=!1,ds(e,n),yx(e,i,r),ju(e,i,r,n),Vu(null,e,i,!0,t,n);case 19:return Cx(t,e,n);case 22:return bx(t,e,n)}throw Error(ae(156,e.tag))};function Gx(t,e){return g0(t,e)}function uy(t,e,n,i){this.tag=t,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=e,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=i,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function bn(t,e,n,i){return new uy(t,e,n,i)}function zh(t){return t=t.prototype,!(!t||!t.isReactComponent)}function dy(t){if(typeof t=="function")return zh(t)?1:0;if(t!=null){if(t=t.$$typeof,t===rh)return 11;if(t===sh)return 14}return 2}function Wi(t,e){var n=t.alternate;return n===null?(n=bn(t.tag,e,t.key,t.mode),n.elementType=t.elementType,n.type=t.type,n.stateNode=t.stateNode,n.alternate=t,t.alternate=n):(n.pendingProps=e,n.type=t.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=t.flags&14680064,n.childLanes=t.childLanes,n.lanes=t.lanes,n.child=t.child,n.memoizedProps=t.memoizedProps,n.memoizedState=t.memoizedState,n.updateQueue=t.updateQueue,e=t.dependencies,n.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext},n.sibling=t.sibling,n.index=t.index,n.ref=t.ref,n}function $o(t,e,n,i,r,s){var a=2;if(i=t,typeof t=="function")zh(t)&&(a=1);else if(typeof t=="string")a=5;else e:switch(t){case Yr:return wr(n.children,r,s,e);case ih:a=8,r|=8;break;case uu:return t=bn(12,n,e,r|2),t.elementType=uu,t.lanes=s,t;case du:return t=bn(13,n,e,r),t.elementType=du,t.lanes=s,t;case hu:return t=bn(19,n,e,r),t.elementType=hu,t.lanes=s,t;case e0:return Hl(n,r,s,e);default:if(typeof t=="object"&&t!==null)switch(t.$$typeof){case Qm:a=10;break e;case Jm:a=9;break e;case rh:a=11;break e;case sh:a=14;break e;case Ri:a=16,i=null;break e}throw Error(ae(130,t==null?t:typeof t,""))}return e=bn(a,n,e,r),e.elementType=t,e.type=i,e.lanes=s,e}function wr(t,e,n,i){return t=bn(7,t,i,e),t.lanes=n,t}function Hl(t,e,n,i){return t=bn(22,t,i,e),t.elementType=e0,t.lanes=n,t.stateNode={isHidden:!1},t}function Ac(t,e,n){return t=bn(6,t,null,e),t.lanes=n,t}function Cc(t,e,n){return e=bn(4,t.children!==null?t.children:[],t.key,e),e.lanes=n,e.stateNode={containerInfo:t.containerInfo,pendingChildren:null,implementation:t.implementation},e}function hy(t,e,n,i,r){this.tag=e,this.containerInfo=t,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=lc(0),this.expirationTimes=lc(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=lc(0),this.identifierPrefix=i,this.onRecoverableError=r,this.mutableSourceEagerHydrationData=null}function jh(t,e,n,i,r,s,a,o,c){return t=new hy(t,e,n,o,c),e===1?(e=1,s===!0&&(e|=8)):e=0,s=bn(3,null,null,e),t.current=s,s.stateNode=t,s.memoizedState={element:i,isDehydrated:n,cache:null,transitions:null,pendingSuspenseBoundaries:null},Mh(s),t}function fy(t,e,n){var i=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:$r,key:i==null?null:""+i,children:t,containerInfo:e,implementation:n}}function Wx(t){if(!t)return Yi;t=t._reactInternals;e:{if(Pr(t)!==t||t.tag!==1)throw Error(ae(170));var e=t;do{switch(e.tag){case 3:e=e.stateNode.context;break e;case 1:if(an(e.type)){e=e.stateNode.__reactInternalMemoizedMergedChildContext;break e}}e=e.return}while(e!==null);throw Error(ae(171))}if(t.tag===1){var n=t.type;if(an(n))return W0(t,n,e)}return e}function Xx(t,e,n,i,r,s,a,o,c){return t=jh(n,i,!0,t,r,s,a,o,c),t.context=Wx(null),n=t.current,i=Xt(),r=Gi(n),s=fi(i,r),s.callback=e??null,Hi(n,s,r),t.current.lanes=r,za(t,r,i),on(t,i),t}function Vl(t,e,n,i){var r=e.current,s=Xt(),a=Gi(r);return n=Wx(n),e.context===null?e.context=n:e.pendingContext=n,e=fi(s,a),e.payload={element:t},i=i===void 0?null:i,i!==null&&(e.callback=i),t=Hi(r,e,a),t!==null&&(Vn(t,r,a,s),Ho(t,r,a)),a}function El(t){if(t=t.current,!t.child)return null;switch(t.child.tag){case 5:return t.child.stateNode;default:return t.child.stateNode}}function Mp(t,e){if(t=t.memoizedState,t!==null&&t.dehydrated!==null){var n=t.retryLane;t.retryLane=n!==0&&n<e?n:e}}function Bh(t,e){Mp(t,e),(t=t.alternate)&&Mp(t,e)}function py(){return null}var qx=typeof reportError=="function"?reportError:function(t){console.error(t)};function Hh(t){this._internalRoot=t}Gl.prototype.render=Hh.prototype.render=function(t){var e=this._internalRoot;if(e===null)throw Error(ae(409));Vl(t,e,null,null)};Gl.prototype.unmount=Hh.prototype.unmount=function(){var t=this._internalRoot;if(t!==null){this._internalRoot=null;var e=t.containerInfo;Ar(function(){Vl(null,t,null,null)}),e[mi]=null}};function Gl(t){this._internalRoot=t}Gl.prototype.unstable_scheduleHydration=function(t){if(t){var e=b0();t={blockedOn:null,target:t,priority:e};for(var n=0;n<Di.length&&e!==0&&e<Di[n].priority;n++);Di.splice(n,0,t),n===0&&T0(t)}};function Vh(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)}function Wl(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11&&(t.nodeType!==8||t.nodeValue!==" react-mount-point-unstable "))}function bp(){}function my(t,e,n,i,r){if(r){if(typeof i=="function"){var s=i;i=function(){var u=El(a);s.call(u)}}var a=Xx(e,i,t,0,null,!1,!1,"",bp);return t._reactRootContainer=a,t[mi]=a.current,Ta(t.nodeType===8?t.parentNode:t),Ar(),a}for(;r=t.lastChild;)t.removeChild(r);if(typeof i=="function"){var o=i;i=function(){var u=El(c);o.call(u)}}var c=jh(t,0,!1,null,null,!1,!1,"",bp);return t._reactRootContainer=c,t[mi]=c.current,Ta(t.nodeType===8?t.parentNode:t),Ar(function(){Vl(e,c,n,i)}),c}function Xl(t,e,n,i,r){var s=n._reactRootContainer;if(s){var a=s;if(typeof r=="function"){var o=r;r=function(){var c=El(a);o.call(c)}}Vl(e,a,t,r)}else a=my(n,e,t,r,i);return El(a)}w0=function(t){switch(t.tag){case 3:var e=t.stateNode;if(e.current.memoizedState.isDehydrated){var n=ra(e.pendingLanes);n!==0&&(lh(e,n|1),on(e,yt()),!(Ke&6)&&(Ms=yt()+500,er()))}break;case 13:Ar(function(){var i=xi(t,1);if(i!==null){var r=Xt();Vn(i,t,1,r)}}),Bh(t,1)}};ch=function(t){if(t.tag===13){var e=xi(t,134217728);if(e!==null){var n=Xt();Vn(e,t,134217728,n)}Bh(t,134217728)}};M0=function(t){if(t.tag===13){var e=Gi(t),n=xi(t,e);if(n!==null){var i=Xt();Vn(n,t,e,i)}Bh(t,e)}};b0=function(){return it};E0=function(t,e){var n=it;try{return it=t,e()}finally{it=n}};wu=function(t,e,n){switch(e){case"input":if(mu(t,n),e=n.name,n.type==="radio"&&e!=null){for(n=t;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll("input[name="+JSON.stringify(""+e)+'][type="radio"]'),e=0;e<n.length;e++){var i=n[e];if(i!==t&&i.form===t.form){var r=Ul(i);if(!r)throw Error(ae(90));n0(i),mu(i,r)}}}break;case"textarea":r0(t,n);break;case"select":e=n.value,e!=null&&os(t,!!n.multiple,e,!1)}};d0=Uh;h0=Ar;var xy={usingClientEntryPoint:!1,Events:[Ba,Jr,Ul,c0,u0,Uh]},$s={findFiberByHostInstance:xr,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},gy={bundleType:$s.bundleType,version:$s.version,rendererPackageName:$s.rendererPackageName,rendererConfig:$s.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:yi.ReactCurrentDispatcher,findHostInstanceByFiber:function(t){return t=m0(t),t===null?null:t.stateNode},findFiberByHostInstance:$s.findFiberByHostInstance||py,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var fo=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!fo.isDisabled&&fo.supportsFiber)try{Ll=fo.inject(gy),Kn=fo}catch{}}gn.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=xy;gn.createPortal=function(t,e){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!Vh(e))throw Error(ae(200));return fy(t,e,null,n)};gn.createRoot=function(t,e){if(!Vh(t))throw Error(ae(299));var n=!1,i="",r=qx;return e!=null&&(e.unstable_strictMode===!0&&(n=!0),e.identifierPrefix!==void 0&&(i=e.identifierPrefix),e.onRecoverableError!==void 0&&(r=e.onRecoverableError)),e=jh(t,1,!1,null,null,n,!1,i,r),t[mi]=e.current,Ta(t.nodeType===8?t.parentNode:t),new Hh(e)};gn.findDOMNode=function(t){if(t==null)return null;if(t.nodeType===1)return t;var e=t._reactInternals;if(e===void 0)throw typeof t.render=="function"?Error(ae(188)):(t=Object.keys(t).join(","),Error(ae(268,t)));return t=m0(e),t=t===null?null:t.stateNode,t};gn.flushSync=function(t){return Ar(t)};gn.hydrate=function(t,e,n){if(!Wl(e))throw Error(ae(200));return Xl(null,t,e,!0,n)};gn.hydrateRoot=function(t,e,n){if(!Vh(t))throw Error(ae(405));var i=n!=null&&n.hydratedSources||null,r=!1,s="",a=qx;if(n!=null&&(n.unstable_strictMode===!0&&(r=!0),n.identifierPrefix!==void 0&&(s=n.identifierPrefix),n.onRecoverableError!==void 0&&(a=n.onRecoverableError)),e=Xx(e,null,t,1,n??null,r,!1,s,a),t[mi]=e.current,Ta(t),i)for(t=0;t<i.length;t++)n=i[t],r=n._getVersion,r=r(n._source),e.mutableSourceEagerHydrationData==null?e.mutableSourceEagerHydrationData=[n,r]:e.mutableSourceEagerHydrationData.push(n,r);return new Gl(e)};gn.render=function(t,e,n){if(!Wl(e))throw Error(ae(200));return Xl(null,t,e,!1,n)};gn.unmountComponentAtNode=function(t){if(!Wl(t))throw Error(ae(40));return t._reactRootContainer?(Ar(function(){Xl(null,null,t,!1,function(){t._reactRootContainer=null,t[mi]=null})}),!0):!1};gn.unstable_batchedUpdates=Uh;gn.unstable_renderSubtreeIntoContainer=function(t,e,n,i){if(!Wl(n))throw Error(ae(200));if(t==null||t._reactInternals===void 0)throw Error(ae(38));return Xl(t,e,n,!1,i)};gn.version="18.3.1-next-f1338f8080-20240426";function $x(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE($x)}catch(t){console.error(t)}}$x(),$m.exports=gn;var vy=$m.exports,Ep=vy;lu.createRoot=Ep.createRoot,lu.hydrateRoot=Ep.hydrateRoot;var Tp="1.3.26";function Yx(t,e,n){return Math.max(t,Math.min(e,n))}function _y(t,e,n){return(1-n)*t+n*e}function yy(t,e,n,i){return _y(t,e,1-Math.exp(-n*i))}function Sy(t,e){return(t%e+e)%e}var wy=class{constructor(){we(this,"isRunning",!1);we(this,"value",0);we(this,"from",0);we(this,"to",0);we(this,"currentTime",0);we(this,"lerp");we(this,"duration");we(this,"easing");we(this,"onUpdate")}advance(t){var n;if(!this.isRunning)return;let e=!1;if(this.duration&&this.easing){this.currentTime+=t;const i=Yx(0,this.currentTime/this.duration,1);e=i>=1;const r=e?1:this.easing(i);this.value=this.from+(this.to-this.from)*r}else this.lerp?(this.value=yy(this.value,this.to,this.lerp*60,t),Math.round(this.value)===Math.round(this.to)&&(this.value=this.to,e=!0)):(this.value=this.to,e=!0);e&&this.stop(),(n=this.onUpdate)==null||n.call(this,this.value,e)}stop(){this.isRunning=!1}fromTo(t,e,{lerp:n,duration:i,easing:r,onStart:s,onUpdate:a}){this.from=this.value=t,this.to=e,this.lerp=n,this.duration=i,this.easing=r,this.currentTime=0,this.isRunning=!0,s==null||s(),this.onUpdate=a}};function My(t,e){let n;return function(...i){clearTimeout(n),n=setTimeout(()=>{n=void 0,t.apply(this,i)},e)}}var by=class{constructor(t,e,{autoResize:n=!0,debounce:i=250}={}){we(this,"width",0);we(this,"height",0);we(this,"scrollHeight",0);we(this,"scrollWidth",0);we(this,"debouncedResize");we(this,"wrapperResizeObserver");we(this,"contentResizeObserver");we(this,"resize",()=>{this.onWrapperResize(),this.onContentResize()});we(this,"onWrapperResize",()=>{this.wrapper instanceof Window?(this.width=window.innerWidth,this.height=window.innerHeight):(this.width=this.wrapper.clientWidth,this.height=this.wrapper.clientHeight)});we(this,"onContentResize",()=>{this.wrapper instanceof Window?(this.scrollHeight=this.content.scrollHeight,this.scrollWidth=this.content.scrollWidth):(this.scrollHeight=this.wrapper.scrollHeight,this.scrollWidth=this.wrapper.scrollWidth)});this.wrapper=t,this.content=e,n&&(this.debouncedResize=My(this.resize,i),this.wrapper instanceof Window?window.addEventListener("resize",this.debouncedResize):(this.wrapperResizeObserver=new ResizeObserver(this.debouncedResize),this.wrapperResizeObserver.observe(this.wrapper)),this.contentResizeObserver=new ResizeObserver(this.debouncedResize),this.contentResizeObserver.observe(this.content)),this.resize()}destroy(){var t,e;(t=this.wrapperResizeObserver)==null||t.disconnect(),(e=this.contentResizeObserver)==null||e.disconnect(),this.wrapper===window&&this.debouncedResize&&window.removeEventListener("resize",this.debouncedResize)}get limit(){return{x:this.scrollWidth-this.width,y:this.scrollHeight-this.height}}},Kx=class{constructor(){we(this,"events",{})}emit(t,...e){var i;const n=this.events[t]||[];for(let r=0,s=n.length;r<s;r++)(i=n[r])==null||i.call(n,...e)}on(t,e){return this.events[t]?this.events[t].push(e):this.events[t]=[e],()=>{var n;this.events[t]=(n=this.events[t])==null?void 0:n.filter(i=>e!==i)}}off(t,e){var n;this.events[t]=(n=this.events[t])==null?void 0:n.filter(i=>e!==i)}destroy(){this.events={}}};const Ey=100/6,Mi={passive:!1};function Ap(t,e){return t===1?Ey:t===2?e:1}var Ty=class{constructor(t,e={wheelMultiplier:1,touchMultiplier:1}){we(this,"touchStart",{x:0,y:0});we(this,"lastDelta",{x:0,y:0});we(this,"window",{width:0,height:0});we(this,"emitter",new Kx);we(this,"onTouchStart",t=>{const{clientX:e,clientY:n}=t.targetTouches?t.targetTouches[0]:t;this.touchStart.x=e,this.touchStart.y=n,this.lastDelta={x:0,y:0},this.emitter.emit("scroll",{deltaX:0,deltaY:0,event:t})});we(this,"onTouchMove",t=>{const{clientX:e,clientY:n}=t.targetTouches?t.targetTouches[0]:t,i=-(e-this.touchStart.x)*this.options.touchMultiplier,r=-(n-this.touchStart.y)*this.options.touchMultiplier;this.touchStart.x=e,this.touchStart.y=n,this.lastDelta={x:i,y:r},this.emitter.emit("scroll",{deltaX:i,deltaY:r,event:t})});we(this,"onTouchEnd",t=>{this.emitter.emit("scroll",{deltaX:this.lastDelta.x,deltaY:this.lastDelta.y,event:t})});we(this,"onWheel",t=>{let{deltaX:e,deltaY:n,deltaMode:i}=t;const r=Ap(i,this.window.width),s=Ap(i,this.window.height);e*=r,n*=s,e*=this.options.wheelMultiplier,n*=this.options.wheelMultiplier,this.emitter.emit("scroll",{deltaX:e,deltaY:n,event:t})});we(this,"onWindowResize",()=>{this.window={width:window.innerWidth,height:window.innerHeight}});this.element=t,this.options=e,window.addEventListener("resize",this.onWindowResize),this.onWindowResize(),this.element.addEventListener("wheel",this.onWheel,Mi),this.element.addEventListener("touchstart",this.onTouchStart,Mi),this.element.addEventListener("touchmove",this.onTouchMove,Mi),this.element.addEventListener("touchend",this.onTouchEnd,Mi)}on(t,e){return this.emitter.on(t,e)}destroy(){this.emitter.destroy(),window.removeEventListener("resize",this.onWindowResize),this.element.removeEventListener("wheel",this.onWheel,Mi),this.element.removeEventListener("touchstart",this.onTouchStart,Mi),this.element.removeEventListener("touchmove",this.onTouchMove,Mi),this.element.removeEventListener("touchend",this.onTouchEnd,Mi)}};const Cp=t=>Math.min(1,1.001-2**(-10*t));var Ay=class{constructor({wrapper:t=window,content:e=document.documentElement,eventsTarget:n=t,smoothWheel:i=!0,syncTouch:r=!1,syncTouchLerp:s=.075,touchInertiaExponent:a=1.7,duration:o,easing:c,lerp:u=.1,infinite:f=!1,orientation:p="vertical",gestureOrientation:h=p==="horizontal"?"both":"vertical",touchMultiplier:x=1,wheelMultiplier:_=1,autoResize:S=!0,prevent:m,virtualScroll:d,overscroll:g=!0,autoRaf:v=!1,anchors:w=!1,autoToggle:R=!1,allowNestedScroll:E=!1,__experimental__naiveDimensions:A=!1,naiveDimensions:N=A,stopInertiaOnNavigate:F=!1,respectReducedMotion:y=!0}={}){we(this,"_isScrolling",!1);we(this,"_isStopped",!1);we(this,"_isLocked",!1);we(this,"_preventNextNativeScrollEvent",!1);we(this,"_resetVelocityTimeout",null);we(this,"_rafId",null);we(this,"_isDraggingSelection",!1);we(this,"reducedMotionMediaQuery",window.matchMedia("(prefers-reduced-motion: reduce)"));we(this,"isTouching");we(this,"isIos");we(this,"time",0);we(this,"userData",{});we(this,"lastVelocity",0);we(this,"velocity",0);we(this,"direction",0);we(this,"options");we(this,"targetScroll");we(this,"animatedScroll");we(this,"animate",new wy);we(this,"emitter",new Kx);we(this,"dimensions");we(this,"virtualScroll");we(this,"onScrollEnd",t=>{t instanceof CustomEvent||(this.isScrolling==="smooth"||this.isScrolling===!1)&&t.stopPropagation()});we(this,"dispatchScrollendEvent",()=>{this.options.wrapper.dispatchEvent(new CustomEvent("scrollend",{bubbles:this.options.wrapper===window,detail:{lenisScrollEnd:!0}}))});we(this,"onTransitionEnd",t=>{var e;(e=t.propertyName)!=null&&e.includes("overflow")&&t.target===this.rootElement&&this.checkOverflow()});we(this,"onClick",t=>{const e=t.composedPath().filter(i=>i instanceof HTMLAnchorElement&&i.href).map(i=>new URL(i.href)),n=new URL(window.location.href);if(this.options.anchors){const i=e.find(r=>n.host===r.host&&n.pathname===r.pathname&&r.hash);if(i){const r=typeof this.options.anchors=="object"&&this.options.anchors?this.options.anchors:void 0,s=decodeURIComponent(i.hash);this.scrollTo(s,r);return}}if(this.options.stopInertiaOnNavigate&&e.some(i=>n.host===i.host&&n.pathname!==i.pathname)){this.reset();return}});we(this,"onPointerDown",t=>{t.button===1&&this.reset()});we(this,"onVirtualScroll",t=>{if(typeof this.options.virtualScroll=="function"&&this.options.virtualScroll(t)===!1)return;const{deltaX:e,deltaY:n,event:i}=t;if(this.emitter.emit("virtual-scroll",{deltaX:e,deltaY:n,event:i}),i.ctrlKey||i.lenisStopPropagation)return;const r=i.type.includes("touch"),s=i.type.includes("wheel");if(r&&this.isIos&&(i.type==="touchstart"&&(this._isDraggingSelection=this.isTouchOnSelectionHandle(i)),this._isDraggingSelection)){i.type==="touchend"&&(this._isDraggingSelection=!1);return}this.isTouching=i.type==="touchstart"||i.type==="touchmove";const a=e===0&&n===0;if(this.options.syncTouch&&r&&i.type==="touchstart"&&a&&!this.isStopped&&!this.isLocked){this.reset();return}const o=this.options.gestureOrientation==="vertical"&&n===0||this.options.gestureOrientation==="horizontal"&&e===0;if(a||o)return;let c=i.composedPath();c=c.slice(0,c.indexOf(this.rootElement));const u=this.options.prevent,f=Math.abs(e)>=Math.abs(n)?"horizontal":"vertical";if(c.find(_=>{var S,m,d,g,v;return _ instanceof HTMLElement&&(typeof u=="function"&&(u==null?void 0:u(_))||((S=_.hasAttribute)==null?void 0:S.call(_,"data-lenis-prevent"))||f==="vertical"&&((m=_.hasAttribute)==null?void 0:m.call(_,"data-lenis-prevent-vertical"))||f==="horizontal"&&((d=_.hasAttribute)==null?void 0:d.call(_,"data-lenis-prevent-horizontal"))||r&&((g=_.hasAttribute)==null?void 0:g.call(_,"data-lenis-prevent-touch"))||s&&((v=_.hasAttribute)==null?void 0:v.call(_,"data-lenis-prevent-wheel"))||this.options.allowNestedScroll&&this.hasNestedScroll(_,{deltaX:e,deltaY:n}))}))return;if(this.isStopped||this.isLocked){i.cancelable&&i.preventDefault();return}if(!(this.options.syncTouch&&r||this.options.smoothWheel&&s)){this.isScrolling="native",this.animate.stop(),i.lenisStopPropagation=!0;return}let p=n;this.options.gestureOrientation==="both"?p=Math.abs(n)>Math.abs(e)?n:e:this.options.gestureOrientation==="horizontal"&&(p=e),(!this.options.overscroll||this.options.infinite||this.options.wrapper!==window&&this.limit>0&&(this.animatedScroll>0&&this.animatedScroll<this.limit||this.animatedScroll===0&&n>0||this.animatedScroll===this.limit&&n<0))&&(i.lenisStopPropagation=!0),i.cancelable&&i.preventDefault();const h=r&&this.options.syncTouch,x=r&&i.type==="touchend";x&&(p=Math.sign(p)*Math.abs(this.velocity)**this.options.touchInertiaExponent),this.scrollTo(this.targetScroll+p,{programmatic:!1,...h?{lerp:x?this.options.syncTouchLerp:1}:{lerp:this.options.lerp,duration:this.options.duration,easing:this.options.easing}})});we(this,"onNativeScroll",()=>{if(this._resetVelocityTimeout!==null&&(clearTimeout(this._resetVelocityTimeout),this._resetVelocityTimeout=null),this._preventNextNativeScrollEvent){this._preventNextNativeScrollEvent=!1;return}if(this.isScrolling===!1||this.isScrolling==="native"){const t=this.animatedScroll;this.animatedScroll=this.targetScroll=this.actualScroll,this.lastVelocity=this.velocity,this.velocity=this.animatedScroll-t,this.direction=Math.sign(this.animatedScroll-t),this.isStopped||(this.isScrolling="native"),this.emit(),this.velocity!==0&&(this._resetVelocityTimeout=setTimeout(()=>{this.lastVelocity=this.velocity,this.velocity=0,this.isScrolling=!1,this.emit()},400))}});we(this,"raf",t=>{const e=t-(this.time||t);this.time=t,this.animate.advance(e*.001),this.options.autoRaf&&(this._rafId=requestAnimationFrame(this.raf))});window.lenisVersion=Tp,window.lenis||(window.lenis={}),window.lenis.version=Tp,p==="horizontal"&&(window.lenis.horizontal=!0),r===!0&&(window.lenis.touch=!0),this.isIos=/(iPad|iPhone|iPod)/g.test(navigator.userAgent),(!t||t===document.documentElement)&&(t=window),typeof o=="number"&&typeof c!="function"?c=Cp:typeof c=="function"&&typeof o!="number"&&(o=1),this.options={wrapper:t,content:e,eventsTarget:n,smoothWheel:i,syncTouch:r,syncTouchLerp:s,touchInertiaExponent:a,duration:o,easing:c,lerp:u,infinite:f,gestureOrientation:h,orientation:p,touchMultiplier:x,wheelMultiplier:_,autoResize:S,prevent:m,virtualScroll:d,overscroll:g,autoRaf:v,anchors:w,autoToggle:R,allowNestedScroll:E,naiveDimensions:N,stopInertiaOnNavigate:F,respectReducedMotion:y},this.dimensions=new by(t,e,{autoResize:S}),this.updateClassName(),this.targetScroll=this.animatedScroll=this.actualScroll,this.options.wrapper.addEventListener("scroll",this.onNativeScroll),this.options.wrapper.addEventListener("scrollend",this.onScrollEnd,{capture:!0}),(this.options.anchors||this.options.stopInertiaOnNavigate)&&this.options.wrapper.addEventListener("click",this.onClick),this.options.wrapper.addEventListener("pointerdown",this.onPointerDown),this.virtualScroll=new Ty(n,{touchMultiplier:x,wheelMultiplier:_}),this.virtualScroll.on("scroll",this.onVirtualScroll),this.options.autoToggle&&(this.checkOverflow(),this.rootElement.addEventListener("transitionend",this.onTransitionEnd)),this.options.autoRaf&&(this._rafId=requestAnimationFrame(this.raf))}destroy(){this.emitter.destroy(),this.options.wrapper.removeEventListener("scroll",this.onNativeScroll),this.options.wrapper.removeEventListener("scrollend",this.onScrollEnd,{capture:!0}),this.options.wrapper.removeEventListener("pointerdown",this.onPointerDown),(this.options.anchors||this.options.stopInertiaOnNavigate)&&this.options.wrapper.removeEventListener("click",this.onClick),this.virtualScroll.destroy(),this.dimensions.destroy(),this.cleanUpClassName(),this._rafId&&cancelAnimationFrame(this._rafId)}on(t,e){return this.emitter.on(t,e)}off(t,e){return this.emitter.off(t,e)}get overflow(){const t=this.isHorizontal?"overflow-x":"overflow-y";return getComputedStyle(this.rootElement)[t]}checkOverflow(){["hidden","clip"].includes(this.overflow)?this.internalStop():this.internalStart()}setScroll(t){this.isHorizontal?this.options.wrapper.scrollTo({left:t,behavior:"instant"}):this.options.wrapper.scrollTo({top:t,behavior:"instant"})}isTouchOnSelectionHandle(t){const e=window.getSelection();if(!e||e.isCollapsed||e.rangeCount===0)return!1;const n=t.targetTouches[0]??t.changedTouches[0];if(!n)return!1;const i=e.getRangeAt(0).getClientRects();if(i.length===0)return!1;const r=i[0],s=i[i.length-1],a=40,o=Math.hypot(n.clientX-r.left,n.clientY-r.top)<=a,c=Math.hypot(n.clientX-s.right,n.clientY-s.bottom)<=a;return o||c}resize(){this.dimensions.resize(),this.animatedScroll=this.targetScroll=this.actualScroll,this.emit()}emit(){this.emitter.emit("scroll",this)}reset(){this.isLocked=!1,this.isScrolling=!1,this.animatedScroll=this.targetScroll=this.actualScroll,this.lastVelocity=this.velocity=0,this.animate.stop()}start(){if(this.isStopped){if(this.options.autoToggle){this.rootElement.style.removeProperty("overflow");return}this.internalStart()}}internalStart(){this.isStopped&&(this.reset(),this.isStopped=!1,this.emit())}stop(){if(!this.isStopped){if(this.options.autoToggle){this.rootElement.style.setProperty("overflow","clip");return}this.internalStop()}}internalStop(){this.isStopped||(this.reset(),this.isStopped=!0,this.emit())}scrollTo(t,{offset:e=0,immediate:n=!1,lock:i=!1,programmatic:r=!0,lerp:s=r?this.options.lerp:void 0,duration:a=r?this.options.duration:void 0,easing:o=r?this.options.easing:void 0,onStart:c,onComplete:u,force:f=!1,userData:p}={}){if(this.prefersReducedMotion&&(r?n=!0:(s=1,a=void 0,o=void 0)),(this.isStopped||this.isLocked)&&!f)return;let h=t,x=e;if(typeof h=="string"&&["top","left","start","#"].includes(h))h=0;else if(typeof h=="string"&&["bottom","right","end"].includes(h))h=this.limit;else{let _=null;if(typeof h=="string"?(_=h.startsWith("#")?document.getElementById(h.slice(1)):document.querySelector(h),_||(h==="#top"?h=0:console.warn("Lenis: Target not found",h))):h instanceof HTMLElement&&(h!=null&&h.nodeType)&&(_=h),_){if(this.options.wrapper!==window){const w=this.rootElement.getBoundingClientRect();x-=this.isHorizontal?w.left:w.top}const S=_.getBoundingClientRect(),m=getComputedStyle(_),d=this.isHorizontal?Number.parseFloat(m.scrollMarginLeft):Number.parseFloat(m.scrollMarginTop),g=getComputedStyle(this.rootElement),v=this.isHorizontal?Number.parseFloat(g.scrollPaddingLeft):Number.parseFloat(g.scrollPaddingTop);h=(this.isHorizontal?S.left:S.top)+this.animatedScroll-(Number.isNaN(d)?0:d)-(Number.isNaN(v)?0:v)}}if(typeof h=="number"){if(h+=x,this.options.infinite){if(r){this.targetScroll=this.animatedScroll=this.scroll;const _=h-this.animatedScroll;_>this.limit/2?h-=this.limit:_<-this.limit/2&&(h+=this.limit)}}else h=Yx(0,h,this.limit);if(h===this.targetScroll){c==null||c(this),u==null||u(this);return}if(this.userData=p??{},n){this.animatedScroll=this.targetScroll=h,this.setScroll(this.scroll),this.reset(),this.preventNextNativeScrollEvent(),this.emit(),u==null||u(this),this.userData={},requestAnimationFrame(()=>{this.dispatchScrollendEvent()});return}r||(this.targetScroll=h),typeof a=="number"&&typeof o!="function"?o=Cp:typeof o=="function"&&typeof a!="number"&&(a=1),this.animate.fromTo(this.animatedScroll,h,{duration:a,easing:o,lerp:s,onStart:()=>{i&&(this.isLocked=!0),this.isScrolling="smooth",c==null||c(this)},onUpdate:(_,S)=>{this.isScrolling="smooth",this.lastVelocity=this.velocity,this.velocity=_-this.animatedScroll,this.direction=Math.sign(this.velocity),this.animatedScroll=_,this.setScroll(this.scroll),r&&(this.targetScroll=_),S||this.emit(),S&&(this.reset(),this.emit(),u==null||u(this),this.userData={},requestAnimationFrame(()=>{this.dispatchScrollendEvent()}),this.preventNextNativeScrollEvent())}})}}preventNextNativeScrollEvent(){this._preventNextNativeScrollEvent=!0,requestAnimationFrame(()=>{this._preventNextNativeScrollEvent=!1})}hasNestedScroll(t,{deltaX:e,deltaY:n}){const i=Date.now();t._lenis||(t._lenis={});const r=t._lenis;let s,a,o,c,u,f,p,h,x,_;if(i-(r.time??0)>2e3){r.time=Date.now();const E=window.getComputedStyle(t);if(r.computedStyle=E,s=["auto","overlay","scroll"].includes(E.overflowX),a=["auto","overlay","scroll"].includes(E.overflowY),u=["auto"].includes(E.overscrollBehaviorX),f=["auto"].includes(E.overscrollBehaviorY),r.hasOverflowX=s,r.hasOverflowY=a,!(s||a))return!1;p=t.scrollWidth,h=t.scrollHeight,x=t.clientWidth,_=t.clientHeight,o=p>x,c=h>_,r.isScrollableX=o,r.isScrollableY=c,r.scrollWidth=p,r.scrollHeight=h,r.clientWidth=x,r.clientHeight=_,r.hasOverscrollBehaviorX=u,r.hasOverscrollBehaviorY=f}else o=r.isScrollableX,c=r.isScrollableY,s=r.hasOverflowX,a=r.hasOverflowY,p=r.scrollWidth,h=r.scrollHeight,x=r.clientWidth,_=r.clientHeight,u=r.hasOverscrollBehaviorX,f=r.hasOverscrollBehaviorY;if(!(s&&o||a&&c))return!1;const S=Math.abs(e)>=Math.abs(n)?"horizontal":"vertical";let m,d,g,v,w,R;if(S==="horizontal")m=Math.round(t.scrollLeft),d=p-x,g=e,v=s,w=o,R=u;else if(S==="vertical")m=Math.round(t.scrollTop),d=h-_,g=n,v=a,w=c,R=f;else return!1;return!R&&(m>=d||m<=0)?!0:(g>0?m<d:m>0)&&v&&w}get rootElement(){return this.options.wrapper===window?document.documentElement:this.options.wrapper}get limit(){return this.options.naiveDimensions?this.isHorizontal?this.rootElement.scrollWidth-this.rootElement.clientWidth:this.rootElement.scrollHeight-this.rootElement.clientHeight:this.dimensions.limit[this.isHorizontal?"x":"y"]}get isHorizontal(){return this.options.orientation==="horizontal"}get actualScroll(){const t=this.options.wrapper;return this.isHorizontal?t.scrollX??t.scrollLeft:t.scrollY??t.scrollTop}get scroll(){return this.options.infinite?Sy(this.animatedScroll,this.limit):this.animatedScroll}get progress(){return this.limit===0?1:this.scroll/this.limit}get isScrolling(){return this._isScrolling}set isScrolling(t){this._isScrolling!==t&&(this._isScrolling=t,this.updateClassName())}get isStopped(){return this._isStopped}set isStopped(t){this._isStopped!==t&&(this._isStopped=t,this.updateClassName())}get isLocked(){return this._isLocked}set isLocked(t){this._isLocked!==t&&(this._isLocked=t,this.updateClassName())}get isSmooth(){return this.isScrolling==="smooth"}get prefersReducedMotion(){return this.options.respectReducedMotion&&this.reducedMotionMediaQuery.matches}get className(){let t="lenis";return this.options.autoToggle&&(t+=" lenis-autoToggle"),this.isStopped&&(t+=" lenis-stopped"),this.isLocked&&(t+=" lenis-locked"),this.isScrolling&&(t+=" lenis-scrolling"),this.isScrolling==="smooth"&&(t+=" lenis-smooth"),t}updateClassName(){this.cleanUpClassName(),this.className.split(" ").forEach(t=>{this.rootElement.classList.add(t)})}cleanUpClassName(){for(const t of Array.from(this.rootElement.classList))(t==="lenis"||t.startsWith("lenis-"))&&this.rootElement.classList.remove(t)}};/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Cy=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),Zx=(...t)=>t.filter((e,n,i)=>!!e&&e.trim()!==""&&i.indexOf(e)===n).join(" ").trim();/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var Ny={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ry=ne.forwardRef(({color:t="currentColor",size:e=24,strokeWidth:n=2,absoluteStrokeWidth:i,className:r="",children:s,iconNode:a,...o},c)=>ne.createElement("svg",{ref:c,...Ny,width:e,height:e,stroke:t,strokeWidth:i?Number(n)*24/Number(e):n,className:Zx("lucide",r),...o},[...a.map(([u,f])=>ne.createElement(u,f)),...Array.isArray(s)?s:[s]]));/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ee=(t,e)=>{const n=ne.forwardRef(({className:i,...r},s)=>ne.createElement(Ry,{ref:s,iconNode:e,className:Zx(`lucide-${Cy(t)}`,i),...r}));return n.displayName=`${t}`,n};/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Py=Ee("Activity",[["path",{d:"M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",key:"169zse"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ql=Ee("Award",[["path",{d:"m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526",key:"1yiouv"}],["circle",{cx:"12",cy:"8",r:"6",key:"1vp47v"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ly=Ee("Baby",[["path",{d:"M9 12h.01",key:"157uk2"}],["path",{d:"M15 12h.01",key:"1k8ypt"}],["path",{d:"M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5",key:"1u7htd"}],["path",{d:"M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1",key:"5yv0yz"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const bs=Ee("BookOpen",[["path",{d:"M12 7v14",key:"1akyts"}],["path",{d:"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",key:"ruj8y"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Qx=Ee("Bot",[["path",{d:"M12 8V4H8",key:"hb8ula"}],["rect",{width:"16",height:"12",x:"4",y:"8",rx:"2",key:"enze0r"}],["path",{d:"M2 14h2",key:"vft8re"}],["path",{d:"M20 14h2",key:"4cs60a"}],["path",{d:"M15 13v2",key:"1xurst"}],["path",{d:"M9 13v2",key:"rq6x2g"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Dy=Ee("Brain",[["path",{d:"M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z",key:"l5xja"}],["path",{d:"M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z",key:"ep3f8r"}],["path",{d:"M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4",key:"1p4c4q"}],["path",{d:"M17.599 6.5a3 3 0 0 0 .399-1.375",key:"tmeiqw"}],["path",{d:"M6.003 5.125A3 3 0 0 0 6.401 6.5",key:"105sqy"}],["path",{d:"M3.477 10.896a4 4 0 0 1 .585-.396",key:"ql3yin"}],["path",{d:"M19.938 10.5a4 4 0 0 1 .585.396",key:"1qfode"}],["path",{d:"M6 18a4 4 0 0 1-1.967-.516",key:"2e4loj"}],["path",{d:"M19.967 17.484A4 4 0 0 1 18 18",key:"159ez6"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ga=Ee("Briefcase",[["path",{d:"M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16",key:"jecpp"}],["rect",{width:"20",height:"14",x:"2",y:"6",rx:"2",key:"i6l2r4"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ky=Ee("Calendar",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Es=Ee("Check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Iy=Ee("ChevronDown",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Uy=Ee("ChevronLeft",[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Jx=Ee("ChevronRight",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Fy=Ee("ChevronUp",[["path",{d:"m18 15-6-6-6 6",key:"153udz"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const eg=Ee("CircleAlert",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const td=Ee("CircleCheck",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Oy=Ee("CircleHelp",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3",key:"1u773s"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const zy=Ee("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ts=Ee("Coins",[["circle",{cx:"8",cy:"8",r:"6",key:"3yglwk"}],["path",{d:"M18.09 10.37A6 6 0 1 1 10.34 18",key:"t5s6rm"}],["path",{d:"M7 6h1v4",key:"1obek4"}],["path",{d:"m16.71 13.88.7.71-2.82 2.82",key:"1rbuyh"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const nd=Ee("Compass",[["path",{d:"m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z",key:"9ktpf1"}],["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const tg=Ee("Copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const jy=Ee("CornerDownLeft",[["polyline",{points:"9 10 4 15 9 20",key:"r3jprv"}],["path",{d:"M20 4v7a4 4 0 0 1-4 4H4",key:"6o5b7l"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ng=Ee("ExternalLink",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ig=Ee("Flame",[["path",{d:"M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",key:"96xj49"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const By=Ee("Gamepad2",[["line",{x1:"6",x2:"10",y1:"11",y2:"11",key:"1gktln"}],["line",{x1:"8",x2:"8",y1:"9",y2:"13",key:"qnk9ow"}],["line",{x1:"15",x2:"15.01",y1:"12",y2:"12",key:"krot7o"}],["line",{x1:"18",x2:"18.01",y1:"10",y2:"10",key:"1lcuu1"}],["path",{d:"M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z",key:"mfqc10"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const id=Ee("Gift",[["rect",{x:"3",y:"8",width:"18",height:"4",rx:"1",key:"bkv52"}],["path",{d:"M12 8v13",key:"1c76mn"}],["path",{d:"M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7",key:"6wjy6b"}],["path",{d:"M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5",key:"1ihvrl"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const rd=Ee("Globe",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",key:"13o1zl"}],["path",{d:"M2 12h20",key:"9i4pu4"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Hy=Ee("HeartHandshake",[["path",{d:"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",key:"c3ymky"}],["path",{d:"M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66",key:"4oyue0"}],["path",{d:"m18 15-2-2",key:"60u0ii"}],["path",{d:"m15 18-2-2",key:"6p76be"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ui=Ee("Heart",[["path",{d:"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",key:"c3ymky"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Vy=Ee("LayoutGrid",[["rect",{width:"7",height:"7",x:"3",y:"3",rx:"1",key:"1g98yp"}],["rect",{width:"7",height:"7",x:"14",y:"3",rx:"1",key:"6d4xhi"}],["rect",{width:"7",height:"7",x:"14",y:"14",rx:"1",key:"nxv5o0"}],["rect",{width:"7",height:"7",x:"3",y:"14",rx:"1",key:"1bb6yr"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Gy=Ee("Lock",[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Wy=Ee("Map",[["path",{d:"M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z",key:"169xi5"}],["path",{d:"M15 5.764v15",key:"1pn4in"}],["path",{d:"M9 3.236v15",key:"1uimfh"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Xy=Ee("Menu",[["line",{x1:"4",x2:"20",y1:"12",y2:"12",key:"1e0a9i"}],["line",{x1:"4",x2:"20",y1:"6",y2:"6",key:"1owob3"}],["line",{x1:"4",x2:"20",y1:"18",y2:"18",key:"yk5zj1"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const qy=Ee("MessageCircle",[["path",{d:"M7.9 20A9 9 0 1 0 4 16.1L2 22Z",key:"vv11sd"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $y=Ee("MessageSquare",[["path",{d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",key:"1lielz"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Yy=Ee("Palette",[["circle",{cx:"13.5",cy:"6.5",r:".5",fill:"currentColor",key:"1okk4w"}],["circle",{cx:"17.5",cy:"10.5",r:".5",fill:"currentColor",key:"f64h9f"}],["circle",{cx:"8.5",cy:"7.5",r:".5",fill:"currentColor",key:"fotxhn"}],["circle",{cx:"6.5",cy:"12.5",r:".5",fill:"currentColor",key:"qy21gx"}],["path",{d:"M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z",key:"12rzf8"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ky=Ee("PenLine",[["path",{d:"M12 20h9",key:"t2du7b"}],["path",{d:"M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z",key:"1ykcvy"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Zy=Ee("Rocket",[["path",{d:"M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z",key:"m3kijz"}],["path",{d:"m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z",key:"1fmvmk"}],["path",{d:"M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0",key:"1f8sc4"}],["path",{d:"M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5",key:"qeys4"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $l=Ee("Search",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const fs=Ee("Share2",[["circle",{cx:"18",cy:"5",r:"3",key:"gq8acd"}],["circle",{cx:"6",cy:"12",r:"3",key:"w7nqdw"}],["circle",{cx:"18",cy:"19",r:"3",key:"1xt0gg"}],["line",{x1:"8.59",x2:"15.42",y1:"13.51",y2:"17.49",key:"47mynk"}],["line",{x1:"15.41",x2:"8.59",y1:"6.51",y2:"10.49",key:"1n3mei"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const rg=Ee("ShieldAlert",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"M12 8v4",key:"1got3b"}],["path",{d:"M12 16h.01",key:"1drbdi"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ia=Ee("ShieldCheck",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Np=Ee("Shield",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Qy=Ee("ShoppingBag",[["path",{d:"M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z",key:"hou9p0"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M16 10a4 4 0 0 1-8 0",key:"1ltviw"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const St=Ee("Sparkles",[["path",{d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",key:"4pj2yx"}],["path",{d:"M20 3v4",key:"1olli1"}],["path",{d:"M22 5h-4",key:"1gvqau"}],["path",{d:"M4 17v2",key:"vumght"}],["path",{d:"M5 18H3",key:"zchphs"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Jy=Ee("Tag",[["path",{d:"M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z",key:"vktsd0"}],["circle",{cx:"7.5",cy:"7.5",r:".5",fill:"currentColor",key:"kqv944"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const vi=Ee("Terminal",[["polyline",{points:"4 17 10 11 4 5",key:"akl6gq"}],["line",{x1:"12",x2:"20",y1:"19",y2:"19",key:"q2wloq"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const e1=Ee("Trash2",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const t1=Ee("TreePine",[["path",{d:"m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z",key:"cpyugq"}],["path",{d:"M12 22v-3",key:"kmzjlo"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const sg=Ee("User",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const sd=Ee("Users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75",key:"1da9ce"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const n1=Ee("Vault",[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["circle",{cx:"7.5",cy:"7.5",r:".5",fill:"currentColor",key:"kqv944"}],["path",{d:"m7.9 7.9 2.7 2.7",key:"hpeyl3"}],["circle",{cx:"16.5",cy:"7.5",r:".5",fill:"currentColor",key:"w0ekpg"}],["path",{d:"m13.4 10.6 2.7-2.7",key:"264c1n"}],["circle",{cx:"7.5",cy:"16.5",r:".5",fill:"currentColor",key:"nkw3mc"}],["path",{d:"m7.9 16.1 2.7-2.7",key:"p81g5e"}],["circle",{cx:"16.5",cy:"16.5",r:".5",fill:"currentColor",key:"fubopw"}],["path",{d:"m13.4 13.4 2.7 2.7",key:"abhel3"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const i1=Ee("Volume2",[["path",{d:"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",key:"uqj9uw"}],["path",{d:"M16 9a5 5 0 0 1 0 6",key:"1q6k2b"}],["path",{d:"M19.364 18.364a9 9 0 0 0 0-12.728",key:"ijwkga"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const r1=Ee("VolumeX",[["path",{d:"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",key:"uqj9uw"}],["line",{x1:"22",x2:"16",y1:"9",y2:"15",key:"1ewh16"}],["line",{x1:"16",x2:"22",y1:"9",y2:"15",key:"5ykzw1"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const As=Ee("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const s1=Ee("Zap",[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",key:"1xq2db"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const a1=Ee("ZoomIn",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["line",{x1:"21",x2:"16.65",y1:"21",y2:"16.65",key:"13gj7c"}],["line",{x1:"11",x2:"11",y1:"8",y2:"14",key:"1vmskp"}],["line",{x1:"8",x2:"14",y1:"11",y2:"11",key:"durymu"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const o1=Ee("ZoomOut",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["line",{x1:"21",x2:"16.65",y1:"21",y2:"16.65",key:"13gj7c"}],["line",{x1:"8",x2:"14",y1:"11",y2:"11",key:"durymu"}]]);function l1({lang:t,setLang:e,t:n}){const[i,r]=ne.useState(!1),s=()=>{const a=t==="pt"?"en":"pt";e(a),localStorage.setItem("pyxie_lang",a);const o=new URL(window.location.href);o.searchParams.set("lang",a),window.history.replaceState({},"",o)};return l.jsxs("header",{className:"sticky top-0 z-50 w-full bg-[#080410]/85 backdrop-blur-2xl border-b border-purple-500/15 transition-all",children:[l.jsxs("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4",children:[l.jsxs("a",{href:"/",className:"flex items-center gap-2.5 group shrink-0",children:[l.jsxs("div",{className:"relative",children:[l.jsx("img",{src:"/assets/pyxie/sticker/sticker_smile.png",alt:"Pyxie Mascot",width:"36",height:"36",className:"w-9 h-9 object-contain transition-transform group-hover:scale-105"}),l.jsx("span",{className:"absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#080410] animate-pulse"})]}),l.jsxs("div",{className:"flex flex-col",children:[l.jsx("span",{className:"font-title font-black text-lg tracking-tight text-white group-hover:text-pink-400 transition-colors leading-none",children:"Pyxie"}),l.jsx("span",{className:"text-[9px] font-mono font-medium text-purple-300/70 tracking-wider uppercase mt-1",children:"v14 • Online"})]})]}),l.jsxs("nav",{className:"hidden md:flex items-center gap-1 xl:gap-2 overflow-x-auto scrollbar-none",children:[l.jsx("a",{href:`/?lang=${t}#pilares`,className:"whitespace-nowrap px-2.5 py-1.5 rounded-xl text-xs xl:text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all",children:n("nav.features")}),l.jsxs("a",{href:`/?lang=${t}#comandos`,className:"whitespace-nowrap px-2.5 py-1.5 rounded-xl text-xs xl:text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5",children:[l.jsx(vi,{className:"w-3.5 h-3.5 text-pink-400 shrink-0"}),l.jsx("span",{children:n("nav.commands")})]}),l.jsxs("a",{href:`/wiki?lang=${t}`,className:"whitespace-nowrap px-2.5 py-1.5 rounded-xl text-xs xl:text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5",children:[l.jsx(bs,{className:"w-3.5 h-3.5 text-purple-400 shrink-0"}),l.jsx("span",{children:n("nav.wiki")})]}),l.jsxs("a",{href:`/museu?lang=${t}`,className:"whitespace-nowrap px-2.5 py-1.5 rounded-xl text-xs xl:text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5",children:[l.jsx(St,{className:"w-3.5 h-3.5 text-pink-400 shrink-0"}),l.jsx("span",{children:n("nav.museum")})]}),l.jsxs("a",{href:`/bonus?lang=${t}`,className:"whitespace-nowrap px-2.5 py-1.5 rounded-xl text-xs xl:text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5",children:[l.jsx(id,{className:"w-3.5 h-3.5 text-amber-400 shrink-0"}),l.jsx("span",{children:n("nav.bonus")}),l.jsx("span",{className:"text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30",children:"10s"})]}),l.jsxs("a",{href:`/parcerias?lang=${t}`,className:"whitespace-nowrap px-2.5 py-1.5 rounded-xl text-xs xl:text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5",children:[l.jsx(Ia,{className:"w-3.5 h-3.5 text-emerald-400 shrink-0"}),l.jsx("span",{children:n("nav.partnerships")})]}),l.jsx("a",{href:"/discord",target:"_blank",rel:"noopener noreferrer",className:"whitespace-nowrap px-2.5 py-1.5 rounded-xl text-xs xl:text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all",children:n("nav.support")})]}),l.jsxs("div",{className:"flex items-center gap-2.5 shrink-0",children:[l.jsxs("button",{onClick:s,className:"px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-purple-500/20 hover:border-purple-500/40 transition-all flex items-center gap-1.5 whitespace-nowrap",title:"Switch Language / Alternar Idioma",children:[l.jsx(rd,{className:"w-3.5 h-3.5 text-pink-400"}),l.jsx("span",{children:t==="pt"?"PT-BR":"EN"})]}),l.jsxs("a",{href:"/invite?ref=site",target:"_blank",rel:"noopener noreferrer",className:"hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 shadow-neon-pink transition-all transform hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap",children:[l.jsx(St,{className:"w-3.5 h-3.5 text-pink-200"}),l.jsx("span",{children:n("nav.invite")})]}),l.jsx("button",{onClick:()=>r(!i),className:"md:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-white/5 border border-purple-500/20","aria-label":"Toggle menu",children:i?l.jsx(As,{className:"w-5 h-5"}):l.jsx(Xy,{className:"w-5 h-5"})})]})]}),i&&l.jsxs("div",{className:"md:hidden bg-[#080410]/95 backdrop-blur-2xl border-b border-purple-500/20 px-4 pt-3 pb-6 flex flex-col gap-2 animate-fadeIn",children:[l.jsx("a",{href:`/?lang=${t}#pilares`,onClick:()=>r(!1),className:"px-4 py-2.5 rounded-xl text-base font-semibold text-slate-200 hover:bg-white/5",children:n("nav.features")}),l.jsxs("a",{href:`/?lang=${t}#comandos`,onClick:()=>r(!1),className:"px-4 py-2.5 rounded-xl text-base font-semibold text-slate-200 hover:bg-white/5 flex items-center justify-between",children:[l.jsx("span",{children:n("nav.commands")}),l.jsx(vi,{className:"w-4 h-4 text-pink-400"})]}),l.jsxs("a",{href:`/wiki?lang=${t}`,onClick:()=>r(!1),className:"px-4 py-2.5 rounded-xl text-base font-semibold text-slate-200 hover:bg-white/5 flex items-center justify-between",children:[l.jsx("span",{children:n("nav.wiki")}),l.jsx(bs,{className:"w-4 h-4 text-purple-400"})]}),l.jsxs("a",{href:`/museu?lang=${t}`,onClick:()=>r(!1),className:"px-4 py-2.5 rounded-xl text-base font-semibold text-slate-200 hover:bg-white/5 flex items-center justify-between",children:[l.jsx("span",{children:n("nav.museum")}),l.jsx(St,{className:"w-4 h-4 text-pink-400"})]}),l.jsxs("a",{href:`/bonus?lang=${t}`,onClick:()=>r(!1),className:"px-4 py-2.5 rounded-xl text-base font-semibold text-slate-200 hover:bg-white/5 flex items-center justify-between",children:[l.jsx("span",{children:n("nav.bonus")}),l.jsx(id,{className:"w-4 h-4 text-amber-400"})]}),l.jsxs("a",{href:`/parcerias?lang=${t}`,onClick:()=>r(!1),className:"px-4 py-2.5 rounded-xl text-base font-semibold text-slate-200 hover:bg-white/5 flex items-center justify-between",children:[l.jsx("span",{children:n("nav.partnerships")}),l.jsx(Ia,{className:"w-4 h-4 text-emerald-400"})]}),l.jsx("a",{href:"/discord",target:"_blank",rel:"noopener noreferrer",className:"px-4 py-2.5 rounded-xl text-base font-semibold text-slate-200 hover:bg-white/5",children:n("nav.support")}),l.jsxs("div",{className:"pt-2 border-t border-purple-500/15 flex flex-col gap-2",children:[l.jsx("a",{href:"/invite?ref=site-menu",target:"_blank",rel:"noopener noreferrer",className:"w-full text-center py-3 rounded-xl font-bold text-white bg-gradient-to-r from-pink-600 to-purple-600 shadow-neon-pink",children:n("nav.invite")}),l.jsx("a",{href:"/install?ref=site-menu",target:"_blank",rel:"noopener noreferrer",className:"w-full text-center py-3 rounded-xl font-bold text-slate-100 border border-purple-500/40 hover:bg-white/5",children:n("nav.install")})]})]})]})}function c1({t,lang:e="pt"}){return l.jsx("footer",{className:"w-full bg-[#06030c] border-t border-purple-500/15 py-12 px-4 sm:px-6 lg:px-8 mt-20",children:l.jsxs("div",{className:"max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left",children:[l.jsxs("div",{className:"flex items-center gap-3",children:[l.jsx("img",{src:"/assets/pyxie/sticker/sticker_smile.png",alt:"Pyxie Mascot Mini",width:"32",height:"32",className:"w-8 h-8 object-contain"}),l.jsxs("div",{children:[l.jsx("span",{className:"font-title font-bold text-white text-base",children:"Pyxie"}),l.jsx("p",{className:"text-xs text-slate-400",children:t("footer.rights")})]})]}),l.jsxs("div",{className:"flex flex-wrap items-center justify-center gap-5 text-sm font-medium text-slate-300",children:[l.jsx("a",{href:`/wiki?lang=${e}`,className:"hover:text-pink-400 transition-colors",children:t("footer.wiki")}),l.jsx("a",{href:`/museu?lang=${e}`,className:"hover:text-pink-400 transition-colors",children:t("footer.museum")}),l.jsx("a",{href:`/bonus?lang=${e}`,className:"hover:text-pink-400 transition-colors",children:t("footer.bonus")}),l.jsx("a",{href:`/parcerias?lang=${e}`,className:"hover:text-pink-400 transition-colors",children:t("footer.partnerships")}),l.jsxs("a",{href:`/termos?lang=${e}`,className:"hover:text-pink-400 transition-colors flex items-center gap-1.5",children:[l.jsx(Ia,{className:"w-3.5 h-3.5 text-purple-400"}),t("footer.terms")]}),l.jsx("a",{href:`/pais-e-profissionais?lang=${e}`,className:"hover:text-pink-400 transition-colors",children:t("footer.parents")}),l.jsx("a",{href:`/transparencia?lang=${e}`,className:"hover:text-pink-400 transition-colors",children:t("footer.transparency")}),l.jsx("a",{href:"/promo",target:"_blank",rel:"noopener noreferrer",className:"hover:text-pink-400 transition-colors",children:"Shopee"}),l.jsx("a",{href:"/install?ref=site-footer",target:"_blank",rel:"noopener noreferrer",className:"hover:text-pink-400 transition-colors",children:t("footer.install")}),l.jsx("a",{href:"/discord?ref=site-footer",target:"_blank",rel:"noopener noreferrer",className:"hover:text-pink-400 transition-colors",children:t("footer.community")})]})]})})}function u1({t}){const[e,n]=ne.useState("work"),[i,r]=ne.useState(null),[s,a]=ne.useState(""),[o,c]=ne.useState(!1);return ne.useEffect(()=>{if(e==="tarot"){const u=t("terminal.tarotDesc");let f=0;a(""),c(!1);const p=setInterval(()=>{f<u.length?(a(u.slice(0,f+1)),f++):(c(!0),clearInterval(p))},25);return()=>clearInterval(p)}},[e,t]),l.jsxs("div",{className:"w-full max-w-xl mx-auto rounded-2xl glass-panel border border-purple-500/25 overflow-hidden shadow-2xl backdrop-blur-2xl",children:[l.jsxs("div",{className:"px-4 py-3 bg-[#0d071b]/90 border-b border-purple-500/15 flex items-center justify-between",children:[l.jsxs("div",{className:"flex items-center gap-2",children:[l.jsx("span",{className:"w-3 h-3 rounded-full bg-rose-500 inline-block"}),l.jsx("span",{className:"w-3 h-3 rounded-full bg-amber-500 inline-block"}),l.jsx("span",{className:"w-3 h-3 rounded-full bg-emerald-500 inline-block"}),l.jsxs("span",{className:"ml-2 font-mono text-xs text-purple-300/60 font-semibold flex items-center gap-1.5",children:[l.jsx(vi,{className:"w-3.5 h-3.5 text-pink-400"})," pyxie-simulator@discord:~"]})]}),l.jsxs("div",{className:"flex items-center gap-1",children:[l.jsx("span",{className:"w-2 h-2 rounded-full bg-emerald-400 animate-ping"}),l.jsx("span",{className:"text-[10px] font-mono text-emerald-300 font-bold",children:"READY"})]})]}),l.jsxs("div",{className:"flex border-b border-purple-500/15 bg-[#0a0515]/60 px-2 pt-2 gap-1 overflow-x-auto",children:[l.jsxs("button",{onClick:()=>{n("work"),r(null)},className:`px-3 py-1.5 rounded-t-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${e==="work"?"bg-[#180d2d] text-pink-300 border-t-2 border-pink-500":"text-slate-400 hover:text-white hover:bg-white/5"}`,children:[l.jsx(ga,{className:"w-3 h-3 text-pink-400"}),t("terminal.tabWork")]}),l.jsxs("button",{onClick:()=>n("marriage"),className:`px-3 py-1.5 rounded-t-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${e==="marriage"?"bg-[#180d2d] text-purple-300 border-t-2 border-purple-500":"text-slate-400 hover:text-white hover:bg-white/5"}`,children:[l.jsx(ui,{className:"w-3 h-3 text-rose-400"}),t("terminal.tabMarriage")]}),l.jsxs("button",{onClick:()=>n("tarot"),className:`px-3 py-1.5 rounded-t-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${e==="tarot"?"bg-[#180d2d] text-cyan-300 border-t-2 border-cyan-400":"text-slate-400 hover:text-white hover:bg-white/5"}`,children:[l.jsx(St,{className:"w-3 h-3 text-cyan-400"}),t("terminal.tabTarot")]})]}),l.jsxs("div",{className:"p-5 font-mono text-xs sm:text-sm min-h-[260px] flex flex-col justify-between bg-gradient-to-b from-[#120824]/90 to-[#0a0416]/95",children:[e==="work"&&l.jsxs("div",{className:"space-y-3 animate-fadeIn",children:[l.jsxs("div",{className:"text-pink-400 font-bold flex items-center gap-2",children:[l.jsx("span",{className:"text-slate-500",children:"$"})," /py-work"]}),l.jsx("div",{className:"text-slate-200 font-semibold",children:t("terminal.workTitle")}),l.jsx("p",{className:"text-slate-400 text-xs leading-relaxed",children:t("terminal.workDesc")}),l.jsx("div",{className:"space-y-2 pt-1",children:[{id:1,label:t("terminal.opt1")},{id:2,label:t("terminal.opt2")},{id:3,label:t("terminal.opt3")}].map(u=>l.jsxs("button",{onClick:()=>r(u.id),className:`w-full text-left px-3 py-2 rounded-xl border text-xs transition-all flex items-center justify-between ${i===u.id?"bg-pink-500/20 border-pink-500 text-white shadow-neon-pink":"bg-white/5 border-purple-500/20 text-slate-300 hover:bg-white/10 hover:border-pink-500/40"}`,children:[l.jsx("span",{children:u.label}),i===u.id&&l.jsx(td,{className:"w-4 h-4 text-emerald-400"})]},u.id))}),i&&l.jsxs("div",{className:"mt-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold animate-scaleIn flex items-center gap-2",children:[l.jsx(Ts,{className:"w-4 h-4 text-amber-400 shrink-0"}),l.jsx("span",{children:t("terminal.workResult")})]})]}),e==="marriage"&&l.jsxs("div",{className:"space-y-4 animate-fadeIn",children:[l.jsxs("div",{className:"text-purple-400 font-bold flex items-center gap-2",children:[l.jsx("span",{className:"text-slate-500",children:"$"})," /py-casamento status"]}),l.jsxs("div",{className:"text-slate-200 font-bold flex items-center gap-2",children:[l.jsx("span",{children:t("terminal.marriageTitle")}),l.jsx("span",{className:"text-rose-400 animate-pulse",children:"💖"})]}),l.jsxs("div",{children:[l.jsxs("div",{className:"flex justify-between text-xs font-semibold text-rose-300 mb-1",children:[l.jsx("span",{children:t("terminal.loveBar")}),l.jsx("span",{children:"100%"})]}),l.jsx("div",{className:"w-full h-3 bg-purple-950/80 rounded-full overflow-hidden border border-purple-500/30 p-0.5",children:l.jsx("div",{className:"h-full bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 rounded-full animate-pulse w-full"})})]}),l.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs",children:[l.jsx("div",{className:"p-2.5 rounded-xl bg-white/5 border border-purple-500/20 text-slate-300",children:t("terminal.loveTree")}),l.jsx("div",{className:"p-2.5 rounded-xl bg-white/5 border border-purple-500/20 text-amber-300",children:t("terminal.loveVault")})]})]}),e==="tarot"&&l.jsxs("div",{className:"space-y-3 animate-fadeIn",children:[l.jsxs("div",{className:"text-cyan-400 font-bold flex items-center gap-2",children:[l.jsx("span",{className:"text-slate-500",children:"$"})," /py-tarot daily"]}),l.jsxs("div",{className:"text-amber-300 font-bold flex items-center gap-2",children:[l.jsx("span",{children:t("terminal.tarotTitle")}),l.jsx("span",{className:"text-cyan-300",children:"✦"})]}),l.jsxs("div",{className:"p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 space-y-2",children:[l.jsxs("div",{className:"text-pink-400 font-bold text-sm tracking-wide",children:["🔮 ",t("terminal.tarotCard")]}),l.jsxs("p",{className:"text-slate-300 text-xs italic leading-relaxed min-h-[48px]",children:[s,!o&&l.jsx("span",{className:"inline-block w-1.5 h-3.5 bg-pink-400 ml-1 animate-pulse"})]})]})]}),l.jsxs("div",{className:"pt-3 border-t border-purple-500/10 text-[11px] text-slate-500 flex justify-between items-center",children:[l.jsx("span",{children:"Pyxie Discord Engine v14"}),l.jsx("span",{className:"text-purple-400/80 font-semibold",children:"100% Interativo"})]})]})]})}function d1({t,stats:e}){return l.jsxs("section",{className:"relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden",children:[l.jsx("div",{className:"absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none"}),l.jsx("div",{className:"absolute top-1/3 right-10 w-[450px] h-[450px] bg-pink-600/15 rounded-full blur-[130px] pointer-events-none"}),l.jsx("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10",children:l.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center",children:[l.jsxs("div",{className:"lg:col-span-7 text-center lg:text-left space-y-6",children:[l.jsxs("div",{className:"inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wide shadow-sm",children:[l.jsx("span",{className:"w-2 h-2 rounded-full bg-emerald-400 animate-ping"}),l.jsx("span",{children:t("hero.badge")})]}),l.jsxs("h1",{className:"font-title font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.12]",children:[l.jsx("span",{className:"text-white",children:"Pyxie"})," •"," ",l.jsx("span",{className:"text-slate-200",children:t("hero.titlePrefix")})," ",l.jsx("span",{className:"gradient-text-pink",children:t("hero.titleHighlight")})]}),l.jsx("p",{className:"text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal",children:t("hero.subtitle")}),l.jsxs("div",{className:"flex flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-2",children:[l.jsxs("div",{className:"flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-amber-500/25 text-xs font-semibold text-amber-300",children:[l.jsx(Ts,{className:"w-4 h-4 text-amber-400"}),l.jsx("span",{children:t("hero.badgeEconomy")})]}),l.jsxs("div",{className:"flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-purple-500/25 text-xs font-semibold text-purple-300",children:[l.jsx(ga,{className:"w-4 h-4 text-purple-400"}),l.jsx("span",{children:t("hero.badgeCareers")})]}),l.jsxs("div",{className:"flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-emerald-500/25 text-xs font-semibold text-emerald-300",children:[l.jsx(Py,{className:"w-4 h-4 text-emerald-400"}),l.jsx("span",{children:(e==null?void 0:e.uptime)||"99.9% Uptime"})]})]}),l.jsxs("div",{className:"flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4",children:[l.jsxs("a",{href:"/invite?ref=site-hero",target:"_blank",rel:"noopener noreferrer",className:"w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-extrabold text-white bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 shadow-neon-pink transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3 border border-pink-400/30",children:[l.jsx(St,{className:"w-5 h-5 text-pink-200"}),l.jsx("span",{children:t("hero.btnInvite")})]}),l.jsxs("a",{href:"/cringelandia",className:"w-full sm:w-auto px-7 py-4 rounded-2xl text-base font-bold text-slate-200 bg-white/5 hover:bg-white/10 border border-purple-500/30 hover:border-purple-500/60 transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2.5 backdrop-blur-xl",children:[l.jsx(qy,{className:"w-5 h-5 text-purple-400"}),l.jsx("span",{children:t("hero.btnSupport")})]})]}),l.jsxs("p",{className:"text-sm text-slate-400 text-center lg:text-left",children:[t("hero.installLine")," ",l.jsx("a",{href:"/install?ref=site-hero",target:"_blank",rel:"noopener noreferrer",className:"font-semibold text-purple-300 underline underline-offset-4 hover:text-pink-300",children:t("hero.installCta")})]})]}),l.jsx("div",{className:"lg:col-span-5 flex justify-center",children:l.jsx(u1,{t})})]})})]})}/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Gh="169",h1=0,Rp=1,f1=2,ag=1,p1=2,si=3,Ki=0,qt=1,zn=2,Xi=0,ps=1,ad=2,Pp=3,Lp=4,m1=5,pr=100,x1=101,g1=102,v1=103,_1=104,y1=200,S1=201,w1=202,M1=203,od=204,ld=205,b1=206,E1=207,T1=208,A1=209,C1=210,N1=211,R1=212,P1=213,L1=214,cd=0,ud=1,dd=2,Cs=3,hd=4,fd=5,pd=6,md=7,og=0,D1=1,k1=2,qi=0,I1=1,U1=2,F1=3,O1=4,z1=5,j1=6,B1=7,lg=300,Ns=301,Rs=302,xd=303,gd=304,Yl=306,vd=1e3,_r=1001,_d=1002,En=1003,H1=1004,po=1005,Mn=1006,Nc=1007,yr=1008,_i=1009,cg=1010,ug=1011,Ua=1012,Wh=1013,Cr=1014,di=1015,Va=1016,Xh=1017,qh=1018,Ps=1020,dg=35902,hg=1021,fg=1022,Bn=1023,pg=1024,mg=1025,ms=1026,Ls=1027,xg=1028,$h=1029,gg=1030,Yh=1031,Kh=1033,Yo=33776,Ko=33777,Zo=33778,Qo=33779,yd=35840,Sd=35841,wd=35842,Md=35843,bd=36196,Ed=37492,Td=37496,Ad=37808,Cd=37809,Nd=37810,Rd=37811,Pd=37812,Ld=37813,Dd=37814,kd=37815,Id=37816,Ud=37817,Fd=37818,Od=37819,zd=37820,jd=37821,Jo=36492,Bd=36494,Hd=36495,vg=36283,Vd=36284,Gd=36285,Wd=36286,V1=3200,G1=3201,_g=0,W1=1,Ii="",qn="srgb",tr="srgb-linear",Zh="display-p3",Kl="display-p3-linear",Tl="linear",ct="srgb",Al="rec709",Cl="p3",kr=7680,Dp=519,X1=512,q1=513,$1=514,yg=515,Y1=516,K1=517,Z1=518,Q1=519,kp=35044,Ip="300 es",hi=2e3,Nl=2001;class Os{addEventListener(e,n){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(n)===-1&&i[e].push(n)}hasEventListener(e,n){if(this._listeners===void 0)return!1;const i=this._listeners;return i[e]!==void 0&&i[e].indexOf(n)!==-1}removeEventListener(e,n){if(this._listeners===void 0)return;const r=this._listeners[e];if(r!==void 0){const s=r.indexOf(n);s!==-1&&r.splice(s,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const i=this._listeners[e.type];if(i!==void 0){e.target=this;const r=i.slice(0);for(let s=0,a=r.length;s<a;s++)r[s].call(this,e);e.target=null}}}const Ft=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Rc=Math.PI/180,Xd=180/Math.PI;function Ga(){const t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Ft[t&255]+Ft[t>>8&255]+Ft[t>>16&255]+Ft[t>>24&255]+"-"+Ft[e&255]+Ft[e>>8&255]+"-"+Ft[e>>16&15|64]+Ft[e>>24&255]+"-"+Ft[n&63|128]+Ft[n>>8&255]+"-"+Ft[n>>16&255]+Ft[n>>24&255]+Ft[i&255]+Ft[i>>8&255]+Ft[i>>16&255]+Ft[i>>24&255]).toLowerCase()}function nn(t,e,n){return Math.max(e,Math.min(n,t))}function J1(t,e){return(t%e+e)%e}function Pc(t,e,n){return(1-n)*t+n*e}function Ys(t,e){switch(e.constructor){case Float32Array:return t;case Uint32Array:return t/4294967295;case Uint16Array:return t/65535;case Uint8Array:return t/255;case Int32Array:return Math.max(t/2147483647,-1);case Int16Array:return Math.max(t/32767,-1);case Int8Array:return Math.max(t/127,-1);default:throw new Error("Invalid component type.")}}function en(t,e){switch(e.constructor){case Float32Array:return t;case Uint32Array:return Math.round(t*4294967295);case Uint16Array:return Math.round(t*65535);case Uint8Array:return Math.round(t*255);case Int32Array:return Math.round(t*2147483647);case Int16Array:return Math.round(t*32767);case Int8Array:return Math.round(t*127);default:throw new Error("Invalid component type.")}}class $e{constructor(e=0,n=0){$e.prototype.isVector2=!0,this.x=e,this.y=n}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,n){return this.x=e,this.y=n,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const n=this.x,i=this.y,r=e.elements;return this.x=r[0]*n+r[3]*i+r[6],this.y=r[1]*n+r[4]*i+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,n){return this.x=Math.max(e.x,Math.min(n.x,this.x)),this.y=Math.max(e.y,Math.min(n.y,this.y)),this}clampScalar(e,n){return this.x=Math.max(e,Math.min(n,this.x)),this.y=Math.max(e,Math.min(n,this.y)),this}clampLength(e,n){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(n,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const n=Math.sqrt(this.lengthSq()*e.lengthSq());if(n===0)return Math.PI/2;const i=this.dot(e)/n;return Math.acos(nn(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const n=this.x-e.x,i=this.y-e.y;return n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this}lerpVectors(e,n,i){return this.x=e.x+(n.x-e.x)*i,this.y=e.y+(n.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this}rotateAround(e,n){const i=Math.cos(n),r=Math.sin(n),s=this.x-e.x,a=this.y-e.y;return this.x=s*i-a*r+e.x,this.y=s*r+a*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class je{constructor(e,n,i,r,s,a,o,c,u){je.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,n,i,r,s,a,o,c,u)}set(e,n,i,r,s,a,o,c,u){const f=this.elements;return f[0]=e,f[1]=r,f[2]=o,f[3]=n,f[4]=s,f[5]=c,f[6]=i,f[7]=a,f[8]=u,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const n=this.elements,i=e.elements;return n[0]=i[0],n[1]=i[1],n[2]=i[2],n[3]=i[3],n[4]=i[4],n[5]=i[5],n[6]=i[6],n[7]=i[7],n[8]=i[8],this}extractBasis(e,n,i){return e.setFromMatrix3Column(this,0),n.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const n=e.elements;return this.set(n[0],n[4],n[8],n[1],n[5],n[9],n[2],n[6],n[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,n){const i=e.elements,r=n.elements,s=this.elements,a=i[0],o=i[3],c=i[6],u=i[1],f=i[4],p=i[7],h=i[2],x=i[5],_=i[8],S=r[0],m=r[3],d=r[6],g=r[1],v=r[4],w=r[7],R=r[2],E=r[5],A=r[8];return s[0]=a*S+o*g+c*R,s[3]=a*m+o*v+c*E,s[6]=a*d+o*w+c*A,s[1]=u*S+f*g+p*R,s[4]=u*m+f*v+p*E,s[7]=u*d+f*w+p*A,s[2]=h*S+x*g+_*R,s[5]=h*m+x*v+_*E,s[8]=h*d+x*w+_*A,this}multiplyScalar(e){const n=this.elements;return n[0]*=e,n[3]*=e,n[6]*=e,n[1]*=e,n[4]*=e,n[7]*=e,n[2]*=e,n[5]*=e,n[8]*=e,this}determinant(){const e=this.elements,n=e[0],i=e[1],r=e[2],s=e[3],a=e[4],o=e[5],c=e[6],u=e[7],f=e[8];return n*a*f-n*o*u-i*s*f+i*o*c+r*s*u-r*a*c}invert(){const e=this.elements,n=e[0],i=e[1],r=e[2],s=e[3],a=e[4],o=e[5],c=e[6],u=e[7],f=e[8],p=f*a-o*u,h=o*c-f*s,x=u*s-a*c,_=n*p+i*h+r*x;if(_===0)return this.set(0,0,0,0,0,0,0,0,0);const S=1/_;return e[0]=p*S,e[1]=(r*u-f*i)*S,e[2]=(o*i-r*a)*S,e[3]=h*S,e[4]=(f*n-r*c)*S,e[5]=(r*s-o*n)*S,e[6]=x*S,e[7]=(i*c-u*n)*S,e[8]=(a*n-i*s)*S,this}transpose(){let e;const n=this.elements;return e=n[1],n[1]=n[3],n[3]=e,e=n[2],n[2]=n[6],n[6]=e,e=n[5],n[5]=n[7],n[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const n=this.elements;return e[0]=n[0],e[1]=n[3],e[2]=n[6],e[3]=n[1],e[4]=n[4],e[5]=n[7],e[6]=n[2],e[7]=n[5],e[8]=n[8],this}setUvTransform(e,n,i,r,s,a,o){const c=Math.cos(s),u=Math.sin(s);return this.set(i*c,i*u,-i*(c*a+u*o)+a+e,-r*u,r*c,-r*(-u*a+c*o)+o+n,0,0,1),this}scale(e,n){return this.premultiply(Lc.makeScale(e,n)),this}rotate(e){return this.premultiply(Lc.makeRotation(-e)),this}translate(e,n){return this.premultiply(Lc.makeTranslation(e,n)),this}makeTranslation(e,n){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,n,0,0,1),this}makeRotation(e){const n=Math.cos(e),i=Math.sin(e);return this.set(n,-i,0,i,n,0,0,0,1),this}makeScale(e,n){return this.set(e,0,0,0,n,0,0,0,1),this}equals(e){const n=this.elements,i=e.elements;for(let r=0;r<9;r++)if(n[r]!==i[r])return!1;return!0}fromArray(e,n=0){for(let i=0;i<9;i++)this.elements[i]=e[i+n];return this}toArray(e=[],n=0){const i=this.elements;return e[n]=i[0],e[n+1]=i[1],e[n+2]=i[2],e[n+3]=i[3],e[n+4]=i[4],e[n+5]=i[5],e[n+6]=i[6],e[n+7]=i[7],e[n+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const Lc=new je;function Sg(t){for(let e=t.length-1;e>=0;--e)if(t[e]>=65535)return!0;return!1}function Fa(t){return document.createElementNS("http://www.w3.org/1999/xhtml",t)}function eS(){const t=Fa("canvas");return t.style.display="block",t}const Up={};function el(t){t in Up||(Up[t]=!0,console.warn(t))}function tS(t,e,n){return new Promise(function(i,r){function s(){switch(t.clientWaitSync(e,t.SYNC_FLUSH_COMMANDS_BIT,0)){case t.WAIT_FAILED:r();break;case t.TIMEOUT_EXPIRED:setTimeout(s,n);break;default:i()}}setTimeout(s,n)})}function nS(t){const e=t.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function iS(t){const e=t.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const Fp=new je().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),Op=new je().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),Ks={[tr]:{transfer:Tl,primaries:Al,luminanceCoefficients:[.2126,.7152,.0722],toReference:t=>t,fromReference:t=>t},[qn]:{transfer:ct,primaries:Al,luminanceCoefficients:[.2126,.7152,.0722],toReference:t=>t.convertSRGBToLinear(),fromReference:t=>t.convertLinearToSRGB()},[Kl]:{transfer:Tl,primaries:Cl,luminanceCoefficients:[.2289,.6917,.0793],toReference:t=>t.applyMatrix3(Op),fromReference:t=>t.applyMatrix3(Fp)},[Zh]:{transfer:ct,primaries:Cl,luminanceCoefficients:[.2289,.6917,.0793],toReference:t=>t.convertSRGBToLinear().applyMatrix3(Op),fromReference:t=>t.applyMatrix3(Fp).convertLinearToSRGB()}},rS=new Set([tr,Kl]),tt={enabled:!0,_workingColorSpace:tr,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(t){if(!rS.has(t))throw new Error(`Unsupported working color space, "${t}".`);this._workingColorSpace=t},convert:function(t,e,n){if(this.enabled===!1||e===n||!e||!n)return t;const i=Ks[e].toReference,r=Ks[n].fromReference;return r(i(t))},fromWorkingColorSpace:function(t,e){return this.convert(t,this._workingColorSpace,e)},toWorkingColorSpace:function(t,e){return this.convert(t,e,this._workingColorSpace)},getPrimaries:function(t){return Ks[t].primaries},getTransfer:function(t){return t===Ii?Tl:Ks[t].transfer},getLuminanceCoefficients:function(t,e=this._workingColorSpace){return t.fromArray(Ks[e].luminanceCoefficients)}};function xs(t){return t<.04045?t*.0773993808:Math.pow(t*.9478672986+.0521327014,2.4)}function Dc(t){return t<.0031308?t*12.92:1.055*Math.pow(t,.41666)-.055}let Ir;class sS{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Ir===void 0&&(Ir=Fa("canvas")),Ir.width=e.width,Ir.height=e.height;const i=Ir.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),n=Ir}return n.width>2048||n.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),n.toDataURL("image/jpeg",.6)):n.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const n=Fa("canvas");n.width=e.width,n.height=e.height;const i=n.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const r=i.getImageData(0,0,e.width,e.height),s=r.data;for(let a=0;a<s.length;a++)s[a]=xs(s[a]/255)*255;return i.putImageData(r,0,0),n}else if(e.data){const n=e.data.slice(0);for(let i=0;i<n.length;i++)n instanceof Uint8Array||n instanceof Uint8ClampedArray?n[i]=Math.floor(xs(n[i]/255)*255):n[i]=xs(n[i]);return{data:n,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let aS=0;class wg{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:aS++}),this.uuid=Ga(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const n=e===void 0||typeof e=="string";if(!n&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let a=0,o=r.length;a<o;a++)r[a].isDataTexture?s.push(kc(r[a].image)):s.push(kc(r[a]))}else s=kc(r);i.url=s}return n||(e.images[this.uuid]=i),i}}function kc(t){return typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap?sS.getDataURL(t):t.data?{data:Array.from(t.data),width:t.width,height:t.height,type:t.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let oS=0;class $t extends Os{constructor(e=$t.DEFAULT_IMAGE,n=$t.DEFAULT_MAPPING,i=_r,r=_r,s=Mn,a=yr,o=Bn,c=_i,u=$t.DEFAULT_ANISOTROPY,f=Ii){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:oS++}),this.uuid=Ga(),this.name="",this.source=new wg(e),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=i,this.wrapT=r,this.magFilter=s,this.minFilter=a,this.anisotropy=u,this.format=o,this.internalFormat=null,this.type=c,this.offset=new $e(0,0),this.repeat=new $e(1,1),this.center=new $e(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new je,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=f,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const n=e===void 0||typeof e=="string";if(!n&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),n||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==lg)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case vd:e.x=e.x-Math.floor(e.x);break;case _r:e.x=e.x<0?0:1;break;case _d:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case vd:e.y=e.y-Math.floor(e.y);break;case _r:e.y=e.y<0?0:1;break;case _d:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}$t.DEFAULT_IMAGE=null;$t.DEFAULT_MAPPING=lg;$t.DEFAULT_ANISOTROPY=1;class st{constructor(e=0,n=0,i=0,r=1){st.prototype.isVector4=!0,this.x=e,this.y=n,this.z=i,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,n,i,r){return this.x=e,this.y=n,this.z=i,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;case 3:this.w=n;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this.z=e.z+n.z,this.w=e.w+n.w,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this.z+=e.z*n,this.w+=e.w*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this.z=e.z-n.z,this.w=e.w-n.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const n=this.x,i=this.y,r=this.z,s=this.w,a=e.elements;return this.x=a[0]*n+a[4]*i+a[8]*r+a[12]*s,this.y=a[1]*n+a[5]*i+a[9]*r+a[13]*s,this.z=a[2]*n+a[6]*i+a[10]*r+a[14]*s,this.w=a[3]*n+a[7]*i+a[11]*r+a[15]*s,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const n=Math.sqrt(1-e.w*e.w);return n<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/n,this.y=e.y/n,this.z=e.z/n),this}setAxisAngleFromRotationMatrix(e){let n,i,r,s;const c=e.elements,u=c[0],f=c[4],p=c[8],h=c[1],x=c[5],_=c[9],S=c[2],m=c[6],d=c[10];if(Math.abs(f-h)<.01&&Math.abs(p-S)<.01&&Math.abs(_-m)<.01){if(Math.abs(f+h)<.1&&Math.abs(p+S)<.1&&Math.abs(_+m)<.1&&Math.abs(u+x+d-3)<.1)return this.set(1,0,0,0),this;n=Math.PI;const v=(u+1)/2,w=(x+1)/2,R=(d+1)/2,E=(f+h)/4,A=(p+S)/4,N=(_+m)/4;return v>w&&v>R?v<.01?(i=0,r=.707106781,s=.707106781):(i=Math.sqrt(v),r=E/i,s=A/i):w>R?w<.01?(i=.707106781,r=0,s=.707106781):(r=Math.sqrt(w),i=E/r,s=N/r):R<.01?(i=.707106781,r=.707106781,s=0):(s=Math.sqrt(R),i=A/s,r=N/s),this.set(i,r,s,n),this}let g=Math.sqrt((m-_)*(m-_)+(p-S)*(p-S)+(h-f)*(h-f));return Math.abs(g)<.001&&(g=1),this.x=(m-_)/g,this.y=(p-S)/g,this.z=(h-f)/g,this.w=Math.acos((u+x+d-1)/2),this}setFromMatrixPosition(e){const n=e.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this.w=n[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,n){return this.x=Math.max(e.x,Math.min(n.x,this.x)),this.y=Math.max(e.y,Math.min(n.y,this.y)),this.z=Math.max(e.z,Math.min(n.z,this.z)),this.w=Math.max(e.w,Math.min(n.w,this.w)),this}clampScalar(e,n){return this.x=Math.max(e,Math.min(n,this.x)),this.y=Math.max(e,Math.min(n,this.y)),this.z=Math.max(e,Math.min(n,this.z)),this.w=Math.max(e,Math.min(n,this.w)),this}clampLength(e,n){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(n,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this.z+=(e.z-this.z)*n,this.w+=(e.w-this.w)*n,this}lerpVectors(e,n,i){return this.x=e.x+(n.x-e.x)*i,this.y=e.y+(n.y-e.y)*i,this.z=e.z+(n.z-e.z)*i,this.w=e.w+(n.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this.z=e[n+2],this.w=e[n+3],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e[n+2]=this.z,e[n+3]=this.w,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this.z=e.getZ(n),this.w=e.getW(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class lS extends Os{constructor(e=1,n=1,i={}){super(),this.isRenderTarget=!0,this.width=e,this.height=n,this.depth=1,this.scissor=new st(0,0,e,n),this.scissorTest=!1,this.viewport=new st(0,0,e,n);const r={width:e,height:n,depth:1};i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Mn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},i);const s=new $t(r,i.mapping,i.wrapS,i.wrapT,i.magFilter,i.minFilter,i.format,i.type,i.anisotropy,i.colorSpace);s.flipY=!1,s.generateMipmaps=i.generateMipmaps,s.internalFormat=i.internalFormat,this.textures=[];const a=i.count;for(let o=0;o<a;o++)this.textures[o]=s.clone(),this.textures[o].isRenderTargetTexture=!0;this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.depthTexture=i.depthTexture,this.samples=i.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,n,i=1){if(this.width!==e||this.height!==n||this.depth!==i){this.width=e,this.height=n,this.depth=i;for(let r=0,s=this.textures.length;r<s;r++)this.textures[r].image.width=e,this.textures[r].image.height=n,this.textures[r].image.depth=i;this.dispose()}this.viewport.set(0,0,e,n),this.scissor.set(0,0,e,n)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let i=0,r=e.textures.length;i<r;i++)this.textures[i]=e.textures[i].clone(),this.textures[i].isRenderTargetTexture=!0;const n=Object.assign({},e.texture.image);return this.texture.source=new wg(n),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Nr extends lS{constructor(e=1,n=1,i={}){super(e,n,i),this.isWebGLRenderTarget=!0}}class Mg extends $t{constructor(e=null,n=1,i=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:n,height:i,depth:r},this.magFilter=En,this.minFilter=En,this.wrapR=_r,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class cS extends $t{constructor(e=null,n=1,i=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:n,height:i,depth:r},this.magFilter=En,this.minFilter=En,this.wrapR=_r,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Wa{constructor(e=0,n=0,i=0,r=1){this.isQuaternion=!0,this._x=e,this._y=n,this._z=i,this._w=r}static slerpFlat(e,n,i,r,s,a,o){let c=i[r+0],u=i[r+1],f=i[r+2],p=i[r+3];const h=s[a+0],x=s[a+1],_=s[a+2],S=s[a+3];if(o===0){e[n+0]=c,e[n+1]=u,e[n+2]=f,e[n+3]=p;return}if(o===1){e[n+0]=h,e[n+1]=x,e[n+2]=_,e[n+3]=S;return}if(p!==S||c!==h||u!==x||f!==_){let m=1-o;const d=c*h+u*x+f*_+p*S,g=d>=0?1:-1,v=1-d*d;if(v>Number.EPSILON){const R=Math.sqrt(v),E=Math.atan2(R,d*g);m=Math.sin(m*E)/R,o=Math.sin(o*E)/R}const w=o*g;if(c=c*m+h*w,u=u*m+x*w,f=f*m+_*w,p=p*m+S*w,m===1-o){const R=1/Math.sqrt(c*c+u*u+f*f+p*p);c*=R,u*=R,f*=R,p*=R}}e[n]=c,e[n+1]=u,e[n+2]=f,e[n+3]=p}static multiplyQuaternionsFlat(e,n,i,r,s,a){const o=i[r],c=i[r+1],u=i[r+2],f=i[r+3],p=s[a],h=s[a+1],x=s[a+2],_=s[a+3];return e[n]=o*_+f*p+c*x-u*h,e[n+1]=c*_+f*h+u*p-o*x,e[n+2]=u*_+f*x+o*h-c*p,e[n+3]=f*_-o*p-c*h-u*x,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,n,i,r){return this._x=e,this._y=n,this._z=i,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,n=!0){const i=e._x,r=e._y,s=e._z,a=e._order,o=Math.cos,c=Math.sin,u=o(i/2),f=o(r/2),p=o(s/2),h=c(i/2),x=c(r/2),_=c(s/2);switch(a){case"XYZ":this._x=h*f*p+u*x*_,this._y=u*x*p-h*f*_,this._z=u*f*_+h*x*p,this._w=u*f*p-h*x*_;break;case"YXZ":this._x=h*f*p+u*x*_,this._y=u*x*p-h*f*_,this._z=u*f*_-h*x*p,this._w=u*f*p+h*x*_;break;case"ZXY":this._x=h*f*p-u*x*_,this._y=u*x*p+h*f*_,this._z=u*f*_+h*x*p,this._w=u*f*p-h*x*_;break;case"ZYX":this._x=h*f*p-u*x*_,this._y=u*x*p+h*f*_,this._z=u*f*_-h*x*p,this._w=u*f*p+h*x*_;break;case"YZX":this._x=h*f*p+u*x*_,this._y=u*x*p+h*f*_,this._z=u*f*_-h*x*p,this._w=u*f*p-h*x*_;break;case"XZY":this._x=h*f*p-u*x*_,this._y=u*x*p-h*f*_,this._z=u*f*_+h*x*p,this._w=u*f*p+h*x*_;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return n===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,n){const i=n/2,r=Math.sin(i);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const n=e.elements,i=n[0],r=n[4],s=n[8],a=n[1],o=n[5],c=n[9],u=n[2],f=n[6],p=n[10],h=i+o+p;if(h>0){const x=.5/Math.sqrt(h+1);this._w=.25/x,this._x=(f-c)*x,this._y=(s-u)*x,this._z=(a-r)*x}else if(i>o&&i>p){const x=2*Math.sqrt(1+i-o-p);this._w=(f-c)/x,this._x=.25*x,this._y=(r+a)/x,this._z=(s+u)/x}else if(o>p){const x=2*Math.sqrt(1+o-i-p);this._w=(s-u)/x,this._x=(r+a)/x,this._y=.25*x,this._z=(c+f)/x}else{const x=2*Math.sqrt(1+p-i-o);this._w=(a-r)/x,this._x=(s+u)/x,this._y=(c+f)/x,this._z=.25*x}return this._onChangeCallback(),this}setFromUnitVectors(e,n){let i=e.dot(n)+1;return i<Number.EPSILON?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*n.z-e.z*n.y,this._y=e.z*n.x-e.x*n.z,this._z=e.x*n.y-e.y*n.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(nn(this.dot(e),-1,1)))}rotateTowards(e,n){const i=this.angleTo(e);if(i===0)return this;const r=Math.min(1,n/i);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,n){const i=e._x,r=e._y,s=e._z,a=e._w,o=n._x,c=n._y,u=n._z,f=n._w;return this._x=i*f+a*o+r*u-s*c,this._y=r*f+a*c+s*o-i*u,this._z=s*f+a*u+i*c-r*o,this._w=a*f-i*o-r*c-s*u,this._onChangeCallback(),this}slerp(e,n){if(n===0)return this;if(n===1)return this.copy(e);const i=this._x,r=this._y,s=this._z,a=this._w;let o=a*e._w+i*e._x+r*e._y+s*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=i,this._y=r,this._z=s,this;const c=1-o*o;if(c<=Number.EPSILON){const x=1-n;return this._w=x*a+n*this._w,this._x=x*i+n*this._x,this._y=x*r+n*this._y,this._z=x*s+n*this._z,this.normalize(),this}const u=Math.sqrt(c),f=Math.atan2(u,o),p=Math.sin((1-n)*f)/u,h=Math.sin(n*f)/u;return this._w=a*p+this._w*h,this._x=i*p+this._x*h,this._y=r*p+this._y*h,this._z=s*p+this._z*h,this._onChangeCallback(),this}slerpQuaternions(e,n,i){return this.copy(e).slerp(n,i)}random(){const e=2*Math.PI*Math.random(),n=2*Math.PI*Math.random(),i=Math.random(),r=Math.sqrt(1-i),s=Math.sqrt(i);return this.set(r*Math.sin(e),r*Math.cos(e),s*Math.sin(n),s*Math.cos(n))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,n=0){return this._x=e[n],this._y=e[n+1],this._z=e[n+2],this._w=e[n+3],this._onChangeCallback(),this}toArray(e=[],n=0){return e[n]=this._x,e[n+1]=this._y,e[n+2]=this._z,e[n+3]=this._w,e}fromBufferAttribute(e,n){return this._x=e.getX(n),this._y=e.getY(n),this._z=e.getZ(n),this._w=e.getW(n),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class U{constructor(e=0,n=0,i=0){U.prototype.isVector3=!0,this.x=e,this.y=n,this.z=i}set(e,n,i){return i===void 0&&(i=this.z),this.x=e,this.y=n,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this.z=e.z+n.z,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this.z+=e.z*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this.z=e.z-n.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,n){return this.x=e.x*n.x,this.y=e.y*n.y,this.z=e.z*n.z,this}applyEuler(e){return this.applyQuaternion(zp.setFromEuler(e))}applyAxisAngle(e,n){return this.applyQuaternion(zp.setFromAxisAngle(e,n))}applyMatrix3(e){const n=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*n+s[3]*i+s[6]*r,this.y=s[1]*n+s[4]*i+s[7]*r,this.z=s[2]*n+s[5]*i+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const n=this.x,i=this.y,r=this.z,s=e.elements,a=1/(s[3]*n+s[7]*i+s[11]*r+s[15]);return this.x=(s[0]*n+s[4]*i+s[8]*r+s[12])*a,this.y=(s[1]*n+s[5]*i+s[9]*r+s[13])*a,this.z=(s[2]*n+s[6]*i+s[10]*r+s[14])*a,this}applyQuaternion(e){const n=this.x,i=this.y,r=this.z,s=e.x,a=e.y,o=e.z,c=e.w,u=2*(a*r-o*i),f=2*(o*n-s*r),p=2*(s*i-a*n);return this.x=n+c*u+a*p-o*f,this.y=i+c*f+o*u-s*p,this.z=r+c*p+s*f-a*u,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const n=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*n+s[4]*i+s[8]*r,this.y=s[1]*n+s[5]*i+s[9]*r,this.z=s[2]*n+s[6]*i+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,n){return this.x=Math.max(e.x,Math.min(n.x,this.x)),this.y=Math.max(e.y,Math.min(n.y,this.y)),this.z=Math.max(e.z,Math.min(n.z,this.z)),this}clampScalar(e,n){return this.x=Math.max(e,Math.min(n,this.x)),this.y=Math.max(e,Math.min(n,this.y)),this.z=Math.max(e,Math.min(n,this.z)),this}clampLength(e,n){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(n,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this.z+=(e.z-this.z)*n,this}lerpVectors(e,n,i){return this.x=e.x+(n.x-e.x)*i,this.y=e.y+(n.y-e.y)*i,this.z=e.z+(n.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,n){const i=e.x,r=e.y,s=e.z,a=n.x,o=n.y,c=n.z;return this.x=r*c-s*o,this.y=s*a-i*c,this.z=i*o-r*a,this}projectOnVector(e){const n=e.lengthSq();if(n===0)return this.set(0,0,0);const i=e.dot(this)/n;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return Ic.copy(this).projectOnVector(e),this.sub(Ic)}reflect(e){return this.sub(Ic.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const n=Math.sqrt(this.lengthSq()*e.lengthSq());if(n===0)return Math.PI/2;const i=this.dot(e)/n;return Math.acos(nn(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const n=this.x-e.x,i=this.y-e.y,r=this.z-e.z;return n*n+i*i+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,n,i){const r=Math.sin(n)*e;return this.x=r*Math.sin(i),this.y=Math.cos(n)*e,this.z=r*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,n,i){return this.x=e*Math.sin(n),this.y=i,this.z=e*Math.cos(n),this}setFromMatrixPosition(e){const n=e.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this}setFromMatrixScale(e){const n=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=n,this.y=i,this.z=r,this}setFromMatrixColumn(e,n){return this.fromArray(e.elements,n*4)}setFromMatrix3Column(e,n){return this.fromArray(e.elements,n*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this.z=e[n+2],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e[n+2]=this.z,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this.z=e.getZ(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,n=Math.random()*2-1,i=Math.sqrt(1-n*n);return this.x=i*Math.cos(e),this.y=n,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Ic=new U,zp=new Wa;class Xa{constructor(e=new U(1/0,1/0,1/0),n=new U(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=n}set(e,n){return this.min.copy(e),this.max.copy(n),this}setFromArray(e){this.makeEmpty();for(let n=0,i=e.length;n<i;n+=3)this.expandByPoint(Dn.fromArray(e,n));return this}setFromBufferAttribute(e){this.makeEmpty();for(let n=0,i=e.count;n<i;n++)this.expandByPoint(Dn.fromBufferAttribute(e,n));return this}setFromPoints(e){this.makeEmpty();for(let n=0,i=e.length;n<i;n++)this.expandByPoint(e[n]);return this}setFromCenterAndSize(e,n){const i=Dn.copy(n).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,n=!1){return this.makeEmpty(),this.expandByObject(e,n)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,n=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0){const s=i.getAttribute("position");if(n===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=s.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,Dn):Dn.fromBufferAttribute(s,a),Dn.applyMatrix4(e.matrixWorld),this.expandByPoint(Dn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),mo.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),mo.copy(i.boundingBox)),mo.applyMatrix4(e.matrixWorld),this.union(mo)}const r=e.children;for(let s=0,a=r.length;s<a;s++)this.expandByObject(r[s],n);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,n){return n.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Dn),Dn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let n,i;return e.normal.x>0?(n=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(n=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(n+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(n+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(n+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(n+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),n<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Zs),xo.subVectors(this.max,Zs),Ur.subVectors(e.a,Zs),Fr.subVectors(e.b,Zs),Or.subVectors(e.c,Zs),bi.subVectors(Fr,Ur),Ei.subVectors(Or,Fr),ir.subVectors(Ur,Or);let n=[0,-bi.z,bi.y,0,-Ei.z,Ei.y,0,-ir.z,ir.y,bi.z,0,-bi.x,Ei.z,0,-Ei.x,ir.z,0,-ir.x,-bi.y,bi.x,0,-Ei.y,Ei.x,0,-ir.y,ir.x,0];return!Uc(n,Ur,Fr,Or,xo)||(n=[1,0,0,0,1,0,0,0,1],!Uc(n,Ur,Fr,Or,xo))?!1:(go.crossVectors(bi,Ei),n=[go.x,go.y,go.z],Uc(n,Ur,Fr,Or,xo))}clampPoint(e,n){return n.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Dn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Dn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(ei[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),ei[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),ei[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),ei[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),ei[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),ei[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),ei[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),ei[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(ei),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const ei=[new U,new U,new U,new U,new U,new U,new U,new U],Dn=new U,mo=new Xa,Ur=new U,Fr=new U,Or=new U,bi=new U,Ei=new U,ir=new U,Zs=new U,xo=new U,go=new U,rr=new U;function Uc(t,e,n,i,r){for(let s=0,a=t.length-3;s<=a;s+=3){rr.fromArray(t,s);const o=r.x*Math.abs(rr.x)+r.y*Math.abs(rr.y)+r.z*Math.abs(rr.z),c=e.dot(rr),u=n.dot(rr),f=i.dot(rr);if(Math.max(-Math.max(c,u,f),Math.min(c,u,f))>o)return!1}return!0}const uS=new Xa,Qs=new U,Fc=new U;class Zl{constructor(e=new U,n=-1){this.isSphere=!0,this.center=e,this.radius=n}set(e,n){return this.center.copy(e),this.radius=n,this}setFromPoints(e,n){const i=this.center;n!==void 0?i.copy(n):uS.setFromPoints(e).getCenter(i);let r=0;for(let s=0,a=e.length;s<a;s++)r=Math.max(r,i.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const n=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=n*n}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,n){const i=this.center.distanceToSquared(e);return n.copy(e),i>this.radius*this.radius&&(n.sub(this.center).normalize(),n.multiplyScalar(this.radius).add(this.center)),n}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Qs.subVectors(e,this.center);const n=Qs.lengthSq();if(n>this.radius*this.radius){const i=Math.sqrt(n),r=(i-this.radius)*.5;this.center.addScaledVector(Qs,r/i),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Fc.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Qs.copy(e.center).add(Fc)),this.expandByPoint(Qs.copy(e.center).sub(Fc))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const ti=new U,Oc=new U,vo=new U,Ti=new U,zc=new U,_o=new U,jc=new U;class Qh{constructor(e=new U,n=new U(0,0,-1)){this.origin=e,this.direction=n}set(e,n){return this.origin.copy(e),this.direction.copy(n),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,n){return n.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,ti)),this}closestPointToPoint(e,n){n.subVectors(e,this.origin);const i=n.dot(this.direction);return i<0?n.copy(this.origin):n.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const n=ti.subVectors(e,this.origin).dot(this.direction);return n<0?this.origin.distanceToSquared(e):(ti.copy(this.origin).addScaledVector(this.direction,n),ti.distanceToSquared(e))}distanceSqToSegment(e,n,i,r){Oc.copy(e).add(n).multiplyScalar(.5),vo.copy(n).sub(e).normalize(),Ti.copy(this.origin).sub(Oc);const s=e.distanceTo(n)*.5,a=-this.direction.dot(vo),o=Ti.dot(this.direction),c=-Ti.dot(vo),u=Ti.lengthSq(),f=Math.abs(1-a*a);let p,h,x,_;if(f>0)if(p=a*c-o,h=a*o-c,_=s*f,p>=0)if(h>=-_)if(h<=_){const S=1/f;p*=S,h*=S,x=p*(p+a*h+2*o)+h*(a*p+h+2*c)+u}else h=s,p=Math.max(0,-(a*h+o)),x=-p*p+h*(h+2*c)+u;else h=-s,p=Math.max(0,-(a*h+o)),x=-p*p+h*(h+2*c)+u;else h<=-_?(p=Math.max(0,-(-a*s+o)),h=p>0?-s:Math.min(Math.max(-s,-c),s),x=-p*p+h*(h+2*c)+u):h<=_?(p=0,h=Math.min(Math.max(-s,-c),s),x=h*(h+2*c)+u):(p=Math.max(0,-(a*s+o)),h=p>0?s:Math.min(Math.max(-s,-c),s),x=-p*p+h*(h+2*c)+u);else h=a>0?-s:s,p=Math.max(0,-(a*h+o)),x=-p*p+h*(h+2*c)+u;return i&&i.copy(this.origin).addScaledVector(this.direction,p),r&&r.copy(Oc).addScaledVector(vo,h),x}intersectSphere(e,n){ti.subVectors(e.center,this.origin);const i=ti.dot(this.direction),r=ti.dot(ti)-i*i,s=e.radius*e.radius;if(r>s)return null;const a=Math.sqrt(s-r),o=i-a,c=i+a;return c<0?null:o<0?this.at(c,n):this.at(o,n)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const n=e.normal.dot(this.direction);if(n===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/n;return i>=0?i:null}intersectPlane(e,n){const i=this.distanceToPlane(e);return i===null?null:this.at(i,n)}intersectsPlane(e){const n=e.distanceToPoint(this.origin);return n===0||e.normal.dot(this.direction)*n<0}intersectBox(e,n){let i,r,s,a,o,c;const u=1/this.direction.x,f=1/this.direction.y,p=1/this.direction.z,h=this.origin;return u>=0?(i=(e.min.x-h.x)*u,r=(e.max.x-h.x)*u):(i=(e.max.x-h.x)*u,r=(e.min.x-h.x)*u),f>=0?(s=(e.min.y-h.y)*f,a=(e.max.y-h.y)*f):(s=(e.max.y-h.y)*f,a=(e.min.y-h.y)*f),i>a||s>r||((s>i||isNaN(i))&&(i=s),(a<r||isNaN(r))&&(r=a),p>=0?(o=(e.min.z-h.z)*p,c=(e.max.z-h.z)*p):(o=(e.max.z-h.z)*p,c=(e.min.z-h.z)*p),i>c||o>r)||((o>i||i!==i)&&(i=o),(c<r||r!==r)&&(r=c),r<0)?null:this.at(i>=0?i:r,n)}intersectsBox(e){return this.intersectBox(e,ti)!==null}intersectTriangle(e,n,i,r,s){zc.subVectors(n,e),_o.subVectors(i,e),jc.crossVectors(zc,_o);let a=this.direction.dot(jc),o;if(a>0){if(r)return null;o=1}else if(a<0)o=-1,a=-a;else return null;Ti.subVectors(this.origin,e);const c=o*this.direction.dot(_o.crossVectors(Ti,_o));if(c<0)return null;const u=o*this.direction.dot(zc.cross(Ti));if(u<0||c+u>a)return null;const f=-o*Ti.dot(jc);return f<0?null:this.at(f/a,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class dt{constructor(e,n,i,r,s,a,o,c,u,f,p,h,x,_,S,m){dt.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,n,i,r,s,a,o,c,u,f,p,h,x,_,S,m)}set(e,n,i,r,s,a,o,c,u,f,p,h,x,_,S,m){const d=this.elements;return d[0]=e,d[4]=n,d[8]=i,d[12]=r,d[1]=s,d[5]=a,d[9]=o,d[13]=c,d[2]=u,d[6]=f,d[10]=p,d[14]=h,d[3]=x,d[7]=_,d[11]=S,d[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new dt().fromArray(this.elements)}copy(e){const n=this.elements,i=e.elements;return n[0]=i[0],n[1]=i[1],n[2]=i[2],n[3]=i[3],n[4]=i[4],n[5]=i[5],n[6]=i[6],n[7]=i[7],n[8]=i[8],n[9]=i[9],n[10]=i[10],n[11]=i[11],n[12]=i[12],n[13]=i[13],n[14]=i[14],n[15]=i[15],this}copyPosition(e){const n=this.elements,i=e.elements;return n[12]=i[12],n[13]=i[13],n[14]=i[14],this}setFromMatrix3(e){const n=e.elements;return this.set(n[0],n[3],n[6],0,n[1],n[4],n[7],0,n[2],n[5],n[8],0,0,0,0,1),this}extractBasis(e,n,i){return e.setFromMatrixColumn(this,0),n.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,n,i){return this.set(e.x,n.x,i.x,0,e.y,n.y,i.y,0,e.z,n.z,i.z,0,0,0,0,1),this}extractRotation(e){const n=this.elements,i=e.elements,r=1/zr.setFromMatrixColumn(e,0).length(),s=1/zr.setFromMatrixColumn(e,1).length(),a=1/zr.setFromMatrixColumn(e,2).length();return n[0]=i[0]*r,n[1]=i[1]*r,n[2]=i[2]*r,n[3]=0,n[4]=i[4]*s,n[5]=i[5]*s,n[6]=i[6]*s,n[7]=0,n[8]=i[8]*a,n[9]=i[9]*a,n[10]=i[10]*a,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromEuler(e){const n=this.elements,i=e.x,r=e.y,s=e.z,a=Math.cos(i),o=Math.sin(i),c=Math.cos(r),u=Math.sin(r),f=Math.cos(s),p=Math.sin(s);if(e.order==="XYZ"){const h=a*f,x=a*p,_=o*f,S=o*p;n[0]=c*f,n[4]=-c*p,n[8]=u,n[1]=x+_*u,n[5]=h-S*u,n[9]=-o*c,n[2]=S-h*u,n[6]=_+x*u,n[10]=a*c}else if(e.order==="YXZ"){const h=c*f,x=c*p,_=u*f,S=u*p;n[0]=h+S*o,n[4]=_*o-x,n[8]=a*u,n[1]=a*p,n[5]=a*f,n[9]=-o,n[2]=x*o-_,n[6]=S+h*o,n[10]=a*c}else if(e.order==="ZXY"){const h=c*f,x=c*p,_=u*f,S=u*p;n[0]=h-S*o,n[4]=-a*p,n[8]=_+x*o,n[1]=x+_*o,n[5]=a*f,n[9]=S-h*o,n[2]=-a*u,n[6]=o,n[10]=a*c}else if(e.order==="ZYX"){const h=a*f,x=a*p,_=o*f,S=o*p;n[0]=c*f,n[4]=_*u-x,n[8]=h*u+S,n[1]=c*p,n[5]=S*u+h,n[9]=x*u-_,n[2]=-u,n[6]=o*c,n[10]=a*c}else if(e.order==="YZX"){const h=a*c,x=a*u,_=o*c,S=o*u;n[0]=c*f,n[4]=S-h*p,n[8]=_*p+x,n[1]=p,n[5]=a*f,n[9]=-o*f,n[2]=-u*f,n[6]=x*p+_,n[10]=h-S*p}else if(e.order==="XZY"){const h=a*c,x=a*u,_=o*c,S=o*u;n[0]=c*f,n[4]=-p,n[8]=u*f,n[1]=h*p+S,n[5]=a*f,n[9]=x*p-_,n[2]=_*p-x,n[6]=o*f,n[10]=S*p+h}return n[3]=0,n[7]=0,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromQuaternion(e){return this.compose(dS,e,hS)}lookAt(e,n,i){const r=this.elements;return un.subVectors(e,n),un.lengthSq()===0&&(un.z=1),un.normalize(),Ai.crossVectors(i,un),Ai.lengthSq()===0&&(Math.abs(i.z)===1?un.x+=1e-4:un.z+=1e-4,un.normalize(),Ai.crossVectors(i,un)),Ai.normalize(),yo.crossVectors(un,Ai),r[0]=Ai.x,r[4]=yo.x,r[8]=un.x,r[1]=Ai.y,r[5]=yo.y,r[9]=un.y,r[2]=Ai.z,r[6]=yo.z,r[10]=un.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,n){const i=e.elements,r=n.elements,s=this.elements,a=i[0],o=i[4],c=i[8],u=i[12],f=i[1],p=i[5],h=i[9],x=i[13],_=i[2],S=i[6],m=i[10],d=i[14],g=i[3],v=i[7],w=i[11],R=i[15],E=r[0],A=r[4],N=r[8],F=r[12],y=r[1],b=r[5],O=r[9],V=r[13],q=r[2],Q=r[6],W=r[10],Y=r[14],D=r[3],J=r[7],ee=r[11],z=r[15];return s[0]=a*E+o*y+c*q+u*D,s[4]=a*A+o*b+c*Q+u*J,s[8]=a*N+o*O+c*W+u*ee,s[12]=a*F+o*V+c*Y+u*z,s[1]=f*E+p*y+h*q+x*D,s[5]=f*A+p*b+h*Q+x*J,s[9]=f*N+p*O+h*W+x*ee,s[13]=f*F+p*V+h*Y+x*z,s[2]=_*E+S*y+m*q+d*D,s[6]=_*A+S*b+m*Q+d*J,s[10]=_*N+S*O+m*W+d*ee,s[14]=_*F+S*V+m*Y+d*z,s[3]=g*E+v*y+w*q+R*D,s[7]=g*A+v*b+w*Q+R*J,s[11]=g*N+v*O+w*W+R*ee,s[15]=g*F+v*V+w*Y+R*z,this}multiplyScalar(e){const n=this.elements;return n[0]*=e,n[4]*=e,n[8]*=e,n[12]*=e,n[1]*=e,n[5]*=e,n[9]*=e,n[13]*=e,n[2]*=e,n[6]*=e,n[10]*=e,n[14]*=e,n[3]*=e,n[7]*=e,n[11]*=e,n[15]*=e,this}determinant(){const e=this.elements,n=e[0],i=e[4],r=e[8],s=e[12],a=e[1],o=e[5],c=e[9],u=e[13],f=e[2],p=e[6],h=e[10],x=e[14],_=e[3],S=e[7],m=e[11],d=e[15];return _*(+s*c*p-r*u*p-s*o*h+i*u*h+r*o*x-i*c*x)+S*(+n*c*x-n*u*h+s*a*h-r*a*x+r*u*f-s*c*f)+m*(+n*u*p-n*o*x-s*a*p+i*a*x+s*o*f-i*u*f)+d*(-r*o*f-n*c*p+n*o*h+r*a*p-i*a*h+i*c*f)}transpose(){const e=this.elements;let n;return n=e[1],e[1]=e[4],e[4]=n,n=e[2],e[2]=e[8],e[8]=n,n=e[6],e[6]=e[9],e[9]=n,n=e[3],e[3]=e[12],e[12]=n,n=e[7],e[7]=e[13],e[13]=n,n=e[11],e[11]=e[14],e[14]=n,this}setPosition(e,n,i){const r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=n,r[14]=i),this}invert(){const e=this.elements,n=e[0],i=e[1],r=e[2],s=e[3],a=e[4],o=e[5],c=e[6],u=e[7],f=e[8],p=e[9],h=e[10],x=e[11],_=e[12],S=e[13],m=e[14],d=e[15],g=p*m*u-S*h*u+S*c*x-o*m*x-p*c*d+o*h*d,v=_*h*u-f*m*u-_*c*x+a*m*x+f*c*d-a*h*d,w=f*S*u-_*p*u+_*o*x-a*S*x-f*o*d+a*p*d,R=_*p*c-f*S*c-_*o*h+a*S*h+f*o*m-a*p*m,E=n*g+i*v+r*w+s*R;if(E===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const A=1/E;return e[0]=g*A,e[1]=(S*h*s-p*m*s-S*r*x+i*m*x+p*r*d-i*h*d)*A,e[2]=(o*m*s-S*c*s+S*r*u-i*m*u-o*r*d+i*c*d)*A,e[3]=(p*c*s-o*h*s-p*r*u+i*h*u+o*r*x-i*c*x)*A,e[4]=v*A,e[5]=(f*m*s-_*h*s+_*r*x-n*m*x-f*r*d+n*h*d)*A,e[6]=(_*c*s-a*m*s-_*r*u+n*m*u+a*r*d-n*c*d)*A,e[7]=(a*h*s-f*c*s+f*r*u-n*h*u-a*r*x+n*c*x)*A,e[8]=w*A,e[9]=(_*p*s-f*S*s-_*i*x+n*S*x+f*i*d-n*p*d)*A,e[10]=(a*S*s-_*o*s+_*i*u-n*S*u-a*i*d+n*o*d)*A,e[11]=(f*o*s-a*p*s-f*i*u+n*p*u+a*i*x-n*o*x)*A,e[12]=R*A,e[13]=(f*S*r-_*p*r+_*i*h-n*S*h-f*i*m+n*p*m)*A,e[14]=(_*o*r-a*S*r-_*i*c+n*S*c+a*i*m-n*o*m)*A,e[15]=(a*p*r-f*o*r+f*i*c-n*p*c-a*i*h+n*o*h)*A,this}scale(e){const n=this.elements,i=e.x,r=e.y,s=e.z;return n[0]*=i,n[4]*=r,n[8]*=s,n[1]*=i,n[5]*=r,n[9]*=s,n[2]*=i,n[6]*=r,n[10]*=s,n[3]*=i,n[7]*=r,n[11]*=s,this}getMaxScaleOnAxis(){const e=this.elements,n=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(n,i,r))}makeTranslation(e,n,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,n,0,0,1,i,0,0,0,1),this}makeRotationX(e){const n=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,n,-i,0,0,i,n,0,0,0,0,1),this}makeRotationY(e){const n=Math.cos(e),i=Math.sin(e);return this.set(n,0,i,0,0,1,0,0,-i,0,n,0,0,0,0,1),this}makeRotationZ(e){const n=Math.cos(e),i=Math.sin(e);return this.set(n,-i,0,0,i,n,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,n){const i=Math.cos(n),r=Math.sin(n),s=1-i,a=e.x,o=e.y,c=e.z,u=s*a,f=s*o;return this.set(u*a+i,u*o-r*c,u*c+r*o,0,u*o+r*c,f*o+i,f*c-r*a,0,u*c-r*o,f*c+r*a,s*c*c+i,0,0,0,0,1),this}makeScale(e,n,i){return this.set(e,0,0,0,0,n,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,n,i,r,s,a){return this.set(1,i,s,0,e,1,a,0,n,r,1,0,0,0,0,1),this}compose(e,n,i){const r=this.elements,s=n._x,a=n._y,o=n._z,c=n._w,u=s+s,f=a+a,p=o+o,h=s*u,x=s*f,_=s*p,S=a*f,m=a*p,d=o*p,g=c*u,v=c*f,w=c*p,R=i.x,E=i.y,A=i.z;return r[0]=(1-(S+d))*R,r[1]=(x+w)*R,r[2]=(_-v)*R,r[3]=0,r[4]=(x-w)*E,r[5]=(1-(h+d))*E,r[6]=(m+g)*E,r[7]=0,r[8]=(_+v)*A,r[9]=(m-g)*A,r[10]=(1-(h+S))*A,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,n,i){const r=this.elements;let s=zr.set(r[0],r[1],r[2]).length();const a=zr.set(r[4],r[5],r[6]).length(),o=zr.set(r[8],r[9],r[10]).length();this.determinant()<0&&(s=-s),e.x=r[12],e.y=r[13],e.z=r[14],kn.copy(this);const u=1/s,f=1/a,p=1/o;return kn.elements[0]*=u,kn.elements[1]*=u,kn.elements[2]*=u,kn.elements[4]*=f,kn.elements[5]*=f,kn.elements[6]*=f,kn.elements[8]*=p,kn.elements[9]*=p,kn.elements[10]*=p,n.setFromRotationMatrix(kn),i.x=s,i.y=a,i.z=o,this}makePerspective(e,n,i,r,s,a,o=hi){const c=this.elements,u=2*s/(n-e),f=2*s/(i-r),p=(n+e)/(n-e),h=(i+r)/(i-r);let x,_;if(o===hi)x=-(a+s)/(a-s),_=-2*a*s/(a-s);else if(o===Nl)x=-a/(a-s),_=-a*s/(a-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=p,c[12]=0,c[1]=0,c[5]=f,c[9]=h,c[13]=0,c[2]=0,c[6]=0,c[10]=x,c[14]=_,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,n,i,r,s,a,o=hi){const c=this.elements,u=1/(n-e),f=1/(i-r),p=1/(a-s),h=(n+e)*u,x=(i+r)*f;let _,S;if(o===hi)_=(a+s)*p,S=-2*p;else if(o===Nl)_=s*p,S=-1*p;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=2*u,c[4]=0,c[8]=0,c[12]=-h,c[1]=0,c[5]=2*f,c[9]=0,c[13]=-x,c[2]=0,c[6]=0,c[10]=S,c[14]=-_,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){const n=this.elements,i=e.elements;for(let r=0;r<16;r++)if(n[r]!==i[r])return!1;return!0}fromArray(e,n=0){for(let i=0;i<16;i++)this.elements[i]=e[i+n];return this}toArray(e=[],n=0){const i=this.elements;return e[n]=i[0],e[n+1]=i[1],e[n+2]=i[2],e[n+3]=i[3],e[n+4]=i[4],e[n+5]=i[5],e[n+6]=i[6],e[n+7]=i[7],e[n+8]=i[8],e[n+9]=i[9],e[n+10]=i[10],e[n+11]=i[11],e[n+12]=i[12],e[n+13]=i[13],e[n+14]=i[14],e[n+15]=i[15],e}}const zr=new U,kn=new dt,dS=new U(0,0,0),hS=new U(1,1,1),Ai=new U,yo=new U,un=new U,jp=new dt,Bp=new Wa;class Qn{constructor(e=0,n=0,i=0,r=Qn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=n,this._z=i,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,n,i,r=this._order){return this._x=e,this._y=n,this._z=i,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,n=this._order,i=!0){const r=e.elements,s=r[0],a=r[4],o=r[8],c=r[1],u=r[5],f=r[9],p=r[2],h=r[6],x=r[10];switch(n){case"XYZ":this._y=Math.asin(nn(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-f,x),this._z=Math.atan2(-a,s)):(this._x=Math.atan2(h,u),this._z=0);break;case"YXZ":this._x=Math.asin(-nn(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(o,x),this._z=Math.atan2(c,u)):(this._y=Math.atan2(-p,s),this._z=0);break;case"ZXY":this._x=Math.asin(nn(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-p,x),this._z=Math.atan2(-a,u)):(this._y=0,this._z=Math.atan2(c,s));break;case"ZYX":this._y=Math.asin(-nn(p,-1,1)),Math.abs(p)<.9999999?(this._x=Math.atan2(h,x),this._z=Math.atan2(c,s)):(this._x=0,this._z=Math.atan2(-a,u));break;case"YZX":this._z=Math.asin(nn(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-f,u),this._y=Math.atan2(-p,s)):(this._x=0,this._y=Math.atan2(o,x));break;case"XZY":this._z=Math.asin(-nn(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(h,u),this._y=Math.atan2(o,s)):(this._x=Math.atan2(-f,x),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+n)}return this._order=n,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,n,i){return jp.makeRotationFromQuaternion(e),this.setFromRotationMatrix(jp,n,i)}setFromVector3(e,n=this._order){return this.set(e.x,e.y,e.z,n)}reorder(e){return Bp.setFromEuler(this),this.setFromQuaternion(Bp,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],n=0){return e[n]=this._x,e[n+1]=this._y,e[n+2]=this._z,e[n+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Qn.DEFAULT_ORDER="XYZ";class Jh{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let fS=0;const Hp=new U,jr=new Wa,ni=new dt,So=new U,Js=new U,pS=new U,mS=new Wa,Vp=new U(1,0,0),Gp=new U(0,1,0),Wp=new U(0,0,1),Xp={type:"added"},xS={type:"removed"},Br={type:"childadded",child:null},Bc={type:"childremoved",child:null};class Yt extends Os{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:fS++}),this.uuid=Ga(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Yt.DEFAULT_UP.clone();const e=new U,n=new Qn,i=new Wa,r=new U(1,1,1);function s(){i.setFromEuler(n,!1)}function a(){n.setFromQuaternion(i,void 0,!1)}n._onChange(s),i._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new dt},normalMatrix:{value:new je}}),this.matrix=new dt,this.matrixWorld=new dt,this.matrixAutoUpdate=Yt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Yt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Jh,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,n){this.quaternion.setFromAxisAngle(e,n)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,n){return jr.setFromAxisAngle(e,n),this.quaternion.multiply(jr),this}rotateOnWorldAxis(e,n){return jr.setFromAxisAngle(e,n),this.quaternion.premultiply(jr),this}rotateX(e){return this.rotateOnAxis(Vp,e)}rotateY(e){return this.rotateOnAxis(Gp,e)}rotateZ(e){return this.rotateOnAxis(Wp,e)}translateOnAxis(e,n){return Hp.copy(e).applyQuaternion(this.quaternion),this.position.add(Hp.multiplyScalar(n)),this}translateX(e){return this.translateOnAxis(Vp,e)}translateY(e){return this.translateOnAxis(Gp,e)}translateZ(e){return this.translateOnAxis(Wp,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(ni.copy(this.matrixWorld).invert())}lookAt(e,n,i){e.isVector3?So.copy(e):So.set(e,n,i);const r=this.parent;this.updateWorldMatrix(!0,!1),Js.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ni.lookAt(Js,So,this.up):ni.lookAt(So,Js,this.up),this.quaternion.setFromRotationMatrix(ni),r&&(ni.extractRotation(r.matrixWorld),jr.setFromRotationMatrix(ni),this.quaternion.premultiply(jr.invert()))}add(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.add(arguments[n]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Xp),Br.child=e,this.dispatchEvent(Br),Br.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const n=this.children.indexOf(e);return n!==-1&&(e.parent=null,this.children.splice(n,1),e.dispatchEvent(xS),Bc.child=e,this.dispatchEvent(Bc),Bc.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),ni.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),ni.multiply(e.parent.matrixWorld)),e.applyMatrix4(ni),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Xp),Br.child=e,this.dispatchEvent(Br),Br.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,n){if(this[e]===n)return this;for(let i=0,r=this.children.length;i<r;i++){const a=this.children[i].getObjectByProperty(e,n);if(a!==void 0)return a}}getObjectsByProperty(e,n,i=[]){this[e]===n&&i.push(this);const r=this.children;for(let s=0,a=r.length;s<a;s++)r[s].getObjectsByProperty(e,n,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Js,e,pS),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Js,mS,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const n=this.matrixWorld.elements;return e.set(n[8],n[9],n[10]).normalize()}raycast(){}traverse(e){e(this);const n=this.children;for(let i=0,r=n.length;i<r;i++)n[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const n=this.children;for(let i=0,r=n.length;i<r;i++)n[i].traverseVisible(e)}traverseAncestors(e){const n=this.parent;n!==null&&(e(n),n.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const n=this.children;for(let i=0,r=n.length;i<r;i++)n[i].updateMatrixWorld(e)}updateWorldMatrix(e,n){const i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),n===!0){const r=this.children;for(let s=0,a=r.length;s<a;s++)r[s].updateWorldMatrix(!1,!0)}}toJSON(e){const n=e===void 0||typeof e=="string",i={};n&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.visibility=this._visibility,r.active=this._active,r.bounds=this._bounds.map(o=>({boxInitialized:o.boxInitialized,boxMin:o.box.min.toArray(),boxMax:o.box.max.toArray(),sphereInitialized:o.sphereInitialized,sphereRadius:o.sphere.radius,sphereCenter:o.sphere.center.toArray()})),r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.geometryCount=this._geometryCount,r.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere={center:r.boundingSphere.center.toArray(),radius:r.boundingSphere.radius}),this.boundingBox!==null&&(r.boundingBox={min:r.boundingBox.min.toArray(),max:r.boundingBox.max.toArray()}));function s(o,c){return o[c.uuid]===void 0&&(o[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const c=o.shapes;if(Array.isArray(c))for(let u=0,f=c.length;u<f;u++){const p=c[u];s(e.shapes,p)}else s(e.shapes,c)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let c=0,u=this.material.length;c<u;c++)o.push(s(e.materials,this.material[c]));r.material=o}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let o=0;o<this.children.length;o++)r.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let o=0;o<this.animations.length;o++){const c=this.animations[o];r.animations.push(s(e.animations,c))}}if(n){const o=a(e.geometries),c=a(e.materials),u=a(e.textures),f=a(e.images),p=a(e.shapes),h=a(e.skeletons),x=a(e.animations),_=a(e.nodes);o.length>0&&(i.geometries=o),c.length>0&&(i.materials=c),u.length>0&&(i.textures=u),f.length>0&&(i.images=f),p.length>0&&(i.shapes=p),h.length>0&&(i.skeletons=h),x.length>0&&(i.animations=x),_.length>0&&(i.nodes=_)}return i.object=r,i;function a(o){const c=[];for(const u in o){const f=o[u];delete f.metadata,c.push(f)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,n=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),n===!0)for(let i=0;i<e.children.length;i++){const r=e.children[i];this.add(r.clone())}return this}}Yt.DEFAULT_UP=new U(0,1,0);Yt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Yt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const In=new U,ii=new U,Hc=new U,ri=new U,Hr=new U,Vr=new U,qp=new U,Vc=new U,Gc=new U,Wc=new U,Xc=new st,qc=new st,$c=new st;class jn{constructor(e=new U,n=new U,i=new U){this.a=e,this.b=n,this.c=i}static getNormal(e,n,i,r){r.subVectors(i,n),In.subVectors(e,n),r.cross(In);const s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,n,i,r,s){In.subVectors(r,n),ii.subVectors(i,n),Hc.subVectors(e,n);const a=In.dot(In),o=In.dot(ii),c=In.dot(Hc),u=ii.dot(ii),f=ii.dot(Hc),p=a*u-o*o;if(p===0)return s.set(0,0,0),null;const h=1/p,x=(u*c-o*f)*h,_=(a*f-o*c)*h;return s.set(1-x-_,_,x)}static containsPoint(e,n,i,r){return this.getBarycoord(e,n,i,r,ri)===null?!1:ri.x>=0&&ri.y>=0&&ri.x+ri.y<=1}static getInterpolation(e,n,i,r,s,a,o,c){return this.getBarycoord(e,n,i,r,ri)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(s,ri.x),c.addScaledVector(a,ri.y),c.addScaledVector(o,ri.z),c)}static getInterpolatedAttribute(e,n,i,r,s,a){return Xc.setScalar(0),qc.setScalar(0),$c.setScalar(0),Xc.fromBufferAttribute(e,n),qc.fromBufferAttribute(e,i),$c.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(Xc,s.x),a.addScaledVector(qc,s.y),a.addScaledVector($c,s.z),a}static isFrontFacing(e,n,i,r){return In.subVectors(i,n),ii.subVectors(e,n),In.cross(ii).dot(r)<0}set(e,n,i){return this.a.copy(e),this.b.copy(n),this.c.copy(i),this}setFromPointsAndIndices(e,n,i,r){return this.a.copy(e[n]),this.b.copy(e[i]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,n,i,r){return this.a.fromBufferAttribute(e,n),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return In.subVectors(this.c,this.b),ii.subVectors(this.a,this.b),In.cross(ii).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return jn.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,n){return jn.getBarycoord(e,this.a,this.b,this.c,n)}getInterpolation(e,n,i,r,s){return jn.getInterpolation(e,this.a,this.b,this.c,n,i,r,s)}containsPoint(e){return jn.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return jn.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,n){const i=this.a,r=this.b,s=this.c;let a,o;Hr.subVectors(r,i),Vr.subVectors(s,i),Vc.subVectors(e,i);const c=Hr.dot(Vc),u=Vr.dot(Vc);if(c<=0&&u<=0)return n.copy(i);Gc.subVectors(e,r);const f=Hr.dot(Gc),p=Vr.dot(Gc);if(f>=0&&p<=f)return n.copy(r);const h=c*p-f*u;if(h<=0&&c>=0&&f<=0)return a=c/(c-f),n.copy(i).addScaledVector(Hr,a);Wc.subVectors(e,s);const x=Hr.dot(Wc),_=Vr.dot(Wc);if(_>=0&&x<=_)return n.copy(s);const S=x*u-c*_;if(S<=0&&u>=0&&_<=0)return o=u/(u-_),n.copy(i).addScaledVector(Vr,o);const m=f*_-x*p;if(m<=0&&p-f>=0&&x-_>=0)return qp.subVectors(s,r),o=(p-f)/(p-f+(x-_)),n.copy(r).addScaledVector(qp,o);const d=1/(m+S+h);return a=S*d,o=h*d,n.copy(i).addScaledVector(Hr,a).addScaledVector(Vr,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const bg={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ci={h:0,s:0,l:0},wo={h:0,s:0,l:0};function Yc(t,e,n){return n<0&&(n+=1),n>1&&(n-=1),n<1/6?t+(e-t)*6*n:n<1/2?e:n<2/3?t+(e-t)*6*(2/3-n):t}class Ye{constructor(e,n,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,n,i)}set(e,n,i){if(n===void 0&&i===void 0){const r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,n,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,n=qn){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,tt.toWorkingColorSpace(this,n),this}setRGB(e,n,i,r=tt.workingColorSpace){return this.r=e,this.g=n,this.b=i,tt.toWorkingColorSpace(this,r),this}setHSL(e,n,i,r=tt.workingColorSpace){if(e=J1(e,1),n=nn(n,0,1),i=nn(i,0,1),n===0)this.r=this.g=this.b=i;else{const s=i<=.5?i*(1+n):i+n-i*n,a=2*i-s;this.r=Yc(a,s,e+1/3),this.g=Yc(a,s,e),this.b=Yc(a,s,e-1/3)}return tt.toWorkingColorSpace(this,r),this}setStyle(e,n=qn){function i(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s;const a=r[1],o=r[2];switch(a){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,n);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,n);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,n);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){const s=r[1],a=s.length;if(a===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,n);if(a===6)return this.setHex(parseInt(s,16),n);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,n);return this}setColorName(e,n=qn){const i=bg[e.toLowerCase()];return i!==void 0?this.setHex(i,n):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=xs(e.r),this.g=xs(e.g),this.b=xs(e.b),this}copyLinearToSRGB(e){return this.r=Dc(e.r),this.g=Dc(e.g),this.b=Dc(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=qn){return tt.fromWorkingColorSpace(Ot.copy(this),e),Math.round(nn(Ot.r*255,0,255))*65536+Math.round(nn(Ot.g*255,0,255))*256+Math.round(nn(Ot.b*255,0,255))}getHexString(e=qn){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,n=tt.workingColorSpace){tt.fromWorkingColorSpace(Ot.copy(this),n);const i=Ot.r,r=Ot.g,s=Ot.b,a=Math.max(i,r,s),o=Math.min(i,r,s);let c,u;const f=(o+a)/2;if(o===a)c=0,u=0;else{const p=a-o;switch(u=f<=.5?p/(a+o):p/(2-a-o),a){case i:c=(r-s)/p+(r<s?6:0);break;case r:c=(s-i)/p+2;break;case s:c=(i-r)/p+4;break}c/=6}return e.h=c,e.s=u,e.l=f,e}getRGB(e,n=tt.workingColorSpace){return tt.fromWorkingColorSpace(Ot.copy(this),n),e.r=Ot.r,e.g=Ot.g,e.b=Ot.b,e}getStyle(e=qn){tt.fromWorkingColorSpace(Ot.copy(this),e);const n=Ot.r,i=Ot.g,r=Ot.b;return e!==qn?`color(${e} ${n.toFixed(3)} ${i.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(n*255)},${Math.round(i*255)},${Math.round(r*255)})`}offsetHSL(e,n,i){return this.getHSL(Ci),this.setHSL(Ci.h+e,Ci.s+n,Ci.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,n){return this.r=e.r+n.r,this.g=e.g+n.g,this.b=e.b+n.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,n){return this.r+=(e.r-this.r)*n,this.g+=(e.g-this.g)*n,this.b+=(e.b-this.b)*n,this}lerpColors(e,n,i){return this.r=e.r+(n.r-e.r)*i,this.g=e.g+(n.g-e.g)*i,this.b=e.b+(n.b-e.b)*i,this}lerpHSL(e,n){this.getHSL(Ci),e.getHSL(wo);const i=Pc(Ci.h,wo.h,n),r=Pc(Ci.s,wo.s,n),s=Pc(Ci.l,wo.l,n);return this.setHSL(i,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const n=this.r,i=this.g,r=this.b,s=e.elements;return this.r=s[0]*n+s[3]*i+s[6]*r,this.g=s[1]*n+s[4]*i+s[7]*r,this.b=s[2]*n+s[5]*i+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,n=0){return this.r=e[n],this.g=e[n+1],this.b=e[n+2],this}toArray(e=[],n=0){return e[n]=this.r,e[n+1]=this.g,e[n+2]=this.b,e}fromBufferAttribute(e,n){return this.r=e.getX(n),this.g=e.getY(n),this.b=e.getZ(n),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Ot=new Ye;Ye.NAMES=bg;let gS=0;class zs extends Os{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:gS++}),this.uuid=Ga(),this.name="",this.type="Material",this.blending=ps,this.side=Ki,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=od,this.blendDst=ld,this.blendEquation=pr,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ye(0,0,0),this.blendAlpha=0,this.depthFunc=Cs,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Dp,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=kr,this.stencilZFail=kr,this.stencilZPass=kr,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const n in e){const i=e[n];if(i===void 0){console.warn(`THREE.Material: parameter '${n}' has value of undefined.`);continue}const r=this[n];if(r===void 0){console.warn(`THREE.Material: '${n}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(i):r&&r.isVector3&&i&&i.isVector3?r.copy(i):this[n]=i}}toJSON(e){const n=e===void 0||typeof e=="string";n&&(e={textures:{},images:{}});const i={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==ps&&(i.blending=this.blending),this.side!==Ki&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==od&&(i.blendSrc=this.blendSrc),this.blendDst!==ld&&(i.blendDst=this.blendDst),this.blendEquation!==pr&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==Cs&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Dp&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==kr&&(i.stencilFail=this.stencilFail),this.stencilZFail!==kr&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==kr&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function r(s){const a=[];for(const o in s){const c=s[o];delete c.metadata,a.push(c)}return a}if(n){const s=r(e.textures),a=r(e.images);s.length>0&&(i.textures=s),a.length>0&&(i.images=a)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const n=e.clippingPlanes;let i=null;if(n!==null){const r=n.length;i=new Array(r);for(let s=0;s!==r;++s)i[s]=n[s].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class Li extends zs{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ye(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Qn,this.combine=og,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const wt=new U,Mo=new $e;class An{constructor(e,n,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=n,this.count=e!==void 0?e.length/n:0,this.normalized=i,this.usage=kp,this.updateRanges=[],this.gpuType=di,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,n){this.updateRanges.push({start:e,count:n})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,n,i){e*=this.itemSize,i*=n.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=n.array[i+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let n=0,i=this.count;n<i;n++)Mo.fromBufferAttribute(this,n),Mo.applyMatrix3(e),this.setXY(n,Mo.x,Mo.y);else if(this.itemSize===3)for(let n=0,i=this.count;n<i;n++)wt.fromBufferAttribute(this,n),wt.applyMatrix3(e),this.setXYZ(n,wt.x,wt.y,wt.z);return this}applyMatrix4(e){for(let n=0,i=this.count;n<i;n++)wt.fromBufferAttribute(this,n),wt.applyMatrix4(e),this.setXYZ(n,wt.x,wt.y,wt.z);return this}applyNormalMatrix(e){for(let n=0,i=this.count;n<i;n++)wt.fromBufferAttribute(this,n),wt.applyNormalMatrix(e),this.setXYZ(n,wt.x,wt.y,wt.z);return this}transformDirection(e){for(let n=0,i=this.count;n<i;n++)wt.fromBufferAttribute(this,n),wt.transformDirection(e),this.setXYZ(n,wt.x,wt.y,wt.z);return this}set(e,n=0){return this.array.set(e,n),this}getComponent(e,n){let i=this.array[e*this.itemSize+n];return this.normalized&&(i=Ys(i,this.array)),i}setComponent(e,n,i){return this.normalized&&(i=en(i,this.array)),this.array[e*this.itemSize+n]=i,this}getX(e){let n=this.array[e*this.itemSize];return this.normalized&&(n=Ys(n,this.array)),n}setX(e,n){return this.normalized&&(n=en(n,this.array)),this.array[e*this.itemSize]=n,this}getY(e){let n=this.array[e*this.itemSize+1];return this.normalized&&(n=Ys(n,this.array)),n}setY(e,n){return this.normalized&&(n=en(n,this.array)),this.array[e*this.itemSize+1]=n,this}getZ(e){let n=this.array[e*this.itemSize+2];return this.normalized&&(n=Ys(n,this.array)),n}setZ(e,n){return this.normalized&&(n=en(n,this.array)),this.array[e*this.itemSize+2]=n,this}getW(e){let n=this.array[e*this.itemSize+3];return this.normalized&&(n=Ys(n,this.array)),n}setW(e,n){return this.normalized&&(n=en(n,this.array)),this.array[e*this.itemSize+3]=n,this}setXY(e,n,i){return e*=this.itemSize,this.normalized&&(n=en(n,this.array),i=en(i,this.array)),this.array[e+0]=n,this.array[e+1]=i,this}setXYZ(e,n,i,r){return e*=this.itemSize,this.normalized&&(n=en(n,this.array),i=en(i,this.array),r=en(r,this.array)),this.array[e+0]=n,this.array[e+1]=i,this.array[e+2]=r,this}setXYZW(e,n,i,r,s){return e*=this.itemSize,this.normalized&&(n=en(n,this.array),i=en(i,this.array),r=en(r,this.array),s=en(s,this.array)),this.array[e+0]=n,this.array[e+1]=i,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==kp&&(e.usage=this.usage),e}}class Eg extends An{constructor(e,n,i){super(new Uint16Array(e),n,i)}}class Tg extends An{constructor(e,n,i){super(new Uint32Array(e),n,i)}}class Bt extends An{constructor(e,n,i){super(new Float32Array(e),n,i)}}let vS=0;const yn=new dt,Kc=new Yt,Gr=new U,dn=new Xa,ea=new Xa,Ct=new U;class Rn extends Os{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:vS++}),this.uuid=Ga(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Sg(e)?Tg:Eg)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,n){return this.attributes[e]=n,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,n,i=0){this.groups.push({start:e,count:n,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,n){this.drawRange.start=e,this.drawRange.count=n}applyMatrix4(e){const n=this.attributes.position;n!==void 0&&(n.applyMatrix4(e),n.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const s=new je().getNormalMatrix(e);i.applyNormalMatrix(s),i.needsUpdate=!0}const r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return yn.makeRotationFromQuaternion(e),this.applyMatrix4(yn),this}rotateX(e){return yn.makeRotationX(e),this.applyMatrix4(yn),this}rotateY(e){return yn.makeRotationY(e),this.applyMatrix4(yn),this}rotateZ(e){return yn.makeRotationZ(e),this.applyMatrix4(yn),this}translate(e,n,i){return yn.makeTranslation(e,n,i),this.applyMatrix4(yn),this}scale(e,n,i){return yn.makeScale(e,n,i),this.applyMatrix4(yn),this}lookAt(e){return Kc.lookAt(e),Kc.updateMatrix(),this.applyMatrix4(Kc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Gr).negate(),this.translate(Gr.x,Gr.y,Gr.z),this}setFromPoints(e){const n=[];for(let i=0,r=e.length;i<r;i++){const s=e[i];n.push(s.x,s.y,s.z||0)}return this.setAttribute("position",new Bt(n,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Xa);const e=this.attributes.position,n=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new U(-1/0,-1/0,-1/0),new U(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),n)for(let i=0,r=n.length;i<r;i++){const s=n[i];dn.setFromBufferAttribute(s),this.morphTargetsRelative?(Ct.addVectors(this.boundingBox.min,dn.min),this.boundingBox.expandByPoint(Ct),Ct.addVectors(this.boundingBox.max,dn.max),this.boundingBox.expandByPoint(Ct)):(this.boundingBox.expandByPoint(dn.min),this.boundingBox.expandByPoint(dn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Zl);const e=this.attributes.position,n=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new U,1/0);return}if(e){const i=this.boundingSphere.center;if(dn.setFromBufferAttribute(e),n)for(let s=0,a=n.length;s<a;s++){const o=n[s];ea.setFromBufferAttribute(o),this.morphTargetsRelative?(Ct.addVectors(dn.min,ea.min),dn.expandByPoint(Ct),Ct.addVectors(dn.max,ea.max),dn.expandByPoint(Ct)):(dn.expandByPoint(ea.min),dn.expandByPoint(ea.max))}dn.getCenter(i);let r=0;for(let s=0,a=e.count;s<a;s++)Ct.fromBufferAttribute(e,s),r=Math.max(r,i.distanceToSquared(Ct));if(n)for(let s=0,a=n.length;s<a;s++){const o=n[s],c=this.morphTargetsRelative;for(let u=0,f=o.count;u<f;u++)Ct.fromBufferAttribute(o,u),c&&(Gr.fromBufferAttribute(e,u),Ct.add(Gr)),r=Math.max(r,i.distanceToSquared(Ct))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,n=this.attributes;if(e===null||n.position===void 0||n.normal===void 0||n.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=n.position,r=n.normal,s=n.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new An(new Float32Array(4*i.count),4));const a=this.getAttribute("tangent"),o=[],c=[];for(let N=0;N<i.count;N++)o[N]=new U,c[N]=new U;const u=new U,f=new U,p=new U,h=new $e,x=new $e,_=new $e,S=new U,m=new U;function d(N,F,y){u.fromBufferAttribute(i,N),f.fromBufferAttribute(i,F),p.fromBufferAttribute(i,y),h.fromBufferAttribute(s,N),x.fromBufferAttribute(s,F),_.fromBufferAttribute(s,y),f.sub(u),p.sub(u),x.sub(h),_.sub(h);const b=1/(x.x*_.y-_.x*x.y);isFinite(b)&&(S.copy(f).multiplyScalar(_.y).addScaledVector(p,-x.y).multiplyScalar(b),m.copy(p).multiplyScalar(x.x).addScaledVector(f,-_.x).multiplyScalar(b),o[N].add(S),o[F].add(S),o[y].add(S),c[N].add(m),c[F].add(m),c[y].add(m))}let g=this.groups;g.length===0&&(g=[{start:0,count:e.count}]);for(let N=0,F=g.length;N<F;++N){const y=g[N],b=y.start,O=y.count;for(let V=b,q=b+O;V<q;V+=3)d(e.getX(V+0),e.getX(V+1),e.getX(V+2))}const v=new U,w=new U,R=new U,E=new U;function A(N){R.fromBufferAttribute(r,N),E.copy(R);const F=o[N];v.copy(F),v.sub(R.multiplyScalar(R.dot(F))).normalize(),w.crossVectors(E,F);const b=w.dot(c[N])<0?-1:1;a.setXYZW(N,v.x,v.y,v.z,b)}for(let N=0,F=g.length;N<F;++N){const y=g[N],b=y.start,O=y.count;for(let V=b,q=b+O;V<q;V+=3)A(e.getX(V+0)),A(e.getX(V+1)),A(e.getX(V+2))}}computeVertexNormals(){const e=this.index,n=this.getAttribute("position");if(n!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new An(new Float32Array(n.count*3),3),this.setAttribute("normal",i);else for(let h=0,x=i.count;h<x;h++)i.setXYZ(h,0,0,0);const r=new U,s=new U,a=new U,o=new U,c=new U,u=new U,f=new U,p=new U;if(e)for(let h=0,x=e.count;h<x;h+=3){const _=e.getX(h+0),S=e.getX(h+1),m=e.getX(h+2);r.fromBufferAttribute(n,_),s.fromBufferAttribute(n,S),a.fromBufferAttribute(n,m),f.subVectors(a,s),p.subVectors(r,s),f.cross(p),o.fromBufferAttribute(i,_),c.fromBufferAttribute(i,S),u.fromBufferAttribute(i,m),o.add(f),c.add(f),u.add(f),i.setXYZ(_,o.x,o.y,o.z),i.setXYZ(S,c.x,c.y,c.z),i.setXYZ(m,u.x,u.y,u.z)}else for(let h=0,x=n.count;h<x;h+=3)r.fromBufferAttribute(n,h+0),s.fromBufferAttribute(n,h+1),a.fromBufferAttribute(n,h+2),f.subVectors(a,s),p.subVectors(r,s),f.cross(p),i.setXYZ(h+0,f.x,f.y,f.z),i.setXYZ(h+1,f.x,f.y,f.z),i.setXYZ(h+2,f.x,f.y,f.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let n=0,i=e.count;n<i;n++)Ct.fromBufferAttribute(e,n),Ct.normalize(),e.setXYZ(n,Ct.x,Ct.y,Ct.z)}toNonIndexed(){function e(o,c){const u=o.array,f=o.itemSize,p=o.normalized,h=new u.constructor(c.length*f);let x=0,_=0;for(let S=0,m=c.length;S<m;S++){o.isInterleavedBufferAttribute?x=c[S]*o.data.stride+o.offset:x=c[S]*f;for(let d=0;d<f;d++)h[_++]=u[x++]}return new An(h,f,p)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const n=new Rn,i=this.index.array,r=this.attributes;for(const o in r){const c=r[o],u=e(c,i);n.setAttribute(o,u)}const s=this.morphAttributes;for(const o in s){const c=[],u=s[o];for(let f=0,p=u.length;f<p;f++){const h=u[f],x=e(h,i);c.push(x)}n.morphAttributes[o]=c}n.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,c=a.length;o<c;o++){const u=a[o];n.addGroup(u.start,u.count,u.materialIndex)}return n}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const c=this.parameters;for(const u in c)c[u]!==void 0&&(e[u]=c[u]);return e}e.data={attributes:{}};const n=this.index;n!==null&&(e.data.index={type:n.array.constructor.name,array:Array.prototype.slice.call(n.array)});const i=this.attributes;for(const c in i){const u=i[c];e.data.attributes[c]=u.toJSON(e.data)}const r={};let s=!1;for(const c in this.morphAttributes){const u=this.morphAttributes[c],f=[];for(let p=0,h=u.length;p<h;p++){const x=u[p];f.push(x.toJSON(e.data))}f.length>0&&(r[c]=f,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const n={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone(n));const r=e.attributes;for(const u in r){const f=r[u];this.setAttribute(u,f.clone(n))}const s=e.morphAttributes;for(const u in s){const f=[],p=s[u];for(let h=0,x=p.length;h<x;h++)f.push(p[h].clone(n));this.morphAttributes[u]=f}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let u=0,f=a.length;u<f;u++){const p=a[u];this.addGroup(p.start,p.count,p.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const $p=new dt,sr=new Qh,bo=new Zl,Yp=new U,Eo=new U,To=new U,Ao=new U,Zc=new U,Co=new U,Kp=new U,No=new U;class zt extends Yt{constructor(e=new Rn,n=new Li){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=n,this.updateMorphTargets()}copy(e,n){return super.copy(e,n),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const n=this.geometry.morphAttributes,i=Object.keys(n);if(i.length>0){const r=n[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=r.length;s<a;s++){const o=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}getVertexPosition(e,n){const i=this.geometry,r=i.attributes.position,s=i.morphAttributes.position,a=i.morphTargetsRelative;n.fromBufferAttribute(r,e);const o=this.morphTargetInfluences;if(s&&o){Co.set(0,0,0);for(let c=0,u=s.length;c<u;c++){const f=o[c],p=s[c];f!==0&&(Zc.fromBufferAttribute(p,e),a?Co.addScaledVector(Zc,f):Co.addScaledVector(Zc.sub(n),f))}n.add(Co)}return n}raycast(e,n){const i=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),bo.copy(i.boundingSphere),bo.applyMatrix4(s),sr.copy(e.ray).recast(e.near),!(bo.containsPoint(sr.origin)===!1&&(sr.intersectSphere(bo,Yp)===null||sr.origin.distanceToSquared(Yp)>(e.far-e.near)**2))&&($p.copy(s).invert(),sr.copy(e.ray).applyMatrix4($p),!(i.boundingBox!==null&&sr.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,n,sr)))}_computeIntersections(e,n,i){let r;const s=this.geometry,a=this.material,o=s.index,c=s.attributes.position,u=s.attributes.uv,f=s.attributes.uv1,p=s.attributes.normal,h=s.groups,x=s.drawRange;if(o!==null)if(Array.isArray(a))for(let _=0,S=h.length;_<S;_++){const m=h[_],d=a[m.materialIndex],g=Math.max(m.start,x.start),v=Math.min(o.count,Math.min(m.start+m.count,x.start+x.count));for(let w=g,R=v;w<R;w+=3){const E=o.getX(w),A=o.getX(w+1),N=o.getX(w+2);r=Ro(this,d,e,i,u,f,p,E,A,N),r&&(r.faceIndex=Math.floor(w/3),r.face.materialIndex=m.materialIndex,n.push(r))}}else{const _=Math.max(0,x.start),S=Math.min(o.count,x.start+x.count);for(let m=_,d=S;m<d;m+=3){const g=o.getX(m),v=o.getX(m+1),w=o.getX(m+2);r=Ro(this,a,e,i,u,f,p,g,v,w),r&&(r.faceIndex=Math.floor(m/3),n.push(r))}}else if(c!==void 0)if(Array.isArray(a))for(let _=0,S=h.length;_<S;_++){const m=h[_],d=a[m.materialIndex],g=Math.max(m.start,x.start),v=Math.min(c.count,Math.min(m.start+m.count,x.start+x.count));for(let w=g,R=v;w<R;w+=3){const E=w,A=w+1,N=w+2;r=Ro(this,d,e,i,u,f,p,E,A,N),r&&(r.faceIndex=Math.floor(w/3),r.face.materialIndex=m.materialIndex,n.push(r))}}else{const _=Math.max(0,x.start),S=Math.min(c.count,x.start+x.count);for(let m=_,d=S;m<d;m+=3){const g=m,v=m+1,w=m+2;r=Ro(this,a,e,i,u,f,p,g,v,w),r&&(r.faceIndex=Math.floor(m/3),n.push(r))}}}}function _S(t,e,n,i,r,s,a,o){let c;if(e.side===qt?c=i.intersectTriangle(a,s,r,!0,o):c=i.intersectTriangle(r,s,a,e.side===Ki,o),c===null)return null;No.copy(o),No.applyMatrix4(t.matrixWorld);const u=n.ray.origin.distanceTo(No);return u<n.near||u>n.far?null:{distance:u,point:No.clone(),object:t}}function Ro(t,e,n,i,r,s,a,o,c,u){t.getVertexPosition(o,Eo),t.getVertexPosition(c,To),t.getVertexPosition(u,Ao);const f=_S(t,e,n,i,Eo,To,Ao,Kp);if(f){const p=new U;jn.getBarycoord(Kp,Eo,To,Ao,p),r&&(f.uv=jn.getInterpolatedAttribute(r,o,c,u,p,new $e)),s&&(f.uv1=jn.getInterpolatedAttribute(s,o,c,u,p,new $e)),a&&(f.normal=jn.getInterpolatedAttribute(a,o,c,u,p,new U),f.normal.dot(i.direction)>0&&f.normal.multiplyScalar(-1));const h={a:o,b:c,c:u,normal:new U,materialIndex:0};jn.getNormal(Eo,To,Ao,h.normal),f.face=h,f.barycoord=p}return f}class qa extends Rn{constructor(e=1,n=1,i=1,r=1,s=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:n,depth:i,widthSegments:r,heightSegments:s,depthSegments:a};const o=this;r=Math.floor(r),s=Math.floor(s),a=Math.floor(a);const c=[],u=[],f=[],p=[];let h=0,x=0;_("z","y","x",-1,-1,i,n,e,a,s,0),_("z","y","x",1,-1,i,n,-e,a,s,1),_("x","z","y",1,1,e,i,n,r,a,2),_("x","z","y",1,-1,e,i,-n,r,a,3),_("x","y","z",1,-1,e,n,i,r,s,4),_("x","y","z",-1,-1,e,n,-i,r,s,5),this.setIndex(c),this.setAttribute("position",new Bt(u,3)),this.setAttribute("normal",new Bt(f,3)),this.setAttribute("uv",new Bt(p,2));function _(S,m,d,g,v,w,R,E,A,N,F){const y=w/A,b=R/N,O=w/2,V=R/2,q=E/2,Q=A+1,W=N+1;let Y=0,D=0;const J=new U;for(let ee=0;ee<W;ee++){const z=ee*b-V;for(let le=0;le<Q;le++){const Ae=le*y-O;J[S]=Ae*g,J[m]=z*v,J[d]=q,u.push(J.x,J.y,J.z),J[S]=0,J[m]=0,J[d]=E>0?1:-1,f.push(J.x,J.y,J.z),p.push(le/A),p.push(1-ee/N),Y+=1}}for(let ee=0;ee<N;ee++)for(let z=0;z<A;z++){const le=h+z+Q*ee,Ae=h+z+Q*(ee+1),G=h+(z+1)+Q*(ee+1),re=h+(z+1)+Q*ee;c.push(le,Ae,re),c.push(Ae,G,re),D+=6}o.addGroup(x,D,F),x+=D,h+=Y}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new qa(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Ds(t){const e={};for(const n in t){e[n]={};for(const i in t[n]){const r=t[n][i];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[n][i]=null):e[n][i]=r.clone():Array.isArray(r)?e[n][i]=r.slice():e[n][i]=r}}return e}function Gt(t){const e={};for(let n=0;n<t.length;n++){const i=Ds(t[n]);for(const r in i)e[r]=i[r]}return e}function yS(t){const e=[];for(let n=0;n<t.length;n++)e.push(t[n].clone());return e}function Ag(t){const e=t.getRenderTarget();return e===null?t.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:tt.workingColorSpace}const SS={clone:Ds,merge:Gt};var wS=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,MS=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Zi extends zs{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=wS,this.fragmentShader=MS,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ds(e.uniforms),this.uniformsGroups=yS(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const n=super.toJSON(e);n.glslVersion=this.glslVersion,n.uniforms={};for(const r in this.uniforms){const a=this.uniforms[r].value;a&&a.isTexture?n.uniforms[r]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?n.uniforms[r]={type:"c",value:a.getHex()}:a&&a.isVector2?n.uniforms[r]={type:"v2",value:a.toArray()}:a&&a.isVector3?n.uniforms[r]={type:"v3",value:a.toArray()}:a&&a.isVector4?n.uniforms[r]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?n.uniforms[r]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?n.uniforms[r]={type:"m4",value:a.toArray()}:n.uniforms[r]={value:a}}Object.keys(this.defines).length>0&&(n.defines=this.defines),n.vertexShader=this.vertexShader,n.fragmentShader=this.fragmentShader,n.lights=this.lights,n.clipping=this.clipping;const i={};for(const r in this.extensions)this.extensions[r]===!0&&(i[r]=!0);return Object.keys(i).length>0&&(n.extensions=i),n}}class Cg extends Yt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new dt,this.projectionMatrix=new dt,this.projectionMatrixInverse=new dt,this.coordinateSystem=hi}copy(e,n){return super.copy(e,n),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,n){super.updateWorldMatrix(e,n),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Ni=new U,Zp=new $e,Qp=new $e;class fn extends Cg{constructor(e=50,n=1,i=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=r,this.focus=10,this.aspect=n,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,n){return super.copy(e,n),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const n=.5*this.getFilmHeight()/e;this.fov=Xd*2*Math.atan(n),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Rc*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Xd*2*Math.atan(Math.tan(Rc*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,n,i){Ni.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Ni.x,Ni.y).multiplyScalar(-e/Ni.z),Ni.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Ni.x,Ni.y).multiplyScalar(-e/Ni.z)}getViewSize(e,n){return this.getViewBounds(e,Zp,Qp),n.subVectors(Qp,Zp)}setViewOffset(e,n,i,r,s,a){this.aspect=e/n,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=n,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let n=e*Math.tan(Rc*.5*this.fov)/this.zoom,i=2*n,r=this.aspect*i,s=-.5*r;const a=this.view;if(this.view!==null&&this.view.enabled){const c=a.fullWidth,u=a.fullHeight;s+=a.offsetX*r/c,n-=a.offsetY*i/u,r*=a.width/c,i*=a.height/u}const o=this.filmOffset;o!==0&&(s+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,n,n-i,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const n=super.toJSON(e);return n.object.fov=this.fov,n.object.zoom=this.zoom,n.object.near=this.near,n.object.far=this.far,n.object.focus=this.focus,n.object.aspect=this.aspect,this.view!==null&&(n.object.view=Object.assign({},this.view)),n.object.filmGauge=this.filmGauge,n.object.filmOffset=this.filmOffset,n}}const Wr=-90,Xr=1;class bS extends Yt{constructor(e,n,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const r=new fn(Wr,Xr,e,n);r.layers=this.layers,this.add(r);const s=new fn(Wr,Xr,e,n);s.layers=this.layers,this.add(s);const a=new fn(Wr,Xr,e,n);a.layers=this.layers,this.add(a);const o=new fn(Wr,Xr,e,n);o.layers=this.layers,this.add(o);const c=new fn(Wr,Xr,e,n);c.layers=this.layers,this.add(c);const u=new fn(Wr,Xr,e,n);u.layers=this.layers,this.add(u)}updateCoordinateSystem(){const e=this.coordinateSystem,n=this.children.concat(),[i,r,s,a,o,c]=n;for(const u of n)this.remove(u);if(e===hi)i.up.set(0,1,0),i.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===Nl)i.up.set(0,-1,0),i.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const u of n)this.add(u),u.updateMatrixWorld()}update(e,n){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[s,a,o,c,u,f]=this.children,p=e.getRenderTarget(),h=e.getActiveCubeFace(),x=e.getActiveMipmapLevel(),_=e.xr.enabled;e.xr.enabled=!1;const S=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,r),e.render(n,s),e.setRenderTarget(i,1,r),e.render(n,a),e.setRenderTarget(i,2,r),e.render(n,o),e.setRenderTarget(i,3,r),e.render(n,c),e.setRenderTarget(i,4,r),e.render(n,u),i.texture.generateMipmaps=S,e.setRenderTarget(i,5,r),e.render(n,f),e.setRenderTarget(p,h,x),e.xr.enabled=_,i.texture.needsPMREMUpdate=!0}}class Ng extends $t{constructor(e,n,i,r,s,a,o,c,u,f){e=e!==void 0?e:[],n=n!==void 0?n:Ns,super(e,n,i,r,s,a,o,c,u,f),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class ES extends Nr{constructor(e=1,n={}){super(e,e,n),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},r=[i,i,i,i,i,i];this.texture=new Ng(r,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=n.generateMipmaps!==void 0?n.generateMipmaps:!1,this.texture.minFilter=n.minFilter!==void 0?n.minFilter:Mn}fromEquirectangularTexture(e,n){this.texture.type=n.type,this.texture.colorSpace=n.colorSpace,this.texture.generateMipmaps=n.generateMipmaps,this.texture.minFilter=n.minFilter,this.texture.magFilter=n.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new qa(5,5,5),s=new Zi({name:"CubemapFromEquirect",uniforms:Ds(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:qt,blending:Xi});s.uniforms.tEquirect.value=n;const a=new zt(r,s),o=n.minFilter;return n.minFilter===yr&&(n.minFilter=Mn),new bS(1,10,this).update(e,a),n.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,n,i,r){const s=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(n,i,r);e.setRenderTarget(s)}}const Qc=new U,TS=new U,AS=new je;class hr{constructor(e=new U(1,0,0),n=0){this.isPlane=!0,this.normal=e,this.constant=n}set(e,n){return this.normal.copy(e),this.constant=n,this}setComponents(e,n,i,r){return this.normal.set(e,n,i),this.constant=r,this}setFromNormalAndCoplanarPoint(e,n){return this.normal.copy(e),this.constant=-n.dot(this.normal),this}setFromCoplanarPoints(e,n,i){const r=Qc.subVectors(i,n).cross(TS.subVectors(e,n)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,n){return n.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,n){const i=e.delta(Qc),r=this.normal.dot(i);if(r===0)return this.distanceToPoint(e.start)===0?n.copy(e.start):null;const s=-(e.start.dot(this.normal)+this.constant)/r;return s<0||s>1?null:n.copy(e.start).addScaledVector(i,s)}intersectsLine(e){const n=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return n<0&&i>0||i<0&&n>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,n){const i=n||AS.getNormalMatrix(e),r=this.coplanarPoint(Qc).applyMatrix4(e),s=this.normal.applyMatrix3(i).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const ar=new Zl,Po=new U;class ef{constructor(e=new hr,n=new hr,i=new hr,r=new hr,s=new hr,a=new hr){this.planes=[e,n,i,r,s,a]}set(e,n,i,r,s,a){const o=this.planes;return o[0].copy(e),o[1].copy(n),o[2].copy(i),o[3].copy(r),o[4].copy(s),o[5].copy(a),this}copy(e){const n=this.planes;for(let i=0;i<6;i++)n[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,n=hi){const i=this.planes,r=e.elements,s=r[0],a=r[1],o=r[2],c=r[3],u=r[4],f=r[5],p=r[6],h=r[7],x=r[8],_=r[9],S=r[10],m=r[11],d=r[12],g=r[13],v=r[14],w=r[15];if(i[0].setComponents(c-s,h-u,m-x,w-d).normalize(),i[1].setComponents(c+s,h+u,m+x,w+d).normalize(),i[2].setComponents(c+a,h+f,m+_,w+g).normalize(),i[3].setComponents(c-a,h-f,m-_,w-g).normalize(),i[4].setComponents(c-o,h-p,m-S,w-v).normalize(),n===hi)i[5].setComponents(c+o,h+p,m+S,w+v).normalize();else if(n===Nl)i[5].setComponents(o,p,S,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+n);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),ar.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const n=e.geometry;n.boundingSphere===null&&n.computeBoundingSphere(),ar.copy(n.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(ar)}intersectsSprite(e){return ar.center.set(0,0,0),ar.radius=.7071067811865476,ar.applyMatrix4(e.matrixWorld),this.intersectsSphere(ar)}intersectsSphere(e){const n=this.planes,i=e.center,r=-e.radius;for(let s=0;s<6;s++)if(n[s].distanceToPoint(i)<r)return!1;return!0}intersectsBox(e){const n=this.planes;for(let i=0;i<6;i++){const r=n[i];if(Po.x=r.normal.x>0?e.max.x:e.min.x,Po.y=r.normal.y>0?e.max.y:e.min.y,Po.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Po)<0)return!1}return!0}containsPoint(e){const n=this.planes;for(let i=0;i<6;i++)if(n[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function Rg(){let t=null,e=!1,n=null,i=null;function r(s,a){n(s,a),i=t.requestAnimationFrame(r)}return{start:function(){e!==!0&&n!==null&&(i=t.requestAnimationFrame(r),e=!0)},stop:function(){t.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(s){n=s},setContext:function(s){t=s}}}function CS(t){const e=new WeakMap;function n(o,c){const u=o.array,f=o.usage,p=u.byteLength,h=t.createBuffer();t.bindBuffer(c,h),t.bufferData(c,u,f),o.onUploadCallback();let x;if(u instanceof Float32Array)x=t.FLOAT;else if(u instanceof Uint16Array)o.isFloat16BufferAttribute?x=t.HALF_FLOAT:x=t.UNSIGNED_SHORT;else if(u instanceof Int16Array)x=t.SHORT;else if(u instanceof Uint32Array)x=t.UNSIGNED_INT;else if(u instanceof Int32Array)x=t.INT;else if(u instanceof Int8Array)x=t.BYTE;else if(u instanceof Uint8Array)x=t.UNSIGNED_BYTE;else if(u instanceof Uint8ClampedArray)x=t.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+u);return{buffer:h,type:x,bytesPerElement:u.BYTES_PER_ELEMENT,version:o.version,size:p}}function i(o,c,u){const f=c.array,p=c.updateRanges;if(t.bindBuffer(u,o),p.length===0)t.bufferSubData(u,0,f);else{p.sort((x,_)=>x.start-_.start);let h=0;for(let x=1;x<p.length;x++){const _=p[h],S=p[x];S.start<=_.start+_.count+1?_.count=Math.max(_.count,S.start+S.count-_.start):(++h,p[h]=S)}p.length=h+1;for(let x=0,_=p.length;x<_;x++){const S=p[x];t.bufferSubData(u,S.start*f.BYTES_PER_ELEMENT,f,S.start,S.count)}c.clearUpdateRanges()}c.onUploadCallback()}function r(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function s(o){o.isInterleavedBufferAttribute&&(o=o.data);const c=e.get(o);c&&(t.deleteBuffer(c.buffer),e.delete(o))}function a(o,c){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const f=e.get(o);(!f||f.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const u=e.get(o);if(u===void 0)e.set(o,n(o,c));else if(u.version<o.version){if(u.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(u.buffer,o,c),u.version=o.version}}return{get:r,remove:s,update:a}}class ks extends Rn{constructor(e=1,n=1,i=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:n,widthSegments:i,heightSegments:r};const s=e/2,a=n/2,o=Math.floor(i),c=Math.floor(r),u=o+1,f=c+1,p=e/o,h=n/c,x=[],_=[],S=[],m=[];for(let d=0;d<f;d++){const g=d*h-a;for(let v=0;v<u;v++){const w=v*p-s;_.push(w,-g,0),S.push(0,0,1),m.push(v/o),m.push(1-d/c)}}for(let d=0;d<c;d++)for(let g=0;g<o;g++){const v=g+u*d,w=g+u*(d+1),R=g+1+u*(d+1),E=g+1+u*d;x.push(v,w,E),x.push(w,R,E)}this.setIndex(x),this.setAttribute("position",new Bt(_,3)),this.setAttribute("normal",new Bt(S,3)),this.setAttribute("uv",new Bt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ks(e.width,e.height,e.widthSegments,e.heightSegments)}}var NS=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,RS=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,PS=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,LS=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,DS=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,kS=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,IS=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,US=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,FS=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,OS=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,zS=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,jS=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,BS=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,HS=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,VS=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,GS=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,WS=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,XS=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,qS=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,$S=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,YS=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,KS=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,ZS=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,QS=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,JS=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,ew=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,tw=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,nw=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,iw=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,rw=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,sw="gl_FragColor = linearToOutputTexel( gl_FragColor );",aw=`
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,ow=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,lw=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,cw=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,uw=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,dw=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,hw=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fw=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,pw=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,mw=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,xw=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,gw=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,vw=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,_w=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,yw=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,Sw=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,ww=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Mw=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,bw=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Ew=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Tw=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Aw=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Cw=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Nw=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Rw=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Pw=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Lw=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Dw=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,kw=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Iw=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Uw=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Fw=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Ow=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,zw=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,jw=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Bw=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Hw=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Vw=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Gw=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Ww=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Xw=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,qw=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,$w=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Yw=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Kw=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Zw=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Qw=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Jw=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,eM=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,tM=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,nM=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,iM=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,rM=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,sM=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,aM=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,oM=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,lM=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,cM=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,uM=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,dM=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,hM=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,fM=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,pM=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,mM=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,xM=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,gM=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,vM=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,_M=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,yM=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,SM=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,wM=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,MM=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,bM=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,EM=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,TM=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,AM=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const CM=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,NM=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,RM=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,PM=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,LM=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,DM=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,kM=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,IM=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,UM=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,FM=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,OM=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,zM=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,jM=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,BM=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,HM=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,VM=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,GM=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,WM=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,XM=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,qM=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,$M=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,YM=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,KM=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ZM=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,QM=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,JM=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,eb=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,tb=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,nb=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,ib=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,rb=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,sb=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,ab=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,ob=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,ze={alphahash_fragment:NS,alphahash_pars_fragment:RS,alphamap_fragment:PS,alphamap_pars_fragment:LS,alphatest_fragment:DS,alphatest_pars_fragment:kS,aomap_fragment:IS,aomap_pars_fragment:US,batching_pars_vertex:FS,batching_vertex:OS,begin_vertex:zS,beginnormal_vertex:jS,bsdfs:BS,iridescence_fragment:HS,bumpmap_pars_fragment:VS,clipping_planes_fragment:GS,clipping_planes_pars_fragment:WS,clipping_planes_pars_vertex:XS,clipping_planes_vertex:qS,color_fragment:$S,color_pars_fragment:YS,color_pars_vertex:KS,color_vertex:ZS,common:QS,cube_uv_reflection_fragment:JS,defaultnormal_vertex:ew,displacementmap_pars_vertex:tw,displacementmap_vertex:nw,emissivemap_fragment:iw,emissivemap_pars_fragment:rw,colorspace_fragment:sw,colorspace_pars_fragment:aw,envmap_fragment:ow,envmap_common_pars_fragment:lw,envmap_pars_fragment:cw,envmap_pars_vertex:uw,envmap_physical_pars_fragment:Sw,envmap_vertex:dw,fog_vertex:hw,fog_pars_vertex:fw,fog_fragment:pw,fog_pars_fragment:mw,gradientmap_pars_fragment:xw,lightmap_pars_fragment:gw,lights_lambert_fragment:vw,lights_lambert_pars_fragment:_w,lights_pars_begin:yw,lights_toon_fragment:ww,lights_toon_pars_fragment:Mw,lights_phong_fragment:bw,lights_phong_pars_fragment:Ew,lights_physical_fragment:Tw,lights_physical_pars_fragment:Aw,lights_fragment_begin:Cw,lights_fragment_maps:Nw,lights_fragment_end:Rw,logdepthbuf_fragment:Pw,logdepthbuf_pars_fragment:Lw,logdepthbuf_pars_vertex:Dw,logdepthbuf_vertex:kw,map_fragment:Iw,map_pars_fragment:Uw,map_particle_fragment:Fw,map_particle_pars_fragment:Ow,metalnessmap_fragment:zw,metalnessmap_pars_fragment:jw,morphinstance_vertex:Bw,morphcolor_vertex:Hw,morphnormal_vertex:Vw,morphtarget_pars_vertex:Gw,morphtarget_vertex:Ww,normal_fragment_begin:Xw,normal_fragment_maps:qw,normal_pars_fragment:$w,normal_pars_vertex:Yw,normal_vertex:Kw,normalmap_pars_fragment:Zw,clearcoat_normal_fragment_begin:Qw,clearcoat_normal_fragment_maps:Jw,clearcoat_pars_fragment:eM,iridescence_pars_fragment:tM,opaque_fragment:nM,packing:iM,premultiplied_alpha_fragment:rM,project_vertex:sM,dithering_fragment:aM,dithering_pars_fragment:oM,roughnessmap_fragment:lM,roughnessmap_pars_fragment:cM,shadowmap_pars_fragment:uM,shadowmap_pars_vertex:dM,shadowmap_vertex:hM,shadowmask_pars_fragment:fM,skinbase_vertex:pM,skinning_pars_vertex:mM,skinning_vertex:xM,skinnormal_vertex:gM,specularmap_fragment:vM,specularmap_pars_fragment:_M,tonemapping_fragment:yM,tonemapping_pars_fragment:SM,transmission_fragment:wM,transmission_pars_fragment:MM,uv_pars_fragment:bM,uv_pars_vertex:EM,uv_vertex:TM,worldpos_vertex:AM,background_vert:CM,background_frag:NM,backgroundCube_vert:RM,backgroundCube_frag:PM,cube_vert:LM,cube_frag:DM,depth_vert:kM,depth_frag:IM,distanceRGBA_vert:UM,distanceRGBA_frag:FM,equirect_vert:OM,equirect_frag:zM,linedashed_vert:jM,linedashed_frag:BM,meshbasic_vert:HM,meshbasic_frag:VM,meshlambert_vert:GM,meshlambert_frag:WM,meshmatcap_vert:XM,meshmatcap_frag:qM,meshnormal_vert:$M,meshnormal_frag:YM,meshphong_vert:KM,meshphong_frag:ZM,meshphysical_vert:QM,meshphysical_frag:JM,meshtoon_vert:eb,meshtoon_frag:tb,points_vert:nb,points_frag:ib,shadow_vert:rb,shadow_frag:sb,sprite_vert:ab,sprite_frag:ob},pe={common:{diffuse:{value:new Ye(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new je},alphaMap:{value:null},alphaMapTransform:{value:new je},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new je}},envmap:{envMap:{value:null},envMapRotation:{value:new je},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new je}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new je}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new je},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new je},normalScale:{value:new $e(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new je},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new je}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new je}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new je}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ye(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ye(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new je},alphaTest:{value:0},uvTransform:{value:new je}},sprite:{diffuse:{value:new Ye(16777215)},opacity:{value:1},center:{value:new $e(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new je},alphaMap:{value:null},alphaMapTransform:{value:new je},alphaTest:{value:0}}},$n={basic:{uniforms:Gt([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.fog]),vertexShader:ze.meshbasic_vert,fragmentShader:ze.meshbasic_frag},lambert:{uniforms:Gt([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,pe.lights,{emissive:{value:new Ye(0)}}]),vertexShader:ze.meshlambert_vert,fragmentShader:ze.meshlambert_frag},phong:{uniforms:Gt([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,pe.lights,{emissive:{value:new Ye(0)},specular:{value:new Ye(1118481)},shininess:{value:30}}]),vertexShader:ze.meshphong_vert,fragmentShader:ze.meshphong_frag},standard:{uniforms:Gt([pe.common,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.roughnessmap,pe.metalnessmap,pe.fog,pe.lights,{emissive:{value:new Ye(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:ze.meshphysical_vert,fragmentShader:ze.meshphysical_frag},toon:{uniforms:Gt([pe.common,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.gradientmap,pe.fog,pe.lights,{emissive:{value:new Ye(0)}}]),vertexShader:ze.meshtoon_vert,fragmentShader:ze.meshtoon_frag},matcap:{uniforms:Gt([pe.common,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,{matcap:{value:null}}]),vertexShader:ze.meshmatcap_vert,fragmentShader:ze.meshmatcap_frag},points:{uniforms:Gt([pe.points,pe.fog]),vertexShader:ze.points_vert,fragmentShader:ze.points_frag},dashed:{uniforms:Gt([pe.common,pe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:ze.linedashed_vert,fragmentShader:ze.linedashed_frag},depth:{uniforms:Gt([pe.common,pe.displacementmap]),vertexShader:ze.depth_vert,fragmentShader:ze.depth_frag},normal:{uniforms:Gt([pe.common,pe.bumpmap,pe.normalmap,pe.displacementmap,{opacity:{value:1}}]),vertexShader:ze.meshnormal_vert,fragmentShader:ze.meshnormal_frag},sprite:{uniforms:Gt([pe.sprite,pe.fog]),vertexShader:ze.sprite_vert,fragmentShader:ze.sprite_frag},background:{uniforms:{uvTransform:{value:new je},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:ze.background_vert,fragmentShader:ze.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new je}},vertexShader:ze.backgroundCube_vert,fragmentShader:ze.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:ze.cube_vert,fragmentShader:ze.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:ze.equirect_vert,fragmentShader:ze.equirect_frag},distanceRGBA:{uniforms:Gt([pe.common,pe.displacementmap,{referencePosition:{value:new U},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:ze.distanceRGBA_vert,fragmentShader:ze.distanceRGBA_frag},shadow:{uniforms:Gt([pe.lights,pe.fog,{color:{value:new Ye(0)},opacity:{value:1}}]),vertexShader:ze.shadow_vert,fragmentShader:ze.shadow_frag}};$n.physical={uniforms:Gt([$n.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new je},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new je},clearcoatNormalScale:{value:new $e(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new je},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new je},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new je},sheen:{value:0},sheenColor:{value:new Ye(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new je},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new je},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new je},transmissionSamplerSize:{value:new $e},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new je},attenuationDistance:{value:0},attenuationColor:{value:new Ye(0)},specularColor:{value:new Ye(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new je},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new je},anisotropyVector:{value:new $e},anisotropyMap:{value:null},anisotropyMapTransform:{value:new je}}]),vertexShader:ze.meshphysical_vert,fragmentShader:ze.meshphysical_frag};const Lo={r:0,b:0,g:0},or=new Qn,lb=new dt;function cb(t,e,n,i,r,s,a){const o=new Ye(0);let c=s===!0?0:1,u,f,p=null,h=0,x=null;function _(g){let v=g.isScene===!0?g.background:null;return v&&v.isTexture&&(v=(g.backgroundBlurriness>0?n:e).get(v)),v}function S(g){let v=!1;const w=_(g);w===null?d(o,c):w&&w.isColor&&(d(w,1),v=!0);const R=t.xr.getEnvironmentBlendMode();R==="additive"?i.buffers.color.setClear(0,0,0,1,a):R==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,a),(t.autoClear||v)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil))}function m(g,v){const w=_(v);w&&(w.isCubeTexture||w.mapping===Yl)?(f===void 0&&(f=new zt(new qa(1,1,1),new Zi({name:"BackgroundCubeMaterial",uniforms:Ds($n.backgroundCube.uniforms),vertexShader:$n.backgroundCube.vertexShader,fragmentShader:$n.backgroundCube.fragmentShader,side:qt,depthTest:!1,depthWrite:!1,fog:!1})),f.geometry.deleteAttribute("normal"),f.geometry.deleteAttribute("uv"),f.onBeforeRender=function(R,E,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(f.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(f)),or.copy(v.backgroundRotation),or.x*=-1,or.y*=-1,or.z*=-1,w.isCubeTexture&&w.isRenderTargetTexture===!1&&(or.y*=-1,or.z*=-1),f.material.uniforms.envMap.value=w,f.material.uniforms.flipEnvMap.value=w.isCubeTexture&&w.isRenderTargetTexture===!1?-1:1,f.material.uniforms.backgroundBlurriness.value=v.backgroundBlurriness,f.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,f.material.uniforms.backgroundRotation.value.setFromMatrix4(lb.makeRotationFromEuler(or)),f.material.toneMapped=tt.getTransfer(w.colorSpace)!==ct,(p!==w||h!==w.version||x!==t.toneMapping)&&(f.material.needsUpdate=!0,p=w,h=w.version,x=t.toneMapping),f.layers.enableAll(),g.unshift(f,f.geometry,f.material,0,0,null)):w&&w.isTexture&&(u===void 0&&(u=new zt(new ks(2,2),new Zi({name:"BackgroundMaterial",uniforms:Ds($n.background.uniforms),vertexShader:$n.background.vertexShader,fragmentShader:$n.background.fragmentShader,side:Ki,depthTest:!1,depthWrite:!1,fog:!1})),u.geometry.deleteAttribute("normal"),Object.defineProperty(u.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(u)),u.material.uniforms.t2D.value=w,u.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,u.material.toneMapped=tt.getTransfer(w.colorSpace)!==ct,w.matrixAutoUpdate===!0&&w.updateMatrix(),u.material.uniforms.uvTransform.value.copy(w.matrix),(p!==w||h!==w.version||x!==t.toneMapping)&&(u.material.needsUpdate=!0,p=w,h=w.version,x=t.toneMapping),u.layers.enableAll(),g.unshift(u,u.geometry,u.material,0,0,null))}function d(g,v){g.getRGB(Lo,Ag(t)),i.buffers.color.setClear(Lo.r,Lo.g,Lo.b,v,a)}return{getClearColor:function(){return o},setClearColor:function(g,v=1){o.set(g),c=v,d(o,c)},getClearAlpha:function(){return c},setClearAlpha:function(g){c=g,d(o,c)},render:S,addToRenderList:m}}function ub(t,e){const n=t.getParameter(t.MAX_VERTEX_ATTRIBS),i={},r=h(null);let s=r,a=!1;function o(y,b,O,V,q){let Q=!1;const W=p(V,O,b);s!==W&&(s=W,u(s.object)),Q=x(y,V,O,q),Q&&_(y,V,O,q),q!==null&&e.update(q,t.ELEMENT_ARRAY_BUFFER),(Q||a)&&(a=!1,w(y,b,O,V),q!==null&&t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,e.get(q).buffer))}function c(){return t.createVertexArray()}function u(y){return t.bindVertexArray(y)}function f(y){return t.deleteVertexArray(y)}function p(y,b,O){const V=O.wireframe===!0;let q=i[y.id];q===void 0&&(q={},i[y.id]=q);let Q=q[b.id];Q===void 0&&(Q={},q[b.id]=Q);let W=Q[V];return W===void 0&&(W=h(c()),Q[V]=W),W}function h(y){const b=[],O=[],V=[];for(let q=0;q<n;q++)b[q]=0,O[q]=0,V[q]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:b,enabledAttributes:O,attributeDivisors:V,object:y,attributes:{},index:null}}function x(y,b,O,V){const q=s.attributes,Q=b.attributes;let W=0;const Y=O.getAttributes();for(const D in Y)if(Y[D].location>=0){const ee=q[D];let z=Q[D];if(z===void 0&&(D==="instanceMatrix"&&y.instanceMatrix&&(z=y.instanceMatrix),D==="instanceColor"&&y.instanceColor&&(z=y.instanceColor)),ee===void 0||ee.attribute!==z||z&&ee.data!==z.data)return!0;W++}return s.attributesNum!==W||s.index!==V}function _(y,b,O,V){const q={},Q=b.attributes;let W=0;const Y=O.getAttributes();for(const D in Y)if(Y[D].location>=0){let ee=Q[D];ee===void 0&&(D==="instanceMatrix"&&y.instanceMatrix&&(ee=y.instanceMatrix),D==="instanceColor"&&y.instanceColor&&(ee=y.instanceColor));const z={};z.attribute=ee,ee&&ee.data&&(z.data=ee.data),q[D]=z,W++}s.attributes=q,s.attributesNum=W,s.index=V}function S(){const y=s.newAttributes;for(let b=0,O=y.length;b<O;b++)y[b]=0}function m(y){d(y,0)}function d(y,b){const O=s.newAttributes,V=s.enabledAttributes,q=s.attributeDivisors;O[y]=1,V[y]===0&&(t.enableVertexAttribArray(y),V[y]=1),q[y]!==b&&(t.vertexAttribDivisor(y,b),q[y]=b)}function g(){const y=s.newAttributes,b=s.enabledAttributes;for(let O=0,V=b.length;O<V;O++)b[O]!==y[O]&&(t.disableVertexAttribArray(O),b[O]=0)}function v(y,b,O,V,q,Q,W){W===!0?t.vertexAttribIPointer(y,b,O,q,Q):t.vertexAttribPointer(y,b,O,V,q,Q)}function w(y,b,O,V){S();const q=V.attributes,Q=O.getAttributes(),W=b.defaultAttributeValues;for(const Y in Q){const D=Q[Y];if(D.location>=0){let J=q[Y];if(J===void 0&&(Y==="instanceMatrix"&&y.instanceMatrix&&(J=y.instanceMatrix),Y==="instanceColor"&&y.instanceColor&&(J=y.instanceColor)),J!==void 0){const ee=J.normalized,z=J.itemSize,le=e.get(J);if(le===void 0)continue;const Ae=le.buffer,G=le.type,re=le.bytesPerElement,ue=G===t.INT||G===t.UNSIGNED_INT||J.gpuType===Wh;if(J.isInterleavedBufferAttribute){const me=J.data,Le=me.stride,De=J.offset;if(me.isInstancedInterleavedBuffer){for(let We=0;We<D.locationSize;We++)d(D.location+We,me.meshPerAttribute);y.isInstancedMesh!==!0&&V._maxInstanceCount===void 0&&(V._maxInstanceCount=me.meshPerAttribute*me.count)}else for(let We=0;We<D.locationSize;We++)m(D.location+We);t.bindBuffer(t.ARRAY_BUFFER,Ae);for(let We=0;We<D.locationSize;We++)v(D.location+We,z/D.locationSize,G,ee,Le*re,(De+z/D.locationSize*We)*re,ue)}else{if(J.isInstancedBufferAttribute){for(let me=0;me<D.locationSize;me++)d(D.location+me,J.meshPerAttribute);y.isInstancedMesh!==!0&&V._maxInstanceCount===void 0&&(V._maxInstanceCount=J.meshPerAttribute*J.count)}else for(let me=0;me<D.locationSize;me++)m(D.location+me);t.bindBuffer(t.ARRAY_BUFFER,Ae);for(let me=0;me<D.locationSize;me++)v(D.location+me,z/D.locationSize,G,ee,z*re,z/D.locationSize*me*re,ue)}}else if(W!==void 0){const ee=W[Y];if(ee!==void 0)switch(ee.length){case 2:t.vertexAttrib2fv(D.location,ee);break;case 3:t.vertexAttrib3fv(D.location,ee);break;case 4:t.vertexAttrib4fv(D.location,ee);break;default:t.vertexAttrib1fv(D.location,ee)}}}}g()}function R(){N();for(const y in i){const b=i[y];for(const O in b){const V=b[O];for(const q in V)f(V[q].object),delete V[q];delete b[O]}delete i[y]}}function E(y){if(i[y.id]===void 0)return;const b=i[y.id];for(const O in b){const V=b[O];for(const q in V)f(V[q].object),delete V[q];delete b[O]}delete i[y.id]}function A(y){for(const b in i){const O=i[b];if(O[y.id]===void 0)continue;const V=O[y.id];for(const q in V)f(V[q].object),delete V[q];delete O[y.id]}}function N(){F(),a=!0,s!==r&&(s=r,u(s.object))}function F(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:o,reset:N,resetDefaultState:F,dispose:R,releaseStatesOfGeometry:E,releaseStatesOfProgram:A,initAttributes:S,enableAttribute:m,disableUnusedAttributes:g}}function db(t,e,n){let i;function r(u){i=u}function s(u,f){t.drawArrays(i,u,f),n.update(f,i,1)}function a(u,f,p){p!==0&&(t.drawArraysInstanced(i,u,f,p),n.update(f,i,p))}function o(u,f,p){if(p===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,u,0,f,0,p);let x=0;for(let _=0;_<p;_++)x+=f[_];n.update(x,i,1)}function c(u,f,p,h){if(p===0)return;const x=e.get("WEBGL_multi_draw");if(x===null)for(let _=0;_<u.length;_++)a(u[_],f[_],h[_]);else{x.multiDrawArraysInstancedWEBGL(i,u,0,f,0,h,0,p);let _=0;for(let S=0;S<p;S++)_+=f[S];for(let S=0;S<h.length;S++)n.update(_,i,h[S])}}this.setMode=r,this.render=s,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=c}function hb(t,e,n,i){let r;function s(){if(r!==void 0)return r;if(e.has("EXT_texture_filter_anisotropic")===!0){const A=e.get("EXT_texture_filter_anisotropic");r=t.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function a(A){return!(A!==Bn&&i.convert(A)!==t.getParameter(t.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(A){const N=A===Va&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(A!==_i&&i.convert(A)!==t.getParameter(t.IMPLEMENTATION_COLOR_READ_TYPE)&&A!==di&&!N)}function c(A){if(A==="highp"){if(t.getShaderPrecisionFormat(t.VERTEX_SHADER,t.HIGH_FLOAT).precision>0&&t.getShaderPrecisionFormat(t.FRAGMENT_SHADER,t.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&t.getShaderPrecisionFormat(t.VERTEX_SHADER,t.MEDIUM_FLOAT).precision>0&&t.getShaderPrecisionFormat(t.FRAGMENT_SHADER,t.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let u=n.precision!==void 0?n.precision:"highp";const f=c(u);f!==u&&(console.warn("THREE.WebGLRenderer:",u,"not supported, using",f,"instead."),u=f);const p=n.logarithmicDepthBuffer===!0,h=n.reverseDepthBuffer===!0&&e.has("EXT_clip_control");if(h===!0){const A=e.get("EXT_clip_control");A.clipControlEXT(A.LOWER_LEFT_EXT,A.ZERO_TO_ONE_EXT)}const x=t.getParameter(t.MAX_TEXTURE_IMAGE_UNITS),_=t.getParameter(t.MAX_VERTEX_TEXTURE_IMAGE_UNITS),S=t.getParameter(t.MAX_TEXTURE_SIZE),m=t.getParameter(t.MAX_CUBE_MAP_TEXTURE_SIZE),d=t.getParameter(t.MAX_VERTEX_ATTRIBS),g=t.getParameter(t.MAX_VERTEX_UNIFORM_VECTORS),v=t.getParameter(t.MAX_VARYING_VECTORS),w=t.getParameter(t.MAX_FRAGMENT_UNIFORM_VECTORS),R=_>0,E=t.getParameter(t.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:c,textureFormatReadable:a,textureTypeReadable:o,precision:u,logarithmicDepthBuffer:p,reverseDepthBuffer:h,maxTextures:x,maxVertexTextures:_,maxTextureSize:S,maxCubemapSize:m,maxAttributes:d,maxVertexUniforms:g,maxVaryings:v,maxFragmentUniforms:w,vertexTextures:R,maxSamples:E}}function fb(t){const e=this;let n=null,i=0,r=!1,s=!1;const a=new hr,o=new je,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(p,h){const x=p.length!==0||h||i!==0||r;return r=h,i=p.length,x},this.beginShadows=function(){s=!0,f(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(p,h){n=f(p,h,0)},this.setState=function(p,h,x){const _=p.clippingPlanes,S=p.clipIntersection,m=p.clipShadows,d=t.get(p);if(!r||_===null||_.length===0||s&&!m)s?f(null):u();else{const g=s?0:i,v=g*4;let w=d.clippingState||null;c.value=w,w=f(_,h,v,x);for(let R=0;R!==v;++R)w[R]=n[R];d.clippingState=w,this.numIntersection=S?this.numPlanes:0,this.numPlanes+=g}};function u(){c.value!==n&&(c.value=n,c.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function f(p,h,x,_){const S=p!==null?p.length:0;let m=null;if(S!==0){if(m=c.value,_!==!0||m===null){const d=x+S*4,g=h.matrixWorldInverse;o.getNormalMatrix(g),(m===null||m.length<d)&&(m=new Float32Array(d));for(let v=0,w=x;v!==S;++v,w+=4)a.copy(p[v]).applyMatrix4(g,o),a.normal.toArray(m,w),m[w+3]=a.constant}c.value=m,c.needsUpdate=!0}return e.numPlanes=S,e.numIntersection=0,m}}function pb(t){let e=new WeakMap;function n(a,o){return o===xd?a.mapping=Ns:o===gd&&(a.mapping=Rs),a}function i(a){if(a&&a.isTexture){const o=a.mapping;if(o===xd||o===gd)if(e.has(a)){const c=e.get(a).texture;return n(c,a.mapping)}else{const c=a.image;if(c&&c.height>0){const u=new ES(c.height);return u.fromEquirectangularTexture(t,a),e.set(a,u),a.addEventListener("dispose",r),n(u.texture,a.mapping)}else return null}}return a}function r(a){const o=a.target;o.removeEventListener("dispose",r);const c=e.get(o);c!==void 0&&(e.delete(o),c.dispose())}function s(){e=new WeakMap}return{get:i,dispose:s}}class mb extends Cg{constructor(e=-1,n=1,i=1,r=-1,s=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=n,this.top=i,this.bottom=r,this.near=s,this.far=a,this.updateProjectionMatrix()}copy(e,n){return super.copy(e,n),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,n,i,r,s,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=n,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),n=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,r=(this.top+this.bottom)/2;let s=i-e,a=i+e,o=r+n,c=r-n;if(this.view!==null&&this.view.enabled){const u=(this.right-this.left)/this.view.fullWidth/this.zoom,f=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=u*this.view.offsetX,a=s+u*this.view.width,o-=f*this.view.offsetY,c=o-f*this.view.height}this.projectionMatrix.makeOrthographic(s,a,o,c,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const n=super.toJSON(e);return n.object.zoom=this.zoom,n.object.left=this.left,n.object.right=this.right,n.object.top=this.top,n.object.bottom=this.bottom,n.object.near=this.near,n.object.far=this.far,this.view!==null&&(n.object.view=Object.assign({},this.view)),n}}const as=4,Jp=[.125,.215,.35,.446,.526,.582],mr=20,Jc=new mb,em=new Ye;let eu=null,tu=0,nu=0,iu=!1;const fr=(1+Math.sqrt(5))/2,qr=1/fr,tm=[new U(-fr,qr,0),new U(fr,qr,0),new U(-qr,0,fr),new U(qr,0,fr),new U(0,fr,-qr),new U(0,fr,qr),new U(-1,1,-1),new U(1,1,-1),new U(-1,1,1),new U(1,1,1)];class nm{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,n=0,i=.1,r=100){eu=this._renderer.getRenderTarget(),tu=this._renderer.getActiveCubeFace(),nu=this._renderer.getActiveMipmapLevel(),iu=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,i,r,s),n>0&&this._blur(s,0,0,n),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,n=null){return this._fromTexture(e,n)}fromCubemap(e,n=null){return this._fromTexture(e,n)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=sm(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=rm(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(eu,tu,nu),this._renderer.xr.enabled=iu,e.scissorTest=!1,Do(e,0,0,e.width,e.height)}_fromTexture(e,n){e.mapping===Ns||e.mapping===Rs?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),eu=this._renderer.getRenderTarget(),tu=this._renderer.getActiveCubeFace(),nu=this._renderer.getActiveMipmapLevel(),iu=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=n||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),n=4*this._cubeSize,i={magFilter:Mn,minFilter:Mn,generateMipmaps:!1,type:Va,format:Bn,colorSpace:tr,depthBuffer:!1},r=im(e,n,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==n){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=im(e,n,i);const{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=xb(s)),this._blurMaterial=gb(s,e,n)}return r}_compileMaterial(e){const n=new zt(this._lodPlanes[0],e);this._renderer.compile(n,Jc)}_sceneToCubeUV(e,n,i,r){const o=new fn(90,1,n,i),c=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],f=this._renderer,p=f.autoClear,h=f.toneMapping;f.getClearColor(em),f.toneMapping=qi,f.autoClear=!1;const x=new Li({name:"PMREM.Background",side:qt,depthWrite:!1,depthTest:!1}),_=new zt(new qa,x);let S=!1;const m=e.background;m?m.isColor&&(x.color.copy(m),e.background=null,S=!0):(x.color.copy(em),S=!0);for(let d=0;d<6;d++){const g=d%3;g===0?(o.up.set(0,c[d],0),o.lookAt(u[d],0,0)):g===1?(o.up.set(0,0,c[d]),o.lookAt(0,u[d],0)):(o.up.set(0,c[d],0),o.lookAt(0,0,u[d]));const v=this._cubeSize;Do(r,g*v,d>2?v:0,v,v),f.setRenderTarget(r),S&&f.render(_,o),f.render(e,o)}_.geometry.dispose(),_.material.dispose(),f.toneMapping=h,f.autoClear=p,e.background=m}_textureToCubeUV(e,n){const i=this._renderer,r=e.mapping===Ns||e.mapping===Rs;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=sm()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=rm());const s=r?this._cubemapMaterial:this._equirectMaterial,a=new zt(this._lodPlanes[0],s),o=s.uniforms;o.envMap.value=e;const c=this._cubeSize;Do(n,0,0,3*c,2*c),i.setRenderTarget(n),i.render(a,Jc)}_applyPMREM(e){const n=this._renderer,i=n.autoClear;n.autoClear=!1;const r=this._lodPlanes.length;for(let s=1;s<r;s++){const a=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),o=tm[(r-s-1)%tm.length];this._blur(e,s-1,s,a,o)}n.autoClear=i}_blur(e,n,i,r,s){const a=this._pingPongRenderTarget;this._halfBlur(e,a,n,i,r,"latitudinal",s),this._halfBlur(a,e,i,i,r,"longitudinal",s)}_halfBlur(e,n,i,r,s,a,o){const c=this._renderer,u=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const f=3,p=new zt(this._lodPlanes[r],u),h=u.uniforms,x=this._sizeLods[i]-1,_=isFinite(s)?Math.PI/(2*x):2*Math.PI/(2*mr-1),S=s/_,m=isFinite(s)?1+Math.floor(f*S):mr;m>mr&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${mr}`);const d=[];let g=0;for(let A=0;A<mr;++A){const N=A/S,F=Math.exp(-N*N/2);d.push(F),A===0?g+=F:A<m&&(g+=2*F)}for(let A=0;A<d.length;A++)d[A]=d[A]/g;h.envMap.value=e.texture,h.samples.value=m,h.weights.value=d,h.latitudinal.value=a==="latitudinal",o&&(h.poleAxis.value=o);const{_lodMax:v}=this;h.dTheta.value=_,h.mipInt.value=v-i;const w=this._sizeLods[r],R=3*w*(r>v-as?r-v+as:0),E=4*(this._cubeSize-w);Do(n,R,E,3*w,2*w),c.setRenderTarget(n),c.render(p,Jc)}}function xb(t){const e=[],n=[],i=[];let r=t;const s=t-as+1+Jp.length;for(let a=0;a<s;a++){const o=Math.pow(2,r);n.push(o);let c=1/o;a>t-as?c=Jp[a-t+as-1]:a===0&&(c=0),i.push(c);const u=1/(o-2),f=-u,p=1+u,h=[f,f,p,f,p,p,f,f,p,p,f,p],x=6,_=6,S=3,m=2,d=1,g=new Float32Array(S*_*x),v=new Float32Array(m*_*x),w=new Float32Array(d*_*x);for(let E=0;E<x;E++){const A=E%3*2/3-1,N=E>2?0:-1,F=[A,N,0,A+2/3,N,0,A+2/3,N+1,0,A,N,0,A+2/3,N+1,0,A,N+1,0];g.set(F,S*_*E),v.set(h,m*_*E);const y=[E,E,E,E,E,E];w.set(y,d*_*E)}const R=new Rn;R.setAttribute("position",new An(g,S)),R.setAttribute("uv",new An(v,m)),R.setAttribute("faceIndex",new An(w,d)),e.push(R),r>as&&r--}return{lodPlanes:e,sizeLods:n,sigmas:i}}function im(t,e,n){const i=new Nr(t,e,n);return i.texture.mapping=Yl,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Do(t,e,n,i,r){t.viewport.set(e,n,i,r),t.scissor.set(e,n,i,r)}function gb(t,e,n){const i=new Float32Array(mr),r=new U(0,1,0);return new Zi({name:"SphericalGaussianBlur",defines:{n:mr,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${t}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:tf(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Xi,depthTest:!1,depthWrite:!1})}function rm(){return new Zi({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:tf(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Xi,depthTest:!1,depthWrite:!1})}function sm(){return new Zi({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:tf(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Xi,depthTest:!1,depthWrite:!1})}function tf(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function vb(t){let e=new WeakMap,n=null;function i(o){if(o&&o.isTexture){const c=o.mapping,u=c===xd||c===gd,f=c===Ns||c===Rs;if(u||f){let p=e.get(o);const h=p!==void 0?p.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==h)return n===null&&(n=new nm(t)),p=u?n.fromEquirectangular(o,p):n.fromCubemap(o,p),p.texture.pmremVersion=o.pmremVersion,e.set(o,p),p.texture;if(p!==void 0)return p.texture;{const x=o.image;return u&&x&&x.height>0||f&&x&&r(x)?(n===null&&(n=new nm(t)),p=u?n.fromEquirectangular(o):n.fromCubemap(o),p.texture.pmremVersion=o.pmremVersion,e.set(o,p),o.addEventListener("dispose",s),p.texture):null}}}return o}function r(o){let c=0;const u=6;for(let f=0;f<u;f++)o[f]!==void 0&&c++;return c===u}function s(o){const c=o.target;c.removeEventListener("dispose",s);const u=e.get(c);u!==void 0&&(e.delete(c),u.dispose())}function a(){e=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:i,dispose:a}}function _b(t){const e={};function n(i){if(e[i]!==void 0)return e[i];let r;switch(i){case"WEBGL_depth_texture":r=t.getExtension("WEBGL_depth_texture")||t.getExtension("MOZ_WEBGL_depth_texture")||t.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":r=t.getExtension("EXT_texture_filter_anisotropic")||t.getExtension("MOZ_EXT_texture_filter_anisotropic")||t.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":r=t.getExtension("WEBGL_compressed_texture_s3tc")||t.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||t.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":r=t.getExtension("WEBGL_compressed_texture_pvrtc")||t.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:r=t.getExtension(i)}return e[i]=r,r}return{has:function(i){return n(i)!==null},init:function(){n("EXT_color_buffer_float"),n("WEBGL_clip_cull_distance"),n("OES_texture_float_linear"),n("EXT_color_buffer_half_float"),n("WEBGL_multisampled_render_to_texture"),n("WEBGL_render_shared_exponent")},get:function(i){const r=n(i);return r===null&&el("THREE.WebGLRenderer: "+i+" extension not supported."),r}}}function yb(t,e,n,i){const r={},s=new WeakMap;function a(p){const h=p.target;h.index!==null&&e.remove(h.index);for(const _ in h.attributes)e.remove(h.attributes[_]);for(const _ in h.morphAttributes){const S=h.morphAttributes[_];for(let m=0,d=S.length;m<d;m++)e.remove(S[m])}h.removeEventListener("dispose",a),delete r[h.id];const x=s.get(h);x&&(e.remove(x),s.delete(h)),i.releaseStatesOfGeometry(h),h.isInstancedBufferGeometry===!0&&delete h._maxInstanceCount,n.memory.geometries--}function o(p,h){return r[h.id]===!0||(h.addEventListener("dispose",a),r[h.id]=!0,n.memory.geometries++),h}function c(p){const h=p.attributes;for(const _ in h)e.update(h[_],t.ARRAY_BUFFER);const x=p.morphAttributes;for(const _ in x){const S=x[_];for(let m=0,d=S.length;m<d;m++)e.update(S[m],t.ARRAY_BUFFER)}}function u(p){const h=[],x=p.index,_=p.attributes.position;let S=0;if(x!==null){const g=x.array;S=x.version;for(let v=0,w=g.length;v<w;v+=3){const R=g[v+0],E=g[v+1],A=g[v+2];h.push(R,E,E,A,A,R)}}else if(_!==void 0){const g=_.array;S=_.version;for(let v=0,w=g.length/3-1;v<w;v+=3){const R=v+0,E=v+1,A=v+2;h.push(R,E,E,A,A,R)}}else return;const m=new(Sg(h)?Tg:Eg)(h,1);m.version=S;const d=s.get(p);d&&e.remove(d),s.set(p,m)}function f(p){const h=s.get(p);if(h){const x=p.index;x!==null&&h.version<x.version&&u(p)}else u(p);return s.get(p)}return{get:o,update:c,getWireframeAttribute:f}}function Sb(t,e,n){let i;function r(h){i=h}let s,a;function o(h){s=h.type,a=h.bytesPerElement}function c(h,x){t.drawElements(i,x,s,h*a),n.update(x,i,1)}function u(h,x,_){_!==0&&(t.drawElementsInstanced(i,x,s,h*a,_),n.update(x,i,_))}function f(h,x,_){if(_===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,x,0,s,h,0,_);let m=0;for(let d=0;d<_;d++)m+=x[d];n.update(m,i,1)}function p(h,x,_,S){if(_===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let d=0;d<h.length;d++)u(h[d]/a,x[d],S[d]);else{m.multiDrawElementsInstancedWEBGL(i,x,0,s,h,0,S,0,_);let d=0;for(let g=0;g<_;g++)d+=x[g];for(let g=0;g<S.length;g++)n.update(d,i,S[g])}}this.setMode=r,this.setIndex=o,this.render=c,this.renderInstances=u,this.renderMultiDraw=f,this.renderMultiDrawInstances=p}function wb(t){const e={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function i(s,a,o){switch(n.calls++,a){case t.TRIANGLES:n.triangles+=o*(s/3);break;case t.LINES:n.lines+=o*(s/2);break;case t.LINE_STRIP:n.lines+=o*(s-1);break;case t.LINE_LOOP:n.lines+=o*s;break;case t.POINTS:n.points+=o*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function r(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:e,render:n,programs:null,autoReset:!0,reset:r,update:i}}function Mb(t,e,n){const i=new WeakMap,r=new st;function s(a,o,c){const u=a.morphTargetInfluences,f=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,p=f!==void 0?f.length:0;let h=i.get(o);if(h===void 0||h.count!==p){let y=function(){N.dispose(),i.delete(o),o.removeEventListener("dispose",y)};var x=y;h!==void 0&&h.texture.dispose();const _=o.morphAttributes.position!==void 0,S=o.morphAttributes.normal!==void 0,m=o.morphAttributes.color!==void 0,d=o.morphAttributes.position||[],g=o.morphAttributes.normal||[],v=o.morphAttributes.color||[];let w=0;_===!0&&(w=1),S===!0&&(w=2),m===!0&&(w=3);let R=o.attributes.position.count*w,E=1;R>e.maxTextureSize&&(E=Math.ceil(R/e.maxTextureSize),R=e.maxTextureSize);const A=new Float32Array(R*E*4*p),N=new Mg(A,R,E,p);N.type=di,N.needsUpdate=!0;const F=w*4;for(let b=0;b<p;b++){const O=d[b],V=g[b],q=v[b],Q=R*E*4*b;for(let W=0;W<O.count;W++){const Y=W*F;_===!0&&(r.fromBufferAttribute(O,W),A[Q+Y+0]=r.x,A[Q+Y+1]=r.y,A[Q+Y+2]=r.z,A[Q+Y+3]=0),S===!0&&(r.fromBufferAttribute(V,W),A[Q+Y+4]=r.x,A[Q+Y+5]=r.y,A[Q+Y+6]=r.z,A[Q+Y+7]=0),m===!0&&(r.fromBufferAttribute(q,W),A[Q+Y+8]=r.x,A[Q+Y+9]=r.y,A[Q+Y+10]=r.z,A[Q+Y+11]=q.itemSize===4?r.w:1)}}h={count:p,texture:N,size:new $e(R,E)},i.set(o,h),o.addEventListener("dispose",y)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)c.getUniforms().setValue(t,"morphTexture",a.morphTexture,n);else{let _=0;for(let m=0;m<u.length;m++)_+=u[m];const S=o.morphTargetsRelative?1:1-_;c.getUniforms().setValue(t,"morphTargetBaseInfluence",S),c.getUniforms().setValue(t,"morphTargetInfluences",u)}c.getUniforms().setValue(t,"morphTargetsTexture",h.texture,n),c.getUniforms().setValue(t,"morphTargetsTextureSize",h.size)}return{update:s}}function bb(t,e,n,i){let r=new WeakMap;function s(c){const u=i.render.frame,f=c.geometry,p=e.get(c,f);if(r.get(p)!==u&&(e.update(p),r.set(p,u)),c.isInstancedMesh&&(c.hasEventListener("dispose",o)===!1&&c.addEventListener("dispose",o),r.get(c)!==u&&(n.update(c.instanceMatrix,t.ARRAY_BUFFER),c.instanceColor!==null&&n.update(c.instanceColor,t.ARRAY_BUFFER),r.set(c,u))),c.isSkinnedMesh){const h=c.skeleton;r.get(h)!==u&&(h.update(),r.set(h,u))}return p}function a(){r=new WeakMap}function o(c){const u=c.target;u.removeEventListener("dispose",o),n.remove(u.instanceMatrix),u.instanceColor!==null&&n.remove(u.instanceColor)}return{update:s,dispose:a}}class Pg extends $t{constructor(e,n,i,r,s,a,o,c,u,f=ms){if(f!==ms&&f!==Ls)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");i===void 0&&f===ms&&(i=Cr),i===void 0&&f===Ls&&(i=Ps),super(null,r,s,a,o,c,f,i,u),this.isDepthTexture=!0,this.image={width:e,height:n},this.magFilter=o!==void 0?o:En,this.minFilter=c!==void 0?c:En,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const n=super.toJSON(e);return this.compareFunction!==null&&(n.compareFunction=this.compareFunction),n}}const Lg=new $t,am=new Pg(1,1),Dg=new Mg,kg=new cS,Ig=new Ng,om=[],lm=[],cm=new Float32Array(16),um=new Float32Array(9),dm=new Float32Array(4);function js(t,e,n){const i=t[0];if(i<=0||i>0)return t;const r=e*n;let s=om[r];if(s===void 0&&(s=new Float32Array(r),om[r]=s),e!==0){i.toArray(s,0);for(let a=1,o=0;a!==e;++a)o+=n,t[a].toArray(s,o)}return s}function Tt(t,e){if(t.length!==e.length)return!1;for(let n=0,i=t.length;n<i;n++)if(t[n]!==e[n])return!1;return!0}function At(t,e){for(let n=0,i=e.length;n<i;n++)t[n]=e[n]}function Ql(t,e){let n=lm[e];n===void 0&&(n=new Int32Array(e),lm[e]=n);for(let i=0;i!==e;++i)n[i]=t.allocateTextureUnit();return n}function Eb(t,e){const n=this.cache;n[0]!==e&&(t.uniform1f(this.addr,e),n[0]=e)}function Tb(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(t.uniform2f(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(Tt(n,e))return;t.uniform2fv(this.addr,e),At(n,e)}}function Ab(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(t.uniform3f(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else if(e.r!==void 0)(n[0]!==e.r||n[1]!==e.g||n[2]!==e.b)&&(t.uniform3f(this.addr,e.r,e.g,e.b),n[0]=e.r,n[1]=e.g,n[2]=e.b);else{if(Tt(n,e))return;t.uniform3fv(this.addr,e),At(n,e)}}function Cb(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(t.uniform4f(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(Tt(n,e))return;t.uniform4fv(this.addr,e),At(n,e)}}function Nb(t,e){const n=this.cache,i=e.elements;if(i===void 0){if(Tt(n,e))return;t.uniformMatrix2fv(this.addr,!1,e),At(n,e)}else{if(Tt(n,i))return;dm.set(i),t.uniformMatrix2fv(this.addr,!1,dm),At(n,i)}}function Rb(t,e){const n=this.cache,i=e.elements;if(i===void 0){if(Tt(n,e))return;t.uniformMatrix3fv(this.addr,!1,e),At(n,e)}else{if(Tt(n,i))return;um.set(i),t.uniformMatrix3fv(this.addr,!1,um),At(n,i)}}function Pb(t,e){const n=this.cache,i=e.elements;if(i===void 0){if(Tt(n,e))return;t.uniformMatrix4fv(this.addr,!1,e),At(n,e)}else{if(Tt(n,i))return;cm.set(i),t.uniformMatrix4fv(this.addr,!1,cm),At(n,i)}}function Lb(t,e){const n=this.cache;n[0]!==e&&(t.uniform1i(this.addr,e),n[0]=e)}function Db(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(t.uniform2i(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(Tt(n,e))return;t.uniform2iv(this.addr,e),At(n,e)}}function kb(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(t.uniform3i(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else{if(Tt(n,e))return;t.uniform3iv(this.addr,e),At(n,e)}}function Ib(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(t.uniform4i(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(Tt(n,e))return;t.uniform4iv(this.addr,e),At(n,e)}}function Ub(t,e){const n=this.cache;n[0]!==e&&(t.uniform1ui(this.addr,e),n[0]=e)}function Fb(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(t.uniform2ui(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(Tt(n,e))return;t.uniform2uiv(this.addr,e),At(n,e)}}function Ob(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(t.uniform3ui(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else{if(Tt(n,e))return;t.uniform3uiv(this.addr,e),At(n,e)}}function zb(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(t.uniform4ui(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(Tt(n,e))return;t.uniform4uiv(this.addr,e),At(n,e)}}function jb(t,e,n){const i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(t.uniform1i(this.addr,r),i[0]=r);let s;this.type===t.SAMPLER_2D_SHADOW?(am.compareFunction=yg,s=am):s=Lg,n.setTexture2D(e||s,r)}function Bb(t,e,n){const i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(t.uniform1i(this.addr,r),i[0]=r),n.setTexture3D(e||kg,r)}function Hb(t,e,n){const i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(t.uniform1i(this.addr,r),i[0]=r),n.setTextureCube(e||Ig,r)}function Vb(t,e,n){const i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(t.uniform1i(this.addr,r),i[0]=r),n.setTexture2DArray(e||Dg,r)}function Gb(t){switch(t){case 5126:return Eb;case 35664:return Tb;case 35665:return Ab;case 35666:return Cb;case 35674:return Nb;case 35675:return Rb;case 35676:return Pb;case 5124:case 35670:return Lb;case 35667:case 35671:return Db;case 35668:case 35672:return kb;case 35669:case 35673:return Ib;case 5125:return Ub;case 36294:return Fb;case 36295:return Ob;case 36296:return zb;case 35678:case 36198:case 36298:case 36306:case 35682:return jb;case 35679:case 36299:case 36307:return Bb;case 35680:case 36300:case 36308:case 36293:return Hb;case 36289:case 36303:case 36311:case 36292:return Vb}}function Wb(t,e){t.uniform1fv(this.addr,e)}function Xb(t,e){const n=js(e,this.size,2);t.uniform2fv(this.addr,n)}function qb(t,e){const n=js(e,this.size,3);t.uniform3fv(this.addr,n)}function $b(t,e){const n=js(e,this.size,4);t.uniform4fv(this.addr,n)}function Yb(t,e){const n=js(e,this.size,4);t.uniformMatrix2fv(this.addr,!1,n)}function Kb(t,e){const n=js(e,this.size,9);t.uniformMatrix3fv(this.addr,!1,n)}function Zb(t,e){const n=js(e,this.size,16);t.uniformMatrix4fv(this.addr,!1,n)}function Qb(t,e){t.uniform1iv(this.addr,e)}function Jb(t,e){t.uniform2iv(this.addr,e)}function eE(t,e){t.uniform3iv(this.addr,e)}function tE(t,e){t.uniform4iv(this.addr,e)}function nE(t,e){t.uniform1uiv(this.addr,e)}function iE(t,e){t.uniform2uiv(this.addr,e)}function rE(t,e){t.uniform3uiv(this.addr,e)}function sE(t,e){t.uniform4uiv(this.addr,e)}function aE(t,e,n){const i=this.cache,r=e.length,s=Ql(n,r);Tt(i,s)||(t.uniform1iv(this.addr,s),At(i,s));for(let a=0;a!==r;++a)n.setTexture2D(e[a]||Lg,s[a])}function oE(t,e,n){const i=this.cache,r=e.length,s=Ql(n,r);Tt(i,s)||(t.uniform1iv(this.addr,s),At(i,s));for(let a=0;a!==r;++a)n.setTexture3D(e[a]||kg,s[a])}function lE(t,e,n){const i=this.cache,r=e.length,s=Ql(n,r);Tt(i,s)||(t.uniform1iv(this.addr,s),At(i,s));for(let a=0;a!==r;++a)n.setTextureCube(e[a]||Ig,s[a])}function cE(t,e,n){const i=this.cache,r=e.length,s=Ql(n,r);Tt(i,s)||(t.uniform1iv(this.addr,s),At(i,s));for(let a=0;a!==r;++a)n.setTexture2DArray(e[a]||Dg,s[a])}function uE(t){switch(t){case 5126:return Wb;case 35664:return Xb;case 35665:return qb;case 35666:return $b;case 35674:return Yb;case 35675:return Kb;case 35676:return Zb;case 5124:case 35670:return Qb;case 35667:case 35671:return Jb;case 35668:case 35672:return eE;case 35669:case 35673:return tE;case 5125:return nE;case 36294:return iE;case 36295:return rE;case 36296:return sE;case 35678:case 36198:case 36298:case 36306:case 35682:return aE;case 35679:case 36299:case 36307:return oE;case 35680:case 36300:case 36308:case 36293:return lE;case 36289:case 36303:case 36311:case 36292:return cE}}class dE{constructor(e,n,i){this.id=e,this.addr=i,this.cache=[],this.type=n.type,this.setValue=Gb(n.type)}}class hE{constructor(e,n,i){this.id=e,this.addr=i,this.cache=[],this.type=n.type,this.size=n.size,this.setValue=uE(n.type)}}class fE{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,n,i){const r=this.seq;for(let s=0,a=r.length;s!==a;++s){const o=r[s];o.setValue(e,n[o.id],i)}}}const ru=/(\w+)(\])?(\[|\.)?/g;function hm(t,e){t.seq.push(e),t.map[e.id]=e}function pE(t,e,n){const i=t.name,r=i.length;for(ru.lastIndex=0;;){const s=ru.exec(i),a=ru.lastIndex;let o=s[1];const c=s[2]==="]",u=s[3];if(c&&(o=o|0),u===void 0||u==="["&&a+2===r){hm(n,u===void 0?new dE(o,t,e):new hE(o,t,e));break}else{let p=n.map[o];p===void 0&&(p=new fE(o),hm(n,p)),n=p}}}class tl{constructor(e,n){this.seq=[],this.map={};const i=e.getProgramParameter(n,e.ACTIVE_UNIFORMS);for(let r=0;r<i;++r){const s=e.getActiveUniform(n,r),a=e.getUniformLocation(n,s.name);pE(s,a,this)}}setValue(e,n,i,r){const s=this.map[n];s!==void 0&&s.setValue(e,i,r)}setOptional(e,n,i){const r=n[i];r!==void 0&&this.setValue(e,i,r)}static upload(e,n,i,r){for(let s=0,a=n.length;s!==a;++s){const o=n[s],c=i[o.id];c.needsUpdate!==!1&&o.setValue(e,c.value,r)}}static seqWithValue(e,n){const i=[];for(let r=0,s=e.length;r!==s;++r){const a=e[r];a.id in n&&i.push(a)}return i}}function fm(t,e,n){const i=t.createShader(e);return t.shaderSource(i,n),t.compileShader(i),i}const mE=37297;let xE=0;function gE(t,e){const n=t.split(`
`),i=[],r=Math.max(e-6,0),s=Math.min(e+6,n.length);for(let a=r;a<s;a++){const o=a+1;i.push(`${o===e?">":" "} ${o}: ${n[a]}`)}return i.join(`
`)}function vE(t){const e=tt.getPrimaries(tt.workingColorSpace),n=tt.getPrimaries(t);let i;switch(e===n?i="":e===Cl&&n===Al?i="LinearDisplayP3ToLinearSRGB":e===Al&&n===Cl&&(i="LinearSRGBToLinearDisplayP3"),t){case tr:case Kl:return[i,"LinearTransferOETF"];case qn:case Zh:return[i,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",t),[i,"LinearTransferOETF"]}}function pm(t,e,n){const i=t.getShaderParameter(e,t.COMPILE_STATUS),r=t.getShaderInfoLog(e).trim();if(i&&r==="")return"";const s=/ERROR: 0:(\d+)/.exec(r);if(s){const a=parseInt(s[1]);return n.toUpperCase()+`

`+r+`

`+gE(t.getShaderSource(e),a)}else return r}function _E(t,e){const n=vE(e);return`vec4 ${t}( vec4 value ) { return ${n[0]}( ${n[1]}( value ) ); }`}function yE(t,e){let n;switch(e){case I1:n="Linear";break;case U1:n="Reinhard";break;case F1:n="Cineon";break;case O1:n="ACESFilmic";break;case j1:n="AgX";break;case B1:n="Neutral";break;case z1:n="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),n="Linear"}return"vec3 "+t+"( vec3 color ) { return "+n+"ToneMapping( color ); }"}const ko=new U;function SE(){tt.getLuminanceCoefficients(ko);const t=ko.x.toFixed(4),e=ko.y.toFixed(4),n=ko.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${t}, ${e}, ${n} );`,"	return dot( weights, rgb );","}"].join(`
`)}function wE(t){return[t.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",t.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(aa).join(`
`)}function ME(t){const e=[];for(const n in t){const i=t[n];i!==!1&&e.push("#define "+n+" "+i)}return e.join(`
`)}function bE(t,e){const n={},i=t.getProgramParameter(e,t.ACTIVE_ATTRIBUTES);for(let r=0;r<i;r++){const s=t.getActiveAttrib(e,r),a=s.name;let o=1;s.type===t.FLOAT_MAT2&&(o=2),s.type===t.FLOAT_MAT3&&(o=3),s.type===t.FLOAT_MAT4&&(o=4),n[a]={type:s.type,location:t.getAttribLocation(e,a),locationSize:o}}return n}function aa(t){return t!==""}function mm(t,e){const n=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return t.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function xm(t,e){return t.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const EE=/^[ \t]*#include +<([\w\d./]+)>/gm;function qd(t){return t.replace(EE,AE)}const TE=new Map;function AE(t,e){let n=ze[e];if(n===void 0){const i=TE.get(e);if(i!==void 0)n=ze[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return qd(n)}const CE=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function gm(t){return t.replace(CE,NE)}function NE(t,e,n,i){let r="";for(let s=parseInt(e);s<parseInt(n);s++)r+=i.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function vm(t){let e=`precision ${t.precision} float;
	precision ${t.precision} int;
	precision ${t.precision} sampler2D;
	precision ${t.precision} samplerCube;
	precision ${t.precision} sampler3D;
	precision ${t.precision} sampler2DArray;
	precision ${t.precision} sampler2DShadow;
	precision ${t.precision} samplerCubeShadow;
	precision ${t.precision} sampler2DArrayShadow;
	precision ${t.precision} isampler2D;
	precision ${t.precision} isampler3D;
	precision ${t.precision} isamplerCube;
	precision ${t.precision} isampler2DArray;
	precision ${t.precision} usampler2D;
	precision ${t.precision} usampler3D;
	precision ${t.precision} usamplerCube;
	precision ${t.precision} usampler2DArray;
	`;return t.precision==="highp"?e+=`
#define HIGH_PRECISION`:t.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:t.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function RE(t){let e="SHADOWMAP_TYPE_BASIC";return t.shadowMapType===ag?e="SHADOWMAP_TYPE_PCF":t.shadowMapType===p1?e="SHADOWMAP_TYPE_PCF_SOFT":t.shadowMapType===si&&(e="SHADOWMAP_TYPE_VSM"),e}function PE(t){let e="ENVMAP_TYPE_CUBE";if(t.envMap)switch(t.envMapMode){case Ns:case Rs:e="ENVMAP_TYPE_CUBE";break;case Yl:e="ENVMAP_TYPE_CUBE_UV";break}return e}function LE(t){let e="ENVMAP_MODE_REFLECTION";if(t.envMap)switch(t.envMapMode){case Rs:e="ENVMAP_MODE_REFRACTION";break}return e}function DE(t){let e="ENVMAP_BLENDING_NONE";if(t.envMap)switch(t.combine){case og:e="ENVMAP_BLENDING_MULTIPLY";break;case D1:e="ENVMAP_BLENDING_MIX";break;case k1:e="ENVMAP_BLENDING_ADD";break}return e}function kE(t){const e=t.envMapCubeUVHeight;if(e===null)return null;const n=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,n),7*16)),texelHeight:i,maxMip:n}}function IE(t,e,n,i){const r=t.getContext(),s=n.defines;let a=n.vertexShader,o=n.fragmentShader;const c=RE(n),u=PE(n),f=LE(n),p=DE(n),h=kE(n),x=wE(n),_=ME(s),S=r.createProgram();let m,d,g=n.glslVersion?"#version "+n.glslVersion+`
`:"";n.isRawShaderMaterial?(m=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,_].filter(aa).join(`
`),m.length>0&&(m+=`
`),d=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,_].filter(aa).join(`
`),d.length>0&&(d+=`
`)):(m=[vm(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,_,n.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",n.batching?"#define USE_BATCHING":"",n.batchingColor?"#define USE_BATCHING_COLOR":"",n.instancing?"#define USE_INSTANCING":"",n.instancingColor?"#define USE_INSTANCING_COLOR":"",n.instancingMorph?"#define USE_INSTANCING_MORPH":"",n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.map?"#define USE_MAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+f:"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.displacementMap?"#define USE_DISPLACEMENTMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.mapUv?"#define MAP_UV "+n.mapUv:"",n.alphaMapUv?"#define ALPHAMAP_UV "+n.alphaMapUv:"",n.lightMapUv?"#define LIGHTMAP_UV "+n.lightMapUv:"",n.aoMapUv?"#define AOMAP_UV "+n.aoMapUv:"",n.emissiveMapUv?"#define EMISSIVEMAP_UV "+n.emissiveMapUv:"",n.bumpMapUv?"#define BUMPMAP_UV "+n.bumpMapUv:"",n.normalMapUv?"#define NORMALMAP_UV "+n.normalMapUv:"",n.displacementMapUv?"#define DISPLACEMENTMAP_UV "+n.displacementMapUv:"",n.metalnessMapUv?"#define METALNESSMAP_UV "+n.metalnessMapUv:"",n.roughnessMapUv?"#define ROUGHNESSMAP_UV "+n.roughnessMapUv:"",n.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+n.anisotropyMapUv:"",n.clearcoatMapUv?"#define CLEARCOATMAP_UV "+n.clearcoatMapUv:"",n.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+n.clearcoatNormalMapUv:"",n.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+n.clearcoatRoughnessMapUv:"",n.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+n.iridescenceMapUv:"",n.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+n.iridescenceThicknessMapUv:"",n.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+n.sheenColorMapUv:"",n.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+n.sheenRoughnessMapUv:"",n.specularMapUv?"#define SPECULARMAP_UV "+n.specularMapUv:"",n.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+n.specularColorMapUv:"",n.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+n.specularIntensityMapUv:"",n.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+n.transmissionMapUv:"",n.thicknessMapUv?"#define THICKNESSMAP_UV "+n.thicknessMapUv:"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.flatShading?"#define FLAT_SHADED":"",n.skinning?"#define USE_SKINNING":"",n.morphTargets?"#define USE_MORPHTARGETS":"",n.morphNormals&&n.flatShading===!1?"#define USE_MORPHNORMALS":"",n.morphColors?"#define USE_MORPHCOLORS":"",n.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+n.morphTextureStride:"",n.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+n.morphTargetsCount:"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+c:"",n.sizeAttenuation?"#define USE_SIZEATTENUATION":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",n.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(aa).join(`
`),d=[vm(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,_,n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",n.map?"#define USE_MAP":"",n.matcap?"#define USE_MATCAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+u:"",n.envMap?"#define "+f:"",n.envMap?"#define "+p:"",h?"#define CUBEUV_TEXEL_WIDTH "+h.texelWidth:"",h?"#define CUBEUV_TEXEL_HEIGHT "+h.texelHeight:"",h?"#define CUBEUV_MAX_MIP "+h.maxMip+".0":"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoat?"#define USE_CLEARCOAT":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.dispersion?"#define USE_DISPERSION":"",n.iridescence?"#define USE_IRIDESCENCE":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaTest?"#define USE_ALPHATEST":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.sheen?"#define USE_SHEEN":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors||n.instancingColor||n.batchingColor?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.gradientMap?"#define USE_GRADIENTMAP":"",n.flatShading?"#define FLAT_SHADED":"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+c:"",n.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",n.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",n.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",n.toneMapping!==qi?"#define TONE_MAPPING":"",n.toneMapping!==qi?ze.tonemapping_pars_fragment:"",n.toneMapping!==qi?yE("toneMapping",n.toneMapping):"",n.dithering?"#define DITHERING":"",n.opaque?"#define OPAQUE":"",ze.colorspace_pars_fragment,_E("linearToOutputTexel",n.outputColorSpace),SE(),n.useDepthPacking?"#define DEPTH_PACKING "+n.depthPacking:"",`
`].filter(aa).join(`
`)),a=qd(a),a=mm(a,n),a=xm(a,n),o=qd(o),o=mm(o,n),o=xm(o,n),a=gm(a),o=gm(o),n.isRawShaderMaterial!==!0&&(g=`#version 300 es
`,m=[x,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,d=["#define varying in",n.glslVersion===Ip?"":"layout(location = 0) out highp vec4 pc_fragColor;",n.glslVersion===Ip?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d);const v=g+m+a,w=g+d+o,R=fm(r,r.VERTEX_SHADER,v),E=fm(r,r.FRAGMENT_SHADER,w);r.attachShader(S,R),r.attachShader(S,E),n.index0AttributeName!==void 0?r.bindAttribLocation(S,0,n.index0AttributeName):n.morphTargets===!0&&r.bindAttribLocation(S,0,"position"),r.linkProgram(S);function A(b){if(t.debug.checkShaderErrors){const O=r.getProgramInfoLog(S).trim(),V=r.getShaderInfoLog(R).trim(),q=r.getShaderInfoLog(E).trim();let Q=!0,W=!0;if(r.getProgramParameter(S,r.LINK_STATUS)===!1)if(Q=!1,typeof t.debug.onShaderError=="function")t.debug.onShaderError(r,S,R,E);else{const Y=pm(r,R,"vertex"),D=pm(r,E,"fragment");console.error("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(S,r.VALIDATE_STATUS)+`

Material Name: `+b.name+`
Material Type: `+b.type+`

Program Info Log: `+O+`
`+Y+`
`+D)}else O!==""?console.warn("THREE.WebGLProgram: Program Info Log:",O):(V===""||q==="")&&(W=!1);W&&(b.diagnostics={runnable:Q,programLog:O,vertexShader:{log:V,prefix:m},fragmentShader:{log:q,prefix:d}})}r.deleteShader(R),r.deleteShader(E),N=new tl(r,S),F=bE(r,S)}let N;this.getUniforms=function(){return N===void 0&&A(this),N};let F;this.getAttributes=function(){return F===void 0&&A(this),F};let y=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return y===!1&&(y=r.getProgramParameter(S,mE)),y},this.destroy=function(){i.releaseStatesOfProgram(this),r.deleteProgram(S),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=xE++,this.cacheKey=e,this.usedTimes=1,this.program=S,this.vertexShader=R,this.fragmentShader=E,this}let UE=0;class FE{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const n=e.vertexShader,i=e.fragmentShader,r=this._getShaderStage(n),s=this._getShaderStage(i),a=this._getShaderCacheForMaterial(e);return a.has(r)===!1&&(a.add(r),r.usedTimes++),a.has(s)===!1&&(a.add(s),s.usedTimes++),this}remove(e){const n=this.materialCache.get(e);for(const i of n)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const n=this.materialCache;let i=n.get(e);return i===void 0&&(i=new Set,n.set(e,i)),i}_getShaderStage(e){const n=this.shaderCache;let i=n.get(e);return i===void 0&&(i=new OE(e),n.set(e,i)),i}}class OE{constructor(e){this.id=UE++,this.code=e,this.usedTimes=0}}function zE(t,e,n,i,r,s,a){const o=new Jh,c=new FE,u=new Set,f=[],p=r.logarithmicDepthBuffer,h=r.reverseDepthBuffer,x=r.vertexTextures;let _=r.precision;const S={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function m(y){return u.add(y),y===0?"uv":`uv${y}`}function d(y,b,O,V,q){const Q=V.fog,W=q.geometry,Y=y.isMeshStandardMaterial?V.environment:null,D=(y.isMeshStandardMaterial?n:e).get(y.envMap||Y),J=D&&D.mapping===Yl?D.image.height:null,ee=S[y.type];y.precision!==null&&(_=r.getMaxPrecision(y.precision),_!==y.precision&&console.warn("THREE.WebGLProgram.getParameters:",y.precision,"not supported, using",_,"instead."));const z=W.morphAttributes.position||W.morphAttributes.normal||W.morphAttributes.color,le=z!==void 0?z.length:0;let Ae=0;W.morphAttributes.position!==void 0&&(Ae=1),W.morphAttributes.normal!==void 0&&(Ae=2),W.morphAttributes.color!==void 0&&(Ae=3);let G,re,ue,me;if(ee){const Jt=$n[ee];G=Jt.vertexShader,re=Jt.fragmentShader}else G=y.vertexShader,re=y.fragmentShader,c.update(y),ue=c.getVertexShaderID(y),me=c.getFragmentShaderID(y);const Le=t.getRenderTarget(),De=q.isInstancedMesh===!0,We=q.isBatchedMesh===!0,Qe=!!y.map,Be=!!y.matcap,P=!!D,Vt=!!y.aoMap,He=!!y.lightMap,Ve=!!y.bumpMap,ke=!!y.normalMap,rt=!!y.displacementMap,Pe=!!y.emissiveMap,C=!!y.metalnessMap,M=!!y.roughnessMap,j=y.anisotropy>0,Z=y.clearcoat>0,ie=y.dispersion>0,$=y.iridescence>0,Me=y.sheen>0,he=y.transmission>0,ve=j&&!!y.anisotropyMap,Xe=Z&&!!y.clearcoatMap,oe=Z&&!!y.clearcoatNormalMap,ye=Z&&!!y.clearcoatRoughnessMap,Ie=$&&!!y.iridescenceMap,te=$&&!!y.iridescenceThicknessMap,se=Me&&!!y.sheenColorMap,Re=Me&&!!y.sheenRoughnessMap,Ne=!!y.specularMap,Oe=!!y.specularColorMap,L=!!y.specularIntensityMap,fe=he&&!!y.transmissionMap,X=he&&!!y.thicknessMap,K=!!y.gradientMap,xe=!!y.alphaMap,de=y.alphaTest>0,qe=!!y.alphaHash,ft=!!y.extensions;let Qt=qi;y.toneMapped&&(Le===null||Le.isXRRenderTarget===!0)&&(Qt=t.toneMapping);const Ze={shaderID:ee,shaderType:y.type,shaderName:y.name,vertexShader:G,fragmentShader:re,defines:y.defines,customVertexShaderID:ue,customFragmentShaderID:me,isRawShaderMaterial:y.isRawShaderMaterial===!0,glslVersion:y.glslVersion,precision:_,batching:We,batchingColor:We&&q._colorsTexture!==null,instancing:De,instancingColor:De&&q.instanceColor!==null,instancingMorph:De&&q.morphTexture!==null,supportsVertexTextures:x,outputColorSpace:Le===null?t.outputColorSpace:Le.isXRRenderTarget===!0?Le.texture.colorSpace:tr,alphaToCoverage:!!y.alphaToCoverage,map:Qe,matcap:Be,envMap:P,envMapMode:P&&D.mapping,envMapCubeUVHeight:J,aoMap:Vt,lightMap:He,bumpMap:Ve,normalMap:ke,displacementMap:x&&rt,emissiveMap:Pe,normalMapObjectSpace:ke&&y.normalMapType===W1,normalMapTangentSpace:ke&&y.normalMapType===_g,metalnessMap:C,roughnessMap:M,anisotropy:j,anisotropyMap:ve,clearcoat:Z,clearcoatMap:Xe,clearcoatNormalMap:oe,clearcoatRoughnessMap:ye,dispersion:ie,iridescence:$,iridescenceMap:Ie,iridescenceThicknessMap:te,sheen:Me,sheenColorMap:se,sheenRoughnessMap:Re,specularMap:Ne,specularColorMap:Oe,specularIntensityMap:L,transmission:he,transmissionMap:fe,thicknessMap:X,gradientMap:K,opaque:y.transparent===!1&&y.blending===ps&&y.alphaToCoverage===!1,alphaMap:xe,alphaTest:de,alphaHash:qe,combine:y.combine,mapUv:Qe&&m(y.map.channel),aoMapUv:Vt&&m(y.aoMap.channel),lightMapUv:He&&m(y.lightMap.channel),bumpMapUv:Ve&&m(y.bumpMap.channel),normalMapUv:ke&&m(y.normalMap.channel),displacementMapUv:rt&&m(y.displacementMap.channel),emissiveMapUv:Pe&&m(y.emissiveMap.channel),metalnessMapUv:C&&m(y.metalnessMap.channel),roughnessMapUv:M&&m(y.roughnessMap.channel),anisotropyMapUv:ve&&m(y.anisotropyMap.channel),clearcoatMapUv:Xe&&m(y.clearcoatMap.channel),clearcoatNormalMapUv:oe&&m(y.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ye&&m(y.clearcoatRoughnessMap.channel),iridescenceMapUv:Ie&&m(y.iridescenceMap.channel),iridescenceThicknessMapUv:te&&m(y.iridescenceThicknessMap.channel),sheenColorMapUv:se&&m(y.sheenColorMap.channel),sheenRoughnessMapUv:Re&&m(y.sheenRoughnessMap.channel),specularMapUv:Ne&&m(y.specularMap.channel),specularColorMapUv:Oe&&m(y.specularColorMap.channel),specularIntensityMapUv:L&&m(y.specularIntensityMap.channel),transmissionMapUv:fe&&m(y.transmissionMap.channel),thicknessMapUv:X&&m(y.thicknessMap.channel),alphaMapUv:xe&&m(y.alphaMap.channel),vertexTangents:!!W.attributes.tangent&&(ke||j),vertexColors:y.vertexColors,vertexAlphas:y.vertexColors===!0&&!!W.attributes.color&&W.attributes.color.itemSize===4,pointsUvs:q.isPoints===!0&&!!W.attributes.uv&&(Qe||xe),fog:!!Q,useFog:y.fog===!0,fogExp2:!!Q&&Q.isFogExp2,flatShading:y.flatShading===!0,sizeAttenuation:y.sizeAttenuation===!0,logarithmicDepthBuffer:p,reverseDepthBuffer:h,skinning:q.isSkinnedMesh===!0,morphTargets:W.morphAttributes.position!==void 0,morphNormals:W.morphAttributes.normal!==void 0,morphColors:W.morphAttributes.color!==void 0,morphTargetsCount:le,morphTextureStride:Ae,numDirLights:b.directional.length,numPointLights:b.point.length,numSpotLights:b.spot.length,numSpotLightMaps:b.spotLightMap.length,numRectAreaLights:b.rectArea.length,numHemiLights:b.hemi.length,numDirLightShadows:b.directionalShadowMap.length,numPointLightShadows:b.pointShadowMap.length,numSpotLightShadows:b.spotShadowMap.length,numSpotLightShadowsWithMaps:b.numSpotLightShadowsWithMaps,numLightProbes:b.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:y.dithering,shadowMapEnabled:t.shadowMap.enabled&&O.length>0,shadowMapType:t.shadowMap.type,toneMapping:Qt,decodeVideoTexture:Qe&&y.map.isVideoTexture===!0&&tt.getTransfer(y.map.colorSpace)===ct,premultipliedAlpha:y.premultipliedAlpha,doubleSided:y.side===zn,flipSided:y.side===qt,useDepthPacking:y.depthPacking>=0,depthPacking:y.depthPacking||0,index0AttributeName:y.index0AttributeName,extensionClipCullDistance:ft&&y.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ft&&y.extensions.multiDraw===!0||We)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:y.customProgramCacheKey()};return Ze.vertexUv1s=u.has(1),Ze.vertexUv2s=u.has(2),Ze.vertexUv3s=u.has(3),u.clear(),Ze}function g(y){const b=[];if(y.shaderID?b.push(y.shaderID):(b.push(y.customVertexShaderID),b.push(y.customFragmentShaderID)),y.defines!==void 0)for(const O in y.defines)b.push(O),b.push(y.defines[O]);return y.isRawShaderMaterial===!1&&(v(b,y),w(b,y),b.push(t.outputColorSpace)),b.push(y.customProgramCacheKey),b.join()}function v(y,b){y.push(b.precision),y.push(b.outputColorSpace),y.push(b.envMapMode),y.push(b.envMapCubeUVHeight),y.push(b.mapUv),y.push(b.alphaMapUv),y.push(b.lightMapUv),y.push(b.aoMapUv),y.push(b.bumpMapUv),y.push(b.normalMapUv),y.push(b.displacementMapUv),y.push(b.emissiveMapUv),y.push(b.metalnessMapUv),y.push(b.roughnessMapUv),y.push(b.anisotropyMapUv),y.push(b.clearcoatMapUv),y.push(b.clearcoatNormalMapUv),y.push(b.clearcoatRoughnessMapUv),y.push(b.iridescenceMapUv),y.push(b.iridescenceThicknessMapUv),y.push(b.sheenColorMapUv),y.push(b.sheenRoughnessMapUv),y.push(b.specularMapUv),y.push(b.specularColorMapUv),y.push(b.specularIntensityMapUv),y.push(b.transmissionMapUv),y.push(b.thicknessMapUv),y.push(b.combine),y.push(b.fogExp2),y.push(b.sizeAttenuation),y.push(b.morphTargetsCount),y.push(b.morphAttributeCount),y.push(b.numDirLights),y.push(b.numPointLights),y.push(b.numSpotLights),y.push(b.numSpotLightMaps),y.push(b.numHemiLights),y.push(b.numRectAreaLights),y.push(b.numDirLightShadows),y.push(b.numPointLightShadows),y.push(b.numSpotLightShadows),y.push(b.numSpotLightShadowsWithMaps),y.push(b.numLightProbes),y.push(b.shadowMapType),y.push(b.toneMapping),y.push(b.numClippingPlanes),y.push(b.numClipIntersection),y.push(b.depthPacking)}function w(y,b){o.disableAll(),b.supportsVertexTextures&&o.enable(0),b.instancing&&o.enable(1),b.instancingColor&&o.enable(2),b.instancingMorph&&o.enable(3),b.matcap&&o.enable(4),b.envMap&&o.enable(5),b.normalMapObjectSpace&&o.enable(6),b.normalMapTangentSpace&&o.enable(7),b.clearcoat&&o.enable(8),b.iridescence&&o.enable(9),b.alphaTest&&o.enable(10),b.vertexColors&&o.enable(11),b.vertexAlphas&&o.enable(12),b.vertexUv1s&&o.enable(13),b.vertexUv2s&&o.enable(14),b.vertexUv3s&&o.enable(15),b.vertexTangents&&o.enable(16),b.anisotropy&&o.enable(17),b.alphaHash&&o.enable(18),b.batching&&o.enable(19),b.dispersion&&o.enable(20),b.batchingColor&&o.enable(21),y.push(o.mask),o.disableAll(),b.fog&&o.enable(0),b.useFog&&o.enable(1),b.flatShading&&o.enable(2),b.logarithmicDepthBuffer&&o.enable(3),b.reverseDepthBuffer&&o.enable(4),b.skinning&&o.enable(5),b.morphTargets&&o.enable(6),b.morphNormals&&o.enable(7),b.morphColors&&o.enable(8),b.premultipliedAlpha&&o.enable(9),b.shadowMapEnabled&&o.enable(10),b.doubleSided&&o.enable(11),b.flipSided&&o.enable(12),b.useDepthPacking&&o.enable(13),b.dithering&&o.enable(14),b.transmission&&o.enable(15),b.sheen&&o.enable(16),b.opaque&&o.enable(17),b.pointsUvs&&o.enable(18),b.decodeVideoTexture&&o.enable(19),b.alphaToCoverage&&o.enable(20),y.push(o.mask)}function R(y){const b=S[y.type];let O;if(b){const V=$n[b];O=SS.clone(V.uniforms)}else O=y.uniforms;return O}function E(y,b){let O;for(let V=0,q=f.length;V<q;V++){const Q=f[V];if(Q.cacheKey===b){O=Q,++O.usedTimes;break}}return O===void 0&&(O=new IE(t,b,y,s),f.push(O)),O}function A(y){if(--y.usedTimes===0){const b=f.indexOf(y);f[b]=f[f.length-1],f.pop(),y.destroy()}}function N(y){c.remove(y)}function F(){c.dispose()}return{getParameters:d,getProgramCacheKey:g,getUniforms:R,acquireProgram:E,releaseProgram:A,releaseShaderCache:N,programs:f,dispose:F}}function jE(){let t=new WeakMap;function e(a){return t.has(a)}function n(a){let o=t.get(a);return o===void 0&&(o={},t.set(a,o)),o}function i(a){t.delete(a)}function r(a,o,c){t.get(a)[o]=c}function s(){t=new WeakMap}return{has:e,get:n,remove:i,update:r,dispose:s}}function BE(t,e){return t.groupOrder!==e.groupOrder?t.groupOrder-e.groupOrder:t.renderOrder!==e.renderOrder?t.renderOrder-e.renderOrder:t.material.id!==e.material.id?t.material.id-e.material.id:t.z!==e.z?t.z-e.z:t.id-e.id}function _m(t,e){return t.groupOrder!==e.groupOrder?t.groupOrder-e.groupOrder:t.renderOrder!==e.renderOrder?t.renderOrder-e.renderOrder:t.z!==e.z?e.z-t.z:t.id-e.id}function ym(){const t=[];let e=0;const n=[],i=[],r=[];function s(){e=0,n.length=0,i.length=0,r.length=0}function a(p,h,x,_,S,m){let d=t[e];return d===void 0?(d={id:p.id,object:p,geometry:h,material:x,groupOrder:_,renderOrder:p.renderOrder,z:S,group:m},t[e]=d):(d.id=p.id,d.object=p,d.geometry=h,d.material=x,d.groupOrder=_,d.renderOrder=p.renderOrder,d.z=S,d.group=m),e++,d}function o(p,h,x,_,S,m){const d=a(p,h,x,_,S,m);x.transmission>0?i.push(d):x.transparent===!0?r.push(d):n.push(d)}function c(p,h,x,_,S,m){const d=a(p,h,x,_,S,m);x.transmission>0?i.unshift(d):x.transparent===!0?r.unshift(d):n.unshift(d)}function u(p,h){n.length>1&&n.sort(p||BE),i.length>1&&i.sort(h||_m),r.length>1&&r.sort(h||_m)}function f(){for(let p=e,h=t.length;p<h;p++){const x=t[p];if(x.id===null)break;x.id=null,x.object=null,x.geometry=null,x.material=null,x.group=null}}return{opaque:n,transmissive:i,transparent:r,init:s,push:o,unshift:c,finish:f,sort:u}}function HE(){let t=new WeakMap;function e(i,r){const s=t.get(i);let a;return s===void 0?(a=new ym,t.set(i,[a])):r>=s.length?(a=new ym,s.push(a)):a=s[r],a}function n(){t=new WeakMap}return{get:e,dispose:n}}function VE(){const t={};return{get:function(e){if(t[e.id]!==void 0)return t[e.id];let n;switch(e.type){case"DirectionalLight":n={direction:new U,color:new Ye};break;case"SpotLight":n={position:new U,direction:new U,color:new Ye,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":n={position:new U,color:new Ye,distance:0,decay:0};break;case"HemisphereLight":n={direction:new U,skyColor:new Ye,groundColor:new Ye};break;case"RectAreaLight":n={color:new Ye,position:new U,halfWidth:new U,halfHeight:new U};break}return t[e.id]=n,n}}}function GE(){const t={};return{get:function(e){if(t[e.id]!==void 0)return t[e.id];let n;switch(e.type){case"DirectionalLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new $e};break;case"SpotLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new $e};break;case"PointLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new $e,shadowCameraNear:1,shadowCameraFar:1e3};break}return t[e.id]=n,n}}}let WE=0;function XE(t,e){return(e.castShadow?2:0)-(t.castShadow?2:0)+(e.map?1:0)-(t.map?1:0)}function qE(t){const e=new VE,n=GE(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let u=0;u<9;u++)i.probe.push(new U);const r=new U,s=new dt,a=new dt;function o(u){let f=0,p=0,h=0;for(let F=0;F<9;F++)i.probe[F].set(0,0,0);let x=0,_=0,S=0,m=0,d=0,g=0,v=0,w=0,R=0,E=0,A=0;u.sort(XE);for(let F=0,y=u.length;F<y;F++){const b=u[F],O=b.color,V=b.intensity,q=b.distance,Q=b.shadow&&b.shadow.map?b.shadow.map.texture:null;if(b.isAmbientLight)f+=O.r*V,p+=O.g*V,h+=O.b*V;else if(b.isLightProbe){for(let W=0;W<9;W++)i.probe[W].addScaledVector(b.sh.coefficients[W],V);A++}else if(b.isDirectionalLight){const W=e.get(b);if(W.color.copy(b.color).multiplyScalar(b.intensity),b.castShadow){const Y=b.shadow,D=n.get(b);D.shadowIntensity=Y.intensity,D.shadowBias=Y.bias,D.shadowNormalBias=Y.normalBias,D.shadowRadius=Y.radius,D.shadowMapSize=Y.mapSize,i.directionalShadow[x]=D,i.directionalShadowMap[x]=Q,i.directionalShadowMatrix[x]=b.shadow.matrix,g++}i.directional[x]=W,x++}else if(b.isSpotLight){const W=e.get(b);W.position.setFromMatrixPosition(b.matrixWorld),W.color.copy(O).multiplyScalar(V),W.distance=q,W.coneCos=Math.cos(b.angle),W.penumbraCos=Math.cos(b.angle*(1-b.penumbra)),W.decay=b.decay,i.spot[S]=W;const Y=b.shadow;if(b.map&&(i.spotLightMap[R]=b.map,R++,Y.updateMatrices(b),b.castShadow&&E++),i.spotLightMatrix[S]=Y.matrix,b.castShadow){const D=n.get(b);D.shadowIntensity=Y.intensity,D.shadowBias=Y.bias,D.shadowNormalBias=Y.normalBias,D.shadowRadius=Y.radius,D.shadowMapSize=Y.mapSize,i.spotShadow[S]=D,i.spotShadowMap[S]=Q,w++}S++}else if(b.isRectAreaLight){const W=e.get(b);W.color.copy(O).multiplyScalar(V),W.halfWidth.set(b.width*.5,0,0),W.halfHeight.set(0,b.height*.5,0),i.rectArea[m]=W,m++}else if(b.isPointLight){const W=e.get(b);if(W.color.copy(b.color).multiplyScalar(b.intensity),W.distance=b.distance,W.decay=b.decay,b.castShadow){const Y=b.shadow,D=n.get(b);D.shadowIntensity=Y.intensity,D.shadowBias=Y.bias,D.shadowNormalBias=Y.normalBias,D.shadowRadius=Y.radius,D.shadowMapSize=Y.mapSize,D.shadowCameraNear=Y.camera.near,D.shadowCameraFar=Y.camera.far,i.pointShadow[_]=D,i.pointShadowMap[_]=Q,i.pointShadowMatrix[_]=b.shadow.matrix,v++}i.point[_]=W,_++}else if(b.isHemisphereLight){const W=e.get(b);W.skyColor.copy(b.color).multiplyScalar(V),W.groundColor.copy(b.groundColor).multiplyScalar(V),i.hemi[d]=W,d++}}m>0&&(t.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=pe.LTC_FLOAT_1,i.rectAreaLTC2=pe.LTC_FLOAT_2):(i.rectAreaLTC1=pe.LTC_HALF_1,i.rectAreaLTC2=pe.LTC_HALF_2)),i.ambient[0]=f,i.ambient[1]=p,i.ambient[2]=h;const N=i.hash;(N.directionalLength!==x||N.pointLength!==_||N.spotLength!==S||N.rectAreaLength!==m||N.hemiLength!==d||N.numDirectionalShadows!==g||N.numPointShadows!==v||N.numSpotShadows!==w||N.numSpotMaps!==R||N.numLightProbes!==A)&&(i.directional.length=x,i.spot.length=S,i.rectArea.length=m,i.point.length=_,i.hemi.length=d,i.directionalShadow.length=g,i.directionalShadowMap.length=g,i.pointShadow.length=v,i.pointShadowMap.length=v,i.spotShadow.length=w,i.spotShadowMap.length=w,i.directionalShadowMatrix.length=g,i.pointShadowMatrix.length=v,i.spotLightMatrix.length=w+R-E,i.spotLightMap.length=R,i.numSpotLightShadowsWithMaps=E,i.numLightProbes=A,N.directionalLength=x,N.pointLength=_,N.spotLength=S,N.rectAreaLength=m,N.hemiLength=d,N.numDirectionalShadows=g,N.numPointShadows=v,N.numSpotShadows=w,N.numSpotMaps=R,N.numLightProbes=A,i.version=WE++)}function c(u,f){let p=0,h=0,x=0,_=0,S=0;const m=f.matrixWorldInverse;for(let d=0,g=u.length;d<g;d++){const v=u[d];if(v.isDirectionalLight){const w=i.directional[p];w.direction.setFromMatrixPosition(v.matrixWorld),r.setFromMatrixPosition(v.target.matrixWorld),w.direction.sub(r),w.direction.transformDirection(m),p++}else if(v.isSpotLight){const w=i.spot[x];w.position.setFromMatrixPosition(v.matrixWorld),w.position.applyMatrix4(m),w.direction.setFromMatrixPosition(v.matrixWorld),r.setFromMatrixPosition(v.target.matrixWorld),w.direction.sub(r),w.direction.transformDirection(m),x++}else if(v.isRectAreaLight){const w=i.rectArea[_];w.position.setFromMatrixPosition(v.matrixWorld),w.position.applyMatrix4(m),a.identity(),s.copy(v.matrixWorld),s.premultiply(m),a.extractRotation(s),w.halfWidth.set(v.width*.5,0,0),w.halfHeight.set(0,v.height*.5,0),w.halfWidth.applyMatrix4(a),w.halfHeight.applyMatrix4(a),_++}else if(v.isPointLight){const w=i.point[h];w.position.setFromMatrixPosition(v.matrixWorld),w.position.applyMatrix4(m),h++}else if(v.isHemisphereLight){const w=i.hemi[S];w.direction.setFromMatrixPosition(v.matrixWorld),w.direction.transformDirection(m),S++}}}return{setup:o,setupView:c,state:i}}function Sm(t){const e=new qE(t),n=[],i=[];function r(f){u.camera=f,n.length=0,i.length=0}function s(f){n.push(f)}function a(f){i.push(f)}function o(){e.setup(n)}function c(f){e.setupView(n,f)}const u={lightsArray:n,shadowsArray:i,camera:null,lights:e,transmissionRenderTarget:{}};return{init:r,state:u,setupLights:o,setupLightsView:c,pushLight:s,pushShadow:a}}function $E(t){let e=new WeakMap;function n(r,s=0){const a=e.get(r);let o;return a===void 0?(o=new Sm(t),e.set(r,[o])):s>=a.length?(o=new Sm(t),a.push(o)):o=a[s],o}function i(){e=new WeakMap}return{get:n,dispose:i}}class YE extends zs{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=V1,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class KE extends zs{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const ZE=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,QE=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function JE(t,e,n){let i=new ef;const r=new $e,s=new $e,a=new st,o=new YE({depthPacking:G1}),c=new KE,u={},f=n.maxTextureSize,p={[Ki]:qt,[qt]:Ki,[zn]:zn},h=new Zi({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new $e},radius:{value:4}},vertexShader:ZE,fragmentShader:QE}),x=h.clone();x.defines.HORIZONTAL_PASS=1;const _=new Rn;_.setAttribute("position",new An(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const S=new zt(_,h),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=ag;let d=this.type;this.render=function(E,A,N){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||E.length===0)return;const F=t.getRenderTarget(),y=t.getActiveCubeFace(),b=t.getActiveMipmapLevel(),O=t.state;O.setBlending(Xi),O.buffers.color.setClear(1,1,1,1),O.buffers.depth.setTest(!0),O.setScissorTest(!1);const V=d!==si&&this.type===si,q=d===si&&this.type!==si;for(let Q=0,W=E.length;Q<W;Q++){const Y=E[Q],D=Y.shadow;if(D===void 0){console.warn("THREE.WebGLShadowMap:",Y,"has no shadow.");continue}if(D.autoUpdate===!1&&D.needsUpdate===!1)continue;r.copy(D.mapSize);const J=D.getFrameExtents();if(r.multiply(J),s.copy(D.mapSize),(r.x>f||r.y>f)&&(r.x>f&&(s.x=Math.floor(f/J.x),r.x=s.x*J.x,D.mapSize.x=s.x),r.y>f&&(s.y=Math.floor(f/J.y),r.y=s.y*J.y,D.mapSize.y=s.y)),D.map===null||V===!0||q===!0){const z=this.type!==si?{minFilter:En,magFilter:En}:{};D.map!==null&&D.map.dispose(),D.map=new Nr(r.x,r.y,z),D.map.texture.name=Y.name+".shadowMap",D.camera.updateProjectionMatrix()}t.setRenderTarget(D.map),t.clear();const ee=D.getViewportCount();for(let z=0;z<ee;z++){const le=D.getViewport(z);a.set(s.x*le.x,s.y*le.y,s.x*le.z,s.y*le.w),O.viewport(a),D.updateMatrices(Y,z),i=D.getFrustum(),w(A,N,D.camera,Y,this.type)}D.isPointLightShadow!==!0&&this.type===si&&g(D,N),D.needsUpdate=!1}d=this.type,m.needsUpdate=!1,t.setRenderTarget(F,y,b)};function g(E,A){const N=e.update(S);h.defines.VSM_SAMPLES!==E.blurSamples&&(h.defines.VSM_SAMPLES=E.blurSamples,x.defines.VSM_SAMPLES=E.blurSamples,h.needsUpdate=!0,x.needsUpdate=!0),E.mapPass===null&&(E.mapPass=new Nr(r.x,r.y)),h.uniforms.shadow_pass.value=E.map.texture,h.uniforms.resolution.value=E.mapSize,h.uniforms.radius.value=E.radius,t.setRenderTarget(E.mapPass),t.clear(),t.renderBufferDirect(A,null,N,h,S,null),x.uniforms.shadow_pass.value=E.mapPass.texture,x.uniforms.resolution.value=E.mapSize,x.uniforms.radius.value=E.radius,t.setRenderTarget(E.map),t.clear(),t.renderBufferDirect(A,null,N,x,S,null)}function v(E,A,N,F){let y=null;const b=N.isPointLight===!0?E.customDistanceMaterial:E.customDepthMaterial;if(b!==void 0)y=b;else if(y=N.isPointLight===!0?c:o,t.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0){const O=y.uuid,V=A.uuid;let q=u[O];q===void 0&&(q={},u[O]=q);let Q=q[V];Q===void 0&&(Q=y.clone(),q[V]=Q,A.addEventListener("dispose",R)),y=Q}if(y.visible=A.visible,y.wireframe=A.wireframe,F===si?y.side=A.shadowSide!==null?A.shadowSide:A.side:y.side=A.shadowSide!==null?A.shadowSide:p[A.side],y.alphaMap=A.alphaMap,y.alphaTest=A.alphaTest,y.map=A.map,y.clipShadows=A.clipShadows,y.clippingPlanes=A.clippingPlanes,y.clipIntersection=A.clipIntersection,y.displacementMap=A.displacementMap,y.displacementScale=A.displacementScale,y.displacementBias=A.displacementBias,y.wireframeLinewidth=A.wireframeLinewidth,y.linewidth=A.linewidth,N.isPointLight===!0&&y.isMeshDistanceMaterial===!0){const O=t.properties.get(y);O.light=N}return y}function w(E,A,N,F,y){if(E.visible===!1)return;if(E.layers.test(A.layers)&&(E.isMesh||E.isLine||E.isPoints)&&(E.castShadow||E.receiveShadow&&y===si)&&(!E.frustumCulled||i.intersectsObject(E))){E.modelViewMatrix.multiplyMatrices(N.matrixWorldInverse,E.matrixWorld);const V=e.update(E),q=E.material;if(Array.isArray(q)){const Q=V.groups;for(let W=0,Y=Q.length;W<Y;W++){const D=Q[W],J=q[D.materialIndex];if(J&&J.visible){const ee=v(E,J,F,y);E.onBeforeShadow(t,E,A,N,V,ee,D),t.renderBufferDirect(N,null,V,ee,E,D),E.onAfterShadow(t,E,A,N,V,ee,D)}}}else if(q.visible){const Q=v(E,q,F,y);E.onBeforeShadow(t,E,A,N,V,Q,null),t.renderBufferDirect(N,null,V,Q,E,null),E.onAfterShadow(t,E,A,N,V,Q,null)}}const O=E.children;for(let V=0,q=O.length;V<q;V++)w(O[V],A,N,F,y)}function R(E){E.target.removeEventListener("dispose",R);for(const N in u){const F=u[N],y=E.target.uuid;y in F&&(F[y].dispose(),delete F[y])}}}const e2={[cd]:ud,[dd]:pd,[hd]:md,[Cs]:fd,[ud]:cd,[pd]:dd,[md]:hd,[fd]:Cs};function t2(t){function e(){let L=!1;const fe=new st;let X=null;const K=new st(0,0,0,0);return{setMask:function(xe){X!==xe&&!L&&(t.colorMask(xe,xe,xe,xe),X=xe)},setLocked:function(xe){L=xe},setClear:function(xe,de,qe,ft,Qt){Qt===!0&&(xe*=ft,de*=ft,qe*=ft),fe.set(xe,de,qe,ft),K.equals(fe)===!1&&(t.clearColor(xe,de,qe,ft),K.copy(fe))},reset:function(){L=!1,X=null,K.set(-1,0,0,0)}}}function n(){let L=!1,fe=!1,X=null,K=null,xe=null;return{setReversed:function(de){fe=de},setTest:function(de){de?ue(t.DEPTH_TEST):me(t.DEPTH_TEST)},setMask:function(de){X!==de&&!L&&(t.depthMask(de),X=de)},setFunc:function(de){if(fe&&(de=e2[de]),K!==de){switch(de){case cd:t.depthFunc(t.NEVER);break;case ud:t.depthFunc(t.ALWAYS);break;case dd:t.depthFunc(t.LESS);break;case Cs:t.depthFunc(t.LEQUAL);break;case hd:t.depthFunc(t.EQUAL);break;case fd:t.depthFunc(t.GEQUAL);break;case pd:t.depthFunc(t.GREATER);break;case md:t.depthFunc(t.NOTEQUAL);break;default:t.depthFunc(t.LEQUAL)}K=de}},setLocked:function(de){L=de},setClear:function(de){xe!==de&&(t.clearDepth(de),xe=de)},reset:function(){L=!1,X=null,K=null,xe=null}}}function i(){let L=!1,fe=null,X=null,K=null,xe=null,de=null,qe=null,ft=null,Qt=null;return{setTest:function(Ze){L||(Ze?ue(t.STENCIL_TEST):me(t.STENCIL_TEST))},setMask:function(Ze){fe!==Ze&&!L&&(t.stencilMask(Ze),fe=Ze)},setFunc:function(Ze,Jt,Jn){(X!==Ze||K!==Jt||xe!==Jn)&&(t.stencilFunc(Ze,Jt,Jn),X=Ze,K=Jt,xe=Jn)},setOp:function(Ze,Jt,Jn){(de!==Ze||qe!==Jt||ft!==Jn)&&(t.stencilOp(Ze,Jt,Jn),de=Ze,qe=Jt,ft=Jn)},setLocked:function(Ze){L=Ze},setClear:function(Ze){Qt!==Ze&&(t.clearStencil(Ze),Qt=Ze)},reset:function(){L=!1,fe=null,X=null,K=null,xe=null,de=null,qe=null,ft=null,Qt=null}}}const r=new e,s=new n,a=new i,o=new WeakMap,c=new WeakMap;let u={},f={},p=new WeakMap,h=[],x=null,_=!1,S=null,m=null,d=null,g=null,v=null,w=null,R=null,E=new Ye(0,0,0),A=0,N=!1,F=null,y=null,b=null,O=null,V=null;const q=t.getParameter(t.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let Q=!1,W=0;const Y=t.getParameter(t.VERSION);Y.indexOf("WebGL")!==-1?(W=parseFloat(/^WebGL (\d)/.exec(Y)[1]),Q=W>=1):Y.indexOf("OpenGL ES")!==-1&&(W=parseFloat(/^OpenGL ES (\d)/.exec(Y)[1]),Q=W>=2);let D=null,J={};const ee=t.getParameter(t.SCISSOR_BOX),z=t.getParameter(t.VIEWPORT),le=new st().fromArray(ee),Ae=new st().fromArray(z);function G(L,fe,X,K){const xe=new Uint8Array(4),de=t.createTexture();t.bindTexture(L,de),t.texParameteri(L,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(L,t.TEXTURE_MAG_FILTER,t.NEAREST);for(let qe=0;qe<X;qe++)L===t.TEXTURE_3D||L===t.TEXTURE_2D_ARRAY?t.texImage3D(fe,0,t.RGBA,1,1,K,0,t.RGBA,t.UNSIGNED_BYTE,xe):t.texImage2D(fe+qe,0,t.RGBA,1,1,0,t.RGBA,t.UNSIGNED_BYTE,xe);return de}const re={};re[t.TEXTURE_2D]=G(t.TEXTURE_2D,t.TEXTURE_2D,1),re[t.TEXTURE_CUBE_MAP]=G(t.TEXTURE_CUBE_MAP,t.TEXTURE_CUBE_MAP_POSITIVE_X,6),re[t.TEXTURE_2D_ARRAY]=G(t.TEXTURE_2D_ARRAY,t.TEXTURE_2D_ARRAY,1,1),re[t.TEXTURE_3D]=G(t.TEXTURE_3D,t.TEXTURE_3D,1,1),r.setClear(0,0,0,1),s.setClear(1),a.setClear(0),ue(t.DEPTH_TEST),s.setFunc(Cs),He(!1),Ve(Rp),ue(t.CULL_FACE),P(Xi);function ue(L){u[L]!==!0&&(t.enable(L),u[L]=!0)}function me(L){u[L]!==!1&&(t.disable(L),u[L]=!1)}function Le(L,fe){return f[L]!==fe?(t.bindFramebuffer(L,fe),f[L]=fe,L===t.DRAW_FRAMEBUFFER&&(f[t.FRAMEBUFFER]=fe),L===t.FRAMEBUFFER&&(f[t.DRAW_FRAMEBUFFER]=fe),!0):!1}function De(L,fe){let X=h,K=!1;if(L){X=p.get(fe),X===void 0&&(X=[],p.set(fe,X));const xe=L.textures;if(X.length!==xe.length||X[0]!==t.COLOR_ATTACHMENT0){for(let de=0,qe=xe.length;de<qe;de++)X[de]=t.COLOR_ATTACHMENT0+de;X.length=xe.length,K=!0}}else X[0]!==t.BACK&&(X[0]=t.BACK,K=!0);K&&t.drawBuffers(X)}function We(L){return x!==L?(t.useProgram(L),x=L,!0):!1}const Qe={[pr]:t.FUNC_ADD,[x1]:t.FUNC_SUBTRACT,[g1]:t.FUNC_REVERSE_SUBTRACT};Qe[v1]=t.MIN,Qe[_1]=t.MAX;const Be={[y1]:t.ZERO,[S1]:t.ONE,[w1]:t.SRC_COLOR,[od]:t.SRC_ALPHA,[C1]:t.SRC_ALPHA_SATURATE,[T1]:t.DST_COLOR,[b1]:t.DST_ALPHA,[M1]:t.ONE_MINUS_SRC_COLOR,[ld]:t.ONE_MINUS_SRC_ALPHA,[A1]:t.ONE_MINUS_DST_COLOR,[E1]:t.ONE_MINUS_DST_ALPHA,[N1]:t.CONSTANT_COLOR,[R1]:t.ONE_MINUS_CONSTANT_COLOR,[P1]:t.CONSTANT_ALPHA,[L1]:t.ONE_MINUS_CONSTANT_ALPHA};function P(L,fe,X,K,xe,de,qe,ft,Qt,Ze){if(L===Xi){_===!0&&(me(t.BLEND),_=!1);return}if(_===!1&&(ue(t.BLEND),_=!0),L!==m1){if(L!==S||Ze!==N){if((m!==pr||v!==pr)&&(t.blendEquation(t.FUNC_ADD),m=pr,v=pr),Ze)switch(L){case ps:t.blendFuncSeparate(t.ONE,t.ONE_MINUS_SRC_ALPHA,t.ONE,t.ONE_MINUS_SRC_ALPHA);break;case ad:t.blendFunc(t.ONE,t.ONE);break;case Pp:t.blendFuncSeparate(t.ZERO,t.ONE_MINUS_SRC_COLOR,t.ZERO,t.ONE);break;case Lp:t.blendFuncSeparate(t.ZERO,t.SRC_COLOR,t.ZERO,t.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",L);break}else switch(L){case ps:t.blendFuncSeparate(t.SRC_ALPHA,t.ONE_MINUS_SRC_ALPHA,t.ONE,t.ONE_MINUS_SRC_ALPHA);break;case ad:t.blendFunc(t.SRC_ALPHA,t.ONE);break;case Pp:t.blendFuncSeparate(t.ZERO,t.ONE_MINUS_SRC_COLOR,t.ZERO,t.ONE);break;case Lp:t.blendFunc(t.ZERO,t.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",L);break}d=null,g=null,w=null,R=null,E.set(0,0,0),A=0,S=L,N=Ze}return}xe=xe||fe,de=de||X,qe=qe||K,(fe!==m||xe!==v)&&(t.blendEquationSeparate(Qe[fe],Qe[xe]),m=fe,v=xe),(X!==d||K!==g||de!==w||qe!==R)&&(t.blendFuncSeparate(Be[X],Be[K],Be[de],Be[qe]),d=X,g=K,w=de,R=qe),(ft.equals(E)===!1||Qt!==A)&&(t.blendColor(ft.r,ft.g,ft.b,Qt),E.copy(ft),A=Qt),S=L,N=!1}function Vt(L,fe){L.side===zn?me(t.CULL_FACE):ue(t.CULL_FACE);let X=L.side===qt;fe&&(X=!X),He(X),L.blending===ps&&L.transparent===!1?P(Xi):P(L.blending,L.blendEquation,L.blendSrc,L.blendDst,L.blendEquationAlpha,L.blendSrcAlpha,L.blendDstAlpha,L.blendColor,L.blendAlpha,L.premultipliedAlpha),s.setFunc(L.depthFunc),s.setTest(L.depthTest),s.setMask(L.depthWrite),r.setMask(L.colorWrite);const K=L.stencilWrite;a.setTest(K),K&&(a.setMask(L.stencilWriteMask),a.setFunc(L.stencilFunc,L.stencilRef,L.stencilFuncMask),a.setOp(L.stencilFail,L.stencilZFail,L.stencilZPass)),rt(L.polygonOffset,L.polygonOffsetFactor,L.polygonOffsetUnits),L.alphaToCoverage===!0?ue(t.SAMPLE_ALPHA_TO_COVERAGE):me(t.SAMPLE_ALPHA_TO_COVERAGE)}function He(L){F!==L&&(L?t.frontFace(t.CW):t.frontFace(t.CCW),F=L)}function Ve(L){L!==h1?(ue(t.CULL_FACE),L!==y&&(L===Rp?t.cullFace(t.BACK):L===f1?t.cullFace(t.FRONT):t.cullFace(t.FRONT_AND_BACK))):me(t.CULL_FACE),y=L}function ke(L){L!==b&&(Q&&t.lineWidth(L),b=L)}function rt(L,fe,X){L?(ue(t.POLYGON_OFFSET_FILL),(O!==fe||V!==X)&&(t.polygonOffset(fe,X),O=fe,V=X)):me(t.POLYGON_OFFSET_FILL)}function Pe(L){L?ue(t.SCISSOR_TEST):me(t.SCISSOR_TEST)}function C(L){L===void 0&&(L=t.TEXTURE0+q-1),D!==L&&(t.activeTexture(L),D=L)}function M(L,fe,X){X===void 0&&(D===null?X=t.TEXTURE0+q-1:X=D);let K=J[X];K===void 0&&(K={type:void 0,texture:void 0},J[X]=K),(K.type!==L||K.texture!==fe)&&(D!==X&&(t.activeTexture(X),D=X),t.bindTexture(L,fe||re[L]),K.type=L,K.texture=fe)}function j(){const L=J[D];L!==void 0&&L.type!==void 0&&(t.bindTexture(L.type,null),L.type=void 0,L.texture=void 0)}function Z(){try{t.compressedTexImage2D.apply(t,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function ie(){try{t.compressedTexImage3D.apply(t,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function $(){try{t.texSubImage2D.apply(t,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Me(){try{t.texSubImage3D.apply(t,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function he(){try{t.compressedTexSubImage2D.apply(t,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function ve(){try{t.compressedTexSubImage3D.apply(t,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Xe(){try{t.texStorage2D.apply(t,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function oe(){try{t.texStorage3D.apply(t,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function ye(){try{t.texImage2D.apply(t,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Ie(){try{t.texImage3D.apply(t,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function te(L){le.equals(L)===!1&&(t.scissor(L.x,L.y,L.z,L.w),le.copy(L))}function se(L){Ae.equals(L)===!1&&(t.viewport(L.x,L.y,L.z,L.w),Ae.copy(L))}function Re(L,fe){let X=c.get(fe);X===void 0&&(X=new WeakMap,c.set(fe,X));let K=X.get(L);K===void 0&&(K=t.getUniformBlockIndex(fe,L.name),X.set(L,K))}function Ne(L,fe){const K=c.get(fe).get(L);o.get(fe)!==K&&(t.uniformBlockBinding(fe,K,L.__bindingPointIndex),o.set(fe,K))}function Oe(){t.disable(t.BLEND),t.disable(t.CULL_FACE),t.disable(t.DEPTH_TEST),t.disable(t.POLYGON_OFFSET_FILL),t.disable(t.SCISSOR_TEST),t.disable(t.STENCIL_TEST),t.disable(t.SAMPLE_ALPHA_TO_COVERAGE),t.blendEquation(t.FUNC_ADD),t.blendFunc(t.ONE,t.ZERO),t.blendFuncSeparate(t.ONE,t.ZERO,t.ONE,t.ZERO),t.blendColor(0,0,0,0),t.colorMask(!0,!0,!0,!0),t.clearColor(0,0,0,0),t.depthMask(!0),t.depthFunc(t.LESS),t.clearDepth(1),t.stencilMask(4294967295),t.stencilFunc(t.ALWAYS,0,4294967295),t.stencilOp(t.KEEP,t.KEEP,t.KEEP),t.clearStencil(0),t.cullFace(t.BACK),t.frontFace(t.CCW),t.polygonOffset(0,0),t.activeTexture(t.TEXTURE0),t.bindFramebuffer(t.FRAMEBUFFER,null),t.bindFramebuffer(t.DRAW_FRAMEBUFFER,null),t.bindFramebuffer(t.READ_FRAMEBUFFER,null),t.useProgram(null),t.lineWidth(1),t.scissor(0,0,t.canvas.width,t.canvas.height),t.viewport(0,0,t.canvas.width,t.canvas.height),u={},D=null,J={},f={},p=new WeakMap,h=[],x=null,_=!1,S=null,m=null,d=null,g=null,v=null,w=null,R=null,E=new Ye(0,0,0),A=0,N=!1,F=null,y=null,b=null,O=null,V=null,le.set(0,0,t.canvas.width,t.canvas.height),Ae.set(0,0,t.canvas.width,t.canvas.height),r.reset(),s.reset(),a.reset()}return{buffers:{color:r,depth:s,stencil:a},enable:ue,disable:me,bindFramebuffer:Le,drawBuffers:De,useProgram:We,setBlending:P,setMaterial:Vt,setFlipSided:He,setCullFace:Ve,setLineWidth:ke,setPolygonOffset:rt,setScissorTest:Pe,activeTexture:C,bindTexture:M,unbindTexture:j,compressedTexImage2D:Z,compressedTexImage3D:ie,texImage2D:ye,texImage3D:Ie,updateUBOMapping:Re,uniformBlockBinding:Ne,texStorage2D:Xe,texStorage3D:oe,texSubImage2D:$,texSubImage3D:Me,compressedTexSubImage2D:he,compressedTexSubImage3D:ve,scissor:te,viewport:se,reset:Oe}}function wm(t,e,n,i){const r=n2(i);switch(n){case hg:return t*e;case pg:return t*e;case mg:return t*e*2;case xg:return t*e/r.components*r.byteLength;case $h:return t*e/r.components*r.byteLength;case gg:return t*e*2/r.components*r.byteLength;case Yh:return t*e*2/r.components*r.byteLength;case fg:return t*e*3/r.components*r.byteLength;case Bn:return t*e*4/r.components*r.byteLength;case Kh:return t*e*4/r.components*r.byteLength;case Yo:case Ko:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*8;case Zo:case Qo:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*16;case Sd:case Md:return Math.max(t,16)*Math.max(e,8)/4;case yd:case wd:return Math.max(t,8)*Math.max(e,8)/2;case bd:case Ed:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*8;case Td:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*16;case Ad:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*16;case Cd:return Math.floor((t+4)/5)*Math.floor((e+3)/4)*16;case Nd:return Math.floor((t+4)/5)*Math.floor((e+4)/5)*16;case Rd:return Math.floor((t+5)/6)*Math.floor((e+4)/5)*16;case Pd:return Math.floor((t+5)/6)*Math.floor((e+5)/6)*16;case Ld:return Math.floor((t+7)/8)*Math.floor((e+4)/5)*16;case Dd:return Math.floor((t+7)/8)*Math.floor((e+5)/6)*16;case kd:return Math.floor((t+7)/8)*Math.floor((e+7)/8)*16;case Id:return Math.floor((t+9)/10)*Math.floor((e+4)/5)*16;case Ud:return Math.floor((t+9)/10)*Math.floor((e+5)/6)*16;case Fd:return Math.floor((t+9)/10)*Math.floor((e+7)/8)*16;case Od:return Math.floor((t+9)/10)*Math.floor((e+9)/10)*16;case zd:return Math.floor((t+11)/12)*Math.floor((e+9)/10)*16;case jd:return Math.floor((t+11)/12)*Math.floor((e+11)/12)*16;case Jo:case Bd:case Hd:return Math.ceil(t/4)*Math.ceil(e/4)*16;case vg:case Vd:return Math.ceil(t/4)*Math.ceil(e/4)*8;case Gd:case Wd:return Math.ceil(t/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${n} format.`)}function n2(t){switch(t){case _i:case cg:return{byteLength:1,components:1};case Ua:case ug:case Va:return{byteLength:2,components:1};case Xh:case qh:return{byteLength:2,components:4};case Cr:case Wh:case di:return{byteLength:4,components:1};case dg:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${t}.`)}function i2(t,e,n,i,r,s,a){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),u=new $e,f=new WeakMap;let p;const h=new WeakMap;let x=!1;try{x=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function _(C,M){return x?new OffscreenCanvas(C,M):Fa("canvas")}function S(C,M,j){let Z=1;const ie=Pe(C);if((ie.width>j||ie.height>j)&&(Z=j/Math.max(ie.width,ie.height)),Z<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){const $=Math.floor(Z*ie.width),Me=Math.floor(Z*ie.height);p===void 0&&(p=_($,Me));const he=M?_($,Me):p;return he.width=$,he.height=Me,he.getContext("2d").drawImage(C,0,0,$,Me),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+ie.width+"x"+ie.height+") to ("+$+"x"+Me+")."),he}else return"data"in C&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+ie.width+"x"+ie.height+")."),C;return C}function m(C){return C.generateMipmaps&&C.minFilter!==En&&C.minFilter!==Mn}function d(C){t.generateMipmap(C)}function g(C,M,j,Z,ie=!1){if(C!==null){if(t[C]!==void 0)return t[C];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let $=M;if(M===t.RED&&(j===t.FLOAT&&($=t.R32F),j===t.HALF_FLOAT&&($=t.R16F),j===t.UNSIGNED_BYTE&&($=t.R8)),M===t.RED_INTEGER&&(j===t.UNSIGNED_BYTE&&($=t.R8UI),j===t.UNSIGNED_SHORT&&($=t.R16UI),j===t.UNSIGNED_INT&&($=t.R32UI),j===t.BYTE&&($=t.R8I),j===t.SHORT&&($=t.R16I),j===t.INT&&($=t.R32I)),M===t.RG&&(j===t.FLOAT&&($=t.RG32F),j===t.HALF_FLOAT&&($=t.RG16F),j===t.UNSIGNED_BYTE&&($=t.RG8)),M===t.RG_INTEGER&&(j===t.UNSIGNED_BYTE&&($=t.RG8UI),j===t.UNSIGNED_SHORT&&($=t.RG16UI),j===t.UNSIGNED_INT&&($=t.RG32UI),j===t.BYTE&&($=t.RG8I),j===t.SHORT&&($=t.RG16I),j===t.INT&&($=t.RG32I)),M===t.RGB_INTEGER&&(j===t.UNSIGNED_BYTE&&($=t.RGB8UI),j===t.UNSIGNED_SHORT&&($=t.RGB16UI),j===t.UNSIGNED_INT&&($=t.RGB32UI),j===t.BYTE&&($=t.RGB8I),j===t.SHORT&&($=t.RGB16I),j===t.INT&&($=t.RGB32I)),M===t.RGBA_INTEGER&&(j===t.UNSIGNED_BYTE&&($=t.RGBA8UI),j===t.UNSIGNED_SHORT&&($=t.RGBA16UI),j===t.UNSIGNED_INT&&($=t.RGBA32UI),j===t.BYTE&&($=t.RGBA8I),j===t.SHORT&&($=t.RGBA16I),j===t.INT&&($=t.RGBA32I)),M===t.RGB&&j===t.UNSIGNED_INT_5_9_9_9_REV&&($=t.RGB9_E5),M===t.RGBA){const Me=ie?Tl:tt.getTransfer(Z);j===t.FLOAT&&($=t.RGBA32F),j===t.HALF_FLOAT&&($=t.RGBA16F),j===t.UNSIGNED_BYTE&&($=Me===ct?t.SRGB8_ALPHA8:t.RGBA8),j===t.UNSIGNED_SHORT_4_4_4_4&&($=t.RGBA4),j===t.UNSIGNED_SHORT_5_5_5_1&&($=t.RGB5_A1)}return($===t.R16F||$===t.R32F||$===t.RG16F||$===t.RG32F||$===t.RGBA16F||$===t.RGBA32F)&&e.get("EXT_color_buffer_float"),$}function v(C,M){let j;return C?M===null||M===Cr||M===Ps?j=t.DEPTH24_STENCIL8:M===di?j=t.DEPTH32F_STENCIL8:M===Ua&&(j=t.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):M===null||M===Cr||M===Ps?j=t.DEPTH_COMPONENT24:M===di?j=t.DEPTH_COMPONENT32F:M===Ua&&(j=t.DEPTH_COMPONENT16),j}function w(C,M){return m(C)===!0||C.isFramebufferTexture&&C.minFilter!==En&&C.minFilter!==Mn?Math.log2(Math.max(M.width,M.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?M.mipmaps.length:1}function R(C){const M=C.target;M.removeEventListener("dispose",R),A(M),M.isVideoTexture&&f.delete(M)}function E(C){const M=C.target;M.removeEventListener("dispose",E),F(M)}function A(C){const M=i.get(C);if(M.__webglInit===void 0)return;const j=C.source,Z=h.get(j);if(Z){const ie=Z[M.__cacheKey];ie.usedTimes--,ie.usedTimes===0&&N(C),Object.keys(Z).length===0&&h.delete(j)}i.remove(C)}function N(C){const M=i.get(C);t.deleteTexture(M.__webglTexture);const j=C.source,Z=h.get(j);delete Z[M.__cacheKey],a.memory.textures--}function F(C){const M=i.get(C);if(C.depthTexture&&C.depthTexture.dispose(),C.isWebGLCubeRenderTarget)for(let Z=0;Z<6;Z++){if(Array.isArray(M.__webglFramebuffer[Z]))for(let ie=0;ie<M.__webglFramebuffer[Z].length;ie++)t.deleteFramebuffer(M.__webglFramebuffer[Z][ie]);else t.deleteFramebuffer(M.__webglFramebuffer[Z]);M.__webglDepthbuffer&&t.deleteRenderbuffer(M.__webglDepthbuffer[Z])}else{if(Array.isArray(M.__webglFramebuffer))for(let Z=0;Z<M.__webglFramebuffer.length;Z++)t.deleteFramebuffer(M.__webglFramebuffer[Z]);else t.deleteFramebuffer(M.__webglFramebuffer);if(M.__webglDepthbuffer&&t.deleteRenderbuffer(M.__webglDepthbuffer),M.__webglMultisampledFramebuffer&&t.deleteFramebuffer(M.__webglMultisampledFramebuffer),M.__webglColorRenderbuffer)for(let Z=0;Z<M.__webglColorRenderbuffer.length;Z++)M.__webglColorRenderbuffer[Z]&&t.deleteRenderbuffer(M.__webglColorRenderbuffer[Z]);M.__webglDepthRenderbuffer&&t.deleteRenderbuffer(M.__webglDepthRenderbuffer)}const j=C.textures;for(let Z=0,ie=j.length;Z<ie;Z++){const $=i.get(j[Z]);$.__webglTexture&&(t.deleteTexture($.__webglTexture),a.memory.textures--),i.remove(j[Z])}i.remove(C)}let y=0;function b(){y=0}function O(){const C=y;return C>=r.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+C+" texture units while this GPU supports only "+r.maxTextures),y+=1,C}function V(C){const M=[];return M.push(C.wrapS),M.push(C.wrapT),M.push(C.wrapR||0),M.push(C.magFilter),M.push(C.minFilter),M.push(C.anisotropy),M.push(C.internalFormat),M.push(C.format),M.push(C.type),M.push(C.generateMipmaps),M.push(C.premultiplyAlpha),M.push(C.flipY),M.push(C.unpackAlignment),M.push(C.colorSpace),M.join()}function q(C,M){const j=i.get(C);if(C.isVideoTexture&&ke(C),C.isRenderTargetTexture===!1&&C.version>0&&j.__version!==C.version){const Z=C.image;if(Z===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(Z.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Ae(j,C,M);return}}n.bindTexture(t.TEXTURE_2D,j.__webglTexture,t.TEXTURE0+M)}function Q(C,M){const j=i.get(C);if(C.version>0&&j.__version!==C.version){Ae(j,C,M);return}n.bindTexture(t.TEXTURE_2D_ARRAY,j.__webglTexture,t.TEXTURE0+M)}function W(C,M){const j=i.get(C);if(C.version>0&&j.__version!==C.version){Ae(j,C,M);return}n.bindTexture(t.TEXTURE_3D,j.__webglTexture,t.TEXTURE0+M)}function Y(C,M){const j=i.get(C);if(C.version>0&&j.__version!==C.version){G(j,C,M);return}n.bindTexture(t.TEXTURE_CUBE_MAP,j.__webglTexture,t.TEXTURE0+M)}const D={[vd]:t.REPEAT,[_r]:t.CLAMP_TO_EDGE,[_d]:t.MIRRORED_REPEAT},J={[En]:t.NEAREST,[H1]:t.NEAREST_MIPMAP_NEAREST,[po]:t.NEAREST_MIPMAP_LINEAR,[Mn]:t.LINEAR,[Nc]:t.LINEAR_MIPMAP_NEAREST,[yr]:t.LINEAR_MIPMAP_LINEAR},ee={[X1]:t.NEVER,[Q1]:t.ALWAYS,[q1]:t.LESS,[yg]:t.LEQUAL,[$1]:t.EQUAL,[Z1]:t.GEQUAL,[Y1]:t.GREATER,[K1]:t.NOTEQUAL};function z(C,M){if(M.type===di&&e.has("OES_texture_float_linear")===!1&&(M.magFilter===Mn||M.magFilter===Nc||M.magFilter===po||M.magFilter===yr||M.minFilter===Mn||M.minFilter===Nc||M.minFilter===po||M.minFilter===yr)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),t.texParameteri(C,t.TEXTURE_WRAP_S,D[M.wrapS]),t.texParameteri(C,t.TEXTURE_WRAP_T,D[M.wrapT]),(C===t.TEXTURE_3D||C===t.TEXTURE_2D_ARRAY)&&t.texParameteri(C,t.TEXTURE_WRAP_R,D[M.wrapR]),t.texParameteri(C,t.TEXTURE_MAG_FILTER,J[M.magFilter]),t.texParameteri(C,t.TEXTURE_MIN_FILTER,J[M.minFilter]),M.compareFunction&&(t.texParameteri(C,t.TEXTURE_COMPARE_MODE,t.COMPARE_REF_TO_TEXTURE),t.texParameteri(C,t.TEXTURE_COMPARE_FUNC,ee[M.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(M.magFilter===En||M.minFilter!==po&&M.minFilter!==yr||M.type===di&&e.has("OES_texture_float_linear")===!1)return;if(M.anisotropy>1||i.get(M).__currentAnisotropy){const j=e.get("EXT_texture_filter_anisotropic");t.texParameterf(C,j.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(M.anisotropy,r.getMaxAnisotropy())),i.get(M).__currentAnisotropy=M.anisotropy}}}function le(C,M){let j=!1;C.__webglInit===void 0&&(C.__webglInit=!0,M.addEventListener("dispose",R));const Z=M.source;let ie=h.get(Z);ie===void 0&&(ie={},h.set(Z,ie));const $=V(M);if($!==C.__cacheKey){ie[$]===void 0&&(ie[$]={texture:t.createTexture(),usedTimes:0},a.memory.textures++,j=!0),ie[$].usedTimes++;const Me=ie[C.__cacheKey];Me!==void 0&&(ie[C.__cacheKey].usedTimes--,Me.usedTimes===0&&N(M)),C.__cacheKey=$,C.__webglTexture=ie[$].texture}return j}function Ae(C,M,j){let Z=t.TEXTURE_2D;(M.isDataArrayTexture||M.isCompressedArrayTexture)&&(Z=t.TEXTURE_2D_ARRAY),M.isData3DTexture&&(Z=t.TEXTURE_3D);const ie=le(C,M),$=M.source;n.bindTexture(Z,C.__webglTexture,t.TEXTURE0+j);const Me=i.get($);if($.version!==Me.__version||ie===!0){n.activeTexture(t.TEXTURE0+j);const he=tt.getPrimaries(tt.workingColorSpace),ve=M.colorSpace===Ii?null:tt.getPrimaries(M.colorSpace),Xe=M.colorSpace===Ii||he===ve?t.NONE:t.BROWSER_DEFAULT_WEBGL;t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,M.flipY),t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),t.pixelStorei(t.UNPACK_ALIGNMENT,M.unpackAlignment),t.pixelStorei(t.UNPACK_COLORSPACE_CONVERSION_WEBGL,Xe);let oe=S(M.image,!1,r.maxTextureSize);oe=rt(M,oe);const ye=s.convert(M.format,M.colorSpace),Ie=s.convert(M.type);let te=g(M.internalFormat,ye,Ie,M.colorSpace,M.isVideoTexture);z(Z,M);let se;const Re=M.mipmaps,Ne=M.isVideoTexture!==!0,Oe=Me.__version===void 0||ie===!0,L=$.dataReady,fe=w(M,oe);if(M.isDepthTexture)te=v(M.format===Ls,M.type),Oe&&(Ne?n.texStorage2D(t.TEXTURE_2D,1,te,oe.width,oe.height):n.texImage2D(t.TEXTURE_2D,0,te,oe.width,oe.height,0,ye,Ie,null));else if(M.isDataTexture)if(Re.length>0){Ne&&Oe&&n.texStorage2D(t.TEXTURE_2D,fe,te,Re[0].width,Re[0].height);for(let X=0,K=Re.length;X<K;X++)se=Re[X],Ne?L&&n.texSubImage2D(t.TEXTURE_2D,X,0,0,se.width,se.height,ye,Ie,se.data):n.texImage2D(t.TEXTURE_2D,X,te,se.width,se.height,0,ye,Ie,se.data);M.generateMipmaps=!1}else Ne?(Oe&&n.texStorage2D(t.TEXTURE_2D,fe,te,oe.width,oe.height),L&&n.texSubImage2D(t.TEXTURE_2D,0,0,0,oe.width,oe.height,ye,Ie,oe.data)):n.texImage2D(t.TEXTURE_2D,0,te,oe.width,oe.height,0,ye,Ie,oe.data);else if(M.isCompressedTexture)if(M.isCompressedArrayTexture){Ne&&Oe&&n.texStorage3D(t.TEXTURE_2D_ARRAY,fe,te,Re[0].width,Re[0].height,oe.depth);for(let X=0,K=Re.length;X<K;X++)if(se=Re[X],M.format!==Bn)if(ye!==null)if(Ne){if(L)if(M.layerUpdates.size>0){const xe=wm(se.width,se.height,M.format,M.type);for(const de of M.layerUpdates){const qe=se.data.subarray(de*xe/se.data.BYTES_PER_ELEMENT,(de+1)*xe/se.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(t.TEXTURE_2D_ARRAY,X,0,0,de,se.width,se.height,1,ye,qe,0,0)}M.clearLayerUpdates()}else n.compressedTexSubImage3D(t.TEXTURE_2D_ARRAY,X,0,0,0,se.width,se.height,oe.depth,ye,se.data,0,0)}else n.compressedTexImage3D(t.TEXTURE_2D_ARRAY,X,te,se.width,se.height,oe.depth,0,se.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ne?L&&n.texSubImage3D(t.TEXTURE_2D_ARRAY,X,0,0,0,se.width,se.height,oe.depth,ye,Ie,se.data):n.texImage3D(t.TEXTURE_2D_ARRAY,X,te,se.width,se.height,oe.depth,0,ye,Ie,se.data)}else{Ne&&Oe&&n.texStorage2D(t.TEXTURE_2D,fe,te,Re[0].width,Re[0].height);for(let X=0,K=Re.length;X<K;X++)se=Re[X],M.format!==Bn?ye!==null?Ne?L&&n.compressedTexSubImage2D(t.TEXTURE_2D,X,0,0,se.width,se.height,ye,se.data):n.compressedTexImage2D(t.TEXTURE_2D,X,te,se.width,se.height,0,se.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ne?L&&n.texSubImage2D(t.TEXTURE_2D,X,0,0,se.width,se.height,ye,Ie,se.data):n.texImage2D(t.TEXTURE_2D,X,te,se.width,se.height,0,ye,Ie,se.data)}else if(M.isDataArrayTexture)if(Ne){if(Oe&&n.texStorage3D(t.TEXTURE_2D_ARRAY,fe,te,oe.width,oe.height,oe.depth),L)if(M.layerUpdates.size>0){const X=wm(oe.width,oe.height,M.format,M.type);for(const K of M.layerUpdates){const xe=oe.data.subarray(K*X/oe.data.BYTES_PER_ELEMENT,(K+1)*X/oe.data.BYTES_PER_ELEMENT);n.texSubImage3D(t.TEXTURE_2D_ARRAY,0,0,0,K,oe.width,oe.height,1,ye,Ie,xe)}M.clearLayerUpdates()}else n.texSubImage3D(t.TEXTURE_2D_ARRAY,0,0,0,0,oe.width,oe.height,oe.depth,ye,Ie,oe.data)}else n.texImage3D(t.TEXTURE_2D_ARRAY,0,te,oe.width,oe.height,oe.depth,0,ye,Ie,oe.data);else if(M.isData3DTexture)Ne?(Oe&&n.texStorage3D(t.TEXTURE_3D,fe,te,oe.width,oe.height,oe.depth),L&&n.texSubImage3D(t.TEXTURE_3D,0,0,0,0,oe.width,oe.height,oe.depth,ye,Ie,oe.data)):n.texImage3D(t.TEXTURE_3D,0,te,oe.width,oe.height,oe.depth,0,ye,Ie,oe.data);else if(M.isFramebufferTexture){if(Oe)if(Ne)n.texStorage2D(t.TEXTURE_2D,fe,te,oe.width,oe.height);else{let X=oe.width,K=oe.height;for(let xe=0;xe<fe;xe++)n.texImage2D(t.TEXTURE_2D,xe,te,X,K,0,ye,Ie,null),X>>=1,K>>=1}}else if(Re.length>0){if(Ne&&Oe){const X=Pe(Re[0]);n.texStorage2D(t.TEXTURE_2D,fe,te,X.width,X.height)}for(let X=0,K=Re.length;X<K;X++)se=Re[X],Ne?L&&n.texSubImage2D(t.TEXTURE_2D,X,0,0,ye,Ie,se):n.texImage2D(t.TEXTURE_2D,X,te,ye,Ie,se);M.generateMipmaps=!1}else if(Ne){if(Oe){const X=Pe(oe);n.texStorage2D(t.TEXTURE_2D,fe,te,X.width,X.height)}L&&n.texSubImage2D(t.TEXTURE_2D,0,0,0,ye,Ie,oe)}else n.texImage2D(t.TEXTURE_2D,0,te,ye,Ie,oe);m(M)&&d(Z),Me.__version=$.version,M.onUpdate&&M.onUpdate(M)}C.__version=M.version}function G(C,M,j){if(M.image.length!==6)return;const Z=le(C,M),ie=M.source;n.bindTexture(t.TEXTURE_CUBE_MAP,C.__webglTexture,t.TEXTURE0+j);const $=i.get(ie);if(ie.version!==$.__version||Z===!0){n.activeTexture(t.TEXTURE0+j);const Me=tt.getPrimaries(tt.workingColorSpace),he=M.colorSpace===Ii?null:tt.getPrimaries(M.colorSpace),ve=M.colorSpace===Ii||Me===he?t.NONE:t.BROWSER_DEFAULT_WEBGL;t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,M.flipY),t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),t.pixelStorei(t.UNPACK_ALIGNMENT,M.unpackAlignment),t.pixelStorei(t.UNPACK_COLORSPACE_CONVERSION_WEBGL,ve);const Xe=M.isCompressedTexture||M.image[0].isCompressedTexture,oe=M.image[0]&&M.image[0].isDataTexture,ye=[];for(let K=0;K<6;K++)!Xe&&!oe?ye[K]=S(M.image[K],!0,r.maxCubemapSize):ye[K]=oe?M.image[K].image:M.image[K],ye[K]=rt(M,ye[K]);const Ie=ye[0],te=s.convert(M.format,M.colorSpace),se=s.convert(M.type),Re=g(M.internalFormat,te,se,M.colorSpace),Ne=M.isVideoTexture!==!0,Oe=$.__version===void 0||Z===!0,L=ie.dataReady;let fe=w(M,Ie);z(t.TEXTURE_CUBE_MAP,M);let X;if(Xe){Ne&&Oe&&n.texStorage2D(t.TEXTURE_CUBE_MAP,fe,Re,Ie.width,Ie.height);for(let K=0;K<6;K++){X=ye[K].mipmaps;for(let xe=0;xe<X.length;xe++){const de=X[xe];M.format!==Bn?te!==null?Ne?L&&n.compressedTexSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+K,xe,0,0,de.width,de.height,te,de.data):n.compressedTexImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+K,xe,Re,de.width,de.height,0,de.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ne?L&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+K,xe,0,0,de.width,de.height,te,se,de.data):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+K,xe,Re,de.width,de.height,0,te,se,de.data)}}}else{if(X=M.mipmaps,Ne&&Oe){X.length>0&&fe++;const K=Pe(ye[0]);n.texStorage2D(t.TEXTURE_CUBE_MAP,fe,Re,K.width,K.height)}for(let K=0;K<6;K++)if(oe){Ne?L&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,0,0,ye[K].width,ye[K].height,te,se,ye[K].data):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,Re,ye[K].width,ye[K].height,0,te,se,ye[K].data);for(let xe=0;xe<X.length;xe++){const qe=X[xe].image[K].image;Ne?L&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+K,xe+1,0,0,qe.width,qe.height,te,se,qe.data):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+K,xe+1,Re,qe.width,qe.height,0,te,se,qe.data)}}else{Ne?L&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,0,0,te,se,ye[K]):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,Re,te,se,ye[K]);for(let xe=0;xe<X.length;xe++){const de=X[xe];Ne?L&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+K,xe+1,0,0,te,se,de.image[K]):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+K,xe+1,Re,te,se,de.image[K])}}}m(M)&&d(t.TEXTURE_CUBE_MAP),$.__version=ie.version,M.onUpdate&&M.onUpdate(M)}C.__version=M.version}function re(C,M,j,Z,ie,$){const Me=s.convert(j.format,j.colorSpace),he=s.convert(j.type),ve=g(j.internalFormat,Me,he,j.colorSpace);if(!i.get(M).__hasExternalTextures){const oe=Math.max(1,M.width>>$),ye=Math.max(1,M.height>>$);ie===t.TEXTURE_3D||ie===t.TEXTURE_2D_ARRAY?n.texImage3D(ie,$,ve,oe,ye,M.depth,0,Me,he,null):n.texImage2D(ie,$,ve,oe,ye,0,Me,he,null)}n.bindFramebuffer(t.FRAMEBUFFER,C),Ve(M)?o.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,Z,ie,i.get(j).__webglTexture,0,He(M)):(ie===t.TEXTURE_2D||ie>=t.TEXTURE_CUBE_MAP_POSITIVE_X&&ie<=t.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&t.framebufferTexture2D(t.FRAMEBUFFER,Z,ie,i.get(j).__webglTexture,$),n.bindFramebuffer(t.FRAMEBUFFER,null)}function ue(C,M,j){if(t.bindRenderbuffer(t.RENDERBUFFER,C),M.depthBuffer){const Z=M.depthTexture,ie=Z&&Z.isDepthTexture?Z.type:null,$=v(M.stencilBuffer,ie),Me=M.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,he=He(M);Ve(M)?o.renderbufferStorageMultisampleEXT(t.RENDERBUFFER,he,$,M.width,M.height):j?t.renderbufferStorageMultisample(t.RENDERBUFFER,he,$,M.width,M.height):t.renderbufferStorage(t.RENDERBUFFER,$,M.width,M.height),t.framebufferRenderbuffer(t.FRAMEBUFFER,Me,t.RENDERBUFFER,C)}else{const Z=M.textures;for(let ie=0;ie<Z.length;ie++){const $=Z[ie],Me=s.convert($.format,$.colorSpace),he=s.convert($.type),ve=g($.internalFormat,Me,he,$.colorSpace),Xe=He(M);j&&Ve(M)===!1?t.renderbufferStorageMultisample(t.RENDERBUFFER,Xe,ve,M.width,M.height):Ve(M)?o.renderbufferStorageMultisampleEXT(t.RENDERBUFFER,Xe,ve,M.width,M.height):t.renderbufferStorage(t.RENDERBUFFER,ve,M.width,M.height)}}t.bindRenderbuffer(t.RENDERBUFFER,null)}function me(C,M){if(M&&M.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(n.bindFramebuffer(t.FRAMEBUFFER,C),!(M.depthTexture&&M.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!i.get(M.depthTexture).__webglTexture||M.depthTexture.image.width!==M.width||M.depthTexture.image.height!==M.height)&&(M.depthTexture.image.width=M.width,M.depthTexture.image.height=M.height,M.depthTexture.needsUpdate=!0),q(M.depthTexture,0);const Z=i.get(M.depthTexture).__webglTexture,ie=He(M);if(M.depthTexture.format===ms)Ve(M)?o.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,t.DEPTH_ATTACHMENT,t.TEXTURE_2D,Z,0,ie):t.framebufferTexture2D(t.FRAMEBUFFER,t.DEPTH_ATTACHMENT,t.TEXTURE_2D,Z,0);else if(M.depthTexture.format===Ls)Ve(M)?o.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,t.DEPTH_STENCIL_ATTACHMENT,t.TEXTURE_2D,Z,0,ie):t.framebufferTexture2D(t.FRAMEBUFFER,t.DEPTH_STENCIL_ATTACHMENT,t.TEXTURE_2D,Z,0);else throw new Error("Unknown depthTexture format")}function Le(C){const M=i.get(C),j=C.isWebGLCubeRenderTarget===!0;if(M.__boundDepthTexture!==C.depthTexture){const Z=C.depthTexture;if(M.__depthDisposeCallback&&M.__depthDisposeCallback(),Z){const ie=()=>{delete M.__boundDepthTexture,delete M.__depthDisposeCallback,Z.removeEventListener("dispose",ie)};Z.addEventListener("dispose",ie),M.__depthDisposeCallback=ie}M.__boundDepthTexture=Z}if(C.depthTexture&&!M.__autoAllocateDepthBuffer){if(j)throw new Error("target.depthTexture not supported in Cube render targets");me(M.__webglFramebuffer,C)}else if(j){M.__webglDepthbuffer=[];for(let Z=0;Z<6;Z++)if(n.bindFramebuffer(t.FRAMEBUFFER,M.__webglFramebuffer[Z]),M.__webglDepthbuffer[Z]===void 0)M.__webglDepthbuffer[Z]=t.createRenderbuffer(),ue(M.__webglDepthbuffer[Z],C,!1);else{const ie=C.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,$=M.__webglDepthbuffer[Z];t.bindRenderbuffer(t.RENDERBUFFER,$),t.framebufferRenderbuffer(t.FRAMEBUFFER,ie,t.RENDERBUFFER,$)}}else if(n.bindFramebuffer(t.FRAMEBUFFER,M.__webglFramebuffer),M.__webglDepthbuffer===void 0)M.__webglDepthbuffer=t.createRenderbuffer(),ue(M.__webglDepthbuffer,C,!1);else{const Z=C.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,ie=M.__webglDepthbuffer;t.bindRenderbuffer(t.RENDERBUFFER,ie),t.framebufferRenderbuffer(t.FRAMEBUFFER,Z,t.RENDERBUFFER,ie)}n.bindFramebuffer(t.FRAMEBUFFER,null)}function De(C,M,j){const Z=i.get(C);M!==void 0&&re(Z.__webglFramebuffer,C,C.texture,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,0),j!==void 0&&Le(C)}function We(C){const M=C.texture,j=i.get(C),Z=i.get(M);C.addEventListener("dispose",E);const ie=C.textures,$=C.isWebGLCubeRenderTarget===!0,Me=ie.length>1;if(Me||(Z.__webglTexture===void 0&&(Z.__webglTexture=t.createTexture()),Z.__version=M.version,a.memory.textures++),$){j.__webglFramebuffer=[];for(let he=0;he<6;he++)if(M.mipmaps&&M.mipmaps.length>0){j.__webglFramebuffer[he]=[];for(let ve=0;ve<M.mipmaps.length;ve++)j.__webglFramebuffer[he][ve]=t.createFramebuffer()}else j.__webglFramebuffer[he]=t.createFramebuffer()}else{if(M.mipmaps&&M.mipmaps.length>0){j.__webglFramebuffer=[];for(let he=0;he<M.mipmaps.length;he++)j.__webglFramebuffer[he]=t.createFramebuffer()}else j.__webglFramebuffer=t.createFramebuffer();if(Me)for(let he=0,ve=ie.length;he<ve;he++){const Xe=i.get(ie[he]);Xe.__webglTexture===void 0&&(Xe.__webglTexture=t.createTexture(),a.memory.textures++)}if(C.samples>0&&Ve(C)===!1){j.__webglMultisampledFramebuffer=t.createFramebuffer(),j.__webglColorRenderbuffer=[],n.bindFramebuffer(t.FRAMEBUFFER,j.__webglMultisampledFramebuffer);for(let he=0;he<ie.length;he++){const ve=ie[he];j.__webglColorRenderbuffer[he]=t.createRenderbuffer(),t.bindRenderbuffer(t.RENDERBUFFER,j.__webglColorRenderbuffer[he]);const Xe=s.convert(ve.format,ve.colorSpace),oe=s.convert(ve.type),ye=g(ve.internalFormat,Xe,oe,ve.colorSpace,C.isXRRenderTarget===!0),Ie=He(C);t.renderbufferStorageMultisample(t.RENDERBUFFER,Ie,ye,C.width,C.height),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+he,t.RENDERBUFFER,j.__webglColorRenderbuffer[he])}t.bindRenderbuffer(t.RENDERBUFFER,null),C.depthBuffer&&(j.__webglDepthRenderbuffer=t.createRenderbuffer(),ue(j.__webglDepthRenderbuffer,C,!0)),n.bindFramebuffer(t.FRAMEBUFFER,null)}}if($){n.bindTexture(t.TEXTURE_CUBE_MAP,Z.__webglTexture),z(t.TEXTURE_CUBE_MAP,M);for(let he=0;he<6;he++)if(M.mipmaps&&M.mipmaps.length>0)for(let ve=0;ve<M.mipmaps.length;ve++)re(j.__webglFramebuffer[he][ve],C,M,t.COLOR_ATTACHMENT0,t.TEXTURE_CUBE_MAP_POSITIVE_X+he,ve);else re(j.__webglFramebuffer[he],C,M,t.COLOR_ATTACHMENT0,t.TEXTURE_CUBE_MAP_POSITIVE_X+he,0);m(M)&&d(t.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(Me){for(let he=0,ve=ie.length;he<ve;he++){const Xe=ie[he],oe=i.get(Xe);n.bindTexture(t.TEXTURE_2D,oe.__webglTexture),z(t.TEXTURE_2D,Xe),re(j.__webglFramebuffer,C,Xe,t.COLOR_ATTACHMENT0+he,t.TEXTURE_2D,0),m(Xe)&&d(t.TEXTURE_2D)}n.unbindTexture()}else{let he=t.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(he=C.isWebGL3DRenderTarget?t.TEXTURE_3D:t.TEXTURE_2D_ARRAY),n.bindTexture(he,Z.__webglTexture),z(he,M),M.mipmaps&&M.mipmaps.length>0)for(let ve=0;ve<M.mipmaps.length;ve++)re(j.__webglFramebuffer[ve],C,M,t.COLOR_ATTACHMENT0,he,ve);else re(j.__webglFramebuffer,C,M,t.COLOR_ATTACHMENT0,he,0);m(M)&&d(he),n.unbindTexture()}C.depthBuffer&&Le(C)}function Qe(C){const M=C.textures;for(let j=0,Z=M.length;j<Z;j++){const ie=M[j];if(m(ie)){const $=C.isWebGLCubeRenderTarget?t.TEXTURE_CUBE_MAP:t.TEXTURE_2D,Me=i.get(ie).__webglTexture;n.bindTexture($,Me),d($),n.unbindTexture()}}}const Be=[],P=[];function Vt(C){if(C.samples>0){if(Ve(C)===!1){const M=C.textures,j=C.width,Z=C.height;let ie=t.COLOR_BUFFER_BIT;const $=C.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,Me=i.get(C),he=M.length>1;if(he)for(let ve=0;ve<M.length;ve++)n.bindFramebuffer(t.FRAMEBUFFER,Me.__webglMultisampledFramebuffer),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+ve,t.RENDERBUFFER,null),n.bindFramebuffer(t.FRAMEBUFFER,Me.__webglFramebuffer),t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0+ve,t.TEXTURE_2D,null,0);n.bindFramebuffer(t.READ_FRAMEBUFFER,Me.__webglMultisampledFramebuffer),n.bindFramebuffer(t.DRAW_FRAMEBUFFER,Me.__webglFramebuffer);for(let ve=0;ve<M.length;ve++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(ie|=t.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(ie|=t.STENCIL_BUFFER_BIT)),he){t.framebufferRenderbuffer(t.READ_FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.RENDERBUFFER,Me.__webglColorRenderbuffer[ve]);const Xe=i.get(M[ve]).__webglTexture;t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,Xe,0)}t.blitFramebuffer(0,0,j,Z,0,0,j,Z,ie,t.NEAREST),c===!0&&(Be.length=0,P.length=0,Be.push(t.COLOR_ATTACHMENT0+ve),C.depthBuffer&&C.resolveDepthBuffer===!1&&(Be.push($),P.push($),t.invalidateFramebuffer(t.DRAW_FRAMEBUFFER,P)),t.invalidateFramebuffer(t.READ_FRAMEBUFFER,Be))}if(n.bindFramebuffer(t.READ_FRAMEBUFFER,null),n.bindFramebuffer(t.DRAW_FRAMEBUFFER,null),he)for(let ve=0;ve<M.length;ve++){n.bindFramebuffer(t.FRAMEBUFFER,Me.__webglMultisampledFramebuffer),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+ve,t.RENDERBUFFER,Me.__webglColorRenderbuffer[ve]);const Xe=i.get(M[ve]).__webglTexture;n.bindFramebuffer(t.FRAMEBUFFER,Me.__webglFramebuffer),t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0+ve,t.TEXTURE_2D,Xe,0)}n.bindFramebuffer(t.DRAW_FRAMEBUFFER,Me.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.resolveDepthBuffer===!1&&c){const M=C.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT;t.invalidateFramebuffer(t.DRAW_FRAMEBUFFER,[M])}}}function He(C){return Math.min(r.maxSamples,C.samples)}function Ve(C){const M=i.get(C);return C.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&M.__useRenderToTexture!==!1}function ke(C){const M=a.render.frame;f.get(C)!==M&&(f.set(C,M),C.update())}function rt(C,M){const j=C.colorSpace,Z=C.format,ie=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||j!==tr&&j!==Ii&&(tt.getTransfer(j)===ct?(Z!==Bn||ie!==_i)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",j)),M}function Pe(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(u.width=C.naturalWidth||C.width,u.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(u.width=C.displayWidth,u.height=C.displayHeight):(u.width=C.width,u.height=C.height),u}this.allocateTextureUnit=O,this.resetTextureUnits=b,this.setTexture2D=q,this.setTexture2DArray=Q,this.setTexture3D=W,this.setTextureCube=Y,this.rebindTextures=De,this.setupRenderTarget=We,this.updateRenderTargetMipmap=Qe,this.updateMultisampleRenderTarget=Vt,this.setupDepthRenderbuffer=Le,this.setupFrameBufferTexture=re,this.useMultisampledRTT=Ve}function r2(t,e){function n(i,r=Ii){let s;const a=tt.getTransfer(r);if(i===_i)return t.UNSIGNED_BYTE;if(i===Xh)return t.UNSIGNED_SHORT_4_4_4_4;if(i===qh)return t.UNSIGNED_SHORT_5_5_5_1;if(i===dg)return t.UNSIGNED_INT_5_9_9_9_REV;if(i===cg)return t.BYTE;if(i===ug)return t.SHORT;if(i===Ua)return t.UNSIGNED_SHORT;if(i===Wh)return t.INT;if(i===Cr)return t.UNSIGNED_INT;if(i===di)return t.FLOAT;if(i===Va)return t.HALF_FLOAT;if(i===hg)return t.ALPHA;if(i===fg)return t.RGB;if(i===Bn)return t.RGBA;if(i===pg)return t.LUMINANCE;if(i===mg)return t.LUMINANCE_ALPHA;if(i===ms)return t.DEPTH_COMPONENT;if(i===Ls)return t.DEPTH_STENCIL;if(i===xg)return t.RED;if(i===$h)return t.RED_INTEGER;if(i===gg)return t.RG;if(i===Yh)return t.RG_INTEGER;if(i===Kh)return t.RGBA_INTEGER;if(i===Yo||i===Ko||i===Zo||i===Qo)if(a===ct)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(i===Yo)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Ko)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Zo)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Qo)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(i===Yo)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Ko)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Zo)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Qo)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===yd||i===Sd||i===wd||i===Md)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(i===yd)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Sd)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===wd)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Md)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===bd||i===Ed||i===Td)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(i===bd||i===Ed)return a===ct?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(i===Td)return a===ct?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===Ad||i===Cd||i===Nd||i===Rd||i===Pd||i===Ld||i===Dd||i===kd||i===Id||i===Ud||i===Fd||i===Od||i===zd||i===jd)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(i===Ad)return a===ct?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Cd)return a===ct?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Nd)return a===ct?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Rd)return a===ct?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===Pd)return a===ct?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Ld)return a===ct?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Dd)return a===ct?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===kd)return a===ct?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Id)return a===ct?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Ud)return a===ct?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Fd)return a===ct?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Od)return a===ct?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===zd)return a===ct?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===jd)return a===ct?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Jo||i===Bd||i===Hd)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(i===Jo)return a===ct?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Bd)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===Hd)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===vg||i===Vd||i===Gd||i===Wd)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(i===Jo)return s.COMPRESSED_RED_RGTC1_EXT;if(i===Vd)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Gd)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Wd)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===Ps?t.UNSIGNED_INT_24_8:t[i]!==void 0?t[i]:null}return{convert:n}}class s2 extends fn{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class oa extends Yt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const a2={type:"move"};class su{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new oa,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new oa,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new U,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new U),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new oa,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new U,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new U),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const n=this._hand;if(n)for(const i of e.hand.values())this._getHandJoint(n,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,n,i){let r=null,s=null,a=null;const o=this._targetRay,c=this._grip,u=this._hand;if(e&&n.session.visibilityState!=="visible-blurred"){if(u&&e.hand){a=!0;for(const S of e.hand.values()){const m=n.getJointPose(S,i),d=this._getHandJoint(u,S);m!==null&&(d.matrix.fromArray(m.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,d.jointRadius=m.radius),d.visible=m!==null}const f=u.joints["index-finger-tip"],p=u.joints["thumb-tip"],h=f.position.distanceTo(p.position),x=.02,_=.005;u.inputState.pinching&&h>x+_?(u.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!u.inputState.pinching&&h<=x-_&&(u.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(s=n.getPose(e.gripSpace,i),s!==null&&(c.matrix.fromArray(s.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,s.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(s.linearVelocity)):c.hasLinearVelocity=!1,s.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(s.angularVelocity)):c.hasAngularVelocity=!1));o!==null&&(r=n.getPose(e.targetRaySpace,i),r===null&&s!==null&&(r=s),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(a2)))}return o!==null&&(o.visible=r!==null),c!==null&&(c.visible=s!==null),u!==null&&(u.visible=a!==null),this}_getHandJoint(e,n){if(e.joints[n.jointName]===void 0){const i=new oa;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[n.jointName]=i,e.add(i)}return e.joints[n.jointName]}}const o2=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,l2=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class c2{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,n,i){if(this.texture===null){const r=new $t,s=e.properties.get(r);s.__webglTexture=n.texture,(n.depthNear!=i.depthNear||n.depthFar!=i.depthFar)&&(this.depthNear=n.depthNear,this.depthFar=n.depthFar),this.texture=r}}getMesh(e){if(this.texture!==null&&this.mesh===null){const n=e.cameras[0].viewport,i=new Zi({vertexShader:o2,fragmentShader:l2,uniforms:{depthColor:{value:this.texture},depthWidth:{value:n.z},depthHeight:{value:n.w}}});this.mesh=new zt(new ks(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class u2 extends Os{constructor(e,n){super();const i=this;let r=null,s=1,a=null,o="local-floor",c=1,u=null,f=null,p=null,h=null,x=null,_=null;const S=new c2,m=n.getContextAttributes();let d=null,g=null;const v=[],w=[],R=new $e;let E=null;const A=new fn;A.layers.enable(1),A.viewport=new st;const N=new fn;N.layers.enable(2),N.viewport=new st;const F=[A,N],y=new s2;y.layers.enable(1),y.layers.enable(2);let b=null,O=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(G){let re=v[G];return re===void 0&&(re=new su,v[G]=re),re.getTargetRaySpace()},this.getControllerGrip=function(G){let re=v[G];return re===void 0&&(re=new su,v[G]=re),re.getGripSpace()},this.getHand=function(G){let re=v[G];return re===void 0&&(re=new su,v[G]=re),re.getHandSpace()};function V(G){const re=w.indexOf(G.inputSource);if(re===-1)return;const ue=v[re];ue!==void 0&&(ue.update(G.inputSource,G.frame,u||a),ue.dispatchEvent({type:G.type,data:G.inputSource}))}function q(){r.removeEventListener("select",V),r.removeEventListener("selectstart",V),r.removeEventListener("selectend",V),r.removeEventListener("squeeze",V),r.removeEventListener("squeezestart",V),r.removeEventListener("squeezeend",V),r.removeEventListener("end",q),r.removeEventListener("inputsourceschange",Q);for(let G=0;G<v.length;G++){const re=w[G];re!==null&&(w[G]=null,v[G].disconnect(re))}b=null,O=null,S.reset(),e.setRenderTarget(d),x=null,h=null,p=null,r=null,g=null,Ae.stop(),i.isPresenting=!1,e.setPixelRatio(E),e.setSize(R.width,R.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(G){s=G,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(G){o=G,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return u||a},this.setReferenceSpace=function(G){u=G},this.getBaseLayer=function(){return h!==null?h:x},this.getBinding=function(){return p},this.getFrame=function(){return _},this.getSession=function(){return r},this.setSession=async function(G){if(r=G,r!==null){if(d=e.getRenderTarget(),r.addEventListener("select",V),r.addEventListener("selectstart",V),r.addEventListener("selectend",V),r.addEventListener("squeeze",V),r.addEventListener("squeezestart",V),r.addEventListener("squeezeend",V),r.addEventListener("end",q),r.addEventListener("inputsourceschange",Q),m.xrCompatible!==!0&&await n.makeXRCompatible(),E=e.getPixelRatio(),e.getSize(R),r.renderState.layers===void 0){const re={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:s};x=new XRWebGLLayer(r,n,re),r.updateRenderState({baseLayer:x}),e.setPixelRatio(1),e.setSize(x.framebufferWidth,x.framebufferHeight,!1),g=new Nr(x.framebufferWidth,x.framebufferHeight,{format:Bn,type:_i,colorSpace:e.outputColorSpace,stencilBuffer:m.stencil})}else{let re=null,ue=null,me=null;m.depth&&(me=m.stencil?n.DEPTH24_STENCIL8:n.DEPTH_COMPONENT24,re=m.stencil?Ls:ms,ue=m.stencil?Ps:Cr);const Le={colorFormat:n.RGBA8,depthFormat:me,scaleFactor:s};p=new XRWebGLBinding(r,n),h=p.createProjectionLayer(Le),r.updateRenderState({layers:[h]}),e.setPixelRatio(1),e.setSize(h.textureWidth,h.textureHeight,!1),g=new Nr(h.textureWidth,h.textureHeight,{format:Bn,type:_i,depthTexture:new Pg(h.textureWidth,h.textureHeight,ue,void 0,void 0,void 0,void 0,void 0,void 0,re),stencilBuffer:m.stencil,colorSpace:e.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1})}g.isXRRenderTarget=!0,this.setFoveation(c),u=null,a=await r.requestReferenceSpace(o),Ae.setContext(r),Ae.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return S.getDepthTexture()};function Q(G){for(let re=0;re<G.removed.length;re++){const ue=G.removed[re],me=w.indexOf(ue);me>=0&&(w[me]=null,v[me].disconnect(ue))}for(let re=0;re<G.added.length;re++){const ue=G.added[re];let me=w.indexOf(ue);if(me===-1){for(let De=0;De<v.length;De++)if(De>=w.length){w.push(ue),me=De;break}else if(w[De]===null){w[De]=ue,me=De;break}if(me===-1)break}const Le=v[me];Le&&Le.connect(ue)}}const W=new U,Y=new U;function D(G,re,ue){W.setFromMatrixPosition(re.matrixWorld),Y.setFromMatrixPosition(ue.matrixWorld);const me=W.distanceTo(Y),Le=re.projectionMatrix.elements,De=ue.projectionMatrix.elements,We=Le[14]/(Le[10]-1),Qe=Le[14]/(Le[10]+1),Be=(Le[9]+1)/Le[5],P=(Le[9]-1)/Le[5],Vt=(Le[8]-1)/Le[0],He=(De[8]+1)/De[0],Ve=We*Vt,ke=We*He,rt=me/(-Vt+He),Pe=rt*-Vt;if(re.matrixWorld.decompose(G.position,G.quaternion,G.scale),G.translateX(Pe),G.translateZ(rt),G.matrixWorld.compose(G.position,G.quaternion,G.scale),G.matrixWorldInverse.copy(G.matrixWorld).invert(),Le[10]===-1)G.projectionMatrix.copy(re.projectionMatrix),G.projectionMatrixInverse.copy(re.projectionMatrixInverse);else{const C=We+rt,M=Qe+rt,j=Ve-Pe,Z=ke+(me-Pe),ie=Be*Qe/M*C,$=P*Qe/M*C;G.projectionMatrix.makePerspective(j,Z,ie,$,C,M),G.projectionMatrixInverse.copy(G.projectionMatrix).invert()}}function J(G,re){re===null?G.matrixWorld.copy(G.matrix):G.matrixWorld.multiplyMatrices(re.matrixWorld,G.matrix),G.matrixWorldInverse.copy(G.matrixWorld).invert()}this.updateCamera=function(G){if(r===null)return;let re=G.near,ue=G.far;S.texture!==null&&(S.depthNear>0&&(re=S.depthNear),S.depthFar>0&&(ue=S.depthFar)),y.near=N.near=A.near=re,y.far=N.far=A.far=ue,(b!==y.near||O!==y.far)&&(r.updateRenderState({depthNear:y.near,depthFar:y.far}),b=y.near,O=y.far);const me=G.parent,Le=y.cameras;J(y,me);for(let De=0;De<Le.length;De++)J(Le[De],me);Le.length===2?D(y,A,N):y.projectionMatrix.copy(A.projectionMatrix),ee(G,y,me)};function ee(G,re,ue){ue===null?G.matrix.copy(re.matrixWorld):(G.matrix.copy(ue.matrixWorld),G.matrix.invert(),G.matrix.multiply(re.matrixWorld)),G.matrix.decompose(G.position,G.quaternion,G.scale),G.updateMatrixWorld(!0),G.projectionMatrix.copy(re.projectionMatrix),G.projectionMatrixInverse.copy(re.projectionMatrixInverse),G.isPerspectiveCamera&&(G.fov=Xd*2*Math.atan(1/G.projectionMatrix.elements[5]),G.zoom=1)}this.getCamera=function(){return y},this.getFoveation=function(){if(!(h===null&&x===null))return c},this.setFoveation=function(G){c=G,h!==null&&(h.fixedFoveation=G),x!==null&&x.fixedFoveation!==void 0&&(x.fixedFoveation=G)},this.hasDepthSensing=function(){return S.texture!==null},this.getDepthSensingMesh=function(){return S.getMesh(y)};let z=null;function le(G,re){if(f=re.getViewerPose(u||a),_=re,f!==null){const ue=f.views;x!==null&&(e.setRenderTargetFramebuffer(g,x.framebuffer),e.setRenderTarget(g));let me=!1;ue.length!==y.cameras.length&&(y.cameras.length=0,me=!0);for(let De=0;De<ue.length;De++){const We=ue[De];let Qe=null;if(x!==null)Qe=x.getViewport(We);else{const P=p.getViewSubImage(h,We);Qe=P.viewport,De===0&&(e.setRenderTargetTextures(g,P.colorTexture,h.ignoreDepthValues?void 0:P.depthStencilTexture),e.setRenderTarget(g))}let Be=F[De];Be===void 0&&(Be=new fn,Be.layers.enable(De),Be.viewport=new st,F[De]=Be),Be.matrix.fromArray(We.transform.matrix),Be.matrix.decompose(Be.position,Be.quaternion,Be.scale),Be.projectionMatrix.fromArray(We.projectionMatrix),Be.projectionMatrixInverse.copy(Be.projectionMatrix).invert(),Be.viewport.set(Qe.x,Qe.y,Qe.width,Qe.height),De===0&&(y.matrix.copy(Be.matrix),y.matrix.decompose(y.position,y.quaternion,y.scale)),me===!0&&y.cameras.push(Be)}const Le=r.enabledFeatures;if(Le&&Le.includes("depth-sensing")){const De=p.getDepthInformation(ue[0]);De&&De.isValid&&De.texture&&S.init(e,De,r.renderState)}}for(let ue=0;ue<v.length;ue++){const me=w[ue],Le=v[ue];me!==null&&Le!==void 0&&Le.update(me,re,u||a)}z&&z(G,re),re.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:re}),_=null}const Ae=new Rg;Ae.setAnimationLoop(le),this.setAnimationLoop=function(G){z=G},this.dispose=function(){}}}const lr=new Qn,d2=new dt;function h2(t,e){function n(m,d){m.matrixAutoUpdate===!0&&m.updateMatrix(),d.value.copy(m.matrix)}function i(m,d){d.color.getRGB(m.fogColor.value,Ag(t)),d.isFog?(m.fogNear.value=d.near,m.fogFar.value=d.far):d.isFogExp2&&(m.fogDensity.value=d.density)}function r(m,d,g,v,w){d.isMeshBasicMaterial||d.isMeshLambertMaterial?s(m,d):d.isMeshToonMaterial?(s(m,d),p(m,d)):d.isMeshPhongMaterial?(s(m,d),f(m,d)):d.isMeshStandardMaterial?(s(m,d),h(m,d),d.isMeshPhysicalMaterial&&x(m,d,w)):d.isMeshMatcapMaterial?(s(m,d),_(m,d)):d.isMeshDepthMaterial?s(m,d):d.isMeshDistanceMaterial?(s(m,d),S(m,d)):d.isMeshNormalMaterial?s(m,d):d.isLineBasicMaterial?(a(m,d),d.isLineDashedMaterial&&o(m,d)):d.isPointsMaterial?c(m,d,g,v):d.isSpriteMaterial?u(m,d):d.isShadowMaterial?(m.color.value.copy(d.color),m.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function s(m,d){m.opacity.value=d.opacity,d.color&&m.diffuse.value.copy(d.color),d.emissive&&m.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(m.map.value=d.map,n(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,n(d.alphaMap,m.alphaMapTransform)),d.bumpMap&&(m.bumpMap.value=d.bumpMap,n(d.bumpMap,m.bumpMapTransform),m.bumpScale.value=d.bumpScale,d.side===qt&&(m.bumpScale.value*=-1)),d.normalMap&&(m.normalMap.value=d.normalMap,n(d.normalMap,m.normalMapTransform),m.normalScale.value.copy(d.normalScale),d.side===qt&&m.normalScale.value.negate()),d.displacementMap&&(m.displacementMap.value=d.displacementMap,n(d.displacementMap,m.displacementMapTransform),m.displacementScale.value=d.displacementScale,m.displacementBias.value=d.displacementBias),d.emissiveMap&&(m.emissiveMap.value=d.emissiveMap,n(d.emissiveMap,m.emissiveMapTransform)),d.specularMap&&(m.specularMap.value=d.specularMap,n(d.specularMap,m.specularMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest);const g=e.get(d),v=g.envMap,w=g.envMapRotation;v&&(m.envMap.value=v,lr.copy(w),lr.x*=-1,lr.y*=-1,lr.z*=-1,v.isCubeTexture&&v.isRenderTargetTexture===!1&&(lr.y*=-1,lr.z*=-1),m.envMapRotation.value.setFromMatrix4(d2.makeRotationFromEuler(lr)),m.flipEnvMap.value=v.isCubeTexture&&v.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=d.reflectivity,m.ior.value=d.ior,m.refractionRatio.value=d.refractionRatio),d.lightMap&&(m.lightMap.value=d.lightMap,m.lightMapIntensity.value=d.lightMapIntensity,n(d.lightMap,m.lightMapTransform)),d.aoMap&&(m.aoMap.value=d.aoMap,m.aoMapIntensity.value=d.aoMapIntensity,n(d.aoMap,m.aoMapTransform))}function a(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,d.map&&(m.map.value=d.map,n(d.map,m.mapTransform))}function o(m,d){m.dashSize.value=d.dashSize,m.totalSize.value=d.dashSize+d.gapSize,m.scale.value=d.scale}function c(m,d,g,v){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.size.value=d.size*g,m.scale.value=v*.5,d.map&&(m.map.value=d.map,n(d.map,m.uvTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,n(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function u(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.rotation.value=d.rotation,d.map&&(m.map.value=d.map,n(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,n(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function f(m,d){m.specular.value.copy(d.specular),m.shininess.value=Math.max(d.shininess,1e-4)}function p(m,d){d.gradientMap&&(m.gradientMap.value=d.gradientMap)}function h(m,d){m.metalness.value=d.metalness,d.metalnessMap&&(m.metalnessMap.value=d.metalnessMap,n(d.metalnessMap,m.metalnessMapTransform)),m.roughness.value=d.roughness,d.roughnessMap&&(m.roughnessMap.value=d.roughnessMap,n(d.roughnessMap,m.roughnessMapTransform)),d.envMap&&(m.envMapIntensity.value=d.envMapIntensity)}function x(m,d,g){m.ior.value=d.ior,d.sheen>0&&(m.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),m.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(m.sheenColorMap.value=d.sheenColorMap,n(d.sheenColorMap,m.sheenColorMapTransform)),d.sheenRoughnessMap&&(m.sheenRoughnessMap.value=d.sheenRoughnessMap,n(d.sheenRoughnessMap,m.sheenRoughnessMapTransform))),d.clearcoat>0&&(m.clearcoat.value=d.clearcoat,m.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(m.clearcoatMap.value=d.clearcoatMap,n(d.clearcoatMap,m.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,n(d.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(m.clearcoatNormalMap.value=d.clearcoatNormalMap,n(d.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===qt&&m.clearcoatNormalScale.value.negate())),d.dispersion>0&&(m.dispersion.value=d.dispersion),d.iridescence>0&&(m.iridescence.value=d.iridescence,m.iridescenceIOR.value=d.iridescenceIOR,m.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap&&(m.iridescenceMap.value=d.iridescenceMap,n(d.iridescenceMap,m.iridescenceMapTransform)),d.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=d.iridescenceThicknessMap,n(d.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),d.transmission>0&&(m.transmission.value=d.transmission,m.transmissionSamplerMap.value=g.texture,m.transmissionSamplerSize.value.set(g.width,g.height),d.transmissionMap&&(m.transmissionMap.value=d.transmissionMap,n(d.transmissionMap,m.transmissionMapTransform)),m.thickness.value=d.thickness,d.thicknessMap&&(m.thicknessMap.value=d.thicknessMap,n(d.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=d.attenuationDistance,m.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(m.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(m.anisotropyMap.value=d.anisotropyMap,n(d.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=d.specularIntensity,m.specularColor.value.copy(d.specularColor),d.specularColorMap&&(m.specularColorMap.value=d.specularColorMap,n(d.specularColorMap,m.specularColorMapTransform)),d.specularIntensityMap&&(m.specularIntensityMap.value=d.specularIntensityMap,n(d.specularIntensityMap,m.specularIntensityMapTransform))}function _(m,d){d.matcap&&(m.matcap.value=d.matcap)}function S(m,d){const g=e.get(d).light;m.referencePosition.value.setFromMatrixPosition(g.matrixWorld),m.nearDistance.value=g.shadow.camera.near,m.farDistance.value=g.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:r}}function f2(t,e,n,i){let r={},s={},a=[];const o=t.getParameter(t.MAX_UNIFORM_BUFFER_BINDINGS);function c(g,v){const w=v.program;i.uniformBlockBinding(g,w)}function u(g,v){let w=r[g.id];w===void 0&&(_(g),w=f(g),r[g.id]=w,g.addEventListener("dispose",m));const R=v.program;i.updateUBOMapping(g,R);const E=e.render.frame;s[g.id]!==E&&(h(g),s[g.id]=E)}function f(g){const v=p();g.__bindingPointIndex=v;const w=t.createBuffer(),R=g.__size,E=g.usage;return t.bindBuffer(t.UNIFORM_BUFFER,w),t.bufferData(t.UNIFORM_BUFFER,R,E),t.bindBuffer(t.UNIFORM_BUFFER,null),t.bindBufferBase(t.UNIFORM_BUFFER,v,w),w}function p(){for(let g=0;g<o;g++)if(a.indexOf(g)===-1)return a.push(g),g;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function h(g){const v=r[g.id],w=g.uniforms,R=g.__cache;t.bindBuffer(t.UNIFORM_BUFFER,v);for(let E=0,A=w.length;E<A;E++){const N=Array.isArray(w[E])?w[E]:[w[E]];for(let F=0,y=N.length;F<y;F++){const b=N[F];if(x(b,E,F,R)===!0){const O=b.__offset,V=Array.isArray(b.value)?b.value:[b.value];let q=0;for(let Q=0;Q<V.length;Q++){const W=V[Q],Y=S(W);typeof W=="number"||typeof W=="boolean"?(b.__data[0]=W,t.bufferSubData(t.UNIFORM_BUFFER,O+q,b.__data)):W.isMatrix3?(b.__data[0]=W.elements[0],b.__data[1]=W.elements[1],b.__data[2]=W.elements[2],b.__data[3]=0,b.__data[4]=W.elements[3],b.__data[5]=W.elements[4],b.__data[6]=W.elements[5],b.__data[7]=0,b.__data[8]=W.elements[6],b.__data[9]=W.elements[7],b.__data[10]=W.elements[8],b.__data[11]=0):(W.toArray(b.__data,q),q+=Y.storage/Float32Array.BYTES_PER_ELEMENT)}t.bufferSubData(t.UNIFORM_BUFFER,O,b.__data)}}}t.bindBuffer(t.UNIFORM_BUFFER,null)}function x(g,v,w,R){const E=g.value,A=v+"_"+w;if(R[A]===void 0)return typeof E=="number"||typeof E=="boolean"?R[A]=E:R[A]=E.clone(),!0;{const N=R[A];if(typeof E=="number"||typeof E=="boolean"){if(N!==E)return R[A]=E,!0}else if(N.equals(E)===!1)return N.copy(E),!0}return!1}function _(g){const v=g.uniforms;let w=0;const R=16;for(let A=0,N=v.length;A<N;A++){const F=Array.isArray(v[A])?v[A]:[v[A]];for(let y=0,b=F.length;y<b;y++){const O=F[y],V=Array.isArray(O.value)?O.value:[O.value];for(let q=0,Q=V.length;q<Q;q++){const W=V[q],Y=S(W),D=w%R,J=D%Y.boundary,ee=D+J;w+=J,ee!==0&&R-ee<Y.storage&&(w+=R-ee),O.__data=new Float32Array(Y.storage/Float32Array.BYTES_PER_ELEMENT),O.__offset=w,w+=Y.storage}}}const E=w%R;return E>0&&(w+=R-E),g.__size=w,g.__cache={},this}function S(g){const v={boundary:0,storage:0};return typeof g=="number"||typeof g=="boolean"?(v.boundary=4,v.storage=4):g.isVector2?(v.boundary=8,v.storage=8):g.isVector3||g.isColor?(v.boundary=16,v.storage=12):g.isVector4?(v.boundary=16,v.storage=16):g.isMatrix3?(v.boundary=48,v.storage=48):g.isMatrix4?(v.boundary=64,v.storage=64):g.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",g),v}function m(g){const v=g.target;v.removeEventListener("dispose",m);const w=a.indexOf(v.__bindingPointIndex);a.splice(w,1),t.deleteBuffer(r[v.id]),delete r[v.id],delete s[v.id]}function d(){for(const g in r)t.deleteBuffer(r[g]);a=[],r={},s={}}return{bind:c,update:u,dispose:d}}class p2{constructor(e={}){const{canvas:n=eS(),context:i=null,depth:r=!0,stencil:s=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:u=!1,powerPreference:f="default",failIfMajorPerformanceCaveat:p=!1}=e;this.isWebGLRenderer=!0;let h;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");h=i.getContextAttributes().alpha}else h=a;const x=new Uint32Array(4),_=new Int32Array(4);let S=null,m=null;const d=[],g=[];this.domElement=n,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=qn,this.toneMapping=qi,this.toneMappingExposure=1;const v=this;let w=!1,R=0,E=0,A=null,N=-1,F=null;const y=new st,b=new st;let O=null;const V=new Ye(0);let q=0,Q=n.width,W=n.height,Y=1,D=null,J=null;const ee=new st(0,0,Q,W),z=new st(0,0,Q,W);let le=!1;const Ae=new ef;let G=!1,re=!1;const ue=new dt,me=new dt,Le=new U,De=new st,We={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Qe=!1;function Be(){return A===null?Y:1}let P=i;function Vt(T,k){return n.getContext(T,k)}try{const T={alpha:!0,depth:r,stencil:s,antialias:o,premultipliedAlpha:c,preserveDrawingBuffer:u,powerPreference:f,failIfMajorPerformanceCaveat:p};if("setAttribute"in n&&n.setAttribute("data-engine",`three.js r${Gh}`),n.addEventListener("webglcontextlost",K,!1),n.addEventListener("webglcontextrestored",xe,!1),n.addEventListener("webglcontextcreationerror",de,!1),P===null){const k="webgl2";if(P=Vt(k,T),P===null)throw Vt(k)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(T){throw console.error("THREE.WebGLRenderer: "+T.message),T}let He,Ve,ke,rt,Pe,C,M,j,Z,ie,$,Me,he,ve,Xe,oe,ye,Ie,te,se,Re,Ne,Oe,L;function fe(){He=new _b(P),He.init(),Ne=new r2(P,He),Ve=new hb(P,He,e,Ne),ke=new t2(P),Ve.reverseDepthBuffer&&ke.buffers.depth.setReversed(!0),rt=new wb(P),Pe=new jE,C=new i2(P,He,ke,Pe,Ve,Ne,rt),M=new pb(v),j=new vb(v),Z=new CS(P),Oe=new ub(P,Z),ie=new yb(P,Z,rt,Oe),$=new bb(P,ie,Z,rt),te=new Mb(P,Ve,C),oe=new fb(Pe),Me=new zE(v,M,j,He,Ve,Oe,oe),he=new h2(v,Pe),ve=new HE,Xe=new $E(He),Ie=new cb(v,M,j,ke,$,h,c),ye=new JE(v,$,Ve),L=new f2(P,rt,Ve,ke),se=new db(P,He,rt),Re=new Sb(P,He,rt),rt.programs=Me.programs,v.capabilities=Ve,v.extensions=He,v.properties=Pe,v.renderLists=ve,v.shadowMap=ye,v.state=ke,v.info=rt}fe();const X=new u2(v,P);this.xr=X,this.getContext=function(){return P},this.getContextAttributes=function(){return P.getContextAttributes()},this.forceContextLoss=function(){const T=He.get("WEBGL_lose_context");T&&T.loseContext()},this.forceContextRestore=function(){const T=He.get("WEBGL_lose_context");T&&T.restoreContext()},this.getPixelRatio=function(){return Y},this.setPixelRatio=function(T){T!==void 0&&(Y=T,this.setSize(Q,W,!1))},this.getSize=function(T){return T.set(Q,W)},this.setSize=function(T,k,B=!0){if(X.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}Q=T,W=k,n.width=Math.floor(T*Y),n.height=Math.floor(k*Y),B===!0&&(n.style.width=T+"px",n.style.height=k+"px"),this.setViewport(0,0,T,k)},this.getDrawingBufferSize=function(T){return T.set(Q*Y,W*Y).floor()},this.setDrawingBufferSize=function(T,k,B){Q=T,W=k,Y=B,n.width=Math.floor(T*B),n.height=Math.floor(k*B),this.setViewport(0,0,T,k)},this.getCurrentViewport=function(T){return T.copy(y)},this.getViewport=function(T){return T.copy(ee)},this.setViewport=function(T,k,B,H){T.isVector4?ee.set(T.x,T.y,T.z,T.w):ee.set(T,k,B,H),ke.viewport(y.copy(ee).multiplyScalar(Y).round())},this.getScissor=function(T){return T.copy(z)},this.setScissor=function(T,k,B,H){T.isVector4?z.set(T.x,T.y,T.z,T.w):z.set(T,k,B,H),ke.scissor(b.copy(z).multiplyScalar(Y).round())},this.getScissorTest=function(){return le},this.setScissorTest=function(T){ke.setScissorTest(le=T)},this.setOpaqueSort=function(T){D=T},this.setTransparentSort=function(T){J=T},this.getClearColor=function(T){return T.copy(Ie.getClearColor())},this.setClearColor=function(){Ie.setClearColor.apply(Ie,arguments)},this.getClearAlpha=function(){return Ie.getClearAlpha()},this.setClearAlpha=function(){Ie.setClearAlpha.apply(Ie,arguments)},this.clear=function(T=!0,k=!0,B=!0){let H=0;if(T){let I=!1;if(A!==null){const ce=A.texture.format;I=ce===Kh||ce===Yh||ce===$h}if(I){const ce=A.texture.type,ge=ce===_i||ce===Cr||ce===Ua||ce===Ps||ce===Xh||ce===qh,Se=Ie.getClearColor(),be=Ie.getClearAlpha(),Ue=Se.r,Fe=Se.g,Te=Se.b;ge?(x[0]=Ue,x[1]=Fe,x[2]=Te,x[3]=be,P.clearBufferuiv(P.COLOR,0,x)):(_[0]=Ue,_[1]=Fe,_[2]=Te,_[3]=be,P.clearBufferiv(P.COLOR,0,_))}else H|=P.COLOR_BUFFER_BIT}k&&(H|=P.DEPTH_BUFFER_BIT,P.clearDepth(this.capabilities.reverseDepthBuffer?0:1)),B&&(H|=P.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),P.clear(H)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){n.removeEventListener("webglcontextlost",K,!1),n.removeEventListener("webglcontextrestored",xe,!1),n.removeEventListener("webglcontextcreationerror",de,!1),ve.dispose(),Xe.dispose(),Pe.dispose(),M.dispose(),j.dispose(),$.dispose(),Oe.dispose(),L.dispose(),Me.dispose(),X.dispose(),X.removeEventListener("sessionstart",cf),X.removeEventListener("sessionend",uf),nr.stop()};function K(T){T.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),w=!0}function xe(){console.log("THREE.WebGLRenderer: Context Restored."),w=!1;const T=rt.autoReset,k=ye.enabled,B=ye.autoUpdate,H=ye.needsUpdate,I=ye.type;fe(),rt.autoReset=T,ye.enabled=k,ye.autoUpdate=B,ye.needsUpdate=H,ye.type=I}function de(T){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",T.statusMessage)}function qe(T){const k=T.target;k.removeEventListener("dispose",qe),ft(k)}function ft(T){Qt(T),Pe.remove(T)}function Qt(T){const k=Pe.get(T).programs;k!==void 0&&(k.forEach(function(B){Me.releaseProgram(B)}),T.isShaderMaterial&&Me.releaseShaderCache(T))}this.renderBufferDirect=function(T,k,B,H,I,ce){k===null&&(k=We);const ge=I.isMesh&&I.matrixWorld.determinant()<0,Se=zg(T,k,B,H,I);ke.setMaterial(H,ge);let be=B.index,Ue=1;if(H.wireframe===!0){if(be=ie.getWireframeAttribute(B),be===void 0)return;Ue=2}const Fe=B.drawRange,Te=B.attributes.position;let nt=Fe.start*Ue,ot=(Fe.start+Fe.count)*Ue;ce!==null&&(nt=Math.max(nt,ce.start*Ue),ot=Math.min(ot,(ce.start+ce.count)*Ue)),be!==null?(nt=Math.max(nt,0),ot=Math.min(ot,be.count)):Te!=null&&(nt=Math.max(nt,0),ot=Math.min(ot,Te.count));const gt=ot-nt;if(gt<0||gt===1/0)return;Oe.setup(I,H,Se,B,be);let ln,Je=se;if(be!==null&&(ln=Z.get(be),Je=Re,Je.setIndex(ln)),I.isMesh)H.wireframe===!0?(ke.setLineWidth(H.wireframeLinewidth*Be()),Je.setMode(P.LINES)):Je.setMode(P.TRIANGLES);else if(I.isLine){let Ce=H.linewidth;Ce===void 0&&(Ce=1),ke.setLineWidth(Ce*Be()),I.isLineSegments?Je.setMode(P.LINES):I.isLineLoop?Je.setMode(P.LINE_LOOP):Je.setMode(P.LINE_STRIP)}else I.isPoints?Je.setMode(P.POINTS):I.isSprite&&Je.setMode(P.TRIANGLES);if(I.isBatchedMesh)if(I._multiDrawInstances!==null)Je.renderMultiDrawInstances(I._multiDrawStarts,I._multiDrawCounts,I._multiDrawCount,I._multiDrawInstances);else if(He.get("WEBGL_multi_draw"))Je.renderMultiDraw(I._multiDrawStarts,I._multiDrawCounts,I._multiDrawCount);else{const Ce=I._multiDrawStarts,Pt=I._multiDrawCounts,et=I._multiDrawCount,Pn=be?Z.get(be).bytesPerElement:1,Lr=Pe.get(H).currentProgram.getUniforms();for(let cn=0;cn<et;cn++)Lr.setValue(P,"_gl_DrawID",cn),Je.render(Ce[cn]/Pn,Pt[cn])}else if(I.isInstancedMesh)Je.renderInstances(nt,gt,I.count);else if(B.isInstancedBufferGeometry){const Ce=B._maxInstanceCount!==void 0?B._maxInstanceCount:1/0,Pt=Math.min(B.instanceCount,Ce);Je.renderInstances(nt,gt,Pt)}else Je.render(nt,gt)};function Ze(T,k,B){T.transparent===!0&&T.side===zn&&T.forceSinglePass===!1?(T.side=qt,T.needsUpdate=!0,Ya(T,k,B),T.side=Ki,T.needsUpdate=!0,Ya(T,k,B),T.side=zn):Ya(T,k,B)}this.compile=function(T,k,B=null){B===null&&(B=T),m=Xe.get(B),m.init(k),g.push(m),B.traverseVisible(function(I){I.isLight&&I.layers.test(k.layers)&&(m.pushLight(I),I.castShadow&&m.pushShadow(I))}),T!==B&&T.traverseVisible(function(I){I.isLight&&I.layers.test(k.layers)&&(m.pushLight(I),I.castShadow&&m.pushShadow(I))}),m.setupLights();const H=new Set;return T.traverse(function(I){if(!(I.isMesh||I.isPoints||I.isLine||I.isSprite))return;const ce=I.material;if(ce)if(Array.isArray(ce))for(let ge=0;ge<ce.length;ge++){const Se=ce[ge];Ze(Se,B,I),H.add(Se)}else Ze(ce,B,I),H.add(ce)}),g.pop(),m=null,H},this.compileAsync=function(T,k,B=null){const H=this.compile(T,k,B);return new Promise(I=>{function ce(){if(H.forEach(function(ge){Pe.get(ge).currentProgram.isReady()&&H.delete(ge)}),H.size===0){I(T);return}setTimeout(ce,10)}He.get("KHR_parallel_shader_compile")!==null?ce():setTimeout(ce,10)})};let Jt=null;function Jn(T){Jt&&Jt(T)}function cf(){nr.stop()}function uf(){nr.start()}const nr=new Rg;nr.setAnimationLoop(Jn),typeof self<"u"&&nr.setContext(self),this.setAnimationLoop=function(T){Jt=T,X.setAnimationLoop(T),T===null?nr.stop():nr.start()},X.addEventListener("sessionstart",cf),X.addEventListener("sessionend",uf),this.render=function(T,k){if(k!==void 0&&k.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(w===!0)return;if(T.matrixWorldAutoUpdate===!0&&T.updateMatrixWorld(),k.parent===null&&k.matrixWorldAutoUpdate===!0&&k.updateMatrixWorld(),X.enabled===!0&&X.isPresenting===!0&&(X.cameraAutoUpdate===!0&&X.updateCamera(k),k=X.getCamera()),T.isScene===!0&&T.onBeforeRender(v,T,k,A),m=Xe.get(T,g.length),m.init(k),g.push(m),me.multiplyMatrices(k.projectionMatrix,k.matrixWorldInverse),Ae.setFromProjectionMatrix(me),re=this.localClippingEnabled,G=oe.init(this.clippingPlanes,re),S=ve.get(T,d.length),S.init(),d.push(S),X.enabled===!0&&X.isPresenting===!0){const ce=v.xr.getDepthSensingMesh();ce!==null&&Jl(ce,k,-1/0,v.sortObjects)}Jl(T,k,0,v.sortObjects),S.finish(),v.sortObjects===!0&&S.sort(D,J),Qe=X.enabled===!1||X.isPresenting===!1||X.hasDepthSensing()===!1,Qe&&Ie.addToRenderList(S,T),this.info.render.frame++,G===!0&&oe.beginShadows();const B=m.state.shadowsArray;ye.render(B,T,k),G===!0&&oe.endShadows(),this.info.autoReset===!0&&this.info.reset();const H=S.opaque,I=S.transmissive;if(m.setupLights(),k.isArrayCamera){const ce=k.cameras;if(I.length>0)for(let ge=0,Se=ce.length;ge<Se;ge++){const be=ce[ge];hf(H,I,T,be)}Qe&&Ie.render(T);for(let ge=0,Se=ce.length;ge<Se;ge++){const be=ce[ge];df(S,T,be,be.viewport)}}else I.length>0&&hf(H,I,T,k),Qe&&Ie.render(T),df(S,T,k);A!==null&&(C.updateMultisampleRenderTarget(A),C.updateRenderTargetMipmap(A)),T.isScene===!0&&T.onAfterRender(v,T,k),Oe.resetDefaultState(),N=-1,F=null,g.pop(),g.length>0?(m=g[g.length-1],G===!0&&oe.setGlobalState(v.clippingPlanes,m.state.camera)):m=null,d.pop(),d.length>0?S=d[d.length-1]:S=null};function Jl(T,k,B,H){if(T.visible===!1)return;if(T.layers.test(k.layers)){if(T.isGroup)B=T.renderOrder;else if(T.isLOD)T.autoUpdate===!0&&T.update(k);else if(T.isLight)m.pushLight(T),T.castShadow&&m.pushShadow(T);else if(T.isSprite){if(!T.frustumCulled||Ae.intersectsSprite(T)){H&&De.setFromMatrixPosition(T.matrixWorld).applyMatrix4(me);const ge=$.update(T),Se=T.material;Se.visible&&S.push(T,ge,Se,B,De.z,null)}}else if((T.isMesh||T.isLine||T.isPoints)&&(!T.frustumCulled||Ae.intersectsObject(T))){const ge=$.update(T),Se=T.material;if(H&&(T.boundingSphere!==void 0?(T.boundingSphere===null&&T.computeBoundingSphere(),De.copy(T.boundingSphere.center)):(ge.boundingSphere===null&&ge.computeBoundingSphere(),De.copy(ge.boundingSphere.center)),De.applyMatrix4(T.matrixWorld).applyMatrix4(me)),Array.isArray(Se)){const be=ge.groups;for(let Ue=0,Fe=be.length;Ue<Fe;Ue++){const Te=be[Ue],nt=Se[Te.materialIndex];nt&&nt.visible&&S.push(T,ge,nt,B,De.z,Te)}}else Se.visible&&S.push(T,ge,Se,B,De.z,null)}}const ce=T.children;for(let ge=0,Se=ce.length;ge<Se;ge++)Jl(ce[ge],k,B,H)}function df(T,k,B,H){const I=T.opaque,ce=T.transmissive,ge=T.transparent;m.setupLightsView(B),G===!0&&oe.setGlobalState(v.clippingPlanes,B),H&&ke.viewport(y.copy(H)),I.length>0&&$a(I,k,B),ce.length>0&&$a(ce,k,B),ge.length>0&&$a(ge,k,B),ke.buffers.depth.setTest(!0),ke.buffers.depth.setMask(!0),ke.buffers.color.setMask(!0),ke.setPolygonOffset(!1)}function hf(T,k,B,H){if((B.isScene===!0?B.overrideMaterial:null)!==null)return;m.state.transmissionRenderTarget[H.id]===void 0&&(m.state.transmissionRenderTarget[H.id]=new Nr(1,1,{generateMipmaps:!0,type:He.has("EXT_color_buffer_half_float")||He.has("EXT_color_buffer_float")?Va:_i,minFilter:yr,samples:4,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:tt.workingColorSpace}));const ce=m.state.transmissionRenderTarget[H.id],ge=H.viewport||y;ce.setSize(ge.z,ge.w);const Se=v.getRenderTarget();v.setRenderTarget(ce),v.getClearColor(V),q=v.getClearAlpha(),q<1&&v.setClearColor(16777215,.5),v.clear(),Qe&&Ie.render(B);const be=v.toneMapping;v.toneMapping=qi;const Ue=H.viewport;if(H.viewport!==void 0&&(H.viewport=void 0),m.setupLightsView(H),G===!0&&oe.setGlobalState(v.clippingPlanes,H),$a(T,B,H),C.updateMultisampleRenderTarget(ce),C.updateRenderTargetMipmap(ce),He.has("WEBGL_multisampled_render_to_texture")===!1){let Fe=!1;for(let Te=0,nt=k.length;Te<nt;Te++){const ot=k[Te],gt=ot.object,ln=ot.geometry,Je=ot.material,Ce=ot.group;if(Je.side===zn&&gt.layers.test(H.layers)){const Pt=Je.side;Je.side=qt,Je.needsUpdate=!0,ff(gt,B,H,ln,Je,Ce),Je.side=Pt,Je.needsUpdate=!0,Fe=!0}}Fe===!0&&(C.updateMultisampleRenderTarget(ce),C.updateRenderTargetMipmap(ce))}v.setRenderTarget(Se),v.setClearColor(V,q),Ue!==void 0&&(H.viewport=Ue),v.toneMapping=be}function $a(T,k,B){const H=k.isScene===!0?k.overrideMaterial:null;for(let I=0,ce=T.length;I<ce;I++){const ge=T[I],Se=ge.object,be=ge.geometry,Ue=H===null?ge.material:H,Fe=ge.group;Se.layers.test(B.layers)&&ff(Se,k,B,be,Ue,Fe)}}function ff(T,k,B,H,I,ce){T.onBeforeRender(v,k,B,H,I,ce),T.modelViewMatrix.multiplyMatrices(B.matrixWorldInverse,T.matrixWorld),T.normalMatrix.getNormalMatrix(T.modelViewMatrix),I.onBeforeRender(v,k,B,H,T,ce),I.transparent===!0&&I.side===zn&&I.forceSinglePass===!1?(I.side=qt,I.needsUpdate=!0,v.renderBufferDirect(B,k,H,I,T,ce),I.side=Ki,I.needsUpdate=!0,v.renderBufferDirect(B,k,H,I,T,ce),I.side=zn):v.renderBufferDirect(B,k,H,I,T,ce),T.onAfterRender(v,k,B,H,I,ce)}function Ya(T,k,B){k.isScene!==!0&&(k=We);const H=Pe.get(T),I=m.state.lights,ce=m.state.shadowsArray,ge=I.state.version,Se=Me.getParameters(T,I.state,ce,k,B),be=Me.getProgramCacheKey(Se);let Ue=H.programs;H.environment=T.isMeshStandardMaterial?k.environment:null,H.fog=k.fog,H.envMap=(T.isMeshStandardMaterial?j:M).get(T.envMap||H.environment),H.envMapRotation=H.environment!==null&&T.envMap===null?k.environmentRotation:T.envMapRotation,Ue===void 0&&(T.addEventListener("dispose",qe),Ue=new Map,H.programs=Ue);let Fe=Ue.get(be);if(Fe!==void 0){if(H.currentProgram===Fe&&H.lightsStateVersion===ge)return mf(T,Se),Fe}else Se.uniforms=Me.getUniforms(T),T.onBeforeCompile(Se,v),Fe=Me.acquireProgram(Se,be),Ue.set(be,Fe),H.uniforms=Se.uniforms;const Te=H.uniforms;return(!T.isShaderMaterial&&!T.isRawShaderMaterial||T.clipping===!0)&&(Te.clippingPlanes=oe.uniform),mf(T,Se),H.needsLights=Bg(T),H.lightsStateVersion=ge,H.needsLights&&(Te.ambientLightColor.value=I.state.ambient,Te.lightProbe.value=I.state.probe,Te.directionalLights.value=I.state.directional,Te.directionalLightShadows.value=I.state.directionalShadow,Te.spotLights.value=I.state.spot,Te.spotLightShadows.value=I.state.spotShadow,Te.rectAreaLights.value=I.state.rectArea,Te.ltc_1.value=I.state.rectAreaLTC1,Te.ltc_2.value=I.state.rectAreaLTC2,Te.pointLights.value=I.state.point,Te.pointLightShadows.value=I.state.pointShadow,Te.hemisphereLights.value=I.state.hemi,Te.directionalShadowMap.value=I.state.directionalShadowMap,Te.directionalShadowMatrix.value=I.state.directionalShadowMatrix,Te.spotShadowMap.value=I.state.spotShadowMap,Te.spotLightMatrix.value=I.state.spotLightMatrix,Te.spotLightMap.value=I.state.spotLightMap,Te.pointShadowMap.value=I.state.pointShadowMap,Te.pointShadowMatrix.value=I.state.pointShadowMatrix),H.currentProgram=Fe,H.uniformsList=null,Fe}function pf(T){if(T.uniformsList===null){const k=T.currentProgram.getUniforms();T.uniformsList=tl.seqWithValue(k.seq,T.uniforms)}return T.uniformsList}function mf(T,k){const B=Pe.get(T);B.outputColorSpace=k.outputColorSpace,B.batching=k.batching,B.batchingColor=k.batchingColor,B.instancing=k.instancing,B.instancingColor=k.instancingColor,B.instancingMorph=k.instancingMorph,B.skinning=k.skinning,B.morphTargets=k.morphTargets,B.morphNormals=k.morphNormals,B.morphColors=k.morphColors,B.morphTargetsCount=k.morphTargetsCount,B.numClippingPlanes=k.numClippingPlanes,B.numIntersection=k.numClipIntersection,B.vertexAlphas=k.vertexAlphas,B.vertexTangents=k.vertexTangents,B.toneMapping=k.toneMapping}function zg(T,k,B,H,I){k.isScene!==!0&&(k=We),C.resetTextureUnits();const ce=k.fog,ge=H.isMeshStandardMaterial?k.environment:null,Se=A===null?v.outputColorSpace:A.isXRRenderTarget===!0?A.texture.colorSpace:tr,be=(H.isMeshStandardMaterial?j:M).get(H.envMap||ge),Ue=H.vertexColors===!0&&!!B.attributes.color&&B.attributes.color.itemSize===4,Fe=!!B.attributes.tangent&&(!!H.normalMap||H.anisotropy>0),Te=!!B.morphAttributes.position,nt=!!B.morphAttributes.normal,ot=!!B.morphAttributes.color;let gt=qi;H.toneMapped&&(A===null||A.isXRRenderTarget===!0)&&(gt=v.toneMapping);const ln=B.morphAttributes.position||B.morphAttributes.normal||B.morphAttributes.color,Je=ln!==void 0?ln.length:0,Ce=Pe.get(H),Pt=m.state.lights;if(G===!0&&(re===!0||T!==F)){const _n=T===F&&H.id===N;oe.setState(H,T,_n)}let et=!1;H.version===Ce.__version?(Ce.needsLights&&Ce.lightsStateVersion!==Pt.state.version||Ce.outputColorSpace!==Se||I.isBatchedMesh&&Ce.batching===!1||!I.isBatchedMesh&&Ce.batching===!0||I.isBatchedMesh&&Ce.batchingColor===!0&&I.colorTexture===null||I.isBatchedMesh&&Ce.batchingColor===!1&&I.colorTexture!==null||I.isInstancedMesh&&Ce.instancing===!1||!I.isInstancedMesh&&Ce.instancing===!0||I.isSkinnedMesh&&Ce.skinning===!1||!I.isSkinnedMesh&&Ce.skinning===!0||I.isInstancedMesh&&Ce.instancingColor===!0&&I.instanceColor===null||I.isInstancedMesh&&Ce.instancingColor===!1&&I.instanceColor!==null||I.isInstancedMesh&&Ce.instancingMorph===!0&&I.morphTexture===null||I.isInstancedMesh&&Ce.instancingMorph===!1&&I.morphTexture!==null||Ce.envMap!==be||H.fog===!0&&Ce.fog!==ce||Ce.numClippingPlanes!==void 0&&(Ce.numClippingPlanes!==oe.numPlanes||Ce.numIntersection!==oe.numIntersection)||Ce.vertexAlphas!==Ue||Ce.vertexTangents!==Fe||Ce.morphTargets!==Te||Ce.morphNormals!==nt||Ce.morphColors!==ot||Ce.toneMapping!==gt||Ce.morphTargetsCount!==Je)&&(et=!0):(et=!0,Ce.__version=H.version);let Pn=Ce.currentProgram;et===!0&&(Pn=Ya(H,k,I));let Lr=!1,cn=!1,ec=!1;const _t=Pn.getUniforms(),Si=Ce.uniforms;if(ke.useProgram(Pn.program)&&(Lr=!0,cn=!0,ec=!0),H.id!==N&&(N=H.id,cn=!0),Lr||F!==T){Ve.reverseDepthBuffer?(ue.copy(T.projectionMatrix),nS(ue),iS(ue),_t.setValue(P,"projectionMatrix",ue)):_t.setValue(P,"projectionMatrix",T.projectionMatrix),_t.setValue(P,"viewMatrix",T.matrixWorldInverse);const _n=_t.map.cameraPosition;_n!==void 0&&_n.setValue(P,Le.setFromMatrixPosition(T.matrixWorld)),Ve.logarithmicDepthBuffer&&_t.setValue(P,"logDepthBufFC",2/(Math.log(T.far+1)/Math.LN2)),(H.isMeshPhongMaterial||H.isMeshToonMaterial||H.isMeshLambertMaterial||H.isMeshBasicMaterial||H.isMeshStandardMaterial||H.isShaderMaterial)&&_t.setValue(P,"isOrthographic",T.isOrthographicCamera===!0),F!==T&&(F=T,cn=!0,ec=!0)}if(I.isSkinnedMesh){_t.setOptional(P,I,"bindMatrix"),_t.setOptional(P,I,"bindMatrixInverse");const _n=I.skeleton;_n&&(_n.boneTexture===null&&_n.computeBoneTexture(),_t.setValue(P,"boneTexture",_n.boneTexture,C))}I.isBatchedMesh&&(_t.setOptional(P,I,"batchingTexture"),_t.setValue(P,"batchingTexture",I._matricesTexture,C),_t.setOptional(P,I,"batchingIdTexture"),_t.setValue(P,"batchingIdTexture",I._indirectTexture,C),_t.setOptional(P,I,"batchingColorTexture"),I._colorsTexture!==null&&_t.setValue(P,"batchingColorTexture",I._colorsTexture,C));const tc=B.morphAttributes;if((tc.position!==void 0||tc.normal!==void 0||tc.color!==void 0)&&te.update(I,B,Pn),(cn||Ce.receiveShadow!==I.receiveShadow)&&(Ce.receiveShadow=I.receiveShadow,_t.setValue(P,"receiveShadow",I.receiveShadow)),H.isMeshGouraudMaterial&&H.envMap!==null&&(Si.envMap.value=be,Si.flipEnvMap.value=be.isCubeTexture&&be.isRenderTargetTexture===!1?-1:1),H.isMeshStandardMaterial&&H.envMap===null&&k.environment!==null&&(Si.envMapIntensity.value=k.environmentIntensity),cn&&(_t.setValue(P,"toneMappingExposure",v.toneMappingExposure),Ce.needsLights&&jg(Si,ec),ce&&H.fog===!0&&he.refreshFogUniforms(Si,ce),he.refreshMaterialUniforms(Si,H,Y,W,m.state.transmissionRenderTarget[T.id]),tl.upload(P,pf(Ce),Si,C)),H.isShaderMaterial&&H.uniformsNeedUpdate===!0&&(tl.upload(P,pf(Ce),Si,C),H.uniformsNeedUpdate=!1),H.isSpriteMaterial&&_t.setValue(P,"center",I.center),_t.setValue(P,"modelViewMatrix",I.modelViewMatrix),_t.setValue(P,"normalMatrix",I.normalMatrix),_t.setValue(P,"modelMatrix",I.matrixWorld),H.isShaderMaterial||H.isRawShaderMaterial){const _n=H.uniformsGroups;for(let nc=0,Hg=_n.length;nc<Hg;nc++){const xf=_n[nc];L.update(xf,Pn),L.bind(xf,Pn)}}return Pn}function jg(T,k){T.ambientLightColor.needsUpdate=k,T.lightProbe.needsUpdate=k,T.directionalLights.needsUpdate=k,T.directionalLightShadows.needsUpdate=k,T.pointLights.needsUpdate=k,T.pointLightShadows.needsUpdate=k,T.spotLights.needsUpdate=k,T.spotLightShadows.needsUpdate=k,T.rectAreaLights.needsUpdate=k,T.hemisphereLights.needsUpdate=k}function Bg(T){return T.isMeshLambertMaterial||T.isMeshToonMaterial||T.isMeshPhongMaterial||T.isMeshStandardMaterial||T.isShadowMaterial||T.isShaderMaterial&&T.lights===!0}this.getActiveCubeFace=function(){return R},this.getActiveMipmapLevel=function(){return E},this.getRenderTarget=function(){return A},this.setRenderTargetTextures=function(T,k,B){Pe.get(T.texture).__webglTexture=k,Pe.get(T.depthTexture).__webglTexture=B;const H=Pe.get(T);H.__hasExternalTextures=!0,H.__autoAllocateDepthBuffer=B===void 0,H.__autoAllocateDepthBuffer||He.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),H.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(T,k){const B=Pe.get(T);B.__webglFramebuffer=k,B.__useDefaultFramebuffer=k===void 0},this.setRenderTarget=function(T,k=0,B=0){A=T,R=k,E=B;let H=!0,I=null,ce=!1,ge=!1;if(T){const be=Pe.get(T);if(be.__useDefaultFramebuffer!==void 0)ke.bindFramebuffer(P.FRAMEBUFFER,null),H=!1;else if(be.__webglFramebuffer===void 0)C.setupRenderTarget(T);else if(be.__hasExternalTextures)C.rebindTextures(T,Pe.get(T.texture).__webglTexture,Pe.get(T.depthTexture).__webglTexture);else if(T.depthBuffer){const Te=T.depthTexture;if(be.__boundDepthTexture!==Te){if(Te!==null&&Pe.has(Te)&&(T.width!==Te.image.width||T.height!==Te.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");C.setupDepthRenderbuffer(T)}}const Ue=T.texture;(Ue.isData3DTexture||Ue.isDataArrayTexture||Ue.isCompressedArrayTexture)&&(ge=!0);const Fe=Pe.get(T).__webglFramebuffer;T.isWebGLCubeRenderTarget?(Array.isArray(Fe[k])?I=Fe[k][B]:I=Fe[k],ce=!0):T.samples>0&&C.useMultisampledRTT(T)===!1?I=Pe.get(T).__webglMultisampledFramebuffer:Array.isArray(Fe)?I=Fe[B]:I=Fe,y.copy(T.viewport),b.copy(T.scissor),O=T.scissorTest}else y.copy(ee).multiplyScalar(Y).floor(),b.copy(z).multiplyScalar(Y).floor(),O=le;if(ke.bindFramebuffer(P.FRAMEBUFFER,I)&&H&&ke.drawBuffers(T,I),ke.viewport(y),ke.scissor(b),ke.setScissorTest(O),ce){const be=Pe.get(T.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_CUBE_MAP_POSITIVE_X+k,be.__webglTexture,B)}else if(ge){const be=Pe.get(T.texture),Ue=k||0;P.framebufferTextureLayer(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,be.__webglTexture,B||0,Ue)}N=-1},this.readRenderTargetPixels=function(T,k,B,H,I,ce,ge){if(!(T&&T.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Se=Pe.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&ge!==void 0&&(Se=Se[ge]),Se){ke.bindFramebuffer(P.FRAMEBUFFER,Se);try{const be=T.texture,Ue=be.format,Fe=be.type;if(!Ve.textureFormatReadable(Ue)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Ve.textureTypeReadable(Fe)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}k>=0&&k<=T.width-H&&B>=0&&B<=T.height-I&&P.readPixels(k,B,H,I,Ne.convert(Ue),Ne.convert(Fe),ce)}finally{const be=A!==null?Pe.get(A).__webglFramebuffer:null;ke.bindFramebuffer(P.FRAMEBUFFER,be)}}},this.readRenderTargetPixelsAsync=async function(T,k,B,H,I,ce,ge){if(!(T&&T.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Se=Pe.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&ge!==void 0&&(Se=Se[ge]),Se){const be=T.texture,Ue=be.format,Fe=be.type;if(!Ve.textureFormatReadable(Ue))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Ve.textureTypeReadable(Fe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(k>=0&&k<=T.width-H&&B>=0&&B<=T.height-I){ke.bindFramebuffer(P.FRAMEBUFFER,Se);const Te=P.createBuffer();P.bindBuffer(P.PIXEL_PACK_BUFFER,Te),P.bufferData(P.PIXEL_PACK_BUFFER,ce.byteLength,P.STREAM_READ),P.readPixels(k,B,H,I,Ne.convert(Ue),Ne.convert(Fe),0);const nt=A!==null?Pe.get(A).__webglFramebuffer:null;ke.bindFramebuffer(P.FRAMEBUFFER,nt);const ot=P.fenceSync(P.SYNC_GPU_COMMANDS_COMPLETE,0);return P.flush(),await tS(P,ot,4),P.bindBuffer(P.PIXEL_PACK_BUFFER,Te),P.getBufferSubData(P.PIXEL_PACK_BUFFER,0,ce),P.deleteBuffer(Te),P.deleteSync(ot),ce}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(T,k=null,B=0){T.isTexture!==!0&&(el("WebGLRenderer: copyFramebufferToTexture function signature has changed."),k=arguments[0]||null,T=arguments[1]);const H=Math.pow(2,-B),I=Math.floor(T.image.width*H),ce=Math.floor(T.image.height*H),ge=k!==null?k.x:0,Se=k!==null?k.y:0;C.setTexture2D(T,0),P.copyTexSubImage2D(P.TEXTURE_2D,B,0,0,ge,Se,I,ce),ke.unbindTexture()},this.copyTextureToTexture=function(T,k,B=null,H=null,I=0){T.isTexture!==!0&&(el("WebGLRenderer: copyTextureToTexture function signature has changed."),H=arguments[0]||null,T=arguments[1],k=arguments[2],I=arguments[3]||0,B=null);let ce,ge,Se,be,Ue,Fe;B!==null?(ce=B.max.x-B.min.x,ge=B.max.y-B.min.y,Se=B.min.x,be=B.min.y):(ce=T.image.width,ge=T.image.height,Se=0,be=0),H!==null?(Ue=H.x,Fe=H.y):(Ue=0,Fe=0);const Te=Ne.convert(k.format),nt=Ne.convert(k.type);C.setTexture2D(k,0),P.pixelStorei(P.UNPACK_FLIP_Y_WEBGL,k.flipY),P.pixelStorei(P.UNPACK_PREMULTIPLY_ALPHA_WEBGL,k.premultiplyAlpha),P.pixelStorei(P.UNPACK_ALIGNMENT,k.unpackAlignment);const ot=P.getParameter(P.UNPACK_ROW_LENGTH),gt=P.getParameter(P.UNPACK_IMAGE_HEIGHT),ln=P.getParameter(P.UNPACK_SKIP_PIXELS),Je=P.getParameter(P.UNPACK_SKIP_ROWS),Ce=P.getParameter(P.UNPACK_SKIP_IMAGES),Pt=T.isCompressedTexture?T.mipmaps[I]:T.image;P.pixelStorei(P.UNPACK_ROW_LENGTH,Pt.width),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,Pt.height),P.pixelStorei(P.UNPACK_SKIP_PIXELS,Se),P.pixelStorei(P.UNPACK_SKIP_ROWS,be),T.isDataTexture?P.texSubImage2D(P.TEXTURE_2D,I,Ue,Fe,ce,ge,Te,nt,Pt.data):T.isCompressedTexture?P.compressedTexSubImage2D(P.TEXTURE_2D,I,Ue,Fe,Pt.width,Pt.height,Te,Pt.data):P.texSubImage2D(P.TEXTURE_2D,I,Ue,Fe,ce,ge,Te,nt,Pt),P.pixelStorei(P.UNPACK_ROW_LENGTH,ot),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,gt),P.pixelStorei(P.UNPACK_SKIP_PIXELS,ln),P.pixelStorei(P.UNPACK_SKIP_ROWS,Je),P.pixelStorei(P.UNPACK_SKIP_IMAGES,Ce),I===0&&k.generateMipmaps&&P.generateMipmap(P.TEXTURE_2D),ke.unbindTexture()},this.copyTextureToTexture3D=function(T,k,B=null,H=null,I=0){T.isTexture!==!0&&(el("WebGLRenderer: copyTextureToTexture3D function signature has changed."),B=arguments[0]||null,H=arguments[1]||null,T=arguments[2],k=arguments[3],I=arguments[4]||0);let ce,ge,Se,be,Ue,Fe,Te,nt,ot;const gt=T.isCompressedTexture?T.mipmaps[I]:T.image;B!==null?(ce=B.max.x-B.min.x,ge=B.max.y-B.min.y,Se=B.max.z-B.min.z,be=B.min.x,Ue=B.min.y,Fe=B.min.z):(ce=gt.width,ge=gt.height,Se=gt.depth,be=0,Ue=0,Fe=0),H!==null?(Te=H.x,nt=H.y,ot=H.z):(Te=0,nt=0,ot=0);const ln=Ne.convert(k.format),Je=Ne.convert(k.type);let Ce;if(k.isData3DTexture)C.setTexture3D(k,0),Ce=P.TEXTURE_3D;else if(k.isDataArrayTexture||k.isCompressedArrayTexture)C.setTexture2DArray(k,0),Ce=P.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}P.pixelStorei(P.UNPACK_FLIP_Y_WEBGL,k.flipY),P.pixelStorei(P.UNPACK_PREMULTIPLY_ALPHA_WEBGL,k.premultiplyAlpha),P.pixelStorei(P.UNPACK_ALIGNMENT,k.unpackAlignment);const Pt=P.getParameter(P.UNPACK_ROW_LENGTH),et=P.getParameter(P.UNPACK_IMAGE_HEIGHT),Pn=P.getParameter(P.UNPACK_SKIP_PIXELS),Lr=P.getParameter(P.UNPACK_SKIP_ROWS),cn=P.getParameter(P.UNPACK_SKIP_IMAGES);P.pixelStorei(P.UNPACK_ROW_LENGTH,gt.width),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,gt.height),P.pixelStorei(P.UNPACK_SKIP_PIXELS,be),P.pixelStorei(P.UNPACK_SKIP_ROWS,Ue),P.pixelStorei(P.UNPACK_SKIP_IMAGES,Fe),T.isDataTexture||T.isData3DTexture?P.texSubImage3D(Ce,I,Te,nt,ot,ce,ge,Se,ln,Je,gt.data):k.isCompressedArrayTexture?P.compressedTexSubImage3D(Ce,I,Te,nt,ot,ce,ge,Se,ln,gt.data):P.texSubImage3D(Ce,I,Te,nt,ot,ce,ge,Se,ln,Je,gt),P.pixelStorei(P.UNPACK_ROW_LENGTH,Pt),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,et),P.pixelStorei(P.UNPACK_SKIP_PIXELS,Pn),P.pixelStorei(P.UNPACK_SKIP_ROWS,Lr),P.pixelStorei(P.UNPACK_SKIP_IMAGES,cn),I===0&&k.generateMipmaps&&P.generateMipmap(Ce),ke.unbindTexture()},this.initRenderTarget=function(T){Pe.get(T).__webglFramebuffer===void 0&&C.setupRenderTarget(T)},this.initTexture=function(T){T.isCubeTexture?C.setTextureCube(T,0):T.isData3DTexture?C.setTexture3D(T,0):T.isDataArrayTexture||T.isCompressedArrayTexture?C.setTexture2DArray(T,0):C.setTexture2D(T,0),ke.unbindTexture()},this.resetState=function(){R=0,E=0,A=null,ke.reset(),Oe.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return hi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const n=this.getContext();n.drawingBufferColorSpace=e===Zh?"display-p3":"srgb",n.unpackColorSpace=tt.workingColorSpace===Kl?"display-p3":"srgb"}}class nf{constructor(e,n=25e-5){this.isFogExp2=!0,this.name="",this.color=new Ye(e),this.density=n}clone(){return new nf(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}}class m2 extends Yt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Qn,this.environmentIntensity=1,this.environmentRotation=new Qn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,n){return super.copy(e,n),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const n=super.toJSON(e);return this.fog!==null&&(n.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(n.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(n.object.backgroundIntensity=this.backgroundIntensity),n.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(n.object.environmentIntensity=this.environmentIntensity),n.object.environmentRotation=this.environmentRotation.toArray(),n}}class Ug extends zs{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Ye(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const Mm=new dt,$d=new Qh,Io=new Zl,Uo=new U;class x2 extends Yt{constructor(e=new Rn,n=new Ug){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=n,this.updateMorphTargets()}copy(e,n){return super.copy(e,n),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,n){const i=this.geometry,r=this.matrixWorld,s=e.params.Points.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Io.copy(i.boundingSphere),Io.applyMatrix4(r),Io.radius+=s,e.ray.intersectsSphere(Io)===!1)return;Mm.copy(r).invert(),$d.copy(e.ray).applyMatrix4(Mm);const o=s/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,u=i.index,p=i.attributes.position;if(u!==null){const h=Math.max(0,a.start),x=Math.min(u.count,a.start+a.count);for(let _=h,S=x;_<S;_++){const m=u.getX(_);Uo.fromBufferAttribute(p,m),bm(Uo,m,c,r,e,n,this)}}else{const h=Math.max(0,a.start),x=Math.min(p.count,a.start+a.count);for(let _=h,S=x;_<S;_++)Uo.fromBufferAttribute(p,_),bm(Uo,_,c,r,e,n,this)}}updateMorphTargets(){const n=this.geometry.morphAttributes,i=Object.keys(n);if(i.length>0){const r=n[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=r.length;s<a;s++){const o=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}}function bm(t,e,n,i,r,s,a){const o=$d.distanceSqToPoint(t);if(o<n){const c=new U;$d.closestPointToPoint(t,c),c.applyMatrix4(i);const u=r.ray.origin.distanceTo(c);if(u<r.near||u>r.far)return;s.push({distance:u,distanceToRay:Math.sqrt(o),point:c,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}class rf extends Rn{constructor(e=[],n=[],i=1,r=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:n,radius:i,detail:r};const s=[],a=[];o(r),u(i),f(),this.setAttribute("position",new Bt(s,3)),this.setAttribute("normal",new Bt(s.slice(),3)),this.setAttribute("uv",new Bt(a,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function o(g){const v=new U,w=new U,R=new U;for(let E=0;E<n.length;E+=3)x(n[E+0],v),x(n[E+1],w),x(n[E+2],R),c(v,w,R,g)}function c(g,v,w,R){const E=R+1,A=[];for(let N=0;N<=E;N++){A[N]=[];const F=g.clone().lerp(w,N/E),y=v.clone().lerp(w,N/E),b=E-N;for(let O=0;O<=b;O++)O===0&&N===E?A[N][O]=F:A[N][O]=F.clone().lerp(y,O/b)}for(let N=0;N<E;N++)for(let F=0;F<2*(E-N)-1;F++){const y=Math.floor(F/2);F%2===0?(h(A[N][y+1]),h(A[N+1][y]),h(A[N][y])):(h(A[N][y+1]),h(A[N+1][y+1]),h(A[N+1][y]))}}function u(g){const v=new U;for(let w=0;w<s.length;w+=3)v.x=s[w+0],v.y=s[w+1],v.z=s[w+2],v.normalize().multiplyScalar(g),s[w+0]=v.x,s[w+1]=v.y,s[w+2]=v.z}function f(){const g=new U;for(let v=0;v<s.length;v+=3){g.x=s[v+0],g.y=s[v+1],g.z=s[v+2];const w=m(g)/2/Math.PI+.5,R=d(g)/Math.PI+.5;a.push(w,1-R)}_(),p()}function p(){for(let g=0;g<a.length;g+=6){const v=a[g+0],w=a[g+2],R=a[g+4],E=Math.max(v,w,R),A=Math.min(v,w,R);E>.9&&A<.1&&(v<.2&&(a[g+0]+=1),w<.2&&(a[g+2]+=1),R<.2&&(a[g+4]+=1))}}function h(g){s.push(g.x,g.y,g.z)}function x(g,v){const w=g*3;v.x=e[w+0],v.y=e[w+1],v.z=e[w+2]}function _(){const g=new U,v=new U,w=new U,R=new U,E=new $e,A=new $e,N=new $e;for(let F=0,y=0;F<s.length;F+=9,y+=6){g.set(s[F+0],s[F+1],s[F+2]),v.set(s[F+3],s[F+4],s[F+5]),w.set(s[F+6],s[F+7],s[F+8]),E.set(a[y+0],a[y+1]),A.set(a[y+2],a[y+3]),N.set(a[y+4],a[y+5]),R.copy(g).add(v).add(w).divideScalar(3);const b=m(R);S(E,y+0,g,b),S(A,y+2,v,b),S(N,y+4,w,b)}}function S(g,v,w,R){R<0&&g.x===1&&(a[v]=g.x-1),w.x===0&&w.z===0&&(a[v]=R/2/Math.PI+.5)}function m(g){return Math.atan2(g.z,-g.x)}function d(g){return Math.atan2(-g.y,Math.sqrt(g.x*g.x+g.z*g.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new rf(e.vertices,e.indices,e.radius,e.details)}}class sf extends rf{constructor(e=1,n=0){const i=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],r=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(i,r,e,n),this.type="OctahedronGeometry",this.parameters={radius:e,detail:n}}static fromJSON(e){return new sf(e.radius,e.detail)}}class Rl extends Rn{constructor(e=1,n=32,i=16,r=0,s=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:n,heightSegments:i,phiStart:r,phiLength:s,thetaStart:a,thetaLength:o},n=Math.max(3,Math.floor(n)),i=Math.max(2,Math.floor(i));const c=Math.min(a+o,Math.PI);let u=0;const f=[],p=new U,h=new U,x=[],_=[],S=[],m=[];for(let d=0;d<=i;d++){const g=[],v=d/i;let w=0;d===0&&a===0?w=.5/n:d===i&&c===Math.PI&&(w=-.5/n);for(let R=0;R<=n;R++){const E=R/n;p.x=-e*Math.cos(r+E*s)*Math.sin(a+v*o),p.y=e*Math.cos(a+v*o),p.z=e*Math.sin(r+E*s)*Math.sin(a+v*o),_.push(p.x,p.y,p.z),h.copy(p).normalize(),S.push(h.x,h.y,h.z),m.push(E+w,1-v),g.push(u++)}f.push(g)}for(let d=0;d<i;d++)for(let g=0;g<n;g++){const v=f[d][g+1],w=f[d][g],R=f[d+1][g],E=f[d+1][g+1];(d!==0||a>0)&&x.push(v,w,E),(d!==i-1||c<Math.PI)&&x.push(w,R,E)}this.setIndex(x),this.setAttribute("position",new Bt(_,3)),this.setAttribute("normal",new Bt(S,3)),this.setAttribute("uv",new Bt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Rl(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class af extends Rn{constructor(e=1,n=.4,i=12,r=48,s=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:n,radialSegments:i,tubularSegments:r,arc:s},i=Math.floor(i),r=Math.floor(r);const a=[],o=[],c=[],u=[],f=new U,p=new U,h=new U;for(let x=0;x<=i;x++)for(let _=0;_<=r;_++){const S=_/r*s,m=x/i*Math.PI*2;p.x=(e+n*Math.cos(m))*Math.cos(S),p.y=(e+n*Math.cos(m))*Math.sin(S),p.z=n*Math.sin(m),o.push(p.x,p.y,p.z),f.x=e*Math.cos(S),f.y=e*Math.sin(S),h.subVectors(p,f).normalize(),c.push(h.x,h.y,h.z),u.push(_/r),u.push(x/i)}for(let x=1;x<=i;x++)for(let _=1;_<=r;_++){const S=(r+1)*x+_-1,m=(r+1)*(x-1)+_-1,d=(r+1)*(x-1)+_,g=(r+1)*x+_;a.push(S,m,g),a.push(m,d,g)}this.setIndex(a),this.setAttribute("position",new Bt(o,3)),this.setAttribute("normal",new Bt(c,3)),this.setAttribute("uv",new Bt(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new af(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}class g2 extends zs{constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new Ye(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ye(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=_g,this.normalScale=new $e(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Qn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}const Em={enabled:!1,files:{},add:function(t,e){this.enabled!==!1&&(this.files[t]=e)},get:function(t){if(this.enabled!==!1)return this.files[t]},remove:function(t){delete this.files[t]},clear:function(){this.files={}}};class v2{constructor(e,n,i){const r=this;let s=!1,a=0,o=0,c;const u=[];this.onStart=void 0,this.onLoad=e,this.onProgress=n,this.onError=i,this.itemStart=function(f){o++,s===!1&&r.onStart!==void 0&&r.onStart(f,a,o),s=!0},this.itemEnd=function(f){a++,r.onProgress!==void 0&&r.onProgress(f,a,o),a===o&&(s=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(f){r.onError!==void 0&&r.onError(f)},this.resolveURL=function(f){return c?c(f):f},this.setURLModifier=function(f){return c=f,this},this.addHandler=function(f,p){return u.push(f,p),this},this.removeHandler=function(f){const p=u.indexOf(f);return p!==-1&&u.splice(p,2),this},this.getHandler=function(f){for(let p=0,h=u.length;p<h;p+=2){const x=u[p],_=u[p+1];if(x.global&&(x.lastIndex=0),x.test(f))return _}return null}}}const _2=new v2;class of{constructor(e){this.manager=e!==void 0?e:_2,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,n){const i=this;return new Promise(function(r,s){i.load(e,r,n,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}}of.DEFAULT_MATERIAL_NAME="__DEFAULT";class y2 extends of{constructor(e){super(e)}load(e,n,i,r){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=this,a=Em.get(e);if(a!==void 0)return s.manager.itemStart(e),setTimeout(function(){n&&n(a),s.manager.itemEnd(e)},0),a;const o=Fa("img");function c(){f(),Em.add(e,this),n&&n(this),s.manager.itemEnd(e)}function u(p){f(),r&&r(p),s.manager.itemError(e),s.manager.itemEnd(e)}function f(){o.removeEventListener("load",c,!1),o.removeEventListener("error",u,!1)}return o.addEventListener("load",c,!1),o.addEventListener("error",u,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),s.manager.itemStart(e),o.src=e,o}}class S2 extends of{constructor(e){super(e)}load(e,n,i,r){const s=new $t,a=new y2(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(o){s.image=o,s.needsUpdate=!0,n!==void 0&&n(s)},i,r),s}}class Fg extends Yt{constructor(e,n=1){super(),this.isLight=!0,this.type="Light",this.color=new Ye(e),this.intensity=n}dispose(){}copy(e,n){return super.copy(e,n),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const n=super.toJSON(e);return n.object.color=this.color.getHex(),n.object.intensity=this.intensity,this.groundColor!==void 0&&(n.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(n.object.distance=this.distance),this.angle!==void 0&&(n.object.angle=this.angle),this.decay!==void 0&&(n.object.decay=this.decay),this.penumbra!==void 0&&(n.object.penumbra=this.penumbra),this.shadow!==void 0&&(n.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(n.object.target=this.target.uuid),n}}const au=new dt,Tm=new U,Am=new U;class w2{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new $e(512,512),this.map=null,this.mapPass=null,this.matrix=new dt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new ef,this._frameExtents=new $e(1,1),this._viewportCount=1,this._viewports=[new st(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const n=this.camera,i=this.matrix;Tm.setFromMatrixPosition(e.matrixWorld),n.position.copy(Tm),Am.setFromMatrixPosition(e.target.matrixWorld),n.lookAt(Am),n.updateMatrixWorld(),au.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(au),i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(au)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}const Cm=new dt,ta=new U,ou=new U;class M2 extends w2{constructor(){super(new fn(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new $e(4,2),this._viewportCount=6,this._viewports=[new st(2,1,1,1),new st(0,1,1,1),new st(3,1,1,1),new st(1,1,1,1),new st(3,0,1,1),new st(1,0,1,1)],this._cubeDirections=[new U(1,0,0),new U(-1,0,0),new U(0,0,1),new U(0,0,-1),new U(0,1,0),new U(0,-1,0)],this._cubeUps=[new U(0,1,0),new U(0,1,0),new U(0,1,0),new U(0,1,0),new U(0,0,1),new U(0,0,-1)]}updateMatrices(e,n=0){const i=this.camera,r=this.matrix,s=e.distance||i.far;s!==i.far&&(i.far=s,i.updateProjectionMatrix()),ta.setFromMatrixPosition(e.matrixWorld),i.position.copy(ta),ou.copy(i.position),ou.add(this._cubeDirections[n]),i.up.copy(this._cubeUps[n]),i.lookAt(ou),i.updateMatrixWorld(),r.makeTranslation(-ta.x,-ta.y,-ta.z),Cm.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Cm)}}class Nm extends Fg{constructor(e,n,i=0,r=2){super(e,n),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=r,this.shadow=new M2}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,n){return super.copy(e,n),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class b2 extends Fg{constructor(e,n){super(e,n),this.isAmbientLight=!0,this.type="AmbientLight"}}class E2{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=Rm(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const n=Rm();e=(n-this.oldTime)/1e3,this.oldTime=n,this.elapsedTime+=e}return e}}function Rm(){return performance.now()}const Pm=new dt;class T2{constructor(e,n,i=0,r=1/0){this.ray=new Qh(e,n),this.near=i,this.far=r,this.camera=null,this.layers=new Jh,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,n){this.ray.set(e,n)}setFromCamera(e,n){n.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(n.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(n).sub(this.ray.origin).normalize(),this.camera=n):n.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(n.near+n.far)/(n.near-n.far)).unproject(n),this.ray.direction.set(0,0,-1).transformDirection(n.matrixWorld),this.camera=n):console.error("THREE.Raycaster: Unsupported camera type: "+n.type)}setFromXRController(e){return Pm.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Pm),this}intersectObject(e,n=!0,i=[]){return Yd(e,this,i,n),i.sort(Lm),i}intersectObjects(e,n=!0,i=[]){for(let r=0,s=e.length;r<s;r++)Yd(e[r],this,i,n);return i.sort(Lm),i}}function Lm(t,e){return t.distance-e.distance}function Yd(t,e,n,i){let r=!0;if(t.layers.test(e.layers)&&t.raycast(e,n)===!1&&(r=!1),r===!0&&i===!0){const s=t.children;for(let a=0,o=s.length;a<o;a++)Yd(s[a],e,n,!0)}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Gh}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Gh);function A2({t}){const e=ne.useRef(null),n=ne.useRef(null),[i,r]=ne.useState([]),[s,a]=ne.useState(null),[o,c]=ne.useState(!1),[u,f]=ne.useState(!1),[p,h]=ne.useState(!0),[x,_]=ne.useState(!1);ne.useEffect(()=>{const d=()=>{const g=window.innerWidth<768||"ontouchstart"in window&&window.innerWidth<1024;_(g)};return d(),window.addEventListener("resize",d),()=>window.removeEventListener("resize",d)},[]);const S=[{id:"art-01",author:"Pyxie Core",description:"Astaroth no Portal Arcano • Ilustração oficial do Bosque Violeta.",imageUrl:"/assets/pyxie/pyxie_space_banner.jpg",createdAt:new Date().toISOString()},{id:"art-02",author:"Melody Labs",description:"O Arcano O Mago • Pintura digital inspirada nos 78 arcanos da Pyxie.",imageUrl:"/assets/pyxie/og_banner_hd.png",createdAt:new Date().toISOString()},{id:"art-03",author:"Cringelândia Art",description:"Pyxie Tsundere Rebelde • Mascote da comunidade em alta resolução.",imageUrl:"/assets/pyxie/pyxie_mascot.png",createdAt:new Date().toISOString()},{id:"art-04",author:"Pixel Guild",description:"Pixelart Nostálgica • Render retrô em 32x32 da fada gótica.",imageUrl:"/assets/pyxie/pyxie_pixelart.png",createdAt:new Date().toISOString()}];ne.useEffect(()=>{fetch("/api/museum/arts?limit=12").then(d=>d.json()).then(d=>{d&&d.success&&Array.isArray(d.arts)&&d.arts.length>0?r(d.arts):r(S)}).catch(()=>{r(S)})},[]),ne.useEffect(()=>{const d=new IntersectionObserver(g=>{g[0].isIntersecting&&f(!0)},{rootMargin:"200px"});return e.current&&d.observe(e.current),()=>d.disconnect()},[]),ne.useEffect(()=>{if(!u||!n.current||i.length===0||x)return;let d;try{d=new p2({canvas:n.current,alpha:!0,antialias:!0,powerPreference:"high-performance"})}catch(te){console.warn("WebGL não suportado:",te),h(!1);return}const g=new m2;g.fog=new nf(459789,.04);const v=new fn(50,1,.1,100);v.position.set(0,0,7.5);const w=()=>{if(!e.current||!d)return;const te=e.current.clientWidth,se=Math.min(Math.max(te*.55,380),540);v.aspect=te/se,v.updateProjectionMatrix(),d.setSize(te,se),d.setPixelRatio(Math.min(window.devicePixelRatio,2))};w(),window.addEventListener("resize",w);const R=400,E=new Rn,A=new Float32Array(R*3),N=new Float32Array(R*3);for(let te=0;te<R*3;te+=3){A[te]=(Math.random()-.5)*20,A[te+1]=(Math.random()-.5)*12,A[te+2]=(Math.random()-.5)*15;const se=Math.random()>.5;N[te]=se?.95:.55,N[te+1]=se?.2:.35,N[te+2]=se?.6:.95}E.setAttribute("position",new An(A,3)),E.setAttribute("color",new An(N,3));const F=new Ug({size:.08,vertexColors:!0,transparent:!0,opacity:.7,blending:ad}),y=new x2(E,F);g.add(y);const b=new b2(16777215,.85);g.add(b);const O=new Nm(15073383,3,20);O.position.set(0,3,5),g.add(O);const V=new Nm(9133302,3,20);V.position.set(0,-3,3),g.add(V);const q=new oa;g.add(q);const Q=3.3,W=new Rl(Q,24,16),Y=new Li({color:9133302,wireframe:!0,transparent:!0,opacity:.22}),D=new zt(W,Y);q.add(D);const J=new Rl(Q*.98,32,24),ee=new Li({color:1312550,transparent:!0,opacity:.65,side:qt});q.add(new zt(J,ee));const z=new af(Q+.05,.02,16,64),le=new Li({color:15073383,transparent:!0,opacity:.55}),Ae=new zt(z,le);Ae.rotation.x=Math.PI/2,q.add(Ae);const G=new Li({color:11032055,transparent:!0,opacity:.4}),re=new zt(z,G);q.add(re);const ue=new sf(.5,0),me=new Li({color:16726913,wireframe:!0}),Le=new zt(ue,me);q.add(Le);const De=new ks(1.22,1.78),We=new ks(1.3,1.86),Qe=new S2,Be=[],P=Math.max(i.length,12),Vt=(1+Math.sqrt(5))/2,He=Q+.15;for(let te=0;te<P;te++){const se=i[te%i.length],Re=P<=1?0:1-te/(P-1)*2,Ne=Math.sqrt(Math.max(0,1-Re*Re)),Oe=2*Math.PI*te/Vt+(Math.random()-.5)*.35,L=Math.cos(Oe)*Ne*He,fe=Re*He,X=Math.sin(Oe)*Ne*He,K=Qe.load(se.imageUrl||"/assets/pyxie/og_banner_hd.png");K.minFilter=Mn;const xe=new g2({map:K,roughness:.35,metalness:.1,side:zn}),de=new zt(De,xe);de.position.set(L,fe,X),de.lookAt(L*2,fe*2,X*2),de.rotateZ((Math.random()-.5)*.3);const qe=new Li({color:te%2===0?15073383:9133302,transparent:!0,opacity:.45,side:zn}),ft=new zt(We,qe);ft.position.z=-.01,de.add(ft),de.userData={art:se,initialPos:de.position.clone()},q.add(de),Be.push(de)}let Ve=!1,ke=0,rt=0,Pe=0,C=0,M=.002,j=0;const Z=.95,ie=new T2,$=new $e(-100,-100),Me=te=>{var Ne,Oe;Ve=!0;const se=te.clientX||te.touches&&((Ne=te.touches[0])==null?void 0:Ne.clientX)||0,Re=te.clientY||te.touches&&((Oe=te.touches[0])==null?void 0:Oe.clientY)||0;ke=se,rt=Re,Pe=se,C=Re,M=0,j=0},he=te=>{var Ne,Oe;const se=te.clientX||te.touches&&((Ne=te.touches[0])==null?void 0:Ne.clientX)||0,Re=te.clientY||te.touches&&((Oe=te.touches[0])==null?void 0:Oe.clientY)||0;if(Ve){const L=se-Pe,fe=Re-C;M=L*.004,j=fe*.0025,q.rotation.y+=M,q.rotation.x=Math.max(-Math.PI/3,Math.min(Math.PI/3,q.rotation.x+j)),Pe=se,C=Re}if(e.current){const L=e.current.getBoundingClientRect();$.x=(se-L.left)/L.width*2-1,$.y=-((Re-L.top)/L.height)*2+1}},ve=te=>{var Oe,L,fe;if(!Ve)return;const se=te.clientX||te.changedTouches&&((Oe=te.changedTouches[0])==null?void 0:Oe.clientX)||Pe,Re=te.clientY||te.changedTouches&&((L=te.changedTouches[0])==null?void 0:L.clientY)||C;if(Math.hypot(se-ke,Re-rt)<7){if(e.current){const K=e.current.getBoundingClientRect();$.x=(se-K.left)/K.width*2-1,$.y=-((Re-K.top)/K.height)*2+1}ie.setFromCamera($,v);const X=ie.intersectObjects(Be);if(X.length>0){const K=(fe=X[0].object.userData)==null?void 0:fe.art;K&&a(K)}}Ve=!1},Xe=n.current;Xe.addEventListener("pointerdown",Me),window.addEventListener("pointermove",he),window.addEventListener("pointerup",ve);let oe;const ye=new E2,Ie=()=>{oe=requestAnimationFrame(Ie);const te=ye.getElapsedTime();Ve||(q.rotation.y+=M,q.rotation.x+=j,M*=Z,j*=Z,Math.abs(M)<6e-4&&(M=.0016)),Le.rotation.y+=.015,Le.rotation.x+=.01,y.rotation.y=te*.02,y.rotation.x=Math.sin(te*.05)*.05,ie.setFromCamera($,v);const se=ie.intersectObjects(Be);Be.forEach(Re=>{const Oe=se.length>0&&se[0].object===Re?1.15:1;Re.scale.lerp(new U(Oe,Oe,Oe),.1)}),d.render(g,v)};return Ie(),()=>{cancelAnimationFrame(oe),window.removeEventListener("resize",w),window.removeEventListener("pointermove",he),window.removeEventListener("pointerup",ve),Xe.removeEventListener("pointerdown",Me),g.traverse(te=>{te.geometry&&te.geometry.dispose(),te.material&&(Array.isArray(te.material)?te.material.forEach(se=>{se.map&&se.map.dispose(),se.alphaMap&&se.alphaMap.dispose(),se.normalMap&&se.normalMap.dispose(),se.dispose()}):(te.material.map&&te.material.map.dispose(),te.material.alphaMap&&te.material.alphaMap.dispose(),te.material.normalMap&&te.material.normalMap.dispose(),te.material.dispose()))}),d.dispose()}},[u,i,x]);const m=d=>{d.preventDefault(),c(!0)};return l.jsxs("section",{id:"museu-deck",className:"relative py-16 md:py-24 overflow-hidden border-t border-purple-500/10",children:[l.jsxs("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-8",children:[l.jsxs("div",{className:"inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-bold mb-3 shadow-sm",children:[l.jsx(St,{className:"w-3.5 h-3.5 text-pink-400"}),l.jsx("span",{children:t("museum.badge")})]}),l.jsxs("h2",{className:"font-title font-black text-3xl sm:text-4xl text-white tracking-tight",children:[l.jsx("span",{className:"hidden md:inline",children:t("museum.title")}),l.jsx("span",{className:"inline md:hidden",children:t("museum.mobileTitle")||t("museum.title")})]}),l.jsxs("p",{className:"text-slate-300 text-sm sm:text-base max-w-xl mx-auto mt-2",children:[l.jsx("span",{className:"hidden md:inline",children:t("museum.subtitle")}),l.jsx("span",{className:"inline md:hidden",children:t("museum.mobileSubtitle")||t("museum.subtitle")})]})]}),l.jsxs("div",{ref:e,onContextMenu:m,style:{touchAction:"none"},className:"art-shield relative w-full max-w-6xl mx-auto h-[380px] sm:h-[480px] lg:h-[540px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none",children:[p&&!x?l.jsx("canvas",{ref:n,className:"w-full h-full block"}):l.jsx("div",{className:"flex gap-4 overflow-x-auto px-4 py-8 w-full scrollbar-none snap-x",children:i.map(d=>l.jsxs("div",{onClick:()=>a(d),className:"shrink-0 w-64 h-[352px] rounded-2xl glass-panel p-3 border border-pink-500/30 snap-center cursor-pointer shadow-lg transform hover:scale-105 transition-all",children:[l.jsx("img",{src:d.imageUrl,alt:`Arte por @${d.author||"Artista"} no Museu da Pyxie • Visite https://pyxie.com.br/`,"data-canonical-url":"https://pyxie.com.br/",className:"w-full h-64 object-contain rounded-xl bg-black/40"}),l.jsxs("div",{className:"mt-3 text-left",children:[l.jsxs("div",{className:"text-pink-400 font-bold text-sm",children:["@",d.author]}),l.jsx("div",{className:"text-slate-300 text-xs truncate",children:d.description})]})]},d.id))}),l.jsx("div",{className:"absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#07040D] to-transparent pointer-events-none"}),l.jsx("div",{className:"absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#07040D] to-transparent pointer-events-none"})]}),l.jsx("div",{className:"mt-8 text-center",children:l.jsxs("a",{href:"/museu",className:"inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-extrabold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-neon-violet transition-all transform hover:-translate-y-1 active:translate-y-0 border border-purple-400/30",children:[l.jsx(St,{className:"w-4 h-4 text-pink-300"}),l.jsx("span",{children:t("museum.exploreAll")})]})}),s&&l.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn",children:l.jsxs("div",{onContextMenu:m,className:"art-shield relative w-full max-w-2xl rounded-3xl glass-panel border border-pink-500/30 p-6 shadow-2xl overflow-hidden",children:[l.jsx("button",{onClick:()=>a(null),className:"absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all z-20",children:l.jsx(As,{className:"w-5 h-5"})}),l.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-6 items-center",children:[l.jsxs("div",{className:"relative rounded-2xl overflow-hidden border border-purple-500/30 bg-black/40 group",children:[l.jsx("img",{src:s.imageUrl,alt:`Arte por @${s.author||"Artista"} no Museu da Pyxie • Visite https://pyxie.com.br/`,"data-canonical-url":"https://pyxie.com.br/",className:"w-full h-80 object-contain pointer-events-none select-none"}),l.jsxs("div",{className:"absolute inset-x-0 bottom-0 py-2 px-3 bg-black/85 backdrop-blur-md border-t border-pink-500/40 flex items-center justify-between text-[11px] font-mono tracking-wide z-10 shadow-lg select-none pointer-events-none",children:[l.jsxs("span",{className:"text-white font-bold truncate",children:[l.jsx("span",{className:"text-pink-400 font-extrabold mr-1",children:"✦"}),"pyxie.com.br • @",s.author||"Artista"]}),l.jsx("span",{className:"text-purple-300/80 text-[10px] shrink-0 ml-2 hidden sm:inline",children:"Galeria Oficial"})]}),l.jsxs("div",{className:"absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-mono text-pink-300 border border-pink-500/30 z-10",children:["✦ ",s.id]})]}),l.jsxs("div",{className:"space-y-4 text-left",children:[l.jsxs("div",{children:[l.jsx("span",{className:"text-xs font-mono font-bold text-pink-400 uppercase tracking-wider",children:t("museum.author")}),l.jsxs("h3",{className:"font-title font-extrabold text-2xl text-white",children:["@",s.author]})]}),l.jsx("p",{className:"text-slate-300 text-sm leading-relaxed",children:s.description||"Obra compartilhada na galeria oficial da comunidade Pyxie."}),l.jsxs("div",{className:"pt-2 border-t border-purple-500/15 flex items-center gap-2 text-xs text-purple-300/80",children:[l.jsx(ky,{className:"w-4 h-4 text-pink-400"}),l.jsx("span",{children:new Date(s.createdAt||Date.now()).toLocaleDateString("pt-BR")})]}),l.jsx("div",{className:"pt-3",children:l.jsxs("a",{href:"/museu",className:"inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-purple-500/30 hover:border-pink-500/50 transition-all",children:[l.jsx("span",{children:t("museum.modalForum")}),l.jsx(ng,{className:"w-3.5 h-3.5"})]})})]})]})]})}),o&&l.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn",children:l.jsxs("div",{className:"max-w-md w-full rounded-2xl glass-panel border border-pink-500/40 p-6 text-center shadow-2xl space-y-4",children:[l.jsx("div",{className:"w-12 h-12 rounded-full bg-pink-500/20 border border-pink-500/50 flex items-center justify-center mx-auto text-pink-400",children:l.jsx(rg,{className:"w-6 h-6"})}),l.jsx("h4",{className:"font-title font-bold text-xl text-white",children:t("museum.artShieldTitle")}),l.jsx("p",{className:"text-slate-300 text-sm leading-relaxed",children:t("museum.artShield")}),l.jsx("button",{onClick:()=>c(!1),className:"px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-neon-pink",children:t("museum.modalUnderstood")})]})})]})}function C2({t}){const e=[{id:1,title:t("pillars.p1Title"),desc:t("pillars.p1Desc"),icon:St,iconColor:"text-pink-400",podBg:"bg-pink-500/10 border-pink-500/30"},{id:2,title:t("pillars.p2Title"),desc:t("pillars.p2Desc"),icon:Ts,iconColor:"text-amber-400",podBg:"bg-amber-500/10 border-amber-500/30"},{id:3,title:t("pillars.p3Title"),desc:t("pillars.p3Desc"),icon:ui,iconColor:"text-rose-400",podBg:"bg-rose-500/10 border-rose-500/30"},{id:4,title:t("pillars.p4Title"),desc:t("pillars.p4Desc"),icon:Dy,iconColor:"text-purple-400",podBg:"bg-purple-500/10 border-purple-500/30"},{id:5,title:t("pillars.p5Title"),desc:t("pillars.p5Desc"),icon:By,iconColor:"text-cyan-400",podBg:"bg-cyan-500/10 border-cyan-500/30"}];return l.jsxs("section",{id:"pilares",className:"py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-purple-500/10",children:[l.jsxs("div",{className:"text-center mb-12",children:[l.jsxs("div",{className:"inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold mb-3 shadow-sm",children:[l.jsx(St,{className:"w-3.5 h-3.5 text-pink-400"}),l.jsx("span",{children:t("pillars.badge")})]}),l.jsx("h2",{className:"font-title font-black text-3xl sm:text-4xl text-white tracking-tight",children:t("pillars.title")}),l.jsx("p",{className:"text-slate-300 text-sm sm:text-base max-w-xl mx-auto mt-2",children:t("pillars.desc")})]}),l.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",children:e.map(n=>{const i=n.icon;return l.jsx("div",{className:"rounded-3xl glass-panel border border-purple-500/20 hover:border-pink-500/50 p-6 transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-neon-pink flex flex-col justify-between",children:l.jsxs("div",{children:[l.jsx("div",{className:`w-12 h-12 rounded-2xl flex items-center justify-center border mb-5 ${n.podBg}`,children:l.jsx(i,{className:`w-6 h-6 ${n.iconColor}`})}),l.jsx("h3",{className:"font-title font-bold text-lg text-white mb-2",children:n.title}),l.jsx("p",{className:"text-slate-300 text-xs sm:text-sm leading-relaxed",children:n.desc})]})},n.id)})})]})}function N2({t}){const e=[{id:"c1",icon:Hy,iconColor:"text-pink-400",podBg:"bg-pink-500/10 border-pink-500/30"},{id:"c2",icon:Wy,iconColor:"text-violet-300",podBg:"bg-violet-500/10 border-violet-500/30"},{id:"c3",icon:Yy,iconColor:"text-amber-300",podBg:"bg-amber-500/10 border-amber-500/30"}];return l.jsxs("section",{id:"cringelandia",className:"py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-purple-500/10",children:[l.jsxs("div",{className:"text-center mb-12",children:[l.jsx("div",{className:"inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-200 text-xs font-bold mb-3",children:l.jsx("span",{children:t("cring.badge")})}),l.jsx("h2",{className:"font-title font-black text-3xl sm:text-4xl text-white tracking-tight",children:t("cring.title")}),l.jsx("p",{className:"text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mt-2",children:t("cring.desc")})]}),l.jsx("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-5",children:e.map(({id:n,icon:i,iconColor:r,podBg:s})=>l.jsxs("div",{className:"glass-panel rounded-2xl p-6",children:[l.jsx("div",{className:`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${s}`,children:l.jsx(i,{className:`w-6 h-6 ${r}`,"aria-hidden":"true"})}),l.jsx("h3",{className:"font-title font-bold text-lg text-white mb-2",children:t(`cring.${n}Title`)}),l.jsx("p",{className:"text-slate-300 text-sm leading-relaxed",children:t(`cring.${n}Desc`)})]},n))}),l.jsxs("div",{className:"mt-8 flex flex-wrap justify-center gap-3",children:[l.jsx("a",{href:"/cringelandia",className:"min-h-[48px] inline-flex items-center px-6 rounded-xl bg-pyxie-pink hover:bg-pyxie-neon text-white font-semibold",children:t("cring.btnHub")}),l.jsx("a",{href:"/discord",target:"_blank",rel:"noopener",className:"min-h-[48px] inline-flex items-center px-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold",children:t("cring.btnJoin")}),l.jsx("a",{href:"/pais-e-profissionais",className:"min-h-[48px] inline-flex items-center px-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold",children:t("cring.btnParents")})]})]})}function R2({command:t,onSelect:e,t:n}){const[i,r]=ne.useState(!1),s=t.name||"",a=s.replace(/^\/+/,""),o=`/${a}`,c=f=>{var h;f.stopPropagation();const p=s?o:`py!${((h=t.aliases)==null?void 0:h[0])||""}`;navigator.clipboard.writeText(p),r(!0),setTimeout(()=>r(!1),2e3)},u=`cmd-${a}`;return l.jsxs("div",{id:u,onClick:()=>e&&e(t),className:"group rounded-2xl glass-panel border border-purple-500/20 hover:border-pink-500/50 p-5 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-neon-pink cursor-pointer flex flex-col justify-between relative overflow-hidden",children:[l.jsx("div",{className:"absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl group-hover:bg-pink-500/15 transition-all"}),l.jsxs("div",{className:"space-y-2.5 relative z-10",children:[l.jsxs("div",{className:"flex items-center justify-between",children:[l.jsxs("div",{className:"font-mono font-bold text-sm text-pink-400 group-hover:text-pink-300 transition-colors flex items-center gap-2",children:[l.jsx(vi,{className:"w-3.5 h-3.5 text-purple-400 group-hover:rotate-12 transition-transform"}),l.jsx("span",{children:o})]}),l.jsx("div",{className:"flex items-center gap-1.5",children:l.jsx("button",{onClick:c,className:`p-1.5 rounded-lg border text-xs transition-all flex items-center gap-1 ${i?"bg-emerald-500/20 border-emerald-500/40 text-emerald-300":"bg-white/5 border-purple-500/20 text-slate-400 group-hover:text-white group-hover:border-pink-500/30"}`,title:"Copiar comando",children:i?l.jsx(Es,{className:"w-3.5 h-3.5 text-emerald-400"}):l.jsx(tg,{className:"w-3.5 h-3.5"})})})]}),l.jsx("p",{className:"text-slate-300 text-xs leading-relaxed line-clamp-3",children:t.description})]}),l.jsxs("div",{className:"mt-4 pt-3 border-t border-purple-500/15 flex items-center justify-between relative z-10",children:[t.aliases&&t.aliases.length>0?l.jsxs("div",{className:"flex flex-wrap gap-1.5",children:[t.aliases.slice(0,2).map((f,p)=>l.jsxs("span",{className:"font-mono text-[11px] px-2 py-0.5 rounded-md bg-white/5 border border-purple-500/20 text-cyan-300 tracking-wider",style:{letterSpacing:"0.05em"},children:["py!",f]},p)),t.aliases.length>2&&l.jsxs("span",{className:"font-mono text-[10px] px-1.5 py-0.5 rounded text-slate-400",children:["+",t.aliases.length-2]})]}):l.jsx("span",{className:"text-[11px] text-slate-500 font-mono",children:"Slash Oficial"}),l.jsxs("span",{className:"text-[11px] font-bold text-purple-300 group-hover:text-pink-300 transition-colors flex items-center gap-0.5",children:[l.jsx("span",{children:"Detalhes"}),l.jsx(Jx,{className:"w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform"})]})]})]})}function P2({command:t,lang:e="pt"}){const n=e==="en",r=(s=>{const a=s.name||"";return a.includes("daily")?{color:"#E60067",title:n?"✨ Cosmic Daily Reward":"✨ Recompensa Diária Cósmica",desc:n?"You channeled the astral energy and claimed your daily coins!":"Você canalizou a energia astral e resgatou suas moedas diárias!",fields:[{name:n?"🪙 Coins":"🪙 Recompensa",value:"+100 moedas",inline:!0},{name:n?"🔥 Daily Streak":"🔥 Sequência",value:"7 dias (+25 bônus)",inline:!0}],footer:"Pyxie Bot • Discord.js v14"}:a.includes("work")||a.includes("trabalho")?{color:"#8B5CF6",title:n?"💼 Professional Shift: Alchemist":"💼 Expediente: Alquimista Místico",desc:n?"You combined the essence of the Arcane Rose with stardust. Perfect synthesis!":"Você combinou a essência da Rosa Arcana com pó estelar. Síntese perfeita!",fields:[{name:n?"💰 Earnings":"💰 Rendimento",value:"+95 moedas",inline:!0},{name:n?"⭐ Experience":"⭐ Experiência",value:"+15 XP Alquimia",inline:!0}],footer:"Pyxie Carreiras • Cooldown: 3h"}:a.includes("tarot")?{color:"#A855F7",title:n?"🔮 Daily Arcana: The Magician":"🔮 Arcano do Dia: O Mago (I)",desc:n?'"The power of creation and transmutation is alive in your hands today."':'"O poder da criação e transmutação está vivo em suas mãos hoje. Molde seu destino."',fields:[{name:n?"🧭 Orientation":"🧭 Orientação",value:n?"Upright (Direct)":"Em Pé (Direta)",inline:!0},{name:n?"⭐ Arcana Type":"⭐ Tipo de Arcano",value:n?"Major Arcana (01/22)":"Arcano Maior (01/22)",inline:!0}],footer:"Pyxie Tarot • 78 Arcanos em Canvas HD"}:a.includes("casamento")||a.includes("marry")?{color:"#EC4899",title:n?"💍 Matrimonial Bond: Pyxie & Astaroth":"💍 Laço Matrimonial: Pyxie & Astaroth",desc:n?"Eternal union blessed by the cosmic fairies under the Tree of Life.":"União eterna abençoada pelas fadas cósmicas sob a Árvore da Vida.",fields:[{name:n?"💖 Love Bar":"💖 Barra do Amor",value:"100% [██████████]",inline:!0},{name:n?"🌳 Tree Level":"🌳 Nível da Árvore",value:"Nível 3 (+30% Amor)",inline:!0}],footer:"Pyxie Matrimônio & Família"}:{color:"#3B82F6",title:`✨ /${(s.name||"").replace(/^\/+/,"")}`,desc:s.description||(n?"Command executed successfully.":"Comando executado com sucesso."),fields:[{name:"Status",value:"✅ Operacional",inline:!0},{name:n?"Cooldown":"Recarga",value:s.cooldown?`${s.cooldown}s`:"3s",inline:!0}],footer:"Pyxie Discord Bot • 2026"}})(t);return l.jsxs("div",{className:"rounded-xl bg-[#2b2d31] border border-[#1e1f22] p-4 text-[#dbdee1] font-sans text-sm shadow-xl select-none",children:[l.jsxs("div",{className:"flex items-center gap-2.5 mb-3",children:[l.jsx("div",{className:"w-8 h-8 rounded-full overflow-hidden bg-purple-900 border border-purple-500/30 flex-shrink-0",children:l.jsx("img",{src:"/assets/pyxie/pyxie_pixelart_face.png",alt:"Pyxie Avatar",className:"w-full h-full object-contain"})}),l.jsxs("div",{className:"flex items-center gap-1.5 leading-none",children:[l.jsx("span",{className:"font-bold text-white text-sm",children:"Pyxie"}),l.jsx("span",{className:"px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#5865F2] text-white tracking-wide uppercase",children:"BOT"}),l.jsx("span",{className:"text-[11px] text-[#949ba4] ml-1",children:"hoje às 14:32"})]})]}),l.jsxs("div",{className:"rounded-lg bg-[#232428] p-3.5 pl-4 border-l-4 space-y-2.5 transition-all",style:{borderLeftColor:r.color},children:[l.jsx("h4",{className:"font-bold text-white text-sm tracking-tight",children:r.title}),l.jsx("p",{className:"text-xs text-[#dbdee1] leading-relaxed",children:r.desc}),r.fields&&r.fields.length>0&&l.jsx("div",{className:"grid grid-cols-2 gap-3 pt-1",children:r.fields.map((s,a)=>l.jsxs("div",{className:"space-y-0.5",children:[l.jsx("span",{className:"text-[11px] font-bold text-[#b5bac1] block",children:s.name}),l.jsx("span",{className:"text-xs text-white font-medium block",children:s.value})]},a))}),l.jsxs("div",{className:"pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-[#949ba4]",children:[l.jsx("span",{children:r.footer}),l.jsx("span",{className:"font-mono text-[9px] opacity-70",children:"Embed v2"})]})]})]})}function L2({command:t,onClose:e,lang:n="pt",t:i}){const[r,s]=ne.useState(!1),[a,o]=ne.useState(!1);if(!t)return null;const u=(t.name||"").replace(/^\/+/,""),f=`/${u}`,p=()=>{navigator.clipboard.writeText(f),s(!0),setTimeout(()=>s(!1),2e3)},h=()=>{const x=`${window.location.origin}/wiki#${u}`;navigator.clipboard.writeText(x),o(!0),setTimeout(()=>o(!1),2e3)};return l.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in",children:l.jsxs("div",{className:"relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0e071a] border border-purple-500/30 p-6 sm:p-8 shadow-2xl space-y-6",onClick:x=>x.stopPropagation(),children:[l.jsx("button",{onClick:e,className:"absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors",title:i?i("cmdModal.close"):"Fechar (ESC)",children:l.jsx(As,{className:"w-5 h-5"})}),l.jsxs("div",{className:"space-y-2",children:[l.jsxs("div",{className:"inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 font-mono font-bold text-xs",children:[l.jsx(vi,{className:"w-3.5 h-3.5"}),l.jsx("span",{children:f})]}),l.jsx("h3",{className:"font-title font-extrabold text-2xl text-white tracking-tight",children:f}),l.jsx("p",{className:"text-slate-300 text-sm leading-relaxed",children:t.description})]}),l.jsxs("div",{className:"flex flex-wrap items-center gap-3 pt-1",children:[l.jsxs("button",{onClick:p,className:`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${r?"bg-emerald-500/20 border border-emerald-500/40 text-emerald-300":"bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-neon-pink"}`,children:[r?l.jsx(Es,{className:"w-4 h-4 text-emerald-300"}):l.jsx(tg,{className:"w-4 h-4"}),l.jsx("span",{children:r?i?i("cmdModal.copiedCmd"):"Comando Copiado! ✨":i?i("cmdModal.copyCmd"):"Copiar Sintaxe"})]}),l.jsxs("button",{onClick:h,className:`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${a?"bg-emerald-500/20 border border-emerald-500/40 text-emerald-300":"bg-white/5 border-purple-500/25 text-purple-200 hover:bg-white/10 hover:text-white"}`,children:[a?l.jsx(Es,{className:"w-4 h-4 text-emerald-300"}):l.jsx(fs,{className:"w-4 h-4"}),l.jsx("span",{children:a?i?i("cmdModal.copiedLink"):"Link Copiado! 🔗":i?i("cmdModal.copyLink"):"Copiar Deep Link"})]})]}),l.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white/5 border border-purple-500/15 text-xs",children:[l.jsxs("div",{className:"flex items-center gap-2.5",children:[l.jsx(zy,{className:"w-4 h-4 text-amber-400 flex-shrink-0"}),l.jsxs("div",{children:[l.jsx("span",{className:"text-[10px] text-slate-400 uppercase tracking-wider block font-bold",children:i?i("cmdModal.cooldown"):"Cooldown"}),l.jsx("span",{className:"font-semibold text-slate-200",children:t.cooldown?`${t.cooldown}s`:i?i("cmdModal.cooldownSeconds"):"3 segundos"})]})]}),l.jsxs("div",{className:"flex items-center gap-2.5",children:[l.jsx(Ia,{className:"w-4 h-4 text-emerald-400 flex-shrink-0"}),l.jsxs("div",{children:[l.jsx("span",{className:"text-[10px] text-slate-400 uppercase tracking-wider block font-bold",children:i?i("cmdModal.permissions"):"Permissões"}),l.jsx("span",{className:"font-semibold text-slate-200",children:"@everyone"})]})]}),l.jsxs("div",{className:"flex items-center gap-2.5",children:[l.jsx(vi,{className:"w-4 h-4 text-cyan-400 flex-shrink-0"}),l.jsxs("div",{children:[l.jsx("span",{className:"text-[10px] text-slate-400 uppercase tracking-wider block font-bold",children:i?i("cmdModal.platform"):"Plataforma"}),l.jsx("span",{className:"font-semibold text-slate-200",children:i?i("cmdModal.platformVal"):"Slash & Prefixo"})]})]})]}),t.aliases&&t.aliases.length>0&&l.jsxs("div",{className:"space-y-2",children:[l.jsx("span",{className:"text-xs font-bold text-slate-400 uppercase tracking-wider block",children:i?i("cmdModal.aliasesTitle"):"Prefixos Alternativos (py!)"}),l.jsx("div",{className:"flex flex-wrap gap-2",children:t.aliases.map((x,_)=>l.jsxs("span",{className:"px-2.5 py-1 rounded-lg bg-purple-900/40 border border-purple-500/30 text-cyan-300 font-mono text-xs font-medium tracking-wider",style:{letterSpacing:"0.05em"},children:["py!",x]},_))})]}),l.jsxs("div",{className:"space-y-2 pt-2",children:[l.jsxs("div",{className:"flex items-center justify-between",children:[l.jsx("span",{className:"text-xs font-bold text-slate-400 uppercase tracking-wider",children:i?i("cmdModal.liveSimulation"):"Resposta Real no Discord"}),l.jsx("span",{className:"text-[11px] text-purple-400 font-mono",children:"Live Simulation"})]}),l.jsx(P2,{command:t,lang:n})]})]})})}function D2({isOpen:t,onClose:e,commands:n=[],onSelectCommand:i,t:r}){const[s,a]=ne.useState(""),[o,c]=ne.useState(0),u=ne.useRef(null);ne.useEffect(()=>{t&&(a(""),c(0),setTimeout(()=>{var p;return(p=u.current)==null?void 0:p.focus()},50))},[t]);const f=n.filter(p=>{var d,g,v,w;const h=s.toLowerCase().trim();if(!h)return!0;const x=(d=p.name)==null?void 0:d.toLowerCase().includes(h),_=(g=p.description)==null?void 0:g.toLowerCase().includes(h),S=(v=p.aliases)==null?void 0:v.some(R=>R.toLowerCase().includes(h)),m=(w=p.category)==null?void 0:w.toLowerCase().includes(h);return x||_||S||m}).slice(0,8);return ne.useEffect(()=>{if(!t)return;const p=h=>{h.key==="Escape"?e():h.key==="ArrowDown"?(h.preventDefault(),c(x=>(x+1)%Math.max(1,f.length))):h.key==="ArrowUp"?(h.preventDefault(),c(x=>(x-1+f.length)%Math.max(1,f.length))):h.key==="Enter"&&(h.preventDefault(),f[o]&&(i(f[o]),e()))};return window.addEventListener("keydown",p),()=>window.removeEventListener("keydown",p)},[t,f,o,e,i]),t?l.jsx("div",{className:"fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-fade-in",onClick:e,children:l.jsxs("div",{className:"relative w-full max-w-xl rounded-2xl bg-[#0e071a] border border-purple-500/30 shadow-2xl overflow-hidden",onClick:p=>p.stopPropagation(),children:[l.jsxs("div",{className:"flex items-center px-4 py-3.5 border-b border-purple-500/20 bg-white/5",children:[l.jsx($l,{className:"w-5 h-5 text-pink-400 mr-3 flex-shrink-0"}),l.jsx("input",{ref:u,type:"text",value:s,onChange:p=>{a(p.target.value),c(0)},placeholder:r?r("palette.placeholder"):"Buscar comandos por nome, palavra-chave ou categoria...",className:"w-full bg-transparent text-sm text-white placeholder-slate-400 outline-none font-sans"}),l.jsx("button",{onClick:e,className:"p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors",children:l.jsx(As,{className:"w-4 h-4"})})]}),l.jsx("div",{className:"max-h-80 overflow-y-auto p-2 divide-y divide-white/5",children:f.length>0?f.map((p,h)=>l.jsxs("div",{onClick:()=>{i(p),e()},onMouseEnter:()=>c(h),className:`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all ${o===h?"bg-gradient-to-r from-pink-600/30 to-purple-600/30 border border-pink-500/40 text-white":"hover:bg-white/5 text-slate-300"}`,children:[l.jsxs("div",{className:"flex items-center gap-3 min-w-0",children:[l.jsx("div",{className:"w-8 h-8 rounded-lg bg-white/5 border border-purple-500/20 flex items-center justify-center text-pink-400 flex-shrink-0",children:l.jsx(vi,{className:"w-4 h-4"})}),l.jsxs("div",{className:"min-w-0",children:[l.jsxs("span",{className:"font-mono font-bold text-sm text-white block truncate",children:["/",(p.name||"").replace(/^\/+/,"")]}),l.jsx("span",{className:"text-xs text-slate-400 truncate block",children:p.description})]})]}),l.jsxs("div",{className:"flex items-center gap-2 flex-shrink-0 ml-3",children:[p.aliases&&p.aliases[0]&&l.jsxs("span",{className:"hidden sm:inline-block font-mono text-[10px] px-2 py-0.5 rounded bg-white/5 text-cyan-300",children:["py!",p.aliases[0]]}),l.jsx(jy,{className:"w-4 h-4 text-purple-400 opacity-60"})]})]},p.name||h)):l.jsx("div",{className:"p-8 text-center text-slate-400 text-sm",children:r?r("palette.empty"):`Nenhum comando encontrado para "${s}".`})}),l.jsxs("div",{className:"px-4 py-2.5 bg-black/40 border-t border-purple-500/15 flex items-center justify-between text-[11px] text-slate-400 font-mono",children:[l.jsxs("div",{className:"flex items-center gap-3",children:[l.jsx("span",{children:r?r("palette.navigate"):"↑↓ Navegar"}),l.jsx("span",{children:r?r("palette.open"):"↵ Abrir Detalhes"})]}),l.jsx("span",{children:r?r("palette.esc"):"ESC para fechar"})]})]})}):null}function Og({t,lang:e}){var S;const[n,i]=ne.useState([]),[r,s]=ne.useState("todos"),[a,o]=ne.useState(""),[c,u]=ne.useState(null),[f,p]=ne.useState(!1);ne.useEffect(()=>{fetch(`/api/commands?lang=${e}`).then(m=>m.json()).then(m=>{if(m&&m.success&&Array.isArray(m.modules)){const d=m.modules.filter(g=>g.commands&&g.commands.length>0);i(d)}}).catch(m=>console.error("Erro ao buscar comandos:",m))},[e]),ne.useEffect(()=>{const m=d=>{(d.metaKey||d.ctrlKey)&&d.key==="k"&&(d.preventDefault(),p(!0))};return window.addEventListener("keydown",m),()=>window.removeEventListener("keydown",m)},[]),ne.useEffect(()=>{if(n.length===0)return;const m=window.location.hash.replace("#","").toLowerCase();if(!m)return;const g=n.flatMap(v=>v.commands||[]).find(v=>{var w,R;return((w=v.name)==null?void 0:w.toLowerCase())===m||`py-${v.name}`.toLowerCase()===m||((R=v.aliases)==null?void 0:R.some(E=>E.toLowerCase()===m))});if(g){u(g);const v=(g.name||"").replace(/^\/+/,""),w=document.getElementById(`cmd-${v}`)||document.getElementById(`cmd-${g.name}`);w&&setTimeout(()=>w.scrollIntoView({behavior:"smooth",block:"center"}),300)}},[n]);const h=n.flatMap(m=>m.commands||[]),_=(r==="todos"?h:((S=n.find(m=>m.id===r))==null?void 0:S.commands)||[]).filter(m=>{var R,E,A;const d=a.toLowerCase(),g=(R=m.name)==null?void 0:R.toLowerCase().includes(d),v=(E=m.description)==null?void 0:E.toLowerCase().includes(d),w=(A=m.aliases)==null?void 0:A.some(N=>N.toLowerCase().includes(d));return g||v||w});return l.jsxs("section",{id:"comandos",className:"py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:[l.jsxs("div",{className:"text-center mb-10",children:[l.jsxs("div",{className:"inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold mb-3 shadow-sm",children:[l.jsx(bs,{className:"w-3.5 h-3.5 text-pink-400"}),l.jsx("span",{children:t("wiki.badge")})]}),l.jsx("h2",{className:"font-title font-black text-3xl sm:text-5xl text-white tracking-tight",children:t("wiki.title")}),l.jsx("p",{className:"text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mt-3",children:t("wiki.subtitle")})]}),l.jsx("div",{className:"max-w-2xl mx-auto mb-8 relative",children:l.jsxs("div",{onClick:()=>p(!0),className:"relative flex items-center cursor-pointer group",children:[l.jsx($l,{className:"absolute left-4 w-5 h-5 text-slate-400 group-hover:text-pink-400 transition-colors pointer-events-none"}),l.jsx("input",{type:"text",readOnly:!0,value:a,onClick:()=>p(!0),placeholder:t("wiki.searchPlaceholder"),className:"w-full pl-12 pr-24 py-3.5 rounded-2xl bg-white/5 border border-purple-500/25 group-hover:border-pink-500/60 text-sm text-white placeholder-slate-400 outline-none backdrop-blur-xl transition-all shadow-lg cursor-pointer"}),l.jsxs("div",{className:"absolute right-3.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-[11px] font-mono font-bold text-slate-300 flex items-center gap-1",children:[l.jsx("span",{children:"Ctrl"}),l.jsx("span",{children:"K"})]})]})}),l.jsxs("div",{className:"flex flex-wrap items-center justify-center gap-2 mb-10",children:[l.jsxs("button",{onClick:()=>s("todos"),className:`px-4 py-2 rounded-xl text-xs font-bold transition-all ${r==="todos"?"bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-neon-pink scale-105":"bg-white/5 border border-purple-500/20 text-slate-300 hover:bg-white/10 hover:text-white"}`,children:[t("catalog.all")," (",h.length,")"]}),n.map(m=>{var d;return l.jsxs("button",{onClick:()=>s(m.id),className:`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${r===m.id?"bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-neon-pink scale-105":"bg-white/5 border border-purple-500/20 text-slate-300 hover:bg-white/10 hover:text-white"}`,children:[l.jsx("span",{children:m.title||m.name}),l.jsxs("span",{className:"text-[10px] opacity-75 font-mono",children:["(",((d=m.commands)==null?void 0:d.length)||0,")"]})]},m.id)})]}),_.length>0?l.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5",children:_.map(m=>l.jsx(R2,{command:m,onSelect:d=>u(d),t},m.name))}):l.jsx("div",{className:"text-center py-16 text-slate-400 text-sm",children:t("catalog.empty")}),l.jsx(D2,{isOpen:f,onClose:()=>p(!1),commands:h,onSelectCommand:m=>u(m),t}),c&&l.jsx(L2,{command:c,onClose:()=>u(null),lang:e,t})]})}function lf({t,lang:e}){const[n,i]=ne.useState([]),r=[{id:"23798670825",titulo:"Kuromi Sanrio Boneca de pelúcia fofa 25cm Kuromi Sanrio",titulo_en:"Kuromi Sanrio 25cm Cute Plush Doll",preco:"R$ 55,99",preco_en:"$10.77",tag:"Pelúcia Sanrio",tag_en:"Sanrio Plush",link:"https://s.shopee.com.br/1BMdNQEU79",imagem:"https://down-br.img.susercontent.com/file/br-11134207-7r98o-mbe0k65jvlov9d"},{id:"58265449372",titulo:"Camiseta Feminina Premium Hello Kitty Kuromi 100% Algodão",titulo_en:"Premium Hello Kitty Kuromi 100% Cotton Women T-Shirt",preco:"R$ 34,90",preco_en:"$6.71",tag:"Moda & Estilo",tag_en:"Fashion & Goth",link:"https://s.shopee.com.br/1AfzHIvTw",imagem:"https://down-br.img.susercontent.com/file/sg-11134201-8257t-mrez4efi09vpc3"},{id:"28812198611",titulo:"EEBR Vintage Goth Espinhos Casal Anéis Para Homens Mulheres",titulo_en:"Vintage Goth Thorn Couple Rings for Men & Women",preco:"R$ 12,06",preco_en:"$2.32",tag:"Acessório Goth",tag_en:"Goth Jewelry",link:"https://s.shopee.com.br/LnWNtHeo2",imagem:"https://down-br.img.susercontent.com/file/sg-11134201-7rdy7-m0j7wbk9ta7y39"},{id:"58212898323",titulo:"Anel gótico camafeu roxo pedra roxa oval moldura ornamental",titulo_en:"Gothic Purple Cameo Ring with Oval Stone",preco:"R$ 29,90",preco_en:"$5.75",tag:"Acessório Goth",tag_en:"Goth Jewelry",link:"https://s.shopee.com.br/W6waCH1T5",imagem:"https://down-br.img.susercontent.com/file/br-11134207-820ly-mppd70swjy81c9"}];ne.useEffect(()=>{fetch("/api/showcase").then(a=>a.json()).then(a=>{a&&a.success&&Array.isArray(a.items)&&a.items.length>0?i(a.items.slice(0,4)):i(r)}).catch(()=>{fetch("/api/shopee/showcase").then(a=>a.json()).then(a=>{a&&a.success&&Array.isArray(a.items)&&a.items.length>0?i(a.items.slice(0,4)):i(r)}).catch(()=>i(r))})},[]);const s=e==="pt";return l.jsx("section",{className:"py-16 md:py-24 border-t border-purple-500/10 relative",children:l.jsxs("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:[l.jsxs("div",{className:"text-center mb-12",children:[l.jsxs("div",{className:"inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-3 shadow-sm",children:[l.jsx(Qy,{className:"w-3.5 h-3.5 text-amber-400"}),l.jsx("span",{children:"Setup & Lifestyle"})]}),l.jsx("h2",{className:"font-title font-black text-3xl sm:text-4xl text-white tracking-tight",children:t("shopee.title")}),l.jsx("p",{className:"text-slate-300 text-sm sm:text-base max-w-xl mx-auto mt-2",children:t("shopee.subtitle")})]}),l.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6",children:n.map((a,o)=>{const c=s?a.titulo:a.titulo_en||a.titulo,u=s?a.preco:a.preco_en||a.preco,f=s?a.tag:a.tag_en||a.tag;return l.jsxs("a",{href:a.link||"/promo",target:"_blank",rel:"noopener noreferrer",className:"group rounded-3xl glass-panel border border-purple-500/20 hover:border-pink-500/50 p-4 transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-neon-pink flex flex-col justify-between overflow-hidden",children:[l.jsxs("div",{className:"relative rounded-2xl overflow-hidden aspect-square mb-4 bg-purple-950/40",children:[l.jsx("img",{src:a.imagem,alt:c,className:"w-full h-full object-cover group-hover:scale-105 transition-transform duration-500",loading:"lazy"}),l.jsxs("div",{className:"absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[11px] font-bold text-pink-300 border border-pink-500/30 flex items-center gap-1",children:[l.jsx(Jy,{className:"w-3 h-3 text-pink-400"}),l.jsx("span",{children:f})]})]}),l.jsxs("div",{className:"space-y-2",children:[l.jsx("h3",{className:"font-title font-bold text-sm text-slate-100 group-hover:text-pink-300 transition-colors line-clamp-2",children:c}),l.jsxs("div",{className:"flex items-center justify-between pt-2 border-t border-purple-500/15",children:[l.jsx("span",{className:"font-title font-black text-lg text-amber-300",children:u}),l.jsx("span",{className:"text-xs font-bold text-slate-300 group-hover:text-white flex items-center gap-1",children:t("shopee.cta")})]})]})]},a.id||o)})})]})})}function k2({t,lang:e,stats:n}){return l.jsxs("div",{className:"space-y-6",children:[l.jsx(d1,{t,stats:n}),l.jsx(A2,{t}),l.jsx(C2,{t}),l.jsx(N2,{t}),l.jsx(Og,{t,lang:e}),l.jsx(lf,{t,lang:e})]})}function I2({t,lang:e}){const n=e==="en",[i,r]=ne.useState(()=>{const o=(window.location.hash||"").toLowerCase().replace("#","").trim();return o?o.startsWith("py-")||o==="comandos"||o==="commands"?"commands":o.includes("eco")||o.includes("moeda")?"economy":o.includes("trabalho")||o.includes("carreira")||o.includes("vocacao")?"careers":o.includes("tarot")||o.includes("album")||o.includes("arcano")?"tarot":o.includes("casamento")||o.includes("social")||o.includes("familia")?"marriage":o.includes("faq")||o.includes("duvida")?"faq":"overview":"overview"});ne.useEffect(()=>{document.title=n?"Pyxie Official Wiki & Community Guide | Discord Bot":"Wiki Oficial & Enciclopédia da Pyxie | Discord Bot"},[n]),ne.useEffect(()=>{const o=()=>{const c=(window.location.hash||"").toLowerCase().replace("#","").trim();if(!c){r("overview");return}c.startsWith("py-")||c==="comandos"||c==="commands"?r("commands"):c.includes("eco")||c.includes("moeda")?r("economy"):c.includes("trabalho")||c.includes("carreira")||c.includes("vocacao")?r("careers"):c.includes("tarot")||c.includes("album")||c.includes("arcano")?r("tarot"):c.includes("casamento")||c.includes("social")||c.includes("familia")?r("marriage"):(c.includes("faq")||c.includes("duvida"))&&r("faq")};return window.addEventListener("hashchange",o),()=>window.removeEventListener("hashchange",o)},[]);const s=[{id:"overview",label:n?"Community & Sanctuary":"Comunidade & Santuário",icon:nd,badge:"Lore"},{id:"economy",label:n?"Living Economy":"Economia Viva",icon:Ts,badge:"Coins"},{id:"careers",label:n?"16 Vocations & Work":"16 Vocações & Trabalho",icon:ga,badge:"Minigames"},{id:"tarot",label:n?"78 Arcana Tarot":"Tarot dos 78 Arcanos",icon:St,badge:"HD Canvas"},{id:"marriage",label:n?"Marriage & Family":"Casamento & Família",icon:ui,badge:"Social"},{id:"commands",label:n?"Commands Catalog":"Catálogo de Comandos",icon:vi,badge:"Ctrl+K"},{id:"faq",label:n?"FAQ & Help":"Dúvidas & FAQ",icon:Oy,badge:"Guia"}],a=n?[{q:"How do I add Pyxie to my Discord server?",a:'Click on the "Add Pyxie" button in the navbar or visit /invite to authorize Pyxie with slash commands and message attachments permissions.'},{q:"Do slash commands work in all channels?",a:"Yes, unless server administrators restrict command permissions in Server Settings > Integrations."},{q:"What is the daily economy reset time?",a:"Daily rewards (/py-daily) reset every 24 hours per user. Daily streaks have a 48h grace window."},{q:"Are all 78 Tarot cards available in the Album?",a:"Yes! All 22 Major Arcana and 56 Minor Arcana can be collected, viewed, and shared in HD via /py-album."},{q:"How does the Marriage Tree of Life work?",a:"Married partners can water the Tree of Life every 12h, granting +10% love and unlocking permanent rewards."},{q:"Is Pyxie completely free to use?",a:"100% free! All economic commands, minigames, tarot cards, and careers are accessible without any paywalls."}]:[{q:"Como adiciono a Pyxie ao meu servidor?",a:'Basta clicar no botão "Adicionar Pyxie" no topo da página ou acessar /invite para conceder permissões de comandos slash.'},{q:"Os comandos funcionam por barra (/) e prefixo (py!)?",a:"Sim! Todos os comandos possuem registro oficial por barra no Discord e aliases por prefixo py! correspondentes."},{q:"Como funciona o Álbum de Tarot dos 78 Arcanos?",a:"Ao tirar sua carta do dia (/py-tarot), você pode colá-la no seu álbum (/py-album). Colecionar cartas desbloqueia conquistas e moedinhas!"},{q:"Como evoluir o casamento no bot?",a:"Após casar (/py-casamento), você e seu cônjuge podem regar a Árvore da Vida a cada 12h, depositar no Cofre do Casal e ter encontros românticos!"},{q:"Com que frequência posso trabalhar?",a:"O expediente (/py-work) tem recarga de 3 horas. Cada profissão possui minigames técnicos com perguntas interativas de 45 segundos."},{q:"A Pyxie é totalmente gratuita?",a:"Sim! Todos os 37 comandos, sistemas de economia, minigames, tarot e casamento são 100% acessíveis e gratuitos."}];return l.jsxs("div",{className:"min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12",children:[l.jsxs("div",{className:"text-center space-y-4 max-w-3xl mx-auto",children:[l.jsxs("div",{className:"inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold shadow-sm",children:[l.jsx(bs,{className:"w-3.5 h-3.5 text-pink-400"}),l.jsx("span",{children:n?"Official Documentation • Pyxie & Cringelândia":"Enciclopédia Oficial • Pyxie & Cringelândia"})]}),l.jsx("h1",{className:"font-title font-black text-3xl sm:text-5xl md:text-6xl bg-gradient-to-r from-white via-pink-200 to-purple-300 bg-clip-text text-transparent tracking-tight",children:n?"Official Guide & Interactive Wiki":"Guia Oficial & Enciclopédia Interativa"}),l.jsx("p",{className:"text-slate-300 text-sm sm:text-base leading-relaxed",children:n?"Explore deep documentation for Pyxie: live economy, 22 vocations, 78 Tarot Arcana, marriage dynamics and command catalog.":"Explore explicações detalhadas sobre a economia mágica, 22 vocações profissionais, o oráculo de tarot dos 78 arcanos, matrimônio e comandos oficiais."}),l.jsxs("div",{className:"flex flex-wrap items-center justify-center gap-3 pt-2",children:[l.jsxs("span",{className:"px-3 py-1 rounded-xl bg-white/5 border border-purple-500/20 text-xs font-mono text-pink-300 flex items-center gap-1.5",children:[l.jsx(St,{className:"w-3 h-3"})," 78 Arcanos em HD"]}),l.jsxs("span",{className:"px-3 py-1 rounded-xl bg-white/5 border border-purple-500/20 text-xs font-mono text-purple-300 flex items-center gap-1.5",children:[l.jsx(ga,{className:"w-3 h-3"})," 22 Vocações Únicas"]}),l.jsxs("span",{className:"px-3 py-1 rounded-xl bg-white/5 border border-purple-500/20 text-xs font-mono text-emerald-300 flex items-center gap-1.5",children:[l.jsx(Np,{className:"w-3 h-3"})," 100% Gratuita & Segura"]}),l.jsxs("span",{className:"px-3 py-1 rounded-xl bg-white/5 border border-purple-500/20 text-xs font-mono text-amber-300 flex items-center gap-1.5",children:[l.jsx(s1,{className:"w-3 h-3"})," Bilíngue PT-BR & EN"]})]})]}),l.jsx("div",{className:"flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-purple-500/20",children:s.map(o=>{const c=o.icon,u=i===o.id;return l.jsxs("button",{onClick:()=>{r(o.id),window.location.hash=o.id==="commands"?"comandos":o.id},className:`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${u?"bg-gradient-to-r from-pink-600 to-purple-600 text-white border-pink-400/50 shadow-neon-pink":"bg-white/5 border-purple-500/15 text-slate-300 hover:text-white hover:bg-white/10"}`,children:[l.jsx(c,{className:`w-4 h-4 ${u?"text-white":"text-purple-400"}`}),l.jsx("span",{children:o.label}),o.badge&&l.jsx("span",{className:`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${u?"bg-black/30 text-pink-200":"bg-purple-500/20 text-purple-300"}`,children:o.badge})]},o.id)})}),i==="overview"&&l.jsx("div",{className:"space-y-8 animate-fadeIn",children:l.jsxs("div",{className:"p-6 sm:p-8 rounded-3xl glass-panel border border-purple-500/20 space-y-6",children:[l.jsxs("div",{className:"flex items-center gap-3",children:[l.jsx("div",{className:"p-3 rounded-2xl bg-pink-500/15 text-pink-400 border border-pink-500/30",children:l.jsx(nd,{className:"w-6 h-6"})}),l.jsxs("div",{children:[l.jsx("h2",{className:"font-title font-extrabold text-2xl sm:text-3xl text-white",children:n?"A Welcoming Sanctuary for Neurodivergent Minds":"Um Santuário para Mentes Neurodivergentes"}),l.jsx("p",{className:"text-slate-400 text-xs sm:text-sm",children:n?"Compassionate community culture & safe haven on Discord":"Cultura comunitária, empatia e ambiente acolhedor"})]})]}),l.jsx("p",{className:"text-slate-200 text-sm sm:text-base leading-relaxed",children:n?"The official Pyxie community (Cringelândia) was created to be a warm, gentle, and judgment-free home. We proudly embrace neurodivergent individuals — autistic people (ASD), ADHD, bipolarity, depression, anxiety, and unique perception styles. Special interests (hyperfocus), creative minds, and honest conversations are celebrated.":"A comunidade oficial da Pyxie (Cringelândia) nasceu com um propósito genuíno: ser um porto seguro, caloroso e livre de julgamentos. Abrigamos com orgulho mentes neurodivergentes — pessoas no espectro autista (TEA), TDAH, bipolaridade, depressão, ansiedade e hiperfocos. Acreditamos que quem enxerga o mundo por ângulos singulares enriquece profundamente a nossa vivência."}),l.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4 pt-2",children:[l.jsxs("div",{className:"p-4 rounded-2xl bg-white/5 border border-purple-500/15 space-y-2",children:[l.jsxs("div",{className:"flex items-center gap-2 text-pink-300 font-title font-bold text-sm",children:[l.jsx(Np,{className:"w-4 h-4 text-pink-400"}),l.jsx("span",{children:n?"Zero Tolerance for Ableism":"Tolerância Zero contra Capacitismo"})]}),l.jsx("p",{className:"text-xs text-slate-300 leading-relaxed",children:n?"Hostility, harassment, mockery, or disrespect towards neurodivergent traits result in swift and irrevocable removal.":"Preconceito, piadas de mau gosto ou qualquer hostilidade contra características neurodivergentes resultam em banimento imediato."})]}),l.jsxs("div",{className:"p-4 rounded-2xl bg-white/5 border border-purple-500/15 space-y-2",children:[l.jsxs("div",{className:"flex items-center gap-2 text-purple-300 font-title font-bold text-sm",children:[l.jsx(ui,{className:"w-4 h-4 text-purple-400"}),l.jsx("span",{children:n?"Respect for Autistic Creators":"Proteção à Arte e Expressão"})]}),l.jsx("p",{className:"text-xs text-slate-300 leading-relaxed",children:n?"Member artwork in the Museum is protected by community copyright. Creative projects and personal boundaries are safeguarded.":"Obras compartilhadas no Museu possuem proteção visual contra cópia indevida. Respeitamos a autoria e os limites de cada criador."})]})]}),l.jsxs("div",{className:"space-y-3 pt-4",children:[l.jsxs("h3",{className:"font-title font-bold text-lg text-white flex items-center gap-2",children:[l.jsx(ql,{className:"w-4 h-4 text-pink-400"}),l.jsx("span",{children:n?"One-Word Identity Roles":"Cargos Concisos de Uma Palavra"})]}),l.jsx("p",{className:"text-xs text-slate-400",children:n?"In our guild, community roles honor individuality without bureaucratic titles:":"Nossos cargos comunitários adotam títulos elegantes e poéticos que traduzem a energia de cada membro:"}),l.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-3 gap-3",children:[l.jsxs("div",{className:"p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20",children:[l.jsx("span",{className:"font-mono font-bold text-pink-400 text-sm",children:"Peculiar"}),l.jsx("p",{className:"text-xs text-slate-300 mt-1",children:n?"For minds with authentic and unique perspectives.":"Para mentes que enxergam a vida com autenticidade única."})]}),l.jsxs("div",{className:"p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20",children:[l.jsx("span",{className:"font-mono font-bold text-purple-400 text-sm",children:"Mágico"}),l.jsx("p",{className:"text-xs text-slate-300 mt-1",children:n?"For those who bring creativity and joy to daily talks.":"Para quem traz encantamento, ideias e boas energias."})]}),l.jsxs("div",{className:"p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20",children:[l.jsx("span",{className:"font-mono font-bold text-amber-400 text-sm",children:"Travesso"}),l.jsx("p",{className:"text-xs text-slate-300 mt-1",children:n?"Playful spirit reflecting Pyxie’s rebel energy.":"O espírito rebelde e divertido da própria Pyxie."})]})]})]}),l.jsxs("div",{className:"space-y-4 pt-4 border-t border-purple-500/15",children:[l.jsxs("h3",{className:"font-title font-bold text-lg text-white flex items-center gap-2",children:[l.jsx(bs,{className:"w-4 h-4 text-pink-400"}),l.jsx("span",{children:n?"Explore the 6 System Guides & Chapters":"Explore os 6 Capítulos da Enciclopédia"})]}),l.jsx("p",{className:"text-xs text-slate-400",children:n?"Select any chapter below to explore deep mechanics, rules, and live commands:":"Navegue pelos capítulos completos com explicações detalhadas, regras, fórmulas e atalhos:"}),l.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1",children:[l.jsxs("div",{onClick:()=>{r("economy"),window.location.hash="economy"},className:"p-5 rounded-2xl glass-panel border border-amber-500/20 hover:border-amber-500/50 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-neon-pink group",children:[l.jsxs("div",{className:"flex items-center justify-between mb-3",children:[l.jsx("span",{className:"text-2xl p-2 rounded-xl bg-amber-500/10 border border-amber-500/20",children:"🪙"}),l.jsx("span",{className:"text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300",children:"Capítulo 02"})]}),l.jsx("h4",{className:"font-title font-bold text-white text-base group-hover:text-amber-300 transition-colors",children:n?"Living Economy":"Economia Mágica"}),l.jsx("p",{className:"text-xs text-slate-300 mt-1 leading-relaxed",children:n?"Dual-currency mechanics, daily rewards, streaks, and the 10s web bonus portal.":"Moedinhas, Feijões Mágicos raros, bônus diários, streaks e portal web."}),l.jsx("div",{className:"mt-4 flex items-center text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform",children:l.jsx("span",{children:n?"Read Chapter ➔":"Ler Capítulo ➔"})})]}),l.jsxs("div",{onClick:()=>{r("careers"),window.location.hash="careers"},className:"p-5 rounded-2xl glass-panel border border-purple-500/20 hover:border-purple-500/50 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-neon-pink group",children:[l.jsxs("div",{className:"flex items-center justify-between mb-3",children:[l.jsx("span",{className:"text-2xl p-2 rounded-xl bg-purple-500/10 border border-purple-500/20",children:"💼"}),l.jsx("span",{className:"text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300",children:"Capítulo 03"})]}),l.jsx("h4",{className:"font-title font-bold text-white text-base group-hover:text-purple-300 transition-colors",children:n?"22 Vocations & Work":"22 Vocações & Trabalho"}),l.jsx("p",{className:"text-xs text-slate-300 mt-1 leading-relaxed",children:n?"Clock in every 3h, solve 45s thematic challenges, earn XP and senior promotions.":"Turnos de 3 horas com minigames técnicos de 45 segundos, XP e promoções."}),l.jsx("div",{className:"mt-4 flex items-center text-xs font-bold text-purple-400 group-hover:translate-x-1 transition-transform",children:l.jsx("span",{children:n?"Read Chapter ➔":"Ler Capítulo ➔"})})]}),l.jsxs("div",{onClick:()=>{r("tarot"),window.location.hash="tarot"},className:"p-5 rounded-2xl glass-panel border border-pink-500/20 hover:border-pink-500/50 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-neon-pink group",children:[l.jsxs("div",{className:"flex items-center justify-between mb-3",children:[l.jsx("span",{className:"text-2xl p-2 rounded-xl bg-pink-500/10 border border-pink-500/20",children:"🔮"}),l.jsx("span",{className:"text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300",children:"Capítulo 04"})]}),l.jsx("h4",{className:"font-title font-bold text-white text-base group-hover:text-pink-300 transition-colors",children:n?"78 Arcana Tarot Oracle":"Tarot dos 78 Arcanos"}),l.jsx("p",{className:"text-xs text-slate-300 mt-1 leading-relaxed",children:n?"Daily card reading in HD canvas, collectible album, arcane bribes, and achievements.":"Tiragem diária em tela HD, álbum colecionável de cartas e suborno arcano."}),l.jsx("div",{className:"mt-4 flex items-center text-xs font-bold text-pink-400 group-hover:translate-x-1 transition-transform",children:l.jsx("span",{children:n?"Read Chapter ➔":"Ler Capítulo ➔"})})]}),l.jsxs("div",{onClick:()=>{r("marriage"),window.location.hash="marriage"},className:"p-5 rounded-2xl glass-panel border border-rose-500/20 hover:border-rose-500/50 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-neon-pink group",children:[l.jsxs("div",{className:"flex items-center justify-between mb-3",children:[l.jsx("span",{className:"text-2xl p-2 rounded-xl bg-rose-500/10 border border-rose-500/20",children:"💍"}),l.jsx("span",{className:"text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300",children:"Capítulo 05"})]}),l.jsx("h4",{className:"font-title font-bold text-white text-base group-hover:text-rose-300 transition-colors",children:n?"Marriage & Family":"Casamento & Família"}),l.jsx("p",{className:"text-xs text-slate-300 mt-1 leading-relaxed",children:n?"Tree of life watering every 12h, shared Love Vault with 5% daily interest, and children.":"Árvore da Vida a cada 12h, cofre do casal com rendimento diário e filhos."}),l.jsx("div",{className:"mt-4 flex items-center text-xs font-bold text-rose-400 group-hover:translate-x-1 transition-transform",children:l.jsx("span",{children:n?"Read Chapter ➔":"Ler Capítulo ➔"})})]}),l.jsxs("div",{onClick:()=>{r("commands"),window.location.hash="comandos"},className:"p-5 rounded-2xl glass-panel border border-cyan-500/20 hover:border-cyan-500/50 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-neon-pink group",children:[l.jsxs("div",{className:"flex items-center justify-between mb-3",children:[l.jsx("span",{className:"text-2xl p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20",children:"⚙️"}),l.jsx("span",{className:"text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300",children:"Capítulo 06"})]}),l.jsx("h4",{className:"font-title font-bold text-white text-base group-hover:text-cyan-300 transition-colors",children:n?"Commands Catalog":"Catálogo de Comandos"}),l.jsx("p",{className:"text-xs text-slate-300 mt-1 leading-relaxed",children:n?"Interactive documentation with fuzzy search (Ctrl+K), category filters and live discord embeds.":"Documentação completa com busca fuzzy (Ctrl+K), filtros e embeds ao vivo."}),l.jsx("div",{className:"mt-4 flex items-center text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform",children:l.jsx("span",{children:n?"Explore Commands ➔":"Explorar Comandos ➔"})})]}),l.jsxs("div",{onClick:()=>{r("faq"),window.location.hash="faq"},className:"p-5 rounded-2xl glass-panel border border-indigo-500/20 hover:border-indigo-500/50 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-neon-pink group",children:[l.jsxs("div",{className:"flex items-center justify-between mb-3",children:[l.jsx("span",{className:"text-2xl p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20",children:"❓"}),l.jsx("span",{className:"text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300",children:"Capítulo 07"})]}),l.jsx("h4",{className:"font-title font-bold text-white text-base group-hover:text-indigo-300 transition-colors",children:n?"FAQ & Community Help":"Dúvidas & FAQ"}),l.jsx("p",{className:"text-xs text-slate-300 mt-1 leading-relaxed",children:n?"Frequently asked questions, cooldowns, invite guide and server settings.":"Perguntas frequentes, permissões, recargas e suporte do bot."}),l.jsx("div",{className:"mt-4 flex items-center text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition-transform",children:l.jsx("span",{children:n?"Open FAQ ➔":"Ver Perguntas ➔"})})]})]})]})]})}),i==="economy"&&l.jsx("div",{className:"space-y-6 animate-fadeIn",children:l.jsxs("div",{className:"p-6 sm:p-8 rounded-3xl glass-panel border border-purple-500/20 space-y-6",children:[l.jsxs("div",{className:"flex items-center gap-3",children:[l.jsx("div",{className:"p-3 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30",children:l.jsx(Ts,{className:"w-6 h-6"})}),l.jsxs("div",{children:[l.jsx("h2",{className:"font-title font-extrabold text-2xl sm:text-3xl text-white",children:n?"Living Economy: Coins, Magic Beans & Vaults":"Economia Viva: Moedinhas, Feijões e Cofres"}),l.jsx("p",{className:"text-slate-400 text-xs sm:text-sm",children:n?"Dual-currency mechanics, daily earnings, and rewards":"Duas moedas, rendimentos diários e recompensas"})]})]}),l.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-5",children:[l.jsxs("div",{className:"p-5 rounded-2xl bg-white/5 border border-purple-500/15 space-y-3",children:[l.jsxs("div",{className:"flex items-center gap-2 text-amber-300 font-title font-bold text-base",children:[l.jsx("span",{children:"🪙"}),l.jsx("span",{children:n?"Moedinhas (Gold Coins)":"Moedinhas Mágicas"})]}),l.jsx("p",{className:"text-xs text-slate-300 leading-relaxed",children:n?"The primary currency used for social dynamics, career shifts, wedding rings, gifts, and games. Earned via /py-daily, /py-work shifts, and Tarot album milestones.":"A moeda principal para salários de profissão, alianças de casamento, minigames, bônus e presentes. Obtida no /py-daily, nos turnos de /py-work e no portal de bônus web."}),l.jsx("div",{className:"font-mono text-[11px] text-pink-300 bg-black/40 px-3 py-1.5 rounded-lg border border-pink-500/20",children:"/py-carteira • /py-daily • /py-bonus"})]}),l.jsxs("div",{className:"p-5 rounded-2xl bg-white/5 border border-purple-500/15 space-y-3",children:[l.jsxs("div",{className:"flex items-center gap-2 text-emerald-300 font-title font-bold text-base",children:[l.jsx("span",{children:"🫘"}),l.jsx("span",{children:n?"Feijões Mágicos (Rare Beans)":"Feijões Mágicos Raros"})]}),l.jsx("p",{className:"text-xs text-slate-300 leading-relaxed",children:n?"Rare, precious mystical beans required for advanced career promotions, Arcane Bribes in the Tarot Album, and special relics.":"A moeda sagrada e rara necessária para promoções nos escalões mais altos de carreira, subornos arcanos de cartas no Álbum de Tarot e artefatos lendários."}),l.jsx("div",{className:"font-mono text-[11px] text-emerald-300 bg-black/40 px-3 py-1.5 rounded-lg border border-emerald-500/20",children:"/py-work • /py-suborno • Recompensas de Streaks"})]})]}),l.jsxs("div",{className:"p-5 rounded-2xl bg-gradient-to-r from-pink-950/40 via-purple-950/40 to-indigo-950/40 border border-pink-500/30 flex flex-col sm:flex-row items-center justify-between gap-4",children:[l.jsxs("div",{className:"space-y-1 text-left",children:[l.jsxs("h4",{className:"font-title font-bold text-white text-sm flex items-center gap-2",children:[l.jsx(St,{className:"w-4 h-4 text-pink-400"}),l.jsx("span",{children:n?"Daily 10-Second Web Reward Portal":"Bônus Mágico Web de 10 Segundos"})]}),l.jsx("p",{className:"text-xs text-slate-300",children:n?"Claim extra coins daily through the secure waiting portal in 10 seconds!":"Ganhe moedinhas adicionais todos os dias aguardando 10 segundos no portal oficial de recompensas!"})]}),l.jsx("a",{href:"/bonus",className:"px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-neon-pink whitespace-nowrap transition-all",children:n?"Claim 10s Bonus ➔":"Resgatar Bônus 10s ➔"})]})]})}),i==="careers"&&l.jsx("div",{className:"space-y-6 animate-fadeIn",children:l.jsxs("div",{className:"p-6 sm:p-8 rounded-3xl glass-panel border border-purple-500/20 space-y-6",children:[l.jsxs("div",{className:"flex items-center gap-3",children:[l.jsx("div",{className:"p-3 rounded-2xl bg-purple-500/15 text-purple-400 border border-purple-500/30",children:l.jsx(ga,{className:"w-6 h-6"})}),l.jsxs("div",{children:[l.jsx("h2",{className:"font-title font-extrabold text-2xl sm:text-3xl text-white",children:n?"22 Unique Vocations & 45s Technical Minigames":"22 Carreiras Únicas & Minigames de 45s"}),l.jsx("p",{className:"text-slate-400 text-xs sm:text-sm",children:n?"16 standard careers & 6 bean-unlocked magic vocations":"16 profissões comuns e 6 vocações mágicas arcanas"})]})]}),l.jsx("p",{className:"text-slate-200 text-sm sm:text-base leading-relaxed",children:n?"Every 3 hours, you can clock in with /py-work. Each of the 22 vocations features custom thematic challenges with 45-second timers. Correct choices grant bonuses, XP, and unlock senior promotions with higher salaries! You can also unlock 6 mystical professions using rare Magic Beans.":"A cada 3 horas você pode bater ponto com o comando /py-work. Cada uma das 22 vocações possui desafios técnicos imersivos com cronômetro de 45 segundos. Acertos perfeitos garantem bônus salariais, XP de carreira e abrem caminho para promoções de alto nível! Além das 16 comuns, há 6 vocações mágicas desbloqueadas com Feijões Mágicos."}),l.jsx("div",{className:"grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-2",children:[{name:"Programador(a)",icon:"💻",desc:"Sistemas & Bugs"},{name:"Cozinheiro(a)",icon:"🍳",desc:"Pratos & Temperos"},{name:"Professor(a)",icon:"📚",desc:"Aulas & Ensino"},{name:"Médico(a)",icon:"🩺",desc:"Saúde & Diagnósticos"},{name:"Agricultor(a)",icon:"🌾",desc:"Safras & Terra"},{name:"Músico(a)",icon:"🎵",desc:"Melodias & Acordes"},{name:"Fotógrafo(a)",icon:"📷",desc:"Foco & Luz"},{name:"Mecânico(a)",icon:"🔧",desc:"Motores & Peças"},{name:"Vendedor(a)",icon:"🏷️",desc:"Metas & Negócios"},{name:"Artista",icon:"🎨",desc:"Pintura & Telas"},{name:"Dublador(a)",icon:"🎙️",desc:"Voz & Personagens"},{name:"Dev de Jogos",icon:"🎮",desc:"Física & Engines"},{name:"Psicólogo(a)",icon:"🧠",desc:"Escuta & Empatia"},{name:"Telemarketing",icon:"🎧",desc:"SAC & Chamadas"},{name:"Animador de Festa",icon:"🎈",desc:"Recreação & Alegria"},{name:"Advogado(a)",icon:"⚖️",desc:"Leis & Processos"},{name:"Alquimista ✨",icon:"🧪",desc:"Poções & Transmutação",isMagic:!0},{name:"Mago(a) ✨",icon:"🔮",desc:"Mana & Encantamento",isMagic:!0},{name:"Ferreiro(a) ✨",icon:"⚒️",desc:"Forja & Aço Lendário",isMagic:!0},{name:"Rei / Rainha ✨",icon:"👑",desc:"Coroa & Diplomacia",isMagic:!0},{name:"Domador de Feras ✨",icon:"🐉",desc:"Dragões & Instinto",isMagic:!0},{name:"Anti-Vegetais ✨",icon:"🍆",desc:"Ódio a Legumes & Caos",isMagic:!0}].map((o,c)=>l.jsxs("div",{className:`p-2.5 rounded-xl border transition-all ${o.isMagic?"bg-gradient-to-b from-purple-900/30 to-pink-900/20 border-pink-500/40 hover:border-pink-400":"bg-white/5 border-purple-500/15 hover:border-purple-500/35"}`,children:[l.jsx("span",{className:"text-lg",children:o.icon}),l.jsx("div",{className:"font-title font-bold text-xs text-white mt-1 truncate",children:o.name}),l.jsx("div",{className:"text-[10px] text-slate-400 truncate",children:o.desc})]},c))}),l.jsx("div",{className:"pt-2 text-center",children:l.jsx("span",{className:"text-xs font-mono text-purple-300",children:n?"Commands: /py-profissao • /py-work":"Comandos: /py-profissao (escolher) • /py-work (trabalhar)"})})]})}),i==="tarot"&&l.jsx("div",{className:"space-y-6 animate-fadeIn",children:l.jsxs("div",{className:"p-6 sm:p-8 rounded-3xl glass-panel border border-purple-500/20 space-y-6",children:[l.jsxs("div",{className:"flex items-center gap-3",children:[l.jsx("div",{className:"p-3 rounded-2xl bg-pink-500/15 text-pink-400 border border-pink-500/30",children:l.jsx(St,{className:"w-6 h-6"})}),l.jsxs("div",{children:[l.jsx("h2",{className:"font-title font-extrabold text-2xl sm:text-3xl text-white",children:n?"The 78 Tarot Arcana & Collector’s Album":"Tarot dos 78 Arcanos & Álbum Colecionável"}),l.jsx("p",{className:"text-slate-400 text-xs sm:text-sm",children:n?"Daily oracle readings, HD canvas generation, achievements and bribes":"Tiragens diárias, renderização em canvas HD e álbum com suborno"})]})]}),l.jsx("p",{className:"text-slate-200 text-sm sm:text-base leading-relaxed",children:n?"Draw your daily guidance with /py-tarot! Each card is generated dynamically in HD canvas with mystical interpretations. Stick your card into your personal album (/py-album) to build your collection, unlock achievements, and use Arcane Bribes for missing cards.":"Consulte a sabedoria do oráculo com /py-tarot! Cada tiragem gera uma carta em alta resolução com reflexões para o seu dia. Cole sua carta no seu Álbum Colecionável (/py-album) para completar os 22 Arcanos Maiores e 56 Menores, ganhando conquistas exclusivas e moedinhas!"}),l.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2",children:[l.jsxs("div",{className:"p-4 rounded-2xl bg-white/5 border border-purple-500/15 space-y-2",children:[l.jsx("div",{className:"text-pink-400 font-title font-bold text-sm",children:"🔮 Tiragem Diária"}),l.jsx("p",{className:"text-xs text-slate-300",children:n?"1 free card draw every 24h with personalized insight.":"1 tiragem gratuita por dia com reflexão inspiradora."}),l.jsx("div",{className:"font-mono text-[10px] text-purple-300",children:"/py-tarot"})]}),l.jsxs("div",{className:"p-4 rounded-2xl bg-white/5 border border-purple-500/15 space-y-2",children:[l.jsx("div",{className:"text-purple-400 font-title font-bold text-sm",children:"📖 Álbum de Coleção"}),l.jsx("p",{className:"text-xs text-slate-300",children:n?"Organize your cards and showcase your public web deck.":"Cole suas cartas, consulte estatísticas e exiba seu perfil web."}),l.jsx("div",{className:"font-mono text-[10px] text-purple-300",children:"/py-album"})]}),l.jsxs("div",{className:"p-4 rounded-2xl bg-white/5 border border-purple-500/15 space-y-2",children:[l.jsx("div",{className:"text-amber-400 font-title font-bold text-sm",children:"💰 Suborno Arcano"}),l.jsx("p",{className:"text-xs text-slate-300",children:n?"Spend magic beans to summon a guaranteed missing card!":"Gaste Feijões Mágicos para invocar cartas faltantes no álbum!"}),l.jsx("div",{className:"font-mono text-[10px] text-purple-300",children:"/py-suborno"})]})]})]})}),i==="marriage"&&l.jsx("div",{className:"space-y-6 animate-fadeIn",children:l.jsxs("div",{className:"p-6 sm:p-8 rounded-3xl glass-panel border border-purple-500/20 space-y-6",children:[l.jsxs("div",{className:"flex items-center gap-3",children:[l.jsx("div",{className:"p-3 rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/30",children:l.jsx(ui,{className:"w-6 h-6"})}),l.jsxs("div",{children:[l.jsx("h2",{className:"font-title font-extrabold text-2xl sm:text-3xl text-white",children:n?"Marriage, Family & Social Dynamics":"Matrimônio, Família & Dinâmica Social"}),l.jsx("p",{className:"text-slate-400 text-xs sm:text-sm",children:n?"Tree of life, shared bank vault, romantic dates and children":"Árvore da vida, cofre conjunto, encontros românticos e filhos"})]})]}),l.jsx("p",{className:"text-slate-200 text-sm sm:text-base leading-relaxed",children:n?"Form an eternal bond with another member! Once married, couples nurture an active Love Gauge that decays lazily if neglected. Together you water the Tree of Life every 12h, invest in the Family Vault with daily interest, enjoy Date Nights, and adopt children who work internships for family income!":"Celebre um vínculo eterno com outro membro do Discord! Casais nutrem uma Barra do Amor que exige carinho diário. Vocês podem regar a Árvore da Vida a cada 12h, acumular economias no Cofre do Casal com juros diários, ter encontros românticos e adotar filhos que fazem estágios e trazem moedas para o lar!"}),l.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2",children:[l.jsxs("div",{className:"p-4 rounded-2xl bg-white/5 border border-purple-500/15 space-y-1.5",children:[l.jsx(t1,{className:"w-5 h-5 text-emerald-400"}),l.jsx("div",{className:"font-title font-bold text-white text-sm",children:"Árvore da Vida"}),l.jsx("p",{className:"text-[11px] text-slate-300",children:n?"Water every 12h to gain +10% Love and tree levels.":"Rega a cada 12h rende +10% de amor e sobe o nível da árvore."})]}),l.jsxs("div",{className:"p-4 rounded-2xl bg-white/5 border border-purple-500/15 space-y-1.5",children:[l.jsx(n1,{className:"w-5 h-5 text-amber-400"}),l.jsx("div",{className:"font-title font-bold text-white text-sm",children:"Cofre do Casal"}),l.jsx("p",{className:"text-[11px] text-slate-300",children:n?"Deposit shared coins with up to 5%/day interest.":"Depósitos conjuntos com rendimento diário de até 5% ao dia."})]}),l.jsxs("div",{className:"p-4 rounded-2xl bg-white/5 border border-purple-500/15 space-y-1.5",children:[l.jsx(ui,{className:"w-5 h-5 text-rose-400"}),l.jsx("div",{className:"font-title font-bold text-white text-sm",children:"Date Night"}),l.jsx("p",{className:"text-[11px] text-slate-300",children:n?"Answer 3 date questions together for love boosts.":"Encontros com 3 perguntas de sintonia a dois com prêmios."})]}),l.jsxs("div",{className:"p-4 rounded-2xl bg-white/5 border border-purple-500/15 space-y-1.5",children:[l.jsx(Ly,{className:"w-5 h-5 text-pink-400"}),l.jsx("div",{className:"font-title font-bold text-white text-sm",children:"Filhos & Estágio"}),l.jsx("p",{className:"text-[11px] text-slate-300",children:n?"Adopt up to 5 children who work 24h internships.":"Adote até 5 filhos que fazem estágio remunerado para a família."})]})]}),l.jsx("div",{className:"pt-2 text-center font-mono text-xs text-pink-300",children:"/py-casamento • /py-filho • /py-divorcio • /py-ship"})]})}),i==="commands"&&l.jsxs("div",{className:"space-y-6 animate-fadeIn",children:[l.jsxs("div",{className:"p-4 rounded-2xl bg-white/5 border border-purple-500/20 flex items-center justify-between gap-4",children:[l.jsxs("div",{className:"flex items-center gap-2.5 text-xs text-slate-300",children:[l.jsx(vi,{className:"w-4 h-4 text-pink-400 flex-shrink-0"}),l.jsx("span",{children:n?"Showing all registered commands. Press Ctrl+K anytime to open the instant search command palette.":"Catálogo oficial de todos os comandos registrados. Pressione Ctrl+K a qualquer momento para abrir o buscador rápido."})]}),l.jsxs("div",{className:"hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-[10px] font-mono text-purple-300",children:[l.jsx("span",{children:"Ctrl"})," + ",l.jsx("span",{children:"K"})]})]}),l.jsx(Og,{t,lang:e})]}),i==="faq"&&l.jsxs("div",{className:"space-y-6 animate-fadeIn",children:[l.jsxs("div",{className:"text-center mb-6",children:[l.jsx("h3",{className:"font-title font-extrabold text-2xl sm:text-3xl text-white",children:n?"Frequently Asked Questions & Guidelines":"Perguntas Frequentes & Diretrizes"}),l.jsx("p",{className:"text-slate-400 text-xs sm:text-sm mt-1",children:n?"Quick answers to common questions about Pyxie":"Respostas rápidas sobre comandos, permissões e economia"})]}),l.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-5",children:a.map((o,c)=>l.jsxs("div",{className:"p-5 rounded-2xl glass-panel border border-purple-500/20 space-y-2 hover:border-pink-500/40 transition-colors",children:[l.jsxs("h4",{className:"font-title font-bold text-base text-white flex items-center gap-2",children:[l.jsx("span",{className:"text-pink-400",children:"Q."}),l.jsx("span",{children:o.q})]}),l.jsx("p",{className:"text-xs sm:text-sm text-slate-300 leading-relaxed pl-6",children:o.a})]},c))})]})]})}const U2=t=>(t==null?void 0:t.authorName)||(t==null?void 0:t.author)||(t==null?void 0:t.authorUsername)||"Artista",cr=t=>{const e=(t==null?void 0:t.authorUsername)||(t==null?void 0:t.authorName)||(t==null?void 0:t.author)||"Artista",n=String(e).trim().replace(/^@+/,"");return n&&n.toLowerCase()!=="artista"?`@${n}`:t!=null&&t.userId?"@Membro":"@Artista"};function F2({t,lang:e}){var ee;const[n,i]=ne.useState([]),[r,s]=ne.useState(1),[a,o]=ne.useState(1),[c,u]=ne.useState(""),[f,p]=ne.useState(""),[h,x]=ne.useState("grid"),[_,S]=ne.useState(""),[m,d]=ne.useState(null),[g,v]=ne.useState(1),[w,R]=ne.useState(null),[E,A]=ne.useState(""),[N,F]=ne.useState(!1),[y,b]=ne.useState(!1);ne.useEffect(()=>{const z=localStorage.getItem("pyxie_admin_token")||"";S(z)},[]);const O=(z=1,le=c)=>{let Ae=`/api/museum/arts?page=${z}&limit=24`;le&&(Ae+=`&user=${encodeURIComponent(le)}`),fetch(Ae).then(G=>G.json()).then(G=>{if(G&&G.success){i(G.arts||[]),s(G.page||1),o(G.totalPages||1);const ue=new URLSearchParams(window.location.search).get("art");if(ue){const me=(G.arts||[]).find(Le=>Le.id===ue);me&&d(me)}}}).catch(G=>console.error(G))};ne.useEffect(()=>{O(1)},[c]);const V=ne.useMemo(()=>{const z=new Map;return n.forEach(le=>{const Ae=le.authorUsername||le.authorName||le.author;le.userId&&Ae&&!z.has(le.userId)&&z.set(le.userId,String(Ae).trim().replace(/^@+/,""))}),Array.from(z.entries()).map(([le,Ae])=>({userId:le,name:Ae}))},[n]),q=ne.useMemo(()=>{if(!f.trim())return n;const z=f.toLowerCase();return n.filter(le=>{var Ae,G,re,ue;return((Ae=le.description)==null?void 0:Ae.toLowerCase().includes(z))||((G=le.authorName)==null?void 0:G.toLowerCase().includes(z))||((re=le.author)==null?void 0:re.toLowerCase().includes(z))||((ue=le.authorUsername)==null?void 0:ue.toLowerCase().includes(z))})},[n,f]),Q=(z,le)=>{le&&le.stopPropagation();const Ae=`${window.location.origin}/museu?art=${z.id}`;navigator.clipboard.writeText(Ae),b(!0),setTimeout(()=>b(!1),2e3)},W=async(z,le)=>{if(le.stopPropagation(),!!confirm("Deseja realmente remover esta arte da galeria?"))try{(await(await fetch(`/api/museum/art/${z}`,{method:"DELETE",headers:{"x-admin-token":_}})).json()).success?((m==null?void 0:m.id)===z&&d(null),O(r)):alert("Falha ao remover arte.")}catch{alert("Erro na requisição.")}},Y=async()=>{if(w)try{(await(await fetch(`/api/museum/art/${w.id}`,{method:"PATCH",headers:{"Content-Type":"application/json","x-admin-token":_},body:JSON.stringify({description:E})})).json()).success?(R(null),O(r)):alert("Falha ao atualizar descrição.")}catch{alert("Erro na requisição.")}},D=z=>{z.preventDefault(),F(!0)},J=z=>{var Ae;const le=(Ae=window.getSelection())==null?void 0:Ae.toString();if(le&&le.length>3){z.preventDefault();const G=`${le}

Fonte: Galeria Oficial da Comunidade Pyxie (https://pyxie.com.br/)`;z.clipboardData&&z.clipboardData.setData("text/plain",G)}};return l.jsxs("div",{onCopy:J,className:"min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10",children:[l.jsxs("div",{className:"text-center space-y-4 max-w-3xl mx-auto pt-2",children:[l.jsxs("div",{className:"inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-bold shadow-sm",children:[l.jsx(St,{className:"w-3.5 h-3.5 text-pink-400"}),l.jsx("span",{children:t("museum.badge")})]}),l.jsx("h1",{className:"font-title font-black text-3xl sm:text-5xl md:text-6xl bg-gradient-to-r from-white via-pink-200 to-purple-300 bg-clip-text text-transparent tracking-tight",children:t("museum.title")}),l.jsx("p",{className:"text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto",children:t("museum.subtitle")})]}),l.jsxs("div",{className:"flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-purple-500/20",children:[l.jsxs("div",{className:"relative w-full md:w-80 flex items-center",children:[l.jsx($l,{className:"absolute left-3.5 w-4 h-4 text-slate-400"}),l.jsx("input",{type:"text",value:f,onChange:z=>p(z.target.value),placeholder:"Buscar por obra ou artista...",className:"w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-purple-500/20 text-xs text-white placeholder-slate-400 outline-none focus:border-pink-500 transition-colors"}),f&&l.jsx("button",{onClick:()=>p(""),className:"absolute right-3 text-slate-400 hover:text-white",children:l.jsx(As,{className:"w-3.5 h-3.5"})})]}),l.jsxs("div",{className:"flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-purple-500/20",children:[l.jsxs("button",{onClick:()=>x("grid"),className:`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${h==="grid"?"bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-sm":"text-slate-400 hover:text-white"}`,children:[l.jsx(Vy,{className:"w-3.5 h-3.5"}),l.jsx("span",{children:"Mural Grid"})]}),l.jsxs("button",{onClick:()=>x("forum"),className:`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${h==="forum"?"bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-sm":"text-slate-400 hover:text-white"}`,children:[l.jsx($y,{className:"w-3.5 h-3.5"}),l.jsx("span",{children:"Modo Fórum"})]})]})]}),V.length>0&&l.jsxs("div",{className:"flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none",children:[l.jsx("button",{onClick:()=>u(""),className:`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${c?"bg-white/5 border border-purple-500/20 text-slate-300 hover:bg-white/10":"bg-pink-600 text-white shadow-neon-pink"}`,children:"Todos os Artistas"}),V.map(({userId:z,name:le})=>l.jsxs("button",{onClick:()=>u(c===z?"":z),className:`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${c===z?"bg-pink-600 text-white shadow-neon-pink":"bg-white/5 border border-purple-500/20 text-slate-300 hover:bg-white/10"}`,children:[l.jsx(sg,{className:"w-3 h-3 text-purple-400"}),l.jsxs("span",{children:["@",le]})]},z))]}),q.length>0?h==="grid"?l.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6",children:q.map(z=>l.jsxs("div",{onClick:()=>{d(z),v(1)},className:"group relative rounded-2xl glass-panel border border-purple-500/20 hover:border-pink-500/50 overflow-hidden cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-neon-pink flex flex-col justify-between",children:[l.jsxs("div",{onContextMenu:D,className:"relative aspect-square overflow-hidden bg-black/40 select-none art-shield",children:[l.jsx("img",{src:z.imageUrl||`/api/museum/art-image/${z.id}`,alt:`Arte por ${cr(z)} no Museu da Pyxie • Visite https://pyxie.com.br/`,"data-canonical-url":"https://pyxie.com.br/",loading:"lazy",className:"w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 pointer-events-none"}),l.jsx("div",{className:"absolute inset-0 bg-gradient-to-t from-[#0e071a] via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity"}),l.jsx("button",{onClick:le=>Q(z,le),className:"absolute top-2.5 right-2.5 p-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110",title:"Compartilhar Obra",children:l.jsx(fs,{className:"w-3.5 h-3.5"})})]}),l.jsxs("div",{className:"p-4 space-y-2",children:[l.jsxs("div",{className:"flex items-center justify-between text-xs",children:[l.jsx("span",{className:"font-title font-bold text-pink-300 truncate max-w-[150px]",children:cr(z)}),l.jsx("span",{className:"text-[11px] font-mono text-slate-400",children:z.createdAt?new Date(z.createdAt).toLocaleDateString("pt-BR"):""})]}),z.description&&l.jsx("p",{className:"text-slate-300 text-xs line-clamp-2 leading-relaxed",children:z.description})]}),_&&l.jsxs("div",{className:"p-3 border-t border-purple-500/15 flex items-center justify-end gap-2 bg-black/30",children:[l.jsx("button",{onClick:le=>{le.stopPropagation(),R(z),A(z.description||"")},className:"p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-purple-300",children:l.jsx(Ky,{className:"w-3.5 h-3.5"})}),l.jsx("button",{onClick:le=>W(z.id,le),className:"p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300",children:l.jsx(e1,{className:"w-3.5 h-3.5"})})]})]},z.id))}):l.jsx("div",{className:"space-y-6 max-w-4xl mx-auto",children:q.map(z=>l.jsxs("div",{className:"rounded-3xl glass-panel border border-purple-500/20 p-6 space-y-4 hover:border-pink-500/40 transition-colors",children:[l.jsxs("div",{className:"flex items-center justify-between border-b border-purple-500/15 pb-4",children:[l.jsxs("div",{className:"flex items-center gap-3",children:[l.jsx("div",{className:"w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 p-0.5 shadow-sm",children:l.jsx("div",{className:"w-full h-full rounded-full bg-[#0e071a] flex items-center justify-center text-pink-300 font-bold font-mono text-xs",children:U2(z)[0].toUpperCase()})}),l.jsxs("div",{children:[l.jsx("span",{className:"font-title font-bold text-white text-sm block",children:cr(z)}),l.jsxs("span",{className:"text-[11px] font-mono text-purple-300/70",children:["Publicado em ",z.createdAt?new Date(z.createdAt).toLocaleDateString("pt-BR"):"Data cósmica"]})]})]}),l.jsxs("button",{onClick:()=>Q(z),className:"p-2 rounded-xl bg-white/5 hover:bg-white/10 text-purple-300 flex items-center gap-1.5 text-xs font-semibold",children:[l.jsx(fs,{className:"w-3.5 h-3.5"}),l.jsx("span",{children:"Compartilhar"})]})]}),z.description&&l.jsx("p",{className:"text-slate-200 text-sm leading-relaxed",children:z.description}),l.jsx("div",{onContextMenu:D,onClick:()=>{d(z),v(1)},className:"rounded-2xl overflow-hidden bg-black/60 max-h-[500px] flex items-center justify-center cursor-pointer select-none art-shield border border-purple-500/15",children:l.jsx("img",{src:z.imageUrl||`/api/museum/art-image/${z.id}`,alt:`Arte por ${cr(z)} no Museu da Pyxie • Visite https://pyxie.com.br/`,"data-canonical-url":"https://pyxie.com.br/",loading:"lazy",className:"w-full h-full object-contain max-h-[500px] pointer-events-none"})})]},z.id))}):l.jsx("div",{className:"text-center py-24 text-slate-400 text-sm",children:"Nenhuma obra encontrada para esta pesquisa ou artista."}),a>1&&l.jsxs("div",{className:"flex items-center justify-center gap-3 pt-6",children:[l.jsx("button",{onClick:()=>O(r-1),disabled:r<=1,className:"p-2.5 rounded-xl bg-white/5 border border-purple-500/20 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10",children:l.jsx(Uy,{className:"w-4 h-4"})}),l.jsxs("span",{className:"font-mono text-xs text-slate-300",children:["Página ",r," de ",a]}),l.jsx("button",{onClick:()=>O(r+1),disabled:r>=a,className:"p-2.5 rounded-xl bg-white/5 border border-purple-500/20 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10",children:l.jsx(Jx,{className:"w-4 h-4"})})]}),m&&l.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in",onClick:()=>d(null),children:l.jsxs("div",{className:"relative max-w-5xl max-h-[92vh] w-full flex flex-col items-center justify-center",onClick:z=>z.stopPropagation(),children:[l.jsxs("div",{className:"w-full flex items-center justify-between mb-3 px-2 text-white",children:[l.jsxs("div",{className:"flex items-center gap-3",children:[l.jsx("span",{className:"font-title font-bold text-sm text-pink-300",children:cr(m)}),l.jsxs("span",{className:"text-xs font-mono text-slate-400",children:["ID: ",(ee=m.id)==null?void 0:ee.slice(0,10),"..."]})]}),l.jsxs("div",{className:"flex items-center gap-2",children:[l.jsx("button",{onClick:()=>v(z=>Math.min(z+.25,2.5)),className:"p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white",title:"Aumentar Zoom",children:l.jsx(a1,{className:"w-4 h-4"})}),l.jsx("button",{onClick:()=>v(z=>Math.max(z-.25,.75)),className:"p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white",title:"Diminuir Zoom",children:l.jsx(o1,{className:"w-4 h-4"})}),l.jsxs("button",{onClick:z=>Q(m,z),className:"px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 text-xs font-bold",title:"Copiar Link",children:[y?l.jsx(Es,{className:"w-4 h-4 text-emerald-400"}):l.jsx(fs,{className:"w-4 h-4"}),l.jsx("span",{children:y?"Copiado!":"Compartilhar"})]}),l.jsx("button",{onClick:()=>d(null),className:"p-2 rounded-xl bg-white/10 hover:bg-rose-600 text-white ml-2 transition-colors",title:"Fechar (ESC)",children:l.jsx(As,{className:"w-4 h-4"})})]})]}),l.jsxs("div",{onContextMenu:D,className:"relative max-h-[75vh] max-w-full overflow-hidden rounded-2xl select-none art-shield flex items-center justify-center bg-black/50 p-2 group",children:[l.jsx("img",{src:m.imageUrl||`/api/museum/art-image/${m.id}`,alt:`Arte por ${cr(m)} no Museu da Pyxie • Visite https://pyxie.com.br/`,"data-canonical-url":"https://pyxie.com.br/",style:{transform:`scale(${g})`,transition:"transform 0.2s ease-out"},className:"max-h-[72vh] max-w-full object-contain pointer-events-none rounded-lg"}),l.jsxs("div",{className:"absolute inset-x-0 bottom-0 py-2.5 px-4 bg-black/85 backdrop-blur-md border-t border-pink-500/40 flex items-center justify-between text-xs font-mono tracking-wide z-20 select-none pointer-events-none",children:[l.jsxs("span",{className:"text-white font-bold truncate",children:[l.jsx("span",{className:"text-pink-400 font-extrabold mr-1.5",children:"✦"}),"pyxie.com.br • ",cr(m)]}),l.jsx("span",{className:"text-purple-300/80 text-[11px] shrink-0 ml-2 hidden sm:inline",children:"Galeria Oficial da Comunidade"})]})]}),m.description&&l.jsxs("p",{className:"mt-4 text-center text-slate-300 text-sm max-w-2xl px-4",children:['"',m.description,'"']})]})}),w&&l.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md",children:l.jsxs("div",{className:"bg-[#0e071a] border border-purple-500/30 rounded-2xl p-6 w-full max-w-md space-y-4",children:[l.jsx("h3",{className:"font-title font-bold text-white text-lg",children:"Editar Descrição"}),l.jsx("textarea",{value:E,onChange:z=>A(z.target.value),className:"w-full h-32 p-3 rounded-xl bg-white/5 border border-purple-500/25 text-white text-sm outline-none focus:border-pink-500",placeholder:"Digite a nova descrição da obra..."}),l.jsxs("div",{className:"flex justify-end gap-2",children:[l.jsx("button",{onClick:()=>R(null),className:"px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-bold",children:"Cancelar"}),l.jsx("button",{onClick:Y,className:"px-4 py-2 rounded-xl bg-pink-600 text-white text-xs font-bold shadow-neon-pink",children:"Salvar Alterações"})]})]})}),N&&l.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md",onClick:()=>F(!1),children:l.jsxs("div",{className:"bg-[#0e071a] border border-pink-500/40 rounded-3xl p-6 max-w-md text-center space-y-4 shadow-neon-pink",onClick:z=>z.stopPropagation(),children:[l.jsx("div",{className:"w-12 h-12 mx-auto rounded-full bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400",children:l.jsx(rg,{className:"w-6 h-6"})}),l.jsx("h4",{className:"font-title font-bold text-white text-lg",children:"Proteção de Autoria"}),l.jsx("p",{className:"text-xs text-slate-300 leading-relaxed",children:t("museum.artShield")||"Esta obra foi criada com amor por um membro da nossa comunidade. O download direto é bloqueado para proteger a autoria do artista. Compartilhe o link do museu!"}),l.jsx("button",{onClick:()=>F(!1),className:"w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold shadow-neon-pink",children:"Compreendido ✨"})]})})]})}function O2({t,lang:e}){const[n,i]=ne.useState(10),[r,s]=ne.useState(!1),[a,o]=ne.useState(!1),[c,u]=ne.useState(null),[f,p]=ne.useState(!1),[h,x]=ne.useState(!0),_=ne.useRef(null),m=new URLSearchParams(window.location.search).get("token")||"",d=()=>{if(h)try{const N=new(window.AudioContext||window.webkitAudioContext),F=N.createOscillator(),y=N.createGain();F.type="sine",F.frequency.setValueAtTime(587.33,N.currentTime),F.frequency.exponentialRampToValueAtTime(880,N.currentTime+.3),y.gain.setValueAtTime(.18,N.currentTime),y.gain.exponentialRampToValueAtTime(.001,N.currentTime+.5),F.connect(y),y.connect(N.destination),F.start(),F.stop(N.currentTime+.5)}catch{}};ne.useEffect(()=>{if(n>0){const N=setTimeout(()=>{i(F=>F-1)},1e3);return()=>clearTimeout(N)}else s(!0),d(),g()},[n]);const g=()=>{var Q,W;const N=_.current;if(!N)return;const F=N.getContext("2d"),y=N.width=((Q=N.parentElement)==null?void 0:Q.clientWidth)||300,b=N.height=((W=N.parentElement)==null?void 0:W.clientHeight)||300,O=Array.from({length:40},()=>({x:y/2,y:b/2,vx:(Math.random()-.5)*8,vy:(Math.random()-.5)*8-2,radius:Math.random()*3+2,color:["#f472b6","#c084fc","#38bdf8","#fbbf24","#34d399"][Math.floor(Math.random()*5)],alpha:1}));let V=0;function q(){F.clearRect(0,0,y,b),O.forEach(Y=>{Y.x+=Y.vx,Y.y+=Y.vy,Y.alpha-=.02,F.beginPath(),F.arc(Y.x,Y.y,Y.radius,0,Math.PI*2),F.fillStyle=Y.color,F.globalAlpha=Math.max(0,Y.alpha),F.fill()}),V++,V<60?requestAnimationFrame(q):F.clearRect(0,0,y,b)}q()},v=()=>a?"Moedinhas entregues no seu cofre com sucesso! Volte amanhã para mais! 🎉":n>7?"Canalizando a energia estelar do seu cofre mágico... ⚡":n>3?"Quase lá! As moedas estão brilhando na penumbra cósmica... ✨":n>0?"Sintonização quase concluída! Prepare seu cofre! 🌟":"Energia cósmica pronta! Clique no botão abaixo para resgatar! 🎁",w=async()=>{if(!m){alert("Token de bônus não informado na URL. Abra o link gerado pelo comando /py-bonus no Discord.");return}p(!0);try{const F=await(await fetch("/api/bonus/claim",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:m})})).json();p(!1),F&&F.success?(o(!0),u(F),d()):alert(F.error||"Falha ao reivindicar bônus.")}catch{p(!1),alert("Erro na requisição com o servidor.")}},R=54,E=2*Math.PI*R,A=E-(10-n)/10*E;return l.jsxs("div",{className:"min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12",children:[l.jsxs("div",{className:"text-center space-y-3",children:[l.jsxs("div",{className:"inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-bold shadow-sm",children:[l.jsx(St,{className:"w-3.5 h-3.5 text-pink-400"}),l.jsx("span",{children:"Canalização de Recompensas Cósmicas"})]}),l.jsx("h1",{className:"font-title font-black text-3xl sm:text-5xl text-white tracking-tight",children:t("bonus.title")}),l.jsx("p",{className:"text-slate-300 text-sm sm:text-base max-w-xl mx-auto",children:t("bonus.subtitle")})]}),l.jsxs("div",{className:"max-w-2xl mx-auto relative rounded-3xl glass-panel border border-purple-500/30 p-8 sm:p-10 shadow-2xl flex flex-col items-center text-center space-y-8 overflow-hidden",children:[l.jsx("canvas",{ref:_,className:"absolute inset-0 pointer-events-none z-20"}),l.jsx("button",{onClick:()=>x(!h),className:"absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors z-30",title:h?"Silenciar Áudio":"Ativar Efeitos Sonoros",children:h?l.jsx(i1,{className:"w-4 h-4 text-pink-400"}):l.jsx(r1,{className:"w-4 h-4"})}),l.jsxs("div",{className:"flex flex-col sm:flex-row items-center gap-4 relative z-10 max-w-lg",children:[l.jsx("div",{className:"relative w-20 h-20 flex-shrink-0 animate-bounce-slow",children:l.jsx("img",{src:"/assets/pyxie/sticker/sticker_smile.png",alt:"Mascote Pyxie",width:"80",height:"80",className:"w-full h-full object-contain"})}),l.jsxs("div",{className:"relative p-3.5 rounded-2xl bg-white/10 border border-purple-500/30 text-xs sm:text-sm text-slate-100 font-medium text-left shadow-lg",children:[v(),l.jsx("div",{className:"hidden sm:block absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-white/10 border-l border-b border-purple-500/30 rotate-45"})]})]}),l.jsxs("div",{className:"relative w-44 h-44 flex items-center justify-center z-10",children:[l.jsxs("svg",{className:"w-full h-full transform -rotate-90",children:[l.jsx("circle",{cx:"88",cy:"88",r:R,stroke:"rgba(255, 255, 255, 0.08)",strokeWidth:"10",fill:"transparent"}),l.jsx("circle",{cx:"88",cy:"88",r:R,stroke:"url(#gradient-ring)",strokeWidth:"10",fill:"transparent",strokeDasharray:E,strokeDashoffset:A,strokeLinecap:"round",className:"transition-all duration-1000 ease-linear"}),l.jsx("defs",{children:l.jsxs("linearGradient",{id:"gradient-ring",x1:"0%",y1:"0%",x2:"100%",y2:"100%",children:[l.jsx("stop",{offset:"0%",stopColor:"#f43f5e"}),l.jsx("stop",{offset:"50%",stopColor:"#ec4899"}),l.jsx("stop",{offset:"100%",stopColor:"#8b5cf6"})]})})]}),l.jsxs("div",{className:"absolute inset-0 flex flex-col items-center justify-center font-title",children:[a?l.jsx(td,{className:"w-12 h-12 text-emerald-400 animate-pulse"}):r?l.jsx(St,{className:"w-12 h-12 text-pink-400 animate-spin-slow"}):l.jsxs("span",{className:"font-black text-4xl sm:text-5xl text-white tracking-tighter",children:[n,"s"]}),l.jsx("span",{className:"text-[11px] font-mono text-purple-300/80 uppercase tracking-widest mt-1",children:a?"Resgatado":r?"Pronto!":"Canalizando"})]})]}),l.jsxs("div",{className:"w-full max-w-sm space-y-3 z-10",children:[!m&&l.jsxs("div",{className:"p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 text-left",children:[l.jsx(eg,{className:"w-4 h-4 flex-shrink-0"}),l.jsxs("span",{children:["Abra o link enviado pelo comando ",l.jsx("strong",{children:"/py-bonus"})," no Discord para validar seu token."]})]}),a?l.jsxs("div",{className:"p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold text-sm flex items-center justify-center gap-2",children:[l.jsx(td,{className:"w-5 h-5 text-emerald-400"}),l.jsx("span",{children:t("bonus.claimed")})]}):l.jsxs("button",{onClick:w,disabled:!r||f||!m,className:`w-full py-4 rounded-2xl font-title font-black text-sm tracking-wide transition-all transform flex items-center justify-center gap-2 ${r&&m?"bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-neon-pink hover:scale-102 cursor-pointer":"bg-white/5 border border-purple-500/20 text-slate-500 cursor-not-allowed opacity-60"}`,children:[l.jsx(id,{className:"w-4 h-4"}),l.jsx("span",{children:f?"Creditando no cofre...":r?t("bonus.claim"):`Aguarde ${n}s para liberar ✨`})]})]})]}),l.jsx(lf,{t,lang:e})]})}function z2({t,lang:e,userId:n}){const[i,r]=ne.useState(null),[s,a]=ne.useState([]),[o,c]=ne.useState(null),[u,f]=ne.useState("tarot"),[p,h]=ne.useState(!1),[x,_]=ne.useState(!0),S=n||window.location.pathname.split("/u/")[1]||"";ne.useEffect(()=>{S&&(_(!0),fetch(`/api/profile/${S}`).then(E=>E.json()).then(E=>{E&&E.success&&r(E),_(!1)}).catch(E=>{console.error("Erro ao buscar perfil:",E),_(!1)}))},[S]),ne.useEffect(()=>{fetch("/api/tarot/cards").then(E=>E.json()).then(E=>{E&&E.success&&Array.isArray(E.cards)&&a(E.cards)}).catch(E=>console.error("Erro ao buscar cartas:",E))},[]);const m=()=>{const E=window.location.href;navigator.share?navigator.share({title:"Perfil de Membro da Pyxie",text:"Confira minha coleção de Tarot e status na Pyxie!",url:E}).catch(()=>{}):(navigator.clipboard.writeText(E),h(!0),setTimeout(()=>h(!1),2e3))};if(x)return l.jsxs("div",{className:"min-h-screen flex items-center justify-center text-slate-400 font-mono text-sm",children:[l.jsx(St,{className:"w-5 h-5 text-pink-400 animate-spin mr-2"}),l.jsx("span",{children:"Sintonizando perfil cósmico..."})]});if(!i)return l.jsxs("div",{className:"min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4",children:[l.jsx("div",{className:"w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400",children:l.jsx(sg,{className:"w-8 h-8"})}),l.jsx("h2",{className:"font-title font-bold text-2xl text-white",children:"Perfil Não Encontrado"}),l.jsxs("p",{className:"text-slate-400 text-sm max-w-md",children:["Nenhum registro cósmico associado ao ID ",S," foi localizado no banco de dados."]}),l.jsx("a",{href:"/",className:"px-6 py-2.5 rounded-xl bg-pink-600 text-white font-bold text-xs shadow-neon-pink",children:"Voltar para o Início"})]});const{account:d,marriage:g,tarot:v,achievements:w}=i,R=new Set(v.discoveredCards||[]);return l.jsxs("div",{className:"min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10",children:[l.jsxs("div",{className:"relative rounded-3xl glass-panel border border-purple-500/30 p-6 sm:p-10 shadow-2xl overflow-hidden",children:[l.jsx("div",{className:"absolute top-0 right-0 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"}),l.jsxs("div",{className:"flex flex-col md:flex-row items-center justify-between gap-6 relative z-10",children:[l.jsxs("div",{className:"flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left",children:[l.jsxs("div",{className:"relative w-24 h-24 flex-shrink-0",children:[l.jsx("img",{src:"/assets/pyxie/sticker/sticker_smile.png",alt:"Avatar",width:"96",height:"96",className:"w-full h-full object-contain"}),l.jsx("span",{className:"absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-400 border-2 border-[#0e071a] flex items-center justify-center text-[10px] text-black font-bold",children:"✓"})]}),l.jsxs("div",{className:"space-y-1.5",children:[l.jsxs("div",{className:"flex flex-wrap items-center justify-center sm:justify-start gap-2",children:[l.jsxs("h1",{className:"font-title font-black text-2xl sm:text-3xl text-white",children:["Membro (",S.slice(-4),")"]}),d.activeTitle&&l.jsxs("span",{className:"px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold",children:["👑 ",d.activeTitle]})]}),l.jsxs("div",{className:"flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-300",children:[l.jsxs("span",{className:"flex items-center gap-1 text-pink-300",children:[l.jsx(nd,{className:"w-3.5 h-3.5"}),l.jsxs("span",{children:["Profissão: ",d.profession||"Aventureiro Místico"]})]}),l.jsx("span",{children:"•"}),l.jsxs("span",{className:"flex items-center gap-1 text-amber-300",children:[l.jsx(Ts,{className:"w-3.5 h-3.5"}),l.jsxs("span",{children:[d.balance.toLocaleString("pt-BR")," Moedas"]})]}),d.dailyStreak>0&&l.jsxs(l.Fragment,{children:[l.jsx("span",{children:"•"}),l.jsxs("span",{className:"text-orange-400 font-bold",children:["🔥 ",d.dailyStreak," dias"]})]})]})]})]}),l.jsxs("button",{onClick:m,className:"px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-purple-500/30 text-white font-title font-bold text-xs flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg",children:[p?l.jsx(Es,{className:"w-4 h-4 text-emerald-400"}):l.jsx(fs,{className:"w-4 h-4 text-pink-400"}),l.jsx("span",{children:p?"Link Copiado! 🔗":"Compartilhar Perfil"})]})]}),g&&g.isMarried&&l.jsxs("div",{className:"mt-8 pt-6 border-t border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 bg-pink-500/5 p-4 rounded-2xl",children:[l.jsxs("div",{className:"flex items-center gap-3",children:[l.jsx("div",{className:"w-10 h-10 rounded-full bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400",children:l.jsx(ui,{className:"w-5 h-5 fill-pink-500"})}),l.jsxs("div",{children:[l.jsx("span",{className:"font-title font-bold text-sm text-white block",children:"Laço Matrimonial Ativo"}),l.jsxs("span",{className:"text-xs text-purple-300/80",children:["Árvore da Vida: Nível ",g.treeLevel," • Cofre: ",g.vaultCoins," 🪙"]})]})]}),l.jsxs("div",{className:"w-full sm:w-60 space-y-1",children:[l.jsxs("div",{className:"flex justify-between text-[11px] font-mono text-pink-300 font-bold",children:[l.jsx("span",{children:"Barra do Amor"}),l.jsxs("span",{children:[g.love,"%"]})]}),l.jsx("div",{className:"w-full h-2 rounded-full bg-white/10 overflow-hidden",children:l.jsx("div",{className:"h-full bg-gradient-to-r from-pink-500 to-rose-400 rounded-full transition-all duration-1000 shadow-neon-pink",style:{width:`${Math.min(g.love,100)}%`}})})]})]})]}),l.jsxs("div",{className:"flex items-center justify-center gap-3",children:[l.jsxs("button",{onClick:()=>f("tarot"),className:`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${u==="tarot"?"bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-neon-pink":"bg-white/5 border border-purple-500/20 text-slate-300 hover:bg-white/10"}`,children:[l.jsx(bs,{className:"w-4 h-4"}),l.jsxs("span",{children:["Álbum de Tarot (",v.discoveredCount,"/78)"]})]}),l.jsxs("button",{onClick:()=>f("achievements"),className:`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${u==="achievements"?"bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-neon-pink":"bg-white/5 border border-purple-500/20 text-slate-300 hover:bg-white/10"}`,children:[l.jsx(ql,{className:"w-4 h-4"}),l.jsx("span",{children:"Conquistas Arcanas"})]})]}),u==="tarot"&&l.jsxs("section",{className:"space-y-6",children:[l.jsxs("div",{className:"flex items-center justify-between text-xs text-slate-400 px-2 font-mono",children:[l.jsxs("span",{children:["Progresso da Coleção: ",v.discoveredCount," de 78 cartas (",Math.round(v.discoveredCount/78*100),"%)"]}),l.jsx("span",{children:"Clique na carta para inspecionar"})]}),l.jsx("div",{className:"grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4",children:s.map((E,A)=>{const N=A+1,F=R.has(N);return l.jsxs("div",{onClick:()=>F&&c(E),className:`group relative rounded-2xl p-2.5 border transition-all duration-300 transform flex flex-col items-center justify-between aspect-[2/3] ${F?"bg-[#140a28]/80 border-purple-500/40 hover:border-pink-500 hover:shadow-neon-pink hover:-translate-y-1.5 cursor-pointer":"bg-black/40 border-white/5 opacity-50 cursor-not-allowed"}`,style:{perspective:"1000px"},children:[l.jsx("div",{className:"w-full h-full relative rounded-xl overflow-hidden flex items-center justify-center bg-black/60",children:F?l.jsx("img",{src:`/api/tarot/card-image?id=${E.id}`,alt:E.name,loading:"lazy",className:"w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform"}):l.jsxs("div",{className:"flex flex-col items-center justify-center p-3 text-center space-y-2 text-slate-500",children:[l.jsx(Gy,{className:"w-5 h-5 text-slate-600"}),l.jsxs("span",{className:"font-mono text-[10px] tracking-wider",children:["#",String(N).padStart(2,"0")]}),l.jsx("span",{className:"text-[9px] uppercase tracking-widest text-slate-600",children:"Bloqueado"})]})}),l.jsx("div",{className:"w-full pt-2 text-center",children:l.jsx("span",{className:`text-[11px] font-bold block truncate ${F?"text-white group-hover:text-pink-300":"text-slate-600"}`,children:F?E.name:"???"})})]},E.id||A)})})]}),u==="achievements"&&l.jsx("section",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:w.map(E=>l.jsxs("div",{className:`p-5 rounded-2xl border transition-all flex items-start gap-4 ${E.completed?"bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-pink-500/40":"bg-white/5 border-white/5 opacity-60"}`,children:[l.jsx("div",{className:`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${E.completed?"bg-pink-500/20 border border-pink-500/40 text-pink-400":"bg-white/5 text-slate-500"}`,children:E.completed?"🏆":"🔒"}),l.jsxs("div",{className:"space-y-1 min-w-0 flex-1",children:[l.jsxs("div",{className:"flex items-center justify-between",children:[l.jsx("h4",{className:"font-title font-bold text-sm text-white truncate",children:e==="en"?E.nameEn:E.namePt}),l.jsxs("span",{className:"text-[11px] font-mono text-amber-300 font-bold",children:["+",E.rewardCoins," 🪙"]})]}),l.jsx("p",{className:"text-xs text-slate-300 leading-relaxed",children:e==="en"?E.descEn:E.descPt}),l.jsxs("div",{className:"pt-2 flex items-center gap-2 text-[10px] font-mono text-slate-400",children:[l.jsx("div",{className:"flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden",children:l.jsx("div",{className:"h-full bg-pink-500 rounded-full",style:{width:`${Math.min(E.current/E.target*100,100)}%`}})}),l.jsxs("span",{children:[E.current,"/",E.target]})]})]})]},E.id))}),o&&l.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in",onClick:()=>c(null),children:l.jsxs("div",{className:"relative max-w-md w-full rounded-3xl bg-[#0e071a] border border-purple-500/40 p-6 shadow-2xl space-y-4",onClick:E=>E.stopPropagation(),children:[l.jsxs("div",{className:"flex items-center justify-between border-b border-purple-500/15 pb-3",children:[l.jsx("span",{className:"font-title font-bold text-lg text-white",children:o.name}),l.jsx("button",{onClick:()=>c(null),className:"p-1 rounded-lg text-slate-400 hover:text-white",children:"✕"})]}),l.jsx("div",{className:"aspect-[2/3] max-h-72 mx-auto rounded-xl overflow-hidden border border-purple-500/30",children:l.jsx("img",{src:`/api/tarot/card-image?id=${o.id}`,alt:o.name,className:"w-full h-full object-cover"})}),l.jsxs("div",{className:"space-y-2 text-xs text-slate-300",children:[l.jsxs("div",{children:[l.jsx("span",{className:"font-bold text-pink-300 block mb-0.5",children:"Significado Direto:"}),l.jsx("p",{className:"leading-relaxed",children:o.upright})]}),l.jsxs("div",{children:[l.jsx("span",{className:"font-bold text-purple-300 block mb-0.5",children:"Significado Invertido:"}),l.jsx("p",{className:"leading-relaxed",children:o.reversed})]})]})]})})]})}const Dm={community:{border:"border-purple-500/30 hover:border-purple-500/60",topBorder:"border-t-purple-500",badgeBg:"bg-purple-500/15 text-purple-300 border-purple-500/30",glow:"rgba(139, 92, 246, 0.25)",icon:sd,color:"#8B5CF6"},creator:{border:"border-pink-500/30 hover:border-pink-500/60",topBorder:"border-t-pink-500",badgeBg:"bg-pink-500/15 text-pink-300 border-pink-500/30",glow:"rgba(236, 72, 153, 0.25)",icon:St,color:"#EC4899"},service:{border:"border-cyan-500/30 hover:border-cyan-500/60",topBorder:"border-t-cyan-500",badgeBg:"bg-cyan-500/15 text-cyan-300 border-cyan-500/30",glow:"rgba(6, 182, 212, 0.25)",icon:Qx,color:"#06B6D4"},ong:{border:"border-emerald-500/30 hover:border-emerald-500/60",topBorder:"border-t-emerald-500",badgeBg:"bg-emerald-500/15 text-emerald-300 border-emerald-500/30",glow:"rgba(16, 185, 129, 0.25)",icon:ui,color:"#10B981"}};function j2(t){if(!t||typeof t!="string")return t;const e=t.trim(),n=e.match(/\/https\/(.+)$/i);if(n)return"https://"+n[1];const i=e.match(/\/http\/(.+)$/i);return i?"http://"+i[1]:e}function B2({src:t,alt:e,className:n=""}){const i=ne.useMemo(()=>j2(t)||"/assets/pyxie/sticker/sticker_smile.png",[t]),[r,s]=ne.useState(i),[a,o]=ne.useState(0),[c,u]=ne.useState(!1);ne.useEffect(()=>{s(i),o(0),u(!1)},[i]);const f=()=>{a===0&&i&&(i.startsWith("http://")||i.startsWith("https://"))?(o(1),s(`/api/partnerships/proxy-image?url=${encodeURIComponent(i)}`)):a<=1&&(o(2),s("/assets/pyxie/sticker/sticker_smile.png"))};return l.jsx("img",{src:r,alt:e,loading:"lazy",decoding:"async",onLoad:()=>u(!0),onError:f,className:`${n} transition-opacity duration-300 ${c?"opacity-100":"opacity-70"}`})}function km({partner:t,isFeatured:e=!1,t:n,lang:i,onBump:r,bumpingId:s,onShare:a,copiedId:o}){const[c,u]=ne.useState(!1),f=t.macroCategory||"community",p=Dm[f]||Dm.community;p.icon;const h=t.publicDesc||"",x=h.length>140,_=!x||c?h:`${h.slice(0,140)}...`,S=t.categoryLabel&&(t.categoryLabel[i]||t.categoryLabel.en)||t.categoryKey||"",m=s===t.id,d=o===t.id;return l.jsxs("div",{id:`partner-${t.id}`,className:`relative group flex flex-col rounded-2xl bg-[#120a24]/80 backdrop-blur-xl border border-t-[3px] ${p.topBorder} ${p.border} transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl overflow-hidden ${e?"ring-1 ring-amber-400/30 shadow-amber-500/10":""}`,style:{boxShadow:e?"0 12px 35px rgba(0,0,0,0.6), 0 0 25px rgba(245, 158, 11, 0.12)":"0 10px 30px rgba(0,0,0,0.5)"},children:[e&&l.jsxs("div",{className:"absolute top-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-xs font-extrabold shadow-lg shadow-amber-500/20",children:[l.jsx(ql,{className:"w-3.5 h-3.5"}),l.jsx("span",{children:n("partnerships.featuredBadge")})]}),l.jsx("button",{onClick:()=>a(t),title:n("partnerships.share"),className:"absolute top-3 right-3 z-20 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-slate-300 hover:text-white border border-white/10 backdrop-blur-md transition-all active:scale-95",children:d?l.jsx(Es,{className:"w-3.5 h-3.5 text-emerald-400"}):l.jsx(fs,{className:"w-3.5 h-3.5"})}),l.jsxs("div",{className:"relative w-full h-44 sm:h-48 overflow-hidden bg-[#0a0515]",children:[l.jsx(B2,{src:t.imageUrl,alt:`Parceria: ${t.projectName}`,className:"w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"}),l.jsx("div",{className:"absolute inset-0 bg-gradient-to-t from-[#120a24] via-[#120a24]/40 to-transparent"})]}),l.jsxs("div",{className:"flex-1 p-5 sm:p-6 flex flex-col justify-between",children:[l.jsxs("div",{children:[l.jsxs("div",{className:"flex items-center justify-between gap-2 mb-3",children:[l.jsxs("div",{className:`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${p.badgeBg}`,children:[l.jsx("span",{children:t.categoryEmoji||"🤝"}),l.jsx("span",{children:S})]}),l.jsxs("div",{className:"inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-500/10 text-amber-300 border border-amber-500/25 shadow-sm",title:`${t.bumpCount||0} ${n("partnerships.bumpStreak")}`,children:[l.jsx(ig,{className:"w-3.5 h-3.5 text-amber-400 animate-pulse"}),l.jsxs("span",{children:[t.bumpCount||0," ",n("partnerships.bumpStreak")]})]})]}),l.jsx("h3",{className:"font-title font-extrabold text-lg sm:text-xl text-white group-hover:text-pink-300 transition-colors line-clamp-1",children:t.projectName}),l.jsxs("div",{className:"mt-2 text-sm text-slate-300/90 leading-relaxed",children:[l.jsx("p",{className:"whitespace-pre-line break-words",children:_}),x&&l.jsxs("button",{type:"button",onClick:()=>u(!c),className:"mt-2 inline-flex items-center gap-1 text-xs font-bold text-pink-400 hover:text-pink-300 hover:underline focus:outline-none transition-colors",children:[l.jsx("span",{children:n(c?"partnerships.readLess":"partnerships.readMore")}),c?l.jsx(Fy,{className:"w-3.5 h-3.5"}):l.jsx(Iy,{className:"w-3.5 h-3.5"})]})]})]}),l.jsxs("div",{className:"mt-6 pt-4 border-t border-purple-500/15 flex items-center gap-2.5",children:[l.jsxs("a",{href:t.accessLink||"#",target:"_blank",rel:"noopener noreferrer nofollow",className:"flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-600/20 hover:shadow-purple-600/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0",children:[l.jsx("span",{children:n("partnerships.visit")}),l.jsx(ng,{className:"w-3.5 h-3.5"})]}),l.jsxs("button",{onClick:()=>r(t.id),disabled:m,className:"inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 hover:border-emerald-500/50 shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0",title:n("partnerships.bump"),children:[l.jsx(Zy,{className:`w-4 h-4 ${m?"animate-spin":""}`}),l.jsx("span",{className:"hidden sm:inline",children:n("partnerships.bump")})]})]})]})]})}function H2({t,lang:e}){const[n,i]=ne.useState([]),[r,s]=ne.useState({}),[a,o]=ne.useState("all"),[c,u]=ne.useState(""),[f,p]=ne.useState(!0),[h,x]=ne.useState(null),[_,S]=ne.useState(null),[m,d]=ne.useState(""),g=y=>{d(y),setTimeout(()=>d(""),4500)},v=(y=null)=>{p(!0);const b=`/api/partnerships${y&&y!=="all"?`?category=${encodeURIComponent(y)}`:""}`;fetch(b).then(O=>O.json()).then(O=>{O&&(i(O.catalog||[]),O.mosaic&&s(O.mosaic))}).catch(O=>{console.error("[Partnerships] Erro ao carregar catálogo:",O)}).finally(()=>p(!1))};ne.useEffect(()=>{v(a==="all"?null:a)},[a]),ne.useEffect(()=>{const b=new URLSearchParams(window.location.search).get("partner")||window.location.hash.replace("#partner-","");b&&n.length>0&&setTimeout(()=>{const O=document.getElementById(`partner-${b}`);O&&(O.scrollIntoView({behavior:"smooth",block:"center"}),O.classList.add("ring-2","ring-pink-500"))},400)},[n]);const w=async y=>{x(y);try{const b=await fetch(`/api/partnerships/bump/${encodeURIComponent(y)}?lang=${e}`,{method:"POST"}),O=await b.json();b.ok?(g(O.message||t("partnerships.bumpSuccess")),v(a==="all"?null:a)):g(O.message||t("partnerships.bumpWait"))}catch{g(t("common.error"))}finally{x(null)}},R=y=>{const b=`${window.location.origin}/parcerias?partner=${encodeURIComponent(y.id)}`;navigator.clipboard&&navigator.clipboard.writeText(b).then(()=>{S(y.id),g(t("partnerships.copied")),setTimeout(()=>S(null),2500)})},E=ne.useMemo(()=>{if(!c.trim())return n;const y=c.toLowerCase().trim();return n.filter(b=>b.projectName&&b.projectName.toLowerCase().includes(y)||b.publicDesc&&b.publicDesc.toLowerCase().includes(y)||b.categoryKey&&b.categoryKey.toLowerCase().includes(y)||b.macroCategory&&b.macroCategory.toLowerCase().includes(y))},[n,c]),A=[{key:"all",label:t("partnerships.tabAll"),icon:rd},{key:"community",label:t("partnerships.tabCommunity"),icon:sd},{key:"creator",label:t("partnerships.tabCreator"),icon:St},{key:"service",label:t("partnerships.tabService"),icon:Qx},{key:"ong",label:t("partnerships.tabOng"),icon:ui}],N=ne.useMemo(()=>n.reduce((y,b)=>y+(b.bumpCount||0),0),[n]),F=ne.useMemo(()=>Object.values(r||{}).filter(Boolean),[r]);return l.jsxs("div",{className:"relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16",children:[m&&l.jsxs("div",{className:"fixed bottom-6 right-6 z-50 animate-bounce flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#120a24]/95 border border-emerald-400 text-white shadow-2xl backdrop-blur-2xl",children:[l.jsx(St,{className:"w-5 h-5 text-emerald-400 shrink-0"}),l.jsx("span",{className:"text-sm font-semibold",children:m})]}),l.jsxs("div",{className:"text-center max-w-3xl mx-auto mb-12 sm:mb-16",children:[l.jsxs("div",{className:"inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-bold tracking-wide uppercase shadow-lg shadow-emerald-500/10 mb-6",children:[l.jsx(Ia,{className:"w-4 h-4 text-emerald-400"}),l.jsx("span",{children:t("partnerships.badge")})]}),l.jsxs("div",{className:"relative w-36 h-24 sm:w-52 sm:h-32 mx-auto mb-6 flex items-center justify-center",children:[l.jsx("div",{className:"absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse"}),l.jsx("img",{src:"/assets/pyxie/icons/astaroth_heart_icon.svg?v=2.2.3",alt:"Guardião Astaroth",className:"relative z-10 w-full h-full object-contain filter drop-shadow-[0_8px_24px_rgba(16,185,129,0.45)] transform hover:scale-105 transition-transform duration-300"})]}),l.jsxs("h1",{className:"font-title font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight",children:[l.jsxs("span",{children:[t("partnerships.titlePrefix")," "]}),l.jsx("span",{className:"bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent",children:t("partnerships.titleHighlight")})]}),l.jsx("p",{className:"mt-4 sm:mt-6 text-base sm:text-lg text-slate-300/85 leading-relaxed font-normal",children:t("partnerships.subtitle")}),l.jsxs("div",{className:"mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6",children:[l.jsxs("div",{className:"flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/5 border border-purple-500/20 backdrop-blur-md",children:[l.jsx("img",{src:"/assets/pyxie/emojis/astaroth_gem.png",alt:"Gem",className:"w-5 h-5 object-contain"}),l.jsxs("div",{className:"text-left",children:[l.jsx("div",{className:"text-xs text-purple-300 font-medium",children:t("partnerships.statPartners")}),l.jsx("div",{className:"text-lg font-extrabold text-white font-title",children:n.length})]})]}),l.jsxs("div",{className:"flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/5 border border-amber-500/20 backdrop-blur-md",children:[l.jsx(ig,{className:"w-5 h-5 text-amber-400"}),l.jsxs("div",{className:"text-left",children:[l.jsx("div",{className:"text-xs text-amber-300 font-medium",children:t("partnerships.statBumps")}),l.jsx("div",{className:"text-lg font-extrabold text-white font-title",children:N})]})]}),l.jsxs("div",{className:"flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/5 border border-cyan-500/20 backdrop-blur-md",children:[l.jsx(rd,{className:"w-5 h-5 text-cyan-400"}),l.jsxs("div",{className:"text-left",children:[l.jsx("div",{className:"text-xs text-cyan-300 font-medium",children:t("partnerships.statCategories")}),l.jsx("div",{className:"text-lg font-extrabold text-white font-title",children:"4"})]})]})]})]}),a==="all"&&F.length>0&&!c&&l.jsxs("div",{className:"mb-14",children:[l.jsxs("div",{className:"flex items-center gap-3 mb-6",children:[l.jsx(ql,{className:"w-6 h-6 text-amber-400"}),l.jsxs("div",{children:[l.jsx("h2",{className:"font-title font-extrabold text-xl sm:text-2xl text-white",children:t("partnerships.featuredBadge")}),l.jsx("p",{className:"text-xs sm:text-sm text-slate-400",children:t("partnerships.featuredDesc")})]})]}),l.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6",children:F.map(y=>l.jsx(km,{partner:y,isFeatured:!0,t,lang:e,onBump:w,bumpingId:h,onShare:R,copiedId:_},`mosaic-${y.id}`))})]}),l.jsxs("div",{className:"mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4",children:[l.jsx("div",{className:"flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none",children:A.map(y=>{const b=y.icon,O=a===y.key;return l.jsxs("button",{onClick:()=>o(y.key),className:`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all active:scale-95 ${O?"bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-600/25 border border-pink-500/40":"bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-purple-500/20"}`,children:[l.jsx(b,{className:"w-4 h-4"}),l.jsx("span",{children:y.label})]},y.key)})}),l.jsxs("div",{className:"relative w-full md:w-80",children:[l.jsx($l,{className:"absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400"}),l.jsx("input",{type:"text",value:c,onChange:y=>u(y.target.value),placeholder:t("partnerships.searchPlaceholder"),className:"w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-purple-500/20 focus:border-pink-500 text-sm text-white placeholder-slate-400 focus:outline-none transition-all"}),c&&l.jsx("button",{onClick:()=>u(""),className:"absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white",children:"✕"})]})]}),l.jsxs("div",{className:"mb-14",children:[l.jsxs("div",{className:"flex items-center justify-between gap-4 mb-6",children:[l.jsxs("h2",{className:"font-title font-extrabold text-xl sm:text-2xl text-white flex items-center gap-2.5",children:[l.jsx(sd,{className:"w-5 h-5 text-purple-400"}),l.jsx("span",{children:t("partnerships.catalogTitle")})]}),l.jsxs("span",{className:"text-xs sm:text-sm text-slate-400",children:[E.length," ",t("partnerships.statPartners").toLowerCase()]})]}),f?l.jsxs("div",{className:"text-center py-20",children:[l.jsx("div",{className:"inline-block w-8 h-8 border-4 border-purple-500 border-t-pink-500 rounded-full animate-spin mb-4"}),l.jsx("p",{className:"text-slate-400 text-sm",children:t("partnerships.loading")})]}):E.length===0?l.jsxs("div",{className:"text-center py-20 px-4 rounded-3xl bg-white/5 border border-purple-500/15",children:[l.jsx(eg,{className:"w-10 h-10 text-purple-400 mx-auto mb-3 opacity-60"}),l.jsx("p",{className:"text-slate-300 font-semibold",children:t("partnerships.empty")})]}):l.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",children:E.map(y=>l.jsx(km,{partner:y,isFeatured:!1,t,lang:e,onBump:w,bumpingId:h,onShare:R,copiedId:_},y.id))})]}),l.jsxs("div",{className:"relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/40 via-pink-900/30 to-indigo-900/40 border border-pink-500/30 p-8 sm:p-10 mb-16 backdrop-blur-2xl text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8",children:[l.jsxs("div",{className:"max-w-xl",children:[l.jsxs("div",{className:"inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs font-bold uppercase mb-3",children:[l.jsx(St,{className:"w-3.5 h-3.5 text-pink-400"}),l.jsx("span",{children:"Alianças Acolhedoras"})]}),l.jsx("h2",{className:"font-title font-black text-2xl sm:text-3xl text-white",children:t("partnerships.applyTitle")}),l.jsx("p",{className:"mt-2 text-sm sm:text-base text-slate-300 leading-relaxed",children:t("partnerships.applyDesc")})]}),l.jsxs("a",{href:"/discord",target:"_blank",rel:"noopener noreferrer",className:"shrink-0 inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 shadow-xl shadow-pink-600/30 hover:shadow-pink-600/50 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-base",children:[l.jsx("span",{children:"💬"}),l.jsx("span",{children:t("partnerships.applyBtn")})]})]}),l.jsx(lf,{t,lang:e})]})}const Im={pt:{"nav.features":"Recursos","nav.commands":"Comandos","nav.wiki":"Wiki","nav.museum":"Museu","nav.bonus":"Bônus","nav.support":"Suporte","nav.invite":"Adicionar Pyxie","nav.install":"Usar na minha conta","hero.badge":"Online & Operacional • Discord.js v14","hero.titlePrefix":"A Fada Companheira do seu","hero.titleHighlight":"Servidor Discord","hero.subtitle":"Economia Mágica com moedinhas e feijões, Tarot dos 78 Arcanos em Canvas HD, 22 Carreiras e Dinâmica Social imersiva no Discord.","hero.btnInvite":"Adicionar ao Discord","hero.btnSupport":"Conhecer a Cringelândia","hero.installLine":"Quer jogar com a Pyxie em qualquer DM ou grupo?","hero.installCta":"Adicionar à minha conta","hero.badgeEconomy":"Economia Viva","hero.badgeCareers":"22 Carreiras & Vocações","hero.badgeUptime":"Uptime Permanente","terminal.tabWork":"/py-work (Expediente)","terminal.tabMarriage":"/py-casamento (Amor)","terminal.tabTarot":"/py-tarot (Oráculo)","terminal.workTitle":"💼 Expediente Profissional: Alquimista Místico","terminal.workDesc":"Você precisa misturar a essência da Rosa Arcana com pó estelar. Qual proporção você escolhe?","terminal.opt1":"1. Proporção Áurea (Equilíbrio)","terminal.opt2":"2. Sobrecarga Mística (Alto Risco)","terminal.opt3":"3. Destilação Serena (Conservador)","terminal.workResult":"✨ Sucesso Perfeito! A poção brilhou em néon rosa. +95 moedinhas e +15 XP de Alquimia!","terminal.marriageTitle":"💍 Status Matrimonial: Pyxie & Astaroth","terminal.loveBar":"Barra do Amor Eterno","terminal.loveTree":"🌳 Árvore da Vida: Nível 3 (+30% Amor / 12h)","terminal.loveVault":"🏦 Cofre do Casal: 12.450 moedas (Rendimento +5%/dia)","terminal.tarotTitle":"🔮 Tiragem do Dia: Os 78 Arcanos","terminal.tarotCard":"O Mago (The Magician)","terminal.tarotDesc":'"O poder da criação e transmutação está vivo em suas mãos hoje. Use a astúcia e a determinação para moldar seu destino."',"museum.badge":"Acervo Cultural da Comunidade","museum.title":"Globo das Artes Mágicas da Pyxie","museum.subtitle":"Globo 3D holográfico com projeção esférica das criações e artes da comunidade.","museum.mobileTitle":"Mural das Artes Mágicas da Pyxie","museum.mobileSubtitle":"Mural especial com as criações e ilustrações da comunidade da Cringelândia.","museum.exploreAll":"Explorar Galeria Completa da Comunidade ➔","museum.artShield":"🛡️ Obra protegida por direitos autorais da comunidade. Respeite os artistas!","museum.inspect":"Inspecionar Obra","museum.author":"Artista","museum.id":"ID da Peça","wiki.badge":"Enciclopédia Oficial • Pyxie & Cringelândia","wiki.title":"Guia Oficial & Enciclopédia Interativa","wiki.subtitle":"Explore lore, regras, economia viva, as 22 vocações, oráculo de tarot e comandos oficiais.","wiki.tabCommunity":"Comunidade & Acolhimento","wiki.tabEconomy":"Economia Mágica","wiki.tabCareers":"22 Vocações & Trabalho","wiki.tabTarot":"Tarot dos 78 Arcanos","wiki.tabMarriage":"Social & Família","wiki.tabCommands":"Catálogo de Comandos","wiki.tabFaq":"Dúvidas & FAQ","wiki.searchPlaceholder":"Pressione Ctrl+K ou digite para buscar comandos...","wiki.copied":"Copiado para a área de transferência!","wiki.copyBtn":"Copiar comando","shopee.title":"Achadinhos da Pyxie: Mimos de Setup & Papelaria","shopee.subtitle":"Curadoria exclusiva de pelúcias, iluminação RGB, papelaria gótica e mimos para seu quarto.","shopee.cta":"Ver na Shopee ➔","bonus.title":"Portal Encantado de Recompensas","bonus.subtitle":"Aguarde os 10 segundos mágicos de conexão cósmica para resgatar suas moedas diárias.","bonus.ready":"Bônus Pronto para Resgate!","bonus.claim":"Reivindicar Moedas Mágicas ✨","bonus.claimed":"🎉 Recompensa reivindicada com sucesso!","footer.rights":"Pyxie © 2026 • Feita com carinho para comunidades do mundo todo.","footer.terms":"Termos & Proteção a Menores","footer.parents":"Para pais e profissionais","footer.transparency":"Transparência","footer.install":"Usar na minha conta","footer.community":"Discord da Cringelândia","footer.wiki":"Wiki Oficial","footer.bonus":"Bônus Web","footer.museum":"Museu de Arte","pillars.badge":"Pilares Oficiais","cring.badge":"🌸 A casa da Pyxie","cring.title":"Cringelândia: a comunidade por trás da Pyxie","cring.desc":"Um servidor brasileiro para pessoas neurodivergentes e para quem acha o mundo barulhento demais. É lá que a Pyxie mora e onde ficam os sistemas mais especiais dela.","cring.c1Title":"Acolhimento sem julgamento","cring.c1Desc":"Canais de desabafo protegidos, check-in de novatos, controle de brigas e uma staff humana que cuida de verdade.","cring.c2Title":"Só na Cringelândia","cring.c2Desc":"Catacumbas de Veludo, chefe da semana, Casinha, Oficina, Mercado, Festival da Temporada e o Passe da Pyxie.","cring.c3Title":"Arte humana e Museu","cring.c3Desc":"Missões de arte, Arte da Semana e um Museu feito pela comunidade, com crédito para cada artista.","cring.btnHub":"Conhecer a Cringelândia","cring.btnJoin":"Entrar no servidor","cring.btnParents":"Para pais e profissionais","pillars.title":"Explore o Universo da Pyxie","pillars.desc":"Desenvolvida para transformar servidores do Discord em comunidades ativas, divertidas e engajadas.","pillars.p1Title":"Tarot dos 78 Arcanos & Álbum","pillars.p1Desc":"Tire cartas dos 78 arcanos ilustrados com arte em Canvas HD, consulte oráculos diários, interpretações diretas e invertidas e complete seu álbum colecionável.","pillars.p2Title":"Economia Viva & 22 Vocações","pillars.p2Desc":"Acumule moedinhas e feijões mágicos, escolha entre 22 carreiras dinâmicas com minigames em cada turno de trabalho e escale o ranking de riqueza.","pillars.p3Title":"Matrimônio, Casa & Dinâmica Familiar","pillars.p3Desc":"Casamentos bilaterais permanentes, compra de casas, cultivo da Árvore da Vida, cofre de amor com juros e herdeiros que estagiam e trazem moedas.","pillars.p4Title":"Quiz & Desafios da Comunidade","pillars.p4Desc":"Desafie seus amigos com centenas de perguntas de cultura pop, conhecimentos gerais e lógica com recompensas automáticas por agilidade e acerto.","pillars.p5Title":"Minigames & Lazer Social","pillars.p5Desc":"Dispute Jokenpô, quebre o Biscoito da Sorte, descubra afinidade no /py-ship, brinque de Quem é Mais Provável e personalize temas visuais no perfil.","catalog.all":"Todos","catalog.empty":"Nenhum comando encontrado para esta categoria.","cmdModal.copyCmd":"Copiar Sintaxe","cmdModal.copiedCmd":"Comando Copiado! ✨","cmdModal.copyLink":"Copiar Deep Link","cmdModal.copiedLink":"Link Copiado! 🔗","cmdModal.cooldown":"Cooldown","cmdModal.cooldownSeconds":"3 segundos","cmdModal.permissions":"Permissões","cmdModal.platform":"Plataforma","cmdModal.platformVal":"Slash & Prefixo","cmdModal.aliasesTitle":"Prefixos Alternativos (py!)","cmdModal.liveSimulation":"Resposta Real no Discord","cmdModal.close":"Fechar (ESC)","palette.placeholder":"Buscar comandos por nome, palavra-chave ou categoria...","palette.empty":"Nenhum comando encontrado para esta busca.","palette.navigate":"↑↓ Navegar","palette.open":"↵ Abrir Detalhes","palette.esc":"ESC para fechar","museum.modalUnderstood":"Compreendi","museum.modalForum":"Ver no Fórum do Museu","museum.artShieldTitle":"Proteção de Propriedade Visual","nav.partnerships":"Parcerias","footer.partnerships":"Mural de Parcerias","partnerships.badge":"Guardião Astaroth • Alianças Vivas","partnerships.titlePrefix":"Mural das Alianças de","partnerships.titleHighlight":"Astaroth","partnerships.subtitle":"Explore projetos parceiros, comunidades acolhedoras, canais de criadores e ferramentas aliadas da Cringelândia e Pyxie. Impulsione suas alianças favoritas!","partnerships.statPartners":"Parcerias Ativas","partnerships.statBumps":"Impulsos Totais","partnerships.statCategories":"Categorias","partnerships.searchPlaceholder":"Buscar parceiro por nome, categoria ou descrição...","partnerships.tabAll":"Todas","partnerships.tabCommunity":"Comunidades","partnerships.tabCreator":"Criadores","partnerships.tabService":"Serviços & Bots","partnerships.tabOng":"ONGs & Causas","partnerships.featuredBadge":"Destaque de Astaroth","partnerships.featuredDesc":"Alianças em evidência impulsionadas pela comunidade","partnerships.catalogTitle":"Todas as Alianças","partnerships.catalogDesc":"Projetos e servidores verificados pela guarda de Astaroth","partnerships.readMore":"Leia mais","partnerships.readLess":"Ler menos","partnerships.visit":"Conhecer Projeto","partnerships.bump":"Impulsionar","partnerships.bumpStreak":"Impulsos","partnerships.bumpWait":"Aguarde {hours}h para impulsionar este projeto novamente.","partnerships.bumpSuccess":"Projeto impulsionado com sucesso no mural!","partnerships.share":"Copiar Link","partnerships.copied":"Link copiado para a área de transferência!","partnerships.empty":"Nenhuma parceria encontrada para este filtro.","partnerships.loading":"Carregando mural de alianças...","partnerships.applyTitle":"Quer ser parceiro da Pyxie & Cringelândia?","partnerships.applyDesc":"Envie a candidatura da sua comunidade ou projeto diretamente com o comando /py-parceria no nosso servidor oficial.","partnerships.applyBtn":"Entrar na Cringelândia"},en:{"nav.features":"Features","nav.commands":"Commands","nav.wiki":"Wiki","nav.museum":"Museum","nav.bonus":"Bonus","nav.support":"Support","nav.invite":"Add Pyxie","nav.install":"Use on my account","hero.badge":"Online & Operational • Discord.js v14","hero.titlePrefix":"The Companion Fairy for Your","hero.titleHighlight":"Discord Server","hero.subtitle":"Living Economy with magic coins and beans, 78 Tarot Arcana in HD Canvas, 22 Careers, and immersive Social Dynamics on Discord.","hero.btnInvite":"Add to Discord","hero.btnSupport":"Visit Cringelândia","hero.installLine":"Want to play with Pyxie in any DM or group?","hero.installCta":"Add to my account","hero.badgeEconomy":"Living Economy","hero.badgeCareers":"22 Unique Vocations","hero.badgeUptime":"Permanent Uptime","terminal.tabWork":"/py-work (Shift)","terminal.tabMarriage":"/py-casamento (Family)","terminal.tabTarot":"/py-tarot (Oracle)","terminal.workTitle":"💼 Career Shift: Mystic Alchemist","terminal.workDesc":"You need to blend Arcane Rose essence with stardust. Which ratio do you choose?","terminal.opt1":"1. Golden Ratio (Balance)","terminal.opt2":"2. Mystic Surge (High Risk)","terminal.opt3":"3. Serene Distillation (Safe)","terminal.workResult":"✨ Perfect Outcome! The potion flared in neon pink. +95 coins and +15 Alchemy XP!","terminal.marriageTitle":"💍 Marriage Status: Pyxie & Astaroth","terminal.loveBar":"Eternal Love Gauge","terminal.loveTree":"🌳 Tree of Life: Level 3 (+30% Love / 12h)","terminal.loveVault":"🏦 Love Vault: 12,450 coins (+5%/day interest)","terminal.tarotTitle":"🔮 Daily Card Draw: The 78 Arcana","terminal.tarotCard":"The Magician","terminal.tarotDesc":'"The power of creation and transmutation is alive in your hands today. Use wit and determination to shape reality."',"museum.badge":"Community Cultural Archive","museum.title":"Pyxie's Magical Art Globe","museum.subtitle":"3D holographic globe with spherical projection of community artwork.","museum.mobileTitle":"Pyxie's Magical Art Showcase","museum.mobileSubtitle":"Special showcase of creations and illustrations by the community.","museum.exploreAll":"Explore Full Community Gallery ➔","museum.artShield":"🛡️ Artwork protected by community copyright. Respect the creators!","museum.inspect":"Inspect Artwork","museum.author":"Artist","museum.id":"Piece ID","wiki.badge":"Official Encyclopedia • Pyxie & Cringelândia","wiki.title":"Official Guide & Interactive Encyclopedia","wiki.subtitle":"Explore lore, guidelines, live economy, 22 vocations, tarot oracle and official bot commands.","wiki.tabCommunity":"Community & Sanctuary","wiki.tabEconomy":"Living Economy","wiki.tabCareers":"22 Vocations & Work","wiki.tabTarot":"78 Arcana Tarot","wiki.tabMarriage":"Social & Marriage","wiki.tabCommands":"Commands Catalog","wiki.tabFaq":"Questions & FAQ","wiki.searchPlaceholder":"Press Ctrl+K or type to search commands...","wiki.copied":"Copied to clipboard!","wiki.copyBtn":"Copy command","shopee.title":"Pyxie's Finds: Cozy Setup & Stationery","shopee.subtitle":"Handpicked plushies, RGB ambiance, cyber-goth stationery and desk accessories.","shopee.cta":"Check on Shopee ➔","bonus.title":"Enchanted Reward Portal","bonus.subtitle":"Wait for the 10-second cosmic alignment to claim your daily coins.","bonus.ready":"Bonus Ready to Claim!","bonus.claim":"Claim Magic Coins ✨","bonus.claimed":"🎉 Reward claimed successfully!","footer.rights":"Pyxie © 2026 • Crafted with love for communities worldwide.","footer.terms":"Terms & Child Safety","footer.parents":"For parents and professionals","footer.transparency":"Transparency","footer.install":"Use on my account","footer.community":"Cringelândia Discord","footer.wiki":"Official Wiki","footer.bonus":"Web Bonus","footer.museum":"Art Museum","pillars.badge":"Official Pillars","cring.badge":"🌸 Pyxie's home","cring.title":"Cringelândia: the community behind Pyxie","cring.desc":"A Brazilian server for neurodivergent people and for anyone who finds the world too loud. It's where Pyxie lives and where her most special systems are.","cring.c1Title":"Support without judgment","cring.c1Desc":"Protected vent channels, newcomer check-ins, conflict care and a human staff that truly cares.","cring.c2Title":"Only in Cringelândia","cring.c2Desc":"Velvet Catacombs, weekly boss, Cozy Room, Workshop, Market, Seasonal Festival and the Pyxie Pass.","cring.c3Title":"Human art and the Museum","cring.c3Desc":"Art missions, Art of the Week and a community-made Museum, with credit for every artist.","cring.btnHub":"Discover Cringelândia","cring.btnJoin":"Join the server","cring.btnParents":"For parents and professionals","pillars.title":"Discover the World of Pyxie","pillars.desc":"Built to transform Discord servers into vibrant, entertaining, and deeply engaged communities.","pillars.p1Title":"78 Tarot Arcana & Album","pillars.p1Desc":"Draw from 78 illustrated tarot arcana in HD Canvas art, consult daily oracles, upright and reversed meanings, and collect card albums.","pillars.p2Title":"Living Economy & 22 Careers","pillars.p2Desc":"Collect coins & magic beans, advance through 22 interactive professions with minigames each work shift, and climb wealth rankings.","pillars.p3Title":"Marriage, Home & Family Dynamics","pillars.p3Desc":"Permanent bilateral marriages, cozy houses, Tree of Life cultivation, interest-bearing Love Vault, and heir children working jobs.","pillars.p4Title":"Quiz & Community Challenges","pillars.p4Desc":"Challenge friends with hundreds of pop culture, trivia, and logic questions with automated speed and accuracy coin rewards.","pillars.p5Title":"Minigames & Social Fun","pillars.p5Desc":"Play Rock Paper Scissors, break Fortune Cookies, test compatibility with /py-ship, play Most Likely To, and customize profile themes.","catalog.all":"All","catalog.empty":"No commands found for this category.","cmdModal.copyCmd":"Copy Command","cmdModal.copiedCmd":"Command Copied! ✨","cmdModal.copyLink":"Copy Deep Link","cmdModal.copiedLink":"Link Copied! 🔗","cmdModal.cooldown":"Cooldown","cmdModal.cooldownSeconds":"3 seconds","cmdModal.permissions":"Permissions","cmdModal.platform":"Platform","cmdModal.platformVal":"Slash & Prefix","cmdModal.aliasesTitle":"Alternative Prefixes (py!)","cmdModal.liveSimulation":"Live Discord Simulation","cmdModal.close":"Close (ESC)","palette.placeholder":"Search commands by name, keyword or category...","palette.empty":"No commands found.","palette.navigate":"↑↓ Navigate","palette.open":"↵ Open Details","palette.esc":"ESC to close","museum.modalUnderstood":"Understood","museum.modalForum":"View in Museum Forum","museum.artShieldTitle":"Visual Property Protection","nav.partnerships":"Partnerships","footer.partnerships":"Partnerships Board","partnerships.badge":"Guardian Astaroth • Active Alliances","partnerships.titlePrefix":"Alliance Sanctuary of","partnerships.titleHighlight":"Astaroth","partnerships.subtitle":"Explore welcoming communities, creator hubs, allied tools, and partner projects of Cringelândia and Pyxie. Bump and support your favorite alliances!","partnerships.statPartners":"Active Alliances","partnerships.statBumps":"Total Bumps","partnerships.statCategories":"Categories","partnerships.searchPlaceholder":"Search partners by name, category or description...","partnerships.tabAll":"All","partnerships.tabCommunity":"Communities","partnerships.tabCreator":"Creators","partnerships.tabService":"Services & Bots","partnerships.tabOng":"NGOs & Causes","partnerships.featuredBadge":"Astaroth's Spotlight","partnerships.featuredDesc":"Highlighted alliances boosted by the community","partnerships.catalogTitle":"All Alliances","partnerships.catalogDesc":"Verified projects and servers guarded by Astaroth","partnerships.readMore":"Read more","partnerships.readLess":"Read less","partnerships.visit":"Visit Project","partnerships.bump":"Bump","partnerships.bumpStreak":"Bumps","partnerships.bumpWait":"Wait {hours}h before bumping this project again.","partnerships.bumpSuccess":"Project boosted successfully on the sanctuary board!","partnerships.share":"Copy Link","partnerships.copied":"Link copied to clipboard!","partnerships.empty":"No partners found for this filter.","partnerships.loading":"Loading alliances sanctuary...","partnerships.applyTitle":"Want to partner with Pyxie & Cringelândia?","partnerships.applyDesc":"Submit your community or project application directly with the /py-parceria command in our official Discord server.","partnerships.applyBtn":"Join Cringelândia"}};function V2(){const[t,e]=ne.useState(()=>{const u=new URLSearchParams(window.location.search).get("lang");if(u==="pt"||u==="en")return u;const f=localStorage.getItem("pyxie_lang");return f==="pt"||f==="en"?f:navigator.language&&navigator.language.startsWith("en")?"en":"pt"}),[n,i]=ne.useState({guilds:18,users:2450,uptime:"99.9%"}),r=c=>{var u,f;return((u=Im[t])==null?void 0:u[c])||((f=Im.pt)==null?void 0:f[c])||c};ne.useEffect(()=>{const c=new Ay({duration:1.2,easing:p=>Math.min(1,1.001-Math.pow(2,-10*p)),orientation:"vertical",gestureOrientation:"vertical",smoothWheel:!0,wheelMultiplier:1,touchMultiplier:2});function u(p){c.raf(p),requestAnimationFrame(u)}const f=requestAnimationFrame(u);return()=>{cancelAnimationFrame(f),c.destroy()}},[]),ne.useEffect(()=>{fetch("/api/stats").then(c=>c.json()).then(c=>{c&&c.success&&i({guilds:c.guilds||18,users:c.users||2450,uptime:c.uptimeFormatted||"99.9%"})}).catch(()=>{fetch("/api/status").then(c=>c.json()).then(c=>{c&&c.online&&i(u=>({...u,guilds:c.guilds||u.guilds}))}).catch(()=>{})})},[]),ne.useEffect(()=>{document.documentElement.lang=t==="pt"?"pt-BR":"en"},[t]);const s=window.location.pathname.toLowerCase();let a=k2,o="";if(s.includes("wiki"))a=I2;else if(s.includes("museu")||s.includes("museum"))a=F2;else if(s.includes("bonus"))a=O2;else if(s.includes("parcerias")||s.includes("partnerships"))a=H2;else if(s.startsWith("/u/")||s.includes("/u/")){a=z2;const c=window.location.pathname.split(/\/u\/?/i);c.length>1&&(o=c[1].split("/")[0])}return l.jsxs("div",{className:"bg-[#080410] text-slate-100 min-h-screen flex flex-col font-sans selection:bg-pink-500 selection:text-white relative overflow-x-hidden",children:[l.jsxs("div",{className:"fixed inset-0 pointer-events-none z-0 overflow-hidden",children:[l.jsx("div",{className:"absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[128px]"}),l.jsx("div",{className:"absolute top-[30%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px]"}),l.jsx("div",{className:"absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-[120px]"})]}),l.jsxs("div",{className:"relative z-10 flex flex-col min-h-screen",children:[l.jsx(l1,{lang:t,setLang:e,t:r}),l.jsx("main",{className:"flex-1",children:l.jsx(a,{t:r,lang:t,stats:n,userId:o})}),l.jsx(c1,{t:r,lang:t})]})]})}const Um=document.getElementById("pyxie-app")||document.getElementById("root");Um?(window.__PYXIE_REACT_ACTIVE__=!0,lu.createRoot(Um).render(l.jsx(ov.StrictMode,{children:l.jsx(V2,{})}))):console.warn("[Pyxie] Mounting container #pyxie-app or #root not found.");
