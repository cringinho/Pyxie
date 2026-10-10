var Ix=Object.defineProperty;var Ux=(t,e,n)=>e in t?Ix(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n;var we=(t,e,n)=>Ux(t,typeof e!="symbol"?e+"":e,n);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&i(a)}).observe(document,{childList:!0,subtree:!0});function n(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(r){if(r.ep)return;r.ep=!0;const s=n(r);fetch(r.href,s)}})();function Fx(t){return t&&t.__esModule&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}var Nm={exports:{}},Nl={},Pm={exports:{}},Ge={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Fa=Symbol.for("react.element"),Ox=Symbol.for("react.portal"),zx=Symbol.for("react.fragment"),Bx=Symbol.for("react.strict_mode"),jx=Symbol.for("react.profiler"),Hx=Symbol.for("react.provider"),Vx=Symbol.for("react.context"),Gx=Symbol.for("react.forward_ref"),Wx=Symbol.for("react.suspense"),Xx=Symbol.for("react.memo"),qx=Symbol.for("react.lazy"),hf=Symbol.iterator;function Yx(t){return t===null||typeof t!="object"?null:(t=hf&&t[hf]||t["@@iterator"],typeof t=="function"?t:null)}var Lm={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},Dm=Object.assign,km={};function Ds(t,e,n){this.props=t,this.context=e,this.refs=km,this.updater=n||Lm}Ds.prototype.isReactComponent={};Ds.prototype.setState=function(t,e){if(typeof t!="object"&&typeof t!="function"&&t!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,t,e,"setState")};Ds.prototype.forceUpdate=function(t){this.updater.enqueueForceUpdate(this,t,"forceUpdate")};function Im(){}Im.prototype=Ds.prototype;function Wd(t,e,n){this.props=t,this.context=e,this.refs=km,this.updater=n||Lm}var Xd=Wd.prototype=new Im;Xd.constructor=Wd;Dm(Xd,Ds.prototype);Xd.isPureReactComponent=!0;var ff=Array.isArray,Um=Object.prototype.hasOwnProperty,qd={current:null},Fm={key:!0,ref:!0,__self:!0,__source:!0};function Om(t,e,n){var i,r={},s=null,a=null;if(e!=null)for(i in e.ref!==void 0&&(a=e.ref),e.key!==void 0&&(s=""+e.key),e)Um.call(e,i)&&!Fm.hasOwnProperty(i)&&(r[i]=e[i]);var o=arguments.length-2;if(o===1)r.children=n;else if(1<o){for(var l=Array(o),u=0;u<o;u++)l[u]=arguments[u+2];r.children=l}if(t&&t.defaultProps)for(i in o=t.defaultProps,o)r[i]===void 0&&(r[i]=o[i]);return{$$typeof:Fa,type:t,key:s,ref:a,props:r,_owner:qd.current}}function $x(t,e){return{$$typeof:Fa,type:t.type,key:e,ref:t.ref,props:t.props,_owner:t._owner}}function Yd(t){return typeof t=="object"&&t!==null&&t.$$typeof===Fa}function Kx(t){var e={"=":"=0",":":"=2"};return"$"+t.replace(/[=:]/g,function(n){return e[n]})}var pf=/\/+/g;function ec(t,e){return typeof t=="object"&&t!==null&&t.key!=null?Kx(""+t.key):e.toString(36)}function Uo(t,e,n,i,r){var s=typeof t;(s==="undefined"||s==="boolean")&&(t=null);var a=!1;if(t===null)a=!0;else switch(s){case"string":case"number":a=!0;break;case"object":switch(t.$$typeof){case Fa:case Ox:a=!0}}if(a)return a=t,r=r(a),t=i===""?"."+ec(a,0):i,ff(r)?(n="",t!=null&&(n=t.replace(pf,"$&/")+"/"),Uo(r,e,n,"",function(u){return u})):r!=null&&(Yd(r)&&(r=$x(r,n+(!r.key||a&&a.key===r.key?"":(""+r.key).replace(pf,"$&/")+"/")+t)),e.push(r)),1;if(a=0,i=i===""?".":i+":",ff(t))for(var o=0;o<t.length;o++){s=t[o];var l=i+ec(s,o);a+=Uo(s,e,n,l,r)}else if(l=Yx(t),typeof l=="function")for(t=l.call(t),o=0;!(s=t.next()).done;)s=s.value,l=i+ec(s,o++),a+=Uo(s,e,n,l,r);else if(s==="object")throw e=String(t),Error("Objects are not valid as a React child (found: "+(e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)+"). If you meant to render a collection of children, use an array instead.");return a}function $a(t,e,n){if(t==null)return t;var i=[],r=0;return Uo(t,i,"","",function(s){return e.call(n,s,r++)}),i}function Zx(t){if(t._status===-1){var e=t._result;e=e(),e.then(function(n){(t._status===0||t._status===-1)&&(t._status=1,t._result=n)},function(n){(t._status===0||t._status===-1)&&(t._status=2,t._result=n)}),t._status===-1&&(t._status=0,t._result=e)}if(t._status===1)return t._result.default;throw t._result}var Kt={current:null},Fo={transition:null},Qx={ReactCurrentDispatcher:Kt,ReactCurrentBatchConfig:Fo,ReactCurrentOwner:qd};function zm(){throw Error("act(...) is not supported in production builds of React.")}Ge.Children={map:$a,forEach:function(t,e,n){$a(t,function(){e.apply(this,arguments)},n)},count:function(t){var e=0;return $a(t,function(){e++}),e},toArray:function(t){return $a(t,function(e){return e})||[]},only:function(t){if(!Yd(t))throw Error("React.Children.only expected to receive a single React element child.");return t}};Ge.Component=Ds;Ge.Fragment=zx;Ge.Profiler=jx;Ge.PureComponent=Wd;Ge.StrictMode=Bx;Ge.Suspense=Wx;Ge.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=Qx;Ge.act=zm;Ge.cloneElement=function(t,e,n){if(t==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+t+".");var i=Dm({},t.props),r=t.key,s=t.ref,a=t._owner;if(e!=null){if(e.ref!==void 0&&(s=e.ref,a=qd.current),e.key!==void 0&&(r=""+e.key),t.type&&t.type.defaultProps)var o=t.type.defaultProps;for(l in e)Um.call(e,l)&&!Fm.hasOwnProperty(l)&&(i[l]=e[l]===void 0&&o!==void 0?o[l]:e[l])}var l=arguments.length-2;if(l===1)i.children=n;else if(1<l){o=Array(l);for(var u=0;u<l;u++)o[u]=arguments[u+2];i.children=o}return{$$typeof:Fa,type:t.type,key:r,ref:s,props:i,_owner:a}};Ge.createContext=function(t){return t={$$typeof:Vx,_currentValue:t,_currentValue2:t,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},t.Provider={$$typeof:Hx,_context:t},t.Consumer=t};Ge.createElement=Om;Ge.createFactory=function(t){var e=Om.bind(null,t);return e.type=t,e};Ge.createRef=function(){return{current:null}};Ge.forwardRef=function(t){return{$$typeof:Gx,render:t}};Ge.isValidElement=Yd;Ge.lazy=function(t){return{$$typeof:qx,_payload:{_status:-1,_result:t},_init:Zx}};Ge.memo=function(t,e){return{$$typeof:Xx,type:t,compare:e===void 0?null:e}};Ge.startTransition=function(t){var e=Fo.transition;Fo.transition={};try{t()}finally{Fo.transition=e}};Ge.unstable_act=zm;Ge.useCallback=function(t,e){return Kt.current.useCallback(t,e)};Ge.useContext=function(t){return Kt.current.useContext(t)};Ge.useDebugValue=function(){};Ge.useDeferredValue=function(t){return Kt.current.useDeferredValue(t)};Ge.useEffect=function(t,e){return Kt.current.useEffect(t,e)};Ge.useId=function(){return Kt.current.useId()};Ge.useImperativeHandle=function(t,e,n){return Kt.current.useImperativeHandle(t,e,n)};Ge.useInsertionEffect=function(t,e){return Kt.current.useInsertionEffect(t,e)};Ge.useLayoutEffect=function(t,e){return Kt.current.useLayoutEffect(t,e)};Ge.useMemo=function(t,e){return Kt.current.useMemo(t,e)};Ge.useReducer=function(t,e,n){return Kt.current.useReducer(t,e,n)};Ge.useRef=function(t){return Kt.current.useRef(t)};Ge.useState=function(t){return Kt.current.useState(t)};Ge.useSyncExternalStore=function(t,e,n){return Kt.current.useSyncExternalStore(t,e,n)};Ge.useTransition=function(){return Kt.current.useTransition()};Ge.version="18.3.1";Pm.exports=Ge;var le=Pm.exports;const Jx=Fx(le);/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var ev=le,tv=Symbol.for("react.element"),nv=Symbol.for("react.fragment"),iv=Object.prototype.hasOwnProperty,rv=ev.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,sv={key:!0,ref:!0,__self:!0,__source:!0};function Bm(t,e,n){var i,r={},s=null,a=null;n!==void 0&&(s=""+n),e.key!==void 0&&(s=""+e.key),e.ref!==void 0&&(a=e.ref);for(i in e)iv.call(e,i)&&!sv.hasOwnProperty(i)&&(r[i]=e[i]);if(t&&t.defaultProps)for(i in e=t.defaultProps,e)r[i]===void 0&&(r[i]=e[i]);return{$$typeof:tv,type:t,key:s,ref:a,props:r,_owner:rv.current}}Nl.Fragment=nv;Nl.jsx=Bm;Nl.jsxs=Bm;Nm.exports=Nl;var c=Nm.exports,su={},jm={exports:{}},xn={},Hm={exports:{}},Vm={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */(function(t){function e(D,J){var ee=D.length;D.push(J);e:for(;0<ee;){var O=ee-1>>>1,oe=D[O];if(0<r(oe,J))D[O]=J,D[ee]=oe,ee=O;else break e}}function n(D){return D.length===0?null:D[0]}function i(D){if(D.length===0)return null;var J=D[0],ee=D.pop();if(ee!==J){D[0]=ee;e:for(var O=0,oe=D.length,Te=oe>>>1;O<Te;){var G=2*(O+1)-1,ie=D[G],ue=G+1,me=D[ue];if(0>r(ie,ee))ue<oe&&0>r(me,ie)?(D[O]=me,D[ue]=ee,O=ue):(D[O]=ie,D[G]=ee,O=G);else if(ue<oe&&0>r(me,ee))D[O]=me,D[ue]=ee,O=ue;else break e}}return J}function r(D,J){var ee=D.sortIndex-J.sortIndex;return ee!==0?ee:D.id-J.id}if(typeof performance=="object"&&typeof performance.now=="function"){var s=performance;t.unstable_now=function(){return s.now()}}else{var a=Date,o=a.now();t.unstable_now=function(){return a.now()-o}}var l=[],u=[],h=1,p=null,f=3,x=!1,_=!1,S=!1,m=typeof setTimeout=="function"?setTimeout:null,d=typeof clearTimeout=="function"?clearTimeout:null,g=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function v(D){for(var J=n(u);J!==null;){if(J.callback===null)i(u);else if(J.startTime<=D)i(u),J.sortIndex=J.expirationTime,e(l,J);else break;J=n(u)}}function w(D){if(S=!1,v(D),!_)if(n(l)!==null)_=!0,W(N);else{var J=n(u);J!==null&&$(w,J.startTime-D)}}function N(D,J){_=!1,S&&(S=!1,d(R),R=-1),x=!0;var ee=f;try{for(v(J),p=n(l);p!==null&&(!(p.expirationTime>J)||D&&!b());){var O=p.callback;if(typeof O=="function"){p.callback=null,f=p.priorityLevel;var oe=O(p.expirationTime<=J);J=t.unstable_now(),typeof oe=="function"?p.callback=oe:p===n(l)&&i(l),v(J)}else i(l);p=n(l)}if(p!==null)var Te=!0;else{var G=n(u);G!==null&&$(w,G.startTime-J),Te=!1}return Te}finally{p=null,f=ee,x=!1}}var E=!1,A=null,R=-1,F=5,y=-1;function b(){return!(t.unstable_now()-y<F)}function H(){if(A!==null){var D=t.unstable_now();y=D;var J=!0;try{J=A(!0,D)}finally{J?V():(E=!1,A=null)}}else E=!1}var V;if(typeof g=="function")V=function(){g(H)};else if(typeof MessageChannel<"u"){var q=new MessageChannel,Q=q.port2;q.port1.onmessage=H,V=function(){Q.postMessage(null)}}else V=function(){m(H,0)};function W(D){A=D,E||(E=!0,V())}function $(D,J){R=m(function(){D(t.unstable_now())},J)}t.unstable_IdlePriority=5,t.unstable_ImmediatePriority=1,t.unstable_LowPriority=4,t.unstable_NormalPriority=3,t.unstable_Profiling=null,t.unstable_UserBlockingPriority=2,t.unstable_cancelCallback=function(D){D.callback=null},t.unstable_continueExecution=function(){_||x||(_=!0,W(N))},t.unstable_forceFrameRate=function(D){0>D||125<D?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):F=0<D?Math.floor(1e3/D):5},t.unstable_getCurrentPriorityLevel=function(){return f},t.unstable_getFirstCallbackNode=function(){return n(l)},t.unstable_next=function(D){switch(f){case 1:case 2:case 3:var J=3;break;default:J=f}var ee=f;f=J;try{return D()}finally{f=ee}},t.unstable_pauseExecution=function(){},t.unstable_requestPaint=function(){},t.unstable_runWithPriority=function(D,J){switch(D){case 1:case 2:case 3:case 4:case 5:break;default:D=3}var ee=f;f=D;try{return J()}finally{f=ee}},t.unstable_scheduleCallback=function(D,J,ee){var O=t.unstable_now();switch(typeof ee=="object"&&ee!==null?(ee=ee.delay,ee=typeof ee=="number"&&0<ee?O+ee:O):ee=O,D){case 1:var oe=-1;break;case 2:oe=250;break;case 5:oe=1073741823;break;case 4:oe=1e4;break;default:oe=5e3}return oe=ee+oe,D={id:h++,callback:J,priorityLevel:D,startTime:ee,expirationTime:oe,sortIndex:-1},ee>O?(D.sortIndex=ee,e(u,D),n(l)===null&&D===n(u)&&(S?(d(R),R=-1):S=!0,$(w,ee-O))):(D.sortIndex=oe,e(l,D),_||x||(_=!0,W(N))),D},t.unstable_shouldYield=b,t.unstable_wrapCallback=function(D){var J=f;return function(){var ee=f;f=J;try{return D.apply(this,arguments)}finally{f=ee}}}})(Vm);Hm.exports=Vm;var av=Hm.exports;/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var ov=le,gn=av;function se(t){for(var e="https://reactjs.org/docs/error-decoder.html?invariant="+t,n=1;n<arguments.length;n++)e+="&args[]="+encodeURIComponent(arguments[n]);return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var Gm=new Set,xa={};function Nr(t,e){gs(t,e),gs(t+"Capture",e)}function gs(t,e){for(xa[t]=e,t=0;t<e.length;t++)Gm.add(e[t])}var fi=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),au=Object.prototype.hasOwnProperty,lv=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,mf={},gf={};function cv(t){return au.call(gf,t)?!0:au.call(mf,t)?!1:lv.test(t)?gf[t]=!0:(mf[t]=!0,!1)}function uv(t,e,n,i){if(n!==null&&n.type===0)return!1;switch(typeof e){case"function":case"symbol":return!0;case"boolean":return i?!1:n!==null?!n.acceptsBooleans:(t=t.toLowerCase().slice(0,5),t!=="data-"&&t!=="aria-");default:return!1}}function dv(t,e,n,i){if(e===null||typeof e>"u"||uv(t,e,n,i))return!0;if(i)return!1;if(n!==null)switch(n.type){case 3:return!e;case 4:return e===!1;case 5:return isNaN(e);case 6:return isNaN(e)||1>e}return!1}function Zt(t,e,n,i,r,s,a){this.acceptsBooleans=e===2||e===3||e===4,this.attributeName=i,this.attributeNamespace=r,this.mustUseProperty=n,this.propertyName=t,this.type=e,this.sanitizeURL=s,this.removeEmptyString=a}var kt={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(t){kt[t]=new Zt(t,0,!1,t,null,!1,!1)});[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(t){var e=t[0];kt[e]=new Zt(e,1,!1,t[1],null,!1,!1)});["contentEditable","draggable","spellCheck","value"].forEach(function(t){kt[t]=new Zt(t,2,!1,t.toLowerCase(),null,!1,!1)});["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(t){kt[t]=new Zt(t,2,!1,t,null,!1,!1)});"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(t){kt[t]=new Zt(t,3,!1,t.toLowerCase(),null,!1,!1)});["checked","multiple","muted","selected"].forEach(function(t){kt[t]=new Zt(t,3,!0,t,null,!1,!1)});["capture","download"].forEach(function(t){kt[t]=new Zt(t,4,!1,t,null,!1,!1)});["cols","rows","size","span"].forEach(function(t){kt[t]=new Zt(t,6,!1,t,null,!1,!1)});["rowSpan","start"].forEach(function(t){kt[t]=new Zt(t,5,!1,t.toLowerCase(),null,!1,!1)});var $d=/[\-:]([a-z])/g;function Kd(t){return t[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(t){var e=t.replace($d,Kd);kt[e]=new Zt(e,1,!1,t,null,!1,!1)});"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(t){var e=t.replace($d,Kd);kt[e]=new Zt(e,1,!1,t,"http://www.w3.org/1999/xlink",!1,!1)});["xml:base","xml:lang","xml:space"].forEach(function(t){var e=t.replace($d,Kd);kt[e]=new Zt(e,1,!1,t,"http://www.w3.org/XML/1998/namespace",!1,!1)});["tabIndex","crossOrigin"].forEach(function(t){kt[t]=new Zt(t,1,!1,t.toLowerCase(),null,!1,!1)});kt.xlinkHref=new Zt("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1);["src","href","action","formAction"].forEach(function(t){kt[t]=new Zt(t,1,!1,t.toLowerCase(),null,!0,!0)});function Zd(t,e,n,i){var r=kt.hasOwnProperty(e)?kt[e]:null;(r!==null?r.type!==0:i||!(2<e.length)||e[0]!=="o"&&e[0]!=="O"||e[1]!=="n"&&e[1]!=="N")&&(dv(e,n,r,i)&&(n=null),i||r===null?cv(e)&&(n===null?t.removeAttribute(e):t.setAttribute(e,""+n)):r.mustUseProperty?t[r.propertyName]=n===null?r.type===3?!1:"":n:(e=r.attributeName,i=r.attributeNamespace,n===null?t.removeAttribute(e):(r=r.type,n=r===3||r===4&&n===!0?"":""+n,i?t.setAttributeNS(i,e,n):t.setAttribute(e,n))))}var _i=ov.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,Ka=Symbol.for("react.element"),Yr=Symbol.for("react.portal"),$r=Symbol.for("react.fragment"),Qd=Symbol.for("react.strict_mode"),ou=Symbol.for("react.profiler"),Wm=Symbol.for("react.provider"),Xm=Symbol.for("react.context"),Jd=Symbol.for("react.forward_ref"),lu=Symbol.for("react.suspense"),cu=Symbol.for("react.suspense_list"),eh=Symbol.for("react.memo"),Ri=Symbol.for("react.lazy"),qm=Symbol.for("react.offscreen"),xf=Symbol.iterator;function zs(t){return t===null||typeof t!="object"?null:(t=xf&&t[xf]||t["@@iterator"],typeof t=="function"?t:null)}var gt=Object.assign,tc;function ea(t){if(tc===void 0)try{throw Error()}catch(n){var e=n.stack.trim().match(/\n( *(at )?)/);tc=e&&e[1]||""}return`
`+tc+t}var nc=!1;function ic(t,e){if(!t||nc)return"";nc=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(e)if(e=function(){throw Error()},Object.defineProperty(e.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(e,[])}catch(u){var i=u}Reflect.construct(t,[],e)}else{try{e.call()}catch(u){i=u}t.call(e.prototype)}else{try{throw Error()}catch(u){i=u}t()}}catch(u){if(u&&i&&typeof u.stack=="string"){for(var r=u.stack.split(`
`),s=i.stack.split(`
`),a=r.length-1,o=s.length-1;1<=a&&0<=o&&r[a]!==s[o];)o--;for(;1<=a&&0<=o;a--,o--)if(r[a]!==s[o]){if(a!==1||o!==1)do if(a--,o--,0>o||r[a]!==s[o]){var l=`
`+r[a].replace(" at new "," at ");return t.displayName&&l.includes("<anonymous>")&&(l=l.replace("<anonymous>",t.displayName)),l}while(1<=a&&0<=o);break}}}finally{nc=!1,Error.prepareStackTrace=n}return(t=t?t.displayName||t.name:"")?ea(t):""}function hv(t){switch(t.tag){case 5:return ea(t.type);case 16:return ea("Lazy");case 13:return ea("Suspense");case 19:return ea("SuspenseList");case 0:case 2:case 15:return t=ic(t.type,!1),t;case 11:return t=ic(t.type.render,!1),t;case 1:return t=ic(t.type,!0),t;default:return""}}function uu(t){if(t==null)return null;if(typeof t=="function")return t.displayName||t.name||null;if(typeof t=="string")return t;switch(t){case $r:return"Fragment";case Yr:return"Portal";case ou:return"Profiler";case Qd:return"StrictMode";case lu:return"Suspense";case cu:return"SuspenseList"}if(typeof t=="object")switch(t.$$typeof){case Xm:return(t.displayName||"Context")+".Consumer";case Wm:return(t._context.displayName||"Context")+".Provider";case Jd:var e=t.render;return t=t.displayName,t||(t=e.displayName||e.name||"",t=t!==""?"ForwardRef("+t+")":"ForwardRef"),t;case eh:return e=t.displayName||null,e!==null?e:uu(t.type)||"Memo";case Ri:e=t._payload,t=t._init;try{return uu(t(e))}catch{}}return null}function fv(t){var e=t.type;switch(t.tag){case 24:return"Cache";case 9:return(e.displayName||"Context")+".Consumer";case 10:return(e._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return t=e.render,t=t.displayName||t.name||"",e.displayName||(t!==""?"ForwardRef("+t+")":"ForwardRef");case 7:return"Fragment";case 5:return e;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return uu(e);case 8:return e===Qd?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof e=="function")return e.displayName||e.name||null;if(typeof e=="string")return e}return null}function qi(t){switch(typeof t){case"boolean":case"number":case"string":case"undefined":return t;case"object":return t;default:return""}}function Ym(t){var e=t.type;return(t=t.nodeName)&&t.toLowerCase()==="input"&&(e==="checkbox"||e==="radio")}function pv(t){var e=Ym(t)?"checked":"value",n=Object.getOwnPropertyDescriptor(t.constructor.prototype,e),i=""+t[e];if(!t.hasOwnProperty(e)&&typeof n<"u"&&typeof n.get=="function"&&typeof n.set=="function"){var r=n.get,s=n.set;return Object.defineProperty(t,e,{configurable:!0,get:function(){return r.call(this)},set:function(a){i=""+a,s.call(this,a)}}),Object.defineProperty(t,e,{enumerable:n.enumerable}),{getValue:function(){return i},setValue:function(a){i=""+a},stopTracking:function(){t._valueTracker=null,delete t[e]}}}}function Za(t){t._valueTracker||(t._valueTracker=pv(t))}function $m(t){if(!t)return!1;var e=t._valueTracker;if(!e)return!0;var n=e.getValue(),i="";return t&&(i=Ym(t)?t.checked?"true":"false":t.value),t=i,t!==n?(e.setValue(t),!0):!1}function tl(t){if(t=t||(typeof document<"u"?document:void 0),typeof t>"u")return null;try{return t.activeElement||t.body}catch{return t.body}}function du(t,e){var n=e.checked;return gt({},e,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:n??t._wrapperState.initialChecked})}function vf(t,e){var n=e.defaultValue==null?"":e.defaultValue,i=e.checked!=null?e.checked:e.defaultChecked;n=qi(e.value!=null?e.value:n),t._wrapperState={initialChecked:i,initialValue:n,controlled:e.type==="checkbox"||e.type==="radio"?e.checked!=null:e.value!=null}}function Km(t,e){e=e.checked,e!=null&&Zd(t,"checked",e,!1)}function hu(t,e){Km(t,e);var n=qi(e.value),i=e.type;if(n!=null)i==="number"?(n===0&&t.value===""||t.value!=n)&&(t.value=""+n):t.value!==""+n&&(t.value=""+n);else if(i==="submit"||i==="reset"){t.removeAttribute("value");return}e.hasOwnProperty("value")?fu(t,e.type,n):e.hasOwnProperty("defaultValue")&&fu(t,e.type,qi(e.defaultValue)),e.checked==null&&e.defaultChecked!=null&&(t.defaultChecked=!!e.defaultChecked)}function _f(t,e,n){if(e.hasOwnProperty("value")||e.hasOwnProperty("defaultValue")){var i=e.type;if(!(i!=="submit"&&i!=="reset"||e.value!==void 0&&e.value!==null))return;e=""+t._wrapperState.initialValue,n||e===t.value||(t.value=e),t.defaultValue=e}n=t.name,n!==""&&(t.name=""),t.defaultChecked=!!t._wrapperState.initialChecked,n!==""&&(t.name=n)}function fu(t,e,n){(e!=="number"||tl(t.ownerDocument)!==t)&&(n==null?t.defaultValue=""+t._wrapperState.initialValue:t.defaultValue!==""+n&&(t.defaultValue=""+n))}var ta=Array.isArray;function os(t,e,n,i){if(t=t.options,e){e={};for(var r=0;r<n.length;r++)e["$"+n[r]]=!0;for(n=0;n<t.length;n++)r=e.hasOwnProperty("$"+t[n].value),t[n].selected!==r&&(t[n].selected=r),r&&i&&(t[n].defaultSelected=!0)}else{for(n=""+qi(n),e=null,r=0;r<t.length;r++){if(t[r].value===n){t[r].selected=!0,i&&(t[r].defaultSelected=!0);return}e!==null||t[r].disabled||(e=t[r])}e!==null&&(e.selected=!0)}}function pu(t,e){if(e.dangerouslySetInnerHTML!=null)throw Error(se(91));return gt({},e,{value:void 0,defaultValue:void 0,children:""+t._wrapperState.initialValue})}function yf(t,e){var n=e.value;if(n==null){if(n=e.children,e=e.defaultValue,n!=null){if(e!=null)throw Error(se(92));if(ta(n)){if(1<n.length)throw Error(se(93));n=n[0]}e=n}e==null&&(e=""),n=e}t._wrapperState={initialValue:qi(n)}}function Zm(t,e){var n=qi(e.value),i=qi(e.defaultValue);n!=null&&(n=""+n,n!==t.value&&(t.value=n),e.defaultValue==null&&t.defaultValue!==n&&(t.defaultValue=n)),i!=null&&(t.defaultValue=""+i)}function Sf(t){var e=t.textContent;e===t._wrapperState.initialValue&&e!==""&&e!==null&&(t.value=e)}function Qm(t){switch(t){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function mu(t,e){return t==null||t==="http://www.w3.org/1999/xhtml"?Qm(e):t==="http://www.w3.org/2000/svg"&&e==="foreignObject"?"http://www.w3.org/1999/xhtml":t}var Qa,Jm=function(t){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(e,n,i,r){MSApp.execUnsafeLocalFunction(function(){return t(e,n,i,r)})}:t}(function(t,e){if(t.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in t)t.innerHTML=e;else{for(Qa=Qa||document.createElement("div"),Qa.innerHTML="<svg>"+e.valueOf().toString()+"</svg>",e=Qa.firstChild;t.firstChild;)t.removeChild(t.firstChild);for(;e.firstChild;)t.appendChild(e.firstChild)}});function va(t,e){if(e){var n=t.firstChild;if(n&&n===t.lastChild&&n.nodeType===3){n.nodeValue=e;return}}t.textContent=e}var aa={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},mv=["Webkit","ms","Moz","O"];Object.keys(aa).forEach(function(t){mv.forEach(function(e){e=e+t.charAt(0).toUpperCase()+t.substring(1),aa[e]=aa[t]})});function e0(t,e,n){return e==null||typeof e=="boolean"||e===""?"":n||typeof e!="number"||e===0||aa.hasOwnProperty(t)&&aa[t]?(""+e).trim():e+"px"}function t0(t,e){t=t.style;for(var n in e)if(e.hasOwnProperty(n)){var i=n.indexOf("--")===0,r=e0(n,e[n],i);n==="float"&&(n="cssFloat"),i?t.setProperty(n,r):t[n]=r}}var gv=gt({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function gu(t,e){if(e){if(gv[t]&&(e.children!=null||e.dangerouslySetInnerHTML!=null))throw Error(se(137,t));if(e.dangerouslySetInnerHTML!=null){if(e.children!=null)throw Error(se(60));if(typeof e.dangerouslySetInnerHTML!="object"||!("__html"in e.dangerouslySetInnerHTML))throw Error(se(61))}if(e.style!=null&&typeof e.style!="object")throw Error(se(62))}}function xu(t,e){if(t.indexOf("-")===-1)return typeof e.is=="string";switch(t){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var vu=null;function th(t){return t=t.target||t.srcElement||window,t.correspondingUseElement&&(t=t.correspondingUseElement),t.nodeType===3?t.parentNode:t}var _u=null,ls=null,cs=null;function wf(t){if(t=Ba(t)){if(typeof _u!="function")throw Error(se(280));var e=t.stateNode;e&&(e=Il(e),_u(t.stateNode,t.type,e))}}function n0(t){ls?cs?cs.push(t):cs=[t]:ls=t}function i0(){if(ls){var t=ls,e=cs;if(cs=ls=null,wf(t),e)for(t=0;t<e.length;t++)wf(e[t])}}function r0(t,e){return t(e)}function s0(){}var rc=!1;function a0(t,e,n){if(rc)return t(e,n);rc=!0;try{return r0(t,e,n)}finally{rc=!1,(ls!==null||cs!==null)&&(s0(),i0())}}function _a(t,e){var n=t.stateNode;if(n===null)return null;var i=Il(n);if(i===null)return null;n=i[e];e:switch(e){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(i=!i.disabled)||(t=t.type,i=!(t==="button"||t==="input"||t==="select"||t==="textarea")),t=!i;break e;default:t=!1}if(t)return null;if(n&&typeof n!="function")throw Error(se(231,e,typeof n));return n}var yu=!1;if(fi)try{var Bs={};Object.defineProperty(Bs,"passive",{get:function(){yu=!0}}),window.addEventListener("test",Bs,Bs),window.removeEventListener("test",Bs,Bs)}catch{yu=!1}function xv(t,e,n,i,r,s,a,o,l){var u=Array.prototype.slice.call(arguments,3);try{e.apply(n,u)}catch(h){this.onError(h)}}var oa=!1,nl=null,il=!1,Su=null,vv={onError:function(t){oa=!0,nl=t}};function _v(t,e,n,i,r,s,a,o,l){oa=!1,nl=null,xv.apply(vv,arguments)}function yv(t,e,n,i,r,s,a,o,l){if(_v.apply(this,arguments),oa){if(oa){var u=nl;oa=!1,nl=null}else throw Error(se(198));il||(il=!0,Su=u)}}function Pr(t){var e=t,n=t;if(t.alternate)for(;e.return;)e=e.return;else{t=e;do e=t,e.flags&4098&&(n=e.return),t=e.return;while(t)}return e.tag===3?n:null}function o0(t){if(t.tag===13){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function Mf(t){if(Pr(t)!==t)throw Error(se(188))}function Sv(t){var e=t.alternate;if(!e){if(e=Pr(t),e===null)throw Error(se(188));return e!==t?null:t}for(var n=t,i=e;;){var r=n.return;if(r===null)break;var s=r.alternate;if(s===null){if(i=r.return,i!==null){n=i;continue}break}if(r.child===s.child){for(s=r.child;s;){if(s===n)return Mf(r),t;if(s===i)return Mf(r),e;s=s.sibling}throw Error(se(188))}if(n.return!==i.return)n=r,i=s;else{for(var a=!1,o=r.child;o;){if(o===n){a=!0,n=r,i=s;break}if(o===i){a=!0,i=r,n=s;break}o=o.sibling}if(!a){for(o=s.child;o;){if(o===n){a=!0,n=s,i=r;break}if(o===i){a=!0,i=s,n=r;break}o=o.sibling}if(!a)throw Error(se(189))}}if(n.alternate!==i)throw Error(se(190))}if(n.tag!==3)throw Error(se(188));return n.stateNode.current===n?t:e}function l0(t){return t=Sv(t),t!==null?c0(t):null}function c0(t){if(t.tag===5||t.tag===6)return t;for(t=t.child;t!==null;){var e=c0(t);if(e!==null)return e;t=t.sibling}return null}var u0=gn.unstable_scheduleCallback,Ef=gn.unstable_cancelCallback,wv=gn.unstable_shouldYield,Mv=gn.unstable_requestPaint,yt=gn.unstable_now,Ev=gn.unstable_getCurrentPriorityLevel,nh=gn.unstable_ImmediatePriority,d0=gn.unstable_UserBlockingPriority,rl=gn.unstable_NormalPriority,bv=gn.unstable_LowPriority,h0=gn.unstable_IdlePriority,Pl=null,Kn=null;function Tv(t){if(Kn&&typeof Kn.onCommitFiberRoot=="function")try{Kn.onCommitFiberRoot(Pl,t,void 0,(t.current.flags&128)===128)}catch{}}var Hn=Math.clz32?Math.clz32:Rv,Av=Math.log,Cv=Math.LN2;function Rv(t){return t>>>=0,t===0?32:31-(Av(t)/Cv|0)|0}var Ja=64,eo=4194304;function na(t){switch(t&-t){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return t&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return t}}function sl(t,e){var n=t.pendingLanes;if(n===0)return 0;var i=0,r=t.suspendedLanes,s=t.pingedLanes,a=n&268435455;if(a!==0){var o=a&~r;o!==0?i=na(o):(s&=a,s!==0&&(i=na(s)))}else a=n&~r,a!==0?i=na(a):s!==0&&(i=na(s));if(i===0)return 0;if(e!==0&&e!==i&&!(e&r)&&(r=i&-i,s=e&-e,r>=s||r===16&&(s&4194240)!==0))return e;if(i&4&&(i|=n&16),e=t.entangledLanes,e!==0)for(t=t.entanglements,e&=i;0<e;)n=31-Hn(e),r=1<<n,i|=t[n],e&=~r;return i}function Nv(t,e){switch(t){case 1:case 2:case 4:return e+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function Pv(t,e){for(var n=t.suspendedLanes,i=t.pingedLanes,r=t.expirationTimes,s=t.pendingLanes;0<s;){var a=31-Hn(s),o=1<<a,l=r[a];l===-1?(!(o&n)||o&i)&&(r[a]=Nv(o,e)):l<=e&&(t.expiredLanes|=o),s&=~o}}function wu(t){return t=t.pendingLanes&-1073741825,t!==0?t:t&1073741824?1073741824:0}function f0(){var t=Ja;return Ja<<=1,!(Ja&4194240)&&(Ja=64),t}function sc(t){for(var e=[],n=0;31>n;n++)e.push(t);return e}function Oa(t,e,n){t.pendingLanes|=e,e!==536870912&&(t.suspendedLanes=0,t.pingedLanes=0),t=t.eventTimes,e=31-Hn(e),t[e]=n}function Lv(t,e){var n=t.pendingLanes&~e;t.pendingLanes=e,t.suspendedLanes=0,t.pingedLanes=0,t.expiredLanes&=e,t.mutableReadLanes&=e,t.entangledLanes&=e,e=t.entanglements;var i=t.eventTimes;for(t=t.expirationTimes;0<n;){var r=31-Hn(n),s=1<<r;e[r]=0,i[r]=-1,t[r]=-1,n&=~s}}function ih(t,e){var n=t.entangledLanes|=e;for(t=t.entanglements;n;){var i=31-Hn(n),r=1<<i;r&e|t[i]&e&&(t[i]|=e),n&=~r}}var it=0;function p0(t){return t&=-t,1<t?4<t?t&268435455?16:536870912:4:1}var m0,rh,g0,x0,v0,Mu=!1,to=[],Fi=null,Oi=null,zi=null,ya=new Map,Sa=new Map,Li=[],Dv="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function bf(t,e){switch(t){case"focusin":case"focusout":Fi=null;break;case"dragenter":case"dragleave":Oi=null;break;case"mouseover":case"mouseout":zi=null;break;case"pointerover":case"pointerout":ya.delete(e.pointerId);break;case"gotpointercapture":case"lostpointercapture":Sa.delete(e.pointerId)}}function js(t,e,n,i,r,s){return t===null||t.nativeEvent!==s?(t={blockedOn:e,domEventName:n,eventSystemFlags:i,nativeEvent:s,targetContainers:[r]},e!==null&&(e=Ba(e),e!==null&&rh(e)),t):(t.eventSystemFlags|=i,e=t.targetContainers,r!==null&&e.indexOf(r)===-1&&e.push(r),t)}function kv(t,e,n,i,r){switch(e){case"focusin":return Fi=js(Fi,t,e,n,i,r),!0;case"dragenter":return Oi=js(Oi,t,e,n,i,r),!0;case"mouseover":return zi=js(zi,t,e,n,i,r),!0;case"pointerover":var s=r.pointerId;return ya.set(s,js(ya.get(s)||null,t,e,n,i,r)),!0;case"gotpointercapture":return s=r.pointerId,Sa.set(s,js(Sa.get(s)||null,t,e,n,i,r)),!0}return!1}function _0(t){var e=mr(t.target);if(e!==null){var n=Pr(e);if(n!==null){if(e=n.tag,e===13){if(e=o0(n),e!==null){t.blockedOn=e,v0(t.priority,function(){g0(n)});return}}else if(e===3&&n.stateNode.current.memoizedState.isDehydrated){t.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}t.blockedOn=null}function Oo(t){if(t.blockedOn!==null)return!1;for(var e=t.targetContainers;0<e.length;){var n=Eu(t.domEventName,t.eventSystemFlags,e[0],t.nativeEvent);if(n===null){n=t.nativeEvent;var i=new n.constructor(n.type,n);vu=i,n.target.dispatchEvent(i),vu=null}else return e=Ba(n),e!==null&&rh(e),t.blockedOn=n,!1;e.shift()}return!0}function Tf(t,e,n){Oo(t)&&n.delete(e)}function Iv(){Mu=!1,Fi!==null&&Oo(Fi)&&(Fi=null),Oi!==null&&Oo(Oi)&&(Oi=null),zi!==null&&Oo(zi)&&(zi=null),ya.forEach(Tf),Sa.forEach(Tf)}function Hs(t,e){t.blockedOn===e&&(t.blockedOn=null,Mu||(Mu=!0,gn.unstable_scheduleCallback(gn.unstable_NormalPriority,Iv)))}function wa(t){function e(r){return Hs(r,t)}if(0<to.length){Hs(to[0],t);for(var n=1;n<to.length;n++){var i=to[n];i.blockedOn===t&&(i.blockedOn=null)}}for(Fi!==null&&Hs(Fi,t),Oi!==null&&Hs(Oi,t),zi!==null&&Hs(zi,t),ya.forEach(e),Sa.forEach(e),n=0;n<Li.length;n++)i=Li[n],i.blockedOn===t&&(i.blockedOn=null);for(;0<Li.length&&(n=Li[0],n.blockedOn===null);)_0(n),n.blockedOn===null&&Li.shift()}var us=_i.ReactCurrentBatchConfig,al=!0;function Uv(t,e,n,i){var r=it,s=us.transition;us.transition=null;try{it=1,sh(t,e,n,i)}finally{it=r,us.transition=s}}function Fv(t,e,n,i){var r=it,s=us.transition;us.transition=null;try{it=4,sh(t,e,n,i)}finally{it=r,us.transition=s}}function sh(t,e,n,i){if(al){var r=Eu(t,e,n,i);if(r===null)mc(t,e,i,ol,n),bf(t,i);else if(kv(r,t,e,n,i))i.stopPropagation();else if(bf(t,i),e&4&&-1<Dv.indexOf(t)){for(;r!==null;){var s=Ba(r);if(s!==null&&m0(s),s=Eu(t,e,n,i),s===null&&mc(t,e,i,ol,n),s===r)break;r=s}r!==null&&i.stopPropagation()}else mc(t,e,i,null,n)}}var ol=null;function Eu(t,e,n,i){if(ol=null,t=th(i),t=mr(t),t!==null)if(e=Pr(t),e===null)t=null;else if(n=e.tag,n===13){if(t=o0(e),t!==null)return t;t=null}else if(n===3){if(e.stateNode.current.memoizedState.isDehydrated)return e.tag===3?e.stateNode.containerInfo:null;t=null}else e!==t&&(t=null);return ol=t,null}function y0(t){switch(t){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(Ev()){case nh:return 1;case d0:return 4;case rl:case bv:return 16;case h0:return 536870912;default:return 16}default:return 16}}var Ii=null,ah=null,zo=null;function S0(){if(zo)return zo;var t,e=ah,n=e.length,i,r="value"in Ii?Ii.value:Ii.textContent,s=r.length;for(t=0;t<n&&e[t]===r[t];t++);var a=n-t;for(i=1;i<=a&&e[n-i]===r[s-i];i++);return zo=r.slice(t,1<i?1-i:void 0)}function Bo(t){var e=t.keyCode;return"charCode"in t?(t=t.charCode,t===0&&e===13&&(t=13)):t=e,t===10&&(t=13),32<=t||t===13?t:0}function no(){return!0}function Af(){return!1}function vn(t){function e(n,i,r,s,a){this._reactName=n,this._targetInst=r,this.type=i,this.nativeEvent=s,this.target=a,this.currentTarget=null;for(var o in t)t.hasOwnProperty(o)&&(n=t[o],this[o]=n?n(s):s[o]);return this.isDefaultPrevented=(s.defaultPrevented!=null?s.defaultPrevented:s.returnValue===!1)?no:Af,this.isPropagationStopped=Af,this}return gt(e.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=no)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=no)},persist:function(){},isPersistent:no}),e}var ks={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(t){return t.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},oh=vn(ks),za=gt({},ks,{view:0,detail:0}),Ov=vn(za),ac,oc,Vs,Ll=gt({},za,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:lh,button:0,buttons:0,relatedTarget:function(t){return t.relatedTarget===void 0?t.fromElement===t.srcElement?t.toElement:t.fromElement:t.relatedTarget},movementX:function(t){return"movementX"in t?t.movementX:(t!==Vs&&(Vs&&t.type==="mousemove"?(ac=t.screenX-Vs.screenX,oc=t.screenY-Vs.screenY):oc=ac=0,Vs=t),ac)},movementY:function(t){return"movementY"in t?t.movementY:oc}}),Cf=vn(Ll),zv=gt({},Ll,{dataTransfer:0}),Bv=vn(zv),jv=gt({},za,{relatedTarget:0}),lc=vn(jv),Hv=gt({},ks,{animationName:0,elapsedTime:0,pseudoElement:0}),Vv=vn(Hv),Gv=gt({},ks,{clipboardData:function(t){return"clipboardData"in t?t.clipboardData:window.clipboardData}}),Wv=vn(Gv),Xv=gt({},ks,{data:0}),Rf=vn(Xv),qv={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},Yv={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},$v={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function Kv(t){var e=this.nativeEvent;return e.getModifierState?e.getModifierState(t):(t=$v[t])?!!e[t]:!1}function lh(){return Kv}var Zv=gt({},za,{key:function(t){if(t.key){var e=qv[t.key]||t.key;if(e!=="Unidentified")return e}return t.type==="keypress"?(t=Bo(t),t===13?"Enter":String.fromCharCode(t)):t.type==="keydown"||t.type==="keyup"?Yv[t.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:lh,charCode:function(t){return t.type==="keypress"?Bo(t):0},keyCode:function(t){return t.type==="keydown"||t.type==="keyup"?t.keyCode:0},which:function(t){return t.type==="keypress"?Bo(t):t.type==="keydown"||t.type==="keyup"?t.keyCode:0}}),Qv=vn(Zv),Jv=gt({},Ll,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Nf=vn(Jv),e_=gt({},za,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:lh}),t_=vn(e_),n_=gt({},ks,{propertyName:0,elapsedTime:0,pseudoElement:0}),i_=vn(n_),r_=gt({},Ll,{deltaX:function(t){return"deltaX"in t?t.deltaX:"wheelDeltaX"in t?-t.wheelDeltaX:0},deltaY:function(t){return"deltaY"in t?t.deltaY:"wheelDeltaY"in t?-t.wheelDeltaY:"wheelDelta"in t?-t.wheelDelta:0},deltaZ:0,deltaMode:0}),s_=vn(r_),a_=[9,13,27,32],ch=fi&&"CompositionEvent"in window,la=null;fi&&"documentMode"in document&&(la=document.documentMode);var o_=fi&&"TextEvent"in window&&!la,w0=fi&&(!ch||la&&8<la&&11>=la),Pf=" ",Lf=!1;function M0(t,e){switch(t){case"keyup":return a_.indexOf(e.keyCode)!==-1;case"keydown":return e.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function E0(t){return t=t.detail,typeof t=="object"&&"data"in t?t.data:null}var Kr=!1;function l_(t,e){switch(t){case"compositionend":return E0(e);case"keypress":return e.which!==32?null:(Lf=!0,Pf);case"textInput":return t=e.data,t===Pf&&Lf?null:t;default:return null}}function c_(t,e){if(Kr)return t==="compositionend"||!ch&&M0(t,e)?(t=S0(),zo=ah=Ii=null,Kr=!1,t):null;switch(t){case"paste":return null;case"keypress":if(!(e.ctrlKey||e.altKey||e.metaKey)||e.ctrlKey&&e.altKey){if(e.char&&1<e.char.length)return e.char;if(e.which)return String.fromCharCode(e.which)}return null;case"compositionend":return w0&&e.locale!=="ko"?null:e.data;default:return null}}var u_={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Df(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e==="input"?!!u_[t.type]:e==="textarea"}function b0(t,e,n,i){n0(i),e=ll(e,"onChange"),0<e.length&&(n=new oh("onChange","change",null,n,i),t.push({event:n,listeners:e}))}var ca=null,Ma=null;function d_(t){U0(t,0)}function Dl(t){var e=Jr(t);if($m(e))return t}function h_(t,e){if(t==="change")return e}var T0=!1;if(fi){var cc;if(fi){var uc="oninput"in document;if(!uc){var kf=document.createElement("div");kf.setAttribute("oninput","return;"),uc=typeof kf.oninput=="function"}cc=uc}else cc=!1;T0=cc&&(!document.documentMode||9<document.documentMode)}function If(){ca&&(ca.detachEvent("onpropertychange",A0),Ma=ca=null)}function A0(t){if(t.propertyName==="value"&&Dl(Ma)){var e=[];b0(e,Ma,t,th(t)),a0(d_,e)}}function f_(t,e,n){t==="focusin"?(If(),ca=e,Ma=n,ca.attachEvent("onpropertychange",A0)):t==="focusout"&&If()}function p_(t){if(t==="selectionchange"||t==="keyup"||t==="keydown")return Dl(Ma)}function m_(t,e){if(t==="click")return Dl(e)}function g_(t,e){if(t==="input"||t==="change")return Dl(e)}function x_(t,e){return t===e&&(t!==0||1/t===1/e)||t!==t&&e!==e}var Gn=typeof Object.is=="function"?Object.is:x_;function Ea(t,e){if(Gn(t,e))return!0;if(typeof t!="object"||t===null||typeof e!="object"||e===null)return!1;var n=Object.keys(t),i=Object.keys(e);if(n.length!==i.length)return!1;for(i=0;i<n.length;i++){var r=n[i];if(!au.call(e,r)||!Gn(t[r],e[r]))return!1}return!0}function Uf(t){for(;t&&t.firstChild;)t=t.firstChild;return t}function Ff(t,e){var n=Uf(t);t=0;for(var i;n;){if(n.nodeType===3){if(i=t+n.textContent.length,t<=e&&i>=e)return{node:n,offset:e-t};t=i}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=Uf(n)}}function C0(t,e){return t&&e?t===e?!0:t&&t.nodeType===3?!1:e&&e.nodeType===3?C0(t,e.parentNode):"contains"in t?t.contains(e):t.compareDocumentPosition?!!(t.compareDocumentPosition(e)&16):!1:!1}function R0(){for(var t=window,e=tl();e instanceof t.HTMLIFrameElement;){try{var n=typeof e.contentWindow.location.href=="string"}catch{n=!1}if(n)t=e.contentWindow;else break;e=tl(t.document)}return e}function uh(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e&&(e==="input"&&(t.type==="text"||t.type==="search"||t.type==="tel"||t.type==="url"||t.type==="password")||e==="textarea"||t.contentEditable==="true")}function v_(t){var e=R0(),n=t.focusedElem,i=t.selectionRange;if(e!==n&&n&&n.ownerDocument&&C0(n.ownerDocument.documentElement,n)){if(i!==null&&uh(n)){if(e=i.start,t=i.end,t===void 0&&(t=e),"selectionStart"in n)n.selectionStart=e,n.selectionEnd=Math.min(t,n.value.length);else if(t=(e=n.ownerDocument||document)&&e.defaultView||window,t.getSelection){t=t.getSelection();var r=n.textContent.length,s=Math.min(i.start,r);i=i.end===void 0?s:Math.min(i.end,r),!t.extend&&s>i&&(r=i,i=s,s=r),r=Ff(n,s);var a=Ff(n,i);r&&a&&(t.rangeCount!==1||t.anchorNode!==r.node||t.anchorOffset!==r.offset||t.focusNode!==a.node||t.focusOffset!==a.offset)&&(e=e.createRange(),e.setStart(r.node,r.offset),t.removeAllRanges(),s>i?(t.addRange(e),t.extend(a.node,a.offset)):(e.setEnd(a.node,a.offset),t.addRange(e)))}}for(e=[],t=n;t=t.parentNode;)t.nodeType===1&&e.push({element:t,left:t.scrollLeft,top:t.scrollTop});for(typeof n.focus=="function"&&n.focus(),n=0;n<e.length;n++)t=e[n],t.element.scrollLeft=t.left,t.element.scrollTop=t.top}}var __=fi&&"documentMode"in document&&11>=document.documentMode,Zr=null,bu=null,ua=null,Tu=!1;function Of(t,e,n){var i=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;Tu||Zr==null||Zr!==tl(i)||(i=Zr,"selectionStart"in i&&uh(i)?i={start:i.selectionStart,end:i.selectionEnd}:(i=(i.ownerDocument&&i.ownerDocument.defaultView||window).getSelection(),i={anchorNode:i.anchorNode,anchorOffset:i.anchorOffset,focusNode:i.focusNode,focusOffset:i.focusOffset}),ua&&Ea(ua,i)||(ua=i,i=ll(bu,"onSelect"),0<i.length&&(e=new oh("onSelect","select",null,e,n),t.push({event:e,listeners:i}),e.target=Zr)))}function io(t,e){var n={};return n[t.toLowerCase()]=e.toLowerCase(),n["Webkit"+t]="webkit"+e,n["Moz"+t]="moz"+e,n}var Qr={animationend:io("Animation","AnimationEnd"),animationiteration:io("Animation","AnimationIteration"),animationstart:io("Animation","AnimationStart"),transitionend:io("Transition","TransitionEnd")},dc={},N0={};fi&&(N0=document.createElement("div").style,"AnimationEvent"in window||(delete Qr.animationend.animation,delete Qr.animationiteration.animation,delete Qr.animationstart.animation),"TransitionEvent"in window||delete Qr.transitionend.transition);function kl(t){if(dc[t])return dc[t];if(!Qr[t])return t;var e=Qr[t],n;for(n in e)if(e.hasOwnProperty(n)&&n in N0)return dc[t]=e[n];return t}var P0=kl("animationend"),L0=kl("animationiteration"),D0=kl("animationstart"),k0=kl("transitionend"),I0=new Map,zf="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function Zi(t,e){I0.set(t,e),Nr(e,[t])}for(var hc=0;hc<zf.length;hc++){var fc=zf[hc],y_=fc.toLowerCase(),S_=fc[0].toUpperCase()+fc.slice(1);Zi(y_,"on"+S_)}Zi(P0,"onAnimationEnd");Zi(L0,"onAnimationIteration");Zi(D0,"onAnimationStart");Zi("dblclick","onDoubleClick");Zi("focusin","onFocus");Zi("focusout","onBlur");Zi(k0,"onTransitionEnd");gs("onMouseEnter",["mouseout","mouseover"]);gs("onMouseLeave",["mouseout","mouseover"]);gs("onPointerEnter",["pointerout","pointerover"]);gs("onPointerLeave",["pointerout","pointerover"]);Nr("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));Nr("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));Nr("onBeforeInput",["compositionend","keypress","textInput","paste"]);Nr("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));Nr("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));Nr("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var ia="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),w_=new Set("cancel close invalid load scroll toggle".split(" ").concat(ia));function Bf(t,e,n){var i=t.type||"unknown-event";t.currentTarget=n,yv(i,e,void 0,t),t.currentTarget=null}function U0(t,e){e=(e&4)!==0;for(var n=0;n<t.length;n++){var i=t[n],r=i.event;i=i.listeners;e:{var s=void 0;if(e)for(var a=i.length-1;0<=a;a--){var o=i[a],l=o.instance,u=o.currentTarget;if(o=o.listener,l!==s&&r.isPropagationStopped())break e;Bf(r,o,u),s=l}else for(a=0;a<i.length;a++){if(o=i[a],l=o.instance,u=o.currentTarget,o=o.listener,l!==s&&r.isPropagationStopped())break e;Bf(r,o,u),s=l}}}if(il)throw t=Su,il=!1,Su=null,t}function lt(t,e){var n=e[Pu];n===void 0&&(n=e[Pu]=new Set);var i=t+"__bubble";n.has(i)||(F0(e,t,2,!1),n.add(i))}function pc(t,e,n){var i=0;e&&(i|=4),F0(n,t,i,e)}var ro="_reactListening"+Math.random().toString(36).slice(2);function ba(t){if(!t[ro]){t[ro]=!0,Gm.forEach(function(n){n!=="selectionchange"&&(w_.has(n)||pc(n,!1,t),pc(n,!0,t))});var e=t.nodeType===9?t:t.ownerDocument;e===null||e[ro]||(e[ro]=!0,pc("selectionchange",!1,e))}}function F0(t,e,n,i){switch(y0(e)){case 1:var r=Uv;break;case 4:r=Fv;break;default:r=sh}n=r.bind(null,e,n,t),r=void 0,!yu||e!=="touchstart"&&e!=="touchmove"&&e!=="wheel"||(r=!0),i?r!==void 0?t.addEventListener(e,n,{capture:!0,passive:r}):t.addEventListener(e,n,!0):r!==void 0?t.addEventListener(e,n,{passive:r}):t.addEventListener(e,n,!1)}function mc(t,e,n,i,r){var s=i;if(!(e&1)&&!(e&2)&&i!==null)e:for(;;){if(i===null)return;var a=i.tag;if(a===3||a===4){var o=i.stateNode.containerInfo;if(o===r||o.nodeType===8&&o.parentNode===r)break;if(a===4)for(a=i.return;a!==null;){var l=a.tag;if((l===3||l===4)&&(l=a.stateNode.containerInfo,l===r||l.nodeType===8&&l.parentNode===r))return;a=a.return}for(;o!==null;){if(a=mr(o),a===null)return;if(l=a.tag,l===5||l===6){i=s=a;continue e}o=o.parentNode}}i=i.return}a0(function(){var u=s,h=th(n),p=[];e:{var f=I0.get(t);if(f!==void 0){var x=oh,_=t;switch(t){case"keypress":if(Bo(n)===0)break e;case"keydown":case"keyup":x=Qv;break;case"focusin":_="focus",x=lc;break;case"focusout":_="blur",x=lc;break;case"beforeblur":case"afterblur":x=lc;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":x=Cf;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":x=Bv;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":x=t_;break;case P0:case L0:case D0:x=Vv;break;case k0:x=i_;break;case"scroll":x=Ov;break;case"wheel":x=s_;break;case"copy":case"cut":case"paste":x=Wv;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":x=Nf}var S=(e&4)!==0,m=!S&&t==="scroll",d=S?f!==null?f+"Capture":null:f;S=[];for(var g=u,v;g!==null;){v=g;var w=v.stateNode;if(v.tag===5&&w!==null&&(v=w,d!==null&&(w=_a(g,d),w!=null&&S.push(Ta(g,w,v)))),m)break;g=g.return}0<S.length&&(f=new x(f,_,null,n,h),p.push({event:f,listeners:S}))}}if(!(e&7)){e:{if(f=t==="mouseover"||t==="pointerover",x=t==="mouseout"||t==="pointerout",f&&n!==vu&&(_=n.relatedTarget||n.fromElement)&&(mr(_)||_[pi]))break e;if((x||f)&&(f=h.window===h?h:(f=h.ownerDocument)?f.defaultView||f.parentWindow:window,x?(_=n.relatedTarget||n.toElement,x=u,_=_?mr(_):null,_!==null&&(m=Pr(_),_!==m||_.tag!==5&&_.tag!==6)&&(_=null)):(x=null,_=u),x!==_)){if(S=Cf,w="onMouseLeave",d="onMouseEnter",g="mouse",(t==="pointerout"||t==="pointerover")&&(S=Nf,w="onPointerLeave",d="onPointerEnter",g="pointer"),m=x==null?f:Jr(x),v=_==null?f:Jr(_),f=new S(w,g+"leave",x,n,h),f.target=m,f.relatedTarget=v,w=null,mr(h)===u&&(S=new S(d,g+"enter",_,n,h),S.target=v,S.relatedTarget=m,w=S),m=w,x&&_)t:{for(S=x,d=_,g=0,v=S;v;v=Dr(v))g++;for(v=0,w=d;w;w=Dr(w))v++;for(;0<g-v;)S=Dr(S),g--;for(;0<v-g;)d=Dr(d),v--;for(;g--;){if(S===d||d!==null&&S===d.alternate)break t;S=Dr(S),d=Dr(d)}S=null}else S=null;x!==null&&jf(p,f,x,S,!1),_!==null&&m!==null&&jf(p,m,_,S,!0)}}e:{if(f=u?Jr(u):window,x=f.nodeName&&f.nodeName.toLowerCase(),x==="select"||x==="input"&&f.type==="file")var N=h_;else if(Df(f))if(T0)N=g_;else{N=p_;var E=f_}else(x=f.nodeName)&&x.toLowerCase()==="input"&&(f.type==="checkbox"||f.type==="radio")&&(N=m_);if(N&&(N=N(t,u))){b0(p,N,n,h);break e}E&&E(t,f,u),t==="focusout"&&(E=f._wrapperState)&&E.controlled&&f.type==="number"&&fu(f,"number",f.value)}switch(E=u?Jr(u):window,t){case"focusin":(Df(E)||E.contentEditable==="true")&&(Zr=E,bu=u,ua=null);break;case"focusout":ua=bu=Zr=null;break;case"mousedown":Tu=!0;break;case"contextmenu":case"mouseup":case"dragend":Tu=!1,Of(p,n,h);break;case"selectionchange":if(__)break;case"keydown":case"keyup":Of(p,n,h)}var A;if(ch)e:{switch(t){case"compositionstart":var R="onCompositionStart";break e;case"compositionend":R="onCompositionEnd";break e;case"compositionupdate":R="onCompositionUpdate";break e}R=void 0}else Kr?M0(t,n)&&(R="onCompositionEnd"):t==="keydown"&&n.keyCode===229&&(R="onCompositionStart");R&&(w0&&n.locale!=="ko"&&(Kr||R!=="onCompositionStart"?R==="onCompositionEnd"&&Kr&&(A=S0()):(Ii=h,ah="value"in Ii?Ii.value:Ii.textContent,Kr=!0)),E=ll(u,R),0<E.length&&(R=new Rf(R,t,null,n,h),p.push({event:R,listeners:E}),A?R.data=A:(A=E0(n),A!==null&&(R.data=A)))),(A=o_?l_(t,n):c_(t,n))&&(u=ll(u,"onBeforeInput"),0<u.length&&(h=new Rf("onBeforeInput","beforeinput",null,n,h),p.push({event:h,listeners:u}),h.data=A))}U0(p,e)})}function Ta(t,e,n){return{instance:t,listener:e,currentTarget:n}}function ll(t,e){for(var n=e+"Capture",i=[];t!==null;){var r=t,s=r.stateNode;r.tag===5&&s!==null&&(r=s,s=_a(t,n),s!=null&&i.unshift(Ta(t,s,r)),s=_a(t,e),s!=null&&i.push(Ta(t,s,r))),t=t.return}return i}function Dr(t){if(t===null)return null;do t=t.return;while(t&&t.tag!==5);return t||null}function jf(t,e,n,i,r){for(var s=e._reactName,a=[];n!==null&&n!==i;){var o=n,l=o.alternate,u=o.stateNode;if(l!==null&&l===i)break;o.tag===5&&u!==null&&(o=u,r?(l=_a(n,s),l!=null&&a.unshift(Ta(n,l,o))):r||(l=_a(n,s),l!=null&&a.push(Ta(n,l,o)))),n=n.return}a.length!==0&&t.push({event:e,listeners:a})}var M_=/\r\n?/g,E_=/\u0000|\uFFFD/g;function Hf(t){return(typeof t=="string"?t:""+t).replace(M_,`
`).replace(E_,"")}function so(t,e,n){if(e=Hf(e),Hf(t)!==e&&n)throw Error(se(425))}function cl(){}var Au=null,Cu=null;function Ru(t,e){return t==="textarea"||t==="noscript"||typeof e.children=="string"||typeof e.children=="number"||typeof e.dangerouslySetInnerHTML=="object"&&e.dangerouslySetInnerHTML!==null&&e.dangerouslySetInnerHTML.__html!=null}var Nu=typeof setTimeout=="function"?setTimeout:void 0,b_=typeof clearTimeout=="function"?clearTimeout:void 0,Vf=typeof Promise=="function"?Promise:void 0,T_=typeof queueMicrotask=="function"?queueMicrotask:typeof Vf<"u"?function(t){return Vf.resolve(null).then(t).catch(A_)}:Nu;function A_(t){setTimeout(function(){throw t})}function gc(t,e){var n=e,i=0;do{var r=n.nextSibling;if(t.removeChild(n),r&&r.nodeType===8)if(n=r.data,n==="/$"){if(i===0){t.removeChild(r),wa(e);return}i--}else n!=="$"&&n!=="$?"&&n!=="$!"||i++;n=r}while(n);wa(e)}function Bi(t){for(;t!=null;t=t.nextSibling){var e=t.nodeType;if(e===1||e===3)break;if(e===8){if(e=t.data,e==="$"||e==="$!"||e==="$?")break;if(e==="/$")return null}}return t}function Gf(t){t=t.previousSibling;for(var e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="$"||n==="$!"||n==="$?"){if(e===0)return t;e--}else n==="/$"&&e++}t=t.previousSibling}return null}var Is=Math.random().toString(36).slice(2),$n="__reactFiber$"+Is,Aa="__reactProps$"+Is,pi="__reactContainer$"+Is,Pu="__reactEvents$"+Is,C_="__reactListeners$"+Is,R_="__reactHandles$"+Is;function mr(t){var e=t[$n];if(e)return e;for(var n=t.parentNode;n;){if(e=n[pi]||n[$n]){if(n=e.alternate,e.child!==null||n!==null&&n.child!==null)for(t=Gf(t);t!==null;){if(n=t[$n])return n;t=Gf(t)}return e}t=n,n=t.parentNode}return null}function Ba(t){return t=t[$n]||t[pi],!t||t.tag!==5&&t.tag!==6&&t.tag!==13&&t.tag!==3?null:t}function Jr(t){if(t.tag===5||t.tag===6)return t.stateNode;throw Error(se(33))}function Il(t){return t[Aa]||null}var Lu=[],es=-1;function Qi(t){return{current:t}}function ut(t){0>es||(t.current=Lu[es],Lu[es]=null,es--)}function at(t,e){es++,Lu[es]=t.current,t.current=e}var Yi={},Ht=Qi(Yi),sn=Qi(!1),Mr=Yi;function xs(t,e){var n=t.type.contextTypes;if(!n)return Yi;var i=t.stateNode;if(i&&i.__reactInternalMemoizedUnmaskedChildContext===e)return i.__reactInternalMemoizedMaskedChildContext;var r={},s;for(s in n)r[s]=e[s];return i&&(t=t.stateNode,t.__reactInternalMemoizedUnmaskedChildContext=e,t.__reactInternalMemoizedMaskedChildContext=r),r}function an(t){return t=t.childContextTypes,t!=null}function ul(){ut(sn),ut(Ht)}function Wf(t,e,n){if(Ht.current!==Yi)throw Error(se(168));at(Ht,e),at(sn,n)}function O0(t,e,n){var i=t.stateNode;if(e=e.childContextTypes,typeof i.getChildContext!="function")return n;i=i.getChildContext();for(var r in i)if(!(r in e))throw Error(se(108,fv(t)||"Unknown",r));return gt({},n,i)}function dl(t){return t=(t=t.stateNode)&&t.__reactInternalMemoizedMergedChildContext||Yi,Mr=Ht.current,at(Ht,t),at(sn,sn.current),!0}function Xf(t,e,n){var i=t.stateNode;if(!i)throw Error(se(169));n?(t=O0(t,e,Mr),i.__reactInternalMemoizedMergedChildContext=t,ut(sn),ut(Ht),at(Ht,t)):ut(sn),at(sn,n)}var oi=null,Ul=!1,xc=!1;function z0(t){oi===null?oi=[t]:oi.push(t)}function N_(t){Ul=!0,z0(t)}function Ji(){if(!xc&&oi!==null){xc=!0;var t=0,e=it;try{var n=oi;for(it=1;t<n.length;t++){var i=n[t];do i=i(!0);while(i!==null)}oi=null,Ul=!1}catch(r){throw oi!==null&&(oi=oi.slice(t+1)),u0(nh,Ji),r}finally{it=e,xc=!1}}return null}var ts=[],ns=0,hl=null,fl=0,Sn=[],wn=0,Er=null,li=1,ci="";function cr(t,e){ts[ns++]=fl,ts[ns++]=hl,hl=t,fl=e}function B0(t,e,n){Sn[wn++]=li,Sn[wn++]=ci,Sn[wn++]=Er,Er=t;var i=li;t=ci;var r=32-Hn(i)-1;i&=~(1<<r),n+=1;var s=32-Hn(e)+r;if(30<s){var a=r-r%5;s=(i&(1<<a)-1).toString(32),i>>=a,r-=a,li=1<<32-Hn(e)+r|n<<r|i,ci=s+t}else li=1<<s|n<<r|i,ci=t}function dh(t){t.return!==null&&(cr(t,1),B0(t,1,0))}function hh(t){for(;t===hl;)hl=ts[--ns],ts[ns]=null,fl=ts[--ns],ts[ns]=null;for(;t===Er;)Er=Sn[--wn],Sn[wn]=null,ci=Sn[--wn],Sn[wn]=null,li=Sn[--wn],Sn[wn]=null}var mn=null,pn=null,ht=!1,On=null;function j0(t,e){var n=En(5,null,null,0);n.elementType="DELETED",n.stateNode=e,n.return=t,e=t.deletions,e===null?(t.deletions=[n],t.flags|=16):e.push(n)}function qf(t,e){switch(t.tag){case 5:var n=t.type;return e=e.nodeType!==1||n.toLowerCase()!==e.nodeName.toLowerCase()?null:e,e!==null?(t.stateNode=e,mn=t,pn=Bi(e.firstChild),!0):!1;case 6:return e=t.pendingProps===""||e.nodeType!==3?null:e,e!==null?(t.stateNode=e,mn=t,pn=null,!0):!1;case 13:return e=e.nodeType!==8?null:e,e!==null?(n=Er!==null?{id:li,overflow:ci}:null,t.memoizedState={dehydrated:e,treeContext:n,retryLane:1073741824},n=En(18,null,null,0),n.stateNode=e,n.return=t,t.child=n,mn=t,pn=null,!0):!1;default:return!1}}function Du(t){return(t.mode&1)!==0&&(t.flags&128)===0}function ku(t){if(ht){var e=pn;if(e){var n=e;if(!qf(t,e)){if(Du(t))throw Error(se(418));e=Bi(n.nextSibling);var i=mn;e&&qf(t,e)?j0(i,n):(t.flags=t.flags&-4097|2,ht=!1,mn=t)}}else{if(Du(t))throw Error(se(418));t.flags=t.flags&-4097|2,ht=!1,mn=t}}}function Yf(t){for(t=t.return;t!==null&&t.tag!==5&&t.tag!==3&&t.tag!==13;)t=t.return;mn=t}function ao(t){if(t!==mn)return!1;if(!ht)return Yf(t),ht=!0,!1;var e;if((e=t.tag!==3)&&!(e=t.tag!==5)&&(e=t.type,e=e!=="head"&&e!=="body"&&!Ru(t.type,t.memoizedProps)),e&&(e=pn)){if(Du(t))throw H0(),Error(se(418));for(;e;)j0(t,e),e=Bi(e.nextSibling)}if(Yf(t),t.tag===13){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(se(317));e:{for(t=t.nextSibling,e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="/$"){if(e===0){pn=Bi(t.nextSibling);break e}e--}else n!=="$"&&n!=="$!"&&n!=="$?"||e++}t=t.nextSibling}pn=null}}else pn=mn?Bi(t.stateNode.nextSibling):null;return!0}function H0(){for(var t=pn;t;)t=Bi(t.nextSibling)}function vs(){pn=mn=null,ht=!1}function fh(t){On===null?On=[t]:On.push(t)}var P_=_i.ReactCurrentBatchConfig;function Gs(t,e,n){if(t=n.ref,t!==null&&typeof t!="function"&&typeof t!="object"){if(n._owner){if(n=n._owner,n){if(n.tag!==1)throw Error(se(309));var i=n.stateNode}if(!i)throw Error(se(147,t));var r=i,s=""+t;return e!==null&&e.ref!==null&&typeof e.ref=="function"&&e.ref._stringRef===s?e.ref:(e=function(a){var o=r.refs;a===null?delete o[s]:o[s]=a},e._stringRef=s,e)}if(typeof t!="string")throw Error(se(284));if(!n._owner)throw Error(se(290,t))}return t}function oo(t,e){throw t=Object.prototype.toString.call(e),Error(se(31,t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t))}function $f(t){var e=t._init;return e(t._payload)}function V0(t){function e(d,g){if(t){var v=d.deletions;v===null?(d.deletions=[g],d.flags|=16):v.push(g)}}function n(d,g){if(!t)return null;for(;g!==null;)e(d,g),g=g.sibling;return null}function i(d,g){for(d=new Map;g!==null;)g.key!==null?d.set(g.key,g):d.set(g.index,g),g=g.sibling;return d}function r(d,g){return d=Gi(d,g),d.index=0,d.sibling=null,d}function s(d,g,v){return d.index=v,t?(v=d.alternate,v!==null?(v=v.index,v<g?(d.flags|=2,g):v):(d.flags|=2,g)):(d.flags|=1048576,g)}function a(d){return t&&d.alternate===null&&(d.flags|=2),d}function o(d,g,v,w){return g===null||g.tag!==6?(g=Ec(v,d.mode,w),g.return=d,g):(g=r(g,v),g.return=d,g)}function l(d,g,v,w){var N=v.type;return N===$r?h(d,g,v.props.children,w,v.key):g!==null&&(g.elementType===N||typeof N=="object"&&N!==null&&N.$$typeof===Ri&&$f(N)===g.type)?(w=r(g,v.props),w.ref=Gs(d,g,v),w.return=d,w):(w=qo(v.type,v.key,v.props,null,d.mode,w),w.ref=Gs(d,g,v),w.return=d,w)}function u(d,g,v,w){return g===null||g.tag!==4||g.stateNode.containerInfo!==v.containerInfo||g.stateNode.implementation!==v.implementation?(g=bc(v,d.mode,w),g.return=d,g):(g=r(g,v.children||[]),g.return=d,g)}function h(d,g,v,w,N){return g===null||g.tag!==7?(g=wr(v,d.mode,w,N),g.return=d,g):(g=r(g,v),g.return=d,g)}function p(d,g,v){if(typeof g=="string"&&g!==""||typeof g=="number")return g=Ec(""+g,d.mode,v),g.return=d,g;if(typeof g=="object"&&g!==null){switch(g.$$typeof){case Ka:return v=qo(g.type,g.key,g.props,null,d.mode,v),v.ref=Gs(d,null,g),v.return=d,v;case Yr:return g=bc(g,d.mode,v),g.return=d,g;case Ri:var w=g._init;return p(d,w(g._payload),v)}if(ta(g)||zs(g))return g=wr(g,d.mode,v,null),g.return=d,g;oo(d,g)}return null}function f(d,g,v,w){var N=g!==null?g.key:null;if(typeof v=="string"&&v!==""||typeof v=="number")return N!==null?null:o(d,g,""+v,w);if(typeof v=="object"&&v!==null){switch(v.$$typeof){case Ka:return v.key===N?l(d,g,v,w):null;case Yr:return v.key===N?u(d,g,v,w):null;case Ri:return N=v._init,f(d,g,N(v._payload),w)}if(ta(v)||zs(v))return N!==null?null:h(d,g,v,w,null);oo(d,v)}return null}function x(d,g,v,w,N){if(typeof w=="string"&&w!==""||typeof w=="number")return d=d.get(v)||null,o(g,d,""+w,N);if(typeof w=="object"&&w!==null){switch(w.$$typeof){case Ka:return d=d.get(w.key===null?v:w.key)||null,l(g,d,w,N);case Yr:return d=d.get(w.key===null?v:w.key)||null,u(g,d,w,N);case Ri:var E=w._init;return x(d,g,v,E(w._payload),N)}if(ta(w)||zs(w))return d=d.get(v)||null,h(g,d,w,N,null);oo(g,w)}return null}function _(d,g,v,w){for(var N=null,E=null,A=g,R=g=0,F=null;A!==null&&R<v.length;R++){A.index>R?(F=A,A=null):F=A.sibling;var y=f(d,A,v[R],w);if(y===null){A===null&&(A=F);break}t&&A&&y.alternate===null&&e(d,A),g=s(y,g,R),E===null?N=y:E.sibling=y,E=y,A=F}if(R===v.length)return n(d,A),ht&&cr(d,R),N;if(A===null){for(;R<v.length;R++)A=p(d,v[R],w),A!==null&&(g=s(A,g,R),E===null?N=A:E.sibling=A,E=A);return ht&&cr(d,R),N}for(A=i(d,A);R<v.length;R++)F=x(A,d,R,v[R],w),F!==null&&(t&&F.alternate!==null&&A.delete(F.key===null?R:F.key),g=s(F,g,R),E===null?N=F:E.sibling=F,E=F);return t&&A.forEach(function(b){return e(d,b)}),ht&&cr(d,R),N}function S(d,g,v,w){var N=zs(v);if(typeof N!="function")throw Error(se(150));if(v=N.call(v),v==null)throw Error(se(151));for(var E=N=null,A=g,R=g=0,F=null,y=v.next();A!==null&&!y.done;R++,y=v.next()){A.index>R?(F=A,A=null):F=A.sibling;var b=f(d,A,y.value,w);if(b===null){A===null&&(A=F);break}t&&A&&b.alternate===null&&e(d,A),g=s(b,g,R),E===null?N=b:E.sibling=b,E=b,A=F}if(y.done)return n(d,A),ht&&cr(d,R),N;if(A===null){for(;!y.done;R++,y=v.next())y=p(d,y.value,w),y!==null&&(g=s(y,g,R),E===null?N=y:E.sibling=y,E=y);return ht&&cr(d,R),N}for(A=i(d,A);!y.done;R++,y=v.next())y=x(A,d,R,y.value,w),y!==null&&(t&&y.alternate!==null&&A.delete(y.key===null?R:y.key),g=s(y,g,R),E===null?N=y:E.sibling=y,E=y);return t&&A.forEach(function(H){return e(d,H)}),ht&&cr(d,R),N}function m(d,g,v,w){if(typeof v=="object"&&v!==null&&v.type===$r&&v.key===null&&(v=v.props.children),typeof v=="object"&&v!==null){switch(v.$$typeof){case Ka:e:{for(var N=v.key,E=g;E!==null;){if(E.key===N){if(N=v.type,N===$r){if(E.tag===7){n(d,E.sibling),g=r(E,v.props.children),g.return=d,d=g;break e}}else if(E.elementType===N||typeof N=="object"&&N!==null&&N.$$typeof===Ri&&$f(N)===E.type){n(d,E.sibling),g=r(E,v.props),g.ref=Gs(d,E,v),g.return=d,d=g;break e}n(d,E);break}else e(d,E);E=E.sibling}v.type===$r?(g=wr(v.props.children,d.mode,w,v.key),g.return=d,d=g):(w=qo(v.type,v.key,v.props,null,d.mode,w),w.ref=Gs(d,g,v),w.return=d,d=w)}return a(d);case Yr:e:{for(E=v.key;g!==null;){if(g.key===E)if(g.tag===4&&g.stateNode.containerInfo===v.containerInfo&&g.stateNode.implementation===v.implementation){n(d,g.sibling),g=r(g,v.children||[]),g.return=d,d=g;break e}else{n(d,g);break}else e(d,g);g=g.sibling}g=bc(v,d.mode,w),g.return=d,d=g}return a(d);case Ri:return E=v._init,m(d,g,E(v._payload),w)}if(ta(v))return _(d,g,v,w);if(zs(v))return S(d,g,v,w);oo(d,v)}return typeof v=="string"&&v!==""||typeof v=="number"?(v=""+v,g!==null&&g.tag===6?(n(d,g.sibling),g=r(g,v),g.return=d,d=g):(n(d,g),g=Ec(v,d.mode,w),g.return=d,d=g),a(d)):n(d,g)}return m}var _s=V0(!0),G0=V0(!1),pl=Qi(null),ml=null,is=null,ph=null;function mh(){ph=is=ml=null}function gh(t){var e=pl.current;ut(pl),t._currentValue=e}function Iu(t,e,n){for(;t!==null;){var i=t.alternate;if((t.childLanes&e)!==e?(t.childLanes|=e,i!==null&&(i.childLanes|=e)):i!==null&&(i.childLanes&e)!==e&&(i.childLanes|=e),t===n)break;t=t.return}}function ds(t,e){ml=t,ph=is=null,t=t.dependencies,t!==null&&t.firstContext!==null&&(t.lanes&e&&(rn=!0),t.firstContext=null)}function Cn(t){var e=t._currentValue;if(ph!==t)if(t={context:t,memoizedValue:e,next:null},is===null){if(ml===null)throw Error(se(308));is=t,ml.dependencies={lanes:0,firstContext:t}}else is=is.next=t;return e}var gr=null;function xh(t){gr===null?gr=[t]:gr.push(t)}function W0(t,e,n,i){var r=e.interleaved;return r===null?(n.next=n,xh(e)):(n.next=r.next,r.next=n),e.interleaved=n,mi(t,i)}function mi(t,e){t.lanes|=e;var n=t.alternate;for(n!==null&&(n.lanes|=e),n=t,t=t.return;t!==null;)t.childLanes|=e,n=t.alternate,n!==null&&(n.childLanes|=e),n=t,t=t.return;return n.tag===3?n.stateNode:null}var Ni=!1;function vh(t){t.updateQueue={baseState:t.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function X0(t,e){t=t.updateQueue,e.updateQueue===t&&(e.updateQueue={baseState:t.baseState,firstBaseUpdate:t.firstBaseUpdate,lastBaseUpdate:t.lastBaseUpdate,shared:t.shared,effects:t.effects})}function hi(t,e){return{eventTime:t,lane:e,tag:0,payload:null,callback:null,next:null}}function ji(t,e,n){var i=t.updateQueue;if(i===null)return null;if(i=i.shared,Ke&2){var r=i.pending;return r===null?e.next=e:(e.next=r.next,r.next=e),i.pending=e,mi(t,n)}return r=i.interleaved,r===null?(e.next=e,xh(i)):(e.next=r.next,r.next=e),i.interleaved=e,mi(t,n)}function jo(t,e,n){if(e=e.updateQueue,e!==null&&(e=e.shared,(n&4194240)!==0)){var i=e.lanes;i&=t.pendingLanes,n|=i,e.lanes=n,ih(t,n)}}function Kf(t,e){var n=t.updateQueue,i=t.alternate;if(i!==null&&(i=i.updateQueue,n===i)){var r=null,s=null;if(n=n.firstBaseUpdate,n!==null){do{var a={eventTime:n.eventTime,lane:n.lane,tag:n.tag,payload:n.payload,callback:n.callback,next:null};s===null?r=s=a:s=s.next=a,n=n.next}while(n!==null);s===null?r=s=e:s=s.next=e}else r=s=e;n={baseState:i.baseState,firstBaseUpdate:r,lastBaseUpdate:s,shared:i.shared,effects:i.effects},t.updateQueue=n;return}t=n.lastBaseUpdate,t===null?n.firstBaseUpdate=e:t.next=e,n.lastBaseUpdate=e}function gl(t,e,n,i){var r=t.updateQueue;Ni=!1;var s=r.firstBaseUpdate,a=r.lastBaseUpdate,o=r.shared.pending;if(o!==null){r.shared.pending=null;var l=o,u=l.next;l.next=null,a===null?s=u:a.next=u,a=l;var h=t.alternate;h!==null&&(h=h.updateQueue,o=h.lastBaseUpdate,o!==a&&(o===null?h.firstBaseUpdate=u:o.next=u,h.lastBaseUpdate=l))}if(s!==null){var p=r.baseState;a=0,h=u=l=null,o=s;do{var f=o.lane,x=o.eventTime;if((i&f)===f){h!==null&&(h=h.next={eventTime:x,lane:0,tag:o.tag,payload:o.payload,callback:o.callback,next:null});e:{var _=t,S=o;switch(f=e,x=n,S.tag){case 1:if(_=S.payload,typeof _=="function"){p=_.call(x,p,f);break e}p=_;break e;case 3:_.flags=_.flags&-65537|128;case 0:if(_=S.payload,f=typeof _=="function"?_.call(x,p,f):_,f==null)break e;p=gt({},p,f);break e;case 2:Ni=!0}}o.callback!==null&&o.lane!==0&&(t.flags|=64,f=r.effects,f===null?r.effects=[o]:f.push(o))}else x={eventTime:x,lane:f,tag:o.tag,payload:o.payload,callback:o.callback,next:null},h===null?(u=h=x,l=p):h=h.next=x,a|=f;if(o=o.next,o===null){if(o=r.shared.pending,o===null)break;f=o,o=f.next,f.next=null,r.lastBaseUpdate=f,r.shared.pending=null}}while(!0);if(h===null&&(l=p),r.baseState=l,r.firstBaseUpdate=u,r.lastBaseUpdate=h,e=r.shared.interleaved,e!==null){r=e;do a|=r.lane,r=r.next;while(r!==e)}else s===null&&(r.shared.lanes=0);Tr|=a,t.lanes=a,t.memoizedState=p}}function Zf(t,e,n){if(t=e.effects,e.effects=null,t!==null)for(e=0;e<t.length;e++){var i=t[e],r=i.callback;if(r!==null){if(i.callback=null,i=n,typeof r!="function")throw Error(se(191,r));r.call(i)}}}var ja={},Zn=Qi(ja),Ca=Qi(ja),Ra=Qi(ja);function xr(t){if(t===ja)throw Error(se(174));return t}function _h(t,e){switch(at(Ra,e),at(Ca,t),at(Zn,ja),t=e.nodeType,t){case 9:case 11:e=(e=e.documentElement)?e.namespaceURI:mu(null,"");break;default:t=t===8?e.parentNode:e,e=t.namespaceURI||null,t=t.tagName,e=mu(e,t)}ut(Zn),at(Zn,e)}function ys(){ut(Zn),ut(Ca),ut(Ra)}function q0(t){xr(Ra.current);var e=xr(Zn.current),n=mu(e,t.type);e!==n&&(at(Ca,t),at(Zn,n))}function yh(t){Ca.current===t&&(ut(Zn),ut(Ca))}var pt=Qi(0);function xl(t){for(var e=t;e!==null;){if(e.tag===13){var n=e.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||n.data==="$?"||n.data==="$!"))return e}else if(e.tag===19&&e.memoizedProps.revealOrder!==void 0){if(e.flags&128)return e}else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return null;e=e.return}e.sibling.return=e.return,e=e.sibling}return null}var vc=[];function Sh(){for(var t=0;t<vc.length;t++)vc[t]._workInProgressVersionPrimary=null;vc.length=0}var Ho=_i.ReactCurrentDispatcher,_c=_i.ReactCurrentBatchConfig,br=0,mt=null,Mt=null,Ct=null,vl=!1,da=!1,Na=0,L_=0;function It(){throw Error(se(321))}function wh(t,e){if(e===null)return!1;for(var n=0;n<e.length&&n<t.length;n++)if(!Gn(t[n],e[n]))return!1;return!0}function Mh(t,e,n,i,r,s){if(br=s,mt=e,e.memoizedState=null,e.updateQueue=null,e.lanes=0,Ho.current=t===null||t.memoizedState===null?U_:F_,t=n(i,r),da){s=0;do{if(da=!1,Na=0,25<=s)throw Error(se(301));s+=1,Ct=Mt=null,e.updateQueue=null,Ho.current=O_,t=n(i,r)}while(da)}if(Ho.current=_l,e=Mt!==null&&Mt.next!==null,br=0,Ct=Mt=mt=null,vl=!1,e)throw Error(se(300));return t}function Eh(){var t=Na!==0;return Na=0,t}function Xn(){var t={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Ct===null?mt.memoizedState=Ct=t:Ct=Ct.next=t,Ct}function Rn(){if(Mt===null){var t=mt.alternate;t=t!==null?t.memoizedState:null}else t=Mt.next;var e=Ct===null?mt.memoizedState:Ct.next;if(e!==null)Ct=e,Mt=t;else{if(t===null)throw Error(se(310));Mt=t,t={memoizedState:Mt.memoizedState,baseState:Mt.baseState,baseQueue:Mt.baseQueue,queue:Mt.queue,next:null},Ct===null?mt.memoizedState=Ct=t:Ct=Ct.next=t}return Ct}function Pa(t,e){return typeof e=="function"?e(t):e}function yc(t){var e=Rn(),n=e.queue;if(n===null)throw Error(se(311));n.lastRenderedReducer=t;var i=Mt,r=i.baseQueue,s=n.pending;if(s!==null){if(r!==null){var a=r.next;r.next=s.next,s.next=a}i.baseQueue=r=s,n.pending=null}if(r!==null){s=r.next,i=i.baseState;var o=a=null,l=null,u=s;do{var h=u.lane;if((br&h)===h)l!==null&&(l=l.next={lane:0,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null}),i=u.hasEagerState?u.eagerState:t(i,u.action);else{var p={lane:h,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null};l===null?(o=l=p,a=i):l=l.next=p,mt.lanes|=h,Tr|=h}u=u.next}while(u!==null&&u!==s);l===null?a=i:l.next=o,Gn(i,e.memoizedState)||(rn=!0),e.memoizedState=i,e.baseState=a,e.baseQueue=l,n.lastRenderedState=i}if(t=n.interleaved,t!==null){r=t;do s=r.lane,mt.lanes|=s,Tr|=s,r=r.next;while(r!==t)}else r===null&&(n.lanes=0);return[e.memoizedState,n.dispatch]}function Sc(t){var e=Rn(),n=e.queue;if(n===null)throw Error(se(311));n.lastRenderedReducer=t;var i=n.dispatch,r=n.pending,s=e.memoizedState;if(r!==null){n.pending=null;var a=r=r.next;do s=t(s,a.action),a=a.next;while(a!==r);Gn(s,e.memoizedState)||(rn=!0),e.memoizedState=s,e.baseQueue===null&&(e.baseState=s),n.lastRenderedState=s}return[s,i]}function Y0(){}function $0(t,e){var n=mt,i=Rn(),r=e(),s=!Gn(i.memoizedState,r);if(s&&(i.memoizedState=r,rn=!0),i=i.queue,bh(Q0.bind(null,n,i,t),[t]),i.getSnapshot!==e||s||Ct!==null&&Ct.memoizedState.tag&1){if(n.flags|=2048,La(9,Z0.bind(null,n,i,r,e),void 0,null),Rt===null)throw Error(se(349));br&30||K0(n,e,r)}return r}function K0(t,e,n){t.flags|=16384,t={getSnapshot:e,value:n},e=mt.updateQueue,e===null?(e={lastEffect:null,stores:null},mt.updateQueue=e,e.stores=[t]):(n=e.stores,n===null?e.stores=[t]:n.push(t))}function Z0(t,e,n,i){e.value=n,e.getSnapshot=i,J0(e)&&eg(t)}function Q0(t,e,n){return n(function(){J0(e)&&eg(t)})}function J0(t){var e=t.getSnapshot;t=t.value;try{var n=e();return!Gn(t,n)}catch{return!0}}function eg(t){var e=mi(t,1);e!==null&&Vn(e,t,1,-1)}function Qf(t){var e=Xn();return typeof t=="function"&&(t=t()),e.memoizedState=e.baseState=t,t={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:Pa,lastRenderedState:t},e.queue=t,t=t.dispatch=I_.bind(null,mt,t),[e.memoizedState,t]}function La(t,e,n,i){return t={tag:t,create:e,destroy:n,deps:i,next:null},e=mt.updateQueue,e===null?(e={lastEffect:null,stores:null},mt.updateQueue=e,e.lastEffect=t.next=t):(n=e.lastEffect,n===null?e.lastEffect=t.next=t:(i=n.next,n.next=t,t.next=i,e.lastEffect=t)),t}function tg(){return Rn().memoizedState}function Vo(t,e,n,i){var r=Xn();mt.flags|=t,r.memoizedState=La(1|e,n,void 0,i===void 0?null:i)}function Fl(t,e,n,i){var r=Rn();i=i===void 0?null:i;var s=void 0;if(Mt!==null){var a=Mt.memoizedState;if(s=a.destroy,i!==null&&wh(i,a.deps)){r.memoizedState=La(e,n,s,i);return}}mt.flags|=t,r.memoizedState=La(1|e,n,s,i)}function Jf(t,e){return Vo(8390656,8,t,e)}function bh(t,e){return Fl(2048,8,t,e)}function ng(t,e){return Fl(4,2,t,e)}function ig(t,e){return Fl(4,4,t,e)}function rg(t,e){if(typeof e=="function")return t=t(),e(t),function(){e(null)};if(e!=null)return t=t(),e.current=t,function(){e.current=null}}function sg(t,e,n){return n=n!=null?n.concat([t]):null,Fl(4,4,rg.bind(null,e,t),n)}function Th(){}function ag(t,e){var n=Rn();e=e===void 0?null:e;var i=n.memoizedState;return i!==null&&e!==null&&wh(e,i[1])?i[0]:(n.memoizedState=[t,e],t)}function og(t,e){var n=Rn();e=e===void 0?null:e;var i=n.memoizedState;return i!==null&&e!==null&&wh(e,i[1])?i[0]:(t=t(),n.memoizedState=[t,e],t)}function lg(t,e,n){return br&21?(Gn(n,e)||(n=f0(),mt.lanes|=n,Tr|=n,t.baseState=!0),e):(t.baseState&&(t.baseState=!1,rn=!0),t.memoizedState=n)}function D_(t,e){var n=it;it=n!==0&&4>n?n:4,t(!0);var i=_c.transition;_c.transition={};try{t(!1),e()}finally{it=n,_c.transition=i}}function cg(){return Rn().memoizedState}function k_(t,e,n){var i=Vi(t);if(n={lane:i,action:n,hasEagerState:!1,eagerState:null,next:null},ug(t))dg(e,n);else if(n=W0(t,e,n,i),n!==null){var r=Xt();Vn(n,t,i,r),hg(n,e,i)}}function I_(t,e,n){var i=Vi(t),r={lane:i,action:n,hasEagerState:!1,eagerState:null,next:null};if(ug(t))dg(e,r);else{var s=t.alternate;if(t.lanes===0&&(s===null||s.lanes===0)&&(s=e.lastRenderedReducer,s!==null))try{var a=e.lastRenderedState,o=s(a,n);if(r.hasEagerState=!0,r.eagerState=o,Gn(o,a)){var l=e.interleaved;l===null?(r.next=r,xh(e)):(r.next=l.next,l.next=r),e.interleaved=r;return}}catch{}finally{}n=W0(t,e,r,i),n!==null&&(r=Xt(),Vn(n,t,i,r),hg(n,e,i))}}function ug(t){var e=t.alternate;return t===mt||e!==null&&e===mt}function dg(t,e){da=vl=!0;var n=t.pending;n===null?e.next=e:(e.next=n.next,n.next=e),t.pending=e}function hg(t,e,n){if(n&4194240){var i=e.lanes;i&=t.pendingLanes,n|=i,e.lanes=n,ih(t,n)}}var _l={readContext:Cn,useCallback:It,useContext:It,useEffect:It,useImperativeHandle:It,useInsertionEffect:It,useLayoutEffect:It,useMemo:It,useReducer:It,useRef:It,useState:It,useDebugValue:It,useDeferredValue:It,useTransition:It,useMutableSource:It,useSyncExternalStore:It,useId:It,unstable_isNewReconciler:!1},U_={readContext:Cn,useCallback:function(t,e){return Xn().memoizedState=[t,e===void 0?null:e],t},useContext:Cn,useEffect:Jf,useImperativeHandle:function(t,e,n){return n=n!=null?n.concat([t]):null,Vo(4194308,4,rg.bind(null,e,t),n)},useLayoutEffect:function(t,e){return Vo(4194308,4,t,e)},useInsertionEffect:function(t,e){return Vo(4,2,t,e)},useMemo:function(t,e){var n=Xn();return e=e===void 0?null:e,t=t(),n.memoizedState=[t,e],t},useReducer:function(t,e,n){var i=Xn();return e=n!==void 0?n(e):e,i.memoizedState=i.baseState=e,t={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:t,lastRenderedState:e},i.queue=t,t=t.dispatch=k_.bind(null,mt,t),[i.memoizedState,t]},useRef:function(t){var e=Xn();return t={current:t},e.memoizedState=t},useState:Qf,useDebugValue:Th,useDeferredValue:function(t){return Xn().memoizedState=t},useTransition:function(){var t=Qf(!1),e=t[0];return t=D_.bind(null,t[1]),Xn().memoizedState=t,[e,t]},useMutableSource:function(){},useSyncExternalStore:function(t,e,n){var i=mt,r=Xn();if(ht){if(n===void 0)throw Error(se(407));n=n()}else{if(n=e(),Rt===null)throw Error(se(349));br&30||K0(i,e,n)}r.memoizedState=n;var s={value:n,getSnapshot:e};return r.queue=s,Jf(Q0.bind(null,i,s,t),[t]),i.flags|=2048,La(9,Z0.bind(null,i,s,n,e),void 0,null),n},useId:function(){var t=Xn(),e=Rt.identifierPrefix;if(ht){var n=ci,i=li;n=(i&~(1<<32-Hn(i)-1)).toString(32)+n,e=":"+e+"R"+n,n=Na++,0<n&&(e+="H"+n.toString(32)),e+=":"}else n=L_++,e=":"+e+"r"+n.toString(32)+":";return t.memoizedState=e},unstable_isNewReconciler:!1},F_={readContext:Cn,useCallback:ag,useContext:Cn,useEffect:bh,useImperativeHandle:sg,useInsertionEffect:ng,useLayoutEffect:ig,useMemo:og,useReducer:yc,useRef:tg,useState:function(){return yc(Pa)},useDebugValue:Th,useDeferredValue:function(t){var e=Rn();return lg(e,Mt.memoizedState,t)},useTransition:function(){var t=yc(Pa)[0],e=Rn().memoizedState;return[t,e]},useMutableSource:Y0,useSyncExternalStore:$0,useId:cg,unstable_isNewReconciler:!1},O_={readContext:Cn,useCallback:ag,useContext:Cn,useEffect:bh,useImperativeHandle:sg,useInsertionEffect:ng,useLayoutEffect:ig,useMemo:og,useReducer:Sc,useRef:tg,useState:function(){return Sc(Pa)},useDebugValue:Th,useDeferredValue:function(t){var e=Rn();return Mt===null?e.memoizedState=t:lg(e,Mt.memoizedState,t)},useTransition:function(){var t=Sc(Pa)[0],e=Rn().memoizedState;return[t,e]},useMutableSource:Y0,useSyncExternalStore:$0,useId:cg,unstable_isNewReconciler:!1};function Un(t,e){if(t&&t.defaultProps){e=gt({},e),t=t.defaultProps;for(var n in t)e[n]===void 0&&(e[n]=t[n]);return e}return e}function Uu(t,e,n,i){e=t.memoizedState,n=n(i,e),n=n==null?e:gt({},e,n),t.memoizedState=n,t.lanes===0&&(t.updateQueue.baseState=n)}var Ol={isMounted:function(t){return(t=t._reactInternals)?Pr(t)===t:!1},enqueueSetState:function(t,e,n){t=t._reactInternals;var i=Xt(),r=Vi(t),s=hi(i,r);s.payload=e,n!=null&&(s.callback=n),e=ji(t,s,r),e!==null&&(Vn(e,t,r,i),jo(e,t,r))},enqueueReplaceState:function(t,e,n){t=t._reactInternals;var i=Xt(),r=Vi(t),s=hi(i,r);s.tag=1,s.payload=e,n!=null&&(s.callback=n),e=ji(t,s,r),e!==null&&(Vn(e,t,r,i),jo(e,t,r))},enqueueForceUpdate:function(t,e){t=t._reactInternals;var n=Xt(),i=Vi(t),r=hi(n,i);r.tag=2,e!=null&&(r.callback=e),e=ji(t,r,i),e!==null&&(Vn(e,t,i,n),jo(e,t,i))}};function ep(t,e,n,i,r,s,a){return t=t.stateNode,typeof t.shouldComponentUpdate=="function"?t.shouldComponentUpdate(i,s,a):e.prototype&&e.prototype.isPureReactComponent?!Ea(n,i)||!Ea(r,s):!0}function fg(t,e,n){var i=!1,r=Yi,s=e.contextType;return typeof s=="object"&&s!==null?s=Cn(s):(r=an(e)?Mr:Ht.current,i=e.contextTypes,s=(i=i!=null)?xs(t,r):Yi),e=new e(n,s),t.memoizedState=e.state!==null&&e.state!==void 0?e.state:null,e.updater=Ol,t.stateNode=e,e._reactInternals=t,i&&(t=t.stateNode,t.__reactInternalMemoizedUnmaskedChildContext=r,t.__reactInternalMemoizedMaskedChildContext=s),e}function tp(t,e,n,i){t=e.state,typeof e.componentWillReceiveProps=="function"&&e.componentWillReceiveProps(n,i),typeof e.UNSAFE_componentWillReceiveProps=="function"&&e.UNSAFE_componentWillReceiveProps(n,i),e.state!==t&&Ol.enqueueReplaceState(e,e.state,null)}function Fu(t,e,n,i){var r=t.stateNode;r.props=n,r.state=t.memoizedState,r.refs={},vh(t);var s=e.contextType;typeof s=="object"&&s!==null?r.context=Cn(s):(s=an(e)?Mr:Ht.current,r.context=xs(t,s)),r.state=t.memoizedState,s=e.getDerivedStateFromProps,typeof s=="function"&&(Uu(t,e,s,n),r.state=t.memoizedState),typeof e.getDerivedStateFromProps=="function"||typeof r.getSnapshotBeforeUpdate=="function"||typeof r.UNSAFE_componentWillMount!="function"&&typeof r.componentWillMount!="function"||(e=r.state,typeof r.componentWillMount=="function"&&r.componentWillMount(),typeof r.UNSAFE_componentWillMount=="function"&&r.UNSAFE_componentWillMount(),e!==r.state&&Ol.enqueueReplaceState(r,r.state,null),gl(t,n,r,i),r.state=t.memoizedState),typeof r.componentDidMount=="function"&&(t.flags|=4194308)}function Ss(t,e){try{var n="",i=e;do n+=hv(i),i=i.return;while(i);var r=n}catch(s){r=`
Error generating stack: `+s.message+`
`+s.stack}return{value:t,source:e,stack:r,digest:null}}function wc(t,e,n){return{value:t,source:null,stack:n??null,digest:e??null}}function Ou(t,e){try{console.error(e.value)}catch(n){setTimeout(function(){throw n})}}var z_=typeof WeakMap=="function"?WeakMap:Map;function pg(t,e,n){n=hi(-1,n),n.tag=3,n.payload={element:null};var i=e.value;return n.callback=function(){Sl||(Sl=!0,Yu=i),Ou(t,e)},n}function mg(t,e,n){n=hi(-1,n),n.tag=3;var i=t.type.getDerivedStateFromError;if(typeof i=="function"){var r=e.value;n.payload=function(){return i(r)},n.callback=function(){Ou(t,e)}}var s=t.stateNode;return s!==null&&typeof s.componentDidCatch=="function"&&(n.callback=function(){Ou(t,e),typeof i!="function"&&(Hi===null?Hi=new Set([this]):Hi.add(this));var a=e.stack;this.componentDidCatch(e.value,{componentStack:a!==null?a:""})}),n}function np(t,e,n){var i=t.pingCache;if(i===null){i=t.pingCache=new z_;var r=new Set;i.set(e,r)}else r=i.get(e),r===void 0&&(r=new Set,i.set(e,r));r.has(n)||(r.add(n),t=J_.bind(null,t,e,n),e.then(t,t))}function ip(t){do{var e;if((e=t.tag===13)&&(e=t.memoizedState,e=e!==null?e.dehydrated!==null:!0),e)return t;t=t.return}while(t!==null);return null}function rp(t,e,n,i,r){return t.mode&1?(t.flags|=65536,t.lanes=r,t):(t===e?t.flags|=65536:(t.flags|=128,n.flags|=131072,n.flags&=-52805,n.tag===1&&(n.alternate===null?n.tag=17:(e=hi(-1,1),e.tag=2,ji(n,e,1))),n.lanes|=1),t)}var B_=_i.ReactCurrentOwner,rn=!1;function Wt(t,e,n,i){e.child=t===null?G0(e,null,n,i):_s(e,t.child,n,i)}function sp(t,e,n,i,r){n=n.render;var s=e.ref;return ds(e,r),i=Mh(t,e,n,i,s,r),n=Eh(),t!==null&&!rn?(e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~r,gi(t,e,r)):(ht&&n&&dh(e),e.flags|=1,Wt(t,e,i,r),e.child)}function ap(t,e,n,i,r){if(t===null){var s=n.type;return typeof s=="function"&&!kh(s)&&s.defaultProps===void 0&&n.compare===null&&n.defaultProps===void 0?(e.tag=15,e.type=s,gg(t,e,s,i,r)):(t=qo(n.type,null,i,e,e.mode,r),t.ref=e.ref,t.return=e,e.child=t)}if(s=t.child,!(t.lanes&r)){var a=s.memoizedProps;if(n=n.compare,n=n!==null?n:Ea,n(a,i)&&t.ref===e.ref)return gi(t,e,r)}return e.flags|=1,t=Gi(s,i),t.ref=e.ref,t.return=e,e.child=t}function gg(t,e,n,i,r){if(t!==null){var s=t.memoizedProps;if(Ea(s,i)&&t.ref===e.ref)if(rn=!1,e.pendingProps=i=s,(t.lanes&r)!==0)t.flags&131072&&(rn=!0);else return e.lanes=t.lanes,gi(t,e,r)}return zu(t,e,n,i,r)}function xg(t,e,n){var i=e.pendingProps,r=i.children,s=t!==null?t.memoizedState:null;if(i.mode==="hidden")if(!(e.mode&1))e.memoizedState={baseLanes:0,cachePool:null,transitions:null},at(ss,hn),hn|=n;else{if(!(n&1073741824))return t=s!==null?s.baseLanes|n:n,e.lanes=e.childLanes=1073741824,e.memoizedState={baseLanes:t,cachePool:null,transitions:null},e.updateQueue=null,at(ss,hn),hn|=t,null;e.memoizedState={baseLanes:0,cachePool:null,transitions:null},i=s!==null?s.baseLanes:n,at(ss,hn),hn|=i}else s!==null?(i=s.baseLanes|n,e.memoizedState=null):i=n,at(ss,hn),hn|=i;return Wt(t,e,r,n),e.child}function vg(t,e){var n=e.ref;(t===null&&n!==null||t!==null&&t.ref!==n)&&(e.flags|=512,e.flags|=2097152)}function zu(t,e,n,i,r){var s=an(n)?Mr:Ht.current;return s=xs(e,s),ds(e,r),n=Mh(t,e,n,i,s,r),i=Eh(),t!==null&&!rn?(e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~r,gi(t,e,r)):(ht&&i&&dh(e),e.flags|=1,Wt(t,e,n,r),e.child)}function op(t,e,n,i,r){if(an(n)){var s=!0;dl(e)}else s=!1;if(ds(e,r),e.stateNode===null)Go(t,e),fg(e,n,i),Fu(e,n,i,r),i=!0;else if(t===null){var a=e.stateNode,o=e.memoizedProps;a.props=o;var l=a.context,u=n.contextType;typeof u=="object"&&u!==null?u=Cn(u):(u=an(n)?Mr:Ht.current,u=xs(e,u));var h=n.getDerivedStateFromProps,p=typeof h=="function"||typeof a.getSnapshotBeforeUpdate=="function";p||typeof a.UNSAFE_componentWillReceiveProps!="function"&&typeof a.componentWillReceiveProps!="function"||(o!==i||l!==u)&&tp(e,a,i,u),Ni=!1;var f=e.memoizedState;a.state=f,gl(e,i,a,r),l=e.memoizedState,o!==i||f!==l||sn.current||Ni?(typeof h=="function"&&(Uu(e,n,h,i),l=e.memoizedState),(o=Ni||ep(e,n,o,i,f,l,u))?(p||typeof a.UNSAFE_componentWillMount!="function"&&typeof a.componentWillMount!="function"||(typeof a.componentWillMount=="function"&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount=="function"&&a.UNSAFE_componentWillMount()),typeof a.componentDidMount=="function"&&(e.flags|=4194308)):(typeof a.componentDidMount=="function"&&(e.flags|=4194308),e.memoizedProps=i,e.memoizedState=l),a.props=i,a.state=l,a.context=u,i=o):(typeof a.componentDidMount=="function"&&(e.flags|=4194308),i=!1)}else{a=e.stateNode,X0(t,e),o=e.memoizedProps,u=e.type===e.elementType?o:Un(e.type,o),a.props=u,p=e.pendingProps,f=a.context,l=n.contextType,typeof l=="object"&&l!==null?l=Cn(l):(l=an(n)?Mr:Ht.current,l=xs(e,l));var x=n.getDerivedStateFromProps;(h=typeof x=="function"||typeof a.getSnapshotBeforeUpdate=="function")||typeof a.UNSAFE_componentWillReceiveProps!="function"&&typeof a.componentWillReceiveProps!="function"||(o!==p||f!==l)&&tp(e,a,i,l),Ni=!1,f=e.memoizedState,a.state=f,gl(e,i,a,r);var _=e.memoizedState;o!==p||f!==_||sn.current||Ni?(typeof x=="function"&&(Uu(e,n,x,i),_=e.memoizedState),(u=Ni||ep(e,n,u,i,f,_,l)||!1)?(h||typeof a.UNSAFE_componentWillUpdate!="function"&&typeof a.componentWillUpdate!="function"||(typeof a.componentWillUpdate=="function"&&a.componentWillUpdate(i,_,l),typeof a.UNSAFE_componentWillUpdate=="function"&&a.UNSAFE_componentWillUpdate(i,_,l)),typeof a.componentDidUpdate=="function"&&(e.flags|=4),typeof a.getSnapshotBeforeUpdate=="function"&&(e.flags|=1024)):(typeof a.componentDidUpdate!="function"||o===t.memoizedProps&&f===t.memoizedState||(e.flags|=4),typeof a.getSnapshotBeforeUpdate!="function"||o===t.memoizedProps&&f===t.memoizedState||(e.flags|=1024),e.memoizedProps=i,e.memoizedState=_),a.props=i,a.state=_,a.context=l,i=u):(typeof a.componentDidUpdate!="function"||o===t.memoizedProps&&f===t.memoizedState||(e.flags|=4),typeof a.getSnapshotBeforeUpdate!="function"||o===t.memoizedProps&&f===t.memoizedState||(e.flags|=1024),i=!1)}return Bu(t,e,n,i,s,r)}function Bu(t,e,n,i,r,s){vg(t,e);var a=(e.flags&128)!==0;if(!i&&!a)return r&&Xf(e,n,!1),gi(t,e,s);i=e.stateNode,B_.current=e;var o=a&&typeof n.getDerivedStateFromError!="function"?null:i.render();return e.flags|=1,t!==null&&a?(e.child=_s(e,t.child,null,s),e.child=_s(e,null,o,s)):Wt(t,e,o,s),e.memoizedState=i.state,r&&Xf(e,n,!0),e.child}function _g(t){var e=t.stateNode;e.pendingContext?Wf(t,e.pendingContext,e.pendingContext!==e.context):e.context&&Wf(t,e.context,!1),_h(t,e.containerInfo)}function lp(t,e,n,i,r){return vs(),fh(r),e.flags|=256,Wt(t,e,n,i),e.child}var ju={dehydrated:null,treeContext:null,retryLane:0};function Hu(t){return{baseLanes:t,cachePool:null,transitions:null}}function yg(t,e,n){var i=e.pendingProps,r=pt.current,s=!1,a=(e.flags&128)!==0,o;if((o=a)||(o=t!==null&&t.memoizedState===null?!1:(r&2)!==0),o?(s=!0,e.flags&=-129):(t===null||t.memoizedState!==null)&&(r|=1),at(pt,r&1),t===null)return ku(e),t=e.memoizedState,t!==null&&(t=t.dehydrated,t!==null)?(e.mode&1?t.data==="$!"?e.lanes=8:e.lanes=1073741824:e.lanes=1,null):(a=i.children,t=i.fallback,s?(i=e.mode,s=e.child,a={mode:"hidden",children:a},!(i&1)&&s!==null?(s.childLanes=0,s.pendingProps=a):s=jl(a,i,0,null),t=wr(t,i,n,null),s.return=e,t.return=e,s.sibling=t,e.child=s,e.child.memoizedState=Hu(n),e.memoizedState=ju,t):Ah(e,a));if(r=t.memoizedState,r!==null&&(o=r.dehydrated,o!==null))return j_(t,e,a,i,o,r,n);if(s){s=i.fallback,a=e.mode,r=t.child,o=r.sibling;var l={mode:"hidden",children:i.children};return!(a&1)&&e.child!==r?(i=e.child,i.childLanes=0,i.pendingProps=l,e.deletions=null):(i=Gi(r,l),i.subtreeFlags=r.subtreeFlags&14680064),o!==null?s=Gi(o,s):(s=wr(s,a,n,null),s.flags|=2),s.return=e,i.return=e,i.sibling=s,e.child=i,i=s,s=e.child,a=t.child.memoizedState,a=a===null?Hu(n):{baseLanes:a.baseLanes|n,cachePool:null,transitions:a.transitions},s.memoizedState=a,s.childLanes=t.childLanes&~n,e.memoizedState=ju,i}return s=t.child,t=s.sibling,i=Gi(s,{mode:"visible",children:i.children}),!(e.mode&1)&&(i.lanes=n),i.return=e,i.sibling=null,t!==null&&(n=e.deletions,n===null?(e.deletions=[t],e.flags|=16):n.push(t)),e.child=i,e.memoizedState=null,i}function Ah(t,e){return e=jl({mode:"visible",children:e},t.mode,0,null),e.return=t,t.child=e}function lo(t,e,n,i){return i!==null&&fh(i),_s(e,t.child,null,n),t=Ah(e,e.pendingProps.children),t.flags|=2,e.memoizedState=null,t}function j_(t,e,n,i,r,s,a){if(n)return e.flags&256?(e.flags&=-257,i=wc(Error(se(422))),lo(t,e,a,i)):e.memoizedState!==null?(e.child=t.child,e.flags|=128,null):(s=i.fallback,r=e.mode,i=jl({mode:"visible",children:i.children},r,0,null),s=wr(s,r,a,null),s.flags|=2,i.return=e,s.return=e,i.sibling=s,e.child=i,e.mode&1&&_s(e,t.child,null,a),e.child.memoizedState=Hu(a),e.memoizedState=ju,s);if(!(e.mode&1))return lo(t,e,a,null);if(r.data==="$!"){if(i=r.nextSibling&&r.nextSibling.dataset,i)var o=i.dgst;return i=o,s=Error(se(419)),i=wc(s,i,void 0),lo(t,e,a,i)}if(o=(a&t.childLanes)!==0,rn||o){if(i=Rt,i!==null){switch(a&-a){case 4:r=2;break;case 16:r=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:r=32;break;case 536870912:r=268435456;break;default:r=0}r=r&(i.suspendedLanes|a)?0:r,r!==0&&r!==s.retryLane&&(s.retryLane=r,mi(t,r),Vn(i,t,r,-1))}return Dh(),i=wc(Error(se(421))),lo(t,e,a,i)}return r.data==="$?"?(e.flags|=128,e.child=t.child,e=ey.bind(null,t),r._reactRetry=e,null):(t=s.treeContext,pn=Bi(r.nextSibling),mn=e,ht=!0,On=null,t!==null&&(Sn[wn++]=li,Sn[wn++]=ci,Sn[wn++]=Er,li=t.id,ci=t.overflow,Er=e),e=Ah(e,i.children),e.flags|=4096,e)}function cp(t,e,n){t.lanes|=e;var i=t.alternate;i!==null&&(i.lanes|=e),Iu(t.return,e,n)}function Mc(t,e,n,i,r){var s=t.memoizedState;s===null?t.memoizedState={isBackwards:e,rendering:null,renderingStartTime:0,last:i,tail:n,tailMode:r}:(s.isBackwards=e,s.rendering=null,s.renderingStartTime=0,s.last=i,s.tail=n,s.tailMode=r)}function Sg(t,e,n){var i=e.pendingProps,r=i.revealOrder,s=i.tail;if(Wt(t,e,i.children,n),i=pt.current,i&2)i=i&1|2,e.flags|=128;else{if(t!==null&&t.flags&128)e:for(t=e.child;t!==null;){if(t.tag===13)t.memoizedState!==null&&cp(t,n,e);else if(t.tag===19)cp(t,n,e);else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break e;for(;t.sibling===null;){if(t.return===null||t.return===e)break e;t=t.return}t.sibling.return=t.return,t=t.sibling}i&=1}if(at(pt,i),!(e.mode&1))e.memoizedState=null;else switch(r){case"forwards":for(n=e.child,r=null;n!==null;)t=n.alternate,t!==null&&xl(t)===null&&(r=n),n=n.sibling;n=r,n===null?(r=e.child,e.child=null):(r=n.sibling,n.sibling=null),Mc(e,!1,r,n,s);break;case"backwards":for(n=null,r=e.child,e.child=null;r!==null;){if(t=r.alternate,t!==null&&xl(t)===null){e.child=r;break}t=r.sibling,r.sibling=n,n=r,r=t}Mc(e,!0,n,null,s);break;case"together":Mc(e,!1,null,null,void 0);break;default:e.memoizedState=null}return e.child}function Go(t,e){!(e.mode&1)&&t!==null&&(t.alternate=null,e.alternate=null,e.flags|=2)}function gi(t,e,n){if(t!==null&&(e.dependencies=t.dependencies),Tr|=e.lanes,!(n&e.childLanes))return null;if(t!==null&&e.child!==t.child)throw Error(se(153));if(e.child!==null){for(t=e.child,n=Gi(t,t.pendingProps),e.child=n,n.return=e;t.sibling!==null;)t=t.sibling,n=n.sibling=Gi(t,t.pendingProps),n.return=e;n.sibling=null}return e.child}function H_(t,e,n){switch(e.tag){case 3:_g(e),vs();break;case 5:q0(e);break;case 1:an(e.type)&&dl(e);break;case 4:_h(e,e.stateNode.containerInfo);break;case 10:var i=e.type._context,r=e.memoizedProps.value;at(pl,i._currentValue),i._currentValue=r;break;case 13:if(i=e.memoizedState,i!==null)return i.dehydrated!==null?(at(pt,pt.current&1),e.flags|=128,null):n&e.child.childLanes?yg(t,e,n):(at(pt,pt.current&1),t=gi(t,e,n),t!==null?t.sibling:null);at(pt,pt.current&1);break;case 19:if(i=(n&e.childLanes)!==0,t.flags&128){if(i)return Sg(t,e,n);e.flags|=128}if(r=e.memoizedState,r!==null&&(r.rendering=null,r.tail=null,r.lastEffect=null),at(pt,pt.current),i)break;return null;case 22:case 23:return e.lanes=0,xg(t,e,n)}return gi(t,e,n)}var wg,Vu,Mg,Eg;wg=function(t,e){for(var n=e.child;n!==null;){if(n.tag===5||n.tag===6)t.appendChild(n.stateNode);else if(n.tag!==4&&n.child!==null){n.child.return=n,n=n.child;continue}if(n===e)break;for(;n.sibling===null;){if(n.return===null||n.return===e)return;n=n.return}n.sibling.return=n.return,n=n.sibling}};Vu=function(){};Mg=function(t,e,n,i){var r=t.memoizedProps;if(r!==i){t=e.stateNode,xr(Zn.current);var s=null;switch(n){case"input":r=du(t,r),i=du(t,i),s=[];break;case"select":r=gt({},r,{value:void 0}),i=gt({},i,{value:void 0}),s=[];break;case"textarea":r=pu(t,r),i=pu(t,i),s=[];break;default:typeof r.onClick!="function"&&typeof i.onClick=="function"&&(t.onclick=cl)}gu(n,i);var a;n=null;for(u in r)if(!i.hasOwnProperty(u)&&r.hasOwnProperty(u)&&r[u]!=null)if(u==="style"){var o=r[u];for(a in o)o.hasOwnProperty(a)&&(n||(n={}),n[a]="")}else u!=="dangerouslySetInnerHTML"&&u!=="children"&&u!=="suppressContentEditableWarning"&&u!=="suppressHydrationWarning"&&u!=="autoFocus"&&(xa.hasOwnProperty(u)?s||(s=[]):(s=s||[]).push(u,null));for(u in i){var l=i[u];if(o=r!=null?r[u]:void 0,i.hasOwnProperty(u)&&l!==o&&(l!=null||o!=null))if(u==="style")if(o){for(a in o)!o.hasOwnProperty(a)||l&&l.hasOwnProperty(a)||(n||(n={}),n[a]="");for(a in l)l.hasOwnProperty(a)&&o[a]!==l[a]&&(n||(n={}),n[a]=l[a])}else n||(s||(s=[]),s.push(u,n)),n=l;else u==="dangerouslySetInnerHTML"?(l=l?l.__html:void 0,o=o?o.__html:void 0,l!=null&&o!==l&&(s=s||[]).push(u,l)):u==="children"?typeof l!="string"&&typeof l!="number"||(s=s||[]).push(u,""+l):u!=="suppressContentEditableWarning"&&u!=="suppressHydrationWarning"&&(xa.hasOwnProperty(u)?(l!=null&&u==="onScroll"&&lt("scroll",t),s||o===l||(s=[])):(s=s||[]).push(u,l))}n&&(s=s||[]).push("style",n);var u=s;(e.updateQueue=u)&&(e.flags|=4)}};Eg=function(t,e,n,i){n!==i&&(e.flags|=4)};function Ws(t,e){if(!ht)switch(t.tailMode){case"hidden":e=t.tail;for(var n=null;e!==null;)e.alternate!==null&&(n=e),e=e.sibling;n===null?t.tail=null:n.sibling=null;break;case"collapsed":n=t.tail;for(var i=null;n!==null;)n.alternate!==null&&(i=n),n=n.sibling;i===null?e||t.tail===null?t.tail=null:t.tail.sibling=null:i.sibling=null}}function Ut(t){var e=t.alternate!==null&&t.alternate.child===t.child,n=0,i=0;if(e)for(var r=t.child;r!==null;)n|=r.lanes|r.childLanes,i|=r.subtreeFlags&14680064,i|=r.flags&14680064,r.return=t,r=r.sibling;else for(r=t.child;r!==null;)n|=r.lanes|r.childLanes,i|=r.subtreeFlags,i|=r.flags,r.return=t,r=r.sibling;return t.subtreeFlags|=i,t.childLanes=n,e}function V_(t,e,n){var i=e.pendingProps;switch(hh(e),e.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return Ut(e),null;case 1:return an(e.type)&&ul(),Ut(e),null;case 3:return i=e.stateNode,ys(),ut(sn),ut(Ht),Sh(),i.pendingContext&&(i.context=i.pendingContext,i.pendingContext=null),(t===null||t.child===null)&&(ao(e)?e.flags|=4:t===null||t.memoizedState.isDehydrated&&!(e.flags&256)||(e.flags|=1024,On!==null&&(Zu(On),On=null))),Vu(t,e),Ut(e),null;case 5:yh(e);var r=xr(Ra.current);if(n=e.type,t!==null&&e.stateNode!=null)Mg(t,e,n,i,r),t.ref!==e.ref&&(e.flags|=512,e.flags|=2097152);else{if(!i){if(e.stateNode===null)throw Error(se(166));return Ut(e),null}if(t=xr(Zn.current),ao(e)){i=e.stateNode,n=e.type;var s=e.memoizedProps;switch(i[$n]=e,i[Aa]=s,t=(e.mode&1)!==0,n){case"dialog":lt("cancel",i),lt("close",i);break;case"iframe":case"object":case"embed":lt("load",i);break;case"video":case"audio":for(r=0;r<ia.length;r++)lt(ia[r],i);break;case"source":lt("error",i);break;case"img":case"image":case"link":lt("error",i),lt("load",i);break;case"details":lt("toggle",i);break;case"input":vf(i,s),lt("invalid",i);break;case"select":i._wrapperState={wasMultiple:!!s.multiple},lt("invalid",i);break;case"textarea":yf(i,s),lt("invalid",i)}gu(n,s),r=null;for(var a in s)if(s.hasOwnProperty(a)){var o=s[a];a==="children"?typeof o=="string"?i.textContent!==o&&(s.suppressHydrationWarning!==!0&&so(i.textContent,o,t),r=["children",o]):typeof o=="number"&&i.textContent!==""+o&&(s.suppressHydrationWarning!==!0&&so(i.textContent,o,t),r=["children",""+o]):xa.hasOwnProperty(a)&&o!=null&&a==="onScroll"&&lt("scroll",i)}switch(n){case"input":Za(i),_f(i,s,!0);break;case"textarea":Za(i),Sf(i);break;case"select":case"option":break;default:typeof s.onClick=="function"&&(i.onclick=cl)}i=r,e.updateQueue=i,i!==null&&(e.flags|=4)}else{a=r.nodeType===9?r:r.ownerDocument,t==="http://www.w3.org/1999/xhtml"&&(t=Qm(n)),t==="http://www.w3.org/1999/xhtml"?n==="script"?(t=a.createElement("div"),t.innerHTML="<script><\/script>",t=t.removeChild(t.firstChild)):typeof i.is=="string"?t=a.createElement(n,{is:i.is}):(t=a.createElement(n),n==="select"&&(a=t,i.multiple?a.multiple=!0:i.size&&(a.size=i.size))):t=a.createElementNS(t,n),t[$n]=e,t[Aa]=i,wg(t,e,!1,!1),e.stateNode=t;e:{switch(a=xu(n,i),n){case"dialog":lt("cancel",t),lt("close",t),r=i;break;case"iframe":case"object":case"embed":lt("load",t),r=i;break;case"video":case"audio":for(r=0;r<ia.length;r++)lt(ia[r],t);r=i;break;case"source":lt("error",t),r=i;break;case"img":case"image":case"link":lt("error",t),lt("load",t),r=i;break;case"details":lt("toggle",t),r=i;break;case"input":vf(t,i),r=du(t,i),lt("invalid",t);break;case"option":r=i;break;case"select":t._wrapperState={wasMultiple:!!i.multiple},r=gt({},i,{value:void 0}),lt("invalid",t);break;case"textarea":yf(t,i),r=pu(t,i),lt("invalid",t);break;default:r=i}gu(n,r),o=r;for(s in o)if(o.hasOwnProperty(s)){var l=o[s];s==="style"?t0(t,l):s==="dangerouslySetInnerHTML"?(l=l?l.__html:void 0,l!=null&&Jm(t,l)):s==="children"?typeof l=="string"?(n!=="textarea"||l!=="")&&va(t,l):typeof l=="number"&&va(t,""+l):s!=="suppressContentEditableWarning"&&s!=="suppressHydrationWarning"&&s!=="autoFocus"&&(xa.hasOwnProperty(s)?l!=null&&s==="onScroll"&&lt("scroll",t):l!=null&&Zd(t,s,l,a))}switch(n){case"input":Za(t),_f(t,i,!1);break;case"textarea":Za(t),Sf(t);break;case"option":i.value!=null&&t.setAttribute("value",""+qi(i.value));break;case"select":t.multiple=!!i.multiple,s=i.value,s!=null?os(t,!!i.multiple,s,!1):i.defaultValue!=null&&os(t,!!i.multiple,i.defaultValue,!0);break;default:typeof r.onClick=="function"&&(t.onclick=cl)}switch(n){case"button":case"input":case"select":case"textarea":i=!!i.autoFocus;break e;case"img":i=!0;break e;default:i=!1}}i&&(e.flags|=4)}e.ref!==null&&(e.flags|=512,e.flags|=2097152)}return Ut(e),null;case 6:if(t&&e.stateNode!=null)Eg(t,e,t.memoizedProps,i);else{if(typeof i!="string"&&e.stateNode===null)throw Error(se(166));if(n=xr(Ra.current),xr(Zn.current),ao(e)){if(i=e.stateNode,n=e.memoizedProps,i[$n]=e,(s=i.nodeValue!==n)&&(t=mn,t!==null))switch(t.tag){case 3:so(i.nodeValue,n,(t.mode&1)!==0);break;case 5:t.memoizedProps.suppressHydrationWarning!==!0&&so(i.nodeValue,n,(t.mode&1)!==0)}s&&(e.flags|=4)}else i=(n.nodeType===9?n:n.ownerDocument).createTextNode(i),i[$n]=e,e.stateNode=i}return Ut(e),null;case 13:if(ut(pt),i=e.memoizedState,t===null||t.memoizedState!==null&&t.memoizedState.dehydrated!==null){if(ht&&pn!==null&&e.mode&1&&!(e.flags&128))H0(),vs(),e.flags|=98560,s=!1;else if(s=ao(e),i!==null&&i.dehydrated!==null){if(t===null){if(!s)throw Error(se(318));if(s=e.memoizedState,s=s!==null?s.dehydrated:null,!s)throw Error(se(317));s[$n]=e}else vs(),!(e.flags&128)&&(e.memoizedState=null),e.flags|=4;Ut(e),s=!1}else On!==null&&(Zu(On),On=null),s=!0;if(!s)return e.flags&65536?e:null}return e.flags&128?(e.lanes=n,e):(i=i!==null,i!==(t!==null&&t.memoizedState!==null)&&i&&(e.child.flags|=8192,e.mode&1&&(t===null||pt.current&1?Et===0&&(Et=3):Dh())),e.updateQueue!==null&&(e.flags|=4),Ut(e),null);case 4:return ys(),Vu(t,e),t===null&&ba(e.stateNode.containerInfo),Ut(e),null;case 10:return gh(e.type._context),Ut(e),null;case 17:return an(e.type)&&ul(),Ut(e),null;case 19:if(ut(pt),s=e.memoizedState,s===null)return Ut(e),null;if(i=(e.flags&128)!==0,a=s.rendering,a===null)if(i)Ws(s,!1);else{if(Et!==0||t!==null&&t.flags&128)for(t=e.child;t!==null;){if(a=xl(t),a!==null){for(e.flags|=128,Ws(s,!1),i=a.updateQueue,i!==null&&(e.updateQueue=i,e.flags|=4),e.subtreeFlags=0,i=n,n=e.child;n!==null;)s=n,t=i,s.flags&=14680066,a=s.alternate,a===null?(s.childLanes=0,s.lanes=t,s.child=null,s.subtreeFlags=0,s.memoizedProps=null,s.memoizedState=null,s.updateQueue=null,s.dependencies=null,s.stateNode=null):(s.childLanes=a.childLanes,s.lanes=a.lanes,s.child=a.child,s.subtreeFlags=0,s.deletions=null,s.memoizedProps=a.memoizedProps,s.memoizedState=a.memoizedState,s.updateQueue=a.updateQueue,s.type=a.type,t=a.dependencies,s.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),n=n.sibling;return at(pt,pt.current&1|2),e.child}t=t.sibling}s.tail!==null&&yt()>ws&&(e.flags|=128,i=!0,Ws(s,!1),e.lanes=4194304)}else{if(!i)if(t=xl(a),t!==null){if(e.flags|=128,i=!0,n=t.updateQueue,n!==null&&(e.updateQueue=n,e.flags|=4),Ws(s,!0),s.tail===null&&s.tailMode==="hidden"&&!a.alternate&&!ht)return Ut(e),null}else 2*yt()-s.renderingStartTime>ws&&n!==1073741824&&(e.flags|=128,i=!0,Ws(s,!1),e.lanes=4194304);s.isBackwards?(a.sibling=e.child,e.child=a):(n=s.last,n!==null?n.sibling=a:e.child=a,s.last=a)}return s.tail!==null?(e=s.tail,s.rendering=e,s.tail=e.sibling,s.renderingStartTime=yt(),e.sibling=null,n=pt.current,at(pt,i?n&1|2:n&1),e):(Ut(e),null);case 22:case 23:return Lh(),i=e.memoizedState!==null,t!==null&&t.memoizedState!==null!==i&&(e.flags|=8192),i&&e.mode&1?hn&1073741824&&(Ut(e),e.subtreeFlags&6&&(e.flags|=8192)):Ut(e),null;case 24:return null;case 25:return null}throw Error(se(156,e.tag))}function G_(t,e){switch(hh(e),e.tag){case 1:return an(e.type)&&ul(),t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 3:return ys(),ut(sn),ut(Ht),Sh(),t=e.flags,t&65536&&!(t&128)?(e.flags=t&-65537|128,e):null;case 5:return yh(e),null;case 13:if(ut(pt),t=e.memoizedState,t!==null&&t.dehydrated!==null){if(e.alternate===null)throw Error(se(340));vs()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 19:return ut(pt),null;case 4:return ys(),null;case 10:return gh(e.type._context),null;case 22:case 23:return Lh(),null;case 24:return null;default:return null}}var co=!1,Bt=!1,W_=typeof WeakSet=="function"?WeakSet:Set,_e=null;function rs(t,e){var n=t.ref;if(n!==null)if(typeof n=="function")try{n(null)}catch(i){vt(t,e,i)}else n.current=null}function Gu(t,e,n){try{n()}catch(i){vt(t,e,i)}}var up=!1;function X_(t,e){if(Au=al,t=R0(),uh(t)){if("selectionStart"in t)var n={start:t.selectionStart,end:t.selectionEnd};else e:{n=(n=t.ownerDocument)&&n.defaultView||window;var i=n.getSelection&&n.getSelection();if(i&&i.rangeCount!==0){n=i.anchorNode;var r=i.anchorOffset,s=i.focusNode;i=i.focusOffset;try{n.nodeType,s.nodeType}catch{n=null;break e}var a=0,o=-1,l=-1,u=0,h=0,p=t,f=null;t:for(;;){for(var x;p!==n||r!==0&&p.nodeType!==3||(o=a+r),p!==s||i!==0&&p.nodeType!==3||(l=a+i),p.nodeType===3&&(a+=p.nodeValue.length),(x=p.firstChild)!==null;)f=p,p=x;for(;;){if(p===t)break t;if(f===n&&++u===r&&(o=a),f===s&&++h===i&&(l=a),(x=p.nextSibling)!==null)break;p=f,f=p.parentNode}p=x}n=o===-1||l===-1?null:{start:o,end:l}}else n=null}n=n||{start:0,end:0}}else n=null;for(Cu={focusedElem:t,selectionRange:n},al=!1,_e=e;_e!==null;)if(e=_e,t=e.child,(e.subtreeFlags&1028)!==0&&t!==null)t.return=e,_e=t;else for(;_e!==null;){e=_e;try{var _=e.alternate;if(e.flags&1024)switch(e.tag){case 0:case 11:case 15:break;case 1:if(_!==null){var S=_.memoizedProps,m=_.memoizedState,d=e.stateNode,g=d.getSnapshotBeforeUpdate(e.elementType===e.type?S:Un(e.type,S),m);d.__reactInternalSnapshotBeforeUpdate=g}break;case 3:var v=e.stateNode.containerInfo;v.nodeType===1?v.textContent="":v.nodeType===9&&v.documentElement&&v.removeChild(v.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(se(163))}}catch(w){vt(e,e.return,w)}if(t=e.sibling,t!==null){t.return=e.return,_e=t;break}_e=e.return}return _=up,up=!1,_}function ha(t,e,n){var i=e.updateQueue;if(i=i!==null?i.lastEffect:null,i!==null){var r=i=i.next;do{if((r.tag&t)===t){var s=r.destroy;r.destroy=void 0,s!==void 0&&Gu(e,n,s)}r=r.next}while(r!==i)}}function zl(t,e){if(e=e.updateQueue,e=e!==null?e.lastEffect:null,e!==null){var n=e=e.next;do{if((n.tag&t)===t){var i=n.create;n.destroy=i()}n=n.next}while(n!==e)}}function Wu(t){var e=t.ref;if(e!==null){var n=t.stateNode;switch(t.tag){case 5:t=n;break;default:t=n}typeof e=="function"?e(t):e.current=t}}function bg(t){var e=t.alternate;e!==null&&(t.alternate=null,bg(e)),t.child=null,t.deletions=null,t.sibling=null,t.tag===5&&(e=t.stateNode,e!==null&&(delete e[$n],delete e[Aa],delete e[Pu],delete e[C_],delete e[R_])),t.stateNode=null,t.return=null,t.dependencies=null,t.memoizedProps=null,t.memoizedState=null,t.pendingProps=null,t.stateNode=null,t.updateQueue=null}function Tg(t){return t.tag===5||t.tag===3||t.tag===4}function dp(t){e:for(;;){for(;t.sibling===null;){if(t.return===null||Tg(t.return))return null;t=t.return}for(t.sibling.return=t.return,t=t.sibling;t.tag!==5&&t.tag!==6&&t.tag!==18;){if(t.flags&2||t.child===null||t.tag===4)continue e;t.child.return=t,t=t.child}if(!(t.flags&2))return t.stateNode}}function Xu(t,e,n){var i=t.tag;if(i===5||i===6)t=t.stateNode,e?n.nodeType===8?n.parentNode.insertBefore(t,e):n.insertBefore(t,e):(n.nodeType===8?(e=n.parentNode,e.insertBefore(t,n)):(e=n,e.appendChild(t)),n=n._reactRootContainer,n!=null||e.onclick!==null||(e.onclick=cl));else if(i!==4&&(t=t.child,t!==null))for(Xu(t,e,n),t=t.sibling;t!==null;)Xu(t,e,n),t=t.sibling}function qu(t,e,n){var i=t.tag;if(i===5||i===6)t=t.stateNode,e?n.insertBefore(t,e):n.appendChild(t);else if(i!==4&&(t=t.child,t!==null))for(qu(t,e,n),t=t.sibling;t!==null;)qu(t,e,n),t=t.sibling}var Pt=null,Fn=!1;function Si(t,e,n){for(n=n.child;n!==null;)Ag(t,e,n),n=n.sibling}function Ag(t,e,n){if(Kn&&typeof Kn.onCommitFiberUnmount=="function")try{Kn.onCommitFiberUnmount(Pl,n)}catch{}switch(n.tag){case 5:Bt||rs(n,e);case 6:var i=Pt,r=Fn;Pt=null,Si(t,e,n),Pt=i,Fn=r,Pt!==null&&(Fn?(t=Pt,n=n.stateNode,t.nodeType===8?t.parentNode.removeChild(n):t.removeChild(n)):Pt.removeChild(n.stateNode));break;case 18:Pt!==null&&(Fn?(t=Pt,n=n.stateNode,t.nodeType===8?gc(t.parentNode,n):t.nodeType===1&&gc(t,n),wa(t)):gc(Pt,n.stateNode));break;case 4:i=Pt,r=Fn,Pt=n.stateNode.containerInfo,Fn=!0,Si(t,e,n),Pt=i,Fn=r;break;case 0:case 11:case 14:case 15:if(!Bt&&(i=n.updateQueue,i!==null&&(i=i.lastEffect,i!==null))){r=i=i.next;do{var s=r,a=s.destroy;s=s.tag,a!==void 0&&(s&2||s&4)&&Gu(n,e,a),r=r.next}while(r!==i)}Si(t,e,n);break;case 1:if(!Bt&&(rs(n,e),i=n.stateNode,typeof i.componentWillUnmount=="function"))try{i.props=n.memoizedProps,i.state=n.memoizedState,i.componentWillUnmount()}catch(o){vt(n,e,o)}Si(t,e,n);break;case 21:Si(t,e,n);break;case 22:n.mode&1?(Bt=(i=Bt)||n.memoizedState!==null,Si(t,e,n),Bt=i):Si(t,e,n);break;default:Si(t,e,n)}}function hp(t){var e=t.updateQueue;if(e!==null){t.updateQueue=null;var n=t.stateNode;n===null&&(n=t.stateNode=new W_),e.forEach(function(i){var r=ty.bind(null,t,i);n.has(i)||(n.add(i),i.then(r,r))})}}function Ln(t,e){var n=e.deletions;if(n!==null)for(var i=0;i<n.length;i++){var r=n[i];try{var s=t,a=e,o=a;e:for(;o!==null;){switch(o.tag){case 5:Pt=o.stateNode,Fn=!1;break e;case 3:Pt=o.stateNode.containerInfo,Fn=!0;break e;case 4:Pt=o.stateNode.containerInfo,Fn=!0;break e}o=o.return}if(Pt===null)throw Error(se(160));Ag(s,a,r),Pt=null,Fn=!1;var l=r.alternate;l!==null&&(l.return=null),r.return=null}catch(u){vt(r,e,u)}}if(e.subtreeFlags&12854)for(e=e.child;e!==null;)Cg(e,t),e=e.sibling}function Cg(t,e){var n=t.alternate,i=t.flags;switch(t.tag){case 0:case 11:case 14:case 15:if(Ln(e,t),Wn(t),i&4){try{ha(3,t,t.return),zl(3,t)}catch(S){vt(t,t.return,S)}try{ha(5,t,t.return)}catch(S){vt(t,t.return,S)}}break;case 1:Ln(e,t),Wn(t),i&512&&n!==null&&rs(n,n.return);break;case 5:if(Ln(e,t),Wn(t),i&512&&n!==null&&rs(n,n.return),t.flags&32){var r=t.stateNode;try{va(r,"")}catch(S){vt(t,t.return,S)}}if(i&4&&(r=t.stateNode,r!=null)){var s=t.memoizedProps,a=n!==null?n.memoizedProps:s,o=t.type,l=t.updateQueue;if(t.updateQueue=null,l!==null)try{o==="input"&&s.type==="radio"&&s.name!=null&&Km(r,s),xu(o,a);var u=xu(o,s);for(a=0;a<l.length;a+=2){var h=l[a],p=l[a+1];h==="style"?t0(r,p):h==="dangerouslySetInnerHTML"?Jm(r,p):h==="children"?va(r,p):Zd(r,h,p,u)}switch(o){case"input":hu(r,s);break;case"textarea":Zm(r,s);break;case"select":var f=r._wrapperState.wasMultiple;r._wrapperState.wasMultiple=!!s.multiple;var x=s.value;x!=null?os(r,!!s.multiple,x,!1):f!==!!s.multiple&&(s.defaultValue!=null?os(r,!!s.multiple,s.defaultValue,!0):os(r,!!s.multiple,s.multiple?[]:"",!1))}r[Aa]=s}catch(S){vt(t,t.return,S)}}break;case 6:if(Ln(e,t),Wn(t),i&4){if(t.stateNode===null)throw Error(se(162));r=t.stateNode,s=t.memoizedProps;try{r.nodeValue=s}catch(S){vt(t,t.return,S)}}break;case 3:if(Ln(e,t),Wn(t),i&4&&n!==null&&n.memoizedState.isDehydrated)try{wa(e.containerInfo)}catch(S){vt(t,t.return,S)}break;case 4:Ln(e,t),Wn(t);break;case 13:Ln(e,t),Wn(t),r=t.child,r.flags&8192&&(s=r.memoizedState!==null,r.stateNode.isHidden=s,!s||r.alternate!==null&&r.alternate.memoizedState!==null||(Nh=yt())),i&4&&hp(t);break;case 22:if(h=n!==null&&n.memoizedState!==null,t.mode&1?(Bt=(u=Bt)||h,Ln(e,t),Bt=u):Ln(e,t),Wn(t),i&8192){if(u=t.memoizedState!==null,(t.stateNode.isHidden=u)&&!h&&t.mode&1)for(_e=t,h=t.child;h!==null;){for(p=_e=h;_e!==null;){switch(f=_e,x=f.child,f.tag){case 0:case 11:case 14:case 15:ha(4,f,f.return);break;case 1:rs(f,f.return);var _=f.stateNode;if(typeof _.componentWillUnmount=="function"){i=f,n=f.return;try{e=i,_.props=e.memoizedProps,_.state=e.memoizedState,_.componentWillUnmount()}catch(S){vt(i,n,S)}}break;case 5:rs(f,f.return);break;case 22:if(f.memoizedState!==null){pp(p);continue}}x!==null?(x.return=f,_e=x):pp(p)}h=h.sibling}e:for(h=null,p=t;;){if(p.tag===5){if(h===null){h=p;try{r=p.stateNode,u?(s=r.style,typeof s.setProperty=="function"?s.setProperty("display","none","important"):s.display="none"):(o=p.stateNode,l=p.memoizedProps.style,a=l!=null&&l.hasOwnProperty("display")?l.display:null,o.style.display=e0("display",a))}catch(S){vt(t,t.return,S)}}}else if(p.tag===6){if(h===null)try{p.stateNode.nodeValue=u?"":p.memoizedProps}catch(S){vt(t,t.return,S)}}else if((p.tag!==22&&p.tag!==23||p.memoizedState===null||p===t)&&p.child!==null){p.child.return=p,p=p.child;continue}if(p===t)break e;for(;p.sibling===null;){if(p.return===null||p.return===t)break e;h===p&&(h=null),p=p.return}h===p&&(h=null),p.sibling.return=p.return,p=p.sibling}}break;case 19:Ln(e,t),Wn(t),i&4&&hp(t);break;case 21:break;default:Ln(e,t),Wn(t)}}function Wn(t){var e=t.flags;if(e&2){try{e:{for(var n=t.return;n!==null;){if(Tg(n)){var i=n;break e}n=n.return}throw Error(se(160))}switch(i.tag){case 5:var r=i.stateNode;i.flags&32&&(va(r,""),i.flags&=-33);var s=dp(t);qu(t,s,r);break;case 3:case 4:var a=i.stateNode.containerInfo,o=dp(t);Xu(t,o,a);break;default:throw Error(se(161))}}catch(l){vt(t,t.return,l)}t.flags&=-3}e&4096&&(t.flags&=-4097)}function q_(t,e,n){_e=t,Rg(t)}function Rg(t,e,n){for(var i=(t.mode&1)!==0;_e!==null;){var r=_e,s=r.child;if(r.tag===22&&i){var a=r.memoizedState!==null||co;if(!a){var o=r.alternate,l=o!==null&&o.memoizedState!==null||Bt;o=co;var u=Bt;if(co=a,(Bt=l)&&!u)for(_e=r;_e!==null;)a=_e,l=a.child,a.tag===22&&a.memoizedState!==null?mp(r):l!==null?(l.return=a,_e=l):mp(r);for(;s!==null;)_e=s,Rg(s),s=s.sibling;_e=r,co=o,Bt=u}fp(t)}else r.subtreeFlags&8772&&s!==null?(s.return=r,_e=s):fp(t)}}function fp(t){for(;_e!==null;){var e=_e;if(e.flags&8772){var n=e.alternate;try{if(e.flags&8772)switch(e.tag){case 0:case 11:case 15:Bt||zl(5,e);break;case 1:var i=e.stateNode;if(e.flags&4&&!Bt)if(n===null)i.componentDidMount();else{var r=e.elementType===e.type?n.memoizedProps:Un(e.type,n.memoizedProps);i.componentDidUpdate(r,n.memoizedState,i.__reactInternalSnapshotBeforeUpdate)}var s=e.updateQueue;s!==null&&Zf(e,s,i);break;case 3:var a=e.updateQueue;if(a!==null){if(n=null,e.child!==null)switch(e.child.tag){case 5:n=e.child.stateNode;break;case 1:n=e.child.stateNode}Zf(e,a,n)}break;case 5:var o=e.stateNode;if(n===null&&e.flags&4){n=o;var l=e.memoizedProps;switch(e.type){case"button":case"input":case"select":case"textarea":l.autoFocus&&n.focus();break;case"img":l.src&&(n.src=l.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(e.memoizedState===null){var u=e.alternate;if(u!==null){var h=u.memoizedState;if(h!==null){var p=h.dehydrated;p!==null&&wa(p)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(se(163))}Bt||e.flags&512&&Wu(e)}catch(f){vt(e,e.return,f)}}if(e===t){_e=null;break}if(n=e.sibling,n!==null){n.return=e.return,_e=n;break}_e=e.return}}function pp(t){for(;_e!==null;){var e=_e;if(e===t){_e=null;break}var n=e.sibling;if(n!==null){n.return=e.return,_e=n;break}_e=e.return}}function mp(t){for(;_e!==null;){var e=_e;try{switch(e.tag){case 0:case 11:case 15:var n=e.return;try{zl(4,e)}catch(l){vt(e,n,l)}break;case 1:var i=e.stateNode;if(typeof i.componentDidMount=="function"){var r=e.return;try{i.componentDidMount()}catch(l){vt(e,r,l)}}var s=e.return;try{Wu(e)}catch(l){vt(e,s,l)}break;case 5:var a=e.return;try{Wu(e)}catch(l){vt(e,a,l)}}}catch(l){vt(e,e.return,l)}if(e===t){_e=null;break}var o=e.sibling;if(o!==null){o.return=e.return,_e=o;break}_e=e.return}}var Y_=Math.ceil,yl=_i.ReactCurrentDispatcher,Ch=_i.ReactCurrentOwner,Tn=_i.ReactCurrentBatchConfig,Ke=0,Rt=null,wt=null,Dt=0,hn=0,ss=Qi(0),Et=0,Da=null,Tr=0,Bl=0,Rh=0,fa=null,tn=null,Nh=0,ws=1/0,ai=null,Sl=!1,Yu=null,Hi=null,uo=!1,Ui=null,wl=0,pa=0,$u=null,Wo=-1,Xo=0;function Xt(){return Ke&6?yt():Wo!==-1?Wo:Wo=yt()}function Vi(t){return t.mode&1?Ke&2&&Dt!==0?Dt&-Dt:P_.transition!==null?(Xo===0&&(Xo=f0()),Xo):(t=it,t!==0||(t=window.event,t=t===void 0?16:y0(t.type)),t):1}function Vn(t,e,n,i){if(50<pa)throw pa=0,$u=null,Error(se(185));Oa(t,n,i),(!(Ke&2)||t!==Rt)&&(t===Rt&&(!(Ke&2)&&(Bl|=n),Et===4&&Di(t,Dt)),on(t,i),n===1&&Ke===0&&!(e.mode&1)&&(ws=yt()+500,Ul&&Ji()))}function on(t,e){var n=t.callbackNode;Pv(t,e);var i=sl(t,t===Rt?Dt:0);if(i===0)n!==null&&Ef(n),t.callbackNode=null,t.callbackPriority=0;else if(e=i&-i,t.callbackPriority!==e){if(n!=null&&Ef(n),e===1)t.tag===0?N_(gp.bind(null,t)):z0(gp.bind(null,t)),T_(function(){!(Ke&6)&&Ji()}),n=null;else{switch(p0(i)){case 1:n=nh;break;case 4:n=d0;break;case 16:n=rl;break;case 536870912:n=h0;break;default:n=rl}n=Fg(n,Ng.bind(null,t))}t.callbackPriority=e,t.callbackNode=n}}function Ng(t,e){if(Wo=-1,Xo=0,Ke&6)throw Error(se(327));var n=t.callbackNode;if(hs()&&t.callbackNode!==n)return null;var i=sl(t,t===Rt?Dt:0);if(i===0)return null;if(i&30||i&t.expiredLanes||e)e=Ml(t,i);else{e=i;var r=Ke;Ke|=2;var s=Lg();(Rt!==t||Dt!==e)&&(ai=null,ws=yt()+500,Sr(t,e));do try{Z_();break}catch(o){Pg(t,o)}while(!0);mh(),yl.current=s,Ke=r,wt!==null?e=0:(Rt=null,Dt=0,e=Et)}if(e!==0){if(e===2&&(r=wu(t),r!==0&&(i=r,e=Ku(t,r))),e===1)throw n=Da,Sr(t,0),Di(t,i),on(t,yt()),n;if(e===6)Di(t,i);else{if(r=t.current.alternate,!(i&30)&&!$_(r)&&(e=Ml(t,i),e===2&&(s=wu(t),s!==0&&(i=s,e=Ku(t,s))),e===1))throw n=Da,Sr(t,0),Di(t,i),on(t,yt()),n;switch(t.finishedWork=r,t.finishedLanes=i,e){case 0:case 1:throw Error(se(345));case 2:ur(t,tn,ai);break;case 3:if(Di(t,i),(i&130023424)===i&&(e=Nh+500-yt(),10<e)){if(sl(t,0)!==0)break;if(r=t.suspendedLanes,(r&i)!==i){Xt(),t.pingedLanes|=t.suspendedLanes&r;break}t.timeoutHandle=Nu(ur.bind(null,t,tn,ai),e);break}ur(t,tn,ai);break;case 4:if(Di(t,i),(i&4194240)===i)break;for(e=t.eventTimes,r=-1;0<i;){var a=31-Hn(i);s=1<<a,a=e[a],a>r&&(r=a),i&=~s}if(i=r,i=yt()-i,i=(120>i?120:480>i?480:1080>i?1080:1920>i?1920:3e3>i?3e3:4320>i?4320:1960*Y_(i/1960))-i,10<i){t.timeoutHandle=Nu(ur.bind(null,t,tn,ai),i);break}ur(t,tn,ai);break;case 5:ur(t,tn,ai);break;default:throw Error(se(329))}}}return on(t,yt()),t.callbackNode===n?Ng.bind(null,t):null}function Ku(t,e){var n=fa;return t.current.memoizedState.isDehydrated&&(Sr(t,e).flags|=256),t=Ml(t,e),t!==2&&(e=tn,tn=n,e!==null&&Zu(e)),t}function Zu(t){tn===null?tn=t:tn.push.apply(tn,t)}function $_(t){for(var e=t;;){if(e.flags&16384){var n=e.updateQueue;if(n!==null&&(n=n.stores,n!==null))for(var i=0;i<n.length;i++){var r=n[i],s=r.getSnapshot;r=r.value;try{if(!Gn(s(),r))return!1}catch{return!1}}}if(n=e.child,e.subtreeFlags&16384&&n!==null)n.return=e,e=n;else{if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return!0;e=e.return}e.sibling.return=e.return,e=e.sibling}}return!0}function Di(t,e){for(e&=~Rh,e&=~Bl,t.suspendedLanes|=e,t.pingedLanes&=~e,t=t.expirationTimes;0<e;){var n=31-Hn(e),i=1<<n;t[n]=-1,e&=~i}}function gp(t){if(Ke&6)throw Error(se(327));hs();var e=sl(t,0);if(!(e&1))return on(t,yt()),null;var n=Ml(t,e);if(t.tag!==0&&n===2){var i=wu(t);i!==0&&(e=i,n=Ku(t,i))}if(n===1)throw n=Da,Sr(t,0),Di(t,e),on(t,yt()),n;if(n===6)throw Error(se(345));return t.finishedWork=t.current.alternate,t.finishedLanes=e,ur(t,tn,ai),on(t,yt()),null}function Ph(t,e){var n=Ke;Ke|=1;try{return t(e)}finally{Ke=n,Ke===0&&(ws=yt()+500,Ul&&Ji())}}function Ar(t){Ui!==null&&Ui.tag===0&&!(Ke&6)&&hs();var e=Ke;Ke|=1;var n=Tn.transition,i=it;try{if(Tn.transition=null,it=1,t)return t()}finally{it=i,Tn.transition=n,Ke=e,!(Ke&6)&&Ji()}}function Lh(){hn=ss.current,ut(ss)}function Sr(t,e){t.finishedWork=null,t.finishedLanes=0;var n=t.timeoutHandle;if(n!==-1&&(t.timeoutHandle=-1,b_(n)),wt!==null)for(n=wt.return;n!==null;){var i=n;switch(hh(i),i.tag){case 1:i=i.type.childContextTypes,i!=null&&ul();break;case 3:ys(),ut(sn),ut(Ht),Sh();break;case 5:yh(i);break;case 4:ys();break;case 13:ut(pt);break;case 19:ut(pt);break;case 10:gh(i.type._context);break;case 22:case 23:Lh()}n=n.return}if(Rt=t,wt=t=Gi(t.current,null),Dt=hn=e,Et=0,Da=null,Rh=Bl=Tr=0,tn=fa=null,gr!==null){for(e=0;e<gr.length;e++)if(n=gr[e],i=n.interleaved,i!==null){n.interleaved=null;var r=i.next,s=n.pending;if(s!==null){var a=s.next;s.next=r,i.next=a}n.pending=i}gr=null}return t}function Pg(t,e){do{var n=wt;try{if(mh(),Ho.current=_l,vl){for(var i=mt.memoizedState;i!==null;){var r=i.queue;r!==null&&(r.pending=null),i=i.next}vl=!1}if(br=0,Ct=Mt=mt=null,da=!1,Na=0,Ch.current=null,n===null||n.return===null){Et=1,Da=e,wt=null;break}e:{var s=t,a=n.return,o=n,l=e;if(e=Dt,o.flags|=32768,l!==null&&typeof l=="object"&&typeof l.then=="function"){var u=l,h=o,p=h.tag;if(!(h.mode&1)&&(p===0||p===11||p===15)){var f=h.alternate;f?(h.updateQueue=f.updateQueue,h.memoizedState=f.memoizedState,h.lanes=f.lanes):(h.updateQueue=null,h.memoizedState=null)}var x=ip(a);if(x!==null){x.flags&=-257,rp(x,a,o,s,e),x.mode&1&&np(s,u,e),e=x,l=u;var _=e.updateQueue;if(_===null){var S=new Set;S.add(l),e.updateQueue=S}else _.add(l);break e}else{if(!(e&1)){np(s,u,e),Dh();break e}l=Error(se(426))}}else if(ht&&o.mode&1){var m=ip(a);if(m!==null){!(m.flags&65536)&&(m.flags|=256),rp(m,a,o,s,e),fh(Ss(l,o));break e}}s=l=Ss(l,o),Et!==4&&(Et=2),fa===null?fa=[s]:fa.push(s),s=a;do{switch(s.tag){case 3:s.flags|=65536,e&=-e,s.lanes|=e;var d=pg(s,l,e);Kf(s,d);break e;case 1:o=l;var g=s.type,v=s.stateNode;if(!(s.flags&128)&&(typeof g.getDerivedStateFromError=="function"||v!==null&&typeof v.componentDidCatch=="function"&&(Hi===null||!Hi.has(v)))){s.flags|=65536,e&=-e,s.lanes|=e;var w=mg(s,o,e);Kf(s,w);break e}}s=s.return}while(s!==null)}kg(n)}catch(N){e=N,wt===n&&n!==null&&(wt=n=n.return);continue}break}while(!0)}function Lg(){var t=yl.current;return yl.current=_l,t===null?_l:t}function Dh(){(Et===0||Et===3||Et===2)&&(Et=4),Rt===null||!(Tr&268435455)&&!(Bl&268435455)||Di(Rt,Dt)}function Ml(t,e){var n=Ke;Ke|=2;var i=Lg();(Rt!==t||Dt!==e)&&(ai=null,Sr(t,e));do try{K_();break}catch(r){Pg(t,r)}while(!0);if(mh(),Ke=n,yl.current=i,wt!==null)throw Error(se(261));return Rt=null,Dt=0,Et}function K_(){for(;wt!==null;)Dg(wt)}function Z_(){for(;wt!==null&&!wv();)Dg(wt)}function Dg(t){var e=Ug(t.alternate,t,hn);t.memoizedProps=t.pendingProps,e===null?kg(t):wt=e,Ch.current=null}function kg(t){var e=t;do{var n=e.alternate;if(t=e.return,e.flags&32768){if(n=G_(n,e),n!==null){n.flags&=32767,wt=n;return}if(t!==null)t.flags|=32768,t.subtreeFlags=0,t.deletions=null;else{Et=6,wt=null;return}}else if(n=V_(n,e,hn),n!==null){wt=n;return}if(e=e.sibling,e!==null){wt=e;return}wt=e=t}while(e!==null);Et===0&&(Et=5)}function ur(t,e,n){var i=it,r=Tn.transition;try{Tn.transition=null,it=1,Q_(t,e,n,i)}finally{Tn.transition=r,it=i}return null}function Q_(t,e,n,i){do hs();while(Ui!==null);if(Ke&6)throw Error(se(327));n=t.finishedWork;var r=t.finishedLanes;if(n===null)return null;if(t.finishedWork=null,t.finishedLanes=0,n===t.current)throw Error(se(177));t.callbackNode=null,t.callbackPriority=0;var s=n.lanes|n.childLanes;if(Lv(t,s),t===Rt&&(wt=Rt=null,Dt=0),!(n.subtreeFlags&2064)&&!(n.flags&2064)||uo||(uo=!0,Fg(rl,function(){return hs(),null})),s=(n.flags&15990)!==0,n.subtreeFlags&15990||s){s=Tn.transition,Tn.transition=null;var a=it;it=1;var o=Ke;Ke|=4,Ch.current=null,X_(t,n),Cg(n,t),v_(Cu),al=!!Au,Cu=Au=null,t.current=n,q_(n),Mv(),Ke=o,it=a,Tn.transition=s}else t.current=n;if(uo&&(uo=!1,Ui=t,wl=r),s=t.pendingLanes,s===0&&(Hi=null),Tv(n.stateNode),on(t,yt()),e!==null)for(i=t.onRecoverableError,n=0;n<e.length;n++)r=e[n],i(r.value,{componentStack:r.stack,digest:r.digest});if(Sl)throw Sl=!1,t=Yu,Yu=null,t;return wl&1&&t.tag!==0&&hs(),s=t.pendingLanes,s&1?t===$u?pa++:(pa=0,$u=t):pa=0,Ji(),null}function hs(){if(Ui!==null){var t=p0(wl),e=Tn.transition,n=it;try{if(Tn.transition=null,it=16>t?16:t,Ui===null)var i=!1;else{if(t=Ui,Ui=null,wl=0,Ke&6)throw Error(se(331));var r=Ke;for(Ke|=4,_e=t.current;_e!==null;){var s=_e,a=s.child;if(_e.flags&16){var o=s.deletions;if(o!==null){for(var l=0;l<o.length;l++){var u=o[l];for(_e=u;_e!==null;){var h=_e;switch(h.tag){case 0:case 11:case 15:ha(8,h,s)}var p=h.child;if(p!==null)p.return=h,_e=p;else for(;_e!==null;){h=_e;var f=h.sibling,x=h.return;if(bg(h),h===u){_e=null;break}if(f!==null){f.return=x,_e=f;break}_e=x}}}var _=s.alternate;if(_!==null){var S=_.child;if(S!==null){_.child=null;do{var m=S.sibling;S.sibling=null,S=m}while(S!==null)}}_e=s}}if(s.subtreeFlags&2064&&a!==null)a.return=s,_e=a;else e:for(;_e!==null;){if(s=_e,s.flags&2048)switch(s.tag){case 0:case 11:case 15:ha(9,s,s.return)}var d=s.sibling;if(d!==null){d.return=s.return,_e=d;break e}_e=s.return}}var g=t.current;for(_e=g;_e!==null;){a=_e;var v=a.child;if(a.subtreeFlags&2064&&v!==null)v.return=a,_e=v;else e:for(a=g;_e!==null;){if(o=_e,o.flags&2048)try{switch(o.tag){case 0:case 11:case 15:zl(9,o)}}catch(N){vt(o,o.return,N)}if(o===a){_e=null;break e}var w=o.sibling;if(w!==null){w.return=o.return,_e=w;break e}_e=o.return}}if(Ke=r,Ji(),Kn&&typeof Kn.onPostCommitFiberRoot=="function")try{Kn.onPostCommitFiberRoot(Pl,t)}catch{}i=!0}return i}finally{it=n,Tn.transition=e}}return!1}function xp(t,e,n){e=Ss(n,e),e=pg(t,e,1),t=ji(t,e,1),e=Xt(),t!==null&&(Oa(t,1,e),on(t,e))}function vt(t,e,n){if(t.tag===3)xp(t,t,n);else for(;e!==null;){if(e.tag===3){xp(e,t,n);break}else if(e.tag===1){var i=e.stateNode;if(typeof e.type.getDerivedStateFromError=="function"||typeof i.componentDidCatch=="function"&&(Hi===null||!Hi.has(i))){t=Ss(n,t),t=mg(e,t,1),e=ji(e,t,1),t=Xt(),e!==null&&(Oa(e,1,t),on(e,t));break}}e=e.return}}function J_(t,e,n){var i=t.pingCache;i!==null&&i.delete(e),e=Xt(),t.pingedLanes|=t.suspendedLanes&n,Rt===t&&(Dt&n)===n&&(Et===4||Et===3&&(Dt&130023424)===Dt&&500>yt()-Nh?Sr(t,0):Rh|=n),on(t,e)}function Ig(t,e){e===0&&(t.mode&1?(e=eo,eo<<=1,!(eo&130023424)&&(eo=4194304)):e=1);var n=Xt();t=mi(t,e),t!==null&&(Oa(t,e,n),on(t,n))}function ey(t){var e=t.memoizedState,n=0;e!==null&&(n=e.retryLane),Ig(t,n)}function ty(t,e){var n=0;switch(t.tag){case 13:var i=t.stateNode,r=t.memoizedState;r!==null&&(n=r.retryLane);break;case 19:i=t.stateNode;break;default:throw Error(se(314))}i!==null&&i.delete(e),Ig(t,n)}var Ug;Ug=function(t,e,n){if(t!==null)if(t.memoizedProps!==e.pendingProps||sn.current)rn=!0;else{if(!(t.lanes&n)&&!(e.flags&128))return rn=!1,H_(t,e,n);rn=!!(t.flags&131072)}else rn=!1,ht&&e.flags&1048576&&B0(e,fl,e.index);switch(e.lanes=0,e.tag){case 2:var i=e.type;Go(t,e),t=e.pendingProps;var r=xs(e,Ht.current);ds(e,n),r=Mh(null,e,i,t,r,n);var s=Eh();return e.flags|=1,typeof r=="object"&&r!==null&&typeof r.render=="function"&&r.$$typeof===void 0?(e.tag=1,e.memoizedState=null,e.updateQueue=null,an(i)?(s=!0,dl(e)):s=!1,e.memoizedState=r.state!==null&&r.state!==void 0?r.state:null,vh(e),r.updater=Ol,e.stateNode=r,r._reactInternals=e,Fu(e,i,t,n),e=Bu(null,e,i,!0,s,n)):(e.tag=0,ht&&s&&dh(e),Wt(null,e,r,n),e=e.child),e;case 16:i=e.elementType;e:{switch(Go(t,e),t=e.pendingProps,r=i._init,i=r(i._payload),e.type=i,r=e.tag=iy(i),t=Un(i,t),r){case 0:e=zu(null,e,i,t,n);break e;case 1:e=op(null,e,i,t,n);break e;case 11:e=sp(null,e,i,t,n);break e;case 14:e=ap(null,e,i,Un(i.type,t),n);break e}throw Error(se(306,i,""))}return e;case 0:return i=e.type,r=e.pendingProps,r=e.elementType===i?r:Un(i,r),zu(t,e,i,r,n);case 1:return i=e.type,r=e.pendingProps,r=e.elementType===i?r:Un(i,r),op(t,e,i,r,n);case 3:e:{if(_g(e),t===null)throw Error(se(387));i=e.pendingProps,s=e.memoizedState,r=s.element,X0(t,e),gl(e,i,null,n);var a=e.memoizedState;if(i=a.element,s.isDehydrated)if(s={element:i,isDehydrated:!1,cache:a.cache,pendingSuspenseBoundaries:a.pendingSuspenseBoundaries,transitions:a.transitions},e.updateQueue.baseState=s,e.memoizedState=s,e.flags&256){r=Ss(Error(se(423)),e),e=lp(t,e,i,n,r);break e}else if(i!==r){r=Ss(Error(se(424)),e),e=lp(t,e,i,n,r);break e}else for(pn=Bi(e.stateNode.containerInfo.firstChild),mn=e,ht=!0,On=null,n=G0(e,null,i,n),e.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling;else{if(vs(),i===r){e=gi(t,e,n);break e}Wt(t,e,i,n)}e=e.child}return e;case 5:return q0(e),t===null&&ku(e),i=e.type,r=e.pendingProps,s=t!==null?t.memoizedProps:null,a=r.children,Ru(i,r)?a=null:s!==null&&Ru(i,s)&&(e.flags|=32),vg(t,e),Wt(t,e,a,n),e.child;case 6:return t===null&&ku(e),null;case 13:return yg(t,e,n);case 4:return _h(e,e.stateNode.containerInfo),i=e.pendingProps,t===null?e.child=_s(e,null,i,n):Wt(t,e,i,n),e.child;case 11:return i=e.type,r=e.pendingProps,r=e.elementType===i?r:Un(i,r),sp(t,e,i,r,n);case 7:return Wt(t,e,e.pendingProps,n),e.child;case 8:return Wt(t,e,e.pendingProps.children,n),e.child;case 12:return Wt(t,e,e.pendingProps.children,n),e.child;case 10:e:{if(i=e.type._context,r=e.pendingProps,s=e.memoizedProps,a=r.value,at(pl,i._currentValue),i._currentValue=a,s!==null)if(Gn(s.value,a)){if(s.children===r.children&&!sn.current){e=gi(t,e,n);break e}}else for(s=e.child,s!==null&&(s.return=e);s!==null;){var o=s.dependencies;if(o!==null){a=s.child;for(var l=o.firstContext;l!==null;){if(l.context===i){if(s.tag===1){l=hi(-1,n&-n),l.tag=2;var u=s.updateQueue;if(u!==null){u=u.shared;var h=u.pending;h===null?l.next=l:(l.next=h.next,h.next=l),u.pending=l}}s.lanes|=n,l=s.alternate,l!==null&&(l.lanes|=n),Iu(s.return,n,e),o.lanes|=n;break}l=l.next}}else if(s.tag===10)a=s.type===e.type?null:s.child;else if(s.tag===18){if(a=s.return,a===null)throw Error(se(341));a.lanes|=n,o=a.alternate,o!==null&&(o.lanes|=n),Iu(a,n,e),a=s.sibling}else a=s.child;if(a!==null)a.return=s;else for(a=s;a!==null;){if(a===e){a=null;break}if(s=a.sibling,s!==null){s.return=a.return,a=s;break}a=a.return}s=a}Wt(t,e,r.children,n),e=e.child}return e;case 9:return r=e.type,i=e.pendingProps.children,ds(e,n),r=Cn(r),i=i(r),e.flags|=1,Wt(t,e,i,n),e.child;case 14:return i=e.type,r=Un(i,e.pendingProps),r=Un(i.type,r),ap(t,e,i,r,n);case 15:return gg(t,e,e.type,e.pendingProps,n);case 17:return i=e.type,r=e.pendingProps,r=e.elementType===i?r:Un(i,r),Go(t,e),e.tag=1,an(i)?(t=!0,dl(e)):t=!1,ds(e,n),fg(e,i,r),Fu(e,i,r,n),Bu(null,e,i,!0,t,n);case 19:return Sg(t,e,n);case 22:return xg(t,e,n)}throw Error(se(156,e.tag))};function Fg(t,e){return u0(t,e)}function ny(t,e,n,i){this.tag=t,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=e,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=i,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function En(t,e,n,i){return new ny(t,e,n,i)}function kh(t){return t=t.prototype,!(!t||!t.isReactComponent)}function iy(t){if(typeof t=="function")return kh(t)?1:0;if(t!=null){if(t=t.$$typeof,t===Jd)return 11;if(t===eh)return 14}return 2}function Gi(t,e){var n=t.alternate;return n===null?(n=En(t.tag,e,t.key,t.mode),n.elementType=t.elementType,n.type=t.type,n.stateNode=t.stateNode,n.alternate=t,t.alternate=n):(n.pendingProps=e,n.type=t.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=t.flags&14680064,n.childLanes=t.childLanes,n.lanes=t.lanes,n.child=t.child,n.memoizedProps=t.memoizedProps,n.memoizedState=t.memoizedState,n.updateQueue=t.updateQueue,e=t.dependencies,n.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext},n.sibling=t.sibling,n.index=t.index,n.ref=t.ref,n}function qo(t,e,n,i,r,s){var a=2;if(i=t,typeof t=="function")kh(t)&&(a=1);else if(typeof t=="string")a=5;else e:switch(t){case $r:return wr(n.children,r,s,e);case Qd:a=8,r|=8;break;case ou:return t=En(12,n,e,r|2),t.elementType=ou,t.lanes=s,t;case lu:return t=En(13,n,e,r),t.elementType=lu,t.lanes=s,t;case cu:return t=En(19,n,e,r),t.elementType=cu,t.lanes=s,t;case qm:return jl(n,r,s,e);default:if(typeof t=="object"&&t!==null)switch(t.$$typeof){case Wm:a=10;break e;case Xm:a=9;break e;case Jd:a=11;break e;case eh:a=14;break e;case Ri:a=16,i=null;break e}throw Error(se(130,t==null?t:typeof t,""))}return e=En(a,n,e,r),e.elementType=t,e.type=i,e.lanes=s,e}function wr(t,e,n,i){return t=En(7,t,i,e),t.lanes=n,t}function jl(t,e,n,i){return t=En(22,t,i,e),t.elementType=qm,t.lanes=n,t.stateNode={isHidden:!1},t}function Ec(t,e,n){return t=En(6,t,null,e),t.lanes=n,t}function bc(t,e,n){return e=En(4,t.children!==null?t.children:[],t.key,e),e.lanes=n,e.stateNode={containerInfo:t.containerInfo,pendingChildren:null,implementation:t.implementation},e}function ry(t,e,n,i,r){this.tag=e,this.containerInfo=t,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=sc(0),this.expirationTimes=sc(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=sc(0),this.identifierPrefix=i,this.onRecoverableError=r,this.mutableSourceEagerHydrationData=null}function Ih(t,e,n,i,r,s,a,o,l){return t=new ry(t,e,n,o,l),e===1?(e=1,s===!0&&(e|=8)):e=0,s=En(3,null,null,e),t.current=s,s.stateNode=t,s.memoizedState={element:i,isDehydrated:n,cache:null,transitions:null,pendingSuspenseBoundaries:null},vh(s),t}function sy(t,e,n){var i=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:Yr,key:i==null?null:""+i,children:t,containerInfo:e,implementation:n}}function Og(t){if(!t)return Yi;t=t._reactInternals;e:{if(Pr(t)!==t||t.tag!==1)throw Error(se(170));var e=t;do{switch(e.tag){case 3:e=e.stateNode.context;break e;case 1:if(an(e.type)){e=e.stateNode.__reactInternalMemoizedMergedChildContext;break e}}e=e.return}while(e!==null);throw Error(se(171))}if(t.tag===1){var n=t.type;if(an(n))return O0(t,n,e)}return e}function zg(t,e,n,i,r,s,a,o,l){return t=Ih(n,i,!0,t,r,s,a,o,l),t.context=Og(null),n=t.current,i=Xt(),r=Vi(n),s=hi(i,r),s.callback=e??null,ji(n,s,r),t.current.lanes=r,Oa(t,r,i),on(t,i),t}function Hl(t,e,n,i){var r=e.current,s=Xt(),a=Vi(r);return n=Og(n),e.context===null?e.context=n:e.pendingContext=n,e=hi(s,a),e.payload={element:t},i=i===void 0?null:i,i!==null&&(e.callback=i),t=ji(r,e,a),t!==null&&(Vn(t,r,a,s),jo(t,r,a)),a}function El(t){if(t=t.current,!t.child)return null;switch(t.child.tag){case 5:return t.child.stateNode;default:return t.child.stateNode}}function vp(t,e){if(t=t.memoizedState,t!==null&&t.dehydrated!==null){var n=t.retryLane;t.retryLane=n!==0&&n<e?n:e}}function Uh(t,e){vp(t,e),(t=t.alternate)&&vp(t,e)}function ay(){return null}var Bg=typeof reportError=="function"?reportError:function(t){console.error(t)};function Fh(t){this._internalRoot=t}Vl.prototype.render=Fh.prototype.render=function(t){var e=this._internalRoot;if(e===null)throw Error(se(409));Hl(t,e,null,null)};Vl.prototype.unmount=Fh.prototype.unmount=function(){var t=this._internalRoot;if(t!==null){this._internalRoot=null;var e=t.containerInfo;Ar(function(){Hl(null,t,null,null)}),e[pi]=null}};function Vl(t){this._internalRoot=t}Vl.prototype.unstable_scheduleHydration=function(t){if(t){var e=x0();t={blockedOn:null,target:t,priority:e};for(var n=0;n<Li.length&&e!==0&&e<Li[n].priority;n++);Li.splice(n,0,t),n===0&&_0(t)}};function Oh(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)}function Gl(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11&&(t.nodeType!==8||t.nodeValue!==" react-mount-point-unstable "))}function _p(){}function oy(t,e,n,i,r){if(r){if(typeof i=="function"){var s=i;i=function(){var u=El(a);s.call(u)}}var a=zg(e,i,t,0,null,!1,!1,"",_p);return t._reactRootContainer=a,t[pi]=a.current,ba(t.nodeType===8?t.parentNode:t),Ar(),a}for(;r=t.lastChild;)t.removeChild(r);if(typeof i=="function"){var o=i;i=function(){var u=El(l);o.call(u)}}var l=Ih(t,0,!1,null,null,!1,!1,"",_p);return t._reactRootContainer=l,t[pi]=l.current,ba(t.nodeType===8?t.parentNode:t),Ar(function(){Hl(e,l,n,i)}),l}function Wl(t,e,n,i,r){var s=n._reactRootContainer;if(s){var a=s;if(typeof r=="function"){var o=r;r=function(){var l=El(a);o.call(l)}}Hl(e,a,t,r)}else a=oy(n,e,t,r,i);return El(a)}m0=function(t){switch(t.tag){case 3:var e=t.stateNode;if(e.current.memoizedState.isDehydrated){var n=na(e.pendingLanes);n!==0&&(ih(e,n|1),on(e,yt()),!(Ke&6)&&(ws=yt()+500,Ji()))}break;case 13:Ar(function(){var i=mi(t,1);if(i!==null){var r=Xt();Vn(i,t,1,r)}}),Uh(t,1)}};rh=function(t){if(t.tag===13){var e=mi(t,134217728);if(e!==null){var n=Xt();Vn(e,t,134217728,n)}Uh(t,134217728)}};g0=function(t){if(t.tag===13){var e=Vi(t),n=mi(t,e);if(n!==null){var i=Xt();Vn(n,t,e,i)}Uh(t,e)}};x0=function(){return it};v0=function(t,e){var n=it;try{return it=t,e()}finally{it=n}};_u=function(t,e,n){switch(e){case"input":if(hu(t,n),e=n.name,n.type==="radio"&&e!=null){for(n=t;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll("input[name="+JSON.stringify(""+e)+'][type="radio"]'),e=0;e<n.length;e++){var i=n[e];if(i!==t&&i.form===t.form){var r=Il(i);if(!r)throw Error(se(90));$m(i),hu(i,r)}}}break;case"textarea":Zm(t,n);break;case"select":e=n.value,e!=null&&os(t,!!n.multiple,e,!1)}};r0=Ph;s0=Ar;var ly={usingClientEntryPoint:!1,Events:[Ba,Jr,Il,n0,i0,Ph]},Xs={findFiberByHostInstance:mr,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},cy={bundleType:Xs.bundleType,version:Xs.version,rendererPackageName:Xs.rendererPackageName,rendererConfig:Xs.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:_i.ReactCurrentDispatcher,findHostInstanceByFiber:function(t){return t=l0(t),t===null?null:t.stateNode},findFiberByHostInstance:Xs.findFiberByHostInstance||ay,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var ho=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!ho.isDisabled&&ho.supportsFiber)try{Pl=ho.inject(cy),Kn=ho}catch{}}xn.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=ly;xn.createPortal=function(t,e){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!Oh(e))throw Error(se(200));return sy(t,e,null,n)};xn.createRoot=function(t,e){if(!Oh(t))throw Error(se(299));var n=!1,i="",r=Bg;return e!=null&&(e.unstable_strictMode===!0&&(n=!0),e.identifierPrefix!==void 0&&(i=e.identifierPrefix),e.onRecoverableError!==void 0&&(r=e.onRecoverableError)),e=Ih(t,1,!1,null,null,n,!1,i,r),t[pi]=e.current,ba(t.nodeType===8?t.parentNode:t),new Fh(e)};xn.findDOMNode=function(t){if(t==null)return null;if(t.nodeType===1)return t;var e=t._reactInternals;if(e===void 0)throw typeof t.render=="function"?Error(se(188)):(t=Object.keys(t).join(","),Error(se(268,t)));return t=l0(e),t=t===null?null:t.stateNode,t};xn.flushSync=function(t){return Ar(t)};xn.hydrate=function(t,e,n){if(!Gl(e))throw Error(se(200));return Wl(null,t,e,!0,n)};xn.hydrateRoot=function(t,e,n){if(!Oh(t))throw Error(se(405));var i=n!=null&&n.hydratedSources||null,r=!1,s="",a=Bg;if(n!=null&&(n.unstable_strictMode===!0&&(r=!0),n.identifierPrefix!==void 0&&(s=n.identifierPrefix),n.onRecoverableError!==void 0&&(a=n.onRecoverableError)),e=zg(e,null,t,1,n??null,r,!1,s,a),t[pi]=e.current,ba(t),i)for(t=0;t<i.length;t++)n=i[t],r=n._getVersion,r=r(n._source),e.mutableSourceEagerHydrationData==null?e.mutableSourceEagerHydrationData=[n,r]:e.mutableSourceEagerHydrationData.push(n,r);return new Vl(e)};xn.render=function(t,e,n){if(!Gl(e))throw Error(se(200));return Wl(null,t,e,!1,n)};xn.unmountComponentAtNode=function(t){if(!Gl(t))throw Error(se(40));return t._reactRootContainer?(Ar(function(){Wl(null,null,t,!1,function(){t._reactRootContainer=null,t[pi]=null})}),!0):!1};xn.unstable_batchedUpdates=Ph;xn.unstable_renderSubtreeIntoContainer=function(t,e,n,i){if(!Gl(n))throw Error(se(200));if(t==null||t._reactInternals===void 0)throw Error(se(38));return Wl(t,e,n,!1,i)};xn.version="18.3.1-next-f1338f8080-20240426";function jg(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(jg)}catch(t){console.error(t)}}jg(),jm.exports=xn;var uy=jm.exports,yp=uy;su.createRoot=yp.createRoot,su.hydrateRoot=yp.hydrateRoot;var Sp="1.3.26";function Hg(t,e,n){return Math.max(t,Math.min(e,n))}function dy(t,e,n){return(1-n)*t+n*e}function hy(t,e,n,i){return dy(t,e,1-Math.exp(-n*i))}function fy(t,e){return(t%e+e)%e}var py=class{constructor(){we(this,"isRunning",!1);we(this,"value",0);we(this,"from",0);we(this,"to",0);we(this,"currentTime",0);we(this,"lerp");we(this,"duration");we(this,"easing");we(this,"onUpdate")}advance(t){var n;if(!this.isRunning)return;let e=!1;if(this.duration&&this.easing){this.currentTime+=t;const i=Hg(0,this.currentTime/this.duration,1);e=i>=1;const r=e?1:this.easing(i);this.value=this.from+(this.to-this.from)*r}else this.lerp?(this.value=hy(this.value,this.to,this.lerp*60,t),Math.round(this.value)===Math.round(this.to)&&(this.value=this.to,e=!0)):(this.value=this.to,e=!0);e&&this.stop(),(n=this.onUpdate)==null||n.call(this,this.value,e)}stop(){this.isRunning=!1}fromTo(t,e,{lerp:n,duration:i,easing:r,onStart:s,onUpdate:a}){this.from=this.value=t,this.to=e,this.lerp=n,this.duration=i,this.easing=r,this.currentTime=0,this.isRunning=!0,s==null||s(),this.onUpdate=a}};function my(t,e){let n;return function(...i){clearTimeout(n),n=setTimeout(()=>{n=void 0,t.apply(this,i)},e)}}var gy=class{constructor(t,e,{autoResize:n=!0,debounce:i=250}={}){we(this,"width",0);we(this,"height",0);we(this,"scrollHeight",0);we(this,"scrollWidth",0);we(this,"debouncedResize");we(this,"wrapperResizeObserver");we(this,"contentResizeObserver");we(this,"resize",()=>{this.onWrapperResize(),this.onContentResize()});we(this,"onWrapperResize",()=>{this.wrapper instanceof Window?(this.width=window.innerWidth,this.height=window.innerHeight):(this.width=this.wrapper.clientWidth,this.height=this.wrapper.clientHeight)});we(this,"onContentResize",()=>{this.wrapper instanceof Window?(this.scrollHeight=this.content.scrollHeight,this.scrollWidth=this.content.scrollWidth):(this.scrollHeight=this.wrapper.scrollHeight,this.scrollWidth=this.wrapper.scrollWidth)});this.wrapper=t,this.content=e,n&&(this.debouncedResize=my(this.resize,i),this.wrapper instanceof Window?window.addEventListener("resize",this.debouncedResize):(this.wrapperResizeObserver=new ResizeObserver(this.debouncedResize),this.wrapperResizeObserver.observe(this.wrapper)),this.contentResizeObserver=new ResizeObserver(this.debouncedResize),this.contentResizeObserver.observe(this.content)),this.resize()}destroy(){var t,e;(t=this.wrapperResizeObserver)==null||t.disconnect(),(e=this.contentResizeObserver)==null||e.disconnect(),this.wrapper===window&&this.debouncedResize&&window.removeEventListener("resize",this.debouncedResize)}get limit(){return{x:this.scrollWidth-this.width,y:this.scrollHeight-this.height}}},Vg=class{constructor(){we(this,"events",{})}emit(t,...e){var i;const n=this.events[t]||[];for(let r=0,s=n.length;r<s;r++)(i=n[r])==null||i.call(n,...e)}on(t,e){return this.events[t]?this.events[t].push(e):this.events[t]=[e],()=>{var n;this.events[t]=(n=this.events[t])==null?void 0:n.filter(i=>e!==i)}}off(t,e){var n;this.events[t]=(n=this.events[t])==null?void 0:n.filter(i=>e!==i)}destroy(){this.events={}}};const xy=100/6,wi={passive:!1};function wp(t,e){return t===1?xy:t===2?e:1}var vy=class{constructor(t,e={wheelMultiplier:1,touchMultiplier:1}){we(this,"touchStart",{x:0,y:0});we(this,"lastDelta",{x:0,y:0});we(this,"window",{width:0,height:0});we(this,"emitter",new Vg);we(this,"onTouchStart",t=>{const{clientX:e,clientY:n}=t.targetTouches?t.targetTouches[0]:t;this.touchStart.x=e,this.touchStart.y=n,this.lastDelta={x:0,y:0},this.emitter.emit("scroll",{deltaX:0,deltaY:0,event:t})});we(this,"onTouchMove",t=>{const{clientX:e,clientY:n}=t.targetTouches?t.targetTouches[0]:t,i=-(e-this.touchStart.x)*this.options.touchMultiplier,r=-(n-this.touchStart.y)*this.options.touchMultiplier;this.touchStart.x=e,this.touchStart.y=n,this.lastDelta={x:i,y:r},this.emitter.emit("scroll",{deltaX:i,deltaY:r,event:t})});we(this,"onTouchEnd",t=>{this.emitter.emit("scroll",{deltaX:this.lastDelta.x,deltaY:this.lastDelta.y,event:t})});we(this,"onWheel",t=>{let{deltaX:e,deltaY:n,deltaMode:i}=t;const r=wp(i,this.window.width),s=wp(i,this.window.height);e*=r,n*=s,e*=this.options.wheelMultiplier,n*=this.options.wheelMultiplier,this.emitter.emit("scroll",{deltaX:e,deltaY:n,event:t})});we(this,"onWindowResize",()=>{this.window={width:window.innerWidth,height:window.innerHeight}});this.element=t,this.options=e,window.addEventListener("resize",this.onWindowResize),this.onWindowResize(),this.element.addEventListener("wheel",this.onWheel,wi),this.element.addEventListener("touchstart",this.onTouchStart,wi),this.element.addEventListener("touchmove",this.onTouchMove,wi),this.element.addEventListener("touchend",this.onTouchEnd,wi)}on(t,e){return this.emitter.on(t,e)}destroy(){this.emitter.destroy(),window.removeEventListener("resize",this.onWindowResize),this.element.removeEventListener("wheel",this.onWheel,wi),this.element.removeEventListener("touchstart",this.onTouchStart,wi),this.element.removeEventListener("touchmove",this.onTouchMove,wi),this.element.removeEventListener("touchend",this.onTouchEnd,wi)}};const Mp=t=>Math.min(1,1.001-2**(-10*t));var _y=class{constructor({wrapper:t=window,content:e=document.documentElement,eventsTarget:n=t,smoothWheel:i=!0,syncTouch:r=!1,syncTouchLerp:s=.075,touchInertiaExponent:a=1.7,duration:o,easing:l,lerp:u=.1,infinite:h=!1,orientation:p="vertical",gestureOrientation:f=p==="horizontal"?"both":"vertical",touchMultiplier:x=1,wheelMultiplier:_=1,autoResize:S=!0,prevent:m,virtualScroll:d,overscroll:g=!0,autoRaf:v=!1,anchors:w=!1,autoToggle:N=!1,allowNestedScroll:E=!1,__experimental__naiveDimensions:A=!1,naiveDimensions:R=A,stopInertiaOnNavigate:F=!1,respectReducedMotion:y=!0}={}){we(this,"_isScrolling",!1);we(this,"_isStopped",!1);we(this,"_isLocked",!1);we(this,"_preventNextNativeScrollEvent",!1);we(this,"_resetVelocityTimeout",null);we(this,"_rafId",null);we(this,"_isDraggingSelection",!1);we(this,"reducedMotionMediaQuery",window.matchMedia("(prefers-reduced-motion: reduce)"));we(this,"isTouching");we(this,"isIos");we(this,"time",0);we(this,"userData",{});we(this,"lastVelocity",0);we(this,"velocity",0);we(this,"direction",0);we(this,"options");we(this,"targetScroll");we(this,"animatedScroll");we(this,"animate",new py);we(this,"emitter",new Vg);we(this,"dimensions");we(this,"virtualScroll");we(this,"onScrollEnd",t=>{t instanceof CustomEvent||(this.isScrolling==="smooth"||this.isScrolling===!1)&&t.stopPropagation()});we(this,"dispatchScrollendEvent",()=>{this.options.wrapper.dispatchEvent(new CustomEvent("scrollend",{bubbles:this.options.wrapper===window,detail:{lenisScrollEnd:!0}}))});we(this,"onTransitionEnd",t=>{var e;(e=t.propertyName)!=null&&e.includes("overflow")&&t.target===this.rootElement&&this.checkOverflow()});we(this,"onClick",t=>{const e=t.composedPath().filter(i=>i instanceof HTMLAnchorElement&&i.href).map(i=>new URL(i.href)),n=new URL(window.location.href);if(this.options.anchors){const i=e.find(r=>n.host===r.host&&n.pathname===r.pathname&&r.hash);if(i){const r=typeof this.options.anchors=="object"&&this.options.anchors?this.options.anchors:void 0,s=decodeURIComponent(i.hash);this.scrollTo(s,r);return}}if(this.options.stopInertiaOnNavigate&&e.some(i=>n.host===i.host&&n.pathname!==i.pathname)){this.reset();return}});we(this,"onPointerDown",t=>{t.button===1&&this.reset()});we(this,"onVirtualScroll",t=>{if(typeof this.options.virtualScroll=="function"&&this.options.virtualScroll(t)===!1)return;const{deltaX:e,deltaY:n,event:i}=t;if(this.emitter.emit("virtual-scroll",{deltaX:e,deltaY:n,event:i}),i.ctrlKey||i.lenisStopPropagation)return;const r=i.type.includes("touch"),s=i.type.includes("wheel");if(r&&this.isIos&&(i.type==="touchstart"&&(this._isDraggingSelection=this.isTouchOnSelectionHandle(i)),this._isDraggingSelection)){i.type==="touchend"&&(this._isDraggingSelection=!1);return}this.isTouching=i.type==="touchstart"||i.type==="touchmove";const a=e===0&&n===0;if(this.options.syncTouch&&r&&i.type==="touchstart"&&a&&!this.isStopped&&!this.isLocked){this.reset();return}const o=this.options.gestureOrientation==="vertical"&&n===0||this.options.gestureOrientation==="horizontal"&&e===0;if(a||o)return;let l=i.composedPath();l=l.slice(0,l.indexOf(this.rootElement));const u=this.options.prevent,h=Math.abs(e)>=Math.abs(n)?"horizontal":"vertical";if(l.find(_=>{var S,m,d,g,v;return _ instanceof HTMLElement&&(typeof u=="function"&&(u==null?void 0:u(_))||((S=_.hasAttribute)==null?void 0:S.call(_,"data-lenis-prevent"))||h==="vertical"&&((m=_.hasAttribute)==null?void 0:m.call(_,"data-lenis-prevent-vertical"))||h==="horizontal"&&((d=_.hasAttribute)==null?void 0:d.call(_,"data-lenis-prevent-horizontal"))||r&&((g=_.hasAttribute)==null?void 0:g.call(_,"data-lenis-prevent-touch"))||s&&((v=_.hasAttribute)==null?void 0:v.call(_,"data-lenis-prevent-wheel"))||this.options.allowNestedScroll&&this.hasNestedScroll(_,{deltaX:e,deltaY:n}))}))return;if(this.isStopped||this.isLocked){i.cancelable&&i.preventDefault();return}if(!(this.options.syncTouch&&r||this.options.smoothWheel&&s)){this.isScrolling="native",this.animate.stop(),i.lenisStopPropagation=!0;return}let p=n;this.options.gestureOrientation==="both"?p=Math.abs(n)>Math.abs(e)?n:e:this.options.gestureOrientation==="horizontal"&&(p=e),(!this.options.overscroll||this.options.infinite||this.options.wrapper!==window&&this.limit>0&&(this.animatedScroll>0&&this.animatedScroll<this.limit||this.animatedScroll===0&&n>0||this.animatedScroll===this.limit&&n<0))&&(i.lenisStopPropagation=!0),i.cancelable&&i.preventDefault();const f=r&&this.options.syncTouch,x=r&&i.type==="touchend";x&&(p=Math.sign(p)*Math.abs(this.velocity)**this.options.touchInertiaExponent),this.scrollTo(this.targetScroll+p,{programmatic:!1,...f?{lerp:x?this.options.syncTouchLerp:1}:{lerp:this.options.lerp,duration:this.options.duration,easing:this.options.easing}})});we(this,"onNativeScroll",()=>{if(this._resetVelocityTimeout!==null&&(clearTimeout(this._resetVelocityTimeout),this._resetVelocityTimeout=null),this._preventNextNativeScrollEvent){this._preventNextNativeScrollEvent=!1;return}if(this.isScrolling===!1||this.isScrolling==="native"){const t=this.animatedScroll;this.animatedScroll=this.targetScroll=this.actualScroll,this.lastVelocity=this.velocity,this.velocity=this.animatedScroll-t,this.direction=Math.sign(this.animatedScroll-t),this.isStopped||(this.isScrolling="native"),this.emit(),this.velocity!==0&&(this._resetVelocityTimeout=setTimeout(()=>{this.lastVelocity=this.velocity,this.velocity=0,this.isScrolling=!1,this.emit()},400))}});we(this,"raf",t=>{const e=t-(this.time||t);this.time=t,this.animate.advance(e*.001),this.options.autoRaf&&(this._rafId=requestAnimationFrame(this.raf))});window.lenisVersion=Sp,window.lenis||(window.lenis={}),window.lenis.version=Sp,p==="horizontal"&&(window.lenis.horizontal=!0),r===!0&&(window.lenis.touch=!0),this.isIos=/(iPad|iPhone|iPod)/g.test(navigator.userAgent),(!t||t===document.documentElement)&&(t=window),typeof o=="number"&&typeof l!="function"?l=Mp:typeof l=="function"&&typeof o!="number"&&(o=1),this.options={wrapper:t,content:e,eventsTarget:n,smoothWheel:i,syncTouch:r,syncTouchLerp:s,touchInertiaExponent:a,duration:o,easing:l,lerp:u,infinite:h,gestureOrientation:f,orientation:p,touchMultiplier:x,wheelMultiplier:_,autoResize:S,prevent:m,virtualScroll:d,overscroll:g,autoRaf:v,anchors:w,autoToggle:N,allowNestedScroll:E,naiveDimensions:R,stopInertiaOnNavigate:F,respectReducedMotion:y},this.dimensions=new gy(t,e,{autoResize:S}),this.updateClassName(),this.targetScroll=this.animatedScroll=this.actualScroll,this.options.wrapper.addEventListener("scroll",this.onNativeScroll),this.options.wrapper.addEventListener("scrollend",this.onScrollEnd,{capture:!0}),(this.options.anchors||this.options.stopInertiaOnNavigate)&&this.options.wrapper.addEventListener("click",this.onClick),this.options.wrapper.addEventListener("pointerdown",this.onPointerDown),this.virtualScroll=new vy(n,{touchMultiplier:x,wheelMultiplier:_}),this.virtualScroll.on("scroll",this.onVirtualScroll),this.options.autoToggle&&(this.checkOverflow(),this.rootElement.addEventListener("transitionend",this.onTransitionEnd)),this.options.autoRaf&&(this._rafId=requestAnimationFrame(this.raf))}destroy(){this.emitter.destroy(),this.options.wrapper.removeEventListener("scroll",this.onNativeScroll),this.options.wrapper.removeEventListener("scrollend",this.onScrollEnd,{capture:!0}),this.options.wrapper.removeEventListener("pointerdown",this.onPointerDown),(this.options.anchors||this.options.stopInertiaOnNavigate)&&this.options.wrapper.removeEventListener("click",this.onClick),this.virtualScroll.destroy(),this.dimensions.destroy(),this.cleanUpClassName(),this._rafId&&cancelAnimationFrame(this._rafId)}on(t,e){return this.emitter.on(t,e)}off(t,e){return this.emitter.off(t,e)}get overflow(){const t=this.isHorizontal?"overflow-x":"overflow-y";return getComputedStyle(this.rootElement)[t]}checkOverflow(){["hidden","clip"].includes(this.overflow)?this.internalStop():this.internalStart()}setScroll(t){this.isHorizontal?this.options.wrapper.scrollTo({left:t,behavior:"instant"}):this.options.wrapper.scrollTo({top:t,behavior:"instant"})}isTouchOnSelectionHandle(t){const e=window.getSelection();if(!e||e.isCollapsed||e.rangeCount===0)return!1;const n=t.targetTouches[0]??t.changedTouches[0];if(!n)return!1;const i=e.getRangeAt(0).getClientRects();if(i.length===0)return!1;const r=i[0],s=i[i.length-1],a=40,o=Math.hypot(n.clientX-r.left,n.clientY-r.top)<=a,l=Math.hypot(n.clientX-s.right,n.clientY-s.bottom)<=a;return o||l}resize(){this.dimensions.resize(),this.animatedScroll=this.targetScroll=this.actualScroll,this.emit()}emit(){this.emitter.emit("scroll",this)}reset(){this.isLocked=!1,this.isScrolling=!1,this.animatedScroll=this.targetScroll=this.actualScroll,this.lastVelocity=this.velocity=0,this.animate.stop()}start(){if(this.isStopped){if(this.options.autoToggle){this.rootElement.style.removeProperty("overflow");return}this.internalStart()}}internalStart(){this.isStopped&&(this.reset(),this.isStopped=!1,this.emit())}stop(){if(!this.isStopped){if(this.options.autoToggle){this.rootElement.style.setProperty("overflow","clip");return}this.internalStop()}}internalStop(){this.isStopped||(this.reset(),this.isStopped=!0,this.emit())}scrollTo(t,{offset:e=0,immediate:n=!1,lock:i=!1,programmatic:r=!0,lerp:s=r?this.options.lerp:void 0,duration:a=r?this.options.duration:void 0,easing:o=r?this.options.easing:void 0,onStart:l,onComplete:u,force:h=!1,userData:p}={}){if(this.prefersReducedMotion&&(r?n=!0:(s=1,a=void 0,o=void 0)),(this.isStopped||this.isLocked)&&!h)return;let f=t,x=e;if(typeof f=="string"&&["top","left","start","#"].includes(f))f=0;else if(typeof f=="string"&&["bottom","right","end"].includes(f))f=this.limit;else{let _=null;if(typeof f=="string"?(_=f.startsWith("#")?document.getElementById(f.slice(1)):document.querySelector(f),_||(f==="#top"?f=0:console.warn("Lenis: Target not found",f))):f instanceof HTMLElement&&(f!=null&&f.nodeType)&&(_=f),_){if(this.options.wrapper!==window){const w=this.rootElement.getBoundingClientRect();x-=this.isHorizontal?w.left:w.top}const S=_.getBoundingClientRect(),m=getComputedStyle(_),d=this.isHorizontal?Number.parseFloat(m.scrollMarginLeft):Number.parseFloat(m.scrollMarginTop),g=getComputedStyle(this.rootElement),v=this.isHorizontal?Number.parseFloat(g.scrollPaddingLeft):Number.parseFloat(g.scrollPaddingTop);f=(this.isHorizontal?S.left:S.top)+this.animatedScroll-(Number.isNaN(d)?0:d)-(Number.isNaN(v)?0:v)}}if(typeof f=="number"){if(f+=x,this.options.infinite){if(r){this.targetScroll=this.animatedScroll=this.scroll;const _=f-this.animatedScroll;_>this.limit/2?f-=this.limit:_<-this.limit/2&&(f+=this.limit)}}else f=Hg(0,f,this.limit);if(f===this.targetScroll){l==null||l(this),u==null||u(this);return}if(this.userData=p??{},n){this.animatedScroll=this.targetScroll=f,this.setScroll(this.scroll),this.reset(),this.preventNextNativeScrollEvent(),this.emit(),u==null||u(this),this.userData={},requestAnimationFrame(()=>{this.dispatchScrollendEvent()});return}r||(this.targetScroll=f),typeof a=="number"&&typeof o!="function"?o=Mp:typeof o=="function"&&typeof a!="number"&&(a=1),this.animate.fromTo(this.animatedScroll,f,{duration:a,easing:o,lerp:s,onStart:()=>{i&&(this.isLocked=!0),this.isScrolling="smooth",l==null||l(this)},onUpdate:(_,S)=>{this.isScrolling="smooth",this.lastVelocity=this.velocity,this.velocity=_-this.animatedScroll,this.direction=Math.sign(this.velocity),this.animatedScroll=_,this.setScroll(this.scroll),r&&(this.targetScroll=_),S||this.emit(),S&&(this.reset(),this.emit(),u==null||u(this),this.userData={},requestAnimationFrame(()=>{this.dispatchScrollendEvent()}),this.preventNextNativeScrollEvent())}})}}preventNextNativeScrollEvent(){this._preventNextNativeScrollEvent=!0,requestAnimationFrame(()=>{this._preventNextNativeScrollEvent=!1})}hasNestedScroll(t,{deltaX:e,deltaY:n}){const i=Date.now();t._lenis||(t._lenis={});const r=t._lenis;let s,a,o,l,u,h,p,f,x,_;if(i-(r.time??0)>2e3){r.time=Date.now();const E=window.getComputedStyle(t);if(r.computedStyle=E,s=["auto","overlay","scroll"].includes(E.overflowX),a=["auto","overlay","scroll"].includes(E.overflowY),u=["auto"].includes(E.overscrollBehaviorX),h=["auto"].includes(E.overscrollBehaviorY),r.hasOverflowX=s,r.hasOverflowY=a,!(s||a))return!1;p=t.scrollWidth,f=t.scrollHeight,x=t.clientWidth,_=t.clientHeight,o=p>x,l=f>_,r.isScrollableX=o,r.isScrollableY=l,r.scrollWidth=p,r.scrollHeight=f,r.clientWidth=x,r.clientHeight=_,r.hasOverscrollBehaviorX=u,r.hasOverscrollBehaviorY=h}else o=r.isScrollableX,l=r.isScrollableY,s=r.hasOverflowX,a=r.hasOverflowY,p=r.scrollWidth,f=r.scrollHeight,x=r.clientWidth,_=r.clientHeight,u=r.hasOverscrollBehaviorX,h=r.hasOverscrollBehaviorY;if(!(s&&o||a&&l))return!1;const S=Math.abs(e)>=Math.abs(n)?"horizontal":"vertical";let m,d,g,v,w,N;if(S==="horizontal")m=Math.round(t.scrollLeft),d=p-x,g=e,v=s,w=o,N=u;else if(S==="vertical")m=Math.round(t.scrollTop),d=f-_,g=n,v=a,w=l,N=h;else return!1;return!N&&(m>=d||m<=0)?!0:(g>0?m<d:m>0)&&v&&w}get rootElement(){return this.options.wrapper===window?document.documentElement:this.options.wrapper}get limit(){return this.options.naiveDimensions?this.isHorizontal?this.rootElement.scrollWidth-this.rootElement.clientWidth:this.rootElement.scrollHeight-this.rootElement.clientHeight:this.dimensions.limit[this.isHorizontal?"x":"y"]}get isHorizontal(){return this.options.orientation==="horizontal"}get actualScroll(){const t=this.options.wrapper;return this.isHorizontal?t.scrollX??t.scrollLeft:t.scrollY??t.scrollTop}get scroll(){return this.options.infinite?fy(this.animatedScroll,this.limit):this.animatedScroll}get progress(){return this.limit===0?1:this.scroll/this.limit}get isScrolling(){return this._isScrolling}set isScrolling(t){this._isScrolling!==t&&(this._isScrolling=t,this.updateClassName())}get isStopped(){return this._isStopped}set isStopped(t){this._isStopped!==t&&(this._isStopped=t,this.updateClassName())}get isLocked(){return this._isLocked}set isLocked(t){this._isLocked!==t&&(this._isLocked=t,this.updateClassName())}get isSmooth(){return this.isScrolling==="smooth"}get prefersReducedMotion(){return this.options.respectReducedMotion&&this.reducedMotionMediaQuery.matches}get className(){let t="lenis";return this.options.autoToggle&&(t+=" lenis-autoToggle"),this.isStopped&&(t+=" lenis-stopped"),this.isLocked&&(t+=" lenis-locked"),this.isScrolling&&(t+=" lenis-scrolling"),this.isScrolling==="smooth"&&(t+=" lenis-smooth"),t}updateClassName(){this.cleanUpClassName(),this.className.split(" ").forEach(t=>{this.rootElement.classList.add(t)})}cleanUpClassName(){for(const t of Array.from(this.rootElement.classList))(t==="lenis"||t.startsWith("lenis-"))&&this.rootElement.classList.remove(t)}};/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const yy=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),Gg=(...t)=>t.filter((e,n,i)=>!!e&&e.trim()!==""&&i.indexOf(e)===n).join(" ").trim();/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var Sy={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const wy=le.forwardRef(({color:t="currentColor",size:e=24,strokeWidth:n=2,absoluteStrokeWidth:i,className:r="",children:s,iconNode:a,...o},l)=>le.createElement("svg",{ref:l,...Sy,width:e,height:e,stroke:t,strokeWidth:i?Number(n)*24/Number(e):n,className:Gg("lucide",r),...o},[...a.map(([u,h])=>le.createElement(u,h)),...Array.isArray(s)?s:[s]]));/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ie=(t,e)=>{const n=le.forwardRef(({className:i,...r},s)=>le.createElement(wy,{ref:s,iconNode:e,className:Gg(`lucide-${yy(t)}`,i),...r}));return n.displayName=`${t}`,n};/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const My=Ie("Activity",[["path",{d:"M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",key:"169zse"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Wg=Ie("Award",[["path",{d:"m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526",key:"1yiouv"}],["circle",{cx:"12",cy:"8",r:"6",key:"1vp47v"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ey=Ie("Baby",[["path",{d:"M9 12h.01",key:"157uk2"}],["path",{d:"M15 12h.01",key:"1k8ypt"}],["path",{d:"M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5",key:"1u7htd"}],["path",{d:"M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1",key:"5yv0yz"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ms=Ie("BookOpen",[["path",{d:"M12 7v14",key:"1akyts"}],["path",{d:"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",key:"ruj8y"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const by=Ie("Brain",[["path",{d:"M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z",key:"l5xja"}],["path",{d:"M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z",key:"ep3f8r"}],["path",{d:"M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4",key:"1p4c4q"}],["path",{d:"M17.599 6.5a3 3 0 0 0 .399-1.375",key:"tmeiqw"}],["path",{d:"M6.003 5.125A3 3 0 0 0 6.401 6.5",key:"105sqy"}],["path",{d:"M3.477 10.896a4 4 0 0 1 .585-.396",key:"ql3yin"}],["path",{d:"M19.938 10.5a4 4 0 0 1 .585.396",key:"1qfode"}],["path",{d:"M6 18a4 4 0 0 1-1.967-.516",key:"2e4loj"}],["path",{d:"M19.967 17.484A4 4 0 0 1 18 18",key:"159ez6"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ma=Ie("Briefcase",[["path",{d:"M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16",key:"jecpp"}],["rect",{width:"20",height:"14",x:"2",y:"6",rx:"2",key:"i6l2r4"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ty=Ie("Calendar",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ka=Ie("Check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ay=Ie("ChevronLeft",[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Xg=Ie("ChevronRight",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Cy=Ie("CircleAlert",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Qu=Ie("CircleCheck",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ry=Ie("CircleHelp",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3",key:"1u773s"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ny=Ie("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Es=Ie("Coins",[["circle",{cx:"8",cy:"8",r:"6",key:"3yglwk"}],["path",{d:"M18.09 10.37A6 6 0 1 1 10.34 18",key:"t5s6rm"}],["path",{d:"M7 6h1v4",key:"1obek4"}],["path",{d:"m16.71 13.88.7.71-2.82 2.82",key:"1rbuyh"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ju=Ie("Compass",[["path",{d:"m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z",key:"9ktpf1"}],["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const qg=Ie("Copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Py=Ie("CornerDownLeft",[["polyline",{points:"9 10 4 15 9 20",key:"r3jprv"}],["path",{d:"M20 4v7a4 4 0 0 1-4 4H4",key:"6o5b7l"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ly=Ie("ExternalLink",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Dy=Ie("Gamepad2",[["line",{x1:"6",x2:"10",y1:"11",y2:"11",key:"1gktln"}],["line",{x1:"8",x2:"8",y1:"9",y2:"13",key:"qnk9ow"}],["line",{x1:"15",x2:"15.01",y1:"12",y2:"12",key:"krot7o"}],["line",{x1:"18",x2:"18.01",y1:"10",y2:"10",key:"1lcuu1"}],["path",{d:"M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z",key:"mfqc10"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ed=Ie("Gift",[["rect",{x:"3",y:"8",width:"18",height:"4",rx:"1",key:"bkv52"}],["path",{d:"M12 8v13",key:"1c76mn"}],["path",{d:"M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7",key:"6wjy6b"}],["path",{d:"M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5",key:"1ihvrl"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ky=Ie("Globe",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",key:"13o1zl"}],["path",{d:"M2 12h20",key:"9i4pu4"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const vr=Ie("Heart",[["path",{d:"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",key:"c3ymky"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Iy=Ie("LayoutGrid",[["rect",{width:"7",height:"7",x:"3",y:"3",rx:"1",key:"1g98yp"}],["rect",{width:"7",height:"7",x:"14",y:"3",rx:"1",key:"6d4xhi"}],["rect",{width:"7",height:"7",x:"14",y:"14",rx:"1",key:"nxv5o0"}],["rect",{width:"7",height:"7",x:"3",y:"14",rx:"1",key:"1bb6yr"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Uy=Ie("Lock",[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Fy=Ie("Menu",[["line",{x1:"4",x2:"20",y1:"12",y2:"12",key:"1e0a9i"}],["line",{x1:"4",x2:"20",y1:"6",y2:"6",key:"1owob3"}],["line",{x1:"4",x2:"20",y1:"18",y2:"18",key:"yk5zj1"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Oy=Ie("MessageCircle",[["path",{d:"M7.9 20A9 9 0 1 0 4 16.1L2 22Z",key:"vv11sd"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const zy=Ie("MessageSquare",[["path",{d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",key:"1lielz"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const By=Ie("PenLine",[["path",{d:"M12 20h9",key:"t2du7b"}],["path",{d:"M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z",key:"1ykcvy"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const zh=Ie("Search",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ga=Ie("Share2",[["circle",{cx:"18",cy:"5",r:"3",key:"gq8acd"}],["circle",{cx:"6",cy:"12",r:"3",key:"w7nqdw"}],["circle",{cx:"18",cy:"19",r:"3",key:"1xt0gg"}],["line",{x1:"8.59",x2:"15.42",y1:"13.51",y2:"17.49",key:"47mynk"}],["line",{x1:"15.41",x2:"8.59",y1:"6.51",y2:"10.49",key:"1n3mei"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Yg=Ie("ShieldAlert",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"M12 8v4",key:"1got3b"}],["path",{d:"M12 16h.01",key:"1drbdi"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $g=Ie("ShieldCheck",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ep=Ie("Shield",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const jy=Ie("ShoppingBag",[["path",{d:"M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z",key:"hou9p0"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M16 10a4 4 0 0 1-8 0",key:"1ltviw"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Lt=Ie("Sparkles",[["path",{d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",key:"4pj2yx"}],["path",{d:"M20 3v4",key:"1olli1"}],["path",{d:"M22 5h-4",key:"1gvqau"}],["path",{d:"M4 17v2",key:"vumght"}],["path",{d:"M5 18H3",key:"zchphs"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Hy=Ie("Tag",[["path",{d:"M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z",key:"vktsd0"}],["circle",{cx:"7.5",cy:"7.5",r:".5",fill:"currentColor",key:"kqv944"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xi=Ie("Terminal",[["polyline",{points:"4 17 10 11 4 5",key:"akl6gq"}],["line",{x1:"12",x2:"20",y1:"19",y2:"19",key:"q2wloq"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Vy=Ie("Trash2",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Gy=Ie("TreePine",[["path",{d:"m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z",key:"cpyugq"}],["path",{d:"M12 22v-3",key:"kmzjlo"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Kg=Ie("User",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Wy=Ie("Vault",[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["circle",{cx:"7.5",cy:"7.5",r:".5",fill:"currentColor",key:"kqv944"}],["path",{d:"m7.9 7.9 2.7 2.7",key:"hpeyl3"}],["circle",{cx:"16.5",cy:"7.5",r:".5",fill:"currentColor",key:"w0ekpg"}],["path",{d:"m13.4 10.6 2.7-2.7",key:"264c1n"}],["circle",{cx:"7.5",cy:"16.5",r:".5",fill:"currentColor",key:"nkw3mc"}],["path",{d:"m7.9 16.1 2.7-2.7",key:"p81g5e"}],["circle",{cx:"16.5",cy:"16.5",r:".5",fill:"currentColor",key:"fubopw"}],["path",{d:"m13.4 13.4 2.7 2.7",key:"abhel3"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Xy=Ie("Volume2",[["path",{d:"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",key:"uqj9uw"}],["path",{d:"M16 9a5 5 0 0 1 0 6",key:"1q6k2b"}],["path",{d:"M19.364 18.364a9 9 0 0 0 0-12.728",key:"ijwkga"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const qy=Ie("VolumeX",[["path",{d:"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",key:"uqj9uw"}],["line",{x1:"22",x2:"16",y1:"9",y2:"15",key:"1ewh16"}],["line",{x1:"16",x2:"22",y1:"9",y2:"15",key:"5ykzw1"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const bs=Ie("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Yy=Ie("Zap",[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",key:"1xq2db"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $y=Ie("ZoomIn",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["line",{x1:"21",x2:"16.65",y1:"21",y2:"16.65",key:"13gj7c"}],["line",{x1:"11",x2:"11",y1:"8",y2:"14",key:"1vmskp"}],["line",{x1:"8",x2:"14",y1:"11",y2:"11",key:"durymu"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ky=Ie("ZoomOut",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["line",{x1:"21",x2:"16.65",y1:"21",y2:"16.65",key:"13gj7c"}],["line",{x1:"8",x2:"14",y1:"11",y2:"11",key:"durymu"}]]);function Zy({lang:t,setLang:e,t:n}){const[i,r]=le.useState(!1),s=()=>{const a=t==="pt"?"en":"pt";e(a),localStorage.setItem("pyxie_lang",a);const o=new URL(window.location.href);o.searchParams.set("lang",a),window.history.replaceState({},"",o)};return c.jsxs("header",{className:"sticky top-0 z-50 w-full bg-[#080410]/80 backdrop-blur-2xl border-b border-purple-500/15 transition-all",children:[c.jsxs("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between",children:[c.jsxs("a",{href:"/",className:"flex items-center gap-3 group",children:[c.jsxs("div",{className:"relative",children:[c.jsx("img",{src:"/assets/pyxie/pyxie_pixelart_face.png",alt:"Pyxie Mascot",className:"w-10 h-10 object-contain rounded-xl border border-pink-500/30 group-hover:border-pink-500/60 transition-all shadow-neon-pink"}),c.jsx("span",{className:"absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#080410] animate-pulse"})]}),c.jsxs("div",{className:"flex flex-col",children:[c.jsx("span",{className:"font-title font-extrabold text-xl tracking-tight text-white group-hover:text-pink-400 transition-colors",children:"Pyxie"}),c.jsx("span",{className:"text-[10px] font-mono font-medium text-purple-300/70 tracking-wider uppercase",children:"Discord.js v14"})]})]}),c.jsxs("nav",{className:"hidden md:flex items-center gap-1.5 lg:gap-2",children:[c.jsx("a",{href:"/#pilares",className:"px-3 py-1.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all",children:n("nav.features")}),c.jsxs("a",{href:"/#comandos",className:"px-3 py-1.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5",children:[c.jsx(xi,{className:"w-3.5 h-3.5 text-pink-400"}),n("nav.commands")]}),c.jsxs("a",{href:"/wiki",className:"px-3 py-1.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5",children:[c.jsx(Ms,{className:"w-3.5 h-3.5 text-purple-400"}),n("nav.wiki")]}),c.jsxs("a",{href:"/museu",className:"px-3 py-1.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5",children:[c.jsx(Lt,{className:"w-3.5 h-3.5 text-pink-400"}),n("nav.museum")]}),c.jsxs("a",{href:"/bonus",className:"px-3 py-1.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5",children:[c.jsx(ed,{className:"w-3.5 h-3.5 text-amber-400"}),n("nav.bonus"),c.jsx("span",{className:"ml-1 text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30",children:"10s"})]}),c.jsx("a",{href:"/discord",target:"_blank",rel:"noopener noreferrer",className:"px-3 py-1.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all",children:n("nav.support")})]}),c.jsxs("div",{className:"flex items-center gap-3",children:[c.jsxs("button",{onClick:s,className:"px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-purple-500/20 hover:border-purple-500/40 transition-all flex items-center gap-1.5",title:"Switch Language / Alternar Idioma",children:[c.jsx(ky,{className:"w-3.5 h-3.5 text-pink-400"}),c.jsx("span",{children:t==="pt"?"PT-BR":"EN"})]}),c.jsxs("a",{href:"/invite",target:"_blank",rel:"noopener noreferrer",className:"hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 shadow-neon-pink transition-all transform hover:-translate-y-0.5 active:translate-y-0",children:[c.jsx(Lt,{className:"w-4 h-4 text-pink-200"}),c.jsx("span",{children:n("nav.invite")})]}),c.jsx("button",{onClick:()=>r(!i),className:"md:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-white/5 border border-purple-500/20","aria-label":"Toggle menu",children:i?c.jsx(bs,{className:"w-5 h-5"}):c.jsx(Fy,{className:"w-5 h-5"})})]})]}),i&&c.jsxs("div",{className:"md:hidden bg-[#080410]/95 backdrop-blur-2xl border-b border-purple-500/20 px-4 pt-3 pb-6 flex flex-col gap-2 animate-fadeIn",children:[c.jsx("a",{href:"/#pilares",onClick:()=>r(!1),className:"px-4 py-2.5 rounded-xl text-base font-semibold text-slate-200 hover:bg-white/5",children:n("nav.features")}),c.jsxs("a",{href:"/#comandos",onClick:()=>r(!1),className:"px-4 py-2.5 rounded-xl text-base font-semibold text-slate-200 hover:bg-white/5 flex items-center justify-between",children:[c.jsx("span",{children:n("nav.commands")}),c.jsx(xi,{className:"w-4 h-4 text-pink-400"})]}),c.jsxs("a",{href:"/wiki",onClick:()=>r(!1),className:"px-4 py-2.5 rounded-xl text-base font-semibold text-slate-200 hover:bg-white/5 flex items-center justify-between",children:[c.jsx("span",{children:n("nav.wiki")}),c.jsx(Ms,{className:"w-4 h-4 text-purple-400"})]}),c.jsxs("a",{href:"/museu",onClick:()=>r(!1),className:"px-4 py-2.5 rounded-xl text-base font-semibold text-slate-200 hover:bg-white/5 flex items-center justify-between",children:[c.jsx("span",{children:n("nav.museum")}),c.jsx(Lt,{className:"w-4 h-4 text-pink-400"})]}),c.jsxs("a",{href:"/bonus",onClick:()=>r(!1),className:"px-4 py-2.5 rounded-xl text-base font-semibold text-slate-200 hover:bg-white/5 flex items-center justify-between",children:[c.jsx("span",{children:n("nav.bonus")}),c.jsx(ed,{className:"w-4 h-4 text-amber-400"})]}),c.jsx("a",{href:"/discord",target:"_blank",rel:"noopener noreferrer",className:"px-4 py-2.5 rounded-xl text-base font-semibold text-slate-200 hover:bg-white/5",children:n("nav.support")}),c.jsx("div",{className:"pt-2 border-t border-purple-500/15 flex flex-col gap-2",children:c.jsx("a",{href:"/invite",target:"_blank",rel:"noopener noreferrer",className:"w-full text-center py-3 rounded-xl font-bold text-white bg-gradient-to-r from-pink-600 to-purple-600 shadow-neon-pink",children:n("nav.invite")})})]})]})}function Qy({t}){return c.jsx("footer",{className:"w-full bg-[#06030c] border-t border-purple-500/15 py-12 px-4 sm:px-6 lg:px-8 mt-20",children:c.jsxs("div",{className:"max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left",children:[c.jsxs("div",{className:"flex items-center gap-3",children:[c.jsx("img",{src:"/assets/pyxie/pyxie_pixelart_face.png",alt:"Pyxie Mascot Mini",className:"w-8 h-8 rounded-lg border border-purple-500/30"}),c.jsxs("div",{children:[c.jsx("span",{className:"font-title font-bold text-white text-base",children:"Pyxie"}),c.jsx("p",{className:"text-xs text-slate-400",children:t("footer.rights")})]})]}),c.jsxs("div",{className:"flex flex-wrap items-center justify-center gap-5 text-sm font-medium text-slate-300",children:[c.jsx("a",{href:"/wiki",className:"hover:text-pink-400 transition-colors",children:t("footer.wiki")}),c.jsx("a",{href:"/museu",className:"hover:text-pink-400 transition-colors",children:t("footer.museum")}),c.jsx("a",{href:"/bonus",className:"hover:text-pink-400 transition-colors",children:t("footer.bonus")}),c.jsxs("a",{href:"/termos",className:"hover:text-pink-400 transition-colors flex items-center gap-1.5",children:[c.jsx($g,{className:"w-3.5 h-3.5 text-purple-400"}),t("footer.terms")]}),c.jsx("a",{href:"/promo",target:"_blank",rel:"noopener noreferrer",className:"hover:text-pink-400 transition-colors",children:"Shopee"}),c.jsx("a",{href:"/discord",target:"_blank",rel:"noopener noreferrer",className:"hover:text-pink-400 transition-colors",children:"Discord"})]})]})})}function Jy({t}){const[e,n]=le.useState("work"),[i,r]=le.useState(null),[s,a]=le.useState(""),[o,l]=le.useState(!1);return le.useEffect(()=>{if(e==="tarot"){const u=t("terminal.tarotDesc");let h=0;a(""),l(!1);const p=setInterval(()=>{h<u.length?(a(u.slice(0,h+1)),h++):(l(!0),clearInterval(p))},25);return()=>clearInterval(p)}},[e,t]),c.jsxs("div",{className:"w-full max-w-xl mx-auto rounded-2xl glass-panel border border-purple-500/25 overflow-hidden shadow-2xl backdrop-blur-2xl",children:[c.jsxs("div",{className:"px-4 py-3 bg-[#0d071b]/90 border-b border-purple-500/15 flex items-center justify-between",children:[c.jsxs("div",{className:"flex items-center gap-2",children:[c.jsx("span",{className:"w-3 h-3 rounded-full bg-rose-500 inline-block"}),c.jsx("span",{className:"w-3 h-3 rounded-full bg-amber-500 inline-block"}),c.jsx("span",{className:"w-3 h-3 rounded-full bg-emerald-500 inline-block"}),c.jsxs("span",{className:"ml-2 font-mono text-xs text-purple-300/60 font-semibold flex items-center gap-1.5",children:[c.jsx(xi,{className:"w-3.5 h-3.5 text-pink-400"})," pyxie-simulator@discord:~"]})]}),c.jsxs("div",{className:"flex items-center gap-1",children:[c.jsx("span",{className:"w-2 h-2 rounded-full bg-emerald-400 animate-ping"}),c.jsx("span",{className:"text-[10px] font-mono text-emerald-300 font-bold",children:"READY"})]})]}),c.jsxs("div",{className:"flex border-b border-purple-500/15 bg-[#0a0515]/60 px-2 pt-2 gap-1 overflow-x-auto",children:[c.jsxs("button",{onClick:()=>{n("work"),r(null)},className:`px-3 py-1.5 rounded-t-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${e==="work"?"bg-[#180d2d] text-pink-300 border-t-2 border-pink-500":"text-slate-400 hover:text-white hover:bg-white/5"}`,children:[c.jsx(ma,{className:"w-3 h-3 text-pink-400"}),t("terminal.tabWork")]}),c.jsxs("button",{onClick:()=>n("marriage"),className:`px-3 py-1.5 rounded-t-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${e==="marriage"?"bg-[#180d2d] text-purple-300 border-t-2 border-purple-500":"text-slate-400 hover:text-white hover:bg-white/5"}`,children:[c.jsx(vr,{className:"w-3 h-3 text-rose-400"}),t("terminal.tabMarriage")]}),c.jsxs("button",{onClick:()=>n("tarot"),className:`px-3 py-1.5 rounded-t-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${e==="tarot"?"bg-[#180d2d] text-cyan-300 border-t-2 border-cyan-400":"text-slate-400 hover:text-white hover:bg-white/5"}`,children:[c.jsx(Lt,{className:"w-3 h-3 text-cyan-400"}),t("terminal.tabTarot")]})]}),c.jsxs("div",{className:"p-5 font-mono text-xs sm:text-sm min-h-[260px] flex flex-col justify-between bg-gradient-to-b from-[#120824]/90 to-[#0a0416]/95",children:[e==="work"&&c.jsxs("div",{className:"space-y-3 animate-fadeIn",children:[c.jsxs("div",{className:"text-pink-400 font-bold flex items-center gap-2",children:[c.jsx("span",{className:"text-slate-500",children:"$"})," /py-work"]}),c.jsx("div",{className:"text-slate-200 font-semibold",children:t("terminal.workTitle")}),c.jsx("p",{className:"text-slate-400 text-xs leading-relaxed",children:t("terminal.workDesc")}),c.jsx("div",{className:"space-y-2 pt-1",children:[{id:1,label:t("terminal.opt1")},{id:2,label:t("terminal.opt2")},{id:3,label:t("terminal.opt3")}].map(u=>c.jsxs("button",{onClick:()=>r(u.id),className:`w-full text-left px-3 py-2 rounded-xl border text-xs transition-all flex items-center justify-between ${i===u.id?"bg-pink-500/20 border-pink-500 text-white shadow-neon-pink":"bg-white/5 border-purple-500/20 text-slate-300 hover:bg-white/10 hover:border-pink-500/40"}`,children:[c.jsx("span",{children:u.label}),i===u.id&&c.jsx(Qu,{className:"w-4 h-4 text-emerald-400"})]},u.id))}),i&&c.jsxs("div",{className:"mt-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold animate-scaleIn flex items-center gap-2",children:[c.jsx(Es,{className:"w-4 h-4 text-amber-400 shrink-0"}),c.jsx("span",{children:t("terminal.workResult")})]})]}),e==="marriage"&&c.jsxs("div",{className:"space-y-4 animate-fadeIn",children:[c.jsxs("div",{className:"text-purple-400 font-bold flex items-center gap-2",children:[c.jsx("span",{className:"text-slate-500",children:"$"})," /py-casamento status"]}),c.jsxs("div",{className:"text-slate-200 font-bold flex items-center gap-2",children:[c.jsx("span",{children:t("terminal.marriageTitle")}),c.jsx("span",{className:"text-rose-400 animate-pulse",children:"💖"})]}),c.jsxs("div",{children:[c.jsxs("div",{className:"flex justify-between text-xs font-semibold text-rose-300 mb-1",children:[c.jsx("span",{children:t("terminal.loveBar")}),c.jsx("span",{children:"100%"})]}),c.jsx("div",{className:"w-full h-3 bg-purple-950/80 rounded-full overflow-hidden border border-purple-500/30 p-0.5",children:c.jsx("div",{className:"h-full bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 rounded-full animate-pulse w-full"})})]}),c.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs",children:[c.jsx("div",{className:"p-2.5 rounded-xl bg-white/5 border border-purple-500/20 text-slate-300",children:t("terminal.loveTree")}),c.jsx("div",{className:"p-2.5 rounded-xl bg-white/5 border border-purple-500/20 text-amber-300",children:t("terminal.loveVault")})]})]}),e==="tarot"&&c.jsxs("div",{className:"space-y-3 animate-fadeIn",children:[c.jsxs("div",{className:"text-cyan-400 font-bold flex items-center gap-2",children:[c.jsx("span",{className:"text-slate-500",children:"$"})," /py-tarot daily"]}),c.jsxs("div",{className:"text-amber-300 font-bold flex items-center gap-2",children:[c.jsx("span",{children:t("terminal.tarotTitle")}),c.jsx("span",{className:"text-cyan-300",children:"✦"})]}),c.jsxs("div",{className:"p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 space-y-2",children:[c.jsxs("div",{className:"text-pink-400 font-bold text-sm tracking-wide",children:["🔮 ",t("terminal.tarotCard")]}),c.jsxs("p",{className:"text-slate-300 text-xs italic leading-relaxed min-h-[48px]",children:[s,!o&&c.jsx("span",{className:"inline-block w-1.5 h-3.5 bg-pink-400 ml-1 animate-pulse"})]})]})]}),c.jsxs("div",{className:"pt-3 border-t border-purple-500/10 text-[11px] text-slate-500 flex justify-between items-center",children:[c.jsx("span",{children:"Pyxie Discord Engine v14"}),c.jsx("span",{className:"text-purple-400/80 font-semibold",children:"100% Interativo"})]})]})]})}function e1({t,stats:e}){return c.jsxs("section",{className:"relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden",children:[c.jsx("div",{className:"absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none"}),c.jsx("div",{className:"absolute top-1/3 right-10 w-[450px] h-[450px] bg-pink-600/15 rounded-full blur-[130px] pointer-events-none"}),c.jsx("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10",children:c.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center",children:[c.jsxs("div",{className:"lg:col-span-7 text-center lg:text-left space-y-6",children:[c.jsxs("div",{className:"inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wide shadow-sm",children:[c.jsx("span",{className:"w-2 h-2 rounded-full bg-emerald-400 animate-ping"}),c.jsx("span",{children:t("hero.badge")})]}),c.jsxs("h1",{className:"font-title font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.12]",children:[c.jsx("span",{className:"text-white",children:"Pyxie"})," •"," ",c.jsx("span",{className:"text-slate-200",children:t("hero.titlePrefix")})," ",c.jsx("span",{className:"gradient-text-pink",children:t("hero.titleHighlight")})]}),c.jsx("p",{className:"text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal",children:t("hero.subtitle")}),c.jsxs("div",{className:"flex flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-2",children:[c.jsxs("div",{className:"flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-amber-500/25 text-xs font-semibold text-amber-300",children:[c.jsx(Es,{className:"w-4 h-4 text-amber-400"}),c.jsx("span",{children:t("hero.badgeEconomy")})]}),c.jsxs("div",{className:"flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-purple-500/25 text-xs font-semibold text-purple-300",children:[c.jsx(ma,{className:"w-4 h-4 text-purple-400"}),c.jsx("span",{children:t("hero.badgeCareers")})]}),c.jsxs("div",{className:"flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-emerald-500/25 text-xs font-semibold text-emerald-300",children:[c.jsx(My,{className:"w-4 h-4 text-emerald-400"}),c.jsx("span",{children:(e==null?void 0:e.uptime)||"99.9% Uptime"})]})]}),c.jsxs("div",{className:"flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4",children:[c.jsxs("a",{href:"/invite",target:"_blank",rel:"noopener noreferrer",className:"w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-extrabold text-white bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 shadow-neon-pink transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3 border border-pink-400/30",children:[c.jsx(Lt,{className:"w-5 h-5 text-pink-200"}),c.jsx("span",{children:t("hero.btnInvite")})]}),c.jsxs("a",{href:"/discord",target:"_blank",rel:"noopener noreferrer",className:"w-full sm:w-auto px-7 py-4 rounded-2xl text-base font-bold text-slate-200 bg-white/5 hover:bg-white/10 border border-purple-500/30 hover:border-purple-500/60 transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2.5 backdrop-blur-xl",children:[c.jsx(Oy,{className:"w-5 h-5 text-purple-400"}),c.jsx("span",{children:t("hero.btnSupport")})]})]})]}),c.jsx("div",{className:"lg:col-span-5 flex justify-center",children:c.jsx(Jy,{t})})]})})]})}/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Bh="169",t1=0,bp=1,n1=2,Zg=1,i1=2,si=3,$i=0,qt=1,zn=2,Wi=0,fs=1,td=2,Tp=3,Ap=4,r1=5,fr=100,s1=101,a1=102,o1=103,l1=104,c1=200,u1=201,d1=202,h1=203,nd=204,id=205,f1=206,p1=207,m1=208,g1=209,x1=210,v1=211,_1=212,y1=213,S1=214,rd=0,sd=1,ad=2,Ts=3,od=4,ld=5,cd=6,ud=7,Qg=0,w1=1,M1=2,Xi=0,E1=1,b1=2,T1=3,A1=4,C1=5,R1=6,N1=7,Jg=300,As=301,Cs=302,dd=303,hd=304,Xl=306,fd=1e3,_r=1001,pd=1002,bn=1003,P1=1004,fo=1005,Mn=1006,Tc=1007,yr=1008,vi=1009,ex=1010,tx=1011,Ia=1012,jh=1013,Cr=1014,ui=1015,Ha=1016,Hh=1017,Vh=1018,Rs=1020,nx=35902,ix=1021,rx=1022,jn=1023,sx=1024,ax=1025,ps=1026,Ns=1027,ox=1028,Gh=1029,lx=1030,Wh=1031,Xh=1033,Yo=33776,$o=33777,Ko=33778,Zo=33779,md=35840,gd=35841,xd=35842,vd=35843,_d=36196,yd=37492,Sd=37496,wd=37808,Md=37809,Ed=37810,bd=37811,Td=37812,Ad=37813,Cd=37814,Rd=37815,Nd=37816,Pd=37817,Ld=37818,Dd=37819,kd=37820,Id=37821,Qo=36492,Ud=36494,Fd=36495,cx=36283,Od=36284,zd=36285,Bd=36286,L1=3200,D1=3201,ux=0,k1=1,ki="",qn="srgb",er="srgb-linear",qh="display-p3",ql="display-p3-linear",bl="linear",ct="srgb",Tl="rec709",Al="p3",kr=7680,Cp=519,I1=512,U1=513,F1=514,dx=515,O1=516,z1=517,B1=518,j1=519,Rp=35044,Np="300 es",di=2e3,Cl=2001;class Us{addEventListener(e,n){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(n)===-1&&i[e].push(n)}hasEventListener(e,n){if(this._listeners===void 0)return!1;const i=this._listeners;return i[e]!==void 0&&i[e].indexOf(n)!==-1}removeEventListener(e,n){if(this._listeners===void 0)return;const r=this._listeners[e];if(r!==void 0){const s=r.indexOf(n);s!==-1&&r.splice(s,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const i=this._listeners[e.type];if(i!==void 0){e.target=this;const r=i.slice(0);for(let s=0,a=r.length;s<a;s++)r[s].call(this,e);e.target=null}}}const Ft=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Ac=Math.PI/180,jd=180/Math.PI;function Va(){const t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Ft[t&255]+Ft[t>>8&255]+Ft[t>>16&255]+Ft[t>>24&255]+"-"+Ft[e&255]+Ft[e>>8&255]+"-"+Ft[e>>16&15|64]+Ft[e>>24&255]+"-"+Ft[n&63|128]+Ft[n>>8&255]+"-"+Ft[n>>16&255]+Ft[n>>24&255]+Ft[i&255]+Ft[i>>8&255]+Ft[i>>16&255]+Ft[i>>24&255]).toLowerCase()}function nn(t,e,n){return Math.max(e,Math.min(n,t))}function H1(t,e){return(t%e+e)%e}function Cc(t,e,n){return(1-n)*t+n*e}function qs(t,e){switch(e.constructor){case Float32Array:return t;case Uint32Array:return t/4294967295;case Uint16Array:return t/65535;case Uint8Array:return t/255;case Int32Array:return Math.max(t/2147483647,-1);case Int16Array:return Math.max(t/32767,-1);case Int8Array:return Math.max(t/127,-1);default:throw new Error("Invalid component type.")}}function en(t,e){switch(e.constructor){case Float32Array:return t;case Uint32Array:return Math.round(t*4294967295);case Uint16Array:return Math.round(t*65535);case Uint8Array:return Math.round(t*255);case Int32Array:return Math.round(t*2147483647);case Int16Array:return Math.round(t*32767);case Int8Array:return Math.round(t*127);default:throw new Error("Invalid component type.")}}class Ye{constructor(e=0,n=0){Ye.prototype.isVector2=!0,this.x=e,this.y=n}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,n){return this.x=e,this.y=n,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const n=this.x,i=this.y,r=e.elements;return this.x=r[0]*n+r[3]*i+r[6],this.y=r[1]*n+r[4]*i+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,n){return this.x=Math.max(e.x,Math.min(n.x,this.x)),this.y=Math.max(e.y,Math.min(n.y,this.y)),this}clampScalar(e,n){return this.x=Math.max(e,Math.min(n,this.x)),this.y=Math.max(e,Math.min(n,this.y)),this}clampLength(e,n){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(n,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const n=Math.sqrt(this.lengthSq()*e.lengthSq());if(n===0)return Math.PI/2;const i=this.dot(e)/n;return Math.acos(nn(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const n=this.x-e.x,i=this.y-e.y;return n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this}lerpVectors(e,n,i){return this.x=e.x+(n.x-e.x)*i,this.y=e.y+(n.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this}rotateAround(e,n){const i=Math.cos(n),r=Math.sin(n),s=this.x-e.x,a=this.y-e.y;return this.x=s*i-a*r+e.x,this.y=s*r+a*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Be{constructor(e,n,i,r,s,a,o,l,u){Be.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,n,i,r,s,a,o,l,u)}set(e,n,i,r,s,a,o,l,u){const h=this.elements;return h[0]=e,h[1]=r,h[2]=o,h[3]=n,h[4]=s,h[5]=l,h[6]=i,h[7]=a,h[8]=u,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const n=this.elements,i=e.elements;return n[0]=i[0],n[1]=i[1],n[2]=i[2],n[3]=i[3],n[4]=i[4],n[5]=i[5],n[6]=i[6],n[7]=i[7],n[8]=i[8],this}extractBasis(e,n,i){return e.setFromMatrix3Column(this,0),n.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const n=e.elements;return this.set(n[0],n[4],n[8],n[1],n[5],n[9],n[2],n[6],n[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,n){const i=e.elements,r=n.elements,s=this.elements,a=i[0],o=i[3],l=i[6],u=i[1],h=i[4],p=i[7],f=i[2],x=i[5],_=i[8],S=r[0],m=r[3],d=r[6],g=r[1],v=r[4],w=r[7],N=r[2],E=r[5],A=r[8];return s[0]=a*S+o*g+l*N,s[3]=a*m+o*v+l*E,s[6]=a*d+o*w+l*A,s[1]=u*S+h*g+p*N,s[4]=u*m+h*v+p*E,s[7]=u*d+h*w+p*A,s[2]=f*S+x*g+_*N,s[5]=f*m+x*v+_*E,s[8]=f*d+x*w+_*A,this}multiplyScalar(e){const n=this.elements;return n[0]*=e,n[3]*=e,n[6]*=e,n[1]*=e,n[4]*=e,n[7]*=e,n[2]*=e,n[5]*=e,n[8]*=e,this}determinant(){const e=this.elements,n=e[0],i=e[1],r=e[2],s=e[3],a=e[4],o=e[5],l=e[6],u=e[7],h=e[8];return n*a*h-n*o*u-i*s*h+i*o*l+r*s*u-r*a*l}invert(){const e=this.elements,n=e[0],i=e[1],r=e[2],s=e[3],a=e[4],o=e[5],l=e[6],u=e[7],h=e[8],p=h*a-o*u,f=o*l-h*s,x=u*s-a*l,_=n*p+i*f+r*x;if(_===0)return this.set(0,0,0,0,0,0,0,0,0);const S=1/_;return e[0]=p*S,e[1]=(r*u-h*i)*S,e[2]=(o*i-r*a)*S,e[3]=f*S,e[4]=(h*n-r*l)*S,e[5]=(r*s-o*n)*S,e[6]=x*S,e[7]=(i*l-u*n)*S,e[8]=(a*n-i*s)*S,this}transpose(){let e;const n=this.elements;return e=n[1],n[1]=n[3],n[3]=e,e=n[2],n[2]=n[6],n[6]=e,e=n[5],n[5]=n[7],n[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const n=this.elements;return e[0]=n[0],e[1]=n[3],e[2]=n[6],e[3]=n[1],e[4]=n[4],e[5]=n[7],e[6]=n[2],e[7]=n[5],e[8]=n[8],this}setUvTransform(e,n,i,r,s,a,o){const l=Math.cos(s),u=Math.sin(s);return this.set(i*l,i*u,-i*(l*a+u*o)+a+e,-r*u,r*l,-r*(-u*a+l*o)+o+n,0,0,1),this}scale(e,n){return this.premultiply(Rc.makeScale(e,n)),this}rotate(e){return this.premultiply(Rc.makeRotation(-e)),this}translate(e,n){return this.premultiply(Rc.makeTranslation(e,n)),this}makeTranslation(e,n){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,n,0,0,1),this}makeRotation(e){const n=Math.cos(e),i=Math.sin(e);return this.set(n,-i,0,i,n,0,0,0,1),this}makeScale(e,n){return this.set(e,0,0,0,n,0,0,0,1),this}equals(e){const n=this.elements,i=e.elements;for(let r=0;r<9;r++)if(n[r]!==i[r])return!1;return!0}fromArray(e,n=0){for(let i=0;i<9;i++)this.elements[i]=e[i+n];return this}toArray(e=[],n=0){const i=this.elements;return e[n]=i[0],e[n+1]=i[1],e[n+2]=i[2],e[n+3]=i[3],e[n+4]=i[4],e[n+5]=i[5],e[n+6]=i[6],e[n+7]=i[7],e[n+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const Rc=new Be;function hx(t){for(let e=t.length-1;e>=0;--e)if(t[e]>=65535)return!0;return!1}function Ua(t){return document.createElementNS("http://www.w3.org/1999/xhtml",t)}function V1(){const t=Ua("canvas");return t.style.display="block",t}const Pp={};function Jo(t){t in Pp||(Pp[t]=!0,console.warn(t))}function G1(t,e,n){return new Promise(function(i,r){function s(){switch(t.clientWaitSync(e,t.SYNC_FLUSH_COMMANDS_BIT,0)){case t.WAIT_FAILED:r();break;case t.TIMEOUT_EXPIRED:setTimeout(s,n);break;default:i()}}setTimeout(s,n)})}function W1(t){const e=t.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function X1(t){const e=t.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const Lp=new Be().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),Dp=new Be().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),Ys={[er]:{transfer:bl,primaries:Tl,luminanceCoefficients:[.2126,.7152,.0722],toReference:t=>t,fromReference:t=>t},[qn]:{transfer:ct,primaries:Tl,luminanceCoefficients:[.2126,.7152,.0722],toReference:t=>t.convertSRGBToLinear(),fromReference:t=>t.convertLinearToSRGB()},[ql]:{transfer:bl,primaries:Al,luminanceCoefficients:[.2289,.6917,.0793],toReference:t=>t.applyMatrix3(Dp),fromReference:t=>t.applyMatrix3(Lp)},[qh]:{transfer:ct,primaries:Al,luminanceCoefficients:[.2289,.6917,.0793],toReference:t=>t.convertSRGBToLinear().applyMatrix3(Dp),fromReference:t=>t.applyMatrix3(Lp).convertLinearToSRGB()}},q1=new Set([er,ql]),tt={enabled:!0,_workingColorSpace:er,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(t){if(!q1.has(t))throw new Error(`Unsupported working color space, "${t}".`);this._workingColorSpace=t},convert:function(t,e,n){if(this.enabled===!1||e===n||!e||!n)return t;const i=Ys[e].toReference,r=Ys[n].fromReference;return r(i(t))},fromWorkingColorSpace:function(t,e){return this.convert(t,this._workingColorSpace,e)},toWorkingColorSpace:function(t,e){return this.convert(t,e,this._workingColorSpace)},getPrimaries:function(t){return Ys[t].primaries},getTransfer:function(t){return t===ki?bl:Ys[t].transfer},getLuminanceCoefficients:function(t,e=this._workingColorSpace){return t.fromArray(Ys[e].luminanceCoefficients)}};function ms(t){return t<.04045?t*.0773993808:Math.pow(t*.9478672986+.0521327014,2.4)}function Nc(t){return t<.0031308?t*12.92:1.055*Math.pow(t,.41666)-.055}let Ir;class Y1{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Ir===void 0&&(Ir=Ua("canvas")),Ir.width=e.width,Ir.height=e.height;const i=Ir.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),n=Ir}return n.width>2048||n.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),n.toDataURL("image/jpeg",.6)):n.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const n=Ua("canvas");n.width=e.width,n.height=e.height;const i=n.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const r=i.getImageData(0,0,e.width,e.height),s=r.data;for(let a=0;a<s.length;a++)s[a]=ms(s[a]/255)*255;return i.putImageData(r,0,0),n}else if(e.data){const n=e.data.slice(0);for(let i=0;i<n.length;i++)n instanceof Uint8Array||n instanceof Uint8ClampedArray?n[i]=Math.floor(ms(n[i]/255)*255):n[i]=ms(n[i]);return{data:n,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let $1=0;class fx{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:$1++}),this.uuid=Va(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const n=e===void 0||typeof e=="string";if(!n&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let a=0,o=r.length;a<o;a++)r[a].isDataTexture?s.push(Pc(r[a].image)):s.push(Pc(r[a]))}else s=Pc(r);i.url=s}return n||(e.images[this.uuid]=i),i}}function Pc(t){return typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap?Y1.getDataURL(t):t.data?{data:Array.from(t.data),width:t.width,height:t.height,type:t.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let K1=0;class Yt extends Us{constructor(e=Yt.DEFAULT_IMAGE,n=Yt.DEFAULT_MAPPING,i=_r,r=_r,s=Mn,a=yr,o=jn,l=vi,u=Yt.DEFAULT_ANISOTROPY,h=ki){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:K1++}),this.uuid=Va(),this.name="",this.source=new fx(e),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=i,this.wrapT=r,this.magFilter=s,this.minFilter=a,this.anisotropy=u,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Ye(0,0),this.repeat=new Ye(1,1),this.center=new Ye(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Be,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const n=e===void 0||typeof e=="string";if(!n&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),n||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Jg)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case fd:e.x=e.x-Math.floor(e.x);break;case _r:e.x=e.x<0?0:1;break;case pd:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case fd:e.y=e.y-Math.floor(e.y);break;case _r:e.y=e.y<0?0:1;break;case pd:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Yt.DEFAULT_IMAGE=null;Yt.DEFAULT_MAPPING=Jg;Yt.DEFAULT_ANISOTROPY=1;class st{constructor(e=0,n=0,i=0,r=1){st.prototype.isVector4=!0,this.x=e,this.y=n,this.z=i,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,n,i,r){return this.x=e,this.y=n,this.z=i,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;case 3:this.w=n;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this.z=e.z+n.z,this.w=e.w+n.w,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this.z+=e.z*n,this.w+=e.w*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this.z=e.z-n.z,this.w=e.w-n.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const n=this.x,i=this.y,r=this.z,s=this.w,a=e.elements;return this.x=a[0]*n+a[4]*i+a[8]*r+a[12]*s,this.y=a[1]*n+a[5]*i+a[9]*r+a[13]*s,this.z=a[2]*n+a[6]*i+a[10]*r+a[14]*s,this.w=a[3]*n+a[7]*i+a[11]*r+a[15]*s,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const n=Math.sqrt(1-e.w*e.w);return n<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/n,this.y=e.y/n,this.z=e.z/n),this}setAxisAngleFromRotationMatrix(e){let n,i,r,s;const l=e.elements,u=l[0],h=l[4],p=l[8],f=l[1],x=l[5],_=l[9],S=l[2],m=l[6],d=l[10];if(Math.abs(h-f)<.01&&Math.abs(p-S)<.01&&Math.abs(_-m)<.01){if(Math.abs(h+f)<.1&&Math.abs(p+S)<.1&&Math.abs(_+m)<.1&&Math.abs(u+x+d-3)<.1)return this.set(1,0,0,0),this;n=Math.PI;const v=(u+1)/2,w=(x+1)/2,N=(d+1)/2,E=(h+f)/4,A=(p+S)/4,R=(_+m)/4;return v>w&&v>N?v<.01?(i=0,r=.707106781,s=.707106781):(i=Math.sqrt(v),r=E/i,s=A/i):w>N?w<.01?(i=.707106781,r=0,s=.707106781):(r=Math.sqrt(w),i=E/r,s=R/r):N<.01?(i=.707106781,r=.707106781,s=0):(s=Math.sqrt(N),i=A/s,r=R/s),this.set(i,r,s,n),this}let g=Math.sqrt((m-_)*(m-_)+(p-S)*(p-S)+(f-h)*(f-h));return Math.abs(g)<.001&&(g=1),this.x=(m-_)/g,this.y=(p-S)/g,this.z=(f-h)/g,this.w=Math.acos((u+x+d-1)/2),this}setFromMatrixPosition(e){const n=e.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this.w=n[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,n){return this.x=Math.max(e.x,Math.min(n.x,this.x)),this.y=Math.max(e.y,Math.min(n.y,this.y)),this.z=Math.max(e.z,Math.min(n.z,this.z)),this.w=Math.max(e.w,Math.min(n.w,this.w)),this}clampScalar(e,n){return this.x=Math.max(e,Math.min(n,this.x)),this.y=Math.max(e,Math.min(n,this.y)),this.z=Math.max(e,Math.min(n,this.z)),this.w=Math.max(e,Math.min(n,this.w)),this}clampLength(e,n){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(n,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this.z+=(e.z-this.z)*n,this.w+=(e.w-this.w)*n,this}lerpVectors(e,n,i){return this.x=e.x+(n.x-e.x)*i,this.y=e.y+(n.y-e.y)*i,this.z=e.z+(n.z-e.z)*i,this.w=e.w+(n.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this.z=e[n+2],this.w=e[n+3],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e[n+2]=this.z,e[n+3]=this.w,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this.z=e.getZ(n),this.w=e.getW(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Z1 extends Us{constructor(e=1,n=1,i={}){super(),this.isRenderTarget=!0,this.width=e,this.height=n,this.depth=1,this.scissor=new st(0,0,e,n),this.scissorTest=!1,this.viewport=new st(0,0,e,n);const r={width:e,height:n,depth:1};i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Mn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},i);const s=new Yt(r,i.mapping,i.wrapS,i.wrapT,i.magFilter,i.minFilter,i.format,i.type,i.anisotropy,i.colorSpace);s.flipY=!1,s.generateMipmaps=i.generateMipmaps,s.internalFormat=i.internalFormat,this.textures=[];const a=i.count;for(let o=0;o<a;o++)this.textures[o]=s.clone(),this.textures[o].isRenderTargetTexture=!0;this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.depthTexture=i.depthTexture,this.samples=i.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,n,i=1){if(this.width!==e||this.height!==n||this.depth!==i){this.width=e,this.height=n,this.depth=i;for(let r=0,s=this.textures.length;r<s;r++)this.textures[r].image.width=e,this.textures[r].image.height=n,this.textures[r].image.depth=i;this.dispose()}this.viewport.set(0,0,e,n),this.scissor.set(0,0,e,n)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let i=0,r=e.textures.length;i<r;i++)this.textures[i]=e.textures[i].clone(),this.textures[i].isRenderTargetTexture=!0;const n=Object.assign({},e.texture.image);return this.texture.source=new fx(n),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Rr extends Z1{constructor(e=1,n=1,i={}){super(e,n,i),this.isWebGLRenderTarget=!0}}class px extends Yt{constructor(e=null,n=1,i=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:n,height:i,depth:r},this.magFilter=bn,this.minFilter=bn,this.wrapR=_r,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class Q1 extends Yt{constructor(e=null,n=1,i=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:n,height:i,depth:r},this.magFilter=bn,this.minFilter=bn,this.wrapR=_r,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Ga{constructor(e=0,n=0,i=0,r=1){this.isQuaternion=!0,this._x=e,this._y=n,this._z=i,this._w=r}static slerpFlat(e,n,i,r,s,a,o){let l=i[r+0],u=i[r+1],h=i[r+2],p=i[r+3];const f=s[a+0],x=s[a+1],_=s[a+2],S=s[a+3];if(o===0){e[n+0]=l,e[n+1]=u,e[n+2]=h,e[n+3]=p;return}if(o===1){e[n+0]=f,e[n+1]=x,e[n+2]=_,e[n+3]=S;return}if(p!==S||l!==f||u!==x||h!==_){let m=1-o;const d=l*f+u*x+h*_+p*S,g=d>=0?1:-1,v=1-d*d;if(v>Number.EPSILON){const N=Math.sqrt(v),E=Math.atan2(N,d*g);m=Math.sin(m*E)/N,o=Math.sin(o*E)/N}const w=o*g;if(l=l*m+f*w,u=u*m+x*w,h=h*m+_*w,p=p*m+S*w,m===1-o){const N=1/Math.sqrt(l*l+u*u+h*h+p*p);l*=N,u*=N,h*=N,p*=N}}e[n]=l,e[n+1]=u,e[n+2]=h,e[n+3]=p}static multiplyQuaternionsFlat(e,n,i,r,s,a){const o=i[r],l=i[r+1],u=i[r+2],h=i[r+3],p=s[a],f=s[a+1],x=s[a+2],_=s[a+3];return e[n]=o*_+h*p+l*x-u*f,e[n+1]=l*_+h*f+u*p-o*x,e[n+2]=u*_+h*x+o*f-l*p,e[n+3]=h*_-o*p-l*f-u*x,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,n,i,r){return this._x=e,this._y=n,this._z=i,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,n=!0){const i=e._x,r=e._y,s=e._z,a=e._order,o=Math.cos,l=Math.sin,u=o(i/2),h=o(r/2),p=o(s/2),f=l(i/2),x=l(r/2),_=l(s/2);switch(a){case"XYZ":this._x=f*h*p+u*x*_,this._y=u*x*p-f*h*_,this._z=u*h*_+f*x*p,this._w=u*h*p-f*x*_;break;case"YXZ":this._x=f*h*p+u*x*_,this._y=u*x*p-f*h*_,this._z=u*h*_-f*x*p,this._w=u*h*p+f*x*_;break;case"ZXY":this._x=f*h*p-u*x*_,this._y=u*x*p+f*h*_,this._z=u*h*_+f*x*p,this._w=u*h*p-f*x*_;break;case"ZYX":this._x=f*h*p-u*x*_,this._y=u*x*p+f*h*_,this._z=u*h*_-f*x*p,this._w=u*h*p+f*x*_;break;case"YZX":this._x=f*h*p+u*x*_,this._y=u*x*p+f*h*_,this._z=u*h*_-f*x*p,this._w=u*h*p-f*x*_;break;case"XZY":this._x=f*h*p-u*x*_,this._y=u*x*p-f*h*_,this._z=u*h*_+f*x*p,this._w=u*h*p+f*x*_;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return n===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,n){const i=n/2,r=Math.sin(i);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const n=e.elements,i=n[0],r=n[4],s=n[8],a=n[1],o=n[5],l=n[9],u=n[2],h=n[6],p=n[10],f=i+o+p;if(f>0){const x=.5/Math.sqrt(f+1);this._w=.25/x,this._x=(h-l)*x,this._y=(s-u)*x,this._z=(a-r)*x}else if(i>o&&i>p){const x=2*Math.sqrt(1+i-o-p);this._w=(h-l)/x,this._x=.25*x,this._y=(r+a)/x,this._z=(s+u)/x}else if(o>p){const x=2*Math.sqrt(1+o-i-p);this._w=(s-u)/x,this._x=(r+a)/x,this._y=.25*x,this._z=(l+h)/x}else{const x=2*Math.sqrt(1+p-i-o);this._w=(a-r)/x,this._x=(s+u)/x,this._y=(l+h)/x,this._z=.25*x}return this._onChangeCallback(),this}setFromUnitVectors(e,n){let i=e.dot(n)+1;return i<Number.EPSILON?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*n.z-e.z*n.y,this._y=e.z*n.x-e.x*n.z,this._z=e.x*n.y-e.y*n.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(nn(this.dot(e),-1,1)))}rotateTowards(e,n){const i=this.angleTo(e);if(i===0)return this;const r=Math.min(1,n/i);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,n){const i=e._x,r=e._y,s=e._z,a=e._w,o=n._x,l=n._y,u=n._z,h=n._w;return this._x=i*h+a*o+r*u-s*l,this._y=r*h+a*l+s*o-i*u,this._z=s*h+a*u+i*l-r*o,this._w=a*h-i*o-r*l-s*u,this._onChangeCallback(),this}slerp(e,n){if(n===0)return this;if(n===1)return this.copy(e);const i=this._x,r=this._y,s=this._z,a=this._w;let o=a*e._w+i*e._x+r*e._y+s*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=i,this._y=r,this._z=s,this;const l=1-o*o;if(l<=Number.EPSILON){const x=1-n;return this._w=x*a+n*this._w,this._x=x*i+n*this._x,this._y=x*r+n*this._y,this._z=x*s+n*this._z,this.normalize(),this}const u=Math.sqrt(l),h=Math.atan2(u,o),p=Math.sin((1-n)*h)/u,f=Math.sin(n*h)/u;return this._w=a*p+this._w*f,this._x=i*p+this._x*f,this._y=r*p+this._y*f,this._z=s*p+this._z*f,this._onChangeCallback(),this}slerpQuaternions(e,n,i){return this.copy(e).slerp(n,i)}random(){const e=2*Math.PI*Math.random(),n=2*Math.PI*Math.random(),i=Math.random(),r=Math.sqrt(1-i),s=Math.sqrt(i);return this.set(r*Math.sin(e),r*Math.cos(e),s*Math.sin(n),s*Math.cos(n))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,n=0){return this._x=e[n],this._y=e[n+1],this._z=e[n+2],this._w=e[n+3],this._onChangeCallback(),this}toArray(e=[],n=0){return e[n]=this._x,e[n+1]=this._y,e[n+2]=this._z,e[n+3]=this._w,e}fromBufferAttribute(e,n){return this._x=e.getX(n),this._y=e.getY(n),this._z=e.getZ(n),this._w=e.getW(n),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class U{constructor(e=0,n=0,i=0){U.prototype.isVector3=!0,this.x=e,this.y=n,this.z=i}set(e,n,i){return i===void 0&&(i=this.z),this.x=e,this.y=n,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this.z=e.z+n.z,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this.z+=e.z*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this.z=e.z-n.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,n){return this.x=e.x*n.x,this.y=e.y*n.y,this.z=e.z*n.z,this}applyEuler(e){return this.applyQuaternion(kp.setFromEuler(e))}applyAxisAngle(e,n){return this.applyQuaternion(kp.setFromAxisAngle(e,n))}applyMatrix3(e){const n=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*n+s[3]*i+s[6]*r,this.y=s[1]*n+s[4]*i+s[7]*r,this.z=s[2]*n+s[5]*i+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const n=this.x,i=this.y,r=this.z,s=e.elements,a=1/(s[3]*n+s[7]*i+s[11]*r+s[15]);return this.x=(s[0]*n+s[4]*i+s[8]*r+s[12])*a,this.y=(s[1]*n+s[5]*i+s[9]*r+s[13])*a,this.z=(s[2]*n+s[6]*i+s[10]*r+s[14])*a,this}applyQuaternion(e){const n=this.x,i=this.y,r=this.z,s=e.x,a=e.y,o=e.z,l=e.w,u=2*(a*r-o*i),h=2*(o*n-s*r),p=2*(s*i-a*n);return this.x=n+l*u+a*p-o*h,this.y=i+l*h+o*u-s*p,this.z=r+l*p+s*h-a*u,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const n=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*n+s[4]*i+s[8]*r,this.y=s[1]*n+s[5]*i+s[9]*r,this.z=s[2]*n+s[6]*i+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,n){return this.x=Math.max(e.x,Math.min(n.x,this.x)),this.y=Math.max(e.y,Math.min(n.y,this.y)),this.z=Math.max(e.z,Math.min(n.z,this.z)),this}clampScalar(e,n){return this.x=Math.max(e,Math.min(n,this.x)),this.y=Math.max(e,Math.min(n,this.y)),this.z=Math.max(e,Math.min(n,this.z)),this}clampLength(e,n){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(n,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this.z+=(e.z-this.z)*n,this}lerpVectors(e,n,i){return this.x=e.x+(n.x-e.x)*i,this.y=e.y+(n.y-e.y)*i,this.z=e.z+(n.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,n){const i=e.x,r=e.y,s=e.z,a=n.x,o=n.y,l=n.z;return this.x=r*l-s*o,this.y=s*a-i*l,this.z=i*o-r*a,this}projectOnVector(e){const n=e.lengthSq();if(n===0)return this.set(0,0,0);const i=e.dot(this)/n;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return Lc.copy(this).projectOnVector(e),this.sub(Lc)}reflect(e){return this.sub(Lc.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const n=Math.sqrt(this.lengthSq()*e.lengthSq());if(n===0)return Math.PI/2;const i=this.dot(e)/n;return Math.acos(nn(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const n=this.x-e.x,i=this.y-e.y,r=this.z-e.z;return n*n+i*i+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,n,i){const r=Math.sin(n)*e;return this.x=r*Math.sin(i),this.y=Math.cos(n)*e,this.z=r*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,n,i){return this.x=e*Math.sin(n),this.y=i,this.z=e*Math.cos(n),this}setFromMatrixPosition(e){const n=e.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this}setFromMatrixScale(e){const n=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=n,this.y=i,this.z=r,this}setFromMatrixColumn(e,n){return this.fromArray(e.elements,n*4)}setFromMatrix3Column(e,n){return this.fromArray(e.elements,n*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this.z=e[n+2],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e[n+2]=this.z,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this.z=e.getZ(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,n=Math.random()*2-1,i=Math.sqrt(1-n*n);return this.x=i*Math.cos(e),this.y=n,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Lc=new U,kp=new Ga;class Wa{constructor(e=new U(1/0,1/0,1/0),n=new U(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=n}set(e,n){return this.min.copy(e),this.max.copy(n),this}setFromArray(e){this.makeEmpty();for(let n=0,i=e.length;n<i;n+=3)this.expandByPoint(Dn.fromArray(e,n));return this}setFromBufferAttribute(e){this.makeEmpty();for(let n=0,i=e.count;n<i;n++)this.expandByPoint(Dn.fromBufferAttribute(e,n));return this}setFromPoints(e){this.makeEmpty();for(let n=0,i=e.length;n<i;n++)this.expandByPoint(e[n]);return this}setFromCenterAndSize(e,n){const i=Dn.copy(n).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,n=!1){return this.makeEmpty(),this.expandByObject(e,n)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,n=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0){const s=i.getAttribute("position");if(n===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=s.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,Dn):Dn.fromBufferAttribute(s,a),Dn.applyMatrix4(e.matrixWorld),this.expandByPoint(Dn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),po.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),po.copy(i.boundingBox)),po.applyMatrix4(e.matrixWorld),this.union(po)}const r=e.children;for(let s=0,a=r.length;s<a;s++)this.expandByObject(r[s],n);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,n){return n.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Dn),Dn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let n,i;return e.normal.x>0?(n=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(n=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(n+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(n+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(n+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(n+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),n<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter($s),mo.subVectors(this.max,$s),Ur.subVectors(e.a,$s),Fr.subVectors(e.b,$s),Or.subVectors(e.c,$s),Mi.subVectors(Fr,Ur),Ei.subVectors(Or,Fr),nr.subVectors(Ur,Or);let n=[0,-Mi.z,Mi.y,0,-Ei.z,Ei.y,0,-nr.z,nr.y,Mi.z,0,-Mi.x,Ei.z,0,-Ei.x,nr.z,0,-nr.x,-Mi.y,Mi.x,0,-Ei.y,Ei.x,0,-nr.y,nr.x,0];return!Dc(n,Ur,Fr,Or,mo)||(n=[1,0,0,0,1,0,0,0,1],!Dc(n,Ur,Fr,Or,mo))?!1:(go.crossVectors(Mi,Ei),n=[go.x,go.y,go.z],Dc(n,Ur,Fr,Or,mo))}clampPoint(e,n){return n.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Dn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Dn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(ei[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),ei[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),ei[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),ei[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),ei[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),ei[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),ei[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),ei[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(ei),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const ei=[new U,new U,new U,new U,new U,new U,new U,new U],Dn=new U,po=new Wa,Ur=new U,Fr=new U,Or=new U,Mi=new U,Ei=new U,nr=new U,$s=new U,mo=new U,go=new U,ir=new U;function Dc(t,e,n,i,r){for(let s=0,a=t.length-3;s<=a;s+=3){ir.fromArray(t,s);const o=r.x*Math.abs(ir.x)+r.y*Math.abs(ir.y)+r.z*Math.abs(ir.z),l=e.dot(ir),u=n.dot(ir),h=i.dot(ir);if(Math.max(-Math.max(l,u,h),Math.min(l,u,h))>o)return!1}return!0}const J1=new Wa,Ks=new U,kc=new U;class Yl{constructor(e=new U,n=-1){this.isSphere=!0,this.center=e,this.radius=n}set(e,n){return this.center.copy(e),this.radius=n,this}setFromPoints(e,n){const i=this.center;n!==void 0?i.copy(n):J1.setFromPoints(e).getCenter(i);let r=0;for(let s=0,a=e.length;s<a;s++)r=Math.max(r,i.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const n=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=n*n}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,n){const i=this.center.distanceToSquared(e);return n.copy(e),i>this.radius*this.radius&&(n.sub(this.center).normalize(),n.multiplyScalar(this.radius).add(this.center)),n}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Ks.subVectors(e,this.center);const n=Ks.lengthSq();if(n>this.radius*this.radius){const i=Math.sqrt(n),r=(i-this.radius)*.5;this.center.addScaledVector(Ks,r/i),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(kc.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Ks.copy(e.center).add(kc)),this.expandByPoint(Ks.copy(e.center).sub(kc))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const ti=new U,Ic=new U,xo=new U,bi=new U,Uc=new U,vo=new U,Fc=new U;class Yh{constructor(e=new U,n=new U(0,0,-1)){this.origin=e,this.direction=n}set(e,n){return this.origin.copy(e),this.direction.copy(n),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,n){return n.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,ti)),this}closestPointToPoint(e,n){n.subVectors(e,this.origin);const i=n.dot(this.direction);return i<0?n.copy(this.origin):n.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const n=ti.subVectors(e,this.origin).dot(this.direction);return n<0?this.origin.distanceToSquared(e):(ti.copy(this.origin).addScaledVector(this.direction,n),ti.distanceToSquared(e))}distanceSqToSegment(e,n,i,r){Ic.copy(e).add(n).multiplyScalar(.5),xo.copy(n).sub(e).normalize(),bi.copy(this.origin).sub(Ic);const s=e.distanceTo(n)*.5,a=-this.direction.dot(xo),o=bi.dot(this.direction),l=-bi.dot(xo),u=bi.lengthSq(),h=Math.abs(1-a*a);let p,f,x,_;if(h>0)if(p=a*l-o,f=a*o-l,_=s*h,p>=0)if(f>=-_)if(f<=_){const S=1/h;p*=S,f*=S,x=p*(p+a*f+2*o)+f*(a*p+f+2*l)+u}else f=s,p=Math.max(0,-(a*f+o)),x=-p*p+f*(f+2*l)+u;else f=-s,p=Math.max(0,-(a*f+o)),x=-p*p+f*(f+2*l)+u;else f<=-_?(p=Math.max(0,-(-a*s+o)),f=p>0?-s:Math.min(Math.max(-s,-l),s),x=-p*p+f*(f+2*l)+u):f<=_?(p=0,f=Math.min(Math.max(-s,-l),s),x=f*(f+2*l)+u):(p=Math.max(0,-(a*s+o)),f=p>0?s:Math.min(Math.max(-s,-l),s),x=-p*p+f*(f+2*l)+u);else f=a>0?-s:s,p=Math.max(0,-(a*f+o)),x=-p*p+f*(f+2*l)+u;return i&&i.copy(this.origin).addScaledVector(this.direction,p),r&&r.copy(Ic).addScaledVector(xo,f),x}intersectSphere(e,n){ti.subVectors(e.center,this.origin);const i=ti.dot(this.direction),r=ti.dot(ti)-i*i,s=e.radius*e.radius;if(r>s)return null;const a=Math.sqrt(s-r),o=i-a,l=i+a;return l<0?null:o<0?this.at(l,n):this.at(o,n)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const n=e.normal.dot(this.direction);if(n===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/n;return i>=0?i:null}intersectPlane(e,n){const i=this.distanceToPlane(e);return i===null?null:this.at(i,n)}intersectsPlane(e){const n=e.distanceToPoint(this.origin);return n===0||e.normal.dot(this.direction)*n<0}intersectBox(e,n){let i,r,s,a,o,l;const u=1/this.direction.x,h=1/this.direction.y,p=1/this.direction.z,f=this.origin;return u>=0?(i=(e.min.x-f.x)*u,r=(e.max.x-f.x)*u):(i=(e.max.x-f.x)*u,r=(e.min.x-f.x)*u),h>=0?(s=(e.min.y-f.y)*h,a=(e.max.y-f.y)*h):(s=(e.max.y-f.y)*h,a=(e.min.y-f.y)*h),i>a||s>r||((s>i||isNaN(i))&&(i=s),(a<r||isNaN(r))&&(r=a),p>=0?(o=(e.min.z-f.z)*p,l=(e.max.z-f.z)*p):(o=(e.max.z-f.z)*p,l=(e.min.z-f.z)*p),i>l||o>r)||((o>i||i!==i)&&(i=o),(l<r||r!==r)&&(r=l),r<0)?null:this.at(i>=0?i:r,n)}intersectsBox(e){return this.intersectBox(e,ti)!==null}intersectTriangle(e,n,i,r,s){Uc.subVectors(n,e),vo.subVectors(i,e),Fc.crossVectors(Uc,vo);let a=this.direction.dot(Fc),o;if(a>0){if(r)return null;o=1}else if(a<0)o=-1,a=-a;else return null;bi.subVectors(this.origin,e);const l=o*this.direction.dot(vo.crossVectors(bi,vo));if(l<0)return null;const u=o*this.direction.dot(Uc.cross(bi));if(u<0||l+u>a)return null;const h=-o*bi.dot(Fc);return h<0?null:this.at(h/a,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class dt{constructor(e,n,i,r,s,a,o,l,u,h,p,f,x,_,S,m){dt.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,n,i,r,s,a,o,l,u,h,p,f,x,_,S,m)}set(e,n,i,r,s,a,o,l,u,h,p,f,x,_,S,m){const d=this.elements;return d[0]=e,d[4]=n,d[8]=i,d[12]=r,d[1]=s,d[5]=a,d[9]=o,d[13]=l,d[2]=u,d[6]=h,d[10]=p,d[14]=f,d[3]=x,d[7]=_,d[11]=S,d[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new dt().fromArray(this.elements)}copy(e){const n=this.elements,i=e.elements;return n[0]=i[0],n[1]=i[1],n[2]=i[2],n[3]=i[3],n[4]=i[4],n[5]=i[5],n[6]=i[6],n[7]=i[7],n[8]=i[8],n[9]=i[9],n[10]=i[10],n[11]=i[11],n[12]=i[12],n[13]=i[13],n[14]=i[14],n[15]=i[15],this}copyPosition(e){const n=this.elements,i=e.elements;return n[12]=i[12],n[13]=i[13],n[14]=i[14],this}setFromMatrix3(e){const n=e.elements;return this.set(n[0],n[3],n[6],0,n[1],n[4],n[7],0,n[2],n[5],n[8],0,0,0,0,1),this}extractBasis(e,n,i){return e.setFromMatrixColumn(this,0),n.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,n,i){return this.set(e.x,n.x,i.x,0,e.y,n.y,i.y,0,e.z,n.z,i.z,0,0,0,0,1),this}extractRotation(e){const n=this.elements,i=e.elements,r=1/zr.setFromMatrixColumn(e,0).length(),s=1/zr.setFromMatrixColumn(e,1).length(),a=1/zr.setFromMatrixColumn(e,2).length();return n[0]=i[0]*r,n[1]=i[1]*r,n[2]=i[2]*r,n[3]=0,n[4]=i[4]*s,n[5]=i[5]*s,n[6]=i[6]*s,n[7]=0,n[8]=i[8]*a,n[9]=i[9]*a,n[10]=i[10]*a,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromEuler(e){const n=this.elements,i=e.x,r=e.y,s=e.z,a=Math.cos(i),o=Math.sin(i),l=Math.cos(r),u=Math.sin(r),h=Math.cos(s),p=Math.sin(s);if(e.order==="XYZ"){const f=a*h,x=a*p,_=o*h,S=o*p;n[0]=l*h,n[4]=-l*p,n[8]=u,n[1]=x+_*u,n[5]=f-S*u,n[9]=-o*l,n[2]=S-f*u,n[6]=_+x*u,n[10]=a*l}else if(e.order==="YXZ"){const f=l*h,x=l*p,_=u*h,S=u*p;n[0]=f+S*o,n[4]=_*o-x,n[8]=a*u,n[1]=a*p,n[5]=a*h,n[9]=-o,n[2]=x*o-_,n[6]=S+f*o,n[10]=a*l}else if(e.order==="ZXY"){const f=l*h,x=l*p,_=u*h,S=u*p;n[0]=f-S*o,n[4]=-a*p,n[8]=_+x*o,n[1]=x+_*o,n[5]=a*h,n[9]=S-f*o,n[2]=-a*u,n[6]=o,n[10]=a*l}else if(e.order==="ZYX"){const f=a*h,x=a*p,_=o*h,S=o*p;n[0]=l*h,n[4]=_*u-x,n[8]=f*u+S,n[1]=l*p,n[5]=S*u+f,n[9]=x*u-_,n[2]=-u,n[6]=o*l,n[10]=a*l}else if(e.order==="YZX"){const f=a*l,x=a*u,_=o*l,S=o*u;n[0]=l*h,n[4]=S-f*p,n[8]=_*p+x,n[1]=p,n[5]=a*h,n[9]=-o*h,n[2]=-u*h,n[6]=x*p+_,n[10]=f-S*p}else if(e.order==="XZY"){const f=a*l,x=a*u,_=o*l,S=o*u;n[0]=l*h,n[4]=-p,n[8]=u*h,n[1]=f*p+S,n[5]=a*h,n[9]=x*p-_,n[2]=_*p-x,n[6]=o*h,n[10]=S*p+f}return n[3]=0,n[7]=0,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromQuaternion(e){return this.compose(eS,e,tS)}lookAt(e,n,i){const r=this.elements;return un.subVectors(e,n),un.lengthSq()===0&&(un.z=1),un.normalize(),Ti.crossVectors(i,un),Ti.lengthSq()===0&&(Math.abs(i.z)===1?un.x+=1e-4:un.z+=1e-4,un.normalize(),Ti.crossVectors(i,un)),Ti.normalize(),_o.crossVectors(un,Ti),r[0]=Ti.x,r[4]=_o.x,r[8]=un.x,r[1]=Ti.y,r[5]=_o.y,r[9]=un.y,r[2]=Ti.z,r[6]=_o.z,r[10]=un.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,n){const i=e.elements,r=n.elements,s=this.elements,a=i[0],o=i[4],l=i[8],u=i[12],h=i[1],p=i[5],f=i[9],x=i[13],_=i[2],S=i[6],m=i[10],d=i[14],g=i[3],v=i[7],w=i[11],N=i[15],E=r[0],A=r[4],R=r[8],F=r[12],y=r[1],b=r[5],H=r[9],V=r[13],q=r[2],Q=r[6],W=r[10],$=r[14],D=r[3],J=r[7],ee=r[11],O=r[15];return s[0]=a*E+o*y+l*q+u*D,s[4]=a*A+o*b+l*Q+u*J,s[8]=a*R+o*H+l*W+u*ee,s[12]=a*F+o*V+l*$+u*O,s[1]=h*E+p*y+f*q+x*D,s[5]=h*A+p*b+f*Q+x*J,s[9]=h*R+p*H+f*W+x*ee,s[13]=h*F+p*V+f*$+x*O,s[2]=_*E+S*y+m*q+d*D,s[6]=_*A+S*b+m*Q+d*J,s[10]=_*R+S*H+m*W+d*ee,s[14]=_*F+S*V+m*$+d*O,s[3]=g*E+v*y+w*q+N*D,s[7]=g*A+v*b+w*Q+N*J,s[11]=g*R+v*H+w*W+N*ee,s[15]=g*F+v*V+w*$+N*O,this}multiplyScalar(e){const n=this.elements;return n[0]*=e,n[4]*=e,n[8]*=e,n[12]*=e,n[1]*=e,n[5]*=e,n[9]*=e,n[13]*=e,n[2]*=e,n[6]*=e,n[10]*=e,n[14]*=e,n[3]*=e,n[7]*=e,n[11]*=e,n[15]*=e,this}determinant(){const e=this.elements,n=e[0],i=e[4],r=e[8],s=e[12],a=e[1],o=e[5],l=e[9],u=e[13],h=e[2],p=e[6],f=e[10],x=e[14],_=e[3],S=e[7],m=e[11],d=e[15];return _*(+s*l*p-r*u*p-s*o*f+i*u*f+r*o*x-i*l*x)+S*(+n*l*x-n*u*f+s*a*f-r*a*x+r*u*h-s*l*h)+m*(+n*u*p-n*o*x-s*a*p+i*a*x+s*o*h-i*u*h)+d*(-r*o*h-n*l*p+n*o*f+r*a*p-i*a*f+i*l*h)}transpose(){const e=this.elements;let n;return n=e[1],e[1]=e[4],e[4]=n,n=e[2],e[2]=e[8],e[8]=n,n=e[6],e[6]=e[9],e[9]=n,n=e[3],e[3]=e[12],e[12]=n,n=e[7],e[7]=e[13],e[13]=n,n=e[11],e[11]=e[14],e[14]=n,this}setPosition(e,n,i){const r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=n,r[14]=i),this}invert(){const e=this.elements,n=e[0],i=e[1],r=e[2],s=e[3],a=e[4],o=e[5],l=e[6],u=e[7],h=e[8],p=e[9],f=e[10],x=e[11],_=e[12],S=e[13],m=e[14],d=e[15],g=p*m*u-S*f*u+S*l*x-o*m*x-p*l*d+o*f*d,v=_*f*u-h*m*u-_*l*x+a*m*x+h*l*d-a*f*d,w=h*S*u-_*p*u+_*o*x-a*S*x-h*o*d+a*p*d,N=_*p*l-h*S*l-_*o*f+a*S*f+h*o*m-a*p*m,E=n*g+i*v+r*w+s*N;if(E===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const A=1/E;return e[0]=g*A,e[1]=(S*f*s-p*m*s-S*r*x+i*m*x+p*r*d-i*f*d)*A,e[2]=(o*m*s-S*l*s+S*r*u-i*m*u-o*r*d+i*l*d)*A,e[3]=(p*l*s-o*f*s-p*r*u+i*f*u+o*r*x-i*l*x)*A,e[4]=v*A,e[5]=(h*m*s-_*f*s+_*r*x-n*m*x-h*r*d+n*f*d)*A,e[6]=(_*l*s-a*m*s-_*r*u+n*m*u+a*r*d-n*l*d)*A,e[7]=(a*f*s-h*l*s+h*r*u-n*f*u-a*r*x+n*l*x)*A,e[8]=w*A,e[9]=(_*p*s-h*S*s-_*i*x+n*S*x+h*i*d-n*p*d)*A,e[10]=(a*S*s-_*o*s+_*i*u-n*S*u-a*i*d+n*o*d)*A,e[11]=(h*o*s-a*p*s-h*i*u+n*p*u+a*i*x-n*o*x)*A,e[12]=N*A,e[13]=(h*S*r-_*p*r+_*i*f-n*S*f-h*i*m+n*p*m)*A,e[14]=(_*o*r-a*S*r-_*i*l+n*S*l+a*i*m-n*o*m)*A,e[15]=(a*p*r-h*o*r+h*i*l-n*p*l-a*i*f+n*o*f)*A,this}scale(e){const n=this.elements,i=e.x,r=e.y,s=e.z;return n[0]*=i,n[4]*=r,n[8]*=s,n[1]*=i,n[5]*=r,n[9]*=s,n[2]*=i,n[6]*=r,n[10]*=s,n[3]*=i,n[7]*=r,n[11]*=s,this}getMaxScaleOnAxis(){const e=this.elements,n=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(n,i,r))}makeTranslation(e,n,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,n,0,0,1,i,0,0,0,1),this}makeRotationX(e){const n=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,n,-i,0,0,i,n,0,0,0,0,1),this}makeRotationY(e){const n=Math.cos(e),i=Math.sin(e);return this.set(n,0,i,0,0,1,0,0,-i,0,n,0,0,0,0,1),this}makeRotationZ(e){const n=Math.cos(e),i=Math.sin(e);return this.set(n,-i,0,0,i,n,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,n){const i=Math.cos(n),r=Math.sin(n),s=1-i,a=e.x,o=e.y,l=e.z,u=s*a,h=s*o;return this.set(u*a+i,u*o-r*l,u*l+r*o,0,u*o+r*l,h*o+i,h*l-r*a,0,u*l-r*o,h*l+r*a,s*l*l+i,0,0,0,0,1),this}makeScale(e,n,i){return this.set(e,0,0,0,0,n,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,n,i,r,s,a){return this.set(1,i,s,0,e,1,a,0,n,r,1,0,0,0,0,1),this}compose(e,n,i){const r=this.elements,s=n._x,a=n._y,o=n._z,l=n._w,u=s+s,h=a+a,p=o+o,f=s*u,x=s*h,_=s*p,S=a*h,m=a*p,d=o*p,g=l*u,v=l*h,w=l*p,N=i.x,E=i.y,A=i.z;return r[0]=(1-(S+d))*N,r[1]=(x+w)*N,r[2]=(_-v)*N,r[3]=0,r[4]=(x-w)*E,r[5]=(1-(f+d))*E,r[6]=(m+g)*E,r[7]=0,r[8]=(_+v)*A,r[9]=(m-g)*A,r[10]=(1-(f+S))*A,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,n,i){const r=this.elements;let s=zr.set(r[0],r[1],r[2]).length();const a=zr.set(r[4],r[5],r[6]).length(),o=zr.set(r[8],r[9],r[10]).length();this.determinant()<0&&(s=-s),e.x=r[12],e.y=r[13],e.z=r[14],kn.copy(this);const u=1/s,h=1/a,p=1/o;return kn.elements[0]*=u,kn.elements[1]*=u,kn.elements[2]*=u,kn.elements[4]*=h,kn.elements[5]*=h,kn.elements[6]*=h,kn.elements[8]*=p,kn.elements[9]*=p,kn.elements[10]*=p,n.setFromRotationMatrix(kn),i.x=s,i.y=a,i.z=o,this}makePerspective(e,n,i,r,s,a,o=di){const l=this.elements,u=2*s/(n-e),h=2*s/(i-r),p=(n+e)/(n-e),f=(i+r)/(i-r);let x,_;if(o===di)x=-(a+s)/(a-s),_=-2*a*s/(a-s);else if(o===Cl)x=-a/(a-s),_=-a*s/(a-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=u,l[4]=0,l[8]=p,l[12]=0,l[1]=0,l[5]=h,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=x,l[14]=_,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,n,i,r,s,a,o=di){const l=this.elements,u=1/(n-e),h=1/(i-r),p=1/(a-s),f=(n+e)*u,x=(i+r)*h;let _,S;if(o===di)_=(a+s)*p,S=-2*p;else if(o===Cl)_=s*p,S=-1*p;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=2*u,l[4]=0,l[8]=0,l[12]=-f,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-x,l[2]=0,l[6]=0,l[10]=S,l[14]=-_,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const n=this.elements,i=e.elements;for(let r=0;r<16;r++)if(n[r]!==i[r])return!1;return!0}fromArray(e,n=0){for(let i=0;i<16;i++)this.elements[i]=e[i+n];return this}toArray(e=[],n=0){const i=this.elements;return e[n]=i[0],e[n+1]=i[1],e[n+2]=i[2],e[n+3]=i[3],e[n+4]=i[4],e[n+5]=i[5],e[n+6]=i[6],e[n+7]=i[7],e[n+8]=i[8],e[n+9]=i[9],e[n+10]=i[10],e[n+11]=i[11],e[n+12]=i[12],e[n+13]=i[13],e[n+14]=i[14],e[n+15]=i[15],e}}const zr=new U,kn=new dt,eS=new U(0,0,0),tS=new U(1,1,1),Ti=new U,_o=new U,un=new U,Ip=new dt,Up=new Ga;class Qn{constructor(e=0,n=0,i=0,r=Qn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=n,this._z=i,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,n,i,r=this._order){return this._x=e,this._y=n,this._z=i,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,n=this._order,i=!0){const r=e.elements,s=r[0],a=r[4],o=r[8],l=r[1],u=r[5],h=r[9],p=r[2],f=r[6],x=r[10];switch(n){case"XYZ":this._y=Math.asin(nn(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,x),this._z=Math.atan2(-a,s)):(this._x=Math.atan2(f,u),this._z=0);break;case"YXZ":this._x=Math.asin(-nn(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,x),this._z=Math.atan2(l,u)):(this._y=Math.atan2(-p,s),this._z=0);break;case"ZXY":this._x=Math.asin(nn(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-p,x),this._z=Math.atan2(-a,u)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-nn(p,-1,1)),Math.abs(p)<.9999999?(this._x=Math.atan2(f,x),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-a,u));break;case"YZX":this._z=Math.asin(nn(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,u),this._y=Math.atan2(-p,s)):(this._x=0,this._y=Math.atan2(o,x));break;case"XZY":this._z=Math.asin(-nn(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(f,u),this._y=Math.atan2(o,s)):(this._x=Math.atan2(-h,x),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+n)}return this._order=n,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,n,i){return Ip.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Ip,n,i)}setFromVector3(e,n=this._order){return this.set(e.x,e.y,e.z,n)}reorder(e){return Up.setFromEuler(this),this.setFromQuaternion(Up,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],n=0){return e[n]=this._x,e[n+1]=this._y,e[n+2]=this._z,e[n+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Qn.DEFAULT_ORDER="XYZ";class $h{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let nS=0;const Fp=new U,Br=new Ga,ni=new dt,yo=new U,Zs=new U,iS=new U,rS=new Ga,Op=new U(1,0,0),zp=new U(0,1,0),Bp=new U(0,0,1),jp={type:"added"},sS={type:"removed"},jr={type:"childadded",child:null},Oc={type:"childremoved",child:null};class $t extends Us{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:nS++}),this.uuid=Va(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=$t.DEFAULT_UP.clone();const e=new U,n=new Qn,i=new Ga,r=new U(1,1,1);function s(){i.setFromEuler(n,!1)}function a(){n.setFromQuaternion(i,void 0,!1)}n._onChange(s),i._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new dt},normalMatrix:{value:new Be}}),this.matrix=new dt,this.matrixWorld=new dt,this.matrixAutoUpdate=$t.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=$t.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new $h,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,n){this.quaternion.setFromAxisAngle(e,n)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,n){return Br.setFromAxisAngle(e,n),this.quaternion.multiply(Br),this}rotateOnWorldAxis(e,n){return Br.setFromAxisAngle(e,n),this.quaternion.premultiply(Br),this}rotateX(e){return this.rotateOnAxis(Op,e)}rotateY(e){return this.rotateOnAxis(zp,e)}rotateZ(e){return this.rotateOnAxis(Bp,e)}translateOnAxis(e,n){return Fp.copy(e).applyQuaternion(this.quaternion),this.position.add(Fp.multiplyScalar(n)),this}translateX(e){return this.translateOnAxis(Op,e)}translateY(e){return this.translateOnAxis(zp,e)}translateZ(e){return this.translateOnAxis(Bp,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(ni.copy(this.matrixWorld).invert())}lookAt(e,n,i){e.isVector3?yo.copy(e):yo.set(e,n,i);const r=this.parent;this.updateWorldMatrix(!0,!1),Zs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ni.lookAt(Zs,yo,this.up):ni.lookAt(yo,Zs,this.up),this.quaternion.setFromRotationMatrix(ni),r&&(ni.extractRotation(r.matrixWorld),Br.setFromRotationMatrix(ni),this.quaternion.premultiply(Br.invert()))}add(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.add(arguments[n]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(jp),jr.child=e,this.dispatchEvent(jr),jr.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const n=this.children.indexOf(e);return n!==-1&&(e.parent=null,this.children.splice(n,1),e.dispatchEvent(sS),Oc.child=e,this.dispatchEvent(Oc),Oc.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),ni.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),ni.multiply(e.parent.matrixWorld)),e.applyMatrix4(ni),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(jp),jr.child=e,this.dispatchEvent(jr),jr.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,n){if(this[e]===n)return this;for(let i=0,r=this.children.length;i<r;i++){const a=this.children[i].getObjectByProperty(e,n);if(a!==void 0)return a}}getObjectsByProperty(e,n,i=[]){this[e]===n&&i.push(this);const r=this.children;for(let s=0,a=r.length;s<a;s++)r[s].getObjectsByProperty(e,n,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Zs,e,iS),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Zs,rS,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const n=this.matrixWorld.elements;return e.set(n[8],n[9],n[10]).normalize()}raycast(){}traverse(e){e(this);const n=this.children;for(let i=0,r=n.length;i<r;i++)n[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const n=this.children;for(let i=0,r=n.length;i<r;i++)n[i].traverseVisible(e)}traverseAncestors(e){const n=this.parent;n!==null&&(e(n),n.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const n=this.children;for(let i=0,r=n.length;i<r;i++)n[i].updateMatrixWorld(e)}updateWorldMatrix(e,n){const i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),n===!0){const r=this.children;for(let s=0,a=r.length;s<a;s++)r[s].updateWorldMatrix(!1,!0)}}toJSON(e){const n=e===void 0||typeof e=="string",i={};n&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.visibility=this._visibility,r.active=this._active,r.bounds=this._bounds.map(o=>({boxInitialized:o.boxInitialized,boxMin:o.box.min.toArray(),boxMax:o.box.max.toArray(),sphereInitialized:o.sphereInitialized,sphereRadius:o.sphere.radius,sphereCenter:o.sphere.center.toArray()})),r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.geometryCount=this._geometryCount,r.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere={center:r.boundingSphere.center.toArray(),radius:r.boundingSphere.radius}),this.boundingBox!==null&&(r.boundingBox={min:r.boundingBox.min.toArray(),max:r.boundingBox.max.toArray()}));function s(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let u=0,h=l.length;u<h;u++){const p=l[u];s(e.shapes,p)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,u=this.material.length;l<u;l++)o.push(s(e.materials,this.material[l]));r.material=o}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let o=0;o<this.children.length;o++)r.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];r.animations.push(s(e.animations,l))}}if(n){const o=a(e.geometries),l=a(e.materials),u=a(e.textures),h=a(e.images),p=a(e.shapes),f=a(e.skeletons),x=a(e.animations),_=a(e.nodes);o.length>0&&(i.geometries=o),l.length>0&&(i.materials=l),u.length>0&&(i.textures=u),h.length>0&&(i.images=h),p.length>0&&(i.shapes=p),f.length>0&&(i.skeletons=f),x.length>0&&(i.animations=x),_.length>0&&(i.nodes=_)}return i.object=r,i;function a(o){const l=[];for(const u in o){const h=o[u];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,n=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),n===!0)for(let i=0;i<e.children.length;i++){const r=e.children[i];this.add(r.clone())}return this}}$t.DEFAULT_UP=new U(0,1,0);$t.DEFAULT_MATRIX_AUTO_UPDATE=!0;$t.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const In=new U,ii=new U,zc=new U,ri=new U,Hr=new U,Vr=new U,Hp=new U,Bc=new U,jc=new U,Hc=new U,Vc=new st,Gc=new st,Wc=new st;class Bn{constructor(e=new U,n=new U,i=new U){this.a=e,this.b=n,this.c=i}static getNormal(e,n,i,r){r.subVectors(i,n),In.subVectors(e,n),r.cross(In);const s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,n,i,r,s){In.subVectors(r,n),ii.subVectors(i,n),zc.subVectors(e,n);const a=In.dot(In),o=In.dot(ii),l=In.dot(zc),u=ii.dot(ii),h=ii.dot(zc),p=a*u-o*o;if(p===0)return s.set(0,0,0),null;const f=1/p,x=(u*l-o*h)*f,_=(a*h-o*l)*f;return s.set(1-x-_,_,x)}static containsPoint(e,n,i,r){return this.getBarycoord(e,n,i,r,ri)===null?!1:ri.x>=0&&ri.y>=0&&ri.x+ri.y<=1}static getInterpolation(e,n,i,r,s,a,o,l){return this.getBarycoord(e,n,i,r,ri)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,ri.x),l.addScaledVector(a,ri.y),l.addScaledVector(o,ri.z),l)}static getInterpolatedAttribute(e,n,i,r,s,a){return Vc.setScalar(0),Gc.setScalar(0),Wc.setScalar(0),Vc.fromBufferAttribute(e,n),Gc.fromBufferAttribute(e,i),Wc.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(Vc,s.x),a.addScaledVector(Gc,s.y),a.addScaledVector(Wc,s.z),a}static isFrontFacing(e,n,i,r){return In.subVectors(i,n),ii.subVectors(e,n),In.cross(ii).dot(r)<0}set(e,n,i){return this.a.copy(e),this.b.copy(n),this.c.copy(i),this}setFromPointsAndIndices(e,n,i,r){return this.a.copy(e[n]),this.b.copy(e[i]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,n,i,r){return this.a.fromBufferAttribute(e,n),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return In.subVectors(this.c,this.b),ii.subVectors(this.a,this.b),In.cross(ii).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return Bn.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,n){return Bn.getBarycoord(e,this.a,this.b,this.c,n)}getInterpolation(e,n,i,r,s){return Bn.getInterpolation(e,this.a,this.b,this.c,n,i,r,s)}containsPoint(e){return Bn.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return Bn.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,n){const i=this.a,r=this.b,s=this.c;let a,o;Hr.subVectors(r,i),Vr.subVectors(s,i),Bc.subVectors(e,i);const l=Hr.dot(Bc),u=Vr.dot(Bc);if(l<=0&&u<=0)return n.copy(i);jc.subVectors(e,r);const h=Hr.dot(jc),p=Vr.dot(jc);if(h>=0&&p<=h)return n.copy(r);const f=l*p-h*u;if(f<=0&&l>=0&&h<=0)return a=l/(l-h),n.copy(i).addScaledVector(Hr,a);Hc.subVectors(e,s);const x=Hr.dot(Hc),_=Vr.dot(Hc);if(_>=0&&x<=_)return n.copy(s);const S=x*u-l*_;if(S<=0&&u>=0&&_<=0)return o=u/(u-_),n.copy(i).addScaledVector(Vr,o);const m=h*_-x*p;if(m<=0&&p-h>=0&&x-_>=0)return Hp.subVectors(s,r),o=(p-h)/(p-h+(x-_)),n.copy(r).addScaledVector(Hp,o);const d=1/(m+S+f);return a=S*d,o=f*d,n.copy(i).addScaledVector(Hr,a).addScaledVector(Vr,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const mx={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ai={h:0,s:0,l:0},So={h:0,s:0,l:0};function Xc(t,e,n){return n<0&&(n+=1),n>1&&(n-=1),n<1/6?t+(e-t)*6*n:n<1/2?e:n<2/3?t+(e-t)*6*(2/3-n):t}class $e{constructor(e,n,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,n,i)}set(e,n,i){if(n===void 0&&i===void 0){const r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,n,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,n=qn){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,tt.toWorkingColorSpace(this,n),this}setRGB(e,n,i,r=tt.workingColorSpace){return this.r=e,this.g=n,this.b=i,tt.toWorkingColorSpace(this,r),this}setHSL(e,n,i,r=tt.workingColorSpace){if(e=H1(e,1),n=nn(n,0,1),i=nn(i,0,1),n===0)this.r=this.g=this.b=i;else{const s=i<=.5?i*(1+n):i+n-i*n,a=2*i-s;this.r=Xc(a,s,e+1/3),this.g=Xc(a,s,e),this.b=Xc(a,s,e-1/3)}return tt.toWorkingColorSpace(this,r),this}setStyle(e,n=qn){function i(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s;const a=r[1],o=r[2];switch(a){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,n);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,n);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,n);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){const s=r[1],a=s.length;if(a===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,n);if(a===6)return this.setHex(parseInt(s,16),n);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,n);return this}setColorName(e,n=qn){const i=mx[e.toLowerCase()];return i!==void 0?this.setHex(i,n):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=ms(e.r),this.g=ms(e.g),this.b=ms(e.b),this}copyLinearToSRGB(e){return this.r=Nc(e.r),this.g=Nc(e.g),this.b=Nc(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=qn){return tt.fromWorkingColorSpace(Ot.copy(this),e),Math.round(nn(Ot.r*255,0,255))*65536+Math.round(nn(Ot.g*255,0,255))*256+Math.round(nn(Ot.b*255,0,255))}getHexString(e=qn){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,n=tt.workingColorSpace){tt.fromWorkingColorSpace(Ot.copy(this),n);const i=Ot.r,r=Ot.g,s=Ot.b,a=Math.max(i,r,s),o=Math.min(i,r,s);let l,u;const h=(o+a)/2;if(o===a)l=0,u=0;else{const p=a-o;switch(u=h<=.5?p/(a+o):p/(2-a-o),a){case i:l=(r-s)/p+(r<s?6:0);break;case r:l=(s-i)/p+2;break;case s:l=(i-r)/p+4;break}l/=6}return e.h=l,e.s=u,e.l=h,e}getRGB(e,n=tt.workingColorSpace){return tt.fromWorkingColorSpace(Ot.copy(this),n),e.r=Ot.r,e.g=Ot.g,e.b=Ot.b,e}getStyle(e=qn){tt.fromWorkingColorSpace(Ot.copy(this),e);const n=Ot.r,i=Ot.g,r=Ot.b;return e!==qn?`color(${e} ${n.toFixed(3)} ${i.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(n*255)},${Math.round(i*255)},${Math.round(r*255)})`}offsetHSL(e,n,i){return this.getHSL(Ai),this.setHSL(Ai.h+e,Ai.s+n,Ai.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,n){return this.r=e.r+n.r,this.g=e.g+n.g,this.b=e.b+n.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,n){return this.r+=(e.r-this.r)*n,this.g+=(e.g-this.g)*n,this.b+=(e.b-this.b)*n,this}lerpColors(e,n,i){return this.r=e.r+(n.r-e.r)*i,this.g=e.g+(n.g-e.g)*i,this.b=e.b+(n.b-e.b)*i,this}lerpHSL(e,n){this.getHSL(Ai),e.getHSL(So);const i=Cc(Ai.h,So.h,n),r=Cc(Ai.s,So.s,n),s=Cc(Ai.l,So.l,n);return this.setHSL(i,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const n=this.r,i=this.g,r=this.b,s=e.elements;return this.r=s[0]*n+s[3]*i+s[6]*r,this.g=s[1]*n+s[4]*i+s[7]*r,this.b=s[2]*n+s[5]*i+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,n=0){return this.r=e[n],this.g=e[n+1],this.b=e[n+2],this}toArray(e=[],n=0){return e[n]=this.r,e[n+1]=this.g,e[n+2]=this.b,e}fromBufferAttribute(e,n){return this.r=e.getX(n),this.g=e.getY(n),this.b=e.getZ(n),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Ot=new $e;$e.NAMES=mx;let aS=0;class Fs extends Us{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:aS++}),this.uuid=Va(),this.name="",this.type="Material",this.blending=fs,this.side=$i,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=nd,this.blendDst=id,this.blendEquation=fr,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new $e(0,0,0),this.blendAlpha=0,this.depthFunc=Ts,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Cp,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=kr,this.stencilZFail=kr,this.stencilZPass=kr,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const n in e){const i=e[n];if(i===void 0){console.warn(`THREE.Material: parameter '${n}' has value of undefined.`);continue}const r=this[n];if(r===void 0){console.warn(`THREE.Material: '${n}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(i):r&&r.isVector3&&i&&i.isVector3?r.copy(i):this[n]=i}}toJSON(e){const n=e===void 0||typeof e=="string";n&&(e={textures:{},images:{}});const i={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==fs&&(i.blending=this.blending),this.side!==$i&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==nd&&(i.blendSrc=this.blendSrc),this.blendDst!==id&&(i.blendDst=this.blendDst),this.blendEquation!==fr&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==Ts&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Cp&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==kr&&(i.stencilFail=this.stencilFail),this.stencilZFail!==kr&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==kr&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function r(s){const a=[];for(const o in s){const l=s[o];delete l.metadata,a.push(l)}return a}if(n){const s=r(e.textures),a=r(e.images);s.length>0&&(i.textures=s),a.length>0&&(i.images=a)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const n=e.clippingPlanes;let i=null;if(n!==null){const r=n.length;i=new Array(r);for(let s=0;s!==r;++s)i[s]=n[s].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class Pi extends Fs{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new $e(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Qn,this.combine=Qg,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const St=new U,wo=new Ye;class An{constructor(e,n,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=n,this.count=e!==void 0?e.length/n:0,this.normalized=i,this.usage=Rp,this.updateRanges=[],this.gpuType=ui,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,n){this.updateRanges.push({start:e,count:n})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,n,i){e*=this.itemSize,i*=n.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=n.array[i+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let n=0,i=this.count;n<i;n++)wo.fromBufferAttribute(this,n),wo.applyMatrix3(e),this.setXY(n,wo.x,wo.y);else if(this.itemSize===3)for(let n=0,i=this.count;n<i;n++)St.fromBufferAttribute(this,n),St.applyMatrix3(e),this.setXYZ(n,St.x,St.y,St.z);return this}applyMatrix4(e){for(let n=0,i=this.count;n<i;n++)St.fromBufferAttribute(this,n),St.applyMatrix4(e),this.setXYZ(n,St.x,St.y,St.z);return this}applyNormalMatrix(e){for(let n=0,i=this.count;n<i;n++)St.fromBufferAttribute(this,n),St.applyNormalMatrix(e),this.setXYZ(n,St.x,St.y,St.z);return this}transformDirection(e){for(let n=0,i=this.count;n<i;n++)St.fromBufferAttribute(this,n),St.transformDirection(e),this.setXYZ(n,St.x,St.y,St.z);return this}set(e,n=0){return this.array.set(e,n),this}getComponent(e,n){let i=this.array[e*this.itemSize+n];return this.normalized&&(i=qs(i,this.array)),i}setComponent(e,n,i){return this.normalized&&(i=en(i,this.array)),this.array[e*this.itemSize+n]=i,this}getX(e){let n=this.array[e*this.itemSize];return this.normalized&&(n=qs(n,this.array)),n}setX(e,n){return this.normalized&&(n=en(n,this.array)),this.array[e*this.itemSize]=n,this}getY(e){let n=this.array[e*this.itemSize+1];return this.normalized&&(n=qs(n,this.array)),n}setY(e,n){return this.normalized&&(n=en(n,this.array)),this.array[e*this.itemSize+1]=n,this}getZ(e){let n=this.array[e*this.itemSize+2];return this.normalized&&(n=qs(n,this.array)),n}setZ(e,n){return this.normalized&&(n=en(n,this.array)),this.array[e*this.itemSize+2]=n,this}getW(e){let n=this.array[e*this.itemSize+3];return this.normalized&&(n=qs(n,this.array)),n}setW(e,n){return this.normalized&&(n=en(n,this.array)),this.array[e*this.itemSize+3]=n,this}setXY(e,n,i){return e*=this.itemSize,this.normalized&&(n=en(n,this.array),i=en(i,this.array)),this.array[e+0]=n,this.array[e+1]=i,this}setXYZ(e,n,i,r){return e*=this.itemSize,this.normalized&&(n=en(n,this.array),i=en(i,this.array),r=en(r,this.array)),this.array[e+0]=n,this.array[e+1]=i,this.array[e+2]=r,this}setXYZW(e,n,i,r,s){return e*=this.itemSize,this.normalized&&(n=en(n,this.array),i=en(i,this.array),r=en(r,this.array),s=en(s,this.array)),this.array[e+0]=n,this.array[e+1]=i,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Rp&&(e.usage=this.usage),e}}class gx extends An{constructor(e,n,i){super(new Uint16Array(e),n,i)}}class xx extends An{constructor(e,n,i){super(new Uint32Array(e),n,i)}}class jt extends An{constructor(e,n,i){super(new Float32Array(e),n,i)}}let oS=0;const yn=new dt,qc=new $t,Gr=new U,dn=new Wa,Qs=new Wa,At=new U;class Nn extends Us{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:oS++}),this.uuid=Va(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(hx(e)?xx:gx)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,n){return this.attributes[e]=n,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,n,i=0){this.groups.push({start:e,count:n,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,n){this.drawRange.start=e,this.drawRange.count=n}applyMatrix4(e){const n=this.attributes.position;n!==void 0&&(n.applyMatrix4(e),n.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const s=new Be().getNormalMatrix(e);i.applyNormalMatrix(s),i.needsUpdate=!0}const r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return yn.makeRotationFromQuaternion(e),this.applyMatrix4(yn),this}rotateX(e){return yn.makeRotationX(e),this.applyMatrix4(yn),this}rotateY(e){return yn.makeRotationY(e),this.applyMatrix4(yn),this}rotateZ(e){return yn.makeRotationZ(e),this.applyMatrix4(yn),this}translate(e,n,i){return yn.makeTranslation(e,n,i),this.applyMatrix4(yn),this}scale(e,n,i){return yn.makeScale(e,n,i),this.applyMatrix4(yn),this}lookAt(e){return qc.lookAt(e),qc.updateMatrix(),this.applyMatrix4(qc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Gr).negate(),this.translate(Gr.x,Gr.y,Gr.z),this}setFromPoints(e){const n=[];for(let i=0,r=e.length;i<r;i++){const s=e[i];n.push(s.x,s.y,s.z||0)}return this.setAttribute("position",new jt(n,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Wa);const e=this.attributes.position,n=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new U(-1/0,-1/0,-1/0),new U(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),n)for(let i=0,r=n.length;i<r;i++){const s=n[i];dn.setFromBufferAttribute(s),this.morphTargetsRelative?(At.addVectors(this.boundingBox.min,dn.min),this.boundingBox.expandByPoint(At),At.addVectors(this.boundingBox.max,dn.max),this.boundingBox.expandByPoint(At)):(this.boundingBox.expandByPoint(dn.min),this.boundingBox.expandByPoint(dn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Yl);const e=this.attributes.position,n=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new U,1/0);return}if(e){const i=this.boundingSphere.center;if(dn.setFromBufferAttribute(e),n)for(let s=0,a=n.length;s<a;s++){const o=n[s];Qs.setFromBufferAttribute(o),this.morphTargetsRelative?(At.addVectors(dn.min,Qs.min),dn.expandByPoint(At),At.addVectors(dn.max,Qs.max),dn.expandByPoint(At)):(dn.expandByPoint(Qs.min),dn.expandByPoint(Qs.max))}dn.getCenter(i);let r=0;for(let s=0,a=e.count;s<a;s++)At.fromBufferAttribute(e,s),r=Math.max(r,i.distanceToSquared(At));if(n)for(let s=0,a=n.length;s<a;s++){const o=n[s],l=this.morphTargetsRelative;for(let u=0,h=o.count;u<h;u++)At.fromBufferAttribute(o,u),l&&(Gr.fromBufferAttribute(e,u),At.add(Gr)),r=Math.max(r,i.distanceToSquared(At))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,n=this.attributes;if(e===null||n.position===void 0||n.normal===void 0||n.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=n.position,r=n.normal,s=n.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new An(new Float32Array(4*i.count),4));const a=this.getAttribute("tangent"),o=[],l=[];for(let R=0;R<i.count;R++)o[R]=new U,l[R]=new U;const u=new U,h=new U,p=new U,f=new Ye,x=new Ye,_=new Ye,S=new U,m=new U;function d(R,F,y){u.fromBufferAttribute(i,R),h.fromBufferAttribute(i,F),p.fromBufferAttribute(i,y),f.fromBufferAttribute(s,R),x.fromBufferAttribute(s,F),_.fromBufferAttribute(s,y),h.sub(u),p.sub(u),x.sub(f),_.sub(f);const b=1/(x.x*_.y-_.x*x.y);isFinite(b)&&(S.copy(h).multiplyScalar(_.y).addScaledVector(p,-x.y).multiplyScalar(b),m.copy(p).multiplyScalar(x.x).addScaledVector(h,-_.x).multiplyScalar(b),o[R].add(S),o[F].add(S),o[y].add(S),l[R].add(m),l[F].add(m),l[y].add(m))}let g=this.groups;g.length===0&&(g=[{start:0,count:e.count}]);for(let R=0,F=g.length;R<F;++R){const y=g[R],b=y.start,H=y.count;for(let V=b,q=b+H;V<q;V+=3)d(e.getX(V+0),e.getX(V+1),e.getX(V+2))}const v=new U,w=new U,N=new U,E=new U;function A(R){N.fromBufferAttribute(r,R),E.copy(N);const F=o[R];v.copy(F),v.sub(N.multiplyScalar(N.dot(F))).normalize(),w.crossVectors(E,F);const b=w.dot(l[R])<0?-1:1;a.setXYZW(R,v.x,v.y,v.z,b)}for(let R=0,F=g.length;R<F;++R){const y=g[R],b=y.start,H=y.count;for(let V=b,q=b+H;V<q;V+=3)A(e.getX(V+0)),A(e.getX(V+1)),A(e.getX(V+2))}}computeVertexNormals(){const e=this.index,n=this.getAttribute("position");if(n!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new An(new Float32Array(n.count*3),3),this.setAttribute("normal",i);else for(let f=0,x=i.count;f<x;f++)i.setXYZ(f,0,0,0);const r=new U,s=new U,a=new U,o=new U,l=new U,u=new U,h=new U,p=new U;if(e)for(let f=0,x=e.count;f<x;f+=3){const _=e.getX(f+0),S=e.getX(f+1),m=e.getX(f+2);r.fromBufferAttribute(n,_),s.fromBufferAttribute(n,S),a.fromBufferAttribute(n,m),h.subVectors(a,s),p.subVectors(r,s),h.cross(p),o.fromBufferAttribute(i,_),l.fromBufferAttribute(i,S),u.fromBufferAttribute(i,m),o.add(h),l.add(h),u.add(h),i.setXYZ(_,o.x,o.y,o.z),i.setXYZ(S,l.x,l.y,l.z),i.setXYZ(m,u.x,u.y,u.z)}else for(let f=0,x=n.count;f<x;f+=3)r.fromBufferAttribute(n,f+0),s.fromBufferAttribute(n,f+1),a.fromBufferAttribute(n,f+2),h.subVectors(a,s),p.subVectors(r,s),h.cross(p),i.setXYZ(f+0,h.x,h.y,h.z),i.setXYZ(f+1,h.x,h.y,h.z),i.setXYZ(f+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let n=0,i=e.count;n<i;n++)At.fromBufferAttribute(e,n),At.normalize(),e.setXYZ(n,At.x,At.y,At.z)}toNonIndexed(){function e(o,l){const u=o.array,h=o.itemSize,p=o.normalized,f=new u.constructor(l.length*h);let x=0,_=0;for(let S=0,m=l.length;S<m;S++){o.isInterleavedBufferAttribute?x=l[S]*o.data.stride+o.offset:x=l[S]*h;for(let d=0;d<h;d++)f[_++]=u[x++]}return new An(f,h,p)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const n=new Nn,i=this.index.array,r=this.attributes;for(const o in r){const l=r[o],u=e(l,i);n.setAttribute(o,u)}const s=this.morphAttributes;for(const o in s){const l=[],u=s[o];for(let h=0,p=u.length;h<p;h++){const f=u[h],x=e(f,i);l.push(x)}n.morphAttributes[o]=l}n.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const u=a[o];n.addGroup(u.start,u.count,u.materialIndex)}return n}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const u in l)l[u]!==void 0&&(e[u]=l[u]);return e}e.data={attributes:{}};const n=this.index;n!==null&&(e.data.index={type:n.array.constructor.name,array:Array.prototype.slice.call(n.array)});const i=this.attributes;for(const l in i){const u=i[l];e.data.attributes[l]=u.toJSON(e.data)}const r={};let s=!1;for(const l in this.morphAttributes){const u=this.morphAttributes[l],h=[];for(let p=0,f=u.length;p<f;p++){const x=u[p];h.push(x.toJSON(e.data))}h.length>0&&(r[l]=h,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const n={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone(n));const r=e.attributes;for(const u in r){const h=r[u];this.setAttribute(u,h.clone(n))}const s=e.morphAttributes;for(const u in s){const h=[],p=s[u];for(let f=0,x=p.length;f<x;f++)h.push(p[f].clone(n));this.morphAttributes[u]=h}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let u=0,h=a.length;u<h;u++){const p=a[u];this.addGroup(p.start,p.count,p.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Vp=new dt,rr=new Yh,Mo=new Yl,Gp=new U,Eo=new U,bo=new U,To=new U,Yc=new U,Ao=new U,Wp=new U,Co=new U;class zt extends $t{constructor(e=new Nn,n=new Pi){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=n,this.updateMorphTargets()}copy(e,n){return super.copy(e,n),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const n=this.geometry.morphAttributes,i=Object.keys(n);if(i.length>0){const r=n[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=r.length;s<a;s++){const o=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}getVertexPosition(e,n){const i=this.geometry,r=i.attributes.position,s=i.morphAttributes.position,a=i.morphTargetsRelative;n.fromBufferAttribute(r,e);const o=this.morphTargetInfluences;if(s&&o){Ao.set(0,0,0);for(let l=0,u=s.length;l<u;l++){const h=o[l],p=s[l];h!==0&&(Yc.fromBufferAttribute(p,e),a?Ao.addScaledVector(Yc,h):Ao.addScaledVector(Yc.sub(n),h))}n.add(Ao)}return n}raycast(e,n){const i=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Mo.copy(i.boundingSphere),Mo.applyMatrix4(s),rr.copy(e.ray).recast(e.near),!(Mo.containsPoint(rr.origin)===!1&&(rr.intersectSphere(Mo,Gp)===null||rr.origin.distanceToSquared(Gp)>(e.far-e.near)**2))&&(Vp.copy(s).invert(),rr.copy(e.ray).applyMatrix4(Vp),!(i.boundingBox!==null&&rr.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,n,rr)))}_computeIntersections(e,n,i){let r;const s=this.geometry,a=this.material,o=s.index,l=s.attributes.position,u=s.attributes.uv,h=s.attributes.uv1,p=s.attributes.normal,f=s.groups,x=s.drawRange;if(o!==null)if(Array.isArray(a))for(let _=0,S=f.length;_<S;_++){const m=f[_],d=a[m.materialIndex],g=Math.max(m.start,x.start),v=Math.min(o.count,Math.min(m.start+m.count,x.start+x.count));for(let w=g,N=v;w<N;w+=3){const E=o.getX(w),A=o.getX(w+1),R=o.getX(w+2);r=Ro(this,d,e,i,u,h,p,E,A,R),r&&(r.faceIndex=Math.floor(w/3),r.face.materialIndex=m.materialIndex,n.push(r))}}else{const _=Math.max(0,x.start),S=Math.min(o.count,x.start+x.count);for(let m=_,d=S;m<d;m+=3){const g=o.getX(m),v=o.getX(m+1),w=o.getX(m+2);r=Ro(this,a,e,i,u,h,p,g,v,w),r&&(r.faceIndex=Math.floor(m/3),n.push(r))}}else if(l!==void 0)if(Array.isArray(a))for(let _=0,S=f.length;_<S;_++){const m=f[_],d=a[m.materialIndex],g=Math.max(m.start,x.start),v=Math.min(l.count,Math.min(m.start+m.count,x.start+x.count));for(let w=g,N=v;w<N;w+=3){const E=w,A=w+1,R=w+2;r=Ro(this,d,e,i,u,h,p,E,A,R),r&&(r.faceIndex=Math.floor(w/3),r.face.materialIndex=m.materialIndex,n.push(r))}}else{const _=Math.max(0,x.start),S=Math.min(l.count,x.start+x.count);for(let m=_,d=S;m<d;m+=3){const g=m,v=m+1,w=m+2;r=Ro(this,a,e,i,u,h,p,g,v,w),r&&(r.faceIndex=Math.floor(m/3),n.push(r))}}}}function lS(t,e,n,i,r,s,a,o){let l;if(e.side===qt?l=i.intersectTriangle(a,s,r,!0,o):l=i.intersectTriangle(r,s,a,e.side===$i,o),l===null)return null;Co.copy(o),Co.applyMatrix4(t.matrixWorld);const u=n.ray.origin.distanceTo(Co);return u<n.near||u>n.far?null:{distance:u,point:Co.clone(),object:t}}function Ro(t,e,n,i,r,s,a,o,l,u){t.getVertexPosition(o,Eo),t.getVertexPosition(l,bo),t.getVertexPosition(u,To);const h=lS(t,e,n,i,Eo,bo,To,Wp);if(h){const p=new U;Bn.getBarycoord(Wp,Eo,bo,To,p),r&&(h.uv=Bn.getInterpolatedAttribute(r,o,l,u,p,new Ye)),s&&(h.uv1=Bn.getInterpolatedAttribute(s,o,l,u,p,new Ye)),a&&(h.normal=Bn.getInterpolatedAttribute(a,o,l,u,p,new U),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));const f={a:o,b:l,c:u,normal:new U,materialIndex:0};Bn.getNormal(Eo,bo,To,f.normal),h.face=f,h.barycoord=p}return h}class Xa extends Nn{constructor(e=1,n=1,i=1,r=1,s=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:n,depth:i,widthSegments:r,heightSegments:s,depthSegments:a};const o=this;r=Math.floor(r),s=Math.floor(s),a=Math.floor(a);const l=[],u=[],h=[],p=[];let f=0,x=0;_("z","y","x",-1,-1,i,n,e,a,s,0),_("z","y","x",1,-1,i,n,-e,a,s,1),_("x","z","y",1,1,e,i,n,r,a,2),_("x","z","y",1,-1,e,i,-n,r,a,3),_("x","y","z",1,-1,e,n,i,r,s,4),_("x","y","z",-1,-1,e,n,-i,r,s,5),this.setIndex(l),this.setAttribute("position",new jt(u,3)),this.setAttribute("normal",new jt(h,3)),this.setAttribute("uv",new jt(p,2));function _(S,m,d,g,v,w,N,E,A,R,F){const y=w/A,b=N/R,H=w/2,V=N/2,q=E/2,Q=A+1,W=R+1;let $=0,D=0;const J=new U;for(let ee=0;ee<W;ee++){const O=ee*b-V;for(let oe=0;oe<Q;oe++){const Te=oe*y-H;J[S]=Te*g,J[m]=O*v,J[d]=q,u.push(J.x,J.y,J.z),J[S]=0,J[m]=0,J[d]=E>0?1:-1,h.push(J.x,J.y,J.z),p.push(oe/A),p.push(1-ee/R),$+=1}}for(let ee=0;ee<R;ee++)for(let O=0;O<A;O++){const oe=f+O+Q*ee,Te=f+O+Q*(ee+1),G=f+(O+1)+Q*(ee+1),ie=f+(O+1)+Q*ee;l.push(oe,Te,ie),l.push(Te,G,ie),D+=6}o.addGroup(x,D,F),x+=D,f+=$}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Xa(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Ps(t){const e={};for(const n in t){e[n]={};for(const i in t[n]){const r=t[n][i];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[n][i]=null):e[n][i]=r.clone():Array.isArray(r)?e[n][i]=r.slice():e[n][i]=r}}return e}function Gt(t){const e={};for(let n=0;n<t.length;n++){const i=Ps(t[n]);for(const r in i)e[r]=i[r]}return e}function cS(t){const e=[];for(let n=0;n<t.length;n++)e.push(t[n].clone());return e}function vx(t){const e=t.getRenderTarget();return e===null?t.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:tt.workingColorSpace}const uS={clone:Ps,merge:Gt};var dS=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,hS=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Ki extends Fs{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=dS,this.fragmentShader=hS,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ps(e.uniforms),this.uniformsGroups=cS(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const n=super.toJSON(e);n.glslVersion=this.glslVersion,n.uniforms={};for(const r in this.uniforms){const a=this.uniforms[r].value;a&&a.isTexture?n.uniforms[r]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?n.uniforms[r]={type:"c",value:a.getHex()}:a&&a.isVector2?n.uniforms[r]={type:"v2",value:a.toArray()}:a&&a.isVector3?n.uniforms[r]={type:"v3",value:a.toArray()}:a&&a.isVector4?n.uniforms[r]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?n.uniforms[r]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?n.uniforms[r]={type:"m4",value:a.toArray()}:n.uniforms[r]={value:a}}Object.keys(this.defines).length>0&&(n.defines=this.defines),n.vertexShader=this.vertexShader,n.fragmentShader=this.fragmentShader,n.lights=this.lights,n.clipping=this.clipping;const i={};for(const r in this.extensions)this.extensions[r]===!0&&(i[r]=!0);return Object.keys(i).length>0&&(n.extensions=i),n}}class _x extends $t{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new dt,this.projectionMatrix=new dt,this.projectionMatrixInverse=new dt,this.coordinateSystem=di}copy(e,n){return super.copy(e,n),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,n){super.updateWorldMatrix(e,n),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Ci=new U,Xp=new Ye,qp=new Ye;class fn extends _x{constructor(e=50,n=1,i=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=r,this.focus=10,this.aspect=n,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,n){return super.copy(e,n),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const n=.5*this.getFilmHeight()/e;this.fov=jd*2*Math.atan(n),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Ac*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return jd*2*Math.atan(Math.tan(Ac*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,n,i){Ci.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Ci.x,Ci.y).multiplyScalar(-e/Ci.z),Ci.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Ci.x,Ci.y).multiplyScalar(-e/Ci.z)}getViewSize(e,n){return this.getViewBounds(e,Xp,qp),n.subVectors(qp,Xp)}setViewOffset(e,n,i,r,s,a){this.aspect=e/n,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=n,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let n=e*Math.tan(Ac*.5*this.fov)/this.zoom,i=2*n,r=this.aspect*i,s=-.5*r;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,u=a.fullHeight;s+=a.offsetX*r/l,n-=a.offsetY*i/u,r*=a.width/l,i*=a.height/u}const o=this.filmOffset;o!==0&&(s+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,n,n-i,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const n=super.toJSON(e);return n.object.fov=this.fov,n.object.zoom=this.zoom,n.object.near=this.near,n.object.far=this.far,n.object.focus=this.focus,n.object.aspect=this.aspect,this.view!==null&&(n.object.view=Object.assign({},this.view)),n.object.filmGauge=this.filmGauge,n.object.filmOffset=this.filmOffset,n}}const Wr=-90,Xr=1;class fS extends $t{constructor(e,n,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const r=new fn(Wr,Xr,e,n);r.layers=this.layers,this.add(r);const s=new fn(Wr,Xr,e,n);s.layers=this.layers,this.add(s);const a=new fn(Wr,Xr,e,n);a.layers=this.layers,this.add(a);const o=new fn(Wr,Xr,e,n);o.layers=this.layers,this.add(o);const l=new fn(Wr,Xr,e,n);l.layers=this.layers,this.add(l);const u=new fn(Wr,Xr,e,n);u.layers=this.layers,this.add(u)}updateCoordinateSystem(){const e=this.coordinateSystem,n=this.children.concat(),[i,r,s,a,o,l]=n;for(const u of n)this.remove(u);if(e===di)i.up.set(0,1,0),i.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Cl)i.up.set(0,-1,0),i.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const u of n)this.add(u),u.updateMatrixWorld()}update(e,n){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[s,a,o,l,u,h]=this.children,p=e.getRenderTarget(),f=e.getActiveCubeFace(),x=e.getActiveMipmapLevel(),_=e.xr.enabled;e.xr.enabled=!1;const S=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,r),e.render(n,s),e.setRenderTarget(i,1,r),e.render(n,a),e.setRenderTarget(i,2,r),e.render(n,o),e.setRenderTarget(i,3,r),e.render(n,l),e.setRenderTarget(i,4,r),e.render(n,u),i.texture.generateMipmaps=S,e.setRenderTarget(i,5,r),e.render(n,h),e.setRenderTarget(p,f,x),e.xr.enabled=_,i.texture.needsPMREMUpdate=!0}}class yx extends Yt{constructor(e,n,i,r,s,a,o,l,u,h){e=e!==void 0?e:[],n=n!==void 0?n:As,super(e,n,i,r,s,a,o,l,u,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class pS extends Rr{constructor(e=1,n={}){super(e,e,n),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},r=[i,i,i,i,i,i];this.texture=new yx(r,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=n.generateMipmaps!==void 0?n.generateMipmaps:!1,this.texture.minFilter=n.minFilter!==void 0?n.minFilter:Mn}fromEquirectangularTexture(e,n){this.texture.type=n.type,this.texture.colorSpace=n.colorSpace,this.texture.generateMipmaps=n.generateMipmaps,this.texture.minFilter=n.minFilter,this.texture.magFilter=n.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},r=new Xa(5,5,5),s=new Ki({name:"CubemapFromEquirect",uniforms:Ps(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:qt,blending:Wi});s.uniforms.tEquirect.value=n;const a=new zt(r,s),o=n.minFilter;return n.minFilter===yr&&(n.minFilter=Mn),new fS(1,10,this).update(e,a),n.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,n,i,r){const s=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(n,i,r);e.setRenderTarget(s)}}const $c=new U,mS=new U,gS=new Be;class dr{constructor(e=new U(1,0,0),n=0){this.isPlane=!0,this.normal=e,this.constant=n}set(e,n){return this.normal.copy(e),this.constant=n,this}setComponents(e,n,i,r){return this.normal.set(e,n,i),this.constant=r,this}setFromNormalAndCoplanarPoint(e,n){return this.normal.copy(e),this.constant=-n.dot(this.normal),this}setFromCoplanarPoints(e,n,i){const r=$c.subVectors(i,n).cross(mS.subVectors(e,n)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,n){return n.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,n){const i=e.delta($c),r=this.normal.dot(i);if(r===0)return this.distanceToPoint(e.start)===0?n.copy(e.start):null;const s=-(e.start.dot(this.normal)+this.constant)/r;return s<0||s>1?null:n.copy(e.start).addScaledVector(i,s)}intersectsLine(e){const n=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return n<0&&i>0||i<0&&n>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,n){const i=n||gS.getNormalMatrix(e),r=this.coplanarPoint($c).applyMatrix4(e),s=this.normal.applyMatrix3(i).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const sr=new Yl,No=new U;class Kh{constructor(e=new dr,n=new dr,i=new dr,r=new dr,s=new dr,a=new dr){this.planes=[e,n,i,r,s,a]}set(e,n,i,r,s,a){const o=this.planes;return o[0].copy(e),o[1].copy(n),o[2].copy(i),o[3].copy(r),o[4].copy(s),o[5].copy(a),this}copy(e){const n=this.planes;for(let i=0;i<6;i++)n[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,n=di){const i=this.planes,r=e.elements,s=r[0],a=r[1],o=r[2],l=r[3],u=r[4],h=r[5],p=r[6],f=r[7],x=r[8],_=r[9],S=r[10],m=r[11],d=r[12],g=r[13],v=r[14],w=r[15];if(i[0].setComponents(l-s,f-u,m-x,w-d).normalize(),i[1].setComponents(l+s,f+u,m+x,w+d).normalize(),i[2].setComponents(l+a,f+h,m+_,w+g).normalize(),i[3].setComponents(l-a,f-h,m-_,w-g).normalize(),i[4].setComponents(l-o,f-p,m-S,w-v).normalize(),n===di)i[5].setComponents(l+o,f+p,m+S,w+v).normalize();else if(n===Cl)i[5].setComponents(o,p,S,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+n);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),sr.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const n=e.geometry;n.boundingSphere===null&&n.computeBoundingSphere(),sr.copy(n.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(sr)}intersectsSprite(e){return sr.center.set(0,0,0),sr.radius=.7071067811865476,sr.applyMatrix4(e.matrixWorld),this.intersectsSphere(sr)}intersectsSphere(e){const n=this.planes,i=e.center,r=-e.radius;for(let s=0;s<6;s++)if(n[s].distanceToPoint(i)<r)return!1;return!0}intersectsBox(e){const n=this.planes;for(let i=0;i<6;i++){const r=n[i];if(No.x=r.normal.x>0?e.max.x:e.min.x,No.y=r.normal.y>0?e.max.y:e.min.y,No.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(No)<0)return!1}return!0}containsPoint(e){const n=this.planes;for(let i=0;i<6;i++)if(n[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function Sx(){let t=null,e=!1,n=null,i=null;function r(s,a){n(s,a),i=t.requestAnimationFrame(r)}return{start:function(){e!==!0&&n!==null&&(i=t.requestAnimationFrame(r),e=!0)},stop:function(){t.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(s){n=s},setContext:function(s){t=s}}}function xS(t){const e=new WeakMap;function n(o,l){const u=o.array,h=o.usage,p=u.byteLength,f=t.createBuffer();t.bindBuffer(l,f),t.bufferData(l,u,h),o.onUploadCallback();let x;if(u instanceof Float32Array)x=t.FLOAT;else if(u instanceof Uint16Array)o.isFloat16BufferAttribute?x=t.HALF_FLOAT:x=t.UNSIGNED_SHORT;else if(u instanceof Int16Array)x=t.SHORT;else if(u instanceof Uint32Array)x=t.UNSIGNED_INT;else if(u instanceof Int32Array)x=t.INT;else if(u instanceof Int8Array)x=t.BYTE;else if(u instanceof Uint8Array)x=t.UNSIGNED_BYTE;else if(u instanceof Uint8ClampedArray)x=t.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+u);return{buffer:f,type:x,bytesPerElement:u.BYTES_PER_ELEMENT,version:o.version,size:p}}function i(o,l,u){const h=l.array,p=l.updateRanges;if(t.bindBuffer(u,o),p.length===0)t.bufferSubData(u,0,h);else{p.sort((x,_)=>x.start-_.start);let f=0;for(let x=1;x<p.length;x++){const _=p[f],S=p[x];S.start<=_.start+_.count+1?_.count=Math.max(_.count,S.start+S.count-_.start):(++f,p[f]=S)}p.length=f+1;for(let x=0,_=p.length;x<_;x++){const S=p[x];t.bufferSubData(u,S.start*h.BYTES_PER_ELEMENT,h,S.start,S.count)}l.clearUpdateRanges()}l.onUploadCallback()}function r(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function s(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=e.get(o);l&&(t.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const h=e.get(o);(!h||h.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const u=e.get(o);if(u===void 0)e.set(o,n(o,l));else if(u.version<o.version){if(u.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(u.buffer,o,l),u.version=o.version}}return{get:r,remove:s,update:a}}class Ls extends Nn{constructor(e=1,n=1,i=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:n,widthSegments:i,heightSegments:r};const s=e/2,a=n/2,o=Math.floor(i),l=Math.floor(r),u=o+1,h=l+1,p=e/o,f=n/l,x=[],_=[],S=[],m=[];for(let d=0;d<h;d++){const g=d*f-a;for(let v=0;v<u;v++){const w=v*p-s;_.push(w,-g,0),S.push(0,0,1),m.push(v/o),m.push(1-d/l)}}for(let d=0;d<l;d++)for(let g=0;g<o;g++){const v=g+u*d,w=g+u*(d+1),N=g+1+u*(d+1),E=g+1+u*d;x.push(v,w,E),x.push(w,N,E)}this.setIndex(x),this.setAttribute("position",new jt(_,3)),this.setAttribute("normal",new jt(S,3)),this.setAttribute("uv",new jt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ls(e.width,e.height,e.widthSegments,e.heightSegments)}}var vS=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,_S=`#ifdef USE_ALPHAHASH
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
#endif`,yS=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,SS=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,wS=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,MS=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,ES=`#ifdef USE_AOMAP
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
#endif`,bS=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,TS=`#ifdef USE_BATCHING
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
#endif`,AS=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,CS=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,RS=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,NS=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,PS=`#ifdef USE_IRIDESCENCE
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
#endif`,LS=`#ifdef USE_BUMPMAP
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
#endif`,DS=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,kS=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,IS=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,US=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,FS=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,OS=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,zS=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,BS=`#if defined( USE_COLOR_ALPHA )
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
#endif`,jS=`#define PI 3.141592653589793
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
} // validated`,HS=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,VS=`vec3 transformedNormal = objectNormal;
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
#endif`,GS=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,WS=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,XS=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,qS=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,YS="gl_FragColor = linearToOutputTexel( gl_FragColor );",$S=`
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
}`,KS=`#ifdef USE_ENVMAP
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
#endif`,ZS=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,QS=`#ifdef USE_ENVMAP
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
#endif`,JS=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,ew=`#ifdef USE_ENVMAP
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
#endif`,tw=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,nw=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,iw=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,rw=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,sw=`#ifdef USE_GRADIENTMAP
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
}`,aw=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,ow=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lw=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,cw=`uniform bool receiveShadow;
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
#endif`,uw=`#ifdef USE_ENVMAP
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
#endif`,dw=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,hw=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,fw=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,pw=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,mw=`PhysicalMaterial material;
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
#endif`,gw=`struct PhysicalMaterial {
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
}`,xw=`
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
#endif`,vw=`#if defined( RE_IndirectDiffuse )
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
#endif`,_w=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,yw=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Sw=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,ww=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Mw=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Ew=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,bw=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Tw=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Aw=`#if defined( USE_POINTS_UV )
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
#endif`,Cw=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Rw=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Nw=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Pw=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Lw=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Dw=`#ifdef USE_MORPHTARGETS
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
#endif`,kw=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Iw=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Uw=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Fw=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Ow=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,zw=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Bw=`#ifdef USE_NORMALMAP
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
#endif`,jw=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Hw=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Vw=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Gw=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Ww=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Xw=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,qw=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Yw=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,$w=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Kw=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Zw=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Qw=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Jw=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,eM=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,tM=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,nM=`float getShadowMask() {
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
}`,iM=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,rM=`#ifdef USE_SKINNING
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
#endif`,sM=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,aM=`#ifdef USE_SKINNING
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
#endif`,oM=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,lM=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,cM=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,uM=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,dM=`#ifdef USE_TRANSMISSION
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
#endif`,hM=`#ifdef USE_TRANSMISSION
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
#endif`,fM=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,pM=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,mM=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,gM=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const xM=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,vM=`uniform sampler2D t2D;
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
}`,_M=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,yM=`#ifdef ENVMAP_TYPE_CUBE
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
}`,SM=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,wM=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,MM=`#include <common>
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
}`,EM=`#if DEPTH_PACKING == 3200
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
}`,bM=`#define DISTANCE
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
}`,TM=`#define DISTANCE
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
}`,AM=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,CM=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,RM=`uniform float scale;
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
}`,NM=`uniform vec3 diffuse;
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
}`,PM=`#include <common>
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
}`,LM=`uniform vec3 diffuse;
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
}`,DM=`#define LAMBERT
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
}`,kM=`#define LAMBERT
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
}`,IM=`#define MATCAP
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
}`,UM=`#define MATCAP
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
}`,FM=`#define NORMAL
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
}`,OM=`#define NORMAL
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
}`,zM=`#define PHONG
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
}`,BM=`#define PHONG
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
}`,jM=`#define STANDARD
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
}`,HM=`#define STANDARD
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
}`,VM=`#define TOON
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
}`,GM=`#define TOON
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
}`,WM=`uniform float size;
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
}`,XM=`uniform vec3 diffuse;
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
}`,qM=`#include <common>
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
}`,YM=`uniform vec3 color;
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
}`,$M=`uniform float rotation;
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
}`,KM=`uniform vec3 diffuse;
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
}`,ze={alphahash_fragment:vS,alphahash_pars_fragment:_S,alphamap_fragment:yS,alphamap_pars_fragment:SS,alphatest_fragment:wS,alphatest_pars_fragment:MS,aomap_fragment:ES,aomap_pars_fragment:bS,batching_pars_vertex:TS,batching_vertex:AS,begin_vertex:CS,beginnormal_vertex:RS,bsdfs:NS,iridescence_fragment:PS,bumpmap_pars_fragment:LS,clipping_planes_fragment:DS,clipping_planes_pars_fragment:kS,clipping_planes_pars_vertex:IS,clipping_planes_vertex:US,color_fragment:FS,color_pars_fragment:OS,color_pars_vertex:zS,color_vertex:BS,common:jS,cube_uv_reflection_fragment:HS,defaultnormal_vertex:VS,displacementmap_pars_vertex:GS,displacementmap_vertex:WS,emissivemap_fragment:XS,emissivemap_pars_fragment:qS,colorspace_fragment:YS,colorspace_pars_fragment:$S,envmap_fragment:KS,envmap_common_pars_fragment:ZS,envmap_pars_fragment:QS,envmap_pars_vertex:JS,envmap_physical_pars_fragment:uw,envmap_vertex:ew,fog_vertex:tw,fog_pars_vertex:nw,fog_fragment:iw,fog_pars_fragment:rw,gradientmap_pars_fragment:sw,lightmap_pars_fragment:aw,lights_lambert_fragment:ow,lights_lambert_pars_fragment:lw,lights_pars_begin:cw,lights_toon_fragment:dw,lights_toon_pars_fragment:hw,lights_phong_fragment:fw,lights_phong_pars_fragment:pw,lights_physical_fragment:mw,lights_physical_pars_fragment:gw,lights_fragment_begin:xw,lights_fragment_maps:vw,lights_fragment_end:_w,logdepthbuf_fragment:yw,logdepthbuf_pars_fragment:Sw,logdepthbuf_pars_vertex:ww,logdepthbuf_vertex:Mw,map_fragment:Ew,map_pars_fragment:bw,map_particle_fragment:Tw,map_particle_pars_fragment:Aw,metalnessmap_fragment:Cw,metalnessmap_pars_fragment:Rw,morphinstance_vertex:Nw,morphcolor_vertex:Pw,morphnormal_vertex:Lw,morphtarget_pars_vertex:Dw,morphtarget_vertex:kw,normal_fragment_begin:Iw,normal_fragment_maps:Uw,normal_pars_fragment:Fw,normal_pars_vertex:Ow,normal_vertex:zw,normalmap_pars_fragment:Bw,clearcoat_normal_fragment_begin:jw,clearcoat_normal_fragment_maps:Hw,clearcoat_pars_fragment:Vw,iridescence_pars_fragment:Gw,opaque_fragment:Ww,packing:Xw,premultiplied_alpha_fragment:qw,project_vertex:Yw,dithering_fragment:$w,dithering_pars_fragment:Kw,roughnessmap_fragment:Zw,roughnessmap_pars_fragment:Qw,shadowmap_pars_fragment:Jw,shadowmap_pars_vertex:eM,shadowmap_vertex:tM,shadowmask_pars_fragment:nM,skinbase_vertex:iM,skinning_pars_vertex:rM,skinning_vertex:sM,skinnormal_vertex:aM,specularmap_fragment:oM,specularmap_pars_fragment:lM,tonemapping_fragment:cM,tonemapping_pars_fragment:uM,transmission_fragment:dM,transmission_pars_fragment:hM,uv_pars_fragment:fM,uv_pars_vertex:pM,uv_vertex:mM,worldpos_vertex:gM,background_vert:xM,background_frag:vM,backgroundCube_vert:_M,backgroundCube_frag:yM,cube_vert:SM,cube_frag:wM,depth_vert:MM,depth_frag:EM,distanceRGBA_vert:bM,distanceRGBA_frag:TM,equirect_vert:AM,equirect_frag:CM,linedashed_vert:RM,linedashed_frag:NM,meshbasic_vert:PM,meshbasic_frag:LM,meshlambert_vert:DM,meshlambert_frag:kM,meshmatcap_vert:IM,meshmatcap_frag:UM,meshnormal_vert:FM,meshnormal_frag:OM,meshphong_vert:zM,meshphong_frag:BM,meshphysical_vert:jM,meshphysical_frag:HM,meshtoon_vert:VM,meshtoon_frag:GM,points_vert:WM,points_frag:XM,shadow_vert:qM,shadow_frag:YM,sprite_vert:$M,sprite_frag:KM},pe={common:{diffuse:{value:new $e(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Be},alphaMap:{value:null},alphaMapTransform:{value:new Be},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Be}},envmap:{envMap:{value:null},envMapRotation:{value:new Be},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Be}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Be}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Be},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Be},normalScale:{value:new Ye(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Be},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Be}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Be}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Be}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new $e(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new $e(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Be},alphaTest:{value:0},uvTransform:{value:new Be}},sprite:{diffuse:{value:new $e(16777215)},opacity:{value:1},center:{value:new Ye(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Be},alphaMap:{value:null},alphaMapTransform:{value:new Be},alphaTest:{value:0}}},Yn={basic:{uniforms:Gt([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.fog]),vertexShader:ze.meshbasic_vert,fragmentShader:ze.meshbasic_frag},lambert:{uniforms:Gt([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,pe.lights,{emissive:{value:new $e(0)}}]),vertexShader:ze.meshlambert_vert,fragmentShader:ze.meshlambert_frag},phong:{uniforms:Gt([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,pe.lights,{emissive:{value:new $e(0)},specular:{value:new $e(1118481)},shininess:{value:30}}]),vertexShader:ze.meshphong_vert,fragmentShader:ze.meshphong_frag},standard:{uniforms:Gt([pe.common,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.roughnessmap,pe.metalnessmap,pe.fog,pe.lights,{emissive:{value:new $e(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:ze.meshphysical_vert,fragmentShader:ze.meshphysical_frag},toon:{uniforms:Gt([pe.common,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.gradientmap,pe.fog,pe.lights,{emissive:{value:new $e(0)}}]),vertexShader:ze.meshtoon_vert,fragmentShader:ze.meshtoon_frag},matcap:{uniforms:Gt([pe.common,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,{matcap:{value:null}}]),vertexShader:ze.meshmatcap_vert,fragmentShader:ze.meshmatcap_frag},points:{uniforms:Gt([pe.points,pe.fog]),vertexShader:ze.points_vert,fragmentShader:ze.points_frag},dashed:{uniforms:Gt([pe.common,pe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:ze.linedashed_vert,fragmentShader:ze.linedashed_frag},depth:{uniforms:Gt([pe.common,pe.displacementmap]),vertexShader:ze.depth_vert,fragmentShader:ze.depth_frag},normal:{uniforms:Gt([pe.common,pe.bumpmap,pe.normalmap,pe.displacementmap,{opacity:{value:1}}]),vertexShader:ze.meshnormal_vert,fragmentShader:ze.meshnormal_frag},sprite:{uniforms:Gt([pe.sprite,pe.fog]),vertexShader:ze.sprite_vert,fragmentShader:ze.sprite_frag},background:{uniforms:{uvTransform:{value:new Be},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:ze.background_vert,fragmentShader:ze.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Be}},vertexShader:ze.backgroundCube_vert,fragmentShader:ze.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:ze.cube_vert,fragmentShader:ze.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:ze.equirect_vert,fragmentShader:ze.equirect_frag},distanceRGBA:{uniforms:Gt([pe.common,pe.displacementmap,{referencePosition:{value:new U},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:ze.distanceRGBA_vert,fragmentShader:ze.distanceRGBA_frag},shadow:{uniforms:Gt([pe.lights,pe.fog,{color:{value:new $e(0)},opacity:{value:1}}]),vertexShader:ze.shadow_vert,fragmentShader:ze.shadow_frag}};Yn.physical={uniforms:Gt([Yn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Be},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Be},clearcoatNormalScale:{value:new Ye(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Be},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Be},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Be},sheen:{value:0},sheenColor:{value:new $e(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Be},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Be},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Be},transmissionSamplerSize:{value:new Ye},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Be},attenuationDistance:{value:0},attenuationColor:{value:new $e(0)},specularColor:{value:new $e(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Be},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Be},anisotropyVector:{value:new Ye},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Be}}]),vertexShader:ze.meshphysical_vert,fragmentShader:ze.meshphysical_frag};const Po={r:0,b:0,g:0},ar=new Qn,ZM=new dt;function QM(t,e,n,i,r,s,a){const o=new $e(0);let l=s===!0?0:1,u,h,p=null,f=0,x=null;function _(g){let v=g.isScene===!0?g.background:null;return v&&v.isTexture&&(v=(g.backgroundBlurriness>0?n:e).get(v)),v}function S(g){let v=!1;const w=_(g);w===null?d(o,l):w&&w.isColor&&(d(w,1),v=!0);const N=t.xr.getEnvironmentBlendMode();N==="additive"?i.buffers.color.setClear(0,0,0,1,a):N==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,a),(t.autoClear||v)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil))}function m(g,v){const w=_(v);w&&(w.isCubeTexture||w.mapping===Xl)?(h===void 0&&(h=new zt(new Xa(1,1,1),new Ki({name:"BackgroundCubeMaterial",uniforms:Ps(Yn.backgroundCube.uniforms),vertexShader:Yn.backgroundCube.vertexShader,fragmentShader:Yn.backgroundCube.fragmentShader,side:qt,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(N,E,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(h)),ar.copy(v.backgroundRotation),ar.x*=-1,ar.y*=-1,ar.z*=-1,w.isCubeTexture&&w.isRenderTargetTexture===!1&&(ar.y*=-1,ar.z*=-1),h.material.uniforms.envMap.value=w,h.material.uniforms.flipEnvMap.value=w.isCubeTexture&&w.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=v.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(ZM.makeRotationFromEuler(ar)),h.material.toneMapped=tt.getTransfer(w.colorSpace)!==ct,(p!==w||f!==w.version||x!==t.toneMapping)&&(h.material.needsUpdate=!0,p=w,f=w.version,x=t.toneMapping),h.layers.enableAll(),g.unshift(h,h.geometry,h.material,0,0,null)):w&&w.isTexture&&(u===void 0&&(u=new zt(new Ls(2,2),new Ki({name:"BackgroundMaterial",uniforms:Ps(Yn.background.uniforms),vertexShader:Yn.background.vertexShader,fragmentShader:Yn.background.fragmentShader,side:$i,depthTest:!1,depthWrite:!1,fog:!1})),u.geometry.deleteAttribute("normal"),Object.defineProperty(u.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(u)),u.material.uniforms.t2D.value=w,u.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,u.material.toneMapped=tt.getTransfer(w.colorSpace)!==ct,w.matrixAutoUpdate===!0&&w.updateMatrix(),u.material.uniforms.uvTransform.value.copy(w.matrix),(p!==w||f!==w.version||x!==t.toneMapping)&&(u.material.needsUpdate=!0,p=w,f=w.version,x=t.toneMapping),u.layers.enableAll(),g.unshift(u,u.geometry,u.material,0,0,null))}function d(g,v){g.getRGB(Po,vx(t)),i.buffers.color.setClear(Po.r,Po.g,Po.b,v,a)}return{getClearColor:function(){return o},setClearColor:function(g,v=1){o.set(g),l=v,d(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(g){l=g,d(o,l)},render:S,addToRenderList:m}}function JM(t,e){const n=t.getParameter(t.MAX_VERTEX_ATTRIBS),i={},r=f(null);let s=r,a=!1;function o(y,b,H,V,q){let Q=!1;const W=p(V,H,b);s!==W&&(s=W,u(s.object)),Q=x(y,V,H,q),Q&&_(y,V,H,q),q!==null&&e.update(q,t.ELEMENT_ARRAY_BUFFER),(Q||a)&&(a=!1,w(y,b,H,V),q!==null&&t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,e.get(q).buffer))}function l(){return t.createVertexArray()}function u(y){return t.bindVertexArray(y)}function h(y){return t.deleteVertexArray(y)}function p(y,b,H){const V=H.wireframe===!0;let q=i[y.id];q===void 0&&(q={},i[y.id]=q);let Q=q[b.id];Q===void 0&&(Q={},q[b.id]=Q);let W=Q[V];return W===void 0&&(W=f(l()),Q[V]=W),W}function f(y){const b=[],H=[],V=[];for(let q=0;q<n;q++)b[q]=0,H[q]=0,V[q]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:b,enabledAttributes:H,attributeDivisors:V,object:y,attributes:{},index:null}}function x(y,b,H,V){const q=s.attributes,Q=b.attributes;let W=0;const $=H.getAttributes();for(const D in $)if($[D].location>=0){const ee=q[D];let O=Q[D];if(O===void 0&&(D==="instanceMatrix"&&y.instanceMatrix&&(O=y.instanceMatrix),D==="instanceColor"&&y.instanceColor&&(O=y.instanceColor)),ee===void 0||ee.attribute!==O||O&&ee.data!==O.data)return!0;W++}return s.attributesNum!==W||s.index!==V}function _(y,b,H,V){const q={},Q=b.attributes;let W=0;const $=H.getAttributes();for(const D in $)if($[D].location>=0){let ee=Q[D];ee===void 0&&(D==="instanceMatrix"&&y.instanceMatrix&&(ee=y.instanceMatrix),D==="instanceColor"&&y.instanceColor&&(ee=y.instanceColor));const O={};O.attribute=ee,ee&&ee.data&&(O.data=ee.data),q[D]=O,W++}s.attributes=q,s.attributesNum=W,s.index=V}function S(){const y=s.newAttributes;for(let b=0,H=y.length;b<H;b++)y[b]=0}function m(y){d(y,0)}function d(y,b){const H=s.newAttributes,V=s.enabledAttributes,q=s.attributeDivisors;H[y]=1,V[y]===0&&(t.enableVertexAttribArray(y),V[y]=1),q[y]!==b&&(t.vertexAttribDivisor(y,b),q[y]=b)}function g(){const y=s.newAttributes,b=s.enabledAttributes;for(let H=0,V=b.length;H<V;H++)b[H]!==y[H]&&(t.disableVertexAttribArray(H),b[H]=0)}function v(y,b,H,V,q,Q,W){W===!0?t.vertexAttribIPointer(y,b,H,q,Q):t.vertexAttribPointer(y,b,H,V,q,Q)}function w(y,b,H,V){S();const q=V.attributes,Q=H.getAttributes(),W=b.defaultAttributeValues;for(const $ in Q){const D=Q[$];if(D.location>=0){let J=q[$];if(J===void 0&&($==="instanceMatrix"&&y.instanceMatrix&&(J=y.instanceMatrix),$==="instanceColor"&&y.instanceColor&&(J=y.instanceColor)),J!==void 0){const ee=J.normalized,O=J.itemSize,oe=e.get(J);if(oe===void 0)continue;const Te=oe.buffer,G=oe.type,ie=oe.bytesPerElement,ue=G===t.INT||G===t.UNSIGNED_INT||J.gpuType===jh;if(J.isInterleavedBufferAttribute){const me=J.data,Pe=me.stride,Le=J.offset;if(me.isInstancedInterleavedBuffer){for(let We=0;We<D.locationSize;We++)d(D.location+We,me.meshPerAttribute);y.isInstancedMesh!==!0&&V._maxInstanceCount===void 0&&(V._maxInstanceCount=me.meshPerAttribute*me.count)}else for(let We=0;We<D.locationSize;We++)m(D.location+We);t.bindBuffer(t.ARRAY_BUFFER,Te);for(let We=0;We<D.locationSize;We++)v(D.location+We,O/D.locationSize,G,ee,Pe*ie,(Le+O/D.locationSize*We)*ie,ue)}else{if(J.isInstancedBufferAttribute){for(let me=0;me<D.locationSize;me++)d(D.location+me,J.meshPerAttribute);y.isInstancedMesh!==!0&&V._maxInstanceCount===void 0&&(V._maxInstanceCount=J.meshPerAttribute*J.count)}else for(let me=0;me<D.locationSize;me++)m(D.location+me);t.bindBuffer(t.ARRAY_BUFFER,Te);for(let me=0;me<D.locationSize;me++)v(D.location+me,O/D.locationSize,G,ee,O*ie,O/D.locationSize*me*ie,ue)}}else if(W!==void 0){const ee=W[$];if(ee!==void 0)switch(ee.length){case 2:t.vertexAttrib2fv(D.location,ee);break;case 3:t.vertexAttrib3fv(D.location,ee);break;case 4:t.vertexAttrib4fv(D.location,ee);break;default:t.vertexAttrib1fv(D.location,ee)}}}}g()}function N(){R();for(const y in i){const b=i[y];for(const H in b){const V=b[H];for(const q in V)h(V[q].object),delete V[q];delete b[H]}delete i[y]}}function E(y){if(i[y.id]===void 0)return;const b=i[y.id];for(const H in b){const V=b[H];for(const q in V)h(V[q].object),delete V[q];delete b[H]}delete i[y.id]}function A(y){for(const b in i){const H=i[b];if(H[y.id]===void 0)continue;const V=H[y.id];for(const q in V)h(V[q].object),delete V[q];delete H[y.id]}}function R(){F(),a=!0,s!==r&&(s=r,u(s.object))}function F(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:o,reset:R,resetDefaultState:F,dispose:N,releaseStatesOfGeometry:E,releaseStatesOfProgram:A,initAttributes:S,enableAttribute:m,disableUnusedAttributes:g}}function eE(t,e,n){let i;function r(u){i=u}function s(u,h){t.drawArrays(i,u,h),n.update(h,i,1)}function a(u,h,p){p!==0&&(t.drawArraysInstanced(i,u,h,p),n.update(h,i,p))}function o(u,h,p){if(p===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,u,0,h,0,p);let x=0;for(let _=0;_<p;_++)x+=h[_];n.update(x,i,1)}function l(u,h,p,f){if(p===0)return;const x=e.get("WEBGL_multi_draw");if(x===null)for(let _=0;_<u.length;_++)a(u[_],h[_],f[_]);else{x.multiDrawArraysInstancedWEBGL(i,u,0,h,0,f,0,p);let _=0;for(let S=0;S<p;S++)_+=h[S];for(let S=0;S<f.length;S++)n.update(_,i,f[S])}}this.setMode=r,this.render=s,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function tE(t,e,n,i){let r;function s(){if(r!==void 0)return r;if(e.has("EXT_texture_filter_anisotropic")===!0){const A=e.get("EXT_texture_filter_anisotropic");r=t.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function a(A){return!(A!==jn&&i.convert(A)!==t.getParameter(t.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(A){const R=A===Ha&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(A!==vi&&i.convert(A)!==t.getParameter(t.IMPLEMENTATION_COLOR_READ_TYPE)&&A!==ui&&!R)}function l(A){if(A==="highp"){if(t.getShaderPrecisionFormat(t.VERTEX_SHADER,t.HIGH_FLOAT).precision>0&&t.getShaderPrecisionFormat(t.FRAGMENT_SHADER,t.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&t.getShaderPrecisionFormat(t.VERTEX_SHADER,t.MEDIUM_FLOAT).precision>0&&t.getShaderPrecisionFormat(t.FRAGMENT_SHADER,t.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let u=n.precision!==void 0?n.precision:"highp";const h=l(u);h!==u&&(console.warn("THREE.WebGLRenderer:",u,"not supported, using",h,"instead."),u=h);const p=n.logarithmicDepthBuffer===!0,f=n.reverseDepthBuffer===!0&&e.has("EXT_clip_control");if(f===!0){const A=e.get("EXT_clip_control");A.clipControlEXT(A.LOWER_LEFT_EXT,A.ZERO_TO_ONE_EXT)}const x=t.getParameter(t.MAX_TEXTURE_IMAGE_UNITS),_=t.getParameter(t.MAX_VERTEX_TEXTURE_IMAGE_UNITS),S=t.getParameter(t.MAX_TEXTURE_SIZE),m=t.getParameter(t.MAX_CUBE_MAP_TEXTURE_SIZE),d=t.getParameter(t.MAX_VERTEX_ATTRIBS),g=t.getParameter(t.MAX_VERTEX_UNIFORM_VECTORS),v=t.getParameter(t.MAX_VARYING_VECTORS),w=t.getParameter(t.MAX_FRAGMENT_UNIFORM_VECTORS),N=_>0,E=t.getParameter(t.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:u,logarithmicDepthBuffer:p,reverseDepthBuffer:f,maxTextures:x,maxVertexTextures:_,maxTextureSize:S,maxCubemapSize:m,maxAttributes:d,maxVertexUniforms:g,maxVaryings:v,maxFragmentUniforms:w,vertexTextures:N,maxSamples:E}}function nE(t){const e=this;let n=null,i=0,r=!1,s=!1;const a=new dr,o=new Be,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(p,f){const x=p.length!==0||f||i!==0||r;return r=f,i=p.length,x},this.beginShadows=function(){s=!0,h(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(p,f){n=h(p,f,0)},this.setState=function(p,f,x){const _=p.clippingPlanes,S=p.clipIntersection,m=p.clipShadows,d=t.get(p);if(!r||_===null||_.length===0||s&&!m)s?h(null):u();else{const g=s?0:i,v=g*4;let w=d.clippingState||null;l.value=w,w=h(_,f,v,x);for(let N=0;N!==v;++N)w[N]=n[N];d.clippingState=w,this.numIntersection=S?this.numPlanes:0,this.numPlanes+=g}};function u(){l.value!==n&&(l.value=n,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function h(p,f,x,_){const S=p!==null?p.length:0;let m=null;if(S!==0){if(m=l.value,_!==!0||m===null){const d=x+S*4,g=f.matrixWorldInverse;o.getNormalMatrix(g),(m===null||m.length<d)&&(m=new Float32Array(d));for(let v=0,w=x;v!==S;++v,w+=4)a.copy(p[v]).applyMatrix4(g,o),a.normal.toArray(m,w),m[w+3]=a.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=S,e.numIntersection=0,m}}function iE(t){let e=new WeakMap;function n(a,o){return o===dd?a.mapping=As:o===hd&&(a.mapping=Cs),a}function i(a){if(a&&a.isTexture){const o=a.mapping;if(o===dd||o===hd)if(e.has(a)){const l=e.get(a).texture;return n(l,a.mapping)}else{const l=a.image;if(l&&l.height>0){const u=new pS(l.height);return u.fromEquirectangularTexture(t,a),e.set(a,u),a.addEventListener("dispose",r),n(u.texture,a.mapping)}else return null}}return a}function r(a){const o=a.target;o.removeEventListener("dispose",r);const l=e.get(o);l!==void 0&&(e.delete(o),l.dispose())}function s(){e=new WeakMap}return{get:i,dispose:s}}class rE extends _x{constructor(e=-1,n=1,i=1,r=-1,s=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=n,this.top=i,this.bottom=r,this.near=s,this.far=a,this.updateProjectionMatrix()}copy(e,n){return super.copy(e,n),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,n,i,r,s,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=n,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),n=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,r=(this.top+this.bottom)/2;let s=i-e,a=i+e,o=r+n,l=r-n;if(this.view!==null&&this.view.enabled){const u=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=u*this.view.offsetX,a=s+u*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(s,a,o,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const n=super.toJSON(e);return n.object.zoom=this.zoom,n.object.left=this.left,n.object.right=this.right,n.object.top=this.top,n.object.bottom=this.bottom,n.object.near=this.near,n.object.far=this.far,this.view!==null&&(n.object.view=Object.assign({},this.view)),n}}const as=4,Yp=[.125,.215,.35,.446,.526,.582],pr=20,Kc=new rE,$p=new $e;let Zc=null,Qc=0,Jc=0,eu=!1;const hr=(1+Math.sqrt(5))/2,qr=1/hr,Kp=[new U(-hr,qr,0),new U(hr,qr,0),new U(-qr,0,hr),new U(qr,0,hr),new U(0,hr,-qr),new U(0,hr,qr),new U(-1,1,-1),new U(1,1,-1),new U(-1,1,1),new U(1,1,1)];class Zp{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,n=0,i=.1,r=100){Zc=this._renderer.getRenderTarget(),Qc=this._renderer.getActiveCubeFace(),Jc=this._renderer.getActiveMipmapLevel(),eu=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,i,r,s),n>0&&this._blur(s,0,0,n),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,n=null){return this._fromTexture(e,n)}fromCubemap(e,n=null){return this._fromTexture(e,n)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=em(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Jp(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Zc,Qc,Jc),this._renderer.xr.enabled=eu,e.scissorTest=!1,Lo(e,0,0,e.width,e.height)}_fromTexture(e,n){e.mapping===As||e.mapping===Cs?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Zc=this._renderer.getRenderTarget(),Qc=this._renderer.getActiveCubeFace(),Jc=this._renderer.getActiveMipmapLevel(),eu=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=n||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),n=4*this._cubeSize,i={magFilter:Mn,minFilter:Mn,generateMipmaps:!1,type:Ha,format:jn,colorSpace:er,depthBuffer:!1},r=Qp(e,n,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==n){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Qp(e,n,i);const{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=sE(s)),this._blurMaterial=aE(s,e,n)}return r}_compileMaterial(e){const n=new zt(this._lodPlanes[0],e);this._renderer.compile(n,Kc)}_sceneToCubeUV(e,n,i,r){const o=new fn(90,1,n,i),l=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],h=this._renderer,p=h.autoClear,f=h.toneMapping;h.getClearColor($p),h.toneMapping=Xi,h.autoClear=!1;const x=new Pi({name:"PMREM.Background",side:qt,depthWrite:!1,depthTest:!1}),_=new zt(new Xa,x);let S=!1;const m=e.background;m?m.isColor&&(x.color.copy(m),e.background=null,S=!0):(x.color.copy($p),S=!0);for(let d=0;d<6;d++){const g=d%3;g===0?(o.up.set(0,l[d],0),o.lookAt(u[d],0,0)):g===1?(o.up.set(0,0,l[d]),o.lookAt(0,u[d],0)):(o.up.set(0,l[d],0),o.lookAt(0,0,u[d]));const v=this._cubeSize;Lo(r,g*v,d>2?v:0,v,v),h.setRenderTarget(r),S&&h.render(_,o),h.render(e,o)}_.geometry.dispose(),_.material.dispose(),h.toneMapping=f,h.autoClear=p,e.background=m}_textureToCubeUV(e,n){const i=this._renderer,r=e.mapping===As||e.mapping===Cs;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=em()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Jp());const s=r?this._cubemapMaterial:this._equirectMaterial,a=new zt(this._lodPlanes[0],s),o=s.uniforms;o.envMap.value=e;const l=this._cubeSize;Lo(n,0,0,3*l,2*l),i.setRenderTarget(n),i.render(a,Kc)}_applyPMREM(e){const n=this._renderer,i=n.autoClear;n.autoClear=!1;const r=this._lodPlanes.length;for(let s=1;s<r;s++){const a=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),o=Kp[(r-s-1)%Kp.length];this._blur(e,s-1,s,a,o)}n.autoClear=i}_blur(e,n,i,r,s){const a=this._pingPongRenderTarget;this._halfBlur(e,a,n,i,r,"latitudinal",s),this._halfBlur(a,e,i,i,r,"longitudinal",s)}_halfBlur(e,n,i,r,s,a,o){const l=this._renderer,u=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,p=new zt(this._lodPlanes[r],u),f=u.uniforms,x=this._sizeLods[i]-1,_=isFinite(s)?Math.PI/(2*x):2*Math.PI/(2*pr-1),S=s/_,m=isFinite(s)?1+Math.floor(h*S):pr;m>pr&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${pr}`);const d=[];let g=0;for(let A=0;A<pr;++A){const R=A/S,F=Math.exp(-R*R/2);d.push(F),A===0?g+=F:A<m&&(g+=2*F)}for(let A=0;A<d.length;A++)d[A]=d[A]/g;f.envMap.value=e.texture,f.samples.value=m,f.weights.value=d,f.latitudinal.value=a==="latitudinal",o&&(f.poleAxis.value=o);const{_lodMax:v}=this;f.dTheta.value=_,f.mipInt.value=v-i;const w=this._sizeLods[r],N=3*w*(r>v-as?r-v+as:0),E=4*(this._cubeSize-w);Lo(n,N,E,3*w,2*w),l.setRenderTarget(n),l.render(p,Kc)}}function sE(t){const e=[],n=[],i=[];let r=t;const s=t-as+1+Yp.length;for(let a=0;a<s;a++){const o=Math.pow(2,r);n.push(o);let l=1/o;a>t-as?l=Yp[a-t+as-1]:a===0&&(l=0),i.push(l);const u=1/(o-2),h=-u,p=1+u,f=[h,h,p,h,p,p,h,h,p,p,h,p],x=6,_=6,S=3,m=2,d=1,g=new Float32Array(S*_*x),v=new Float32Array(m*_*x),w=new Float32Array(d*_*x);for(let E=0;E<x;E++){const A=E%3*2/3-1,R=E>2?0:-1,F=[A,R,0,A+2/3,R,0,A+2/3,R+1,0,A,R,0,A+2/3,R+1,0,A,R+1,0];g.set(F,S*_*E),v.set(f,m*_*E);const y=[E,E,E,E,E,E];w.set(y,d*_*E)}const N=new Nn;N.setAttribute("position",new An(g,S)),N.setAttribute("uv",new An(v,m)),N.setAttribute("faceIndex",new An(w,d)),e.push(N),r>as&&r--}return{lodPlanes:e,sizeLods:n,sigmas:i}}function Qp(t,e,n){const i=new Rr(t,e,n);return i.texture.mapping=Xl,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Lo(t,e,n,i,r){t.viewport.set(e,n,i,r),t.scissor.set(e,n,i,r)}function aE(t,e,n){const i=new Float32Array(pr),r=new U(0,1,0);return new Ki({name:"SphericalGaussianBlur",defines:{n:pr,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${t}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:Zh(),fragmentShader:`

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
		`,blending:Wi,depthTest:!1,depthWrite:!1})}function Jp(){return new Ki({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Zh(),fragmentShader:`

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
		`,blending:Wi,depthTest:!1,depthWrite:!1})}function em(){return new Ki({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Zh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Wi,depthTest:!1,depthWrite:!1})}function Zh(){return`

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
	`}function oE(t){let e=new WeakMap,n=null;function i(o){if(o&&o.isTexture){const l=o.mapping,u=l===dd||l===hd,h=l===As||l===Cs;if(u||h){let p=e.get(o);const f=p!==void 0?p.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==f)return n===null&&(n=new Zp(t)),p=u?n.fromEquirectangular(o,p):n.fromCubemap(o,p),p.texture.pmremVersion=o.pmremVersion,e.set(o,p),p.texture;if(p!==void 0)return p.texture;{const x=o.image;return u&&x&&x.height>0||h&&x&&r(x)?(n===null&&(n=new Zp(t)),p=u?n.fromEquirectangular(o):n.fromCubemap(o),p.texture.pmremVersion=o.pmremVersion,e.set(o,p),o.addEventListener("dispose",s),p.texture):null}}}return o}function r(o){let l=0;const u=6;for(let h=0;h<u;h++)o[h]!==void 0&&l++;return l===u}function s(o){const l=o.target;l.removeEventListener("dispose",s);const u=e.get(l);u!==void 0&&(e.delete(l),u.dispose())}function a(){e=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:i,dispose:a}}function lE(t){const e={};function n(i){if(e[i]!==void 0)return e[i];let r;switch(i){case"WEBGL_depth_texture":r=t.getExtension("WEBGL_depth_texture")||t.getExtension("MOZ_WEBGL_depth_texture")||t.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":r=t.getExtension("EXT_texture_filter_anisotropic")||t.getExtension("MOZ_EXT_texture_filter_anisotropic")||t.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":r=t.getExtension("WEBGL_compressed_texture_s3tc")||t.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||t.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":r=t.getExtension("WEBGL_compressed_texture_pvrtc")||t.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:r=t.getExtension(i)}return e[i]=r,r}return{has:function(i){return n(i)!==null},init:function(){n("EXT_color_buffer_float"),n("WEBGL_clip_cull_distance"),n("OES_texture_float_linear"),n("EXT_color_buffer_half_float"),n("WEBGL_multisampled_render_to_texture"),n("WEBGL_render_shared_exponent")},get:function(i){const r=n(i);return r===null&&Jo("THREE.WebGLRenderer: "+i+" extension not supported."),r}}}function cE(t,e,n,i){const r={},s=new WeakMap;function a(p){const f=p.target;f.index!==null&&e.remove(f.index);for(const _ in f.attributes)e.remove(f.attributes[_]);for(const _ in f.morphAttributes){const S=f.morphAttributes[_];for(let m=0,d=S.length;m<d;m++)e.remove(S[m])}f.removeEventListener("dispose",a),delete r[f.id];const x=s.get(f);x&&(e.remove(x),s.delete(f)),i.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,n.memory.geometries--}function o(p,f){return r[f.id]===!0||(f.addEventListener("dispose",a),r[f.id]=!0,n.memory.geometries++),f}function l(p){const f=p.attributes;for(const _ in f)e.update(f[_],t.ARRAY_BUFFER);const x=p.morphAttributes;for(const _ in x){const S=x[_];for(let m=0,d=S.length;m<d;m++)e.update(S[m],t.ARRAY_BUFFER)}}function u(p){const f=[],x=p.index,_=p.attributes.position;let S=0;if(x!==null){const g=x.array;S=x.version;for(let v=0,w=g.length;v<w;v+=3){const N=g[v+0],E=g[v+1],A=g[v+2];f.push(N,E,E,A,A,N)}}else if(_!==void 0){const g=_.array;S=_.version;for(let v=0,w=g.length/3-1;v<w;v+=3){const N=v+0,E=v+1,A=v+2;f.push(N,E,E,A,A,N)}}else return;const m=new(hx(f)?xx:gx)(f,1);m.version=S;const d=s.get(p);d&&e.remove(d),s.set(p,m)}function h(p){const f=s.get(p);if(f){const x=p.index;x!==null&&f.version<x.version&&u(p)}else u(p);return s.get(p)}return{get:o,update:l,getWireframeAttribute:h}}function uE(t,e,n){let i;function r(f){i=f}let s,a;function o(f){s=f.type,a=f.bytesPerElement}function l(f,x){t.drawElements(i,x,s,f*a),n.update(x,i,1)}function u(f,x,_){_!==0&&(t.drawElementsInstanced(i,x,s,f*a,_),n.update(x,i,_))}function h(f,x,_){if(_===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,x,0,s,f,0,_);let m=0;for(let d=0;d<_;d++)m+=x[d];n.update(m,i,1)}function p(f,x,_,S){if(_===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let d=0;d<f.length;d++)u(f[d]/a,x[d],S[d]);else{m.multiDrawElementsInstancedWEBGL(i,x,0,s,f,0,S,0,_);let d=0;for(let g=0;g<_;g++)d+=x[g];for(let g=0;g<S.length;g++)n.update(d,i,S[g])}}this.setMode=r,this.setIndex=o,this.render=l,this.renderInstances=u,this.renderMultiDraw=h,this.renderMultiDrawInstances=p}function dE(t){const e={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function i(s,a,o){switch(n.calls++,a){case t.TRIANGLES:n.triangles+=o*(s/3);break;case t.LINES:n.lines+=o*(s/2);break;case t.LINE_STRIP:n.lines+=o*(s-1);break;case t.LINE_LOOP:n.lines+=o*s;break;case t.POINTS:n.points+=o*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function r(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:e,render:n,programs:null,autoReset:!0,reset:r,update:i}}function hE(t,e,n){const i=new WeakMap,r=new st;function s(a,o,l){const u=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,p=h!==void 0?h.length:0;let f=i.get(o);if(f===void 0||f.count!==p){let y=function(){R.dispose(),i.delete(o),o.removeEventListener("dispose",y)};var x=y;f!==void 0&&f.texture.dispose();const _=o.morphAttributes.position!==void 0,S=o.morphAttributes.normal!==void 0,m=o.morphAttributes.color!==void 0,d=o.morphAttributes.position||[],g=o.morphAttributes.normal||[],v=o.morphAttributes.color||[];let w=0;_===!0&&(w=1),S===!0&&(w=2),m===!0&&(w=3);let N=o.attributes.position.count*w,E=1;N>e.maxTextureSize&&(E=Math.ceil(N/e.maxTextureSize),N=e.maxTextureSize);const A=new Float32Array(N*E*4*p),R=new px(A,N,E,p);R.type=ui,R.needsUpdate=!0;const F=w*4;for(let b=0;b<p;b++){const H=d[b],V=g[b],q=v[b],Q=N*E*4*b;for(let W=0;W<H.count;W++){const $=W*F;_===!0&&(r.fromBufferAttribute(H,W),A[Q+$+0]=r.x,A[Q+$+1]=r.y,A[Q+$+2]=r.z,A[Q+$+3]=0),S===!0&&(r.fromBufferAttribute(V,W),A[Q+$+4]=r.x,A[Q+$+5]=r.y,A[Q+$+6]=r.z,A[Q+$+7]=0),m===!0&&(r.fromBufferAttribute(q,W),A[Q+$+8]=r.x,A[Q+$+9]=r.y,A[Q+$+10]=r.z,A[Q+$+11]=q.itemSize===4?r.w:1)}}f={count:p,texture:R,size:new Ye(N,E)},i.set(o,f),o.addEventListener("dispose",y)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(t,"morphTexture",a.morphTexture,n);else{let _=0;for(let m=0;m<u.length;m++)_+=u[m];const S=o.morphTargetsRelative?1:1-_;l.getUniforms().setValue(t,"morphTargetBaseInfluence",S),l.getUniforms().setValue(t,"morphTargetInfluences",u)}l.getUniforms().setValue(t,"morphTargetsTexture",f.texture,n),l.getUniforms().setValue(t,"morphTargetsTextureSize",f.size)}return{update:s}}function fE(t,e,n,i){let r=new WeakMap;function s(l){const u=i.render.frame,h=l.geometry,p=e.get(l,h);if(r.get(p)!==u&&(e.update(p),r.set(p,u)),l.isInstancedMesh&&(l.hasEventListener("dispose",o)===!1&&l.addEventListener("dispose",o),r.get(l)!==u&&(n.update(l.instanceMatrix,t.ARRAY_BUFFER),l.instanceColor!==null&&n.update(l.instanceColor,t.ARRAY_BUFFER),r.set(l,u))),l.isSkinnedMesh){const f=l.skeleton;r.get(f)!==u&&(f.update(),r.set(f,u))}return p}function a(){r=new WeakMap}function o(l){const u=l.target;u.removeEventListener("dispose",o),n.remove(u.instanceMatrix),u.instanceColor!==null&&n.remove(u.instanceColor)}return{update:s,dispose:a}}class wx extends Yt{constructor(e,n,i,r,s,a,o,l,u,h=ps){if(h!==ps&&h!==Ns)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");i===void 0&&h===ps&&(i=Cr),i===void 0&&h===Ns&&(i=Rs),super(null,r,s,a,o,l,h,i,u),this.isDepthTexture=!0,this.image={width:e,height:n},this.magFilter=o!==void 0?o:bn,this.minFilter=l!==void 0?l:bn,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const n=super.toJSON(e);return this.compareFunction!==null&&(n.compareFunction=this.compareFunction),n}}const Mx=new Yt,tm=new wx(1,1),Ex=new px,bx=new Q1,Tx=new yx,nm=[],im=[],rm=new Float32Array(16),sm=new Float32Array(9),am=new Float32Array(4);function Os(t,e,n){const i=t[0];if(i<=0||i>0)return t;const r=e*n;let s=nm[r];if(s===void 0&&(s=new Float32Array(r),nm[r]=s),e!==0){i.toArray(s,0);for(let a=1,o=0;a!==e;++a)o+=n,t[a].toArray(s,o)}return s}function bt(t,e){if(t.length!==e.length)return!1;for(let n=0,i=t.length;n<i;n++)if(t[n]!==e[n])return!1;return!0}function Tt(t,e){for(let n=0,i=e.length;n<i;n++)t[n]=e[n]}function $l(t,e){let n=im[e];n===void 0&&(n=new Int32Array(e),im[e]=n);for(let i=0;i!==e;++i)n[i]=t.allocateTextureUnit();return n}function pE(t,e){const n=this.cache;n[0]!==e&&(t.uniform1f(this.addr,e),n[0]=e)}function mE(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(t.uniform2f(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(bt(n,e))return;t.uniform2fv(this.addr,e),Tt(n,e)}}function gE(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(t.uniform3f(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else if(e.r!==void 0)(n[0]!==e.r||n[1]!==e.g||n[2]!==e.b)&&(t.uniform3f(this.addr,e.r,e.g,e.b),n[0]=e.r,n[1]=e.g,n[2]=e.b);else{if(bt(n,e))return;t.uniform3fv(this.addr,e),Tt(n,e)}}function xE(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(t.uniform4f(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(bt(n,e))return;t.uniform4fv(this.addr,e),Tt(n,e)}}function vE(t,e){const n=this.cache,i=e.elements;if(i===void 0){if(bt(n,e))return;t.uniformMatrix2fv(this.addr,!1,e),Tt(n,e)}else{if(bt(n,i))return;am.set(i),t.uniformMatrix2fv(this.addr,!1,am),Tt(n,i)}}function _E(t,e){const n=this.cache,i=e.elements;if(i===void 0){if(bt(n,e))return;t.uniformMatrix3fv(this.addr,!1,e),Tt(n,e)}else{if(bt(n,i))return;sm.set(i),t.uniformMatrix3fv(this.addr,!1,sm),Tt(n,i)}}function yE(t,e){const n=this.cache,i=e.elements;if(i===void 0){if(bt(n,e))return;t.uniformMatrix4fv(this.addr,!1,e),Tt(n,e)}else{if(bt(n,i))return;rm.set(i),t.uniformMatrix4fv(this.addr,!1,rm),Tt(n,i)}}function SE(t,e){const n=this.cache;n[0]!==e&&(t.uniform1i(this.addr,e),n[0]=e)}function wE(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(t.uniform2i(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(bt(n,e))return;t.uniform2iv(this.addr,e),Tt(n,e)}}function ME(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(t.uniform3i(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else{if(bt(n,e))return;t.uniform3iv(this.addr,e),Tt(n,e)}}function EE(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(t.uniform4i(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(bt(n,e))return;t.uniform4iv(this.addr,e),Tt(n,e)}}function bE(t,e){const n=this.cache;n[0]!==e&&(t.uniform1ui(this.addr,e),n[0]=e)}function TE(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(t.uniform2ui(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(bt(n,e))return;t.uniform2uiv(this.addr,e),Tt(n,e)}}function AE(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(t.uniform3ui(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else{if(bt(n,e))return;t.uniform3uiv(this.addr,e),Tt(n,e)}}function CE(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(t.uniform4ui(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(bt(n,e))return;t.uniform4uiv(this.addr,e),Tt(n,e)}}function RE(t,e,n){const i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(t.uniform1i(this.addr,r),i[0]=r);let s;this.type===t.SAMPLER_2D_SHADOW?(tm.compareFunction=dx,s=tm):s=Mx,n.setTexture2D(e||s,r)}function NE(t,e,n){const i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(t.uniform1i(this.addr,r),i[0]=r),n.setTexture3D(e||bx,r)}function PE(t,e,n){const i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(t.uniform1i(this.addr,r),i[0]=r),n.setTextureCube(e||Tx,r)}function LE(t,e,n){const i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(t.uniform1i(this.addr,r),i[0]=r),n.setTexture2DArray(e||Ex,r)}function DE(t){switch(t){case 5126:return pE;case 35664:return mE;case 35665:return gE;case 35666:return xE;case 35674:return vE;case 35675:return _E;case 35676:return yE;case 5124:case 35670:return SE;case 35667:case 35671:return wE;case 35668:case 35672:return ME;case 35669:case 35673:return EE;case 5125:return bE;case 36294:return TE;case 36295:return AE;case 36296:return CE;case 35678:case 36198:case 36298:case 36306:case 35682:return RE;case 35679:case 36299:case 36307:return NE;case 35680:case 36300:case 36308:case 36293:return PE;case 36289:case 36303:case 36311:case 36292:return LE}}function kE(t,e){t.uniform1fv(this.addr,e)}function IE(t,e){const n=Os(e,this.size,2);t.uniform2fv(this.addr,n)}function UE(t,e){const n=Os(e,this.size,3);t.uniform3fv(this.addr,n)}function FE(t,e){const n=Os(e,this.size,4);t.uniform4fv(this.addr,n)}function OE(t,e){const n=Os(e,this.size,4);t.uniformMatrix2fv(this.addr,!1,n)}function zE(t,e){const n=Os(e,this.size,9);t.uniformMatrix3fv(this.addr,!1,n)}function BE(t,e){const n=Os(e,this.size,16);t.uniformMatrix4fv(this.addr,!1,n)}function jE(t,e){t.uniform1iv(this.addr,e)}function HE(t,e){t.uniform2iv(this.addr,e)}function VE(t,e){t.uniform3iv(this.addr,e)}function GE(t,e){t.uniform4iv(this.addr,e)}function WE(t,e){t.uniform1uiv(this.addr,e)}function XE(t,e){t.uniform2uiv(this.addr,e)}function qE(t,e){t.uniform3uiv(this.addr,e)}function YE(t,e){t.uniform4uiv(this.addr,e)}function $E(t,e,n){const i=this.cache,r=e.length,s=$l(n,r);bt(i,s)||(t.uniform1iv(this.addr,s),Tt(i,s));for(let a=0;a!==r;++a)n.setTexture2D(e[a]||Mx,s[a])}function KE(t,e,n){const i=this.cache,r=e.length,s=$l(n,r);bt(i,s)||(t.uniform1iv(this.addr,s),Tt(i,s));for(let a=0;a!==r;++a)n.setTexture3D(e[a]||bx,s[a])}function ZE(t,e,n){const i=this.cache,r=e.length,s=$l(n,r);bt(i,s)||(t.uniform1iv(this.addr,s),Tt(i,s));for(let a=0;a!==r;++a)n.setTextureCube(e[a]||Tx,s[a])}function QE(t,e,n){const i=this.cache,r=e.length,s=$l(n,r);bt(i,s)||(t.uniform1iv(this.addr,s),Tt(i,s));for(let a=0;a!==r;++a)n.setTexture2DArray(e[a]||Ex,s[a])}function JE(t){switch(t){case 5126:return kE;case 35664:return IE;case 35665:return UE;case 35666:return FE;case 35674:return OE;case 35675:return zE;case 35676:return BE;case 5124:case 35670:return jE;case 35667:case 35671:return HE;case 35668:case 35672:return VE;case 35669:case 35673:return GE;case 5125:return WE;case 36294:return XE;case 36295:return qE;case 36296:return YE;case 35678:case 36198:case 36298:case 36306:case 35682:return $E;case 35679:case 36299:case 36307:return KE;case 35680:case 36300:case 36308:case 36293:return ZE;case 36289:case 36303:case 36311:case 36292:return QE}}class eb{constructor(e,n,i){this.id=e,this.addr=i,this.cache=[],this.type=n.type,this.setValue=DE(n.type)}}class tb{constructor(e,n,i){this.id=e,this.addr=i,this.cache=[],this.type=n.type,this.size=n.size,this.setValue=JE(n.type)}}class nb{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,n,i){const r=this.seq;for(let s=0,a=r.length;s!==a;++s){const o=r[s];o.setValue(e,n[o.id],i)}}}const tu=/(\w+)(\])?(\[|\.)?/g;function om(t,e){t.seq.push(e),t.map[e.id]=e}function ib(t,e,n){const i=t.name,r=i.length;for(tu.lastIndex=0;;){const s=tu.exec(i),a=tu.lastIndex;let o=s[1];const l=s[2]==="]",u=s[3];if(l&&(o=o|0),u===void 0||u==="["&&a+2===r){om(n,u===void 0?new eb(o,t,e):new tb(o,t,e));break}else{let p=n.map[o];p===void 0&&(p=new nb(o),om(n,p)),n=p}}}class el{constructor(e,n){this.seq=[],this.map={};const i=e.getProgramParameter(n,e.ACTIVE_UNIFORMS);for(let r=0;r<i;++r){const s=e.getActiveUniform(n,r),a=e.getUniformLocation(n,s.name);ib(s,a,this)}}setValue(e,n,i,r){const s=this.map[n];s!==void 0&&s.setValue(e,i,r)}setOptional(e,n,i){const r=n[i];r!==void 0&&this.setValue(e,i,r)}static upload(e,n,i,r){for(let s=0,a=n.length;s!==a;++s){const o=n[s],l=i[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,r)}}static seqWithValue(e,n){const i=[];for(let r=0,s=e.length;r!==s;++r){const a=e[r];a.id in n&&i.push(a)}return i}}function lm(t,e,n){const i=t.createShader(e);return t.shaderSource(i,n),t.compileShader(i),i}const rb=37297;let sb=0;function ab(t,e){const n=t.split(`
`),i=[],r=Math.max(e-6,0),s=Math.min(e+6,n.length);for(let a=r;a<s;a++){const o=a+1;i.push(`${o===e?">":" "} ${o}: ${n[a]}`)}return i.join(`
`)}function ob(t){const e=tt.getPrimaries(tt.workingColorSpace),n=tt.getPrimaries(t);let i;switch(e===n?i="":e===Al&&n===Tl?i="LinearDisplayP3ToLinearSRGB":e===Tl&&n===Al&&(i="LinearSRGBToLinearDisplayP3"),t){case er:case ql:return[i,"LinearTransferOETF"];case qn:case qh:return[i,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",t),[i,"LinearTransferOETF"]}}function cm(t,e,n){const i=t.getShaderParameter(e,t.COMPILE_STATUS),r=t.getShaderInfoLog(e).trim();if(i&&r==="")return"";const s=/ERROR: 0:(\d+)/.exec(r);if(s){const a=parseInt(s[1]);return n.toUpperCase()+`

`+r+`

`+ab(t.getShaderSource(e),a)}else return r}function lb(t,e){const n=ob(e);return`vec4 ${t}( vec4 value ) { return ${n[0]}( ${n[1]}( value ) ); }`}function cb(t,e){let n;switch(e){case E1:n="Linear";break;case b1:n="Reinhard";break;case T1:n="Cineon";break;case A1:n="ACESFilmic";break;case R1:n="AgX";break;case N1:n="Neutral";break;case C1:n="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),n="Linear"}return"vec3 "+t+"( vec3 color ) { return "+n+"ToneMapping( color ); }"}const Do=new U;function ub(){tt.getLuminanceCoefficients(Do);const t=Do.x.toFixed(4),e=Do.y.toFixed(4),n=Do.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${t}, ${e}, ${n} );`,"	return dot( weights, rgb );","}"].join(`
`)}function db(t){return[t.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",t.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(ra).join(`
`)}function hb(t){const e=[];for(const n in t){const i=t[n];i!==!1&&e.push("#define "+n+" "+i)}return e.join(`
`)}function fb(t,e){const n={},i=t.getProgramParameter(e,t.ACTIVE_ATTRIBUTES);for(let r=0;r<i;r++){const s=t.getActiveAttrib(e,r),a=s.name;let o=1;s.type===t.FLOAT_MAT2&&(o=2),s.type===t.FLOAT_MAT3&&(o=3),s.type===t.FLOAT_MAT4&&(o=4),n[a]={type:s.type,location:t.getAttribLocation(e,a),locationSize:o}}return n}function ra(t){return t!==""}function um(t,e){const n=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return t.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function dm(t,e){return t.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const pb=/^[ \t]*#include +<([\w\d./]+)>/gm;function Hd(t){return t.replace(pb,gb)}const mb=new Map;function gb(t,e){let n=ze[e];if(n===void 0){const i=mb.get(e);if(i!==void 0)n=ze[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return Hd(n)}const xb=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function hm(t){return t.replace(xb,vb)}function vb(t,e,n,i){let r="";for(let s=parseInt(e);s<parseInt(n);s++)r+=i.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function fm(t){let e=`precision ${t.precision} float;
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
#define LOW_PRECISION`),e}function _b(t){let e="SHADOWMAP_TYPE_BASIC";return t.shadowMapType===Zg?e="SHADOWMAP_TYPE_PCF":t.shadowMapType===i1?e="SHADOWMAP_TYPE_PCF_SOFT":t.shadowMapType===si&&(e="SHADOWMAP_TYPE_VSM"),e}function yb(t){let e="ENVMAP_TYPE_CUBE";if(t.envMap)switch(t.envMapMode){case As:case Cs:e="ENVMAP_TYPE_CUBE";break;case Xl:e="ENVMAP_TYPE_CUBE_UV";break}return e}function Sb(t){let e="ENVMAP_MODE_REFLECTION";if(t.envMap)switch(t.envMapMode){case Cs:e="ENVMAP_MODE_REFRACTION";break}return e}function wb(t){let e="ENVMAP_BLENDING_NONE";if(t.envMap)switch(t.combine){case Qg:e="ENVMAP_BLENDING_MULTIPLY";break;case w1:e="ENVMAP_BLENDING_MIX";break;case M1:e="ENVMAP_BLENDING_ADD";break}return e}function Mb(t){const e=t.envMapCubeUVHeight;if(e===null)return null;const n=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,n),7*16)),texelHeight:i,maxMip:n}}function Eb(t,e,n,i){const r=t.getContext(),s=n.defines;let a=n.vertexShader,o=n.fragmentShader;const l=_b(n),u=yb(n),h=Sb(n),p=wb(n),f=Mb(n),x=db(n),_=hb(s),S=r.createProgram();let m,d,g=n.glslVersion?"#version "+n.glslVersion+`
`:"";n.isRawShaderMaterial?(m=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,_].filter(ra).join(`
`),m.length>0&&(m+=`
`),d=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,_].filter(ra).join(`
`),d.length>0&&(d+=`
`)):(m=[fm(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,_,n.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",n.batching?"#define USE_BATCHING":"",n.batchingColor?"#define USE_BATCHING_COLOR":"",n.instancing?"#define USE_INSTANCING":"",n.instancingColor?"#define USE_INSTANCING_COLOR":"",n.instancingMorph?"#define USE_INSTANCING_MORPH":"",n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.map?"#define USE_MAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+h:"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.displacementMap?"#define USE_DISPLACEMENTMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.mapUv?"#define MAP_UV "+n.mapUv:"",n.alphaMapUv?"#define ALPHAMAP_UV "+n.alphaMapUv:"",n.lightMapUv?"#define LIGHTMAP_UV "+n.lightMapUv:"",n.aoMapUv?"#define AOMAP_UV "+n.aoMapUv:"",n.emissiveMapUv?"#define EMISSIVEMAP_UV "+n.emissiveMapUv:"",n.bumpMapUv?"#define BUMPMAP_UV "+n.bumpMapUv:"",n.normalMapUv?"#define NORMALMAP_UV "+n.normalMapUv:"",n.displacementMapUv?"#define DISPLACEMENTMAP_UV "+n.displacementMapUv:"",n.metalnessMapUv?"#define METALNESSMAP_UV "+n.metalnessMapUv:"",n.roughnessMapUv?"#define ROUGHNESSMAP_UV "+n.roughnessMapUv:"",n.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+n.anisotropyMapUv:"",n.clearcoatMapUv?"#define CLEARCOATMAP_UV "+n.clearcoatMapUv:"",n.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+n.clearcoatNormalMapUv:"",n.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+n.clearcoatRoughnessMapUv:"",n.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+n.iridescenceMapUv:"",n.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+n.iridescenceThicknessMapUv:"",n.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+n.sheenColorMapUv:"",n.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+n.sheenRoughnessMapUv:"",n.specularMapUv?"#define SPECULARMAP_UV "+n.specularMapUv:"",n.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+n.specularColorMapUv:"",n.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+n.specularIntensityMapUv:"",n.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+n.transmissionMapUv:"",n.thicknessMapUv?"#define THICKNESSMAP_UV "+n.thicknessMapUv:"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.flatShading?"#define FLAT_SHADED":"",n.skinning?"#define USE_SKINNING":"",n.morphTargets?"#define USE_MORPHTARGETS":"",n.morphNormals&&n.flatShading===!1?"#define USE_MORPHNORMALS":"",n.morphColors?"#define USE_MORPHCOLORS":"",n.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+n.morphTextureStride:"",n.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+n.morphTargetsCount:"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+l:"",n.sizeAttenuation?"#define USE_SIZEATTENUATION":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",n.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(ra).join(`
`),d=[fm(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,_,n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",n.map?"#define USE_MAP":"",n.matcap?"#define USE_MATCAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+u:"",n.envMap?"#define "+h:"",n.envMap?"#define "+p:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoat?"#define USE_CLEARCOAT":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.dispersion?"#define USE_DISPERSION":"",n.iridescence?"#define USE_IRIDESCENCE":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaTest?"#define USE_ALPHATEST":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.sheen?"#define USE_SHEEN":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors||n.instancingColor||n.batchingColor?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.gradientMap?"#define USE_GRADIENTMAP":"",n.flatShading?"#define FLAT_SHADED":"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+l:"",n.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",n.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",n.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",n.toneMapping!==Xi?"#define TONE_MAPPING":"",n.toneMapping!==Xi?ze.tonemapping_pars_fragment:"",n.toneMapping!==Xi?cb("toneMapping",n.toneMapping):"",n.dithering?"#define DITHERING":"",n.opaque?"#define OPAQUE":"",ze.colorspace_pars_fragment,lb("linearToOutputTexel",n.outputColorSpace),ub(),n.useDepthPacking?"#define DEPTH_PACKING "+n.depthPacking:"",`
`].filter(ra).join(`
`)),a=Hd(a),a=um(a,n),a=dm(a,n),o=Hd(o),o=um(o,n),o=dm(o,n),a=hm(a),o=hm(o),n.isRawShaderMaterial!==!0&&(g=`#version 300 es
`,m=[x,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,d=["#define varying in",n.glslVersion===Np?"":"layout(location = 0) out highp vec4 pc_fragColor;",n.glslVersion===Np?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d);const v=g+m+a,w=g+d+o,N=lm(r,r.VERTEX_SHADER,v),E=lm(r,r.FRAGMENT_SHADER,w);r.attachShader(S,N),r.attachShader(S,E),n.index0AttributeName!==void 0?r.bindAttribLocation(S,0,n.index0AttributeName):n.morphTargets===!0&&r.bindAttribLocation(S,0,"position"),r.linkProgram(S);function A(b){if(t.debug.checkShaderErrors){const H=r.getProgramInfoLog(S).trim(),V=r.getShaderInfoLog(N).trim(),q=r.getShaderInfoLog(E).trim();let Q=!0,W=!0;if(r.getProgramParameter(S,r.LINK_STATUS)===!1)if(Q=!1,typeof t.debug.onShaderError=="function")t.debug.onShaderError(r,S,N,E);else{const $=cm(r,N,"vertex"),D=cm(r,E,"fragment");console.error("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(S,r.VALIDATE_STATUS)+`

Material Name: `+b.name+`
Material Type: `+b.type+`

Program Info Log: `+H+`
`+$+`
`+D)}else H!==""?console.warn("THREE.WebGLProgram: Program Info Log:",H):(V===""||q==="")&&(W=!1);W&&(b.diagnostics={runnable:Q,programLog:H,vertexShader:{log:V,prefix:m},fragmentShader:{log:q,prefix:d}})}r.deleteShader(N),r.deleteShader(E),R=new el(r,S),F=fb(r,S)}let R;this.getUniforms=function(){return R===void 0&&A(this),R};let F;this.getAttributes=function(){return F===void 0&&A(this),F};let y=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return y===!1&&(y=r.getProgramParameter(S,rb)),y},this.destroy=function(){i.releaseStatesOfProgram(this),r.deleteProgram(S),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=sb++,this.cacheKey=e,this.usedTimes=1,this.program=S,this.vertexShader=N,this.fragmentShader=E,this}let bb=0;class Tb{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const n=e.vertexShader,i=e.fragmentShader,r=this._getShaderStage(n),s=this._getShaderStage(i),a=this._getShaderCacheForMaterial(e);return a.has(r)===!1&&(a.add(r),r.usedTimes++),a.has(s)===!1&&(a.add(s),s.usedTimes++),this}remove(e){const n=this.materialCache.get(e);for(const i of n)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const n=this.materialCache;let i=n.get(e);return i===void 0&&(i=new Set,n.set(e,i)),i}_getShaderStage(e){const n=this.shaderCache;let i=n.get(e);return i===void 0&&(i=new Ab(e),n.set(e,i)),i}}class Ab{constructor(e){this.id=bb++,this.code=e,this.usedTimes=0}}function Cb(t,e,n,i,r,s,a){const o=new $h,l=new Tb,u=new Set,h=[],p=r.logarithmicDepthBuffer,f=r.reverseDepthBuffer,x=r.vertexTextures;let _=r.precision;const S={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function m(y){return u.add(y),y===0?"uv":`uv${y}`}function d(y,b,H,V,q){const Q=V.fog,W=q.geometry,$=y.isMeshStandardMaterial?V.environment:null,D=(y.isMeshStandardMaterial?n:e).get(y.envMap||$),J=D&&D.mapping===Xl?D.image.height:null,ee=S[y.type];y.precision!==null&&(_=r.getMaxPrecision(y.precision),_!==y.precision&&console.warn("THREE.WebGLProgram.getParameters:",y.precision,"not supported, using",_,"instead."));const O=W.morphAttributes.position||W.morphAttributes.normal||W.morphAttributes.color,oe=O!==void 0?O.length:0;let Te=0;W.morphAttributes.position!==void 0&&(Te=1),W.morphAttributes.normal!==void 0&&(Te=2),W.morphAttributes.color!==void 0&&(Te=3);let G,ie,ue,me;if(ee){const Jt=Yn[ee];G=Jt.vertexShader,ie=Jt.fragmentShader}else G=y.vertexShader,ie=y.fragmentShader,l.update(y),ue=l.getVertexShaderID(y),me=l.getFragmentShaderID(y);const Pe=t.getRenderTarget(),Le=q.isInstancedMesh===!0,We=q.isBatchedMesh===!0,Qe=!!y.map,je=!!y.matcap,P=!!D,Vt=!!y.aoMap,He=!!y.lightMap,Ve=!!y.bumpMap,De=!!y.normalMap,rt=!!y.displacementMap,Ne=!!y.emissiveMap,C=!!y.metalnessMap,M=!!y.roughnessMap,z=y.anisotropy>0,Z=y.clearcoat>0,ne=y.dispersion>0,Y=y.iridescence>0,Me=y.sheen>0,he=y.transmission>0,ve=z&&!!y.anisotropyMap,Xe=Z&&!!y.clearcoatMap,ae=Z&&!!y.clearcoatNormalMap,ye=Z&&!!y.clearcoatRoughnessMap,ke=Y&&!!y.iridescenceMap,te=Y&&!!y.iridescenceThicknessMap,re=Me&&!!y.sheenColorMap,Re=Me&&!!y.sheenRoughnessMap,Ce=!!y.specularMap,Oe=!!y.specularColorMap,L=!!y.specularIntensityMap,fe=he&&!!y.transmissionMap,X=he&&!!y.thicknessMap,K=!!y.gradientMap,ge=!!y.alphaMap,de=y.alphaTest>0,qe=!!y.alphaHash,ft=!!y.extensions;let Qt=Xi;y.toneMapped&&(Pe===null||Pe.isXRRenderTarget===!0)&&(Qt=t.toneMapping);const Ze={shaderID:ee,shaderType:y.type,shaderName:y.name,vertexShader:G,fragmentShader:ie,defines:y.defines,customVertexShaderID:ue,customFragmentShaderID:me,isRawShaderMaterial:y.isRawShaderMaterial===!0,glslVersion:y.glslVersion,precision:_,batching:We,batchingColor:We&&q._colorsTexture!==null,instancing:Le,instancingColor:Le&&q.instanceColor!==null,instancingMorph:Le&&q.morphTexture!==null,supportsVertexTextures:x,outputColorSpace:Pe===null?t.outputColorSpace:Pe.isXRRenderTarget===!0?Pe.texture.colorSpace:er,alphaToCoverage:!!y.alphaToCoverage,map:Qe,matcap:je,envMap:P,envMapMode:P&&D.mapping,envMapCubeUVHeight:J,aoMap:Vt,lightMap:He,bumpMap:Ve,normalMap:De,displacementMap:x&&rt,emissiveMap:Ne,normalMapObjectSpace:De&&y.normalMapType===k1,normalMapTangentSpace:De&&y.normalMapType===ux,metalnessMap:C,roughnessMap:M,anisotropy:z,anisotropyMap:ve,clearcoat:Z,clearcoatMap:Xe,clearcoatNormalMap:ae,clearcoatRoughnessMap:ye,dispersion:ne,iridescence:Y,iridescenceMap:ke,iridescenceThicknessMap:te,sheen:Me,sheenColorMap:re,sheenRoughnessMap:Re,specularMap:Ce,specularColorMap:Oe,specularIntensityMap:L,transmission:he,transmissionMap:fe,thicknessMap:X,gradientMap:K,opaque:y.transparent===!1&&y.blending===fs&&y.alphaToCoverage===!1,alphaMap:ge,alphaTest:de,alphaHash:qe,combine:y.combine,mapUv:Qe&&m(y.map.channel),aoMapUv:Vt&&m(y.aoMap.channel),lightMapUv:He&&m(y.lightMap.channel),bumpMapUv:Ve&&m(y.bumpMap.channel),normalMapUv:De&&m(y.normalMap.channel),displacementMapUv:rt&&m(y.displacementMap.channel),emissiveMapUv:Ne&&m(y.emissiveMap.channel),metalnessMapUv:C&&m(y.metalnessMap.channel),roughnessMapUv:M&&m(y.roughnessMap.channel),anisotropyMapUv:ve&&m(y.anisotropyMap.channel),clearcoatMapUv:Xe&&m(y.clearcoatMap.channel),clearcoatNormalMapUv:ae&&m(y.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ye&&m(y.clearcoatRoughnessMap.channel),iridescenceMapUv:ke&&m(y.iridescenceMap.channel),iridescenceThicknessMapUv:te&&m(y.iridescenceThicknessMap.channel),sheenColorMapUv:re&&m(y.sheenColorMap.channel),sheenRoughnessMapUv:Re&&m(y.sheenRoughnessMap.channel),specularMapUv:Ce&&m(y.specularMap.channel),specularColorMapUv:Oe&&m(y.specularColorMap.channel),specularIntensityMapUv:L&&m(y.specularIntensityMap.channel),transmissionMapUv:fe&&m(y.transmissionMap.channel),thicknessMapUv:X&&m(y.thicknessMap.channel),alphaMapUv:ge&&m(y.alphaMap.channel),vertexTangents:!!W.attributes.tangent&&(De||z),vertexColors:y.vertexColors,vertexAlphas:y.vertexColors===!0&&!!W.attributes.color&&W.attributes.color.itemSize===4,pointsUvs:q.isPoints===!0&&!!W.attributes.uv&&(Qe||ge),fog:!!Q,useFog:y.fog===!0,fogExp2:!!Q&&Q.isFogExp2,flatShading:y.flatShading===!0,sizeAttenuation:y.sizeAttenuation===!0,logarithmicDepthBuffer:p,reverseDepthBuffer:f,skinning:q.isSkinnedMesh===!0,morphTargets:W.morphAttributes.position!==void 0,morphNormals:W.morphAttributes.normal!==void 0,morphColors:W.morphAttributes.color!==void 0,morphTargetsCount:oe,morphTextureStride:Te,numDirLights:b.directional.length,numPointLights:b.point.length,numSpotLights:b.spot.length,numSpotLightMaps:b.spotLightMap.length,numRectAreaLights:b.rectArea.length,numHemiLights:b.hemi.length,numDirLightShadows:b.directionalShadowMap.length,numPointLightShadows:b.pointShadowMap.length,numSpotLightShadows:b.spotShadowMap.length,numSpotLightShadowsWithMaps:b.numSpotLightShadowsWithMaps,numLightProbes:b.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:y.dithering,shadowMapEnabled:t.shadowMap.enabled&&H.length>0,shadowMapType:t.shadowMap.type,toneMapping:Qt,decodeVideoTexture:Qe&&y.map.isVideoTexture===!0&&tt.getTransfer(y.map.colorSpace)===ct,premultipliedAlpha:y.premultipliedAlpha,doubleSided:y.side===zn,flipSided:y.side===qt,useDepthPacking:y.depthPacking>=0,depthPacking:y.depthPacking||0,index0AttributeName:y.index0AttributeName,extensionClipCullDistance:ft&&y.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ft&&y.extensions.multiDraw===!0||We)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:y.customProgramCacheKey()};return Ze.vertexUv1s=u.has(1),Ze.vertexUv2s=u.has(2),Ze.vertexUv3s=u.has(3),u.clear(),Ze}function g(y){const b=[];if(y.shaderID?b.push(y.shaderID):(b.push(y.customVertexShaderID),b.push(y.customFragmentShaderID)),y.defines!==void 0)for(const H in y.defines)b.push(H),b.push(y.defines[H]);return y.isRawShaderMaterial===!1&&(v(b,y),w(b,y),b.push(t.outputColorSpace)),b.push(y.customProgramCacheKey),b.join()}function v(y,b){y.push(b.precision),y.push(b.outputColorSpace),y.push(b.envMapMode),y.push(b.envMapCubeUVHeight),y.push(b.mapUv),y.push(b.alphaMapUv),y.push(b.lightMapUv),y.push(b.aoMapUv),y.push(b.bumpMapUv),y.push(b.normalMapUv),y.push(b.displacementMapUv),y.push(b.emissiveMapUv),y.push(b.metalnessMapUv),y.push(b.roughnessMapUv),y.push(b.anisotropyMapUv),y.push(b.clearcoatMapUv),y.push(b.clearcoatNormalMapUv),y.push(b.clearcoatRoughnessMapUv),y.push(b.iridescenceMapUv),y.push(b.iridescenceThicknessMapUv),y.push(b.sheenColorMapUv),y.push(b.sheenRoughnessMapUv),y.push(b.specularMapUv),y.push(b.specularColorMapUv),y.push(b.specularIntensityMapUv),y.push(b.transmissionMapUv),y.push(b.thicknessMapUv),y.push(b.combine),y.push(b.fogExp2),y.push(b.sizeAttenuation),y.push(b.morphTargetsCount),y.push(b.morphAttributeCount),y.push(b.numDirLights),y.push(b.numPointLights),y.push(b.numSpotLights),y.push(b.numSpotLightMaps),y.push(b.numHemiLights),y.push(b.numRectAreaLights),y.push(b.numDirLightShadows),y.push(b.numPointLightShadows),y.push(b.numSpotLightShadows),y.push(b.numSpotLightShadowsWithMaps),y.push(b.numLightProbes),y.push(b.shadowMapType),y.push(b.toneMapping),y.push(b.numClippingPlanes),y.push(b.numClipIntersection),y.push(b.depthPacking)}function w(y,b){o.disableAll(),b.supportsVertexTextures&&o.enable(0),b.instancing&&o.enable(1),b.instancingColor&&o.enable(2),b.instancingMorph&&o.enable(3),b.matcap&&o.enable(4),b.envMap&&o.enable(5),b.normalMapObjectSpace&&o.enable(6),b.normalMapTangentSpace&&o.enable(7),b.clearcoat&&o.enable(8),b.iridescence&&o.enable(9),b.alphaTest&&o.enable(10),b.vertexColors&&o.enable(11),b.vertexAlphas&&o.enable(12),b.vertexUv1s&&o.enable(13),b.vertexUv2s&&o.enable(14),b.vertexUv3s&&o.enable(15),b.vertexTangents&&o.enable(16),b.anisotropy&&o.enable(17),b.alphaHash&&o.enable(18),b.batching&&o.enable(19),b.dispersion&&o.enable(20),b.batchingColor&&o.enable(21),y.push(o.mask),o.disableAll(),b.fog&&o.enable(0),b.useFog&&o.enable(1),b.flatShading&&o.enable(2),b.logarithmicDepthBuffer&&o.enable(3),b.reverseDepthBuffer&&o.enable(4),b.skinning&&o.enable(5),b.morphTargets&&o.enable(6),b.morphNormals&&o.enable(7),b.morphColors&&o.enable(8),b.premultipliedAlpha&&o.enable(9),b.shadowMapEnabled&&o.enable(10),b.doubleSided&&o.enable(11),b.flipSided&&o.enable(12),b.useDepthPacking&&o.enable(13),b.dithering&&o.enable(14),b.transmission&&o.enable(15),b.sheen&&o.enable(16),b.opaque&&o.enable(17),b.pointsUvs&&o.enable(18),b.decodeVideoTexture&&o.enable(19),b.alphaToCoverage&&o.enable(20),y.push(o.mask)}function N(y){const b=S[y.type];let H;if(b){const V=Yn[b];H=uS.clone(V.uniforms)}else H=y.uniforms;return H}function E(y,b){let H;for(let V=0,q=h.length;V<q;V++){const Q=h[V];if(Q.cacheKey===b){H=Q,++H.usedTimes;break}}return H===void 0&&(H=new Eb(t,b,y,s),h.push(H)),H}function A(y){if(--y.usedTimes===0){const b=h.indexOf(y);h[b]=h[h.length-1],h.pop(),y.destroy()}}function R(y){l.remove(y)}function F(){l.dispose()}return{getParameters:d,getProgramCacheKey:g,getUniforms:N,acquireProgram:E,releaseProgram:A,releaseShaderCache:R,programs:h,dispose:F}}function Rb(){let t=new WeakMap;function e(a){return t.has(a)}function n(a){let o=t.get(a);return o===void 0&&(o={},t.set(a,o)),o}function i(a){t.delete(a)}function r(a,o,l){t.get(a)[o]=l}function s(){t=new WeakMap}return{has:e,get:n,remove:i,update:r,dispose:s}}function Nb(t,e){return t.groupOrder!==e.groupOrder?t.groupOrder-e.groupOrder:t.renderOrder!==e.renderOrder?t.renderOrder-e.renderOrder:t.material.id!==e.material.id?t.material.id-e.material.id:t.z!==e.z?t.z-e.z:t.id-e.id}function pm(t,e){return t.groupOrder!==e.groupOrder?t.groupOrder-e.groupOrder:t.renderOrder!==e.renderOrder?t.renderOrder-e.renderOrder:t.z!==e.z?e.z-t.z:t.id-e.id}function mm(){const t=[];let e=0;const n=[],i=[],r=[];function s(){e=0,n.length=0,i.length=0,r.length=0}function a(p,f,x,_,S,m){let d=t[e];return d===void 0?(d={id:p.id,object:p,geometry:f,material:x,groupOrder:_,renderOrder:p.renderOrder,z:S,group:m},t[e]=d):(d.id=p.id,d.object=p,d.geometry=f,d.material=x,d.groupOrder=_,d.renderOrder=p.renderOrder,d.z=S,d.group=m),e++,d}function o(p,f,x,_,S,m){const d=a(p,f,x,_,S,m);x.transmission>0?i.push(d):x.transparent===!0?r.push(d):n.push(d)}function l(p,f,x,_,S,m){const d=a(p,f,x,_,S,m);x.transmission>0?i.unshift(d):x.transparent===!0?r.unshift(d):n.unshift(d)}function u(p,f){n.length>1&&n.sort(p||Nb),i.length>1&&i.sort(f||pm),r.length>1&&r.sort(f||pm)}function h(){for(let p=e,f=t.length;p<f;p++){const x=t[p];if(x.id===null)break;x.id=null,x.object=null,x.geometry=null,x.material=null,x.group=null}}return{opaque:n,transmissive:i,transparent:r,init:s,push:o,unshift:l,finish:h,sort:u}}function Pb(){let t=new WeakMap;function e(i,r){const s=t.get(i);let a;return s===void 0?(a=new mm,t.set(i,[a])):r>=s.length?(a=new mm,s.push(a)):a=s[r],a}function n(){t=new WeakMap}return{get:e,dispose:n}}function Lb(){const t={};return{get:function(e){if(t[e.id]!==void 0)return t[e.id];let n;switch(e.type){case"DirectionalLight":n={direction:new U,color:new $e};break;case"SpotLight":n={position:new U,direction:new U,color:new $e,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":n={position:new U,color:new $e,distance:0,decay:0};break;case"HemisphereLight":n={direction:new U,skyColor:new $e,groundColor:new $e};break;case"RectAreaLight":n={color:new $e,position:new U,halfWidth:new U,halfHeight:new U};break}return t[e.id]=n,n}}}function Db(){const t={};return{get:function(e){if(t[e.id]!==void 0)return t[e.id];let n;switch(e.type){case"DirectionalLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ye};break;case"SpotLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ye};break;case"PointLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ye,shadowCameraNear:1,shadowCameraFar:1e3};break}return t[e.id]=n,n}}}let kb=0;function Ib(t,e){return(e.castShadow?2:0)-(t.castShadow?2:0)+(e.map?1:0)-(t.map?1:0)}function Ub(t){const e=new Lb,n=Db(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let u=0;u<9;u++)i.probe.push(new U);const r=new U,s=new dt,a=new dt;function o(u){let h=0,p=0,f=0;for(let F=0;F<9;F++)i.probe[F].set(0,0,0);let x=0,_=0,S=0,m=0,d=0,g=0,v=0,w=0,N=0,E=0,A=0;u.sort(Ib);for(let F=0,y=u.length;F<y;F++){const b=u[F],H=b.color,V=b.intensity,q=b.distance,Q=b.shadow&&b.shadow.map?b.shadow.map.texture:null;if(b.isAmbientLight)h+=H.r*V,p+=H.g*V,f+=H.b*V;else if(b.isLightProbe){for(let W=0;W<9;W++)i.probe[W].addScaledVector(b.sh.coefficients[W],V);A++}else if(b.isDirectionalLight){const W=e.get(b);if(W.color.copy(b.color).multiplyScalar(b.intensity),b.castShadow){const $=b.shadow,D=n.get(b);D.shadowIntensity=$.intensity,D.shadowBias=$.bias,D.shadowNormalBias=$.normalBias,D.shadowRadius=$.radius,D.shadowMapSize=$.mapSize,i.directionalShadow[x]=D,i.directionalShadowMap[x]=Q,i.directionalShadowMatrix[x]=b.shadow.matrix,g++}i.directional[x]=W,x++}else if(b.isSpotLight){const W=e.get(b);W.position.setFromMatrixPosition(b.matrixWorld),W.color.copy(H).multiplyScalar(V),W.distance=q,W.coneCos=Math.cos(b.angle),W.penumbraCos=Math.cos(b.angle*(1-b.penumbra)),W.decay=b.decay,i.spot[S]=W;const $=b.shadow;if(b.map&&(i.spotLightMap[N]=b.map,N++,$.updateMatrices(b),b.castShadow&&E++),i.spotLightMatrix[S]=$.matrix,b.castShadow){const D=n.get(b);D.shadowIntensity=$.intensity,D.shadowBias=$.bias,D.shadowNormalBias=$.normalBias,D.shadowRadius=$.radius,D.shadowMapSize=$.mapSize,i.spotShadow[S]=D,i.spotShadowMap[S]=Q,w++}S++}else if(b.isRectAreaLight){const W=e.get(b);W.color.copy(H).multiplyScalar(V),W.halfWidth.set(b.width*.5,0,0),W.halfHeight.set(0,b.height*.5,0),i.rectArea[m]=W,m++}else if(b.isPointLight){const W=e.get(b);if(W.color.copy(b.color).multiplyScalar(b.intensity),W.distance=b.distance,W.decay=b.decay,b.castShadow){const $=b.shadow,D=n.get(b);D.shadowIntensity=$.intensity,D.shadowBias=$.bias,D.shadowNormalBias=$.normalBias,D.shadowRadius=$.radius,D.shadowMapSize=$.mapSize,D.shadowCameraNear=$.camera.near,D.shadowCameraFar=$.camera.far,i.pointShadow[_]=D,i.pointShadowMap[_]=Q,i.pointShadowMatrix[_]=b.shadow.matrix,v++}i.point[_]=W,_++}else if(b.isHemisphereLight){const W=e.get(b);W.skyColor.copy(b.color).multiplyScalar(V),W.groundColor.copy(b.groundColor).multiplyScalar(V),i.hemi[d]=W,d++}}m>0&&(t.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=pe.LTC_FLOAT_1,i.rectAreaLTC2=pe.LTC_FLOAT_2):(i.rectAreaLTC1=pe.LTC_HALF_1,i.rectAreaLTC2=pe.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=p,i.ambient[2]=f;const R=i.hash;(R.directionalLength!==x||R.pointLength!==_||R.spotLength!==S||R.rectAreaLength!==m||R.hemiLength!==d||R.numDirectionalShadows!==g||R.numPointShadows!==v||R.numSpotShadows!==w||R.numSpotMaps!==N||R.numLightProbes!==A)&&(i.directional.length=x,i.spot.length=S,i.rectArea.length=m,i.point.length=_,i.hemi.length=d,i.directionalShadow.length=g,i.directionalShadowMap.length=g,i.pointShadow.length=v,i.pointShadowMap.length=v,i.spotShadow.length=w,i.spotShadowMap.length=w,i.directionalShadowMatrix.length=g,i.pointShadowMatrix.length=v,i.spotLightMatrix.length=w+N-E,i.spotLightMap.length=N,i.numSpotLightShadowsWithMaps=E,i.numLightProbes=A,R.directionalLength=x,R.pointLength=_,R.spotLength=S,R.rectAreaLength=m,R.hemiLength=d,R.numDirectionalShadows=g,R.numPointShadows=v,R.numSpotShadows=w,R.numSpotMaps=N,R.numLightProbes=A,i.version=kb++)}function l(u,h){let p=0,f=0,x=0,_=0,S=0;const m=h.matrixWorldInverse;for(let d=0,g=u.length;d<g;d++){const v=u[d];if(v.isDirectionalLight){const w=i.directional[p];w.direction.setFromMatrixPosition(v.matrixWorld),r.setFromMatrixPosition(v.target.matrixWorld),w.direction.sub(r),w.direction.transformDirection(m),p++}else if(v.isSpotLight){const w=i.spot[x];w.position.setFromMatrixPosition(v.matrixWorld),w.position.applyMatrix4(m),w.direction.setFromMatrixPosition(v.matrixWorld),r.setFromMatrixPosition(v.target.matrixWorld),w.direction.sub(r),w.direction.transformDirection(m),x++}else if(v.isRectAreaLight){const w=i.rectArea[_];w.position.setFromMatrixPosition(v.matrixWorld),w.position.applyMatrix4(m),a.identity(),s.copy(v.matrixWorld),s.premultiply(m),a.extractRotation(s),w.halfWidth.set(v.width*.5,0,0),w.halfHeight.set(0,v.height*.5,0),w.halfWidth.applyMatrix4(a),w.halfHeight.applyMatrix4(a),_++}else if(v.isPointLight){const w=i.point[f];w.position.setFromMatrixPosition(v.matrixWorld),w.position.applyMatrix4(m),f++}else if(v.isHemisphereLight){const w=i.hemi[S];w.direction.setFromMatrixPosition(v.matrixWorld),w.direction.transformDirection(m),S++}}}return{setup:o,setupView:l,state:i}}function gm(t){const e=new Ub(t),n=[],i=[];function r(h){u.camera=h,n.length=0,i.length=0}function s(h){n.push(h)}function a(h){i.push(h)}function o(){e.setup(n)}function l(h){e.setupView(n,h)}const u={lightsArray:n,shadowsArray:i,camera:null,lights:e,transmissionRenderTarget:{}};return{init:r,state:u,setupLights:o,setupLightsView:l,pushLight:s,pushShadow:a}}function Fb(t){let e=new WeakMap;function n(r,s=0){const a=e.get(r);let o;return a===void 0?(o=new gm(t),e.set(r,[o])):s>=a.length?(o=new gm(t),a.push(o)):o=a[s],o}function i(){e=new WeakMap}return{get:n,dispose:i}}class Ob extends Fs{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=L1,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class zb extends Fs{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const Bb=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,jb=`uniform sampler2D shadow_pass;
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
}`;function Hb(t,e,n){let i=new Kh;const r=new Ye,s=new Ye,a=new st,o=new Ob({depthPacking:D1}),l=new zb,u={},h=n.maxTextureSize,p={[$i]:qt,[qt]:$i,[zn]:zn},f=new Ki({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Ye},radius:{value:4}},vertexShader:Bb,fragmentShader:jb}),x=f.clone();x.defines.HORIZONTAL_PASS=1;const _=new Nn;_.setAttribute("position",new An(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const S=new zt(_,f),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Zg;let d=this.type;this.render=function(E,A,R){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||E.length===0)return;const F=t.getRenderTarget(),y=t.getActiveCubeFace(),b=t.getActiveMipmapLevel(),H=t.state;H.setBlending(Wi),H.buffers.color.setClear(1,1,1,1),H.buffers.depth.setTest(!0),H.setScissorTest(!1);const V=d!==si&&this.type===si,q=d===si&&this.type!==si;for(let Q=0,W=E.length;Q<W;Q++){const $=E[Q],D=$.shadow;if(D===void 0){console.warn("THREE.WebGLShadowMap:",$,"has no shadow.");continue}if(D.autoUpdate===!1&&D.needsUpdate===!1)continue;r.copy(D.mapSize);const J=D.getFrameExtents();if(r.multiply(J),s.copy(D.mapSize),(r.x>h||r.y>h)&&(r.x>h&&(s.x=Math.floor(h/J.x),r.x=s.x*J.x,D.mapSize.x=s.x),r.y>h&&(s.y=Math.floor(h/J.y),r.y=s.y*J.y,D.mapSize.y=s.y)),D.map===null||V===!0||q===!0){const O=this.type!==si?{minFilter:bn,magFilter:bn}:{};D.map!==null&&D.map.dispose(),D.map=new Rr(r.x,r.y,O),D.map.texture.name=$.name+".shadowMap",D.camera.updateProjectionMatrix()}t.setRenderTarget(D.map),t.clear();const ee=D.getViewportCount();for(let O=0;O<ee;O++){const oe=D.getViewport(O);a.set(s.x*oe.x,s.y*oe.y,s.x*oe.z,s.y*oe.w),H.viewport(a),D.updateMatrices($,O),i=D.getFrustum(),w(A,R,D.camera,$,this.type)}D.isPointLightShadow!==!0&&this.type===si&&g(D,R),D.needsUpdate=!1}d=this.type,m.needsUpdate=!1,t.setRenderTarget(F,y,b)};function g(E,A){const R=e.update(S);f.defines.VSM_SAMPLES!==E.blurSamples&&(f.defines.VSM_SAMPLES=E.blurSamples,x.defines.VSM_SAMPLES=E.blurSamples,f.needsUpdate=!0,x.needsUpdate=!0),E.mapPass===null&&(E.mapPass=new Rr(r.x,r.y)),f.uniforms.shadow_pass.value=E.map.texture,f.uniforms.resolution.value=E.mapSize,f.uniforms.radius.value=E.radius,t.setRenderTarget(E.mapPass),t.clear(),t.renderBufferDirect(A,null,R,f,S,null),x.uniforms.shadow_pass.value=E.mapPass.texture,x.uniforms.resolution.value=E.mapSize,x.uniforms.radius.value=E.radius,t.setRenderTarget(E.map),t.clear(),t.renderBufferDirect(A,null,R,x,S,null)}function v(E,A,R,F){let y=null;const b=R.isPointLight===!0?E.customDistanceMaterial:E.customDepthMaterial;if(b!==void 0)y=b;else if(y=R.isPointLight===!0?l:o,t.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0){const H=y.uuid,V=A.uuid;let q=u[H];q===void 0&&(q={},u[H]=q);let Q=q[V];Q===void 0&&(Q=y.clone(),q[V]=Q,A.addEventListener("dispose",N)),y=Q}if(y.visible=A.visible,y.wireframe=A.wireframe,F===si?y.side=A.shadowSide!==null?A.shadowSide:A.side:y.side=A.shadowSide!==null?A.shadowSide:p[A.side],y.alphaMap=A.alphaMap,y.alphaTest=A.alphaTest,y.map=A.map,y.clipShadows=A.clipShadows,y.clippingPlanes=A.clippingPlanes,y.clipIntersection=A.clipIntersection,y.displacementMap=A.displacementMap,y.displacementScale=A.displacementScale,y.displacementBias=A.displacementBias,y.wireframeLinewidth=A.wireframeLinewidth,y.linewidth=A.linewidth,R.isPointLight===!0&&y.isMeshDistanceMaterial===!0){const H=t.properties.get(y);H.light=R}return y}function w(E,A,R,F,y){if(E.visible===!1)return;if(E.layers.test(A.layers)&&(E.isMesh||E.isLine||E.isPoints)&&(E.castShadow||E.receiveShadow&&y===si)&&(!E.frustumCulled||i.intersectsObject(E))){E.modelViewMatrix.multiplyMatrices(R.matrixWorldInverse,E.matrixWorld);const V=e.update(E),q=E.material;if(Array.isArray(q)){const Q=V.groups;for(let W=0,$=Q.length;W<$;W++){const D=Q[W],J=q[D.materialIndex];if(J&&J.visible){const ee=v(E,J,F,y);E.onBeforeShadow(t,E,A,R,V,ee,D),t.renderBufferDirect(R,null,V,ee,E,D),E.onAfterShadow(t,E,A,R,V,ee,D)}}}else if(q.visible){const Q=v(E,q,F,y);E.onBeforeShadow(t,E,A,R,V,Q,null),t.renderBufferDirect(R,null,V,Q,E,null),E.onAfterShadow(t,E,A,R,V,Q,null)}}const H=E.children;for(let V=0,q=H.length;V<q;V++)w(H[V],A,R,F,y)}function N(E){E.target.removeEventListener("dispose",N);for(const R in u){const F=u[R],y=E.target.uuid;y in F&&(F[y].dispose(),delete F[y])}}}const Vb={[rd]:sd,[ad]:cd,[od]:ud,[Ts]:ld,[sd]:rd,[cd]:ad,[ud]:od,[ld]:Ts};function Gb(t){function e(){let L=!1;const fe=new st;let X=null;const K=new st(0,0,0,0);return{setMask:function(ge){X!==ge&&!L&&(t.colorMask(ge,ge,ge,ge),X=ge)},setLocked:function(ge){L=ge},setClear:function(ge,de,qe,ft,Qt){Qt===!0&&(ge*=ft,de*=ft,qe*=ft),fe.set(ge,de,qe,ft),K.equals(fe)===!1&&(t.clearColor(ge,de,qe,ft),K.copy(fe))},reset:function(){L=!1,X=null,K.set(-1,0,0,0)}}}function n(){let L=!1,fe=!1,X=null,K=null,ge=null;return{setReversed:function(de){fe=de},setTest:function(de){de?ue(t.DEPTH_TEST):me(t.DEPTH_TEST)},setMask:function(de){X!==de&&!L&&(t.depthMask(de),X=de)},setFunc:function(de){if(fe&&(de=Vb[de]),K!==de){switch(de){case rd:t.depthFunc(t.NEVER);break;case sd:t.depthFunc(t.ALWAYS);break;case ad:t.depthFunc(t.LESS);break;case Ts:t.depthFunc(t.LEQUAL);break;case od:t.depthFunc(t.EQUAL);break;case ld:t.depthFunc(t.GEQUAL);break;case cd:t.depthFunc(t.GREATER);break;case ud:t.depthFunc(t.NOTEQUAL);break;default:t.depthFunc(t.LEQUAL)}K=de}},setLocked:function(de){L=de},setClear:function(de){ge!==de&&(t.clearDepth(de),ge=de)},reset:function(){L=!1,X=null,K=null,ge=null}}}function i(){let L=!1,fe=null,X=null,K=null,ge=null,de=null,qe=null,ft=null,Qt=null;return{setTest:function(Ze){L||(Ze?ue(t.STENCIL_TEST):me(t.STENCIL_TEST))},setMask:function(Ze){fe!==Ze&&!L&&(t.stencilMask(Ze),fe=Ze)},setFunc:function(Ze,Jt,Jn){(X!==Ze||K!==Jt||ge!==Jn)&&(t.stencilFunc(Ze,Jt,Jn),X=Ze,K=Jt,ge=Jn)},setOp:function(Ze,Jt,Jn){(de!==Ze||qe!==Jt||ft!==Jn)&&(t.stencilOp(Ze,Jt,Jn),de=Ze,qe=Jt,ft=Jn)},setLocked:function(Ze){L=Ze},setClear:function(Ze){Qt!==Ze&&(t.clearStencil(Ze),Qt=Ze)},reset:function(){L=!1,fe=null,X=null,K=null,ge=null,de=null,qe=null,ft=null,Qt=null}}}const r=new e,s=new n,a=new i,o=new WeakMap,l=new WeakMap;let u={},h={},p=new WeakMap,f=[],x=null,_=!1,S=null,m=null,d=null,g=null,v=null,w=null,N=null,E=new $e(0,0,0),A=0,R=!1,F=null,y=null,b=null,H=null,V=null;const q=t.getParameter(t.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let Q=!1,W=0;const $=t.getParameter(t.VERSION);$.indexOf("WebGL")!==-1?(W=parseFloat(/^WebGL (\d)/.exec($)[1]),Q=W>=1):$.indexOf("OpenGL ES")!==-1&&(W=parseFloat(/^OpenGL ES (\d)/.exec($)[1]),Q=W>=2);let D=null,J={};const ee=t.getParameter(t.SCISSOR_BOX),O=t.getParameter(t.VIEWPORT),oe=new st().fromArray(ee),Te=new st().fromArray(O);function G(L,fe,X,K){const ge=new Uint8Array(4),de=t.createTexture();t.bindTexture(L,de),t.texParameteri(L,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(L,t.TEXTURE_MAG_FILTER,t.NEAREST);for(let qe=0;qe<X;qe++)L===t.TEXTURE_3D||L===t.TEXTURE_2D_ARRAY?t.texImage3D(fe,0,t.RGBA,1,1,K,0,t.RGBA,t.UNSIGNED_BYTE,ge):t.texImage2D(fe+qe,0,t.RGBA,1,1,0,t.RGBA,t.UNSIGNED_BYTE,ge);return de}const ie={};ie[t.TEXTURE_2D]=G(t.TEXTURE_2D,t.TEXTURE_2D,1),ie[t.TEXTURE_CUBE_MAP]=G(t.TEXTURE_CUBE_MAP,t.TEXTURE_CUBE_MAP_POSITIVE_X,6),ie[t.TEXTURE_2D_ARRAY]=G(t.TEXTURE_2D_ARRAY,t.TEXTURE_2D_ARRAY,1,1),ie[t.TEXTURE_3D]=G(t.TEXTURE_3D,t.TEXTURE_3D,1,1),r.setClear(0,0,0,1),s.setClear(1),a.setClear(0),ue(t.DEPTH_TEST),s.setFunc(Ts),He(!1),Ve(bp),ue(t.CULL_FACE),P(Wi);function ue(L){u[L]!==!0&&(t.enable(L),u[L]=!0)}function me(L){u[L]!==!1&&(t.disable(L),u[L]=!1)}function Pe(L,fe){return h[L]!==fe?(t.bindFramebuffer(L,fe),h[L]=fe,L===t.DRAW_FRAMEBUFFER&&(h[t.FRAMEBUFFER]=fe),L===t.FRAMEBUFFER&&(h[t.DRAW_FRAMEBUFFER]=fe),!0):!1}function Le(L,fe){let X=f,K=!1;if(L){X=p.get(fe),X===void 0&&(X=[],p.set(fe,X));const ge=L.textures;if(X.length!==ge.length||X[0]!==t.COLOR_ATTACHMENT0){for(let de=0,qe=ge.length;de<qe;de++)X[de]=t.COLOR_ATTACHMENT0+de;X.length=ge.length,K=!0}}else X[0]!==t.BACK&&(X[0]=t.BACK,K=!0);K&&t.drawBuffers(X)}function We(L){return x!==L?(t.useProgram(L),x=L,!0):!1}const Qe={[fr]:t.FUNC_ADD,[s1]:t.FUNC_SUBTRACT,[a1]:t.FUNC_REVERSE_SUBTRACT};Qe[o1]=t.MIN,Qe[l1]=t.MAX;const je={[c1]:t.ZERO,[u1]:t.ONE,[d1]:t.SRC_COLOR,[nd]:t.SRC_ALPHA,[x1]:t.SRC_ALPHA_SATURATE,[m1]:t.DST_COLOR,[f1]:t.DST_ALPHA,[h1]:t.ONE_MINUS_SRC_COLOR,[id]:t.ONE_MINUS_SRC_ALPHA,[g1]:t.ONE_MINUS_DST_COLOR,[p1]:t.ONE_MINUS_DST_ALPHA,[v1]:t.CONSTANT_COLOR,[_1]:t.ONE_MINUS_CONSTANT_COLOR,[y1]:t.CONSTANT_ALPHA,[S1]:t.ONE_MINUS_CONSTANT_ALPHA};function P(L,fe,X,K,ge,de,qe,ft,Qt,Ze){if(L===Wi){_===!0&&(me(t.BLEND),_=!1);return}if(_===!1&&(ue(t.BLEND),_=!0),L!==r1){if(L!==S||Ze!==R){if((m!==fr||v!==fr)&&(t.blendEquation(t.FUNC_ADD),m=fr,v=fr),Ze)switch(L){case fs:t.blendFuncSeparate(t.ONE,t.ONE_MINUS_SRC_ALPHA,t.ONE,t.ONE_MINUS_SRC_ALPHA);break;case td:t.blendFunc(t.ONE,t.ONE);break;case Tp:t.blendFuncSeparate(t.ZERO,t.ONE_MINUS_SRC_COLOR,t.ZERO,t.ONE);break;case Ap:t.blendFuncSeparate(t.ZERO,t.SRC_COLOR,t.ZERO,t.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",L);break}else switch(L){case fs:t.blendFuncSeparate(t.SRC_ALPHA,t.ONE_MINUS_SRC_ALPHA,t.ONE,t.ONE_MINUS_SRC_ALPHA);break;case td:t.blendFunc(t.SRC_ALPHA,t.ONE);break;case Tp:t.blendFuncSeparate(t.ZERO,t.ONE_MINUS_SRC_COLOR,t.ZERO,t.ONE);break;case Ap:t.blendFunc(t.ZERO,t.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",L);break}d=null,g=null,w=null,N=null,E.set(0,0,0),A=0,S=L,R=Ze}return}ge=ge||fe,de=de||X,qe=qe||K,(fe!==m||ge!==v)&&(t.blendEquationSeparate(Qe[fe],Qe[ge]),m=fe,v=ge),(X!==d||K!==g||de!==w||qe!==N)&&(t.blendFuncSeparate(je[X],je[K],je[de],je[qe]),d=X,g=K,w=de,N=qe),(ft.equals(E)===!1||Qt!==A)&&(t.blendColor(ft.r,ft.g,ft.b,Qt),E.copy(ft),A=Qt),S=L,R=!1}function Vt(L,fe){L.side===zn?me(t.CULL_FACE):ue(t.CULL_FACE);let X=L.side===qt;fe&&(X=!X),He(X),L.blending===fs&&L.transparent===!1?P(Wi):P(L.blending,L.blendEquation,L.blendSrc,L.blendDst,L.blendEquationAlpha,L.blendSrcAlpha,L.blendDstAlpha,L.blendColor,L.blendAlpha,L.premultipliedAlpha),s.setFunc(L.depthFunc),s.setTest(L.depthTest),s.setMask(L.depthWrite),r.setMask(L.colorWrite);const K=L.stencilWrite;a.setTest(K),K&&(a.setMask(L.stencilWriteMask),a.setFunc(L.stencilFunc,L.stencilRef,L.stencilFuncMask),a.setOp(L.stencilFail,L.stencilZFail,L.stencilZPass)),rt(L.polygonOffset,L.polygonOffsetFactor,L.polygonOffsetUnits),L.alphaToCoverage===!0?ue(t.SAMPLE_ALPHA_TO_COVERAGE):me(t.SAMPLE_ALPHA_TO_COVERAGE)}function He(L){F!==L&&(L?t.frontFace(t.CW):t.frontFace(t.CCW),F=L)}function Ve(L){L!==t1?(ue(t.CULL_FACE),L!==y&&(L===bp?t.cullFace(t.BACK):L===n1?t.cullFace(t.FRONT):t.cullFace(t.FRONT_AND_BACK))):me(t.CULL_FACE),y=L}function De(L){L!==b&&(Q&&t.lineWidth(L),b=L)}function rt(L,fe,X){L?(ue(t.POLYGON_OFFSET_FILL),(H!==fe||V!==X)&&(t.polygonOffset(fe,X),H=fe,V=X)):me(t.POLYGON_OFFSET_FILL)}function Ne(L){L?ue(t.SCISSOR_TEST):me(t.SCISSOR_TEST)}function C(L){L===void 0&&(L=t.TEXTURE0+q-1),D!==L&&(t.activeTexture(L),D=L)}function M(L,fe,X){X===void 0&&(D===null?X=t.TEXTURE0+q-1:X=D);let K=J[X];K===void 0&&(K={type:void 0,texture:void 0},J[X]=K),(K.type!==L||K.texture!==fe)&&(D!==X&&(t.activeTexture(X),D=X),t.bindTexture(L,fe||ie[L]),K.type=L,K.texture=fe)}function z(){const L=J[D];L!==void 0&&L.type!==void 0&&(t.bindTexture(L.type,null),L.type=void 0,L.texture=void 0)}function Z(){try{t.compressedTexImage2D.apply(t,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function ne(){try{t.compressedTexImage3D.apply(t,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Y(){try{t.texSubImage2D.apply(t,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Me(){try{t.texSubImage3D.apply(t,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function he(){try{t.compressedTexSubImage2D.apply(t,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function ve(){try{t.compressedTexSubImage3D.apply(t,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Xe(){try{t.texStorage2D.apply(t,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function ae(){try{t.texStorage3D.apply(t,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function ye(){try{t.texImage2D.apply(t,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function ke(){try{t.texImage3D.apply(t,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function te(L){oe.equals(L)===!1&&(t.scissor(L.x,L.y,L.z,L.w),oe.copy(L))}function re(L){Te.equals(L)===!1&&(t.viewport(L.x,L.y,L.z,L.w),Te.copy(L))}function Re(L,fe){let X=l.get(fe);X===void 0&&(X=new WeakMap,l.set(fe,X));let K=X.get(L);K===void 0&&(K=t.getUniformBlockIndex(fe,L.name),X.set(L,K))}function Ce(L,fe){const K=l.get(fe).get(L);o.get(fe)!==K&&(t.uniformBlockBinding(fe,K,L.__bindingPointIndex),o.set(fe,K))}function Oe(){t.disable(t.BLEND),t.disable(t.CULL_FACE),t.disable(t.DEPTH_TEST),t.disable(t.POLYGON_OFFSET_FILL),t.disable(t.SCISSOR_TEST),t.disable(t.STENCIL_TEST),t.disable(t.SAMPLE_ALPHA_TO_COVERAGE),t.blendEquation(t.FUNC_ADD),t.blendFunc(t.ONE,t.ZERO),t.blendFuncSeparate(t.ONE,t.ZERO,t.ONE,t.ZERO),t.blendColor(0,0,0,0),t.colorMask(!0,!0,!0,!0),t.clearColor(0,0,0,0),t.depthMask(!0),t.depthFunc(t.LESS),t.clearDepth(1),t.stencilMask(4294967295),t.stencilFunc(t.ALWAYS,0,4294967295),t.stencilOp(t.KEEP,t.KEEP,t.KEEP),t.clearStencil(0),t.cullFace(t.BACK),t.frontFace(t.CCW),t.polygonOffset(0,0),t.activeTexture(t.TEXTURE0),t.bindFramebuffer(t.FRAMEBUFFER,null),t.bindFramebuffer(t.DRAW_FRAMEBUFFER,null),t.bindFramebuffer(t.READ_FRAMEBUFFER,null),t.useProgram(null),t.lineWidth(1),t.scissor(0,0,t.canvas.width,t.canvas.height),t.viewport(0,0,t.canvas.width,t.canvas.height),u={},D=null,J={},h={},p=new WeakMap,f=[],x=null,_=!1,S=null,m=null,d=null,g=null,v=null,w=null,N=null,E=new $e(0,0,0),A=0,R=!1,F=null,y=null,b=null,H=null,V=null,oe.set(0,0,t.canvas.width,t.canvas.height),Te.set(0,0,t.canvas.width,t.canvas.height),r.reset(),s.reset(),a.reset()}return{buffers:{color:r,depth:s,stencil:a},enable:ue,disable:me,bindFramebuffer:Pe,drawBuffers:Le,useProgram:We,setBlending:P,setMaterial:Vt,setFlipSided:He,setCullFace:Ve,setLineWidth:De,setPolygonOffset:rt,setScissorTest:Ne,activeTexture:C,bindTexture:M,unbindTexture:z,compressedTexImage2D:Z,compressedTexImage3D:ne,texImage2D:ye,texImage3D:ke,updateUBOMapping:Re,uniformBlockBinding:Ce,texStorage2D:Xe,texStorage3D:ae,texSubImage2D:Y,texSubImage3D:Me,compressedTexSubImage2D:he,compressedTexSubImage3D:ve,scissor:te,viewport:re,reset:Oe}}function xm(t,e,n,i){const r=Wb(i);switch(n){case ix:return t*e;case sx:return t*e;case ax:return t*e*2;case ox:return t*e/r.components*r.byteLength;case Gh:return t*e/r.components*r.byteLength;case lx:return t*e*2/r.components*r.byteLength;case Wh:return t*e*2/r.components*r.byteLength;case rx:return t*e*3/r.components*r.byteLength;case jn:return t*e*4/r.components*r.byteLength;case Xh:return t*e*4/r.components*r.byteLength;case Yo:case $o:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*8;case Ko:case Zo:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*16;case gd:case vd:return Math.max(t,16)*Math.max(e,8)/4;case md:case xd:return Math.max(t,8)*Math.max(e,8)/2;case _d:case yd:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*8;case Sd:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*16;case wd:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*16;case Md:return Math.floor((t+4)/5)*Math.floor((e+3)/4)*16;case Ed:return Math.floor((t+4)/5)*Math.floor((e+4)/5)*16;case bd:return Math.floor((t+5)/6)*Math.floor((e+4)/5)*16;case Td:return Math.floor((t+5)/6)*Math.floor((e+5)/6)*16;case Ad:return Math.floor((t+7)/8)*Math.floor((e+4)/5)*16;case Cd:return Math.floor((t+7)/8)*Math.floor((e+5)/6)*16;case Rd:return Math.floor((t+7)/8)*Math.floor((e+7)/8)*16;case Nd:return Math.floor((t+9)/10)*Math.floor((e+4)/5)*16;case Pd:return Math.floor((t+9)/10)*Math.floor((e+5)/6)*16;case Ld:return Math.floor((t+9)/10)*Math.floor((e+7)/8)*16;case Dd:return Math.floor((t+9)/10)*Math.floor((e+9)/10)*16;case kd:return Math.floor((t+11)/12)*Math.floor((e+9)/10)*16;case Id:return Math.floor((t+11)/12)*Math.floor((e+11)/12)*16;case Qo:case Ud:case Fd:return Math.ceil(t/4)*Math.ceil(e/4)*16;case cx:case Od:return Math.ceil(t/4)*Math.ceil(e/4)*8;case zd:case Bd:return Math.ceil(t/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${n} format.`)}function Wb(t){switch(t){case vi:case ex:return{byteLength:1,components:1};case Ia:case tx:case Ha:return{byteLength:2,components:1};case Hh:case Vh:return{byteLength:2,components:4};case Cr:case jh:case ui:return{byteLength:4,components:1};case nx:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${t}.`)}function Xb(t,e,n,i,r,s,a){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),u=new Ye,h=new WeakMap;let p;const f=new WeakMap;let x=!1;try{x=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function _(C,M){return x?new OffscreenCanvas(C,M):Ua("canvas")}function S(C,M,z){let Z=1;const ne=Ne(C);if((ne.width>z||ne.height>z)&&(Z=z/Math.max(ne.width,ne.height)),Z<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){const Y=Math.floor(Z*ne.width),Me=Math.floor(Z*ne.height);p===void 0&&(p=_(Y,Me));const he=M?_(Y,Me):p;return he.width=Y,he.height=Me,he.getContext("2d").drawImage(C,0,0,Y,Me),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+ne.width+"x"+ne.height+") to ("+Y+"x"+Me+")."),he}else return"data"in C&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+ne.width+"x"+ne.height+")."),C;return C}function m(C){return C.generateMipmaps&&C.minFilter!==bn&&C.minFilter!==Mn}function d(C){t.generateMipmap(C)}function g(C,M,z,Z,ne=!1){if(C!==null){if(t[C]!==void 0)return t[C];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let Y=M;if(M===t.RED&&(z===t.FLOAT&&(Y=t.R32F),z===t.HALF_FLOAT&&(Y=t.R16F),z===t.UNSIGNED_BYTE&&(Y=t.R8)),M===t.RED_INTEGER&&(z===t.UNSIGNED_BYTE&&(Y=t.R8UI),z===t.UNSIGNED_SHORT&&(Y=t.R16UI),z===t.UNSIGNED_INT&&(Y=t.R32UI),z===t.BYTE&&(Y=t.R8I),z===t.SHORT&&(Y=t.R16I),z===t.INT&&(Y=t.R32I)),M===t.RG&&(z===t.FLOAT&&(Y=t.RG32F),z===t.HALF_FLOAT&&(Y=t.RG16F),z===t.UNSIGNED_BYTE&&(Y=t.RG8)),M===t.RG_INTEGER&&(z===t.UNSIGNED_BYTE&&(Y=t.RG8UI),z===t.UNSIGNED_SHORT&&(Y=t.RG16UI),z===t.UNSIGNED_INT&&(Y=t.RG32UI),z===t.BYTE&&(Y=t.RG8I),z===t.SHORT&&(Y=t.RG16I),z===t.INT&&(Y=t.RG32I)),M===t.RGB_INTEGER&&(z===t.UNSIGNED_BYTE&&(Y=t.RGB8UI),z===t.UNSIGNED_SHORT&&(Y=t.RGB16UI),z===t.UNSIGNED_INT&&(Y=t.RGB32UI),z===t.BYTE&&(Y=t.RGB8I),z===t.SHORT&&(Y=t.RGB16I),z===t.INT&&(Y=t.RGB32I)),M===t.RGBA_INTEGER&&(z===t.UNSIGNED_BYTE&&(Y=t.RGBA8UI),z===t.UNSIGNED_SHORT&&(Y=t.RGBA16UI),z===t.UNSIGNED_INT&&(Y=t.RGBA32UI),z===t.BYTE&&(Y=t.RGBA8I),z===t.SHORT&&(Y=t.RGBA16I),z===t.INT&&(Y=t.RGBA32I)),M===t.RGB&&z===t.UNSIGNED_INT_5_9_9_9_REV&&(Y=t.RGB9_E5),M===t.RGBA){const Me=ne?bl:tt.getTransfer(Z);z===t.FLOAT&&(Y=t.RGBA32F),z===t.HALF_FLOAT&&(Y=t.RGBA16F),z===t.UNSIGNED_BYTE&&(Y=Me===ct?t.SRGB8_ALPHA8:t.RGBA8),z===t.UNSIGNED_SHORT_4_4_4_4&&(Y=t.RGBA4),z===t.UNSIGNED_SHORT_5_5_5_1&&(Y=t.RGB5_A1)}return(Y===t.R16F||Y===t.R32F||Y===t.RG16F||Y===t.RG32F||Y===t.RGBA16F||Y===t.RGBA32F)&&e.get("EXT_color_buffer_float"),Y}function v(C,M){let z;return C?M===null||M===Cr||M===Rs?z=t.DEPTH24_STENCIL8:M===ui?z=t.DEPTH32F_STENCIL8:M===Ia&&(z=t.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):M===null||M===Cr||M===Rs?z=t.DEPTH_COMPONENT24:M===ui?z=t.DEPTH_COMPONENT32F:M===Ia&&(z=t.DEPTH_COMPONENT16),z}function w(C,M){return m(C)===!0||C.isFramebufferTexture&&C.minFilter!==bn&&C.minFilter!==Mn?Math.log2(Math.max(M.width,M.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?M.mipmaps.length:1}function N(C){const M=C.target;M.removeEventListener("dispose",N),A(M),M.isVideoTexture&&h.delete(M)}function E(C){const M=C.target;M.removeEventListener("dispose",E),F(M)}function A(C){const M=i.get(C);if(M.__webglInit===void 0)return;const z=C.source,Z=f.get(z);if(Z){const ne=Z[M.__cacheKey];ne.usedTimes--,ne.usedTimes===0&&R(C),Object.keys(Z).length===0&&f.delete(z)}i.remove(C)}function R(C){const M=i.get(C);t.deleteTexture(M.__webglTexture);const z=C.source,Z=f.get(z);delete Z[M.__cacheKey],a.memory.textures--}function F(C){const M=i.get(C);if(C.depthTexture&&C.depthTexture.dispose(),C.isWebGLCubeRenderTarget)for(let Z=0;Z<6;Z++){if(Array.isArray(M.__webglFramebuffer[Z]))for(let ne=0;ne<M.__webglFramebuffer[Z].length;ne++)t.deleteFramebuffer(M.__webglFramebuffer[Z][ne]);else t.deleteFramebuffer(M.__webglFramebuffer[Z]);M.__webglDepthbuffer&&t.deleteRenderbuffer(M.__webglDepthbuffer[Z])}else{if(Array.isArray(M.__webglFramebuffer))for(let Z=0;Z<M.__webglFramebuffer.length;Z++)t.deleteFramebuffer(M.__webglFramebuffer[Z]);else t.deleteFramebuffer(M.__webglFramebuffer);if(M.__webglDepthbuffer&&t.deleteRenderbuffer(M.__webglDepthbuffer),M.__webglMultisampledFramebuffer&&t.deleteFramebuffer(M.__webglMultisampledFramebuffer),M.__webglColorRenderbuffer)for(let Z=0;Z<M.__webglColorRenderbuffer.length;Z++)M.__webglColorRenderbuffer[Z]&&t.deleteRenderbuffer(M.__webglColorRenderbuffer[Z]);M.__webglDepthRenderbuffer&&t.deleteRenderbuffer(M.__webglDepthRenderbuffer)}const z=C.textures;for(let Z=0,ne=z.length;Z<ne;Z++){const Y=i.get(z[Z]);Y.__webglTexture&&(t.deleteTexture(Y.__webglTexture),a.memory.textures--),i.remove(z[Z])}i.remove(C)}let y=0;function b(){y=0}function H(){const C=y;return C>=r.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+C+" texture units while this GPU supports only "+r.maxTextures),y+=1,C}function V(C){const M=[];return M.push(C.wrapS),M.push(C.wrapT),M.push(C.wrapR||0),M.push(C.magFilter),M.push(C.minFilter),M.push(C.anisotropy),M.push(C.internalFormat),M.push(C.format),M.push(C.type),M.push(C.generateMipmaps),M.push(C.premultiplyAlpha),M.push(C.flipY),M.push(C.unpackAlignment),M.push(C.colorSpace),M.join()}function q(C,M){const z=i.get(C);if(C.isVideoTexture&&De(C),C.isRenderTargetTexture===!1&&C.version>0&&z.__version!==C.version){const Z=C.image;if(Z===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(Z.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Te(z,C,M);return}}n.bindTexture(t.TEXTURE_2D,z.__webglTexture,t.TEXTURE0+M)}function Q(C,M){const z=i.get(C);if(C.version>0&&z.__version!==C.version){Te(z,C,M);return}n.bindTexture(t.TEXTURE_2D_ARRAY,z.__webglTexture,t.TEXTURE0+M)}function W(C,M){const z=i.get(C);if(C.version>0&&z.__version!==C.version){Te(z,C,M);return}n.bindTexture(t.TEXTURE_3D,z.__webglTexture,t.TEXTURE0+M)}function $(C,M){const z=i.get(C);if(C.version>0&&z.__version!==C.version){G(z,C,M);return}n.bindTexture(t.TEXTURE_CUBE_MAP,z.__webglTexture,t.TEXTURE0+M)}const D={[fd]:t.REPEAT,[_r]:t.CLAMP_TO_EDGE,[pd]:t.MIRRORED_REPEAT},J={[bn]:t.NEAREST,[P1]:t.NEAREST_MIPMAP_NEAREST,[fo]:t.NEAREST_MIPMAP_LINEAR,[Mn]:t.LINEAR,[Tc]:t.LINEAR_MIPMAP_NEAREST,[yr]:t.LINEAR_MIPMAP_LINEAR},ee={[I1]:t.NEVER,[j1]:t.ALWAYS,[U1]:t.LESS,[dx]:t.LEQUAL,[F1]:t.EQUAL,[B1]:t.GEQUAL,[O1]:t.GREATER,[z1]:t.NOTEQUAL};function O(C,M){if(M.type===ui&&e.has("OES_texture_float_linear")===!1&&(M.magFilter===Mn||M.magFilter===Tc||M.magFilter===fo||M.magFilter===yr||M.minFilter===Mn||M.minFilter===Tc||M.minFilter===fo||M.minFilter===yr)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),t.texParameteri(C,t.TEXTURE_WRAP_S,D[M.wrapS]),t.texParameteri(C,t.TEXTURE_WRAP_T,D[M.wrapT]),(C===t.TEXTURE_3D||C===t.TEXTURE_2D_ARRAY)&&t.texParameteri(C,t.TEXTURE_WRAP_R,D[M.wrapR]),t.texParameteri(C,t.TEXTURE_MAG_FILTER,J[M.magFilter]),t.texParameteri(C,t.TEXTURE_MIN_FILTER,J[M.minFilter]),M.compareFunction&&(t.texParameteri(C,t.TEXTURE_COMPARE_MODE,t.COMPARE_REF_TO_TEXTURE),t.texParameteri(C,t.TEXTURE_COMPARE_FUNC,ee[M.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(M.magFilter===bn||M.minFilter!==fo&&M.minFilter!==yr||M.type===ui&&e.has("OES_texture_float_linear")===!1)return;if(M.anisotropy>1||i.get(M).__currentAnisotropy){const z=e.get("EXT_texture_filter_anisotropic");t.texParameterf(C,z.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(M.anisotropy,r.getMaxAnisotropy())),i.get(M).__currentAnisotropy=M.anisotropy}}}function oe(C,M){let z=!1;C.__webglInit===void 0&&(C.__webglInit=!0,M.addEventListener("dispose",N));const Z=M.source;let ne=f.get(Z);ne===void 0&&(ne={},f.set(Z,ne));const Y=V(M);if(Y!==C.__cacheKey){ne[Y]===void 0&&(ne[Y]={texture:t.createTexture(),usedTimes:0},a.memory.textures++,z=!0),ne[Y].usedTimes++;const Me=ne[C.__cacheKey];Me!==void 0&&(ne[C.__cacheKey].usedTimes--,Me.usedTimes===0&&R(M)),C.__cacheKey=Y,C.__webglTexture=ne[Y].texture}return z}function Te(C,M,z){let Z=t.TEXTURE_2D;(M.isDataArrayTexture||M.isCompressedArrayTexture)&&(Z=t.TEXTURE_2D_ARRAY),M.isData3DTexture&&(Z=t.TEXTURE_3D);const ne=oe(C,M),Y=M.source;n.bindTexture(Z,C.__webglTexture,t.TEXTURE0+z);const Me=i.get(Y);if(Y.version!==Me.__version||ne===!0){n.activeTexture(t.TEXTURE0+z);const he=tt.getPrimaries(tt.workingColorSpace),ve=M.colorSpace===ki?null:tt.getPrimaries(M.colorSpace),Xe=M.colorSpace===ki||he===ve?t.NONE:t.BROWSER_DEFAULT_WEBGL;t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,M.flipY),t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),t.pixelStorei(t.UNPACK_ALIGNMENT,M.unpackAlignment),t.pixelStorei(t.UNPACK_COLORSPACE_CONVERSION_WEBGL,Xe);let ae=S(M.image,!1,r.maxTextureSize);ae=rt(M,ae);const ye=s.convert(M.format,M.colorSpace),ke=s.convert(M.type);let te=g(M.internalFormat,ye,ke,M.colorSpace,M.isVideoTexture);O(Z,M);let re;const Re=M.mipmaps,Ce=M.isVideoTexture!==!0,Oe=Me.__version===void 0||ne===!0,L=Y.dataReady,fe=w(M,ae);if(M.isDepthTexture)te=v(M.format===Ns,M.type),Oe&&(Ce?n.texStorage2D(t.TEXTURE_2D,1,te,ae.width,ae.height):n.texImage2D(t.TEXTURE_2D,0,te,ae.width,ae.height,0,ye,ke,null));else if(M.isDataTexture)if(Re.length>0){Ce&&Oe&&n.texStorage2D(t.TEXTURE_2D,fe,te,Re[0].width,Re[0].height);for(let X=0,K=Re.length;X<K;X++)re=Re[X],Ce?L&&n.texSubImage2D(t.TEXTURE_2D,X,0,0,re.width,re.height,ye,ke,re.data):n.texImage2D(t.TEXTURE_2D,X,te,re.width,re.height,0,ye,ke,re.data);M.generateMipmaps=!1}else Ce?(Oe&&n.texStorage2D(t.TEXTURE_2D,fe,te,ae.width,ae.height),L&&n.texSubImage2D(t.TEXTURE_2D,0,0,0,ae.width,ae.height,ye,ke,ae.data)):n.texImage2D(t.TEXTURE_2D,0,te,ae.width,ae.height,0,ye,ke,ae.data);else if(M.isCompressedTexture)if(M.isCompressedArrayTexture){Ce&&Oe&&n.texStorage3D(t.TEXTURE_2D_ARRAY,fe,te,Re[0].width,Re[0].height,ae.depth);for(let X=0,K=Re.length;X<K;X++)if(re=Re[X],M.format!==jn)if(ye!==null)if(Ce){if(L)if(M.layerUpdates.size>0){const ge=xm(re.width,re.height,M.format,M.type);for(const de of M.layerUpdates){const qe=re.data.subarray(de*ge/re.data.BYTES_PER_ELEMENT,(de+1)*ge/re.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(t.TEXTURE_2D_ARRAY,X,0,0,de,re.width,re.height,1,ye,qe,0,0)}M.clearLayerUpdates()}else n.compressedTexSubImage3D(t.TEXTURE_2D_ARRAY,X,0,0,0,re.width,re.height,ae.depth,ye,re.data,0,0)}else n.compressedTexImage3D(t.TEXTURE_2D_ARRAY,X,te,re.width,re.height,ae.depth,0,re.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ce?L&&n.texSubImage3D(t.TEXTURE_2D_ARRAY,X,0,0,0,re.width,re.height,ae.depth,ye,ke,re.data):n.texImage3D(t.TEXTURE_2D_ARRAY,X,te,re.width,re.height,ae.depth,0,ye,ke,re.data)}else{Ce&&Oe&&n.texStorage2D(t.TEXTURE_2D,fe,te,Re[0].width,Re[0].height);for(let X=0,K=Re.length;X<K;X++)re=Re[X],M.format!==jn?ye!==null?Ce?L&&n.compressedTexSubImage2D(t.TEXTURE_2D,X,0,0,re.width,re.height,ye,re.data):n.compressedTexImage2D(t.TEXTURE_2D,X,te,re.width,re.height,0,re.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ce?L&&n.texSubImage2D(t.TEXTURE_2D,X,0,0,re.width,re.height,ye,ke,re.data):n.texImage2D(t.TEXTURE_2D,X,te,re.width,re.height,0,ye,ke,re.data)}else if(M.isDataArrayTexture)if(Ce){if(Oe&&n.texStorage3D(t.TEXTURE_2D_ARRAY,fe,te,ae.width,ae.height,ae.depth),L)if(M.layerUpdates.size>0){const X=xm(ae.width,ae.height,M.format,M.type);for(const K of M.layerUpdates){const ge=ae.data.subarray(K*X/ae.data.BYTES_PER_ELEMENT,(K+1)*X/ae.data.BYTES_PER_ELEMENT);n.texSubImage3D(t.TEXTURE_2D_ARRAY,0,0,0,K,ae.width,ae.height,1,ye,ke,ge)}M.clearLayerUpdates()}else n.texSubImage3D(t.TEXTURE_2D_ARRAY,0,0,0,0,ae.width,ae.height,ae.depth,ye,ke,ae.data)}else n.texImage3D(t.TEXTURE_2D_ARRAY,0,te,ae.width,ae.height,ae.depth,0,ye,ke,ae.data);else if(M.isData3DTexture)Ce?(Oe&&n.texStorage3D(t.TEXTURE_3D,fe,te,ae.width,ae.height,ae.depth),L&&n.texSubImage3D(t.TEXTURE_3D,0,0,0,0,ae.width,ae.height,ae.depth,ye,ke,ae.data)):n.texImage3D(t.TEXTURE_3D,0,te,ae.width,ae.height,ae.depth,0,ye,ke,ae.data);else if(M.isFramebufferTexture){if(Oe)if(Ce)n.texStorage2D(t.TEXTURE_2D,fe,te,ae.width,ae.height);else{let X=ae.width,K=ae.height;for(let ge=0;ge<fe;ge++)n.texImage2D(t.TEXTURE_2D,ge,te,X,K,0,ye,ke,null),X>>=1,K>>=1}}else if(Re.length>0){if(Ce&&Oe){const X=Ne(Re[0]);n.texStorage2D(t.TEXTURE_2D,fe,te,X.width,X.height)}for(let X=0,K=Re.length;X<K;X++)re=Re[X],Ce?L&&n.texSubImage2D(t.TEXTURE_2D,X,0,0,ye,ke,re):n.texImage2D(t.TEXTURE_2D,X,te,ye,ke,re);M.generateMipmaps=!1}else if(Ce){if(Oe){const X=Ne(ae);n.texStorage2D(t.TEXTURE_2D,fe,te,X.width,X.height)}L&&n.texSubImage2D(t.TEXTURE_2D,0,0,0,ye,ke,ae)}else n.texImage2D(t.TEXTURE_2D,0,te,ye,ke,ae);m(M)&&d(Z),Me.__version=Y.version,M.onUpdate&&M.onUpdate(M)}C.__version=M.version}function G(C,M,z){if(M.image.length!==6)return;const Z=oe(C,M),ne=M.source;n.bindTexture(t.TEXTURE_CUBE_MAP,C.__webglTexture,t.TEXTURE0+z);const Y=i.get(ne);if(ne.version!==Y.__version||Z===!0){n.activeTexture(t.TEXTURE0+z);const Me=tt.getPrimaries(tt.workingColorSpace),he=M.colorSpace===ki?null:tt.getPrimaries(M.colorSpace),ve=M.colorSpace===ki||Me===he?t.NONE:t.BROWSER_DEFAULT_WEBGL;t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,M.flipY),t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),t.pixelStorei(t.UNPACK_ALIGNMENT,M.unpackAlignment),t.pixelStorei(t.UNPACK_COLORSPACE_CONVERSION_WEBGL,ve);const Xe=M.isCompressedTexture||M.image[0].isCompressedTexture,ae=M.image[0]&&M.image[0].isDataTexture,ye=[];for(let K=0;K<6;K++)!Xe&&!ae?ye[K]=S(M.image[K],!0,r.maxCubemapSize):ye[K]=ae?M.image[K].image:M.image[K],ye[K]=rt(M,ye[K]);const ke=ye[0],te=s.convert(M.format,M.colorSpace),re=s.convert(M.type),Re=g(M.internalFormat,te,re,M.colorSpace),Ce=M.isVideoTexture!==!0,Oe=Y.__version===void 0||Z===!0,L=ne.dataReady;let fe=w(M,ke);O(t.TEXTURE_CUBE_MAP,M);let X;if(Xe){Ce&&Oe&&n.texStorage2D(t.TEXTURE_CUBE_MAP,fe,Re,ke.width,ke.height);for(let K=0;K<6;K++){X=ye[K].mipmaps;for(let ge=0;ge<X.length;ge++){const de=X[ge];M.format!==jn?te!==null?Ce?L&&n.compressedTexSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+K,ge,0,0,de.width,de.height,te,de.data):n.compressedTexImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+K,ge,Re,de.width,de.height,0,de.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ce?L&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+K,ge,0,0,de.width,de.height,te,re,de.data):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+K,ge,Re,de.width,de.height,0,te,re,de.data)}}}else{if(X=M.mipmaps,Ce&&Oe){X.length>0&&fe++;const K=Ne(ye[0]);n.texStorage2D(t.TEXTURE_CUBE_MAP,fe,Re,K.width,K.height)}for(let K=0;K<6;K++)if(ae){Ce?L&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,0,0,ye[K].width,ye[K].height,te,re,ye[K].data):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,Re,ye[K].width,ye[K].height,0,te,re,ye[K].data);for(let ge=0;ge<X.length;ge++){const qe=X[ge].image[K].image;Ce?L&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+K,ge+1,0,0,qe.width,qe.height,te,re,qe.data):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+K,ge+1,Re,qe.width,qe.height,0,te,re,qe.data)}}else{Ce?L&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,0,0,te,re,ye[K]):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,Re,te,re,ye[K]);for(let ge=0;ge<X.length;ge++){const de=X[ge];Ce?L&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+K,ge+1,0,0,te,re,de.image[K]):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+K,ge+1,Re,te,re,de.image[K])}}}m(M)&&d(t.TEXTURE_CUBE_MAP),Y.__version=ne.version,M.onUpdate&&M.onUpdate(M)}C.__version=M.version}function ie(C,M,z,Z,ne,Y){const Me=s.convert(z.format,z.colorSpace),he=s.convert(z.type),ve=g(z.internalFormat,Me,he,z.colorSpace);if(!i.get(M).__hasExternalTextures){const ae=Math.max(1,M.width>>Y),ye=Math.max(1,M.height>>Y);ne===t.TEXTURE_3D||ne===t.TEXTURE_2D_ARRAY?n.texImage3D(ne,Y,ve,ae,ye,M.depth,0,Me,he,null):n.texImage2D(ne,Y,ve,ae,ye,0,Me,he,null)}n.bindFramebuffer(t.FRAMEBUFFER,C),Ve(M)?o.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,Z,ne,i.get(z).__webglTexture,0,He(M)):(ne===t.TEXTURE_2D||ne>=t.TEXTURE_CUBE_MAP_POSITIVE_X&&ne<=t.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&t.framebufferTexture2D(t.FRAMEBUFFER,Z,ne,i.get(z).__webglTexture,Y),n.bindFramebuffer(t.FRAMEBUFFER,null)}function ue(C,M,z){if(t.bindRenderbuffer(t.RENDERBUFFER,C),M.depthBuffer){const Z=M.depthTexture,ne=Z&&Z.isDepthTexture?Z.type:null,Y=v(M.stencilBuffer,ne),Me=M.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,he=He(M);Ve(M)?o.renderbufferStorageMultisampleEXT(t.RENDERBUFFER,he,Y,M.width,M.height):z?t.renderbufferStorageMultisample(t.RENDERBUFFER,he,Y,M.width,M.height):t.renderbufferStorage(t.RENDERBUFFER,Y,M.width,M.height),t.framebufferRenderbuffer(t.FRAMEBUFFER,Me,t.RENDERBUFFER,C)}else{const Z=M.textures;for(let ne=0;ne<Z.length;ne++){const Y=Z[ne],Me=s.convert(Y.format,Y.colorSpace),he=s.convert(Y.type),ve=g(Y.internalFormat,Me,he,Y.colorSpace),Xe=He(M);z&&Ve(M)===!1?t.renderbufferStorageMultisample(t.RENDERBUFFER,Xe,ve,M.width,M.height):Ve(M)?o.renderbufferStorageMultisampleEXT(t.RENDERBUFFER,Xe,ve,M.width,M.height):t.renderbufferStorage(t.RENDERBUFFER,ve,M.width,M.height)}}t.bindRenderbuffer(t.RENDERBUFFER,null)}function me(C,M){if(M&&M.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(n.bindFramebuffer(t.FRAMEBUFFER,C),!(M.depthTexture&&M.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!i.get(M.depthTexture).__webglTexture||M.depthTexture.image.width!==M.width||M.depthTexture.image.height!==M.height)&&(M.depthTexture.image.width=M.width,M.depthTexture.image.height=M.height,M.depthTexture.needsUpdate=!0),q(M.depthTexture,0);const Z=i.get(M.depthTexture).__webglTexture,ne=He(M);if(M.depthTexture.format===ps)Ve(M)?o.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,t.DEPTH_ATTACHMENT,t.TEXTURE_2D,Z,0,ne):t.framebufferTexture2D(t.FRAMEBUFFER,t.DEPTH_ATTACHMENT,t.TEXTURE_2D,Z,0);else if(M.depthTexture.format===Ns)Ve(M)?o.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,t.DEPTH_STENCIL_ATTACHMENT,t.TEXTURE_2D,Z,0,ne):t.framebufferTexture2D(t.FRAMEBUFFER,t.DEPTH_STENCIL_ATTACHMENT,t.TEXTURE_2D,Z,0);else throw new Error("Unknown depthTexture format")}function Pe(C){const M=i.get(C),z=C.isWebGLCubeRenderTarget===!0;if(M.__boundDepthTexture!==C.depthTexture){const Z=C.depthTexture;if(M.__depthDisposeCallback&&M.__depthDisposeCallback(),Z){const ne=()=>{delete M.__boundDepthTexture,delete M.__depthDisposeCallback,Z.removeEventListener("dispose",ne)};Z.addEventListener("dispose",ne),M.__depthDisposeCallback=ne}M.__boundDepthTexture=Z}if(C.depthTexture&&!M.__autoAllocateDepthBuffer){if(z)throw new Error("target.depthTexture not supported in Cube render targets");me(M.__webglFramebuffer,C)}else if(z){M.__webglDepthbuffer=[];for(let Z=0;Z<6;Z++)if(n.bindFramebuffer(t.FRAMEBUFFER,M.__webglFramebuffer[Z]),M.__webglDepthbuffer[Z]===void 0)M.__webglDepthbuffer[Z]=t.createRenderbuffer(),ue(M.__webglDepthbuffer[Z],C,!1);else{const ne=C.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,Y=M.__webglDepthbuffer[Z];t.bindRenderbuffer(t.RENDERBUFFER,Y),t.framebufferRenderbuffer(t.FRAMEBUFFER,ne,t.RENDERBUFFER,Y)}}else if(n.bindFramebuffer(t.FRAMEBUFFER,M.__webglFramebuffer),M.__webglDepthbuffer===void 0)M.__webglDepthbuffer=t.createRenderbuffer(),ue(M.__webglDepthbuffer,C,!1);else{const Z=C.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,ne=M.__webglDepthbuffer;t.bindRenderbuffer(t.RENDERBUFFER,ne),t.framebufferRenderbuffer(t.FRAMEBUFFER,Z,t.RENDERBUFFER,ne)}n.bindFramebuffer(t.FRAMEBUFFER,null)}function Le(C,M,z){const Z=i.get(C);M!==void 0&&ie(Z.__webglFramebuffer,C,C.texture,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,0),z!==void 0&&Pe(C)}function We(C){const M=C.texture,z=i.get(C),Z=i.get(M);C.addEventListener("dispose",E);const ne=C.textures,Y=C.isWebGLCubeRenderTarget===!0,Me=ne.length>1;if(Me||(Z.__webglTexture===void 0&&(Z.__webglTexture=t.createTexture()),Z.__version=M.version,a.memory.textures++),Y){z.__webglFramebuffer=[];for(let he=0;he<6;he++)if(M.mipmaps&&M.mipmaps.length>0){z.__webglFramebuffer[he]=[];for(let ve=0;ve<M.mipmaps.length;ve++)z.__webglFramebuffer[he][ve]=t.createFramebuffer()}else z.__webglFramebuffer[he]=t.createFramebuffer()}else{if(M.mipmaps&&M.mipmaps.length>0){z.__webglFramebuffer=[];for(let he=0;he<M.mipmaps.length;he++)z.__webglFramebuffer[he]=t.createFramebuffer()}else z.__webglFramebuffer=t.createFramebuffer();if(Me)for(let he=0,ve=ne.length;he<ve;he++){const Xe=i.get(ne[he]);Xe.__webglTexture===void 0&&(Xe.__webglTexture=t.createTexture(),a.memory.textures++)}if(C.samples>0&&Ve(C)===!1){z.__webglMultisampledFramebuffer=t.createFramebuffer(),z.__webglColorRenderbuffer=[],n.bindFramebuffer(t.FRAMEBUFFER,z.__webglMultisampledFramebuffer);for(let he=0;he<ne.length;he++){const ve=ne[he];z.__webglColorRenderbuffer[he]=t.createRenderbuffer(),t.bindRenderbuffer(t.RENDERBUFFER,z.__webglColorRenderbuffer[he]);const Xe=s.convert(ve.format,ve.colorSpace),ae=s.convert(ve.type),ye=g(ve.internalFormat,Xe,ae,ve.colorSpace,C.isXRRenderTarget===!0),ke=He(C);t.renderbufferStorageMultisample(t.RENDERBUFFER,ke,ye,C.width,C.height),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+he,t.RENDERBUFFER,z.__webglColorRenderbuffer[he])}t.bindRenderbuffer(t.RENDERBUFFER,null),C.depthBuffer&&(z.__webglDepthRenderbuffer=t.createRenderbuffer(),ue(z.__webglDepthRenderbuffer,C,!0)),n.bindFramebuffer(t.FRAMEBUFFER,null)}}if(Y){n.bindTexture(t.TEXTURE_CUBE_MAP,Z.__webglTexture),O(t.TEXTURE_CUBE_MAP,M);for(let he=0;he<6;he++)if(M.mipmaps&&M.mipmaps.length>0)for(let ve=0;ve<M.mipmaps.length;ve++)ie(z.__webglFramebuffer[he][ve],C,M,t.COLOR_ATTACHMENT0,t.TEXTURE_CUBE_MAP_POSITIVE_X+he,ve);else ie(z.__webglFramebuffer[he],C,M,t.COLOR_ATTACHMENT0,t.TEXTURE_CUBE_MAP_POSITIVE_X+he,0);m(M)&&d(t.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(Me){for(let he=0,ve=ne.length;he<ve;he++){const Xe=ne[he],ae=i.get(Xe);n.bindTexture(t.TEXTURE_2D,ae.__webglTexture),O(t.TEXTURE_2D,Xe),ie(z.__webglFramebuffer,C,Xe,t.COLOR_ATTACHMENT0+he,t.TEXTURE_2D,0),m(Xe)&&d(t.TEXTURE_2D)}n.unbindTexture()}else{let he=t.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(he=C.isWebGL3DRenderTarget?t.TEXTURE_3D:t.TEXTURE_2D_ARRAY),n.bindTexture(he,Z.__webglTexture),O(he,M),M.mipmaps&&M.mipmaps.length>0)for(let ve=0;ve<M.mipmaps.length;ve++)ie(z.__webglFramebuffer[ve],C,M,t.COLOR_ATTACHMENT0,he,ve);else ie(z.__webglFramebuffer,C,M,t.COLOR_ATTACHMENT0,he,0);m(M)&&d(he),n.unbindTexture()}C.depthBuffer&&Pe(C)}function Qe(C){const M=C.textures;for(let z=0,Z=M.length;z<Z;z++){const ne=M[z];if(m(ne)){const Y=C.isWebGLCubeRenderTarget?t.TEXTURE_CUBE_MAP:t.TEXTURE_2D,Me=i.get(ne).__webglTexture;n.bindTexture(Y,Me),d(Y),n.unbindTexture()}}}const je=[],P=[];function Vt(C){if(C.samples>0){if(Ve(C)===!1){const M=C.textures,z=C.width,Z=C.height;let ne=t.COLOR_BUFFER_BIT;const Y=C.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,Me=i.get(C),he=M.length>1;if(he)for(let ve=0;ve<M.length;ve++)n.bindFramebuffer(t.FRAMEBUFFER,Me.__webglMultisampledFramebuffer),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+ve,t.RENDERBUFFER,null),n.bindFramebuffer(t.FRAMEBUFFER,Me.__webglFramebuffer),t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0+ve,t.TEXTURE_2D,null,0);n.bindFramebuffer(t.READ_FRAMEBUFFER,Me.__webglMultisampledFramebuffer),n.bindFramebuffer(t.DRAW_FRAMEBUFFER,Me.__webglFramebuffer);for(let ve=0;ve<M.length;ve++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(ne|=t.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(ne|=t.STENCIL_BUFFER_BIT)),he){t.framebufferRenderbuffer(t.READ_FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.RENDERBUFFER,Me.__webglColorRenderbuffer[ve]);const Xe=i.get(M[ve]).__webglTexture;t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,Xe,0)}t.blitFramebuffer(0,0,z,Z,0,0,z,Z,ne,t.NEAREST),l===!0&&(je.length=0,P.length=0,je.push(t.COLOR_ATTACHMENT0+ve),C.depthBuffer&&C.resolveDepthBuffer===!1&&(je.push(Y),P.push(Y),t.invalidateFramebuffer(t.DRAW_FRAMEBUFFER,P)),t.invalidateFramebuffer(t.READ_FRAMEBUFFER,je))}if(n.bindFramebuffer(t.READ_FRAMEBUFFER,null),n.bindFramebuffer(t.DRAW_FRAMEBUFFER,null),he)for(let ve=0;ve<M.length;ve++){n.bindFramebuffer(t.FRAMEBUFFER,Me.__webglMultisampledFramebuffer),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+ve,t.RENDERBUFFER,Me.__webglColorRenderbuffer[ve]);const Xe=i.get(M[ve]).__webglTexture;n.bindFramebuffer(t.FRAMEBUFFER,Me.__webglFramebuffer),t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0+ve,t.TEXTURE_2D,Xe,0)}n.bindFramebuffer(t.DRAW_FRAMEBUFFER,Me.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.resolveDepthBuffer===!1&&l){const M=C.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT;t.invalidateFramebuffer(t.DRAW_FRAMEBUFFER,[M])}}}function He(C){return Math.min(r.maxSamples,C.samples)}function Ve(C){const M=i.get(C);return C.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&M.__useRenderToTexture!==!1}function De(C){const M=a.render.frame;h.get(C)!==M&&(h.set(C,M),C.update())}function rt(C,M){const z=C.colorSpace,Z=C.format,ne=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||z!==er&&z!==ki&&(tt.getTransfer(z)===ct?(Z!==jn||ne!==vi)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",z)),M}function Ne(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(u.width=C.naturalWidth||C.width,u.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(u.width=C.displayWidth,u.height=C.displayHeight):(u.width=C.width,u.height=C.height),u}this.allocateTextureUnit=H,this.resetTextureUnits=b,this.setTexture2D=q,this.setTexture2DArray=Q,this.setTexture3D=W,this.setTextureCube=$,this.rebindTextures=Le,this.setupRenderTarget=We,this.updateRenderTargetMipmap=Qe,this.updateMultisampleRenderTarget=Vt,this.setupDepthRenderbuffer=Pe,this.setupFrameBufferTexture=ie,this.useMultisampledRTT=Ve}function qb(t,e){function n(i,r=ki){let s;const a=tt.getTransfer(r);if(i===vi)return t.UNSIGNED_BYTE;if(i===Hh)return t.UNSIGNED_SHORT_4_4_4_4;if(i===Vh)return t.UNSIGNED_SHORT_5_5_5_1;if(i===nx)return t.UNSIGNED_INT_5_9_9_9_REV;if(i===ex)return t.BYTE;if(i===tx)return t.SHORT;if(i===Ia)return t.UNSIGNED_SHORT;if(i===jh)return t.INT;if(i===Cr)return t.UNSIGNED_INT;if(i===ui)return t.FLOAT;if(i===Ha)return t.HALF_FLOAT;if(i===ix)return t.ALPHA;if(i===rx)return t.RGB;if(i===jn)return t.RGBA;if(i===sx)return t.LUMINANCE;if(i===ax)return t.LUMINANCE_ALPHA;if(i===ps)return t.DEPTH_COMPONENT;if(i===Ns)return t.DEPTH_STENCIL;if(i===ox)return t.RED;if(i===Gh)return t.RED_INTEGER;if(i===lx)return t.RG;if(i===Wh)return t.RG_INTEGER;if(i===Xh)return t.RGBA_INTEGER;if(i===Yo||i===$o||i===Ko||i===Zo)if(a===ct)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(i===Yo)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===$o)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Ko)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Zo)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(i===Yo)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===$o)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Ko)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Zo)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===md||i===gd||i===xd||i===vd)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(i===md)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===gd)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===xd)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===vd)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===_d||i===yd||i===Sd)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(i===_d||i===yd)return a===ct?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(i===Sd)return a===ct?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===wd||i===Md||i===Ed||i===bd||i===Td||i===Ad||i===Cd||i===Rd||i===Nd||i===Pd||i===Ld||i===Dd||i===kd||i===Id)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(i===wd)return a===ct?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Md)return a===ct?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Ed)return a===ct?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===bd)return a===ct?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===Td)return a===ct?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Ad)return a===ct?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Cd)return a===ct?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Rd)return a===ct?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Nd)return a===ct?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Pd)return a===ct?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Ld)return a===ct?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Dd)return a===ct?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===kd)return a===ct?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Id)return a===ct?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Qo||i===Ud||i===Fd)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(i===Qo)return a===ct?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Ud)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===Fd)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===cx||i===Od||i===zd||i===Bd)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(i===Qo)return s.COMPRESSED_RED_RGTC1_EXT;if(i===Od)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===zd)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Bd)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===Rs?t.UNSIGNED_INT_24_8:t[i]!==void 0?t[i]:null}return{convert:n}}class Yb extends fn{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class sa extends $t{constructor(){super(),this.isGroup=!0,this.type="Group"}}const $b={type:"move"};class nu{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new sa,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new sa,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new U,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new U),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new sa,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new U,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new U),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const n=this._hand;if(n)for(const i of e.hand.values())this._getHandJoint(n,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,n,i){let r=null,s=null,a=null;const o=this._targetRay,l=this._grip,u=this._hand;if(e&&n.session.visibilityState!=="visible-blurred"){if(u&&e.hand){a=!0;for(const S of e.hand.values()){const m=n.getJointPose(S,i),d=this._getHandJoint(u,S);m!==null&&(d.matrix.fromArray(m.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,d.jointRadius=m.radius),d.visible=m!==null}const h=u.joints["index-finger-tip"],p=u.joints["thumb-tip"],f=h.position.distanceTo(p.position),x=.02,_=.005;u.inputState.pinching&&f>x+_?(u.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!u.inputState.pinching&&f<=x-_&&(u.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=n.getPose(e.gripSpace,i),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(r=n.getPose(e.targetRaySpace,i),r===null&&s!==null&&(r=s),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent($b)))}return o!==null&&(o.visible=r!==null),l!==null&&(l.visible=s!==null),u!==null&&(u.visible=a!==null),this}_getHandJoint(e,n){if(e.joints[n.jointName]===void 0){const i=new sa;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[n.jointName]=i,e.add(i)}return e.joints[n.jointName]}}const Kb=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Zb=`
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

}`;class Qb{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,n,i){if(this.texture===null){const r=new Yt,s=e.properties.get(r);s.__webglTexture=n.texture,(n.depthNear!=i.depthNear||n.depthFar!=i.depthFar)&&(this.depthNear=n.depthNear,this.depthFar=n.depthFar),this.texture=r}}getMesh(e){if(this.texture!==null&&this.mesh===null){const n=e.cameras[0].viewport,i=new Ki({vertexShader:Kb,fragmentShader:Zb,uniforms:{depthColor:{value:this.texture},depthWidth:{value:n.z},depthHeight:{value:n.w}}});this.mesh=new zt(new Ls(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Jb extends Us{constructor(e,n){super();const i=this;let r=null,s=1,a=null,o="local-floor",l=1,u=null,h=null,p=null,f=null,x=null,_=null;const S=new Qb,m=n.getContextAttributes();let d=null,g=null;const v=[],w=[],N=new Ye;let E=null;const A=new fn;A.layers.enable(1),A.viewport=new st;const R=new fn;R.layers.enable(2),R.viewport=new st;const F=[A,R],y=new Yb;y.layers.enable(1),y.layers.enable(2);let b=null,H=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(G){let ie=v[G];return ie===void 0&&(ie=new nu,v[G]=ie),ie.getTargetRaySpace()},this.getControllerGrip=function(G){let ie=v[G];return ie===void 0&&(ie=new nu,v[G]=ie),ie.getGripSpace()},this.getHand=function(G){let ie=v[G];return ie===void 0&&(ie=new nu,v[G]=ie),ie.getHandSpace()};function V(G){const ie=w.indexOf(G.inputSource);if(ie===-1)return;const ue=v[ie];ue!==void 0&&(ue.update(G.inputSource,G.frame,u||a),ue.dispatchEvent({type:G.type,data:G.inputSource}))}function q(){r.removeEventListener("select",V),r.removeEventListener("selectstart",V),r.removeEventListener("selectend",V),r.removeEventListener("squeeze",V),r.removeEventListener("squeezestart",V),r.removeEventListener("squeezeend",V),r.removeEventListener("end",q),r.removeEventListener("inputsourceschange",Q);for(let G=0;G<v.length;G++){const ie=w[G];ie!==null&&(w[G]=null,v[G].disconnect(ie))}b=null,H=null,S.reset(),e.setRenderTarget(d),x=null,f=null,p=null,r=null,g=null,Te.stop(),i.isPresenting=!1,e.setPixelRatio(E),e.setSize(N.width,N.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(G){s=G,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(G){o=G,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return u||a},this.setReferenceSpace=function(G){u=G},this.getBaseLayer=function(){return f!==null?f:x},this.getBinding=function(){return p},this.getFrame=function(){return _},this.getSession=function(){return r},this.setSession=async function(G){if(r=G,r!==null){if(d=e.getRenderTarget(),r.addEventListener("select",V),r.addEventListener("selectstart",V),r.addEventListener("selectend",V),r.addEventListener("squeeze",V),r.addEventListener("squeezestart",V),r.addEventListener("squeezeend",V),r.addEventListener("end",q),r.addEventListener("inputsourceschange",Q),m.xrCompatible!==!0&&await n.makeXRCompatible(),E=e.getPixelRatio(),e.getSize(N),r.renderState.layers===void 0){const ie={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:s};x=new XRWebGLLayer(r,n,ie),r.updateRenderState({baseLayer:x}),e.setPixelRatio(1),e.setSize(x.framebufferWidth,x.framebufferHeight,!1),g=new Rr(x.framebufferWidth,x.framebufferHeight,{format:jn,type:vi,colorSpace:e.outputColorSpace,stencilBuffer:m.stencil})}else{let ie=null,ue=null,me=null;m.depth&&(me=m.stencil?n.DEPTH24_STENCIL8:n.DEPTH_COMPONENT24,ie=m.stencil?Ns:ps,ue=m.stencil?Rs:Cr);const Pe={colorFormat:n.RGBA8,depthFormat:me,scaleFactor:s};p=new XRWebGLBinding(r,n),f=p.createProjectionLayer(Pe),r.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),g=new Rr(f.textureWidth,f.textureHeight,{format:jn,type:vi,depthTexture:new wx(f.textureWidth,f.textureHeight,ue,void 0,void 0,void 0,void 0,void 0,void 0,ie),stencilBuffer:m.stencil,colorSpace:e.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1})}g.isXRRenderTarget=!0,this.setFoveation(l),u=null,a=await r.requestReferenceSpace(o),Te.setContext(r),Te.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return S.getDepthTexture()};function Q(G){for(let ie=0;ie<G.removed.length;ie++){const ue=G.removed[ie],me=w.indexOf(ue);me>=0&&(w[me]=null,v[me].disconnect(ue))}for(let ie=0;ie<G.added.length;ie++){const ue=G.added[ie];let me=w.indexOf(ue);if(me===-1){for(let Le=0;Le<v.length;Le++)if(Le>=w.length){w.push(ue),me=Le;break}else if(w[Le]===null){w[Le]=ue,me=Le;break}if(me===-1)break}const Pe=v[me];Pe&&Pe.connect(ue)}}const W=new U,$=new U;function D(G,ie,ue){W.setFromMatrixPosition(ie.matrixWorld),$.setFromMatrixPosition(ue.matrixWorld);const me=W.distanceTo($),Pe=ie.projectionMatrix.elements,Le=ue.projectionMatrix.elements,We=Pe[14]/(Pe[10]-1),Qe=Pe[14]/(Pe[10]+1),je=(Pe[9]+1)/Pe[5],P=(Pe[9]-1)/Pe[5],Vt=(Pe[8]-1)/Pe[0],He=(Le[8]+1)/Le[0],Ve=We*Vt,De=We*He,rt=me/(-Vt+He),Ne=rt*-Vt;if(ie.matrixWorld.decompose(G.position,G.quaternion,G.scale),G.translateX(Ne),G.translateZ(rt),G.matrixWorld.compose(G.position,G.quaternion,G.scale),G.matrixWorldInverse.copy(G.matrixWorld).invert(),Pe[10]===-1)G.projectionMatrix.copy(ie.projectionMatrix),G.projectionMatrixInverse.copy(ie.projectionMatrixInverse);else{const C=We+rt,M=Qe+rt,z=Ve-Ne,Z=De+(me-Ne),ne=je*Qe/M*C,Y=P*Qe/M*C;G.projectionMatrix.makePerspective(z,Z,ne,Y,C,M),G.projectionMatrixInverse.copy(G.projectionMatrix).invert()}}function J(G,ie){ie===null?G.matrixWorld.copy(G.matrix):G.matrixWorld.multiplyMatrices(ie.matrixWorld,G.matrix),G.matrixWorldInverse.copy(G.matrixWorld).invert()}this.updateCamera=function(G){if(r===null)return;let ie=G.near,ue=G.far;S.texture!==null&&(S.depthNear>0&&(ie=S.depthNear),S.depthFar>0&&(ue=S.depthFar)),y.near=R.near=A.near=ie,y.far=R.far=A.far=ue,(b!==y.near||H!==y.far)&&(r.updateRenderState({depthNear:y.near,depthFar:y.far}),b=y.near,H=y.far);const me=G.parent,Pe=y.cameras;J(y,me);for(let Le=0;Le<Pe.length;Le++)J(Pe[Le],me);Pe.length===2?D(y,A,R):y.projectionMatrix.copy(A.projectionMatrix),ee(G,y,me)};function ee(G,ie,ue){ue===null?G.matrix.copy(ie.matrixWorld):(G.matrix.copy(ue.matrixWorld),G.matrix.invert(),G.matrix.multiply(ie.matrixWorld)),G.matrix.decompose(G.position,G.quaternion,G.scale),G.updateMatrixWorld(!0),G.projectionMatrix.copy(ie.projectionMatrix),G.projectionMatrixInverse.copy(ie.projectionMatrixInverse),G.isPerspectiveCamera&&(G.fov=jd*2*Math.atan(1/G.projectionMatrix.elements[5]),G.zoom=1)}this.getCamera=function(){return y},this.getFoveation=function(){if(!(f===null&&x===null))return l},this.setFoveation=function(G){l=G,f!==null&&(f.fixedFoveation=G),x!==null&&x.fixedFoveation!==void 0&&(x.fixedFoveation=G)},this.hasDepthSensing=function(){return S.texture!==null},this.getDepthSensingMesh=function(){return S.getMesh(y)};let O=null;function oe(G,ie){if(h=ie.getViewerPose(u||a),_=ie,h!==null){const ue=h.views;x!==null&&(e.setRenderTargetFramebuffer(g,x.framebuffer),e.setRenderTarget(g));let me=!1;ue.length!==y.cameras.length&&(y.cameras.length=0,me=!0);for(let Le=0;Le<ue.length;Le++){const We=ue[Le];let Qe=null;if(x!==null)Qe=x.getViewport(We);else{const P=p.getViewSubImage(f,We);Qe=P.viewport,Le===0&&(e.setRenderTargetTextures(g,P.colorTexture,f.ignoreDepthValues?void 0:P.depthStencilTexture),e.setRenderTarget(g))}let je=F[Le];je===void 0&&(je=new fn,je.layers.enable(Le),je.viewport=new st,F[Le]=je),je.matrix.fromArray(We.transform.matrix),je.matrix.decompose(je.position,je.quaternion,je.scale),je.projectionMatrix.fromArray(We.projectionMatrix),je.projectionMatrixInverse.copy(je.projectionMatrix).invert(),je.viewport.set(Qe.x,Qe.y,Qe.width,Qe.height),Le===0&&(y.matrix.copy(je.matrix),y.matrix.decompose(y.position,y.quaternion,y.scale)),me===!0&&y.cameras.push(je)}const Pe=r.enabledFeatures;if(Pe&&Pe.includes("depth-sensing")){const Le=p.getDepthInformation(ue[0]);Le&&Le.isValid&&Le.texture&&S.init(e,Le,r.renderState)}}for(let ue=0;ue<v.length;ue++){const me=w[ue],Pe=v[ue];me!==null&&Pe!==void 0&&Pe.update(me,ie,u||a)}O&&O(G,ie),ie.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:ie}),_=null}const Te=new Sx;Te.setAnimationLoop(oe),this.setAnimationLoop=function(G){O=G},this.dispose=function(){}}}const or=new Qn,eT=new dt;function tT(t,e){function n(m,d){m.matrixAutoUpdate===!0&&m.updateMatrix(),d.value.copy(m.matrix)}function i(m,d){d.color.getRGB(m.fogColor.value,vx(t)),d.isFog?(m.fogNear.value=d.near,m.fogFar.value=d.far):d.isFogExp2&&(m.fogDensity.value=d.density)}function r(m,d,g,v,w){d.isMeshBasicMaterial||d.isMeshLambertMaterial?s(m,d):d.isMeshToonMaterial?(s(m,d),p(m,d)):d.isMeshPhongMaterial?(s(m,d),h(m,d)):d.isMeshStandardMaterial?(s(m,d),f(m,d),d.isMeshPhysicalMaterial&&x(m,d,w)):d.isMeshMatcapMaterial?(s(m,d),_(m,d)):d.isMeshDepthMaterial?s(m,d):d.isMeshDistanceMaterial?(s(m,d),S(m,d)):d.isMeshNormalMaterial?s(m,d):d.isLineBasicMaterial?(a(m,d),d.isLineDashedMaterial&&o(m,d)):d.isPointsMaterial?l(m,d,g,v):d.isSpriteMaterial?u(m,d):d.isShadowMaterial?(m.color.value.copy(d.color),m.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function s(m,d){m.opacity.value=d.opacity,d.color&&m.diffuse.value.copy(d.color),d.emissive&&m.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(m.map.value=d.map,n(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,n(d.alphaMap,m.alphaMapTransform)),d.bumpMap&&(m.bumpMap.value=d.bumpMap,n(d.bumpMap,m.bumpMapTransform),m.bumpScale.value=d.bumpScale,d.side===qt&&(m.bumpScale.value*=-1)),d.normalMap&&(m.normalMap.value=d.normalMap,n(d.normalMap,m.normalMapTransform),m.normalScale.value.copy(d.normalScale),d.side===qt&&m.normalScale.value.negate()),d.displacementMap&&(m.displacementMap.value=d.displacementMap,n(d.displacementMap,m.displacementMapTransform),m.displacementScale.value=d.displacementScale,m.displacementBias.value=d.displacementBias),d.emissiveMap&&(m.emissiveMap.value=d.emissiveMap,n(d.emissiveMap,m.emissiveMapTransform)),d.specularMap&&(m.specularMap.value=d.specularMap,n(d.specularMap,m.specularMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest);const g=e.get(d),v=g.envMap,w=g.envMapRotation;v&&(m.envMap.value=v,or.copy(w),or.x*=-1,or.y*=-1,or.z*=-1,v.isCubeTexture&&v.isRenderTargetTexture===!1&&(or.y*=-1,or.z*=-1),m.envMapRotation.value.setFromMatrix4(eT.makeRotationFromEuler(or)),m.flipEnvMap.value=v.isCubeTexture&&v.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=d.reflectivity,m.ior.value=d.ior,m.refractionRatio.value=d.refractionRatio),d.lightMap&&(m.lightMap.value=d.lightMap,m.lightMapIntensity.value=d.lightMapIntensity,n(d.lightMap,m.lightMapTransform)),d.aoMap&&(m.aoMap.value=d.aoMap,m.aoMapIntensity.value=d.aoMapIntensity,n(d.aoMap,m.aoMapTransform))}function a(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,d.map&&(m.map.value=d.map,n(d.map,m.mapTransform))}function o(m,d){m.dashSize.value=d.dashSize,m.totalSize.value=d.dashSize+d.gapSize,m.scale.value=d.scale}function l(m,d,g,v){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.size.value=d.size*g,m.scale.value=v*.5,d.map&&(m.map.value=d.map,n(d.map,m.uvTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,n(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function u(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.rotation.value=d.rotation,d.map&&(m.map.value=d.map,n(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,n(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function h(m,d){m.specular.value.copy(d.specular),m.shininess.value=Math.max(d.shininess,1e-4)}function p(m,d){d.gradientMap&&(m.gradientMap.value=d.gradientMap)}function f(m,d){m.metalness.value=d.metalness,d.metalnessMap&&(m.metalnessMap.value=d.metalnessMap,n(d.metalnessMap,m.metalnessMapTransform)),m.roughness.value=d.roughness,d.roughnessMap&&(m.roughnessMap.value=d.roughnessMap,n(d.roughnessMap,m.roughnessMapTransform)),d.envMap&&(m.envMapIntensity.value=d.envMapIntensity)}function x(m,d,g){m.ior.value=d.ior,d.sheen>0&&(m.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),m.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(m.sheenColorMap.value=d.sheenColorMap,n(d.sheenColorMap,m.sheenColorMapTransform)),d.sheenRoughnessMap&&(m.sheenRoughnessMap.value=d.sheenRoughnessMap,n(d.sheenRoughnessMap,m.sheenRoughnessMapTransform))),d.clearcoat>0&&(m.clearcoat.value=d.clearcoat,m.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(m.clearcoatMap.value=d.clearcoatMap,n(d.clearcoatMap,m.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,n(d.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(m.clearcoatNormalMap.value=d.clearcoatNormalMap,n(d.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===qt&&m.clearcoatNormalScale.value.negate())),d.dispersion>0&&(m.dispersion.value=d.dispersion),d.iridescence>0&&(m.iridescence.value=d.iridescence,m.iridescenceIOR.value=d.iridescenceIOR,m.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap&&(m.iridescenceMap.value=d.iridescenceMap,n(d.iridescenceMap,m.iridescenceMapTransform)),d.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=d.iridescenceThicknessMap,n(d.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),d.transmission>0&&(m.transmission.value=d.transmission,m.transmissionSamplerMap.value=g.texture,m.transmissionSamplerSize.value.set(g.width,g.height),d.transmissionMap&&(m.transmissionMap.value=d.transmissionMap,n(d.transmissionMap,m.transmissionMapTransform)),m.thickness.value=d.thickness,d.thicknessMap&&(m.thicknessMap.value=d.thicknessMap,n(d.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=d.attenuationDistance,m.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(m.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(m.anisotropyMap.value=d.anisotropyMap,n(d.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=d.specularIntensity,m.specularColor.value.copy(d.specularColor),d.specularColorMap&&(m.specularColorMap.value=d.specularColorMap,n(d.specularColorMap,m.specularColorMapTransform)),d.specularIntensityMap&&(m.specularIntensityMap.value=d.specularIntensityMap,n(d.specularIntensityMap,m.specularIntensityMapTransform))}function _(m,d){d.matcap&&(m.matcap.value=d.matcap)}function S(m,d){const g=e.get(d).light;m.referencePosition.value.setFromMatrixPosition(g.matrixWorld),m.nearDistance.value=g.shadow.camera.near,m.farDistance.value=g.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:r}}function nT(t,e,n,i){let r={},s={},a=[];const o=t.getParameter(t.MAX_UNIFORM_BUFFER_BINDINGS);function l(g,v){const w=v.program;i.uniformBlockBinding(g,w)}function u(g,v){let w=r[g.id];w===void 0&&(_(g),w=h(g),r[g.id]=w,g.addEventListener("dispose",m));const N=v.program;i.updateUBOMapping(g,N);const E=e.render.frame;s[g.id]!==E&&(f(g),s[g.id]=E)}function h(g){const v=p();g.__bindingPointIndex=v;const w=t.createBuffer(),N=g.__size,E=g.usage;return t.bindBuffer(t.UNIFORM_BUFFER,w),t.bufferData(t.UNIFORM_BUFFER,N,E),t.bindBuffer(t.UNIFORM_BUFFER,null),t.bindBufferBase(t.UNIFORM_BUFFER,v,w),w}function p(){for(let g=0;g<o;g++)if(a.indexOf(g)===-1)return a.push(g),g;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(g){const v=r[g.id],w=g.uniforms,N=g.__cache;t.bindBuffer(t.UNIFORM_BUFFER,v);for(let E=0,A=w.length;E<A;E++){const R=Array.isArray(w[E])?w[E]:[w[E]];for(let F=0,y=R.length;F<y;F++){const b=R[F];if(x(b,E,F,N)===!0){const H=b.__offset,V=Array.isArray(b.value)?b.value:[b.value];let q=0;for(let Q=0;Q<V.length;Q++){const W=V[Q],$=S(W);typeof W=="number"||typeof W=="boolean"?(b.__data[0]=W,t.bufferSubData(t.UNIFORM_BUFFER,H+q,b.__data)):W.isMatrix3?(b.__data[0]=W.elements[0],b.__data[1]=W.elements[1],b.__data[2]=W.elements[2],b.__data[3]=0,b.__data[4]=W.elements[3],b.__data[5]=W.elements[4],b.__data[6]=W.elements[5],b.__data[7]=0,b.__data[8]=W.elements[6],b.__data[9]=W.elements[7],b.__data[10]=W.elements[8],b.__data[11]=0):(W.toArray(b.__data,q),q+=$.storage/Float32Array.BYTES_PER_ELEMENT)}t.bufferSubData(t.UNIFORM_BUFFER,H,b.__data)}}}t.bindBuffer(t.UNIFORM_BUFFER,null)}function x(g,v,w,N){const E=g.value,A=v+"_"+w;if(N[A]===void 0)return typeof E=="number"||typeof E=="boolean"?N[A]=E:N[A]=E.clone(),!0;{const R=N[A];if(typeof E=="number"||typeof E=="boolean"){if(R!==E)return N[A]=E,!0}else if(R.equals(E)===!1)return R.copy(E),!0}return!1}function _(g){const v=g.uniforms;let w=0;const N=16;for(let A=0,R=v.length;A<R;A++){const F=Array.isArray(v[A])?v[A]:[v[A]];for(let y=0,b=F.length;y<b;y++){const H=F[y],V=Array.isArray(H.value)?H.value:[H.value];for(let q=0,Q=V.length;q<Q;q++){const W=V[q],$=S(W),D=w%N,J=D%$.boundary,ee=D+J;w+=J,ee!==0&&N-ee<$.storage&&(w+=N-ee),H.__data=new Float32Array($.storage/Float32Array.BYTES_PER_ELEMENT),H.__offset=w,w+=$.storage}}}const E=w%N;return E>0&&(w+=N-E),g.__size=w,g.__cache={},this}function S(g){const v={boundary:0,storage:0};return typeof g=="number"||typeof g=="boolean"?(v.boundary=4,v.storage=4):g.isVector2?(v.boundary=8,v.storage=8):g.isVector3||g.isColor?(v.boundary=16,v.storage=12):g.isVector4?(v.boundary=16,v.storage=16):g.isMatrix3?(v.boundary=48,v.storage=48):g.isMatrix4?(v.boundary=64,v.storage=64):g.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",g),v}function m(g){const v=g.target;v.removeEventListener("dispose",m);const w=a.indexOf(v.__bindingPointIndex);a.splice(w,1),t.deleteBuffer(r[v.id]),delete r[v.id],delete s[v.id]}function d(){for(const g in r)t.deleteBuffer(r[g]);a=[],r={},s={}}return{bind:l,update:u,dispose:d}}class iT{constructor(e={}){const{canvas:n=V1(),context:i=null,depth:r=!0,stencil:s=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:u=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:p=!1}=e;this.isWebGLRenderer=!0;let f;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=i.getContextAttributes().alpha}else f=a;const x=new Uint32Array(4),_=new Int32Array(4);let S=null,m=null;const d=[],g=[];this.domElement=n,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=qn,this.toneMapping=Xi,this.toneMappingExposure=1;const v=this;let w=!1,N=0,E=0,A=null,R=-1,F=null;const y=new st,b=new st;let H=null;const V=new $e(0);let q=0,Q=n.width,W=n.height,$=1,D=null,J=null;const ee=new st(0,0,Q,W),O=new st(0,0,Q,W);let oe=!1;const Te=new Kh;let G=!1,ie=!1;const ue=new dt,me=new dt,Pe=new U,Le=new st,We={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Qe=!1;function je(){return A===null?$:1}let P=i;function Vt(T,k){return n.getContext(T,k)}try{const T={alpha:!0,depth:r,stencil:s,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:u,powerPreference:h,failIfMajorPerformanceCaveat:p};if("setAttribute"in n&&n.setAttribute("data-engine",`three.js r${Bh}`),n.addEventListener("webglcontextlost",K,!1),n.addEventListener("webglcontextrestored",ge,!1),n.addEventListener("webglcontextcreationerror",de,!1),P===null){const k="webgl2";if(P=Vt(k,T),P===null)throw Vt(k)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(T){throw console.error("THREE.WebGLRenderer: "+T.message),T}let He,Ve,De,rt,Ne,C,M,z,Z,ne,Y,Me,he,ve,Xe,ae,ye,ke,te,re,Re,Ce,Oe,L;function fe(){He=new lE(P),He.init(),Ce=new qb(P,He),Ve=new tE(P,He,e,Ce),De=new Gb(P),Ve.reverseDepthBuffer&&De.buffers.depth.setReversed(!0),rt=new dE(P),Ne=new Rb,C=new Xb(P,He,De,Ne,Ve,Ce,rt),M=new iE(v),z=new oE(v),Z=new xS(P),Oe=new JM(P,Z),ne=new cE(P,Z,rt,Oe),Y=new fE(P,ne,Z,rt),te=new hE(P,Ve,C),ae=new nE(Ne),Me=new Cb(v,M,z,He,Ve,Oe,ae),he=new tT(v,Ne),ve=new Pb,Xe=new Fb(He),ke=new QM(v,M,z,De,Y,f,l),ye=new Hb(v,Y,Ve),L=new nT(P,rt,Ve,De),re=new eE(P,He,rt),Re=new uE(P,He,rt),rt.programs=Me.programs,v.capabilities=Ve,v.extensions=He,v.properties=Ne,v.renderLists=ve,v.shadowMap=ye,v.state=De,v.info=rt}fe();const X=new Jb(v,P);this.xr=X,this.getContext=function(){return P},this.getContextAttributes=function(){return P.getContextAttributes()},this.forceContextLoss=function(){const T=He.get("WEBGL_lose_context");T&&T.loseContext()},this.forceContextRestore=function(){const T=He.get("WEBGL_lose_context");T&&T.restoreContext()},this.getPixelRatio=function(){return $},this.setPixelRatio=function(T){T!==void 0&&($=T,this.setSize(Q,W,!1))},this.getSize=function(T){return T.set(Q,W)},this.setSize=function(T,k,B=!0){if(X.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}Q=T,W=k,n.width=Math.floor(T*$),n.height=Math.floor(k*$),B===!0&&(n.style.width=T+"px",n.style.height=k+"px"),this.setViewport(0,0,T,k)},this.getDrawingBufferSize=function(T){return T.set(Q*$,W*$).floor()},this.setDrawingBufferSize=function(T,k,B){Q=T,W=k,$=B,n.width=Math.floor(T*B),n.height=Math.floor(k*B),this.setViewport(0,0,T,k)},this.getCurrentViewport=function(T){return T.copy(y)},this.getViewport=function(T){return T.copy(ee)},this.setViewport=function(T,k,B,j){T.isVector4?ee.set(T.x,T.y,T.z,T.w):ee.set(T,k,B,j),De.viewport(y.copy(ee).multiplyScalar($).round())},this.getScissor=function(T){return T.copy(O)},this.setScissor=function(T,k,B,j){T.isVector4?O.set(T.x,T.y,T.z,T.w):O.set(T,k,B,j),De.scissor(b.copy(O).multiplyScalar($).round())},this.getScissorTest=function(){return oe},this.setScissorTest=function(T){De.setScissorTest(oe=T)},this.setOpaqueSort=function(T){D=T},this.setTransparentSort=function(T){J=T},this.getClearColor=function(T){return T.copy(ke.getClearColor())},this.setClearColor=function(){ke.setClearColor.apply(ke,arguments)},this.getClearAlpha=function(){return ke.getClearAlpha()},this.setClearAlpha=function(){ke.setClearAlpha.apply(ke,arguments)},this.clear=function(T=!0,k=!0,B=!0){let j=0;if(T){let I=!1;if(A!==null){const ce=A.texture.format;I=ce===Xh||ce===Wh||ce===Gh}if(I){const ce=A.texture.type,xe=ce===vi||ce===Cr||ce===Ia||ce===Rs||ce===Hh||ce===Vh,Se=ke.getClearColor(),Ee=ke.getClearAlpha(),Ue=Se.r,Fe=Se.g,be=Se.b;xe?(x[0]=Ue,x[1]=Fe,x[2]=be,x[3]=Ee,P.clearBufferuiv(P.COLOR,0,x)):(_[0]=Ue,_[1]=Fe,_[2]=be,_[3]=Ee,P.clearBufferiv(P.COLOR,0,_))}else j|=P.COLOR_BUFFER_BIT}k&&(j|=P.DEPTH_BUFFER_BIT,P.clearDepth(this.capabilities.reverseDepthBuffer?0:1)),B&&(j|=P.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),P.clear(j)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){n.removeEventListener("webglcontextlost",K,!1),n.removeEventListener("webglcontextrestored",ge,!1),n.removeEventListener("webglcontextcreationerror",de,!1),ve.dispose(),Xe.dispose(),Ne.dispose(),M.dispose(),z.dispose(),Y.dispose(),Oe.dispose(),L.dispose(),Me.dispose(),X.dispose(),X.removeEventListener("sessionstart",rf),X.removeEventListener("sessionend",sf),tr.stop()};function K(T){T.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),w=!0}function ge(){console.log("THREE.WebGLRenderer: Context Restored."),w=!1;const T=rt.autoReset,k=ye.enabled,B=ye.autoUpdate,j=ye.needsUpdate,I=ye.type;fe(),rt.autoReset=T,ye.enabled=k,ye.autoUpdate=B,ye.needsUpdate=j,ye.type=I}function de(T){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",T.statusMessage)}function qe(T){const k=T.target;k.removeEventListener("dispose",qe),ft(k)}function ft(T){Qt(T),Ne.remove(T)}function Qt(T){const k=Ne.get(T).programs;k!==void 0&&(k.forEach(function(B){Me.releaseProgram(B)}),T.isShaderMaterial&&Me.releaseShaderCache(T))}this.renderBufferDirect=function(T,k,B,j,I,ce){k===null&&(k=We);const xe=I.isMesh&&I.matrixWorld.determinant()<0,Se=Px(T,k,B,j,I);De.setMaterial(j,xe);let Ee=B.index,Ue=1;if(j.wireframe===!0){if(Ee=ne.getWireframeAttribute(B),Ee===void 0)return;Ue=2}const Fe=B.drawRange,be=B.attributes.position;let nt=Fe.start*Ue,ot=(Fe.start+Fe.count)*Ue;ce!==null&&(nt=Math.max(nt,ce.start*Ue),ot=Math.min(ot,(ce.start+ce.count)*Ue)),Ee!==null?(nt=Math.max(nt,0),ot=Math.min(ot,Ee.count)):be!=null&&(nt=Math.max(nt,0),ot=Math.min(ot,be.count));const xt=ot-nt;if(xt<0||xt===1/0)return;Oe.setup(I,j,Se,B,Ee);let ln,Je=re;if(Ee!==null&&(ln=Z.get(Ee),Je=Re,Je.setIndex(ln)),I.isMesh)j.wireframe===!0?(De.setLineWidth(j.wireframeLinewidth*je()),Je.setMode(P.LINES)):Je.setMode(P.TRIANGLES);else if(I.isLine){let Ae=j.linewidth;Ae===void 0&&(Ae=1),De.setLineWidth(Ae*je()),I.isLineSegments?Je.setMode(P.LINES):I.isLineLoop?Je.setMode(P.LINE_LOOP):Je.setMode(P.LINE_STRIP)}else I.isPoints?Je.setMode(P.POINTS):I.isSprite&&Je.setMode(P.TRIANGLES);if(I.isBatchedMesh)if(I._multiDrawInstances!==null)Je.renderMultiDrawInstances(I._multiDrawStarts,I._multiDrawCounts,I._multiDrawCount,I._multiDrawInstances);else if(He.get("WEBGL_multi_draw"))Je.renderMultiDraw(I._multiDrawStarts,I._multiDrawCounts,I._multiDrawCount);else{const Ae=I._multiDrawStarts,Nt=I._multiDrawCounts,et=I._multiDrawCount,Pn=Ee?Z.get(Ee).bytesPerElement:1,Lr=Ne.get(j).currentProgram.getUniforms();for(let cn=0;cn<et;cn++)Lr.setValue(P,"_gl_DrawID",cn),Je.render(Ae[cn]/Pn,Nt[cn])}else if(I.isInstancedMesh)Je.renderInstances(nt,xt,I.count);else if(B.isInstancedBufferGeometry){const Ae=B._maxInstanceCount!==void 0?B._maxInstanceCount:1/0,Nt=Math.min(B.instanceCount,Ae);Je.renderInstances(nt,xt,Nt)}else Je.render(nt,xt)};function Ze(T,k,B){T.transparent===!0&&T.side===zn&&T.forceSinglePass===!1?(T.side=qt,T.needsUpdate=!0,Ya(T,k,B),T.side=$i,T.needsUpdate=!0,Ya(T,k,B),T.side=zn):Ya(T,k,B)}this.compile=function(T,k,B=null){B===null&&(B=T),m=Xe.get(B),m.init(k),g.push(m),B.traverseVisible(function(I){I.isLight&&I.layers.test(k.layers)&&(m.pushLight(I),I.castShadow&&m.pushShadow(I))}),T!==B&&T.traverseVisible(function(I){I.isLight&&I.layers.test(k.layers)&&(m.pushLight(I),I.castShadow&&m.pushShadow(I))}),m.setupLights();const j=new Set;return T.traverse(function(I){if(!(I.isMesh||I.isPoints||I.isLine||I.isSprite))return;const ce=I.material;if(ce)if(Array.isArray(ce))for(let xe=0;xe<ce.length;xe++){const Se=ce[xe];Ze(Se,B,I),j.add(Se)}else Ze(ce,B,I),j.add(ce)}),g.pop(),m=null,j},this.compileAsync=function(T,k,B=null){const j=this.compile(T,k,B);return new Promise(I=>{function ce(){if(j.forEach(function(xe){Ne.get(xe).currentProgram.isReady()&&j.delete(xe)}),j.size===0){I(T);return}setTimeout(ce,10)}He.get("KHR_parallel_shader_compile")!==null?ce():setTimeout(ce,10)})};let Jt=null;function Jn(T){Jt&&Jt(T)}function rf(){tr.stop()}function sf(){tr.start()}const tr=new Sx;tr.setAnimationLoop(Jn),typeof self<"u"&&tr.setContext(self),this.setAnimationLoop=function(T){Jt=T,X.setAnimationLoop(T),T===null?tr.stop():tr.start()},X.addEventListener("sessionstart",rf),X.addEventListener("sessionend",sf),this.render=function(T,k){if(k!==void 0&&k.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(w===!0)return;if(T.matrixWorldAutoUpdate===!0&&T.updateMatrixWorld(),k.parent===null&&k.matrixWorldAutoUpdate===!0&&k.updateMatrixWorld(),X.enabled===!0&&X.isPresenting===!0&&(X.cameraAutoUpdate===!0&&X.updateCamera(k),k=X.getCamera()),T.isScene===!0&&T.onBeforeRender(v,T,k,A),m=Xe.get(T,g.length),m.init(k),g.push(m),me.multiplyMatrices(k.projectionMatrix,k.matrixWorldInverse),Te.setFromProjectionMatrix(me),ie=this.localClippingEnabled,G=ae.init(this.clippingPlanes,ie),S=ve.get(T,d.length),S.init(),d.push(S),X.enabled===!0&&X.isPresenting===!0){const ce=v.xr.getDepthSensingMesh();ce!==null&&Kl(ce,k,-1/0,v.sortObjects)}Kl(T,k,0,v.sortObjects),S.finish(),v.sortObjects===!0&&S.sort(D,J),Qe=X.enabled===!1||X.isPresenting===!1||X.hasDepthSensing()===!1,Qe&&ke.addToRenderList(S,T),this.info.render.frame++,G===!0&&ae.beginShadows();const B=m.state.shadowsArray;ye.render(B,T,k),G===!0&&ae.endShadows(),this.info.autoReset===!0&&this.info.reset();const j=S.opaque,I=S.transmissive;if(m.setupLights(),k.isArrayCamera){const ce=k.cameras;if(I.length>0)for(let xe=0,Se=ce.length;xe<Se;xe++){const Ee=ce[xe];of(j,I,T,Ee)}Qe&&ke.render(T);for(let xe=0,Se=ce.length;xe<Se;xe++){const Ee=ce[xe];af(S,T,Ee,Ee.viewport)}}else I.length>0&&of(j,I,T,k),Qe&&ke.render(T),af(S,T,k);A!==null&&(C.updateMultisampleRenderTarget(A),C.updateRenderTargetMipmap(A)),T.isScene===!0&&T.onAfterRender(v,T,k),Oe.resetDefaultState(),R=-1,F=null,g.pop(),g.length>0?(m=g[g.length-1],G===!0&&ae.setGlobalState(v.clippingPlanes,m.state.camera)):m=null,d.pop(),d.length>0?S=d[d.length-1]:S=null};function Kl(T,k,B,j){if(T.visible===!1)return;if(T.layers.test(k.layers)){if(T.isGroup)B=T.renderOrder;else if(T.isLOD)T.autoUpdate===!0&&T.update(k);else if(T.isLight)m.pushLight(T),T.castShadow&&m.pushShadow(T);else if(T.isSprite){if(!T.frustumCulled||Te.intersectsSprite(T)){j&&Le.setFromMatrixPosition(T.matrixWorld).applyMatrix4(me);const xe=Y.update(T),Se=T.material;Se.visible&&S.push(T,xe,Se,B,Le.z,null)}}else if((T.isMesh||T.isLine||T.isPoints)&&(!T.frustumCulled||Te.intersectsObject(T))){const xe=Y.update(T),Se=T.material;if(j&&(T.boundingSphere!==void 0?(T.boundingSphere===null&&T.computeBoundingSphere(),Le.copy(T.boundingSphere.center)):(xe.boundingSphere===null&&xe.computeBoundingSphere(),Le.copy(xe.boundingSphere.center)),Le.applyMatrix4(T.matrixWorld).applyMatrix4(me)),Array.isArray(Se)){const Ee=xe.groups;for(let Ue=0,Fe=Ee.length;Ue<Fe;Ue++){const be=Ee[Ue],nt=Se[be.materialIndex];nt&&nt.visible&&S.push(T,xe,nt,B,Le.z,be)}}else Se.visible&&S.push(T,xe,Se,B,Le.z,null)}}const ce=T.children;for(let xe=0,Se=ce.length;xe<Se;xe++)Kl(ce[xe],k,B,j)}function af(T,k,B,j){const I=T.opaque,ce=T.transmissive,xe=T.transparent;m.setupLightsView(B),G===!0&&ae.setGlobalState(v.clippingPlanes,B),j&&De.viewport(y.copy(j)),I.length>0&&qa(I,k,B),ce.length>0&&qa(ce,k,B),xe.length>0&&qa(xe,k,B),De.buffers.depth.setTest(!0),De.buffers.depth.setMask(!0),De.buffers.color.setMask(!0),De.setPolygonOffset(!1)}function of(T,k,B,j){if((B.isScene===!0?B.overrideMaterial:null)!==null)return;m.state.transmissionRenderTarget[j.id]===void 0&&(m.state.transmissionRenderTarget[j.id]=new Rr(1,1,{generateMipmaps:!0,type:He.has("EXT_color_buffer_half_float")||He.has("EXT_color_buffer_float")?Ha:vi,minFilter:yr,samples:4,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:tt.workingColorSpace}));const ce=m.state.transmissionRenderTarget[j.id],xe=j.viewport||y;ce.setSize(xe.z,xe.w);const Se=v.getRenderTarget();v.setRenderTarget(ce),v.getClearColor(V),q=v.getClearAlpha(),q<1&&v.setClearColor(16777215,.5),v.clear(),Qe&&ke.render(B);const Ee=v.toneMapping;v.toneMapping=Xi;const Ue=j.viewport;if(j.viewport!==void 0&&(j.viewport=void 0),m.setupLightsView(j),G===!0&&ae.setGlobalState(v.clippingPlanes,j),qa(T,B,j),C.updateMultisampleRenderTarget(ce),C.updateRenderTargetMipmap(ce),He.has("WEBGL_multisampled_render_to_texture")===!1){let Fe=!1;for(let be=0,nt=k.length;be<nt;be++){const ot=k[be],xt=ot.object,ln=ot.geometry,Je=ot.material,Ae=ot.group;if(Je.side===zn&&xt.layers.test(j.layers)){const Nt=Je.side;Je.side=qt,Je.needsUpdate=!0,lf(xt,B,j,ln,Je,Ae),Je.side=Nt,Je.needsUpdate=!0,Fe=!0}}Fe===!0&&(C.updateMultisampleRenderTarget(ce),C.updateRenderTargetMipmap(ce))}v.setRenderTarget(Se),v.setClearColor(V,q),Ue!==void 0&&(j.viewport=Ue),v.toneMapping=Ee}function qa(T,k,B){const j=k.isScene===!0?k.overrideMaterial:null;for(let I=0,ce=T.length;I<ce;I++){const xe=T[I],Se=xe.object,Ee=xe.geometry,Ue=j===null?xe.material:j,Fe=xe.group;Se.layers.test(B.layers)&&lf(Se,k,B,Ee,Ue,Fe)}}function lf(T,k,B,j,I,ce){T.onBeforeRender(v,k,B,j,I,ce),T.modelViewMatrix.multiplyMatrices(B.matrixWorldInverse,T.matrixWorld),T.normalMatrix.getNormalMatrix(T.modelViewMatrix),I.onBeforeRender(v,k,B,j,T,ce),I.transparent===!0&&I.side===zn&&I.forceSinglePass===!1?(I.side=qt,I.needsUpdate=!0,v.renderBufferDirect(B,k,j,I,T,ce),I.side=$i,I.needsUpdate=!0,v.renderBufferDirect(B,k,j,I,T,ce),I.side=zn):v.renderBufferDirect(B,k,j,I,T,ce),T.onAfterRender(v,k,B,j,I,ce)}function Ya(T,k,B){k.isScene!==!0&&(k=We);const j=Ne.get(T),I=m.state.lights,ce=m.state.shadowsArray,xe=I.state.version,Se=Me.getParameters(T,I.state,ce,k,B),Ee=Me.getProgramCacheKey(Se);let Ue=j.programs;j.environment=T.isMeshStandardMaterial?k.environment:null,j.fog=k.fog,j.envMap=(T.isMeshStandardMaterial?z:M).get(T.envMap||j.environment),j.envMapRotation=j.environment!==null&&T.envMap===null?k.environmentRotation:T.envMapRotation,Ue===void 0&&(T.addEventListener("dispose",qe),Ue=new Map,j.programs=Ue);let Fe=Ue.get(Ee);if(Fe!==void 0){if(j.currentProgram===Fe&&j.lightsStateVersion===xe)return uf(T,Se),Fe}else Se.uniforms=Me.getUniforms(T),T.onBeforeCompile(Se,v),Fe=Me.acquireProgram(Se,Ee),Ue.set(Ee,Fe),j.uniforms=Se.uniforms;const be=j.uniforms;return(!T.isShaderMaterial&&!T.isRawShaderMaterial||T.clipping===!0)&&(be.clippingPlanes=ae.uniform),uf(T,Se),j.needsLights=Dx(T),j.lightsStateVersion=xe,j.needsLights&&(be.ambientLightColor.value=I.state.ambient,be.lightProbe.value=I.state.probe,be.directionalLights.value=I.state.directional,be.directionalLightShadows.value=I.state.directionalShadow,be.spotLights.value=I.state.spot,be.spotLightShadows.value=I.state.spotShadow,be.rectAreaLights.value=I.state.rectArea,be.ltc_1.value=I.state.rectAreaLTC1,be.ltc_2.value=I.state.rectAreaLTC2,be.pointLights.value=I.state.point,be.pointLightShadows.value=I.state.pointShadow,be.hemisphereLights.value=I.state.hemi,be.directionalShadowMap.value=I.state.directionalShadowMap,be.directionalShadowMatrix.value=I.state.directionalShadowMatrix,be.spotShadowMap.value=I.state.spotShadowMap,be.spotLightMatrix.value=I.state.spotLightMatrix,be.spotLightMap.value=I.state.spotLightMap,be.pointShadowMap.value=I.state.pointShadowMap,be.pointShadowMatrix.value=I.state.pointShadowMatrix),j.currentProgram=Fe,j.uniformsList=null,Fe}function cf(T){if(T.uniformsList===null){const k=T.currentProgram.getUniforms();T.uniformsList=el.seqWithValue(k.seq,T.uniforms)}return T.uniformsList}function uf(T,k){const B=Ne.get(T);B.outputColorSpace=k.outputColorSpace,B.batching=k.batching,B.batchingColor=k.batchingColor,B.instancing=k.instancing,B.instancingColor=k.instancingColor,B.instancingMorph=k.instancingMorph,B.skinning=k.skinning,B.morphTargets=k.morphTargets,B.morphNormals=k.morphNormals,B.morphColors=k.morphColors,B.morphTargetsCount=k.morphTargetsCount,B.numClippingPlanes=k.numClippingPlanes,B.numIntersection=k.numClipIntersection,B.vertexAlphas=k.vertexAlphas,B.vertexTangents=k.vertexTangents,B.toneMapping=k.toneMapping}function Px(T,k,B,j,I){k.isScene!==!0&&(k=We),C.resetTextureUnits();const ce=k.fog,xe=j.isMeshStandardMaterial?k.environment:null,Se=A===null?v.outputColorSpace:A.isXRRenderTarget===!0?A.texture.colorSpace:er,Ee=(j.isMeshStandardMaterial?z:M).get(j.envMap||xe),Ue=j.vertexColors===!0&&!!B.attributes.color&&B.attributes.color.itemSize===4,Fe=!!B.attributes.tangent&&(!!j.normalMap||j.anisotropy>0),be=!!B.morphAttributes.position,nt=!!B.morphAttributes.normal,ot=!!B.morphAttributes.color;let xt=Xi;j.toneMapped&&(A===null||A.isXRRenderTarget===!0)&&(xt=v.toneMapping);const ln=B.morphAttributes.position||B.morphAttributes.normal||B.morphAttributes.color,Je=ln!==void 0?ln.length:0,Ae=Ne.get(j),Nt=m.state.lights;if(G===!0&&(ie===!0||T!==F)){const _n=T===F&&j.id===R;ae.setState(j,T,_n)}let et=!1;j.version===Ae.__version?(Ae.needsLights&&Ae.lightsStateVersion!==Nt.state.version||Ae.outputColorSpace!==Se||I.isBatchedMesh&&Ae.batching===!1||!I.isBatchedMesh&&Ae.batching===!0||I.isBatchedMesh&&Ae.batchingColor===!0&&I.colorTexture===null||I.isBatchedMesh&&Ae.batchingColor===!1&&I.colorTexture!==null||I.isInstancedMesh&&Ae.instancing===!1||!I.isInstancedMesh&&Ae.instancing===!0||I.isSkinnedMesh&&Ae.skinning===!1||!I.isSkinnedMesh&&Ae.skinning===!0||I.isInstancedMesh&&Ae.instancingColor===!0&&I.instanceColor===null||I.isInstancedMesh&&Ae.instancingColor===!1&&I.instanceColor!==null||I.isInstancedMesh&&Ae.instancingMorph===!0&&I.morphTexture===null||I.isInstancedMesh&&Ae.instancingMorph===!1&&I.morphTexture!==null||Ae.envMap!==Ee||j.fog===!0&&Ae.fog!==ce||Ae.numClippingPlanes!==void 0&&(Ae.numClippingPlanes!==ae.numPlanes||Ae.numIntersection!==ae.numIntersection)||Ae.vertexAlphas!==Ue||Ae.vertexTangents!==Fe||Ae.morphTargets!==be||Ae.morphNormals!==nt||Ae.morphColors!==ot||Ae.toneMapping!==xt||Ae.morphTargetsCount!==Je)&&(et=!0):(et=!0,Ae.__version=j.version);let Pn=Ae.currentProgram;et===!0&&(Pn=Ya(j,k,I));let Lr=!1,cn=!1,Zl=!1;const _t=Pn.getUniforms(),yi=Ae.uniforms;if(De.useProgram(Pn.program)&&(Lr=!0,cn=!0,Zl=!0),j.id!==R&&(R=j.id,cn=!0),Lr||F!==T){Ve.reverseDepthBuffer?(ue.copy(T.projectionMatrix),W1(ue),X1(ue),_t.setValue(P,"projectionMatrix",ue)):_t.setValue(P,"projectionMatrix",T.projectionMatrix),_t.setValue(P,"viewMatrix",T.matrixWorldInverse);const _n=_t.map.cameraPosition;_n!==void 0&&_n.setValue(P,Pe.setFromMatrixPosition(T.matrixWorld)),Ve.logarithmicDepthBuffer&&_t.setValue(P,"logDepthBufFC",2/(Math.log(T.far+1)/Math.LN2)),(j.isMeshPhongMaterial||j.isMeshToonMaterial||j.isMeshLambertMaterial||j.isMeshBasicMaterial||j.isMeshStandardMaterial||j.isShaderMaterial)&&_t.setValue(P,"isOrthographic",T.isOrthographicCamera===!0),F!==T&&(F=T,cn=!0,Zl=!0)}if(I.isSkinnedMesh){_t.setOptional(P,I,"bindMatrix"),_t.setOptional(P,I,"bindMatrixInverse");const _n=I.skeleton;_n&&(_n.boneTexture===null&&_n.computeBoneTexture(),_t.setValue(P,"boneTexture",_n.boneTexture,C))}I.isBatchedMesh&&(_t.setOptional(P,I,"batchingTexture"),_t.setValue(P,"batchingTexture",I._matricesTexture,C),_t.setOptional(P,I,"batchingIdTexture"),_t.setValue(P,"batchingIdTexture",I._indirectTexture,C),_t.setOptional(P,I,"batchingColorTexture"),I._colorsTexture!==null&&_t.setValue(P,"batchingColorTexture",I._colorsTexture,C));const Ql=B.morphAttributes;if((Ql.position!==void 0||Ql.normal!==void 0||Ql.color!==void 0)&&te.update(I,B,Pn),(cn||Ae.receiveShadow!==I.receiveShadow)&&(Ae.receiveShadow=I.receiveShadow,_t.setValue(P,"receiveShadow",I.receiveShadow)),j.isMeshGouraudMaterial&&j.envMap!==null&&(yi.envMap.value=Ee,yi.flipEnvMap.value=Ee.isCubeTexture&&Ee.isRenderTargetTexture===!1?-1:1),j.isMeshStandardMaterial&&j.envMap===null&&k.environment!==null&&(yi.envMapIntensity.value=k.environmentIntensity),cn&&(_t.setValue(P,"toneMappingExposure",v.toneMappingExposure),Ae.needsLights&&Lx(yi,Zl),ce&&j.fog===!0&&he.refreshFogUniforms(yi,ce),he.refreshMaterialUniforms(yi,j,$,W,m.state.transmissionRenderTarget[T.id]),el.upload(P,cf(Ae),yi,C)),j.isShaderMaterial&&j.uniformsNeedUpdate===!0&&(el.upload(P,cf(Ae),yi,C),j.uniformsNeedUpdate=!1),j.isSpriteMaterial&&_t.setValue(P,"center",I.center),_t.setValue(P,"modelViewMatrix",I.modelViewMatrix),_t.setValue(P,"normalMatrix",I.normalMatrix),_t.setValue(P,"modelMatrix",I.matrixWorld),j.isShaderMaterial||j.isRawShaderMaterial){const _n=j.uniformsGroups;for(let Jl=0,kx=_n.length;Jl<kx;Jl++){const df=_n[Jl];L.update(df,Pn),L.bind(df,Pn)}}return Pn}function Lx(T,k){T.ambientLightColor.needsUpdate=k,T.lightProbe.needsUpdate=k,T.directionalLights.needsUpdate=k,T.directionalLightShadows.needsUpdate=k,T.pointLights.needsUpdate=k,T.pointLightShadows.needsUpdate=k,T.spotLights.needsUpdate=k,T.spotLightShadows.needsUpdate=k,T.rectAreaLights.needsUpdate=k,T.hemisphereLights.needsUpdate=k}function Dx(T){return T.isMeshLambertMaterial||T.isMeshToonMaterial||T.isMeshPhongMaterial||T.isMeshStandardMaterial||T.isShadowMaterial||T.isShaderMaterial&&T.lights===!0}this.getActiveCubeFace=function(){return N},this.getActiveMipmapLevel=function(){return E},this.getRenderTarget=function(){return A},this.setRenderTargetTextures=function(T,k,B){Ne.get(T.texture).__webglTexture=k,Ne.get(T.depthTexture).__webglTexture=B;const j=Ne.get(T);j.__hasExternalTextures=!0,j.__autoAllocateDepthBuffer=B===void 0,j.__autoAllocateDepthBuffer||He.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),j.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(T,k){const B=Ne.get(T);B.__webglFramebuffer=k,B.__useDefaultFramebuffer=k===void 0},this.setRenderTarget=function(T,k=0,B=0){A=T,N=k,E=B;let j=!0,I=null,ce=!1,xe=!1;if(T){const Ee=Ne.get(T);if(Ee.__useDefaultFramebuffer!==void 0)De.bindFramebuffer(P.FRAMEBUFFER,null),j=!1;else if(Ee.__webglFramebuffer===void 0)C.setupRenderTarget(T);else if(Ee.__hasExternalTextures)C.rebindTextures(T,Ne.get(T.texture).__webglTexture,Ne.get(T.depthTexture).__webglTexture);else if(T.depthBuffer){const be=T.depthTexture;if(Ee.__boundDepthTexture!==be){if(be!==null&&Ne.has(be)&&(T.width!==be.image.width||T.height!==be.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");C.setupDepthRenderbuffer(T)}}const Ue=T.texture;(Ue.isData3DTexture||Ue.isDataArrayTexture||Ue.isCompressedArrayTexture)&&(xe=!0);const Fe=Ne.get(T).__webglFramebuffer;T.isWebGLCubeRenderTarget?(Array.isArray(Fe[k])?I=Fe[k][B]:I=Fe[k],ce=!0):T.samples>0&&C.useMultisampledRTT(T)===!1?I=Ne.get(T).__webglMultisampledFramebuffer:Array.isArray(Fe)?I=Fe[B]:I=Fe,y.copy(T.viewport),b.copy(T.scissor),H=T.scissorTest}else y.copy(ee).multiplyScalar($).floor(),b.copy(O).multiplyScalar($).floor(),H=oe;if(De.bindFramebuffer(P.FRAMEBUFFER,I)&&j&&De.drawBuffers(T,I),De.viewport(y),De.scissor(b),De.setScissorTest(H),ce){const Ee=Ne.get(T.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_CUBE_MAP_POSITIVE_X+k,Ee.__webglTexture,B)}else if(xe){const Ee=Ne.get(T.texture),Ue=k||0;P.framebufferTextureLayer(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,Ee.__webglTexture,B||0,Ue)}R=-1},this.readRenderTargetPixels=function(T,k,B,j,I,ce,xe){if(!(T&&T.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Se=Ne.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&xe!==void 0&&(Se=Se[xe]),Se){De.bindFramebuffer(P.FRAMEBUFFER,Se);try{const Ee=T.texture,Ue=Ee.format,Fe=Ee.type;if(!Ve.textureFormatReadable(Ue)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Ve.textureTypeReadable(Fe)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}k>=0&&k<=T.width-j&&B>=0&&B<=T.height-I&&P.readPixels(k,B,j,I,Ce.convert(Ue),Ce.convert(Fe),ce)}finally{const Ee=A!==null?Ne.get(A).__webglFramebuffer:null;De.bindFramebuffer(P.FRAMEBUFFER,Ee)}}},this.readRenderTargetPixelsAsync=async function(T,k,B,j,I,ce,xe){if(!(T&&T.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Se=Ne.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&xe!==void 0&&(Se=Se[xe]),Se){const Ee=T.texture,Ue=Ee.format,Fe=Ee.type;if(!Ve.textureFormatReadable(Ue))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Ve.textureTypeReadable(Fe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(k>=0&&k<=T.width-j&&B>=0&&B<=T.height-I){De.bindFramebuffer(P.FRAMEBUFFER,Se);const be=P.createBuffer();P.bindBuffer(P.PIXEL_PACK_BUFFER,be),P.bufferData(P.PIXEL_PACK_BUFFER,ce.byteLength,P.STREAM_READ),P.readPixels(k,B,j,I,Ce.convert(Ue),Ce.convert(Fe),0);const nt=A!==null?Ne.get(A).__webglFramebuffer:null;De.bindFramebuffer(P.FRAMEBUFFER,nt);const ot=P.fenceSync(P.SYNC_GPU_COMMANDS_COMPLETE,0);return P.flush(),await G1(P,ot,4),P.bindBuffer(P.PIXEL_PACK_BUFFER,be),P.getBufferSubData(P.PIXEL_PACK_BUFFER,0,ce),P.deleteBuffer(be),P.deleteSync(ot),ce}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(T,k=null,B=0){T.isTexture!==!0&&(Jo("WebGLRenderer: copyFramebufferToTexture function signature has changed."),k=arguments[0]||null,T=arguments[1]);const j=Math.pow(2,-B),I=Math.floor(T.image.width*j),ce=Math.floor(T.image.height*j),xe=k!==null?k.x:0,Se=k!==null?k.y:0;C.setTexture2D(T,0),P.copyTexSubImage2D(P.TEXTURE_2D,B,0,0,xe,Se,I,ce),De.unbindTexture()},this.copyTextureToTexture=function(T,k,B=null,j=null,I=0){T.isTexture!==!0&&(Jo("WebGLRenderer: copyTextureToTexture function signature has changed."),j=arguments[0]||null,T=arguments[1],k=arguments[2],I=arguments[3]||0,B=null);let ce,xe,Se,Ee,Ue,Fe;B!==null?(ce=B.max.x-B.min.x,xe=B.max.y-B.min.y,Se=B.min.x,Ee=B.min.y):(ce=T.image.width,xe=T.image.height,Se=0,Ee=0),j!==null?(Ue=j.x,Fe=j.y):(Ue=0,Fe=0);const be=Ce.convert(k.format),nt=Ce.convert(k.type);C.setTexture2D(k,0),P.pixelStorei(P.UNPACK_FLIP_Y_WEBGL,k.flipY),P.pixelStorei(P.UNPACK_PREMULTIPLY_ALPHA_WEBGL,k.premultiplyAlpha),P.pixelStorei(P.UNPACK_ALIGNMENT,k.unpackAlignment);const ot=P.getParameter(P.UNPACK_ROW_LENGTH),xt=P.getParameter(P.UNPACK_IMAGE_HEIGHT),ln=P.getParameter(P.UNPACK_SKIP_PIXELS),Je=P.getParameter(P.UNPACK_SKIP_ROWS),Ae=P.getParameter(P.UNPACK_SKIP_IMAGES),Nt=T.isCompressedTexture?T.mipmaps[I]:T.image;P.pixelStorei(P.UNPACK_ROW_LENGTH,Nt.width),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,Nt.height),P.pixelStorei(P.UNPACK_SKIP_PIXELS,Se),P.pixelStorei(P.UNPACK_SKIP_ROWS,Ee),T.isDataTexture?P.texSubImage2D(P.TEXTURE_2D,I,Ue,Fe,ce,xe,be,nt,Nt.data):T.isCompressedTexture?P.compressedTexSubImage2D(P.TEXTURE_2D,I,Ue,Fe,Nt.width,Nt.height,be,Nt.data):P.texSubImage2D(P.TEXTURE_2D,I,Ue,Fe,ce,xe,be,nt,Nt),P.pixelStorei(P.UNPACK_ROW_LENGTH,ot),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,xt),P.pixelStorei(P.UNPACK_SKIP_PIXELS,ln),P.pixelStorei(P.UNPACK_SKIP_ROWS,Je),P.pixelStorei(P.UNPACK_SKIP_IMAGES,Ae),I===0&&k.generateMipmaps&&P.generateMipmap(P.TEXTURE_2D),De.unbindTexture()},this.copyTextureToTexture3D=function(T,k,B=null,j=null,I=0){T.isTexture!==!0&&(Jo("WebGLRenderer: copyTextureToTexture3D function signature has changed."),B=arguments[0]||null,j=arguments[1]||null,T=arguments[2],k=arguments[3],I=arguments[4]||0);let ce,xe,Se,Ee,Ue,Fe,be,nt,ot;const xt=T.isCompressedTexture?T.mipmaps[I]:T.image;B!==null?(ce=B.max.x-B.min.x,xe=B.max.y-B.min.y,Se=B.max.z-B.min.z,Ee=B.min.x,Ue=B.min.y,Fe=B.min.z):(ce=xt.width,xe=xt.height,Se=xt.depth,Ee=0,Ue=0,Fe=0),j!==null?(be=j.x,nt=j.y,ot=j.z):(be=0,nt=0,ot=0);const ln=Ce.convert(k.format),Je=Ce.convert(k.type);let Ae;if(k.isData3DTexture)C.setTexture3D(k,0),Ae=P.TEXTURE_3D;else if(k.isDataArrayTexture||k.isCompressedArrayTexture)C.setTexture2DArray(k,0),Ae=P.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}P.pixelStorei(P.UNPACK_FLIP_Y_WEBGL,k.flipY),P.pixelStorei(P.UNPACK_PREMULTIPLY_ALPHA_WEBGL,k.premultiplyAlpha),P.pixelStorei(P.UNPACK_ALIGNMENT,k.unpackAlignment);const Nt=P.getParameter(P.UNPACK_ROW_LENGTH),et=P.getParameter(P.UNPACK_IMAGE_HEIGHT),Pn=P.getParameter(P.UNPACK_SKIP_PIXELS),Lr=P.getParameter(P.UNPACK_SKIP_ROWS),cn=P.getParameter(P.UNPACK_SKIP_IMAGES);P.pixelStorei(P.UNPACK_ROW_LENGTH,xt.width),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,xt.height),P.pixelStorei(P.UNPACK_SKIP_PIXELS,Ee),P.pixelStorei(P.UNPACK_SKIP_ROWS,Ue),P.pixelStorei(P.UNPACK_SKIP_IMAGES,Fe),T.isDataTexture||T.isData3DTexture?P.texSubImage3D(Ae,I,be,nt,ot,ce,xe,Se,ln,Je,xt.data):k.isCompressedArrayTexture?P.compressedTexSubImage3D(Ae,I,be,nt,ot,ce,xe,Se,ln,xt.data):P.texSubImage3D(Ae,I,be,nt,ot,ce,xe,Se,ln,Je,xt),P.pixelStorei(P.UNPACK_ROW_LENGTH,Nt),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,et),P.pixelStorei(P.UNPACK_SKIP_PIXELS,Pn),P.pixelStorei(P.UNPACK_SKIP_ROWS,Lr),P.pixelStorei(P.UNPACK_SKIP_IMAGES,cn),I===0&&k.generateMipmaps&&P.generateMipmap(Ae),De.unbindTexture()},this.initRenderTarget=function(T){Ne.get(T).__webglFramebuffer===void 0&&C.setupRenderTarget(T)},this.initTexture=function(T){T.isCubeTexture?C.setTextureCube(T,0):T.isData3DTexture?C.setTexture3D(T,0):T.isDataArrayTexture||T.isCompressedArrayTexture?C.setTexture2DArray(T,0):C.setTexture2D(T,0),De.unbindTexture()},this.resetState=function(){N=0,E=0,A=null,De.reset(),Oe.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return di}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const n=this.getContext();n.drawingBufferColorSpace=e===qh?"display-p3":"srgb",n.unpackColorSpace=tt.workingColorSpace===ql?"display-p3":"srgb"}}class Qh{constructor(e,n=25e-5){this.isFogExp2=!0,this.name="",this.color=new $e(e),this.density=n}clone(){return new Qh(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}}class rT extends $t{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Qn,this.environmentIntensity=1,this.environmentRotation=new Qn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,n){return super.copy(e,n),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const n=super.toJSON(e);return this.fog!==null&&(n.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(n.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(n.object.backgroundIntensity=this.backgroundIntensity),n.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(n.object.environmentIntensity=this.environmentIntensity),n.object.environmentRotation=this.environmentRotation.toArray(),n}}class Ax extends Fs{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new $e(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const vm=new dt,Vd=new Yh,ko=new Yl,Io=new U;class sT extends $t{constructor(e=new Nn,n=new Ax){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=n,this.updateMorphTargets()}copy(e,n){return super.copy(e,n),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,n){const i=this.geometry,r=this.matrixWorld,s=e.params.Points.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),ko.copy(i.boundingSphere),ko.applyMatrix4(r),ko.radius+=s,e.ray.intersectsSphere(ko)===!1)return;vm.copy(r).invert(),Vd.copy(e.ray).applyMatrix4(vm);const o=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,u=i.index,p=i.attributes.position;if(u!==null){const f=Math.max(0,a.start),x=Math.min(u.count,a.start+a.count);for(let _=f,S=x;_<S;_++){const m=u.getX(_);Io.fromBufferAttribute(p,m),_m(Io,m,l,r,e,n,this)}}else{const f=Math.max(0,a.start),x=Math.min(p.count,a.start+a.count);for(let _=f,S=x;_<S;_++)Io.fromBufferAttribute(p,_),_m(Io,_,l,r,e,n,this)}}updateMorphTargets(){const n=this.geometry.morphAttributes,i=Object.keys(n);if(i.length>0){const r=n[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=r.length;s<a;s++){const o=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}}function _m(t,e,n,i,r,s,a){const o=Vd.distanceSqToPoint(t);if(o<n){const l=new U;Vd.closestPointToPoint(t,l),l.applyMatrix4(i);const u=r.ray.origin.distanceTo(l);if(u<r.near||u>r.far)return;s.push({distance:u,distanceToRay:Math.sqrt(o),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}class Jh extends Nn{constructor(e=[],n=[],i=1,r=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:n,radius:i,detail:r};const s=[],a=[];o(r),u(i),h(),this.setAttribute("position",new jt(s,3)),this.setAttribute("normal",new jt(s.slice(),3)),this.setAttribute("uv",new jt(a,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function o(g){const v=new U,w=new U,N=new U;for(let E=0;E<n.length;E+=3)x(n[E+0],v),x(n[E+1],w),x(n[E+2],N),l(v,w,N,g)}function l(g,v,w,N){const E=N+1,A=[];for(let R=0;R<=E;R++){A[R]=[];const F=g.clone().lerp(w,R/E),y=v.clone().lerp(w,R/E),b=E-R;for(let H=0;H<=b;H++)H===0&&R===E?A[R][H]=F:A[R][H]=F.clone().lerp(y,H/b)}for(let R=0;R<E;R++)for(let F=0;F<2*(E-R)-1;F++){const y=Math.floor(F/2);F%2===0?(f(A[R][y+1]),f(A[R+1][y]),f(A[R][y])):(f(A[R][y+1]),f(A[R+1][y+1]),f(A[R+1][y]))}}function u(g){const v=new U;for(let w=0;w<s.length;w+=3)v.x=s[w+0],v.y=s[w+1],v.z=s[w+2],v.normalize().multiplyScalar(g),s[w+0]=v.x,s[w+1]=v.y,s[w+2]=v.z}function h(){const g=new U;for(let v=0;v<s.length;v+=3){g.x=s[v+0],g.y=s[v+1],g.z=s[v+2];const w=m(g)/2/Math.PI+.5,N=d(g)/Math.PI+.5;a.push(w,1-N)}_(),p()}function p(){for(let g=0;g<a.length;g+=6){const v=a[g+0],w=a[g+2],N=a[g+4],E=Math.max(v,w,N),A=Math.min(v,w,N);E>.9&&A<.1&&(v<.2&&(a[g+0]+=1),w<.2&&(a[g+2]+=1),N<.2&&(a[g+4]+=1))}}function f(g){s.push(g.x,g.y,g.z)}function x(g,v){const w=g*3;v.x=e[w+0],v.y=e[w+1],v.z=e[w+2]}function _(){const g=new U,v=new U,w=new U,N=new U,E=new Ye,A=new Ye,R=new Ye;for(let F=0,y=0;F<s.length;F+=9,y+=6){g.set(s[F+0],s[F+1],s[F+2]),v.set(s[F+3],s[F+4],s[F+5]),w.set(s[F+6],s[F+7],s[F+8]),E.set(a[y+0],a[y+1]),A.set(a[y+2],a[y+3]),R.set(a[y+4],a[y+5]),N.copy(g).add(v).add(w).divideScalar(3);const b=m(N);S(E,y+0,g,b),S(A,y+2,v,b),S(R,y+4,w,b)}}function S(g,v,w,N){N<0&&g.x===1&&(a[v]=g.x-1),w.x===0&&w.z===0&&(a[v]=N/2/Math.PI+.5)}function m(g){return Math.atan2(g.z,-g.x)}function d(g){return Math.atan2(-g.y,Math.sqrt(g.x*g.x+g.z*g.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Jh(e.vertices,e.indices,e.radius,e.details)}}class ef extends Jh{constructor(e=1,n=0){const i=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],r=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(i,r,e,n),this.type="OctahedronGeometry",this.parameters={radius:e,detail:n}}static fromJSON(e){return new ef(e.radius,e.detail)}}class Rl extends Nn{constructor(e=1,n=32,i=16,r=0,s=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:n,heightSegments:i,phiStart:r,phiLength:s,thetaStart:a,thetaLength:o},n=Math.max(3,Math.floor(n)),i=Math.max(2,Math.floor(i));const l=Math.min(a+o,Math.PI);let u=0;const h=[],p=new U,f=new U,x=[],_=[],S=[],m=[];for(let d=0;d<=i;d++){const g=[],v=d/i;let w=0;d===0&&a===0?w=.5/n:d===i&&l===Math.PI&&(w=-.5/n);for(let N=0;N<=n;N++){const E=N/n;p.x=-e*Math.cos(r+E*s)*Math.sin(a+v*o),p.y=e*Math.cos(a+v*o),p.z=e*Math.sin(r+E*s)*Math.sin(a+v*o),_.push(p.x,p.y,p.z),f.copy(p).normalize(),S.push(f.x,f.y,f.z),m.push(E+w,1-v),g.push(u++)}h.push(g)}for(let d=0;d<i;d++)for(let g=0;g<n;g++){const v=h[d][g+1],w=h[d][g],N=h[d+1][g],E=h[d+1][g+1];(d!==0||a>0)&&x.push(v,w,E),(d!==i-1||l<Math.PI)&&x.push(w,N,E)}this.setIndex(x),this.setAttribute("position",new jt(_,3)),this.setAttribute("normal",new jt(S,3)),this.setAttribute("uv",new jt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Rl(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class tf extends Nn{constructor(e=1,n=.4,i=12,r=48,s=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:n,radialSegments:i,tubularSegments:r,arc:s},i=Math.floor(i),r=Math.floor(r);const a=[],o=[],l=[],u=[],h=new U,p=new U,f=new U;for(let x=0;x<=i;x++)for(let _=0;_<=r;_++){const S=_/r*s,m=x/i*Math.PI*2;p.x=(e+n*Math.cos(m))*Math.cos(S),p.y=(e+n*Math.cos(m))*Math.sin(S),p.z=n*Math.sin(m),o.push(p.x,p.y,p.z),h.x=e*Math.cos(S),h.y=e*Math.sin(S),f.subVectors(p,h).normalize(),l.push(f.x,f.y,f.z),u.push(_/r),u.push(x/i)}for(let x=1;x<=i;x++)for(let _=1;_<=r;_++){const S=(r+1)*x+_-1,m=(r+1)*(x-1)+_-1,d=(r+1)*(x-1)+_,g=(r+1)*x+_;a.push(S,m,g),a.push(m,d,g)}this.setIndex(a),this.setAttribute("position",new jt(o,3)),this.setAttribute("normal",new jt(l,3)),this.setAttribute("uv",new jt(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new tf(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}class aT extends Fs{constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new $e(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new $e(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=ux,this.normalScale=new Ye(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Qn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}const ym={enabled:!1,files:{},add:function(t,e){this.enabled!==!1&&(this.files[t]=e)},get:function(t){if(this.enabled!==!1)return this.files[t]},remove:function(t){delete this.files[t]},clear:function(){this.files={}}};class oT{constructor(e,n,i){const r=this;let s=!1,a=0,o=0,l;const u=[];this.onStart=void 0,this.onLoad=e,this.onProgress=n,this.onError=i,this.itemStart=function(h){o++,s===!1&&r.onStart!==void 0&&r.onStart(h,a,o),s=!0},this.itemEnd=function(h){a++,r.onProgress!==void 0&&r.onProgress(h,a,o),a===o&&(s=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(h){r.onError!==void 0&&r.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,p){return u.push(h,p),this},this.removeHandler=function(h){const p=u.indexOf(h);return p!==-1&&u.splice(p,2),this},this.getHandler=function(h){for(let p=0,f=u.length;p<f;p+=2){const x=u[p],_=u[p+1];if(x.global&&(x.lastIndex=0),x.test(h))return _}return null}}}const lT=new oT;class nf{constructor(e){this.manager=e!==void 0?e:lT,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,n){const i=this;return new Promise(function(r,s){i.load(e,r,n,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}}nf.DEFAULT_MATERIAL_NAME="__DEFAULT";class cT extends nf{constructor(e){super(e)}load(e,n,i,r){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=this,a=ym.get(e);if(a!==void 0)return s.manager.itemStart(e),setTimeout(function(){n&&n(a),s.manager.itemEnd(e)},0),a;const o=Ua("img");function l(){h(),ym.add(e,this),n&&n(this),s.manager.itemEnd(e)}function u(p){h(),r&&r(p),s.manager.itemError(e),s.manager.itemEnd(e)}function h(){o.removeEventListener("load",l,!1),o.removeEventListener("error",u,!1)}return o.addEventListener("load",l,!1),o.addEventListener("error",u,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),s.manager.itemStart(e),o.src=e,o}}class uT extends nf{constructor(e){super(e)}load(e,n,i,r){const s=new Yt,a=new cT(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(o){s.image=o,s.needsUpdate=!0,n!==void 0&&n(s)},i,r),s}}class Cx extends $t{constructor(e,n=1){super(),this.isLight=!0,this.type="Light",this.color=new $e(e),this.intensity=n}dispose(){}copy(e,n){return super.copy(e,n),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const n=super.toJSON(e);return n.object.color=this.color.getHex(),n.object.intensity=this.intensity,this.groundColor!==void 0&&(n.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(n.object.distance=this.distance),this.angle!==void 0&&(n.object.angle=this.angle),this.decay!==void 0&&(n.object.decay=this.decay),this.penumbra!==void 0&&(n.object.penumbra=this.penumbra),this.shadow!==void 0&&(n.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(n.object.target=this.target.uuid),n}}const iu=new dt,Sm=new U,wm=new U;class dT{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Ye(512,512),this.map=null,this.mapPass=null,this.matrix=new dt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Kh,this._frameExtents=new Ye(1,1),this._viewportCount=1,this._viewports=[new st(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const n=this.camera,i=this.matrix;Sm.setFromMatrixPosition(e.matrixWorld),n.position.copy(Sm),wm.setFromMatrixPosition(e.target.matrixWorld),n.lookAt(wm),n.updateMatrixWorld(),iu.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(iu),i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(iu)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}const Mm=new dt,Js=new U,ru=new U;class hT extends dT{constructor(){super(new fn(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new Ye(4,2),this._viewportCount=6,this._viewports=[new st(2,1,1,1),new st(0,1,1,1),new st(3,1,1,1),new st(1,1,1,1),new st(3,0,1,1),new st(1,0,1,1)],this._cubeDirections=[new U(1,0,0),new U(-1,0,0),new U(0,0,1),new U(0,0,-1),new U(0,1,0),new U(0,-1,0)],this._cubeUps=[new U(0,1,0),new U(0,1,0),new U(0,1,0),new U(0,1,0),new U(0,0,1),new U(0,0,-1)]}updateMatrices(e,n=0){const i=this.camera,r=this.matrix,s=e.distance||i.far;s!==i.far&&(i.far=s,i.updateProjectionMatrix()),Js.setFromMatrixPosition(e.matrixWorld),i.position.copy(Js),ru.copy(i.position),ru.add(this._cubeDirections[n]),i.up.copy(this._cubeUps[n]),i.lookAt(ru),i.updateMatrixWorld(),r.makeTranslation(-Js.x,-Js.y,-Js.z),Mm.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Mm)}}class Em extends Cx{constructor(e,n,i=0,r=2){super(e,n),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=r,this.shadow=new hT}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,n){return super.copy(e,n),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class fT extends Cx{constructor(e,n){super(e,n),this.isAmbientLight=!0,this.type="AmbientLight"}}class pT{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=bm(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const n=bm();e=(n-this.oldTime)/1e3,this.oldTime=n,this.elapsedTime+=e}return e}}function bm(){return performance.now()}const Tm=new dt;class mT{constructor(e,n,i=0,r=1/0){this.ray=new Yh(e,n),this.near=i,this.far=r,this.camera=null,this.layers=new $h,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,n){this.ray.set(e,n)}setFromCamera(e,n){n.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(n.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(n).sub(this.ray.origin).normalize(),this.camera=n):n.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(n.near+n.far)/(n.near-n.far)).unproject(n),this.ray.direction.set(0,0,-1).transformDirection(n.matrixWorld),this.camera=n):console.error("THREE.Raycaster: Unsupported camera type: "+n.type)}setFromXRController(e){return Tm.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Tm),this}intersectObject(e,n=!0,i=[]){return Gd(e,this,i,n),i.sort(Am),i}intersectObjects(e,n=!0,i=[]){for(let r=0,s=e.length;r<s;r++)Gd(e[r],this,i,n);return i.sort(Am),i}}function Am(t,e){return t.distance-e.distance}function Gd(t,e,n,i){let r=!0;if(t.layers.test(e.layers)&&t.raycast(e,n)===!1&&(r=!1),r===!0&&i===!0){const s=t.children;for(let a=0,o=s.length;a<o;a++)Gd(s[a],e,n,!0)}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Bh}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Bh);function gT({t}){const e=le.useRef(null),n=le.useRef(null),[i,r]=le.useState([]),[s,a]=le.useState(null),[o,l]=le.useState(!1),[u,h]=le.useState(!1),[p,f]=le.useState(!0),[x,_]=le.useState(!1);le.useEffect(()=>{const d=()=>{const g=window.innerWidth<768||"ontouchstart"in window&&window.innerWidth<1024;_(g)};return d(),window.addEventListener("resize",d),()=>window.removeEventListener("resize",d)},[]);const S=[{id:"art-01",author:"Pyxie Core",description:"Astaroth no Portal Arcano • Ilustração oficial do Bosque Violeta.",imageUrl:"/assets/pyxie/pyxie_space_banner.jpg",createdAt:new Date().toISOString()},{id:"art-02",author:"Melody Labs",description:"O Arcano O Mago • Pintura digital inspirada nos 78 arcanos da Pyxie.",imageUrl:"/assets/pyxie/og_banner_hd.png",createdAt:new Date().toISOString()},{id:"art-03",author:"Cringelândia Art",description:"Pyxie Tsundere Rebelde • Mascote da comunidade em alta resolução.",imageUrl:"/assets/pyxie/pyxie_mascot.png",createdAt:new Date().toISOString()},{id:"art-04",author:"Pixel Guild",description:"Pixelart Nostálgica • Render retrô em 32x32 da fada gótica.",imageUrl:"/assets/pyxie/pyxie_pixelart.png",createdAt:new Date().toISOString()}];le.useEffect(()=>{fetch("/api/museum/arts?limit=12").then(d=>d.json()).then(d=>{d&&d.success&&Array.isArray(d.arts)&&d.arts.length>0?r(d.arts):r(S)}).catch(()=>{r(S)})},[]),le.useEffect(()=>{const d=new IntersectionObserver(g=>{g[0].isIntersecting&&h(!0)},{rootMargin:"200px"});return e.current&&d.observe(e.current),()=>d.disconnect()},[]),le.useEffect(()=>{if(!u||!n.current||i.length===0||x)return;let d;try{d=new iT({canvas:n.current,alpha:!0,antialias:!0,powerPreference:"high-performance"})}catch(te){console.warn("WebGL não suportado:",te),f(!1);return}const g=new rT;g.fog=new Qh(459789,.04);const v=new fn(50,1,.1,100);v.position.set(0,0,7.5);const w=()=>{if(!e.current||!d)return;const te=e.current.clientWidth,re=Math.min(Math.max(te*.55,380),540);v.aspect=te/re,v.updateProjectionMatrix(),d.setSize(te,re),d.setPixelRatio(Math.min(window.devicePixelRatio,2))};w(),window.addEventListener("resize",w);const N=400,E=new Nn,A=new Float32Array(N*3),R=new Float32Array(N*3);for(let te=0;te<N*3;te+=3){A[te]=(Math.random()-.5)*20,A[te+1]=(Math.random()-.5)*12,A[te+2]=(Math.random()-.5)*15;const re=Math.random()>.5;R[te]=re?.95:.55,R[te+1]=re?.2:.35,R[te+2]=re?.6:.95}E.setAttribute("position",new An(A,3)),E.setAttribute("color",new An(R,3));const F=new Ax({size:.08,vertexColors:!0,transparent:!0,opacity:.7,blending:td}),y=new sT(E,F);g.add(y);const b=new fT(16777215,.85);g.add(b);const H=new Em(15073383,3,20);H.position.set(0,3,5),g.add(H);const V=new Em(9133302,3,20);V.position.set(0,-3,3),g.add(V);const q=new sa;g.add(q);const Q=3.3,W=new Rl(Q,24,16),$=new Pi({color:9133302,wireframe:!0,transparent:!0,opacity:.22}),D=new zt(W,$);q.add(D);const J=new Rl(Q*.98,32,24),ee=new Pi({color:1312550,transparent:!0,opacity:.65,side:qt});q.add(new zt(J,ee));const O=new tf(Q+.05,.02,16,64),oe=new Pi({color:15073383,transparent:!0,opacity:.55}),Te=new zt(O,oe);Te.rotation.x=Math.PI/2,q.add(Te);const G=new Pi({color:11032055,transparent:!0,opacity:.4}),ie=new zt(O,G);q.add(ie);const ue=new ef(.5,0),me=new Pi({color:16726913,wireframe:!0}),Pe=new zt(ue,me);q.add(Pe);const Le=new Ls(1.22,1.78),We=new Ls(1.3,1.86),Qe=new uT,je=[],P=Math.max(i.length,12),Vt=(1+Math.sqrt(5))/2,He=Q+.15;for(let te=0;te<P;te++){const re=i[te%i.length],Re=P<=1?0:1-te/(P-1)*2,Ce=Math.sqrt(Math.max(0,1-Re*Re)),Oe=2*Math.PI*te/Vt+(Math.random()-.5)*.35,L=Math.cos(Oe)*Ce*He,fe=Re*He,X=Math.sin(Oe)*Ce*He,K=Qe.load(re.imageUrl||"/assets/pyxie/og_banner_hd.png");K.minFilter=Mn;const ge=new aT({map:K,roughness:.35,metalness:.1,side:zn}),de=new zt(Le,ge);de.position.set(L,fe,X),de.lookAt(L*2,fe*2,X*2),de.rotateZ((Math.random()-.5)*.3);const qe=new Pi({color:te%2===0?15073383:9133302,transparent:!0,opacity:.45,side:zn}),ft=new zt(We,qe);ft.position.z=-.01,de.add(ft),de.userData={art:re,initialPos:de.position.clone()},q.add(de),je.push(de)}let Ve=!1,De=0,rt=0,Ne=0,C=0,M=.002,z=0;const Z=.95,ne=new mT,Y=new Ye(-100,-100),Me=te=>{var Ce,Oe;Ve=!0;const re=te.clientX||te.touches&&((Ce=te.touches[0])==null?void 0:Ce.clientX)||0,Re=te.clientY||te.touches&&((Oe=te.touches[0])==null?void 0:Oe.clientY)||0;De=re,rt=Re,Ne=re,C=Re,M=0,z=0},he=te=>{var Ce,Oe;const re=te.clientX||te.touches&&((Ce=te.touches[0])==null?void 0:Ce.clientX)||0,Re=te.clientY||te.touches&&((Oe=te.touches[0])==null?void 0:Oe.clientY)||0;if(Ve){const L=re-Ne,fe=Re-C;M=L*.004,z=fe*.0025,q.rotation.y+=M,q.rotation.x=Math.max(-Math.PI/3,Math.min(Math.PI/3,q.rotation.x+z)),Ne=re,C=Re}if(e.current){const L=e.current.getBoundingClientRect();Y.x=(re-L.left)/L.width*2-1,Y.y=-((Re-L.top)/L.height)*2+1}},ve=te=>{var Oe,L,fe;if(!Ve)return;const re=te.clientX||te.changedTouches&&((Oe=te.changedTouches[0])==null?void 0:Oe.clientX)||Ne,Re=te.clientY||te.changedTouches&&((L=te.changedTouches[0])==null?void 0:L.clientY)||C;if(Math.hypot(re-De,Re-rt)<7){if(e.current){const K=e.current.getBoundingClientRect();Y.x=(re-K.left)/K.width*2-1,Y.y=-((Re-K.top)/K.height)*2+1}ne.setFromCamera(Y,v);const X=ne.intersectObjects(je);if(X.length>0){const K=(fe=X[0].object.userData)==null?void 0:fe.art;K&&a(K)}}Ve=!1},Xe=n.current;Xe.addEventListener("pointerdown",Me),window.addEventListener("pointermove",he),window.addEventListener("pointerup",ve);let ae;const ye=new pT,ke=()=>{ae=requestAnimationFrame(ke);const te=ye.getElapsedTime();Ve||(q.rotation.y+=M,q.rotation.x+=z,M*=Z,z*=Z,Math.abs(M)<6e-4&&(M=.0016)),Pe.rotation.y+=.015,Pe.rotation.x+=.01,y.rotation.y=te*.02,y.rotation.x=Math.sin(te*.05)*.05,ne.setFromCamera(Y,v);const re=ne.intersectObjects(je);je.forEach(Re=>{const Oe=re.length>0&&re[0].object===Re?1.15:1;Re.scale.lerp(new U(Oe,Oe,Oe),.1)}),d.render(g,v)};return ke(),()=>{cancelAnimationFrame(ae),window.removeEventListener("resize",w),window.removeEventListener("pointermove",he),window.removeEventListener("pointerup",ve),Xe.removeEventListener("pointerdown",Me),g.traverse(te=>{te.geometry&&te.geometry.dispose(),te.material&&(Array.isArray(te.material)?te.material.forEach(re=>{re.map&&re.map.dispose(),re.alphaMap&&re.alphaMap.dispose(),re.normalMap&&re.normalMap.dispose(),re.dispose()}):(te.material.map&&te.material.map.dispose(),te.material.alphaMap&&te.material.alphaMap.dispose(),te.material.normalMap&&te.material.normalMap.dispose(),te.material.dispose()))}),d.dispose()}},[u,i,x]);const m=d=>{d.preventDefault(),l(!0)};return c.jsxs("section",{id:"museu-deck",className:"relative py-16 md:py-24 overflow-hidden border-t border-purple-500/10",children:[c.jsxs("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-8",children:[c.jsxs("div",{className:"inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-bold mb-3 shadow-sm",children:[c.jsx(Lt,{className:"w-3.5 h-3.5 text-pink-400"}),c.jsx("span",{children:t("museum.badge")})]}),c.jsx("h2",{className:"font-title font-black text-3xl sm:text-4xl text-white tracking-tight",children:t("museum.title")}),c.jsx("p",{className:"text-slate-300 text-sm sm:text-base max-w-xl mx-auto mt-2",children:t("museum.subtitle")})]}),c.jsxs("div",{ref:e,onContextMenu:m,style:{touchAction:"none"},className:"art-shield relative w-full max-w-6xl mx-auto h-[380px] sm:h-[480px] lg:h-[540px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none",children:[p&&!x?c.jsx("canvas",{ref:n,className:"w-full h-full block"}):c.jsx("div",{className:"flex gap-4 overflow-x-auto px-4 py-8 w-full scrollbar-none snap-x",children:i.map(d=>c.jsxs("div",{onClick:()=>a(d),className:"shrink-0 w-64 h-[352px] rounded-2xl glass-panel p-3 border border-pink-500/30 snap-center cursor-pointer shadow-lg transform hover:scale-105 transition-all",children:[c.jsx("img",{src:d.imageUrl,alt:`Arte por @${d.author||"Artista"} no Museu da Pyxie • Visite https://pyxie.com.br/`,"data-canonical-url":"https://pyxie.com.br/",className:"w-full h-64 object-cover rounded-xl"}),c.jsxs("div",{className:"mt-3 text-left",children:[c.jsxs("div",{className:"text-pink-400 font-bold text-sm",children:["@",d.author]}),c.jsx("div",{className:"text-slate-300 text-xs truncate",children:d.description})]})]},d.id))}),c.jsx("div",{className:"absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#07040D] to-transparent pointer-events-none"}),c.jsx("div",{className:"absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#07040D] to-transparent pointer-events-none"})]}),c.jsx("div",{className:"mt-8 text-center",children:c.jsxs("a",{href:"/museu",className:"inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-extrabold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-neon-violet transition-all transform hover:-translate-y-1 active:translate-y-0 border border-purple-400/30",children:[c.jsx(Lt,{className:"w-4 h-4 text-pink-300"}),c.jsx("span",{children:t("museum.exploreAll")})]})}),s&&c.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn",children:c.jsxs("div",{onContextMenu:m,className:"art-shield relative w-full max-w-2xl rounded-3xl glass-panel border border-pink-500/30 p-6 shadow-2xl overflow-hidden",children:[c.jsx("button",{onClick:()=>a(null),className:"absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all z-20",children:c.jsx(bs,{className:"w-5 h-5"})}),c.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-6 items-center",children:[c.jsxs("div",{className:"relative rounded-2xl overflow-hidden border border-purple-500/30 shadow-neon-pink group",children:[c.jsx("img",{src:s.imageUrl,alt:`Arte por @${s.author||"Artista"} no Museu da Pyxie • Visite https://pyxie.com.br/`,"data-canonical-url":"https://pyxie.com.br/",className:"w-full h-80 object-cover pointer-events-none select-none"}),c.jsxs("div",{className:"absolute inset-x-0 bottom-0 py-2 px-3 bg-black/85 backdrop-blur-md border-t border-pink-500/40 flex items-center justify-between text-[11px] font-mono tracking-wide z-10 shadow-lg select-none pointer-events-none",children:[c.jsxs("span",{className:"text-white font-bold truncate",children:[c.jsx("span",{className:"text-pink-400 font-extrabold mr-1",children:"✦"}),"pyxie.com.br • @",s.author||"Artista"]}),c.jsx("span",{className:"text-purple-300/80 text-[10px] shrink-0 ml-2 hidden sm:inline",children:"Galeria Oficial"})]}),c.jsxs("div",{className:"absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-mono text-pink-300 border border-pink-500/30 z-10",children:["✦ ",s.id]})]}),c.jsxs("div",{className:"space-y-4 text-left",children:[c.jsxs("div",{children:[c.jsx("span",{className:"text-xs font-mono font-bold text-pink-400 uppercase tracking-wider",children:t("museum.author")}),c.jsxs("h3",{className:"font-title font-extrabold text-2xl text-white",children:["@",s.author]})]}),c.jsx("p",{className:"text-slate-300 text-sm leading-relaxed",children:s.description||"Obra compartilhada na galeria oficial da comunidade Pyxie."}),c.jsxs("div",{className:"pt-2 border-t border-purple-500/15 flex items-center gap-2 text-xs text-purple-300/80",children:[c.jsx(Ty,{className:"w-4 h-4 text-pink-400"}),c.jsx("span",{children:new Date(s.createdAt||Date.now()).toLocaleDateString("pt-BR")})]}),c.jsx("div",{className:"pt-3",children:c.jsxs("a",{href:"/museu",className:"inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-purple-500/30 hover:border-pink-500/50 transition-all",children:[c.jsx("span",{children:"Ver no Fórum do Museu"}),c.jsx(Ly,{className:"w-3.5 h-3.5"})]})})]})]})]})}),o&&c.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn",children:c.jsxs("div",{className:"max-w-md w-full rounded-2xl glass-panel border border-pink-500/40 p-6 text-center shadow-2xl space-y-4",children:[c.jsx("div",{className:"w-12 h-12 rounded-full bg-pink-500/20 border border-pink-500/50 flex items-center justify-center mx-auto text-pink-400",children:c.jsx(Yg,{className:"w-6 h-6"})}),c.jsx("h4",{className:"font-title font-bold text-xl text-white",children:"Proteção de Propriedade Visual"}),c.jsx("p",{className:"text-slate-300 text-sm leading-relaxed",children:t("museum.artShield")}),c.jsx("button",{onClick:()=>l(!1),className:"px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-neon-pink",children:"Compreendi"})]})})]})}function xT({t}){const e=[{id:1,title:"Tarot dos 78 Arcanos & Álbum",desc:"Tire cartas dos 78 arcanos ilustrados com arte em Canvas HD, consulte oráculos diários, interpretações diretas e invertidas e complete seu álbum colecionável.",icon:Lt,iconColor:"text-pink-400",podBg:"bg-pink-500/10 border-pink-500/30"},{id:2,title:"Economia Viva & 16 Vocações",desc:"Acumule moedinhas e feijões mágicos, escolha entre 16 carreiras dinâmicas com minigames em cada turno de trabalho e escale o ranking de riqueza.",icon:Es,iconColor:"text-amber-400",podBg:"bg-amber-500/10 border-amber-500/30"},{id:3,title:"Matrimônio, Casa & Dinâmica Familiar",desc:"Casamentos bilaterais permanentes, compra de casas, cultivo da Árvore da Vida, cofre de amor com juros e herdeiros que estagiam e trazem moedas.",icon:vr,iconColor:"text-rose-400",podBg:"bg-rose-500/10 border-rose-500/30"},{id:4,title:"Quiz & Desafios da Comunidade",desc:"Desafie seus amigos com centenas de perguntas de cultura pop, conhecimentos gerais e lógica com recompensas automáticas por agilidade e acerto.",icon:by,iconColor:"text-purple-400",podBg:"bg-purple-500/10 border-purple-500/30"},{id:5,title:"Minigames & Lazer Social",desc:"Dispute Jokenpô, quebre o Biscoito da Sorte, descubra afinidade no /py-ship, brinque de Quem é Mais Provável e personalize temas visuais no perfil.",icon:Dy,iconColor:"text-cyan-400",podBg:"bg-cyan-500/10 border-cyan-500/30"}];return c.jsxs("section",{id:"pilares",className:"py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-purple-500/10",children:[c.jsxs("div",{className:"text-center mb-12",children:[c.jsxs("div",{className:"inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold mb-3 shadow-sm",children:[c.jsx(Lt,{className:"w-3.5 h-3.5 text-pink-400"}),c.jsx("span",{children:"Pilares Oficiais"})]}),c.jsx("h2",{className:"font-title font-black text-3xl sm:text-4xl text-white tracking-tight",children:"Explore o Universo da Pyxie"}),c.jsx("p",{className:"text-slate-300 text-sm sm:text-base max-w-xl mx-auto mt-2",children:"Desenvolvida para transformar servidores do Discord em comunidades ativas, divertidas e engajadas."})]}),c.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",children:e.map(n=>{const i=n.icon;return c.jsx("div",{className:"rounded-3xl glass-panel border border-purple-500/20 hover:border-pink-500/50 p-6 transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-neon-pink flex flex-col justify-between",children:c.jsxs("div",{children:[c.jsx("div",{className:`w-12 h-12 rounded-2xl flex items-center justify-center border mb-5 ${n.podBg}`,children:c.jsx(i,{className:`w-6 h-6 ${n.iconColor}`})}),c.jsx("h3",{className:"font-title font-bold text-lg text-white mb-2",children:n.title}),c.jsx("p",{className:"text-slate-300 text-xs sm:text-sm leading-relaxed",children:n.desc})]})},n.id)})})]})}function vT({command:t,onSelect:e,t:n}){const[i,r]=le.useState(!1),s=t.name||"",a=s.replace(/^\/+/,""),o=`/${a}`,l=h=>{var f;h.stopPropagation();const p=s?o:`py!${((f=t.aliases)==null?void 0:f[0])||""}`;navigator.clipboard.writeText(p),r(!0),setTimeout(()=>r(!1),2e3)},u=`cmd-${a}`;return c.jsxs("div",{id:u,onClick:()=>e&&e(t),className:"group rounded-2xl glass-panel border border-purple-500/20 hover:border-pink-500/50 p-5 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-neon-pink cursor-pointer flex flex-col justify-between relative overflow-hidden",children:[c.jsx("div",{className:"absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl group-hover:bg-pink-500/15 transition-all"}),c.jsxs("div",{className:"space-y-2.5 relative z-10",children:[c.jsxs("div",{className:"flex items-center justify-between",children:[c.jsxs("div",{className:"font-mono font-bold text-sm text-pink-400 group-hover:text-pink-300 transition-colors flex items-center gap-2",children:[c.jsx(xi,{className:"w-3.5 h-3.5 text-purple-400 group-hover:rotate-12 transition-transform"}),c.jsx("span",{children:o})]}),c.jsx("div",{className:"flex items-center gap-1.5",children:c.jsx("button",{onClick:l,className:`p-1.5 rounded-lg border text-xs transition-all flex items-center gap-1 ${i?"bg-emerald-500/20 border-emerald-500/40 text-emerald-300":"bg-white/5 border-purple-500/20 text-slate-400 group-hover:text-white group-hover:border-pink-500/30"}`,title:"Copiar comando",children:i?c.jsx(ka,{className:"w-3.5 h-3.5 text-emerald-400"}):c.jsx(qg,{className:"w-3.5 h-3.5"})})})]}),c.jsx("p",{className:"text-slate-300 text-xs leading-relaxed line-clamp-3",children:t.description})]}),c.jsxs("div",{className:"mt-4 pt-3 border-t border-purple-500/15 flex items-center justify-between relative z-10",children:[t.aliases&&t.aliases.length>0?c.jsxs("div",{className:"flex flex-wrap gap-1.5",children:[t.aliases.slice(0,2).map((h,p)=>c.jsxs("span",{className:"font-mono text-[11px] px-2 py-0.5 rounded-md bg-white/5 border border-purple-500/20 text-cyan-300 tracking-wider",style:{letterSpacing:"0.05em"},children:["py!",h]},p)),t.aliases.length>2&&c.jsxs("span",{className:"font-mono text-[10px] px-1.5 py-0.5 rounded text-slate-400",children:["+",t.aliases.length-2]})]}):c.jsx("span",{className:"text-[11px] text-slate-500 font-mono",children:"Slash Oficial"}),c.jsxs("span",{className:"text-[11px] font-bold text-purple-300 group-hover:text-pink-300 transition-colors flex items-center gap-0.5",children:[c.jsx("span",{children:"Detalhes"}),c.jsx(Xg,{className:"w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform"})]})]})]})}function _T({command:t,lang:e="pt"}){const n=e==="en",r=(s=>{const a=s.name||"";return a.includes("daily")?{color:"#E60067",title:n?"✨ Cosmic Daily Reward":"✨ Recompensa Diária Cósmica",desc:n?"You channeled the astral energy and claimed your daily coins!":"Você canalizou a energia astral e resgatou suas moedas diárias!",fields:[{name:n?"🪙 Coins":"🪙 Recompensa",value:"+100 moedas",inline:!0},{name:n?"🔥 Daily Streak":"🔥 Sequência",value:"7 dias (+25 bônus)",inline:!0}],footer:"Pyxie Bot • Discord.js v14"}:a.includes("work")||a.includes("trabalho")?{color:"#8B5CF6",title:n?"💼 Professional Shift: Alchemist":"💼 Expediente: Alquimista Místico",desc:n?"You combined the essence of the Arcane Rose with stardust. Perfect synthesis!":"Você combinou a essência da Rosa Arcana com pó estelar. Síntese perfeita!",fields:[{name:n?"💰 Earnings":"💰 Rendimento",value:"+95 moedas",inline:!0},{name:n?"⭐ Experience":"⭐ Experiência",value:"+15 XP Alquimia",inline:!0}],footer:"Pyxie Carreiras • Cooldown: 3h"}:a.includes("tarot")?{color:"#A855F7",title:n?"🔮 Daily Arcana: The Magician":"🔮 Arcano do Dia: O Mago (I)",desc:n?'"The power of creation and transmutation is alive in your hands today."':'"O poder da criação e transmutação está vivo em suas mãos hoje. Molde seu destino."',fields:[{name:n?"🧭 Orientation":"🧭 Orientação",value:n?"Upright (Direct)":"Em Pé (Direta)",inline:!0},{name:n?"⭐ Arcana Type":"⭐ Tipo de Arcano",value:n?"Major Arcana (01/22)":"Arcano Maior (01/22)",inline:!0}],footer:"Pyxie Tarot • 78 Arcanos em Canvas HD"}:a.includes("casamento")||a.includes("marry")?{color:"#EC4899",title:n?"💍 Matrimonial Bond: Pyxie & Astaroth":"💍 Laço Matrimonial: Pyxie & Astaroth",desc:n?"Eternal union blessed by the cosmic fairies under the Tree of Life.":"União eterna abençoada pelas fadas cósmicas sob a Árvore da Vida.",fields:[{name:n?"💖 Love Bar":"💖 Barra do Amor",value:"100% [██████████]",inline:!0},{name:n?"🌳 Tree Level":"🌳 Nível da Árvore",value:"Nível 3 (+30% Amor)",inline:!0}],footer:"Pyxie Matrimônio & Família"}:{color:"#3B82F6",title:`✨ /${(s.name||"").replace(/^\/+/,"")}`,desc:s.description||(n?"Command executed successfully.":"Comando executado com sucesso."),fields:[{name:"Status",value:"✅ Operacional",inline:!0},{name:n?"Cooldown":"Recarga",value:s.cooldown?`${s.cooldown}s`:"3s",inline:!0}],footer:"Pyxie Discord Bot • 2026"}})(t);return c.jsxs("div",{className:"rounded-xl bg-[#2b2d31] border border-[#1e1f22] p-4 text-[#dbdee1] font-sans text-sm shadow-xl select-none",children:[c.jsxs("div",{className:"flex items-center gap-2.5 mb-3",children:[c.jsx("div",{className:"w-8 h-8 rounded-full overflow-hidden bg-purple-900 border border-purple-500/30 flex-shrink-0",children:c.jsx("img",{src:"/assets/pyxie/pyxie_pixelart_face.png",alt:"Pyxie Avatar",className:"w-full h-full object-contain"})}),c.jsxs("div",{className:"flex items-center gap-1.5 leading-none",children:[c.jsx("span",{className:"font-bold text-white text-sm",children:"Pyxie"}),c.jsx("span",{className:"px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#5865F2] text-white tracking-wide uppercase",children:"BOT"}),c.jsx("span",{className:"text-[11px] text-[#949ba4] ml-1",children:"hoje às 14:32"})]})]}),c.jsxs("div",{className:"rounded-lg bg-[#232428] p-3.5 pl-4 border-l-4 space-y-2.5 transition-all",style:{borderLeftColor:r.color},children:[c.jsx("h4",{className:"font-bold text-white text-sm tracking-tight",children:r.title}),c.jsx("p",{className:"text-xs text-[#dbdee1] leading-relaxed",children:r.desc}),r.fields&&r.fields.length>0&&c.jsx("div",{className:"grid grid-cols-2 gap-3 pt-1",children:r.fields.map((s,a)=>c.jsxs("div",{className:"space-y-0.5",children:[c.jsx("span",{className:"text-[11px] font-bold text-[#b5bac1] block",children:s.name}),c.jsx("span",{className:"text-xs text-white font-medium block",children:s.value})]},a))}),c.jsxs("div",{className:"pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-[#949ba4]",children:[c.jsx("span",{children:r.footer}),c.jsx("span",{className:"font-mono text-[9px] opacity-70",children:"Embed v2"})]})]})]})}function yT({command:t,onClose:e,lang:n="pt",t:i}){const[r,s]=le.useState(!1),[a,o]=le.useState(!1);if(!t)return null;const u=(t.name||"").replace(/^\/+/,""),h=`/${u}`,p=()=>{navigator.clipboard.writeText(h),s(!0),setTimeout(()=>s(!1),2e3)},f=()=>{const x=`${window.location.origin}/wiki#${u}`;navigator.clipboard.writeText(x),o(!0),setTimeout(()=>o(!1),2e3)};return c.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in",children:c.jsxs("div",{className:"relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0e071a] border border-purple-500/30 p-6 sm:p-8 shadow-2xl space-y-6",onClick:x=>x.stopPropagation(),children:[c.jsx("button",{onClick:e,className:"absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors",title:"Fechar (ESC)",children:c.jsx(bs,{className:"w-5 h-5"})}),c.jsxs("div",{className:"space-y-2",children:[c.jsxs("div",{className:"inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 font-mono font-bold text-xs",children:[c.jsx(xi,{className:"w-3.5 h-3.5"}),c.jsx("span",{children:h})]}),c.jsx("h3",{className:"font-title font-extrabold text-2xl text-white tracking-tight",children:h}),c.jsx("p",{className:"text-slate-300 text-sm leading-relaxed",children:t.description})]}),c.jsxs("div",{className:"flex flex-wrap items-center gap-3 pt-1",children:[c.jsxs("button",{onClick:p,className:`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${r?"bg-emerald-500/20 border border-emerald-500/40 text-emerald-300":"bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-neon-pink"}`,children:[r?c.jsx(ka,{className:"w-4 h-4 text-emerald-300"}):c.jsx(qg,{className:"w-4 h-4"}),c.jsx("span",{children:r?"Comando Copiado! ✨":"Copiar Sintaxe"})]}),c.jsxs("button",{onClick:f,className:`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${a?"bg-emerald-500/20 border-emerald-500/40 text-emerald-300":"bg-white/5 border-purple-500/25 text-purple-200 hover:bg-white/10 hover:text-white"}`,children:[a?c.jsx(ka,{className:"w-4 h-4 text-emerald-300"}):c.jsx(ga,{className:"w-4 h-4"}),c.jsx("span",{children:a?"Link Copiado! 🔗":"Copiar Deep Link"})]})]}),c.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white/5 border border-purple-500/15 text-xs",children:[c.jsxs("div",{className:"flex items-center gap-2.5",children:[c.jsx(Ny,{className:"w-4 h-4 text-amber-400 flex-shrink-0"}),c.jsxs("div",{children:[c.jsx("span",{className:"text-[10px] text-slate-400 uppercase tracking-wider block font-bold",children:"Cooldown"}),c.jsx("span",{className:"font-semibold text-slate-200",children:t.cooldown?`${t.cooldown}s`:"3 segundos"})]})]}),c.jsxs("div",{className:"flex items-center gap-2.5",children:[c.jsx($g,{className:"w-4 h-4 text-emerald-400 flex-shrink-0"}),c.jsxs("div",{children:[c.jsx("span",{className:"text-[10px] text-slate-400 uppercase tracking-wider block font-bold",children:"Permissões"}),c.jsx("span",{className:"font-semibold text-slate-200",children:"@everyone"})]})]}),c.jsxs("div",{className:"flex items-center gap-2.5",children:[c.jsx(xi,{className:"w-4 h-4 text-cyan-400 flex-shrink-0"}),c.jsxs("div",{children:[c.jsx("span",{className:"text-[10px] text-slate-400 uppercase tracking-wider block font-bold",children:"Plataforma"}),c.jsx("span",{className:"font-semibold text-slate-200",children:"Slash & Prefixo"})]})]})]}),t.aliases&&t.aliases.length>0&&c.jsxs("div",{className:"space-y-2",children:[c.jsx("span",{className:"text-xs font-bold text-slate-400 uppercase tracking-wider block",children:"Prefixos Alternativos (py!)"}),c.jsx("div",{className:"flex flex-wrap gap-2",children:t.aliases.map((x,_)=>c.jsxs("span",{className:"px-2.5 py-1 rounded-lg bg-purple-900/40 border border-purple-500/30 text-cyan-300 font-mono text-xs font-medium tracking-wider",style:{letterSpacing:"0.05em"},children:["py!",x]},_))})]}),c.jsxs("div",{className:"space-y-2 pt-2",children:[c.jsxs("div",{className:"flex items-center justify-between",children:[c.jsx("span",{className:"text-xs font-bold text-slate-400 uppercase tracking-wider",children:"Resposta Real no Discord"}),c.jsx("span",{className:"text-[11px] text-purple-400 font-mono",children:"Live Simulation"})]}),c.jsx(_T,{command:t,lang:n})]})]})})}function ST({isOpen:t,onClose:e,commands:n=[],onSelectCommand:i}){const[r,s]=le.useState(""),[a,o]=le.useState(0),l=le.useRef(null);le.useEffect(()=>{t&&(s(""),o(0),setTimeout(()=>{var h;return(h=l.current)==null?void 0:h.focus()},50))},[t]);const u=n.filter(h=>{var m,d,g,v;const p=r.toLowerCase().trim();if(!p)return!0;const f=(m=h.name)==null?void 0:m.toLowerCase().includes(p),x=(d=h.description)==null?void 0:d.toLowerCase().includes(p),_=(g=h.aliases)==null?void 0:g.some(w=>w.toLowerCase().includes(p)),S=(v=h.category)==null?void 0:v.toLowerCase().includes(p);return f||x||_||S}).slice(0,8);return le.useEffect(()=>{if(!t)return;const h=p=>{p.key==="Escape"?e():p.key==="ArrowDown"?(p.preventDefault(),o(f=>(f+1)%Math.max(1,u.length))):p.key==="ArrowUp"?(p.preventDefault(),o(f=>(f-1+u.length)%Math.max(1,u.length))):p.key==="Enter"&&(p.preventDefault(),u[a]&&(i(u[a]),e()))};return window.addEventListener("keydown",h),()=>window.removeEventListener("keydown",h)},[t,u,a,e,i]),t?c.jsx("div",{className:"fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-fade-in",onClick:e,children:c.jsxs("div",{className:"relative w-full max-w-xl rounded-2xl bg-[#0e071a] border border-purple-500/30 shadow-2xl overflow-hidden",onClick:h=>h.stopPropagation(),children:[c.jsxs("div",{className:"flex items-center px-4 py-3.5 border-b border-purple-500/20 bg-white/5",children:[c.jsx(zh,{className:"w-5 h-5 text-pink-400 mr-3 flex-shrink-0"}),c.jsx("input",{ref:l,type:"text",value:r,onChange:h=>{s(h.target.value),o(0)},placeholder:"Buscar comandos por nome, palavra-chave ou categoria...",className:"w-full bg-transparent text-sm text-white placeholder-slate-400 outline-none font-sans"}),c.jsx("button",{onClick:e,className:"p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors",children:c.jsx(bs,{className:"w-4 h-4"})})]}),c.jsx("div",{className:"max-h-80 overflow-y-auto p-2 divide-y divide-white/5",children:u.length>0?u.map((h,p)=>c.jsxs("div",{onClick:()=>{i(h),e()},onMouseEnter:()=>o(p),className:`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all ${a===p?"bg-gradient-to-r from-pink-600/30 to-purple-600/30 border border-pink-500/40 text-white":"hover:bg-white/5 text-slate-300"}`,children:[c.jsxs("div",{className:"flex items-center gap-3 min-w-0",children:[c.jsx("div",{className:"w-8 h-8 rounded-lg bg-white/5 border border-purple-500/20 flex items-center justify-center text-pink-400 flex-shrink-0",children:c.jsx(xi,{className:"w-4 h-4"})}),c.jsxs("div",{className:"min-w-0",children:[c.jsxs("span",{className:"font-mono font-bold text-sm text-white block truncate",children:["/",(h.name||"").replace(/^\/+/,"")]}),c.jsx("span",{className:"text-xs text-slate-400 truncate block",children:h.description})]})]}),c.jsxs("div",{className:"flex items-center gap-2 flex-shrink-0 ml-3",children:[h.aliases&&h.aliases[0]&&c.jsxs("span",{className:"hidden sm:inline-block font-mono text-[10px] px-2 py-0.5 rounded bg-white/5 text-cyan-300",children:["py!",h.aliases[0]]}),c.jsx(Py,{className:"w-4 h-4 text-purple-400 opacity-60"})]})]},h.name||p)):c.jsxs("div",{className:"p-8 text-center text-slate-400 text-sm",children:['Nenhum comando encontrado para "',r,'".']})}),c.jsxs("div",{className:"px-4 py-2.5 bg-black/40 border-t border-purple-500/15 flex items-center justify-between text-[11px] text-slate-400 font-mono",children:[c.jsxs("div",{className:"flex items-center gap-3",children:[c.jsx("span",{children:"↑↓ Navegar"}),c.jsx("span",{children:"↵ Abrir Detalhes"})]}),c.jsx("span",{children:"ESC para fechar"})]})]})}):null}function Rx({t,lang:e}){var S;const[n,i]=le.useState([]),[r,s]=le.useState("todos"),[a,o]=le.useState(""),[l,u]=le.useState(null),[h,p]=le.useState(!1);le.useEffect(()=>{fetch(`/api/commands?lang=${e}`).then(m=>m.json()).then(m=>{if(m&&m.success&&Array.isArray(m.modules)){const d=m.modules.filter(g=>g.commands&&g.commands.length>0);i(d)}}).catch(m=>console.error("Erro ao buscar comandos:",m))},[e]),le.useEffect(()=>{const m=d=>{(d.metaKey||d.ctrlKey)&&d.key==="k"&&(d.preventDefault(),p(!0))};return window.addEventListener("keydown",m),()=>window.removeEventListener("keydown",m)},[]),le.useEffect(()=>{if(n.length===0)return;const m=window.location.hash.replace("#","").toLowerCase();if(!m)return;const g=n.flatMap(v=>v.commands||[]).find(v=>{var w,N;return((w=v.name)==null?void 0:w.toLowerCase())===m||`py-${v.name}`.toLowerCase()===m||((N=v.aliases)==null?void 0:N.some(E=>E.toLowerCase()===m))});if(g){u(g);const v=(g.name||"").replace(/^\/+/,""),w=document.getElementById(`cmd-${v}`)||document.getElementById(`cmd-${g.name}`);w&&setTimeout(()=>w.scrollIntoView({behavior:"smooth",block:"center"}),300)}},[n]);const f=n.flatMap(m=>m.commands||[]),_=(r==="todos"?f:((S=n.find(m=>m.id===r))==null?void 0:S.commands)||[]).filter(m=>{var N,E,A;const d=a.toLowerCase(),g=(N=m.name)==null?void 0:N.toLowerCase().includes(d),v=(E=m.description)==null?void 0:E.toLowerCase().includes(d),w=(A=m.aliases)==null?void 0:A.some(R=>R.toLowerCase().includes(d));return g||v||w});return c.jsxs("section",{id:"comandos",className:"py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:[c.jsxs("div",{className:"text-center mb-10",children:[c.jsxs("div",{className:"inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold mb-3 shadow-sm",children:[c.jsx(Ms,{className:"w-3.5 h-3.5 text-pink-400"}),c.jsx("span",{children:"Guia Completo & Documentação Oficial"})]}),c.jsx("h2",{className:"font-title font-black text-3xl sm:text-5xl text-white tracking-tight",children:t("wiki.title")}),c.jsx("p",{className:"text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mt-3",children:t("wiki.subtitle")})]}),c.jsx("div",{className:"max-w-2xl mx-auto mb-8 relative",children:c.jsxs("div",{onClick:()=>p(!0),className:"relative flex items-center cursor-pointer group",children:[c.jsx(zh,{className:"absolute left-4 w-5 h-5 text-slate-400 group-hover:text-pink-400 transition-colors pointer-events-none"}),c.jsx("input",{type:"text",readOnly:!0,value:a,onClick:()=>p(!0),placeholder:t("wiki.searchPlaceholder"),className:"w-full pl-12 pr-24 py-3.5 rounded-2xl bg-white/5 border border-purple-500/25 group-hover:border-pink-500/60 text-sm text-white placeholder-slate-400 outline-none backdrop-blur-xl transition-all shadow-lg cursor-pointer"}),c.jsxs("div",{className:"absolute right-3.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-[11px] font-mono font-bold text-slate-300 flex items-center gap-1",children:[c.jsx("span",{children:"Ctrl"}),c.jsx("span",{children:"K"})]})]})}),c.jsxs("div",{className:"flex flex-wrap items-center justify-center gap-2 mb-10",children:[c.jsxs("button",{onClick:()=>s("todos"),className:`px-4 py-2 rounded-xl text-xs font-bold transition-all ${r==="todos"?"bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-neon-pink scale-105":"bg-white/5 border border-purple-500/20 text-slate-300 hover:bg-white/10 hover:text-white"}`,children:["Todos (",f.length,")"]}),n.map(m=>{var d;return c.jsxs("button",{onClick:()=>s(m.id),className:`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${r===m.id?"bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-neon-pink scale-105":"bg-white/5 border border-purple-500/20 text-slate-300 hover:bg-white/10 hover:text-white"}`,children:[c.jsx("span",{children:m.title||m.name}),c.jsxs("span",{className:"text-[10px] opacity-75 font-mono",children:["(",((d=m.commands)==null?void 0:d.length)||0,")"]})]},m.id)})]}),_.length>0?c.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5",children:_.map(m=>c.jsx(vT,{command:m,onSelect:d=>u(d),t},m.name))}):c.jsx("div",{className:"text-center py-16 text-slate-400 text-sm",children:"Nenhum comando encontrado para esta categoria."}),c.jsx(ST,{isOpen:h,onClose:()=>p(!1),commands:f,onSelectCommand:m=>u(m)}),l&&c.jsx(yT,{command:l,onClose:()=>u(null),lang:e,t})]})}function Nx({t,lang:e}){const[n,i]=le.useState([]),r=[{id:"23798670825",titulo:"Kuromi Sanrio Boneca de pelúcia fofa 25cm Kuromi Sanrio",titulo_en:"Kuromi Sanrio 25cm Cute Plush Doll",preco:"R$ 55,99",preco_en:"$10.77",tag:"Pelúcia Sanrio",tag_en:"Sanrio Plush",link:"https://s.shopee.com.br/1BMdNQEU79",imagem:"https://down-br.img.susercontent.com/file/br-11134207-7r98o-mbe0k65jvlov9d"},{id:"58265449372",titulo:"Camiseta Feminina Premium Hello Kitty Kuromi 100% Algodão",titulo_en:"Premium Hello Kitty Kuromi 100% Cotton Women T-Shirt",preco:"R$ 34,90",preco_en:"$6.71",tag:"Moda & Estilo",tag_en:"Fashion & Goth",link:"https://s.shopee.com.br/1AfzHIvTw",imagem:"https://down-br.img.susercontent.com/file/sg-11134201-8257t-mrez4efi09vpc3"},{id:"28812198611",titulo:"EEBR Vintage Goth Espinhos Casal Anéis Para Homens Mulheres",titulo_en:"Vintage Goth Thorn Couple Rings for Men & Women",preco:"R$ 12,06",preco_en:"$2.32",tag:"Acessório Goth",tag_en:"Goth Jewelry",link:"https://s.shopee.com.br/LnWNtHeo2",imagem:"https://down-br.img.susercontent.com/file/sg-11134201-7rdy7-m0j7wbk9ta7y39"},{id:"58212898323",titulo:"Anel gótico camafeu roxo pedra roxa oval moldura ornamental",titulo_en:"Gothic Purple Cameo Ring with Oval Stone",preco:"R$ 29,90",preco_en:"$5.75",tag:"Acessório Goth",tag_en:"Goth Jewelry",link:"https://s.shopee.com.br/W6waCH1T5",imagem:"https://down-br.img.susercontent.com/file/br-11134207-820ly-mppd70swjy81c9"}];le.useEffect(()=>{fetch("/api/showcase").then(a=>a.json()).then(a=>{a&&a.success&&Array.isArray(a.items)&&a.items.length>0?i(a.items.slice(0,4)):i(r)}).catch(()=>{fetch("/api/shopee/showcase").then(a=>a.json()).then(a=>{a&&a.success&&Array.isArray(a.items)&&a.items.length>0?i(a.items.slice(0,4)):i(r)}).catch(()=>i(r))})},[]);const s=e==="pt";return c.jsx("section",{className:"py-16 md:py-24 border-t border-purple-500/10 relative",children:c.jsxs("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:[c.jsxs("div",{className:"text-center mb-12",children:[c.jsxs("div",{className:"inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-3 shadow-sm",children:[c.jsx(jy,{className:"w-3.5 h-3.5 text-amber-400"}),c.jsx("span",{children:"Setup & Lifestyle"})]}),c.jsx("h2",{className:"font-title font-black text-3xl sm:text-4xl text-white tracking-tight",children:t("shopee.title")}),c.jsx("p",{className:"text-slate-300 text-sm sm:text-base max-w-xl mx-auto mt-2",children:t("shopee.subtitle")})]}),c.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6",children:n.map((a,o)=>{const l=s?a.titulo:a.titulo_en||a.titulo,u=s?a.preco:a.preco_en||a.preco,h=s?a.tag:a.tag_en||a.tag;return c.jsxs("a",{href:a.link||"/promo",target:"_blank",rel:"noopener noreferrer",className:"group rounded-3xl glass-panel border border-purple-500/20 hover:border-pink-500/50 p-4 transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-neon-pink flex flex-col justify-between overflow-hidden",children:[c.jsxs("div",{className:"relative rounded-2xl overflow-hidden aspect-square mb-4 bg-purple-950/40",children:[c.jsx("img",{src:a.imagem,alt:l,className:"w-full h-full object-cover group-hover:scale-105 transition-transform duration-500",loading:"lazy"}),c.jsxs("div",{className:"absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[11px] font-bold text-pink-300 border border-pink-500/30 flex items-center gap-1",children:[c.jsx(Hy,{className:"w-3 h-3 text-pink-400"}),c.jsx("span",{children:h})]})]}),c.jsxs("div",{className:"space-y-2",children:[c.jsx("h3",{className:"font-title font-bold text-sm text-slate-100 group-hover:text-pink-300 transition-colors line-clamp-2",children:l}),c.jsxs("div",{className:"flex items-center justify-between pt-2 border-t border-purple-500/15",children:[c.jsx("span",{className:"font-title font-black text-lg text-amber-300",children:u}),c.jsx("span",{className:"text-xs font-bold text-slate-300 group-hover:text-white flex items-center gap-1",children:t("shopee.cta")})]})]})]},a.id||o)})})]})})}function wT({t,lang:e,stats:n}){return c.jsxs("div",{className:"space-y-6",children:[c.jsx(e1,{t,stats:n}),c.jsx(gT,{t}),c.jsx(xT,{t}),c.jsx(Rx,{t,lang:e}),c.jsx(Nx,{t,lang:e})]})}function MT({t,lang:e}){const n=e==="en",[i,r]=le.useState(()=>{const o=(window.location.hash||"").toLowerCase().replace("#","").trim();return o?o.startsWith("py-")||o==="comandos"||o==="commands"?"commands":o.includes("eco")||o.includes("moeda")?"economy":o.includes("trabalho")||o.includes("carreira")||o.includes("vocacao")?"careers":o.includes("tarot")||o.includes("album")||o.includes("arcano")?"tarot":o.includes("casamento")||o.includes("social")||o.includes("familia")?"marriage":o.includes("faq")||o.includes("duvida")?"faq":"overview":"overview"});le.useEffect(()=>{document.title=n?"Pyxie Official Wiki & Community Guide | Discord Bot":"Wiki Oficial & Enciclopédia da Pyxie | Discord Bot"},[n]),le.useEffect(()=>{const o=()=>{const l=(window.location.hash||"").toLowerCase().replace("#","").trim();if(!l){r("overview");return}l.startsWith("py-")||l==="comandos"||l==="commands"?r("commands"):l.includes("eco")||l.includes("moeda")?r("economy"):l.includes("trabalho")||l.includes("carreira")||l.includes("vocacao")?r("careers"):l.includes("tarot")||l.includes("album")||l.includes("arcano")?r("tarot"):l.includes("casamento")||l.includes("social")||l.includes("familia")?r("marriage"):(l.includes("faq")||l.includes("duvida"))&&r("faq")};return window.addEventListener("hashchange",o),()=>window.removeEventListener("hashchange",o)},[]);const s=[{id:"overview",label:n?"Community & Sanctuary":"Comunidade & Santuário",icon:Ju,badge:"Lore"},{id:"economy",label:n?"Living Economy":"Economia Viva",icon:Es,badge:"Coins"},{id:"careers",label:n?"16 Vocations & Work":"16 Vocações & Trabalho",icon:ma,badge:"Minigames"},{id:"tarot",label:n?"78 Arcana Tarot":"Tarot dos 78 Arcanos",icon:Lt,badge:"HD Canvas"},{id:"marriage",label:n?"Marriage & Family":"Casamento & Família",icon:vr,badge:"Social"},{id:"commands",label:n?"Commands Catalog":"Catálogo de Comandos",icon:xi,badge:"Ctrl+K"},{id:"faq",label:n?"FAQ & Help":"Dúvidas & FAQ",icon:Ry,badge:"Guia"}],a=n?[{q:"How do I add Pyxie to my Discord server?",a:'Click on the "Add Pyxie" button in the navbar or visit /invite to authorize Pyxie with slash commands and message attachments permissions.'},{q:"Do slash commands work in all channels?",a:"Yes, unless server administrators restrict command permissions in Server Settings > Integrations."},{q:"What is the daily economy reset time?",a:"Daily rewards (/py-daily) reset every 24 hours per user. Daily streaks have a 48h grace window."},{q:"Are all 78 Tarot cards available in the Album?",a:"Yes! All 22 Major Arcana and 56 Minor Arcana can be collected, viewed, and shared in HD via /py-album."},{q:"How does the Marriage Tree of Life work?",a:"Married partners can water the Tree of Life every 12h, granting +10% love and unlocking permanent rewards."},{q:"Is Pyxie completely free to use?",a:"100% free! All economic commands, minigames, tarot cards, and careers are accessible without any paywalls."}]:[{q:"Como adiciono a Pyxie ao meu servidor?",a:'Basta clicar no botão "Adicionar Pyxie" no topo da página ou acessar /invite para conceder permissões de comandos slash.'},{q:"Os comandos funcionam por barra (/) e prefixo (py!)?",a:"Sim! Todos os comandos possuem registro oficial por barra no Discord e aliases por prefixo py! correspondentes."},{q:"Como funciona o Álbum de Tarot dos 78 Arcanos?",a:"Ao tirar sua carta do dia (/py-tarot), você pode colá-la no seu álbum (/py-album). Colecionar cartas desbloqueia conquistas e moedinhas!"},{q:"Como evoluir o casamento no bot?",a:"Após casar (/py-casamento), você e seu cônjuge podem regar a Árvore da Vida a cada 12h, depositar no Cofre do Casal e ter encontros românticos!"},{q:"Com que frequência posso trabalhar?",a:"O expediente (/py-work) tem recarga de 3 horas. Cada profissão possui minigames técnicos com perguntas interativas de 45 segundos."},{q:"A Pyxie é totalmente gratuita?",a:"Sim! Todos os 37 comandos, sistemas de economia, minigames, tarot e casamento são 100% acessíveis e gratuitos."}];return c.jsxs("div",{className:"min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12",children:[c.jsxs("div",{className:"text-center space-y-4 max-w-3xl mx-auto",children:[c.jsxs("div",{className:"inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold shadow-sm",children:[c.jsx(Ms,{className:"w-3.5 h-3.5 text-pink-400"}),c.jsx("span",{children:n?"Official Documentation • Pyxie & Cringelândia":"Enciclopédia Oficial • Pyxie & Cringelândia"})]}),c.jsx("h1",{className:"font-title font-black text-3xl sm:text-5xl md:text-6xl bg-gradient-to-r from-white via-pink-200 to-purple-300 bg-clip-text text-transparent tracking-tight",children:n?"Official Guide & Interactive Wiki":"Guia Oficial & Enciclopédia Interativa"}),c.jsx("p",{className:"text-slate-300 text-sm sm:text-base leading-relaxed",children:n?"Explore deep documentation for Pyxie: live economy, 16 careers, 78 Tarot Arcana, marriage dynamics and command catalog.":"Explore explicações detalhadas sobre a economia mágica, 16 vocações profissionais, o oráculo de tarot dos 78 arcanos, matrimônio e comandos oficiais."}),c.jsxs("div",{className:"flex flex-wrap items-center justify-center gap-3 pt-2",children:[c.jsxs("span",{className:"px-3 py-1 rounded-xl bg-white/5 border border-purple-500/20 text-xs font-mono text-pink-300 flex items-center gap-1.5",children:[c.jsx(Lt,{className:"w-3 h-3"})," 78 Arcanos em HD"]}),c.jsxs("span",{className:"px-3 py-1 rounded-xl bg-white/5 border border-purple-500/20 text-xs font-mono text-purple-300 flex items-center gap-1.5",children:[c.jsx(ma,{className:"w-3 h-3"})," 16 Vocações Únicas"]}),c.jsxs("span",{className:"px-3 py-1 rounded-xl bg-white/5 border border-purple-500/20 text-xs font-mono text-emerald-300 flex items-center gap-1.5",children:[c.jsx(Ep,{className:"w-3 h-3"})," 100% Gratuita & Segura"]}),c.jsxs("span",{className:"px-3 py-1 rounded-xl bg-white/5 border border-purple-500/20 text-xs font-mono text-amber-300 flex items-center gap-1.5",children:[c.jsx(Yy,{className:"w-3 h-3"})," Bilíngue PT-BR & EN"]})]})]}),c.jsx("div",{className:"flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-purple-500/20",children:s.map(o=>{const l=o.icon,u=i===o.id;return c.jsxs("button",{onClick:()=>{r(o.id),window.location.hash=o.id==="commands"?"comandos":o.id},className:`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${u?"bg-gradient-to-r from-pink-600 to-purple-600 text-white border-pink-400/50 shadow-neon-pink":"bg-white/5 border-purple-500/15 text-slate-300 hover:text-white hover:bg-white/10"}`,children:[c.jsx(l,{className:`w-4 h-4 ${u?"text-white":"text-purple-400"}`}),c.jsx("span",{children:o.label}),o.badge&&c.jsx("span",{className:`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${u?"bg-black/30 text-pink-200":"bg-purple-500/20 text-purple-300"}`,children:o.badge})]},o.id)})}),i==="overview"&&c.jsx("div",{className:"space-y-8 animate-fadeIn",children:c.jsxs("div",{className:"p-6 sm:p-8 rounded-3xl glass-panel border border-purple-500/20 space-y-6",children:[c.jsxs("div",{className:"flex items-center gap-3",children:[c.jsx("div",{className:"p-3 rounded-2xl bg-pink-500/15 text-pink-400 border border-pink-500/30",children:c.jsx(Ju,{className:"w-6 h-6"})}),c.jsxs("div",{children:[c.jsx("h2",{className:"font-title font-extrabold text-2xl sm:text-3xl text-white",children:n?"A Welcoming Sanctuary for Neurodivergent Minds":"Um Santuário para Mentes Neurodivergentes"}),c.jsx("p",{className:"text-slate-400 text-xs sm:text-sm",children:n?"Compassionate community culture & safe haven on Discord":"Cultura comunitária, empatia e ambiente acolhedor"})]})]}),c.jsx("p",{className:"text-slate-200 text-sm sm:text-base leading-relaxed",children:n?"The official Pyxie community (Cringelândia) was created to be a warm, gentle, and judgment-free home. We proudly embrace neurodivergent individuals — autistic people (ASD), ADHD, bipolarity, depression, anxiety, and unique perception styles. Special interests (hyperfocus), creative minds, and honest conversations are celebrated.":"A comunidade oficial da Pyxie (Cringelândia) nasceu com um propósito genuíno: ser um porto seguro, caloroso e livre de julgamentos. Abrigamos com orgulho mentes neurodivergentes — pessoas no espectro autista (TEA), TDAH, bipolaridade, depressão, ansiedade e hiperfocos. Acreditamos que quem enxerga o mundo por ângulos singulares enriquece profundamente a nossa vivência."}),c.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4 pt-2",children:[c.jsxs("div",{className:"p-4 rounded-2xl bg-white/5 border border-purple-500/15 space-y-2",children:[c.jsxs("div",{className:"flex items-center gap-2 text-pink-300 font-title font-bold text-sm",children:[c.jsx(Ep,{className:"w-4 h-4 text-pink-400"}),c.jsx("span",{children:n?"Zero Tolerance for Ableism":"Tolerância Zero contra Capacitismo"})]}),c.jsx("p",{className:"text-xs text-slate-300 leading-relaxed",children:n?"Hostility, harassment, mockery, or disrespect towards neurodivergent traits result in swift and irrevocable removal.":"Preconceito, piadas de mau gosto ou qualquer hostilidade contra características neurodivergentes resultam em banimento imediato."})]}),c.jsxs("div",{className:"p-4 rounded-2xl bg-white/5 border border-purple-500/15 space-y-2",children:[c.jsxs("div",{className:"flex items-center gap-2 text-purple-300 font-title font-bold text-sm",children:[c.jsx(vr,{className:"w-4 h-4 text-purple-400"}),c.jsx("span",{children:n?"Respect for Autistic Creators":"Proteção à Arte e Expressão"})]}),c.jsx("p",{className:"text-xs text-slate-300 leading-relaxed",children:n?"Member artwork in the Museum is protected by community copyright. Creative projects and personal boundaries are safeguarded.":"Obras compartilhadas no Museu possuem proteção visual contra cópia indevida. Respeitamos a autoria e os limites de cada criador."})]})]}),c.jsxs("div",{className:"space-y-3 pt-4",children:[c.jsxs("h3",{className:"font-title font-bold text-lg text-white flex items-center gap-2",children:[c.jsx(Wg,{className:"w-4 h-4 text-pink-400"}),c.jsx("span",{children:n?"One-Word Identity Roles":"Cargos Concisos de Uma Palavra"})]}),c.jsx("p",{className:"text-xs text-slate-400",children:n?"In our guild, community roles honor individuality without bureaucratic titles:":"Nossos cargos comunitários adotam títulos elegantes e poéticos que traduzem a energia de cada membro:"}),c.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-3 gap-3",children:[c.jsxs("div",{className:"p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20",children:[c.jsx("span",{className:"font-mono font-bold text-pink-400 text-sm",children:"Peculiar"}),c.jsx("p",{className:"text-xs text-slate-300 mt-1",children:n?"For minds with authentic and unique perspectives.":"Para mentes que enxergam a vida com autenticidade única."})]}),c.jsxs("div",{className:"p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20",children:[c.jsx("span",{className:"font-mono font-bold text-purple-400 text-sm",children:"Mágico"}),c.jsx("p",{className:"text-xs text-slate-300 mt-1",children:n?"For those who bring creativity and joy to daily talks.":"Para quem traz encantamento, ideias e boas energias."})]}),c.jsxs("div",{className:"p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20",children:[c.jsx("span",{className:"font-mono font-bold text-amber-400 text-sm",children:"Travesso"}),c.jsx("p",{className:"text-xs text-slate-300 mt-1",children:n?"Playful spirit reflecting Pyxie’s rebel energy.":"O espírito rebelde e divertido da própria Pyxie."})]})]})]}),c.jsxs("div",{className:"space-y-4 pt-4 border-t border-purple-500/15",children:[c.jsxs("h3",{className:"font-title font-bold text-lg text-white flex items-center gap-2",children:[c.jsx(Ms,{className:"w-4 h-4 text-pink-400"}),c.jsx("span",{children:n?"Explore the 6 System Guides & Chapters":"Explore os 6 Capítulos da Enciclopédia"})]}),c.jsx("p",{className:"text-xs text-slate-400",children:n?"Select any chapter below to explore deep mechanics, rules, and live commands:":"Navegue pelos capítulos completos com explicações detalhadas, regras, fórmulas e atalhos:"}),c.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1",children:[c.jsxs("div",{onClick:()=>{r("economy"),window.location.hash="economy"},className:"p-5 rounded-2xl glass-panel border border-amber-500/20 hover:border-amber-500/50 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-neon-pink group",children:[c.jsxs("div",{className:"flex items-center justify-between mb-3",children:[c.jsx("span",{className:"text-2xl p-2 rounded-xl bg-amber-500/10 border border-amber-500/20",children:"🪙"}),c.jsx("span",{className:"text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300",children:"Capítulo 02"})]}),c.jsx("h4",{className:"font-title font-bold text-white text-base group-hover:text-amber-300 transition-colors",children:n?"Living Economy":"Economia Mágica"}),c.jsx("p",{className:"text-xs text-slate-300 mt-1 leading-relaxed",children:n?"Dual-currency mechanics, daily rewards, streaks, and the 10s web bonus portal.":"Moedinhas, Feijões Mágicos raros, bônus diários, streaks e portal web."}),c.jsx("div",{className:"mt-4 flex items-center text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform",children:c.jsx("span",{children:n?"Read Chapter ➔":"Ler Capítulo ➔"})})]}),c.jsxs("div",{onClick:()=>{r("careers"),window.location.hash="careers"},className:"p-5 rounded-2xl glass-panel border border-purple-500/20 hover:border-purple-500/50 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-neon-pink group",children:[c.jsxs("div",{className:"flex items-center justify-between mb-3",children:[c.jsx("span",{className:"text-2xl p-2 rounded-xl bg-purple-500/10 border border-purple-500/20",children:"💼"}),c.jsx("span",{className:"text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300",children:"Capítulo 03"})]}),c.jsx("h4",{className:"font-title font-bold text-white text-base group-hover:text-purple-300 transition-colors",children:n?"16 Vocations & Work":"16 Vocações & Trabalho"}),c.jsx("p",{className:"text-xs text-slate-300 mt-1 leading-relaxed",children:n?"Clock in every 3h, solve 45s thematic challenges, earn XP and senior promotions.":"Turnos de 3 horas com minigames técnicos de 45 segundos, XP e promoções."}),c.jsx("div",{className:"mt-4 flex items-center text-xs font-bold text-purple-400 group-hover:translate-x-1 transition-transform",children:c.jsx("span",{children:n?"Read Chapter ➔":"Ler Capítulo ➔"})})]}),c.jsxs("div",{onClick:()=>{r("tarot"),window.location.hash="tarot"},className:"p-5 rounded-2xl glass-panel border border-pink-500/20 hover:border-pink-500/50 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-neon-pink group",children:[c.jsxs("div",{className:"flex items-center justify-between mb-3",children:[c.jsx("span",{className:"text-2xl p-2 rounded-xl bg-pink-500/10 border border-pink-500/20",children:"🔮"}),c.jsx("span",{className:"text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300",children:"Capítulo 04"})]}),c.jsx("h4",{className:"font-title font-bold text-white text-base group-hover:text-pink-300 transition-colors",children:n?"78 Arcana Tarot Oracle":"Tarot dos 78 Arcanos"}),c.jsx("p",{className:"text-xs text-slate-300 mt-1 leading-relaxed",children:n?"Daily card reading in HD canvas, collectible album, arcane bribes, and achievements.":"Tiragem diária em tela HD, álbum colecionável de cartas e suborno arcano."}),c.jsx("div",{className:"mt-4 flex items-center text-xs font-bold text-pink-400 group-hover:translate-x-1 transition-transform",children:c.jsx("span",{children:n?"Read Chapter ➔":"Ler Capítulo ➔"})})]}),c.jsxs("div",{onClick:()=>{r("marriage"),window.location.hash="marriage"},className:"p-5 rounded-2xl glass-panel border border-rose-500/20 hover:border-rose-500/50 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-neon-pink group",children:[c.jsxs("div",{className:"flex items-center justify-between mb-3",children:[c.jsx("span",{className:"text-2xl p-2 rounded-xl bg-rose-500/10 border border-rose-500/20",children:"💍"}),c.jsx("span",{className:"text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300",children:"Capítulo 05"})]}),c.jsx("h4",{className:"font-title font-bold text-white text-base group-hover:text-rose-300 transition-colors",children:n?"Marriage & Family":"Casamento & Família"}),c.jsx("p",{className:"text-xs text-slate-300 mt-1 leading-relaxed",children:n?"Tree of life watering every 12h, shared Love Vault with 5% daily interest, and children.":"Árvore da Vida a cada 12h, cofre do casal com rendimento diário e filhos."}),c.jsx("div",{className:"mt-4 flex items-center text-xs font-bold text-rose-400 group-hover:translate-x-1 transition-transform",children:c.jsx("span",{children:n?"Read Chapter ➔":"Ler Capítulo ➔"})})]}),c.jsxs("div",{onClick:()=>{r("commands"),window.location.hash="comandos"},className:"p-5 rounded-2xl glass-panel border border-cyan-500/20 hover:border-cyan-500/50 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-neon-pink group",children:[c.jsxs("div",{className:"flex items-center justify-between mb-3",children:[c.jsx("span",{className:"text-2xl p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20",children:"⚙️"}),c.jsx("span",{className:"text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300",children:"Capítulo 06"})]}),c.jsx("h4",{className:"font-title font-bold text-white text-base group-hover:text-cyan-300 transition-colors",children:n?"Commands Catalog":"Catálogo de Comandos"}),c.jsx("p",{className:"text-xs text-slate-300 mt-1 leading-relaxed",children:n?"Interactive documentation with fuzzy search (Ctrl+K), category filters and live discord embeds.":"Documentação completa com busca fuzzy (Ctrl+K), filtros e embeds ao vivo."}),c.jsx("div",{className:"mt-4 flex items-center text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform",children:c.jsx("span",{children:n?"Explore Commands ➔":"Explorar Comandos ➔"})})]}),c.jsxs("div",{onClick:()=>{r("faq"),window.location.hash="faq"},className:"p-5 rounded-2xl glass-panel border border-indigo-500/20 hover:border-indigo-500/50 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-neon-pink group",children:[c.jsxs("div",{className:"flex items-center justify-between mb-3",children:[c.jsx("span",{className:"text-2xl p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20",children:"❓"}),c.jsx("span",{className:"text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300",children:"Capítulo 07"})]}),c.jsx("h4",{className:"font-title font-bold text-white text-base group-hover:text-indigo-300 transition-colors",children:n?"FAQ & Community Help":"Dúvidas & FAQ"}),c.jsx("p",{className:"text-xs text-slate-300 mt-1 leading-relaxed",children:n?"Frequently asked questions, cooldowns, invite guide and server settings.":"Perguntas frequentes, permissões, recargas e suporte do bot."}),c.jsx("div",{className:"mt-4 flex items-center text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition-transform",children:c.jsx("span",{children:n?"Open FAQ ➔":"Ver Perguntas ➔"})})]})]})]})]})}),i==="economy"&&c.jsx("div",{className:"space-y-6 animate-fadeIn",children:c.jsxs("div",{className:"p-6 sm:p-8 rounded-3xl glass-panel border border-purple-500/20 space-y-6",children:[c.jsxs("div",{className:"flex items-center gap-3",children:[c.jsx("div",{className:"p-3 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30",children:c.jsx(Es,{className:"w-6 h-6"})}),c.jsxs("div",{children:[c.jsx("h2",{className:"font-title font-extrabold text-2xl sm:text-3xl text-white",children:n?"Living Economy: Coins, Magic Beans & Vaults":"Economia Viva: Moedinhas, Feijões e Cofres"}),c.jsx("p",{className:"text-slate-400 text-xs sm:text-sm",children:n?"Dual-currency mechanics, daily earnings, and rewards":"Duas moedas, rendimentos diários e recompensas"})]})]}),c.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-5",children:[c.jsxs("div",{className:"p-5 rounded-2xl bg-white/5 border border-purple-500/15 space-y-3",children:[c.jsxs("div",{className:"flex items-center gap-2 text-amber-300 font-title font-bold text-base",children:[c.jsx("span",{children:"🪙"}),c.jsx("span",{children:n?"Moedinhas (Gold Coins)":"Moedinhas Mágicas"})]}),c.jsx("p",{className:"text-xs text-slate-300 leading-relaxed",children:n?"The primary currency used for social dynamics, career shifts, wedding rings, gifts, and games. Earned via /py-daily, /py-work shifts, and Tarot album milestones.":"A moeda principal para salários de profissão, alianças de casamento, minigames, bônus e presentes. Obtida no /py-daily, nos turnos de /py-work e no portal de bônus web."}),c.jsx("div",{className:"font-mono text-[11px] text-pink-300 bg-black/40 px-3 py-1.5 rounded-lg border border-pink-500/20",children:"/py-carteira • /py-daily • /py-bonus"})]}),c.jsxs("div",{className:"p-5 rounded-2xl bg-white/5 border border-purple-500/15 space-y-3",children:[c.jsxs("div",{className:"flex items-center gap-2 text-emerald-300 font-title font-bold text-base",children:[c.jsx("span",{children:"🫘"}),c.jsx("span",{children:n?"Feijões Mágicos (Rare Beans)":"Feijões Mágicos Raros"})]}),c.jsx("p",{className:"text-xs text-slate-300 leading-relaxed",children:n?"Rare, precious mystical beans required for advanced career promotions, Arcane Bribes in the Tarot Album, and special relics.":"A moeda sagrada e rara necessária para promoções nos escalões mais altos de carreira, subornos arcanos de cartas no Álbum de Tarot e artefatos lendários."}),c.jsx("div",{className:"font-mono text-[11px] text-emerald-300 bg-black/40 px-3 py-1.5 rounded-lg border border-emerald-500/20",children:"/py-work • /py-suborno • Recompensas de Streaks"})]})]}),c.jsxs("div",{className:"p-5 rounded-2xl bg-gradient-to-r from-pink-950/40 via-purple-950/40 to-indigo-950/40 border border-pink-500/30 flex flex-col sm:flex-row items-center justify-between gap-4",children:[c.jsxs("div",{className:"space-y-1 text-left",children:[c.jsxs("h4",{className:"font-title font-bold text-white text-sm flex items-center gap-2",children:[c.jsx(Lt,{className:"w-4 h-4 text-pink-400"}),c.jsx("span",{children:n?"Daily 10-Second Web Reward Portal":"Bônus Mágico Web de 10 Segundos"})]}),c.jsx("p",{className:"text-xs text-slate-300",children:n?"Claim extra coins daily through the secure waiting portal in 10 seconds!":"Ganhe moedinhas adicionais todos os dias aguardando 10 segundos no portal oficial de recompensas!"})]}),c.jsx("a",{href:"/bonus",className:"px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-neon-pink whitespace-nowrap transition-all",children:n?"Claim 10s Bonus ➔":"Resgatar Bônus 10s ➔"})]})]})}),i==="careers"&&c.jsx("div",{className:"space-y-6 animate-fadeIn",children:c.jsxs("div",{className:"p-6 sm:p-8 rounded-3xl glass-panel border border-purple-500/20 space-y-6",children:[c.jsxs("div",{className:"flex items-center gap-3",children:[c.jsx("div",{className:"p-3 rounded-2xl bg-purple-500/15 text-purple-400 border border-purple-500/30",children:c.jsx(ma,{className:"w-6 h-6"})}),c.jsxs("div",{children:[c.jsx("h2",{className:"font-title font-extrabold text-2xl sm:text-3xl text-white",children:n?"16 Unique Vocations & 45s Technical Minigames":"16 Carreiras Únicas & Minigames de 45s"}),c.jsx("p",{className:"text-slate-400 text-xs sm:text-sm",children:n?"Interactive questions every 3 hours, career promotions and XP":"Perguntas técnicas a cada 3h, hierarquia salarial e XP"})]})]}),c.jsx("p",{className:"text-slate-200 text-sm sm:text-base leading-relaxed",children:n?"Every 3 hours, you can clock in with /py-work. Each of the 16 careers features a custom thematic challenge with 45-second timer. Correct choices grant bonuses, XP, and unlock senior promotions with higher salaries!":"A cada 3 horas você pode bater ponto com o comando /py-work. Cada uma das 16 vocações possui desafios técnicos imersivos com cronômetro de 45 segundos. Acertos perfeitos garantem bônus salariais, XP de carreira e abrem caminho para promoções de alto nível!"}),c.jsx("div",{className:"grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2",children:[{name:"Alquimista Místico",icon:"🧪",desc:"Poções & Transmutação"},{name:"Guarda da Penumbra",icon:"🛡️",desc:"Defesa & Sentinela"},{name:"Bibliotecário Astral",icon:"📜",desc:"Grimórios & Histórias"},{name:"Ferreiro Rúnico",icon:"⚒️",desc:"Forja & Runas Arcanas"},{name:"Chef Confeiteiro",icon:"🧁",desc:"Doces & Encantamentos"},{name:"Herbalista Fada",icon:"🌿",desc:"Plantas Raras & Ervas"},{name:"Astrólogo Cósmico",icon:"🔭",desc:"Constelações & Mapas"},{name:"Detetive Arcano",icon:"🔍",desc:"Enigmas & Mistérios"},{name:"Domador de Sombras",icon:"🦇",desc:"Familires & Morcegos"},{name:"Bardo Encantado",icon:"🪕",desc:"Canções & Lendas"},{name:"Necromante Amigável",icon:"💀",desc:"Almas & Crânios Fofos"},{name:"Navegador Estelar",icon:"🌌",desc:"Rotas pelo Espaço"},{name:"Costureiro Gótico",icon:"🧵",desc:"Roupas Punk & Fitas"},{name:"Mercador Nômade",icon:"🪙",desc:"Trocas & Negócios"},{name:"Cultivador de Cristais",icon:"💎",desc:"Gemas de Mana"},{name:"Guardião de Portais",icon:"🌀",desc:"Fendas Dimensionais"}].map((o,l)=>c.jsxs("div",{className:"p-3 rounded-2xl bg-white/5 border border-purple-500/15 hover:border-pink-500/30 transition-all",children:[c.jsx("span",{className:"text-xl",children:o.icon}),c.jsx("div",{className:"font-title font-bold text-xs text-white mt-1",children:o.name}),c.jsx("div",{className:"text-[10px] text-slate-400 truncate",children:o.desc})]},l))}),c.jsx("div",{className:"pt-2 text-center",children:c.jsx("span",{className:"text-xs font-mono text-purple-300",children:n?"Commands: /py-profissao • /py-work":"Comandos: /py-profissao (escolher) • /py-work (trabalhar)"})})]})}),i==="tarot"&&c.jsx("div",{className:"space-y-6 animate-fadeIn",children:c.jsxs("div",{className:"p-6 sm:p-8 rounded-3xl glass-panel border border-purple-500/20 space-y-6",children:[c.jsxs("div",{className:"flex items-center gap-3",children:[c.jsx("div",{className:"p-3 rounded-2xl bg-pink-500/15 text-pink-400 border border-pink-500/30",children:c.jsx(Lt,{className:"w-6 h-6"})}),c.jsxs("div",{children:[c.jsx("h2",{className:"font-title font-extrabold text-2xl sm:text-3xl text-white",children:n?"The 78 Tarot Arcana & Collector’s Album":"Tarot dos 78 Arcanos & Álbum Colecionável"}),c.jsx("p",{className:"text-slate-400 text-xs sm:text-sm",children:n?"Daily oracle readings, HD canvas generation, achievements and bribes":"Tiragens diárias, renderização em canvas HD e álbum com suborno"})]})]}),c.jsx("p",{className:"text-slate-200 text-sm sm:text-base leading-relaxed",children:n?"Draw your daily guidance with /py-tarot! Each card is generated dynamically in HD canvas with mystical interpretations. Stick your card into your personal album (/py-album) to build your collection, unlock achievements, and use Arcane Bribes for missing cards.":"Consulte a sabedoria do oráculo com /py-tarot! Cada tiragem gera uma carta em alta resolução com reflexões para o seu dia. Cole sua carta no seu Álbum Colecionável (/py-album) para completar os 22 Arcanos Maiores e 56 Menores, ganhando conquistas exclusivas e moedinhas!"}),c.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2",children:[c.jsxs("div",{className:"p-4 rounded-2xl bg-white/5 border border-purple-500/15 space-y-2",children:[c.jsx("div",{className:"text-pink-400 font-title font-bold text-sm",children:"🔮 Tiragem Diária"}),c.jsx("p",{className:"text-xs text-slate-300",children:n?"1 free card draw every 24h with personalized insight.":"1 tiragem gratuita por dia com reflexão inspiradora."}),c.jsx("div",{className:"font-mono text-[10px] text-purple-300",children:"/py-tarot"})]}),c.jsxs("div",{className:"p-4 rounded-2xl bg-white/5 border border-purple-500/15 space-y-2",children:[c.jsx("div",{className:"text-purple-400 font-title font-bold text-sm",children:"📖 Álbum de Coleção"}),c.jsx("p",{className:"text-xs text-slate-300",children:n?"Organize your cards and showcase your public web deck.":"Cole suas cartas, consulte estatísticas e exiba seu perfil web."}),c.jsx("div",{className:"font-mono text-[10px] text-purple-300",children:"/py-album"})]}),c.jsxs("div",{className:"p-4 rounded-2xl bg-white/5 border border-purple-500/15 space-y-2",children:[c.jsx("div",{className:"text-amber-400 font-title font-bold text-sm",children:"💰 Suborno Arcano"}),c.jsx("p",{className:"text-xs text-slate-300",children:n?"Spend magic beans to summon a guaranteed missing card!":"Gaste Feijões Mágicos para invocar cartas faltantes no álbum!"}),c.jsx("div",{className:"font-mono text-[10px] text-purple-300",children:"/py-suborno"})]})]})]})}),i==="marriage"&&c.jsx("div",{className:"space-y-6 animate-fadeIn",children:c.jsxs("div",{className:"p-6 sm:p-8 rounded-3xl glass-panel border border-purple-500/20 space-y-6",children:[c.jsxs("div",{className:"flex items-center gap-3",children:[c.jsx("div",{className:"p-3 rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/30",children:c.jsx(vr,{className:"w-6 h-6"})}),c.jsxs("div",{children:[c.jsx("h2",{className:"font-title font-extrabold text-2xl sm:text-3xl text-white",children:n?"Marriage, Family & Social Dynamics":"Matrimônio, Família & Dinâmica Social"}),c.jsx("p",{className:"text-slate-400 text-xs sm:text-sm",children:n?"Tree of life, shared bank vault, romantic dates and children":"Árvore da vida, cofre conjunto, encontros românticos e filhos"})]})]}),c.jsx("p",{className:"text-slate-200 text-sm sm:text-base leading-relaxed",children:n?"Form an eternal bond with another member! Once married, couples nurture an active Love Gauge that decays lazily if neglected. Together you water the Tree of Life every 12h, invest in the Family Vault with daily interest, enjoy Date Nights, and adopt children who work internships for family income!":"Celebre um vínculo eterno com outro membro do Discord! Casais nutrem uma Barra do Amor que exige carinho diário. Vocês podem regar a Árvore da Vida a cada 12h, acumular economias no Cofre do Casal com juros diários, ter encontros românticos e adotar filhos que fazem estágios e trazem moedas para o lar!"}),c.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2",children:[c.jsxs("div",{className:"p-4 rounded-2xl bg-white/5 border border-purple-500/15 space-y-1.5",children:[c.jsx(Gy,{className:"w-5 h-5 text-emerald-400"}),c.jsx("div",{className:"font-title font-bold text-white text-sm",children:"Árvore da Vida"}),c.jsx("p",{className:"text-[11px] text-slate-300",children:n?"Water every 12h to gain +10% Love and tree levels.":"Rega a cada 12h rende +10% de amor e sobe o nível da árvore."})]}),c.jsxs("div",{className:"p-4 rounded-2xl bg-white/5 border border-purple-500/15 space-y-1.5",children:[c.jsx(Wy,{className:"w-5 h-5 text-amber-400"}),c.jsx("div",{className:"font-title font-bold text-white text-sm",children:"Cofre do Casal"}),c.jsx("p",{className:"text-[11px] text-slate-300",children:n?"Deposit shared coins with up to 5%/day interest.":"Depósitos conjuntos com rendimento diário de até 5% ao dia."})]}),c.jsxs("div",{className:"p-4 rounded-2xl bg-white/5 border border-purple-500/15 space-y-1.5",children:[c.jsx(vr,{className:"w-5 h-5 text-rose-400"}),c.jsx("div",{className:"font-title font-bold text-white text-sm",children:"Date Night"}),c.jsx("p",{className:"text-[11px] text-slate-300",children:n?"Answer 3 date questions together for love boosts.":"Encontros com 3 perguntas de sintonia a dois com prêmios."})]}),c.jsxs("div",{className:"p-4 rounded-2xl bg-white/5 border border-purple-500/15 space-y-1.5",children:[c.jsx(Ey,{className:"w-5 h-5 text-pink-400"}),c.jsx("div",{className:"font-title font-bold text-white text-sm",children:"Filhos & Estágio"}),c.jsx("p",{className:"text-[11px] text-slate-300",children:n?"Adopt up to 5 children who work 24h internships.":"Adote até 5 filhos que fazem estágio remunerado para a família."})]})]}),c.jsx("div",{className:"pt-2 text-center font-mono text-xs text-pink-300",children:"/py-casamento • /py-filho • /py-divorcio • /py-ship"})]})}),i==="commands"&&c.jsxs("div",{className:"space-y-6 animate-fadeIn",children:[c.jsxs("div",{className:"p-4 rounded-2xl bg-white/5 border border-purple-500/20 flex items-center justify-between gap-4",children:[c.jsxs("div",{className:"flex items-center gap-2.5 text-xs text-slate-300",children:[c.jsx(xi,{className:"w-4 h-4 text-pink-400 flex-shrink-0"}),c.jsx("span",{children:n?"Showing all registered commands. Press Ctrl+K anytime to open the instant search command palette.":"Catálogo oficial de todos os comandos registrados. Pressione Ctrl+K a qualquer momento para abrir o buscador rápido."})]}),c.jsxs("div",{className:"hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-[10px] font-mono text-purple-300",children:[c.jsx("span",{children:"Ctrl"})," + ",c.jsx("span",{children:"K"})]})]}),c.jsx(Rx,{t,lang:e})]}),i==="faq"&&c.jsxs("div",{className:"space-y-6 animate-fadeIn",children:[c.jsxs("div",{className:"text-center mb-6",children:[c.jsx("h3",{className:"font-title font-extrabold text-2xl sm:text-3xl text-white",children:n?"Frequently Asked Questions & Guidelines":"Perguntas Frequentes & Diretrizes"}),c.jsx("p",{className:"text-slate-400 text-xs sm:text-sm mt-1",children:n?"Quick answers to common questions about Pyxie":"Respostas rápidas sobre comandos, permissões e economia"})]}),c.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-5",children:a.map((o,l)=>c.jsxs("div",{className:"p-5 rounded-2xl glass-panel border border-purple-500/20 space-y-2 hover:border-pink-500/40 transition-colors",children:[c.jsxs("h4",{className:"font-title font-bold text-base text-white flex items-center gap-2",children:[c.jsx("span",{className:"text-pink-400",children:"Q."}),c.jsx("span",{children:o.q})]}),c.jsx("p",{className:"text-xs sm:text-sm text-slate-300 leading-relaxed pl-6",children:o.a})]},l))})]})]})}const ET=t=>(t==null?void 0:t.authorName)||(t==null?void 0:t.author)||(t==null?void 0:t.authorUsername)||"Artista",lr=t=>{const e=(t==null?void 0:t.authorUsername)||(t==null?void 0:t.authorName)||(t==null?void 0:t.author)||"Artista",n=String(e).trim().replace(/^@+/,"");return n&&n.toLowerCase()!=="artista"?`@${n}`:t!=null&&t.userId?"@Membro":"@Artista"};function bT({t,lang:e}){var ee;const[n,i]=le.useState([]),[r,s]=le.useState(1),[a,o]=le.useState(1),[l,u]=le.useState(""),[h,p]=le.useState(""),[f,x]=le.useState("grid"),[_,S]=le.useState(""),[m,d]=le.useState(null),[g,v]=le.useState(1),[w,N]=le.useState(null),[E,A]=le.useState(""),[R,F]=le.useState(!1),[y,b]=le.useState(!1);le.useEffect(()=>{const O=localStorage.getItem("pyxie_admin_token")||"";S(O)},[]);const H=(O=1,oe=l)=>{let Te=`/api/museum/arts?page=${O}&limit=24`;oe&&(Te+=`&user=${encodeURIComponent(oe)}`),fetch(Te).then(G=>G.json()).then(G=>{if(G&&G.success){i(G.arts||[]),s(G.page||1),o(G.totalPages||1);const ue=new URLSearchParams(window.location.search).get("art");if(ue){const me=(G.arts||[]).find(Pe=>Pe.id===ue);me&&d(me)}}}).catch(G=>console.error(G))};le.useEffect(()=>{H(1)},[l]);const V=le.useMemo(()=>{const O=new Map;return n.forEach(oe=>{const Te=oe.authorUsername||oe.authorName||oe.author;oe.userId&&Te&&!O.has(oe.userId)&&O.set(oe.userId,String(Te).trim().replace(/^@+/,""))}),Array.from(O.entries()).map(([oe,Te])=>({userId:oe,name:Te}))},[n]),q=le.useMemo(()=>{if(!h.trim())return n;const O=h.toLowerCase();return n.filter(oe=>{var Te,G,ie,ue;return((Te=oe.description)==null?void 0:Te.toLowerCase().includes(O))||((G=oe.authorName)==null?void 0:G.toLowerCase().includes(O))||((ie=oe.author)==null?void 0:ie.toLowerCase().includes(O))||((ue=oe.authorUsername)==null?void 0:ue.toLowerCase().includes(O))})},[n,h]),Q=(O,oe)=>{oe&&oe.stopPropagation();const Te=`${window.location.origin}/museu?art=${O.id}`;navigator.clipboard.writeText(Te),b(!0),setTimeout(()=>b(!1),2e3)},W=async(O,oe)=>{if(oe.stopPropagation(),!!confirm("Deseja realmente remover esta arte da galeria?"))try{(await(await fetch(`/api/museum/art/${O}`,{method:"DELETE",headers:{"x-admin-token":_}})).json()).success?((m==null?void 0:m.id)===O&&d(null),H(r)):alert("Falha ao remover arte.")}catch{alert("Erro na requisição.")}},$=async()=>{if(w)try{(await(await fetch(`/api/museum/art/${w.id}`,{method:"PATCH",headers:{"Content-Type":"application/json","x-admin-token":_},body:JSON.stringify({description:E})})).json()).success?(N(null),H(r)):alert("Falha ao atualizar descrição.")}catch{alert("Erro na requisição.")}},D=O=>{O.preventDefault(),F(!0)},J=O=>{var Te;const oe=(Te=window.getSelection())==null?void 0:Te.toString();if(oe&&oe.length>3){O.preventDefault();const G=`${oe}

Fonte: Galeria Oficial da Comunidade Pyxie (https://pyxie.com.br/)`;O.clipboardData&&O.clipboardData.setData("text/plain",G)}};return c.jsxs("div",{onCopy:J,className:"min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10",children:[c.jsxs("div",{className:"text-center space-y-4 max-w-3xl mx-auto pt-2",children:[c.jsxs("div",{className:"inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-bold shadow-sm",children:[c.jsx(Lt,{className:"w-3.5 h-3.5 text-pink-400"}),c.jsx("span",{children:t("museum.badge")})]}),c.jsx("h1",{className:"font-title font-black text-3xl sm:text-5xl md:text-6xl bg-gradient-to-r from-white via-pink-200 to-purple-300 bg-clip-text text-transparent tracking-tight",children:t("museum.title")}),c.jsx("p",{className:"text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto",children:t("museum.subtitle")})]}),c.jsxs("div",{className:"flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-purple-500/20",children:[c.jsxs("div",{className:"relative w-full md:w-80 flex items-center",children:[c.jsx(zh,{className:"absolute left-3.5 w-4 h-4 text-slate-400"}),c.jsx("input",{type:"text",value:h,onChange:O=>p(O.target.value),placeholder:"Buscar por obra ou artista...",className:"w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-purple-500/20 text-xs text-white placeholder-slate-400 outline-none focus:border-pink-500 transition-colors"}),h&&c.jsx("button",{onClick:()=>p(""),className:"absolute right-3 text-slate-400 hover:text-white",children:c.jsx(bs,{className:"w-3.5 h-3.5"})})]}),c.jsxs("div",{className:"flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-purple-500/20",children:[c.jsxs("button",{onClick:()=>x("grid"),className:`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${f==="grid"?"bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-sm":"text-slate-400 hover:text-white"}`,children:[c.jsx(Iy,{className:"w-3.5 h-3.5"}),c.jsx("span",{children:"Mural Grid"})]}),c.jsxs("button",{onClick:()=>x("forum"),className:`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${f==="forum"?"bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-sm":"text-slate-400 hover:text-white"}`,children:[c.jsx(zy,{className:"w-3.5 h-3.5"}),c.jsx("span",{children:"Modo Fórum"})]})]})]}),V.length>0&&c.jsxs("div",{className:"flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none",children:[c.jsx("button",{onClick:()=>u(""),className:`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${l?"bg-white/5 border border-purple-500/20 text-slate-300 hover:bg-white/10":"bg-pink-600 text-white shadow-neon-pink"}`,children:"Todos os Artistas"}),V.map(({userId:O,name:oe})=>c.jsxs("button",{onClick:()=>u(l===O?"":O),className:`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${l===O?"bg-pink-600 text-white shadow-neon-pink":"bg-white/5 border border-purple-500/20 text-slate-300 hover:bg-white/10"}`,children:[c.jsx(Kg,{className:"w-3 h-3 text-purple-400"}),c.jsxs("span",{children:["@",oe]})]},O))]}),q.length>0?f==="grid"?c.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6",children:q.map(O=>c.jsxs("div",{onClick:()=>{d(O),v(1)},className:"group relative rounded-2xl glass-panel border border-purple-500/20 hover:border-pink-500/50 overflow-hidden cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-neon-pink flex flex-col justify-between",children:[c.jsxs("div",{onContextMenu:D,className:"relative aspect-square overflow-hidden bg-black/40 select-none art-shield",children:[c.jsx("img",{src:O.imageUrl||`/api/museum/art-image/${O.id}`,alt:`Arte por ${lr(O)} no Museu da Pyxie • Visite https://pyxie.com.br/`,"data-canonical-url":"https://pyxie.com.br/",loading:"lazy",className:"w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"}),c.jsx("div",{className:"absolute inset-0 bg-gradient-to-t from-[#0e071a] via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity"}),c.jsx("button",{onClick:oe=>Q(O,oe),className:"absolute top-2.5 right-2.5 p-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110",title:"Compartilhar Obra",children:c.jsx(ga,{className:"w-3.5 h-3.5"})})]}),c.jsxs("div",{className:"p-4 space-y-2",children:[c.jsxs("div",{className:"flex items-center justify-between text-xs",children:[c.jsx("span",{className:"font-title font-bold text-pink-300 truncate max-w-[150px]",children:lr(O)}),c.jsx("span",{className:"text-[11px] font-mono text-slate-400",children:O.createdAt?new Date(O.createdAt).toLocaleDateString("pt-BR"):""})]}),O.description&&c.jsx("p",{className:"text-slate-300 text-xs line-clamp-2 leading-relaxed",children:O.description})]}),_&&c.jsxs("div",{className:"p-3 border-t border-purple-500/15 flex items-center justify-end gap-2 bg-black/30",children:[c.jsx("button",{onClick:oe=>{oe.stopPropagation(),N(O),A(O.description||"")},className:"p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-purple-300",children:c.jsx(By,{className:"w-3.5 h-3.5"})}),c.jsx("button",{onClick:oe=>W(O.id,oe),className:"p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300",children:c.jsx(Vy,{className:"w-3.5 h-3.5"})})]})]},O.id))}):c.jsx("div",{className:"space-y-6 max-w-4xl mx-auto",children:q.map(O=>c.jsxs("div",{className:"rounded-3xl glass-panel border border-purple-500/20 p-6 space-y-4 hover:border-pink-500/40 transition-colors",children:[c.jsxs("div",{className:"flex items-center justify-between border-b border-purple-500/15 pb-4",children:[c.jsxs("div",{className:"flex items-center gap-3",children:[c.jsx("div",{className:"w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 p-0.5 shadow-sm",children:c.jsx("div",{className:"w-full h-full rounded-full bg-[#0e071a] flex items-center justify-center text-pink-300 font-bold font-mono text-xs",children:ET(O)[0].toUpperCase()})}),c.jsxs("div",{children:[c.jsx("span",{className:"font-title font-bold text-white text-sm block",children:lr(O)}),c.jsxs("span",{className:"text-[11px] font-mono text-purple-300/70",children:["Publicado em ",O.createdAt?new Date(O.createdAt).toLocaleDateString("pt-BR"):"Data cósmica"]})]})]}),c.jsxs("button",{onClick:()=>Q(O),className:"p-2 rounded-xl bg-white/5 hover:bg-white/10 text-purple-300 flex items-center gap-1.5 text-xs font-semibold",children:[c.jsx(ga,{className:"w-3.5 h-3.5"}),c.jsx("span",{children:"Compartilhar"})]})]}),O.description&&c.jsx("p",{className:"text-slate-200 text-sm leading-relaxed",children:O.description}),c.jsx("div",{onContextMenu:D,onClick:()=>{d(O),v(1)},className:"rounded-2xl overflow-hidden bg-black/60 max-h-[500px] flex items-center justify-center cursor-pointer select-none art-shield border border-purple-500/15",children:c.jsx("img",{src:O.imageUrl||`/api/museum/art-image/${O.id}`,alt:`Arte por ${lr(O)} no Museu da Pyxie • Visite https://pyxie.com.br/`,"data-canonical-url":"https://pyxie.com.br/",loading:"lazy",className:"w-full h-full object-contain max-h-[500px] pointer-events-none"})})]},O.id))}):c.jsx("div",{className:"text-center py-24 text-slate-400 text-sm",children:"Nenhuma obra encontrada para esta pesquisa ou artista."}),a>1&&c.jsxs("div",{className:"flex items-center justify-center gap-3 pt-6",children:[c.jsx("button",{onClick:()=>H(r-1),disabled:r<=1,className:"p-2.5 rounded-xl bg-white/5 border border-purple-500/20 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10",children:c.jsx(Ay,{className:"w-4 h-4"})}),c.jsxs("span",{className:"font-mono text-xs text-slate-300",children:["Página ",r," de ",a]}),c.jsx("button",{onClick:()=>H(r+1),disabled:r>=a,className:"p-2.5 rounded-xl bg-white/5 border border-purple-500/20 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10",children:c.jsx(Xg,{className:"w-4 h-4"})})]}),m&&c.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in",onClick:()=>d(null),children:c.jsxs("div",{className:"relative max-w-5xl max-h-[92vh] w-full flex flex-col items-center justify-center",onClick:O=>O.stopPropagation(),children:[c.jsxs("div",{className:"w-full flex items-center justify-between mb-3 px-2 text-white",children:[c.jsxs("div",{className:"flex items-center gap-3",children:[c.jsx("span",{className:"font-title font-bold text-sm text-pink-300",children:lr(m)}),c.jsxs("span",{className:"text-xs font-mono text-slate-400",children:["ID: ",(ee=m.id)==null?void 0:ee.slice(0,10),"..."]})]}),c.jsxs("div",{className:"flex items-center gap-2",children:[c.jsx("button",{onClick:()=>v(O=>Math.min(O+.25,2.5)),className:"p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white",title:"Aumentar Zoom",children:c.jsx($y,{className:"w-4 h-4"})}),c.jsx("button",{onClick:()=>v(O=>Math.max(O-.25,.75)),className:"p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white",title:"Diminuir Zoom",children:c.jsx(Ky,{className:"w-4 h-4"})}),c.jsxs("button",{onClick:O=>Q(m,O),className:"px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 text-xs font-bold",title:"Copiar Link",children:[y?c.jsx(ka,{className:"w-4 h-4 text-emerald-400"}):c.jsx(ga,{className:"w-4 h-4"}),c.jsx("span",{children:y?"Copiado!":"Compartilhar"})]}),c.jsx("button",{onClick:()=>d(null),className:"p-2 rounded-xl bg-white/10 hover:bg-rose-600 text-white ml-2 transition-colors",title:"Fechar (ESC)",children:c.jsx(bs,{className:"w-4 h-4"})})]})]}),c.jsxs("div",{onContextMenu:D,className:"relative max-h-[75vh] max-w-full overflow-hidden rounded-2xl select-none art-shield flex items-center justify-center bg-black/50 p-2 group",children:[c.jsx("img",{src:m.imageUrl||`/api/museum/art-image/${m.id}`,alt:`Arte por ${lr(m)} no Museu da Pyxie • Visite https://pyxie.com.br/`,"data-canonical-url":"https://pyxie.com.br/",style:{transform:`scale(${g})`,transition:"transform 0.2s ease-out"},className:"max-h-[72vh] max-w-full object-contain pointer-events-none rounded-lg"}),c.jsxs("div",{className:"absolute inset-x-0 bottom-0 py-2.5 px-4 bg-black/85 backdrop-blur-md border-t border-pink-500/40 flex items-center justify-between text-xs font-mono tracking-wide z-20 select-none pointer-events-none",children:[c.jsxs("span",{className:"text-white font-bold truncate",children:[c.jsx("span",{className:"text-pink-400 font-extrabold mr-1.5",children:"✦"}),"pyxie.com.br • ",lr(m)]}),c.jsx("span",{className:"text-purple-300/80 text-[11px] shrink-0 ml-2 hidden sm:inline",children:"Galeria Oficial da Comunidade"})]})]}),m.description&&c.jsxs("p",{className:"mt-4 text-center text-slate-300 text-sm max-w-2xl px-4",children:['"',m.description,'"']})]})}),w&&c.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md",children:c.jsxs("div",{className:"bg-[#0e071a] border border-purple-500/30 rounded-2xl p-6 w-full max-w-md space-y-4",children:[c.jsx("h3",{className:"font-title font-bold text-white text-lg",children:"Editar Descrição"}),c.jsx("textarea",{value:E,onChange:O=>A(O.target.value),className:"w-full h-32 p-3 rounded-xl bg-white/5 border border-purple-500/25 text-white text-sm outline-none focus:border-pink-500",placeholder:"Digite a nova descrição da obra..."}),c.jsxs("div",{className:"flex justify-end gap-2",children:[c.jsx("button",{onClick:()=>N(null),className:"px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-bold",children:"Cancelar"}),c.jsx("button",{onClick:$,className:"px-4 py-2 rounded-xl bg-pink-600 text-white text-xs font-bold shadow-neon-pink",children:"Salvar Alterações"})]})]})}),R&&c.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md",onClick:()=>F(!1),children:c.jsxs("div",{className:"bg-[#0e071a] border border-pink-500/40 rounded-3xl p-6 max-w-md text-center space-y-4 shadow-neon-pink",onClick:O=>O.stopPropagation(),children:[c.jsx("div",{className:"w-12 h-12 mx-auto rounded-full bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400",children:c.jsx(Yg,{className:"w-6 h-6"})}),c.jsx("h4",{className:"font-title font-bold text-white text-lg",children:"Proteção de Autoria"}),c.jsx("p",{className:"text-xs text-slate-300 leading-relaxed",children:t("museum.artShield")||"Esta obra foi criada com amor por um membro da nossa comunidade. O download direto é bloqueado para proteger a autoria do artista. Compartilhe o link do museu!"}),c.jsx("button",{onClick:()=>F(!1),className:"w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold shadow-neon-pink",children:"Compreendido ✨"})]})})]})}function TT({t,lang:e}){const[n,i]=le.useState(10),[r,s]=le.useState(!1),[a,o]=le.useState(!1),[l,u]=le.useState(null),[h,p]=le.useState(!1),[f,x]=le.useState(!0),_=le.useRef(null),m=new URLSearchParams(window.location.search).get("token")||"",d=()=>{if(f)try{const R=new(window.AudioContext||window.webkitAudioContext),F=R.createOscillator(),y=R.createGain();F.type="sine",F.frequency.setValueAtTime(587.33,R.currentTime),F.frequency.exponentialRampToValueAtTime(880,R.currentTime+.3),y.gain.setValueAtTime(.18,R.currentTime),y.gain.exponentialRampToValueAtTime(.001,R.currentTime+.5),F.connect(y),y.connect(R.destination),F.start(),F.stop(R.currentTime+.5)}catch{}};le.useEffect(()=>{if(n>0){const R=setTimeout(()=>{i(F=>F-1)},1e3);return()=>clearTimeout(R)}else s(!0),d(),g()},[n]);const g=()=>{var Q,W;const R=_.current;if(!R)return;const F=R.getContext("2d"),y=R.width=((Q=R.parentElement)==null?void 0:Q.clientWidth)||300,b=R.height=((W=R.parentElement)==null?void 0:W.clientHeight)||300,H=Array.from({length:40},()=>({x:y/2,y:b/2,vx:(Math.random()-.5)*8,vy:(Math.random()-.5)*8-2,radius:Math.random()*3+2,color:["#f472b6","#c084fc","#38bdf8","#fbbf24","#34d399"][Math.floor(Math.random()*5)],alpha:1}));let V=0;function q(){F.clearRect(0,0,y,b),H.forEach($=>{$.x+=$.vx,$.y+=$.vy,$.alpha-=.02,F.beginPath(),F.arc($.x,$.y,$.radius,0,Math.PI*2),F.fillStyle=$.color,F.globalAlpha=Math.max(0,$.alpha),F.fill()}),V++,V<60?requestAnimationFrame(q):F.clearRect(0,0,y,b)}q()},v=()=>a?"Moedinhas entregues no seu cofre com sucesso! Volte amanhã para mais! 🎉":n>7?"Canalizando a energia estelar do seu cofre mágico... ⚡":n>3?"Quase lá! As moedas estão brilhando na penumbra cósmica... ✨":n>0?"Sintonização quase concluída! Prepare seu cofre! 🌟":"Energia cósmica pronta! Clique no botão abaixo para resgatar! 🎁",w=async()=>{if(!m){alert("Token de bônus não informado na URL. Abra o link gerado pelo comando /py-bonus no Discord.");return}p(!0);try{const F=await(await fetch("/api/bonus/claim",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:m})})).json();p(!1),F&&F.success?(o(!0),u(F),d()):alert(F.error||"Falha ao reivindicar bônus.")}catch{p(!1),alert("Erro na requisição com o servidor.")}},N=54,E=2*Math.PI*N,A=E-(10-n)/10*E;return c.jsxs("div",{className:"min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12",children:[c.jsxs("div",{className:"text-center space-y-3",children:[c.jsxs("div",{className:"inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-bold shadow-sm",children:[c.jsx(Lt,{className:"w-3.5 h-3.5 text-pink-400"}),c.jsx("span",{children:"Canalização de Recompensas Cósmicas"})]}),c.jsx("h1",{className:"font-title font-black text-3xl sm:text-5xl text-white tracking-tight",children:t("bonus.title")}),c.jsx("p",{className:"text-slate-300 text-sm sm:text-base max-w-xl mx-auto",children:t("bonus.subtitle")})]}),c.jsxs("div",{className:"max-w-2xl mx-auto relative rounded-3xl glass-panel border border-purple-500/30 p-8 sm:p-10 shadow-2xl flex flex-col items-center text-center space-y-8 overflow-hidden",children:[c.jsx("canvas",{ref:_,className:"absolute inset-0 pointer-events-none z-20"}),c.jsx("button",{onClick:()=>x(!f),className:"absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors z-30",title:f?"Silenciar Áudio":"Ativar Efeitos Sonoros",children:f?c.jsx(Xy,{className:"w-4 h-4 text-pink-400"}):c.jsx(qy,{className:"w-4 h-4"})}),c.jsxs("div",{className:"flex flex-col sm:flex-row items-center gap-4 relative z-10 max-w-lg",children:[c.jsx("div",{className:"relative w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-pink-500 to-purple-600 shadow-neon-pink flex-shrink-0 animate-bounce-slow",children:c.jsx("img",{src:"/assets/pyxie/pyxie_mascot.png",alt:"Mascote Pyxie",className:"w-full h-full object-contain rounded-full bg-[#0e071a] p-1.5"})}),c.jsxs("div",{className:"relative p-3.5 rounded-2xl bg-white/10 border border-purple-500/30 text-xs sm:text-sm text-slate-100 font-medium text-left shadow-lg",children:[v(),c.jsx("div",{className:"hidden sm:block absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-white/10 border-l border-b border-purple-500/30 rotate-45"})]})]}),c.jsxs("div",{className:"relative w-44 h-44 flex items-center justify-center z-10",children:[c.jsxs("svg",{className:"w-full h-full transform -rotate-90",children:[c.jsx("circle",{cx:"88",cy:"88",r:N,stroke:"rgba(255, 255, 255, 0.08)",strokeWidth:"10",fill:"transparent"}),c.jsx("circle",{cx:"88",cy:"88",r:N,stroke:"url(#gradient-ring)",strokeWidth:"10",fill:"transparent",strokeDasharray:E,strokeDashoffset:A,strokeLinecap:"round",className:"transition-all duration-1000 ease-linear"}),c.jsx("defs",{children:c.jsxs("linearGradient",{id:"gradient-ring",x1:"0%",y1:"0%",x2:"100%",y2:"100%",children:[c.jsx("stop",{offset:"0%",stopColor:"#f43f5e"}),c.jsx("stop",{offset:"50%",stopColor:"#ec4899"}),c.jsx("stop",{offset:"100%",stopColor:"#8b5cf6"})]})})]}),c.jsxs("div",{className:"absolute inset-0 flex flex-col items-center justify-center font-title",children:[a?c.jsx(Qu,{className:"w-12 h-12 text-emerald-400 animate-pulse"}):r?c.jsx(Lt,{className:"w-12 h-12 text-pink-400 animate-spin-slow"}):c.jsxs("span",{className:"font-black text-4xl sm:text-5xl text-white tracking-tighter",children:[n,"s"]}),c.jsx("span",{className:"text-[11px] font-mono text-purple-300/80 uppercase tracking-widest mt-1",children:a?"Resgatado":r?"Pronto!":"Canalizando"})]})]}),c.jsxs("div",{className:"w-full max-w-sm space-y-3 z-10",children:[!m&&c.jsxs("div",{className:"p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 text-left",children:[c.jsx(Cy,{className:"w-4 h-4 flex-shrink-0"}),c.jsxs("span",{children:["Abra o link enviado pelo comando ",c.jsx("strong",{children:"/py-bonus"})," no Discord para validar seu token."]})]}),a?c.jsxs("div",{className:"p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold text-sm flex items-center justify-center gap-2",children:[c.jsx(Qu,{className:"w-5 h-5 text-emerald-400"}),c.jsx("span",{children:t("bonus.claimed")})]}):c.jsxs("button",{onClick:w,disabled:!r||h||!m,className:`w-full py-4 rounded-2xl font-title font-black text-sm tracking-wide transition-all transform flex items-center justify-center gap-2 ${r&&m?"bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-neon-pink hover:scale-102 cursor-pointer":"bg-white/5 border border-purple-500/20 text-slate-500 cursor-not-allowed opacity-60"}`,children:[c.jsx(ed,{className:"w-4 h-4"}),c.jsx("span",{children:h?"Creditando no cofre...":r?t("bonus.claim"):`Aguarde ${n}s para liberar ✨`})]})]})]}),c.jsx(Nx,{t,lang:e})]})}function AT({t,lang:e,userId:n}){const[i,r]=le.useState(null),[s,a]=le.useState([]),[o,l]=le.useState(null),[u,h]=le.useState("tarot"),[p,f]=le.useState(!1),[x,_]=le.useState(!0),S=n||window.location.pathname.split("/u/")[1]||"";le.useEffect(()=>{S&&(_(!0),fetch(`/api/profile/${S}`).then(E=>E.json()).then(E=>{E&&E.success&&r(E),_(!1)}).catch(E=>{console.error("Erro ao buscar perfil:",E),_(!1)}))},[S]),le.useEffect(()=>{fetch("/api/tarot/cards").then(E=>E.json()).then(E=>{E&&E.success&&Array.isArray(E.cards)&&a(E.cards)}).catch(E=>console.error("Erro ao buscar cartas:",E))},[]);const m=()=>{const E=window.location.href;navigator.share?navigator.share({title:"Perfil de Membro da Pyxie",text:"Confira minha coleção de Tarot e status na Pyxie!",url:E}).catch(()=>{}):(navigator.clipboard.writeText(E),f(!0),setTimeout(()=>f(!1),2e3))};if(x)return c.jsxs("div",{className:"min-h-screen flex items-center justify-center text-slate-400 font-mono text-sm",children:[c.jsx(Lt,{className:"w-5 h-5 text-pink-400 animate-spin mr-2"}),c.jsx("span",{children:"Sintonizando perfil cósmico..."})]});if(!i)return c.jsxs("div",{className:"min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4",children:[c.jsx("div",{className:"w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400",children:c.jsx(Kg,{className:"w-8 h-8"})}),c.jsx("h2",{className:"font-title font-bold text-2xl text-white",children:"Perfil Não Encontrado"}),c.jsxs("p",{className:"text-slate-400 text-sm max-w-md",children:["Nenhum registro cósmico associado ao ID ",S," foi localizado no banco de dados."]}),c.jsx("a",{href:"/",className:"px-6 py-2.5 rounded-xl bg-pink-600 text-white font-bold text-xs shadow-neon-pink",children:"Voltar para o Início"})]});const{account:d,marriage:g,tarot:v,achievements:w}=i,N=new Set(v.discoveredCards||[]);return c.jsxs("div",{className:"min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10",children:[c.jsxs("div",{className:"relative rounded-3xl glass-panel border border-purple-500/30 p-6 sm:p-10 shadow-2xl overflow-hidden",children:[c.jsx("div",{className:"absolute top-0 right-0 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"}),c.jsxs("div",{className:"flex flex-col md:flex-row items-center justify-between gap-6 relative z-10",children:[c.jsxs("div",{className:"flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left",children:[c.jsxs("div",{className:"relative w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-pink-500 via-purple-600 to-cyan-400 shadow-neon-pink flex-shrink-0",children:[c.jsx("img",{src:"/assets/pyxie/pyxie_mascot.png",alt:"Avatar",className:"w-full h-full object-cover rounded-full bg-[#0e071a]"}),c.jsx("span",{className:"absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-400 border-2 border-[#0e071a] flex items-center justify-center text-[10px] text-black font-bold",children:"✓"})]}),c.jsxs("div",{className:"space-y-1.5",children:[c.jsxs("div",{className:"flex flex-wrap items-center justify-center sm:justify-start gap-2",children:[c.jsxs("h1",{className:"font-title font-black text-2xl sm:text-3xl text-white",children:["Membro (",S.slice(-4),")"]}),d.activeTitle&&c.jsxs("span",{className:"px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold",children:["👑 ",d.activeTitle]})]}),c.jsxs("div",{className:"flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-300",children:[c.jsxs("span",{className:"flex items-center gap-1 text-pink-300",children:[c.jsx(Ju,{className:"w-3.5 h-3.5"}),c.jsxs("span",{children:["Profissão: ",d.profession||"Aventureiro Místico"]})]}),c.jsx("span",{children:"•"}),c.jsxs("span",{className:"flex items-center gap-1 text-amber-300",children:[c.jsx(Es,{className:"w-3.5 h-3.5"}),c.jsxs("span",{children:[d.balance.toLocaleString("pt-BR")," Moedas"]})]}),d.dailyStreak>0&&c.jsxs(c.Fragment,{children:[c.jsx("span",{children:"•"}),c.jsxs("span",{className:"text-orange-400 font-bold",children:["🔥 ",d.dailyStreak," dias"]})]})]})]})]}),c.jsxs("button",{onClick:m,className:"px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-purple-500/30 text-white font-title font-bold text-xs flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg",children:[p?c.jsx(ka,{className:"w-4 h-4 text-emerald-400"}):c.jsx(ga,{className:"w-4 h-4 text-pink-400"}),c.jsx("span",{children:p?"Link Copiado! 🔗":"Compartilhar Perfil"})]})]}),g&&g.isMarried&&c.jsxs("div",{className:"mt-8 pt-6 border-t border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 bg-pink-500/5 p-4 rounded-2xl",children:[c.jsxs("div",{className:"flex items-center gap-3",children:[c.jsx("div",{className:"w-10 h-10 rounded-full bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400",children:c.jsx(vr,{className:"w-5 h-5 fill-pink-500"})}),c.jsxs("div",{children:[c.jsx("span",{className:"font-title font-bold text-sm text-white block",children:"Laço Matrimonial Ativo"}),c.jsxs("span",{className:"text-xs text-purple-300/80",children:["Árvore da Vida: Nível ",g.treeLevel," • Cofre: ",g.vaultCoins," 🪙"]})]})]}),c.jsxs("div",{className:"w-full sm:w-60 space-y-1",children:[c.jsxs("div",{className:"flex justify-between text-[11px] font-mono text-pink-300 font-bold",children:[c.jsx("span",{children:"Barra do Amor"}),c.jsxs("span",{children:[g.love,"%"]})]}),c.jsx("div",{className:"w-full h-2 rounded-full bg-white/10 overflow-hidden",children:c.jsx("div",{className:"h-full bg-gradient-to-r from-pink-500 to-rose-400 rounded-full transition-all duration-1000 shadow-neon-pink",style:{width:`${Math.min(g.love,100)}%`}})})]})]})]}),c.jsxs("div",{className:"flex items-center justify-center gap-3",children:[c.jsxs("button",{onClick:()=>h("tarot"),className:`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${u==="tarot"?"bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-neon-pink":"bg-white/5 border border-purple-500/20 text-slate-300 hover:bg-white/10"}`,children:[c.jsx(Ms,{className:"w-4 h-4"}),c.jsxs("span",{children:["Álbum de Tarot (",v.discoveredCount,"/78)"]})]}),c.jsxs("button",{onClick:()=>h("achievements"),className:`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${u==="achievements"?"bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-neon-pink":"bg-white/5 border border-purple-500/20 text-slate-300 hover:bg-white/10"}`,children:[c.jsx(Wg,{className:"w-4 h-4"}),c.jsx("span",{children:"Conquistas Arcanas"})]})]}),u==="tarot"&&c.jsxs("section",{className:"space-y-6",children:[c.jsxs("div",{className:"flex items-center justify-between text-xs text-slate-400 px-2 font-mono",children:[c.jsxs("span",{children:["Progresso da Coleção: ",v.discoveredCount," de 78 cartas (",Math.round(v.discoveredCount/78*100),"%)"]}),c.jsx("span",{children:"Clique na carta para inspecionar"})]}),c.jsx("div",{className:"grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4",children:s.map((E,A)=>{const R=A+1,F=N.has(R);return c.jsxs("div",{onClick:()=>F&&l(E),className:`group relative rounded-2xl p-2.5 border transition-all duration-300 transform flex flex-col items-center justify-between aspect-[2/3] ${F?"bg-[#140a28]/80 border-purple-500/40 hover:border-pink-500 hover:shadow-neon-pink hover:-translate-y-1.5 cursor-pointer":"bg-black/40 border-white/5 opacity-50 cursor-not-allowed"}`,style:{perspective:"1000px"},children:[c.jsx("div",{className:"w-full h-full relative rounded-xl overflow-hidden flex items-center justify-center bg-black/60",children:F?c.jsx("img",{src:`/api/tarot/card-image?id=${E.id}`,alt:E.name,loading:"lazy",className:"w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform"}):c.jsxs("div",{className:"flex flex-col items-center justify-center p-3 text-center space-y-2 text-slate-500",children:[c.jsx(Uy,{className:"w-5 h-5 text-slate-600"}),c.jsxs("span",{className:"font-mono text-[10px] tracking-wider",children:["#",String(R).padStart(2,"0")]}),c.jsx("span",{className:"text-[9px] uppercase tracking-widest text-slate-600",children:"Bloqueado"})]})}),c.jsx("div",{className:"w-full pt-2 text-center",children:c.jsx("span",{className:`text-[11px] font-bold block truncate ${F?"text-white group-hover:text-pink-300":"text-slate-600"}`,children:F?E.name:"???"})})]},E.id||A)})})]}),u==="achievements"&&c.jsx("section",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:w.map(E=>c.jsxs("div",{className:`p-5 rounded-2xl border transition-all flex items-start gap-4 ${E.completed?"bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-pink-500/40":"bg-white/5 border-white/5 opacity-60"}`,children:[c.jsx("div",{className:`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${E.completed?"bg-pink-500/20 border border-pink-500/40 text-pink-400":"bg-white/5 text-slate-500"}`,children:E.completed?"🏆":"🔒"}),c.jsxs("div",{className:"space-y-1 min-w-0 flex-1",children:[c.jsxs("div",{className:"flex items-center justify-between",children:[c.jsx("h4",{className:"font-title font-bold text-sm text-white truncate",children:e==="en"?E.nameEn:E.namePt}),c.jsxs("span",{className:"text-[11px] font-mono text-amber-300 font-bold",children:["+",E.rewardCoins," 🪙"]})]}),c.jsx("p",{className:"text-xs text-slate-300 leading-relaxed",children:e==="en"?E.descEn:E.descPt}),c.jsxs("div",{className:"pt-2 flex items-center gap-2 text-[10px] font-mono text-slate-400",children:[c.jsx("div",{className:"flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden",children:c.jsx("div",{className:"h-full bg-pink-500 rounded-full",style:{width:`${Math.min(E.current/E.target*100,100)}%`}})}),c.jsxs("span",{children:[E.current,"/",E.target]})]})]})]},E.id))}),o&&c.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in",onClick:()=>l(null),children:c.jsxs("div",{className:"relative max-w-md w-full rounded-3xl bg-[#0e071a] border border-purple-500/40 p-6 shadow-2xl space-y-4",onClick:E=>E.stopPropagation(),children:[c.jsxs("div",{className:"flex items-center justify-between border-b border-purple-500/15 pb-3",children:[c.jsx("span",{className:"font-title font-bold text-lg text-white",children:o.name}),c.jsx("button",{onClick:()=>l(null),className:"p-1 rounded-lg text-slate-400 hover:text-white",children:"✕"})]}),c.jsx("div",{className:"aspect-[2/3] max-h-72 mx-auto rounded-xl overflow-hidden border border-purple-500/30",children:c.jsx("img",{src:`/api/tarot/card-image?id=${o.id}`,alt:o.name,className:"w-full h-full object-cover"})}),c.jsxs("div",{className:"space-y-2 text-xs text-slate-300",children:[c.jsxs("div",{children:[c.jsx("span",{className:"font-bold text-pink-300 block mb-0.5",children:"Significado Direto:"}),c.jsx("p",{className:"leading-relaxed",children:o.upright})]}),c.jsxs("div",{children:[c.jsx("span",{className:"font-bold text-purple-300 block mb-0.5",children:"Significado Invertido:"}),c.jsx("p",{className:"leading-relaxed",children:o.reversed})]})]})]})})]})}const Cm={pt:{"nav.features":"Recursos","nav.commands":"Comandos","nav.wiki":"Wiki Oficial","nav.museum":"Museu 3D","nav.bonus":"Bônus 10s","nav.support":"Servidor de Suporte","nav.invite":"Adicionar Pyxie","hero.badge":"Online & Operacional • Discord.js v14","hero.titlePrefix":"A Fada Companheira do seu","hero.titleHighlight":"Servidor Discord","hero.subtitle":"Economia Mágica com moedinhas e feijões, Tarot dos 78 Arcanos em Canvas HD, 16 Carreiras e Dinâmica Social imersiva no Discord.","hero.btnInvite":"Adicionar ao Discord","hero.btnSupport":"Servidor de Suporte","hero.badgeEconomy":"Economia Viva","hero.badgeCareers":"16 Carreiras & Vocações","hero.badgeUptime":"Uptime Permanente","terminal.tabWork":"/py-work (Expediente)","terminal.tabMarriage":"/py-casamento (Amor)","terminal.tabTarot":"/py-tarot (Oráculo)","terminal.workTitle":"💼 Expediente Profissional: Alquimista Místico","terminal.workDesc":"Você precisa misturar a essência da Rosa Arcana com pó estelar. Qual proporção você escolhe?","terminal.opt1":"1. Proporção Áurea (Equilíbrio)","terminal.opt2":"2. Sobrecarga Mística (Alto Risco)","terminal.opt3":"3. Destilação Serena (Conservador)","terminal.workResult":"✨ Sucesso Perfeito! A poção brilhou em néon rosa. +95 moedinhas e +15 XP de Alquimia!","terminal.marriageTitle":"💍 Status Matrimonial: Pyxie & Astaroth","terminal.loveBar":"Barra do Amor Eterno","terminal.loveTree":"🌳 Árvore da Vida: Nível 3 (+30% Amor / 12h)","terminal.loveVault":"🏦 Cofre do Casal: 12.450 moedas (Rendimento +5%/dia)","terminal.tarotTitle":"🔮 Tiragem do Dia: Os 78 Arcanos","terminal.tarotCard":"O Mago (The Magician)","terminal.tarotDesc":'"O poder da criação e transmutação está vivo em suas mãos hoje. Use a astúcia e a determinação para moldar seu destino."',"museum.badge":"Acervo Cultural da Comunidade","museum.title":"Globo das Artes Mágicas da Pyxie","museum.subtitle":"Globo 3D holográfico com projeção esférica das criações e artes da comunidade.","museum.exploreAll":"Explorar Galeria Completa da Comunidade ➔","museum.artShield":"🛡️ Obra protegida por direitos autorais da comunidade. Respeite os artistas!","museum.inspect":"Inspecionar Obra","museum.author":"Artista","museum.id":"ID da Peça","wiki.badge":"Enciclopédia Oficial • Pyxie & Cringelândia","wiki.title":"Guia Oficial & Enciclopédia Interativa","wiki.subtitle":"Explore lore, regras, economia viva, as 16 vocações, oráculo de tarot e comandos oficiais.","wiki.tabCommunity":"Comunidade & Acolhimento","wiki.tabEconomy":"Economia Mágica","wiki.tabCareers":"16 Vocações & Trabalho","wiki.tabTarot":"Tarot dos 78 Arcanos","wiki.tabMarriage":"Social & Família","wiki.tabCommands":"Catálogo de Comandos","wiki.tabFaq":"Dúvidas & FAQ","wiki.searchPlaceholder":"Pressione Ctrl+K ou digite para buscar comandos...","wiki.copied":"Copiado para a área de transferência!","wiki.copyBtn":"Copiar comando","shopee.title":"Achadinhos da Pyxie: Mimos de Setup & Papelaria","shopee.subtitle":"Curadoria exclusiva de pelúcias, iluminação RGB, papelaria gótica e mimos para seu quarto.","shopee.cta":"Ver na Shopee ➔","bonus.title":"Portal Encantado de Recompensas","bonus.subtitle":"Aguarde os 10 segundos mágicos de conexão cósmica para resgatar suas moedas diárias.","bonus.ready":"Bônus Pronto para Resgate!","bonus.claim":"Reivindicar Moedas Mágicas ✨","bonus.claimed":"🎉 Recompensa reivindicada com sucesso!","footer.rights":"Pyxie © 2026 • Feita com carinho para comunidades do mundo todo.","footer.terms":"Termos & Proteção a Menores","footer.wiki":"Wiki Oficial","footer.bonus":"Bônus Web","footer.museum":"Museu de Arte"},en:{"nav.features":"Features","nav.commands":"Commands","nav.wiki":"Official Wiki","nav.museum":"3D Museum","nav.bonus":"10s Bonus","nav.support":"Support Server","nav.invite":"Add Pyxie","hero.badge":"Online & Operational • Discord.js v14","hero.titlePrefix":"The Companion Fairy for Your","hero.titleHighlight":"Discord Server","hero.subtitle":"Living Economy with magic coins and beans, 78 Tarot Arcana in HD Canvas, 16 Careers, and immersive Social Dynamics on Discord.","hero.btnInvite":"Add to Discord","hero.btnSupport":"Support Server","hero.badgeEconomy":"Living Economy","hero.badgeCareers":"16 Unique Vocations","hero.badgeUptime":"Permanent Uptime","terminal.tabWork":"/py-work (Shift)","terminal.tabMarriage":"/py-casamento (Family)","terminal.tabTarot":"/py-tarot (Oracle)","terminal.workTitle":"💼 Career Shift: Mystic Alchemist","terminal.workDesc":"You need to blend Arcane Rose essence with stardust. Which ratio do you choose?","terminal.opt1":"1. Golden Ratio (Balance)","terminal.opt2":"2. Mystic Surge (High Risk)","terminal.opt3":"3. Serene Distillation (Safe)","terminal.workResult":"✨ Perfect Outcome! The potion flared in neon pink. +95 coins and +15 Alchemy XP!","terminal.marriageTitle":"💍 Marriage Status: Pyxie & Astaroth","terminal.loveBar":"Eternal Love Gauge","terminal.loveTree":"🌳 Tree of Life: Level 3 (+30% Love / 12h)","terminal.loveVault":"🏦 Love Vault: 12,450 coins (+5%/day interest)","terminal.tarotTitle":"🔮 Daily Card Draw: The 78 Arcana","terminal.tarotCard":"The Magician","terminal.tarotDesc":'"The power of creation and transmutation is alive in your hands today. Use wit and determination to shape reality."',"museum.badge":"Community Cultural Archive","museum.title":"Pyxie's Magical Art Globe","museum.subtitle":"3D holographic globe with spherical projection of community artwork.","museum.exploreAll":"Explore Full Community Gallery ➔","museum.artShield":"🛡️ Artwork protected by community copyright. Respect the creators!","museum.inspect":"Inspect Artwork","museum.author":"Artist","museum.id":"Piece ID","wiki.badge":"Official Encyclopedia • Pyxie & Cringelândia","wiki.title":"Official Guide & Interactive Encyclopedia","wiki.subtitle":"Explore lore, guidelines, live economy, 16 vocations, tarot oracle and official bot commands.","wiki.tabCommunity":"Community & Sanctuary","wiki.tabEconomy":"Living Economy","wiki.tabCareers":"16 Vocations & Work","wiki.tabTarot":"78 Arcana Tarot","wiki.tabMarriage":"Social & Marriage","wiki.tabCommands":"Commands Catalog","wiki.tabFaq":"Questions & FAQ","wiki.searchPlaceholder":"Press Ctrl+K or type to search commands...","wiki.copied":"Copied to clipboard!","wiki.copyBtn":"Copy command","shopee.title":"Pyxie's Finds: Cozy Setup & Stationery","shopee.subtitle":"Handpicked plushies, RGB ambiance, cyber-goth stationery and desk accessories.","shopee.cta":"Check on Shopee ➔","bonus.title":"Enchanted Reward Portal","bonus.subtitle":"Wait for the 10-second cosmic alignment to claim your daily coins.","bonus.ready":"Bonus Ready to Claim!","bonus.claim":"Claim Magic Coins ✨","bonus.claimed":"🎉 Reward claimed successfully!","footer.rights":"Pyxie © 2026 • Crafted with love for communities worldwide.","footer.terms":"Terms & Child Safety","footer.wiki":"Official Wiki","footer.bonus":"Web Bonus","footer.museum":"Art Museum"}};function CT(){const[t,e]=le.useState(()=>{const u=new URLSearchParams(window.location.search).get("lang");if(u==="pt"||u==="en")return u;const h=localStorage.getItem("pyxie_lang");return h==="pt"||h==="en"?h:navigator.language&&navigator.language.startsWith("en")?"en":"pt"}),[n,i]=le.useState({guilds:18,users:2450,uptime:"99.9%"}),r=l=>{var u,h;return((u=Cm[t])==null?void 0:u[l])||((h=Cm.pt)==null?void 0:h[l])||l};le.useEffect(()=>{const l=new _y({duration:1.2,easing:p=>Math.min(1,1.001-Math.pow(2,-10*p)),orientation:"vertical",gestureOrientation:"vertical",smoothWheel:!0,wheelMultiplier:1,touchMultiplier:2});function u(p){l.raf(p),requestAnimationFrame(u)}const h=requestAnimationFrame(u);return()=>{cancelAnimationFrame(h),l.destroy()}},[]),le.useEffect(()=>{fetch("/api/stats").then(l=>l.json()).then(l=>{l&&l.success&&i({guilds:l.guilds||18,users:l.users||2450,uptime:l.uptimeFormatted||"99.9%"})}).catch(()=>{fetch("/api/status").then(l=>l.json()).then(l=>{l&&l.online&&i(u=>({...u,guilds:l.guilds||u.guilds}))}).catch(()=>{})})},[]),le.useEffect(()=>{document.documentElement.lang=t==="pt"?"pt-BR":"en"},[t]);const s=window.location.pathname.toLowerCase();let a=wT,o="";if(s.includes("wiki"))a=MT;else if(s.includes("museu")||s.includes("museum"))a=bT;else if(s.includes("bonus"))a=TT;else if(s.startsWith("/u/")||s.includes("/u/")){a=AT;const l=window.location.pathname.split(/\/u\/?/i);l.length>1&&(o=l[1].split("/")[0])}return c.jsxs("div",{className:"bg-[#080410] text-slate-100 min-h-screen flex flex-col font-sans selection:bg-pink-500 selection:text-white relative overflow-x-hidden",children:[c.jsxs("div",{className:"fixed inset-0 pointer-events-none z-0 overflow-hidden",children:[c.jsx("div",{className:"absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[128px]"}),c.jsx("div",{className:"absolute top-[30%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px]"}),c.jsx("div",{className:"absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-[120px]"})]}),c.jsxs("div",{className:"relative z-10 flex flex-col min-h-screen",children:[c.jsx(Zy,{lang:t,setLang:e,t:r}),c.jsx("main",{className:"flex-1",children:c.jsx(a,{t:r,lang:t,stats:n,userId:o})}),c.jsx(Qy,{t:r})]})]})}const Rm=document.getElementById("pyxie-app")||document.getElementById("root");Rm?(window.__PYXIE_REACT_ACTIVE__=!0,su.createRoot(Rm).render(c.jsx(Jx.StrictMode,{children:c.jsx(CT,{})}))):console.warn("[Pyxie] Mounting container #pyxie-app or #root not found.");
