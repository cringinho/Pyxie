var Ax=Object.defineProperty;var Cx=(t,e,n)=>e in t?Ax(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n;var Se=(t,e,n)=>Cx(t,typeof e!="symbol"?e+"":e,n);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&i(a)}).observe(document,{childList:!0,subtree:!0});function n(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(r){if(r.ep)return;r.ep=!0;const s=n(r);fetch(r.href,s)}})();function Rx(t){return t&&t.__esModule&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}var Sm={exports:{}},El={},Mm={exports:{}},He={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Na=Symbol.for("react.element"),Nx=Symbol.for("react.portal"),Px=Symbol.for("react.fragment"),Lx=Symbol.for("react.strict_mode"),Dx=Symbol.for("react.profiler"),Ix=Symbol.for("react.provider"),Ux=Symbol.for("react.context"),kx=Symbol.for("react.forward_ref"),Fx=Symbol.for("react.suspense"),Ox=Symbol.for("react.memo"),zx=Symbol.for("react.lazy"),rh=Symbol.iterator;function Bx(t){return t===null||typeof t!="object"?null:(t=rh&&t[rh]||t["@@iterator"],typeof t=="function"?t:null)}var wm={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},Em=Object.assign,Tm={};function bs(t,e,n){this.props=t,this.context=e,this.refs=Tm,this.updater=n||wm}bs.prototype.isReactComponent={};bs.prototype.setState=function(t,e){if(typeof t!="object"&&typeof t!="function"&&t!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,t,e,"setState")};bs.prototype.forceUpdate=function(t){this.updater.enqueueForceUpdate(this,t,"forceUpdate")};function bm(){}bm.prototype=bs.prototype;function zd(t,e,n){this.props=t,this.context=e,this.refs=Tm,this.updater=n||wm}var Bd=zd.prototype=new bm;Bd.constructor=zd;Em(Bd,bs.prototype);Bd.isPureReactComponent=!0;var sh=Array.isArray,Am=Object.prototype.hasOwnProperty,Hd={current:null},Cm={key:!0,ref:!0,__self:!0,__source:!0};function Rm(t,e,n){var i,r={},s=null,a=null;if(e!=null)for(i in e.ref!==void 0&&(a=e.ref),e.key!==void 0&&(s=""+e.key),e)Am.call(e,i)&&!Cm.hasOwnProperty(i)&&(r[i]=e[i]);var o=arguments.length-2;if(o===1)r.children=n;else if(1<o){for(var l=Array(o),c=0;c<o;c++)l[c]=arguments[c+2];r.children=l}if(t&&t.defaultProps)for(i in o=t.defaultProps,o)r[i]===void 0&&(r[i]=o[i]);return{$$typeof:Na,type:t,key:s,ref:a,props:r,_owner:Hd.current}}function Hx(t,e){return{$$typeof:Na,type:t.type,key:e,ref:t.ref,props:t.props,_owner:t._owner}}function Vd(t){return typeof t=="object"&&t!==null&&t.$$typeof===Na}function Vx(t){var e={"=":"=0",":":"=2"};return"$"+t.replace(/[=:]/g,function(n){return e[n]})}var ah=/\/+/g;function $l(t,e){return typeof t=="object"&&t!==null&&t.key!=null?Vx(""+t.key):e.toString(36)}function No(t,e,n,i,r){var s=typeof t;(s==="undefined"||s==="boolean")&&(t=null);var a=!1;if(t===null)a=!0;else switch(s){case"string":case"number":a=!0;break;case"object":switch(t.$$typeof){case Na:case Nx:a=!0}}if(a)return a=t,r=r(a),t=i===""?"."+$l(a,0):i,sh(r)?(n="",t!=null&&(n=t.replace(ah,"$&/")+"/"),No(r,e,n,"",function(c){return c})):r!=null&&(Vd(r)&&(r=Hx(r,n+(!r.key||a&&a.key===r.key?"":(""+r.key).replace(ah,"$&/")+"/")+t)),e.push(r)),1;if(a=0,i=i===""?".":i+":",sh(t))for(var o=0;o<t.length;o++){s=t[o];var l=i+$l(s,o);a+=No(s,e,n,l,r)}else if(l=Bx(t),typeof l=="function")for(t=l.call(t),o=0;!(s=t.next()).done;)s=s.value,l=i+$l(s,o++),a+=No(s,e,n,l,r);else if(s==="object")throw e=String(t),Error("Objects are not valid as a React child (found: "+(e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)+"). If you meant to render a collection of children, use an array instead.");return a}function ja(t,e,n){if(t==null)return t;var i=[],r=0;return No(t,i,"","",function(s){return e.call(n,s,r++)}),i}function jx(t){if(t._status===-1){var e=t._result;e=e(),e.then(function(n){(t._status===0||t._status===-1)&&(t._status=1,t._result=n)},function(n){(t._status===0||t._status===-1)&&(t._status=2,t._result=n)}),t._status===-1&&(t._status=0,t._result=e)}if(t._status===1)return t._result.default;throw t._result}var Xt={current:null},Po={transition:null},Gx={ReactCurrentDispatcher:Xt,ReactCurrentBatchConfig:Po,ReactCurrentOwner:Hd};function Nm(){throw Error("act(...) is not supported in production builds of React.")}He.Children={map:ja,forEach:function(t,e,n){ja(t,function(){e.apply(this,arguments)},n)},count:function(t){var e=0;return ja(t,function(){e++}),e},toArray:function(t){return ja(t,function(e){return e})||[]},only:function(t){if(!Vd(t))throw Error("React.Children.only expected to receive a single React element child.");return t}};He.Component=bs;He.Fragment=Px;He.Profiler=Dx;He.PureComponent=zd;He.StrictMode=Lx;He.Suspense=Fx;He.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=Gx;He.act=Nm;He.cloneElement=function(t,e,n){if(t==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+t+".");var i=Em({},t.props),r=t.key,s=t.ref,a=t._owner;if(e!=null){if(e.ref!==void 0&&(s=e.ref,a=Hd.current),e.key!==void 0&&(r=""+e.key),t.type&&t.type.defaultProps)var o=t.type.defaultProps;for(l in e)Am.call(e,l)&&!Cm.hasOwnProperty(l)&&(i[l]=e[l]===void 0&&o!==void 0?o[l]:e[l])}var l=arguments.length-2;if(l===1)i.children=n;else if(1<l){o=Array(l);for(var c=0;c<l;c++)o[c]=arguments[c+2];i.children=o}return{$$typeof:Na,type:t.type,key:r,ref:s,props:i,_owner:a}};He.createContext=function(t){return t={$$typeof:Ux,_currentValue:t,_currentValue2:t,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},t.Provider={$$typeof:Ix,_context:t},t.Consumer=t};He.createElement=Rm;He.createFactory=function(t){var e=Rm.bind(null,t);return e.type=t,e};He.createRef=function(){return{current:null}};He.forwardRef=function(t){return{$$typeof:kx,render:t}};He.isValidElement=Vd;He.lazy=function(t){return{$$typeof:zx,_payload:{_status:-1,_result:t},_init:jx}};He.memo=function(t,e){return{$$typeof:Ox,type:t,compare:e===void 0?null:e}};He.startTransition=function(t){var e=Po.transition;Po.transition={};try{t()}finally{Po.transition=e}};He.unstable_act=Nm;He.useCallback=function(t,e){return Xt.current.useCallback(t,e)};He.useContext=function(t){return Xt.current.useContext(t)};He.useDebugValue=function(){};He.useDeferredValue=function(t){return Xt.current.useDeferredValue(t)};He.useEffect=function(t,e){return Xt.current.useEffect(t,e)};He.useId=function(){return Xt.current.useId()};He.useImperativeHandle=function(t,e,n){return Xt.current.useImperativeHandle(t,e,n)};He.useInsertionEffect=function(t,e){return Xt.current.useInsertionEffect(t,e)};He.useLayoutEffect=function(t,e){return Xt.current.useLayoutEffect(t,e)};He.useMemo=function(t,e){return Xt.current.useMemo(t,e)};He.useReducer=function(t,e,n){return Xt.current.useReducer(t,e,n)};He.useRef=function(t){return Xt.current.useRef(t)};He.useState=function(t){return Xt.current.useState(t)};He.useSyncExternalStore=function(t,e,n){return Xt.current.useSyncExternalStore(t,e,n)};He.useTransition=function(){return Xt.current.useTransition()};He.version="18.3.1";Mm.exports=He;var ae=Mm.exports;const Wx=Rx(ae);/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Xx=ae,qx=Symbol.for("react.element"),Yx=Symbol.for("react.fragment"),$x=Object.prototype.hasOwnProperty,Kx=Xx.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,Zx={key:!0,ref:!0,__self:!0,__source:!0};function Pm(t,e,n){var i,r={},s=null,a=null;n!==void 0&&(s=""+n),e.key!==void 0&&(s=""+e.key),e.ref!==void 0&&(a=e.ref);for(i in e)$x.call(e,i)&&!Zx.hasOwnProperty(i)&&(r[i]=e[i]);if(t&&t.defaultProps)for(i in e=t.defaultProps,e)r[i]===void 0&&(r[i]=e[i]);return{$$typeof:qx,type:t,key:s,ref:a,props:r,_owner:Kx.current}}El.Fragment=Yx;El.jsx=Pm;El.jsxs=Pm;Sm.exports=El;var f=Sm.exports,eu={},Lm={exports:{}},mn={},Dm={exports:{}},Im={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */(function(t){function e(L,K){var U=L.length;L.push(K);e:for(;0<U;){var $=U-1>>>1,ge=L[$];if(0<r(ge,K))L[$]=K,L[U]=ge,U=$;else break e}}function n(L){return L.length===0?null:L[0]}function i(L){if(L.length===0)return null;var K=L[0],U=L.pop();if(U!==K){L[0]=U;e:for(var $=0,ge=L.length,be=ge>>>1;$<be;){var X=2*($+1)-1,te=L[X],le=X+1,ce=L[le];if(0>r(te,U))le<ge&&0>r(ce,te)?(L[$]=ce,L[le]=U,$=le):(L[$]=te,L[X]=U,$=X);else if(le<ge&&0>r(ce,U))L[$]=ce,L[le]=U,$=le;else break e}}return K}function r(L,K){var U=L.sortIndex-K.sortIndex;return U!==0?U:L.id-K.id}if(typeof performance=="object"&&typeof performance.now=="function"){var s=performance;t.unstable_now=function(){return s.now()}}else{var a=Date,o=a.now();t.unstable_now=function(){return a.now()-o}}var l=[],c=[],d=1,p=null,h=3,g=!1,v=!1,S=!1,m=typeof setTimeout=="function"?setTimeout:null,u=typeof clearTimeout=="function"?clearTimeout:null,_=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function x(L){for(var K=n(c);K!==null;){if(K.callback===null)i(c);else if(K.startTime<=L)i(c),K.sortIndex=K.expirationTime,e(l,K);else break;K=n(c)}}function w(L){if(S=!1,x(L),!v)if(n(l)!==null)v=!0,G(P);else{var K=n(c);K!==null&&Y(w,K.startTime-L)}}function P(L,K){v=!1,S&&(S=!1,u(N),N=-1),g=!0;var U=h;try{for(x(K),p=n(l);p!==null&&(!(p.expirationTime>K)||L&&!T());){var $=p.callback;if(typeof $=="function"){p.callback=null,h=p.priorityLevel;var ge=$(p.expirationTime<=K);K=t.unstable_now(),typeof ge=="function"?p.callback=ge:p===n(l)&&i(l),x(K)}else i(l);p=n(l)}if(p!==null)var be=!0;else{var X=n(c);X!==null&&Y(w,X.startTime-K),be=!1}return be}finally{p=null,h=U,g=!1}}var b=!1,A=null,N=-1,V=5,y=-1;function T(){return!(t.unstable_now()-y<V)}function j(){if(A!==null){var L=t.unstable_now();y=L;var K=!0;try{K=A(!0,L)}finally{K?H():(b=!1,A=null)}}else b=!1}var H;if(typeof _=="function")H=function(){_(j)};else if(typeof MessageChannel<"u"){var q=new MessageChannel,Q=q.port2;q.port1.onmessage=j,H=function(){Q.postMessage(null)}}else H=function(){m(j,0)};function G(L){A=L,b||(b=!0,H())}function Y(L,K){N=m(function(){L(t.unstable_now())},K)}t.unstable_IdlePriority=5,t.unstable_ImmediatePriority=1,t.unstable_LowPriority=4,t.unstable_NormalPriority=3,t.unstable_Profiling=null,t.unstable_UserBlockingPriority=2,t.unstable_cancelCallback=function(L){L.callback=null},t.unstable_continueExecution=function(){v||g||(v=!0,G(P))},t.unstable_forceFrameRate=function(L){0>L||125<L?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):V=0<L?Math.floor(1e3/L):5},t.unstable_getCurrentPriorityLevel=function(){return h},t.unstable_getFirstCallbackNode=function(){return n(l)},t.unstable_next=function(L){switch(h){case 1:case 2:case 3:var K=3;break;default:K=h}var U=h;h=K;try{return L()}finally{h=U}},t.unstable_pauseExecution=function(){},t.unstable_requestPaint=function(){},t.unstable_runWithPriority=function(L,K){switch(L){case 1:case 2:case 3:case 4:case 5:break;default:L=3}var U=h;h=L;try{return K()}finally{h=U}},t.unstable_scheduleCallback=function(L,K,U){var $=t.unstable_now();switch(typeof U=="object"&&U!==null?(U=U.delay,U=typeof U=="number"&&0<U?$+U:$):U=$,L){case 1:var ge=-1;break;case 2:ge=250;break;case 5:ge=1073741823;break;case 4:ge=1e4;break;default:ge=5e3}return ge=U+ge,L={id:d++,callback:K,priorityLevel:L,startTime:U,expirationTime:ge,sortIndex:-1},U>$?(L.sortIndex=U,e(c,L),n(l)===null&&L===n(c)&&(S?(u(N),N=-1):S=!0,Y(w,U-$))):(L.sortIndex=ge,e(l,L),v||g||(v=!0,G(P))),L},t.unstable_shouldYield=T,t.unstable_wrapCallback=function(L){var K=h;return function(){var U=h;h=K;try{return L.apply(this,arguments)}finally{h=U}}}})(Im);Dm.exports=Im;var Qx=Dm.exports;/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Jx=ae,pn=Qx;function ie(t){for(var e="https://reactjs.org/docs/error-decoder.html?invariant="+t,n=1;n<arguments.length;n++)e+="&args[]="+encodeURIComponent(arguments[n]);return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var Um=new Set,ca={};function br(t,e){fs(t,e),fs(t+"Capture",e)}function fs(t,e){for(ca[t]=e,t=0;t<e.length;t++)Um.add(e[t])}var di=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),tu=Object.prototype.hasOwnProperty,ev=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,oh={},lh={};function tv(t){return tu.call(lh,t)?!0:tu.call(oh,t)?!1:ev.test(t)?lh[t]=!0:(oh[t]=!0,!1)}function nv(t,e,n,i){if(n!==null&&n.type===0)return!1;switch(typeof e){case"function":case"symbol":return!0;case"boolean":return i?!1:n!==null?!n.acceptsBooleans:(t=t.toLowerCase().slice(0,5),t!=="data-"&&t!=="aria-");default:return!1}}function iv(t,e,n,i){if(e===null||typeof e>"u"||nv(t,e,n,i))return!0;if(i)return!1;if(n!==null)switch(n.type){case 3:return!e;case 4:return e===!1;case 5:return isNaN(e);case 6:return isNaN(e)||1>e}return!1}function qt(t,e,n,i,r,s,a){this.acceptsBooleans=e===2||e===3||e===4,this.attributeName=i,this.attributeNamespace=r,this.mustUseProperty=n,this.propertyName=t,this.type=e,this.sanitizeURL=s,this.removeEmptyString=a}var It={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(t){It[t]=new qt(t,0,!1,t,null,!1,!1)});[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(t){var e=t[0];It[e]=new qt(e,1,!1,t[1],null,!1,!1)});["contentEditable","draggable","spellCheck","value"].forEach(function(t){It[t]=new qt(t,2,!1,t.toLowerCase(),null,!1,!1)});["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(t){It[t]=new qt(t,2,!1,t,null,!1,!1)});"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(t){It[t]=new qt(t,3,!1,t.toLowerCase(),null,!1,!1)});["checked","multiple","muted","selected"].forEach(function(t){It[t]=new qt(t,3,!0,t,null,!1,!1)});["capture","download"].forEach(function(t){It[t]=new qt(t,4,!1,t,null,!1,!1)});["cols","rows","size","span"].forEach(function(t){It[t]=new qt(t,6,!1,t,null,!1,!1)});["rowSpan","start"].forEach(function(t){It[t]=new qt(t,5,!1,t.toLowerCase(),null,!1,!1)});var jd=/[\-:]([a-z])/g;function Gd(t){return t[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(t){var e=t.replace(jd,Gd);It[e]=new qt(e,1,!1,t,null,!1,!1)});"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(t){var e=t.replace(jd,Gd);It[e]=new qt(e,1,!1,t,"http://www.w3.org/1999/xlink",!1,!1)});["xml:base","xml:lang","xml:space"].forEach(function(t){var e=t.replace(jd,Gd);It[e]=new qt(e,1,!1,t,"http://www.w3.org/XML/1998/namespace",!1,!1)});["tabIndex","crossOrigin"].forEach(function(t){It[t]=new qt(t,1,!1,t.toLowerCase(),null,!1,!1)});It.xlinkHref=new qt("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1);["src","href","action","formAction"].forEach(function(t){It[t]=new qt(t,1,!1,t.toLowerCase(),null,!0,!0)});function Wd(t,e,n,i){var r=It.hasOwnProperty(e)?It[e]:null;(r!==null?r.type!==0:i||!(2<e.length)||e[0]!=="o"&&e[0]!=="O"||e[1]!=="n"&&e[1]!=="N")&&(iv(e,n,r,i)&&(n=null),i||r===null?tv(e)&&(n===null?t.removeAttribute(e):t.setAttribute(e,""+n)):r.mustUseProperty?t[r.propertyName]=n===null?r.type===3?!1:"":n:(e=r.attributeName,i=r.attributeNamespace,n===null?t.removeAttribute(e):(r=r.type,n=r===3||r===4&&n===!0?"":""+n,i?t.setAttributeNS(i,e,n):t.setAttribute(e,n))))}var gi=Jx.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,Ga=Symbol.for("react.element"),Gr=Symbol.for("react.portal"),Wr=Symbol.for("react.fragment"),Xd=Symbol.for("react.strict_mode"),nu=Symbol.for("react.profiler"),km=Symbol.for("react.provider"),Fm=Symbol.for("react.context"),qd=Symbol.for("react.forward_ref"),iu=Symbol.for("react.suspense"),ru=Symbol.for("react.suspense_list"),Yd=Symbol.for("react.memo"),Ai=Symbol.for("react.lazy"),Om=Symbol.for("react.offscreen"),ch=Symbol.iterator;function Ls(t){return t===null||typeof t!="object"?null:(t=ch&&t[ch]||t["@@iterator"],typeof t=="function"?t:null)}var gt=Object.assign,Kl;function qs(t){if(Kl===void 0)try{throw Error()}catch(n){var e=n.stack.trim().match(/\n( *(at )?)/);Kl=e&&e[1]||""}return`
`+Kl+t}var Zl=!1;function Ql(t,e){if(!t||Zl)return"";Zl=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(e)if(e=function(){throw Error()},Object.defineProperty(e.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(e,[])}catch(c){var i=c}Reflect.construct(t,[],e)}else{try{e.call()}catch(c){i=c}t.call(e.prototype)}else{try{throw Error()}catch(c){i=c}t()}}catch(c){if(c&&i&&typeof c.stack=="string"){for(var r=c.stack.split(`
`),s=i.stack.split(`
`),a=r.length-1,o=s.length-1;1<=a&&0<=o&&r[a]!==s[o];)o--;for(;1<=a&&0<=o;a--,o--)if(r[a]!==s[o]){if(a!==1||o!==1)do if(a--,o--,0>o||r[a]!==s[o]){var l=`
`+r[a].replace(" at new "," at ");return t.displayName&&l.includes("<anonymous>")&&(l=l.replace("<anonymous>",t.displayName)),l}while(1<=a&&0<=o);break}}}finally{Zl=!1,Error.prepareStackTrace=n}return(t=t?t.displayName||t.name:"")?qs(t):""}function rv(t){switch(t.tag){case 5:return qs(t.type);case 16:return qs("Lazy");case 13:return qs("Suspense");case 19:return qs("SuspenseList");case 0:case 2:case 15:return t=Ql(t.type,!1),t;case 11:return t=Ql(t.type.render,!1),t;case 1:return t=Ql(t.type,!0),t;default:return""}}function su(t){if(t==null)return null;if(typeof t=="function")return t.displayName||t.name||null;if(typeof t=="string")return t;switch(t){case Wr:return"Fragment";case Gr:return"Portal";case nu:return"Profiler";case Xd:return"StrictMode";case iu:return"Suspense";case ru:return"SuspenseList"}if(typeof t=="object")switch(t.$$typeof){case Fm:return(t.displayName||"Context")+".Consumer";case km:return(t._context.displayName||"Context")+".Provider";case qd:var e=t.render;return t=t.displayName,t||(t=e.displayName||e.name||"",t=t!==""?"ForwardRef("+t+")":"ForwardRef"),t;case Yd:return e=t.displayName||null,e!==null?e:su(t.type)||"Memo";case Ai:e=t._payload,t=t._init;try{return su(t(e))}catch{}}return null}function sv(t){var e=t.type;switch(t.tag){case 24:return"Cache";case 9:return(e.displayName||"Context")+".Consumer";case 10:return(e._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return t=e.render,t=t.displayName||t.name||"",e.displayName||(t!==""?"ForwardRef("+t+")":"ForwardRef");case 7:return"Fragment";case 5:return e;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return su(e);case 8:return e===Xd?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof e=="function")return e.displayName||e.name||null;if(typeof e=="string")return e}return null}function Gi(t){switch(typeof t){case"boolean":case"number":case"string":case"undefined":return t;case"object":return t;default:return""}}function zm(t){var e=t.type;return(t=t.nodeName)&&t.toLowerCase()==="input"&&(e==="checkbox"||e==="radio")}function av(t){var e=zm(t)?"checked":"value",n=Object.getOwnPropertyDescriptor(t.constructor.prototype,e),i=""+t[e];if(!t.hasOwnProperty(e)&&typeof n<"u"&&typeof n.get=="function"&&typeof n.set=="function"){var r=n.get,s=n.set;return Object.defineProperty(t,e,{configurable:!0,get:function(){return r.call(this)},set:function(a){i=""+a,s.call(this,a)}}),Object.defineProperty(t,e,{enumerable:n.enumerable}),{getValue:function(){return i},setValue:function(a){i=""+a},stopTracking:function(){t._valueTracker=null,delete t[e]}}}}function Wa(t){t._valueTracker||(t._valueTracker=av(t))}function Bm(t){if(!t)return!1;var e=t._valueTracker;if(!e)return!0;var n=e.getValue(),i="";return t&&(i=zm(t)?t.checked?"true":"false":t.value),t=i,t!==n?(e.setValue(t),!0):!1}function $o(t){if(t=t||(typeof document<"u"?document:void 0),typeof t>"u")return null;try{return t.activeElement||t.body}catch{return t.body}}function au(t,e){var n=e.checked;return gt({},e,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:n??t._wrapperState.initialChecked})}function uh(t,e){var n=e.defaultValue==null?"":e.defaultValue,i=e.checked!=null?e.checked:e.defaultChecked;n=Gi(e.value!=null?e.value:n),t._wrapperState={initialChecked:i,initialValue:n,controlled:e.type==="checkbox"||e.type==="radio"?e.checked!=null:e.value!=null}}function Hm(t,e){e=e.checked,e!=null&&Wd(t,"checked",e,!1)}function ou(t,e){Hm(t,e);var n=Gi(e.value),i=e.type;if(n!=null)i==="number"?(n===0&&t.value===""||t.value!=n)&&(t.value=""+n):t.value!==""+n&&(t.value=""+n);else if(i==="submit"||i==="reset"){t.removeAttribute("value");return}e.hasOwnProperty("value")?lu(t,e.type,n):e.hasOwnProperty("defaultValue")&&lu(t,e.type,Gi(e.defaultValue)),e.checked==null&&e.defaultChecked!=null&&(t.defaultChecked=!!e.defaultChecked)}function dh(t,e,n){if(e.hasOwnProperty("value")||e.hasOwnProperty("defaultValue")){var i=e.type;if(!(i!=="submit"&&i!=="reset"||e.value!==void 0&&e.value!==null))return;e=""+t._wrapperState.initialValue,n||e===t.value||(t.value=e),t.defaultValue=e}n=t.name,n!==""&&(t.name=""),t.defaultChecked=!!t._wrapperState.initialChecked,n!==""&&(t.name=n)}function lu(t,e,n){(e!=="number"||$o(t.ownerDocument)!==t)&&(n==null?t.defaultValue=""+t._wrapperState.initialValue:t.defaultValue!==""+n&&(t.defaultValue=""+n))}var Ys=Array.isArray;function is(t,e,n,i){if(t=t.options,e){e={};for(var r=0;r<n.length;r++)e["$"+n[r]]=!0;for(n=0;n<t.length;n++)r=e.hasOwnProperty("$"+t[n].value),t[n].selected!==r&&(t[n].selected=r),r&&i&&(t[n].defaultSelected=!0)}else{for(n=""+Gi(n),e=null,r=0;r<t.length;r++){if(t[r].value===n){t[r].selected=!0,i&&(t[r].defaultSelected=!0);return}e!==null||t[r].disabled||(e=t[r])}e!==null&&(e.selected=!0)}}function cu(t,e){if(e.dangerouslySetInnerHTML!=null)throw Error(ie(91));return gt({},e,{value:void 0,defaultValue:void 0,children:""+t._wrapperState.initialValue})}function fh(t,e){var n=e.value;if(n==null){if(n=e.children,e=e.defaultValue,n!=null){if(e!=null)throw Error(ie(92));if(Ys(n)){if(1<n.length)throw Error(ie(93));n=n[0]}e=n}e==null&&(e=""),n=e}t._wrapperState={initialValue:Gi(n)}}function Vm(t,e){var n=Gi(e.value),i=Gi(e.defaultValue);n!=null&&(n=""+n,n!==t.value&&(t.value=n),e.defaultValue==null&&t.defaultValue!==n&&(t.defaultValue=n)),i!=null&&(t.defaultValue=""+i)}function hh(t){var e=t.textContent;e===t._wrapperState.initialValue&&e!==""&&e!==null&&(t.value=e)}function jm(t){switch(t){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function uu(t,e){return t==null||t==="http://www.w3.org/1999/xhtml"?jm(e):t==="http://www.w3.org/2000/svg"&&e==="foreignObject"?"http://www.w3.org/1999/xhtml":t}var Xa,Gm=function(t){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(e,n,i,r){MSApp.execUnsafeLocalFunction(function(){return t(e,n,i,r)})}:t}(function(t,e){if(t.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in t)t.innerHTML=e;else{for(Xa=Xa||document.createElement("div"),Xa.innerHTML="<svg>"+e.valueOf().toString()+"</svg>",e=Xa.firstChild;t.firstChild;)t.removeChild(t.firstChild);for(;e.firstChild;)t.appendChild(e.firstChild)}});function ua(t,e){if(e){var n=t.firstChild;if(n&&n===t.lastChild&&n.nodeType===3){n.nodeValue=e;return}}t.textContent=e}var Js={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},ov=["Webkit","ms","Moz","O"];Object.keys(Js).forEach(function(t){ov.forEach(function(e){e=e+t.charAt(0).toUpperCase()+t.substring(1),Js[e]=Js[t]})});function Wm(t,e,n){return e==null||typeof e=="boolean"||e===""?"":n||typeof e!="number"||e===0||Js.hasOwnProperty(t)&&Js[t]?(""+e).trim():e+"px"}function Xm(t,e){t=t.style;for(var n in e)if(e.hasOwnProperty(n)){var i=n.indexOf("--")===0,r=Wm(n,e[n],i);n==="float"&&(n="cssFloat"),i?t.setProperty(n,r):t[n]=r}}var lv=gt({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function du(t,e){if(e){if(lv[t]&&(e.children!=null||e.dangerouslySetInnerHTML!=null))throw Error(ie(137,t));if(e.dangerouslySetInnerHTML!=null){if(e.children!=null)throw Error(ie(60));if(typeof e.dangerouslySetInnerHTML!="object"||!("__html"in e.dangerouslySetInnerHTML))throw Error(ie(61))}if(e.style!=null&&typeof e.style!="object")throw Error(ie(62))}}function fu(t,e){if(t.indexOf("-")===-1)return typeof e.is=="string";switch(t){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var hu=null;function $d(t){return t=t.target||t.srcElement||window,t.correspondingUseElement&&(t=t.correspondingUseElement),t.nodeType===3?t.parentNode:t}var pu=null,rs=null,ss=null;function ph(t){if(t=Da(t)){if(typeof pu!="function")throw Error(ie(280));var e=t.stateNode;e&&(e=Rl(e),pu(t.stateNode,t.type,e))}}function qm(t){rs?ss?ss.push(t):ss=[t]:rs=t}function Ym(){if(rs){var t=rs,e=ss;if(ss=rs=null,ph(t),e)for(t=0;t<e.length;t++)ph(e[t])}}function $m(t,e){return t(e)}function Km(){}var Jl=!1;function Zm(t,e,n){if(Jl)return t(e,n);Jl=!0;try{return $m(t,e,n)}finally{Jl=!1,(rs!==null||ss!==null)&&(Km(),Ym())}}function da(t,e){var n=t.stateNode;if(n===null)return null;var i=Rl(n);if(i===null)return null;n=i[e];e:switch(e){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(i=!i.disabled)||(t=t.type,i=!(t==="button"||t==="input"||t==="select"||t==="textarea")),t=!i;break e;default:t=!1}if(t)return null;if(n&&typeof n!="function")throw Error(ie(231,e,typeof n));return n}var mu=!1;if(di)try{var Ds={};Object.defineProperty(Ds,"passive",{get:function(){mu=!0}}),window.addEventListener("test",Ds,Ds),window.removeEventListener("test",Ds,Ds)}catch{mu=!1}function cv(t,e,n,i,r,s,a,o,l){var c=Array.prototype.slice.call(arguments,3);try{e.apply(n,c)}catch(d){this.onError(d)}}var ea=!1,Ko=null,Zo=!1,gu=null,uv={onError:function(t){ea=!0,Ko=t}};function dv(t,e,n,i,r,s,a,o,l){ea=!1,Ko=null,cv.apply(uv,arguments)}function fv(t,e,n,i,r,s,a,o,l){if(dv.apply(this,arguments),ea){if(ea){var c=Ko;ea=!1,Ko=null}else throw Error(ie(198));Zo||(Zo=!0,gu=c)}}function Ar(t){var e=t,n=t;if(t.alternate)for(;e.return;)e=e.return;else{t=e;do e=t,e.flags&4098&&(n=e.return),t=e.return;while(t)}return e.tag===3?n:null}function Qm(t){if(t.tag===13){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function mh(t){if(Ar(t)!==t)throw Error(ie(188))}function hv(t){var e=t.alternate;if(!e){if(e=Ar(t),e===null)throw Error(ie(188));return e!==t?null:t}for(var n=t,i=e;;){var r=n.return;if(r===null)break;var s=r.alternate;if(s===null){if(i=r.return,i!==null){n=i;continue}break}if(r.child===s.child){for(s=r.child;s;){if(s===n)return mh(r),t;if(s===i)return mh(r),e;s=s.sibling}throw Error(ie(188))}if(n.return!==i.return)n=r,i=s;else{for(var a=!1,o=r.child;o;){if(o===n){a=!0,n=r,i=s;break}if(o===i){a=!0,i=r,n=s;break}o=o.sibling}if(!a){for(o=s.child;o;){if(o===n){a=!0,n=s,i=r;break}if(o===i){a=!0,i=s,n=r;break}o=o.sibling}if(!a)throw Error(ie(189))}}if(n.alternate!==i)throw Error(ie(190))}if(n.tag!==3)throw Error(ie(188));return n.stateNode.current===n?t:e}function Jm(t){return t=hv(t),t!==null?e0(t):null}function e0(t){if(t.tag===5||t.tag===6)return t;for(t=t.child;t!==null;){var e=e0(t);if(e!==null)return e;t=t.sibling}return null}var t0=pn.unstable_scheduleCallback,gh=pn.unstable_cancelCallback,pv=pn.unstable_shouldYield,mv=pn.unstable_requestPaint,yt=pn.unstable_now,gv=pn.unstable_getCurrentPriorityLevel,Kd=pn.unstable_ImmediatePriority,n0=pn.unstable_UserBlockingPriority,Qo=pn.unstable_NormalPriority,xv=pn.unstable_LowPriority,i0=pn.unstable_IdlePriority,Tl=null,Yn=null;function vv(t){if(Yn&&typeof Yn.onCommitFiberRoot=="function")try{Yn.onCommitFiberRoot(Tl,t,void 0,(t.current.flags&128)===128)}catch{}}var On=Math.clz32?Math.clz32:Sv,_v=Math.log,yv=Math.LN2;function Sv(t){return t>>>=0,t===0?32:31-(_v(t)/yv|0)|0}var qa=64,Ya=4194304;function $s(t){switch(t&-t){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return t&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return t}}function Jo(t,e){var n=t.pendingLanes;if(n===0)return 0;var i=0,r=t.suspendedLanes,s=t.pingedLanes,a=n&268435455;if(a!==0){var o=a&~r;o!==0?i=$s(o):(s&=a,s!==0&&(i=$s(s)))}else a=n&~r,a!==0?i=$s(a):s!==0&&(i=$s(s));if(i===0)return 0;if(e!==0&&e!==i&&!(e&r)&&(r=i&-i,s=e&-e,r>=s||r===16&&(s&4194240)!==0))return e;if(i&4&&(i|=n&16),e=t.entangledLanes,e!==0)for(t=t.entanglements,e&=i;0<e;)n=31-On(e),r=1<<n,i|=t[n],e&=~r;return i}function Mv(t,e){switch(t){case 1:case 2:case 4:return e+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function wv(t,e){for(var n=t.suspendedLanes,i=t.pingedLanes,r=t.expirationTimes,s=t.pendingLanes;0<s;){var a=31-On(s),o=1<<a,l=r[a];l===-1?(!(o&n)||o&i)&&(r[a]=Mv(o,e)):l<=e&&(t.expiredLanes|=o),s&=~o}}function xu(t){return t=t.pendingLanes&-1073741825,t!==0?t:t&1073741824?1073741824:0}function r0(){var t=qa;return qa<<=1,!(qa&4194240)&&(qa=64),t}function ec(t){for(var e=[],n=0;31>n;n++)e.push(t);return e}function Pa(t,e,n){t.pendingLanes|=e,e!==536870912&&(t.suspendedLanes=0,t.pingedLanes=0),t=t.eventTimes,e=31-On(e),t[e]=n}function Ev(t,e){var n=t.pendingLanes&~e;t.pendingLanes=e,t.suspendedLanes=0,t.pingedLanes=0,t.expiredLanes&=e,t.mutableReadLanes&=e,t.entangledLanes&=e,e=t.entanglements;var i=t.eventTimes;for(t=t.expirationTimes;0<n;){var r=31-On(n),s=1<<r;e[r]=0,i[r]=-1,t[r]=-1,n&=~s}}function Zd(t,e){var n=t.entangledLanes|=e;for(t=t.entanglements;n;){var i=31-On(n),r=1<<i;r&e|t[i]&e&&(t[i]|=e),n&=~r}}var it=0;function s0(t){return t&=-t,1<t?4<t?t&268435455?16:536870912:4:1}var a0,Qd,o0,l0,c0,vu=!1,$a=[],Ii=null,Ui=null,ki=null,fa=new Map,ha=new Map,Ri=[],Tv="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function xh(t,e){switch(t){case"focusin":case"focusout":Ii=null;break;case"dragenter":case"dragleave":Ui=null;break;case"mouseover":case"mouseout":ki=null;break;case"pointerover":case"pointerout":fa.delete(e.pointerId);break;case"gotpointercapture":case"lostpointercapture":ha.delete(e.pointerId)}}function Is(t,e,n,i,r,s){return t===null||t.nativeEvent!==s?(t={blockedOn:e,domEventName:n,eventSystemFlags:i,nativeEvent:s,targetContainers:[r]},e!==null&&(e=Da(e),e!==null&&Qd(e)),t):(t.eventSystemFlags|=i,e=t.targetContainers,r!==null&&e.indexOf(r)===-1&&e.push(r),t)}function bv(t,e,n,i,r){switch(e){case"focusin":return Ii=Is(Ii,t,e,n,i,r),!0;case"dragenter":return Ui=Is(Ui,t,e,n,i,r),!0;case"mouseover":return ki=Is(ki,t,e,n,i,r),!0;case"pointerover":var s=r.pointerId;return fa.set(s,Is(fa.get(s)||null,t,e,n,i,r)),!0;case"gotpointercapture":return s=r.pointerId,ha.set(s,Is(ha.get(s)||null,t,e,n,i,r)),!0}return!1}function u0(t){var e=dr(t.target);if(e!==null){var n=Ar(e);if(n!==null){if(e=n.tag,e===13){if(e=Qm(n),e!==null){t.blockedOn=e,c0(t.priority,function(){o0(n)});return}}else if(e===3&&n.stateNode.current.memoizedState.isDehydrated){t.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}t.blockedOn=null}function Lo(t){if(t.blockedOn!==null)return!1;for(var e=t.targetContainers;0<e.length;){var n=_u(t.domEventName,t.eventSystemFlags,e[0],t.nativeEvent);if(n===null){n=t.nativeEvent;var i=new n.constructor(n.type,n);hu=i,n.target.dispatchEvent(i),hu=null}else return e=Da(n),e!==null&&Qd(e),t.blockedOn=n,!1;e.shift()}return!0}function vh(t,e,n){Lo(t)&&n.delete(e)}function Av(){vu=!1,Ii!==null&&Lo(Ii)&&(Ii=null),Ui!==null&&Lo(Ui)&&(Ui=null),ki!==null&&Lo(ki)&&(ki=null),fa.forEach(vh),ha.forEach(vh)}function Us(t,e){t.blockedOn===e&&(t.blockedOn=null,vu||(vu=!0,pn.unstable_scheduleCallback(pn.unstable_NormalPriority,Av)))}function pa(t){function e(r){return Us(r,t)}if(0<$a.length){Us($a[0],t);for(var n=1;n<$a.length;n++){var i=$a[n];i.blockedOn===t&&(i.blockedOn=null)}}for(Ii!==null&&Us(Ii,t),Ui!==null&&Us(Ui,t),ki!==null&&Us(ki,t),fa.forEach(e),ha.forEach(e),n=0;n<Ri.length;n++)i=Ri[n],i.blockedOn===t&&(i.blockedOn=null);for(;0<Ri.length&&(n=Ri[0],n.blockedOn===null);)u0(n),n.blockedOn===null&&Ri.shift()}var as=gi.ReactCurrentBatchConfig,el=!0;function Cv(t,e,n,i){var r=it,s=as.transition;as.transition=null;try{it=1,Jd(t,e,n,i)}finally{it=r,as.transition=s}}function Rv(t,e,n,i){var r=it,s=as.transition;as.transition=null;try{it=4,Jd(t,e,n,i)}finally{it=r,as.transition=s}}function Jd(t,e,n,i){if(el){var r=_u(t,e,n,i);if(r===null)uc(t,e,i,tl,n),xh(t,i);else if(bv(r,t,e,n,i))i.stopPropagation();else if(xh(t,i),e&4&&-1<Tv.indexOf(t)){for(;r!==null;){var s=Da(r);if(s!==null&&a0(s),s=_u(t,e,n,i),s===null&&uc(t,e,i,tl,n),s===r)break;r=s}r!==null&&i.stopPropagation()}else uc(t,e,i,null,n)}}var tl=null;function _u(t,e,n,i){if(tl=null,t=$d(i),t=dr(t),t!==null)if(e=Ar(t),e===null)t=null;else if(n=e.tag,n===13){if(t=Qm(e),t!==null)return t;t=null}else if(n===3){if(e.stateNode.current.memoizedState.isDehydrated)return e.tag===3?e.stateNode.containerInfo:null;t=null}else e!==t&&(t=null);return tl=t,null}function d0(t){switch(t){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(gv()){case Kd:return 1;case n0:return 4;case Qo:case xv:return 16;case i0:return 536870912;default:return 16}default:return 16}}var Li=null,ef=null,Do=null;function f0(){if(Do)return Do;var t,e=ef,n=e.length,i,r="value"in Li?Li.value:Li.textContent,s=r.length;for(t=0;t<n&&e[t]===r[t];t++);var a=n-t;for(i=1;i<=a&&e[n-i]===r[s-i];i++);return Do=r.slice(t,1<i?1-i:void 0)}function Io(t){var e=t.keyCode;return"charCode"in t?(t=t.charCode,t===0&&e===13&&(t=13)):t=e,t===10&&(t=13),32<=t||t===13?t:0}function Ka(){return!0}function _h(){return!1}function gn(t){function e(n,i,r,s,a){this._reactName=n,this._targetInst=r,this.type=i,this.nativeEvent=s,this.target=a,this.currentTarget=null;for(var o in t)t.hasOwnProperty(o)&&(n=t[o],this[o]=n?n(s):s[o]);return this.isDefaultPrevented=(s.defaultPrevented!=null?s.defaultPrevented:s.returnValue===!1)?Ka:_h,this.isPropagationStopped=_h,this}return gt(e.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=Ka)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=Ka)},persist:function(){},isPersistent:Ka}),e}var As={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(t){return t.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},tf=gn(As),La=gt({},As,{view:0,detail:0}),Nv=gn(La),tc,nc,ks,bl=gt({},La,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:nf,button:0,buttons:0,relatedTarget:function(t){return t.relatedTarget===void 0?t.fromElement===t.srcElement?t.toElement:t.fromElement:t.relatedTarget},movementX:function(t){return"movementX"in t?t.movementX:(t!==ks&&(ks&&t.type==="mousemove"?(tc=t.screenX-ks.screenX,nc=t.screenY-ks.screenY):nc=tc=0,ks=t),tc)},movementY:function(t){return"movementY"in t?t.movementY:nc}}),yh=gn(bl),Pv=gt({},bl,{dataTransfer:0}),Lv=gn(Pv),Dv=gt({},La,{relatedTarget:0}),ic=gn(Dv),Iv=gt({},As,{animationName:0,elapsedTime:0,pseudoElement:0}),Uv=gn(Iv),kv=gt({},As,{clipboardData:function(t){return"clipboardData"in t?t.clipboardData:window.clipboardData}}),Fv=gn(kv),Ov=gt({},As,{data:0}),Sh=gn(Ov),zv={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},Bv={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},Hv={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function Vv(t){var e=this.nativeEvent;return e.getModifierState?e.getModifierState(t):(t=Hv[t])?!!e[t]:!1}function nf(){return Vv}var jv=gt({},La,{key:function(t){if(t.key){var e=zv[t.key]||t.key;if(e!=="Unidentified")return e}return t.type==="keypress"?(t=Io(t),t===13?"Enter":String.fromCharCode(t)):t.type==="keydown"||t.type==="keyup"?Bv[t.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:nf,charCode:function(t){return t.type==="keypress"?Io(t):0},keyCode:function(t){return t.type==="keydown"||t.type==="keyup"?t.keyCode:0},which:function(t){return t.type==="keypress"?Io(t):t.type==="keydown"||t.type==="keyup"?t.keyCode:0}}),Gv=gn(jv),Wv=gt({},bl,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Mh=gn(Wv),Xv=gt({},La,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:nf}),qv=gn(Xv),Yv=gt({},As,{propertyName:0,elapsedTime:0,pseudoElement:0}),$v=gn(Yv),Kv=gt({},bl,{deltaX:function(t){return"deltaX"in t?t.deltaX:"wheelDeltaX"in t?-t.wheelDeltaX:0},deltaY:function(t){return"deltaY"in t?t.deltaY:"wheelDeltaY"in t?-t.wheelDeltaY:"wheelDelta"in t?-t.wheelDelta:0},deltaZ:0,deltaMode:0}),Zv=gn(Kv),Qv=[9,13,27,32],rf=di&&"CompositionEvent"in window,ta=null;di&&"documentMode"in document&&(ta=document.documentMode);var Jv=di&&"TextEvent"in window&&!ta,h0=di&&(!rf||ta&&8<ta&&11>=ta),wh=" ",Eh=!1;function p0(t,e){switch(t){case"keyup":return Qv.indexOf(e.keyCode)!==-1;case"keydown":return e.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function m0(t){return t=t.detail,typeof t=="object"&&"data"in t?t.data:null}var Xr=!1;function e_(t,e){switch(t){case"compositionend":return m0(e);case"keypress":return e.which!==32?null:(Eh=!0,wh);case"textInput":return t=e.data,t===wh&&Eh?null:t;default:return null}}function t_(t,e){if(Xr)return t==="compositionend"||!rf&&p0(t,e)?(t=f0(),Do=ef=Li=null,Xr=!1,t):null;switch(t){case"paste":return null;case"keypress":if(!(e.ctrlKey||e.altKey||e.metaKey)||e.ctrlKey&&e.altKey){if(e.char&&1<e.char.length)return e.char;if(e.which)return String.fromCharCode(e.which)}return null;case"compositionend":return h0&&e.locale!=="ko"?null:e.data;default:return null}}var n_={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Th(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e==="input"?!!n_[t.type]:e==="textarea"}function g0(t,e,n,i){qm(i),e=nl(e,"onChange"),0<e.length&&(n=new tf("onChange","change",null,n,i),t.push({event:n,listeners:e}))}var na=null,ma=null;function i_(t){A0(t,0)}function Al(t){var e=$r(t);if(Bm(e))return t}function r_(t,e){if(t==="change")return e}var x0=!1;if(di){var rc;if(di){var sc="oninput"in document;if(!sc){var bh=document.createElement("div");bh.setAttribute("oninput","return;"),sc=typeof bh.oninput=="function"}rc=sc}else rc=!1;x0=rc&&(!document.documentMode||9<document.documentMode)}function Ah(){na&&(na.detachEvent("onpropertychange",v0),ma=na=null)}function v0(t){if(t.propertyName==="value"&&Al(ma)){var e=[];g0(e,ma,t,$d(t)),Zm(i_,e)}}function s_(t,e,n){t==="focusin"?(Ah(),na=e,ma=n,na.attachEvent("onpropertychange",v0)):t==="focusout"&&Ah()}function a_(t){if(t==="selectionchange"||t==="keyup"||t==="keydown")return Al(ma)}function o_(t,e){if(t==="click")return Al(e)}function l_(t,e){if(t==="input"||t==="change")return Al(e)}function c_(t,e){return t===e&&(t!==0||1/t===1/e)||t!==t&&e!==e}var Bn=typeof Object.is=="function"?Object.is:c_;function ga(t,e){if(Bn(t,e))return!0;if(typeof t!="object"||t===null||typeof e!="object"||e===null)return!1;var n=Object.keys(t),i=Object.keys(e);if(n.length!==i.length)return!1;for(i=0;i<n.length;i++){var r=n[i];if(!tu.call(e,r)||!Bn(t[r],e[r]))return!1}return!0}function Ch(t){for(;t&&t.firstChild;)t=t.firstChild;return t}function Rh(t,e){var n=Ch(t);t=0;for(var i;n;){if(n.nodeType===3){if(i=t+n.textContent.length,t<=e&&i>=e)return{node:n,offset:e-t};t=i}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=Ch(n)}}function _0(t,e){return t&&e?t===e?!0:t&&t.nodeType===3?!1:e&&e.nodeType===3?_0(t,e.parentNode):"contains"in t?t.contains(e):t.compareDocumentPosition?!!(t.compareDocumentPosition(e)&16):!1:!1}function y0(){for(var t=window,e=$o();e instanceof t.HTMLIFrameElement;){try{var n=typeof e.contentWindow.location.href=="string"}catch{n=!1}if(n)t=e.contentWindow;else break;e=$o(t.document)}return e}function sf(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e&&(e==="input"&&(t.type==="text"||t.type==="search"||t.type==="tel"||t.type==="url"||t.type==="password")||e==="textarea"||t.contentEditable==="true")}function u_(t){var e=y0(),n=t.focusedElem,i=t.selectionRange;if(e!==n&&n&&n.ownerDocument&&_0(n.ownerDocument.documentElement,n)){if(i!==null&&sf(n)){if(e=i.start,t=i.end,t===void 0&&(t=e),"selectionStart"in n)n.selectionStart=e,n.selectionEnd=Math.min(t,n.value.length);else if(t=(e=n.ownerDocument||document)&&e.defaultView||window,t.getSelection){t=t.getSelection();var r=n.textContent.length,s=Math.min(i.start,r);i=i.end===void 0?s:Math.min(i.end,r),!t.extend&&s>i&&(r=i,i=s,s=r),r=Rh(n,s);var a=Rh(n,i);r&&a&&(t.rangeCount!==1||t.anchorNode!==r.node||t.anchorOffset!==r.offset||t.focusNode!==a.node||t.focusOffset!==a.offset)&&(e=e.createRange(),e.setStart(r.node,r.offset),t.removeAllRanges(),s>i?(t.addRange(e),t.extend(a.node,a.offset)):(e.setEnd(a.node,a.offset),t.addRange(e)))}}for(e=[],t=n;t=t.parentNode;)t.nodeType===1&&e.push({element:t,left:t.scrollLeft,top:t.scrollTop});for(typeof n.focus=="function"&&n.focus(),n=0;n<e.length;n++)t=e[n],t.element.scrollLeft=t.left,t.element.scrollTop=t.top}}var d_=di&&"documentMode"in document&&11>=document.documentMode,qr=null,yu=null,ia=null,Su=!1;function Nh(t,e,n){var i=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;Su||qr==null||qr!==$o(i)||(i=qr,"selectionStart"in i&&sf(i)?i={start:i.selectionStart,end:i.selectionEnd}:(i=(i.ownerDocument&&i.ownerDocument.defaultView||window).getSelection(),i={anchorNode:i.anchorNode,anchorOffset:i.anchorOffset,focusNode:i.focusNode,focusOffset:i.focusOffset}),ia&&ga(ia,i)||(ia=i,i=nl(yu,"onSelect"),0<i.length&&(e=new tf("onSelect","select",null,e,n),t.push({event:e,listeners:i}),e.target=qr)))}function Za(t,e){var n={};return n[t.toLowerCase()]=e.toLowerCase(),n["Webkit"+t]="webkit"+e,n["Moz"+t]="moz"+e,n}var Yr={animationend:Za("Animation","AnimationEnd"),animationiteration:Za("Animation","AnimationIteration"),animationstart:Za("Animation","AnimationStart"),transitionend:Za("Transition","TransitionEnd")},ac={},S0={};di&&(S0=document.createElement("div").style,"AnimationEvent"in window||(delete Yr.animationend.animation,delete Yr.animationiteration.animation,delete Yr.animationstart.animation),"TransitionEvent"in window||delete Yr.transitionend.transition);function Cl(t){if(ac[t])return ac[t];if(!Yr[t])return t;var e=Yr[t],n;for(n in e)if(e.hasOwnProperty(n)&&n in S0)return ac[t]=e[n];return t}var M0=Cl("animationend"),w0=Cl("animationiteration"),E0=Cl("animationstart"),T0=Cl("transitionend"),b0=new Map,Ph="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function Yi(t,e){b0.set(t,e),br(e,[t])}for(var oc=0;oc<Ph.length;oc++){var lc=Ph[oc],f_=lc.toLowerCase(),h_=lc[0].toUpperCase()+lc.slice(1);Yi(f_,"on"+h_)}Yi(M0,"onAnimationEnd");Yi(w0,"onAnimationIteration");Yi(E0,"onAnimationStart");Yi("dblclick","onDoubleClick");Yi("focusin","onFocus");Yi("focusout","onBlur");Yi(T0,"onTransitionEnd");fs("onMouseEnter",["mouseout","mouseover"]);fs("onMouseLeave",["mouseout","mouseover"]);fs("onPointerEnter",["pointerout","pointerover"]);fs("onPointerLeave",["pointerout","pointerover"]);br("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));br("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));br("onBeforeInput",["compositionend","keypress","textInput","paste"]);br("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));br("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));br("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Ks="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),p_=new Set("cancel close invalid load scroll toggle".split(" ").concat(Ks));function Lh(t,e,n){var i=t.type||"unknown-event";t.currentTarget=n,fv(i,e,void 0,t),t.currentTarget=null}function A0(t,e){e=(e&4)!==0;for(var n=0;n<t.length;n++){var i=t[n],r=i.event;i=i.listeners;e:{var s=void 0;if(e)for(var a=i.length-1;0<=a;a--){var o=i[a],l=o.instance,c=o.currentTarget;if(o=o.listener,l!==s&&r.isPropagationStopped())break e;Lh(r,o,c),s=l}else for(a=0;a<i.length;a++){if(o=i[a],l=o.instance,c=o.currentTarget,o=o.listener,l!==s&&r.isPropagationStopped())break e;Lh(r,o,c),s=l}}}if(Zo)throw t=gu,Zo=!1,gu=null,t}function ct(t,e){var n=e[bu];n===void 0&&(n=e[bu]=new Set);var i=t+"__bubble";n.has(i)||(C0(e,t,2,!1),n.add(i))}function cc(t,e,n){var i=0;e&&(i|=4),C0(n,t,i,e)}var Qa="_reactListening"+Math.random().toString(36).slice(2);function xa(t){if(!t[Qa]){t[Qa]=!0,Um.forEach(function(n){n!=="selectionchange"&&(p_.has(n)||cc(n,!1,t),cc(n,!0,t))});var e=t.nodeType===9?t:t.ownerDocument;e===null||e[Qa]||(e[Qa]=!0,cc("selectionchange",!1,e))}}function C0(t,e,n,i){switch(d0(e)){case 1:var r=Cv;break;case 4:r=Rv;break;default:r=Jd}n=r.bind(null,e,n,t),r=void 0,!mu||e!=="touchstart"&&e!=="touchmove"&&e!=="wheel"||(r=!0),i?r!==void 0?t.addEventListener(e,n,{capture:!0,passive:r}):t.addEventListener(e,n,!0):r!==void 0?t.addEventListener(e,n,{passive:r}):t.addEventListener(e,n,!1)}function uc(t,e,n,i,r){var s=i;if(!(e&1)&&!(e&2)&&i!==null)e:for(;;){if(i===null)return;var a=i.tag;if(a===3||a===4){var o=i.stateNode.containerInfo;if(o===r||o.nodeType===8&&o.parentNode===r)break;if(a===4)for(a=i.return;a!==null;){var l=a.tag;if((l===3||l===4)&&(l=a.stateNode.containerInfo,l===r||l.nodeType===8&&l.parentNode===r))return;a=a.return}for(;o!==null;){if(a=dr(o),a===null)return;if(l=a.tag,l===5||l===6){i=s=a;continue e}o=o.parentNode}}i=i.return}Zm(function(){var c=s,d=$d(n),p=[];e:{var h=b0.get(t);if(h!==void 0){var g=tf,v=t;switch(t){case"keypress":if(Io(n)===0)break e;case"keydown":case"keyup":g=Gv;break;case"focusin":v="focus",g=ic;break;case"focusout":v="blur",g=ic;break;case"beforeblur":case"afterblur":g=ic;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":g=yh;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":g=Lv;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":g=qv;break;case M0:case w0:case E0:g=Uv;break;case T0:g=$v;break;case"scroll":g=Nv;break;case"wheel":g=Zv;break;case"copy":case"cut":case"paste":g=Fv;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":g=Mh}var S=(e&4)!==0,m=!S&&t==="scroll",u=S?h!==null?h+"Capture":null:h;S=[];for(var _=c,x;_!==null;){x=_;var w=x.stateNode;if(x.tag===5&&w!==null&&(x=w,u!==null&&(w=da(_,u),w!=null&&S.push(va(_,w,x)))),m)break;_=_.return}0<S.length&&(h=new g(h,v,null,n,d),p.push({event:h,listeners:S}))}}if(!(e&7)){e:{if(h=t==="mouseover"||t==="pointerover",g=t==="mouseout"||t==="pointerout",h&&n!==hu&&(v=n.relatedTarget||n.fromElement)&&(dr(v)||v[fi]))break e;if((g||h)&&(h=d.window===d?d:(h=d.ownerDocument)?h.defaultView||h.parentWindow:window,g?(v=n.relatedTarget||n.toElement,g=c,v=v?dr(v):null,v!==null&&(m=Ar(v),v!==m||v.tag!==5&&v.tag!==6)&&(v=null)):(g=null,v=c),g!==v)){if(S=yh,w="onMouseLeave",u="onMouseEnter",_="mouse",(t==="pointerout"||t==="pointerover")&&(S=Mh,w="onPointerLeave",u="onPointerEnter",_="pointer"),m=g==null?h:$r(g),x=v==null?h:$r(v),h=new S(w,_+"leave",g,n,d),h.target=m,h.relatedTarget=x,w=null,dr(d)===c&&(S=new S(u,_+"enter",v,n,d),S.target=x,S.relatedTarget=m,w=S),m=w,g&&v)t:{for(S=g,u=v,_=0,x=S;x;x=Rr(x))_++;for(x=0,w=u;w;w=Rr(w))x++;for(;0<_-x;)S=Rr(S),_--;for(;0<x-_;)u=Rr(u),x--;for(;_--;){if(S===u||u!==null&&S===u.alternate)break t;S=Rr(S),u=Rr(u)}S=null}else S=null;g!==null&&Dh(p,h,g,S,!1),v!==null&&m!==null&&Dh(p,m,v,S,!0)}}e:{if(h=c?$r(c):window,g=h.nodeName&&h.nodeName.toLowerCase(),g==="select"||g==="input"&&h.type==="file")var P=r_;else if(Th(h))if(x0)P=l_;else{P=a_;var b=s_}else(g=h.nodeName)&&g.toLowerCase()==="input"&&(h.type==="checkbox"||h.type==="radio")&&(P=o_);if(P&&(P=P(t,c))){g0(p,P,n,d);break e}b&&b(t,h,c),t==="focusout"&&(b=h._wrapperState)&&b.controlled&&h.type==="number"&&lu(h,"number",h.value)}switch(b=c?$r(c):window,t){case"focusin":(Th(b)||b.contentEditable==="true")&&(qr=b,yu=c,ia=null);break;case"focusout":ia=yu=qr=null;break;case"mousedown":Su=!0;break;case"contextmenu":case"mouseup":case"dragend":Su=!1,Nh(p,n,d);break;case"selectionchange":if(d_)break;case"keydown":case"keyup":Nh(p,n,d)}var A;if(rf)e:{switch(t){case"compositionstart":var N="onCompositionStart";break e;case"compositionend":N="onCompositionEnd";break e;case"compositionupdate":N="onCompositionUpdate";break e}N=void 0}else Xr?p0(t,n)&&(N="onCompositionEnd"):t==="keydown"&&n.keyCode===229&&(N="onCompositionStart");N&&(h0&&n.locale!=="ko"&&(Xr||N!=="onCompositionStart"?N==="onCompositionEnd"&&Xr&&(A=f0()):(Li=d,ef="value"in Li?Li.value:Li.textContent,Xr=!0)),b=nl(c,N),0<b.length&&(N=new Sh(N,t,null,n,d),p.push({event:N,listeners:b}),A?N.data=A:(A=m0(n),A!==null&&(N.data=A)))),(A=Jv?e_(t,n):t_(t,n))&&(c=nl(c,"onBeforeInput"),0<c.length&&(d=new Sh("onBeforeInput","beforeinput",null,n,d),p.push({event:d,listeners:c}),d.data=A))}A0(p,e)})}function va(t,e,n){return{instance:t,listener:e,currentTarget:n}}function nl(t,e){for(var n=e+"Capture",i=[];t!==null;){var r=t,s=r.stateNode;r.tag===5&&s!==null&&(r=s,s=da(t,n),s!=null&&i.unshift(va(t,s,r)),s=da(t,e),s!=null&&i.push(va(t,s,r))),t=t.return}return i}function Rr(t){if(t===null)return null;do t=t.return;while(t&&t.tag!==5);return t||null}function Dh(t,e,n,i,r){for(var s=e._reactName,a=[];n!==null&&n!==i;){var o=n,l=o.alternate,c=o.stateNode;if(l!==null&&l===i)break;o.tag===5&&c!==null&&(o=c,r?(l=da(n,s),l!=null&&a.unshift(va(n,l,o))):r||(l=da(n,s),l!=null&&a.push(va(n,l,o)))),n=n.return}a.length!==0&&t.push({event:e,listeners:a})}var m_=/\r\n?/g,g_=/\u0000|\uFFFD/g;function Ih(t){return(typeof t=="string"?t:""+t).replace(m_,`
`).replace(g_,"")}function Ja(t,e,n){if(e=Ih(e),Ih(t)!==e&&n)throw Error(ie(425))}function il(){}var Mu=null,wu=null;function Eu(t,e){return t==="textarea"||t==="noscript"||typeof e.children=="string"||typeof e.children=="number"||typeof e.dangerouslySetInnerHTML=="object"&&e.dangerouslySetInnerHTML!==null&&e.dangerouslySetInnerHTML.__html!=null}var Tu=typeof setTimeout=="function"?setTimeout:void 0,x_=typeof clearTimeout=="function"?clearTimeout:void 0,Uh=typeof Promise=="function"?Promise:void 0,v_=typeof queueMicrotask=="function"?queueMicrotask:typeof Uh<"u"?function(t){return Uh.resolve(null).then(t).catch(__)}:Tu;function __(t){setTimeout(function(){throw t})}function dc(t,e){var n=e,i=0;do{var r=n.nextSibling;if(t.removeChild(n),r&&r.nodeType===8)if(n=r.data,n==="/$"){if(i===0){t.removeChild(r),pa(e);return}i--}else n!=="$"&&n!=="$?"&&n!=="$!"||i++;n=r}while(n);pa(e)}function Fi(t){for(;t!=null;t=t.nextSibling){var e=t.nodeType;if(e===1||e===3)break;if(e===8){if(e=t.data,e==="$"||e==="$!"||e==="$?")break;if(e==="/$")return null}}return t}function kh(t){t=t.previousSibling;for(var e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="$"||n==="$!"||n==="$?"){if(e===0)return t;e--}else n==="/$"&&e++}t=t.previousSibling}return null}var Cs=Math.random().toString(36).slice(2),Wn="__reactFiber$"+Cs,_a="__reactProps$"+Cs,fi="__reactContainer$"+Cs,bu="__reactEvents$"+Cs,y_="__reactListeners$"+Cs,S_="__reactHandles$"+Cs;function dr(t){var e=t[Wn];if(e)return e;for(var n=t.parentNode;n;){if(e=n[fi]||n[Wn]){if(n=e.alternate,e.child!==null||n!==null&&n.child!==null)for(t=kh(t);t!==null;){if(n=t[Wn])return n;t=kh(t)}return e}t=n,n=t.parentNode}return null}function Da(t){return t=t[Wn]||t[fi],!t||t.tag!==5&&t.tag!==6&&t.tag!==13&&t.tag!==3?null:t}function $r(t){if(t.tag===5||t.tag===6)return t.stateNode;throw Error(ie(33))}function Rl(t){return t[_a]||null}var Au=[],Kr=-1;function $i(t){return{current:t}}function dt(t){0>Kr||(t.current=Au[Kr],Au[Kr]=null,Kr--)}function ot(t,e){Kr++,Au[Kr]=t.current,t.current=e}var Wi={},Bt=$i(Wi),en=$i(!1),_r=Wi;function hs(t,e){var n=t.type.contextTypes;if(!n)return Wi;var i=t.stateNode;if(i&&i.__reactInternalMemoizedUnmaskedChildContext===e)return i.__reactInternalMemoizedMaskedChildContext;var r={},s;for(s in n)r[s]=e[s];return i&&(t=t.stateNode,t.__reactInternalMemoizedUnmaskedChildContext=e,t.__reactInternalMemoizedMaskedChildContext=r),r}function tn(t){return t=t.childContextTypes,t!=null}function rl(){dt(en),dt(Bt)}function Fh(t,e,n){if(Bt.current!==Wi)throw Error(ie(168));ot(Bt,e),ot(en,n)}function R0(t,e,n){var i=t.stateNode;if(e=e.childContextTypes,typeof i.getChildContext!="function")return n;i=i.getChildContext();for(var r in i)if(!(r in e))throw Error(ie(108,sv(t)||"Unknown",r));return gt({},n,i)}function sl(t){return t=(t=t.stateNode)&&t.__reactInternalMemoizedMergedChildContext||Wi,_r=Bt.current,ot(Bt,t),ot(en,en.current),!0}function Oh(t,e,n){var i=t.stateNode;if(!i)throw Error(ie(169));n?(t=R0(t,e,_r),i.__reactInternalMemoizedMergedChildContext=t,dt(en),dt(Bt),ot(Bt,t)):dt(en),ot(en,n)}var si=null,Nl=!1,fc=!1;function N0(t){si===null?si=[t]:si.push(t)}function M_(t){Nl=!0,N0(t)}function Ki(){if(!fc&&si!==null){fc=!0;var t=0,e=it;try{var n=si;for(it=1;t<n.length;t++){var i=n[t];do i=i(!0);while(i!==null)}si=null,Nl=!1}catch(r){throw si!==null&&(si=si.slice(t+1)),t0(Kd,Ki),r}finally{it=e,fc=!1}}return null}var Zr=[],Qr=0,al=null,ol=0,_n=[],yn=0,yr=null,ai=1,oi="";function sr(t,e){Zr[Qr++]=ol,Zr[Qr++]=al,al=t,ol=e}function P0(t,e,n){_n[yn++]=ai,_n[yn++]=oi,_n[yn++]=yr,yr=t;var i=ai;t=oi;var r=32-On(i)-1;i&=~(1<<r),n+=1;var s=32-On(e)+r;if(30<s){var a=r-r%5;s=(i&(1<<a)-1).toString(32),i>>=a,r-=a,ai=1<<32-On(e)+r|n<<r|i,oi=s+t}else ai=1<<s|n<<r|i,oi=t}function af(t){t.return!==null&&(sr(t,1),P0(t,1,0))}function of(t){for(;t===al;)al=Zr[--Qr],Zr[Qr]=null,ol=Zr[--Qr],Zr[Qr]=null;for(;t===yr;)yr=_n[--yn],_n[yn]=null,oi=_n[--yn],_n[yn]=null,ai=_n[--yn],_n[yn]=null}var fn=null,dn=null,ht=!1,Un=null;function L0(t,e){var n=Mn(5,null,null,0);n.elementType="DELETED",n.stateNode=e,n.return=t,e=t.deletions,e===null?(t.deletions=[n],t.flags|=16):e.push(n)}function zh(t,e){switch(t.tag){case 5:var n=t.type;return e=e.nodeType!==1||n.toLowerCase()!==e.nodeName.toLowerCase()?null:e,e!==null?(t.stateNode=e,fn=t,dn=Fi(e.firstChild),!0):!1;case 6:return e=t.pendingProps===""||e.nodeType!==3?null:e,e!==null?(t.stateNode=e,fn=t,dn=null,!0):!1;case 13:return e=e.nodeType!==8?null:e,e!==null?(n=yr!==null?{id:ai,overflow:oi}:null,t.memoizedState={dehydrated:e,treeContext:n,retryLane:1073741824},n=Mn(18,null,null,0),n.stateNode=e,n.return=t,t.child=n,fn=t,dn=null,!0):!1;default:return!1}}function Cu(t){return(t.mode&1)!==0&&(t.flags&128)===0}function Ru(t){if(ht){var e=dn;if(e){var n=e;if(!zh(t,e)){if(Cu(t))throw Error(ie(418));e=Fi(n.nextSibling);var i=fn;e&&zh(t,e)?L0(i,n):(t.flags=t.flags&-4097|2,ht=!1,fn=t)}}else{if(Cu(t))throw Error(ie(418));t.flags=t.flags&-4097|2,ht=!1,fn=t}}}function Bh(t){for(t=t.return;t!==null&&t.tag!==5&&t.tag!==3&&t.tag!==13;)t=t.return;fn=t}function eo(t){if(t!==fn)return!1;if(!ht)return Bh(t),ht=!0,!1;var e;if((e=t.tag!==3)&&!(e=t.tag!==5)&&(e=t.type,e=e!=="head"&&e!=="body"&&!Eu(t.type,t.memoizedProps)),e&&(e=dn)){if(Cu(t))throw D0(),Error(ie(418));for(;e;)L0(t,e),e=Fi(e.nextSibling)}if(Bh(t),t.tag===13){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(ie(317));e:{for(t=t.nextSibling,e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="/$"){if(e===0){dn=Fi(t.nextSibling);break e}e--}else n!=="$"&&n!=="$!"&&n!=="$?"||e++}t=t.nextSibling}dn=null}}else dn=fn?Fi(t.stateNode.nextSibling):null;return!0}function D0(){for(var t=dn;t;)t=Fi(t.nextSibling)}function ps(){dn=fn=null,ht=!1}function lf(t){Un===null?Un=[t]:Un.push(t)}var w_=gi.ReactCurrentBatchConfig;function Fs(t,e,n){if(t=n.ref,t!==null&&typeof t!="function"&&typeof t!="object"){if(n._owner){if(n=n._owner,n){if(n.tag!==1)throw Error(ie(309));var i=n.stateNode}if(!i)throw Error(ie(147,t));var r=i,s=""+t;return e!==null&&e.ref!==null&&typeof e.ref=="function"&&e.ref._stringRef===s?e.ref:(e=function(a){var o=r.refs;a===null?delete o[s]:o[s]=a},e._stringRef=s,e)}if(typeof t!="string")throw Error(ie(284));if(!n._owner)throw Error(ie(290,t))}return t}function to(t,e){throw t=Object.prototype.toString.call(e),Error(ie(31,t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t))}function Hh(t){var e=t._init;return e(t._payload)}function I0(t){function e(u,_){if(t){var x=u.deletions;x===null?(u.deletions=[_],u.flags|=16):x.push(_)}}function n(u,_){if(!t)return null;for(;_!==null;)e(u,_),_=_.sibling;return null}function i(u,_){for(u=new Map;_!==null;)_.key!==null?u.set(_.key,_):u.set(_.index,_),_=_.sibling;return u}function r(u,_){return u=Hi(u,_),u.index=0,u.sibling=null,u}function s(u,_,x){return u.index=x,t?(x=u.alternate,x!==null?(x=x.index,x<_?(u.flags|=2,_):x):(u.flags|=2,_)):(u.flags|=1048576,_)}function a(u){return t&&u.alternate===null&&(u.flags|=2),u}function o(u,_,x,w){return _===null||_.tag!==6?(_=_c(x,u.mode,w),_.return=u,_):(_=r(_,x),_.return=u,_)}function l(u,_,x,w){var P=x.type;return P===Wr?d(u,_,x.props.children,w,x.key):_!==null&&(_.elementType===P||typeof P=="object"&&P!==null&&P.$$typeof===Ai&&Hh(P)===_.type)?(w=r(_,x.props),w.ref=Fs(u,_,x),w.return=u,w):(w=Ho(x.type,x.key,x.props,null,u.mode,w),w.ref=Fs(u,_,x),w.return=u,w)}function c(u,_,x,w){return _===null||_.tag!==4||_.stateNode.containerInfo!==x.containerInfo||_.stateNode.implementation!==x.implementation?(_=yc(x,u.mode,w),_.return=u,_):(_=r(_,x.children||[]),_.return=u,_)}function d(u,_,x,w,P){return _===null||_.tag!==7?(_=xr(x,u.mode,w,P),_.return=u,_):(_=r(_,x),_.return=u,_)}function p(u,_,x){if(typeof _=="string"&&_!==""||typeof _=="number")return _=_c(""+_,u.mode,x),_.return=u,_;if(typeof _=="object"&&_!==null){switch(_.$$typeof){case Ga:return x=Ho(_.type,_.key,_.props,null,u.mode,x),x.ref=Fs(u,null,_),x.return=u,x;case Gr:return _=yc(_,u.mode,x),_.return=u,_;case Ai:var w=_._init;return p(u,w(_._payload),x)}if(Ys(_)||Ls(_))return _=xr(_,u.mode,x,null),_.return=u,_;to(u,_)}return null}function h(u,_,x,w){var P=_!==null?_.key:null;if(typeof x=="string"&&x!==""||typeof x=="number")return P!==null?null:o(u,_,""+x,w);if(typeof x=="object"&&x!==null){switch(x.$$typeof){case Ga:return x.key===P?l(u,_,x,w):null;case Gr:return x.key===P?c(u,_,x,w):null;case Ai:return P=x._init,h(u,_,P(x._payload),w)}if(Ys(x)||Ls(x))return P!==null?null:d(u,_,x,w,null);to(u,x)}return null}function g(u,_,x,w,P){if(typeof w=="string"&&w!==""||typeof w=="number")return u=u.get(x)||null,o(_,u,""+w,P);if(typeof w=="object"&&w!==null){switch(w.$$typeof){case Ga:return u=u.get(w.key===null?x:w.key)||null,l(_,u,w,P);case Gr:return u=u.get(w.key===null?x:w.key)||null,c(_,u,w,P);case Ai:var b=w._init;return g(u,_,x,b(w._payload),P)}if(Ys(w)||Ls(w))return u=u.get(x)||null,d(_,u,w,P,null);to(_,w)}return null}function v(u,_,x,w){for(var P=null,b=null,A=_,N=_=0,V=null;A!==null&&N<x.length;N++){A.index>N?(V=A,A=null):V=A.sibling;var y=h(u,A,x[N],w);if(y===null){A===null&&(A=V);break}t&&A&&y.alternate===null&&e(u,A),_=s(y,_,N),b===null?P=y:b.sibling=y,b=y,A=V}if(N===x.length)return n(u,A),ht&&sr(u,N),P;if(A===null){for(;N<x.length;N++)A=p(u,x[N],w),A!==null&&(_=s(A,_,N),b===null?P=A:b.sibling=A,b=A);return ht&&sr(u,N),P}for(A=i(u,A);N<x.length;N++)V=g(A,u,N,x[N],w),V!==null&&(t&&V.alternate!==null&&A.delete(V.key===null?N:V.key),_=s(V,_,N),b===null?P=V:b.sibling=V,b=V);return t&&A.forEach(function(T){return e(u,T)}),ht&&sr(u,N),P}function S(u,_,x,w){var P=Ls(x);if(typeof P!="function")throw Error(ie(150));if(x=P.call(x),x==null)throw Error(ie(151));for(var b=P=null,A=_,N=_=0,V=null,y=x.next();A!==null&&!y.done;N++,y=x.next()){A.index>N?(V=A,A=null):V=A.sibling;var T=h(u,A,y.value,w);if(T===null){A===null&&(A=V);break}t&&A&&T.alternate===null&&e(u,A),_=s(T,_,N),b===null?P=T:b.sibling=T,b=T,A=V}if(y.done)return n(u,A),ht&&sr(u,N),P;if(A===null){for(;!y.done;N++,y=x.next())y=p(u,y.value,w),y!==null&&(_=s(y,_,N),b===null?P=y:b.sibling=y,b=y);return ht&&sr(u,N),P}for(A=i(u,A);!y.done;N++,y=x.next())y=g(A,u,N,y.value,w),y!==null&&(t&&y.alternate!==null&&A.delete(y.key===null?N:y.key),_=s(y,_,N),b===null?P=y:b.sibling=y,b=y);return t&&A.forEach(function(j){return e(u,j)}),ht&&sr(u,N),P}function m(u,_,x,w){if(typeof x=="object"&&x!==null&&x.type===Wr&&x.key===null&&(x=x.props.children),typeof x=="object"&&x!==null){switch(x.$$typeof){case Ga:e:{for(var P=x.key,b=_;b!==null;){if(b.key===P){if(P=x.type,P===Wr){if(b.tag===7){n(u,b.sibling),_=r(b,x.props.children),_.return=u,u=_;break e}}else if(b.elementType===P||typeof P=="object"&&P!==null&&P.$$typeof===Ai&&Hh(P)===b.type){n(u,b.sibling),_=r(b,x.props),_.ref=Fs(u,b,x),_.return=u,u=_;break e}n(u,b);break}else e(u,b);b=b.sibling}x.type===Wr?(_=xr(x.props.children,u.mode,w,x.key),_.return=u,u=_):(w=Ho(x.type,x.key,x.props,null,u.mode,w),w.ref=Fs(u,_,x),w.return=u,u=w)}return a(u);case Gr:e:{for(b=x.key;_!==null;){if(_.key===b)if(_.tag===4&&_.stateNode.containerInfo===x.containerInfo&&_.stateNode.implementation===x.implementation){n(u,_.sibling),_=r(_,x.children||[]),_.return=u,u=_;break e}else{n(u,_);break}else e(u,_);_=_.sibling}_=yc(x,u.mode,w),_.return=u,u=_}return a(u);case Ai:return b=x._init,m(u,_,b(x._payload),w)}if(Ys(x))return v(u,_,x,w);if(Ls(x))return S(u,_,x,w);to(u,x)}return typeof x=="string"&&x!==""||typeof x=="number"?(x=""+x,_!==null&&_.tag===6?(n(u,_.sibling),_=r(_,x),_.return=u,u=_):(n(u,_),_=_c(x,u.mode,w),_.return=u,u=_),a(u)):n(u,_)}return m}var ms=I0(!0),U0=I0(!1),ll=$i(null),cl=null,Jr=null,cf=null;function uf(){cf=Jr=cl=null}function df(t){var e=ll.current;dt(ll),t._currentValue=e}function Nu(t,e,n){for(;t!==null;){var i=t.alternate;if((t.childLanes&e)!==e?(t.childLanes|=e,i!==null&&(i.childLanes|=e)):i!==null&&(i.childLanes&e)!==e&&(i.childLanes|=e),t===n)break;t=t.return}}function os(t,e){cl=t,cf=Jr=null,t=t.dependencies,t!==null&&t.firstContext!==null&&(t.lanes&e&&(Jt=!0),t.firstContext=null)}function bn(t){var e=t._currentValue;if(cf!==t)if(t={context:t,memoizedValue:e,next:null},Jr===null){if(cl===null)throw Error(ie(308));Jr=t,cl.dependencies={lanes:0,firstContext:t}}else Jr=Jr.next=t;return e}var fr=null;function ff(t){fr===null?fr=[t]:fr.push(t)}function k0(t,e,n,i){var r=e.interleaved;return r===null?(n.next=n,ff(e)):(n.next=r.next,r.next=n),e.interleaved=n,hi(t,i)}function hi(t,e){t.lanes|=e;var n=t.alternate;for(n!==null&&(n.lanes|=e),n=t,t=t.return;t!==null;)t.childLanes|=e,n=t.alternate,n!==null&&(n.childLanes|=e),n=t,t=t.return;return n.tag===3?n.stateNode:null}var Ci=!1;function hf(t){t.updateQueue={baseState:t.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function F0(t,e){t=t.updateQueue,e.updateQueue===t&&(e.updateQueue={baseState:t.baseState,firstBaseUpdate:t.firstBaseUpdate,lastBaseUpdate:t.lastBaseUpdate,shared:t.shared,effects:t.effects})}function ui(t,e){return{eventTime:t,lane:e,tag:0,payload:null,callback:null,next:null}}function Oi(t,e,n){var i=t.updateQueue;if(i===null)return null;if(i=i.shared,qe&2){var r=i.pending;return r===null?e.next=e:(e.next=r.next,r.next=e),i.pending=e,hi(t,n)}return r=i.interleaved,r===null?(e.next=e,ff(i)):(e.next=r.next,r.next=e),i.interleaved=e,hi(t,n)}function Uo(t,e,n){if(e=e.updateQueue,e!==null&&(e=e.shared,(n&4194240)!==0)){var i=e.lanes;i&=t.pendingLanes,n|=i,e.lanes=n,Zd(t,n)}}function Vh(t,e){var n=t.updateQueue,i=t.alternate;if(i!==null&&(i=i.updateQueue,n===i)){var r=null,s=null;if(n=n.firstBaseUpdate,n!==null){do{var a={eventTime:n.eventTime,lane:n.lane,tag:n.tag,payload:n.payload,callback:n.callback,next:null};s===null?r=s=a:s=s.next=a,n=n.next}while(n!==null);s===null?r=s=e:s=s.next=e}else r=s=e;n={baseState:i.baseState,firstBaseUpdate:r,lastBaseUpdate:s,shared:i.shared,effects:i.effects},t.updateQueue=n;return}t=n.lastBaseUpdate,t===null?n.firstBaseUpdate=e:t.next=e,n.lastBaseUpdate=e}function ul(t,e,n,i){var r=t.updateQueue;Ci=!1;var s=r.firstBaseUpdate,a=r.lastBaseUpdate,o=r.shared.pending;if(o!==null){r.shared.pending=null;var l=o,c=l.next;l.next=null,a===null?s=c:a.next=c,a=l;var d=t.alternate;d!==null&&(d=d.updateQueue,o=d.lastBaseUpdate,o!==a&&(o===null?d.firstBaseUpdate=c:o.next=c,d.lastBaseUpdate=l))}if(s!==null){var p=r.baseState;a=0,d=c=l=null,o=s;do{var h=o.lane,g=o.eventTime;if((i&h)===h){d!==null&&(d=d.next={eventTime:g,lane:0,tag:o.tag,payload:o.payload,callback:o.callback,next:null});e:{var v=t,S=o;switch(h=e,g=n,S.tag){case 1:if(v=S.payload,typeof v=="function"){p=v.call(g,p,h);break e}p=v;break e;case 3:v.flags=v.flags&-65537|128;case 0:if(v=S.payload,h=typeof v=="function"?v.call(g,p,h):v,h==null)break e;p=gt({},p,h);break e;case 2:Ci=!0}}o.callback!==null&&o.lane!==0&&(t.flags|=64,h=r.effects,h===null?r.effects=[o]:h.push(o))}else g={eventTime:g,lane:h,tag:o.tag,payload:o.payload,callback:o.callback,next:null},d===null?(c=d=g,l=p):d=d.next=g,a|=h;if(o=o.next,o===null){if(o=r.shared.pending,o===null)break;h=o,o=h.next,h.next=null,r.lastBaseUpdate=h,r.shared.pending=null}}while(!0);if(d===null&&(l=p),r.baseState=l,r.firstBaseUpdate=c,r.lastBaseUpdate=d,e=r.shared.interleaved,e!==null){r=e;do a|=r.lane,r=r.next;while(r!==e)}else s===null&&(r.shared.lanes=0);Mr|=a,t.lanes=a,t.memoizedState=p}}function jh(t,e,n){if(t=e.effects,e.effects=null,t!==null)for(e=0;e<t.length;e++){var i=t[e],r=i.callback;if(r!==null){if(i.callback=null,i=n,typeof r!="function")throw Error(ie(191,r));r.call(i)}}}var Ia={},$n=$i(Ia),ya=$i(Ia),Sa=$i(Ia);function hr(t){if(t===Ia)throw Error(ie(174));return t}function pf(t,e){switch(ot(Sa,e),ot(ya,t),ot($n,Ia),t=e.nodeType,t){case 9:case 11:e=(e=e.documentElement)?e.namespaceURI:uu(null,"");break;default:t=t===8?e.parentNode:e,e=t.namespaceURI||null,t=t.tagName,e=uu(e,t)}dt($n),ot($n,e)}function gs(){dt($n),dt(ya),dt(Sa)}function O0(t){hr(Sa.current);var e=hr($n.current),n=uu(e,t.type);e!==n&&(ot(ya,t),ot($n,n))}function mf(t){ya.current===t&&(dt($n),dt(ya))}var pt=$i(0);function dl(t){for(var e=t;e!==null;){if(e.tag===13){var n=e.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||n.data==="$?"||n.data==="$!"))return e}else if(e.tag===19&&e.memoizedProps.revealOrder!==void 0){if(e.flags&128)return e}else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return null;e=e.return}e.sibling.return=e.return,e=e.sibling}return null}var hc=[];function gf(){for(var t=0;t<hc.length;t++)hc[t]._workInProgressVersionPrimary=null;hc.length=0}var ko=gi.ReactCurrentDispatcher,pc=gi.ReactCurrentBatchConfig,Sr=0,mt=null,Et=null,Rt=null,fl=!1,ra=!1,Ma=0,E_=0;function Ut(){throw Error(ie(321))}function xf(t,e){if(e===null)return!1;for(var n=0;n<e.length&&n<t.length;n++)if(!Bn(t[n],e[n]))return!1;return!0}function vf(t,e,n,i,r,s){if(Sr=s,mt=e,e.memoizedState=null,e.updateQueue=null,e.lanes=0,ko.current=t===null||t.memoizedState===null?C_:R_,t=n(i,r),ra){s=0;do{if(ra=!1,Ma=0,25<=s)throw Error(ie(301));s+=1,Rt=Et=null,e.updateQueue=null,ko.current=N_,t=n(i,r)}while(ra)}if(ko.current=hl,e=Et!==null&&Et.next!==null,Sr=0,Rt=Et=mt=null,fl=!1,e)throw Error(ie(300));return t}function _f(){var t=Ma!==0;return Ma=0,t}function Vn(){var t={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Rt===null?mt.memoizedState=Rt=t:Rt=Rt.next=t,Rt}function An(){if(Et===null){var t=mt.alternate;t=t!==null?t.memoizedState:null}else t=Et.next;var e=Rt===null?mt.memoizedState:Rt.next;if(e!==null)Rt=e,Et=t;else{if(t===null)throw Error(ie(310));Et=t,t={memoizedState:Et.memoizedState,baseState:Et.baseState,baseQueue:Et.baseQueue,queue:Et.queue,next:null},Rt===null?mt.memoizedState=Rt=t:Rt=Rt.next=t}return Rt}function wa(t,e){return typeof e=="function"?e(t):e}function mc(t){var e=An(),n=e.queue;if(n===null)throw Error(ie(311));n.lastRenderedReducer=t;var i=Et,r=i.baseQueue,s=n.pending;if(s!==null){if(r!==null){var a=r.next;r.next=s.next,s.next=a}i.baseQueue=r=s,n.pending=null}if(r!==null){s=r.next,i=i.baseState;var o=a=null,l=null,c=s;do{var d=c.lane;if((Sr&d)===d)l!==null&&(l=l.next={lane:0,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null}),i=c.hasEagerState?c.eagerState:t(i,c.action);else{var p={lane:d,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null};l===null?(o=l=p,a=i):l=l.next=p,mt.lanes|=d,Mr|=d}c=c.next}while(c!==null&&c!==s);l===null?a=i:l.next=o,Bn(i,e.memoizedState)||(Jt=!0),e.memoizedState=i,e.baseState=a,e.baseQueue=l,n.lastRenderedState=i}if(t=n.interleaved,t!==null){r=t;do s=r.lane,mt.lanes|=s,Mr|=s,r=r.next;while(r!==t)}else r===null&&(n.lanes=0);return[e.memoizedState,n.dispatch]}function gc(t){var e=An(),n=e.queue;if(n===null)throw Error(ie(311));n.lastRenderedReducer=t;var i=n.dispatch,r=n.pending,s=e.memoizedState;if(r!==null){n.pending=null;var a=r=r.next;do s=t(s,a.action),a=a.next;while(a!==r);Bn(s,e.memoizedState)||(Jt=!0),e.memoizedState=s,e.baseQueue===null&&(e.baseState=s),n.lastRenderedState=s}return[s,i]}function z0(){}function B0(t,e){var n=mt,i=An(),r=e(),s=!Bn(i.memoizedState,r);if(s&&(i.memoizedState=r,Jt=!0),i=i.queue,yf(j0.bind(null,n,i,t),[t]),i.getSnapshot!==e||s||Rt!==null&&Rt.memoizedState.tag&1){if(n.flags|=2048,Ea(9,V0.bind(null,n,i,r,e),void 0,null),Nt===null)throw Error(ie(349));Sr&30||H0(n,e,r)}return r}function H0(t,e,n){t.flags|=16384,t={getSnapshot:e,value:n},e=mt.updateQueue,e===null?(e={lastEffect:null,stores:null},mt.updateQueue=e,e.stores=[t]):(n=e.stores,n===null?e.stores=[t]:n.push(t))}function V0(t,e,n,i){e.value=n,e.getSnapshot=i,G0(e)&&W0(t)}function j0(t,e,n){return n(function(){G0(e)&&W0(t)})}function G0(t){var e=t.getSnapshot;t=t.value;try{var n=e();return!Bn(t,n)}catch{return!0}}function W0(t){var e=hi(t,1);e!==null&&zn(e,t,1,-1)}function Gh(t){var e=Vn();return typeof t=="function"&&(t=t()),e.memoizedState=e.baseState=t,t={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:wa,lastRenderedState:t},e.queue=t,t=t.dispatch=A_.bind(null,mt,t),[e.memoizedState,t]}function Ea(t,e,n,i){return t={tag:t,create:e,destroy:n,deps:i,next:null},e=mt.updateQueue,e===null?(e={lastEffect:null,stores:null},mt.updateQueue=e,e.lastEffect=t.next=t):(n=e.lastEffect,n===null?e.lastEffect=t.next=t:(i=n.next,n.next=t,t.next=i,e.lastEffect=t)),t}function X0(){return An().memoizedState}function Fo(t,e,n,i){var r=Vn();mt.flags|=t,r.memoizedState=Ea(1|e,n,void 0,i===void 0?null:i)}function Pl(t,e,n,i){var r=An();i=i===void 0?null:i;var s=void 0;if(Et!==null){var a=Et.memoizedState;if(s=a.destroy,i!==null&&xf(i,a.deps)){r.memoizedState=Ea(e,n,s,i);return}}mt.flags|=t,r.memoizedState=Ea(1|e,n,s,i)}function Wh(t,e){return Fo(8390656,8,t,e)}function yf(t,e){return Pl(2048,8,t,e)}function q0(t,e){return Pl(4,2,t,e)}function Y0(t,e){return Pl(4,4,t,e)}function $0(t,e){if(typeof e=="function")return t=t(),e(t),function(){e(null)};if(e!=null)return t=t(),e.current=t,function(){e.current=null}}function K0(t,e,n){return n=n!=null?n.concat([t]):null,Pl(4,4,$0.bind(null,e,t),n)}function Sf(){}function Z0(t,e){var n=An();e=e===void 0?null:e;var i=n.memoizedState;return i!==null&&e!==null&&xf(e,i[1])?i[0]:(n.memoizedState=[t,e],t)}function Q0(t,e){var n=An();e=e===void 0?null:e;var i=n.memoizedState;return i!==null&&e!==null&&xf(e,i[1])?i[0]:(t=t(),n.memoizedState=[t,e],t)}function J0(t,e,n){return Sr&21?(Bn(n,e)||(n=r0(),mt.lanes|=n,Mr|=n,t.baseState=!0),e):(t.baseState&&(t.baseState=!1,Jt=!0),t.memoizedState=n)}function T_(t,e){var n=it;it=n!==0&&4>n?n:4,t(!0);var i=pc.transition;pc.transition={};try{t(!1),e()}finally{it=n,pc.transition=i}}function eg(){return An().memoizedState}function b_(t,e,n){var i=Bi(t);if(n={lane:i,action:n,hasEagerState:!1,eagerState:null,next:null},tg(t))ng(e,n);else if(n=k0(t,e,n,i),n!==null){var r=jt();zn(n,t,i,r),ig(n,e,i)}}function A_(t,e,n){var i=Bi(t),r={lane:i,action:n,hasEagerState:!1,eagerState:null,next:null};if(tg(t))ng(e,r);else{var s=t.alternate;if(t.lanes===0&&(s===null||s.lanes===0)&&(s=e.lastRenderedReducer,s!==null))try{var a=e.lastRenderedState,o=s(a,n);if(r.hasEagerState=!0,r.eagerState=o,Bn(o,a)){var l=e.interleaved;l===null?(r.next=r,ff(e)):(r.next=l.next,l.next=r),e.interleaved=r;return}}catch{}finally{}n=k0(t,e,r,i),n!==null&&(r=jt(),zn(n,t,i,r),ig(n,e,i))}}function tg(t){var e=t.alternate;return t===mt||e!==null&&e===mt}function ng(t,e){ra=fl=!0;var n=t.pending;n===null?e.next=e:(e.next=n.next,n.next=e),t.pending=e}function ig(t,e,n){if(n&4194240){var i=e.lanes;i&=t.pendingLanes,n|=i,e.lanes=n,Zd(t,n)}}var hl={readContext:bn,useCallback:Ut,useContext:Ut,useEffect:Ut,useImperativeHandle:Ut,useInsertionEffect:Ut,useLayoutEffect:Ut,useMemo:Ut,useReducer:Ut,useRef:Ut,useState:Ut,useDebugValue:Ut,useDeferredValue:Ut,useTransition:Ut,useMutableSource:Ut,useSyncExternalStore:Ut,useId:Ut,unstable_isNewReconciler:!1},C_={readContext:bn,useCallback:function(t,e){return Vn().memoizedState=[t,e===void 0?null:e],t},useContext:bn,useEffect:Wh,useImperativeHandle:function(t,e,n){return n=n!=null?n.concat([t]):null,Fo(4194308,4,$0.bind(null,e,t),n)},useLayoutEffect:function(t,e){return Fo(4194308,4,t,e)},useInsertionEffect:function(t,e){return Fo(4,2,t,e)},useMemo:function(t,e){var n=Vn();return e=e===void 0?null:e,t=t(),n.memoizedState=[t,e],t},useReducer:function(t,e,n){var i=Vn();return e=n!==void 0?n(e):e,i.memoizedState=i.baseState=e,t={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:t,lastRenderedState:e},i.queue=t,t=t.dispatch=b_.bind(null,mt,t),[i.memoizedState,t]},useRef:function(t){var e=Vn();return t={current:t},e.memoizedState=t},useState:Gh,useDebugValue:Sf,useDeferredValue:function(t){return Vn().memoizedState=t},useTransition:function(){var t=Gh(!1),e=t[0];return t=T_.bind(null,t[1]),Vn().memoizedState=t,[e,t]},useMutableSource:function(){},useSyncExternalStore:function(t,e,n){var i=mt,r=Vn();if(ht){if(n===void 0)throw Error(ie(407));n=n()}else{if(n=e(),Nt===null)throw Error(ie(349));Sr&30||H0(i,e,n)}r.memoizedState=n;var s={value:n,getSnapshot:e};return r.queue=s,Wh(j0.bind(null,i,s,t),[t]),i.flags|=2048,Ea(9,V0.bind(null,i,s,n,e),void 0,null),n},useId:function(){var t=Vn(),e=Nt.identifierPrefix;if(ht){var n=oi,i=ai;n=(i&~(1<<32-On(i)-1)).toString(32)+n,e=":"+e+"R"+n,n=Ma++,0<n&&(e+="H"+n.toString(32)),e+=":"}else n=E_++,e=":"+e+"r"+n.toString(32)+":";return t.memoizedState=e},unstable_isNewReconciler:!1},R_={readContext:bn,useCallback:Z0,useContext:bn,useEffect:yf,useImperativeHandle:K0,useInsertionEffect:q0,useLayoutEffect:Y0,useMemo:Q0,useReducer:mc,useRef:X0,useState:function(){return mc(wa)},useDebugValue:Sf,useDeferredValue:function(t){var e=An();return J0(e,Et.memoizedState,t)},useTransition:function(){var t=mc(wa)[0],e=An().memoizedState;return[t,e]},useMutableSource:z0,useSyncExternalStore:B0,useId:eg,unstable_isNewReconciler:!1},N_={readContext:bn,useCallback:Z0,useContext:bn,useEffect:yf,useImperativeHandle:K0,useInsertionEffect:q0,useLayoutEffect:Y0,useMemo:Q0,useReducer:gc,useRef:X0,useState:function(){return gc(wa)},useDebugValue:Sf,useDeferredValue:function(t){var e=An();return Et===null?e.memoizedState=t:J0(e,Et.memoizedState,t)},useTransition:function(){var t=gc(wa)[0],e=An().memoizedState;return[t,e]},useMutableSource:z0,useSyncExternalStore:B0,useId:eg,unstable_isNewReconciler:!1};function Dn(t,e){if(t&&t.defaultProps){e=gt({},e),t=t.defaultProps;for(var n in t)e[n]===void 0&&(e[n]=t[n]);return e}return e}function Pu(t,e,n,i){e=t.memoizedState,n=n(i,e),n=n==null?e:gt({},e,n),t.memoizedState=n,t.lanes===0&&(t.updateQueue.baseState=n)}var Ll={isMounted:function(t){return(t=t._reactInternals)?Ar(t)===t:!1},enqueueSetState:function(t,e,n){t=t._reactInternals;var i=jt(),r=Bi(t),s=ui(i,r);s.payload=e,n!=null&&(s.callback=n),e=Oi(t,s,r),e!==null&&(zn(e,t,r,i),Uo(e,t,r))},enqueueReplaceState:function(t,e,n){t=t._reactInternals;var i=jt(),r=Bi(t),s=ui(i,r);s.tag=1,s.payload=e,n!=null&&(s.callback=n),e=Oi(t,s,r),e!==null&&(zn(e,t,r,i),Uo(e,t,r))},enqueueForceUpdate:function(t,e){t=t._reactInternals;var n=jt(),i=Bi(t),r=ui(n,i);r.tag=2,e!=null&&(r.callback=e),e=Oi(t,r,i),e!==null&&(zn(e,t,i,n),Uo(e,t,i))}};function Xh(t,e,n,i,r,s,a){return t=t.stateNode,typeof t.shouldComponentUpdate=="function"?t.shouldComponentUpdate(i,s,a):e.prototype&&e.prototype.isPureReactComponent?!ga(n,i)||!ga(r,s):!0}function rg(t,e,n){var i=!1,r=Wi,s=e.contextType;return typeof s=="object"&&s!==null?s=bn(s):(r=tn(e)?_r:Bt.current,i=e.contextTypes,s=(i=i!=null)?hs(t,r):Wi),e=new e(n,s),t.memoizedState=e.state!==null&&e.state!==void 0?e.state:null,e.updater=Ll,t.stateNode=e,e._reactInternals=t,i&&(t=t.stateNode,t.__reactInternalMemoizedUnmaskedChildContext=r,t.__reactInternalMemoizedMaskedChildContext=s),e}function qh(t,e,n,i){t=e.state,typeof e.componentWillReceiveProps=="function"&&e.componentWillReceiveProps(n,i),typeof e.UNSAFE_componentWillReceiveProps=="function"&&e.UNSAFE_componentWillReceiveProps(n,i),e.state!==t&&Ll.enqueueReplaceState(e,e.state,null)}function Lu(t,e,n,i){var r=t.stateNode;r.props=n,r.state=t.memoizedState,r.refs={},hf(t);var s=e.contextType;typeof s=="object"&&s!==null?r.context=bn(s):(s=tn(e)?_r:Bt.current,r.context=hs(t,s)),r.state=t.memoizedState,s=e.getDerivedStateFromProps,typeof s=="function"&&(Pu(t,e,s,n),r.state=t.memoizedState),typeof e.getDerivedStateFromProps=="function"||typeof r.getSnapshotBeforeUpdate=="function"||typeof r.UNSAFE_componentWillMount!="function"&&typeof r.componentWillMount!="function"||(e=r.state,typeof r.componentWillMount=="function"&&r.componentWillMount(),typeof r.UNSAFE_componentWillMount=="function"&&r.UNSAFE_componentWillMount(),e!==r.state&&Ll.enqueueReplaceState(r,r.state,null),ul(t,n,r,i),r.state=t.memoizedState),typeof r.componentDidMount=="function"&&(t.flags|=4194308)}function xs(t,e){try{var n="",i=e;do n+=rv(i),i=i.return;while(i);var r=n}catch(s){r=`
Error generating stack: `+s.message+`
`+s.stack}return{value:t,source:e,stack:r,digest:null}}function xc(t,e,n){return{value:t,source:null,stack:n??null,digest:e??null}}function Du(t,e){try{console.error(e.value)}catch(n){setTimeout(function(){throw n})}}var P_=typeof WeakMap=="function"?WeakMap:Map;function sg(t,e,n){n=ui(-1,n),n.tag=3,n.payload={element:null};var i=e.value;return n.callback=function(){ml||(ml=!0,ju=i),Du(t,e)},n}function ag(t,e,n){n=ui(-1,n),n.tag=3;var i=t.type.getDerivedStateFromError;if(typeof i=="function"){var r=e.value;n.payload=function(){return i(r)},n.callback=function(){Du(t,e)}}var s=t.stateNode;return s!==null&&typeof s.componentDidCatch=="function"&&(n.callback=function(){Du(t,e),typeof i!="function"&&(zi===null?zi=new Set([this]):zi.add(this));var a=e.stack;this.componentDidCatch(e.value,{componentStack:a!==null?a:""})}),n}function Yh(t,e,n){var i=t.pingCache;if(i===null){i=t.pingCache=new P_;var r=new Set;i.set(e,r)}else r=i.get(e),r===void 0&&(r=new Set,i.set(e,r));r.has(n)||(r.add(n),t=W_.bind(null,t,e,n),e.then(t,t))}function $h(t){do{var e;if((e=t.tag===13)&&(e=t.memoizedState,e=e!==null?e.dehydrated!==null:!0),e)return t;t=t.return}while(t!==null);return null}function Kh(t,e,n,i,r){return t.mode&1?(t.flags|=65536,t.lanes=r,t):(t===e?t.flags|=65536:(t.flags|=128,n.flags|=131072,n.flags&=-52805,n.tag===1&&(n.alternate===null?n.tag=17:(e=ui(-1,1),e.tag=2,Oi(n,e,1))),n.lanes|=1),t)}var L_=gi.ReactCurrentOwner,Jt=!1;function Vt(t,e,n,i){e.child=t===null?U0(e,null,n,i):ms(e,t.child,n,i)}function Zh(t,e,n,i,r){n=n.render;var s=e.ref;return os(e,r),i=vf(t,e,n,i,s,r),n=_f(),t!==null&&!Jt?(e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~r,pi(t,e,r)):(ht&&n&&af(e),e.flags|=1,Vt(t,e,i,r),e.child)}function Qh(t,e,n,i,r){if(t===null){var s=n.type;return typeof s=="function"&&!Rf(s)&&s.defaultProps===void 0&&n.compare===null&&n.defaultProps===void 0?(e.tag=15,e.type=s,og(t,e,s,i,r)):(t=Ho(n.type,null,i,e,e.mode,r),t.ref=e.ref,t.return=e,e.child=t)}if(s=t.child,!(t.lanes&r)){var a=s.memoizedProps;if(n=n.compare,n=n!==null?n:ga,n(a,i)&&t.ref===e.ref)return pi(t,e,r)}return e.flags|=1,t=Hi(s,i),t.ref=e.ref,t.return=e,e.child=t}function og(t,e,n,i,r){if(t!==null){var s=t.memoizedProps;if(ga(s,i)&&t.ref===e.ref)if(Jt=!1,e.pendingProps=i=s,(t.lanes&r)!==0)t.flags&131072&&(Jt=!0);else return e.lanes=t.lanes,pi(t,e,r)}return Iu(t,e,n,i,r)}function lg(t,e,n){var i=e.pendingProps,r=i.children,s=t!==null?t.memoizedState:null;if(i.mode==="hidden")if(!(e.mode&1))e.memoizedState={baseLanes:0,cachePool:null,transitions:null},ot(ts,cn),cn|=n;else{if(!(n&1073741824))return t=s!==null?s.baseLanes|n:n,e.lanes=e.childLanes=1073741824,e.memoizedState={baseLanes:t,cachePool:null,transitions:null},e.updateQueue=null,ot(ts,cn),cn|=t,null;e.memoizedState={baseLanes:0,cachePool:null,transitions:null},i=s!==null?s.baseLanes:n,ot(ts,cn),cn|=i}else s!==null?(i=s.baseLanes|n,e.memoizedState=null):i=n,ot(ts,cn),cn|=i;return Vt(t,e,r,n),e.child}function cg(t,e){var n=e.ref;(t===null&&n!==null||t!==null&&t.ref!==n)&&(e.flags|=512,e.flags|=2097152)}function Iu(t,e,n,i,r){var s=tn(n)?_r:Bt.current;return s=hs(e,s),os(e,r),n=vf(t,e,n,i,s,r),i=_f(),t!==null&&!Jt?(e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~r,pi(t,e,r)):(ht&&i&&af(e),e.flags|=1,Vt(t,e,n,r),e.child)}function Jh(t,e,n,i,r){if(tn(n)){var s=!0;sl(e)}else s=!1;if(os(e,r),e.stateNode===null)Oo(t,e),rg(e,n,i),Lu(e,n,i,r),i=!0;else if(t===null){var a=e.stateNode,o=e.memoizedProps;a.props=o;var l=a.context,c=n.contextType;typeof c=="object"&&c!==null?c=bn(c):(c=tn(n)?_r:Bt.current,c=hs(e,c));var d=n.getDerivedStateFromProps,p=typeof d=="function"||typeof a.getSnapshotBeforeUpdate=="function";p||typeof a.UNSAFE_componentWillReceiveProps!="function"&&typeof a.componentWillReceiveProps!="function"||(o!==i||l!==c)&&qh(e,a,i,c),Ci=!1;var h=e.memoizedState;a.state=h,ul(e,i,a,r),l=e.memoizedState,o!==i||h!==l||en.current||Ci?(typeof d=="function"&&(Pu(e,n,d,i),l=e.memoizedState),(o=Ci||Xh(e,n,o,i,h,l,c))?(p||typeof a.UNSAFE_componentWillMount!="function"&&typeof a.componentWillMount!="function"||(typeof a.componentWillMount=="function"&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount=="function"&&a.UNSAFE_componentWillMount()),typeof a.componentDidMount=="function"&&(e.flags|=4194308)):(typeof a.componentDidMount=="function"&&(e.flags|=4194308),e.memoizedProps=i,e.memoizedState=l),a.props=i,a.state=l,a.context=c,i=o):(typeof a.componentDidMount=="function"&&(e.flags|=4194308),i=!1)}else{a=e.stateNode,F0(t,e),o=e.memoizedProps,c=e.type===e.elementType?o:Dn(e.type,o),a.props=c,p=e.pendingProps,h=a.context,l=n.contextType,typeof l=="object"&&l!==null?l=bn(l):(l=tn(n)?_r:Bt.current,l=hs(e,l));var g=n.getDerivedStateFromProps;(d=typeof g=="function"||typeof a.getSnapshotBeforeUpdate=="function")||typeof a.UNSAFE_componentWillReceiveProps!="function"&&typeof a.componentWillReceiveProps!="function"||(o!==p||h!==l)&&qh(e,a,i,l),Ci=!1,h=e.memoizedState,a.state=h,ul(e,i,a,r);var v=e.memoizedState;o!==p||h!==v||en.current||Ci?(typeof g=="function"&&(Pu(e,n,g,i),v=e.memoizedState),(c=Ci||Xh(e,n,c,i,h,v,l)||!1)?(d||typeof a.UNSAFE_componentWillUpdate!="function"&&typeof a.componentWillUpdate!="function"||(typeof a.componentWillUpdate=="function"&&a.componentWillUpdate(i,v,l),typeof a.UNSAFE_componentWillUpdate=="function"&&a.UNSAFE_componentWillUpdate(i,v,l)),typeof a.componentDidUpdate=="function"&&(e.flags|=4),typeof a.getSnapshotBeforeUpdate=="function"&&(e.flags|=1024)):(typeof a.componentDidUpdate!="function"||o===t.memoizedProps&&h===t.memoizedState||(e.flags|=4),typeof a.getSnapshotBeforeUpdate!="function"||o===t.memoizedProps&&h===t.memoizedState||(e.flags|=1024),e.memoizedProps=i,e.memoizedState=v),a.props=i,a.state=v,a.context=l,i=c):(typeof a.componentDidUpdate!="function"||o===t.memoizedProps&&h===t.memoizedState||(e.flags|=4),typeof a.getSnapshotBeforeUpdate!="function"||o===t.memoizedProps&&h===t.memoizedState||(e.flags|=1024),i=!1)}return Uu(t,e,n,i,s,r)}function Uu(t,e,n,i,r,s){cg(t,e);var a=(e.flags&128)!==0;if(!i&&!a)return r&&Oh(e,n,!1),pi(t,e,s);i=e.stateNode,L_.current=e;var o=a&&typeof n.getDerivedStateFromError!="function"?null:i.render();return e.flags|=1,t!==null&&a?(e.child=ms(e,t.child,null,s),e.child=ms(e,null,o,s)):Vt(t,e,o,s),e.memoizedState=i.state,r&&Oh(e,n,!0),e.child}function ug(t){var e=t.stateNode;e.pendingContext?Fh(t,e.pendingContext,e.pendingContext!==e.context):e.context&&Fh(t,e.context,!1),pf(t,e.containerInfo)}function ep(t,e,n,i,r){return ps(),lf(r),e.flags|=256,Vt(t,e,n,i),e.child}var ku={dehydrated:null,treeContext:null,retryLane:0};function Fu(t){return{baseLanes:t,cachePool:null,transitions:null}}function dg(t,e,n){var i=e.pendingProps,r=pt.current,s=!1,a=(e.flags&128)!==0,o;if((o=a)||(o=t!==null&&t.memoizedState===null?!1:(r&2)!==0),o?(s=!0,e.flags&=-129):(t===null||t.memoizedState!==null)&&(r|=1),ot(pt,r&1),t===null)return Ru(e),t=e.memoizedState,t!==null&&(t=t.dehydrated,t!==null)?(e.mode&1?t.data==="$!"?e.lanes=8:e.lanes=1073741824:e.lanes=1,null):(a=i.children,t=i.fallback,s?(i=e.mode,s=e.child,a={mode:"hidden",children:a},!(i&1)&&s!==null?(s.childLanes=0,s.pendingProps=a):s=Ul(a,i,0,null),t=xr(t,i,n,null),s.return=e,t.return=e,s.sibling=t,e.child=s,e.child.memoizedState=Fu(n),e.memoizedState=ku,t):Mf(e,a));if(r=t.memoizedState,r!==null&&(o=r.dehydrated,o!==null))return D_(t,e,a,i,o,r,n);if(s){s=i.fallback,a=e.mode,r=t.child,o=r.sibling;var l={mode:"hidden",children:i.children};return!(a&1)&&e.child!==r?(i=e.child,i.childLanes=0,i.pendingProps=l,e.deletions=null):(i=Hi(r,l),i.subtreeFlags=r.subtreeFlags&14680064),o!==null?s=Hi(o,s):(s=xr(s,a,n,null),s.flags|=2),s.return=e,i.return=e,i.sibling=s,e.child=i,i=s,s=e.child,a=t.child.memoizedState,a=a===null?Fu(n):{baseLanes:a.baseLanes|n,cachePool:null,transitions:a.transitions},s.memoizedState=a,s.childLanes=t.childLanes&~n,e.memoizedState=ku,i}return s=t.child,t=s.sibling,i=Hi(s,{mode:"visible",children:i.children}),!(e.mode&1)&&(i.lanes=n),i.return=e,i.sibling=null,t!==null&&(n=e.deletions,n===null?(e.deletions=[t],e.flags|=16):n.push(t)),e.child=i,e.memoizedState=null,i}function Mf(t,e){return e=Ul({mode:"visible",children:e},t.mode,0,null),e.return=t,t.child=e}function no(t,e,n,i){return i!==null&&lf(i),ms(e,t.child,null,n),t=Mf(e,e.pendingProps.children),t.flags|=2,e.memoizedState=null,t}function D_(t,e,n,i,r,s,a){if(n)return e.flags&256?(e.flags&=-257,i=xc(Error(ie(422))),no(t,e,a,i)):e.memoizedState!==null?(e.child=t.child,e.flags|=128,null):(s=i.fallback,r=e.mode,i=Ul({mode:"visible",children:i.children},r,0,null),s=xr(s,r,a,null),s.flags|=2,i.return=e,s.return=e,i.sibling=s,e.child=i,e.mode&1&&ms(e,t.child,null,a),e.child.memoizedState=Fu(a),e.memoizedState=ku,s);if(!(e.mode&1))return no(t,e,a,null);if(r.data==="$!"){if(i=r.nextSibling&&r.nextSibling.dataset,i)var o=i.dgst;return i=o,s=Error(ie(419)),i=xc(s,i,void 0),no(t,e,a,i)}if(o=(a&t.childLanes)!==0,Jt||o){if(i=Nt,i!==null){switch(a&-a){case 4:r=2;break;case 16:r=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:r=32;break;case 536870912:r=268435456;break;default:r=0}r=r&(i.suspendedLanes|a)?0:r,r!==0&&r!==s.retryLane&&(s.retryLane=r,hi(t,r),zn(i,t,r,-1))}return Cf(),i=xc(Error(ie(421))),no(t,e,a,i)}return r.data==="$?"?(e.flags|=128,e.child=t.child,e=X_.bind(null,t),r._reactRetry=e,null):(t=s.treeContext,dn=Fi(r.nextSibling),fn=e,ht=!0,Un=null,t!==null&&(_n[yn++]=ai,_n[yn++]=oi,_n[yn++]=yr,ai=t.id,oi=t.overflow,yr=e),e=Mf(e,i.children),e.flags|=4096,e)}function tp(t,e,n){t.lanes|=e;var i=t.alternate;i!==null&&(i.lanes|=e),Nu(t.return,e,n)}function vc(t,e,n,i,r){var s=t.memoizedState;s===null?t.memoizedState={isBackwards:e,rendering:null,renderingStartTime:0,last:i,tail:n,tailMode:r}:(s.isBackwards=e,s.rendering=null,s.renderingStartTime=0,s.last=i,s.tail=n,s.tailMode=r)}function fg(t,e,n){var i=e.pendingProps,r=i.revealOrder,s=i.tail;if(Vt(t,e,i.children,n),i=pt.current,i&2)i=i&1|2,e.flags|=128;else{if(t!==null&&t.flags&128)e:for(t=e.child;t!==null;){if(t.tag===13)t.memoizedState!==null&&tp(t,n,e);else if(t.tag===19)tp(t,n,e);else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break e;for(;t.sibling===null;){if(t.return===null||t.return===e)break e;t=t.return}t.sibling.return=t.return,t=t.sibling}i&=1}if(ot(pt,i),!(e.mode&1))e.memoizedState=null;else switch(r){case"forwards":for(n=e.child,r=null;n!==null;)t=n.alternate,t!==null&&dl(t)===null&&(r=n),n=n.sibling;n=r,n===null?(r=e.child,e.child=null):(r=n.sibling,n.sibling=null),vc(e,!1,r,n,s);break;case"backwards":for(n=null,r=e.child,e.child=null;r!==null;){if(t=r.alternate,t!==null&&dl(t)===null){e.child=r;break}t=r.sibling,r.sibling=n,n=r,r=t}vc(e,!0,n,null,s);break;case"together":vc(e,!1,null,null,void 0);break;default:e.memoizedState=null}return e.child}function Oo(t,e){!(e.mode&1)&&t!==null&&(t.alternate=null,e.alternate=null,e.flags|=2)}function pi(t,e,n){if(t!==null&&(e.dependencies=t.dependencies),Mr|=e.lanes,!(n&e.childLanes))return null;if(t!==null&&e.child!==t.child)throw Error(ie(153));if(e.child!==null){for(t=e.child,n=Hi(t,t.pendingProps),e.child=n,n.return=e;t.sibling!==null;)t=t.sibling,n=n.sibling=Hi(t,t.pendingProps),n.return=e;n.sibling=null}return e.child}function I_(t,e,n){switch(e.tag){case 3:ug(e),ps();break;case 5:O0(e);break;case 1:tn(e.type)&&sl(e);break;case 4:pf(e,e.stateNode.containerInfo);break;case 10:var i=e.type._context,r=e.memoizedProps.value;ot(ll,i._currentValue),i._currentValue=r;break;case 13:if(i=e.memoizedState,i!==null)return i.dehydrated!==null?(ot(pt,pt.current&1),e.flags|=128,null):n&e.child.childLanes?dg(t,e,n):(ot(pt,pt.current&1),t=pi(t,e,n),t!==null?t.sibling:null);ot(pt,pt.current&1);break;case 19:if(i=(n&e.childLanes)!==0,t.flags&128){if(i)return fg(t,e,n);e.flags|=128}if(r=e.memoizedState,r!==null&&(r.rendering=null,r.tail=null,r.lastEffect=null),ot(pt,pt.current),i)break;return null;case 22:case 23:return e.lanes=0,lg(t,e,n)}return pi(t,e,n)}var hg,Ou,pg,mg;hg=function(t,e){for(var n=e.child;n!==null;){if(n.tag===5||n.tag===6)t.appendChild(n.stateNode);else if(n.tag!==4&&n.child!==null){n.child.return=n,n=n.child;continue}if(n===e)break;for(;n.sibling===null;){if(n.return===null||n.return===e)return;n=n.return}n.sibling.return=n.return,n=n.sibling}};Ou=function(){};pg=function(t,e,n,i){var r=t.memoizedProps;if(r!==i){t=e.stateNode,hr($n.current);var s=null;switch(n){case"input":r=au(t,r),i=au(t,i),s=[];break;case"select":r=gt({},r,{value:void 0}),i=gt({},i,{value:void 0}),s=[];break;case"textarea":r=cu(t,r),i=cu(t,i),s=[];break;default:typeof r.onClick!="function"&&typeof i.onClick=="function"&&(t.onclick=il)}du(n,i);var a;n=null;for(c in r)if(!i.hasOwnProperty(c)&&r.hasOwnProperty(c)&&r[c]!=null)if(c==="style"){var o=r[c];for(a in o)o.hasOwnProperty(a)&&(n||(n={}),n[a]="")}else c!=="dangerouslySetInnerHTML"&&c!=="children"&&c!=="suppressContentEditableWarning"&&c!=="suppressHydrationWarning"&&c!=="autoFocus"&&(ca.hasOwnProperty(c)?s||(s=[]):(s=s||[]).push(c,null));for(c in i){var l=i[c];if(o=r!=null?r[c]:void 0,i.hasOwnProperty(c)&&l!==o&&(l!=null||o!=null))if(c==="style")if(o){for(a in o)!o.hasOwnProperty(a)||l&&l.hasOwnProperty(a)||(n||(n={}),n[a]="");for(a in l)l.hasOwnProperty(a)&&o[a]!==l[a]&&(n||(n={}),n[a]=l[a])}else n||(s||(s=[]),s.push(c,n)),n=l;else c==="dangerouslySetInnerHTML"?(l=l?l.__html:void 0,o=o?o.__html:void 0,l!=null&&o!==l&&(s=s||[]).push(c,l)):c==="children"?typeof l!="string"&&typeof l!="number"||(s=s||[]).push(c,""+l):c!=="suppressContentEditableWarning"&&c!=="suppressHydrationWarning"&&(ca.hasOwnProperty(c)?(l!=null&&c==="onScroll"&&ct("scroll",t),s||o===l||(s=[])):(s=s||[]).push(c,l))}n&&(s=s||[]).push("style",n);var c=s;(e.updateQueue=c)&&(e.flags|=4)}};mg=function(t,e,n,i){n!==i&&(e.flags|=4)};function Os(t,e){if(!ht)switch(t.tailMode){case"hidden":e=t.tail;for(var n=null;e!==null;)e.alternate!==null&&(n=e),e=e.sibling;n===null?t.tail=null:n.sibling=null;break;case"collapsed":n=t.tail;for(var i=null;n!==null;)n.alternate!==null&&(i=n),n=n.sibling;i===null?e||t.tail===null?t.tail=null:t.tail.sibling=null:i.sibling=null}}function kt(t){var e=t.alternate!==null&&t.alternate.child===t.child,n=0,i=0;if(e)for(var r=t.child;r!==null;)n|=r.lanes|r.childLanes,i|=r.subtreeFlags&14680064,i|=r.flags&14680064,r.return=t,r=r.sibling;else for(r=t.child;r!==null;)n|=r.lanes|r.childLanes,i|=r.subtreeFlags,i|=r.flags,r.return=t,r=r.sibling;return t.subtreeFlags|=i,t.childLanes=n,e}function U_(t,e,n){var i=e.pendingProps;switch(of(e),e.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return kt(e),null;case 1:return tn(e.type)&&rl(),kt(e),null;case 3:return i=e.stateNode,gs(),dt(en),dt(Bt),gf(),i.pendingContext&&(i.context=i.pendingContext,i.pendingContext=null),(t===null||t.child===null)&&(eo(e)?e.flags|=4:t===null||t.memoizedState.isDehydrated&&!(e.flags&256)||(e.flags|=1024,Un!==null&&(Xu(Un),Un=null))),Ou(t,e),kt(e),null;case 5:mf(e);var r=hr(Sa.current);if(n=e.type,t!==null&&e.stateNode!=null)pg(t,e,n,i,r),t.ref!==e.ref&&(e.flags|=512,e.flags|=2097152);else{if(!i){if(e.stateNode===null)throw Error(ie(166));return kt(e),null}if(t=hr($n.current),eo(e)){i=e.stateNode,n=e.type;var s=e.memoizedProps;switch(i[Wn]=e,i[_a]=s,t=(e.mode&1)!==0,n){case"dialog":ct("cancel",i),ct("close",i);break;case"iframe":case"object":case"embed":ct("load",i);break;case"video":case"audio":for(r=0;r<Ks.length;r++)ct(Ks[r],i);break;case"source":ct("error",i);break;case"img":case"image":case"link":ct("error",i),ct("load",i);break;case"details":ct("toggle",i);break;case"input":uh(i,s),ct("invalid",i);break;case"select":i._wrapperState={wasMultiple:!!s.multiple},ct("invalid",i);break;case"textarea":fh(i,s),ct("invalid",i)}du(n,s),r=null;for(var a in s)if(s.hasOwnProperty(a)){var o=s[a];a==="children"?typeof o=="string"?i.textContent!==o&&(s.suppressHydrationWarning!==!0&&Ja(i.textContent,o,t),r=["children",o]):typeof o=="number"&&i.textContent!==""+o&&(s.suppressHydrationWarning!==!0&&Ja(i.textContent,o,t),r=["children",""+o]):ca.hasOwnProperty(a)&&o!=null&&a==="onScroll"&&ct("scroll",i)}switch(n){case"input":Wa(i),dh(i,s,!0);break;case"textarea":Wa(i),hh(i);break;case"select":case"option":break;default:typeof s.onClick=="function"&&(i.onclick=il)}i=r,e.updateQueue=i,i!==null&&(e.flags|=4)}else{a=r.nodeType===9?r:r.ownerDocument,t==="http://www.w3.org/1999/xhtml"&&(t=jm(n)),t==="http://www.w3.org/1999/xhtml"?n==="script"?(t=a.createElement("div"),t.innerHTML="<script><\/script>",t=t.removeChild(t.firstChild)):typeof i.is=="string"?t=a.createElement(n,{is:i.is}):(t=a.createElement(n),n==="select"&&(a=t,i.multiple?a.multiple=!0:i.size&&(a.size=i.size))):t=a.createElementNS(t,n),t[Wn]=e,t[_a]=i,hg(t,e,!1,!1),e.stateNode=t;e:{switch(a=fu(n,i),n){case"dialog":ct("cancel",t),ct("close",t),r=i;break;case"iframe":case"object":case"embed":ct("load",t),r=i;break;case"video":case"audio":for(r=0;r<Ks.length;r++)ct(Ks[r],t);r=i;break;case"source":ct("error",t),r=i;break;case"img":case"image":case"link":ct("error",t),ct("load",t),r=i;break;case"details":ct("toggle",t),r=i;break;case"input":uh(t,i),r=au(t,i),ct("invalid",t);break;case"option":r=i;break;case"select":t._wrapperState={wasMultiple:!!i.multiple},r=gt({},i,{value:void 0}),ct("invalid",t);break;case"textarea":fh(t,i),r=cu(t,i),ct("invalid",t);break;default:r=i}du(n,r),o=r;for(s in o)if(o.hasOwnProperty(s)){var l=o[s];s==="style"?Xm(t,l):s==="dangerouslySetInnerHTML"?(l=l?l.__html:void 0,l!=null&&Gm(t,l)):s==="children"?typeof l=="string"?(n!=="textarea"||l!=="")&&ua(t,l):typeof l=="number"&&ua(t,""+l):s!=="suppressContentEditableWarning"&&s!=="suppressHydrationWarning"&&s!=="autoFocus"&&(ca.hasOwnProperty(s)?l!=null&&s==="onScroll"&&ct("scroll",t):l!=null&&Wd(t,s,l,a))}switch(n){case"input":Wa(t),dh(t,i,!1);break;case"textarea":Wa(t),hh(t);break;case"option":i.value!=null&&t.setAttribute("value",""+Gi(i.value));break;case"select":t.multiple=!!i.multiple,s=i.value,s!=null?is(t,!!i.multiple,s,!1):i.defaultValue!=null&&is(t,!!i.multiple,i.defaultValue,!0);break;default:typeof r.onClick=="function"&&(t.onclick=il)}switch(n){case"button":case"input":case"select":case"textarea":i=!!i.autoFocus;break e;case"img":i=!0;break e;default:i=!1}}i&&(e.flags|=4)}e.ref!==null&&(e.flags|=512,e.flags|=2097152)}return kt(e),null;case 6:if(t&&e.stateNode!=null)mg(t,e,t.memoizedProps,i);else{if(typeof i!="string"&&e.stateNode===null)throw Error(ie(166));if(n=hr(Sa.current),hr($n.current),eo(e)){if(i=e.stateNode,n=e.memoizedProps,i[Wn]=e,(s=i.nodeValue!==n)&&(t=fn,t!==null))switch(t.tag){case 3:Ja(i.nodeValue,n,(t.mode&1)!==0);break;case 5:t.memoizedProps.suppressHydrationWarning!==!0&&Ja(i.nodeValue,n,(t.mode&1)!==0)}s&&(e.flags|=4)}else i=(n.nodeType===9?n:n.ownerDocument).createTextNode(i),i[Wn]=e,e.stateNode=i}return kt(e),null;case 13:if(dt(pt),i=e.memoizedState,t===null||t.memoizedState!==null&&t.memoizedState.dehydrated!==null){if(ht&&dn!==null&&e.mode&1&&!(e.flags&128))D0(),ps(),e.flags|=98560,s=!1;else if(s=eo(e),i!==null&&i.dehydrated!==null){if(t===null){if(!s)throw Error(ie(318));if(s=e.memoizedState,s=s!==null?s.dehydrated:null,!s)throw Error(ie(317));s[Wn]=e}else ps(),!(e.flags&128)&&(e.memoizedState=null),e.flags|=4;kt(e),s=!1}else Un!==null&&(Xu(Un),Un=null),s=!0;if(!s)return e.flags&65536?e:null}return e.flags&128?(e.lanes=n,e):(i=i!==null,i!==(t!==null&&t.memoizedState!==null)&&i&&(e.child.flags|=8192,e.mode&1&&(t===null||pt.current&1?Tt===0&&(Tt=3):Cf())),e.updateQueue!==null&&(e.flags|=4),kt(e),null);case 4:return gs(),Ou(t,e),t===null&&xa(e.stateNode.containerInfo),kt(e),null;case 10:return df(e.type._context),kt(e),null;case 17:return tn(e.type)&&rl(),kt(e),null;case 19:if(dt(pt),s=e.memoizedState,s===null)return kt(e),null;if(i=(e.flags&128)!==0,a=s.rendering,a===null)if(i)Os(s,!1);else{if(Tt!==0||t!==null&&t.flags&128)for(t=e.child;t!==null;){if(a=dl(t),a!==null){for(e.flags|=128,Os(s,!1),i=a.updateQueue,i!==null&&(e.updateQueue=i,e.flags|=4),e.subtreeFlags=0,i=n,n=e.child;n!==null;)s=n,t=i,s.flags&=14680066,a=s.alternate,a===null?(s.childLanes=0,s.lanes=t,s.child=null,s.subtreeFlags=0,s.memoizedProps=null,s.memoizedState=null,s.updateQueue=null,s.dependencies=null,s.stateNode=null):(s.childLanes=a.childLanes,s.lanes=a.lanes,s.child=a.child,s.subtreeFlags=0,s.deletions=null,s.memoizedProps=a.memoizedProps,s.memoizedState=a.memoizedState,s.updateQueue=a.updateQueue,s.type=a.type,t=a.dependencies,s.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),n=n.sibling;return ot(pt,pt.current&1|2),e.child}t=t.sibling}s.tail!==null&&yt()>vs&&(e.flags|=128,i=!0,Os(s,!1),e.lanes=4194304)}else{if(!i)if(t=dl(a),t!==null){if(e.flags|=128,i=!0,n=t.updateQueue,n!==null&&(e.updateQueue=n,e.flags|=4),Os(s,!0),s.tail===null&&s.tailMode==="hidden"&&!a.alternate&&!ht)return kt(e),null}else 2*yt()-s.renderingStartTime>vs&&n!==1073741824&&(e.flags|=128,i=!0,Os(s,!1),e.lanes=4194304);s.isBackwards?(a.sibling=e.child,e.child=a):(n=s.last,n!==null?n.sibling=a:e.child=a,s.last=a)}return s.tail!==null?(e=s.tail,s.rendering=e,s.tail=e.sibling,s.renderingStartTime=yt(),e.sibling=null,n=pt.current,ot(pt,i?n&1|2:n&1),e):(kt(e),null);case 22:case 23:return Af(),i=e.memoizedState!==null,t!==null&&t.memoizedState!==null!==i&&(e.flags|=8192),i&&e.mode&1?cn&1073741824&&(kt(e),e.subtreeFlags&6&&(e.flags|=8192)):kt(e),null;case 24:return null;case 25:return null}throw Error(ie(156,e.tag))}function k_(t,e){switch(of(e),e.tag){case 1:return tn(e.type)&&rl(),t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 3:return gs(),dt(en),dt(Bt),gf(),t=e.flags,t&65536&&!(t&128)?(e.flags=t&-65537|128,e):null;case 5:return mf(e),null;case 13:if(dt(pt),t=e.memoizedState,t!==null&&t.dehydrated!==null){if(e.alternate===null)throw Error(ie(340));ps()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 19:return dt(pt),null;case 4:return gs(),null;case 10:return df(e.type._context),null;case 22:case 23:return Af(),null;case 24:return null;default:return null}}var io=!1,zt=!1,F_=typeof WeakSet=="function"?WeakSet:Set,me=null;function es(t,e){var n=t.ref;if(n!==null)if(typeof n=="function")try{n(null)}catch(i){vt(t,e,i)}else n.current=null}function zu(t,e,n){try{n()}catch(i){vt(t,e,i)}}var np=!1;function O_(t,e){if(Mu=el,t=y0(),sf(t)){if("selectionStart"in t)var n={start:t.selectionStart,end:t.selectionEnd};else e:{n=(n=t.ownerDocument)&&n.defaultView||window;var i=n.getSelection&&n.getSelection();if(i&&i.rangeCount!==0){n=i.anchorNode;var r=i.anchorOffset,s=i.focusNode;i=i.focusOffset;try{n.nodeType,s.nodeType}catch{n=null;break e}var a=0,o=-1,l=-1,c=0,d=0,p=t,h=null;t:for(;;){for(var g;p!==n||r!==0&&p.nodeType!==3||(o=a+r),p!==s||i!==0&&p.nodeType!==3||(l=a+i),p.nodeType===3&&(a+=p.nodeValue.length),(g=p.firstChild)!==null;)h=p,p=g;for(;;){if(p===t)break t;if(h===n&&++c===r&&(o=a),h===s&&++d===i&&(l=a),(g=p.nextSibling)!==null)break;p=h,h=p.parentNode}p=g}n=o===-1||l===-1?null:{start:o,end:l}}else n=null}n=n||{start:0,end:0}}else n=null;for(wu={focusedElem:t,selectionRange:n},el=!1,me=e;me!==null;)if(e=me,t=e.child,(e.subtreeFlags&1028)!==0&&t!==null)t.return=e,me=t;else for(;me!==null;){e=me;try{var v=e.alternate;if(e.flags&1024)switch(e.tag){case 0:case 11:case 15:break;case 1:if(v!==null){var S=v.memoizedProps,m=v.memoizedState,u=e.stateNode,_=u.getSnapshotBeforeUpdate(e.elementType===e.type?S:Dn(e.type,S),m);u.__reactInternalSnapshotBeforeUpdate=_}break;case 3:var x=e.stateNode.containerInfo;x.nodeType===1?x.textContent="":x.nodeType===9&&x.documentElement&&x.removeChild(x.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(ie(163))}}catch(w){vt(e,e.return,w)}if(t=e.sibling,t!==null){t.return=e.return,me=t;break}me=e.return}return v=np,np=!1,v}function sa(t,e,n){var i=e.updateQueue;if(i=i!==null?i.lastEffect:null,i!==null){var r=i=i.next;do{if((r.tag&t)===t){var s=r.destroy;r.destroy=void 0,s!==void 0&&zu(e,n,s)}r=r.next}while(r!==i)}}function Dl(t,e){if(e=e.updateQueue,e=e!==null?e.lastEffect:null,e!==null){var n=e=e.next;do{if((n.tag&t)===t){var i=n.create;n.destroy=i()}n=n.next}while(n!==e)}}function Bu(t){var e=t.ref;if(e!==null){var n=t.stateNode;switch(t.tag){case 5:t=n;break;default:t=n}typeof e=="function"?e(t):e.current=t}}function gg(t){var e=t.alternate;e!==null&&(t.alternate=null,gg(e)),t.child=null,t.deletions=null,t.sibling=null,t.tag===5&&(e=t.stateNode,e!==null&&(delete e[Wn],delete e[_a],delete e[bu],delete e[y_],delete e[S_])),t.stateNode=null,t.return=null,t.dependencies=null,t.memoizedProps=null,t.memoizedState=null,t.pendingProps=null,t.stateNode=null,t.updateQueue=null}function xg(t){return t.tag===5||t.tag===3||t.tag===4}function ip(t){e:for(;;){for(;t.sibling===null;){if(t.return===null||xg(t.return))return null;t=t.return}for(t.sibling.return=t.return,t=t.sibling;t.tag!==5&&t.tag!==6&&t.tag!==18;){if(t.flags&2||t.child===null||t.tag===4)continue e;t.child.return=t,t=t.child}if(!(t.flags&2))return t.stateNode}}function Hu(t,e,n){var i=t.tag;if(i===5||i===6)t=t.stateNode,e?n.nodeType===8?n.parentNode.insertBefore(t,e):n.insertBefore(t,e):(n.nodeType===8?(e=n.parentNode,e.insertBefore(t,n)):(e=n,e.appendChild(t)),n=n._reactRootContainer,n!=null||e.onclick!==null||(e.onclick=il));else if(i!==4&&(t=t.child,t!==null))for(Hu(t,e,n),t=t.sibling;t!==null;)Hu(t,e,n),t=t.sibling}function Vu(t,e,n){var i=t.tag;if(i===5||i===6)t=t.stateNode,e?n.insertBefore(t,e):n.appendChild(t);else if(i!==4&&(t=t.child,t!==null))for(Vu(t,e,n),t=t.sibling;t!==null;)Vu(t,e,n),t=t.sibling}var Lt=null,In=!1;function _i(t,e,n){for(n=n.child;n!==null;)vg(t,e,n),n=n.sibling}function vg(t,e,n){if(Yn&&typeof Yn.onCommitFiberUnmount=="function")try{Yn.onCommitFiberUnmount(Tl,n)}catch{}switch(n.tag){case 5:zt||es(n,e);case 6:var i=Lt,r=In;Lt=null,_i(t,e,n),Lt=i,In=r,Lt!==null&&(In?(t=Lt,n=n.stateNode,t.nodeType===8?t.parentNode.removeChild(n):t.removeChild(n)):Lt.removeChild(n.stateNode));break;case 18:Lt!==null&&(In?(t=Lt,n=n.stateNode,t.nodeType===8?dc(t.parentNode,n):t.nodeType===1&&dc(t,n),pa(t)):dc(Lt,n.stateNode));break;case 4:i=Lt,r=In,Lt=n.stateNode.containerInfo,In=!0,_i(t,e,n),Lt=i,In=r;break;case 0:case 11:case 14:case 15:if(!zt&&(i=n.updateQueue,i!==null&&(i=i.lastEffect,i!==null))){r=i=i.next;do{var s=r,a=s.destroy;s=s.tag,a!==void 0&&(s&2||s&4)&&zu(n,e,a),r=r.next}while(r!==i)}_i(t,e,n);break;case 1:if(!zt&&(es(n,e),i=n.stateNode,typeof i.componentWillUnmount=="function"))try{i.props=n.memoizedProps,i.state=n.memoizedState,i.componentWillUnmount()}catch(o){vt(n,e,o)}_i(t,e,n);break;case 21:_i(t,e,n);break;case 22:n.mode&1?(zt=(i=zt)||n.memoizedState!==null,_i(t,e,n),zt=i):_i(t,e,n);break;default:_i(t,e,n)}}function rp(t){var e=t.updateQueue;if(e!==null){t.updateQueue=null;var n=t.stateNode;n===null&&(n=t.stateNode=new F_),e.forEach(function(i){var r=q_.bind(null,t,i);n.has(i)||(n.add(i),i.then(r,r))})}}function Rn(t,e){var n=e.deletions;if(n!==null)for(var i=0;i<n.length;i++){var r=n[i];try{var s=t,a=e,o=a;e:for(;o!==null;){switch(o.tag){case 5:Lt=o.stateNode,In=!1;break e;case 3:Lt=o.stateNode.containerInfo,In=!0;break e;case 4:Lt=o.stateNode.containerInfo,In=!0;break e}o=o.return}if(Lt===null)throw Error(ie(160));vg(s,a,r),Lt=null,In=!1;var l=r.alternate;l!==null&&(l.return=null),r.return=null}catch(c){vt(r,e,c)}}if(e.subtreeFlags&12854)for(e=e.child;e!==null;)_g(e,t),e=e.sibling}function _g(t,e){var n=t.alternate,i=t.flags;switch(t.tag){case 0:case 11:case 14:case 15:if(Rn(e,t),Hn(t),i&4){try{sa(3,t,t.return),Dl(3,t)}catch(S){vt(t,t.return,S)}try{sa(5,t,t.return)}catch(S){vt(t,t.return,S)}}break;case 1:Rn(e,t),Hn(t),i&512&&n!==null&&es(n,n.return);break;case 5:if(Rn(e,t),Hn(t),i&512&&n!==null&&es(n,n.return),t.flags&32){var r=t.stateNode;try{ua(r,"")}catch(S){vt(t,t.return,S)}}if(i&4&&(r=t.stateNode,r!=null)){var s=t.memoizedProps,a=n!==null?n.memoizedProps:s,o=t.type,l=t.updateQueue;if(t.updateQueue=null,l!==null)try{o==="input"&&s.type==="radio"&&s.name!=null&&Hm(r,s),fu(o,a);var c=fu(o,s);for(a=0;a<l.length;a+=2){var d=l[a],p=l[a+1];d==="style"?Xm(r,p):d==="dangerouslySetInnerHTML"?Gm(r,p):d==="children"?ua(r,p):Wd(r,d,p,c)}switch(o){case"input":ou(r,s);break;case"textarea":Vm(r,s);break;case"select":var h=r._wrapperState.wasMultiple;r._wrapperState.wasMultiple=!!s.multiple;var g=s.value;g!=null?is(r,!!s.multiple,g,!1):h!==!!s.multiple&&(s.defaultValue!=null?is(r,!!s.multiple,s.defaultValue,!0):is(r,!!s.multiple,s.multiple?[]:"",!1))}r[_a]=s}catch(S){vt(t,t.return,S)}}break;case 6:if(Rn(e,t),Hn(t),i&4){if(t.stateNode===null)throw Error(ie(162));r=t.stateNode,s=t.memoizedProps;try{r.nodeValue=s}catch(S){vt(t,t.return,S)}}break;case 3:if(Rn(e,t),Hn(t),i&4&&n!==null&&n.memoizedState.isDehydrated)try{pa(e.containerInfo)}catch(S){vt(t,t.return,S)}break;case 4:Rn(e,t),Hn(t);break;case 13:Rn(e,t),Hn(t),r=t.child,r.flags&8192&&(s=r.memoizedState!==null,r.stateNode.isHidden=s,!s||r.alternate!==null&&r.alternate.memoizedState!==null||(Tf=yt())),i&4&&rp(t);break;case 22:if(d=n!==null&&n.memoizedState!==null,t.mode&1?(zt=(c=zt)||d,Rn(e,t),zt=c):Rn(e,t),Hn(t),i&8192){if(c=t.memoizedState!==null,(t.stateNode.isHidden=c)&&!d&&t.mode&1)for(me=t,d=t.child;d!==null;){for(p=me=d;me!==null;){switch(h=me,g=h.child,h.tag){case 0:case 11:case 14:case 15:sa(4,h,h.return);break;case 1:es(h,h.return);var v=h.stateNode;if(typeof v.componentWillUnmount=="function"){i=h,n=h.return;try{e=i,v.props=e.memoizedProps,v.state=e.memoizedState,v.componentWillUnmount()}catch(S){vt(i,n,S)}}break;case 5:es(h,h.return);break;case 22:if(h.memoizedState!==null){ap(p);continue}}g!==null?(g.return=h,me=g):ap(p)}d=d.sibling}e:for(d=null,p=t;;){if(p.tag===5){if(d===null){d=p;try{r=p.stateNode,c?(s=r.style,typeof s.setProperty=="function"?s.setProperty("display","none","important"):s.display="none"):(o=p.stateNode,l=p.memoizedProps.style,a=l!=null&&l.hasOwnProperty("display")?l.display:null,o.style.display=Wm("display",a))}catch(S){vt(t,t.return,S)}}}else if(p.tag===6){if(d===null)try{p.stateNode.nodeValue=c?"":p.memoizedProps}catch(S){vt(t,t.return,S)}}else if((p.tag!==22&&p.tag!==23||p.memoizedState===null||p===t)&&p.child!==null){p.child.return=p,p=p.child;continue}if(p===t)break e;for(;p.sibling===null;){if(p.return===null||p.return===t)break e;d===p&&(d=null),p=p.return}d===p&&(d=null),p.sibling.return=p.return,p=p.sibling}}break;case 19:Rn(e,t),Hn(t),i&4&&rp(t);break;case 21:break;default:Rn(e,t),Hn(t)}}function Hn(t){var e=t.flags;if(e&2){try{e:{for(var n=t.return;n!==null;){if(xg(n)){var i=n;break e}n=n.return}throw Error(ie(160))}switch(i.tag){case 5:var r=i.stateNode;i.flags&32&&(ua(r,""),i.flags&=-33);var s=ip(t);Vu(t,s,r);break;case 3:case 4:var a=i.stateNode.containerInfo,o=ip(t);Hu(t,o,a);break;default:throw Error(ie(161))}}catch(l){vt(t,t.return,l)}t.flags&=-3}e&4096&&(t.flags&=-4097)}function z_(t,e,n){me=t,yg(t)}function yg(t,e,n){for(var i=(t.mode&1)!==0;me!==null;){var r=me,s=r.child;if(r.tag===22&&i){var a=r.memoizedState!==null||io;if(!a){var o=r.alternate,l=o!==null&&o.memoizedState!==null||zt;o=io;var c=zt;if(io=a,(zt=l)&&!c)for(me=r;me!==null;)a=me,l=a.child,a.tag===22&&a.memoizedState!==null?op(r):l!==null?(l.return=a,me=l):op(r);for(;s!==null;)me=s,yg(s),s=s.sibling;me=r,io=o,zt=c}sp(t)}else r.subtreeFlags&8772&&s!==null?(s.return=r,me=s):sp(t)}}function sp(t){for(;me!==null;){var e=me;if(e.flags&8772){var n=e.alternate;try{if(e.flags&8772)switch(e.tag){case 0:case 11:case 15:zt||Dl(5,e);break;case 1:var i=e.stateNode;if(e.flags&4&&!zt)if(n===null)i.componentDidMount();else{var r=e.elementType===e.type?n.memoizedProps:Dn(e.type,n.memoizedProps);i.componentDidUpdate(r,n.memoizedState,i.__reactInternalSnapshotBeforeUpdate)}var s=e.updateQueue;s!==null&&jh(e,s,i);break;case 3:var a=e.updateQueue;if(a!==null){if(n=null,e.child!==null)switch(e.child.tag){case 5:n=e.child.stateNode;break;case 1:n=e.child.stateNode}jh(e,a,n)}break;case 5:var o=e.stateNode;if(n===null&&e.flags&4){n=o;var l=e.memoizedProps;switch(e.type){case"button":case"input":case"select":case"textarea":l.autoFocus&&n.focus();break;case"img":l.src&&(n.src=l.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(e.memoizedState===null){var c=e.alternate;if(c!==null){var d=c.memoizedState;if(d!==null){var p=d.dehydrated;p!==null&&pa(p)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(ie(163))}zt||e.flags&512&&Bu(e)}catch(h){vt(e,e.return,h)}}if(e===t){me=null;break}if(n=e.sibling,n!==null){n.return=e.return,me=n;break}me=e.return}}function ap(t){for(;me!==null;){var e=me;if(e===t){me=null;break}var n=e.sibling;if(n!==null){n.return=e.return,me=n;break}me=e.return}}function op(t){for(;me!==null;){var e=me;try{switch(e.tag){case 0:case 11:case 15:var n=e.return;try{Dl(4,e)}catch(l){vt(e,n,l)}break;case 1:var i=e.stateNode;if(typeof i.componentDidMount=="function"){var r=e.return;try{i.componentDidMount()}catch(l){vt(e,r,l)}}var s=e.return;try{Bu(e)}catch(l){vt(e,s,l)}break;case 5:var a=e.return;try{Bu(e)}catch(l){vt(e,a,l)}}}catch(l){vt(e,e.return,l)}if(e===t){me=null;break}var o=e.sibling;if(o!==null){o.return=e.return,me=o;break}me=e.return}}var B_=Math.ceil,pl=gi.ReactCurrentDispatcher,wf=gi.ReactCurrentOwner,En=gi.ReactCurrentBatchConfig,qe=0,Nt=null,wt=null,Dt=0,cn=0,ts=$i(0),Tt=0,Ta=null,Mr=0,Il=0,Ef=0,aa=null,Zt=null,Tf=0,vs=1/0,ri=null,ml=!1,ju=null,zi=null,ro=!1,Di=null,gl=0,oa=0,Gu=null,zo=-1,Bo=0;function jt(){return qe&6?yt():zo!==-1?zo:zo=yt()}function Bi(t){return t.mode&1?qe&2&&Dt!==0?Dt&-Dt:w_.transition!==null?(Bo===0&&(Bo=r0()),Bo):(t=it,t!==0||(t=window.event,t=t===void 0?16:d0(t.type)),t):1}function zn(t,e,n,i){if(50<oa)throw oa=0,Gu=null,Error(ie(185));Pa(t,n,i),(!(qe&2)||t!==Nt)&&(t===Nt&&(!(qe&2)&&(Il|=n),Tt===4&&Ni(t,Dt)),nn(t,i),n===1&&qe===0&&!(e.mode&1)&&(vs=yt()+500,Nl&&Ki()))}function nn(t,e){var n=t.callbackNode;wv(t,e);var i=Jo(t,t===Nt?Dt:0);if(i===0)n!==null&&gh(n),t.callbackNode=null,t.callbackPriority=0;else if(e=i&-i,t.callbackPriority!==e){if(n!=null&&gh(n),e===1)t.tag===0?M_(lp.bind(null,t)):N0(lp.bind(null,t)),v_(function(){!(qe&6)&&Ki()}),n=null;else{switch(s0(i)){case 1:n=Kd;break;case 4:n=n0;break;case 16:n=Qo;break;case 536870912:n=i0;break;default:n=Qo}n=Cg(n,Sg.bind(null,t))}t.callbackPriority=e,t.callbackNode=n}}function Sg(t,e){if(zo=-1,Bo=0,qe&6)throw Error(ie(327));var n=t.callbackNode;if(ls()&&t.callbackNode!==n)return null;var i=Jo(t,t===Nt?Dt:0);if(i===0)return null;if(i&30||i&t.expiredLanes||e)e=xl(t,i);else{e=i;var r=qe;qe|=2;var s=wg();(Nt!==t||Dt!==e)&&(ri=null,vs=yt()+500,gr(t,e));do try{j_();break}catch(o){Mg(t,o)}while(!0);uf(),pl.current=s,qe=r,wt!==null?e=0:(Nt=null,Dt=0,e=Tt)}if(e!==0){if(e===2&&(r=xu(t),r!==0&&(i=r,e=Wu(t,r))),e===1)throw n=Ta,gr(t,0),Ni(t,i),nn(t,yt()),n;if(e===6)Ni(t,i);else{if(r=t.current.alternate,!(i&30)&&!H_(r)&&(e=xl(t,i),e===2&&(s=xu(t),s!==0&&(i=s,e=Wu(t,s))),e===1))throw n=Ta,gr(t,0),Ni(t,i),nn(t,yt()),n;switch(t.finishedWork=r,t.finishedLanes=i,e){case 0:case 1:throw Error(ie(345));case 2:ar(t,Zt,ri);break;case 3:if(Ni(t,i),(i&130023424)===i&&(e=Tf+500-yt(),10<e)){if(Jo(t,0)!==0)break;if(r=t.suspendedLanes,(r&i)!==i){jt(),t.pingedLanes|=t.suspendedLanes&r;break}t.timeoutHandle=Tu(ar.bind(null,t,Zt,ri),e);break}ar(t,Zt,ri);break;case 4:if(Ni(t,i),(i&4194240)===i)break;for(e=t.eventTimes,r=-1;0<i;){var a=31-On(i);s=1<<a,a=e[a],a>r&&(r=a),i&=~s}if(i=r,i=yt()-i,i=(120>i?120:480>i?480:1080>i?1080:1920>i?1920:3e3>i?3e3:4320>i?4320:1960*B_(i/1960))-i,10<i){t.timeoutHandle=Tu(ar.bind(null,t,Zt,ri),i);break}ar(t,Zt,ri);break;case 5:ar(t,Zt,ri);break;default:throw Error(ie(329))}}}return nn(t,yt()),t.callbackNode===n?Sg.bind(null,t):null}function Wu(t,e){var n=aa;return t.current.memoizedState.isDehydrated&&(gr(t,e).flags|=256),t=xl(t,e),t!==2&&(e=Zt,Zt=n,e!==null&&Xu(e)),t}function Xu(t){Zt===null?Zt=t:Zt.push.apply(Zt,t)}function H_(t){for(var e=t;;){if(e.flags&16384){var n=e.updateQueue;if(n!==null&&(n=n.stores,n!==null))for(var i=0;i<n.length;i++){var r=n[i],s=r.getSnapshot;r=r.value;try{if(!Bn(s(),r))return!1}catch{return!1}}}if(n=e.child,e.subtreeFlags&16384&&n!==null)n.return=e,e=n;else{if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return!0;e=e.return}e.sibling.return=e.return,e=e.sibling}}return!0}function Ni(t,e){for(e&=~Ef,e&=~Il,t.suspendedLanes|=e,t.pingedLanes&=~e,t=t.expirationTimes;0<e;){var n=31-On(e),i=1<<n;t[n]=-1,e&=~i}}function lp(t){if(qe&6)throw Error(ie(327));ls();var e=Jo(t,0);if(!(e&1))return nn(t,yt()),null;var n=xl(t,e);if(t.tag!==0&&n===2){var i=xu(t);i!==0&&(e=i,n=Wu(t,i))}if(n===1)throw n=Ta,gr(t,0),Ni(t,e),nn(t,yt()),n;if(n===6)throw Error(ie(345));return t.finishedWork=t.current.alternate,t.finishedLanes=e,ar(t,Zt,ri),nn(t,yt()),null}function bf(t,e){var n=qe;qe|=1;try{return t(e)}finally{qe=n,qe===0&&(vs=yt()+500,Nl&&Ki())}}function wr(t){Di!==null&&Di.tag===0&&!(qe&6)&&ls();var e=qe;qe|=1;var n=En.transition,i=it;try{if(En.transition=null,it=1,t)return t()}finally{it=i,En.transition=n,qe=e,!(qe&6)&&Ki()}}function Af(){cn=ts.current,dt(ts)}function gr(t,e){t.finishedWork=null,t.finishedLanes=0;var n=t.timeoutHandle;if(n!==-1&&(t.timeoutHandle=-1,x_(n)),wt!==null)for(n=wt.return;n!==null;){var i=n;switch(of(i),i.tag){case 1:i=i.type.childContextTypes,i!=null&&rl();break;case 3:gs(),dt(en),dt(Bt),gf();break;case 5:mf(i);break;case 4:gs();break;case 13:dt(pt);break;case 19:dt(pt);break;case 10:df(i.type._context);break;case 22:case 23:Af()}n=n.return}if(Nt=t,wt=t=Hi(t.current,null),Dt=cn=e,Tt=0,Ta=null,Ef=Il=Mr=0,Zt=aa=null,fr!==null){for(e=0;e<fr.length;e++)if(n=fr[e],i=n.interleaved,i!==null){n.interleaved=null;var r=i.next,s=n.pending;if(s!==null){var a=s.next;s.next=r,i.next=a}n.pending=i}fr=null}return t}function Mg(t,e){do{var n=wt;try{if(uf(),ko.current=hl,fl){for(var i=mt.memoizedState;i!==null;){var r=i.queue;r!==null&&(r.pending=null),i=i.next}fl=!1}if(Sr=0,Rt=Et=mt=null,ra=!1,Ma=0,wf.current=null,n===null||n.return===null){Tt=1,Ta=e,wt=null;break}e:{var s=t,a=n.return,o=n,l=e;if(e=Dt,o.flags|=32768,l!==null&&typeof l=="object"&&typeof l.then=="function"){var c=l,d=o,p=d.tag;if(!(d.mode&1)&&(p===0||p===11||p===15)){var h=d.alternate;h?(d.updateQueue=h.updateQueue,d.memoizedState=h.memoizedState,d.lanes=h.lanes):(d.updateQueue=null,d.memoizedState=null)}var g=$h(a);if(g!==null){g.flags&=-257,Kh(g,a,o,s,e),g.mode&1&&Yh(s,c,e),e=g,l=c;var v=e.updateQueue;if(v===null){var S=new Set;S.add(l),e.updateQueue=S}else v.add(l);break e}else{if(!(e&1)){Yh(s,c,e),Cf();break e}l=Error(ie(426))}}else if(ht&&o.mode&1){var m=$h(a);if(m!==null){!(m.flags&65536)&&(m.flags|=256),Kh(m,a,o,s,e),lf(xs(l,o));break e}}s=l=xs(l,o),Tt!==4&&(Tt=2),aa===null?aa=[s]:aa.push(s),s=a;do{switch(s.tag){case 3:s.flags|=65536,e&=-e,s.lanes|=e;var u=sg(s,l,e);Vh(s,u);break e;case 1:o=l;var _=s.type,x=s.stateNode;if(!(s.flags&128)&&(typeof _.getDerivedStateFromError=="function"||x!==null&&typeof x.componentDidCatch=="function"&&(zi===null||!zi.has(x)))){s.flags|=65536,e&=-e,s.lanes|=e;var w=ag(s,o,e);Vh(s,w);break e}}s=s.return}while(s!==null)}Tg(n)}catch(P){e=P,wt===n&&n!==null&&(wt=n=n.return);continue}break}while(!0)}function wg(){var t=pl.current;return pl.current=hl,t===null?hl:t}function Cf(){(Tt===0||Tt===3||Tt===2)&&(Tt=4),Nt===null||!(Mr&268435455)&&!(Il&268435455)||Ni(Nt,Dt)}function xl(t,e){var n=qe;qe|=2;var i=wg();(Nt!==t||Dt!==e)&&(ri=null,gr(t,e));do try{V_();break}catch(r){Mg(t,r)}while(!0);if(uf(),qe=n,pl.current=i,wt!==null)throw Error(ie(261));return Nt=null,Dt=0,Tt}function V_(){for(;wt!==null;)Eg(wt)}function j_(){for(;wt!==null&&!pv();)Eg(wt)}function Eg(t){var e=Ag(t.alternate,t,cn);t.memoizedProps=t.pendingProps,e===null?Tg(t):wt=e,wf.current=null}function Tg(t){var e=t;do{var n=e.alternate;if(t=e.return,e.flags&32768){if(n=k_(n,e),n!==null){n.flags&=32767,wt=n;return}if(t!==null)t.flags|=32768,t.subtreeFlags=0,t.deletions=null;else{Tt=6,wt=null;return}}else if(n=U_(n,e,cn),n!==null){wt=n;return}if(e=e.sibling,e!==null){wt=e;return}wt=e=t}while(e!==null);Tt===0&&(Tt=5)}function ar(t,e,n){var i=it,r=En.transition;try{En.transition=null,it=1,G_(t,e,n,i)}finally{En.transition=r,it=i}return null}function G_(t,e,n,i){do ls();while(Di!==null);if(qe&6)throw Error(ie(327));n=t.finishedWork;var r=t.finishedLanes;if(n===null)return null;if(t.finishedWork=null,t.finishedLanes=0,n===t.current)throw Error(ie(177));t.callbackNode=null,t.callbackPriority=0;var s=n.lanes|n.childLanes;if(Ev(t,s),t===Nt&&(wt=Nt=null,Dt=0),!(n.subtreeFlags&2064)&&!(n.flags&2064)||ro||(ro=!0,Cg(Qo,function(){return ls(),null})),s=(n.flags&15990)!==0,n.subtreeFlags&15990||s){s=En.transition,En.transition=null;var a=it;it=1;var o=qe;qe|=4,wf.current=null,O_(t,n),_g(n,t),u_(wu),el=!!Mu,wu=Mu=null,t.current=n,z_(n),mv(),qe=o,it=a,En.transition=s}else t.current=n;if(ro&&(ro=!1,Di=t,gl=r),s=t.pendingLanes,s===0&&(zi=null),vv(n.stateNode),nn(t,yt()),e!==null)for(i=t.onRecoverableError,n=0;n<e.length;n++)r=e[n],i(r.value,{componentStack:r.stack,digest:r.digest});if(ml)throw ml=!1,t=ju,ju=null,t;return gl&1&&t.tag!==0&&ls(),s=t.pendingLanes,s&1?t===Gu?oa++:(oa=0,Gu=t):oa=0,Ki(),null}function ls(){if(Di!==null){var t=s0(gl),e=En.transition,n=it;try{if(En.transition=null,it=16>t?16:t,Di===null)var i=!1;else{if(t=Di,Di=null,gl=0,qe&6)throw Error(ie(331));var r=qe;for(qe|=4,me=t.current;me!==null;){var s=me,a=s.child;if(me.flags&16){var o=s.deletions;if(o!==null){for(var l=0;l<o.length;l++){var c=o[l];for(me=c;me!==null;){var d=me;switch(d.tag){case 0:case 11:case 15:sa(8,d,s)}var p=d.child;if(p!==null)p.return=d,me=p;else for(;me!==null;){d=me;var h=d.sibling,g=d.return;if(gg(d),d===c){me=null;break}if(h!==null){h.return=g,me=h;break}me=g}}}var v=s.alternate;if(v!==null){var S=v.child;if(S!==null){v.child=null;do{var m=S.sibling;S.sibling=null,S=m}while(S!==null)}}me=s}}if(s.subtreeFlags&2064&&a!==null)a.return=s,me=a;else e:for(;me!==null;){if(s=me,s.flags&2048)switch(s.tag){case 0:case 11:case 15:sa(9,s,s.return)}var u=s.sibling;if(u!==null){u.return=s.return,me=u;break e}me=s.return}}var _=t.current;for(me=_;me!==null;){a=me;var x=a.child;if(a.subtreeFlags&2064&&x!==null)x.return=a,me=x;else e:for(a=_;me!==null;){if(o=me,o.flags&2048)try{switch(o.tag){case 0:case 11:case 15:Dl(9,o)}}catch(P){vt(o,o.return,P)}if(o===a){me=null;break e}var w=o.sibling;if(w!==null){w.return=o.return,me=w;break e}me=o.return}}if(qe=r,Ki(),Yn&&typeof Yn.onPostCommitFiberRoot=="function")try{Yn.onPostCommitFiberRoot(Tl,t)}catch{}i=!0}return i}finally{it=n,En.transition=e}}return!1}function cp(t,e,n){e=xs(n,e),e=sg(t,e,1),t=Oi(t,e,1),e=jt(),t!==null&&(Pa(t,1,e),nn(t,e))}function vt(t,e,n){if(t.tag===3)cp(t,t,n);else for(;e!==null;){if(e.tag===3){cp(e,t,n);break}else if(e.tag===1){var i=e.stateNode;if(typeof e.type.getDerivedStateFromError=="function"||typeof i.componentDidCatch=="function"&&(zi===null||!zi.has(i))){t=xs(n,t),t=ag(e,t,1),e=Oi(e,t,1),t=jt(),e!==null&&(Pa(e,1,t),nn(e,t));break}}e=e.return}}function W_(t,e,n){var i=t.pingCache;i!==null&&i.delete(e),e=jt(),t.pingedLanes|=t.suspendedLanes&n,Nt===t&&(Dt&n)===n&&(Tt===4||Tt===3&&(Dt&130023424)===Dt&&500>yt()-Tf?gr(t,0):Ef|=n),nn(t,e)}function bg(t,e){e===0&&(t.mode&1?(e=Ya,Ya<<=1,!(Ya&130023424)&&(Ya=4194304)):e=1);var n=jt();t=hi(t,e),t!==null&&(Pa(t,e,n),nn(t,n))}function X_(t){var e=t.memoizedState,n=0;e!==null&&(n=e.retryLane),bg(t,n)}function q_(t,e){var n=0;switch(t.tag){case 13:var i=t.stateNode,r=t.memoizedState;r!==null&&(n=r.retryLane);break;case 19:i=t.stateNode;break;default:throw Error(ie(314))}i!==null&&i.delete(e),bg(t,n)}var Ag;Ag=function(t,e,n){if(t!==null)if(t.memoizedProps!==e.pendingProps||en.current)Jt=!0;else{if(!(t.lanes&n)&&!(e.flags&128))return Jt=!1,I_(t,e,n);Jt=!!(t.flags&131072)}else Jt=!1,ht&&e.flags&1048576&&P0(e,ol,e.index);switch(e.lanes=0,e.tag){case 2:var i=e.type;Oo(t,e),t=e.pendingProps;var r=hs(e,Bt.current);os(e,n),r=vf(null,e,i,t,r,n);var s=_f();return e.flags|=1,typeof r=="object"&&r!==null&&typeof r.render=="function"&&r.$$typeof===void 0?(e.tag=1,e.memoizedState=null,e.updateQueue=null,tn(i)?(s=!0,sl(e)):s=!1,e.memoizedState=r.state!==null&&r.state!==void 0?r.state:null,hf(e),r.updater=Ll,e.stateNode=r,r._reactInternals=e,Lu(e,i,t,n),e=Uu(null,e,i,!0,s,n)):(e.tag=0,ht&&s&&af(e),Vt(null,e,r,n),e=e.child),e;case 16:i=e.elementType;e:{switch(Oo(t,e),t=e.pendingProps,r=i._init,i=r(i._payload),e.type=i,r=e.tag=$_(i),t=Dn(i,t),r){case 0:e=Iu(null,e,i,t,n);break e;case 1:e=Jh(null,e,i,t,n);break e;case 11:e=Zh(null,e,i,t,n);break e;case 14:e=Qh(null,e,i,Dn(i.type,t),n);break e}throw Error(ie(306,i,""))}return e;case 0:return i=e.type,r=e.pendingProps,r=e.elementType===i?r:Dn(i,r),Iu(t,e,i,r,n);case 1:return i=e.type,r=e.pendingProps,r=e.elementType===i?r:Dn(i,r),Jh(t,e,i,r,n);case 3:e:{if(ug(e),t===null)throw Error(ie(387));i=e.pendingProps,s=e.memoizedState,r=s.element,F0(t,e),ul(e,i,null,n);var a=e.memoizedState;if(i=a.element,s.isDehydrated)if(s={element:i,isDehydrated:!1,cache:a.cache,pendingSuspenseBoundaries:a.pendingSuspenseBoundaries,transitions:a.transitions},e.updateQueue.baseState=s,e.memoizedState=s,e.flags&256){r=xs(Error(ie(423)),e),e=ep(t,e,i,n,r);break e}else if(i!==r){r=xs(Error(ie(424)),e),e=ep(t,e,i,n,r);break e}else for(dn=Fi(e.stateNode.containerInfo.firstChild),fn=e,ht=!0,Un=null,n=U0(e,null,i,n),e.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling;else{if(ps(),i===r){e=pi(t,e,n);break e}Vt(t,e,i,n)}e=e.child}return e;case 5:return O0(e),t===null&&Ru(e),i=e.type,r=e.pendingProps,s=t!==null?t.memoizedProps:null,a=r.children,Eu(i,r)?a=null:s!==null&&Eu(i,s)&&(e.flags|=32),cg(t,e),Vt(t,e,a,n),e.child;case 6:return t===null&&Ru(e),null;case 13:return dg(t,e,n);case 4:return pf(e,e.stateNode.containerInfo),i=e.pendingProps,t===null?e.child=ms(e,null,i,n):Vt(t,e,i,n),e.child;case 11:return i=e.type,r=e.pendingProps,r=e.elementType===i?r:Dn(i,r),Zh(t,e,i,r,n);case 7:return Vt(t,e,e.pendingProps,n),e.child;case 8:return Vt(t,e,e.pendingProps.children,n),e.child;case 12:return Vt(t,e,e.pendingProps.children,n),e.child;case 10:e:{if(i=e.type._context,r=e.pendingProps,s=e.memoizedProps,a=r.value,ot(ll,i._currentValue),i._currentValue=a,s!==null)if(Bn(s.value,a)){if(s.children===r.children&&!en.current){e=pi(t,e,n);break e}}else for(s=e.child,s!==null&&(s.return=e);s!==null;){var o=s.dependencies;if(o!==null){a=s.child;for(var l=o.firstContext;l!==null;){if(l.context===i){if(s.tag===1){l=ui(-1,n&-n),l.tag=2;var c=s.updateQueue;if(c!==null){c=c.shared;var d=c.pending;d===null?l.next=l:(l.next=d.next,d.next=l),c.pending=l}}s.lanes|=n,l=s.alternate,l!==null&&(l.lanes|=n),Nu(s.return,n,e),o.lanes|=n;break}l=l.next}}else if(s.tag===10)a=s.type===e.type?null:s.child;else if(s.tag===18){if(a=s.return,a===null)throw Error(ie(341));a.lanes|=n,o=a.alternate,o!==null&&(o.lanes|=n),Nu(a,n,e),a=s.sibling}else a=s.child;if(a!==null)a.return=s;else for(a=s;a!==null;){if(a===e){a=null;break}if(s=a.sibling,s!==null){s.return=a.return,a=s;break}a=a.return}s=a}Vt(t,e,r.children,n),e=e.child}return e;case 9:return r=e.type,i=e.pendingProps.children,os(e,n),r=bn(r),i=i(r),e.flags|=1,Vt(t,e,i,n),e.child;case 14:return i=e.type,r=Dn(i,e.pendingProps),r=Dn(i.type,r),Qh(t,e,i,r,n);case 15:return og(t,e,e.type,e.pendingProps,n);case 17:return i=e.type,r=e.pendingProps,r=e.elementType===i?r:Dn(i,r),Oo(t,e),e.tag=1,tn(i)?(t=!0,sl(e)):t=!1,os(e,n),rg(e,i,r),Lu(e,i,r,n),Uu(null,e,i,!0,t,n);case 19:return fg(t,e,n);case 22:return lg(t,e,n)}throw Error(ie(156,e.tag))};function Cg(t,e){return t0(t,e)}function Y_(t,e,n,i){this.tag=t,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=e,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=i,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Mn(t,e,n,i){return new Y_(t,e,n,i)}function Rf(t){return t=t.prototype,!(!t||!t.isReactComponent)}function $_(t){if(typeof t=="function")return Rf(t)?1:0;if(t!=null){if(t=t.$$typeof,t===qd)return 11;if(t===Yd)return 14}return 2}function Hi(t,e){var n=t.alternate;return n===null?(n=Mn(t.tag,e,t.key,t.mode),n.elementType=t.elementType,n.type=t.type,n.stateNode=t.stateNode,n.alternate=t,t.alternate=n):(n.pendingProps=e,n.type=t.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=t.flags&14680064,n.childLanes=t.childLanes,n.lanes=t.lanes,n.child=t.child,n.memoizedProps=t.memoizedProps,n.memoizedState=t.memoizedState,n.updateQueue=t.updateQueue,e=t.dependencies,n.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext},n.sibling=t.sibling,n.index=t.index,n.ref=t.ref,n}function Ho(t,e,n,i,r,s){var a=2;if(i=t,typeof t=="function")Rf(t)&&(a=1);else if(typeof t=="string")a=5;else e:switch(t){case Wr:return xr(n.children,r,s,e);case Xd:a=8,r|=8;break;case nu:return t=Mn(12,n,e,r|2),t.elementType=nu,t.lanes=s,t;case iu:return t=Mn(13,n,e,r),t.elementType=iu,t.lanes=s,t;case ru:return t=Mn(19,n,e,r),t.elementType=ru,t.lanes=s,t;case Om:return Ul(n,r,s,e);default:if(typeof t=="object"&&t!==null)switch(t.$$typeof){case km:a=10;break e;case Fm:a=9;break e;case qd:a=11;break e;case Yd:a=14;break e;case Ai:a=16,i=null;break e}throw Error(ie(130,t==null?t:typeof t,""))}return e=Mn(a,n,e,r),e.elementType=t,e.type=i,e.lanes=s,e}function xr(t,e,n,i){return t=Mn(7,t,i,e),t.lanes=n,t}function Ul(t,e,n,i){return t=Mn(22,t,i,e),t.elementType=Om,t.lanes=n,t.stateNode={isHidden:!1},t}function _c(t,e,n){return t=Mn(6,t,null,e),t.lanes=n,t}function yc(t,e,n){return e=Mn(4,t.children!==null?t.children:[],t.key,e),e.lanes=n,e.stateNode={containerInfo:t.containerInfo,pendingChildren:null,implementation:t.implementation},e}function K_(t,e,n,i,r){this.tag=e,this.containerInfo=t,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=ec(0),this.expirationTimes=ec(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=ec(0),this.identifierPrefix=i,this.onRecoverableError=r,this.mutableSourceEagerHydrationData=null}function Nf(t,e,n,i,r,s,a,o,l){return t=new K_(t,e,n,o,l),e===1?(e=1,s===!0&&(e|=8)):e=0,s=Mn(3,null,null,e),t.current=s,s.stateNode=t,s.memoizedState={element:i,isDehydrated:n,cache:null,transitions:null,pendingSuspenseBoundaries:null},hf(s),t}function Z_(t,e,n){var i=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:Gr,key:i==null?null:""+i,children:t,containerInfo:e,implementation:n}}function Rg(t){if(!t)return Wi;t=t._reactInternals;e:{if(Ar(t)!==t||t.tag!==1)throw Error(ie(170));var e=t;do{switch(e.tag){case 3:e=e.stateNode.context;break e;case 1:if(tn(e.type)){e=e.stateNode.__reactInternalMemoizedMergedChildContext;break e}}e=e.return}while(e!==null);throw Error(ie(171))}if(t.tag===1){var n=t.type;if(tn(n))return R0(t,n,e)}return e}function Ng(t,e,n,i,r,s,a,o,l){return t=Nf(n,i,!0,t,r,s,a,o,l),t.context=Rg(null),n=t.current,i=jt(),r=Bi(n),s=ui(i,r),s.callback=e??null,Oi(n,s,r),t.current.lanes=r,Pa(t,r,i),nn(t,i),t}function kl(t,e,n,i){var r=e.current,s=jt(),a=Bi(r);return n=Rg(n),e.context===null?e.context=n:e.pendingContext=n,e=ui(s,a),e.payload={element:t},i=i===void 0?null:i,i!==null&&(e.callback=i),t=Oi(r,e,a),t!==null&&(zn(t,r,a,s),Uo(t,r,a)),a}function vl(t){if(t=t.current,!t.child)return null;switch(t.child.tag){case 5:return t.child.stateNode;default:return t.child.stateNode}}function up(t,e){if(t=t.memoizedState,t!==null&&t.dehydrated!==null){var n=t.retryLane;t.retryLane=n!==0&&n<e?n:e}}function Pf(t,e){up(t,e),(t=t.alternate)&&up(t,e)}function Q_(){return null}var Pg=typeof reportError=="function"?reportError:function(t){console.error(t)};function Lf(t){this._internalRoot=t}Fl.prototype.render=Lf.prototype.render=function(t){var e=this._internalRoot;if(e===null)throw Error(ie(409));kl(t,e,null,null)};Fl.prototype.unmount=Lf.prototype.unmount=function(){var t=this._internalRoot;if(t!==null){this._internalRoot=null;var e=t.containerInfo;wr(function(){kl(null,t,null,null)}),e[fi]=null}};function Fl(t){this._internalRoot=t}Fl.prototype.unstable_scheduleHydration=function(t){if(t){var e=l0();t={blockedOn:null,target:t,priority:e};for(var n=0;n<Ri.length&&e!==0&&e<Ri[n].priority;n++);Ri.splice(n,0,t),n===0&&u0(t)}};function Df(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)}function Ol(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11&&(t.nodeType!==8||t.nodeValue!==" react-mount-point-unstable "))}function dp(){}function J_(t,e,n,i,r){if(r){if(typeof i=="function"){var s=i;i=function(){var c=vl(a);s.call(c)}}var a=Ng(e,i,t,0,null,!1,!1,"",dp);return t._reactRootContainer=a,t[fi]=a.current,xa(t.nodeType===8?t.parentNode:t),wr(),a}for(;r=t.lastChild;)t.removeChild(r);if(typeof i=="function"){var o=i;i=function(){var c=vl(l);o.call(c)}}var l=Nf(t,0,!1,null,null,!1,!1,"",dp);return t._reactRootContainer=l,t[fi]=l.current,xa(t.nodeType===8?t.parentNode:t),wr(function(){kl(e,l,n,i)}),l}function zl(t,e,n,i,r){var s=n._reactRootContainer;if(s){var a=s;if(typeof r=="function"){var o=r;r=function(){var l=vl(a);o.call(l)}}kl(e,a,t,r)}else a=J_(n,e,t,r,i);return vl(a)}a0=function(t){switch(t.tag){case 3:var e=t.stateNode;if(e.current.memoizedState.isDehydrated){var n=$s(e.pendingLanes);n!==0&&(Zd(e,n|1),nn(e,yt()),!(qe&6)&&(vs=yt()+500,Ki()))}break;case 13:wr(function(){var i=hi(t,1);if(i!==null){var r=jt();zn(i,t,1,r)}}),Pf(t,1)}};Qd=function(t){if(t.tag===13){var e=hi(t,134217728);if(e!==null){var n=jt();zn(e,t,134217728,n)}Pf(t,134217728)}};o0=function(t){if(t.tag===13){var e=Bi(t),n=hi(t,e);if(n!==null){var i=jt();zn(n,t,e,i)}Pf(t,e)}};l0=function(){return it};c0=function(t,e){var n=it;try{return it=t,e()}finally{it=n}};pu=function(t,e,n){switch(e){case"input":if(ou(t,n),e=n.name,n.type==="radio"&&e!=null){for(n=t;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll("input[name="+JSON.stringify(""+e)+'][type="radio"]'),e=0;e<n.length;e++){var i=n[e];if(i!==t&&i.form===t.form){var r=Rl(i);if(!r)throw Error(ie(90));Bm(i),ou(i,r)}}}break;case"textarea":Vm(t,n);break;case"select":e=n.value,e!=null&&is(t,!!n.multiple,e,!1)}};$m=bf;Km=wr;var ey={usingClientEntryPoint:!1,Events:[Da,$r,Rl,qm,Ym,bf]},zs={findFiberByHostInstance:dr,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},ty={bundleType:zs.bundleType,version:zs.version,rendererPackageName:zs.rendererPackageName,rendererConfig:zs.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:gi.ReactCurrentDispatcher,findHostInstanceByFiber:function(t){return t=Jm(t),t===null?null:t.stateNode},findFiberByHostInstance:zs.findFiberByHostInstance||Q_,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var so=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!so.isDisabled&&so.supportsFiber)try{Tl=so.inject(ty),Yn=so}catch{}}mn.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=ey;mn.createPortal=function(t,e){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!Df(e))throw Error(ie(200));return Z_(t,e,null,n)};mn.createRoot=function(t,e){if(!Df(t))throw Error(ie(299));var n=!1,i="",r=Pg;return e!=null&&(e.unstable_strictMode===!0&&(n=!0),e.identifierPrefix!==void 0&&(i=e.identifierPrefix),e.onRecoverableError!==void 0&&(r=e.onRecoverableError)),e=Nf(t,1,!1,null,null,n,!1,i,r),t[fi]=e.current,xa(t.nodeType===8?t.parentNode:t),new Lf(e)};mn.findDOMNode=function(t){if(t==null)return null;if(t.nodeType===1)return t;var e=t._reactInternals;if(e===void 0)throw typeof t.render=="function"?Error(ie(188)):(t=Object.keys(t).join(","),Error(ie(268,t)));return t=Jm(e),t=t===null?null:t.stateNode,t};mn.flushSync=function(t){return wr(t)};mn.hydrate=function(t,e,n){if(!Ol(e))throw Error(ie(200));return zl(null,t,e,!0,n)};mn.hydrateRoot=function(t,e,n){if(!Df(t))throw Error(ie(405));var i=n!=null&&n.hydratedSources||null,r=!1,s="",a=Pg;if(n!=null&&(n.unstable_strictMode===!0&&(r=!0),n.identifierPrefix!==void 0&&(s=n.identifierPrefix),n.onRecoverableError!==void 0&&(a=n.onRecoverableError)),e=Ng(e,null,t,1,n??null,r,!1,s,a),t[fi]=e.current,xa(t),i)for(t=0;t<i.length;t++)n=i[t],r=n._getVersion,r=r(n._source),e.mutableSourceEagerHydrationData==null?e.mutableSourceEagerHydrationData=[n,r]:e.mutableSourceEagerHydrationData.push(n,r);return new Fl(e)};mn.render=function(t,e,n){if(!Ol(e))throw Error(ie(200));return zl(null,t,e,!1,n)};mn.unmountComponentAtNode=function(t){if(!Ol(t))throw Error(ie(40));return t._reactRootContainer?(wr(function(){zl(null,null,t,!1,function(){t._reactRootContainer=null,t[fi]=null})}),!0):!1};mn.unstable_batchedUpdates=bf;mn.unstable_renderSubtreeIntoContainer=function(t,e,n,i){if(!Ol(n))throw Error(ie(200));if(t==null||t._reactInternals===void 0)throw Error(ie(38));return zl(t,e,n,!1,i)};mn.version="18.3.1-next-f1338f8080-20240426";function Lg(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Lg)}catch(t){console.error(t)}}Lg(),Lm.exports=mn;var ny=Lm.exports,fp=ny;eu.createRoot=fp.createRoot,eu.hydrateRoot=fp.hydrateRoot;var hp="1.3.26";function Dg(t,e,n){return Math.max(t,Math.min(e,n))}function iy(t,e,n){return(1-n)*t+n*e}function ry(t,e,n,i){return iy(t,e,1-Math.exp(-n*i))}function sy(t,e){return(t%e+e)%e}var ay=class{constructor(){Se(this,"isRunning",!1);Se(this,"value",0);Se(this,"from",0);Se(this,"to",0);Se(this,"currentTime",0);Se(this,"lerp");Se(this,"duration");Se(this,"easing");Se(this,"onUpdate")}advance(t){var n;if(!this.isRunning)return;let e=!1;if(this.duration&&this.easing){this.currentTime+=t;const i=Dg(0,this.currentTime/this.duration,1);e=i>=1;const r=e?1:this.easing(i);this.value=this.from+(this.to-this.from)*r}else this.lerp?(this.value=ry(this.value,this.to,this.lerp*60,t),Math.round(this.value)===Math.round(this.to)&&(this.value=this.to,e=!0)):(this.value=this.to,e=!0);e&&this.stop(),(n=this.onUpdate)==null||n.call(this,this.value,e)}stop(){this.isRunning=!1}fromTo(t,e,{lerp:n,duration:i,easing:r,onStart:s,onUpdate:a}){this.from=this.value=t,this.to=e,this.lerp=n,this.duration=i,this.easing=r,this.currentTime=0,this.isRunning=!0,s==null||s(),this.onUpdate=a}};function oy(t,e){let n;return function(...i){clearTimeout(n),n=setTimeout(()=>{n=void 0,t.apply(this,i)},e)}}var ly=class{constructor(t,e,{autoResize:n=!0,debounce:i=250}={}){Se(this,"width",0);Se(this,"height",0);Se(this,"scrollHeight",0);Se(this,"scrollWidth",0);Se(this,"debouncedResize");Se(this,"wrapperResizeObserver");Se(this,"contentResizeObserver");Se(this,"resize",()=>{this.onWrapperResize(),this.onContentResize()});Se(this,"onWrapperResize",()=>{this.wrapper instanceof Window?(this.width=window.innerWidth,this.height=window.innerHeight):(this.width=this.wrapper.clientWidth,this.height=this.wrapper.clientHeight)});Se(this,"onContentResize",()=>{this.wrapper instanceof Window?(this.scrollHeight=this.content.scrollHeight,this.scrollWidth=this.content.scrollWidth):(this.scrollHeight=this.wrapper.scrollHeight,this.scrollWidth=this.wrapper.scrollWidth)});this.wrapper=t,this.content=e,n&&(this.debouncedResize=oy(this.resize,i),this.wrapper instanceof Window?window.addEventListener("resize",this.debouncedResize):(this.wrapperResizeObserver=new ResizeObserver(this.debouncedResize),this.wrapperResizeObserver.observe(this.wrapper)),this.contentResizeObserver=new ResizeObserver(this.debouncedResize),this.contentResizeObserver.observe(this.content)),this.resize()}destroy(){var t,e;(t=this.wrapperResizeObserver)==null||t.disconnect(),(e=this.contentResizeObserver)==null||e.disconnect(),this.wrapper===window&&this.debouncedResize&&window.removeEventListener("resize",this.debouncedResize)}get limit(){return{x:this.scrollWidth-this.width,y:this.scrollHeight-this.height}}},Ig=class{constructor(){Se(this,"events",{})}emit(t,...e){var i;const n=this.events[t]||[];for(let r=0,s=n.length;r<s;r++)(i=n[r])==null||i.call(n,...e)}on(t,e){return this.events[t]?this.events[t].push(e):this.events[t]=[e],()=>{var n;this.events[t]=(n=this.events[t])==null?void 0:n.filter(i=>e!==i)}}off(t,e){var n;this.events[t]=(n=this.events[t])==null?void 0:n.filter(i=>e!==i)}destroy(){this.events={}}};const cy=100/6,yi={passive:!1};function pp(t,e){return t===1?cy:t===2?e:1}var uy=class{constructor(t,e={wheelMultiplier:1,touchMultiplier:1}){Se(this,"touchStart",{x:0,y:0});Se(this,"lastDelta",{x:0,y:0});Se(this,"window",{width:0,height:0});Se(this,"emitter",new Ig);Se(this,"onTouchStart",t=>{const{clientX:e,clientY:n}=t.targetTouches?t.targetTouches[0]:t;this.touchStart.x=e,this.touchStart.y=n,this.lastDelta={x:0,y:0},this.emitter.emit("scroll",{deltaX:0,deltaY:0,event:t})});Se(this,"onTouchMove",t=>{const{clientX:e,clientY:n}=t.targetTouches?t.targetTouches[0]:t,i=-(e-this.touchStart.x)*this.options.touchMultiplier,r=-(n-this.touchStart.y)*this.options.touchMultiplier;this.touchStart.x=e,this.touchStart.y=n,this.lastDelta={x:i,y:r},this.emitter.emit("scroll",{deltaX:i,deltaY:r,event:t})});Se(this,"onTouchEnd",t=>{this.emitter.emit("scroll",{deltaX:this.lastDelta.x,deltaY:this.lastDelta.y,event:t})});Se(this,"onWheel",t=>{let{deltaX:e,deltaY:n,deltaMode:i}=t;const r=pp(i,this.window.width),s=pp(i,this.window.height);e*=r,n*=s,e*=this.options.wheelMultiplier,n*=this.options.wheelMultiplier,this.emitter.emit("scroll",{deltaX:e,deltaY:n,event:t})});Se(this,"onWindowResize",()=>{this.window={width:window.innerWidth,height:window.innerHeight}});this.element=t,this.options=e,window.addEventListener("resize",this.onWindowResize),this.onWindowResize(),this.element.addEventListener("wheel",this.onWheel,yi),this.element.addEventListener("touchstart",this.onTouchStart,yi),this.element.addEventListener("touchmove",this.onTouchMove,yi),this.element.addEventListener("touchend",this.onTouchEnd,yi)}on(t,e){return this.emitter.on(t,e)}destroy(){this.emitter.destroy(),window.removeEventListener("resize",this.onWindowResize),this.element.removeEventListener("wheel",this.onWheel,yi),this.element.removeEventListener("touchstart",this.onTouchStart,yi),this.element.removeEventListener("touchmove",this.onTouchMove,yi),this.element.removeEventListener("touchend",this.onTouchEnd,yi)}};const mp=t=>Math.min(1,1.001-2**(-10*t));var dy=class{constructor({wrapper:t=window,content:e=document.documentElement,eventsTarget:n=t,smoothWheel:i=!0,syncTouch:r=!1,syncTouchLerp:s=.075,touchInertiaExponent:a=1.7,duration:o,easing:l,lerp:c=.1,infinite:d=!1,orientation:p="vertical",gestureOrientation:h=p==="horizontal"?"both":"vertical",touchMultiplier:g=1,wheelMultiplier:v=1,autoResize:S=!0,prevent:m,virtualScroll:u,overscroll:_=!0,autoRaf:x=!1,anchors:w=!1,autoToggle:P=!1,allowNestedScroll:b=!1,__experimental__naiveDimensions:A=!1,naiveDimensions:N=A,stopInertiaOnNavigate:V=!1,respectReducedMotion:y=!0}={}){Se(this,"_isScrolling",!1);Se(this,"_isStopped",!1);Se(this,"_isLocked",!1);Se(this,"_preventNextNativeScrollEvent",!1);Se(this,"_resetVelocityTimeout",null);Se(this,"_rafId",null);Se(this,"_isDraggingSelection",!1);Se(this,"reducedMotionMediaQuery",window.matchMedia("(prefers-reduced-motion: reduce)"));Se(this,"isTouching");Se(this,"isIos");Se(this,"time",0);Se(this,"userData",{});Se(this,"lastVelocity",0);Se(this,"velocity",0);Se(this,"direction",0);Se(this,"options");Se(this,"targetScroll");Se(this,"animatedScroll");Se(this,"animate",new ay);Se(this,"emitter",new Ig);Se(this,"dimensions");Se(this,"virtualScroll");Se(this,"onScrollEnd",t=>{t instanceof CustomEvent||(this.isScrolling==="smooth"||this.isScrolling===!1)&&t.stopPropagation()});Se(this,"dispatchScrollendEvent",()=>{this.options.wrapper.dispatchEvent(new CustomEvent("scrollend",{bubbles:this.options.wrapper===window,detail:{lenisScrollEnd:!0}}))});Se(this,"onTransitionEnd",t=>{var e;(e=t.propertyName)!=null&&e.includes("overflow")&&t.target===this.rootElement&&this.checkOverflow()});Se(this,"onClick",t=>{const e=t.composedPath().filter(i=>i instanceof HTMLAnchorElement&&i.href).map(i=>new URL(i.href)),n=new URL(window.location.href);if(this.options.anchors){const i=e.find(r=>n.host===r.host&&n.pathname===r.pathname&&r.hash);if(i){const r=typeof this.options.anchors=="object"&&this.options.anchors?this.options.anchors:void 0,s=decodeURIComponent(i.hash);this.scrollTo(s,r);return}}if(this.options.stopInertiaOnNavigate&&e.some(i=>n.host===i.host&&n.pathname!==i.pathname)){this.reset();return}});Se(this,"onPointerDown",t=>{t.button===1&&this.reset()});Se(this,"onVirtualScroll",t=>{if(typeof this.options.virtualScroll=="function"&&this.options.virtualScroll(t)===!1)return;const{deltaX:e,deltaY:n,event:i}=t;if(this.emitter.emit("virtual-scroll",{deltaX:e,deltaY:n,event:i}),i.ctrlKey||i.lenisStopPropagation)return;const r=i.type.includes("touch"),s=i.type.includes("wheel");if(r&&this.isIos&&(i.type==="touchstart"&&(this._isDraggingSelection=this.isTouchOnSelectionHandle(i)),this._isDraggingSelection)){i.type==="touchend"&&(this._isDraggingSelection=!1);return}this.isTouching=i.type==="touchstart"||i.type==="touchmove";const a=e===0&&n===0;if(this.options.syncTouch&&r&&i.type==="touchstart"&&a&&!this.isStopped&&!this.isLocked){this.reset();return}const o=this.options.gestureOrientation==="vertical"&&n===0||this.options.gestureOrientation==="horizontal"&&e===0;if(a||o)return;let l=i.composedPath();l=l.slice(0,l.indexOf(this.rootElement));const c=this.options.prevent,d=Math.abs(e)>=Math.abs(n)?"horizontal":"vertical";if(l.find(v=>{var S,m,u,_,x;return v instanceof HTMLElement&&(typeof c=="function"&&(c==null?void 0:c(v))||((S=v.hasAttribute)==null?void 0:S.call(v,"data-lenis-prevent"))||d==="vertical"&&((m=v.hasAttribute)==null?void 0:m.call(v,"data-lenis-prevent-vertical"))||d==="horizontal"&&((u=v.hasAttribute)==null?void 0:u.call(v,"data-lenis-prevent-horizontal"))||r&&((_=v.hasAttribute)==null?void 0:_.call(v,"data-lenis-prevent-touch"))||s&&((x=v.hasAttribute)==null?void 0:x.call(v,"data-lenis-prevent-wheel"))||this.options.allowNestedScroll&&this.hasNestedScroll(v,{deltaX:e,deltaY:n}))}))return;if(this.isStopped||this.isLocked){i.cancelable&&i.preventDefault();return}if(!(this.options.syncTouch&&r||this.options.smoothWheel&&s)){this.isScrolling="native",this.animate.stop(),i.lenisStopPropagation=!0;return}let p=n;this.options.gestureOrientation==="both"?p=Math.abs(n)>Math.abs(e)?n:e:this.options.gestureOrientation==="horizontal"&&(p=e),(!this.options.overscroll||this.options.infinite||this.options.wrapper!==window&&this.limit>0&&(this.animatedScroll>0&&this.animatedScroll<this.limit||this.animatedScroll===0&&n>0||this.animatedScroll===this.limit&&n<0))&&(i.lenisStopPropagation=!0),i.cancelable&&i.preventDefault();const h=r&&this.options.syncTouch,g=r&&i.type==="touchend";g&&(p=Math.sign(p)*Math.abs(this.velocity)**this.options.touchInertiaExponent),this.scrollTo(this.targetScroll+p,{programmatic:!1,...h?{lerp:g?this.options.syncTouchLerp:1}:{lerp:this.options.lerp,duration:this.options.duration,easing:this.options.easing}})});Se(this,"onNativeScroll",()=>{if(this._resetVelocityTimeout!==null&&(clearTimeout(this._resetVelocityTimeout),this._resetVelocityTimeout=null),this._preventNextNativeScrollEvent){this._preventNextNativeScrollEvent=!1;return}if(this.isScrolling===!1||this.isScrolling==="native"){const t=this.animatedScroll;this.animatedScroll=this.targetScroll=this.actualScroll,this.lastVelocity=this.velocity,this.velocity=this.animatedScroll-t,this.direction=Math.sign(this.animatedScroll-t),this.isStopped||(this.isScrolling="native"),this.emit(),this.velocity!==0&&(this._resetVelocityTimeout=setTimeout(()=>{this.lastVelocity=this.velocity,this.velocity=0,this.isScrolling=!1,this.emit()},400))}});Se(this,"raf",t=>{const e=t-(this.time||t);this.time=t,this.animate.advance(e*.001),this.options.autoRaf&&(this._rafId=requestAnimationFrame(this.raf))});window.lenisVersion=hp,window.lenis||(window.lenis={}),window.lenis.version=hp,p==="horizontal"&&(window.lenis.horizontal=!0),r===!0&&(window.lenis.touch=!0),this.isIos=/(iPad|iPhone|iPod)/g.test(navigator.userAgent),(!t||t===document.documentElement)&&(t=window),typeof o=="number"&&typeof l!="function"?l=mp:typeof l=="function"&&typeof o!="number"&&(o=1),this.options={wrapper:t,content:e,eventsTarget:n,smoothWheel:i,syncTouch:r,syncTouchLerp:s,touchInertiaExponent:a,duration:o,easing:l,lerp:c,infinite:d,gestureOrientation:h,orientation:p,touchMultiplier:g,wheelMultiplier:v,autoResize:S,prevent:m,virtualScroll:u,overscroll:_,autoRaf:x,anchors:w,autoToggle:P,allowNestedScroll:b,naiveDimensions:N,stopInertiaOnNavigate:V,respectReducedMotion:y},this.dimensions=new ly(t,e,{autoResize:S}),this.updateClassName(),this.targetScroll=this.animatedScroll=this.actualScroll,this.options.wrapper.addEventListener("scroll",this.onNativeScroll),this.options.wrapper.addEventListener("scrollend",this.onScrollEnd,{capture:!0}),(this.options.anchors||this.options.stopInertiaOnNavigate)&&this.options.wrapper.addEventListener("click",this.onClick),this.options.wrapper.addEventListener("pointerdown",this.onPointerDown),this.virtualScroll=new uy(n,{touchMultiplier:g,wheelMultiplier:v}),this.virtualScroll.on("scroll",this.onVirtualScroll),this.options.autoToggle&&(this.checkOverflow(),this.rootElement.addEventListener("transitionend",this.onTransitionEnd)),this.options.autoRaf&&(this._rafId=requestAnimationFrame(this.raf))}destroy(){this.emitter.destroy(),this.options.wrapper.removeEventListener("scroll",this.onNativeScroll),this.options.wrapper.removeEventListener("scrollend",this.onScrollEnd,{capture:!0}),this.options.wrapper.removeEventListener("pointerdown",this.onPointerDown),(this.options.anchors||this.options.stopInertiaOnNavigate)&&this.options.wrapper.removeEventListener("click",this.onClick),this.virtualScroll.destroy(),this.dimensions.destroy(),this.cleanUpClassName(),this._rafId&&cancelAnimationFrame(this._rafId)}on(t,e){return this.emitter.on(t,e)}off(t,e){return this.emitter.off(t,e)}get overflow(){const t=this.isHorizontal?"overflow-x":"overflow-y";return getComputedStyle(this.rootElement)[t]}checkOverflow(){["hidden","clip"].includes(this.overflow)?this.internalStop():this.internalStart()}setScroll(t){this.isHorizontal?this.options.wrapper.scrollTo({left:t,behavior:"instant"}):this.options.wrapper.scrollTo({top:t,behavior:"instant"})}isTouchOnSelectionHandle(t){const e=window.getSelection();if(!e||e.isCollapsed||e.rangeCount===0)return!1;const n=t.targetTouches[0]??t.changedTouches[0];if(!n)return!1;const i=e.getRangeAt(0).getClientRects();if(i.length===0)return!1;const r=i[0],s=i[i.length-1],a=40,o=Math.hypot(n.clientX-r.left,n.clientY-r.top)<=a,l=Math.hypot(n.clientX-s.right,n.clientY-s.bottom)<=a;return o||l}resize(){this.dimensions.resize(),this.animatedScroll=this.targetScroll=this.actualScroll,this.emit()}emit(){this.emitter.emit("scroll",this)}reset(){this.isLocked=!1,this.isScrolling=!1,this.animatedScroll=this.targetScroll=this.actualScroll,this.lastVelocity=this.velocity=0,this.animate.stop()}start(){if(this.isStopped){if(this.options.autoToggle){this.rootElement.style.removeProperty("overflow");return}this.internalStart()}}internalStart(){this.isStopped&&(this.reset(),this.isStopped=!1,this.emit())}stop(){if(!this.isStopped){if(this.options.autoToggle){this.rootElement.style.setProperty("overflow","clip");return}this.internalStop()}}internalStop(){this.isStopped||(this.reset(),this.isStopped=!0,this.emit())}scrollTo(t,{offset:e=0,immediate:n=!1,lock:i=!1,programmatic:r=!0,lerp:s=r?this.options.lerp:void 0,duration:a=r?this.options.duration:void 0,easing:o=r?this.options.easing:void 0,onStart:l,onComplete:c,force:d=!1,userData:p}={}){if(this.prefersReducedMotion&&(r?n=!0:(s=1,a=void 0,o=void 0)),(this.isStopped||this.isLocked)&&!d)return;let h=t,g=e;if(typeof h=="string"&&["top","left","start","#"].includes(h))h=0;else if(typeof h=="string"&&["bottom","right","end"].includes(h))h=this.limit;else{let v=null;if(typeof h=="string"?(v=h.startsWith("#")?document.getElementById(h.slice(1)):document.querySelector(h),v||(h==="#top"?h=0:console.warn("Lenis: Target not found",h))):h instanceof HTMLElement&&(h!=null&&h.nodeType)&&(v=h),v){if(this.options.wrapper!==window){const w=this.rootElement.getBoundingClientRect();g-=this.isHorizontal?w.left:w.top}const S=v.getBoundingClientRect(),m=getComputedStyle(v),u=this.isHorizontal?Number.parseFloat(m.scrollMarginLeft):Number.parseFloat(m.scrollMarginTop),_=getComputedStyle(this.rootElement),x=this.isHorizontal?Number.parseFloat(_.scrollPaddingLeft):Number.parseFloat(_.scrollPaddingTop);h=(this.isHorizontal?S.left:S.top)+this.animatedScroll-(Number.isNaN(u)?0:u)-(Number.isNaN(x)?0:x)}}if(typeof h=="number"){if(h+=g,this.options.infinite){if(r){this.targetScroll=this.animatedScroll=this.scroll;const v=h-this.animatedScroll;v>this.limit/2?h-=this.limit:v<-this.limit/2&&(h+=this.limit)}}else h=Dg(0,h,this.limit);if(h===this.targetScroll){l==null||l(this),c==null||c(this);return}if(this.userData=p??{},n){this.animatedScroll=this.targetScroll=h,this.setScroll(this.scroll),this.reset(),this.preventNextNativeScrollEvent(),this.emit(),c==null||c(this),this.userData={},requestAnimationFrame(()=>{this.dispatchScrollendEvent()});return}r||(this.targetScroll=h),typeof a=="number"&&typeof o!="function"?o=mp:typeof o=="function"&&typeof a!="number"&&(a=1),this.animate.fromTo(this.animatedScroll,h,{duration:a,easing:o,lerp:s,onStart:()=>{i&&(this.isLocked=!0),this.isScrolling="smooth",l==null||l(this)},onUpdate:(v,S)=>{this.isScrolling="smooth",this.lastVelocity=this.velocity,this.velocity=v-this.animatedScroll,this.direction=Math.sign(this.velocity),this.animatedScroll=v,this.setScroll(this.scroll),r&&(this.targetScroll=v),S||this.emit(),S&&(this.reset(),this.emit(),c==null||c(this),this.userData={},requestAnimationFrame(()=>{this.dispatchScrollendEvent()}),this.preventNextNativeScrollEvent())}})}}preventNextNativeScrollEvent(){this._preventNextNativeScrollEvent=!0,requestAnimationFrame(()=>{this._preventNextNativeScrollEvent=!1})}hasNestedScroll(t,{deltaX:e,deltaY:n}){const i=Date.now();t._lenis||(t._lenis={});const r=t._lenis;let s,a,o,l,c,d,p,h,g,v;if(i-(r.time??0)>2e3){r.time=Date.now();const b=window.getComputedStyle(t);if(r.computedStyle=b,s=["auto","overlay","scroll"].includes(b.overflowX),a=["auto","overlay","scroll"].includes(b.overflowY),c=["auto"].includes(b.overscrollBehaviorX),d=["auto"].includes(b.overscrollBehaviorY),r.hasOverflowX=s,r.hasOverflowY=a,!(s||a))return!1;p=t.scrollWidth,h=t.scrollHeight,g=t.clientWidth,v=t.clientHeight,o=p>g,l=h>v,r.isScrollableX=o,r.isScrollableY=l,r.scrollWidth=p,r.scrollHeight=h,r.clientWidth=g,r.clientHeight=v,r.hasOverscrollBehaviorX=c,r.hasOverscrollBehaviorY=d}else o=r.isScrollableX,l=r.isScrollableY,s=r.hasOverflowX,a=r.hasOverflowY,p=r.scrollWidth,h=r.scrollHeight,g=r.clientWidth,v=r.clientHeight,c=r.hasOverscrollBehaviorX,d=r.hasOverscrollBehaviorY;if(!(s&&o||a&&l))return!1;const S=Math.abs(e)>=Math.abs(n)?"horizontal":"vertical";let m,u,_,x,w,P;if(S==="horizontal")m=Math.round(t.scrollLeft),u=p-g,_=e,x=s,w=o,P=c;else if(S==="vertical")m=Math.round(t.scrollTop),u=h-v,_=n,x=a,w=l,P=d;else return!1;return!P&&(m>=u||m<=0)?!0:(_>0?m<u:m>0)&&x&&w}get rootElement(){return this.options.wrapper===window?document.documentElement:this.options.wrapper}get limit(){return this.options.naiveDimensions?this.isHorizontal?this.rootElement.scrollWidth-this.rootElement.clientWidth:this.rootElement.scrollHeight-this.rootElement.clientHeight:this.dimensions.limit[this.isHorizontal?"x":"y"]}get isHorizontal(){return this.options.orientation==="horizontal"}get actualScroll(){const t=this.options.wrapper;return this.isHorizontal?t.scrollX??t.scrollLeft:t.scrollY??t.scrollTop}get scroll(){return this.options.infinite?sy(this.animatedScroll,this.limit):this.animatedScroll}get progress(){return this.limit===0?1:this.scroll/this.limit}get isScrolling(){return this._isScrolling}set isScrolling(t){this._isScrolling!==t&&(this._isScrolling=t,this.updateClassName())}get isStopped(){return this._isStopped}set isStopped(t){this._isStopped!==t&&(this._isStopped=t,this.updateClassName())}get isLocked(){return this._isLocked}set isLocked(t){this._isLocked!==t&&(this._isLocked=t,this.updateClassName())}get isSmooth(){return this.isScrolling==="smooth"}get prefersReducedMotion(){return this.options.respectReducedMotion&&this.reducedMotionMediaQuery.matches}get className(){let t="lenis";return this.options.autoToggle&&(t+=" lenis-autoToggle"),this.isStopped&&(t+=" lenis-stopped"),this.isLocked&&(t+=" lenis-locked"),this.isScrolling&&(t+=" lenis-scrolling"),this.isScrolling==="smooth"&&(t+=" lenis-smooth"),t}updateClassName(){this.cleanUpClassName(),this.className.split(" ").forEach(t=>{this.rootElement.classList.add(t)})}cleanUpClassName(){for(const t of Array.from(this.rootElement.classList))(t==="lenis"||t.startsWith("lenis-"))&&this.rootElement.classList.remove(t)}};/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const fy=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),Ug=(...t)=>t.filter((e,n,i)=>!!e&&e.trim()!==""&&i.indexOf(e)===n).join(" ").trim();/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var hy={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const py=ae.forwardRef(({color:t="currentColor",size:e=24,strokeWidth:n=2,absoluteStrokeWidth:i,className:r="",children:s,iconNode:a,...o},l)=>ae.createElement("svg",{ref:l,...hy,width:e,height:e,stroke:t,strokeWidth:i?Number(n)*24/Number(e):n,className:Ug("lucide",r),...o},[...a.map(([c,d])=>ae.createElement(c,d)),...Array.isArray(s)?s:[s]]));/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ke=(t,e)=>{const n=ae.forwardRef(({className:i,...r},s)=>ae.createElement(py,{ref:s,iconNode:e,className:Ug(`lucide-${fy(t)}`,i),...r}));return n.displayName=`${t}`,n};/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const my=ke("Activity",[["path",{d:"M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",key:"169zse"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const gy=ke("Award",[["path",{d:"m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526",key:"1yiouv"}],["circle",{cx:"12",cy:"8",r:"6",key:"1vp47v"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _l=ke("BookOpen",[["path",{d:"M12 7v14",key:"1akyts"}],["path",{d:"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",key:"ruj8y"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xy=ke("Brain",[["path",{d:"M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z",key:"l5xja"}],["path",{d:"M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z",key:"ep3f8r"}],["path",{d:"M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4",key:"1p4c4q"}],["path",{d:"M17.599 6.5a3 3 0 0 0 .399-1.375",key:"tmeiqw"}],["path",{d:"M6.003 5.125A3 3 0 0 0 6.401 6.5",key:"105sqy"}],["path",{d:"M3.477 10.896a4 4 0 0 1 .585-.396",key:"ql3yin"}],["path",{d:"M19.938 10.5a4 4 0 0 1 .585.396",key:"1qfode"}],["path",{d:"M6 18a4 4 0 0 1-1.967-.516",key:"2e4loj"}],["path",{d:"M19.967 17.484A4 4 0 0 1 18 18",key:"159ez6"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const kg=ke("Briefcase",[["path",{d:"M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16",key:"jecpp"}],["rect",{width:"20",height:"14",x:"2",y:"6",rx:"2",key:"i6l2r4"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const vy=ke("Calendar",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ba=ke("Check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _y=ke("ChevronLeft",[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Fg=ke("ChevronRight",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const yy=ke("CircleAlert",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const qu=ke("CircleCheck",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Sy=ke("CircleHelp",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3",key:"1u773s"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const My=ke("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Bl=ke("Coins",[["circle",{cx:"8",cy:"8",r:"6",key:"3yglwk"}],["path",{d:"M18.09 10.37A6 6 0 1 1 10.34 18",key:"t5s6rm"}],["path",{d:"M7 6h1v4",key:"1obek4"}],["path",{d:"m16.71 13.88.7.71-2.82 2.82",key:"1rbuyh"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const wy=ke("Compass",[["path",{d:"m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z",key:"9ktpf1"}],["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Og=ke("Copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ey=ke("CornerDownLeft",[["polyline",{points:"9 10 4 15 9 20",key:"r3jprv"}],["path",{d:"M20 4v7a4 4 0 0 1-4 4H4",key:"6o5b7l"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ty=ke("ExternalLink",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const by=ke("Gamepad2",[["line",{x1:"6",x2:"10",y1:"11",y2:"11",key:"1gktln"}],["line",{x1:"8",x2:"8",y1:"9",y2:"13",key:"qnk9ow"}],["line",{x1:"15",x2:"15.01",y1:"12",y2:"12",key:"krot7o"}],["line",{x1:"18",x2:"18.01",y1:"10",y2:"10",key:"1lcuu1"}],["path",{d:"M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z",key:"mfqc10"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Yu=ke("Gift",[["rect",{x:"3",y:"8",width:"18",height:"4",rx:"1",key:"bkv52"}],["path",{d:"M12 8v13",key:"1c76mn"}],["path",{d:"M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7",key:"6wjy6b"}],["path",{d:"M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5",key:"1ihvrl"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ay=ke("Globe",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",key:"13o1zl"}],["path",{d:"M2 12h20",key:"9i4pu4"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const If=ke("Heart",[["path",{d:"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",key:"c3ymky"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Cy=ke("LayoutGrid",[["rect",{width:"7",height:"7",x:"3",y:"3",rx:"1",key:"1g98yp"}],["rect",{width:"7",height:"7",x:"14",y:"3",rx:"1",key:"6d4xhi"}],["rect",{width:"7",height:"7",x:"14",y:"14",rx:"1",key:"nxv5o0"}],["rect",{width:"7",height:"7",x:"3",y:"14",rx:"1",key:"1bb6yr"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ry=ke("Lock",[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ny=ke("Menu",[["line",{x1:"4",x2:"20",y1:"12",y2:"12",key:"1e0a9i"}],["line",{x1:"4",x2:"20",y1:"6",y2:"6",key:"1owob3"}],["line",{x1:"4",x2:"20",y1:"18",y2:"18",key:"yk5zj1"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Py=ke("MessageCircle",[["path",{d:"M7.9 20A9 9 0 1 0 4 16.1L2 22Z",key:"vv11sd"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ly=ke("MessageSquare",[["path",{d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",key:"1lielz"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Dy=ke("PenLine",[["path",{d:"M12 20h9",key:"t2du7b"}],["path",{d:"M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z",key:"1ykcvy"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Uf=ke("Search",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const la=ke("Share2",[["circle",{cx:"18",cy:"5",r:"3",key:"gq8acd"}],["circle",{cx:"6",cy:"12",r:"3",key:"w7nqdw"}],["circle",{cx:"18",cy:"19",r:"3",key:"1xt0gg"}],["line",{x1:"8.59",x2:"15.42",y1:"13.51",y2:"17.49",key:"47mynk"}],["line",{x1:"15.41",x2:"8.59",y1:"6.51",y2:"10.49",key:"1n3mei"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const zg=ke("ShieldAlert",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"M12 8v4",key:"1got3b"}],["path",{d:"M12 16h.01",key:"1drbdi"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Bg=ke("ShieldCheck",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Iy=ke("ShoppingBag",[["path",{d:"M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z",key:"hou9p0"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M16 10a4 4 0 0 1-8 0",key:"1ltviw"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const hn=ke("Sparkles",[["path",{d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",key:"4pj2yx"}],["path",{d:"M20 3v4",key:"1olli1"}],["path",{d:"M22 5h-4",key:"1gvqau"}],["path",{d:"M4 17v2",key:"vumght"}],["path",{d:"M5 18H3",key:"zchphs"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Uy=ke("Tag",[["path",{d:"M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z",key:"vktsd0"}],["circle",{cx:"7.5",cy:"7.5",r:".5",fill:"currentColor",key:"kqv944"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Aa=ke("Terminal",[["polyline",{points:"4 17 10 11 4 5",key:"akl6gq"}],["line",{x1:"12",x2:"20",y1:"19",y2:"19",key:"q2wloq"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ky=ke("Trash2",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Hg=ke("User",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Fy=ke("Volume2",[["path",{d:"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",key:"uqj9uw"}],["path",{d:"M16 9a5 5 0 0 1 0 6",key:"1q6k2b"}],["path",{d:"M19.364 18.364a9 9 0 0 0 0-12.728",key:"ijwkga"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Oy=ke("VolumeX",[["path",{d:"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",key:"uqj9uw"}],["line",{x1:"22",x2:"16",y1:"9",y2:"15",key:"1ewh16"}],["line",{x1:"16",x2:"22",y1:"9",y2:"15",key:"5ykzw1"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _s=ke("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const zy=ke("ZoomIn",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["line",{x1:"21",x2:"16.65",y1:"21",y2:"16.65",key:"13gj7c"}],["line",{x1:"11",x2:"11",y1:"8",y2:"14",key:"1vmskp"}],["line",{x1:"8",x2:"14",y1:"11",y2:"11",key:"durymu"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const By=ke("ZoomOut",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["line",{x1:"21",x2:"16.65",y1:"21",y2:"16.65",key:"13gj7c"}],["line",{x1:"8",x2:"14",y1:"11",y2:"11",key:"durymu"}]]);function Hy({lang:t,setLang:e,t:n}){const[i,r]=ae.useState(!1),s=()=>{const a=t==="pt"?"en":"pt";e(a),localStorage.setItem("pyxie_lang",a);const o=new URL(window.location.href);o.searchParams.set("lang",a),window.history.replaceState({},"",o)};return f.jsxs("header",{className:"sticky top-0 z-50 w-full bg-[#080410]/80 backdrop-blur-2xl border-b border-purple-500/15 transition-all",children:[f.jsxs("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between",children:[f.jsxs("a",{href:"/",className:"flex items-center gap-3 group",children:[f.jsxs("div",{className:"relative",children:[f.jsx("img",{src:"/assets/pyxie/pyxie_pixelart_face.png",alt:"Pyxie Mascot",className:"w-10 h-10 object-contain rounded-xl border border-pink-500/30 group-hover:border-pink-500/60 transition-all shadow-neon-pink"}),f.jsx("span",{className:"absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#080410] animate-pulse"})]}),f.jsxs("div",{className:"flex flex-col",children:[f.jsx("span",{className:"font-title font-extrabold text-xl tracking-tight text-white group-hover:text-pink-400 transition-colors",children:"Pyxie"}),f.jsx("span",{className:"text-[10px] font-mono font-medium text-purple-300/70 tracking-wider uppercase",children:"Discord.js v14"})]})]}),f.jsxs("nav",{className:"hidden md:flex items-center gap-1.5 lg:gap-2",children:[f.jsx("a",{href:"/#pilares",className:"px-3 py-1.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all",children:n("nav.features")}),f.jsxs("a",{href:"/wiki",className:"px-3 py-1.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5",children:[f.jsx(_l,{className:"w-3.5 h-3.5 text-purple-400"}),n("nav.wiki")]}),f.jsxs("a",{href:"/museu",className:"px-3 py-1.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5",children:[f.jsx(hn,{className:"w-3.5 h-3.5 text-pink-400"}),n("nav.museum")]}),f.jsxs("a",{href:"/bonus",className:"px-3 py-1.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5",children:[f.jsx(Yu,{className:"w-3.5 h-3.5 text-amber-400"}),n("nav.bonus"),f.jsx("span",{className:"ml-1 text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30",children:"10s"})]}),f.jsx("a",{href:"/discord",target:"_blank",rel:"noopener noreferrer",className:"px-3 py-1.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all",children:n("nav.support")})]}),f.jsxs("div",{className:"flex items-center gap-3",children:[f.jsxs("button",{onClick:s,className:"px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-purple-500/20 hover:border-purple-500/40 transition-all flex items-center gap-1.5",title:"Switch Language / Alternar Idioma",children:[f.jsx(Ay,{className:"w-3.5 h-3.5 text-pink-400"}),f.jsx("span",{children:t==="pt"?"PT-BR":"EN"})]}),f.jsxs("a",{href:"/invite",target:"_blank",rel:"noopener noreferrer",className:"hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 shadow-neon-pink transition-all transform hover:-translate-y-0.5 active:translate-y-0",children:[f.jsx(hn,{className:"w-4 h-4 text-pink-200"}),f.jsx("span",{children:n("nav.invite")})]}),f.jsx("button",{onClick:()=>r(!i),className:"md:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-white/5 border border-purple-500/20","aria-label":"Toggle menu",children:i?f.jsx(_s,{className:"w-5 h-5"}):f.jsx(Ny,{className:"w-5 h-5"})})]})]}),i&&f.jsxs("div",{className:"md:hidden bg-[#080410]/95 backdrop-blur-2xl border-b border-purple-500/20 px-4 pt-3 pb-6 flex flex-col gap-2 animate-fadeIn",children:[f.jsx("a",{href:"/#pilares",onClick:()=>r(!1),className:"px-4 py-2.5 rounded-xl text-base font-semibold text-slate-200 hover:bg-white/5",children:n("nav.features")}),f.jsxs("a",{href:"/wiki",onClick:()=>r(!1),className:"px-4 py-2.5 rounded-xl text-base font-semibold text-slate-200 hover:bg-white/5 flex items-center justify-between",children:[f.jsx("span",{children:n("nav.wiki")}),f.jsx(_l,{className:"w-4 h-4 text-purple-400"})]}),f.jsxs("a",{href:"/museu",onClick:()=>r(!1),className:"px-4 py-2.5 rounded-xl text-base font-semibold text-slate-200 hover:bg-white/5 flex items-center justify-between",children:[f.jsx("span",{children:n("nav.museum")}),f.jsx(hn,{className:"w-4 h-4 text-pink-400"})]}),f.jsxs("a",{href:"/bonus",onClick:()=>r(!1),className:"px-4 py-2.5 rounded-xl text-base font-semibold text-slate-200 hover:bg-white/5 flex items-center justify-between",children:[f.jsx("span",{children:n("nav.bonus")}),f.jsx(Yu,{className:"w-4 h-4 text-amber-400"})]}),f.jsx("a",{href:"/discord",target:"_blank",rel:"noopener noreferrer",className:"px-4 py-2.5 rounded-xl text-base font-semibold text-slate-200 hover:bg-white/5",children:n("nav.support")}),f.jsx("div",{className:"pt-2 border-t border-purple-500/15 flex flex-col gap-2",children:f.jsx("a",{href:"/invite",target:"_blank",rel:"noopener noreferrer",className:"w-full text-center py-3 rounded-xl font-bold text-white bg-gradient-to-r from-pink-600 to-purple-600 shadow-neon-pink",children:n("nav.invite")})})]})]})}function Vy({t}){return f.jsx("footer",{className:"w-full bg-[#06030c] border-t border-purple-500/15 py-12 px-4 sm:px-6 lg:px-8 mt-20",children:f.jsxs("div",{className:"max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left",children:[f.jsxs("div",{className:"flex items-center gap-3",children:[f.jsx("img",{src:"/assets/pyxie/pyxie_pixelart_face.png",alt:"Pyxie Mascot Mini",className:"w-8 h-8 rounded-lg border border-purple-500/30"}),f.jsxs("div",{children:[f.jsx("span",{className:"font-title font-bold text-white text-base",children:"Pyxie"}),f.jsx("p",{className:"text-xs text-slate-400",children:t("footer.rights")})]})]}),f.jsxs("div",{className:"flex flex-wrap items-center justify-center gap-5 text-sm font-medium text-slate-300",children:[f.jsx("a",{href:"/wiki",className:"hover:text-pink-400 transition-colors",children:t("footer.wiki")}),f.jsx("a",{href:"/museu",className:"hover:text-pink-400 transition-colors",children:t("footer.museum")}),f.jsx("a",{href:"/bonus",className:"hover:text-pink-400 transition-colors",children:t("footer.bonus")}),f.jsxs("a",{href:"/termos",className:"hover:text-pink-400 transition-colors flex items-center gap-1.5",children:[f.jsx(Bg,{className:"w-3.5 h-3.5 text-purple-400"}),t("footer.terms")]}),f.jsx("a",{href:"/promo",target:"_blank",rel:"noopener noreferrer",className:"hover:text-pink-400 transition-colors",children:"Shopee"}),f.jsx("a",{href:"/discord",target:"_blank",rel:"noopener noreferrer",className:"hover:text-pink-400 transition-colors",children:"Discord"})]})]})})}function jy({t}){const[e,n]=ae.useState("work"),[i,r]=ae.useState(null),[s,a]=ae.useState(""),[o,l]=ae.useState(!1);return ae.useEffect(()=>{if(e==="tarot"){const c=t("terminal.tarotDesc");let d=0;a(""),l(!1);const p=setInterval(()=>{d<c.length?(a(c.slice(0,d+1)),d++):(l(!0),clearInterval(p))},25);return()=>clearInterval(p)}},[e,t]),f.jsxs("div",{className:"w-full max-w-xl mx-auto rounded-2xl glass-panel border border-purple-500/25 overflow-hidden shadow-2xl backdrop-blur-2xl",children:[f.jsxs("div",{className:"px-4 py-3 bg-[#0d071b]/90 border-b border-purple-500/15 flex items-center justify-between",children:[f.jsxs("div",{className:"flex items-center gap-2",children:[f.jsx("span",{className:"w-3 h-3 rounded-full bg-rose-500 inline-block"}),f.jsx("span",{className:"w-3 h-3 rounded-full bg-amber-500 inline-block"}),f.jsx("span",{className:"w-3 h-3 rounded-full bg-emerald-500 inline-block"}),f.jsxs("span",{className:"ml-2 font-mono text-xs text-purple-300/60 font-semibold flex items-center gap-1.5",children:[f.jsx(Aa,{className:"w-3.5 h-3.5 text-pink-400"})," pyxie-simulator@discord:~"]})]}),f.jsxs("div",{className:"flex items-center gap-1",children:[f.jsx("span",{className:"w-2 h-2 rounded-full bg-emerald-400 animate-ping"}),f.jsx("span",{className:"text-[10px] font-mono text-emerald-300 font-bold",children:"READY"})]})]}),f.jsxs("div",{className:"flex border-b border-purple-500/15 bg-[#0a0515]/60 px-2 pt-2 gap-1 overflow-x-auto",children:[f.jsxs("button",{onClick:()=>{n("work"),r(null)},className:`px-3 py-1.5 rounded-t-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${e==="work"?"bg-[#180d2d] text-pink-300 border-t-2 border-pink-500":"text-slate-400 hover:text-white hover:bg-white/5"}`,children:[f.jsx(kg,{className:"w-3 h-3 text-pink-400"}),t("terminal.tabWork")]}),f.jsxs("button",{onClick:()=>n("marriage"),className:`px-3 py-1.5 rounded-t-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${e==="marriage"?"bg-[#180d2d] text-purple-300 border-t-2 border-purple-500":"text-slate-400 hover:text-white hover:bg-white/5"}`,children:[f.jsx(If,{className:"w-3 h-3 text-rose-400"}),t("terminal.tabMarriage")]}),f.jsxs("button",{onClick:()=>n("tarot"),className:`px-3 py-1.5 rounded-t-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${e==="tarot"?"bg-[#180d2d] text-cyan-300 border-t-2 border-cyan-400":"text-slate-400 hover:text-white hover:bg-white/5"}`,children:[f.jsx(hn,{className:"w-3 h-3 text-cyan-400"}),t("terminal.tabTarot")]})]}),f.jsxs("div",{className:"p-5 font-mono text-xs sm:text-sm min-h-[260px] flex flex-col justify-between bg-gradient-to-b from-[#120824]/90 to-[#0a0416]/95",children:[e==="work"&&f.jsxs("div",{className:"space-y-3 animate-fadeIn",children:[f.jsxs("div",{className:"text-pink-400 font-bold flex items-center gap-2",children:[f.jsx("span",{className:"text-slate-500",children:"$"})," /py-work"]}),f.jsx("div",{className:"text-slate-200 font-semibold",children:t("terminal.workTitle")}),f.jsx("p",{className:"text-slate-400 text-xs leading-relaxed",children:t("terminal.workDesc")}),f.jsx("div",{className:"space-y-2 pt-1",children:[{id:1,label:t("terminal.opt1")},{id:2,label:t("terminal.opt2")},{id:3,label:t("terminal.opt3")}].map(c=>f.jsxs("button",{onClick:()=>r(c.id),className:`w-full text-left px-3 py-2 rounded-xl border text-xs transition-all flex items-center justify-between ${i===c.id?"bg-pink-500/20 border-pink-500 text-white shadow-neon-pink":"bg-white/5 border-purple-500/20 text-slate-300 hover:bg-white/10 hover:border-pink-500/40"}`,children:[f.jsx("span",{children:c.label}),i===c.id&&f.jsx(qu,{className:"w-4 h-4 text-emerald-400"})]},c.id))}),i&&f.jsxs("div",{className:"mt-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold animate-scaleIn flex items-center gap-2",children:[f.jsx(Bl,{className:"w-4 h-4 text-amber-400 shrink-0"}),f.jsx("span",{children:t("terminal.workResult")})]})]}),e==="marriage"&&f.jsxs("div",{className:"space-y-4 animate-fadeIn",children:[f.jsxs("div",{className:"text-purple-400 font-bold flex items-center gap-2",children:[f.jsx("span",{className:"text-slate-500",children:"$"})," /py-casamento status"]}),f.jsxs("div",{className:"text-slate-200 font-bold flex items-center gap-2",children:[f.jsx("span",{children:t("terminal.marriageTitle")}),f.jsx("span",{className:"text-rose-400 animate-pulse",children:"💖"})]}),f.jsxs("div",{children:[f.jsxs("div",{className:"flex justify-between text-xs font-semibold text-rose-300 mb-1",children:[f.jsx("span",{children:t("terminal.loveBar")}),f.jsx("span",{children:"100%"})]}),f.jsx("div",{className:"w-full h-3 bg-purple-950/80 rounded-full overflow-hidden border border-purple-500/30 p-0.5",children:f.jsx("div",{className:"h-full bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 rounded-full animate-pulse w-full"})})]}),f.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs",children:[f.jsx("div",{className:"p-2.5 rounded-xl bg-white/5 border border-purple-500/20 text-slate-300",children:t("terminal.loveTree")}),f.jsx("div",{className:"p-2.5 rounded-xl bg-white/5 border border-purple-500/20 text-amber-300",children:t("terminal.loveVault")})]})]}),e==="tarot"&&f.jsxs("div",{className:"space-y-3 animate-fadeIn",children:[f.jsxs("div",{className:"text-cyan-400 font-bold flex items-center gap-2",children:[f.jsx("span",{className:"text-slate-500",children:"$"})," /py-tarot daily"]}),f.jsxs("div",{className:"text-amber-300 font-bold flex items-center gap-2",children:[f.jsx("span",{children:t("terminal.tarotTitle")}),f.jsx("span",{className:"text-cyan-300",children:"✦"})]}),f.jsxs("div",{className:"p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 space-y-2",children:[f.jsxs("div",{className:"text-pink-400 font-bold text-sm tracking-wide",children:["🔮 ",t("terminal.tarotCard")]}),f.jsxs("p",{className:"text-slate-300 text-xs italic leading-relaxed min-h-[48px]",children:[s,!o&&f.jsx("span",{className:"inline-block w-1.5 h-3.5 bg-pink-400 ml-1 animate-pulse"})]})]})]}),f.jsxs("div",{className:"pt-3 border-t border-purple-500/10 text-[11px] text-slate-500 flex justify-between items-center",children:[f.jsx("span",{children:"Pyxie Discord Engine v14"}),f.jsx("span",{className:"text-purple-400/80 font-semibold",children:"100% Interativo"})]})]})]})}function Gy({t,stats:e}){return f.jsxs("section",{className:"relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden",children:[f.jsx("div",{className:"absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none"}),f.jsx("div",{className:"absolute top-1/3 right-10 w-[450px] h-[450px] bg-pink-600/15 rounded-full blur-[130px] pointer-events-none"}),f.jsx("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10",children:f.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center",children:[f.jsxs("div",{className:"lg:col-span-7 text-center lg:text-left space-y-6",children:[f.jsxs("div",{className:"inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wide shadow-sm",children:[f.jsx("span",{className:"w-2 h-2 rounded-full bg-emerald-400 animate-ping"}),f.jsx("span",{children:t("hero.badge")})]}),f.jsxs("h1",{className:"font-title font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.12]",children:[f.jsx("span",{className:"text-white",children:"Pyxie"})," •"," ",f.jsx("span",{className:"text-slate-200",children:t("hero.titlePrefix")})," ",f.jsx("span",{className:"gradient-text-pink",children:t("hero.titleHighlight")})]}),f.jsx("p",{className:"text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal",children:t("hero.subtitle")}),f.jsxs("div",{className:"flex flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-2",children:[f.jsxs("div",{className:"flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-amber-500/25 text-xs font-semibold text-amber-300",children:[f.jsx(Bl,{className:"w-4 h-4 text-amber-400"}),f.jsx("span",{children:t("hero.badgeEconomy")})]}),f.jsxs("div",{className:"flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-purple-500/25 text-xs font-semibold text-purple-300",children:[f.jsx(kg,{className:"w-4 h-4 text-purple-400"}),f.jsx("span",{children:t("hero.badgeCareers")})]}),f.jsxs("div",{className:"flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-emerald-500/25 text-xs font-semibold text-emerald-300",children:[f.jsx(my,{className:"w-4 h-4 text-emerald-400"}),f.jsx("span",{children:(e==null?void 0:e.uptime)||"99.9% Uptime"})]})]}),f.jsxs("div",{className:"flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4",children:[f.jsxs("a",{href:"/invite",target:"_blank",rel:"noopener noreferrer",className:"w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-extrabold text-white bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 shadow-neon-pink transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3 border border-pink-400/30",children:[f.jsx(hn,{className:"w-5 h-5 text-pink-200"}),f.jsx("span",{children:t("hero.btnInvite")})]}),f.jsxs("a",{href:"/discord",target:"_blank",rel:"noopener noreferrer",className:"w-full sm:w-auto px-7 py-4 rounded-2xl text-base font-bold text-slate-200 bg-white/5 hover:bg-white/10 border border-purple-500/30 hover:border-purple-500/60 transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2.5 backdrop-blur-xl",children:[f.jsx(Py,{className:"w-5 h-5 text-purple-400"}),f.jsx("span",{children:t("hero.btnSupport")})]})]})]}),f.jsx("div",{className:"lg:col-span-5 flex justify-center",children:f.jsx(jy,{t})})]})})]})}/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const kf="169",Wy=0,gp=1,Xy=2,Vg=1,qy=2,ii=3,Xi=0,rn=1,Xn=2,Vi=0,cs=1,$u=2,xp=3,vp=4,Yy=5,cr=100,$y=101,Ky=102,Zy=103,Qy=104,Jy=200,eS=201,tS=202,nS=203,Ku=204,Zu=205,iS=206,rS=207,sS=208,aS=209,oS=210,lS=211,cS=212,uS=213,dS=214,Qu=0,Ju=1,ed=2,ys=3,td=4,nd=5,id=6,rd=7,jg=0,fS=1,hS=2,ji=0,pS=1,mS=2,gS=3,xS=4,vS=5,_S=6,yS=7,Gg=300,Ss=301,Ms=302,sd=303,ad=304,Hl=306,od=1e3,pr=1001,ld=1002,wn=1003,SS=1004,ao=1005,Sn=1006,Sc=1007,mr=1008,mi=1009,Wg=1010,Xg=1011,Ca=1012,Ff=1013,Er=1014,li=1015,Ua=1016,Of=1017,zf=1018,ws=1020,qg=35902,Yg=1021,$g=1022,Fn=1023,Kg=1024,Zg=1025,us=1026,Es=1027,Qg=1028,Bf=1029,Jg=1030,Hf=1031,Vf=1033,Vo=33776,jo=33777,Go=33778,Wo=33779,cd=35840,ud=35841,dd=35842,fd=35843,hd=36196,pd=37492,md=37496,gd=37808,xd=37809,vd=37810,_d=37811,yd=37812,Sd=37813,Md=37814,wd=37815,Ed=37816,Td=37817,bd=37818,Ad=37819,Cd=37820,Rd=37821,Xo=36492,Nd=36494,Pd=36495,ex=36283,Ld=36284,Dd=36285,Id=36286,MS=3200,wS=3201,tx=0,ES=1,Pi="",jn="srgb",Zi="srgb-linear",jf="display-p3",Vl="display-p3-linear",yl="linear",ut="srgb",Sl="rec709",Ml="p3",Nr=7680,_p=519,TS=512,bS=513,AS=514,nx=515,CS=516,RS=517,NS=518,PS=519,yp=35044,Sp="300 es",ci=2e3,wl=2001;class Rs{addEventListener(e,n){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(n)===-1&&i[e].push(n)}hasEventListener(e,n){if(this._listeners===void 0)return!1;const i=this._listeners;return i[e]!==void 0&&i[e].indexOf(n)!==-1}removeEventListener(e,n){if(this._listeners===void 0)return;const r=this._listeners[e];if(r!==void 0){const s=r.indexOf(n);s!==-1&&r.splice(s,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const i=this._listeners[e.type];if(i!==void 0){e.target=this;const r=i.slice(0);for(let s=0,a=r.length;s<a;s++)r[s].call(this,e);e.target=null}}}const Ft=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Mc=Math.PI/180,Ud=180/Math.PI;function ka(){const t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Ft[t&255]+Ft[t>>8&255]+Ft[t>>16&255]+Ft[t>>24&255]+"-"+Ft[e&255]+Ft[e>>8&255]+"-"+Ft[e>>16&15|64]+Ft[e>>24&255]+"-"+Ft[n&63|128]+Ft[n>>8&255]+"-"+Ft[n>>16&255]+Ft[n>>24&255]+Ft[i&255]+Ft[i>>8&255]+Ft[i>>16&255]+Ft[i>>24&255]).toLowerCase()}function Qt(t,e,n){return Math.max(e,Math.min(n,t))}function LS(t,e){return(t%e+e)%e}function wc(t,e,n){return(1-n)*t+n*e}function Bs(t,e){switch(e.constructor){case Float32Array:return t;case Uint32Array:return t/4294967295;case Uint16Array:return t/65535;case Uint8Array:return t/255;case Int32Array:return Math.max(t/2147483647,-1);case Int16Array:return Math.max(t/32767,-1);case Int8Array:return Math.max(t/127,-1);default:throw new Error("Invalid component type.")}}function Kt(t,e){switch(e.constructor){case Float32Array:return t;case Uint32Array:return Math.round(t*4294967295);case Uint16Array:return Math.round(t*65535);case Uint8Array:return Math.round(t*255);case Int32Array:return Math.round(t*2147483647);case Int16Array:return Math.round(t*32767);case Int8Array:return Math.round(t*127);default:throw new Error("Invalid component type.")}}class Ke{constructor(e=0,n=0){Ke.prototype.isVector2=!0,this.x=e,this.y=n}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,n){return this.x=e,this.y=n,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const n=this.x,i=this.y,r=e.elements;return this.x=r[0]*n+r[3]*i+r[6],this.y=r[1]*n+r[4]*i+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,n){return this.x=Math.max(e.x,Math.min(n.x,this.x)),this.y=Math.max(e.y,Math.min(n.y,this.y)),this}clampScalar(e,n){return this.x=Math.max(e,Math.min(n,this.x)),this.y=Math.max(e,Math.min(n,this.y)),this}clampLength(e,n){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(n,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const n=Math.sqrt(this.lengthSq()*e.lengthSq());if(n===0)return Math.PI/2;const i=this.dot(e)/n;return Math.acos(Qt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const n=this.x-e.x,i=this.y-e.y;return n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this}lerpVectors(e,n,i){return this.x=e.x+(n.x-e.x)*i,this.y=e.y+(n.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this}rotateAround(e,n){const i=Math.cos(n),r=Math.sin(n),s=this.x-e.x,a=this.y-e.y;return this.x=s*i-a*r+e.x,this.y=s*r+a*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Be{constructor(e,n,i,r,s,a,o,l,c){Be.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,n,i,r,s,a,o,l,c)}set(e,n,i,r,s,a,o,l,c){const d=this.elements;return d[0]=e,d[1]=r,d[2]=o,d[3]=n,d[4]=s,d[5]=l,d[6]=i,d[7]=a,d[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const n=this.elements,i=e.elements;return n[0]=i[0],n[1]=i[1],n[2]=i[2],n[3]=i[3],n[4]=i[4],n[5]=i[5],n[6]=i[6],n[7]=i[7],n[8]=i[8],this}extractBasis(e,n,i){return e.setFromMatrix3Column(this,0),n.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const n=e.elements;return this.set(n[0],n[4],n[8],n[1],n[5],n[9],n[2],n[6],n[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,n){const i=e.elements,r=n.elements,s=this.elements,a=i[0],o=i[3],l=i[6],c=i[1],d=i[4],p=i[7],h=i[2],g=i[5],v=i[8],S=r[0],m=r[3],u=r[6],_=r[1],x=r[4],w=r[7],P=r[2],b=r[5],A=r[8];return s[0]=a*S+o*_+l*P,s[3]=a*m+o*x+l*b,s[6]=a*u+o*w+l*A,s[1]=c*S+d*_+p*P,s[4]=c*m+d*x+p*b,s[7]=c*u+d*w+p*A,s[2]=h*S+g*_+v*P,s[5]=h*m+g*x+v*b,s[8]=h*u+g*w+v*A,this}multiplyScalar(e){const n=this.elements;return n[0]*=e,n[3]*=e,n[6]*=e,n[1]*=e,n[4]*=e,n[7]*=e,n[2]*=e,n[5]*=e,n[8]*=e,this}determinant(){const e=this.elements,n=e[0],i=e[1],r=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],d=e[8];return n*a*d-n*o*c-i*s*d+i*o*l+r*s*c-r*a*l}invert(){const e=this.elements,n=e[0],i=e[1],r=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],d=e[8],p=d*a-o*c,h=o*l-d*s,g=c*s-a*l,v=n*p+i*h+r*g;if(v===0)return this.set(0,0,0,0,0,0,0,0,0);const S=1/v;return e[0]=p*S,e[1]=(r*c-d*i)*S,e[2]=(o*i-r*a)*S,e[3]=h*S,e[4]=(d*n-r*l)*S,e[5]=(r*s-o*n)*S,e[6]=g*S,e[7]=(i*l-c*n)*S,e[8]=(a*n-i*s)*S,this}transpose(){let e;const n=this.elements;return e=n[1],n[1]=n[3],n[3]=e,e=n[2],n[2]=n[6],n[6]=e,e=n[5],n[5]=n[7],n[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const n=this.elements;return e[0]=n[0],e[1]=n[3],e[2]=n[6],e[3]=n[1],e[4]=n[4],e[5]=n[7],e[6]=n[2],e[7]=n[5],e[8]=n[8],this}setUvTransform(e,n,i,r,s,a,o){const l=Math.cos(s),c=Math.sin(s);return this.set(i*l,i*c,-i*(l*a+c*o)+a+e,-r*c,r*l,-r*(-c*a+l*o)+o+n,0,0,1),this}scale(e,n){return this.premultiply(Ec.makeScale(e,n)),this}rotate(e){return this.premultiply(Ec.makeRotation(-e)),this}translate(e,n){return this.premultiply(Ec.makeTranslation(e,n)),this}makeTranslation(e,n){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,n,0,0,1),this}makeRotation(e){const n=Math.cos(e),i=Math.sin(e);return this.set(n,-i,0,i,n,0,0,0,1),this}makeScale(e,n){return this.set(e,0,0,0,n,0,0,0,1),this}equals(e){const n=this.elements,i=e.elements;for(let r=0;r<9;r++)if(n[r]!==i[r])return!1;return!0}fromArray(e,n=0){for(let i=0;i<9;i++)this.elements[i]=e[i+n];return this}toArray(e=[],n=0){const i=this.elements;return e[n]=i[0],e[n+1]=i[1],e[n+2]=i[2],e[n+3]=i[3],e[n+4]=i[4],e[n+5]=i[5],e[n+6]=i[6],e[n+7]=i[7],e[n+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const Ec=new Be;function ix(t){for(let e=t.length-1;e>=0;--e)if(t[e]>=65535)return!0;return!1}function Ra(t){return document.createElementNS("http://www.w3.org/1999/xhtml",t)}function DS(){const t=Ra("canvas");return t.style.display="block",t}const Mp={};function qo(t){t in Mp||(Mp[t]=!0,console.warn(t))}function IS(t,e,n){return new Promise(function(i,r){function s(){switch(t.clientWaitSync(e,t.SYNC_FLUSH_COMMANDS_BIT,0)){case t.WAIT_FAILED:r();break;case t.TIMEOUT_EXPIRED:setTimeout(s,n);break;default:i()}}setTimeout(s,n)})}function US(t){const e=t.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function kS(t){const e=t.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const wp=new Be().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),Ep=new Be().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),Hs={[Zi]:{transfer:yl,primaries:Sl,luminanceCoefficients:[.2126,.7152,.0722],toReference:t=>t,fromReference:t=>t},[jn]:{transfer:ut,primaries:Sl,luminanceCoefficients:[.2126,.7152,.0722],toReference:t=>t.convertSRGBToLinear(),fromReference:t=>t.convertLinearToSRGB()},[Vl]:{transfer:yl,primaries:Ml,luminanceCoefficients:[.2289,.6917,.0793],toReference:t=>t.applyMatrix3(Ep),fromReference:t=>t.applyMatrix3(wp)},[jf]:{transfer:ut,primaries:Ml,luminanceCoefficients:[.2289,.6917,.0793],toReference:t=>t.convertSRGBToLinear().applyMatrix3(Ep),fromReference:t=>t.applyMatrix3(wp).convertLinearToSRGB()}},FS=new Set([Zi,Vl]),tt={enabled:!0,_workingColorSpace:Zi,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(t){if(!FS.has(t))throw new Error(`Unsupported working color space, "${t}".`);this._workingColorSpace=t},convert:function(t,e,n){if(this.enabled===!1||e===n||!e||!n)return t;const i=Hs[e].toReference,r=Hs[n].fromReference;return r(i(t))},fromWorkingColorSpace:function(t,e){return this.convert(t,this._workingColorSpace,e)},toWorkingColorSpace:function(t,e){return this.convert(t,e,this._workingColorSpace)},getPrimaries:function(t){return Hs[t].primaries},getTransfer:function(t){return t===Pi?yl:Hs[t].transfer},getLuminanceCoefficients:function(t,e=this._workingColorSpace){return t.fromArray(Hs[e].luminanceCoefficients)}};function ds(t){return t<.04045?t*.0773993808:Math.pow(t*.9478672986+.0521327014,2.4)}function Tc(t){return t<.0031308?t*12.92:1.055*Math.pow(t,.41666)-.055}let Pr;class OS{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Pr===void 0&&(Pr=Ra("canvas")),Pr.width=e.width,Pr.height=e.height;const i=Pr.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),n=Pr}return n.width>2048||n.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),n.toDataURL("image/jpeg",.6)):n.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const n=Ra("canvas");n.width=e.width,n.height=e.height;const i=n.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const r=i.getImageData(0,0,e.width,e.height),s=r.data;for(let a=0;a<s.length;a++)s[a]=ds(s[a]/255)*255;return i.putImageData(r,0,0),n}else if(e.data){const n=e.data.slice(0);for(let i=0;i<n.length;i++)n instanceof Uint8Array||n instanceof Uint8ClampedArray?n[i]=Math.floor(ds(n[i]/255)*255):n[i]=ds(n[i]);return{data:n,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let zS=0;class rx{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:zS++}),this.uuid=ka(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const n=e===void 0||typeof e=="string";if(!n&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let a=0,o=r.length;a<o;a++)r[a].isDataTexture?s.push(bc(r[a].image)):s.push(bc(r[a]))}else s=bc(r);i.url=s}return n||(e.images[this.uuid]=i),i}}function bc(t){return typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap?OS.getDataURL(t):t.data?{data:Array.from(t.data),width:t.width,height:t.height,type:t.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let BS=0;class Gt extends Rs{constructor(e=Gt.DEFAULT_IMAGE,n=Gt.DEFAULT_MAPPING,i=pr,r=pr,s=Sn,a=mr,o=Fn,l=mi,c=Gt.DEFAULT_ANISOTROPY,d=Pi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:BS++}),this.uuid=ka(),this.name="",this.source=new rx(e),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=i,this.wrapT=r,this.magFilter=s,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Ke(0,0),this.repeat=new Ke(1,1),this.center=new Ke(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Be,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=d,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const n=e===void 0||typeof e=="string";if(!n&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),n||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Gg)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case od:e.x=e.x-Math.floor(e.x);break;case pr:e.x=e.x<0?0:1;break;case ld:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case od:e.y=e.y-Math.floor(e.y);break;case pr:e.y=e.y<0?0:1;break;case ld:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Gt.DEFAULT_IMAGE=null;Gt.DEFAULT_MAPPING=Gg;Gt.DEFAULT_ANISOTROPY=1;class st{constructor(e=0,n=0,i=0,r=1){st.prototype.isVector4=!0,this.x=e,this.y=n,this.z=i,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,n,i,r){return this.x=e,this.y=n,this.z=i,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;case 3:this.w=n;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this.z=e.z+n.z,this.w=e.w+n.w,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this.z+=e.z*n,this.w+=e.w*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this.z=e.z-n.z,this.w=e.w-n.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const n=this.x,i=this.y,r=this.z,s=this.w,a=e.elements;return this.x=a[0]*n+a[4]*i+a[8]*r+a[12]*s,this.y=a[1]*n+a[5]*i+a[9]*r+a[13]*s,this.z=a[2]*n+a[6]*i+a[10]*r+a[14]*s,this.w=a[3]*n+a[7]*i+a[11]*r+a[15]*s,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const n=Math.sqrt(1-e.w*e.w);return n<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/n,this.y=e.y/n,this.z=e.z/n),this}setAxisAngleFromRotationMatrix(e){let n,i,r,s;const l=e.elements,c=l[0],d=l[4],p=l[8],h=l[1],g=l[5],v=l[9],S=l[2],m=l[6],u=l[10];if(Math.abs(d-h)<.01&&Math.abs(p-S)<.01&&Math.abs(v-m)<.01){if(Math.abs(d+h)<.1&&Math.abs(p+S)<.1&&Math.abs(v+m)<.1&&Math.abs(c+g+u-3)<.1)return this.set(1,0,0,0),this;n=Math.PI;const x=(c+1)/2,w=(g+1)/2,P=(u+1)/2,b=(d+h)/4,A=(p+S)/4,N=(v+m)/4;return x>w&&x>P?x<.01?(i=0,r=.707106781,s=.707106781):(i=Math.sqrt(x),r=b/i,s=A/i):w>P?w<.01?(i=.707106781,r=0,s=.707106781):(r=Math.sqrt(w),i=b/r,s=N/r):P<.01?(i=.707106781,r=.707106781,s=0):(s=Math.sqrt(P),i=A/s,r=N/s),this.set(i,r,s,n),this}let _=Math.sqrt((m-v)*(m-v)+(p-S)*(p-S)+(h-d)*(h-d));return Math.abs(_)<.001&&(_=1),this.x=(m-v)/_,this.y=(p-S)/_,this.z=(h-d)/_,this.w=Math.acos((c+g+u-1)/2),this}setFromMatrixPosition(e){const n=e.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this.w=n[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,n){return this.x=Math.max(e.x,Math.min(n.x,this.x)),this.y=Math.max(e.y,Math.min(n.y,this.y)),this.z=Math.max(e.z,Math.min(n.z,this.z)),this.w=Math.max(e.w,Math.min(n.w,this.w)),this}clampScalar(e,n){return this.x=Math.max(e,Math.min(n,this.x)),this.y=Math.max(e,Math.min(n,this.y)),this.z=Math.max(e,Math.min(n,this.z)),this.w=Math.max(e,Math.min(n,this.w)),this}clampLength(e,n){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(n,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this.z+=(e.z-this.z)*n,this.w+=(e.w-this.w)*n,this}lerpVectors(e,n,i){return this.x=e.x+(n.x-e.x)*i,this.y=e.y+(n.y-e.y)*i,this.z=e.z+(n.z-e.z)*i,this.w=e.w+(n.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this.z=e[n+2],this.w=e[n+3],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e[n+2]=this.z,e[n+3]=this.w,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this.z=e.getZ(n),this.w=e.getW(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class HS extends Rs{constructor(e=1,n=1,i={}){super(),this.isRenderTarget=!0,this.width=e,this.height=n,this.depth=1,this.scissor=new st(0,0,e,n),this.scissorTest=!1,this.viewport=new st(0,0,e,n);const r={width:e,height:n,depth:1};i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Sn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},i);const s=new Gt(r,i.mapping,i.wrapS,i.wrapT,i.magFilter,i.minFilter,i.format,i.type,i.anisotropy,i.colorSpace);s.flipY=!1,s.generateMipmaps=i.generateMipmaps,s.internalFormat=i.internalFormat,this.textures=[];const a=i.count;for(let o=0;o<a;o++)this.textures[o]=s.clone(),this.textures[o].isRenderTargetTexture=!0;this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.depthTexture=i.depthTexture,this.samples=i.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,n,i=1){if(this.width!==e||this.height!==n||this.depth!==i){this.width=e,this.height=n,this.depth=i;for(let r=0,s=this.textures.length;r<s;r++)this.textures[r].image.width=e,this.textures[r].image.height=n,this.textures[r].image.depth=i;this.dispose()}this.viewport.set(0,0,e,n),this.scissor.set(0,0,e,n)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let i=0,r=e.textures.length;i<r;i++)this.textures[i]=e.textures[i].clone(),this.textures[i].isRenderTargetTexture=!0;const n=Object.assign({},e.texture.image);return this.texture.source=new rx(n),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Tr extends HS{constructor(e=1,n=1,i={}){super(e,n,i),this.isWebGLRenderTarget=!0}}class sx extends Gt{constructor(e=null,n=1,i=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:n,height:i,depth:r},this.magFilter=wn,this.minFilter=wn,this.wrapR=pr,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class VS extends Gt{constructor(e=null,n=1,i=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:n,height:i,depth:r},this.magFilter=wn,this.minFilter=wn,this.wrapR=pr,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Fa{constructor(e=0,n=0,i=0,r=1){this.isQuaternion=!0,this._x=e,this._y=n,this._z=i,this._w=r}static slerpFlat(e,n,i,r,s,a,o){let l=i[r+0],c=i[r+1],d=i[r+2],p=i[r+3];const h=s[a+0],g=s[a+1],v=s[a+2],S=s[a+3];if(o===0){e[n+0]=l,e[n+1]=c,e[n+2]=d,e[n+3]=p;return}if(o===1){e[n+0]=h,e[n+1]=g,e[n+2]=v,e[n+3]=S;return}if(p!==S||l!==h||c!==g||d!==v){let m=1-o;const u=l*h+c*g+d*v+p*S,_=u>=0?1:-1,x=1-u*u;if(x>Number.EPSILON){const P=Math.sqrt(x),b=Math.atan2(P,u*_);m=Math.sin(m*b)/P,o=Math.sin(o*b)/P}const w=o*_;if(l=l*m+h*w,c=c*m+g*w,d=d*m+v*w,p=p*m+S*w,m===1-o){const P=1/Math.sqrt(l*l+c*c+d*d+p*p);l*=P,c*=P,d*=P,p*=P}}e[n]=l,e[n+1]=c,e[n+2]=d,e[n+3]=p}static multiplyQuaternionsFlat(e,n,i,r,s,a){const o=i[r],l=i[r+1],c=i[r+2],d=i[r+3],p=s[a],h=s[a+1],g=s[a+2],v=s[a+3];return e[n]=o*v+d*p+l*g-c*h,e[n+1]=l*v+d*h+c*p-o*g,e[n+2]=c*v+d*g+o*h-l*p,e[n+3]=d*v-o*p-l*h-c*g,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,n,i,r){return this._x=e,this._y=n,this._z=i,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,n=!0){const i=e._x,r=e._y,s=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(i/2),d=o(r/2),p=o(s/2),h=l(i/2),g=l(r/2),v=l(s/2);switch(a){case"XYZ":this._x=h*d*p+c*g*v,this._y=c*g*p-h*d*v,this._z=c*d*v+h*g*p,this._w=c*d*p-h*g*v;break;case"YXZ":this._x=h*d*p+c*g*v,this._y=c*g*p-h*d*v,this._z=c*d*v-h*g*p,this._w=c*d*p+h*g*v;break;case"ZXY":this._x=h*d*p-c*g*v,this._y=c*g*p+h*d*v,this._z=c*d*v+h*g*p,this._w=c*d*p-h*g*v;break;case"ZYX":this._x=h*d*p-c*g*v,this._y=c*g*p+h*d*v,this._z=c*d*v-h*g*p,this._w=c*d*p+h*g*v;break;case"YZX":this._x=h*d*p+c*g*v,this._y=c*g*p+h*d*v,this._z=c*d*v-h*g*p,this._w=c*d*p-h*g*v;break;case"XZY":this._x=h*d*p-c*g*v,this._y=c*g*p-h*d*v,this._z=c*d*v+h*g*p,this._w=c*d*p+h*g*v;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return n===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,n){const i=n/2,r=Math.sin(i);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const n=e.elements,i=n[0],r=n[4],s=n[8],a=n[1],o=n[5],l=n[9],c=n[2],d=n[6],p=n[10],h=i+o+p;if(h>0){const g=.5/Math.sqrt(h+1);this._w=.25/g,this._x=(d-l)*g,this._y=(s-c)*g,this._z=(a-r)*g}else if(i>o&&i>p){const g=2*Math.sqrt(1+i-o-p);this._w=(d-l)/g,this._x=.25*g,this._y=(r+a)/g,this._z=(s+c)/g}else if(o>p){const g=2*Math.sqrt(1+o-i-p);this._w=(s-c)/g,this._x=(r+a)/g,this._y=.25*g,this._z=(l+d)/g}else{const g=2*Math.sqrt(1+p-i-o);this._w=(a-r)/g,this._x=(s+c)/g,this._y=(l+d)/g,this._z=.25*g}return this._onChangeCallback(),this}setFromUnitVectors(e,n){let i=e.dot(n)+1;return i<Number.EPSILON?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*n.z-e.z*n.y,this._y=e.z*n.x-e.x*n.z,this._z=e.x*n.y-e.y*n.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Qt(this.dot(e),-1,1)))}rotateTowards(e,n){const i=this.angleTo(e);if(i===0)return this;const r=Math.min(1,n/i);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,n){const i=e._x,r=e._y,s=e._z,a=e._w,o=n._x,l=n._y,c=n._z,d=n._w;return this._x=i*d+a*o+r*c-s*l,this._y=r*d+a*l+s*o-i*c,this._z=s*d+a*c+i*l-r*o,this._w=a*d-i*o-r*l-s*c,this._onChangeCallback(),this}slerp(e,n){if(n===0)return this;if(n===1)return this.copy(e);const i=this._x,r=this._y,s=this._z,a=this._w;let o=a*e._w+i*e._x+r*e._y+s*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=i,this._y=r,this._z=s,this;const l=1-o*o;if(l<=Number.EPSILON){const g=1-n;return this._w=g*a+n*this._w,this._x=g*i+n*this._x,this._y=g*r+n*this._y,this._z=g*s+n*this._z,this.normalize(),this}const c=Math.sqrt(l),d=Math.atan2(c,o),p=Math.sin((1-n)*d)/c,h=Math.sin(n*d)/c;return this._w=a*p+this._w*h,this._x=i*p+this._x*h,this._y=r*p+this._y*h,this._z=s*p+this._z*h,this._onChangeCallback(),this}slerpQuaternions(e,n,i){return this.copy(e).slerp(n,i)}random(){const e=2*Math.PI*Math.random(),n=2*Math.PI*Math.random(),i=Math.random(),r=Math.sqrt(1-i),s=Math.sqrt(i);return this.set(r*Math.sin(e),r*Math.cos(e),s*Math.sin(n),s*Math.cos(n))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,n=0){return this._x=e[n],this._y=e[n+1],this._z=e[n+2],this._w=e[n+3],this._onChangeCallback(),this}toArray(e=[],n=0){return e[n]=this._x,e[n+1]=this._y,e[n+2]=this._z,e[n+3]=this._w,e}fromBufferAttribute(e,n){return this._x=e.getX(n),this._y=e.getY(n),this._z=e.getZ(n),this._w=e.getW(n),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class F{constructor(e=0,n=0,i=0){F.prototype.isVector3=!0,this.x=e,this.y=n,this.z=i}set(e,n,i){return i===void 0&&(i=this.z),this.x=e,this.y=n,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this.z=e.z+n.z,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this.z+=e.z*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this.z=e.z-n.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,n){return this.x=e.x*n.x,this.y=e.y*n.y,this.z=e.z*n.z,this}applyEuler(e){return this.applyQuaternion(Tp.setFromEuler(e))}applyAxisAngle(e,n){return this.applyQuaternion(Tp.setFromAxisAngle(e,n))}applyMatrix3(e){const n=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*n+s[3]*i+s[6]*r,this.y=s[1]*n+s[4]*i+s[7]*r,this.z=s[2]*n+s[5]*i+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const n=this.x,i=this.y,r=this.z,s=e.elements,a=1/(s[3]*n+s[7]*i+s[11]*r+s[15]);return this.x=(s[0]*n+s[4]*i+s[8]*r+s[12])*a,this.y=(s[1]*n+s[5]*i+s[9]*r+s[13])*a,this.z=(s[2]*n+s[6]*i+s[10]*r+s[14])*a,this}applyQuaternion(e){const n=this.x,i=this.y,r=this.z,s=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*r-o*i),d=2*(o*n-s*r),p=2*(s*i-a*n);return this.x=n+l*c+a*p-o*d,this.y=i+l*d+o*c-s*p,this.z=r+l*p+s*d-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const n=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*n+s[4]*i+s[8]*r,this.y=s[1]*n+s[5]*i+s[9]*r,this.z=s[2]*n+s[6]*i+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,n){return this.x=Math.max(e.x,Math.min(n.x,this.x)),this.y=Math.max(e.y,Math.min(n.y,this.y)),this.z=Math.max(e.z,Math.min(n.z,this.z)),this}clampScalar(e,n){return this.x=Math.max(e,Math.min(n,this.x)),this.y=Math.max(e,Math.min(n,this.y)),this.z=Math.max(e,Math.min(n,this.z)),this}clampLength(e,n){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(n,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this.z+=(e.z-this.z)*n,this}lerpVectors(e,n,i){return this.x=e.x+(n.x-e.x)*i,this.y=e.y+(n.y-e.y)*i,this.z=e.z+(n.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,n){const i=e.x,r=e.y,s=e.z,a=n.x,o=n.y,l=n.z;return this.x=r*l-s*o,this.y=s*a-i*l,this.z=i*o-r*a,this}projectOnVector(e){const n=e.lengthSq();if(n===0)return this.set(0,0,0);const i=e.dot(this)/n;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return Ac.copy(this).projectOnVector(e),this.sub(Ac)}reflect(e){return this.sub(Ac.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const n=Math.sqrt(this.lengthSq()*e.lengthSq());if(n===0)return Math.PI/2;const i=this.dot(e)/n;return Math.acos(Qt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const n=this.x-e.x,i=this.y-e.y,r=this.z-e.z;return n*n+i*i+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,n,i){const r=Math.sin(n)*e;return this.x=r*Math.sin(i),this.y=Math.cos(n)*e,this.z=r*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,n,i){return this.x=e*Math.sin(n),this.y=i,this.z=e*Math.cos(n),this}setFromMatrixPosition(e){const n=e.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this}setFromMatrixScale(e){const n=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=n,this.y=i,this.z=r,this}setFromMatrixColumn(e,n){return this.fromArray(e.elements,n*4)}setFromMatrix3Column(e,n){return this.fromArray(e.elements,n*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this.z=e[n+2],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e[n+2]=this.z,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this.z=e.getZ(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,n=Math.random()*2-1,i=Math.sqrt(1-n*n);return this.x=i*Math.cos(e),this.y=n,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Ac=new F,Tp=new Fa;class Oa{constructor(e=new F(1/0,1/0,1/0),n=new F(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=n}set(e,n){return this.min.copy(e),this.max.copy(n),this}setFromArray(e){this.makeEmpty();for(let n=0,i=e.length;n<i;n+=3)this.expandByPoint(Nn.fromArray(e,n));return this}setFromBufferAttribute(e){this.makeEmpty();for(let n=0,i=e.count;n<i;n++)this.expandByPoint(Nn.fromBufferAttribute(e,n));return this}setFromPoints(e){this.makeEmpty();for(let n=0,i=e.length;n<i;n++)this.expandByPoint(e[n]);return this}setFromCenterAndSize(e,n){const i=Nn.copy(n).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,n=!1){return this.makeEmpty(),this.expandByObject(e,n)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,n=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0){const s=i.getAttribute("position");if(n===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=s.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,Nn):Nn.fromBufferAttribute(s,a),Nn.applyMatrix4(e.matrixWorld),this.expandByPoint(Nn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),oo.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),oo.copy(i.boundingBox)),oo.applyMatrix4(e.matrixWorld),this.union(oo)}const r=e.children;for(let s=0,a=r.length;s<a;s++)this.expandByObject(r[s],n);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,n){return n.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Nn),Nn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let n,i;return e.normal.x>0?(n=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(n=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(n+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(n+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(n+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(n+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),n<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Vs),lo.subVectors(this.max,Vs),Lr.subVectors(e.a,Vs),Dr.subVectors(e.b,Vs),Ir.subVectors(e.c,Vs),Si.subVectors(Dr,Lr),Mi.subVectors(Ir,Dr),Ji.subVectors(Lr,Ir);let n=[0,-Si.z,Si.y,0,-Mi.z,Mi.y,0,-Ji.z,Ji.y,Si.z,0,-Si.x,Mi.z,0,-Mi.x,Ji.z,0,-Ji.x,-Si.y,Si.x,0,-Mi.y,Mi.x,0,-Ji.y,Ji.x,0];return!Cc(n,Lr,Dr,Ir,lo)||(n=[1,0,0,0,1,0,0,0,1],!Cc(n,Lr,Dr,Ir,lo))?!1:(co.crossVectors(Si,Mi),n=[co.x,co.y,co.z],Cc(n,Lr,Dr,Ir,lo))}clampPoint(e,n){return n.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Nn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Nn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Qn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Qn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Qn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Qn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Qn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Qn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Qn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Qn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Qn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const Qn=[new F,new F,new F,new F,new F,new F,new F,new F],Nn=new F,oo=new Oa,Lr=new F,Dr=new F,Ir=new F,Si=new F,Mi=new F,Ji=new F,Vs=new F,lo=new F,co=new F,er=new F;function Cc(t,e,n,i,r){for(let s=0,a=t.length-3;s<=a;s+=3){er.fromArray(t,s);const o=r.x*Math.abs(er.x)+r.y*Math.abs(er.y)+r.z*Math.abs(er.z),l=e.dot(er),c=n.dot(er),d=i.dot(er);if(Math.max(-Math.max(l,c,d),Math.min(l,c,d))>o)return!1}return!0}const jS=new Oa,js=new F,Rc=new F;class jl{constructor(e=new F,n=-1){this.isSphere=!0,this.center=e,this.radius=n}set(e,n){return this.center.copy(e),this.radius=n,this}setFromPoints(e,n){const i=this.center;n!==void 0?i.copy(n):jS.setFromPoints(e).getCenter(i);let r=0;for(let s=0,a=e.length;s<a;s++)r=Math.max(r,i.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const n=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=n*n}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,n){const i=this.center.distanceToSquared(e);return n.copy(e),i>this.radius*this.radius&&(n.sub(this.center).normalize(),n.multiplyScalar(this.radius).add(this.center)),n}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;js.subVectors(e,this.center);const n=js.lengthSq();if(n>this.radius*this.radius){const i=Math.sqrt(n),r=(i-this.radius)*.5;this.center.addScaledVector(js,r/i),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Rc.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(js.copy(e.center).add(Rc)),this.expandByPoint(js.copy(e.center).sub(Rc))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const Jn=new F,Nc=new F,uo=new F,wi=new F,Pc=new F,fo=new F,Lc=new F;class Gf{constructor(e=new F,n=new F(0,0,-1)){this.origin=e,this.direction=n}set(e,n){return this.origin.copy(e),this.direction.copy(n),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,n){return n.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Jn)),this}closestPointToPoint(e,n){n.subVectors(e,this.origin);const i=n.dot(this.direction);return i<0?n.copy(this.origin):n.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const n=Jn.subVectors(e,this.origin).dot(this.direction);return n<0?this.origin.distanceToSquared(e):(Jn.copy(this.origin).addScaledVector(this.direction,n),Jn.distanceToSquared(e))}distanceSqToSegment(e,n,i,r){Nc.copy(e).add(n).multiplyScalar(.5),uo.copy(n).sub(e).normalize(),wi.copy(this.origin).sub(Nc);const s=e.distanceTo(n)*.5,a=-this.direction.dot(uo),o=wi.dot(this.direction),l=-wi.dot(uo),c=wi.lengthSq(),d=Math.abs(1-a*a);let p,h,g,v;if(d>0)if(p=a*l-o,h=a*o-l,v=s*d,p>=0)if(h>=-v)if(h<=v){const S=1/d;p*=S,h*=S,g=p*(p+a*h+2*o)+h*(a*p+h+2*l)+c}else h=s,p=Math.max(0,-(a*h+o)),g=-p*p+h*(h+2*l)+c;else h=-s,p=Math.max(0,-(a*h+o)),g=-p*p+h*(h+2*l)+c;else h<=-v?(p=Math.max(0,-(-a*s+o)),h=p>0?-s:Math.min(Math.max(-s,-l),s),g=-p*p+h*(h+2*l)+c):h<=v?(p=0,h=Math.min(Math.max(-s,-l),s),g=h*(h+2*l)+c):(p=Math.max(0,-(a*s+o)),h=p>0?s:Math.min(Math.max(-s,-l),s),g=-p*p+h*(h+2*l)+c);else h=a>0?-s:s,p=Math.max(0,-(a*h+o)),g=-p*p+h*(h+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,p),r&&r.copy(Nc).addScaledVector(uo,h),g}intersectSphere(e,n){Jn.subVectors(e.center,this.origin);const i=Jn.dot(this.direction),r=Jn.dot(Jn)-i*i,s=e.radius*e.radius;if(r>s)return null;const a=Math.sqrt(s-r),o=i-a,l=i+a;return l<0?null:o<0?this.at(l,n):this.at(o,n)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const n=e.normal.dot(this.direction);if(n===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/n;return i>=0?i:null}intersectPlane(e,n){const i=this.distanceToPlane(e);return i===null?null:this.at(i,n)}intersectsPlane(e){const n=e.distanceToPoint(this.origin);return n===0||e.normal.dot(this.direction)*n<0}intersectBox(e,n){let i,r,s,a,o,l;const c=1/this.direction.x,d=1/this.direction.y,p=1/this.direction.z,h=this.origin;return c>=0?(i=(e.min.x-h.x)*c,r=(e.max.x-h.x)*c):(i=(e.max.x-h.x)*c,r=(e.min.x-h.x)*c),d>=0?(s=(e.min.y-h.y)*d,a=(e.max.y-h.y)*d):(s=(e.max.y-h.y)*d,a=(e.min.y-h.y)*d),i>a||s>r||((s>i||isNaN(i))&&(i=s),(a<r||isNaN(r))&&(r=a),p>=0?(o=(e.min.z-h.z)*p,l=(e.max.z-h.z)*p):(o=(e.max.z-h.z)*p,l=(e.min.z-h.z)*p),i>l||o>r)||((o>i||i!==i)&&(i=o),(l<r||r!==r)&&(r=l),r<0)?null:this.at(i>=0?i:r,n)}intersectsBox(e){return this.intersectBox(e,Jn)!==null}intersectTriangle(e,n,i,r,s){Pc.subVectors(n,e),fo.subVectors(i,e),Lc.crossVectors(Pc,fo);let a=this.direction.dot(Lc),o;if(a>0){if(r)return null;o=1}else if(a<0)o=-1,a=-a;else return null;wi.subVectors(this.origin,e);const l=o*this.direction.dot(fo.crossVectors(wi,fo));if(l<0)return null;const c=o*this.direction.dot(Pc.cross(wi));if(c<0||l+c>a)return null;const d=-o*wi.dot(Lc);return d<0?null:this.at(d/a,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class ft{constructor(e,n,i,r,s,a,o,l,c,d,p,h,g,v,S,m){ft.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,n,i,r,s,a,o,l,c,d,p,h,g,v,S,m)}set(e,n,i,r,s,a,o,l,c,d,p,h,g,v,S,m){const u=this.elements;return u[0]=e,u[4]=n,u[8]=i,u[12]=r,u[1]=s,u[5]=a,u[9]=o,u[13]=l,u[2]=c,u[6]=d,u[10]=p,u[14]=h,u[3]=g,u[7]=v,u[11]=S,u[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new ft().fromArray(this.elements)}copy(e){const n=this.elements,i=e.elements;return n[0]=i[0],n[1]=i[1],n[2]=i[2],n[3]=i[3],n[4]=i[4],n[5]=i[5],n[6]=i[6],n[7]=i[7],n[8]=i[8],n[9]=i[9],n[10]=i[10],n[11]=i[11],n[12]=i[12],n[13]=i[13],n[14]=i[14],n[15]=i[15],this}copyPosition(e){const n=this.elements,i=e.elements;return n[12]=i[12],n[13]=i[13],n[14]=i[14],this}setFromMatrix3(e){const n=e.elements;return this.set(n[0],n[3],n[6],0,n[1],n[4],n[7],0,n[2],n[5],n[8],0,0,0,0,1),this}extractBasis(e,n,i){return e.setFromMatrixColumn(this,0),n.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,n,i){return this.set(e.x,n.x,i.x,0,e.y,n.y,i.y,0,e.z,n.z,i.z,0,0,0,0,1),this}extractRotation(e){const n=this.elements,i=e.elements,r=1/Ur.setFromMatrixColumn(e,0).length(),s=1/Ur.setFromMatrixColumn(e,1).length(),a=1/Ur.setFromMatrixColumn(e,2).length();return n[0]=i[0]*r,n[1]=i[1]*r,n[2]=i[2]*r,n[3]=0,n[4]=i[4]*s,n[5]=i[5]*s,n[6]=i[6]*s,n[7]=0,n[8]=i[8]*a,n[9]=i[9]*a,n[10]=i[10]*a,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromEuler(e){const n=this.elements,i=e.x,r=e.y,s=e.z,a=Math.cos(i),o=Math.sin(i),l=Math.cos(r),c=Math.sin(r),d=Math.cos(s),p=Math.sin(s);if(e.order==="XYZ"){const h=a*d,g=a*p,v=o*d,S=o*p;n[0]=l*d,n[4]=-l*p,n[8]=c,n[1]=g+v*c,n[5]=h-S*c,n[9]=-o*l,n[2]=S-h*c,n[6]=v+g*c,n[10]=a*l}else if(e.order==="YXZ"){const h=l*d,g=l*p,v=c*d,S=c*p;n[0]=h+S*o,n[4]=v*o-g,n[8]=a*c,n[1]=a*p,n[5]=a*d,n[9]=-o,n[2]=g*o-v,n[6]=S+h*o,n[10]=a*l}else if(e.order==="ZXY"){const h=l*d,g=l*p,v=c*d,S=c*p;n[0]=h-S*o,n[4]=-a*p,n[8]=v+g*o,n[1]=g+v*o,n[5]=a*d,n[9]=S-h*o,n[2]=-a*c,n[6]=o,n[10]=a*l}else if(e.order==="ZYX"){const h=a*d,g=a*p,v=o*d,S=o*p;n[0]=l*d,n[4]=v*c-g,n[8]=h*c+S,n[1]=l*p,n[5]=S*c+h,n[9]=g*c-v,n[2]=-c,n[6]=o*l,n[10]=a*l}else if(e.order==="YZX"){const h=a*l,g=a*c,v=o*l,S=o*c;n[0]=l*d,n[4]=S-h*p,n[8]=v*p+g,n[1]=p,n[5]=a*d,n[9]=-o*d,n[2]=-c*d,n[6]=g*p+v,n[10]=h-S*p}else if(e.order==="XZY"){const h=a*l,g=a*c,v=o*l,S=o*c;n[0]=l*d,n[4]=-p,n[8]=c*d,n[1]=h*p+S,n[5]=a*d,n[9]=g*p-v,n[2]=v*p-g,n[6]=o*d,n[10]=S*p+h}return n[3]=0,n[7]=0,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromQuaternion(e){return this.compose(GS,e,WS)}lookAt(e,n,i){const r=this.elements;return on.subVectors(e,n),on.lengthSq()===0&&(on.z=1),on.normalize(),Ei.crossVectors(i,on),Ei.lengthSq()===0&&(Math.abs(i.z)===1?on.x+=1e-4:on.z+=1e-4,on.normalize(),Ei.crossVectors(i,on)),Ei.normalize(),ho.crossVectors(on,Ei),r[0]=Ei.x,r[4]=ho.x,r[8]=on.x,r[1]=Ei.y,r[5]=ho.y,r[9]=on.y,r[2]=Ei.z,r[6]=ho.z,r[10]=on.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,n){const i=e.elements,r=n.elements,s=this.elements,a=i[0],o=i[4],l=i[8],c=i[12],d=i[1],p=i[5],h=i[9],g=i[13],v=i[2],S=i[6],m=i[10],u=i[14],_=i[3],x=i[7],w=i[11],P=i[15],b=r[0],A=r[4],N=r[8],V=r[12],y=r[1],T=r[5],j=r[9],H=r[13],q=r[2],Q=r[6],G=r[10],Y=r[14],L=r[3],K=r[7],U=r[11],$=r[15];return s[0]=a*b+o*y+l*q+c*L,s[4]=a*A+o*T+l*Q+c*K,s[8]=a*N+o*j+l*G+c*U,s[12]=a*V+o*H+l*Y+c*$,s[1]=d*b+p*y+h*q+g*L,s[5]=d*A+p*T+h*Q+g*K,s[9]=d*N+p*j+h*G+g*U,s[13]=d*V+p*H+h*Y+g*$,s[2]=v*b+S*y+m*q+u*L,s[6]=v*A+S*T+m*Q+u*K,s[10]=v*N+S*j+m*G+u*U,s[14]=v*V+S*H+m*Y+u*$,s[3]=_*b+x*y+w*q+P*L,s[7]=_*A+x*T+w*Q+P*K,s[11]=_*N+x*j+w*G+P*U,s[15]=_*V+x*H+w*Y+P*$,this}multiplyScalar(e){const n=this.elements;return n[0]*=e,n[4]*=e,n[8]*=e,n[12]*=e,n[1]*=e,n[5]*=e,n[9]*=e,n[13]*=e,n[2]*=e,n[6]*=e,n[10]*=e,n[14]*=e,n[3]*=e,n[7]*=e,n[11]*=e,n[15]*=e,this}determinant(){const e=this.elements,n=e[0],i=e[4],r=e[8],s=e[12],a=e[1],o=e[5],l=e[9],c=e[13],d=e[2],p=e[6],h=e[10],g=e[14],v=e[3],S=e[7],m=e[11],u=e[15];return v*(+s*l*p-r*c*p-s*o*h+i*c*h+r*o*g-i*l*g)+S*(+n*l*g-n*c*h+s*a*h-r*a*g+r*c*d-s*l*d)+m*(+n*c*p-n*o*g-s*a*p+i*a*g+s*o*d-i*c*d)+u*(-r*o*d-n*l*p+n*o*h+r*a*p-i*a*h+i*l*d)}transpose(){const e=this.elements;let n;return n=e[1],e[1]=e[4],e[4]=n,n=e[2],e[2]=e[8],e[8]=n,n=e[6],e[6]=e[9],e[9]=n,n=e[3],e[3]=e[12],e[12]=n,n=e[7],e[7]=e[13],e[13]=n,n=e[11],e[11]=e[14],e[14]=n,this}setPosition(e,n,i){const r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=n,r[14]=i),this}invert(){const e=this.elements,n=e[0],i=e[1],r=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],d=e[8],p=e[9],h=e[10],g=e[11],v=e[12],S=e[13],m=e[14],u=e[15],_=p*m*c-S*h*c+S*l*g-o*m*g-p*l*u+o*h*u,x=v*h*c-d*m*c-v*l*g+a*m*g+d*l*u-a*h*u,w=d*S*c-v*p*c+v*o*g-a*S*g-d*o*u+a*p*u,P=v*p*l-d*S*l-v*o*h+a*S*h+d*o*m-a*p*m,b=n*_+i*x+r*w+s*P;if(b===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const A=1/b;return e[0]=_*A,e[1]=(S*h*s-p*m*s-S*r*g+i*m*g+p*r*u-i*h*u)*A,e[2]=(o*m*s-S*l*s+S*r*c-i*m*c-o*r*u+i*l*u)*A,e[3]=(p*l*s-o*h*s-p*r*c+i*h*c+o*r*g-i*l*g)*A,e[4]=x*A,e[5]=(d*m*s-v*h*s+v*r*g-n*m*g-d*r*u+n*h*u)*A,e[6]=(v*l*s-a*m*s-v*r*c+n*m*c+a*r*u-n*l*u)*A,e[7]=(a*h*s-d*l*s+d*r*c-n*h*c-a*r*g+n*l*g)*A,e[8]=w*A,e[9]=(v*p*s-d*S*s-v*i*g+n*S*g+d*i*u-n*p*u)*A,e[10]=(a*S*s-v*o*s+v*i*c-n*S*c-a*i*u+n*o*u)*A,e[11]=(d*o*s-a*p*s-d*i*c+n*p*c+a*i*g-n*o*g)*A,e[12]=P*A,e[13]=(d*S*r-v*p*r+v*i*h-n*S*h-d*i*m+n*p*m)*A,e[14]=(v*o*r-a*S*r-v*i*l+n*S*l+a*i*m-n*o*m)*A,e[15]=(a*p*r-d*o*r+d*i*l-n*p*l-a*i*h+n*o*h)*A,this}scale(e){const n=this.elements,i=e.x,r=e.y,s=e.z;return n[0]*=i,n[4]*=r,n[8]*=s,n[1]*=i,n[5]*=r,n[9]*=s,n[2]*=i,n[6]*=r,n[10]*=s,n[3]*=i,n[7]*=r,n[11]*=s,this}getMaxScaleOnAxis(){const e=this.elements,n=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(n,i,r))}makeTranslation(e,n,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,n,0,0,1,i,0,0,0,1),this}makeRotationX(e){const n=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,n,-i,0,0,i,n,0,0,0,0,1),this}makeRotationY(e){const n=Math.cos(e),i=Math.sin(e);return this.set(n,0,i,0,0,1,0,0,-i,0,n,0,0,0,0,1),this}makeRotationZ(e){const n=Math.cos(e),i=Math.sin(e);return this.set(n,-i,0,0,i,n,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,n){const i=Math.cos(n),r=Math.sin(n),s=1-i,a=e.x,o=e.y,l=e.z,c=s*a,d=s*o;return this.set(c*a+i,c*o-r*l,c*l+r*o,0,c*o+r*l,d*o+i,d*l-r*a,0,c*l-r*o,d*l+r*a,s*l*l+i,0,0,0,0,1),this}makeScale(e,n,i){return this.set(e,0,0,0,0,n,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,n,i,r,s,a){return this.set(1,i,s,0,e,1,a,0,n,r,1,0,0,0,0,1),this}compose(e,n,i){const r=this.elements,s=n._x,a=n._y,o=n._z,l=n._w,c=s+s,d=a+a,p=o+o,h=s*c,g=s*d,v=s*p,S=a*d,m=a*p,u=o*p,_=l*c,x=l*d,w=l*p,P=i.x,b=i.y,A=i.z;return r[0]=(1-(S+u))*P,r[1]=(g+w)*P,r[2]=(v-x)*P,r[3]=0,r[4]=(g-w)*b,r[5]=(1-(h+u))*b,r[6]=(m+_)*b,r[7]=0,r[8]=(v+x)*A,r[9]=(m-_)*A,r[10]=(1-(h+S))*A,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,n,i){const r=this.elements;let s=Ur.set(r[0],r[1],r[2]).length();const a=Ur.set(r[4],r[5],r[6]).length(),o=Ur.set(r[8],r[9],r[10]).length();this.determinant()<0&&(s=-s),e.x=r[12],e.y=r[13],e.z=r[14],Pn.copy(this);const c=1/s,d=1/a,p=1/o;return Pn.elements[0]*=c,Pn.elements[1]*=c,Pn.elements[2]*=c,Pn.elements[4]*=d,Pn.elements[5]*=d,Pn.elements[6]*=d,Pn.elements[8]*=p,Pn.elements[9]*=p,Pn.elements[10]*=p,n.setFromRotationMatrix(Pn),i.x=s,i.y=a,i.z=o,this}makePerspective(e,n,i,r,s,a,o=ci){const l=this.elements,c=2*s/(n-e),d=2*s/(i-r),p=(n+e)/(n-e),h=(i+r)/(i-r);let g,v;if(o===ci)g=-(a+s)/(a-s),v=-2*a*s/(a-s);else if(o===wl)g=-a/(a-s),v=-a*s/(a-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=c,l[4]=0,l[8]=p,l[12]=0,l[1]=0,l[5]=d,l[9]=h,l[13]=0,l[2]=0,l[6]=0,l[10]=g,l[14]=v,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,n,i,r,s,a,o=ci){const l=this.elements,c=1/(n-e),d=1/(i-r),p=1/(a-s),h=(n+e)*c,g=(i+r)*d;let v,S;if(o===ci)v=(a+s)*p,S=-2*p;else if(o===wl)v=s*p,S=-1*p;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-h,l[1]=0,l[5]=2*d,l[9]=0,l[13]=-g,l[2]=0,l[6]=0,l[10]=S,l[14]=-v,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const n=this.elements,i=e.elements;for(let r=0;r<16;r++)if(n[r]!==i[r])return!1;return!0}fromArray(e,n=0){for(let i=0;i<16;i++)this.elements[i]=e[i+n];return this}toArray(e=[],n=0){const i=this.elements;return e[n]=i[0],e[n+1]=i[1],e[n+2]=i[2],e[n+3]=i[3],e[n+4]=i[4],e[n+5]=i[5],e[n+6]=i[6],e[n+7]=i[7],e[n+8]=i[8],e[n+9]=i[9],e[n+10]=i[10],e[n+11]=i[11],e[n+12]=i[12],e[n+13]=i[13],e[n+14]=i[14],e[n+15]=i[15],e}}const Ur=new F,Pn=new ft,GS=new F(0,0,0),WS=new F(1,1,1),Ei=new F,ho=new F,on=new F,bp=new ft,Ap=new Fa;class Kn{constructor(e=0,n=0,i=0,r=Kn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=n,this._z=i,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,n,i,r=this._order){return this._x=e,this._y=n,this._z=i,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,n=this._order,i=!0){const r=e.elements,s=r[0],a=r[4],o=r[8],l=r[1],c=r[5],d=r[9],p=r[2],h=r[6],g=r[10];switch(n){case"XYZ":this._y=Math.asin(Qt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-d,g),this._z=Math.atan2(-a,s)):(this._x=Math.atan2(h,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Qt(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(o,g),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-p,s),this._z=0);break;case"ZXY":this._x=Math.asin(Qt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-p,g),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-Qt(p,-1,1)),Math.abs(p)<.9999999?(this._x=Math.atan2(h,g),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(Qt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-d,c),this._y=Math.atan2(-p,s)):(this._x=0,this._y=Math.atan2(o,g));break;case"XZY":this._z=Math.asin(-Qt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(h,c),this._y=Math.atan2(o,s)):(this._x=Math.atan2(-d,g),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+n)}return this._order=n,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,n,i){return bp.makeRotationFromQuaternion(e),this.setFromRotationMatrix(bp,n,i)}setFromVector3(e,n=this._order){return this.set(e.x,e.y,e.z,n)}reorder(e){return Ap.setFromEuler(this),this.setFromQuaternion(Ap,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],n=0){return e[n]=this._x,e[n+1]=this._y,e[n+2]=this._z,e[n+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Kn.DEFAULT_ORDER="XYZ";class Wf{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let XS=0;const Cp=new F,kr=new Fa,ei=new ft,po=new F,Gs=new F,qS=new F,YS=new Fa,Rp=new F(1,0,0),Np=new F(0,1,0),Pp=new F(0,0,1),Lp={type:"added"},$S={type:"removed"},Fr={type:"childadded",child:null},Dc={type:"childremoved",child:null};class Wt extends Rs{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:XS++}),this.uuid=ka(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Wt.DEFAULT_UP.clone();const e=new F,n=new Kn,i=new Fa,r=new F(1,1,1);function s(){i.setFromEuler(n,!1)}function a(){n.setFromQuaternion(i,void 0,!1)}n._onChange(s),i._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new ft},normalMatrix:{value:new Be}}),this.matrix=new ft,this.matrixWorld=new ft,this.matrixAutoUpdate=Wt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Wt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Wf,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,n){this.quaternion.setFromAxisAngle(e,n)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,n){return kr.setFromAxisAngle(e,n),this.quaternion.multiply(kr),this}rotateOnWorldAxis(e,n){return kr.setFromAxisAngle(e,n),this.quaternion.premultiply(kr),this}rotateX(e){return this.rotateOnAxis(Rp,e)}rotateY(e){return this.rotateOnAxis(Np,e)}rotateZ(e){return this.rotateOnAxis(Pp,e)}translateOnAxis(e,n){return Cp.copy(e).applyQuaternion(this.quaternion),this.position.add(Cp.multiplyScalar(n)),this}translateX(e){return this.translateOnAxis(Rp,e)}translateY(e){return this.translateOnAxis(Np,e)}translateZ(e){return this.translateOnAxis(Pp,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(ei.copy(this.matrixWorld).invert())}lookAt(e,n,i){e.isVector3?po.copy(e):po.set(e,n,i);const r=this.parent;this.updateWorldMatrix(!0,!1),Gs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ei.lookAt(Gs,po,this.up):ei.lookAt(po,Gs,this.up),this.quaternion.setFromRotationMatrix(ei),r&&(ei.extractRotation(r.matrixWorld),kr.setFromRotationMatrix(ei),this.quaternion.premultiply(kr.invert()))}add(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.add(arguments[n]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Lp),Fr.child=e,this.dispatchEvent(Fr),Fr.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const n=this.children.indexOf(e);return n!==-1&&(e.parent=null,this.children.splice(n,1),e.dispatchEvent($S),Dc.child=e,this.dispatchEvent(Dc),Dc.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),ei.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),ei.multiply(e.parent.matrixWorld)),e.applyMatrix4(ei),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Lp),Fr.child=e,this.dispatchEvent(Fr),Fr.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,n){if(this[e]===n)return this;for(let i=0,r=this.children.length;i<r;i++){const a=this.children[i].getObjectByProperty(e,n);if(a!==void 0)return a}}getObjectsByProperty(e,n,i=[]){this[e]===n&&i.push(this);const r=this.children;for(let s=0,a=r.length;s<a;s++)r[s].getObjectsByProperty(e,n,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Gs,e,qS),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Gs,YS,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const n=this.matrixWorld.elements;return e.set(n[8],n[9],n[10]).normalize()}raycast(){}traverse(e){e(this);const n=this.children;for(let i=0,r=n.length;i<r;i++)n[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const n=this.children;for(let i=0,r=n.length;i<r;i++)n[i].traverseVisible(e)}traverseAncestors(e){const n=this.parent;n!==null&&(e(n),n.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const n=this.children;for(let i=0,r=n.length;i<r;i++)n[i].updateMatrixWorld(e)}updateWorldMatrix(e,n){const i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),n===!0){const r=this.children;for(let s=0,a=r.length;s<a;s++)r[s].updateWorldMatrix(!1,!0)}}toJSON(e){const n=e===void 0||typeof e=="string",i={};n&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.visibility=this._visibility,r.active=this._active,r.bounds=this._bounds.map(o=>({boxInitialized:o.boxInitialized,boxMin:o.box.min.toArray(),boxMax:o.box.max.toArray(),sphereInitialized:o.sphereInitialized,sphereRadius:o.sphere.radius,sphereCenter:o.sphere.center.toArray()})),r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.geometryCount=this._geometryCount,r.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere={center:r.boundingSphere.center.toArray(),radius:r.boundingSphere.radius}),this.boundingBox!==null&&(r.boundingBox={min:r.boundingBox.min.toArray(),max:r.boundingBox.max.toArray()}));function s(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,d=l.length;c<d;c++){const p=l[c];s(e.shapes,p)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(s(e.materials,this.material[l]));r.material=o}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let o=0;o<this.children.length;o++)r.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];r.animations.push(s(e.animations,l))}}if(n){const o=a(e.geometries),l=a(e.materials),c=a(e.textures),d=a(e.images),p=a(e.shapes),h=a(e.skeletons),g=a(e.animations),v=a(e.nodes);o.length>0&&(i.geometries=o),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),d.length>0&&(i.images=d),p.length>0&&(i.shapes=p),h.length>0&&(i.skeletons=h),g.length>0&&(i.animations=g),v.length>0&&(i.nodes=v)}return i.object=r,i;function a(o){const l=[];for(const c in o){const d=o[c];delete d.metadata,l.push(d)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,n=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),n===!0)for(let i=0;i<e.children.length;i++){const r=e.children[i];this.add(r.clone())}return this}}Wt.DEFAULT_UP=new F(0,1,0);Wt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Wt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Ln=new F,ti=new F,Ic=new F,ni=new F,Or=new F,zr=new F,Dp=new F,Uc=new F,kc=new F,Fc=new F,Oc=new st,zc=new st,Bc=new st;class kn{constructor(e=new F,n=new F,i=new F){this.a=e,this.b=n,this.c=i}static getNormal(e,n,i,r){r.subVectors(i,n),Ln.subVectors(e,n),r.cross(Ln);const s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,n,i,r,s){Ln.subVectors(r,n),ti.subVectors(i,n),Ic.subVectors(e,n);const a=Ln.dot(Ln),o=Ln.dot(ti),l=Ln.dot(Ic),c=ti.dot(ti),d=ti.dot(Ic),p=a*c-o*o;if(p===0)return s.set(0,0,0),null;const h=1/p,g=(c*l-o*d)*h,v=(a*d-o*l)*h;return s.set(1-g-v,v,g)}static containsPoint(e,n,i,r){return this.getBarycoord(e,n,i,r,ni)===null?!1:ni.x>=0&&ni.y>=0&&ni.x+ni.y<=1}static getInterpolation(e,n,i,r,s,a,o,l){return this.getBarycoord(e,n,i,r,ni)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,ni.x),l.addScaledVector(a,ni.y),l.addScaledVector(o,ni.z),l)}static getInterpolatedAttribute(e,n,i,r,s,a){return Oc.setScalar(0),zc.setScalar(0),Bc.setScalar(0),Oc.fromBufferAttribute(e,n),zc.fromBufferAttribute(e,i),Bc.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(Oc,s.x),a.addScaledVector(zc,s.y),a.addScaledVector(Bc,s.z),a}static isFrontFacing(e,n,i,r){return Ln.subVectors(i,n),ti.subVectors(e,n),Ln.cross(ti).dot(r)<0}set(e,n,i){return this.a.copy(e),this.b.copy(n),this.c.copy(i),this}setFromPointsAndIndices(e,n,i,r){return this.a.copy(e[n]),this.b.copy(e[i]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,n,i,r){return this.a.fromBufferAttribute(e,n),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Ln.subVectors(this.c,this.b),ti.subVectors(this.a,this.b),Ln.cross(ti).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return kn.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,n){return kn.getBarycoord(e,this.a,this.b,this.c,n)}getInterpolation(e,n,i,r,s){return kn.getInterpolation(e,this.a,this.b,this.c,n,i,r,s)}containsPoint(e){return kn.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return kn.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,n){const i=this.a,r=this.b,s=this.c;let a,o;Or.subVectors(r,i),zr.subVectors(s,i),Uc.subVectors(e,i);const l=Or.dot(Uc),c=zr.dot(Uc);if(l<=0&&c<=0)return n.copy(i);kc.subVectors(e,r);const d=Or.dot(kc),p=zr.dot(kc);if(d>=0&&p<=d)return n.copy(r);const h=l*p-d*c;if(h<=0&&l>=0&&d<=0)return a=l/(l-d),n.copy(i).addScaledVector(Or,a);Fc.subVectors(e,s);const g=Or.dot(Fc),v=zr.dot(Fc);if(v>=0&&g<=v)return n.copy(s);const S=g*c-l*v;if(S<=0&&c>=0&&v<=0)return o=c/(c-v),n.copy(i).addScaledVector(zr,o);const m=d*v-g*p;if(m<=0&&p-d>=0&&g-v>=0)return Dp.subVectors(s,r),o=(p-d)/(p-d+(g-v)),n.copy(r).addScaledVector(Dp,o);const u=1/(m+S+h);return a=S*u,o=h*u,n.copy(i).addScaledVector(Or,a).addScaledVector(zr,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const ax={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ti={h:0,s:0,l:0},mo={h:0,s:0,l:0};function Hc(t,e,n){return n<0&&(n+=1),n>1&&(n-=1),n<1/6?t+(e-t)*6*n:n<1/2?e:n<2/3?t+(e-t)*6*(2/3-n):t}class Xe{constructor(e,n,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,n,i)}set(e,n,i){if(n===void 0&&i===void 0){const r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,n,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,n=jn){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,tt.toWorkingColorSpace(this,n),this}setRGB(e,n,i,r=tt.workingColorSpace){return this.r=e,this.g=n,this.b=i,tt.toWorkingColorSpace(this,r),this}setHSL(e,n,i,r=tt.workingColorSpace){if(e=LS(e,1),n=Qt(n,0,1),i=Qt(i,0,1),n===0)this.r=this.g=this.b=i;else{const s=i<=.5?i*(1+n):i+n-i*n,a=2*i-s;this.r=Hc(a,s,e+1/3),this.g=Hc(a,s,e),this.b=Hc(a,s,e-1/3)}return tt.toWorkingColorSpace(this,r),this}setStyle(e,n=jn){function i(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s;const a=r[1],o=r[2];switch(a){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,n);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,n);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,n);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){const s=r[1],a=s.length;if(a===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,n);if(a===6)return this.setHex(parseInt(s,16),n);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,n);return this}setColorName(e,n=jn){const i=ax[e.toLowerCase()];return i!==void 0?this.setHex(i,n):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=ds(e.r),this.g=ds(e.g),this.b=ds(e.b),this}copyLinearToSRGB(e){return this.r=Tc(e.r),this.g=Tc(e.g),this.b=Tc(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=jn){return tt.fromWorkingColorSpace(Ot.copy(this),e),Math.round(Qt(Ot.r*255,0,255))*65536+Math.round(Qt(Ot.g*255,0,255))*256+Math.round(Qt(Ot.b*255,0,255))}getHexString(e=jn){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,n=tt.workingColorSpace){tt.fromWorkingColorSpace(Ot.copy(this),n);const i=Ot.r,r=Ot.g,s=Ot.b,a=Math.max(i,r,s),o=Math.min(i,r,s);let l,c;const d=(o+a)/2;if(o===a)l=0,c=0;else{const p=a-o;switch(c=d<=.5?p/(a+o):p/(2-a-o),a){case i:l=(r-s)/p+(r<s?6:0);break;case r:l=(s-i)/p+2;break;case s:l=(i-r)/p+4;break}l/=6}return e.h=l,e.s=c,e.l=d,e}getRGB(e,n=tt.workingColorSpace){return tt.fromWorkingColorSpace(Ot.copy(this),n),e.r=Ot.r,e.g=Ot.g,e.b=Ot.b,e}getStyle(e=jn){tt.fromWorkingColorSpace(Ot.copy(this),e);const n=Ot.r,i=Ot.g,r=Ot.b;return e!==jn?`color(${e} ${n.toFixed(3)} ${i.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(n*255)},${Math.round(i*255)},${Math.round(r*255)})`}offsetHSL(e,n,i){return this.getHSL(Ti),this.setHSL(Ti.h+e,Ti.s+n,Ti.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,n){return this.r=e.r+n.r,this.g=e.g+n.g,this.b=e.b+n.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,n){return this.r+=(e.r-this.r)*n,this.g+=(e.g-this.g)*n,this.b+=(e.b-this.b)*n,this}lerpColors(e,n,i){return this.r=e.r+(n.r-e.r)*i,this.g=e.g+(n.g-e.g)*i,this.b=e.b+(n.b-e.b)*i,this}lerpHSL(e,n){this.getHSL(Ti),e.getHSL(mo);const i=wc(Ti.h,mo.h,n),r=wc(Ti.s,mo.s,n),s=wc(Ti.l,mo.l,n);return this.setHSL(i,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const n=this.r,i=this.g,r=this.b,s=e.elements;return this.r=s[0]*n+s[3]*i+s[6]*r,this.g=s[1]*n+s[4]*i+s[7]*r,this.b=s[2]*n+s[5]*i+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,n=0){return this.r=e[n],this.g=e[n+1],this.b=e[n+2],this}toArray(e=[],n=0){return e[n]=this.r,e[n+1]=this.g,e[n+2]=this.b,e}fromBufferAttribute(e,n){return this.r=e.getX(n),this.g=e.getY(n),this.b=e.getZ(n),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Ot=new Xe;Xe.NAMES=ax;let KS=0;class Ns extends Rs{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:KS++}),this.uuid=ka(),this.name="",this.type="Material",this.blending=cs,this.side=Xi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Ku,this.blendDst=Zu,this.blendEquation=cr,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Xe(0,0,0),this.blendAlpha=0,this.depthFunc=ys,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=_p,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Nr,this.stencilZFail=Nr,this.stencilZPass=Nr,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const n in e){const i=e[n];if(i===void 0){console.warn(`THREE.Material: parameter '${n}' has value of undefined.`);continue}const r=this[n];if(r===void 0){console.warn(`THREE.Material: '${n}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(i):r&&r.isVector3&&i&&i.isVector3?r.copy(i):this[n]=i}}toJSON(e){const n=e===void 0||typeof e=="string";n&&(e={textures:{},images:{}});const i={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==cs&&(i.blending=this.blending),this.side!==Xi&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==Ku&&(i.blendSrc=this.blendSrc),this.blendDst!==Zu&&(i.blendDst=this.blendDst),this.blendEquation!==cr&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==ys&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==_p&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Nr&&(i.stencilFail=this.stencilFail),this.stencilZFail!==Nr&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==Nr&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function r(s){const a=[];for(const o in s){const l=s[o];delete l.metadata,a.push(l)}return a}if(n){const s=r(e.textures),a=r(e.images);s.length>0&&(i.textures=s),a.length>0&&(i.images=a)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const n=e.clippingPlanes;let i=null;if(n!==null){const r=n.length;i=new Array(r);for(let s=0;s!==r;++s)i[s]=n[s].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class ox extends Ns{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Xe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Kn,this.combine=jg,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Mt=new F,go=new Ke;class Tn{constructor(e,n,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=n,this.count=e!==void 0?e.length/n:0,this.normalized=i,this.usage=yp,this.updateRanges=[],this.gpuType=li,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,n){this.updateRanges.push({start:e,count:n})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,n,i){e*=this.itemSize,i*=n.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=n.array[i+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let n=0,i=this.count;n<i;n++)go.fromBufferAttribute(this,n),go.applyMatrix3(e),this.setXY(n,go.x,go.y);else if(this.itemSize===3)for(let n=0,i=this.count;n<i;n++)Mt.fromBufferAttribute(this,n),Mt.applyMatrix3(e),this.setXYZ(n,Mt.x,Mt.y,Mt.z);return this}applyMatrix4(e){for(let n=0,i=this.count;n<i;n++)Mt.fromBufferAttribute(this,n),Mt.applyMatrix4(e),this.setXYZ(n,Mt.x,Mt.y,Mt.z);return this}applyNormalMatrix(e){for(let n=0,i=this.count;n<i;n++)Mt.fromBufferAttribute(this,n),Mt.applyNormalMatrix(e),this.setXYZ(n,Mt.x,Mt.y,Mt.z);return this}transformDirection(e){for(let n=0,i=this.count;n<i;n++)Mt.fromBufferAttribute(this,n),Mt.transformDirection(e),this.setXYZ(n,Mt.x,Mt.y,Mt.z);return this}set(e,n=0){return this.array.set(e,n),this}getComponent(e,n){let i=this.array[e*this.itemSize+n];return this.normalized&&(i=Bs(i,this.array)),i}setComponent(e,n,i){return this.normalized&&(i=Kt(i,this.array)),this.array[e*this.itemSize+n]=i,this}getX(e){let n=this.array[e*this.itemSize];return this.normalized&&(n=Bs(n,this.array)),n}setX(e,n){return this.normalized&&(n=Kt(n,this.array)),this.array[e*this.itemSize]=n,this}getY(e){let n=this.array[e*this.itemSize+1];return this.normalized&&(n=Bs(n,this.array)),n}setY(e,n){return this.normalized&&(n=Kt(n,this.array)),this.array[e*this.itemSize+1]=n,this}getZ(e){let n=this.array[e*this.itemSize+2];return this.normalized&&(n=Bs(n,this.array)),n}setZ(e,n){return this.normalized&&(n=Kt(n,this.array)),this.array[e*this.itemSize+2]=n,this}getW(e){let n=this.array[e*this.itemSize+3];return this.normalized&&(n=Bs(n,this.array)),n}setW(e,n){return this.normalized&&(n=Kt(n,this.array)),this.array[e*this.itemSize+3]=n,this}setXY(e,n,i){return e*=this.itemSize,this.normalized&&(n=Kt(n,this.array),i=Kt(i,this.array)),this.array[e+0]=n,this.array[e+1]=i,this}setXYZ(e,n,i,r){return e*=this.itemSize,this.normalized&&(n=Kt(n,this.array),i=Kt(i,this.array),r=Kt(r,this.array)),this.array[e+0]=n,this.array[e+1]=i,this.array[e+2]=r,this}setXYZW(e,n,i,r,s){return e*=this.itemSize,this.normalized&&(n=Kt(n,this.array),i=Kt(i,this.array),r=Kt(r,this.array),s=Kt(s,this.array)),this.array[e+0]=n,this.array[e+1]=i,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==yp&&(e.usage=this.usage),e}}class lx extends Tn{constructor(e,n,i){super(new Uint16Array(e),n,i)}}class cx extends Tn{constructor(e,n,i){super(new Uint32Array(e),n,i)}}class vr extends Tn{constructor(e,n,i){super(new Float32Array(e),n,i)}}let ZS=0;const vn=new ft,Vc=new Wt,Br=new F,ln=new Oa,Ws=new Oa,Ct=new F;class xi extends Rs{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:ZS++}),this.uuid=ka(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(ix(e)?cx:lx)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,n){return this.attributes[e]=n,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,n,i=0){this.groups.push({start:e,count:n,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,n){this.drawRange.start=e,this.drawRange.count=n}applyMatrix4(e){const n=this.attributes.position;n!==void 0&&(n.applyMatrix4(e),n.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const s=new Be().getNormalMatrix(e);i.applyNormalMatrix(s),i.needsUpdate=!0}const r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return vn.makeRotationFromQuaternion(e),this.applyMatrix4(vn),this}rotateX(e){return vn.makeRotationX(e),this.applyMatrix4(vn),this}rotateY(e){return vn.makeRotationY(e),this.applyMatrix4(vn),this}rotateZ(e){return vn.makeRotationZ(e),this.applyMatrix4(vn),this}translate(e,n,i){return vn.makeTranslation(e,n,i),this.applyMatrix4(vn),this}scale(e,n,i){return vn.makeScale(e,n,i),this.applyMatrix4(vn),this}lookAt(e){return Vc.lookAt(e),Vc.updateMatrix(),this.applyMatrix4(Vc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Br).negate(),this.translate(Br.x,Br.y,Br.z),this}setFromPoints(e){const n=[];for(let i=0,r=e.length;i<r;i++){const s=e[i];n.push(s.x,s.y,s.z||0)}return this.setAttribute("position",new vr(n,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Oa);const e=this.attributes.position,n=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new F(-1/0,-1/0,-1/0),new F(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),n)for(let i=0,r=n.length;i<r;i++){const s=n[i];ln.setFromBufferAttribute(s),this.morphTargetsRelative?(Ct.addVectors(this.boundingBox.min,ln.min),this.boundingBox.expandByPoint(Ct),Ct.addVectors(this.boundingBox.max,ln.max),this.boundingBox.expandByPoint(Ct)):(this.boundingBox.expandByPoint(ln.min),this.boundingBox.expandByPoint(ln.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new jl);const e=this.attributes.position,n=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new F,1/0);return}if(e){const i=this.boundingSphere.center;if(ln.setFromBufferAttribute(e),n)for(let s=0,a=n.length;s<a;s++){const o=n[s];Ws.setFromBufferAttribute(o),this.morphTargetsRelative?(Ct.addVectors(ln.min,Ws.min),ln.expandByPoint(Ct),Ct.addVectors(ln.max,Ws.max),ln.expandByPoint(Ct)):(ln.expandByPoint(Ws.min),ln.expandByPoint(Ws.max))}ln.getCenter(i);let r=0;for(let s=0,a=e.count;s<a;s++)Ct.fromBufferAttribute(e,s),r=Math.max(r,i.distanceToSquared(Ct));if(n)for(let s=0,a=n.length;s<a;s++){const o=n[s],l=this.morphTargetsRelative;for(let c=0,d=o.count;c<d;c++)Ct.fromBufferAttribute(o,c),l&&(Br.fromBufferAttribute(e,c),Ct.add(Br)),r=Math.max(r,i.distanceToSquared(Ct))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,n=this.attributes;if(e===null||n.position===void 0||n.normal===void 0||n.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=n.position,r=n.normal,s=n.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Tn(new Float32Array(4*i.count),4));const a=this.getAttribute("tangent"),o=[],l=[];for(let N=0;N<i.count;N++)o[N]=new F,l[N]=new F;const c=new F,d=new F,p=new F,h=new Ke,g=new Ke,v=new Ke,S=new F,m=new F;function u(N,V,y){c.fromBufferAttribute(i,N),d.fromBufferAttribute(i,V),p.fromBufferAttribute(i,y),h.fromBufferAttribute(s,N),g.fromBufferAttribute(s,V),v.fromBufferAttribute(s,y),d.sub(c),p.sub(c),g.sub(h),v.sub(h);const T=1/(g.x*v.y-v.x*g.y);isFinite(T)&&(S.copy(d).multiplyScalar(v.y).addScaledVector(p,-g.y).multiplyScalar(T),m.copy(p).multiplyScalar(g.x).addScaledVector(d,-v.x).multiplyScalar(T),o[N].add(S),o[V].add(S),o[y].add(S),l[N].add(m),l[V].add(m),l[y].add(m))}let _=this.groups;_.length===0&&(_=[{start:0,count:e.count}]);for(let N=0,V=_.length;N<V;++N){const y=_[N],T=y.start,j=y.count;for(let H=T,q=T+j;H<q;H+=3)u(e.getX(H+0),e.getX(H+1),e.getX(H+2))}const x=new F,w=new F,P=new F,b=new F;function A(N){P.fromBufferAttribute(r,N),b.copy(P);const V=o[N];x.copy(V),x.sub(P.multiplyScalar(P.dot(V))).normalize(),w.crossVectors(b,V);const T=w.dot(l[N])<0?-1:1;a.setXYZW(N,x.x,x.y,x.z,T)}for(let N=0,V=_.length;N<V;++N){const y=_[N],T=y.start,j=y.count;for(let H=T,q=T+j;H<q;H+=3)A(e.getX(H+0)),A(e.getX(H+1)),A(e.getX(H+2))}}computeVertexNormals(){const e=this.index,n=this.getAttribute("position");if(n!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new Tn(new Float32Array(n.count*3),3),this.setAttribute("normal",i);else for(let h=0,g=i.count;h<g;h++)i.setXYZ(h,0,0,0);const r=new F,s=new F,a=new F,o=new F,l=new F,c=new F,d=new F,p=new F;if(e)for(let h=0,g=e.count;h<g;h+=3){const v=e.getX(h+0),S=e.getX(h+1),m=e.getX(h+2);r.fromBufferAttribute(n,v),s.fromBufferAttribute(n,S),a.fromBufferAttribute(n,m),d.subVectors(a,s),p.subVectors(r,s),d.cross(p),o.fromBufferAttribute(i,v),l.fromBufferAttribute(i,S),c.fromBufferAttribute(i,m),o.add(d),l.add(d),c.add(d),i.setXYZ(v,o.x,o.y,o.z),i.setXYZ(S,l.x,l.y,l.z),i.setXYZ(m,c.x,c.y,c.z)}else for(let h=0,g=n.count;h<g;h+=3)r.fromBufferAttribute(n,h+0),s.fromBufferAttribute(n,h+1),a.fromBufferAttribute(n,h+2),d.subVectors(a,s),p.subVectors(r,s),d.cross(p),i.setXYZ(h+0,d.x,d.y,d.z),i.setXYZ(h+1,d.x,d.y,d.z),i.setXYZ(h+2,d.x,d.y,d.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let n=0,i=e.count;n<i;n++)Ct.fromBufferAttribute(e,n),Ct.normalize(),e.setXYZ(n,Ct.x,Ct.y,Ct.z)}toNonIndexed(){function e(o,l){const c=o.array,d=o.itemSize,p=o.normalized,h=new c.constructor(l.length*d);let g=0,v=0;for(let S=0,m=l.length;S<m;S++){o.isInterleavedBufferAttribute?g=l[S]*o.data.stride+o.offset:g=l[S]*d;for(let u=0;u<d;u++)h[v++]=c[g++]}return new Tn(h,d,p)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const n=new xi,i=this.index.array,r=this.attributes;for(const o in r){const l=r[o],c=e(l,i);n.setAttribute(o,c)}const s=this.morphAttributes;for(const o in s){const l=[],c=s[o];for(let d=0,p=c.length;d<p;d++){const h=c[d],g=e(h,i);l.push(g)}n.morphAttributes[o]=l}n.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];n.addGroup(c.start,c.count,c.materialIndex)}return n}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const n=this.index;n!==null&&(e.data.index={type:n.array.constructor.name,array:Array.prototype.slice.call(n.array)});const i=this.attributes;for(const l in i){const c=i[l];e.data.attributes[l]=c.toJSON(e.data)}const r={};let s=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],d=[];for(let p=0,h=c.length;p<h;p++){const g=c[p];d.push(g.toJSON(e.data))}d.length>0&&(r[l]=d,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const n={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone(n));const r=e.attributes;for(const c in r){const d=r[c];this.setAttribute(c,d.clone(n))}const s=e.morphAttributes;for(const c in s){const d=[],p=s[c];for(let h=0,g=p.length;h<g;h++)d.push(p[h].clone(n));this.morphAttributes[c]=d}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let c=0,d=a.length;c<d;c++){const p=a[c];this.addGroup(p.start,p.count,p.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Ip=new ft,tr=new Gf,xo=new jl,Up=new F,vo=new F,_o=new F,yo=new F,jc=new F,So=new F,kp=new F,Mo=new F;class qn extends Wt{constructor(e=new xi,n=new ox){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=n,this.updateMorphTargets()}copy(e,n){return super.copy(e,n),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const n=this.geometry.morphAttributes,i=Object.keys(n);if(i.length>0){const r=n[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=r.length;s<a;s++){const o=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}getVertexPosition(e,n){const i=this.geometry,r=i.attributes.position,s=i.morphAttributes.position,a=i.morphTargetsRelative;n.fromBufferAttribute(r,e);const o=this.morphTargetInfluences;if(s&&o){So.set(0,0,0);for(let l=0,c=s.length;l<c;l++){const d=o[l],p=s[l];d!==0&&(jc.fromBufferAttribute(p,e),a?So.addScaledVector(jc,d):So.addScaledVector(jc.sub(n),d))}n.add(So)}return n}raycast(e,n){const i=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),xo.copy(i.boundingSphere),xo.applyMatrix4(s),tr.copy(e.ray).recast(e.near),!(xo.containsPoint(tr.origin)===!1&&(tr.intersectSphere(xo,Up)===null||tr.origin.distanceToSquared(Up)>(e.far-e.near)**2))&&(Ip.copy(s).invert(),tr.copy(e.ray).applyMatrix4(Ip),!(i.boundingBox!==null&&tr.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,n,tr)))}_computeIntersections(e,n,i){let r;const s=this.geometry,a=this.material,o=s.index,l=s.attributes.position,c=s.attributes.uv,d=s.attributes.uv1,p=s.attributes.normal,h=s.groups,g=s.drawRange;if(o!==null)if(Array.isArray(a))for(let v=0,S=h.length;v<S;v++){const m=h[v],u=a[m.materialIndex],_=Math.max(m.start,g.start),x=Math.min(o.count,Math.min(m.start+m.count,g.start+g.count));for(let w=_,P=x;w<P;w+=3){const b=o.getX(w),A=o.getX(w+1),N=o.getX(w+2);r=wo(this,u,e,i,c,d,p,b,A,N),r&&(r.faceIndex=Math.floor(w/3),r.face.materialIndex=m.materialIndex,n.push(r))}}else{const v=Math.max(0,g.start),S=Math.min(o.count,g.start+g.count);for(let m=v,u=S;m<u;m+=3){const _=o.getX(m),x=o.getX(m+1),w=o.getX(m+2);r=wo(this,a,e,i,c,d,p,_,x,w),r&&(r.faceIndex=Math.floor(m/3),n.push(r))}}else if(l!==void 0)if(Array.isArray(a))for(let v=0,S=h.length;v<S;v++){const m=h[v],u=a[m.materialIndex],_=Math.max(m.start,g.start),x=Math.min(l.count,Math.min(m.start+m.count,g.start+g.count));for(let w=_,P=x;w<P;w+=3){const b=w,A=w+1,N=w+2;r=wo(this,u,e,i,c,d,p,b,A,N),r&&(r.faceIndex=Math.floor(w/3),r.face.materialIndex=m.materialIndex,n.push(r))}}else{const v=Math.max(0,g.start),S=Math.min(l.count,g.start+g.count);for(let m=v,u=S;m<u;m+=3){const _=m,x=m+1,w=m+2;r=wo(this,a,e,i,c,d,p,_,x,w),r&&(r.faceIndex=Math.floor(m/3),n.push(r))}}}}function QS(t,e,n,i,r,s,a,o){let l;if(e.side===rn?l=i.intersectTriangle(a,s,r,!0,o):l=i.intersectTriangle(r,s,a,e.side===Xi,o),l===null)return null;Mo.copy(o),Mo.applyMatrix4(t.matrixWorld);const c=n.ray.origin.distanceTo(Mo);return c<n.near||c>n.far?null:{distance:c,point:Mo.clone(),object:t}}function wo(t,e,n,i,r,s,a,o,l,c){t.getVertexPosition(o,vo),t.getVertexPosition(l,_o),t.getVertexPosition(c,yo);const d=QS(t,e,n,i,vo,_o,yo,kp);if(d){const p=new F;kn.getBarycoord(kp,vo,_o,yo,p),r&&(d.uv=kn.getInterpolatedAttribute(r,o,l,c,p,new Ke)),s&&(d.uv1=kn.getInterpolatedAttribute(s,o,l,c,p,new Ke)),a&&(d.normal=kn.getInterpolatedAttribute(a,o,l,c,p,new F),d.normal.dot(i.direction)>0&&d.normal.multiplyScalar(-1));const h={a:o,b:l,c,normal:new F,materialIndex:0};kn.getNormal(vo,_o,yo,h.normal),d.face=h,d.barycoord=p}return d}class za extends xi{constructor(e=1,n=1,i=1,r=1,s=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:n,depth:i,widthSegments:r,heightSegments:s,depthSegments:a};const o=this;r=Math.floor(r),s=Math.floor(s),a=Math.floor(a);const l=[],c=[],d=[],p=[];let h=0,g=0;v("z","y","x",-1,-1,i,n,e,a,s,0),v("z","y","x",1,-1,i,n,-e,a,s,1),v("x","z","y",1,1,e,i,n,r,a,2),v("x","z","y",1,-1,e,i,-n,r,a,3),v("x","y","z",1,-1,e,n,i,r,s,4),v("x","y","z",-1,-1,e,n,-i,r,s,5),this.setIndex(l),this.setAttribute("position",new vr(c,3)),this.setAttribute("normal",new vr(d,3)),this.setAttribute("uv",new vr(p,2));function v(S,m,u,_,x,w,P,b,A,N,V){const y=w/A,T=P/N,j=w/2,H=P/2,q=b/2,Q=A+1,G=N+1;let Y=0,L=0;const K=new F;for(let U=0;U<G;U++){const $=U*T-H;for(let ge=0;ge<Q;ge++){const be=ge*y-j;K[S]=be*_,K[m]=$*x,K[u]=q,c.push(K.x,K.y,K.z),K[S]=0,K[m]=0,K[u]=b>0?1:-1,d.push(K.x,K.y,K.z),p.push(ge/A),p.push(1-U/N),Y+=1}}for(let U=0;U<N;U++)for(let $=0;$<A;$++){const ge=h+$+Q*U,be=h+$+Q*(U+1),X=h+($+1)+Q*(U+1),te=h+($+1)+Q*U;l.push(ge,be,te),l.push(be,X,te),L+=6}o.addGroup(g,L,V),g+=L,h+=Y}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new za(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Ts(t){const e={};for(const n in t){e[n]={};for(const i in t[n]){const r=t[n][i];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[n][i]=null):e[n][i]=r.clone():Array.isArray(r)?e[n][i]=r.slice():e[n][i]=r}}return e}function Ht(t){const e={};for(let n=0;n<t.length;n++){const i=Ts(t[n]);for(const r in i)e[r]=i[r]}return e}function JS(t){const e=[];for(let n=0;n<t.length;n++)e.push(t[n].clone());return e}function ux(t){const e=t.getRenderTarget();return e===null?t.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:tt.workingColorSpace}const e1={clone:Ts,merge:Ht};var t1=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,n1=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class qi extends Ns{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=t1,this.fragmentShader=n1,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ts(e.uniforms),this.uniformsGroups=JS(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const n=super.toJSON(e);n.glslVersion=this.glslVersion,n.uniforms={};for(const r in this.uniforms){const a=this.uniforms[r].value;a&&a.isTexture?n.uniforms[r]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?n.uniforms[r]={type:"c",value:a.getHex()}:a&&a.isVector2?n.uniforms[r]={type:"v2",value:a.toArray()}:a&&a.isVector3?n.uniforms[r]={type:"v3",value:a.toArray()}:a&&a.isVector4?n.uniforms[r]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?n.uniforms[r]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?n.uniforms[r]={type:"m4",value:a.toArray()}:n.uniforms[r]={value:a}}Object.keys(this.defines).length>0&&(n.defines=this.defines),n.vertexShader=this.vertexShader,n.fragmentShader=this.fragmentShader,n.lights=this.lights,n.clipping=this.clipping;const i={};for(const r in this.extensions)this.extensions[r]===!0&&(i[r]=!0);return Object.keys(i).length>0&&(n.extensions=i),n}}class dx extends Wt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ft,this.projectionMatrix=new ft,this.projectionMatrixInverse=new ft,this.coordinateSystem=ci}copy(e,n){return super.copy(e,n),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,n){super.updateWorldMatrix(e,n),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const bi=new F,Fp=new Ke,Op=new Ke;class un extends dx{constructor(e=50,n=1,i=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=r,this.focus=10,this.aspect=n,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,n){return super.copy(e,n),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const n=.5*this.getFilmHeight()/e;this.fov=Ud*2*Math.atan(n),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Mc*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Ud*2*Math.atan(Math.tan(Mc*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,n,i){bi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(bi.x,bi.y).multiplyScalar(-e/bi.z),bi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(bi.x,bi.y).multiplyScalar(-e/bi.z)}getViewSize(e,n){return this.getViewBounds(e,Fp,Op),n.subVectors(Op,Fp)}setViewOffset(e,n,i,r,s,a){this.aspect=e/n,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=n,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let n=e*Math.tan(Mc*.5*this.fov)/this.zoom,i=2*n,r=this.aspect*i,s=-.5*r;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;s+=a.offsetX*r/l,n-=a.offsetY*i/c,r*=a.width/l,i*=a.height/c}const o=this.filmOffset;o!==0&&(s+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,n,n-i,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const n=super.toJSON(e);return n.object.fov=this.fov,n.object.zoom=this.zoom,n.object.near=this.near,n.object.far=this.far,n.object.focus=this.focus,n.object.aspect=this.aspect,this.view!==null&&(n.object.view=Object.assign({},this.view)),n.object.filmGauge=this.filmGauge,n.object.filmOffset=this.filmOffset,n}}const Hr=-90,Vr=1;class i1 extends Wt{constructor(e,n,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const r=new un(Hr,Vr,e,n);r.layers=this.layers,this.add(r);const s=new un(Hr,Vr,e,n);s.layers=this.layers,this.add(s);const a=new un(Hr,Vr,e,n);a.layers=this.layers,this.add(a);const o=new un(Hr,Vr,e,n);o.layers=this.layers,this.add(o);const l=new un(Hr,Vr,e,n);l.layers=this.layers,this.add(l);const c=new un(Hr,Vr,e,n);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,n=this.children.concat(),[i,r,s,a,o,l]=n;for(const c of n)this.remove(c);if(e===ci)i.up.set(0,1,0),i.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===wl)i.up.set(0,-1,0),i.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of n)this.add(c),c.updateMatrixWorld()}update(e,n){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[s,a,o,l,c,d]=this.children,p=e.getRenderTarget(),h=e.getActiveCubeFace(),g=e.getActiveMipmapLevel(),v=e.xr.enabled;e.xr.enabled=!1;const S=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,r),e.render(n,s),e.setRenderTarget(i,1,r),e.render(n,a),e.setRenderTarget(i,2,r),e.render(n,o),e.setRenderTarget(i,3,r),e.render(n,l),e.setRenderTarget(i,4,r),e.render(n,c),i.texture.generateMipmaps=S,e.setRenderTarget(i,5,r),e.render(n,d),e.setRenderTarget(p,h,g),e.xr.enabled=v,i.texture.needsPMREMUpdate=!0}}class fx extends Gt{constructor(e,n,i,r,s,a,o,l,c,d){e=e!==void 0?e:[],n=n!==void 0?n:Ss,super(e,n,i,r,s,a,o,l,c,d),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class r1 extends Tr{constructor(e=1,n={}){super(e,e,n),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},r=[i,i,i,i,i,i];this.texture=new fx(r,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=n.generateMipmaps!==void 0?n.generateMipmaps:!1,this.texture.minFilter=n.minFilter!==void 0?n.minFilter:Sn}fromEquirectangularTexture(e,n){this.texture.type=n.type,this.texture.colorSpace=n.colorSpace,this.texture.generateMipmaps=n.generateMipmaps,this.texture.minFilter=n.minFilter,this.texture.magFilter=n.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},r=new za(5,5,5),s=new qi({name:"CubemapFromEquirect",uniforms:Ts(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:rn,blending:Vi});s.uniforms.tEquirect.value=n;const a=new qn(r,s),o=n.minFilter;return n.minFilter===mr&&(n.minFilter=Sn),new i1(1,10,this).update(e,a),n.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,n,i,r){const s=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(n,i,r);e.setRenderTarget(s)}}const Gc=new F,s1=new F,a1=new Be;class or{constructor(e=new F(1,0,0),n=0){this.isPlane=!0,this.normal=e,this.constant=n}set(e,n){return this.normal.copy(e),this.constant=n,this}setComponents(e,n,i,r){return this.normal.set(e,n,i),this.constant=r,this}setFromNormalAndCoplanarPoint(e,n){return this.normal.copy(e),this.constant=-n.dot(this.normal),this}setFromCoplanarPoints(e,n,i){const r=Gc.subVectors(i,n).cross(s1.subVectors(e,n)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,n){return n.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,n){const i=e.delta(Gc),r=this.normal.dot(i);if(r===0)return this.distanceToPoint(e.start)===0?n.copy(e.start):null;const s=-(e.start.dot(this.normal)+this.constant)/r;return s<0||s>1?null:n.copy(e.start).addScaledVector(i,s)}intersectsLine(e){const n=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return n<0&&i>0||i<0&&n>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,n){const i=n||a1.getNormalMatrix(e),r=this.coplanarPoint(Gc).applyMatrix4(e),s=this.normal.applyMatrix3(i).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const nr=new jl,Eo=new F;class Xf{constructor(e=new or,n=new or,i=new or,r=new or,s=new or,a=new or){this.planes=[e,n,i,r,s,a]}set(e,n,i,r,s,a){const o=this.planes;return o[0].copy(e),o[1].copy(n),o[2].copy(i),o[3].copy(r),o[4].copy(s),o[5].copy(a),this}copy(e){const n=this.planes;for(let i=0;i<6;i++)n[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,n=ci){const i=this.planes,r=e.elements,s=r[0],a=r[1],o=r[2],l=r[3],c=r[4],d=r[5],p=r[6],h=r[7],g=r[8],v=r[9],S=r[10],m=r[11],u=r[12],_=r[13],x=r[14],w=r[15];if(i[0].setComponents(l-s,h-c,m-g,w-u).normalize(),i[1].setComponents(l+s,h+c,m+g,w+u).normalize(),i[2].setComponents(l+a,h+d,m+v,w+_).normalize(),i[3].setComponents(l-a,h-d,m-v,w-_).normalize(),i[4].setComponents(l-o,h-p,m-S,w-x).normalize(),n===ci)i[5].setComponents(l+o,h+p,m+S,w+x).normalize();else if(n===wl)i[5].setComponents(o,p,S,x).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+n);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),nr.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const n=e.geometry;n.boundingSphere===null&&n.computeBoundingSphere(),nr.copy(n.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(nr)}intersectsSprite(e){return nr.center.set(0,0,0),nr.radius=.7071067811865476,nr.applyMatrix4(e.matrixWorld),this.intersectsSphere(nr)}intersectsSphere(e){const n=this.planes,i=e.center,r=-e.radius;for(let s=0;s<6;s++)if(n[s].distanceToPoint(i)<r)return!1;return!0}intersectsBox(e){const n=this.planes;for(let i=0;i<6;i++){const r=n[i];if(Eo.x=r.normal.x>0?e.max.x:e.min.x,Eo.y=r.normal.y>0?e.max.y:e.min.y,Eo.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Eo)<0)return!1}return!0}containsPoint(e){const n=this.planes;for(let i=0;i<6;i++)if(n[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function hx(){let t=null,e=!1,n=null,i=null;function r(s,a){n(s,a),i=t.requestAnimationFrame(r)}return{start:function(){e!==!0&&n!==null&&(i=t.requestAnimationFrame(r),e=!0)},stop:function(){t.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(s){n=s},setContext:function(s){t=s}}}function o1(t){const e=new WeakMap;function n(o,l){const c=o.array,d=o.usage,p=c.byteLength,h=t.createBuffer();t.bindBuffer(l,h),t.bufferData(l,c,d),o.onUploadCallback();let g;if(c instanceof Float32Array)g=t.FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?g=t.HALF_FLOAT:g=t.UNSIGNED_SHORT;else if(c instanceof Int16Array)g=t.SHORT;else if(c instanceof Uint32Array)g=t.UNSIGNED_INT;else if(c instanceof Int32Array)g=t.INT;else if(c instanceof Int8Array)g=t.BYTE;else if(c instanceof Uint8Array)g=t.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)g=t.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:h,type:g,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:p}}function i(o,l,c){const d=l.array,p=l.updateRanges;if(t.bindBuffer(c,o),p.length===0)t.bufferSubData(c,0,d);else{p.sort((g,v)=>g.start-v.start);let h=0;for(let g=1;g<p.length;g++){const v=p[h],S=p[g];S.start<=v.start+v.count+1?v.count=Math.max(v.count,S.start+S.count-v.start):(++h,p[h]=S)}p.length=h+1;for(let g=0,v=p.length;g<v;g++){const S=p[g];t.bufferSubData(c,S.start*d.BYTES_PER_ELEMENT,d,S.start,S.count)}l.clearUpdateRanges()}l.onUploadCallback()}function r(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function s(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=e.get(o);l&&(t.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const d=e.get(o);(!d||d.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=e.get(o);if(c===void 0)e.set(o,n(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,o,l),c.version=o.version}}return{get:r,remove:s,update:a}}class Ba extends xi{constructor(e=1,n=1,i=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:n,widthSegments:i,heightSegments:r};const s=e/2,a=n/2,o=Math.floor(i),l=Math.floor(r),c=o+1,d=l+1,p=e/o,h=n/l,g=[],v=[],S=[],m=[];for(let u=0;u<d;u++){const _=u*h-a;for(let x=0;x<c;x++){const w=x*p-s;v.push(w,-_,0),S.push(0,0,1),m.push(x/o),m.push(1-u/l)}}for(let u=0;u<l;u++)for(let _=0;_<o;_++){const x=_+c*u,w=_+c*(u+1),P=_+1+c*(u+1),b=_+1+c*u;g.push(x,w,b),g.push(w,P,b)}this.setIndex(g),this.setAttribute("position",new vr(v,3)),this.setAttribute("normal",new vr(S,3)),this.setAttribute("uv",new vr(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ba(e.width,e.height,e.widthSegments,e.heightSegments)}}var l1=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,c1=`#ifdef USE_ALPHAHASH
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
#endif`,u1=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,d1=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,f1=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,h1=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,p1=`#ifdef USE_AOMAP
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
#endif`,m1=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,g1=`#ifdef USE_BATCHING
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
#endif`,x1=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,v1=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,_1=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,y1=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,S1=`#ifdef USE_IRIDESCENCE
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
#endif`,M1=`#ifdef USE_BUMPMAP
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
#endif`,w1=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,E1=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,T1=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,b1=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,A1=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,C1=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,R1=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,N1=`#if defined( USE_COLOR_ALPHA )
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
#endif`,P1=`#define PI 3.141592653589793
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
} // validated`,L1=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,D1=`vec3 transformedNormal = objectNormal;
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
#endif`,I1=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,U1=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,k1=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,F1=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,O1="gl_FragColor = linearToOutputTexel( gl_FragColor );",z1=`
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
}`,B1=`#ifdef USE_ENVMAP
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
#endif`,H1=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,V1=`#ifdef USE_ENVMAP
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
#endif`,j1=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,G1=`#ifdef USE_ENVMAP
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
#endif`,W1=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,X1=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,q1=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Y1=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,$1=`#ifdef USE_GRADIENTMAP
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
}`,K1=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Z1=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Q1=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,J1=`uniform bool receiveShadow;
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
#endif`,eM=`#ifdef USE_ENVMAP
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
#endif`,tM=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,nM=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,iM=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,rM=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,sM=`PhysicalMaterial material;
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
#endif`,aM=`struct PhysicalMaterial {
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
}`,oM=`
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
#endif`,lM=`#if defined( RE_IndirectDiffuse )
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
#endif`,cM=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,uM=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,dM=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,fM=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,hM=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,pM=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,mM=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,gM=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,xM=`#if defined( USE_POINTS_UV )
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
#endif`,vM=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,_M=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,yM=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,SM=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,MM=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,wM=`#ifdef USE_MORPHTARGETS
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
#endif`,EM=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,TM=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,bM=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,AM=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,CM=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,RM=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,NM=`#ifdef USE_NORMALMAP
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
#endif`,PM=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,LM=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,DM=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,IM=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,UM=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,kM=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,FM=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,OM=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,zM=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,BM=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,HM=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,VM=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,jM=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,GM=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,WM=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,XM=`float getShadowMask() {
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
}`,qM=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,YM=`#ifdef USE_SKINNING
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
#endif`,$M=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,KM=`#ifdef USE_SKINNING
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
#endif`,ZM=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,QM=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,JM=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,ew=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,tw=`#ifdef USE_TRANSMISSION
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
#endif`,nw=`#ifdef USE_TRANSMISSION
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
#endif`,iw=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,rw=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,sw=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,aw=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const ow=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,lw=`uniform sampler2D t2D;
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
}`,cw=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,uw=`#ifdef ENVMAP_TYPE_CUBE
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
}`,dw=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,fw=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,hw=`#include <common>
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
}`,pw=`#if DEPTH_PACKING == 3200
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
}`,mw=`#define DISTANCE
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
}`,gw=`#define DISTANCE
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
}`,xw=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,vw=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,_w=`uniform float scale;
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
}`,yw=`uniform vec3 diffuse;
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
}`,Sw=`#include <common>
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
}`,Mw=`uniform vec3 diffuse;
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
}`,ww=`#define LAMBERT
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
}`,Ew=`#define LAMBERT
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
}`,Tw=`#define MATCAP
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
}`,bw=`#define MATCAP
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
}`,Aw=`#define NORMAL
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
}`,Cw=`#define NORMAL
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
}`,Rw=`#define PHONG
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
}`,Nw=`#define PHONG
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
}`,Pw=`#define STANDARD
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
}`,Lw=`#define STANDARD
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
}`,Dw=`#define TOON
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
}`,Iw=`#define TOON
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
}`,Uw=`uniform float size;
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
}`,kw=`uniform vec3 diffuse;
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
}`,Fw=`#include <common>
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
}`,Ow=`uniform vec3 color;
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
}`,zw=`uniform float rotation;
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
}`,Bw=`uniform vec3 diffuse;
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
}`,ze={alphahash_fragment:l1,alphahash_pars_fragment:c1,alphamap_fragment:u1,alphamap_pars_fragment:d1,alphatest_fragment:f1,alphatest_pars_fragment:h1,aomap_fragment:p1,aomap_pars_fragment:m1,batching_pars_vertex:g1,batching_vertex:x1,begin_vertex:v1,beginnormal_vertex:_1,bsdfs:y1,iridescence_fragment:S1,bumpmap_pars_fragment:M1,clipping_planes_fragment:w1,clipping_planes_pars_fragment:E1,clipping_planes_pars_vertex:T1,clipping_planes_vertex:b1,color_fragment:A1,color_pars_fragment:C1,color_pars_vertex:R1,color_vertex:N1,common:P1,cube_uv_reflection_fragment:L1,defaultnormal_vertex:D1,displacementmap_pars_vertex:I1,displacementmap_vertex:U1,emissivemap_fragment:k1,emissivemap_pars_fragment:F1,colorspace_fragment:O1,colorspace_pars_fragment:z1,envmap_fragment:B1,envmap_common_pars_fragment:H1,envmap_pars_fragment:V1,envmap_pars_vertex:j1,envmap_physical_pars_fragment:eM,envmap_vertex:G1,fog_vertex:W1,fog_pars_vertex:X1,fog_fragment:q1,fog_pars_fragment:Y1,gradientmap_pars_fragment:$1,lightmap_pars_fragment:K1,lights_lambert_fragment:Z1,lights_lambert_pars_fragment:Q1,lights_pars_begin:J1,lights_toon_fragment:tM,lights_toon_pars_fragment:nM,lights_phong_fragment:iM,lights_phong_pars_fragment:rM,lights_physical_fragment:sM,lights_physical_pars_fragment:aM,lights_fragment_begin:oM,lights_fragment_maps:lM,lights_fragment_end:cM,logdepthbuf_fragment:uM,logdepthbuf_pars_fragment:dM,logdepthbuf_pars_vertex:fM,logdepthbuf_vertex:hM,map_fragment:pM,map_pars_fragment:mM,map_particle_fragment:gM,map_particle_pars_fragment:xM,metalnessmap_fragment:vM,metalnessmap_pars_fragment:_M,morphinstance_vertex:yM,morphcolor_vertex:SM,morphnormal_vertex:MM,morphtarget_pars_vertex:wM,morphtarget_vertex:EM,normal_fragment_begin:TM,normal_fragment_maps:bM,normal_pars_fragment:AM,normal_pars_vertex:CM,normal_vertex:RM,normalmap_pars_fragment:NM,clearcoat_normal_fragment_begin:PM,clearcoat_normal_fragment_maps:LM,clearcoat_pars_fragment:DM,iridescence_pars_fragment:IM,opaque_fragment:UM,packing:kM,premultiplied_alpha_fragment:FM,project_vertex:OM,dithering_fragment:zM,dithering_pars_fragment:BM,roughnessmap_fragment:HM,roughnessmap_pars_fragment:VM,shadowmap_pars_fragment:jM,shadowmap_pars_vertex:GM,shadowmap_vertex:WM,shadowmask_pars_fragment:XM,skinbase_vertex:qM,skinning_pars_vertex:YM,skinning_vertex:$M,skinnormal_vertex:KM,specularmap_fragment:ZM,specularmap_pars_fragment:QM,tonemapping_fragment:JM,tonemapping_pars_fragment:ew,transmission_fragment:tw,transmission_pars_fragment:nw,uv_pars_fragment:iw,uv_pars_vertex:rw,uv_vertex:sw,worldpos_vertex:aw,background_vert:ow,background_frag:lw,backgroundCube_vert:cw,backgroundCube_frag:uw,cube_vert:dw,cube_frag:fw,depth_vert:hw,depth_frag:pw,distanceRGBA_vert:mw,distanceRGBA_frag:gw,equirect_vert:xw,equirect_frag:vw,linedashed_vert:_w,linedashed_frag:yw,meshbasic_vert:Sw,meshbasic_frag:Mw,meshlambert_vert:ww,meshlambert_frag:Ew,meshmatcap_vert:Tw,meshmatcap_frag:bw,meshnormal_vert:Aw,meshnormal_frag:Cw,meshphong_vert:Rw,meshphong_frag:Nw,meshphysical_vert:Pw,meshphysical_frag:Lw,meshtoon_vert:Dw,meshtoon_frag:Iw,points_vert:Uw,points_frag:kw,shadow_vert:Fw,shadow_frag:Ow,sprite_vert:zw,sprite_frag:Bw},oe={common:{diffuse:{value:new Xe(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Be},alphaMap:{value:null},alphaMapTransform:{value:new Be},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Be}},envmap:{envMap:{value:null},envMapRotation:{value:new Be},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Be}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Be}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Be},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Be},normalScale:{value:new Ke(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Be},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Be}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Be}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Be}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Xe(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Xe(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Be},alphaTest:{value:0},uvTransform:{value:new Be}},sprite:{diffuse:{value:new Xe(16777215)},opacity:{value:1},center:{value:new Ke(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Be},alphaMap:{value:null},alphaMapTransform:{value:new Be},alphaTest:{value:0}}},Gn={basic:{uniforms:Ht([oe.common,oe.specularmap,oe.envmap,oe.aomap,oe.lightmap,oe.fog]),vertexShader:ze.meshbasic_vert,fragmentShader:ze.meshbasic_frag},lambert:{uniforms:Ht([oe.common,oe.specularmap,oe.envmap,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.fog,oe.lights,{emissive:{value:new Xe(0)}}]),vertexShader:ze.meshlambert_vert,fragmentShader:ze.meshlambert_frag},phong:{uniforms:Ht([oe.common,oe.specularmap,oe.envmap,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.fog,oe.lights,{emissive:{value:new Xe(0)},specular:{value:new Xe(1118481)},shininess:{value:30}}]),vertexShader:ze.meshphong_vert,fragmentShader:ze.meshphong_frag},standard:{uniforms:Ht([oe.common,oe.envmap,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.roughnessmap,oe.metalnessmap,oe.fog,oe.lights,{emissive:{value:new Xe(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:ze.meshphysical_vert,fragmentShader:ze.meshphysical_frag},toon:{uniforms:Ht([oe.common,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.gradientmap,oe.fog,oe.lights,{emissive:{value:new Xe(0)}}]),vertexShader:ze.meshtoon_vert,fragmentShader:ze.meshtoon_frag},matcap:{uniforms:Ht([oe.common,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.fog,{matcap:{value:null}}]),vertexShader:ze.meshmatcap_vert,fragmentShader:ze.meshmatcap_frag},points:{uniforms:Ht([oe.points,oe.fog]),vertexShader:ze.points_vert,fragmentShader:ze.points_frag},dashed:{uniforms:Ht([oe.common,oe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:ze.linedashed_vert,fragmentShader:ze.linedashed_frag},depth:{uniforms:Ht([oe.common,oe.displacementmap]),vertexShader:ze.depth_vert,fragmentShader:ze.depth_frag},normal:{uniforms:Ht([oe.common,oe.bumpmap,oe.normalmap,oe.displacementmap,{opacity:{value:1}}]),vertexShader:ze.meshnormal_vert,fragmentShader:ze.meshnormal_frag},sprite:{uniforms:Ht([oe.sprite,oe.fog]),vertexShader:ze.sprite_vert,fragmentShader:ze.sprite_frag},background:{uniforms:{uvTransform:{value:new Be},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:ze.background_vert,fragmentShader:ze.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Be}},vertexShader:ze.backgroundCube_vert,fragmentShader:ze.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:ze.cube_vert,fragmentShader:ze.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:ze.equirect_vert,fragmentShader:ze.equirect_frag},distanceRGBA:{uniforms:Ht([oe.common,oe.displacementmap,{referencePosition:{value:new F},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:ze.distanceRGBA_vert,fragmentShader:ze.distanceRGBA_frag},shadow:{uniforms:Ht([oe.lights,oe.fog,{color:{value:new Xe(0)},opacity:{value:1}}]),vertexShader:ze.shadow_vert,fragmentShader:ze.shadow_frag}};Gn.physical={uniforms:Ht([Gn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Be},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Be},clearcoatNormalScale:{value:new Ke(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Be},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Be},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Be},sheen:{value:0},sheenColor:{value:new Xe(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Be},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Be},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Be},transmissionSamplerSize:{value:new Ke},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Be},attenuationDistance:{value:0},attenuationColor:{value:new Xe(0)},specularColor:{value:new Xe(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Be},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Be},anisotropyVector:{value:new Ke},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Be}}]),vertexShader:ze.meshphysical_vert,fragmentShader:ze.meshphysical_frag};const To={r:0,b:0,g:0},ir=new Kn,Hw=new ft;function Vw(t,e,n,i,r,s,a){const o=new Xe(0);let l=s===!0?0:1,c,d,p=null,h=0,g=null;function v(_){let x=_.isScene===!0?_.background:null;return x&&x.isTexture&&(x=(_.backgroundBlurriness>0?n:e).get(x)),x}function S(_){let x=!1;const w=v(_);w===null?u(o,l):w&&w.isColor&&(u(w,1),x=!0);const P=t.xr.getEnvironmentBlendMode();P==="additive"?i.buffers.color.setClear(0,0,0,1,a):P==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,a),(t.autoClear||x)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil))}function m(_,x){const w=v(x);w&&(w.isCubeTexture||w.mapping===Hl)?(d===void 0&&(d=new qn(new za(1,1,1),new qi({name:"BackgroundCubeMaterial",uniforms:Ts(Gn.backgroundCube.uniforms),vertexShader:Gn.backgroundCube.vertexShader,fragmentShader:Gn.backgroundCube.fragmentShader,side:rn,depthTest:!1,depthWrite:!1,fog:!1})),d.geometry.deleteAttribute("normal"),d.geometry.deleteAttribute("uv"),d.onBeforeRender=function(P,b,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(d.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(d)),ir.copy(x.backgroundRotation),ir.x*=-1,ir.y*=-1,ir.z*=-1,w.isCubeTexture&&w.isRenderTargetTexture===!1&&(ir.y*=-1,ir.z*=-1),d.material.uniforms.envMap.value=w,d.material.uniforms.flipEnvMap.value=w.isCubeTexture&&w.isRenderTargetTexture===!1?-1:1,d.material.uniforms.backgroundBlurriness.value=x.backgroundBlurriness,d.material.uniforms.backgroundIntensity.value=x.backgroundIntensity,d.material.uniforms.backgroundRotation.value.setFromMatrix4(Hw.makeRotationFromEuler(ir)),d.material.toneMapped=tt.getTransfer(w.colorSpace)!==ut,(p!==w||h!==w.version||g!==t.toneMapping)&&(d.material.needsUpdate=!0,p=w,h=w.version,g=t.toneMapping),d.layers.enableAll(),_.unshift(d,d.geometry,d.material,0,0,null)):w&&w.isTexture&&(c===void 0&&(c=new qn(new Ba(2,2),new qi({name:"BackgroundMaterial",uniforms:Ts(Gn.background.uniforms),vertexShader:Gn.background.vertexShader,fragmentShader:Gn.background.fragmentShader,side:Xi,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=w,c.material.uniforms.backgroundIntensity.value=x.backgroundIntensity,c.material.toneMapped=tt.getTransfer(w.colorSpace)!==ut,w.matrixAutoUpdate===!0&&w.updateMatrix(),c.material.uniforms.uvTransform.value.copy(w.matrix),(p!==w||h!==w.version||g!==t.toneMapping)&&(c.material.needsUpdate=!0,p=w,h=w.version,g=t.toneMapping),c.layers.enableAll(),_.unshift(c,c.geometry,c.material,0,0,null))}function u(_,x){_.getRGB(To,ux(t)),i.buffers.color.setClear(To.r,To.g,To.b,x,a)}return{getClearColor:function(){return o},setClearColor:function(_,x=1){o.set(_),l=x,u(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(_){l=_,u(o,l)},render:S,addToRenderList:m}}function jw(t,e){const n=t.getParameter(t.MAX_VERTEX_ATTRIBS),i={},r=h(null);let s=r,a=!1;function o(y,T,j,H,q){let Q=!1;const G=p(H,j,T);s!==G&&(s=G,c(s.object)),Q=g(y,H,j,q),Q&&v(y,H,j,q),q!==null&&e.update(q,t.ELEMENT_ARRAY_BUFFER),(Q||a)&&(a=!1,w(y,T,j,H),q!==null&&t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,e.get(q).buffer))}function l(){return t.createVertexArray()}function c(y){return t.bindVertexArray(y)}function d(y){return t.deleteVertexArray(y)}function p(y,T,j){const H=j.wireframe===!0;let q=i[y.id];q===void 0&&(q={},i[y.id]=q);let Q=q[T.id];Q===void 0&&(Q={},q[T.id]=Q);let G=Q[H];return G===void 0&&(G=h(l()),Q[H]=G),G}function h(y){const T=[],j=[],H=[];for(let q=0;q<n;q++)T[q]=0,j[q]=0,H[q]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:T,enabledAttributes:j,attributeDivisors:H,object:y,attributes:{},index:null}}function g(y,T,j,H){const q=s.attributes,Q=T.attributes;let G=0;const Y=j.getAttributes();for(const L in Y)if(Y[L].location>=0){const U=q[L];let $=Q[L];if($===void 0&&(L==="instanceMatrix"&&y.instanceMatrix&&($=y.instanceMatrix),L==="instanceColor"&&y.instanceColor&&($=y.instanceColor)),U===void 0||U.attribute!==$||$&&U.data!==$.data)return!0;G++}return s.attributesNum!==G||s.index!==H}function v(y,T,j,H){const q={},Q=T.attributes;let G=0;const Y=j.getAttributes();for(const L in Y)if(Y[L].location>=0){let U=Q[L];U===void 0&&(L==="instanceMatrix"&&y.instanceMatrix&&(U=y.instanceMatrix),L==="instanceColor"&&y.instanceColor&&(U=y.instanceColor));const $={};$.attribute=U,U&&U.data&&($.data=U.data),q[L]=$,G++}s.attributes=q,s.attributesNum=G,s.index=H}function S(){const y=s.newAttributes;for(let T=0,j=y.length;T<j;T++)y[T]=0}function m(y){u(y,0)}function u(y,T){const j=s.newAttributes,H=s.enabledAttributes,q=s.attributeDivisors;j[y]=1,H[y]===0&&(t.enableVertexAttribArray(y),H[y]=1),q[y]!==T&&(t.vertexAttribDivisor(y,T),q[y]=T)}function _(){const y=s.newAttributes,T=s.enabledAttributes;for(let j=0,H=T.length;j<H;j++)T[j]!==y[j]&&(t.disableVertexAttribArray(j),T[j]=0)}function x(y,T,j,H,q,Q,G){G===!0?t.vertexAttribIPointer(y,T,j,q,Q):t.vertexAttribPointer(y,T,j,H,q,Q)}function w(y,T,j,H){S();const q=H.attributes,Q=j.getAttributes(),G=T.defaultAttributeValues;for(const Y in Q){const L=Q[Y];if(L.location>=0){let K=q[Y];if(K===void 0&&(Y==="instanceMatrix"&&y.instanceMatrix&&(K=y.instanceMatrix),Y==="instanceColor"&&y.instanceColor&&(K=y.instanceColor)),K!==void 0){const U=K.normalized,$=K.itemSize,ge=e.get(K);if(ge===void 0)continue;const be=ge.buffer,X=ge.type,te=ge.bytesPerElement,le=X===t.INT||X===t.UNSIGNED_INT||K.gpuType===Ff;if(K.isInterleavedBufferAttribute){const ce=K.data,Le=ce.stride,Ce=K.offset;if(ce.isInstancedInterleavedBuffer){for(let Ve=0;Ve<L.locationSize;Ve++)u(L.location+Ve,ce.meshPerAttribute);y.isInstancedMesh!==!0&&H._maxInstanceCount===void 0&&(H._maxInstanceCount=ce.meshPerAttribute*ce.count)}else for(let Ve=0;Ve<L.locationSize;Ve++)m(L.location+Ve);t.bindBuffer(t.ARRAY_BUFFER,be);for(let Ve=0;Ve<L.locationSize;Ve++)x(L.location+Ve,$/L.locationSize,X,U,Le*te,(Ce+$/L.locationSize*Ve)*te,le)}else{if(K.isInstancedBufferAttribute){for(let ce=0;ce<L.locationSize;ce++)u(L.location+ce,K.meshPerAttribute);y.isInstancedMesh!==!0&&H._maxInstanceCount===void 0&&(H._maxInstanceCount=K.meshPerAttribute*K.count)}else for(let ce=0;ce<L.locationSize;ce++)m(L.location+ce);t.bindBuffer(t.ARRAY_BUFFER,be);for(let ce=0;ce<L.locationSize;ce++)x(L.location+ce,$/L.locationSize,X,U,$*te,$/L.locationSize*ce*te,le)}}else if(G!==void 0){const U=G[Y];if(U!==void 0)switch(U.length){case 2:t.vertexAttrib2fv(L.location,U);break;case 3:t.vertexAttrib3fv(L.location,U);break;case 4:t.vertexAttrib4fv(L.location,U);break;default:t.vertexAttrib1fv(L.location,U)}}}}_()}function P(){N();for(const y in i){const T=i[y];for(const j in T){const H=T[j];for(const q in H)d(H[q].object),delete H[q];delete T[j]}delete i[y]}}function b(y){if(i[y.id]===void 0)return;const T=i[y.id];for(const j in T){const H=T[j];for(const q in H)d(H[q].object),delete H[q];delete T[j]}delete i[y.id]}function A(y){for(const T in i){const j=i[T];if(j[y.id]===void 0)continue;const H=j[y.id];for(const q in H)d(H[q].object),delete H[q];delete j[y.id]}}function N(){V(),a=!0,s!==r&&(s=r,c(s.object))}function V(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:o,reset:N,resetDefaultState:V,dispose:P,releaseStatesOfGeometry:b,releaseStatesOfProgram:A,initAttributes:S,enableAttribute:m,disableUnusedAttributes:_}}function Gw(t,e,n){let i;function r(c){i=c}function s(c,d){t.drawArrays(i,c,d),n.update(d,i,1)}function a(c,d,p){p!==0&&(t.drawArraysInstanced(i,c,d,p),n.update(d,i,p))}function o(c,d,p){if(p===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,d,0,p);let g=0;for(let v=0;v<p;v++)g+=d[v];n.update(g,i,1)}function l(c,d,p,h){if(p===0)return;const g=e.get("WEBGL_multi_draw");if(g===null)for(let v=0;v<c.length;v++)a(c[v],d[v],h[v]);else{g.multiDrawArraysInstancedWEBGL(i,c,0,d,0,h,0,p);let v=0;for(let S=0;S<p;S++)v+=d[S];for(let S=0;S<h.length;S++)n.update(v,i,h[S])}}this.setMode=r,this.render=s,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function Ww(t,e,n,i){let r;function s(){if(r!==void 0)return r;if(e.has("EXT_texture_filter_anisotropic")===!0){const A=e.get("EXT_texture_filter_anisotropic");r=t.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function a(A){return!(A!==Fn&&i.convert(A)!==t.getParameter(t.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(A){const N=A===Ua&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(A!==mi&&i.convert(A)!==t.getParameter(t.IMPLEMENTATION_COLOR_READ_TYPE)&&A!==li&&!N)}function l(A){if(A==="highp"){if(t.getShaderPrecisionFormat(t.VERTEX_SHADER,t.HIGH_FLOAT).precision>0&&t.getShaderPrecisionFormat(t.FRAGMENT_SHADER,t.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&t.getShaderPrecisionFormat(t.VERTEX_SHADER,t.MEDIUM_FLOAT).precision>0&&t.getShaderPrecisionFormat(t.FRAGMENT_SHADER,t.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=n.precision!==void 0?n.precision:"highp";const d=l(c);d!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",d,"instead."),c=d);const p=n.logarithmicDepthBuffer===!0,h=n.reverseDepthBuffer===!0&&e.has("EXT_clip_control");if(h===!0){const A=e.get("EXT_clip_control");A.clipControlEXT(A.LOWER_LEFT_EXT,A.ZERO_TO_ONE_EXT)}const g=t.getParameter(t.MAX_TEXTURE_IMAGE_UNITS),v=t.getParameter(t.MAX_VERTEX_TEXTURE_IMAGE_UNITS),S=t.getParameter(t.MAX_TEXTURE_SIZE),m=t.getParameter(t.MAX_CUBE_MAP_TEXTURE_SIZE),u=t.getParameter(t.MAX_VERTEX_ATTRIBS),_=t.getParameter(t.MAX_VERTEX_UNIFORM_VECTORS),x=t.getParameter(t.MAX_VARYING_VECTORS),w=t.getParameter(t.MAX_FRAGMENT_UNIFORM_VECTORS),P=v>0,b=t.getParameter(t.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:p,reverseDepthBuffer:h,maxTextures:g,maxVertexTextures:v,maxTextureSize:S,maxCubemapSize:m,maxAttributes:u,maxVertexUniforms:_,maxVaryings:x,maxFragmentUniforms:w,vertexTextures:P,maxSamples:b}}function Xw(t){const e=this;let n=null,i=0,r=!1,s=!1;const a=new or,o=new Be,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(p,h){const g=p.length!==0||h||i!==0||r;return r=h,i=p.length,g},this.beginShadows=function(){s=!0,d(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(p,h){n=d(p,h,0)},this.setState=function(p,h,g){const v=p.clippingPlanes,S=p.clipIntersection,m=p.clipShadows,u=t.get(p);if(!r||v===null||v.length===0||s&&!m)s?d(null):c();else{const _=s?0:i,x=_*4;let w=u.clippingState||null;l.value=w,w=d(v,h,x,g);for(let P=0;P!==x;++P)w[P]=n[P];u.clippingState=w,this.numIntersection=S?this.numPlanes:0,this.numPlanes+=_}};function c(){l.value!==n&&(l.value=n,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function d(p,h,g,v){const S=p!==null?p.length:0;let m=null;if(S!==0){if(m=l.value,v!==!0||m===null){const u=g+S*4,_=h.matrixWorldInverse;o.getNormalMatrix(_),(m===null||m.length<u)&&(m=new Float32Array(u));for(let x=0,w=g;x!==S;++x,w+=4)a.copy(p[x]).applyMatrix4(_,o),a.normal.toArray(m,w),m[w+3]=a.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=S,e.numIntersection=0,m}}function qw(t){let e=new WeakMap;function n(a,o){return o===sd?a.mapping=Ss:o===ad&&(a.mapping=Ms),a}function i(a){if(a&&a.isTexture){const o=a.mapping;if(o===sd||o===ad)if(e.has(a)){const l=e.get(a).texture;return n(l,a.mapping)}else{const l=a.image;if(l&&l.height>0){const c=new r1(l.height);return c.fromEquirectangularTexture(t,a),e.set(a,c),a.addEventListener("dispose",r),n(c.texture,a.mapping)}else return null}}return a}function r(a){const o=a.target;o.removeEventListener("dispose",r);const l=e.get(o);l!==void 0&&(e.delete(o),l.dispose())}function s(){e=new WeakMap}return{get:i,dispose:s}}class Yw extends dx{constructor(e=-1,n=1,i=1,r=-1,s=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=n,this.top=i,this.bottom=r,this.near=s,this.far=a,this.updateProjectionMatrix()}copy(e,n){return super.copy(e,n),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,n,i,r,s,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=n,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),n=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,r=(this.top+this.bottom)/2;let s=i-e,a=i+e,o=r+n,l=r-n;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,d=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,a=s+c*this.view.width,o-=d*this.view.offsetY,l=o-d*this.view.height}this.projectionMatrix.makeOrthographic(s,a,o,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const n=super.toJSON(e);return n.object.zoom=this.zoom,n.object.left=this.left,n.object.right=this.right,n.object.top=this.top,n.object.bottom=this.bottom,n.object.near=this.near,n.object.far=this.far,this.view!==null&&(n.object.view=Object.assign({},this.view)),n}}const ns=4,zp=[.125,.215,.35,.446,.526,.582],ur=20,Wc=new Yw,Bp=new Xe;let Xc=null,qc=0,Yc=0,$c=!1;const lr=(1+Math.sqrt(5))/2,jr=1/lr,Hp=[new F(-lr,jr,0),new F(lr,jr,0),new F(-jr,0,lr),new F(jr,0,lr),new F(0,lr,-jr),new F(0,lr,jr),new F(-1,1,-1),new F(1,1,-1),new F(-1,1,1),new F(1,1,1)];class Vp{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,n=0,i=.1,r=100){Xc=this._renderer.getRenderTarget(),qc=this._renderer.getActiveCubeFace(),Yc=this._renderer.getActiveMipmapLevel(),$c=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,i,r,s),n>0&&this._blur(s,0,0,n),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,n=null){return this._fromTexture(e,n)}fromCubemap(e,n=null){return this._fromTexture(e,n)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Wp(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Gp(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Xc,qc,Yc),this._renderer.xr.enabled=$c,e.scissorTest=!1,bo(e,0,0,e.width,e.height)}_fromTexture(e,n){e.mapping===Ss||e.mapping===Ms?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Xc=this._renderer.getRenderTarget(),qc=this._renderer.getActiveCubeFace(),Yc=this._renderer.getActiveMipmapLevel(),$c=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=n||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),n=4*this._cubeSize,i={magFilter:Sn,minFilter:Sn,generateMipmaps:!1,type:Ua,format:Fn,colorSpace:Zi,depthBuffer:!1},r=jp(e,n,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==n){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=jp(e,n,i);const{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=$w(s)),this._blurMaterial=Kw(s,e,n)}return r}_compileMaterial(e){const n=new qn(this._lodPlanes[0],e);this._renderer.compile(n,Wc)}_sceneToCubeUV(e,n,i,r){const o=new un(90,1,n,i),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],d=this._renderer,p=d.autoClear,h=d.toneMapping;d.getClearColor(Bp),d.toneMapping=ji,d.autoClear=!1;const g=new ox({name:"PMREM.Background",side:rn,depthWrite:!1,depthTest:!1}),v=new qn(new za,g);let S=!1;const m=e.background;m?m.isColor&&(g.color.copy(m),e.background=null,S=!0):(g.color.copy(Bp),S=!0);for(let u=0;u<6;u++){const _=u%3;_===0?(o.up.set(0,l[u],0),o.lookAt(c[u],0,0)):_===1?(o.up.set(0,0,l[u]),o.lookAt(0,c[u],0)):(o.up.set(0,l[u],0),o.lookAt(0,0,c[u]));const x=this._cubeSize;bo(r,_*x,u>2?x:0,x,x),d.setRenderTarget(r),S&&d.render(v,o),d.render(e,o)}v.geometry.dispose(),v.material.dispose(),d.toneMapping=h,d.autoClear=p,e.background=m}_textureToCubeUV(e,n){const i=this._renderer,r=e.mapping===Ss||e.mapping===Ms;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=Wp()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Gp());const s=r?this._cubemapMaterial:this._equirectMaterial,a=new qn(this._lodPlanes[0],s),o=s.uniforms;o.envMap.value=e;const l=this._cubeSize;bo(n,0,0,3*l,2*l),i.setRenderTarget(n),i.render(a,Wc)}_applyPMREM(e){const n=this._renderer,i=n.autoClear;n.autoClear=!1;const r=this._lodPlanes.length;for(let s=1;s<r;s++){const a=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),o=Hp[(r-s-1)%Hp.length];this._blur(e,s-1,s,a,o)}n.autoClear=i}_blur(e,n,i,r,s){const a=this._pingPongRenderTarget;this._halfBlur(e,a,n,i,r,"latitudinal",s),this._halfBlur(a,e,i,i,r,"longitudinal",s)}_halfBlur(e,n,i,r,s,a,o){const l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const d=3,p=new qn(this._lodPlanes[r],c),h=c.uniforms,g=this._sizeLods[i]-1,v=isFinite(s)?Math.PI/(2*g):2*Math.PI/(2*ur-1),S=s/v,m=isFinite(s)?1+Math.floor(d*S):ur;m>ur&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${ur}`);const u=[];let _=0;for(let A=0;A<ur;++A){const N=A/S,V=Math.exp(-N*N/2);u.push(V),A===0?_+=V:A<m&&(_+=2*V)}for(let A=0;A<u.length;A++)u[A]=u[A]/_;h.envMap.value=e.texture,h.samples.value=m,h.weights.value=u,h.latitudinal.value=a==="latitudinal",o&&(h.poleAxis.value=o);const{_lodMax:x}=this;h.dTheta.value=v,h.mipInt.value=x-i;const w=this._sizeLods[r],P=3*w*(r>x-ns?r-x+ns:0),b=4*(this._cubeSize-w);bo(n,P,b,3*w,2*w),l.setRenderTarget(n),l.render(p,Wc)}}function $w(t){const e=[],n=[],i=[];let r=t;const s=t-ns+1+zp.length;for(let a=0;a<s;a++){const o=Math.pow(2,r);n.push(o);let l=1/o;a>t-ns?l=zp[a-t+ns-1]:a===0&&(l=0),i.push(l);const c=1/(o-2),d=-c,p=1+c,h=[d,d,p,d,p,p,d,d,p,p,d,p],g=6,v=6,S=3,m=2,u=1,_=new Float32Array(S*v*g),x=new Float32Array(m*v*g),w=new Float32Array(u*v*g);for(let b=0;b<g;b++){const A=b%3*2/3-1,N=b>2?0:-1,V=[A,N,0,A+2/3,N,0,A+2/3,N+1,0,A,N,0,A+2/3,N+1,0,A,N+1,0];_.set(V,S*v*b),x.set(h,m*v*b);const y=[b,b,b,b,b,b];w.set(y,u*v*b)}const P=new xi;P.setAttribute("position",new Tn(_,S)),P.setAttribute("uv",new Tn(x,m)),P.setAttribute("faceIndex",new Tn(w,u)),e.push(P),r>ns&&r--}return{lodPlanes:e,sizeLods:n,sigmas:i}}function jp(t,e,n){const i=new Tr(t,e,n);return i.texture.mapping=Hl,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function bo(t,e,n,i,r){t.viewport.set(e,n,i,r),t.scissor.set(e,n,i,r)}function Kw(t,e,n){const i=new Float32Array(ur),r=new F(0,1,0);return new qi({name:"SphericalGaussianBlur",defines:{n:ur,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${t}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:qf(),fragmentShader:`

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
		`,blending:Vi,depthTest:!1,depthWrite:!1})}function Gp(){return new qi({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:qf(),fragmentShader:`

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
		`,blending:Vi,depthTest:!1,depthWrite:!1})}function Wp(){return new qi({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:qf(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Vi,depthTest:!1,depthWrite:!1})}function qf(){return`

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
	`}function Zw(t){let e=new WeakMap,n=null;function i(o){if(o&&o.isTexture){const l=o.mapping,c=l===sd||l===ad,d=l===Ss||l===Ms;if(c||d){let p=e.get(o);const h=p!==void 0?p.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==h)return n===null&&(n=new Vp(t)),p=c?n.fromEquirectangular(o,p):n.fromCubemap(o,p),p.texture.pmremVersion=o.pmremVersion,e.set(o,p),p.texture;if(p!==void 0)return p.texture;{const g=o.image;return c&&g&&g.height>0||d&&g&&r(g)?(n===null&&(n=new Vp(t)),p=c?n.fromEquirectangular(o):n.fromCubemap(o),p.texture.pmremVersion=o.pmremVersion,e.set(o,p),o.addEventListener("dispose",s),p.texture):null}}}return o}function r(o){let l=0;const c=6;for(let d=0;d<c;d++)o[d]!==void 0&&l++;return l===c}function s(o){const l=o.target;l.removeEventListener("dispose",s);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function a(){e=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:i,dispose:a}}function Qw(t){const e={};function n(i){if(e[i]!==void 0)return e[i];let r;switch(i){case"WEBGL_depth_texture":r=t.getExtension("WEBGL_depth_texture")||t.getExtension("MOZ_WEBGL_depth_texture")||t.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":r=t.getExtension("EXT_texture_filter_anisotropic")||t.getExtension("MOZ_EXT_texture_filter_anisotropic")||t.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":r=t.getExtension("WEBGL_compressed_texture_s3tc")||t.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||t.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":r=t.getExtension("WEBGL_compressed_texture_pvrtc")||t.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:r=t.getExtension(i)}return e[i]=r,r}return{has:function(i){return n(i)!==null},init:function(){n("EXT_color_buffer_float"),n("WEBGL_clip_cull_distance"),n("OES_texture_float_linear"),n("EXT_color_buffer_half_float"),n("WEBGL_multisampled_render_to_texture"),n("WEBGL_render_shared_exponent")},get:function(i){const r=n(i);return r===null&&qo("THREE.WebGLRenderer: "+i+" extension not supported."),r}}}function Jw(t,e,n,i){const r={},s=new WeakMap;function a(p){const h=p.target;h.index!==null&&e.remove(h.index);for(const v in h.attributes)e.remove(h.attributes[v]);for(const v in h.morphAttributes){const S=h.morphAttributes[v];for(let m=0,u=S.length;m<u;m++)e.remove(S[m])}h.removeEventListener("dispose",a),delete r[h.id];const g=s.get(h);g&&(e.remove(g),s.delete(h)),i.releaseStatesOfGeometry(h),h.isInstancedBufferGeometry===!0&&delete h._maxInstanceCount,n.memory.geometries--}function o(p,h){return r[h.id]===!0||(h.addEventListener("dispose",a),r[h.id]=!0,n.memory.geometries++),h}function l(p){const h=p.attributes;for(const v in h)e.update(h[v],t.ARRAY_BUFFER);const g=p.morphAttributes;for(const v in g){const S=g[v];for(let m=0,u=S.length;m<u;m++)e.update(S[m],t.ARRAY_BUFFER)}}function c(p){const h=[],g=p.index,v=p.attributes.position;let S=0;if(g!==null){const _=g.array;S=g.version;for(let x=0,w=_.length;x<w;x+=3){const P=_[x+0],b=_[x+1],A=_[x+2];h.push(P,b,b,A,A,P)}}else if(v!==void 0){const _=v.array;S=v.version;for(let x=0,w=_.length/3-1;x<w;x+=3){const P=x+0,b=x+1,A=x+2;h.push(P,b,b,A,A,P)}}else return;const m=new(ix(h)?cx:lx)(h,1);m.version=S;const u=s.get(p);u&&e.remove(u),s.set(p,m)}function d(p){const h=s.get(p);if(h){const g=p.index;g!==null&&h.version<g.version&&c(p)}else c(p);return s.get(p)}return{get:o,update:l,getWireframeAttribute:d}}function eE(t,e,n){let i;function r(h){i=h}let s,a;function o(h){s=h.type,a=h.bytesPerElement}function l(h,g){t.drawElements(i,g,s,h*a),n.update(g,i,1)}function c(h,g,v){v!==0&&(t.drawElementsInstanced(i,g,s,h*a,v),n.update(g,i,v))}function d(h,g,v){if(v===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,g,0,s,h,0,v);let m=0;for(let u=0;u<v;u++)m+=g[u];n.update(m,i,1)}function p(h,g,v,S){if(v===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let u=0;u<h.length;u++)c(h[u]/a,g[u],S[u]);else{m.multiDrawElementsInstancedWEBGL(i,g,0,s,h,0,S,0,v);let u=0;for(let _=0;_<v;_++)u+=g[_];for(let _=0;_<S.length;_++)n.update(u,i,S[_])}}this.setMode=r,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=d,this.renderMultiDrawInstances=p}function tE(t){const e={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function i(s,a,o){switch(n.calls++,a){case t.TRIANGLES:n.triangles+=o*(s/3);break;case t.LINES:n.lines+=o*(s/2);break;case t.LINE_STRIP:n.lines+=o*(s-1);break;case t.LINE_LOOP:n.lines+=o*s;break;case t.POINTS:n.points+=o*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function r(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:e,render:n,programs:null,autoReset:!0,reset:r,update:i}}function nE(t,e,n){const i=new WeakMap,r=new st;function s(a,o,l){const c=a.morphTargetInfluences,d=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,p=d!==void 0?d.length:0;let h=i.get(o);if(h===void 0||h.count!==p){let y=function(){N.dispose(),i.delete(o),o.removeEventListener("dispose",y)};var g=y;h!==void 0&&h.texture.dispose();const v=o.morphAttributes.position!==void 0,S=o.morphAttributes.normal!==void 0,m=o.morphAttributes.color!==void 0,u=o.morphAttributes.position||[],_=o.morphAttributes.normal||[],x=o.morphAttributes.color||[];let w=0;v===!0&&(w=1),S===!0&&(w=2),m===!0&&(w=3);let P=o.attributes.position.count*w,b=1;P>e.maxTextureSize&&(b=Math.ceil(P/e.maxTextureSize),P=e.maxTextureSize);const A=new Float32Array(P*b*4*p),N=new sx(A,P,b,p);N.type=li,N.needsUpdate=!0;const V=w*4;for(let T=0;T<p;T++){const j=u[T],H=_[T],q=x[T],Q=P*b*4*T;for(let G=0;G<j.count;G++){const Y=G*V;v===!0&&(r.fromBufferAttribute(j,G),A[Q+Y+0]=r.x,A[Q+Y+1]=r.y,A[Q+Y+2]=r.z,A[Q+Y+3]=0),S===!0&&(r.fromBufferAttribute(H,G),A[Q+Y+4]=r.x,A[Q+Y+5]=r.y,A[Q+Y+6]=r.z,A[Q+Y+7]=0),m===!0&&(r.fromBufferAttribute(q,G),A[Q+Y+8]=r.x,A[Q+Y+9]=r.y,A[Q+Y+10]=r.z,A[Q+Y+11]=q.itemSize===4?r.w:1)}}h={count:p,texture:N,size:new Ke(P,b)},i.set(o,h),o.addEventListener("dispose",y)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(t,"morphTexture",a.morphTexture,n);else{let v=0;for(let m=0;m<c.length;m++)v+=c[m];const S=o.morphTargetsRelative?1:1-v;l.getUniforms().setValue(t,"morphTargetBaseInfluence",S),l.getUniforms().setValue(t,"morphTargetInfluences",c)}l.getUniforms().setValue(t,"morphTargetsTexture",h.texture,n),l.getUniforms().setValue(t,"morphTargetsTextureSize",h.size)}return{update:s}}function iE(t,e,n,i){let r=new WeakMap;function s(l){const c=i.render.frame,d=l.geometry,p=e.get(l,d);if(r.get(p)!==c&&(e.update(p),r.set(p,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",o)===!1&&l.addEventListener("dispose",o),r.get(l)!==c&&(n.update(l.instanceMatrix,t.ARRAY_BUFFER),l.instanceColor!==null&&n.update(l.instanceColor,t.ARRAY_BUFFER),r.set(l,c))),l.isSkinnedMesh){const h=l.skeleton;r.get(h)!==c&&(h.update(),r.set(h,c))}return p}function a(){r=new WeakMap}function o(l){const c=l.target;c.removeEventListener("dispose",o),n.remove(c.instanceMatrix),c.instanceColor!==null&&n.remove(c.instanceColor)}return{update:s,dispose:a}}class px extends Gt{constructor(e,n,i,r,s,a,o,l,c,d=us){if(d!==us&&d!==Es)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");i===void 0&&d===us&&(i=Er),i===void 0&&d===Es&&(i=ws),super(null,r,s,a,o,l,d,i,c),this.isDepthTexture=!0,this.image={width:e,height:n},this.magFilter=o!==void 0?o:wn,this.minFilter=l!==void 0?l:wn,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const n=super.toJSON(e);return this.compareFunction!==null&&(n.compareFunction=this.compareFunction),n}}const mx=new Gt,Xp=new px(1,1),gx=new sx,xx=new VS,vx=new fx,qp=[],Yp=[],$p=new Float32Array(16),Kp=new Float32Array(9),Zp=new Float32Array(4);function Ps(t,e,n){const i=t[0];if(i<=0||i>0)return t;const r=e*n;let s=qp[r];if(s===void 0&&(s=new Float32Array(r),qp[r]=s),e!==0){i.toArray(s,0);for(let a=1,o=0;a!==e;++a)o+=n,t[a].toArray(s,o)}return s}function bt(t,e){if(t.length!==e.length)return!1;for(let n=0,i=t.length;n<i;n++)if(t[n]!==e[n])return!1;return!0}function At(t,e){for(let n=0,i=e.length;n<i;n++)t[n]=e[n]}function Gl(t,e){let n=Yp[e];n===void 0&&(n=new Int32Array(e),Yp[e]=n);for(let i=0;i!==e;++i)n[i]=t.allocateTextureUnit();return n}function rE(t,e){const n=this.cache;n[0]!==e&&(t.uniform1f(this.addr,e),n[0]=e)}function sE(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(t.uniform2f(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(bt(n,e))return;t.uniform2fv(this.addr,e),At(n,e)}}function aE(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(t.uniform3f(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else if(e.r!==void 0)(n[0]!==e.r||n[1]!==e.g||n[2]!==e.b)&&(t.uniform3f(this.addr,e.r,e.g,e.b),n[0]=e.r,n[1]=e.g,n[2]=e.b);else{if(bt(n,e))return;t.uniform3fv(this.addr,e),At(n,e)}}function oE(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(t.uniform4f(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(bt(n,e))return;t.uniform4fv(this.addr,e),At(n,e)}}function lE(t,e){const n=this.cache,i=e.elements;if(i===void 0){if(bt(n,e))return;t.uniformMatrix2fv(this.addr,!1,e),At(n,e)}else{if(bt(n,i))return;Zp.set(i),t.uniformMatrix2fv(this.addr,!1,Zp),At(n,i)}}function cE(t,e){const n=this.cache,i=e.elements;if(i===void 0){if(bt(n,e))return;t.uniformMatrix3fv(this.addr,!1,e),At(n,e)}else{if(bt(n,i))return;Kp.set(i),t.uniformMatrix3fv(this.addr,!1,Kp),At(n,i)}}function uE(t,e){const n=this.cache,i=e.elements;if(i===void 0){if(bt(n,e))return;t.uniformMatrix4fv(this.addr,!1,e),At(n,e)}else{if(bt(n,i))return;$p.set(i),t.uniformMatrix4fv(this.addr,!1,$p),At(n,i)}}function dE(t,e){const n=this.cache;n[0]!==e&&(t.uniform1i(this.addr,e),n[0]=e)}function fE(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(t.uniform2i(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(bt(n,e))return;t.uniform2iv(this.addr,e),At(n,e)}}function hE(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(t.uniform3i(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else{if(bt(n,e))return;t.uniform3iv(this.addr,e),At(n,e)}}function pE(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(t.uniform4i(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(bt(n,e))return;t.uniform4iv(this.addr,e),At(n,e)}}function mE(t,e){const n=this.cache;n[0]!==e&&(t.uniform1ui(this.addr,e),n[0]=e)}function gE(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(t.uniform2ui(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(bt(n,e))return;t.uniform2uiv(this.addr,e),At(n,e)}}function xE(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(t.uniform3ui(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else{if(bt(n,e))return;t.uniform3uiv(this.addr,e),At(n,e)}}function vE(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(t.uniform4ui(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(bt(n,e))return;t.uniform4uiv(this.addr,e),At(n,e)}}function _E(t,e,n){const i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(t.uniform1i(this.addr,r),i[0]=r);let s;this.type===t.SAMPLER_2D_SHADOW?(Xp.compareFunction=nx,s=Xp):s=mx,n.setTexture2D(e||s,r)}function yE(t,e,n){const i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(t.uniform1i(this.addr,r),i[0]=r),n.setTexture3D(e||xx,r)}function SE(t,e,n){const i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(t.uniform1i(this.addr,r),i[0]=r),n.setTextureCube(e||vx,r)}function ME(t,e,n){const i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(t.uniform1i(this.addr,r),i[0]=r),n.setTexture2DArray(e||gx,r)}function wE(t){switch(t){case 5126:return rE;case 35664:return sE;case 35665:return aE;case 35666:return oE;case 35674:return lE;case 35675:return cE;case 35676:return uE;case 5124:case 35670:return dE;case 35667:case 35671:return fE;case 35668:case 35672:return hE;case 35669:case 35673:return pE;case 5125:return mE;case 36294:return gE;case 36295:return xE;case 36296:return vE;case 35678:case 36198:case 36298:case 36306:case 35682:return _E;case 35679:case 36299:case 36307:return yE;case 35680:case 36300:case 36308:case 36293:return SE;case 36289:case 36303:case 36311:case 36292:return ME}}function EE(t,e){t.uniform1fv(this.addr,e)}function TE(t,e){const n=Ps(e,this.size,2);t.uniform2fv(this.addr,n)}function bE(t,e){const n=Ps(e,this.size,3);t.uniform3fv(this.addr,n)}function AE(t,e){const n=Ps(e,this.size,4);t.uniform4fv(this.addr,n)}function CE(t,e){const n=Ps(e,this.size,4);t.uniformMatrix2fv(this.addr,!1,n)}function RE(t,e){const n=Ps(e,this.size,9);t.uniformMatrix3fv(this.addr,!1,n)}function NE(t,e){const n=Ps(e,this.size,16);t.uniformMatrix4fv(this.addr,!1,n)}function PE(t,e){t.uniform1iv(this.addr,e)}function LE(t,e){t.uniform2iv(this.addr,e)}function DE(t,e){t.uniform3iv(this.addr,e)}function IE(t,e){t.uniform4iv(this.addr,e)}function UE(t,e){t.uniform1uiv(this.addr,e)}function kE(t,e){t.uniform2uiv(this.addr,e)}function FE(t,e){t.uniform3uiv(this.addr,e)}function OE(t,e){t.uniform4uiv(this.addr,e)}function zE(t,e,n){const i=this.cache,r=e.length,s=Gl(n,r);bt(i,s)||(t.uniform1iv(this.addr,s),At(i,s));for(let a=0;a!==r;++a)n.setTexture2D(e[a]||mx,s[a])}function BE(t,e,n){const i=this.cache,r=e.length,s=Gl(n,r);bt(i,s)||(t.uniform1iv(this.addr,s),At(i,s));for(let a=0;a!==r;++a)n.setTexture3D(e[a]||xx,s[a])}function HE(t,e,n){const i=this.cache,r=e.length,s=Gl(n,r);bt(i,s)||(t.uniform1iv(this.addr,s),At(i,s));for(let a=0;a!==r;++a)n.setTextureCube(e[a]||vx,s[a])}function VE(t,e,n){const i=this.cache,r=e.length,s=Gl(n,r);bt(i,s)||(t.uniform1iv(this.addr,s),At(i,s));for(let a=0;a!==r;++a)n.setTexture2DArray(e[a]||gx,s[a])}function jE(t){switch(t){case 5126:return EE;case 35664:return TE;case 35665:return bE;case 35666:return AE;case 35674:return CE;case 35675:return RE;case 35676:return NE;case 5124:case 35670:return PE;case 35667:case 35671:return LE;case 35668:case 35672:return DE;case 35669:case 35673:return IE;case 5125:return UE;case 36294:return kE;case 36295:return FE;case 36296:return OE;case 35678:case 36198:case 36298:case 36306:case 35682:return zE;case 35679:case 36299:case 36307:return BE;case 35680:case 36300:case 36308:case 36293:return HE;case 36289:case 36303:case 36311:case 36292:return VE}}class GE{constructor(e,n,i){this.id=e,this.addr=i,this.cache=[],this.type=n.type,this.setValue=wE(n.type)}}class WE{constructor(e,n,i){this.id=e,this.addr=i,this.cache=[],this.type=n.type,this.size=n.size,this.setValue=jE(n.type)}}class XE{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,n,i){const r=this.seq;for(let s=0,a=r.length;s!==a;++s){const o=r[s];o.setValue(e,n[o.id],i)}}}const Kc=/(\w+)(\])?(\[|\.)?/g;function Qp(t,e){t.seq.push(e),t.map[e.id]=e}function qE(t,e,n){const i=t.name,r=i.length;for(Kc.lastIndex=0;;){const s=Kc.exec(i),a=Kc.lastIndex;let o=s[1];const l=s[2]==="]",c=s[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===r){Qp(n,c===void 0?new GE(o,t,e):new WE(o,t,e));break}else{let p=n.map[o];p===void 0&&(p=new XE(o),Qp(n,p)),n=p}}}class Yo{constructor(e,n){this.seq=[],this.map={};const i=e.getProgramParameter(n,e.ACTIVE_UNIFORMS);for(let r=0;r<i;++r){const s=e.getActiveUniform(n,r),a=e.getUniformLocation(n,s.name);qE(s,a,this)}}setValue(e,n,i,r){const s=this.map[n];s!==void 0&&s.setValue(e,i,r)}setOptional(e,n,i){const r=n[i];r!==void 0&&this.setValue(e,i,r)}static upload(e,n,i,r){for(let s=0,a=n.length;s!==a;++s){const o=n[s],l=i[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,r)}}static seqWithValue(e,n){const i=[];for(let r=0,s=e.length;r!==s;++r){const a=e[r];a.id in n&&i.push(a)}return i}}function Jp(t,e,n){const i=t.createShader(e);return t.shaderSource(i,n),t.compileShader(i),i}const YE=37297;let $E=0;function KE(t,e){const n=t.split(`
`),i=[],r=Math.max(e-6,0),s=Math.min(e+6,n.length);for(let a=r;a<s;a++){const o=a+1;i.push(`${o===e?">":" "} ${o}: ${n[a]}`)}return i.join(`
`)}function ZE(t){const e=tt.getPrimaries(tt.workingColorSpace),n=tt.getPrimaries(t);let i;switch(e===n?i="":e===Ml&&n===Sl?i="LinearDisplayP3ToLinearSRGB":e===Sl&&n===Ml&&(i="LinearSRGBToLinearDisplayP3"),t){case Zi:case Vl:return[i,"LinearTransferOETF"];case jn:case jf:return[i,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",t),[i,"LinearTransferOETF"]}}function em(t,e,n){const i=t.getShaderParameter(e,t.COMPILE_STATUS),r=t.getShaderInfoLog(e).trim();if(i&&r==="")return"";const s=/ERROR: 0:(\d+)/.exec(r);if(s){const a=parseInt(s[1]);return n.toUpperCase()+`

`+r+`

`+KE(t.getShaderSource(e),a)}else return r}function QE(t,e){const n=ZE(e);return`vec4 ${t}( vec4 value ) { return ${n[0]}( ${n[1]}( value ) ); }`}function JE(t,e){let n;switch(e){case pS:n="Linear";break;case mS:n="Reinhard";break;case gS:n="Cineon";break;case xS:n="ACESFilmic";break;case _S:n="AgX";break;case yS:n="Neutral";break;case vS:n="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),n="Linear"}return"vec3 "+t+"( vec3 color ) { return "+n+"ToneMapping( color ); }"}const Ao=new F;function eT(){tt.getLuminanceCoefficients(Ao);const t=Ao.x.toFixed(4),e=Ao.y.toFixed(4),n=Ao.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${t}, ${e}, ${n} );`,"	return dot( weights, rgb );","}"].join(`
`)}function tT(t){return[t.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",t.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Zs).join(`
`)}function nT(t){const e=[];for(const n in t){const i=t[n];i!==!1&&e.push("#define "+n+" "+i)}return e.join(`
`)}function iT(t,e){const n={},i=t.getProgramParameter(e,t.ACTIVE_ATTRIBUTES);for(let r=0;r<i;r++){const s=t.getActiveAttrib(e,r),a=s.name;let o=1;s.type===t.FLOAT_MAT2&&(o=2),s.type===t.FLOAT_MAT3&&(o=3),s.type===t.FLOAT_MAT4&&(o=4),n[a]={type:s.type,location:t.getAttribLocation(e,a),locationSize:o}}return n}function Zs(t){return t!==""}function tm(t,e){const n=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return t.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function nm(t,e){return t.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const rT=/^[ \t]*#include +<([\w\d./]+)>/gm;function kd(t){return t.replace(rT,aT)}const sT=new Map;function aT(t,e){let n=ze[e];if(n===void 0){const i=sT.get(e);if(i!==void 0)n=ze[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return kd(n)}const oT=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function im(t){return t.replace(oT,lT)}function lT(t,e,n,i){let r="";for(let s=parseInt(e);s<parseInt(n);s++)r+=i.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function rm(t){let e=`precision ${t.precision} float;
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
#define LOW_PRECISION`),e}function cT(t){let e="SHADOWMAP_TYPE_BASIC";return t.shadowMapType===Vg?e="SHADOWMAP_TYPE_PCF":t.shadowMapType===qy?e="SHADOWMAP_TYPE_PCF_SOFT":t.shadowMapType===ii&&(e="SHADOWMAP_TYPE_VSM"),e}function uT(t){let e="ENVMAP_TYPE_CUBE";if(t.envMap)switch(t.envMapMode){case Ss:case Ms:e="ENVMAP_TYPE_CUBE";break;case Hl:e="ENVMAP_TYPE_CUBE_UV";break}return e}function dT(t){let e="ENVMAP_MODE_REFLECTION";if(t.envMap)switch(t.envMapMode){case Ms:e="ENVMAP_MODE_REFRACTION";break}return e}function fT(t){let e="ENVMAP_BLENDING_NONE";if(t.envMap)switch(t.combine){case jg:e="ENVMAP_BLENDING_MULTIPLY";break;case fS:e="ENVMAP_BLENDING_MIX";break;case hS:e="ENVMAP_BLENDING_ADD";break}return e}function hT(t){const e=t.envMapCubeUVHeight;if(e===null)return null;const n=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,n),7*16)),texelHeight:i,maxMip:n}}function pT(t,e,n,i){const r=t.getContext(),s=n.defines;let a=n.vertexShader,o=n.fragmentShader;const l=cT(n),c=uT(n),d=dT(n),p=fT(n),h=hT(n),g=tT(n),v=nT(s),S=r.createProgram();let m,u,_=n.glslVersion?"#version "+n.glslVersion+`
`:"";n.isRawShaderMaterial?(m=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,v].filter(Zs).join(`
`),m.length>0&&(m+=`
`),u=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,v].filter(Zs).join(`
`),u.length>0&&(u+=`
`)):(m=[rm(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,v,n.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",n.batching?"#define USE_BATCHING":"",n.batchingColor?"#define USE_BATCHING_COLOR":"",n.instancing?"#define USE_INSTANCING":"",n.instancingColor?"#define USE_INSTANCING_COLOR":"",n.instancingMorph?"#define USE_INSTANCING_MORPH":"",n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.map?"#define USE_MAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+d:"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.displacementMap?"#define USE_DISPLACEMENTMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.mapUv?"#define MAP_UV "+n.mapUv:"",n.alphaMapUv?"#define ALPHAMAP_UV "+n.alphaMapUv:"",n.lightMapUv?"#define LIGHTMAP_UV "+n.lightMapUv:"",n.aoMapUv?"#define AOMAP_UV "+n.aoMapUv:"",n.emissiveMapUv?"#define EMISSIVEMAP_UV "+n.emissiveMapUv:"",n.bumpMapUv?"#define BUMPMAP_UV "+n.bumpMapUv:"",n.normalMapUv?"#define NORMALMAP_UV "+n.normalMapUv:"",n.displacementMapUv?"#define DISPLACEMENTMAP_UV "+n.displacementMapUv:"",n.metalnessMapUv?"#define METALNESSMAP_UV "+n.metalnessMapUv:"",n.roughnessMapUv?"#define ROUGHNESSMAP_UV "+n.roughnessMapUv:"",n.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+n.anisotropyMapUv:"",n.clearcoatMapUv?"#define CLEARCOATMAP_UV "+n.clearcoatMapUv:"",n.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+n.clearcoatNormalMapUv:"",n.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+n.clearcoatRoughnessMapUv:"",n.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+n.iridescenceMapUv:"",n.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+n.iridescenceThicknessMapUv:"",n.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+n.sheenColorMapUv:"",n.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+n.sheenRoughnessMapUv:"",n.specularMapUv?"#define SPECULARMAP_UV "+n.specularMapUv:"",n.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+n.specularColorMapUv:"",n.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+n.specularIntensityMapUv:"",n.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+n.transmissionMapUv:"",n.thicknessMapUv?"#define THICKNESSMAP_UV "+n.thicknessMapUv:"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.flatShading?"#define FLAT_SHADED":"",n.skinning?"#define USE_SKINNING":"",n.morphTargets?"#define USE_MORPHTARGETS":"",n.morphNormals&&n.flatShading===!1?"#define USE_MORPHNORMALS":"",n.morphColors?"#define USE_MORPHCOLORS":"",n.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+n.morphTextureStride:"",n.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+n.morphTargetsCount:"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+l:"",n.sizeAttenuation?"#define USE_SIZEATTENUATION":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",n.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Zs).join(`
`),u=[rm(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,v,n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",n.map?"#define USE_MAP":"",n.matcap?"#define USE_MATCAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+c:"",n.envMap?"#define "+d:"",n.envMap?"#define "+p:"",h?"#define CUBEUV_TEXEL_WIDTH "+h.texelWidth:"",h?"#define CUBEUV_TEXEL_HEIGHT "+h.texelHeight:"",h?"#define CUBEUV_MAX_MIP "+h.maxMip+".0":"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoat?"#define USE_CLEARCOAT":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.dispersion?"#define USE_DISPERSION":"",n.iridescence?"#define USE_IRIDESCENCE":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaTest?"#define USE_ALPHATEST":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.sheen?"#define USE_SHEEN":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors||n.instancingColor||n.batchingColor?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.gradientMap?"#define USE_GRADIENTMAP":"",n.flatShading?"#define FLAT_SHADED":"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+l:"",n.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",n.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",n.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",n.toneMapping!==ji?"#define TONE_MAPPING":"",n.toneMapping!==ji?ze.tonemapping_pars_fragment:"",n.toneMapping!==ji?JE("toneMapping",n.toneMapping):"",n.dithering?"#define DITHERING":"",n.opaque?"#define OPAQUE":"",ze.colorspace_pars_fragment,QE("linearToOutputTexel",n.outputColorSpace),eT(),n.useDepthPacking?"#define DEPTH_PACKING "+n.depthPacking:"",`
`].filter(Zs).join(`
`)),a=kd(a),a=tm(a,n),a=nm(a,n),o=kd(o),o=tm(o,n),o=nm(o,n),a=im(a),o=im(o),n.isRawShaderMaterial!==!0&&(_=`#version 300 es
`,m=[g,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,u=["#define varying in",n.glslVersion===Sp?"":"layout(location = 0) out highp vec4 pc_fragColor;",n.glslVersion===Sp?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+u);const x=_+m+a,w=_+u+o,P=Jp(r,r.VERTEX_SHADER,x),b=Jp(r,r.FRAGMENT_SHADER,w);r.attachShader(S,P),r.attachShader(S,b),n.index0AttributeName!==void 0?r.bindAttribLocation(S,0,n.index0AttributeName):n.morphTargets===!0&&r.bindAttribLocation(S,0,"position"),r.linkProgram(S);function A(T){if(t.debug.checkShaderErrors){const j=r.getProgramInfoLog(S).trim(),H=r.getShaderInfoLog(P).trim(),q=r.getShaderInfoLog(b).trim();let Q=!0,G=!0;if(r.getProgramParameter(S,r.LINK_STATUS)===!1)if(Q=!1,typeof t.debug.onShaderError=="function")t.debug.onShaderError(r,S,P,b);else{const Y=em(r,P,"vertex"),L=em(r,b,"fragment");console.error("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(S,r.VALIDATE_STATUS)+`

Material Name: `+T.name+`
Material Type: `+T.type+`

Program Info Log: `+j+`
`+Y+`
`+L)}else j!==""?console.warn("THREE.WebGLProgram: Program Info Log:",j):(H===""||q==="")&&(G=!1);G&&(T.diagnostics={runnable:Q,programLog:j,vertexShader:{log:H,prefix:m},fragmentShader:{log:q,prefix:u}})}r.deleteShader(P),r.deleteShader(b),N=new Yo(r,S),V=iT(r,S)}let N;this.getUniforms=function(){return N===void 0&&A(this),N};let V;this.getAttributes=function(){return V===void 0&&A(this),V};let y=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return y===!1&&(y=r.getProgramParameter(S,YE)),y},this.destroy=function(){i.releaseStatesOfProgram(this),r.deleteProgram(S),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=$E++,this.cacheKey=e,this.usedTimes=1,this.program=S,this.vertexShader=P,this.fragmentShader=b,this}let mT=0;class gT{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const n=e.vertexShader,i=e.fragmentShader,r=this._getShaderStage(n),s=this._getShaderStage(i),a=this._getShaderCacheForMaterial(e);return a.has(r)===!1&&(a.add(r),r.usedTimes++),a.has(s)===!1&&(a.add(s),s.usedTimes++),this}remove(e){const n=this.materialCache.get(e);for(const i of n)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const n=this.materialCache;let i=n.get(e);return i===void 0&&(i=new Set,n.set(e,i)),i}_getShaderStage(e){const n=this.shaderCache;let i=n.get(e);return i===void 0&&(i=new xT(e),n.set(e,i)),i}}class xT{constructor(e){this.id=mT++,this.code=e,this.usedTimes=0}}function vT(t,e,n,i,r,s,a){const o=new Wf,l=new gT,c=new Set,d=[],p=r.logarithmicDepthBuffer,h=r.reverseDepthBuffer,g=r.vertexTextures;let v=r.precision;const S={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function m(y){return c.add(y),y===0?"uv":`uv${y}`}function u(y,T,j,H,q){const Q=H.fog,G=q.geometry,Y=y.isMeshStandardMaterial?H.environment:null,L=(y.isMeshStandardMaterial?n:e).get(y.envMap||Y),K=L&&L.mapping===Hl?L.image.height:null,U=S[y.type];y.precision!==null&&(v=r.getMaxPrecision(y.precision),v!==y.precision&&console.warn("THREE.WebGLProgram.getParameters:",y.precision,"not supported, using",v,"instead."));const $=G.morphAttributes.position||G.morphAttributes.normal||G.morphAttributes.color,ge=$!==void 0?$.length:0;let be=0;G.morphAttributes.position!==void 0&&(be=1),G.morphAttributes.normal!==void 0&&(be=2),G.morphAttributes.color!==void 0&&(be=3);let X,te,le,ce;if(U){const $t=Gn[U];X=$t.vertexShader,te=$t.fragmentShader}else X=y.vertexShader,te=y.fragmentShader,l.update(y),le=l.getVertexShaderID(y),ce=l.getFragmentShaderID(y);const Le=t.getRenderTarget(),Ce=q.isInstancedMesh===!0,Ve=q.isBatchedMesh===!0,Qe=!!y.map,je=!!y.matcap,R=!!L,Ye=!!y.aoMap,Ue=!!y.lightMap,Oe=!!y.bumpMap,Ae=!!y.normalMap,rt=!!y.displacementMap,Ne=!!y.emissiveMap,C=!!y.metalnessMap,M=!!y.roughnessMap,O=y.anisotropy>0,J=y.clearcoat>0,ne=y.dispersion>0,Z=y.iridescence>0,we=y.sheen>0,ue=y.transmission>0,xe=O&&!!y.anisotropyMap,$e=J&&!!y.clearcoatMap,re=J&&!!y.clearcoatNormalMap,ve=J&&!!y.clearcoatRoughnessMap,De=Z&&!!y.iridescenceMap,Ie=Z&&!!y.iridescenceThicknessMap,_e=we&&!!y.sheenColorMap,Ge=we&&!!y.sheenRoughnessMap,Fe=!!y.specularMap,at=!!y.specularColorMap,D=!!y.specularIntensityMap,he=ue&&!!y.transmissionMap,W=ue&&!!y.thicknessMap,ee=!!y.gradientMap,de=!!y.alphaMap,pe=y.alphaTest>0,We=!!y.alphaHash,St=!!y.extensions;let Yt=ji;y.toneMapped&&(Le===null||Le.isXRRenderTarget===!0)&&(Yt=t.toneMapping);const Ze={shaderID:U,shaderType:y.type,shaderName:y.name,vertexShader:X,fragmentShader:te,defines:y.defines,customVertexShaderID:le,customFragmentShaderID:ce,isRawShaderMaterial:y.isRawShaderMaterial===!0,glslVersion:y.glslVersion,precision:v,batching:Ve,batchingColor:Ve&&q._colorsTexture!==null,instancing:Ce,instancingColor:Ce&&q.instanceColor!==null,instancingMorph:Ce&&q.morphTexture!==null,supportsVertexTextures:g,outputColorSpace:Le===null?t.outputColorSpace:Le.isXRRenderTarget===!0?Le.texture.colorSpace:Zi,alphaToCoverage:!!y.alphaToCoverage,map:Qe,matcap:je,envMap:R,envMapMode:R&&L.mapping,envMapCubeUVHeight:K,aoMap:Ye,lightMap:Ue,bumpMap:Oe,normalMap:Ae,displacementMap:g&&rt,emissiveMap:Ne,normalMapObjectSpace:Ae&&y.normalMapType===ES,normalMapTangentSpace:Ae&&y.normalMapType===tx,metalnessMap:C,roughnessMap:M,anisotropy:O,anisotropyMap:xe,clearcoat:J,clearcoatMap:$e,clearcoatNormalMap:re,clearcoatRoughnessMap:ve,dispersion:ne,iridescence:Z,iridescenceMap:De,iridescenceThicknessMap:Ie,sheen:we,sheenColorMap:_e,sheenRoughnessMap:Ge,specularMap:Fe,specularColorMap:at,specularIntensityMap:D,transmission:ue,transmissionMap:he,thicknessMap:W,gradientMap:ee,opaque:y.transparent===!1&&y.blending===cs&&y.alphaToCoverage===!1,alphaMap:de,alphaTest:pe,alphaHash:We,combine:y.combine,mapUv:Qe&&m(y.map.channel),aoMapUv:Ye&&m(y.aoMap.channel),lightMapUv:Ue&&m(y.lightMap.channel),bumpMapUv:Oe&&m(y.bumpMap.channel),normalMapUv:Ae&&m(y.normalMap.channel),displacementMapUv:rt&&m(y.displacementMap.channel),emissiveMapUv:Ne&&m(y.emissiveMap.channel),metalnessMapUv:C&&m(y.metalnessMap.channel),roughnessMapUv:M&&m(y.roughnessMap.channel),anisotropyMapUv:xe&&m(y.anisotropyMap.channel),clearcoatMapUv:$e&&m(y.clearcoatMap.channel),clearcoatNormalMapUv:re&&m(y.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ve&&m(y.clearcoatRoughnessMap.channel),iridescenceMapUv:De&&m(y.iridescenceMap.channel),iridescenceThicknessMapUv:Ie&&m(y.iridescenceThicknessMap.channel),sheenColorMapUv:_e&&m(y.sheenColorMap.channel),sheenRoughnessMapUv:Ge&&m(y.sheenRoughnessMap.channel),specularMapUv:Fe&&m(y.specularMap.channel),specularColorMapUv:at&&m(y.specularColorMap.channel),specularIntensityMapUv:D&&m(y.specularIntensityMap.channel),transmissionMapUv:he&&m(y.transmissionMap.channel),thicknessMapUv:W&&m(y.thicknessMap.channel),alphaMapUv:de&&m(y.alphaMap.channel),vertexTangents:!!G.attributes.tangent&&(Ae||O),vertexColors:y.vertexColors,vertexAlphas:y.vertexColors===!0&&!!G.attributes.color&&G.attributes.color.itemSize===4,pointsUvs:q.isPoints===!0&&!!G.attributes.uv&&(Qe||de),fog:!!Q,useFog:y.fog===!0,fogExp2:!!Q&&Q.isFogExp2,flatShading:y.flatShading===!0,sizeAttenuation:y.sizeAttenuation===!0,logarithmicDepthBuffer:p,reverseDepthBuffer:h,skinning:q.isSkinnedMesh===!0,morphTargets:G.morphAttributes.position!==void 0,morphNormals:G.morphAttributes.normal!==void 0,morphColors:G.morphAttributes.color!==void 0,morphTargetsCount:ge,morphTextureStride:be,numDirLights:T.directional.length,numPointLights:T.point.length,numSpotLights:T.spot.length,numSpotLightMaps:T.spotLightMap.length,numRectAreaLights:T.rectArea.length,numHemiLights:T.hemi.length,numDirLightShadows:T.directionalShadowMap.length,numPointLightShadows:T.pointShadowMap.length,numSpotLightShadows:T.spotShadowMap.length,numSpotLightShadowsWithMaps:T.numSpotLightShadowsWithMaps,numLightProbes:T.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:y.dithering,shadowMapEnabled:t.shadowMap.enabled&&j.length>0,shadowMapType:t.shadowMap.type,toneMapping:Yt,decodeVideoTexture:Qe&&y.map.isVideoTexture===!0&&tt.getTransfer(y.map.colorSpace)===ut,premultipliedAlpha:y.premultipliedAlpha,doubleSided:y.side===Xn,flipSided:y.side===rn,useDepthPacking:y.depthPacking>=0,depthPacking:y.depthPacking||0,index0AttributeName:y.index0AttributeName,extensionClipCullDistance:St&&y.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(St&&y.extensions.multiDraw===!0||Ve)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:y.customProgramCacheKey()};return Ze.vertexUv1s=c.has(1),Ze.vertexUv2s=c.has(2),Ze.vertexUv3s=c.has(3),c.clear(),Ze}function _(y){const T=[];if(y.shaderID?T.push(y.shaderID):(T.push(y.customVertexShaderID),T.push(y.customFragmentShaderID)),y.defines!==void 0)for(const j in y.defines)T.push(j),T.push(y.defines[j]);return y.isRawShaderMaterial===!1&&(x(T,y),w(T,y),T.push(t.outputColorSpace)),T.push(y.customProgramCacheKey),T.join()}function x(y,T){y.push(T.precision),y.push(T.outputColorSpace),y.push(T.envMapMode),y.push(T.envMapCubeUVHeight),y.push(T.mapUv),y.push(T.alphaMapUv),y.push(T.lightMapUv),y.push(T.aoMapUv),y.push(T.bumpMapUv),y.push(T.normalMapUv),y.push(T.displacementMapUv),y.push(T.emissiveMapUv),y.push(T.metalnessMapUv),y.push(T.roughnessMapUv),y.push(T.anisotropyMapUv),y.push(T.clearcoatMapUv),y.push(T.clearcoatNormalMapUv),y.push(T.clearcoatRoughnessMapUv),y.push(T.iridescenceMapUv),y.push(T.iridescenceThicknessMapUv),y.push(T.sheenColorMapUv),y.push(T.sheenRoughnessMapUv),y.push(T.specularMapUv),y.push(T.specularColorMapUv),y.push(T.specularIntensityMapUv),y.push(T.transmissionMapUv),y.push(T.thicknessMapUv),y.push(T.combine),y.push(T.fogExp2),y.push(T.sizeAttenuation),y.push(T.morphTargetsCount),y.push(T.morphAttributeCount),y.push(T.numDirLights),y.push(T.numPointLights),y.push(T.numSpotLights),y.push(T.numSpotLightMaps),y.push(T.numHemiLights),y.push(T.numRectAreaLights),y.push(T.numDirLightShadows),y.push(T.numPointLightShadows),y.push(T.numSpotLightShadows),y.push(T.numSpotLightShadowsWithMaps),y.push(T.numLightProbes),y.push(T.shadowMapType),y.push(T.toneMapping),y.push(T.numClippingPlanes),y.push(T.numClipIntersection),y.push(T.depthPacking)}function w(y,T){o.disableAll(),T.supportsVertexTextures&&o.enable(0),T.instancing&&o.enable(1),T.instancingColor&&o.enable(2),T.instancingMorph&&o.enable(3),T.matcap&&o.enable(4),T.envMap&&o.enable(5),T.normalMapObjectSpace&&o.enable(6),T.normalMapTangentSpace&&o.enable(7),T.clearcoat&&o.enable(8),T.iridescence&&o.enable(9),T.alphaTest&&o.enable(10),T.vertexColors&&o.enable(11),T.vertexAlphas&&o.enable(12),T.vertexUv1s&&o.enable(13),T.vertexUv2s&&o.enable(14),T.vertexUv3s&&o.enable(15),T.vertexTangents&&o.enable(16),T.anisotropy&&o.enable(17),T.alphaHash&&o.enable(18),T.batching&&o.enable(19),T.dispersion&&o.enable(20),T.batchingColor&&o.enable(21),y.push(o.mask),o.disableAll(),T.fog&&o.enable(0),T.useFog&&o.enable(1),T.flatShading&&o.enable(2),T.logarithmicDepthBuffer&&o.enable(3),T.reverseDepthBuffer&&o.enable(4),T.skinning&&o.enable(5),T.morphTargets&&o.enable(6),T.morphNormals&&o.enable(7),T.morphColors&&o.enable(8),T.premultipliedAlpha&&o.enable(9),T.shadowMapEnabled&&o.enable(10),T.doubleSided&&o.enable(11),T.flipSided&&o.enable(12),T.useDepthPacking&&o.enable(13),T.dithering&&o.enable(14),T.transmission&&o.enable(15),T.sheen&&o.enable(16),T.opaque&&o.enable(17),T.pointsUvs&&o.enable(18),T.decodeVideoTexture&&o.enable(19),T.alphaToCoverage&&o.enable(20),y.push(o.mask)}function P(y){const T=S[y.type];let j;if(T){const H=Gn[T];j=e1.clone(H.uniforms)}else j=y.uniforms;return j}function b(y,T){let j;for(let H=0,q=d.length;H<q;H++){const Q=d[H];if(Q.cacheKey===T){j=Q,++j.usedTimes;break}}return j===void 0&&(j=new pT(t,T,y,s),d.push(j)),j}function A(y){if(--y.usedTimes===0){const T=d.indexOf(y);d[T]=d[d.length-1],d.pop(),y.destroy()}}function N(y){l.remove(y)}function V(){l.dispose()}return{getParameters:u,getProgramCacheKey:_,getUniforms:P,acquireProgram:b,releaseProgram:A,releaseShaderCache:N,programs:d,dispose:V}}function _T(){let t=new WeakMap;function e(a){return t.has(a)}function n(a){let o=t.get(a);return o===void 0&&(o={},t.set(a,o)),o}function i(a){t.delete(a)}function r(a,o,l){t.get(a)[o]=l}function s(){t=new WeakMap}return{has:e,get:n,remove:i,update:r,dispose:s}}function yT(t,e){return t.groupOrder!==e.groupOrder?t.groupOrder-e.groupOrder:t.renderOrder!==e.renderOrder?t.renderOrder-e.renderOrder:t.material.id!==e.material.id?t.material.id-e.material.id:t.z!==e.z?t.z-e.z:t.id-e.id}function sm(t,e){return t.groupOrder!==e.groupOrder?t.groupOrder-e.groupOrder:t.renderOrder!==e.renderOrder?t.renderOrder-e.renderOrder:t.z!==e.z?e.z-t.z:t.id-e.id}function am(){const t=[];let e=0;const n=[],i=[],r=[];function s(){e=0,n.length=0,i.length=0,r.length=0}function a(p,h,g,v,S,m){let u=t[e];return u===void 0?(u={id:p.id,object:p,geometry:h,material:g,groupOrder:v,renderOrder:p.renderOrder,z:S,group:m},t[e]=u):(u.id=p.id,u.object=p,u.geometry=h,u.material=g,u.groupOrder=v,u.renderOrder=p.renderOrder,u.z=S,u.group=m),e++,u}function o(p,h,g,v,S,m){const u=a(p,h,g,v,S,m);g.transmission>0?i.push(u):g.transparent===!0?r.push(u):n.push(u)}function l(p,h,g,v,S,m){const u=a(p,h,g,v,S,m);g.transmission>0?i.unshift(u):g.transparent===!0?r.unshift(u):n.unshift(u)}function c(p,h){n.length>1&&n.sort(p||yT),i.length>1&&i.sort(h||sm),r.length>1&&r.sort(h||sm)}function d(){for(let p=e,h=t.length;p<h;p++){const g=t[p];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:n,transmissive:i,transparent:r,init:s,push:o,unshift:l,finish:d,sort:c}}function ST(){let t=new WeakMap;function e(i,r){const s=t.get(i);let a;return s===void 0?(a=new am,t.set(i,[a])):r>=s.length?(a=new am,s.push(a)):a=s[r],a}function n(){t=new WeakMap}return{get:e,dispose:n}}function MT(){const t={};return{get:function(e){if(t[e.id]!==void 0)return t[e.id];let n;switch(e.type){case"DirectionalLight":n={direction:new F,color:new Xe};break;case"SpotLight":n={position:new F,direction:new F,color:new Xe,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":n={position:new F,color:new Xe,distance:0,decay:0};break;case"HemisphereLight":n={direction:new F,skyColor:new Xe,groundColor:new Xe};break;case"RectAreaLight":n={color:new Xe,position:new F,halfWidth:new F,halfHeight:new F};break}return t[e.id]=n,n}}}function wT(){const t={};return{get:function(e){if(t[e.id]!==void 0)return t[e.id];let n;switch(e.type){case"DirectionalLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ke};break;case"SpotLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ke};break;case"PointLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ke,shadowCameraNear:1,shadowCameraFar:1e3};break}return t[e.id]=n,n}}}let ET=0;function TT(t,e){return(e.castShadow?2:0)-(t.castShadow?2:0)+(e.map?1:0)-(t.map?1:0)}function bT(t){const e=new MT,n=wT(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new F);const r=new F,s=new ft,a=new ft;function o(c){let d=0,p=0,h=0;for(let V=0;V<9;V++)i.probe[V].set(0,0,0);let g=0,v=0,S=0,m=0,u=0,_=0,x=0,w=0,P=0,b=0,A=0;c.sort(TT);for(let V=0,y=c.length;V<y;V++){const T=c[V],j=T.color,H=T.intensity,q=T.distance,Q=T.shadow&&T.shadow.map?T.shadow.map.texture:null;if(T.isAmbientLight)d+=j.r*H,p+=j.g*H,h+=j.b*H;else if(T.isLightProbe){for(let G=0;G<9;G++)i.probe[G].addScaledVector(T.sh.coefficients[G],H);A++}else if(T.isDirectionalLight){const G=e.get(T);if(G.color.copy(T.color).multiplyScalar(T.intensity),T.castShadow){const Y=T.shadow,L=n.get(T);L.shadowIntensity=Y.intensity,L.shadowBias=Y.bias,L.shadowNormalBias=Y.normalBias,L.shadowRadius=Y.radius,L.shadowMapSize=Y.mapSize,i.directionalShadow[g]=L,i.directionalShadowMap[g]=Q,i.directionalShadowMatrix[g]=T.shadow.matrix,_++}i.directional[g]=G,g++}else if(T.isSpotLight){const G=e.get(T);G.position.setFromMatrixPosition(T.matrixWorld),G.color.copy(j).multiplyScalar(H),G.distance=q,G.coneCos=Math.cos(T.angle),G.penumbraCos=Math.cos(T.angle*(1-T.penumbra)),G.decay=T.decay,i.spot[S]=G;const Y=T.shadow;if(T.map&&(i.spotLightMap[P]=T.map,P++,Y.updateMatrices(T),T.castShadow&&b++),i.spotLightMatrix[S]=Y.matrix,T.castShadow){const L=n.get(T);L.shadowIntensity=Y.intensity,L.shadowBias=Y.bias,L.shadowNormalBias=Y.normalBias,L.shadowRadius=Y.radius,L.shadowMapSize=Y.mapSize,i.spotShadow[S]=L,i.spotShadowMap[S]=Q,w++}S++}else if(T.isRectAreaLight){const G=e.get(T);G.color.copy(j).multiplyScalar(H),G.halfWidth.set(T.width*.5,0,0),G.halfHeight.set(0,T.height*.5,0),i.rectArea[m]=G,m++}else if(T.isPointLight){const G=e.get(T);if(G.color.copy(T.color).multiplyScalar(T.intensity),G.distance=T.distance,G.decay=T.decay,T.castShadow){const Y=T.shadow,L=n.get(T);L.shadowIntensity=Y.intensity,L.shadowBias=Y.bias,L.shadowNormalBias=Y.normalBias,L.shadowRadius=Y.radius,L.shadowMapSize=Y.mapSize,L.shadowCameraNear=Y.camera.near,L.shadowCameraFar=Y.camera.far,i.pointShadow[v]=L,i.pointShadowMap[v]=Q,i.pointShadowMatrix[v]=T.shadow.matrix,x++}i.point[v]=G,v++}else if(T.isHemisphereLight){const G=e.get(T);G.skyColor.copy(T.color).multiplyScalar(H),G.groundColor.copy(T.groundColor).multiplyScalar(H),i.hemi[u]=G,u++}}m>0&&(t.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=oe.LTC_FLOAT_1,i.rectAreaLTC2=oe.LTC_FLOAT_2):(i.rectAreaLTC1=oe.LTC_HALF_1,i.rectAreaLTC2=oe.LTC_HALF_2)),i.ambient[0]=d,i.ambient[1]=p,i.ambient[2]=h;const N=i.hash;(N.directionalLength!==g||N.pointLength!==v||N.spotLength!==S||N.rectAreaLength!==m||N.hemiLength!==u||N.numDirectionalShadows!==_||N.numPointShadows!==x||N.numSpotShadows!==w||N.numSpotMaps!==P||N.numLightProbes!==A)&&(i.directional.length=g,i.spot.length=S,i.rectArea.length=m,i.point.length=v,i.hemi.length=u,i.directionalShadow.length=_,i.directionalShadowMap.length=_,i.pointShadow.length=x,i.pointShadowMap.length=x,i.spotShadow.length=w,i.spotShadowMap.length=w,i.directionalShadowMatrix.length=_,i.pointShadowMatrix.length=x,i.spotLightMatrix.length=w+P-b,i.spotLightMap.length=P,i.numSpotLightShadowsWithMaps=b,i.numLightProbes=A,N.directionalLength=g,N.pointLength=v,N.spotLength=S,N.rectAreaLength=m,N.hemiLength=u,N.numDirectionalShadows=_,N.numPointShadows=x,N.numSpotShadows=w,N.numSpotMaps=P,N.numLightProbes=A,i.version=ET++)}function l(c,d){let p=0,h=0,g=0,v=0,S=0;const m=d.matrixWorldInverse;for(let u=0,_=c.length;u<_;u++){const x=c[u];if(x.isDirectionalLight){const w=i.directional[p];w.direction.setFromMatrixPosition(x.matrixWorld),r.setFromMatrixPosition(x.target.matrixWorld),w.direction.sub(r),w.direction.transformDirection(m),p++}else if(x.isSpotLight){const w=i.spot[g];w.position.setFromMatrixPosition(x.matrixWorld),w.position.applyMatrix4(m),w.direction.setFromMatrixPosition(x.matrixWorld),r.setFromMatrixPosition(x.target.matrixWorld),w.direction.sub(r),w.direction.transformDirection(m),g++}else if(x.isRectAreaLight){const w=i.rectArea[v];w.position.setFromMatrixPosition(x.matrixWorld),w.position.applyMatrix4(m),a.identity(),s.copy(x.matrixWorld),s.premultiply(m),a.extractRotation(s),w.halfWidth.set(x.width*.5,0,0),w.halfHeight.set(0,x.height*.5,0),w.halfWidth.applyMatrix4(a),w.halfHeight.applyMatrix4(a),v++}else if(x.isPointLight){const w=i.point[h];w.position.setFromMatrixPosition(x.matrixWorld),w.position.applyMatrix4(m),h++}else if(x.isHemisphereLight){const w=i.hemi[S];w.direction.setFromMatrixPosition(x.matrixWorld),w.direction.transformDirection(m),S++}}}return{setup:o,setupView:l,state:i}}function om(t){const e=new bT(t),n=[],i=[];function r(d){c.camera=d,n.length=0,i.length=0}function s(d){n.push(d)}function a(d){i.push(d)}function o(){e.setup(n)}function l(d){e.setupView(n,d)}const c={lightsArray:n,shadowsArray:i,camera:null,lights:e,transmissionRenderTarget:{}};return{init:r,state:c,setupLights:o,setupLightsView:l,pushLight:s,pushShadow:a}}function AT(t){let e=new WeakMap;function n(r,s=0){const a=e.get(r);let o;return a===void 0?(o=new om(t),e.set(r,[o])):s>=a.length?(o=new om(t),a.push(o)):o=a[s],o}function i(){e=new WeakMap}return{get:n,dispose:i}}class CT extends Ns{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=MS,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class RT extends Ns{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const NT=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,PT=`uniform sampler2D shadow_pass;
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
}`;function LT(t,e,n){let i=new Xf;const r=new Ke,s=new Ke,a=new st,o=new CT({depthPacking:wS}),l=new RT,c={},d=n.maxTextureSize,p={[Xi]:rn,[rn]:Xi,[Xn]:Xn},h=new qi({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Ke},radius:{value:4}},vertexShader:NT,fragmentShader:PT}),g=h.clone();g.defines.HORIZONTAL_PASS=1;const v=new xi;v.setAttribute("position",new Tn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const S=new qn(v,h),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Vg;let u=this.type;this.render=function(b,A,N){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||b.length===0)return;const V=t.getRenderTarget(),y=t.getActiveCubeFace(),T=t.getActiveMipmapLevel(),j=t.state;j.setBlending(Vi),j.buffers.color.setClear(1,1,1,1),j.buffers.depth.setTest(!0),j.setScissorTest(!1);const H=u!==ii&&this.type===ii,q=u===ii&&this.type!==ii;for(let Q=0,G=b.length;Q<G;Q++){const Y=b[Q],L=Y.shadow;if(L===void 0){console.warn("THREE.WebGLShadowMap:",Y,"has no shadow.");continue}if(L.autoUpdate===!1&&L.needsUpdate===!1)continue;r.copy(L.mapSize);const K=L.getFrameExtents();if(r.multiply(K),s.copy(L.mapSize),(r.x>d||r.y>d)&&(r.x>d&&(s.x=Math.floor(d/K.x),r.x=s.x*K.x,L.mapSize.x=s.x),r.y>d&&(s.y=Math.floor(d/K.y),r.y=s.y*K.y,L.mapSize.y=s.y)),L.map===null||H===!0||q===!0){const $=this.type!==ii?{minFilter:wn,magFilter:wn}:{};L.map!==null&&L.map.dispose(),L.map=new Tr(r.x,r.y,$),L.map.texture.name=Y.name+".shadowMap",L.camera.updateProjectionMatrix()}t.setRenderTarget(L.map),t.clear();const U=L.getViewportCount();for(let $=0;$<U;$++){const ge=L.getViewport($);a.set(s.x*ge.x,s.y*ge.y,s.x*ge.z,s.y*ge.w),j.viewport(a),L.updateMatrices(Y,$),i=L.getFrustum(),w(A,N,L.camera,Y,this.type)}L.isPointLightShadow!==!0&&this.type===ii&&_(L,N),L.needsUpdate=!1}u=this.type,m.needsUpdate=!1,t.setRenderTarget(V,y,T)};function _(b,A){const N=e.update(S);h.defines.VSM_SAMPLES!==b.blurSamples&&(h.defines.VSM_SAMPLES=b.blurSamples,g.defines.VSM_SAMPLES=b.blurSamples,h.needsUpdate=!0,g.needsUpdate=!0),b.mapPass===null&&(b.mapPass=new Tr(r.x,r.y)),h.uniforms.shadow_pass.value=b.map.texture,h.uniforms.resolution.value=b.mapSize,h.uniforms.radius.value=b.radius,t.setRenderTarget(b.mapPass),t.clear(),t.renderBufferDirect(A,null,N,h,S,null),g.uniforms.shadow_pass.value=b.mapPass.texture,g.uniforms.resolution.value=b.mapSize,g.uniforms.radius.value=b.radius,t.setRenderTarget(b.map),t.clear(),t.renderBufferDirect(A,null,N,g,S,null)}function x(b,A,N,V){let y=null;const T=N.isPointLight===!0?b.customDistanceMaterial:b.customDepthMaterial;if(T!==void 0)y=T;else if(y=N.isPointLight===!0?l:o,t.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0){const j=y.uuid,H=A.uuid;let q=c[j];q===void 0&&(q={},c[j]=q);let Q=q[H];Q===void 0&&(Q=y.clone(),q[H]=Q,A.addEventListener("dispose",P)),y=Q}if(y.visible=A.visible,y.wireframe=A.wireframe,V===ii?y.side=A.shadowSide!==null?A.shadowSide:A.side:y.side=A.shadowSide!==null?A.shadowSide:p[A.side],y.alphaMap=A.alphaMap,y.alphaTest=A.alphaTest,y.map=A.map,y.clipShadows=A.clipShadows,y.clippingPlanes=A.clippingPlanes,y.clipIntersection=A.clipIntersection,y.displacementMap=A.displacementMap,y.displacementScale=A.displacementScale,y.displacementBias=A.displacementBias,y.wireframeLinewidth=A.wireframeLinewidth,y.linewidth=A.linewidth,N.isPointLight===!0&&y.isMeshDistanceMaterial===!0){const j=t.properties.get(y);j.light=N}return y}function w(b,A,N,V,y){if(b.visible===!1)return;if(b.layers.test(A.layers)&&(b.isMesh||b.isLine||b.isPoints)&&(b.castShadow||b.receiveShadow&&y===ii)&&(!b.frustumCulled||i.intersectsObject(b))){b.modelViewMatrix.multiplyMatrices(N.matrixWorldInverse,b.matrixWorld);const H=e.update(b),q=b.material;if(Array.isArray(q)){const Q=H.groups;for(let G=0,Y=Q.length;G<Y;G++){const L=Q[G],K=q[L.materialIndex];if(K&&K.visible){const U=x(b,K,V,y);b.onBeforeShadow(t,b,A,N,H,U,L),t.renderBufferDirect(N,null,H,U,b,L),b.onAfterShadow(t,b,A,N,H,U,L)}}}else if(q.visible){const Q=x(b,q,V,y);b.onBeforeShadow(t,b,A,N,H,Q,null),t.renderBufferDirect(N,null,H,Q,b,null),b.onAfterShadow(t,b,A,N,H,Q,null)}}const j=b.children;for(let H=0,q=j.length;H<q;H++)w(j[H],A,N,V,y)}function P(b){b.target.removeEventListener("dispose",P);for(const N in c){const V=c[N],y=b.target.uuid;y in V&&(V[y].dispose(),delete V[y])}}}const DT={[Qu]:Ju,[ed]:id,[td]:rd,[ys]:nd,[Ju]:Qu,[id]:ed,[rd]:td,[nd]:ys};function IT(t){function e(){let D=!1;const he=new st;let W=null;const ee=new st(0,0,0,0);return{setMask:function(de){W!==de&&!D&&(t.colorMask(de,de,de,de),W=de)},setLocked:function(de){D=de},setClear:function(de,pe,We,St,Yt){Yt===!0&&(de*=St,pe*=St,We*=St),he.set(de,pe,We,St),ee.equals(he)===!1&&(t.clearColor(de,pe,We,St),ee.copy(he))},reset:function(){D=!1,W=null,ee.set(-1,0,0,0)}}}function n(){let D=!1,he=!1,W=null,ee=null,de=null;return{setReversed:function(pe){he=pe},setTest:function(pe){pe?le(t.DEPTH_TEST):ce(t.DEPTH_TEST)},setMask:function(pe){W!==pe&&!D&&(t.depthMask(pe),W=pe)},setFunc:function(pe){if(he&&(pe=DT[pe]),ee!==pe){switch(pe){case Qu:t.depthFunc(t.NEVER);break;case Ju:t.depthFunc(t.ALWAYS);break;case ed:t.depthFunc(t.LESS);break;case ys:t.depthFunc(t.LEQUAL);break;case td:t.depthFunc(t.EQUAL);break;case nd:t.depthFunc(t.GEQUAL);break;case id:t.depthFunc(t.GREATER);break;case rd:t.depthFunc(t.NOTEQUAL);break;default:t.depthFunc(t.LEQUAL)}ee=pe}},setLocked:function(pe){D=pe},setClear:function(pe){de!==pe&&(t.clearDepth(pe),de=pe)},reset:function(){D=!1,W=null,ee=null,de=null}}}function i(){let D=!1,he=null,W=null,ee=null,de=null,pe=null,We=null,St=null,Yt=null;return{setTest:function(Ze){D||(Ze?le(t.STENCIL_TEST):ce(t.STENCIL_TEST))},setMask:function(Ze){he!==Ze&&!D&&(t.stencilMask(Ze),he=Ze)},setFunc:function(Ze,$t,Zn){(W!==Ze||ee!==$t||de!==Zn)&&(t.stencilFunc(Ze,$t,Zn),W=Ze,ee=$t,de=Zn)},setOp:function(Ze,$t,Zn){(pe!==Ze||We!==$t||St!==Zn)&&(t.stencilOp(Ze,$t,Zn),pe=Ze,We=$t,St=Zn)},setLocked:function(Ze){D=Ze},setClear:function(Ze){Yt!==Ze&&(t.clearStencil(Ze),Yt=Ze)},reset:function(){D=!1,he=null,W=null,ee=null,de=null,pe=null,We=null,St=null,Yt=null}}}const r=new e,s=new n,a=new i,o=new WeakMap,l=new WeakMap;let c={},d={},p=new WeakMap,h=[],g=null,v=!1,S=null,m=null,u=null,_=null,x=null,w=null,P=null,b=new Xe(0,0,0),A=0,N=!1,V=null,y=null,T=null,j=null,H=null;const q=t.getParameter(t.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let Q=!1,G=0;const Y=t.getParameter(t.VERSION);Y.indexOf("WebGL")!==-1?(G=parseFloat(/^WebGL (\d)/.exec(Y)[1]),Q=G>=1):Y.indexOf("OpenGL ES")!==-1&&(G=parseFloat(/^OpenGL ES (\d)/.exec(Y)[1]),Q=G>=2);let L=null,K={};const U=t.getParameter(t.SCISSOR_BOX),$=t.getParameter(t.VIEWPORT),ge=new st().fromArray(U),be=new st().fromArray($);function X(D,he,W,ee){const de=new Uint8Array(4),pe=t.createTexture();t.bindTexture(D,pe),t.texParameteri(D,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(D,t.TEXTURE_MAG_FILTER,t.NEAREST);for(let We=0;We<W;We++)D===t.TEXTURE_3D||D===t.TEXTURE_2D_ARRAY?t.texImage3D(he,0,t.RGBA,1,1,ee,0,t.RGBA,t.UNSIGNED_BYTE,de):t.texImage2D(he+We,0,t.RGBA,1,1,0,t.RGBA,t.UNSIGNED_BYTE,de);return pe}const te={};te[t.TEXTURE_2D]=X(t.TEXTURE_2D,t.TEXTURE_2D,1),te[t.TEXTURE_CUBE_MAP]=X(t.TEXTURE_CUBE_MAP,t.TEXTURE_CUBE_MAP_POSITIVE_X,6),te[t.TEXTURE_2D_ARRAY]=X(t.TEXTURE_2D_ARRAY,t.TEXTURE_2D_ARRAY,1,1),te[t.TEXTURE_3D]=X(t.TEXTURE_3D,t.TEXTURE_3D,1,1),r.setClear(0,0,0,1),s.setClear(1),a.setClear(0),le(t.DEPTH_TEST),s.setFunc(ys),Ue(!1),Oe(gp),le(t.CULL_FACE),R(Vi);function le(D){c[D]!==!0&&(t.enable(D),c[D]=!0)}function ce(D){c[D]!==!1&&(t.disable(D),c[D]=!1)}function Le(D,he){return d[D]!==he?(t.bindFramebuffer(D,he),d[D]=he,D===t.DRAW_FRAMEBUFFER&&(d[t.FRAMEBUFFER]=he),D===t.FRAMEBUFFER&&(d[t.DRAW_FRAMEBUFFER]=he),!0):!1}function Ce(D,he){let W=h,ee=!1;if(D){W=p.get(he),W===void 0&&(W=[],p.set(he,W));const de=D.textures;if(W.length!==de.length||W[0]!==t.COLOR_ATTACHMENT0){for(let pe=0,We=de.length;pe<We;pe++)W[pe]=t.COLOR_ATTACHMENT0+pe;W.length=de.length,ee=!0}}else W[0]!==t.BACK&&(W[0]=t.BACK,ee=!0);ee&&t.drawBuffers(W)}function Ve(D){return g!==D?(t.useProgram(D),g=D,!0):!1}const Qe={[cr]:t.FUNC_ADD,[$y]:t.FUNC_SUBTRACT,[Ky]:t.FUNC_REVERSE_SUBTRACT};Qe[Zy]=t.MIN,Qe[Qy]=t.MAX;const je={[Jy]:t.ZERO,[eS]:t.ONE,[tS]:t.SRC_COLOR,[Ku]:t.SRC_ALPHA,[oS]:t.SRC_ALPHA_SATURATE,[sS]:t.DST_COLOR,[iS]:t.DST_ALPHA,[nS]:t.ONE_MINUS_SRC_COLOR,[Zu]:t.ONE_MINUS_SRC_ALPHA,[aS]:t.ONE_MINUS_DST_COLOR,[rS]:t.ONE_MINUS_DST_ALPHA,[lS]:t.CONSTANT_COLOR,[cS]:t.ONE_MINUS_CONSTANT_COLOR,[uS]:t.CONSTANT_ALPHA,[dS]:t.ONE_MINUS_CONSTANT_ALPHA};function R(D,he,W,ee,de,pe,We,St,Yt,Ze){if(D===Vi){v===!0&&(ce(t.BLEND),v=!1);return}if(v===!1&&(le(t.BLEND),v=!0),D!==Yy){if(D!==S||Ze!==N){if((m!==cr||x!==cr)&&(t.blendEquation(t.FUNC_ADD),m=cr,x=cr),Ze)switch(D){case cs:t.blendFuncSeparate(t.ONE,t.ONE_MINUS_SRC_ALPHA,t.ONE,t.ONE_MINUS_SRC_ALPHA);break;case $u:t.blendFunc(t.ONE,t.ONE);break;case xp:t.blendFuncSeparate(t.ZERO,t.ONE_MINUS_SRC_COLOR,t.ZERO,t.ONE);break;case vp:t.blendFuncSeparate(t.ZERO,t.SRC_COLOR,t.ZERO,t.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",D);break}else switch(D){case cs:t.blendFuncSeparate(t.SRC_ALPHA,t.ONE_MINUS_SRC_ALPHA,t.ONE,t.ONE_MINUS_SRC_ALPHA);break;case $u:t.blendFunc(t.SRC_ALPHA,t.ONE);break;case xp:t.blendFuncSeparate(t.ZERO,t.ONE_MINUS_SRC_COLOR,t.ZERO,t.ONE);break;case vp:t.blendFunc(t.ZERO,t.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",D);break}u=null,_=null,w=null,P=null,b.set(0,0,0),A=0,S=D,N=Ze}return}de=de||he,pe=pe||W,We=We||ee,(he!==m||de!==x)&&(t.blendEquationSeparate(Qe[he],Qe[de]),m=he,x=de),(W!==u||ee!==_||pe!==w||We!==P)&&(t.blendFuncSeparate(je[W],je[ee],je[pe],je[We]),u=W,_=ee,w=pe,P=We),(St.equals(b)===!1||Yt!==A)&&(t.blendColor(St.r,St.g,St.b,Yt),b.copy(St),A=Yt),S=D,N=!1}function Ye(D,he){D.side===Xn?ce(t.CULL_FACE):le(t.CULL_FACE);let W=D.side===rn;he&&(W=!W),Ue(W),D.blending===cs&&D.transparent===!1?R(Vi):R(D.blending,D.blendEquation,D.blendSrc,D.blendDst,D.blendEquationAlpha,D.blendSrcAlpha,D.blendDstAlpha,D.blendColor,D.blendAlpha,D.premultipliedAlpha),s.setFunc(D.depthFunc),s.setTest(D.depthTest),s.setMask(D.depthWrite),r.setMask(D.colorWrite);const ee=D.stencilWrite;a.setTest(ee),ee&&(a.setMask(D.stencilWriteMask),a.setFunc(D.stencilFunc,D.stencilRef,D.stencilFuncMask),a.setOp(D.stencilFail,D.stencilZFail,D.stencilZPass)),rt(D.polygonOffset,D.polygonOffsetFactor,D.polygonOffsetUnits),D.alphaToCoverage===!0?le(t.SAMPLE_ALPHA_TO_COVERAGE):ce(t.SAMPLE_ALPHA_TO_COVERAGE)}function Ue(D){V!==D&&(D?t.frontFace(t.CW):t.frontFace(t.CCW),V=D)}function Oe(D){D!==Wy?(le(t.CULL_FACE),D!==y&&(D===gp?t.cullFace(t.BACK):D===Xy?t.cullFace(t.FRONT):t.cullFace(t.FRONT_AND_BACK))):ce(t.CULL_FACE),y=D}function Ae(D){D!==T&&(Q&&t.lineWidth(D),T=D)}function rt(D,he,W){D?(le(t.POLYGON_OFFSET_FILL),(j!==he||H!==W)&&(t.polygonOffset(he,W),j=he,H=W)):ce(t.POLYGON_OFFSET_FILL)}function Ne(D){D?le(t.SCISSOR_TEST):ce(t.SCISSOR_TEST)}function C(D){D===void 0&&(D=t.TEXTURE0+q-1),L!==D&&(t.activeTexture(D),L=D)}function M(D,he,W){W===void 0&&(L===null?W=t.TEXTURE0+q-1:W=L);let ee=K[W];ee===void 0&&(ee={type:void 0,texture:void 0},K[W]=ee),(ee.type!==D||ee.texture!==he)&&(L!==W&&(t.activeTexture(W),L=W),t.bindTexture(D,he||te[D]),ee.type=D,ee.texture=he)}function O(){const D=K[L];D!==void 0&&D.type!==void 0&&(t.bindTexture(D.type,null),D.type=void 0,D.texture=void 0)}function J(){try{t.compressedTexImage2D.apply(t,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function ne(){try{t.compressedTexImage3D.apply(t,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Z(){try{t.texSubImage2D.apply(t,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function we(){try{t.texSubImage3D.apply(t,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function ue(){try{t.compressedTexSubImage2D.apply(t,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function xe(){try{t.compressedTexSubImage3D.apply(t,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function $e(){try{t.texStorage2D.apply(t,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function re(){try{t.texStorage3D.apply(t,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function ve(){try{t.texImage2D.apply(t,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function De(){try{t.texImage3D.apply(t,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Ie(D){ge.equals(D)===!1&&(t.scissor(D.x,D.y,D.z,D.w),ge.copy(D))}function _e(D){be.equals(D)===!1&&(t.viewport(D.x,D.y,D.z,D.w),be.copy(D))}function Ge(D,he){let W=l.get(he);W===void 0&&(W=new WeakMap,l.set(he,W));let ee=W.get(D);ee===void 0&&(ee=t.getUniformBlockIndex(he,D.name),W.set(D,ee))}function Fe(D,he){const ee=l.get(he).get(D);o.get(he)!==ee&&(t.uniformBlockBinding(he,ee,D.__bindingPointIndex),o.set(he,ee))}function at(){t.disable(t.BLEND),t.disable(t.CULL_FACE),t.disable(t.DEPTH_TEST),t.disable(t.POLYGON_OFFSET_FILL),t.disable(t.SCISSOR_TEST),t.disable(t.STENCIL_TEST),t.disable(t.SAMPLE_ALPHA_TO_COVERAGE),t.blendEquation(t.FUNC_ADD),t.blendFunc(t.ONE,t.ZERO),t.blendFuncSeparate(t.ONE,t.ZERO,t.ONE,t.ZERO),t.blendColor(0,0,0,0),t.colorMask(!0,!0,!0,!0),t.clearColor(0,0,0,0),t.depthMask(!0),t.depthFunc(t.LESS),t.clearDepth(1),t.stencilMask(4294967295),t.stencilFunc(t.ALWAYS,0,4294967295),t.stencilOp(t.KEEP,t.KEEP,t.KEEP),t.clearStencil(0),t.cullFace(t.BACK),t.frontFace(t.CCW),t.polygonOffset(0,0),t.activeTexture(t.TEXTURE0),t.bindFramebuffer(t.FRAMEBUFFER,null),t.bindFramebuffer(t.DRAW_FRAMEBUFFER,null),t.bindFramebuffer(t.READ_FRAMEBUFFER,null),t.useProgram(null),t.lineWidth(1),t.scissor(0,0,t.canvas.width,t.canvas.height),t.viewport(0,0,t.canvas.width,t.canvas.height),c={},L=null,K={},d={},p=new WeakMap,h=[],g=null,v=!1,S=null,m=null,u=null,_=null,x=null,w=null,P=null,b=new Xe(0,0,0),A=0,N=!1,V=null,y=null,T=null,j=null,H=null,ge.set(0,0,t.canvas.width,t.canvas.height),be.set(0,0,t.canvas.width,t.canvas.height),r.reset(),s.reset(),a.reset()}return{buffers:{color:r,depth:s,stencil:a},enable:le,disable:ce,bindFramebuffer:Le,drawBuffers:Ce,useProgram:Ve,setBlending:R,setMaterial:Ye,setFlipSided:Ue,setCullFace:Oe,setLineWidth:Ae,setPolygonOffset:rt,setScissorTest:Ne,activeTexture:C,bindTexture:M,unbindTexture:O,compressedTexImage2D:J,compressedTexImage3D:ne,texImage2D:ve,texImage3D:De,updateUBOMapping:Ge,uniformBlockBinding:Fe,texStorage2D:$e,texStorage3D:re,texSubImage2D:Z,texSubImage3D:we,compressedTexSubImage2D:ue,compressedTexSubImage3D:xe,scissor:Ie,viewport:_e,reset:at}}function lm(t,e,n,i){const r=UT(i);switch(n){case Yg:return t*e;case Kg:return t*e;case Zg:return t*e*2;case Qg:return t*e/r.components*r.byteLength;case Bf:return t*e/r.components*r.byteLength;case Jg:return t*e*2/r.components*r.byteLength;case Hf:return t*e*2/r.components*r.byteLength;case $g:return t*e*3/r.components*r.byteLength;case Fn:return t*e*4/r.components*r.byteLength;case Vf:return t*e*4/r.components*r.byteLength;case Vo:case jo:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*8;case Go:case Wo:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*16;case ud:case fd:return Math.max(t,16)*Math.max(e,8)/4;case cd:case dd:return Math.max(t,8)*Math.max(e,8)/2;case hd:case pd:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*8;case md:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*16;case gd:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*16;case xd:return Math.floor((t+4)/5)*Math.floor((e+3)/4)*16;case vd:return Math.floor((t+4)/5)*Math.floor((e+4)/5)*16;case _d:return Math.floor((t+5)/6)*Math.floor((e+4)/5)*16;case yd:return Math.floor((t+5)/6)*Math.floor((e+5)/6)*16;case Sd:return Math.floor((t+7)/8)*Math.floor((e+4)/5)*16;case Md:return Math.floor((t+7)/8)*Math.floor((e+5)/6)*16;case wd:return Math.floor((t+7)/8)*Math.floor((e+7)/8)*16;case Ed:return Math.floor((t+9)/10)*Math.floor((e+4)/5)*16;case Td:return Math.floor((t+9)/10)*Math.floor((e+5)/6)*16;case bd:return Math.floor((t+9)/10)*Math.floor((e+7)/8)*16;case Ad:return Math.floor((t+9)/10)*Math.floor((e+9)/10)*16;case Cd:return Math.floor((t+11)/12)*Math.floor((e+9)/10)*16;case Rd:return Math.floor((t+11)/12)*Math.floor((e+11)/12)*16;case Xo:case Nd:case Pd:return Math.ceil(t/4)*Math.ceil(e/4)*16;case ex:case Ld:return Math.ceil(t/4)*Math.ceil(e/4)*8;case Dd:case Id:return Math.ceil(t/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${n} format.`)}function UT(t){switch(t){case mi:case Wg:return{byteLength:1,components:1};case Ca:case Xg:case Ua:return{byteLength:2,components:1};case Of:case zf:return{byteLength:2,components:4};case Er:case Ff:case li:return{byteLength:4,components:1};case qg:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${t}.`)}function kT(t,e,n,i,r,s,a){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Ke,d=new WeakMap;let p;const h=new WeakMap;let g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function v(C,M){return g?new OffscreenCanvas(C,M):Ra("canvas")}function S(C,M,O){let J=1;const ne=Ne(C);if((ne.width>O||ne.height>O)&&(J=O/Math.max(ne.width,ne.height)),J<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){const Z=Math.floor(J*ne.width),we=Math.floor(J*ne.height);p===void 0&&(p=v(Z,we));const ue=M?v(Z,we):p;return ue.width=Z,ue.height=we,ue.getContext("2d").drawImage(C,0,0,Z,we),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+ne.width+"x"+ne.height+") to ("+Z+"x"+we+")."),ue}else return"data"in C&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+ne.width+"x"+ne.height+")."),C;return C}function m(C){return C.generateMipmaps&&C.minFilter!==wn&&C.minFilter!==Sn}function u(C){t.generateMipmap(C)}function _(C,M,O,J,ne=!1){if(C!==null){if(t[C]!==void 0)return t[C];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let Z=M;if(M===t.RED&&(O===t.FLOAT&&(Z=t.R32F),O===t.HALF_FLOAT&&(Z=t.R16F),O===t.UNSIGNED_BYTE&&(Z=t.R8)),M===t.RED_INTEGER&&(O===t.UNSIGNED_BYTE&&(Z=t.R8UI),O===t.UNSIGNED_SHORT&&(Z=t.R16UI),O===t.UNSIGNED_INT&&(Z=t.R32UI),O===t.BYTE&&(Z=t.R8I),O===t.SHORT&&(Z=t.R16I),O===t.INT&&(Z=t.R32I)),M===t.RG&&(O===t.FLOAT&&(Z=t.RG32F),O===t.HALF_FLOAT&&(Z=t.RG16F),O===t.UNSIGNED_BYTE&&(Z=t.RG8)),M===t.RG_INTEGER&&(O===t.UNSIGNED_BYTE&&(Z=t.RG8UI),O===t.UNSIGNED_SHORT&&(Z=t.RG16UI),O===t.UNSIGNED_INT&&(Z=t.RG32UI),O===t.BYTE&&(Z=t.RG8I),O===t.SHORT&&(Z=t.RG16I),O===t.INT&&(Z=t.RG32I)),M===t.RGB_INTEGER&&(O===t.UNSIGNED_BYTE&&(Z=t.RGB8UI),O===t.UNSIGNED_SHORT&&(Z=t.RGB16UI),O===t.UNSIGNED_INT&&(Z=t.RGB32UI),O===t.BYTE&&(Z=t.RGB8I),O===t.SHORT&&(Z=t.RGB16I),O===t.INT&&(Z=t.RGB32I)),M===t.RGBA_INTEGER&&(O===t.UNSIGNED_BYTE&&(Z=t.RGBA8UI),O===t.UNSIGNED_SHORT&&(Z=t.RGBA16UI),O===t.UNSIGNED_INT&&(Z=t.RGBA32UI),O===t.BYTE&&(Z=t.RGBA8I),O===t.SHORT&&(Z=t.RGBA16I),O===t.INT&&(Z=t.RGBA32I)),M===t.RGB&&O===t.UNSIGNED_INT_5_9_9_9_REV&&(Z=t.RGB9_E5),M===t.RGBA){const we=ne?yl:tt.getTransfer(J);O===t.FLOAT&&(Z=t.RGBA32F),O===t.HALF_FLOAT&&(Z=t.RGBA16F),O===t.UNSIGNED_BYTE&&(Z=we===ut?t.SRGB8_ALPHA8:t.RGBA8),O===t.UNSIGNED_SHORT_4_4_4_4&&(Z=t.RGBA4),O===t.UNSIGNED_SHORT_5_5_5_1&&(Z=t.RGB5_A1)}return(Z===t.R16F||Z===t.R32F||Z===t.RG16F||Z===t.RG32F||Z===t.RGBA16F||Z===t.RGBA32F)&&e.get("EXT_color_buffer_float"),Z}function x(C,M){let O;return C?M===null||M===Er||M===ws?O=t.DEPTH24_STENCIL8:M===li?O=t.DEPTH32F_STENCIL8:M===Ca&&(O=t.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):M===null||M===Er||M===ws?O=t.DEPTH_COMPONENT24:M===li?O=t.DEPTH_COMPONENT32F:M===Ca&&(O=t.DEPTH_COMPONENT16),O}function w(C,M){return m(C)===!0||C.isFramebufferTexture&&C.minFilter!==wn&&C.minFilter!==Sn?Math.log2(Math.max(M.width,M.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?M.mipmaps.length:1}function P(C){const M=C.target;M.removeEventListener("dispose",P),A(M),M.isVideoTexture&&d.delete(M)}function b(C){const M=C.target;M.removeEventListener("dispose",b),V(M)}function A(C){const M=i.get(C);if(M.__webglInit===void 0)return;const O=C.source,J=h.get(O);if(J){const ne=J[M.__cacheKey];ne.usedTimes--,ne.usedTimes===0&&N(C),Object.keys(J).length===0&&h.delete(O)}i.remove(C)}function N(C){const M=i.get(C);t.deleteTexture(M.__webglTexture);const O=C.source,J=h.get(O);delete J[M.__cacheKey],a.memory.textures--}function V(C){const M=i.get(C);if(C.depthTexture&&C.depthTexture.dispose(),C.isWebGLCubeRenderTarget)for(let J=0;J<6;J++){if(Array.isArray(M.__webglFramebuffer[J]))for(let ne=0;ne<M.__webglFramebuffer[J].length;ne++)t.deleteFramebuffer(M.__webglFramebuffer[J][ne]);else t.deleteFramebuffer(M.__webglFramebuffer[J]);M.__webglDepthbuffer&&t.deleteRenderbuffer(M.__webglDepthbuffer[J])}else{if(Array.isArray(M.__webglFramebuffer))for(let J=0;J<M.__webglFramebuffer.length;J++)t.deleteFramebuffer(M.__webglFramebuffer[J]);else t.deleteFramebuffer(M.__webglFramebuffer);if(M.__webglDepthbuffer&&t.deleteRenderbuffer(M.__webglDepthbuffer),M.__webglMultisampledFramebuffer&&t.deleteFramebuffer(M.__webglMultisampledFramebuffer),M.__webglColorRenderbuffer)for(let J=0;J<M.__webglColorRenderbuffer.length;J++)M.__webglColorRenderbuffer[J]&&t.deleteRenderbuffer(M.__webglColorRenderbuffer[J]);M.__webglDepthRenderbuffer&&t.deleteRenderbuffer(M.__webglDepthRenderbuffer)}const O=C.textures;for(let J=0,ne=O.length;J<ne;J++){const Z=i.get(O[J]);Z.__webglTexture&&(t.deleteTexture(Z.__webglTexture),a.memory.textures--),i.remove(O[J])}i.remove(C)}let y=0;function T(){y=0}function j(){const C=y;return C>=r.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+C+" texture units while this GPU supports only "+r.maxTextures),y+=1,C}function H(C){const M=[];return M.push(C.wrapS),M.push(C.wrapT),M.push(C.wrapR||0),M.push(C.magFilter),M.push(C.minFilter),M.push(C.anisotropy),M.push(C.internalFormat),M.push(C.format),M.push(C.type),M.push(C.generateMipmaps),M.push(C.premultiplyAlpha),M.push(C.flipY),M.push(C.unpackAlignment),M.push(C.colorSpace),M.join()}function q(C,M){const O=i.get(C);if(C.isVideoTexture&&Ae(C),C.isRenderTargetTexture===!1&&C.version>0&&O.__version!==C.version){const J=C.image;if(J===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(J.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{be(O,C,M);return}}n.bindTexture(t.TEXTURE_2D,O.__webglTexture,t.TEXTURE0+M)}function Q(C,M){const O=i.get(C);if(C.version>0&&O.__version!==C.version){be(O,C,M);return}n.bindTexture(t.TEXTURE_2D_ARRAY,O.__webglTexture,t.TEXTURE0+M)}function G(C,M){const O=i.get(C);if(C.version>0&&O.__version!==C.version){be(O,C,M);return}n.bindTexture(t.TEXTURE_3D,O.__webglTexture,t.TEXTURE0+M)}function Y(C,M){const O=i.get(C);if(C.version>0&&O.__version!==C.version){X(O,C,M);return}n.bindTexture(t.TEXTURE_CUBE_MAP,O.__webglTexture,t.TEXTURE0+M)}const L={[od]:t.REPEAT,[pr]:t.CLAMP_TO_EDGE,[ld]:t.MIRRORED_REPEAT},K={[wn]:t.NEAREST,[SS]:t.NEAREST_MIPMAP_NEAREST,[ao]:t.NEAREST_MIPMAP_LINEAR,[Sn]:t.LINEAR,[Sc]:t.LINEAR_MIPMAP_NEAREST,[mr]:t.LINEAR_MIPMAP_LINEAR},U={[TS]:t.NEVER,[PS]:t.ALWAYS,[bS]:t.LESS,[nx]:t.LEQUAL,[AS]:t.EQUAL,[NS]:t.GEQUAL,[CS]:t.GREATER,[RS]:t.NOTEQUAL};function $(C,M){if(M.type===li&&e.has("OES_texture_float_linear")===!1&&(M.magFilter===Sn||M.magFilter===Sc||M.magFilter===ao||M.magFilter===mr||M.minFilter===Sn||M.minFilter===Sc||M.minFilter===ao||M.minFilter===mr)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),t.texParameteri(C,t.TEXTURE_WRAP_S,L[M.wrapS]),t.texParameteri(C,t.TEXTURE_WRAP_T,L[M.wrapT]),(C===t.TEXTURE_3D||C===t.TEXTURE_2D_ARRAY)&&t.texParameteri(C,t.TEXTURE_WRAP_R,L[M.wrapR]),t.texParameteri(C,t.TEXTURE_MAG_FILTER,K[M.magFilter]),t.texParameteri(C,t.TEXTURE_MIN_FILTER,K[M.minFilter]),M.compareFunction&&(t.texParameteri(C,t.TEXTURE_COMPARE_MODE,t.COMPARE_REF_TO_TEXTURE),t.texParameteri(C,t.TEXTURE_COMPARE_FUNC,U[M.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(M.magFilter===wn||M.minFilter!==ao&&M.minFilter!==mr||M.type===li&&e.has("OES_texture_float_linear")===!1)return;if(M.anisotropy>1||i.get(M).__currentAnisotropy){const O=e.get("EXT_texture_filter_anisotropic");t.texParameterf(C,O.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(M.anisotropy,r.getMaxAnisotropy())),i.get(M).__currentAnisotropy=M.anisotropy}}}function ge(C,M){let O=!1;C.__webglInit===void 0&&(C.__webglInit=!0,M.addEventListener("dispose",P));const J=M.source;let ne=h.get(J);ne===void 0&&(ne={},h.set(J,ne));const Z=H(M);if(Z!==C.__cacheKey){ne[Z]===void 0&&(ne[Z]={texture:t.createTexture(),usedTimes:0},a.memory.textures++,O=!0),ne[Z].usedTimes++;const we=ne[C.__cacheKey];we!==void 0&&(ne[C.__cacheKey].usedTimes--,we.usedTimes===0&&N(M)),C.__cacheKey=Z,C.__webglTexture=ne[Z].texture}return O}function be(C,M,O){let J=t.TEXTURE_2D;(M.isDataArrayTexture||M.isCompressedArrayTexture)&&(J=t.TEXTURE_2D_ARRAY),M.isData3DTexture&&(J=t.TEXTURE_3D);const ne=ge(C,M),Z=M.source;n.bindTexture(J,C.__webglTexture,t.TEXTURE0+O);const we=i.get(Z);if(Z.version!==we.__version||ne===!0){n.activeTexture(t.TEXTURE0+O);const ue=tt.getPrimaries(tt.workingColorSpace),xe=M.colorSpace===Pi?null:tt.getPrimaries(M.colorSpace),$e=M.colorSpace===Pi||ue===xe?t.NONE:t.BROWSER_DEFAULT_WEBGL;t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,M.flipY),t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),t.pixelStorei(t.UNPACK_ALIGNMENT,M.unpackAlignment),t.pixelStorei(t.UNPACK_COLORSPACE_CONVERSION_WEBGL,$e);let re=S(M.image,!1,r.maxTextureSize);re=rt(M,re);const ve=s.convert(M.format,M.colorSpace),De=s.convert(M.type);let Ie=_(M.internalFormat,ve,De,M.colorSpace,M.isVideoTexture);$(J,M);let _e;const Ge=M.mipmaps,Fe=M.isVideoTexture!==!0,at=we.__version===void 0||ne===!0,D=Z.dataReady,he=w(M,re);if(M.isDepthTexture)Ie=x(M.format===Es,M.type),at&&(Fe?n.texStorage2D(t.TEXTURE_2D,1,Ie,re.width,re.height):n.texImage2D(t.TEXTURE_2D,0,Ie,re.width,re.height,0,ve,De,null));else if(M.isDataTexture)if(Ge.length>0){Fe&&at&&n.texStorage2D(t.TEXTURE_2D,he,Ie,Ge[0].width,Ge[0].height);for(let W=0,ee=Ge.length;W<ee;W++)_e=Ge[W],Fe?D&&n.texSubImage2D(t.TEXTURE_2D,W,0,0,_e.width,_e.height,ve,De,_e.data):n.texImage2D(t.TEXTURE_2D,W,Ie,_e.width,_e.height,0,ve,De,_e.data);M.generateMipmaps=!1}else Fe?(at&&n.texStorage2D(t.TEXTURE_2D,he,Ie,re.width,re.height),D&&n.texSubImage2D(t.TEXTURE_2D,0,0,0,re.width,re.height,ve,De,re.data)):n.texImage2D(t.TEXTURE_2D,0,Ie,re.width,re.height,0,ve,De,re.data);else if(M.isCompressedTexture)if(M.isCompressedArrayTexture){Fe&&at&&n.texStorage3D(t.TEXTURE_2D_ARRAY,he,Ie,Ge[0].width,Ge[0].height,re.depth);for(let W=0,ee=Ge.length;W<ee;W++)if(_e=Ge[W],M.format!==Fn)if(ve!==null)if(Fe){if(D)if(M.layerUpdates.size>0){const de=lm(_e.width,_e.height,M.format,M.type);for(const pe of M.layerUpdates){const We=_e.data.subarray(pe*de/_e.data.BYTES_PER_ELEMENT,(pe+1)*de/_e.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(t.TEXTURE_2D_ARRAY,W,0,0,pe,_e.width,_e.height,1,ve,We,0,0)}M.clearLayerUpdates()}else n.compressedTexSubImage3D(t.TEXTURE_2D_ARRAY,W,0,0,0,_e.width,_e.height,re.depth,ve,_e.data,0,0)}else n.compressedTexImage3D(t.TEXTURE_2D_ARRAY,W,Ie,_e.width,_e.height,re.depth,0,_e.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Fe?D&&n.texSubImage3D(t.TEXTURE_2D_ARRAY,W,0,0,0,_e.width,_e.height,re.depth,ve,De,_e.data):n.texImage3D(t.TEXTURE_2D_ARRAY,W,Ie,_e.width,_e.height,re.depth,0,ve,De,_e.data)}else{Fe&&at&&n.texStorage2D(t.TEXTURE_2D,he,Ie,Ge[0].width,Ge[0].height);for(let W=0,ee=Ge.length;W<ee;W++)_e=Ge[W],M.format!==Fn?ve!==null?Fe?D&&n.compressedTexSubImage2D(t.TEXTURE_2D,W,0,0,_e.width,_e.height,ve,_e.data):n.compressedTexImage2D(t.TEXTURE_2D,W,Ie,_e.width,_e.height,0,_e.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Fe?D&&n.texSubImage2D(t.TEXTURE_2D,W,0,0,_e.width,_e.height,ve,De,_e.data):n.texImage2D(t.TEXTURE_2D,W,Ie,_e.width,_e.height,0,ve,De,_e.data)}else if(M.isDataArrayTexture)if(Fe){if(at&&n.texStorage3D(t.TEXTURE_2D_ARRAY,he,Ie,re.width,re.height,re.depth),D)if(M.layerUpdates.size>0){const W=lm(re.width,re.height,M.format,M.type);for(const ee of M.layerUpdates){const de=re.data.subarray(ee*W/re.data.BYTES_PER_ELEMENT,(ee+1)*W/re.data.BYTES_PER_ELEMENT);n.texSubImage3D(t.TEXTURE_2D_ARRAY,0,0,0,ee,re.width,re.height,1,ve,De,de)}M.clearLayerUpdates()}else n.texSubImage3D(t.TEXTURE_2D_ARRAY,0,0,0,0,re.width,re.height,re.depth,ve,De,re.data)}else n.texImage3D(t.TEXTURE_2D_ARRAY,0,Ie,re.width,re.height,re.depth,0,ve,De,re.data);else if(M.isData3DTexture)Fe?(at&&n.texStorage3D(t.TEXTURE_3D,he,Ie,re.width,re.height,re.depth),D&&n.texSubImage3D(t.TEXTURE_3D,0,0,0,0,re.width,re.height,re.depth,ve,De,re.data)):n.texImage3D(t.TEXTURE_3D,0,Ie,re.width,re.height,re.depth,0,ve,De,re.data);else if(M.isFramebufferTexture){if(at)if(Fe)n.texStorage2D(t.TEXTURE_2D,he,Ie,re.width,re.height);else{let W=re.width,ee=re.height;for(let de=0;de<he;de++)n.texImage2D(t.TEXTURE_2D,de,Ie,W,ee,0,ve,De,null),W>>=1,ee>>=1}}else if(Ge.length>0){if(Fe&&at){const W=Ne(Ge[0]);n.texStorage2D(t.TEXTURE_2D,he,Ie,W.width,W.height)}for(let W=0,ee=Ge.length;W<ee;W++)_e=Ge[W],Fe?D&&n.texSubImage2D(t.TEXTURE_2D,W,0,0,ve,De,_e):n.texImage2D(t.TEXTURE_2D,W,Ie,ve,De,_e);M.generateMipmaps=!1}else if(Fe){if(at){const W=Ne(re);n.texStorage2D(t.TEXTURE_2D,he,Ie,W.width,W.height)}D&&n.texSubImage2D(t.TEXTURE_2D,0,0,0,ve,De,re)}else n.texImage2D(t.TEXTURE_2D,0,Ie,ve,De,re);m(M)&&u(J),we.__version=Z.version,M.onUpdate&&M.onUpdate(M)}C.__version=M.version}function X(C,M,O){if(M.image.length!==6)return;const J=ge(C,M),ne=M.source;n.bindTexture(t.TEXTURE_CUBE_MAP,C.__webglTexture,t.TEXTURE0+O);const Z=i.get(ne);if(ne.version!==Z.__version||J===!0){n.activeTexture(t.TEXTURE0+O);const we=tt.getPrimaries(tt.workingColorSpace),ue=M.colorSpace===Pi?null:tt.getPrimaries(M.colorSpace),xe=M.colorSpace===Pi||we===ue?t.NONE:t.BROWSER_DEFAULT_WEBGL;t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,M.flipY),t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),t.pixelStorei(t.UNPACK_ALIGNMENT,M.unpackAlignment),t.pixelStorei(t.UNPACK_COLORSPACE_CONVERSION_WEBGL,xe);const $e=M.isCompressedTexture||M.image[0].isCompressedTexture,re=M.image[0]&&M.image[0].isDataTexture,ve=[];for(let ee=0;ee<6;ee++)!$e&&!re?ve[ee]=S(M.image[ee],!0,r.maxCubemapSize):ve[ee]=re?M.image[ee].image:M.image[ee],ve[ee]=rt(M,ve[ee]);const De=ve[0],Ie=s.convert(M.format,M.colorSpace),_e=s.convert(M.type),Ge=_(M.internalFormat,Ie,_e,M.colorSpace),Fe=M.isVideoTexture!==!0,at=Z.__version===void 0||J===!0,D=ne.dataReady;let he=w(M,De);$(t.TEXTURE_CUBE_MAP,M);let W;if($e){Fe&&at&&n.texStorage2D(t.TEXTURE_CUBE_MAP,he,Ge,De.width,De.height);for(let ee=0;ee<6;ee++){W=ve[ee].mipmaps;for(let de=0;de<W.length;de++){const pe=W[de];M.format!==Fn?Ie!==null?Fe?D&&n.compressedTexSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ee,de,0,0,pe.width,pe.height,Ie,pe.data):n.compressedTexImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ee,de,Ge,pe.width,pe.height,0,pe.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Fe?D&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ee,de,0,0,pe.width,pe.height,Ie,_e,pe.data):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ee,de,Ge,pe.width,pe.height,0,Ie,_e,pe.data)}}}else{if(W=M.mipmaps,Fe&&at){W.length>0&&he++;const ee=Ne(ve[0]);n.texStorage2D(t.TEXTURE_CUBE_MAP,he,Ge,ee.width,ee.height)}for(let ee=0;ee<6;ee++)if(re){Fe?D&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ee,0,0,0,ve[ee].width,ve[ee].height,Ie,_e,ve[ee].data):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ee,0,Ge,ve[ee].width,ve[ee].height,0,Ie,_e,ve[ee].data);for(let de=0;de<W.length;de++){const We=W[de].image[ee].image;Fe?D&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ee,de+1,0,0,We.width,We.height,Ie,_e,We.data):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ee,de+1,Ge,We.width,We.height,0,Ie,_e,We.data)}}else{Fe?D&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ee,0,0,0,Ie,_e,ve[ee]):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ee,0,Ge,Ie,_e,ve[ee]);for(let de=0;de<W.length;de++){const pe=W[de];Fe?D&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ee,de+1,0,0,Ie,_e,pe.image[ee]):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ee,de+1,Ge,Ie,_e,pe.image[ee])}}}m(M)&&u(t.TEXTURE_CUBE_MAP),Z.__version=ne.version,M.onUpdate&&M.onUpdate(M)}C.__version=M.version}function te(C,M,O,J,ne,Z){const we=s.convert(O.format,O.colorSpace),ue=s.convert(O.type),xe=_(O.internalFormat,we,ue,O.colorSpace);if(!i.get(M).__hasExternalTextures){const re=Math.max(1,M.width>>Z),ve=Math.max(1,M.height>>Z);ne===t.TEXTURE_3D||ne===t.TEXTURE_2D_ARRAY?n.texImage3D(ne,Z,xe,re,ve,M.depth,0,we,ue,null):n.texImage2D(ne,Z,xe,re,ve,0,we,ue,null)}n.bindFramebuffer(t.FRAMEBUFFER,C),Oe(M)?o.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,J,ne,i.get(O).__webglTexture,0,Ue(M)):(ne===t.TEXTURE_2D||ne>=t.TEXTURE_CUBE_MAP_POSITIVE_X&&ne<=t.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&t.framebufferTexture2D(t.FRAMEBUFFER,J,ne,i.get(O).__webglTexture,Z),n.bindFramebuffer(t.FRAMEBUFFER,null)}function le(C,M,O){if(t.bindRenderbuffer(t.RENDERBUFFER,C),M.depthBuffer){const J=M.depthTexture,ne=J&&J.isDepthTexture?J.type:null,Z=x(M.stencilBuffer,ne),we=M.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,ue=Ue(M);Oe(M)?o.renderbufferStorageMultisampleEXT(t.RENDERBUFFER,ue,Z,M.width,M.height):O?t.renderbufferStorageMultisample(t.RENDERBUFFER,ue,Z,M.width,M.height):t.renderbufferStorage(t.RENDERBUFFER,Z,M.width,M.height),t.framebufferRenderbuffer(t.FRAMEBUFFER,we,t.RENDERBUFFER,C)}else{const J=M.textures;for(let ne=0;ne<J.length;ne++){const Z=J[ne],we=s.convert(Z.format,Z.colorSpace),ue=s.convert(Z.type),xe=_(Z.internalFormat,we,ue,Z.colorSpace),$e=Ue(M);O&&Oe(M)===!1?t.renderbufferStorageMultisample(t.RENDERBUFFER,$e,xe,M.width,M.height):Oe(M)?o.renderbufferStorageMultisampleEXT(t.RENDERBUFFER,$e,xe,M.width,M.height):t.renderbufferStorage(t.RENDERBUFFER,xe,M.width,M.height)}}t.bindRenderbuffer(t.RENDERBUFFER,null)}function ce(C,M){if(M&&M.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(n.bindFramebuffer(t.FRAMEBUFFER,C),!(M.depthTexture&&M.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!i.get(M.depthTexture).__webglTexture||M.depthTexture.image.width!==M.width||M.depthTexture.image.height!==M.height)&&(M.depthTexture.image.width=M.width,M.depthTexture.image.height=M.height,M.depthTexture.needsUpdate=!0),q(M.depthTexture,0);const J=i.get(M.depthTexture).__webglTexture,ne=Ue(M);if(M.depthTexture.format===us)Oe(M)?o.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,t.DEPTH_ATTACHMENT,t.TEXTURE_2D,J,0,ne):t.framebufferTexture2D(t.FRAMEBUFFER,t.DEPTH_ATTACHMENT,t.TEXTURE_2D,J,0);else if(M.depthTexture.format===Es)Oe(M)?o.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,t.DEPTH_STENCIL_ATTACHMENT,t.TEXTURE_2D,J,0,ne):t.framebufferTexture2D(t.FRAMEBUFFER,t.DEPTH_STENCIL_ATTACHMENT,t.TEXTURE_2D,J,0);else throw new Error("Unknown depthTexture format")}function Le(C){const M=i.get(C),O=C.isWebGLCubeRenderTarget===!0;if(M.__boundDepthTexture!==C.depthTexture){const J=C.depthTexture;if(M.__depthDisposeCallback&&M.__depthDisposeCallback(),J){const ne=()=>{delete M.__boundDepthTexture,delete M.__depthDisposeCallback,J.removeEventListener("dispose",ne)};J.addEventListener("dispose",ne),M.__depthDisposeCallback=ne}M.__boundDepthTexture=J}if(C.depthTexture&&!M.__autoAllocateDepthBuffer){if(O)throw new Error("target.depthTexture not supported in Cube render targets");ce(M.__webglFramebuffer,C)}else if(O){M.__webglDepthbuffer=[];for(let J=0;J<6;J++)if(n.bindFramebuffer(t.FRAMEBUFFER,M.__webglFramebuffer[J]),M.__webglDepthbuffer[J]===void 0)M.__webglDepthbuffer[J]=t.createRenderbuffer(),le(M.__webglDepthbuffer[J],C,!1);else{const ne=C.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,Z=M.__webglDepthbuffer[J];t.bindRenderbuffer(t.RENDERBUFFER,Z),t.framebufferRenderbuffer(t.FRAMEBUFFER,ne,t.RENDERBUFFER,Z)}}else if(n.bindFramebuffer(t.FRAMEBUFFER,M.__webglFramebuffer),M.__webglDepthbuffer===void 0)M.__webglDepthbuffer=t.createRenderbuffer(),le(M.__webglDepthbuffer,C,!1);else{const J=C.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,ne=M.__webglDepthbuffer;t.bindRenderbuffer(t.RENDERBUFFER,ne),t.framebufferRenderbuffer(t.FRAMEBUFFER,J,t.RENDERBUFFER,ne)}n.bindFramebuffer(t.FRAMEBUFFER,null)}function Ce(C,M,O){const J=i.get(C);M!==void 0&&te(J.__webglFramebuffer,C,C.texture,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,0),O!==void 0&&Le(C)}function Ve(C){const M=C.texture,O=i.get(C),J=i.get(M);C.addEventListener("dispose",b);const ne=C.textures,Z=C.isWebGLCubeRenderTarget===!0,we=ne.length>1;if(we||(J.__webglTexture===void 0&&(J.__webglTexture=t.createTexture()),J.__version=M.version,a.memory.textures++),Z){O.__webglFramebuffer=[];for(let ue=0;ue<6;ue++)if(M.mipmaps&&M.mipmaps.length>0){O.__webglFramebuffer[ue]=[];for(let xe=0;xe<M.mipmaps.length;xe++)O.__webglFramebuffer[ue][xe]=t.createFramebuffer()}else O.__webglFramebuffer[ue]=t.createFramebuffer()}else{if(M.mipmaps&&M.mipmaps.length>0){O.__webglFramebuffer=[];for(let ue=0;ue<M.mipmaps.length;ue++)O.__webglFramebuffer[ue]=t.createFramebuffer()}else O.__webglFramebuffer=t.createFramebuffer();if(we)for(let ue=0,xe=ne.length;ue<xe;ue++){const $e=i.get(ne[ue]);$e.__webglTexture===void 0&&($e.__webglTexture=t.createTexture(),a.memory.textures++)}if(C.samples>0&&Oe(C)===!1){O.__webglMultisampledFramebuffer=t.createFramebuffer(),O.__webglColorRenderbuffer=[],n.bindFramebuffer(t.FRAMEBUFFER,O.__webglMultisampledFramebuffer);for(let ue=0;ue<ne.length;ue++){const xe=ne[ue];O.__webglColorRenderbuffer[ue]=t.createRenderbuffer(),t.bindRenderbuffer(t.RENDERBUFFER,O.__webglColorRenderbuffer[ue]);const $e=s.convert(xe.format,xe.colorSpace),re=s.convert(xe.type),ve=_(xe.internalFormat,$e,re,xe.colorSpace,C.isXRRenderTarget===!0),De=Ue(C);t.renderbufferStorageMultisample(t.RENDERBUFFER,De,ve,C.width,C.height),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+ue,t.RENDERBUFFER,O.__webglColorRenderbuffer[ue])}t.bindRenderbuffer(t.RENDERBUFFER,null),C.depthBuffer&&(O.__webglDepthRenderbuffer=t.createRenderbuffer(),le(O.__webglDepthRenderbuffer,C,!0)),n.bindFramebuffer(t.FRAMEBUFFER,null)}}if(Z){n.bindTexture(t.TEXTURE_CUBE_MAP,J.__webglTexture),$(t.TEXTURE_CUBE_MAP,M);for(let ue=0;ue<6;ue++)if(M.mipmaps&&M.mipmaps.length>0)for(let xe=0;xe<M.mipmaps.length;xe++)te(O.__webglFramebuffer[ue][xe],C,M,t.COLOR_ATTACHMENT0,t.TEXTURE_CUBE_MAP_POSITIVE_X+ue,xe);else te(O.__webglFramebuffer[ue],C,M,t.COLOR_ATTACHMENT0,t.TEXTURE_CUBE_MAP_POSITIVE_X+ue,0);m(M)&&u(t.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(we){for(let ue=0,xe=ne.length;ue<xe;ue++){const $e=ne[ue],re=i.get($e);n.bindTexture(t.TEXTURE_2D,re.__webglTexture),$(t.TEXTURE_2D,$e),te(O.__webglFramebuffer,C,$e,t.COLOR_ATTACHMENT0+ue,t.TEXTURE_2D,0),m($e)&&u(t.TEXTURE_2D)}n.unbindTexture()}else{let ue=t.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(ue=C.isWebGL3DRenderTarget?t.TEXTURE_3D:t.TEXTURE_2D_ARRAY),n.bindTexture(ue,J.__webglTexture),$(ue,M),M.mipmaps&&M.mipmaps.length>0)for(let xe=0;xe<M.mipmaps.length;xe++)te(O.__webglFramebuffer[xe],C,M,t.COLOR_ATTACHMENT0,ue,xe);else te(O.__webglFramebuffer,C,M,t.COLOR_ATTACHMENT0,ue,0);m(M)&&u(ue),n.unbindTexture()}C.depthBuffer&&Le(C)}function Qe(C){const M=C.textures;for(let O=0,J=M.length;O<J;O++){const ne=M[O];if(m(ne)){const Z=C.isWebGLCubeRenderTarget?t.TEXTURE_CUBE_MAP:t.TEXTURE_2D,we=i.get(ne).__webglTexture;n.bindTexture(Z,we),u(Z),n.unbindTexture()}}}const je=[],R=[];function Ye(C){if(C.samples>0){if(Oe(C)===!1){const M=C.textures,O=C.width,J=C.height;let ne=t.COLOR_BUFFER_BIT;const Z=C.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,we=i.get(C),ue=M.length>1;if(ue)for(let xe=0;xe<M.length;xe++)n.bindFramebuffer(t.FRAMEBUFFER,we.__webglMultisampledFramebuffer),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+xe,t.RENDERBUFFER,null),n.bindFramebuffer(t.FRAMEBUFFER,we.__webglFramebuffer),t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0+xe,t.TEXTURE_2D,null,0);n.bindFramebuffer(t.READ_FRAMEBUFFER,we.__webglMultisampledFramebuffer),n.bindFramebuffer(t.DRAW_FRAMEBUFFER,we.__webglFramebuffer);for(let xe=0;xe<M.length;xe++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(ne|=t.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(ne|=t.STENCIL_BUFFER_BIT)),ue){t.framebufferRenderbuffer(t.READ_FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.RENDERBUFFER,we.__webglColorRenderbuffer[xe]);const $e=i.get(M[xe]).__webglTexture;t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,$e,0)}t.blitFramebuffer(0,0,O,J,0,0,O,J,ne,t.NEAREST),l===!0&&(je.length=0,R.length=0,je.push(t.COLOR_ATTACHMENT0+xe),C.depthBuffer&&C.resolveDepthBuffer===!1&&(je.push(Z),R.push(Z),t.invalidateFramebuffer(t.DRAW_FRAMEBUFFER,R)),t.invalidateFramebuffer(t.READ_FRAMEBUFFER,je))}if(n.bindFramebuffer(t.READ_FRAMEBUFFER,null),n.bindFramebuffer(t.DRAW_FRAMEBUFFER,null),ue)for(let xe=0;xe<M.length;xe++){n.bindFramebuffer(t.FRAMEBUFFER,we.__webglMultisampledFramebuffer),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+xe,t.RENDERBUFFER,we.__webglColorRenderbuffer[xe]);const $e=i.get(M[xe]).__webglTexture;n.bindFramebuffer(t.FRAMEBUFFER,we.__webglFramebuffer),t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0+xe,t.TEXTURE_2D,$e,0)}n.bindFramebuffer(t.DRAW_FRAMEBUFFER,we.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.resolveDepthBuffer===!1&&l){const M=C.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT;t.invalidateFramebuffer(t.DRAW_FRAMEBUFFER,[M])}}}function Ue(C){return Math.min(r.maxSamples,C.samples)}function Oe(C){const M=i.get(C);return C.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&M.__useRenderToTexture!==!1}function Ae(C){const M=a.render.frame;d.get(C)!==M&&(d.set(C,M),C.update())}function rt(C,M){const O=C.colorSpace,J=C.format,ne=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||O!==Zi&&O!==Pi&&(tt.getTransfer(O)===ut?(J!==Fn||ne!==mi)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",O)),M}function Ne(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(c.width=C.naturalWidth||C.width,c.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(c.width=C.displayWidth,c.height=C.displayHeight):(c.width=C.width,c.height=C.height),c}this.allocateTextureUnit=j,this.resetTextureUnits=T,this.setTexture2D=q,this.setTexture2DArray=Q,this.setTexture3D=G,this.setTextureCube=Y,this.rebindTextures=Ce,this.setupRenderTarget=Ve,this.updateRenderTargetMipmap=Qe,this.updateMultisampleRenderTarget=Ye,this.setupDepthRenderbuffer=Le,this.setupFrameBufferTexture=te,this.useMultisampledRTT=Oe}function FT(t,e){function n(i,r=Pi){let s;const a=tt.getTransfer(r);if(i===mi)return t.UNSIGNED_BYTE;if(i===Of)return t.UNSIGNED_SHORT_4_4_4_4;if(i===zf)return t.UNSIGNED_SHORT_5_5_5_1;if(i===qg)return t.UNSIGNED_INT_5_9_9_9_REV;if(i===Wg)return t.BYTE;if(i===Xg)return t.SHORT;if(i===Ca)return t.UNSIGNED_SHORT;if(i===Ff)return t.INT;if(i===Er)return t.UNSIGNED_INT;if(i===li)return t.FLOAT;if(i===Ua)return t.HALF_FLOAT;if(i===Yg)return t.ALPHA;if(i===$g)return t.RGB;if(i===Fn)return t.RGBA;if(i===Kg)return t.LUMINANCE;if(i===Zg)return t.LUMINANCE_ALPHA;if(i===us)return t.DEPTH_COMPONENT;if(i===Es)return t.DEPTH_STENCIL;if(i===Qg)return t.RED;if(i===Bf)return t.RED_INTEGER;if(i===Jg)return t.RG;if(i===Hf)return t.RG_INTEGER;if(i===Vf)return t.RGBA_INTEGER;if(i===Vo||i===jo||i===Go||i===Wo)if(a===ut)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(i===Vo)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===jo)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Go)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Wo)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(i===Vo)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===jo)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Go)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Wo)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===cd||i===ud||i===dd||i===fd)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(i===cd)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===ud)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===dd)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===fd)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===hd||i===pd||i===md)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(i===hd||i===pd)return a===ut?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(i===md)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===gd||i===xd||i===vd||i===_d||i===yd||i===Sd||i===Md||i===wd||i===Ed||i===Td||i===bd||i===Ad||i===Cd||i===Rd)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(i===gd)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===xd)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===vd)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===_d)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===yd)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Sd)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Md)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===wd)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Ed)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Td)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===bd)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Ad)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Cd)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Rd)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Xo||i===Nd||i===Pd)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(i===Xo)return a===ut?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Nd)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===Pd)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===ex||i===Ld||i===Dd||i===Id)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(i===Xo)return s.COMPRESSED_RED_RGTC1_EXT;if(i===Ld)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Dd)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Id)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===ws?t.UNSIGNED_INT_24_8:t[i]!==void 0?t[i]:null}return{convert:n}}class OT extends un{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class Qs extends Wt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const zT={type:"move"};class Zc{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Qs,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Qs,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new F,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new F),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Qs,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new F,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new F),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const n=this._hand;if(n)for(const i of e.hand.values())this._getHandJoint(n,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,n,i){let r=null,s=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(e&&n.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(const S of e.hand.values()){const m=n.getJointPose(S,i),u=this._getHandJoint(c,S);m!==null&&(u.matrix.fromArray(m.transform.matrix),u.matrix.decompose(u.position,u.rotation,u.scale),u.matrixWorldNeedsUpdate=!0,u.jointRadius=m.radius),u.visible=m!==null}const d=c.joints["index-finger-tip"],p=c.joints["thumb-tip"],h=d.position.distanceTo(p.position),g=.02,v=.005;c.inputState.pinching&&h>g+v?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&h<=g-v&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=n.getPose(e.gripSpace,i),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(r=n.getPose(e.targetRaySpace,i),r===null&&s!==null&&(r=s),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(zT)))}return o!==null&&(o.visible=r!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,n){if(e.joints[n.jointName]===void 0){const i=new Qs;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[n.jointName]=i,e.add(i)}return e.joints[n.jointName]}}const BT=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,HT=`
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

}`;class VT{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,n,i){if(this.texture===null){const r=new Gt,s=e.properties.get(r);s.__webglTexture=n.texture,(n.depthNear!=i.depthNear||n.depthFar!=i.depthFar)&&(this.depthNear=n.depthNear,this.depthFar=n.depthFar),this.texture=r}}getMesh(e){if(this.texture!==null&&this.mesh===null){const n=e.cameras[0].viewport,i=new qi({vertexShader:BT,fragmentShader:HT,uniforms:{depthColor:{value:this.texture},depthWidth:{value:n.z},depthHeight:{value:n.w}}});this.mesh=new qn(new Ba(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class jT extends Rs{constructor(e,n){super();const i=this;let r=null,s=1,a=null,o="local-floor",l=1,c=null,d=null,p=null,h=null,g=null,v=null;const S=new VT,m=n.getContextAttributes();let u=null,_=null;const x=[],w=[],P=new Ke;let b=null;const A=new un;A.layers.enable(1),A.viewport=new st;const N=new un;N.layers.enable(2),N.viewport=new st;const V=[A,N],y=new OT;y.layers.enable(1),y.layers.enable(2);let T=null,j=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(X){let te=x[X];return te===void 0&&(te=new Zc,x[X]=te),te.getTargetRaySpace()},this.getControllerGrip=function(X){let te=x[X];return te===void 0&&(te=new Zc,x[X]=te),te.getGripSpace()},this.getHand=function(X){let te=x[X];return te===void 0&&(te=new Zc,x[X]=te),te.getHandSpace()};function H(X){const te=w.indexOf(X.inputSource);if(te===-1)return;const le=x[te];le!==void 0&&(le.update(X.inputSource,X.frame,c||a),le.dispatchEvent({type:X.type,data:X.inputSource}))}function q(){r.removeEventListener("select",H),r.removeEventListener("selectstart",H),r.removeEventListener("selectend",H),r.removeEventListener("squeeze",H),r.removeEventListener("squeezestart",H),r.removeEventListener("squeezeend",H),r.removeEventListener("end",q),r.removeEventListener("inputsourceschange",Q);for(let X=0;X<x.length;X++){const te=w[X];te!==null&&(w[X]=null,x[X].disconnect(te))}T=null,j=null,S.reset(),e.setRenderTarget(u),g=null,h=null,p=null,r=null,_=null,be.stop(),i.isPresenting=!1,e.setPixelRatio(b),e.setSize(P.width,P.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(X){s=X,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(X){o=X,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(X){c=X},this.getBaseLayer=function(){return h!==null?h:g},this.getBinding=function(){return p},this.getFrame=function(){return v},this.getSession=function(){return r},this.setSession=async function(X){if(r=X,r!==null){if(u=e.getRenderTarget(),r.addEventListener("select",H),r.addEventListener("selectstart",H),r.addEventListener("selectend",H),r.addEventListener("squeeze",H),r.addEventListener("squeezestart",H),r.addEventListener("squeezeend",H),r.addEventListener("end",q),r.addEventListener("inputsourceschange",Q),m.xrCompatible!==!0&&await n.makeXRCompatible(),b=e.getPixelRatio(),e.getSize(P),r.renderState.layers===void 0){const te={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:s};g=new XRWebGLLayer(r,n,te),r.updateRenderState({baseLayer:g}),e.setPixelRatio(1),e.setSize(g.framebufferWidth,g.framebufferHeight,!1),_=new Tr(g.framebufferWidth,g.framebufferHeight,{format:Fn,type:mi,colorSpace:e.outputColorSpace,stencilBuffer:m.stencil})}else{let te=null,le=null,ce=null;m.depth&&(ce=m.stencil?n.DEPTH24_STENCIL8:n.DEPTH_COMPONENT24,te=m.stencil?Es:us,le=m.stencil?ws:Er);const Le={colorFormat:n.RGBA8,depthFormat:ce,scaleFactor:s};p=new XRWebGLBinding(r,n),h=p.createProjectionLayer(Le),r.updateRenderState({layers:[h]}),e.setPixelRatio(1),e.setSize(h.textureWidth,h.textureHeight,!1),_=new Tr(h.textureWidth,h.textureHeight,{format:Fn,type:mi,depthTexture:new px(h.textureWidth,h.textureHeight,le,void 0,void 0,void 0,void 0,void 0,void 0,te),stencilBuffer:m.stencil,colorSpace:e.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1})}_.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await r.requestReferenceSpace(o),be.setContext(r),be.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return S.getDepthTexture()};function Q(X){for(let te=0;te<X.removed.length;te++){const le=X.removed[te],ce=w.indexOf(le);ce>=0&&(w[ce]=null,x[ce].disconnect(le))}for(let te=0;te<X.added.length;te++){const le=X.added[te];let ce=w.indexOf(le);if(ce===-1){for(let Ce=0;Ce<x.length;Ce++)if(Ce>=w.length){w.push(le),ce=Ce;break}else if(w[Ce]===null){w[Ce]=le,ce=Ce;break}if(ce===-1)break}const Le=x[ce];Le&&Le.connect(le)}}const G=new F,Y=new F;function L(X,te,le){G.setFromMatrixPosition(te.matrixWorld),Y.setFromMatrixPosition(le.matrixWorld);const ce=G.distanceTo(Y),Le=te.projectionMatrix.elements,Ce=le.projectionMatrix.elements,Ve=Le[14]/(Le[10]-1),Qe=Le[14]/(Le[10]+1),je=(Le[9]+1)/Le[5],R=(Le[9]-1)/Le[5],Ye=(Le[8]-1)/Le[0],Ue=(Ce[8]+1)/Ce[0],Oe=Ve*Ye,Ae=Ve*Ue,rt=ce/(-Ye+Ue),Ne=rt*-Ye;if(te.matrixWorld.decompose(X.position,X.quaternion,X.scale),X.translateX(Ne),X.translateZ(rt),X.matrixWorld.compose(X.position,X.quaternion,X.scale),X.matrixWorldInverse.copy(X.matrixWorld).invert(),Le[10]===-1)X.projectionMatrix.copy(te.projectionMatrix),X.projectionMatrixInverse.copy(te.projectionMatrixInverse);else{const C=Ve+rt,M=Qe+rt,O=Oe-Ne,J=Ae+(ce-Ne),ne=je*Qe/M*C,Z=R*Qe/M*C;X.projectionMatrix.makePerspective(O,J,ne,Z,C,M),X.projectionMatrixInverse.copy(X.projectionMatrix).invert()}}function K(X,te){te===null?X.matrixWorld.copy(X.matrix):X.matrixWorld.multiplyMatrices(te.matrixWorld,X.matrix),X.matrixWorldInverse.copy(X.matrixWorld).invert()}this.updateCamera=function(X){if(r===null)return;let te=X.near,le=X.far;S.texture!==null&&(S.depthNear>0&&(te=S.depthNear),S.depthFar>0&&(le=S.depthFar)),y.near=N.near=A.near=te,y.far=N.far=A.far=le,(T!==y.near||j!==y.far)&&(r.updateRenderState({depthNear:y.near,depthFar:y.far}),T=y.near,j=y.far);const ce=X.parent,Le=y.cameras;K(y,ce);for(let Ce=0;Ce<Le.length;Ce++)K(Le[Ce],ce);Le.length===2?L(y,A,N):y.projectionMatrix.copy(A.projectionMatrix),U(X,y,ce)};function U(X,te,le){le===null?X.matrix.copy(te.matrixWorld):(X.matrix.copy(le.matrixWorld),X.matrix.invert(),X.matrix.multiply(te.matrixWorld)),X.matrix.decompose(X.position,X.quaternion,X.scale),X.updateMatrixWorld(!0),X.projectionMatrix.copy(te.projectionMatrix),X.projectionMatrixInverse.copy(te.projectionMatrixInverse),X.isPerspectiveCamera&&(X.fov=Ud*2*Math.atan(1/X.projectionMatrix.elements[5]),X.zoom=1)}this.getCamera=function(){return y},this.getFoveation=function(){if(!(h===null&&g===null))return l},this.setFoveation=function(X){l=X,h!==null&&(h.fixedFoveation=X),g!==null&&g.fixedFoveation!==void 0&&(g.fixedFoveation=X)},this.hasDepthSensing=function(){return S.texture!==null},this.getDepthSensingMesh=function(){return S.getMesh(y)};let $=null;function ge(X,te){if(d=te.getViewerPose(c||a),v=te,d!==null){const le=d.views;g!==null&&(e.setRenderTargetFramebuffer(_,g.framebuffer),e.setRenderTarget(_));let ce=!1;le.length!==y.cameras.length&&(y.cameras.length=0,ce=!0);for(let Ce=0;Ce<le.length;Ce++){const Ve=le[Ce];let Qe=null;if(g!==null)Qe=g.getViewport(Ve);else{const R=p.getViewSubImage(h,Ve);Qe=R.viewport,Ce===0&&(e.setRenderTargetTextures(_,R.colorTexture,h.ignoreDepthValues?void 0:R.depthStencilTexture),e.setRenderTarget(_))}let je=V[Ce];je===void 0&&(je=new un,je.layers.enable(Ce),je.viewport=new st,V[Ce]=je),je.matrix.fromArray(Ve.transform.matrix),je.matrix.decompose(je.position,je.quaternion,je.scale),je.projectionMatrix.fromArray(Ve.projectionMatrix),je.projectionMatrixInverse.copy(je.projectionMatrix).invert(),je.viewport.set(Qe.x,Qe.y,Qe.width,Qe.height),Ce===0&&(y.matrix.copy(je.matrix),y.matrix.decompose(y.position,y.quaternion,y.scale)),ce===!0&&y.cameras.push(je)}const Le=r.enabledFeatures;if(Le&&Le.includes("depth-sensing")){const Ce=p.getDepthInformation(le[0]);Ce&&Ce.isValid&&Ce.texture&&S.init(e,Ce,r.renderState)}}for(let le=0;le<x.length;le++){const ce=w[le],Le=x[le];ce!==null&&Le!==void 0&&Le.update(ce,te,c||a)}$&&$(X,te),te.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:te}),v=null}const be=new hx;be.setAnimationLoop(ge),this.setAnimationLoop=function(X){$=X},this.dispose=function(){}}}const rr=new Kn,GT=new ft;function WT(t,e){function n(m,u){m.matrixAutoUpdate===!0&&m.updateMatrix(),u.value.copy(m.matrix)}function i(m,u){u.color.getRGB(m.fogColor.value,ux(t)),u.isFog?(m.fogNear.value=u.near,m.fogFar.value=u.far):u.isFogExp2&&(m.fogDensity.value=u.density)}function r(m,u,_,x,w){u.isMeshBasicMaterial||u.isMeshLambertMaterial?s(m,u):u.isMeshToonMaterial?(s(m,u),p(m,u)):u.isMeshPhongMaterial?(s(m,u),d(m,u)):u.isMeshStandardMaterial?(s(m,u),h(m,u),u.isMeshPhysicalMaterial&&g(m,u,w)):u.isMeshMatcapMaterial?(s(m,u),v(m,u)):u.isMeshDepthMaterial?s(m,u):u.isMeshDistanceMaterial?(s(m,u),S(m,u)):u.isMeshNormalMaterial?s(m,u):u.isLineBasicMaterial?(a(m,u),u.isLineDashedMaterial&&o(m,u)):u.isPointsMaterial?l(m,u,_,x):u.isSpriteMaterial?c(m,u):u.isShadowMaterial?(m.color.value.copy(u.color),m.opacity.value=u.opacity):u.isShaderMaterial&&(u.uniformsNeedUpdate=!1)}function s(m,u){m.opacity.value=u.opacity,u.color&&m.diffuse.value.copy(u.color),u.emissive&&m.emissive.value.copy(u.emissive).multiplyScalar(u.emissiveIntensity),u.map&&(m.map.value=u.map,n(u.map,m.mapTransform)),u.alphaMap&&(m.alphaMap.value=u.alphaMap,n(u.alphaMap,m.alphaMapTransform)),u.bumpMap&&(m.bumpMap.value=u.bumpMap,n(u.bumpMap,m.bumpMapTransform),m.bumpScale.value=u.bumpScale,u.side===rn&&(m.bumpScale.value*=-1)),u.normalMap&&(m.normalMap.value=u.normalMap,n(u.normalMap,m.normalMapTransform),m.normalScale.value.copy(u.normalScale),u.side===rn&&m.normalScale.value.negate()),u.displacementMap&&(m.displacementMap.value=u.displacementMap,n(u.displacementMap,m.displacementMapTransform),m.displacementScale.value=u.displacementScale,m.displacementBias.value=u.displacementBias),u.emissiveMap&&(m.emissiveMap.value=u.emissiveMap,n(u.emissiveMap,m.emissiveMapTransform)),u.specularMap&&(m.specularMap.value=u.specularMap,n(u.specularMap,m.specularMapTransform)),u.alphaTest>0&&(m.alphaTest.value=u.alphaTest);const _=e.get(u),x=_.envMap,w=_.envMapRotation;x&&(m.envMap.value=x,rr.copy(w),rr.x*=-1,rr.y*=-1,rr.z*=-1,x.isCubeTexture&&x.isRenderTargetTexture===!1&&(rr.y*=-1,rr.z*=-1),m.envMapRotation.value.setFromMatrix4(GT.makeRotationFromEuler(rr)),m.flipEnvMap.value=x.isCubeTexture&&x.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=u.reflectivity,m.ior.value=u.ior,m.refractionRatio.value=u.refractionRatio),u.lightMap&&(m.lightMap.value=u.lightMap,m.lightMapIntensity.value=u.lightMapIntensity,n(u.lightMap,m.lightMapTransform)),u.aoMap&&(m.aoMap.value=u.aoMap,m.aoMapIntensity.value=u.aoMapIntensity,n(u.aoMap,m.aoMapTransform))}function a(m,u){m.diffuse.value.copy(u.color),m.opacity.value=u.opacity,u.map&&(m.map.value=u.map,n(u.map,m.mapTransform))}function o(m,u){m.dashSize.value=u.dashSize,m.totalSize.value=u.dashSize+u.gapSize,m.scale.value=u.scale}function l(m,u,_,x){m.diffuse.value.copy(u.color),m.opacity.value=u.opacity,m.size.value=u.size*_,m.scale.value=x*.5,u.map&&(m.map.value=u.map,n(u.map,m.uvTransform)),u.alphaMap&&(m.alphaMap.value=u.alphaMap,n(u.alphaMap,m.alphaMapTransform)),u.alphaTest>0&&(m.alphaTest.value=u.alphaTest)}function c(m,u){m.diffuse.value.copy(u.color),m.opacity.value=u.opacity,m.rotation.value=u.rotation,u.map&&(m.map.value=u.map,n(u.map,m.mapTransform)),u.alphaMap&&(m.alphaMap.value=u.alphaMap,n(u.alphaMap,m.alphaMapTransform)),u.alphaTest>0&&(m.alphaTest.value=u.alphaTest)}function d(m,u){m.specular.value.copy(u.specular),m.shininess.value=Math.max(u.shininess,1e-4)}function p(m,u){u.gradientMap&&(m.gradientMap.value=u.gradientMap)}function h(m,u){m.metalness.value=u.metalness,u.metalnessMap&&(m.metalnessMap.value=u.metalnessMap,n(u.metalnessMap,m.metalnessMapTransform)),m.roughness.value=u.roughness,u.roughnessMap&&(m.roughnessMap.value=u.roughnessMap,n(u.roughnessMap,m.roughnessMapTransform)),u.envMap&&(m.envMapIntensity.value=u.envMapIntensity)}function g(m,u,_){m.ior.value=u.ior,u.sheen>0&&(m.sheenColor.value.copy(u.sheenColor).multiplyScalar(u.sheen),m.sheenRoughness.value=u.sheenRoughness,u.sheenColorMap&&(m.sheenColorMap.value=u.sheenColorMap,n(u.sheenColorMap,m.sheenColorMapTransform)),u.sheenRoughnessMap&&(m.sheenRoughnessMap.value=u.sheenRoughnessMap,n(u.sheenRoughnessMap,m.sheenRoughnessMapTransform))),u.clearcoat>0&&(m.clearcoat.value=u.clearcoat,m.clearcoatRoughness.value=u.clearcoatRoughness,u.clearcoatMap&&(m.clearcoatMap.value=u.clearcoatMap,n(u.clearcoatMap,m.clearcoatMapTransform)),u.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=u.clearcoatRoughnessMap,n(u.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),u.clearcoatNormalMap&&(m.clearcoatNormalMap.value=u.clearcoatNormalMap,n(u.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(u.clearcoatNormalScale),u.side===rn&&m.clearcoatNormalScale.value.negate())),u.dispersion>0&&(m.dispersion.value=u.dispersion),u.iridescence>0&&(m.iridescence.value=u.iridescence,m.iridescenceIOR.value=u.iridescenceIOR,m.iridescenceThicknessMinimum.value=u.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=u.iridescenceThicknessRange[1],u.iridescenceMap&&(m.iridescenceMap.value=u.iridescenceMap,n(u.iridescenceMap,m.iridescenceMapTransform)),u.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=u.iridescenceThicknessMap,n(u.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),u.transmission>0&&(m.transmission.value=u.transmission,m.transmissionSamplerMap.value=_.texture,m.transmissionSamplerSize.value.set(_.width,_.height),u.transmissionMap&&(m.transmissionMap.value=u.transmissionMap,n(u.transmissionMap,m.transmissionMapTransform)),m.thickness.value=u.thickness,u.thicknessMap&&(m.thicknessMap.value=u.thicknessMap,n(u.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=u.attenuationDistance,m.attenuationColor.value.copy(u.attenuationColor)),u.anisotropy>0&&(m.anisotropyVector.value.set(u.anisotropy*Math.cos(u.anisotropyRotation),u.anisotropy*Math.sin(u.anisotropyRotation)),u.anisotropyMap&&(m.anisotropyMap.value=u.anisotropyMap,n(u.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=u.specularIntensity,m.specularColor.value.copy(u.specularColor),u.specularColorMap&&(m.specularColorMap.value=u.specularColorMap,n(u.specularColorMap,m.specularColorMapTransform)),u.specularIntensityMap&&(m.specularIntensityMap.value=u.specularIntensityMap,n(u.specularIntensityMap,m.specularIntensityMapTransform))}function v(m,u){u.matcap&&(m.matcap.value=u.matcap)}function S(m,u){const _=e.get(u).light;m.referencePosition.value.setFromMatrixPosition(_.matrixWorld),m.nearDistance.value=_.shadow.camera.near,m.farDistance.value=_.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:r}}function XT(t,e,n,i){let r={},s={},a=[];const o=t.getParameter(t.MAX_UNIFORM_BUFFER_BINDINGS);function l(_,x){const w=x.program;i.uniformBlockBinding(_,w)}function c(_,x){let w=r[_.id];w===void 0&&(v(_),w=d(_),r[_.id]=w,_.addEventListener("dispose",m));const P=x.program;i.updateUBOMapping(_,P);const b=e.render.frame;s[_.id]!==b&&(h(_),s[_.id]=b)}function d(_){const x=p();_.__bindingPointIndex=x;const w=t.createBuffer(),P=_.__size,b=_.usage;return t.bindBuffer(t.UNIFORM_BUFFER,w),t.bufferData(t.UNIFORM_BUFFER,P,b),t.bindBuffer(t.UNIFORM_BUFFER,null),t.bindBufferBase(t.UNIFORM_BUFFER,x,w),w}function p(){for(let _=0;_<o;_++)if(a.indexOf(_)===-1)return a.push(_),_;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function h(_){const x=r[_.id],w=_.uniforms,P=_.__cache;t.bindBuffer(t.UNIFORM_BUFFER,x);for(let b=0,A=w.length;b<A;b++){const N=Array.isArray(w[b])?w[b]:[w[b]];for(let V=0,y=N.length;V<y;V++){const T=N[V];if(g(T,b,V,P)===!0){const j=T.__offset,H=Array.isArray(T.value)?T.value:[T.value];let q=0;for(let Q=0;Q<H.length;Q++){const G=H[Q],Y=S(G);typeof G=="number"||typeof G=="boolean"?(T.__data[0]=G,t.bufferSubData(t.UNIFORM_BUFFER,j+q,T.__data)):G.isMatrix3?(T.__data[0]=G.elements[0],T.__data[1]=G.elements[1],T.__data[2]=G.elements[2],T.__data[3]=0,T.__data[4]=G.elements[3],T.__data[5]=G.elements[4],T.__data[6]=G.elements[5],T.__data[7]=0,T.__data[8]=G.elements[6],T.__data[9]=G.elements[7],T.__data[10]=G.elements[8],T.__data[11]=0):(G.toArray(T.__data,q),q+=Y.storage/Float32Array.BYTES_PER_ELEMENT)}t.bufferSubData(t.UNIFORM_BUFFER,j,T.__data)}}}t.bindBuffer(t.UNIFORM_BUFFER,null)}function g(_,x,w,P){const b=_.value,A=x+"_"+w;if(P[A]===void 0)return typeof b=="number"||typeof b=="boolean"?P[A]=b:P[A]=b.clone(),!0;{const N=P[A];if(typeof b=="number"||typeof b=="boolean"){if(N!==b)return P[A]=b,!0}else if(N.equals(b)===!1)return N.copy(b),!0}return!1}function v(_){const x=_.uniforms;let w=0;const P=16;for(let A=0,N=x.length;A<N;A++){const V=Array.isArray(x[A])?x[A]:[x[A]];for(let y=0,T=V.length;y<T;y++){const j=V[y],H=Array.isArray(j.value)?j.value:[j.value];for(let q=0,Q=H.length;q<Q;q++){const G=H[q],Y=S(G),L=w%P,K=L%Y.boundary,U=L+K;w+=K,U!==0&&P-U<Y.storage&&(w+=P-U),j.__data=new Float32Array(Y.storage/Float32Array.BYTES_PER_ELEMENT),j.__offset=w,w+=Y.storage}}}const b=w%P;return b>0&&(w+=P-b),_.__size=w,_.__cache={},this}function S(_){const x={boundary:0,storage:0};return typeof _=="number"||typeof _=="boolean"?(x.boundary=4,x.storage=4):_.isVector2?(x.boundary=8,x.storage=8):_.isVector3||_.isColor?(x.boundary=16,x.storage=12):_.isVector4?(x.boundary=16,x.storage=16):_.isMatrix3?(x.boundary=48,x.storage=48):_.isMatrix4?(x.boundary=64,x.storage=64):_.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",_),x}function m(_){const x=_.target;x.removeEventListener("dispose",m);const w=a.indexOf(x.__bindingPointIndex);a.splice(w,1),t.deleteBuffer(r[x.id]),delete r[x.id],delete s[x.id]}function u(){for(const _ in r)t.deleteBuffer(r[_]);a=[],r={},s={}}return{bind:l,update:c,dispose:u}}class qT{constructor(e={}){const{canvas:n=DS(),context:i=null,depth:r=!0,stencil:s=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:d="default",failIfMajorPerformanceCaveat:p=!1}=e;this.isWebGLRenderer=!0;let h;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");h=i.getContextAttributes().alpha}else h=a;const g=new Uint32Array(4),v=new Int32Array(4);let S=null,m=null;const u=[],_=[];this.domElement=n,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=jn,this.toneMapping=ji,this.toneMappingExposure=1;const x=this;let w=!1,P=0,b=0,A=null,N=-1,V=null;const y=new st,T=new st;let j=null;const H=new Xe(0);let q=0,Q=n.width,G=n.height,Y=1,L=null,K=null;const U=new st(0,0,Q,G),$=new st(0,0,Q,G);let ge=!1;const be=new Xf;let X=!1,te=!1;const le=new ft,ce=new ft,Le=new F,Ce=new st,Ve={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Qe=!1;function je(){return A===null?Y:1}let R=i;function Ye(E,I){return n.getContext(E,I)}try{const E={alpha:!0,depth:r,stencil:s,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:d,failIfMajorPerformanceCaveat:p};if("setAttribute"in n&&n.setAttribute("data-engine",`three.js r${kf}`),n.addEventListener("webglcontextlost",ee,!1),n.addEventListener("webglcontextrestored",de,!1),n.addEventListener("webglcontextcreationerror",pe,!1),R===null){const I="webgl2";if(R=Ye(I,E),R===null)throw Ye(I)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(E){throw console.error("THREE.WebGLRenderer: "+E.message),E}let Ue,Oe,Ae,rt,Ne,C,M,O,J,ne,Z,we,ue,xe,$e,re,ve,De,Ie,_e,Ge,Fe,at,D;function he(){Ue=new Qw(R),Ue.init(),Fe=new FT(R,Ue),Oe=new Ww(R,Ue,e,Fe),Ae=new IT(R),Oe.reverseDepthBuffer&&Ae.buffers.depth.setReversed(!0),rt=new tE(R),Ne=new _T,C=new kT(R,Ue,Ae,Ne,Oe,Fe,rt),M=new qw(x),O=new Zw(x),J=new o1(R),at=new jw(R,J),ne=new Jw(R,J,rt,at),Z=new iE(R,ne,J,rt),Ie=new nE(R,Oe,C),re=new Xw(Ne),we=new vT(x,M,O,Ue,Oe,at,re),ue=new WT(x,Ne),xe=new ST,$e=new AT(Ue),De=new Vw(x,M,O,Ae,Z,h,l),ve=new LT(x,Z,Oe),D=new XT(R,rt,Oe,Ae),_e=new Gw(R,Ue,rt),Ge=new eE(R,Ue,rt),rt.programs=we.programs,x.capabilities=Oe,x.extensions=Ue,x.properties=Ne,x.renderLists=xe,x.shadowMap=ve,x.state=Ae,x.info=rt}he();const W=new jT(x,R);this.xr=W,this.getContext=function(){return R},this.getContextAttributes=function(){return R.getContextAttributes()},this.forceContextLoss=function(){const E=Ue.get("WEBGL_lose_context");E&&E.loseContext()},this.forceContextRestore=function(){const E=Ue.get("WEBGL_lose_context");E&&E.restoreContext()},this.getPixelRatio=function(){return Y},this.setPixelRatio=function(E){E!==void 0&&(Y=E,this.setSize(Q,G,!1))},this.getSize=function(E){return E.set(Q,G)},this.setSize=function(E,I,z=!0){if(W.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}Q=E,G=I,n.width=Math.floor(E*Y),n.height=Math.floor(I*Y),z===!0&&(n.style.width=E+"px",n.style.height=I+"px"),this.setViewport(0,0,E,I)},this.getDrawingBufferSize=function(E){return E.set(Q*Y,G*Y).floor()},this.setDrawingBufferSize=function(E,I,z){Q=E,G=I,Y=z,n.width=Math.floor(E*z),n.height=Math.floor(I*z),this.setViewport(0,0,E,I)},this.getCurrentViewport=function(E){return E.copy(y)},this.getViewport=function(E){return E.copy(U)},this.setViewport=function(E,I,z,B){E.isVector4?U.set(E.x,E.y,E.z,E.w):U.set(E,I,z,B),Ae.viewport(y.copy(U).multiplyScalar(Y).round())},this.getScissor=function(E){return E.copy($)},this.setScissor=function(E,I,z,B){E.isVector4?$.set(E.x,E.y,E.z,E.w):$.set(E,I,z,B),Ae.scissor(T.copy($).multiplyScalar(Y).round())},this.getScissorTest=function(){return ge},this.setScissorTest=function(E){Ae.setScissorTest(ge=E)},this.setOpaqueSort=function(E){L=E},this.setTransparentSort=function(E){K=E},this.getClearColor=function(E){return E.copy(De.getClearColor())},this.setClearColor=function(){De.setClearColor.apply(De,arguments)},this.getClearAlpha=function(){return De.getClearAlpha()},this.setClearAlpha=function(){De.setClearAlpha.apply(De,arguments)},this.clear=function(E=!0,I=!0,z=!0){let B=0;if(E){let k=!1;if(A!==null){const se=A.texture.format;k=se===Vf||se===Hf||se===Bf}if(k){const se=A.texture.type,fe=se===mi||se===Er||se===Ca||se===ws||se===Of||se===zf,ye=De.getClearColor(),Me=De.getClearAlpha(),Re=ye.r,Pe=ye.g,Ee=ye.b;fe?(g[0]=Re,g[1]=Pe,g[2]=Ee,g[3]=Me,R.clearBufferuiv(R.COLOR,0,g)):(v[0]=Re,v[1]=Pe,v[2]=Ee,v[3]=Me,R.clearBufferiv(R.COLOR,0,v))}else B|=R.COLOR_BUFFER_BIT}I&&(B|=R.DEPTH_BUFFER_BIT,R.clearDepth(this.capabilities.reverseDepthBuffer?0:1)),z&&(B|=R.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),R.clear(B)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){n.removeEventListener("webglcontextlost",ee,!1),n.removeEventListener("webglcontextrestored",de,!1),n.removeEventListener("webglcontextcreationerror",pe,!1),xe.dispose(),$e.dispose(),Ne.dispose(),M.dispose(),O.dispose(),Z.dispose(),at.dispose(),D.dispose(),we.dispose(),W.dispose(),W.removeEventListener("sessionstart",Kf),W.removeEventListener("sessionend",Zf),Qi.stop()};function ee(E){E.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),w=!0}function de(){console.log("THREE.WebGLRenderer: Context Restored."),w=!1;const E=rt.autoReset,I=ve.enabled,z=ve.autoUpdate,B=ve.needsUpdate,k=ve.type;he(),rt.autoReset=E,ve.enabled=I,ve.autoUpdate=z,ve.needsUpdate=B,ve.type=k}function pe(E){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",E.statusMessage)}function We(E){const I=E.target;I.removeEventListener("dispose",We),St(I)}function St(E){Yt(E),Ne.remove(E)}function Yt(E){const I=Ne.get(E).programs;I!==void 0&&(I.forEach(function(z){we.releaseProgram(z)}),E.isShaderMaterial&&we.releaseShaderCache(E))}this.renderBufferDirect=function(E,I,z,B,k,se){I===null&&(I=Ve);const fe=k.isMesh&&k.matrixWorld.determinant()<0,ye=wx(E,I,z,B,k);Ae.setMaterial(B,fe);let Me=z.index,Re=1;if(B.wireframe===!0){if(Me=ne.getWireframeAttribute(z),Me===void 0)return;Re=2}const Pe=z.drawRange,Ee=z.attributes.position;let nt=Pe.start*Re,lt=(Pe.start+Pe.count)*Re;se!==null&&(nt=Math.max(nt,se.start*Re),lt=Math.min(lt,(se.start+se.count)*Re)),Me!==null?(nt=Math.max(nt,0),lt=Math.min(lt,Me.count)):Ee!=null&&(nt=Math.max(nt,0),lt=Math.min(lt,Ee.count));const xt=lt-nt;if(xt<0||xt===1/0)return;at.setup(k,B,ye,z,Me);let sn,Je=_e;if(Me!==null&&(sn=J.get(Me),Je=Ge,Je.setIndex(sn)),k.isMesh)B.wireframe===!0?(Ae.setLineWidth(B.wireframeLinewidth*je()),Je.setMode(R.LINES)):Je.setMode(R.TRIANGLES);else if(k.isLine){let Te=B.linewidth;Te===void 0&&(Te=1),Ae.setLineWidth(Te*je()),k.isLineSegments?Je.setMode(R.LINES):k.isLineLoop?Je.setMode(R.LINE_LOOP):Je.setMode(R.LINE_STRIP)}else k.isPoints?Je.setMode(R.POINTS):k.isSprite&&Je.setMode(R.TRIANGLES);if(k.isBatchedMesh)if(k._multiDrawInstances!==null)Je.renderMultiDrawInstances(k._multiDrawStarts,k._multiDrawCounts,k._multiDrawCount,k._multiDrawInstances);else if(Ue.get("WEBGL_multi_draw"))Je.renderMultiDraw(k._multiDrawStarts,k._multiDrawCounts,k._multiDrawCount);else{const Te=k._multiDrawStarts,Pt=k._multiDrawCounts,et=k._multiDrawCount,Cn=Me?J.get(Me).bytesPerElement:1,Cr=Ne.get(B).currentProgram.getUniforms();for(let an=0;an<et;an++)Cr.setValue(R,"_gl_DrawID",an),Je.render(Te[an]/Cn,Pt[an])}else if(k.isInstancedMesh)Je.renderInstances(nt,xt,k.count);else if(z.isInstancedBufferGeometry){const Te=z._maxInstanceCount!==void 0?z._maxInstanceCount:1/0,Pt=Math.min(z.instanceCount,Te);Je.renderInstances(nt,xt,Pt)}else Je.render(nt,xt)};function Ze(E,I,z){E.transparent===!0&&E.side===Xn&&E.forceSinglePass===!1?(E.side=rn,E.needsUpdate=!0,Va(E,I,z),E.side=Xi,E.needsUpdate=!0,Va(E,I,z),E.side=Xn):Va(E,I,z)}this.compile=function(E,I,z=null){z===null&&(z=E),m=$e.get(z),m.init(I),_.push(m),z.traverseVisible(function(k){k.isLight&&k.layers.test(I.layers)&&(m.pushLight(k),k.castShadow&&m.pushShadow(k))}),E!==z&&E.traverseVisible(function(k){k.isLight&&k.layers.test(I.layers)&&(m.pushLight(k),k.castShadow&&m.pushShadow(k))}),m.setupLights();const B=new Set;return E.traverse(function(k){if(!(k.isMesh||k.isPoints||k.isLine||k.isSprite))return;const se=k.material;if(se)if(Array.isArray(se))for(let fe=0;fe<se.length;fe++){const ye=se[fe];Ze(ye,z,k),B.add(ye)}else Ze(se,z,k),B.add(se)}),_.pop(),m=null,B},this.compileAsync=function(E,I,z=null){const B=this.compile(E,I,z);return new Promise(k=>{function se(){if(B.forEach(function(fe){Ne.get(fe).currentProgram.isReady()&&B.delete(fe)}),B.size===0){k(E);return}setTimeout(se,10)}Ue.get("KHR_parallel_shader_compile")!==null?se():setTimeout(se,10)})};let $t=null;function Zn(E){$t&&$t(E)}function Kf(){Qi.stop()}function Zf(){Qi.start()}const Qi=new hx;Qi.setAnimationLoop(Zn),typeof self<"u"&&Qi.setContext(self),this.setAnimationLoop=function(E){$t=E,W.setAnimationLoop(E),E===null?Qi.stop():Qi.start()},W.addEventListener("sessionstart",Kf),W.addEventListener("sessionend",Zf),this.render=function(E,I){if(I!==void 0&&I.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(w===!0)return;if(E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),I.parent===null&&I.matrixWorldAutoUpdate===!0&&I.updateMatrixWorld(),W.enabled===!0&&W.isPresenting===!0&&(W.cameraAutoUpdate===!0&&W.updateCamera(I),I=W.getCamera()),E.isScene===!0&&E.onBeforeRender(x,E,I,A),m=$e.get(E,_.length),m.init(I),_.push(m),ce.multiplyMatrices(I.projectionMatrix,I.matrixWorldInverse),be.setFromProjectionMatrix(ce),te=this.localClippingEnabled,X=re.init(this.clippingPlanes,te),S=xe.get(E,u.length),S.init(),u.push(S),W.enabled===!0&&W.isPresenting===!0){const se=x.xr.getDepthSensingMesh();se!==null&&Wl(se,I,-1/0,x.sortObjects)}Wl(E,I,0,x.sortObjects),S.finish(),x.sortObjects===!0&&S.sort(L,K),Qe=W.enabled===!1||W.isPresenting===!1||W.hasDepthSensing()===!1,Qe&&De.addToRenderList(S,E),this.info.render.frame++,X===!0&&re.beginShadows();const z=m.state.shadowsArray;ve.render(z,E,I),X===!0&&re.endShadows(),this.info.autoReset===!0&&this.info.reset();const B=S.opaque,k=S.transmissive;if(m.setupLights(),I.isArrayCamera){const se=I.cameras;if(k.length>0)for(let fe=0,ye=se.length;fe<ye;fe++){const Me=se[fe];Jf(B,k,E,Me)}Qe&&De.render(E);for(let fe=0,ye=se.length;fe<ye;fe++){const Me=se[fe];Qf(S,E,Me,Me.viewport)}}else k.length>0&&Jf(B,k,E,I),Qe&&De.render(E),Qf(S,E,I);A!==null&&(C.updateMultisampleRenderTarget(A),C.updateRenderTargetMipmap(A)),E.isScene===!0&&E.onAfterRender(x,E,I),at.resetDefaultState(),N=-1,V=null,_.pop(),_.length>0?(m=_[_.length-1],X===!0&&re.setGlobalState(x.clippingPlanes,m.state.camera)):m=null,u.pop(),u.length>0?S=u[u.length-1]:S=null};function Wl(E,I,z,B){if(E.visible===!1)return;if(E.layers.test(I.layers)){if(E.isGroup)z=E.renderOrder;else if(E.isLOD)E.autoUpdate===!0&&E.update(I);else if(E.isLight)m.pushLight(E),E.castShadow&&m.pushShadow(E);else if(E.isSprite){if(!E.frustumCulled||be.intersectsSprite(E)){B&&Ce.setFromMatrixPosition(E.matrixWorld).applyMatrix4(ce);const fe=Z.update(E),ye=E.material;ye.visible&&S.push(E,fe,ye,z,Ce.z,null)}}else if((E.isMesh||E.isLine||E.isPoints)&&(!E.frustumCulled||be.intersectsObject(E))){const fe=Z.update(E),ye=E.material;if(B&&(E.boundingSphere!==void 0?(E.boundingSphere===null&&E.computeBoundingSphere(),Ce.copy(E.boundingSphere.center)):(fe.boundingSphere===null&&fe.computeBoundingSphere(),Ce.copy(fe.boundingSphere.center)),Ce.applyMatrix4(E.matrixWorld).applyMatrix4(ce)),Array.isArray(ye)){const Me=fe.groups;for(let Re=0,Pe=Me.length;Re<Pe;Re++){const Ee=Me[Re],nt=ye[Ee.materialIndex];nt&&nt.visible&&S.push(E,fe,nt,z,Ce.z,Ee)}}else ye.visible&&S.push(E,fe,ye,z,Ce.z,null)}}const se=E.children;for(let fe=0,ye=se.length;fe<ye;fe++)Wl(se[fe],I,z,B)}function Qf(E,I,z,B){const k=E.opaque,se=E.transmissive,fe=E.transparent;m.setupLightsView(z),X===!0&&re.setGlobalState(x.clippingPlanes,z),B&&Ae.viewport(y.copy(B)),k.length>0&&Ha(k,I,z),se.length>0&&Ha(se,I,z),fe.length>0&&Ha(fe,I,z),Ae.buffers.depth.setTest(!0),Ae.buffers.depth.setMask(!0),Ae.buffers.color.setMask(!0),Ae.setPolygonOffset(!1)}function Jf(E,I,z,B){if((z.isScene===!0?z.overrideMaterial:null)!==null)return;m.state.transmissionRenderTarget[B.id]===void 0&&(m.state.transmissionRenderTarget[B.id]=new Tr(1,1,{generateMipmaps:!0,type:Ue.has("EXT_color_buffer_half_float")||Ue.has("EXT_color_buffer_float")?Ua:mi,minFilter:mr,samples:4,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:tt.workingColorSpace}));const se=m.state.transmissionRenderTarget[B.id],fe=B.viewport||y;se.setSize(fe.z,fe.w);const ye=x.getRenderTarget();x.setRenderTarget(se),x.getClearColor(H),q=x.getClearAlpha(),q<1&&x.setClearColor(16777215,.5),x.clear(),Qe&&De.render(z);const Me=x.toneMapping;x.toneMapping=ji;const Re=B.viewport;if(B.viewport!==void 0&&(B.viewport=void 0),m.setupLightsView(B),X===!0&&re.setGlobalState(x.clippingPlanes,B),Ha(E,z,B),C.updateMultisampleRenderTarget(se),C.updateRenderTargetMipmap(se),Ue.has("WEBGL_multisampled_render_to_texture")===!1){let Pe=!1;for(let Ee=0,nt=I.length;Ee<nt;Ee++){const lt=I[Ee],xt=lt.object,sn=lt.geometry,Je=lt.material,Te=lt.group;if(Je.side===Xn&&xt.layers.test(B.layers)){const Pt=Je.side;Je.side=rn,Je.needsUpdate=!0,eh(xt,z,B,sn,Je,Te),Je.side=Pt,Je.needsUpdate=!0,Pe=!0}}Pe===!0&&(C.updateMultisampleRenderTarget(se),C.updateRenderTargetMipmap(se))}x.setRenderTarget(ye),x.setClearColor(H,q),Re!==void 0&&(B.viewport=Re),x.toneMapping=Me}function Ha(E,I,z){const B=I.isScene===!0?I.overrideMaterial:null;for(let k=0,se=E.length;k<se;k++){const fe=E[k],ye=fe.object,Me=fe.geometry,Re=B===null?fe.material:B,Pe=fe.group;ye.layers.test(z.layers)&&eh(ye,I,z,Me,Re,Pe)}}function eh(E,I,z,B,k,se){E.onBeforeRender(x,I,z,B,k,se),E.modelViewMatrix.multiplyMatrices(z.matrixWorldInverse,E.matrixWorld),E.normalMatrix.getNormalMatrix(E.modelViewMatrix),k.onBeforeRender(x,I,z,B,E,se),k.transparent===!0&&k.side===Xn&&k.forceSinglePass===!1?(k.side=rn,k.needsUpdate=!0,x.renderBufferDirect(z,I,B,k,E,se),k.side=Xi,k.needsUpdate=!0,x.renderBufferDirect(z,I,B,k,E,se),k.side=Xn):x.renderBufferDirect(z,I,B,k,E,se),E.onAfterRender(x,I,z,B,k,se)}function Va(E,I,z){I.isScene!==!0&&(I=Ve);const B=Ne.get(E),k=m.state.lights,se=m.state.shadowsArray,fe=k.state.version,ye=we.getParameters(E,k.state,se,I,z),Me=we.getProgramCacheKey(ye);let Re=B.programs;B.environment=E.isMeshStandardMaterial?I.environment:null,B.fog=I.fog,B.envMap=(E.isMeshStandardMaterial?O:M).get(E.envMap||B.environment),B.envMapRotation=B.environment!==null&&E.envMap===null?I.environmentRotation:E.envMapRotation,Re===void 0&&(E.addEventListener("dispose",We),Re=new Map,B.programs=Re);let Pe=Re.get(Me);if(Pe!==void 0){if(B.currentProgram===Pe&&B.lightsStateVersion===fe)return nh(E,ye),Pe}else ye.uniforms=we.getUniforms(E),E.onBeforeCompile(ye,x),Pe=we.acquireProgram(ye,Me),Re.set(Me,Pe),B.uniforms=ye.uniforms;const Ee=B.uniforms;return(!E.isShaderMaterial&&!E.isRawShaderMaterial||E.clipping===!0)&&(Ee.clippingPlanes=re.uniform),nh(E,ye),B.needsLights=Tx(E),B.lightsStateVersion=fe,B.needsLights&&(Ee.ambientLightColor.value=k.state.ambient,Ee.lightProbe.value=k.state.probe,Ee.directionalLights.value=k.state.directional,Ee.directionalLightShadows.value=k.state.directionalShadow,Ee.spotLights.value=k.state.spot,Ee.spotLightShadows.value=k.state.spotShadow,Ee.rectAreaLights.value=k.state.rectArea,Ee.ltc_1.value=k.state.rectAreaLTC1,Ee.ltc_2.value=k.state.rectAreaLTC2,Ee.pointLights.value=k.state.point,Ee.pointLightShadows.value=k.state.pointShadow,Ee.hemisphereLights.value=k.state.hemi,Ee.directionalShadowMap.value=k.state.directionalShadowMap,Ee.directionalShadowMatrix.value=k.state.directionalShadowMatrix,Ee.spotShadowMap.value=k.state.spotShadowMap,Ee.spotLightMatrix.value=k.state.spotLightMatrix,Ee.spotLightMap.value=k.state.spotLightMap,Ee.pointShadowMap.value=k.state.pointShadowMap,Ee.pointShadowMatrix.value=k.state.pointShadowMatrix),B.currentProgram=Pe,B.uniformsList=null,Pe}function th(E){if(E.uniformsList===null){const I=E.currentProgram.getUniforms();E.uniformsList=Yo.seqWithValue(I.seq,E.uniforms)}return E.uniformsList}function nh(E,I){const z=Ne.get(E);z.outputColorSpace=I.outputColorSpace,z.batching=I.batching,z.batchingColor=I.batchingColor,z.instancing=I.instancing,z.instancingColor=I.instancingColor,z.instancingMorph=I.instancingMorph,z.skinning=I.skinning,z.morphTargets=I.morphTargets,z.morphNormals=I.morphNormals,z.morphColors=I.morphColors,z.morphTargetsCount=I.morphTargetsCount,z.numClippingPlanes=I.numClippingPlanes,z.numIntersection=I.numClipIntersection,z.vertexAlphas=I.vertexAlphas,z.vertexTangents=I.vertexTangents,z.toneMapping=I.toneMapping}function wx(E,I,z,B,k){I.isScene!==!0&&(I=Ve),C.resetTextureUnits();const se=I.fog,fe=B.isMeshStandardMaterial?I.environment:null,ye=A===null?x.outputColorSpace:A.isXRRenderTarget===!0?A.texture.colorSpace:Zi,Me=(B.isMeshStandardMaterial?O:M).get(B.envMap||fe),Re=B.vertexColors===!0&&!!z.attributes.color&&z.attributes.color.itemSize===4,Pe=!!z.attributes.tangent&&(!!B.normalMap||B.anisotropy>0),Ee=!!z.morphAttributes.position,nt=!!z.morphAttributes.normal,lt=!!z.morphAttributes.color;let xt=ji;B.toneMapped&&(A===null||A.isXRRenderTarget===!0)&&(xt=x.toneMapping);const sn=z.morphAttributes.position||z.morphAttributes.normal||z.morphAttributes.color,Je=sn!==void 0?sn.length:0,Te=Ne.get(B),Pt=m.state.lights;if(X===!0&&(te===!0||E!==V)){const xn=E===V&&B.id===N;re.setState(B,E,xn)}let et=!1;B.version===Te.__version?(Te.needsLights&&Te.lightsStateVersion!==Pt.state.version||Te.outputColorSpace!==ye||k.isBatchedMesh&&Te.batching===!1||!k.isBatchedMesh&&Te.batching===!0||k.isBatchedMesh&&Te.batchingColor===!0&&k.colorTexture===null||k.isBatchedMesh&&Te.batchingColor===!1&&k.colorTexture!==null||k.isInstancedMesh&&Te.instancing===!1||!k.isInstancedMesh&&Te.instancing===!0||k.isSkinnedMesh&&Te.skinning===!1||!k.isSkinnedMesh&&Te.skinning===!0||k.isInstancedMesh&&Te.instancingColor===!0&&k.instanceColor===null||k.isInstancedMesh&&Te.instancingColor===!1&&k.instanceColor!==null||k.isInstancedMesh&&Te.instancingMorph===!0&&k.morphTexture===null||k.isInstancedMesh&&Te.instancingMorph===!1&&k.morphTexture!==null||Te.envMap!==Me||B.fog===!0&&Te.fog!==se||Te.numClippingPlanes!==void 0&&(Te.numClippingPlanes!==re.numPlanes||Te.numIntersection!==re.numIntersection)||Te.vertexAlphas!==Re||Te.vertexTangents!==Pe||Te.morphTargets!==Ee||Te.morphNormals!==nt||Te.morphColors!==lt||Te.toneMapping!==xt||Te.morphTargetsCount!==Je)&&(et=!0):(et=!0,Te.__version=B.version);let Cn=Te.currentProgram;et===!0&&(Cn=Va(B,I,k));let Cr=!1,an=!1,Xl=!1;const _t=Cn.getUniforms(),vi=Te.uniforms;if(Ae.useProgram(Cn.program)&&(Cr=!0,an=!0,Xl=!0),B.id!==N&&(N=B.id,an=!0),Cr||V!==E){Oe.reverseDepthBuffer?(le.copy(E.projectionMatrix),US(le),kS(le),_t.setValue(R,"projectionMatrix",le)):_t.setValue(R,"projectionMatrix",E.projectionMatrix),_t.setValue(R,"viewMatrix",E.matrixWorldInverse);const xn=_t.map.cameraPosition;xn!==void 0&&xn.setValue(R,Le.setFromMatrixPosition(E.matrixWorld)),Oe.logarithmicDepthBuffer&&_t.setValue(R,"logDepthBufFC",2/(Math.log(E.far+1)/Math.LN2)),(B.isMeshPhongMaterial||B.isMeshToonMaterial||B.isMeshLambertMaterial||B.isMeshBasicMaterial||B.isMeshStandardMaterial||B.isShaderMaterial)&&_t.setValue(R,"isOrthographic",E.isOrthographicCamera===!0),V!==E&&(V=E,an=!0,Xl=!0)}if(k.isSkinnedMesh){_t.setOptional(R,k,"bindMatrix"),_t.setOptional(R,k,"bindMatrixInverse");const xn=k.skeleton;xn&&(xn.boneTexture===null&&xn.computeBoneTexture(),_t.setValue(R,"boneTexture",xn.boneTexture,C))}k.isBatchedMesh&&(_t.setOptional(R,k,"batchingTexture"),_t.setValue(R,"batchingTexture",k._matricesTexture,C),_t.setOptional(R,k,"batchingIdTexture"),_t.setValue(R,"batchingIdTexture",k._indirectTexture,C),_t.setOptional(R,k,"batchingColorTexture"),k._colorsTexture!==null&&_t.setValue(R,"batchingColorTexture",k._colorsTexture,C));const ql=z.morphAttributes;if((ql.position!==void 0||ql.normal!==void 0||ql.color!==void 0)&&Ie.update(k,z,Cn),(an||Te.receiveShadow!==k.receiveShadow)&&(Te.receiveShadow=k.receiveShadow,_t.setValue(R,"receiveShadow",k.receiveShadow)),B.isMeshGouraudMaterial&&B.envMap!==null&&(vi.envMap.value=Me,vi.flipEnvMap.value=Me.isCubeTexture&&Me.isRenderTargetTexture===!1?-1:1),B.isMeshStandardMaterial&&B.envMap===null&&I.environment!==null&&(vi.envMapIntensity.value=I.environmentIntensity),an&&(_t.setValue(R,"toneMappingExposure",x.toneMappingExposure),Te.needsLights&&Ex(vi,Xl),se&&B.fog===!0&&ue.refreshFogUniforms(vi,se),ue.refreshMaterialUniforms(vi,B,Y,G,m.state.transmissionRenderTarget[E.id]),Yo.upload(R,th(Te),vi,C)),B.isShaderMaterial&&B.uniformsNeedUpdate===!0&&(Yo.upload(R,th(Te),vi,C),B.uniformsNeedUpdate=!1),B.isSpriteMaterial&&_t.setValue(R,"center",k.center),_t.setValue(R,"modelViewMatrix",k.modelViewMatrix),_t.setValue(R,"normalMatrix",k.normalMatrix),_t.setValue(R,"modelMatrix",k.matrixWorld),B.isShaderMaterial||B.isRawShaderMaterial){const xn=B.uniformsGroups;for(let Yl=0,bx=xn.length;Yl<bx;Yl++){const ih=xn[Yl];D.update(ih,Cn),D.bind(ih,Cn)}}return Cn}function Ex(E,I){E.ambientLightColor.needsUpdate=I,E.lightProbe.needsUpdate=I,E.directionalLights.needsUpdate=I,E.directionalLightShadows.needsUpdate=I,E.pointLights.needsUpdate=I,E.pointLightShadows.needsUpdate=I,E.spotLights.needsUpdate=I,E.spotLightShadows.needsUpdate=I,E.rectAreaLights.needsUpdate=I,E.hemisphereLights.needsUpdate=I}function Tx(E){return E.isMeshLambertMaterial||E.isMeshToonMaterial||E.isMeshPhongMaterial||E.isMeshStandardMaterial||E.isShadowMaterial||E.isShaderMaterial&&E.lights===!0}this.getActiveCubeFace=function(){return P},this.getActiveMipmapLevel=function(){return b},this.getRenderTarget=function(){return A},this.setRenderTargetTextures=function(E,I,z){Ne.get(E.texture).__webglTexture=I,Ne.get(E.depthTexture).__webglTexture=z;const B=Ne.get(E);B.__hasExternalTextures=!0,B.__autoAllocateDepthBuffer=z===void 0,B.__autoAllocateDepthBuffer||Ue.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),B.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(E,I){const z=Ne.get(E);z.__webglFramebuffer=I,z.__useDefaultFramebuffer=I===void 0},this.setRenderTarget=function(E,I=0,z=0){A=E,P=I,b=z;let B=!0,k=null,se=!1,fe=!1;if(E){const Me=Ne.get(E);if(Me.__useDefaultFramebuffer!==void 0)Ae.bindFramebuffer(R.FRAMEBUFFER,null),B=!1;else if(Me.__webglFramebuffer===void 0)C.setupRenderTarget(E);else if(Me.__hasExternalTextures)C.rebindTextures(E,Ne.get(E.texture).__webglTexture,Ne.get(E.depthTexture).__webglTexture);else if(E.depthBuffer){const Ee=E.depthTexture;if(Me.__boundDepthTexture!==Ee){if(Ee!==null&&Ne.has(Ee)&&(E.width!==Ee.image.width||E.height!==Ee.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");C.setupDepthRenderbuffer(E)}}const Re=E.texture;(Re.isData3DTexture||Re.isDataArrayTexture||Re.isCompressedArrayTexture)&&(fe=!0);const Pe=Ne.get(E).__webglFramebuffer;E.isWebGLCubeRenderTarget?(Array.isArray(Pe[I])?k=Pe[I][z]:k=Pe[I],se=!0):E.samples>0&&C.useMultisampledRTT(E)===!1?k=Ne.get(E).__webglMultisampledFramebuffer:Array.isArray(Pe)?k=Pe[z]:k=Pe,y.copy(E.viewport),T.copy(E.scissor),j=E.scissorTest}else y.copy(U).multiplyScalar(Y).floor(),T.copy($).multiplyScalar(Y).floor(),j=ge;if(Ae.bindFramebuffer(R.FRAMEBUFFER,k)&&B&&Ae.drawBuffers(E,k),Ae.viewport(y),Ae.scissor(T),Ae.setScissorTest(j),se){const Me=Ne.get(E.texture);R.framebufferTexture2D(R.FRAMEBUFFER,R.COLOR_ATTACHMENT0,R.TEXTURE_CUBE_MAP_POSITIVE_X+I,Me.__webglTexture,z)}else if(fe){const Me=Ne.get(E.texture),Re=I||0;R.framebufferTextureLayer(R.FRAMEBUFFER,R.COLOR_ATTACHMENT0,Me.__webglTexture,z||0,Re)}N=-1},this.readRenderTargetPixels=function(E,I,z,B,k,se,fe){if(!(E&&E.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let ye=Ne.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&fe!==void 0&&(ye=ye[fe]),ye){Ae.bindFramebuffer(R.FRAMEBUFFER,ye);try{const Me=E.texture,Re=Me.format,Pe=Me.type;if(!Oe.textureFormatReadable(Re)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Oe.textureTypeReadable(Pe)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}I>=0&&I<=E.width-B&&z>=0&&z<=E.height-k&&R.readPixels(I,z,B,k,Fe.convert(Re),Fe.convert(Pe),se)}finally{const Me=A!==null?Ne.get(A).__webglFramebuffer:null;Ae.bindFramebuffer(R.FRAMEBUFFER,Me)}}},this.readRenderTargetPixelsAsync=async function(E,I,z,B,k,se,fe){if(!(E&&E.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let ye=Ne.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&fe!==void 0&&(ye=ye[fe]),ye){const Me=E.texture,Re=Me.format,Pe=Me.type;if(!Oe.textureFormatReadable(Re))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Oe.textureTypeReadable(Pe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(I>=0&&I<=E.width-B&&z>=0&&z<=E.height-k){Ae.bindFramebuffer(R.FRAMEBUFFER,ye);const Ee=R.createBuffer();R.bindBuffer(R.PIXEL_PACK_BUFFER,Ee),R.bufferData(R.PIXEL_PACK_BUFFER,se.byteLength,R.STREAM_READ),R.readPixels(I,z,B,k,Fe.convert(Re),Fe.convert(Pe),0);const nt=A!==null?Ne.get(A).__webglFramebuffer:null;Ae.bindFramebuffer(R.FRAMEBUFFER,nt);const lt=R.fenceSync(R.SYNC_GPU_COMMANDS_COMPLETE,0);return R.flush(),await IS(R,lt,4),R.bindBuffer(R.PIXEL_PACK_BUFFER,Ee),R.getBufferSubData(R.PIXEL_PACK_BUFFER,0,se),R.deleteBuffer(Ee),R.deleteSync(lt),se}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(E,I=null,z=0){E.isTexture!==!0&&(qo("WebGLRenderer: copyFramebufferToTexture function signature has changed."),I=arguments[0]||null,E=arguments[1]);const B=Math.pow(2,-z),k=Math.floor(E.image.width*B),se=Math.floor(E.image.height*B),fe=I!==null?I.x:0,ye=I!==null?I.y:0;C.setTexture2D(E,0),R.copyTexSubImage2D(R.TEXTURE_2D,z,0,0,fe,ye,k,se),Ae.unbindTexture()},this.copyTextureToTexture=function(E,I,z=null,B=null,k=0){E.isTexture!==!0&&(qo("WebGLRenderer: copyTextureToTexture function signature has changed."),B=arguments[0]||null,E=arguments[1],I=arguments[2],k=arguments[3]||0,z=null);let se,fe,ye,Me,Re,Pe;z!==null?(se=z.max.x-z.min.x,fe=z.max.y-z.min.y,ye=z.min.x,Me=z.min.y):(se=E.image.width,fe=E.image.height,ye=0,Me=0),B!==null?(Re=B.x,Pe=B.y):(Re=0,Pe=0);const Ee=Fe.convert(I.format),nt=Fe.convert(I.type);C.setTexture2D(I,0),R.pixelStorei(R.UNPACK_FLIP_Y_WEBGL,I.flipY),R.pixelStorei(R.UNPACK_PREMULTIPLY_ALPHA_WEBGL,I.premultiplyAlpha),R.pixelStorei(R.UNPACK_ALIGNMENT,I.unpackAlignment);const lt=R.getParameter(R.UNPACK_ROW_LENGTH),xt=R.getParameter(R.UNPACK_IMAGE_HEIGHT),sn=R.getParameter(R.UNPACK_SKIP_PIXELS),Je=R.getParameter(R.UNPACK_SKIP_ROWS),Te=R.getParameter(R.UNPACK_SKIP_IMAGES),Pt=E.isCompressedTexture?E.mipmaps[k]:E.image;R.pixelStorei(R.UNPACK_ROW_LENGTH,Pt.width),R.pixelStorei(R.UNPACK_IMAGE_HEIGHT,Pt.height),R.pixelStorei(R.UNPACK_SKIP_PIXELS,ye),R.pixelStorei(R.UNPACK_SKIP_ROWS,Me),E.isDataTexture?R.texSubImage2D(R.TEXTURE_2D,k,Re,Pe,se,fe,Ee,nt,Pt.data):E.isCompressedTexture?R.compressedTexSubImage2D(R.TEXTURE_2D,k,Re,Pe,Pt.width,Pt.height,Ee,Pt.data):R.texSubImage2D(R.TEXTURE_2D,k,Re,Pe,se,fe,Ee,nt,Pt),R.pixelStorei(R.UNPACK_ROW_LENGTH,lt),R.pixelStorei(R.UNPACK_IMAGE_HEIGHT,xt),R.pixelStorei(R.UNPACK_SKIP_PIXELS,sn),R.pixelStorei(R.UNPACK_SKIP_ROWS,Je),R.pixelStorei(R.UNPACK_SKIP_IMAGES,Te),k===0&&I.generateMipmaps&&R.generateMipmap(R.TEXTURE_2D),Ae.unbindTexture()},this.copyTextureToTexture3D=function(E,I,z=null,B=null,k=0){E.isTexture!==!0&&(qo("WebGLRenderer: copyTextureToTexture3D function signature has changed."),z=arguments[0]||null,B=arguments[1]||null,E=arguments[2],I=arguments[3],k=arguments[4]||0);let se,fe,ye,Me,Re,Pe,Ee,nt,lt;const xt=E.isCompressedTexture?E.mipmaps[k]:E.image;z!==null?(se=z.max.x-z.min.x,fe=z.max.y-z.min.y,ye=z.max.z-z.min.z,Me=z.min.x,Re=z.min.y,Pe=z.min.z):(se=xt.width,fe=xt.height,ye=xt.depth,Me=0,Re=0,Pe=0),B!==null?(Ee=B.x,nt=B.y,lt=B.z):(Ee=0,nt=0,lt=0);const sn=Fe.convert(I.format),Je=Fe.convert(I.type);let Te;if(I.isData3DTexture)C.setTexture3D(I,0),Te=R.TEXTURE_3D;else if(I.isDataArrayTexture||I.isCompressedArrayTexture)C.setTexture2DArray(I,0),Te=R.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}R.pixelStorei(R.UNPACK_FLIP_Y_WEBGL,I.flipY),R.pixelStorei(R.UNPACK_PREMULTIPLY_ALPHA_WEBGL,I.premultiplyAlpha),R.pixelStorei(R.UNPACK_ALIGNMENT,I.unpackAlignment);const Pt=R.getParameter(R.UNPACK_ROW_LENGTH),et=R.getParameter(R.UNPACK_IMAGE_HEIGHT),Cn=R.getParameter(R.UNPACK_SKIP_PIXELS),Cr=R.getParameter(R.UNPACK_SKIP_ROWS),an=R.getParameter(R.UNPACK_SKIP_IMAGES);R.pixelStorei(R.UNPACK_ROW_LENGTH,xt.width),R.pixelStorei(R.UNPACK_IMAGE_HEIGHT,xt.height),R.pixelStorei(R.UNPACK_SKIP_PIXELS,Me),R.pixelStorei(R.UNPACK_SKIP_ROWS,Re),R.pixelStorei(R.UNPACK_SKIP_IMAGES,Pe),E.isDataTexture||E.isData3DTexture?R.texSubImage3D(Te,k,Ee,nt,lt,se,fe,ye,sn,Je,xt.data):I.isCompressedArrayTexture?R.compressedTexSubImage3D(Te,k,Ee,nt,lt,se,fe,ye,sn,xt.data):R.texSubImage3D(Te,k,Ee,nt,lt,se,fe,ye,sn,Je,xt),R.pixelStorei(R.UNPACK_ROW_LENGTH,Pt),R.pixelStorei(R.UNPACK_IMAGE_HEIGHT,et),R.pixelStorei(R.UNPACK_SKIP_PIXELS,Cn),R.pixelStorei(R.UNPACK_SKIP_ROWS,Cr),R.pixelStorei(R.UNPACK_SKIP_IMAGES,an),k===0&&I.generateMipmaps&&R.generateMipmap(Te),Ae.unbindTexture()},this.initRenderTarget=function(E){Ne.get(E).__webglFramebuffer===void 0&&C.setupRenderTarget(E)},this.initTexture=function(E){E.isCubeTexture?C.setTextureCube(E,0):E.isData3DTexture?C.setTexture3D(E,0):E.isDataArrayTexture||E.isCompressedArrayTexture?C.setTexture2DArray(E,0):C.setTexture2D(E,0),Ae.unbindTexture()},this.resetState=function(){P=0,b=0,A=null,Ae.reset(),at.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return ci}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const n=this.getContext();n.drawingBufferColorSpace=e===jf?"display-p3":"srgb",n.unpackColorSpace=tt.workingColorSpace===Vl?"display-p3":"srgb"}}class Yf{constructor(e,n=25e-5){this.isFogExp2=!0,this.name="",this.color=new Xe(e),this.density=n}clone(){return new Yf(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}}class YT extends Wt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Kn,this.environmentIntensity=1,this.environmentRotation=new Kn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,n){return super.copy(e,n),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const n=super.toJSON(e);return this.fog!==null&&(n.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(n.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(n.object.backgroundIntensity=this.backgroundIntensity),n.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(n.object.environmentIntensity=this.environmentIntensity),n.object.environmentRotation=this.environmentRotation.toArray(),n}}class _x extends Ns{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Xe(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const cm=new ft,Fd=new Gf,Co=new jl,Ro=new F;class $T extends Wt{constructor(e=new xi,n=new _x){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=n,this.updateMorphTargets()}copy(e,n){return super.copy(e,n),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,n){const i=this.geometry,r=this.matrixWorld,s=e.params.Points.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Co.copy(i.boundingSphere),Co.applyMatrix4(r),Co.radius+=s,e.ray.intersectsSphere(Co)===!1)return;cm.copy(r).invert(),Fd.copy(e.ray).applyMatrix4(cm);const o=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=i.index,p=i.attributes.position;if(c!==null){const h=Math.max(0,a.start),g=Math.min(c.count,a.start+a.count);for(let v=h,S=g;v<S;v++){const m=c.getX(v);Ro.fromBufferAttribute(p,m),um(Ro,m,l,r,e,n,this)}}else{const h=Math.max(0,a.start),g=Math.min(p.count,a.start+a.count);for(let v=h,S=g;v<S;v++)Ro.fromBufferAttribute(p,v),um(Ro,v,l,r,e,n,this)}}updateMorphTargets(){const n=this.geometry.morphAttributes,i=Object.keys(n);if(i.length>0){const r=n[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=r.length;s<a;s++){const o=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}}function um(t,e,n,i,r,s,a){const o=Fd.distanceSqToPoint(t);if(o<n){const l=new F;Fd.closestPointToPoint(t,l),l.applyMatrix4(i);const c=r.ray.origin.distanceTo(l);if(c<r.near||c>r.far)return;s.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}class KT extends Ns{constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new Xe(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Xe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=tx,this.normalScale=new Ke(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Kn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}const dm={enabled:!1,files:{},add:function(t,e){this.enabled!==!1&&(this.files[t]=e)},get:function(t){if(this.enabled!==!1)return this.files[t]},remove:function(t){delete this.files[t]},clear:function(){this.files={}}};class ZT{constructor(e,n,i){const r=this;let s=!1,a=0,o=0,l;const c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=n,this.onError=i,this.itemStart=function(d){o++,s===!1&&r.onStart!==void 0&&r.onStart(d,a,o),s=!0},this.itemEnd=function(d){a++,r.onProgress!==void 0&&r.onProgress(d,a,o),a===o&&(s=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(d){r.onError!==void 0&&r.onError(d)},this.resolveURL=function(d){return l?l(d):d},this.setURLModifier=function(d){return l=d,this},this.addHandler=function(d,p){return c.push(d,p),this},this.removeHandler=function(d){const p=c.indexOf(d);return p!==-1&&c.splice(p,2),this},this.getHandler=function(d){for(let p=0,h=c.length;p<h;p+=2){const g=c[p],v=c[p+1];if(g.global&&(g.lastIndex=0),g.test(d))return v}return null}}}const QT=new ZT;class $f{constructor(e){this.manager=e!==void 0?e:QT,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,n){const i=this;return new Promise(function(r,s){i.load(e,r,n,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}}$f.DEFAULT_MATERIAL_NAME="__DEFAULT";class JT extends $f{constructor(e){super(e)}load(e,n,i,r){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=this,a=dm.get(e);if(a!==void 0)return s.manager.itemStart(e),setTimeout(function(){n&&n(a),s.manager.itemEnd(e)},0),a;const o=Ra("img");function l(){d(),dm.add(e,this),n&&n(this),s.manager.itemEnd(e)}function c(p){d(),r&&r(p),s.manager.itemError(e),s.manager.itemEnd(e)}function d(){o.removeEventListener("load",l,!1),o.removeEventListener("error",c,!1)}return o.addEventListener("load",l,!1),o.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),s.manager.itemStart(e),o.src=e,o}}class eb extends $f{constructor(e){super(e)}load(e,n,i,r){const s=new Gt,a=new JT(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(o){s.image=o,s.needsUpdate=!0,n!==void 0&&n(s)},i,r),s}}class yx extends Wt{constructor(e,n=1){super(),this.isLight=!0,this.type="Light",this.color=new Xe(e),this.intensity=n}dispose(){}copy(e,n){return super.copy(e,n),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const n=super.toJSON(e);return n.object.color=this.color.getHex(),n.object.intensity=this.intensity,this.groundColor!==void 0&&(n.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(n.object.distance=this.distance),this.angle!==void 0&&(n.object.angle=this.angle),this.decay!==void 0&&(n.object.decay=this.decay),this.penumbra!==void 0&&(n.object.penumbra=this.penumbra),this.shadow!==void 0&&(n.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(n.object.target=this.target.uuid),n}}const Qc=new ft,fm=new F,hm=new F;class tb{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Ke(512,512),this.map=null,this.mapPass=null,this.matrix=new ft,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Xf,this._frameExtents=new Ke(1,1),this._viewportCount=1,this._viewports=[new st(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const n=this.camera,i=this.matrix;fm.setFromMatrixPosition(e.matrixWorld),n.position.copy(fm),hm.setFromMatrixPosition(e.target.matrixWorld),n.lookAt(hm),n.updateMatrixWorld(),Qc.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Qc),i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(Qc)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}const pm=new ft,Xs=new F,Jc=new F;class nb extends tb{constructor(){super(new un(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new Ke(4,2),this._viewportCount=6,this._viewports=[new st(2,1,1,1),new st(0,1,1,1),new st(3,1,1,1),new st(1,1,1,1),new st(3,0,1,1),new st(1,0,1,1)],this._cubeDirections=[new F(1,0,0),new F(-1,0,0),new F(0,0,1),new F(0,0,-1),new F(0,1,0),new F(0,-1,0)],this._cubeUps=[new F(0,1,0),new F(0,1,0),new F(0,1,0),new F(0,1,0),new F(0,0,1),new F(0,0,-1)]}updateMatrices(e,n=0){const i=this.camera,r=this.matrix,s=e.distance||i.far;s!==i.far&&(i.far=s,i.updateProjectionMatrix()),Xs.setFromMatrixPosition(e.matrixWorld),i.position.copy(Xs),Jc.copy(i.position),Jc.add(this._cubeDirections[n]),i.up.copy(this._cubeUps[n]),i.lookAt(Jc),i.updateMatrixWorld(),r.makeTranslation(-Xs.x,-Xs.y,-Xs.z),pm.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse),this._frustum.setFromProjectionMatrix(pm)}}class mm extends yx{constructor(e,n,i=0,r=2){super(e,n),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=r,this.shadow=new nb}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,n){return super.copy(e,n),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class ib extends yx{constructor(e,n){super(e,n),this.isAmbientLight=!0,this.type="AmbientLight"}}class rb{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=gm(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const n=gm();e=(n-this.oldTime)/1e3,this.oldTime=n,this.elapsedTime+=e}return e}}function gm(){return performance.now()}const xm=new ft;class sb{constructor(e,n,i=0,r=1/0){this.ray=new Gf(e,n),this.near=i,this.far=r,this.camera=null,this.layers=new Wf,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,n){this.ray.set(e,n)}setFromCamera(e,n){n.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(n.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(n).sub(this.ray.origin).normalize(),this.camera=n):n.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(n.near+n.far)/(n.near-n.far)).unproject(n),this.ray.direction.set(0,0,-1).transformDirection(n.matrixWorld),this.camera=n):console.error("THREE.Raycaster: Unsupported camera type: "+n.type)}setFromXRController(e){return xm.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(xm),this}intersectObject(e,n=!0,i=[]){return Od(e,this,i,n),i.sort(vm),i}intersectObjects(e,n=!0,i=[]){for(let r=0,s=e.length;r<s;r++)Od(e[r],this,i,n);return i.sort(vm),i}}function vm(t,e){return t.distance-e.distance}function Od(t,e,n,i){let r=!0;if(t.layers.test(e.layers)&&t.raycast(e,n)===!1&&(r=!1),r===!0&&i===!0){const s=t.children;for(let a=0,o=s.length;a<o;a++)Od(s[a],e,n,!0)}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:kf}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=kf);function ab({t}){const e=ae.useRef(null),n=ae.useRef(null),[i,r]=ae.useState([]),[s,a]=ae.useState(null),[o,l]=ae.useState(!1),[c,d]=ae.useState(!1),[p,h]=ae.useState(!0),g=[{id:"art-01",author:"Pyxie Core",description:"Astaroth no Portal Arcano • Ilustração oficial do Bosque Violeta.",imageUrl:"/assets/pyxie/pyxie_space_banner.jpg",createdAt:new Date().toISOString()},{id:"art-02",author:"Melody Labs",description:"O Arcano O Mago • Pintura digital inspirada nos 78 arcanos da Pyxie.",imageUrl:"/assets/pyxie/og_banner_hd.png",createdAt:new Date().toISOString()},{id:"art-03",author:"Cringelândia Art",description:"Pyxie Tsundere Rebelde • Mascote da comunidade em alta resolução.",imageUrl:"/assets/pyxie/pyxie_mascot.png",createdAt:new Date().toISOString()},{id:"art-04",author:"Pixel Guild",description:"Pixelart Nostálgica • Render retrô em 32x32 da fada gótica.",imageUrl:"/assets/pyxie/pyxie_pixelart.png",createdAt:new Date().toISOString()}];ae.useEffect(()=>{fetch("/api/museum/arts?limit=12").then(S=>S.json()).then(S=>{S&&S.success&&Array.isArray(S.arts)&&S.arts.length>0?r(S.arts):r(g)}).catch(()=>{r(g)})},[]),ae.useEffect(()=>{const S=new IntersectionObserver(m=>{m[0].isIntersecting&&d(!0)},{rootMargin:"200px"});return e.current&&S.observe(e.current),()=>S.disconnect()},[]),ae.useEffect(()=>{if(!c||!n.current||i.length===0)return;let S;try{S=new qT({canvas:n.current,alpha:!0,antialias:!0,powerPreference:"high-performance"})}catch(R){console.warn("WebGL não suportado:",R),h(!1);return}const m=new YT;m.fog=new Yf(459789,.04);const u=new un(50,1,.1,100);u.position.set(0,0,7.5);const _=()=>{if(!e.current||!S)return;const R=e.current.clientWidth,Ye=Math.min(Math.max(R*.55,380),540);u.aspect=R/Ye,u.updateProjectionMatrix(),S.setSize(R,Ye),S.setPixelRatio(Math.min(window.devicePixelRatio,2))};_(),window.addEventListener("resize",_);const x=400,w=new xi,P=new Float32Array(x*3),b=new Float32Array(x*3);for(let R=0;R<x*3;R+=3){P[R]=(Math.random()-.5)*20,P[R+1]=(Math.random()-.5)*12,P[R+2]=(Math.random()-.5)*15;const Ye=Math.random()>.5;b[R]=Ye?.95:.55,b[R+1]=Ye?.2:.35,b[R+2]=Ye?.6:.95}w.setAttribute("position",new Tn(P,3)),w.setAttribute("color",new Tn(b,3));const A=new _x({size:.08,vertexColors:!0,transparent:!0,opacity:.7,blending:$u}),N=new $T(w,A);m.add(N);const V=new ib(16777215,.85);m.add(V);const y=new mm(15073383,3,20);y.position.set(0,3,5),m.add(y);const T=new mm(9133302,3,20);T.position.set(0,-3,3),m.add(T);const j=new Qs;m.add(j);const H=new Ba(1.6,2.3),q=new eb,Q=[],G=4.2,Y=i.slice(0,8),L=Y.length;Y.forEach((R,Ye)=>{const Ue=Ye/L*Math.PI*2,Oe=Math.sin(Ue)*G,Ae=Math.cos(Ue)*G-G,rt=q.load(R.imageUrl||"/assets/pyxie/og_banner_hd.png");rt.minFilter=Sn;const Ne=new KT({map:rt,roughness:.35,metalness:.1,side:Xn}),C=new qn(H,Ne);C.position.set(Oe,0,Ae),C.rotation.y=Ue+Math.PI,C.userData={art:R,initialZ:Ae,initialY:C.rotation.y},j.add(C),Q.push(C)});let K=!1,U=0,$=.003;const ge=.95,be=new sb,X=new Ke(-100,-100),te=R=>{K=!0,U=R.clientX||R.touches&&R.touches[0].clientX||0,$=0},le=R=>{const Ye=R.clientX||R.touches&&R.touches[0].clientX||0,Ue=R.clientY||R.touches&&R.touches[0].clientY||0;if(K&&($=(Ye-U)*.005,j.rotation.y+=$,U=Ye),e.current){const Oe=e.current.getBoundingClientRect();X.x=(Ye-Oe.left)/Oe.width*2-1,X.y=-((Ue-Oe.top)/Oe.height)*2+1}},ce=()=>{K=!1},Le=()=>{be.setFromCamera(X,u);const R=be.intersectObjects(Q);if(R.length>0){const Ye=R[0].object.userData.art;Ye&&a(Ye)}},Ce=n.current;Ce.addEventListener("pointerdown",te),window.addEventListener("pointermove",le),window.addEventListener("pointerup",ce),Ce.addEventListener("click",Le);let Ve;const Qe=new rb,je=()=>{Ve=requestAnimationFrame(je);const R=Qe.getElapsedTime();K||(j.rotation.y+=$,$*=ge,Math.abs($)<8e-4&&($=.0018)),N.rotation.y=R*.02,N.rotation.x=Math.sin(R*.05)*.05,be.setFromCamera(X,u);const Ye=be.intersectObjects(Q);Q.forEach(Ue=>{const Ae=Ye.length>0&&Ye[0].object===Ue?1.15:1;Ue.scale.lerp(new F(Ae,Ae,Ae),.1)}),S.render(m,u)};return je(),()=>{cancelAnimationFrame(Ve),window.removeEventListener("resize",_),window.removeEventListener("pointermove",le),window.removeEventListener("pointerup",ce),Ce.removeEventListener("pointerdown",te),Ce.removeEventListener("click",Le),S.dispose()}},[c,i]);const v=S=>{S.preventDefault(),l(!0)};return f.jsxs("section",{id:"museu-deck",className:"relative py-16 md:py-24 overflow-hidden border-t border-purple-500/10",children:[f.jsxs("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-8",children:[f.jsxs("div",{className:"inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-bold mb-3 shadow-sm",children:[f.jsx(hn,{className:"w-3.5 h-3.5 text-pink-400"}),f.jsx("span",{children:"The Holographic Community Deck"})]}),f.jsx("h2",{className:"font-title font-black text-3xl sm:text-4xl text-white tracking-tight",children:t("museum.title")}),f.jsx("p",{className:"text-slate-300 text-sm sm:text-base max-w-xl mx-auto mt-2",children:t("museum.subtitle")})]}),f.jsxs("div",{ref:e,onContextMenu:v,className:"art-shield relative w-full max-w-6xl mx-auto h-[380px] sm:h-[480px] lg:h-[540px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none",children:[p?f.jsx("canvas",{ref:n,className:"w-full h-full block"}):f.jsx("div",{className:"flex gap-4 overflow-x-auto px-4 py-8 w-full scrollbar-none snap-x",children:i.map(S=>f.jsxs("div",{onClick:()=>a(S),className:"shrink-0 w-64 h-88 rounded-2xl glass-panel p-3 border border-pink-500/30 snap-center cursor-pointer shadow-lg transform hover:scale-105 transition-all",children:[f.jsx("img",{src:S.imageUrl,alt:S.author||"Arte da Comunidade",className:"w-full h-64 object-cover rounded-xl"}),f.jsxs("div",{className:"mt-3 text-left",children:[f.jsxs("div",{className:"text-pink-400 font-bold text-sm",children:["@",S.author]}),f.jsx("div",{className:"text-slate-300 text-xs truncate",children:S.description})]})]},S.id))}),f.jsx("div",{className:"absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#07040D] to-transparent pointer-events-none"}),f.jsx("div",{className:"absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#07040D] to-transparent pointer-events-none"})]}),f.jsx("div",{className:"mt-8 text-center",children:f.jsxs("a",{href:"/museu",className:"inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-extrabold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-neon-violet transition-all transform hover:-translate-y-1 active:translate-y-0 border border-purple-400/30",children:[f.jsx(hn,{className:"w-4 h-4 text-pink-300"}),f.jsx("span",{children:t("museum.exploreAll")})]})}),s&&f.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn",children:f.jsxs("div",{onContextMenu:v,className:"art-shield relative w-full max-w-2xl rounded-3xl glass-panel border border-pink-500/30 p-6 shadow-2xl overflow-hidden",children:[f.jsx("button",{onClick:()=>a(null),className:"absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all",children:f.jsx(_s,{className:"w-5 h-5"})}),f.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-6 items-center",children:[f.jsxs("div",{className:"relative rounded-2xl overflow-hidden border border-purple-500/30 shadow-neon-pink",children:[f.jsx("img",{src:s.imageUrl,alt:s.author||"Arte da Comunidade",className:"w-full h-80 object-cover pointer-events-none select-none"}),f.jsxs("div",{className:"absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-mono text-pink-300 border border-pink-500/30",children:["✦ ",s.id]})]}),f.jsxs("div",{className:"space-y-4 text-left",children:[f.jsxs("div",{children:[f.jsx("span",{className:"text-xs font-mono font-bold text-pink-400 uppercase tracking-wider",children:t("museum.author")}),f.jsxs("h3",{className:"font-title font-extrabold text-2xl text-white",children:["@",s.author]})]}),f.jsx("p",{className:"text-slate-300 text-sm leading-relaxed",children:s.description||"Obra compartilhada na galeria oficial da comunidade Pyxie."}),f.jsxs("div",{className:"pt-2 border-t border-purple-500/15 flex items-center gap-2 text-xs text-purple-300/80",children:[f.jsx(vy,{className:"w-4 h-4 text-pink-400"}),f.jsx("span",{children:new Date(s.createdAt||Date.now()).toLocaleDateString("pt-BR")})]}),f.jsx("div",{className:"pt-3",children:f.jsxs("a",{href:"/museu",className:"inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-purple-500/30 hover:border-pink-500/50 transition-all",children:[f.jsx("span",{children:"Ver no Fórum do Museu"}),f.jsx(Ty,{className:"w-3.5 h-3.5"})]})})]})]})]})}),o&&f.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn",children:f.jsxs("div",{className:"max-w-md w-full rounded-2xl glass-panel border border-pink-500/40 p-6 text-center shadow-2xl space-y-4",children:[f.jsx("div",{className:"w-12 h-12 rounded-full bg-pink-500/20 border border-pink-500/50 flex items-center justify-center mx-auto text-pink-400",children:f.jsx(zg,{className:"w-6 h-6"})}),f.jsx("h4",{className:"font-title font-bold text-xl text-white",children:"Proteção de Propriedade Visual"}),f.jsx("p",{className:"text-slate-300 text-sm leading-relaxed",children:t("museum.artShield")}),f.jsx("button",{onClick:()=>l(!1),className:"px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-neon-pink",children:"Compreendi"})]})})]})}function ob({t}){const e=[{id:1,title:"Tarot dos 78 Arcanos & Álbum",desc:"Tire cartas dos 78 arcanos ilustrados com arte em Canvas HD, consulte oráculos diários, interpretações diretas e invertidas e complete seu álbum colecionável.",icon:hn,iconColor:"text-pink-400",podBg:"bg-pink-500/10 border-pink-500/30"},{id:2,title:"Economia Viva & 16 Vocações",desc:"Acumule moedinhas e feijões mágicos, escolha entre 16 carreiras dinâmicas com minigames em cada turno de trabalho e escale o ranking de riqueza.",icon:Bl,iconColor:"text-amber-400",podBg:"bg-amber-500/10 border-amber-500/30"},{id:3,title:"Matrimônio, Casa & Dinâmica Familiar",desc:"Casamentos bilaterais permanentes, compra de casas, cultivo da Árvore da Vida, cofre de amor com juros e herdeiros que estagiam e trazem moedas.",icon:If,iconColor:"text-rose-400",podBg:"bg-rose-500/10 border-rose-500/30"},{id:4,title:"Quiz & Desafios da Comunidade",desc:"Desafie seus amigos com centenas de perguntas de cultura pop, conhecimentos gerais e lógica com recompensas automáticas por agilidade e acerto.",icon:xy,iconColor:"text-purple-400",podBg:"bg-purple-500/10 border-purple-500/30"},{id:5,title:"Minigames & Lazer Social",desc:"Dispute Jokenpô, quebre o Biscoito da Sorte, descubra afinidade no /py-ship, brinque de Quem é Mais Provável e personalize temas visuais no perfil.",icon:by,iconColor:"text-cyan-400",podBg:"bg-cyan-500/10 border-cyan-500/30"}];return f.jsxs("section",{id:"pilares",className:"py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-purple-500/10",children:[f.jsxs("div",{className:"text-center mb-12",children:[f.jsxs("div",{className:"inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold mb-3 shadow-sm",children:[f.jsx(hn,{className:"w-3.5 h-3.5 text-pink-400"}),f.jsx("span",{children:"Pilares Oficiais"})]}),f.jsx("h2",{className:"font-title font-black text-3xl sm:text-4xl text-white tracking-tight",children:"Explore o Universo da Pyxie"}),f.jsx("p",{className:"text-slate-300 text-sm sm:text-base max-w-xl mx-auto mt-2",children:"Desenvolvida para transformar servidores do Discord em comunidades ativas, divertidas e engajadas."})]}),f.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",children:e.map(n=>{const i=n.icon;return f.jsx("div",{className:"rounded-3xl glass-panel border border-purple-500/20 hover:border-pink-500/50 p-6 transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-neon-pink flex flex-col justify-between",children:f.jsxs("div",{children:[f.jsx("div",{className:`w-12 h-12 rounded-2xl flex items-center justify-center border mb-5 ${n.podBg}`,children:f.jsx(i,{className:`w-6 h-6 ${n.iconColor}`})}),f.jsx("h3",{className:"font-title font-bold text-lg text-white mb-2",children:n.title}),f.jsx("p",{className:"text-slate-300 text-xs sm:text-sm leading-relaxed",children:n.desc})]})},n.id)})})]})}function lb({command:t,onSelect:e,t:n}){const[i,r]=ae.useState(!1),s=o=>{var c;o.stopPropagation();const l=t.name?`/${t.name}`:`py!${((c=t.aliases)==null?void 0:c[0])||""}`;navigator.clipboard.writeText(l),r(!0),setTimeout(()=>r(!1),2e3)},a=`cmd-${t.name}`;return f.jsxs("div",{id:a,onClick:()=>e&&e(t),className:"group rounded-2xl glass-panel border border-purple-500/20 hover:border-pink-500/50 p-5 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-neon-pink cursor-pointer flex flex-col justify-between relative overflow-hidden",children:[f.jsx("div",{className:"absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl group-hover:bg-pink-500/15 transition-all"}),f.jsxs("div",{className:"space-y-2.5 relative z-10",children:[f.jsxs("div",{className:"flex items-center justify-between",children:[f.jsxs("div",{className:"font-mono font-bold text-sm text-pink-400 group-hover:text-pink-300 transition-colors flex items-center gap-2",children:[f.jsx(Aa,{className:"w-3.5 h-3.5 text-purple-400 group-hover:rotate-12 transition-transform"}),f.jsxs("span",{children:["/",t.name]})]}),f.jsx("div",{className:"flex items-center gap-1.5",children:f.jsx("button",{onClick:s,className:`p-1.5 rounded-lg border text-xs transition-all flex items-center gap-1 ${i?"bg-emerald-500/20 border-emerald-500/40 text-emerald-300":"bg-white/5 border-purple-500/20 text-slate-400 group-hover:text-white group-hover:border-pink-500/30"}`,title:"Copiar comando",children:i?f.jsx(ba,{className:"w-3.5 h-3.5 text-emerald-400"}):f.jsx(Og,{className:"w-3.5 h-3.5"})})})]}),f.jsx("p",{className:"text-slate-300 text-xs leading-relaxed line-clamp-3",children:t.description})]}),f.jsxs("div",{className:"mt-4 pt-3 border-t border-purple-500/15 flex items-center justify-between relative z-10",children:[t.aliases&&t.aliases.length>0?f.jsxs("div",{className:"flex flex-wrap gap-1.5",children:[t.aliases.slice(0,2).map((o,l)=>f.jsxs("span",{className:"font-mono text-[11px] px-2 py-0.5 rounded-md bg-white/5 border border-purple-500/20 text-cyan-300 tracking-wider",style:{letterSpacing:"0.05em"},children:["py!",o]},l)),t.aliases.length>2&&f.jsxs("span",{className:"font-mono text-[10px] px-1.5 py-0.5 rounded text-slate-400",children:["+",t.aliases.length-2]})]}):f.jsx("span",{className:"text-[11px] text-slate-500 font-mono",children:"Slash Oficial"}),f.jsxs("span",{className:"text-[11px] font-bold text-purple-300 group-hover:text-pink-300 transition-colors flex items-center gap-0.5",children:[f.jsx("span",{children:"Detalhes"}),f.jsx(Fg,{className:"w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform"})]})]})]})}function cb({command:t,lang:e="pt"}){const n=e==="en",r=(s=>{const a=s.name||"";return a.includes("daily")?{color:"#E60067",title:n?"✨ Cosmic Daily Reward":"✨ Recompensa Diária Cósmica",desc:n?"You channeled the astral energy and claimed your daily coins!":"Você canalizou a energia astral e resgatou suas moedas diárias!",fields:[{name:n?"🪙 Coins":"🪙 Recompensa",value:"+100 moedas",inline:!0},{name:n?"🔥 Daily Streak":"🔥 Sequência",value:"7 dias (+25 bônus)",inline:!0}],footer:"Pyxie Bot • Discord.js v14"}:a.includes("work")||a.includes("trabalho")?{color:"#8B5CF6",title:n?"💼 Professional Shift: Alchemist":"💼 Expediente: Alquimista Místico",desc:n?"You combined the essence of the Arcane Rose with stardust. Perfect synthesis!":"Você combinou a essência da Rosa Arcana com pó estelar. Síntese perfeita!",fields:[{name:n?"💰 Earnings":"💰 Rendimento",value:"+95 moedas",inline:!0},{name:n?"⭐ Experience":"⭐ Experiência",value:"+15 XP Alquimia",inline:!0}],footer:"Pyxie Carreiras • Cooldown: 3h"}:a.includes("tarot")?{color:"#A855F7",title:n?"🔮 Daily Arcana: The Magician":"🔮 Arcano do Dia: O Mago (I)",desc:n?'"The power of creation and transmutation is alive in your hands today."':'"O poder da criação e transmutação está vivo em suas mãos hoje. Molde seu destino."',fields:[{name:n?"🧭 Orientation":"🧭 Orientação",value:n?"Upright (Direct)":"Em Pé (Direta)",inline:!0},{name:n?"⭐ Arcana Type":"⭐ Tipo de Arcano",value:n?"Major Arcana (01/22)":"Arcano Maior (01/22)",inline:!0}],footer:"Pyxie Tarot • 78 Arcanos em Canvas HD"}:a.includes("casamento")||a.includes("marry")?{color:"#EC4899",title:n?"💍 Matrimonial Bond: Pyxie & Astaroth":"💍 Laço Matrimonial: Pyxie & Astaroth",desc:n?"Eternal union blessed by the cosmic fairies under the Tree of Life.":"União eterna abençoada pelas fadas cósmicas sob a Árvore da Vida.",fields:[{name:n?"💖 Love Bar":"💖 Barra do Amor",value:"100% [██████████]",inline:!0},{name:n?"🌳 Tree Level":"🌳 Nível da Árvore",value:"Nível 3 (+30% Amor)",inline:!0}],footer:"Pyxie Matrimônio & Família"}:{color:"#3B82F6",title:`✨ /${s.name}`,desc:s.description||(n?"Command executed successfully.":"Comando executado com sucesso."),fields:[{name:"Status",value:"✅ Operacional",inline:!0},{name:n?"Cooldown":"Recarga",value:s.cooldown?`${s.cooldown}s`:"3s",inline:!0}],footer:"Pyxie Discord Bot • 2026"}})(t);return f.jsxs("div",{className:"rounded-xl bg-[#2b2d31] border border-[#1e1f22] p-4 text-[#dbdee1] font-sans text-sm shadow-xl select-none",children:[f.jsxs("div",{className:"flex items-center gap-2.5 mb-3",children:[f.jsx("div",{className:"w-8 h-8 rounded-full overflow-hidden bg-purple-900 border border-purple-500/30 flex-shrink-0",children:f.jsx("img",{src:"/assets/pyxie/pyxie_pixelart_face.png",alt:"Pyxie Avatar",className:"w-full h-full object-contain"})}),f.jsxs("div",{className:"flex items-center gap-1.5 leading-none",children:[f.jsx("span",{className:"font-bold text-white text-sm",children:"Pyxie"}),f.jsx("span",{className:"px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#5865F2] text-white tracking-wide uppercase",children:"BOT"}),f.jsx("span",{className:"text-[11px] text-[#949ba4] ml-1",children:"hoje às 14:32"})]})]}),f.jsxs("div",{className:"rounded-lg bg-[#232428] p-3.5 pl-4 border-l-4 space-y-2.5 transition-all",style:{borderLeftColor:r.color},children:[f.jsx("h4",{className:"font-bold text-white text-sm tracking-tight",children:r.title}),f.jsx("p",{className:"text-xs text-[#dbdee1] leading-relaxed",children:r.desc}),r.fields&&r.fields.length>0&&f.jsx("div",{className:"grid grid-cols-2 gap-3 pt-1",children:r.fields.map((s,a)=>f.jsxs("div",{className:"space-y-0.5",children:[f.jsx("span",{className:"text-[11px] font-bold text-[#b5bac1] block",children:s.name}),f.jsx("span",{className:"text-xs text-white font-medium block",children:s.value})]},a))}),f.jsxs("div",{className:"pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-[#949ba4]",children:[f.jsx("span",{children:r.footer}),f.jsx("span",{className:"font-mono text-[9px] opacity-70",children:"Embed v2"})]})]})]})}function ub({command:t,onClose:e,lang:n="pt",t:i}){const[r,s]=ae.useState(!1),[a,o]=ae.useState(!1);if(!t)return null;const l=()=>{const d=`/${t.name}`;navigator.clipboard.writeText(d),s(!0),setTimeout(()=>s(!1),2e3)},c=()=>{const d=`${window.location.origin}/wiki#${t.name}`;navigator.clipboard.writeText(d),o(!0),setTimeout(()=>o(!1),2e3)};return f.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in",children:f.jsxs("div",{className:"relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0e071a] border border-purple-500/30 p-6 sm:p-8 shadow-2xl space-y-6",onClick:d=>d.stopPropagation(),children:[f.jsx("button",{onClick:e,className:"absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors",title:"Fechar (ESC)",children:f.jsx(_s,{className:"w-5 h-5"})}),f.jsxs("div",{className:"space-y-2",children:[f.jsxs("div",{className:"inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 font-mono font-bold text-xs",children:[f.jsx(Aa,{className:"w-3.5 h-3.5"}),f.jsxs("span",{children:["/",t.name]})]}),f.jsxs("h3",{className:"font-title font-extrabold text-2xl text-white tracking-tight",children:["/",t.name]}),f.jsx("p",{className:"text-slate-300 text-sm leading-relaxed",children:t.description})]}),f.jsxs("div",{className:"flex flex-wrap items-center gap-3 pt-1",children:[f.jsxs("button",{onClick:l,className:`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${r?"bg-emerald-500/20 border border-emerald-500/40 text-emerald-300":"bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-neon-pink"}`,children:[r?f.jsx(ba,{className:"w-4 h-4 text-emerald-300"}):f.jsx(Og,{className:"w-4 h-4"}),f.jsx("span",{children:r?"Comando Copiado! ✨":"Copiar Sintaxe"})]}),f.jsxs("button",{onClick:c,className:`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${a?"bg-emerald-500/20 border-emerald-500/40 text-emerald-300":"bg-white/5 border-purple-500/25 text-purple-200 hover:bg-white/10 hover:text-white"}`,children:[a?f.jsx(ba,{className:"w-4 h-4 text-emerald-300"}):f.jsx(la,{className:"w-4 h-4"}),f.jsx("span",{children:a?"Link Copiado! 🔗":"Copiar Deep Link"})]})]}),f.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white/5 border border-purple-500/15 text-xs",children:[f.jsxs("div",{className:"flex items-center gap-2.5",children:[f.jsx(My,{className:"w-4 h-4 text-amber-400 flex-shrink-0"}),f.jsxs("div",{children:[f.jsx("span",{className:"text-[10px] text-slate-400 uppercase tracking-wider block font-bold",children:"Cooldown"}),f.jsx("span",{className:"font-semibold text-slate-200",children:t.cooldown?`${t.cooldown}s`:"3 segundos"})]})]}),f.jsxs("div",{className:"flex items-center gap-2.5",children:[f.jsx(Bg,{className:"w-4 h-4 text-emerald-400 flex-shrink-0"}),f.jsxs("div",{children:[f.jsx("span",{className:"text-[10px] text-slate-400 uppercase tracking-wider block font-bold",children:"Permissões"}),f.jsx("span",{className:"font-semibold text-slate-200",children:"@everyone"})]})]}),f.jsxs("div",{className:"flex items-center gap-2.5",children:[f.jsx(Aa,{className:"w-4 h-4 text-cyan-400 flex-shrink-0"}),f.jsxs("div",{children:[f.jsx("span",{className:"text-[10px] text-slate-400 uppercase tracking-wider block font-bold",children:"Plataforma"}),f.jsx("span",{className:"font-semibold text-slate-200",children:"Slash & Prefixo"})]})]})]}),t.aliases&&t.aliases.length>0&&f.jsxs("div",{className:"space-y-2",children:[f.jsx("span",{className:"text-xs font-bold text-slate-400 uppercase tracking-wider block",children:"Prefixos Alternativos (py!)"}),f.jsx("div",{className:"flex flex-wrap gap-2",children:t.aliases.map((d,p)=>f.jsxs("span",{className:"px-2.5 py-1 rounded-lg bg-purple-900/40 border border-purple-500/30 text-cyan-300 font-mono text-xs font-medium tracking-wider",style:{letterSpacing:"0.05em"},children:["py!",d]},p))})]}),f.jsxs("div",{className:"space-y-2 pt-2",children:[f.jsxs("div",{className:"flex items-center justify-between",children:[f.jsx("span",{className:"text-xs font-bold text-slate-400 uppercase tracking-wider",children:"Resposta Real no Discord"}),f.jsx("span",{className:"text-[11px] text-purple-400 font-mono",children:"Live Simulation"})]}),f.jsx(cb,{command:t,lang:n})]})]})})}function db({isOpen:t,onClose:e,commands:n=[],onSelectCommand:i}){const[r,s]=ae.useState(""),[a,o]=ae.useState(0),l=ae.useRef(null);ae.useEffect(()=>{t&&(s(""),o(0),setTimeout(()=>{var d;return(d=l.current)==null?void 0:d.focus()},50))},[t]);const c=n.filter(d=>{var m,u,_,x;const p=r.toLowerCase().trim();if(!p)return!0;const h=(m=d.name)==null?void 0:m.toLowerCase().includes(p),g=(u=d.description)==null?void 0:u.toLowerCase().includes(p),v=(_=d.aliases)==null?void 0:_.some(w=>w.toLowerCase().includes(p)),S=(x=d.category)==null?void 0:x.toLowerCase().includes(p);return h||g||v||S}).slice(0,8);return ae.useEffect(()=>{if(!t)return;const d=p=>{p.key==="Escape"?e():p.key==="ArrowDown"?(p.preventDefault(),o(h=>(h+1)%Math.max(1,c.length))):p.key==="ArrowUp"?(p.preventDefault(),o(h=>(h-1+c.length)%Math.max(1,c.length))):p.key==="Enter"&&(p.preventDefault(),c[a]&&(i(c[a]),e()))};return window.addEventListener("keydown",d),()=>window.removeEventListener("keydown",d)},[t,c,a,e,i]),t?f.jsx("div",{className:"fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-fade-in",onClick:e,children:f.jsxs("div",{className:"relative w-full max-w-xl rounded-2xl bg-[#0e071a] border border-purple-500/30 shadow-2xl overflow-hidden",onClick:d=>d.stopPropagation(),children:[f.jsxs("div",{className:"flex items-center px-4 py-3.5 border-b border-purple-500/20 bg-white/5",children:[f.jsx(Uf,{className:"w-5 h-5 text-pink-400 mr-3 flex-shrink-0"}),f.jsx("input",{ref:l,type:"text",value:r,onChange:d=>{s(d.target.value),o(0)},placeholder:"Buscar comandos por nome, palavra-chave ou categoria...",className:"w-full bg-transparent text-sm text-white placeholder-slate-400 outline-none font-sans"}),f.jsx("button",{onClick:e,className:"p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors",children:f.jsx(_s,{className:"w-4 h-4"})})]}),f.jsx("div",{className:"max-h-80 overflow-y-auto p-2 divide-y divide-white/5",children:c.length>0?c.map((d,p)=>f.jsxs("div",{onClick:()=>{i(d),e()},onMouseEnter:()=>o(p),className:`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all ${a===p?"bg-gradient-to-r from-pink-600/30 to-purple-600/30 border border-pink-500/40 text-white":"hover:bg-white/5 text-slate-300"}`,children:[f.jsxs("div",{className:"flex items-center gap-3 min-w-0",children:[f.jsx("div",{className:"w-8 h-8 rounded-lg bg-white/5 border border-purple-500/20 flex items-center justify-center text-pink-400 flex-shrink-0",children:f.jsx(Aa,{className:"w-4 h-4"})}),f.jsxs("div",{className:"min-w-0",children:[f.jsxs("span",{className:"font-mono font-bold text-sm text-white block truncate",children:["/",d.name]}),f.jsx("span",{className:"text-xs text-slate-400 truncate block",children:d.description})]})]}),f.jsxs("div",{className:"flex items-center gap-2 flex-shrink-0 ml-3",children:[d.aliases&&d.aliases[0]&&f.jsxs("span",{className:"hidden sm:inline-block font-mono text-[10px] px-2 py-0.5 rounded bg-white/5 text-cyan-300",children:["py!",d.aliases[0]]}),f.jsx(Ey,{className:"w-4 h-4 text-purple-400 opacity-60"})]})]},d.name||p)):f.jsxs("div",{className:"p-8 text-center text-slate-400 text-sm",children:['Nenhum comando encontrado para "',r,'".']})}),f.jsxs("div",{className:"px-4 py-2.5 bg-black/40 border-t border-purple-500/15 flex items-center justify-between text-[11px] text-slate-400 font-mono",children:[f.jsxs("div",{className:"flex items-center gap-3",children:[f.jsx("span",{children:"↑↓ Navegar"}),f.jsx("span",{children:"↵ Abrir Detalhes"})]}),f.jsx("span",{children:"ESC para fechar"})]})]})}):null}function Sx({t,lang:e}){var S;const[n,i]=ae.useState([]),[r,s]=ae.useState("todos"),[a,o]=ae.useState(""),[l,c]=ae.useState(null),[d,p]=ae.useState(!1);ae.useEffect(()=>{fetch(`/api/commands?lang=${e}`).then(m=>m.json()).then(m=>{if(m&&m.success&&Array.isArray(m.modules)){const u=m.modules.filter(_=>_.commands&&_.commands.length>0);i(u)}}).catch(m=>console.error("Erro ao buscar comandos:",m))},[e]),ae.useEffect(()=>{const m=u=>{(u.metaKey||u.ctrlKey)&&u.key==="k"&&(u.preventDefault(),p(!0))};return window.addEventListener("keydown",m),()=>window.removeEventListener("keydown",m)},[]),ae.useEffect(()=>{if(n.length===0)return;const m=window.location.hash.replace("#","").toLowerCase();if(!m)return;const _=n.flatMap(x=>x.commands||[]).find(x=>{var w,P;return((w=x.name)==null?void 0:w.toLowerCase())===m||`py-${x.name}`.toLowerCase()===m||((P=x.aliases)==null?void 0:P.some(b=>b.toLowerCase()===m))});if(_){c(_);const x=document.getElementById(`cmd-${_.name}`);x&&setTimeout(()=>x.scrollIntoView({behavior:"smooth",block:"center"}),300)}},[n]);const h=n.flatMap(m=>m.commands||[]),v=(r==="todos"?h:((S=n.find(m=>m.id===r))==null?void 0:S.commands)||[]).filter(m=>{var P,b,A;const u=a.toLowerCase(),_=(P=m.name)==null?void 0:P.toLowerCase().includes(u),x=(b=m.description)==null?void 0:b.toLowerCase().includes(u),w=(A=m.aliases)==null?void 0:A.some(N=>N.toLowerCase().includes(u));return _||x||w});return f.jsxs("section",{id:"comandos",className:"py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:[f.jsxs("div",{className:"text-center mb-10",children:[f.jsxs("div",{className:"inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold mb-3 shadow-sm",children:[f.jsx(_l,{className:"w-3.5 h-3.5 text-pink-400"}),f.jsx("span",{children:"Guia Completo & Documentação Oficial"})]}),f.jsx("h2",{className:"font-title font-black text-3xl sm:text-5xl text-white tracking-tight",children:t("wiki.title")}),f.jsx("p",{className:"text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mt-3",children:t("wiki.subtitle")})]}),f.jsx("div",{className:"max-w-2xl mx-auto mb-8 relative",children:f.jsxs("div",{onClick:()=>p(!0),className:"relative flex items-center cursor-pointer group",children:[f.jsx(Uf,{className:"absolute left-4 w-5 h-5 text-slate-400 group-hover:text-pink-400 transition-colors pointer-events-none"}),f.jsx("input",{type:"text",readOnly:!0,value:a,onClick:()=>p(!0),placeholder:t("wiki.searchPlaceholder"),className:"w-full pl-12 pr-24 py-3.5 rounded-2xl bg-white/5 border border-purple-500/25 group-hover:border-pink-500/60 text-sm text-white placeholder-slate-400 outline-none backdrop-blur-xl transition-all shadow-lg cursor-pointer"}),f.jsxs("div",{className:"absolute right-3.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-[11px] font-mono font-bold text-slate-300 flex items-center gap-1",children:[f.jsx("span",{children:"Ctrl"}),f.jsx("span",{children:"K"})]})]})}),f.jsxs("div",{className:"flex flex-wrap items-center justify-center gap-2 mb-10",children:[f.jsxs("button",{onClick:()=>s("todos"),className:`px-4 py-2 rounded-xl text-xs font-bold transition-all ${r==="todos"?"bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-neon-pink scale-105":"bg-white/5 border border-purple-500/20 text-slate-300 hover:bg-white/10 hover:text-white"}`,children:["Todos (",h.length,")"]}),n.map(m=>{var u;return f.jsxs("button",{onClick:()=>s(m.id),className:`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${r===m.id?"bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-neon-pink scale-105":"bg-white/5 border border-purple-500/20 text-slate-300 hover:bg-white/10 hover:text-white"}`,children:[f.jsx("span",{children:m.title||m.name}),f.jsxs("span",{className:"text-[10px] opacity-75 font-mono",children:["(",((u=m.commands)==null?void 0:u.length)||0,")"]})]},m.id)})]}),v.length>0?f.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5",children:v.map(m=>f.jsx(lb,{command:m,onSelect:u=>c(u),t},m.name))}):f.jsx("div",{className:"text-center py-16 text-slate-400 text-sm",children:"Nenhum comando encontrado para esta categoria."}),f.jsx(db,{isOpen:d,onClose:()=>p(!1),commands:h,onSelectCommand:m=>c(m)}),l&&f.jsx(ub,{command:l,onClose:()=>c(null),lang:e,t})]})}function Mx({t,lang:e}){const[n,i]=ae.useState([]),r=[{id:"sh-01",titulo:"Pelúcia Kuromi Gótica 30cm com Asas de Morcego",titulo_en:"Gothic Kuromi 30cm Plush with Bat Wings",preco:"R$ 49,90",preco_en:"$9.90",tag:"Mais Vendido",tag_en:"Best Seller",link:"/promo",imagem:"https://images.unsplash.com/photo-1558679908-541bcf1249ff?w=500"},{id:"sh-02",titulo:"Mousepad Gamer Extra Grande Roxo & Rosa Estelar",titulo_en:"XXL Starry Purple & Pink Gaming Mousepad",preco:"R$ 38,50",preco_en:"$7.80",tag:"Setup Aesthetic",tag_en:"Setup Aesthetic",link:"/promo",imagem:"https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500"},{id:"sh-03",titulo:"Luminária de Lua Mística RGB com Controle",titulo_en:"Mystic Lunar RGB Lamp with Remote",preco:"R$ 54,90",preco_en:"$11.20",tag:"Iluminação",tag_en:"Lighting",link:"/promo",imagem:"https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500"},{id:"sh-04",titulo:"Kit Papelaria Mágica & Canetas Néon Pastel",titulo_en:"Magical Stationery & Pastel Neon Pen Set",preco:"R$ 29,90",preco_en:"$5.90",tag:"Papelaria",tag_en:"Stationery",link:"/promo",imagem:"https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500"}];ae.useEffect(()=>{fetch("/api/shopee/showcase").then(a=>a.json()).then(a=>{a&&a.success&&Array.isArray(a.items)&&a.items.length>0?i(a.items.slice(0,4)):i(r)}).catch(()=>{i(r)})},[]);const s=e==="pt";return f.jsx("section",{className:"py-16 md:py-24 border-t border-purple-500/10 relative",children:f.jsxs("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:[f.jsxs("div",{className:"text-center mb-12",children:[f.jsxs("div",{className:"inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-3 shadow-sm",children:[f.jsx(Iy,{className:"w-3.5 h-3.5 text-amber-400"}),f.jsx("span",{children:"Setup & Lifestyle"})]}),f.jsx("h2",{className:"font-title font-black text-3xl sm:text-4xl text-white tracking-tight",children:t("shopee.title")}),f.jsx("p",{className:"text-slate-300 text-sm sm:text-base max-w-xl mx-auto mt-2",children:t("shopee.subtitle")})]}),f.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6",children:n.map((a,o)=>{const l=s?a.titulo:a.titulo_en||a.titulo,c=s?a.preco:a.preco_en||a.preco,d=s?a.tag:a.tag_en||a.tag;return f.jsxs("a",{href:a.link||"/promo",target:"_blank",rel:"noopener noreferrer",className:"group rounded-3xl glass-panel border border-purple-500/20 hover:border-pink-500/50 p-4 transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-neon-pink flex flex-col justify-between overflow-hidden",children:[f.jsxs("div",{className:"relative rounded-2xl overflow-hidden aspect-square mb-4 bg-purple-950/40",children:[f.jsx("img",{src:a.imagem,alt:l,className:"w-full h-full object-cover group-hover:scale-105 transition-transform duration-500",loading:"lazy"}),f.jsxs("div",{className:"absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[11px] font-bold text-pink-300 border border-pink-500/30 flex items-center gap-1",children:[f.jsx(Uy,{className:"w-3 h-3 text-pink-400"}),f.jsx("span",{children:d})]})]}),f.jsxs("div",{className:"space-y-2",children:[f.jsx("h3",{className:"font-title font-bold text-sm text-slate-100 group-hover:text-pink-300 transition-colors line-clamp-2",children:l}),f.jsxs("div",{className:"flex items-center justify-between pt-2 border-t border-purple-500/15",children:[f.jsx("span",{className:"font-title font-black text-lg text-amber-300",children:c}),f.jsx("span",{className:"text-xs font-bold text-slate-300 group-hover:text-white flex items-center gap-1",children:t("shopee.cta")})]})]})]},a.id||o)})})]})})}function fb({t,lang:e,stats:n}){return f.jsxs("div",{className:"space-y-6",children:[f.jsx(Gy,{t,stats:n}),f.jsx(ab,{t}),f.jsx(ob,{t}),f.jsx(Sx,{t,lang:e}),f.jsx(Mx,{t,lang:e})]})}function hb({t,lang:e}){const n=e==="en";ae.useEffect(()=>{document.title=n?"Pyxie Commands • Complete Guide & Official Documentation | Discord Bot":"Comandos da Pyxie • Guia Completo e Documentação Oficial | Discord Bot"},[n]);const i=n?[{q:"How do I add Pyxie to my Discord server?",a:'Click on the "Add Pyxie" button in the navbar or visit /invite to authorize Pyxie with slash commands permissions.'},{q:"Do slash commands work in all channels?",a:"Yes, unless server administrators restrict command permissions in Server Settings > Integrations."},{q:"What is the daily economy reset time?",a:"Daily rewards (/py-daily) reset every 24 hours per user. Streaks have a 48h grace period."},{q:"Are all 78 Tarot cards available in the Album?",a:"Yes! All 22 Major Arcana and 56 Minor Arcana can be collected, viewed, and shared via /py-album."}]:[{q:"Como adiciono a Pyxie ao meu servidor?",a:'Basta clicar no botão "Adicionar Pyxie" no topo da página ou acessar /invite para conceder permissões de comandos slash.'},{q:"Os comandos funcionam por barra (/) e prefixo (py!)?",a:"Sim! Todos os comandos possuem registro oficial por barra no Discord e aliases por prefixo py! correspondentes."},{q:"Como funciona o Álbum de Tarot dos 78 Arcanos?",a:"Ao tirar sua carta do dia (/py-tarot), você pode colá-la no seu álbum (/py-album). Colecionar cartas desbloqueia conquistas e moedinhas!"},{q:"Como evoluir o casamento no bot?",a:"Após casar (/py-casamento), você e seu cônjuge podem regar a Árvore da Vida a cada 12h, depositar no Cofre do Casal e ter encontros românticos!"}];return f.jsxs("div",{className:"min-h-screen py-8 space-y-16",children:[f.jsx(Sx,{t,lang:e}),f.jsxs("section",{className:"max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-purple-500/15",children:[f.jsxs("div",{className:"text-center mb-10",children:[f.jsxs("div",{className:"inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-bold mb-3",children:[f.jsx(Sy,{className:"w-3.5 h-3.5"}),f.jsx("span",{children:"Perguntas Frequentes & Diretrizes"})]}),f.jsx("h3",{className:"font-title font-extrabold text-2xl sm:text-3xl text-white",children:n?"Frequently Asked Questions":"Perguntas Frequentes sobre a Pyxie"})]}),f.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-5",children:i.map((r,s)=>f.jsxs("div",{className:"p-5 rounded-2xl glass-panel border border-purple-500/20 space-y-2 hover:border-pink-500/40 transition-colors",children:[f.jsxs("h4",{className:"font-title font-bold text-base text-white flex items-center gap-2",children:[f.jsx("span",{className:"text-pink-400",children:"Q."}),f.jsx("span",{children:r.q})]}),f.jsx("p",{className:"text-xs sm:text-sm text-slate-300 leading-relaxed pl-6",children:r.a})]},s))})]})]})}function pb({t,lang:e}){var K;const[n,i]=ae.useState([]),[r,s]=ae.useState(1),[a,o]=ae.useState(1),[l,c]=ae.useState(""),[d,p]=ae.useState(""),[h,g]=ae.useState("grid"),[v,S]=ae.useState(""),[m,u]=ae.useState(null),[_,x]=ae.useState(1),[w,P]=ae.useState(null),[b,A]=ae.useState(""),[N,V]=ae.useState(!1),[y,T]=ae.useState(!1);ae.useEffect(()=>{const U=localStorage.getItem("pyxie_admin_token")||"";S(U)},[]);const j=(U=1,$=l)=>{let ge=`/api/museum/arts?page=${U}&limit=24`;$&&(ge+=`&user=${encodeURIComponent($)}`),fetch(ge).then(be=>be.json()).then(be=>{if(be&&be.success){i(be.arts||[]),s(be.page||1),o(be.totalPages||1);const te=new URLSearchParams(window.location.search).get("art");if(te){const le=(be.arts||[]).find(ce=>ce.id===te);le&&u(le)}}}).catch(be=>console.error(be))};ae.useEffect(()=>{j(1)},[l]);const H=ae.useMemo(()=>{const U=new Map;return n.forEach($=>{$.userId&&$.authorName&&!U.has($.userId)&&U.set($.userId,$.authorName)}),Array.from(U.entries()).map(([$,ge])=>({userId:$,name:ge}))},[n]),q=ae.useMemo(()=>{if(!d.trim())return n;const U=d.toLowerCase();return n.filter($=>{var ge,be;return((ge=$.description)==null?void 0:ge.toLowerCase().includes(U))||((be=$.authorName)==null?void 0:be.toLowerCase().includes(U))})},[n,d]),Q=(U,$)=>{$&&$.stopPropagation();const ge=`${window.location.origin}/museu?art=${U.id}`;navigator.clipboard.writeText(ge),T(!0),setTimeout(()=>T(!1),2e3)},G=async(U,$)=>{if($.stopPropagation(),!!confirm("Deseja realmente remover esta arte da galeria?"))try{(await(await fetch(`/api/museum/art/${U}`,{method:"DELETE",headers:{"x-admin-token":v}})).json()).success?((m==null?void 0:m.id)===U&&u(null),j(r)):alert("Falha ao remover arte.")}catch{alert("Erro na requisição.")}},Y=async()=>{if(w)try{(await(await fetch(`/api/museum/art/${w.id}`,{method:"PATCH",headers:{"Content-Type":"application/json","x-admin-token":v},body:JSON.stringify({description:b})})).json()).success?(P(null),j(r)):alert("Falha ao atualizar descrição.")}catch{alert("Erro na requisição.")}},L=U=>{U.preventDefault(),V(!0)};return f.jsxs("div",{className:"min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10",children:[f.jsxs("div",{className:"text-center space-y-3",children:[f.jsxs("div",{className:"inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-bold shadow-sm",children:[f.jsx(hn,{className:"w-3.5 h-3.5 text-pink-400"}),f.jsx("span",{children:"Acervo Cultural da Comunidade"})]}),f.jsx("h1",{className:"font-title font-black text-3xl sm:text-5xl text-white tracking-tight",children:t("museum.title")}),f.jsx("p",{className:"text-slate-300 text-sm sm:text-base max-w-2xl mx-auto",children:t("museum.subtitle")})]}),f.jsxs("div",{className:"flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-purple-500/20",children:[f.jsxs("div",{className:"relative w-full md:w-80 flex items-center",children:[f.jsx(Uf,{className:"absolute left-3.5 w-4 h-4 text-slate-400"}),f.jsx("input",{type:"text",value:d,onChange:U=>p(U.target.value),placeholder:"Buscar por obra ou artista...",className:"w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-purple-500/20 text-xs text-white placeholder-slate-400 outline-none focus:border-pink-500 transition-colors"}),d&&f.jsx("button",{onClick:()=>p(""),className:"absolute right-3 text-slate-400 hover:text-white",children:f.jsx(_s,{className:"w-3.5 h-3.5"})})]}),f.jsxs("div",{className:"flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-purple-500/20",children:[f.jsxs("button",{onClick:()=>g("grid"),className:`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${h==="grid"?"bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-sm":"text-slate-400 hover:text-white"}`,children:[f.jsx(Cy,{className:"w-3.5 h-3.5"}),f.jsx("span",{children:"Mural Grid"})]}),f.jsxs("button",{onClick:()=>g("forum"),className:`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${h==="forum"?"bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-sm":"text-slate-400 hover:text-white"}`,children:[f.jsx(Ly,{className:"w-3.5 h-3.5"}),f.jsx("span",{children:"Modo Fórum"})]})]})]}),H.length>0&&f.jsxs("div",{className:"flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none",children:[f.jsx("button",{onClick:()=>c(""),className:`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${l?"bg-white/5 border border-purple-500/20 text-slate-300 hover:bg-white/10":"bg-pink-600 text-white shadow-neon-pink"}`,children:"Todos os Artistas"}),H.map(({userId:U,name:$})=>f.jsxs("button",{onClick:()=>c(l===U?"":U),className:`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${l===U?"bg-pink-600 text-white shadow-neon-pink":"bg-white/5 border border-purple-500/20 text-slate-300 hover:bg-white/10"}`,children:[f.jsx(Hg,{className:"w-3 h-3 text-purple-400"}),f.jsxs("span",{children:["@",$]})]},U))]}),q.length>0?h==="grid"?f.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6",children:q.map(U=>f.jsxs("div",{onClick:()=>{u(U),x(1)},className:"group relative rounded-2xl glass-panel border border-purple-500/20 hover:border-pink-500/50 overflow-hidden cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-neon-pink flex flex-col justify-between",children:[f.jsxs("div",{onContextMenu:L,className:"relative aspect-square overflow-hidden bg-black/40 select-none art-shield",children:[f.jsx("img",{src:U.imageUrl||`/api/museum/art-image/${U.id}`,alt:U.description||"Arte da Comunidade",loading:"lazy",className:"w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"}),f.jsx("div",{className:"absolute inset-0 bg-gradient-to-t from-[#0e071a] via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity"}),f.jsx("button",{onClick:$=>Q(U,$),className:"absolute top-2.5 right-2.5 p-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110",title:"Compartilhar Obra",children:f.jsx(la,{className:"w-3.5 h-3.5"})})]}),f.jsxs("div",{className:"p-4 space-y-2",children:[f.jsxs("div",{className:"flex items-center justify-between text-xs",children:[f.jsxs("span",{className:"font-title font-bold text-pink-300 truncate max-w-[150px]",children:["@",U.authorName||"Artista"]}),f.jsx("span",{className:"text-[11px] font-mono text-slate-400",children:U.createdAt?new Date(U.createdAt).toLocaleDateString("pt-BR"):""})]}),U.description&&f.jsx("p",{className:"text-slate-300 text-xs line-clamp-2 leading-relaxed",children:U.description})]}),v&&f.jsxs("div",{className:"p-3 border-t border-purple-500/15 flex items-center justify-end gap-2 bg-black/30",children:[f.jsx("button",{onClick:$=>{$.stopPropagation(),P(U),A(U.description||"")},className:"p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-purple-300",children:f.jsx(Dy,{className:"w-3.5 h-3.5"})}),f.jsx("button",{onClick:$=>G(U.id,$),className:"p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300",children:f.jsx(ky,{className:"w-3.5 h-3.5"})})]})]},U.id))}):f.jsx("div",{className:"space-y-6 max-w-4xl mx-auto",children:q.map(U=>f.jsxs("div",{className:"rounded-3xl glass-panel border border-purple-500/20 p-6 space-y-4 hover:border-pink-500/40 transition-colors",children:[f.jsxs("div",{className:"flex items-center justify-between border-b border-purple-500/15 pb-4",children:[f.jsxs("div",{className:"flex items-center gap-3",children:[f.jsx("div",{className:"w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 p-0.5 shadow-sm",children:f.jsx("div",{className:"w-full h-full rounded-full bg-[#0e071a] flex items-center justify-center text-pink-300 font-bold font-mono text-xs",children:(U.authorName||"A")[0].toUpperCase()})}),f.jsxs("div",{children:[f.jsxs("span",{className:"font-title font-bold text-white text-sm block",children:["@",U.authorName||"Artista Anônimo"]}),f.jsxs("span",{className:"text-[11px] font-mono text-purple-300/70",children:["Publicado em ",U.createdAt?new Date(U.createdAt).toLocaleDateString("pt-BR"):"Data cósmica"]})]})]}),f.jsxs("button",{onClick:()=>Q(U),className:"p-2 rounded-xl bg-white/5 hover:bg-white/10 text-purple-300 flex items-center gap-1.5 text-xs font-semibold",children:[f.jsx(la,{className:"w-3.5 h-3.5"}),f.jsx("span",{children:"Compartilhar"})]})]}),U.description&&f.jsx("p",{className:"text-slate-200 text-sm leading-relaxed",children:U.description}),f.jsx("div",{onContextMenu:L,onClick:()=>{u(U),x(1)},className:"rounded-2xl overflow-hidden bg-black/60 max-h-[500px] flex items-center justify-center cursor-pointer select-none art-shield border border-purple-500/15",children:f.jsx("img",{src:U.imageUrl||`/api/museum/art-image/${U.id}`,alt:U.description||"Arte da Comunidade",loading:"lazy",className:"w-full h-full object-contain max-h-[500px] pointer-events-none"})})]},U.id))}):f.jsx("div",{className:"text-center py-24 text-slate-400 text-sm",children:"Nenhuma obra encontrada para esta pesquisa ou artista."}),a>1&&f.jsxs("div",{className:"flex items-center justify-center gap-3 pt-6",children:[f.jsx("button",{onClick:()=>j(r-1),disabled:r<=1,className:"p-2.5 rounded-xl bg-white/5 border border-purple-500/20 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10",children:f.jsx(_y,{className:"w-4 h-4"})}),f.jsxs("span",{className:"font-mono text-xs text-slate-300",children:["Página ",r," de ",a]}),f.jsx("button",{onClick:()=>j(r+1),disabled:r>=a,className:"p-2.5 rounded-xl bg-white/5 border border-purple-500/20 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10",children:f.jsx(Fg,{className:"w-4 h-4"})})]}),m&&f.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in",onClick:()=>u(null),children:f.jsxs("div",{className:"relative max-w-5xl max-h-[92vh] w-full flex flex-col items-center justify-center",onClick:U=>U.stopPropagation(),children:[f.jsxs("div",{className:"w-full flex items-center justify-between mb-3 px-2 text-white",children:[f.jsxs("div",{className:"flex items-center gap-3",children:[f.jsxs("span",{className:"font-title font-bold text-sm text-pink-300",children:["@",m.authorName||"Artista"]}),f.jsxs("span",{className:"text-xs font-mono text-slate-400",children:["ID: ",(K=m.id)==null?void 0:K.slice(0,10),"..."]})]}),f.jsxs("div",{className:"flex items-center gap-2",children:[f.jsx("button",{onClick:()=>x(U=>Math.min(U+.25,2.5)),className:"p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white",title:"Aumentar Zoom",children:f.jsx(zy,{className:"w-4 h-4"})}),f.jsx("button",{onClick:()=>x(U=>Math.max(U-.25,.75)),className:"p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white",title:"Diminuir Zoom",children:f.jsx(By,{className:"w-4 h-4"})}),f.jsxs("button",{onClick:U=>Q(m,U),className:"px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 text-xs font-bold",title:"Copiar Link",children:[y?f.jsx(ba,{className:"w-4 h-4 text-emerald-400"}):f.jsx(la,{className:"w-4 h-4"}),f.jsx("span",{children:y?"Copiado!":"Compartilhar"})]}),f.jsx("button",{onClick:()=>u(null),className:"p-2 rounded-xl bg-white/10 hover:bg-rose-600 text-white ml-2 transition-colors",title:"Fechar (ESC)",children:f.jsx(_s,{className:"w-4 h-4"})})]})]}),f.jsx("div",{onContextMenu:L,className:"relative max-h-[75vh] max-w-full overflow-hidden rounded-2xl select-none art-shield flex items-center justify-center bg-black/50 p-2",children:f.jsx("img",{src:m.imageUrl||`/api/museum/art-image/${m.id}`,alt:m.description||"Arte da Comunidade",style:{transform:`scale(${_})`,transition:"transform 0.2s ease-out"},className:"max-h-[72vh] max-w-full object-contain pointer-events-none rounded-lg"})}),m.description&&f.jsxs("p",{className:"mt-4 text-center text-slate-300 text-sm max-w-2xl px-4",children:['"',m.description,'"']})]})}),w&&f.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md",children:f.jsxs("div",{className:"bg-[#0e071a] border border-purple-500/30 rounded-2xl p-6 w-full max-w-md space-y-4",children:[f.jsx("h3",{className:"font-title font-bold text-white text-lg",children:"Editar Descrição"}),f.jsx("textarea",{value:b,onChange:U=>A(U.target.value),className:"w-full h-32 p-3 rounded-xl bg-white/5 border border-purple-500/25 text-white text-sm outline-none focus:border-pink-500",placeholder:"Digite a nova descrição da obra..."}),f.jsxs("div",{className:"flex justify-end gap-2",children:[f.jsx("button",{onClick:()=>P(null),className:"px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-bold",children:"Cancelar"}),f.jsx("button",{onClick:Y,className:"px-4 py-2 rounded-xl bg-pink-600 text-white text-xs font-bold shadow-neon-pink",children:"Salvar Alterações"})]})]})}),N&&f.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md",onClick:()=>V(!1),children:f.jsxs("div",{className:"bg-[#0e071a] border border-pink-500/40 rounded-3xl p-6 max-w-md text-center space-y-4 shadow-neon-pink",onClick:U=>U.stopPropagation(),children:[f.jsx("div",{className:"w-12 h-12 mx-auto rounded-full bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400",children:f.jsx(zg,{className:"w-6 h-6"})}),f.jsx("h4",{className:"font-title font-bold text-white text-lg",children:"Proteção de Autoria"}),f.jsx("p",{className:"text-xs text-slate-300 leading-relaxed",children:t("museum.artShield")||"Esta obra foi criada com amor por um membro da nossa comunidade. O download direto é bloqueado para proteger a autoria do artista. Compartilhe o link do museu!"}),f.jsx("button",{onClick:()=>V(!1),className:"w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold shadow-neon-pink",children:"Compreendido ✨"})]})})]})}function mb({t,lang:e}){const[n,i]=ae.useState(10),[r,s]=ae.useState(!1),[a,o]=ae.useState(!1),[l,c]=ae.useState(null),[d,p]=ae.useState(!1),[h,g]=ae.useState(!0),v=ae.useRef(null),m=new URLSearchParams(window.location.search).get("token")||"",u=()=>{if(h)try{const N=new(window.AudioContext||window.webkitAudioContext),V=N.createOscillator(),y=N.createGain();V.type="sine",V.frequency.setValueAtTime(587.33,N.currentTime),V.frequency.exponentialRampToValueAtTime(880,N.currentTime+.3),y.gain.setValueAtTime(.18,N.currentTime),y.gain.exponentialRampToValueAtTime(.001,N.currentTime+.5),V.connect(y),y.connect(N.destination),V.start(),V.stop(N.currentTime+.5)}catch{}};ae.useEffect(()=>{if(n>0){const N=setTimeout(()=>{i(V=>V-1)},1e3);return()=>clearTimeout(N)}else s(!0),u(),_()},[n]);const _=()=>{var Q,G;const N=v.current;if(!N)return;const V=N.getContext("2d"),y=N.width=((Q=N.parentElement)==null?void 0:Q.clientWidth)||300,T=N.height=((G=N.parentElement)==null?void 0:G.clientHeight)||300,j=Array.from({length:40},()=>({x:y/2,y:T/2,vx:(Math.random()-.5)*8,vy:(Math.random()-.5)*8-2,radius:Math.random()*3+2,color:["#f472b6","#c084fc","#38bdf8","#fbbf24","#34d399"][Math.floor(Math.random()*5)],alpha:1}));let H=0;function q(){V.clearRect(0,0,y,T),j.forEach(Y=>{Y.x+=Y.vx,Y.y+=Y.vy,Y.alpha-=.02,V.beginPath(),V.arc(Y.x,Y.y,Y.radius,0,Math.PI*2),V.fillStyle=Y.color,V.globalAlpha=Math.max(0,Y.alpha),V.fill()}),H++,H<60?requestAnimationFrame(q):V.clearRect(0,0,y,T)}q()},x=()=>a?"Moedinhas entregues no seu cofre com sucesso! Volte amanhã para mais! 🎉":n>7?"Canalizando a energia estelar do seu cofre mágico... ⚡":n>3?"Quase lá! As moedas estão brilhando na penumbra cósmica... ✨":n>0?"Sintonização quase concluída! Prepare seu cofre! 🌟":"Energia cósmica pronta! Clique no botão abaixo para resgatar! 🎁",w=async()=>{if(!m){alert("Token de bônus não informado na URL. Abra o link gerado pelo comando /py-bonus no Discord.");return}p(!0);try{const V=await(await fetch("/api/bonus/claim",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:m})})).json();p(!1),V&&V.success?(o(!0),c(V),u()):alert(V.error||"Falha ao reivindicar bônus.")}catch{p(!1),alert("Erro na requisição com o servidor.")}},P=54,b=2*Math.PI*P,A=b-(10-n)/10*b;return f.jsxs("div",{className:"min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12",children:[f.jsxs("div",{className:"text-center space-y-3",children:[f.jsxs("div",{className:"inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-bold shadow-sm",children:[f.jsx(hn,{className:"w-3.5 h-3.5 text-pink-400"}),f.jsx("span",{children:"Canalização de Recompensas Cósmicas"})]}),f.jsx("h1",{className:"font-title font-black text-3xl sm:text-5xl text-white tracking-tight",children:t("bonus.title")}),f.jsx("p",{className:"text-slate-300 text-sm sm:text-base max-w-xl mx-auto",children:t("bonus.subtitle")})]}),f.jsxs("div",{className:"max-w-2xl mx-auto relative rounded-3xl glass-panel border border-purple-500/30 p-8 sm:p-10 shadow-2xl flex flex-col items-center text-center space-y-8 overflow-hidden",children:[f.jsx("canvas",{ref:v,className:"absolute inset-0 pointer-events-none z-20"}),f.jsx("button",{onClick:()=>g(!h),className:"absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors z-30",title:h?"Silenciar Áudio":"Ativar Efeitos Sonoros",children:h?f.jsx(Fy,{className:"w-4 h-4 text-pink-400"}):f.jsx(Oy,{className:"w-4 h-4"})}),f.jsxs("div",{className:"flex flex-col sm:flex-row items-center gap-4 relative z-10 max-w-lg",children:[f.jsx("div",{className:"relative w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-pink-500 to-purple-600 shadow-neon-pink flex-shrink-0 animate-bounce-slow",children:f.jsx("img",{src:"/assets/pyxie/pyxie_mascot.png",alt:"Mascote Pyxie",className:"w-full h-full object-contain rounded-full bg-[#0e071a] p-1.5"})}),f.jsxs("div",{className:"relative p-3.5 rounded-2xl bg-white/10 border border-purple-500/30 text-xs sm:text-sm text-slate-100 font-medium text-left shadow-lg",children:[x(),f.jsx("div",{className:"hidden sm:block absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-white/10 border-l border-b border-purple-500/30 rotate-45"})]})]}),f.jsxs("div",{className:"relative w-44 h-44 flex items-center justify-center z-10",children:[f.jsxs("svg",{className:"w-full h-full transform -rotate-90",children:[f.jsx("circle",{cx:"88",cy:"88",r:P,stroke:"rgba(255, 255, 255, 0.08)",strokeWidth:"10",fill:"transparent"}),f.jsx("circle",{cx:"88",cy:"88",r:P,stroke:"url(#gradient-ring)",strokeWidth:"10",fill:"transparent",strokeDasharray:b,strokeDashoffset:A,strokeLinecap:"round",className:"transition-all duration-1000 ease-linear"}),f.jsx("defs",{children:f.jsxs("linearGradient",{id:"gradient-ring",x1:"0%",y1:"0%",x2:"100%",y2:"100%",children:[f.jsx("stop",{offset:"0%",stopColor:"#f43f5e"}),f.jsx("stop",{offset:"50%",stopColor:"#ec4899"}),f.jsx("stop",{offset:"100%",stopColor:"#8b5cf6"})]})})]}),f.jsxs("div",{className:"absolute inset-0 flex flex-col items-center justify-center font-title",children:[a?f.jsx(qu,{className:"w-12 h-12 text-emerald-400 animate-pulse"}):r?f.jsx(hn,{className:"w-12 h-12 text-pink-400 animate-spin-slow"}):f.jsxs("span",{className:"font-black text-4xl sm:text-5xl text-white tracking-tighter",children:[n,"s"]}),f.jsx("span",{className:"text-[11px] font-mono text-purple-300/80 uppercase tracking-widest mt-1",children:a?"Resgatado":r?"Pronto!":"Canalizando"})]})]}),f.jsxs("div",{className:"w-full max-w-sm space-y-3 z-10",children:[!m&&f.jsxs("div",{className:"p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 text-left",children:[f.jsx(yy,{className:"w-4 h-4 flex-shrink-0"}),f.jsxs("span",{children:["Abra o link enviado pelo comando ",f.jsx("strong",{children:"/py-bonus"})," no Discord para validar seu token."]})]}),a?f.jsxs("div",{className:"p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold text-sm flex items-center justify-center gap-2",children:[f.jsx(qu,{className:"w-5 h-5 text-emerald-400"}),f.jsx("span",{children:t("bonus.claimed")})]}):f.jsxs("button",{onClick:w,disabled:!r||d||!m,className:`w-full py-4 rounded-2xl font-title font-black text-sm tracking-wide transition-all transform flex items-center justify-center gap-2 ${r&&m?"bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-neon-pink hover:scale-102 cursor-pointer":"bg-white/5 border border-purple-500/20 text-slate-500 cursor-not-allowed opacity-60"}`,children:[f.jsx(Yu,{className:"w-4 h-4"}),f.jsx("span",{children:d?"Creditando no cofre...":r?t("bonus.claim"):`Aguarde ${n}s para liberar ✨`})]})]})]}),f.jsx(Mx,{t,lang:e})]})}function gb({t,lang:e,userId:n}){const[i,r]=ae.useState(null),[s,a]=ae.useState([]),[o,l]=ae.useState(null),[c,d]=ae.useState("tarot"),[p,h]=ae.useState(!1),[g,v]=ae.useState(!0),S=n||window.location.pathname.split("/u/")[1]||"";ae.useEffect(()=>{S&&(v(!0),fetch(`/api/profile/${S}`).then(b=>b.json()).then(b=>{b&&b.success&&r(b),v(!1)}).catch(b=>{console.error("Erro ao buscar perfil:",b),v(!1)}))},[S]),ae.useEffect(()=>{fetch("/api/tarot/cards").then(b=>b.json()).then(b=>{b&&b.success&&Array.isArray(b.cards)&&a(b.cards)}).catch(b=>console.error("Erro ao buscar cartas:",b))},[]);const m=()=>{const b=window.location.href;navigator.share?navigator.share({title:"Perfil de Membro da Pyxie",text:"Confira minha coleção de Tarot e status na Pyxie!",url:b}).catch(()=>{}):(navigator.clipboard.writeText(b),h(!0),setTimeout(()=>h(!1),2e3))};if(g)return f.jsxs("div",{className:"min-h-screen flex items-center justify-center text-slate-400 font-mono text-sm",children:[f.jsx(hn,{className:"w-5 h-5 text-pink-400 animate-spin mr-2"}),f.jsx("span",{children:"Sintonizando perfil cósmico..."})]});if(!i)return f.jsxs("div",{className:"min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4",children:[f.jsx("div",{className:"w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400",children:f.jsx(Hg,{className:"w-8 h-8"})}),f.jsx("h2",{className:"font-title font-bold text-2xl text-white",children:"Perfil Não Encontrado"}),f.jsxs("p",{className:"text-slate-400 text-sm max-w-md",children:["Nenhum registro cósmico associado ao ID ",S," foi localizado no banco de dados."]}),f.jsx("a",{href:"/",className:"px-6 py-2.5 rounded-xl bg-pink-600 text-white font-bold text-xs shadow-neon-pink",children:"Voltar para o Início"})]});const{account:u,marriage:_,tarot:x,achievements:w}=i,P=new Set(x.discoveredCards||[]);return f.jsxs("div",{className:"min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10",children:[f.jsxs("div",{className:"relative rounded-3xl glass-panel border border-purple-500/30 p-6 sm:p-10 shadow-2xl overflow-hidden",children:[f.jsx("div",{className:"absolute top-0 right-0 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"}),f.jsxs("div",{className:"flex flex-col md:flex-row items-center justify-between gap-6 relative z-10",children:[f.jsxs("div",{className:"flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left",children:[f.jsxs("div",{className:"relative w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-pink-500 via-purple-600 to-cyan-400 shadow-neon-pink flex-shrink-0",children:[f.jsx("img",{src:"/assets/pyxie/pyxie_mascot.png",alt:"Avatar",className:"w-full h-full object-cover rounded-full bg-[#0e071a]"}),f.jsx("span",{className:"absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-400 border-2 border-[#0e071a] flex items-center justify-center text-[10px] text-black font-bold",children:"✓"})]}),f.jsxs("div",{className:"space-y-1.5",children:[f.jsxs("div",{className:"flex flex-wrap items-center justify-center sm:justify-start gap-2",children:[f.jsxs("h1",{className:"font-title font-black text-2xl sm:text-3xl text-white",children:["Membro (",S.slice(-4),")"]}),u.activeTitle&&f.jsxs("span",{className:"px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold",children:["👑 ",u.activeTitle]})]}),f.jsxs("div",{className:"flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-300",children:[f.jsxs("span",{className:"flex items-center gap-1 text-pink-300",children:[f.jsx(wy,{className:"w-3.5 h-3.5"}),f.jsxs("span",{children:["Profissão: ",u.profession||"Aventureiro Místico"]})]}),f.jsx("span",{children:"•"}),f.jsxs("span",{className:"flex items-center gap-1 text-amber-300",children:[f.jsx(Bl,{className:"w-3.5 h-3.5"}),f.jsxs("span",{children:[u.balance.toLocaleString("pt-BR")," Moedas"]})]}),u.dailyStreak>0&&f.jsxs(f.Fragment,{children:[f.jsx("span",{children:"•"}),f.jsxs("span",{className:"text-orange-400 font-bold",children:["🔥 ",u.dailyStreak," dias"]})]})]})]})]}),f.jsxs("button",{onClick:m,className:"px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-purple-500/30 text-white font-title font-bold text-xs flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg",children:[p?f.jsx(ba,{className:"w-4 h-4 text-emerald-400"}):f.jsx(la,{className:"w-4 h-4 text-pink-400"}),f.jsx("span",{children:p?"Link Copiado! 🔗":"Compartilhar Perfil"})]})]}),_&&_.isMarried&&f.jsxs("div",{className:"mt-8 pt-6 border-t border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 bg-pink-500/5 p-4 rounded-2xl",children:[f.jsxs("div",{className:"flex items-center gap-3",children:[f.jsx("div",{className:"w-10 h-10 rounded-full bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400",children:f.jsx(If,{className:"w-5 h-5 fill-pink-500"})}),f.jsxs("div",{children:[f.jsx("span",{className:"font-title font-bold text-sm text-white block",children:"Laço Matrimonial Ativo"}),f.jsxs("span",{className:"text-xs text-purple-300/80",children:["Árvore da Vida: Nível ",_.treeLevel," • Cofre: ",_.vaultCoins," 🪙"]})]})]}),f.jsxs("div",{className:"w-full sm:w-60 space-y-1",children:[f.jsxs("div",{className:"flex justify-between text-[11px] font-mono text-pink-300 font-bold",children:[f.jsx("span",{children:"Barra do Amor"}),f.jsxs("span",{children:[_.love,"%"]})]}),f.jsx("div",{className:"w-full h-2 rounded-full bg-white/10 overflow-hidden",children:f.jsx("div",{className:"h-full bg-gradient-to-r from-pink-500 to-rose-400 rounded-full transition-all duration-1000 shadow-neon-pink",style:{width:`${Math.min(_.love,100)}%`}})})]})]})]}),f.jsxs("div",{className:"flex items-center justify-center gap-3",children:[f.jsxs("button",{onClick:()=>d("tarot"),className:`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${c==="tarot"?"bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-neon-pink":"bg-white/5 border border-purple-500/20 text-slate-300 hover:bg-white/10"}`,children:[f.jsx(_l,{className:"w-4 h-4"}),f.jsxs("span",{children:["Álbum de Tarot (",x.discoveredCount,"/78)"]})]}),f.jsxs("button",{onClick:()=>d("achievements"),className:`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${c==="achievements"?"bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-neon-pink":"bg-white/5 border border-purple-500/20 text-slate-300 hover:bg-white/10"}`,children:[f.jsx(gy,{className:"w-4 h-4"}),f.jsx("span",{children:"Conquistas Arcanas"})]})]}),c==="tarot"&&f.jsxs("section",{className:"space-y-6",children:[f.jsxs("div",{className:"flex items-center justify-between text-xs text-slate-400 px-2 font-mono",children:[f.jsxs("span",{children:["Progresso da Coleção: ",x.discoveredCount," de 78 cartas (",Math.round(x.discoveredCount/78*100),"%)"]}),f.jsx("span",{children:"Clique na carta para inspecionar"})]}),f.jsx("div",{className:"grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4",children:s.map((b,A)=>{const N=A+1,V=P.has(N);return f.jsxs("div",{onClick:()=>V&&l(b),className:`group relative rounded-2xl p-2.5 border transition-all duration-300 transform flex flex-col items-center justify-between aspect-[2/3] ${V?"bg-[#140a28]/80 border-purple-500/40 hover:border-pink-500 hover:shadow-neon-pink hover:-translate-y-1.5 cursor-pointer":"bg-black/40 border-white/5 opacity-50 cursor-not-allowed"}`,style:{perspective:"1000px"},children:[f.jsx("div",{className:"w-full h-full relative rounded-xl overflow-hidden flex items-center justify-center bg-black/60",children:V?f.jsx("img",{src:`/api/tarot/card-image?id=${b.id}`,alt:b.name,loading:"lazy",className:"w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform"}):f.jsxs("div",{className:"flex flex-col items-center justify-center p-3 text-center space-y-2 text-slate-500",children:[f.jsx(Ry,{className:"w-5 h-5 text-slate-600"}),f.jsxs("span",{className:"font-mono text-[10px] tracking-wider",children:["#",String(N).padStart(2,"0")]}),f.jsx("span",{className:"text-[9px] uppercase tracking-widest text-slate-600",children:"Bloqueado"})]})}),f.jsx("div",{className:"w-full pt-2 text-center",children:f.jsx("span",{className:`text-[11px] font-bold block truncate ${V?"text-white group-hover:text-pink-300":"text-slate-600"}`,children:V?b.name:"???"})})]},b.id||A)})})]}),c==="achievements"&&f.jsx("section",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:w.map(b=>f.jsxs("div",{className:`p-5 rounded-2xl border transition-all flex items-start gap-4 ${b.completed?"bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-pink-500/40":"bg-white/5 border-white/5 opacity-60"}`,children:[f.jsx("div",{className:`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${b.completed?"bg-pink-500/20 border border-pink-500/40 text-pink-400":"bg-white/5 text-slate-500"}`,children:b.completed?"🏆":"🔒"}),f.jsxs("div",{className:"space-y-1 min-w-0 flex-1",children:[f.jsxs("div",{className:"flex items-center justify-between",children:[f.jsx("h4",{className:"font-title font-bold text-sm text-white truncate",children:e==="en"?b.nameEn:b.namePt}),f.jsxs("span",{className:"text-[11px] font-mono text-amber-300 font-bold",children:["+",b.rewardCoins," 🪙"]})]}),f.jsx("p",{className:"text-xs text-slate-300 leading-relaxed",children:e==="en"?b.descEn:b.descPt}),f.jsxs("div",{className:"pt-2 flex items-center gap-2 text-[10px] font-mono text-slate-400",children:[f.jsx("div",{className:"flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden",children:f.jsx("div",{className:"h-full bg-pink-500 rounded-full",style:{width:`${Math.min(b.current/b.target*100,100)}%`}})}),f.jsxs("span",{children:[b.current,"/",b.target]})]})]})]},b.id))}),o&&f.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in",onClick:()=>l(null),children:f.jsxs("div",{className:"relative max-w-md w-full rounded-3xl bg-[#0e071a] border border-purple-500/40 p-6 shadow-2xl space-y-4",onClick:b=>b.stopPropagation(),children:[f.jsxs("div",{className:"flex items-center justify-between border-b border-purple-500/15 pb-3",children:[f.jsx("span",{className:"font-title font-bold text-lg text-white",children:o.name}),f.jsx("button",{onClick:()=>l(null),className:"p-1 rounded-lg text-slate-400 hover:text-white",children:"✕"})]}),f.jsx("div",{className:"aspect-[2/3] max-h-72 mx-auto rounded-xl overflow-hidden border border-purple-500/30",children:f.jsx("img",{src:`/api/tarot/card-image?id=${o.id}`,alt:o.name,className:"w-full h-full object-cover"})}),f.jsxs("div",{className:"space-y-2 text-xs text-slate-300",children:[f.jsxs("div",{children:[f.jsx("span",{className:"font-bold text-pink-300 block mb-0.5",children:"Significado Direto:"}),f.jsx("p",{className:"leading-relaxed",children:o.upright})]}),f.jsxs("div",{children:[f.jsx("span",{className:"font-bold text-purple-300 block mb-0.5",children:"Significado Invertido:"}),f.jsx("p",{className:"leading-relaxed",children:o.reversed})]})]})]})})]})}const _m={pt:{"nav.features":"Recursos","nav.wiki":"Wiki & Comandos","nav.museum":"Museu 3D","nav.bonus":"Bônus 10s","nav.support":"Servidor de Suporte","nav.invite":"Adicionar Pyxie","hero.badge":"Online & Operacional • Discord.js v14","hero.titlePrefix":"A Fada Companheira do seu","hero.titleHighlight":"Servidor Discord","hero.subtitle":"Economia Mágica com moedinhas e feijões, Tarot dos 78 Arcanos em Canvas HD, 16 Carreiras e Dinâmica Social imersiva no Discord.","hero.btnInvite":"Adicionar ao Discord","hero.btnSupport":"Servidor de Suporte","hero.badgeEconomy":"Economia Viva","hero.badgeCareers":"16 Carreiras & Vocações","hero.badgeUptime":"Uptime Permanente","terminal.tabWork":"/py-work (Expediente)","terminal.tabMarriage":"/py-casamento (Amor)","terminal.tabTarot":"/py-tarot (Oráculo)","terminal.workTitle":"💼 Expediente Profissional: Alquimista Místico","terminal.workDesc":"Você precisa misturar a essência da Rosa Arcana com pó estelar. Qual proporção você escolhe?","terminal.opt1":"1. Proporção Áurea (Equilíbrio)","terminal.opt2":"2. Sobrecarga Mística (Alto Risco)","terminal.opt3":"3. Destilação Serena (Conservador)","terminal.workResult":"✨ Sucesso Perfeito! A poção brilhou em néon rosa. +95 moedinhas e +15 XP de Alquimia!","terminal.marriageTitle":"💍 Status Matrimonial: Pyxie & Astaroth","terminal.loveBar":"Barra do Amor Eterno","terminal.loveTree":"🌳 Árvore da Vida: Nível 3 (+30% Amor / 12h)","terminal.loveVault":"🏦 Cofre do Casal: 12.450 moedas (Rendimento +5%/dia)","terminal.tarotTitle":"🔮 Tiragem do Dia: Os 78 Arcanos","terminal.tarotCard":"O Mago (The Magician)","terminal.tarotDesc":'"O poder da criação e transmutação está vivo em suas mãos hoje. Use a astúcia e a determinação para moldar seu destino."',"museum.title":"The Holographic Community Deck","museum.subtitle":"Galeria 3D Holográfica com as artes e criações da comunidade em órbita espacial.","museum.exploreAll":"Explorar Galeria Completa da Comunidade ➔","museum.artShield":"🛡️ Obra protegida por direitos autorais da comunidade. Respeite os artistas!","museum.inspect":"Inspecionar Obra","museum.author":"Artista","museum.id":"ID da Peça","wiki.title":"Biblioteca Interativa de Comandos","wiki.subtitle":"Busque atalhos, módulos e sintaxes oficiais sincronizados em tempo real.","wiki.searchPlaceholder":"Pressione Ctrl+K ou digite para buscar comandos...","wiki.copied":"Copiado para a área de transferência!","wiki.copyBtn":"Copiar comando","shopee.title":"Achadinhos da Pyxie: Mimos de Setup & Papelaria","shopee.subtitle":"Curadoria exclusiva de pelúcias, iluminação RGB, papelaria gótica e mimos para seu quarto.","shopee.cta":"Ver na Shopee ➔","bonus.title":"Portal Encantado de Recompensas","bonus.subtitle":"Aguarde os 10 segundos mágicos de conexão cósmica para resgatar suas moedas diárias.","bonus.ready":"Bônus Pronto para Resgate!","bonus.claim":"Reivindicar Moedas Mágicas ✨","bonus.claimed":"🎉 Recompensa reivindicada com sucesso!","footer.rights":"Pyxie © 2026 • Feita com carinho para comunidades do mundo todo.","footer.terms":"Termos & Proteção a Menores","footer.wiki":"Wiki Oficial","footer.bonus":"Bônus Web","footer.museum":"Museu de Arte"},en:{"nav.features":"Features","nav.wiki":"Wiki & Commands","nav.museum":"3D Museum","nav.bonus":"10s Bonus","nav.support":"Support Server","nav.invite":"Add Pyxie","hero.badge":"Online & Operational • Discord.js v14","hero.titlePrefix":"The Companion Fairy for Your","hero.titleHighlight":"Discord Server","hero.subtitle":"Living Economy with magic coins and beans, 78 Tarot Arcana in HD Canvas, 16 Careers, and immersive Social Dynamics on Discord.","hero.btnInvite":"Add to Discord","hero.btnSupport":"Support Server","hero.badgeEconomy":"Living Economy","hero.badgeCareers":"16 Unique Vocations","hero.badgeUptime":"Permanent Uptime","terminal.tabWork":"/py-work (Shift)","terminal.tabMarriage":"/py-casamento (Family)","terminal.tabTarot":"/py-tarot (Oracle)","terminal.workTitle":"💼 Career Shift: Mystic Alchemist","terminal.workDesc":"You need to blend Arcane Rose essence with stardust. Which ratio do you choose?","terminal.opt1":"1. Golden Ratio (Balance)","terminal.opt2":"2. Mystic Surge (High Risk)","terminal.opt3":"3. Serene Distillation (Safe)","terminal.workResult":"✨ Perfect Outcome! The potion flared in neon pink. +95 coins and +15 Alchemy XP!","terminal.marriageTitle":"💍 Marriage Status: Pyxie & Astaroth","terminal.loveBar":"Eternal Love Gauge","terminal.loveTree":"🌳 Tree of Life: Level 3 (+30% Love / 12h)","terminal.loveVault":"🏦 Love Vault: 12,450 coins (+5%/day interest)","terminal.tarotTitle":"🔮 Daily Card Draw: The 78 Arcana","terminal.tarotCard":"The Magician","terminal.tarotDesc":'"The power of creation and transmutation is alive in your hands today. Use wit and determination to shape reality."',"museum.title":"The Holographic Community Deck","museum.subtitle":"3D Holographic Chamber with community artworks orbiting in deep space.","museum.exploreAll":"Explore Full Community Gallery ➔","museum.artShield":"🛡️ Artwork protected by community copyright. Respect the creators!","museum.inspect":"Inspect Artwork","museum.author":"Artist","museum.id":"Piece ID","wiki.title":"Interactive Commands Library","wiki.subtitle":"Search shortcuts, modules, and official syntaxes synchronized in real time.","wiki.searchPlaceholder":"Press Ctrl+K or type to search commands...","wiki.copied":"Copied to clipboard!","wiki.copyBtn":"Copy command","shopee.title":"Pyxie's Finds: Cozy Setup & Stationery","shopee.subtitle":"Handpicked plushies, RGB ambiance, cyber-goth stationery and desk accessories.","shopee.cta":"Check on Shopee ➔","bonus.title":"Enchanted Reward Portal","bonus.subtitle":"Wait for the 10-second cosmic alignment to claim your daily coins.","bonus.ready":"Bonus Ready to Claim!","bonus.claim":"Claim Magic Coins ✨","bonus.claimed":"🎉 Reward claimed successfully!","footer.rights":"Pyxie © 2026 • Crafted with love for communities worldwide.","footer.terms":"Terms & Child Safety","footer.wiki":"Official Wiki","footer.bonus":"Web Bonus","footer.museum":"Art Museum"}};function xb(){const[t,e]=ae.useState(()=>{const c=new URLSearchParams(window.location.search).get("lang");if(c==="pt"||c==="en")return c;const d=localStorage.getItem("pyxie_lang");return d==="pt"||d==="en"?d:navigator.language&&navigator.language.startsWith("en")?"en":"pt"}),[n,i]=ae.useState({guilds:18,users:2450,uptime:"99.9%"}),r=l=>{var c,d;return((c=_m[t])==null?void 0:c[l])||((d=_m.pt)==null?void 0:d[l])||l};ae.useEffect(()=>{const l=new dy({duration:1.2,easing:p=>Math.min(1,1.001-Math.pow(2,-10*p)),orientation:"vertical",gestureOrientation:"vertical",smoothWheel:!0,wheelMultiplier:1,touchMultiplier:2});function c(p){l.raf(p),requestAnimationFrame(c)}const d=requestAnimationFrame(c);return()=>{cancelAnimationFrame(d),l.destroy()}},[]),ae.useEffect(()=>{fetch("/api/stats").then(l=>l.json()).then(l=>{l&&l.success&&i({guilds:l.guilds||18,users:l.users||2450,uptime:l.uptimeFormatted||"99.9%"})}).catch(()=>{fetch("/api/status").then(l=>l.json()).then(l=>{l&&l.online&&i(c=>({...c,guilds:l.guilds||c.guilds}))}).catch(()=>{})})},[]),ae.useEffect(()=>{document.documentElement.lang=t==="pt"?"pt-BR":"en"},[t]);const s=window.location.pathname.toLowerCase();let a=fb,o="";if(s.includes("wiki"))a=hb;else if(s.includes("museu")||s.includes("museum"))a=pb;else if(s.includes("bonus"))a=mb;else if(s.startsWith("/u/")||s.includes("/u/")){a=gb;const l=window.location.pathname.split(/\/u\/?/i);l.length>1&&(o=l[1].split("/")[0])}return f.jsxs("div",{className:"bg-[#080410] text-slate-100 min-h-screen flex flex-col font-sans selection:bg-pink-500 selection:text-white relative overflow-x-hidden",children:[f.jsxs("div",{className:"fixed inset-0 pointer-events-none z-0 overflow-hidden",children:[f.jsx("div",{className:"absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[128px]"}),f.jsx("div",{className:"absolute top-[30%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px]"}),f.jsx("div",{className:"absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-[120px]"})]}),f.jsxs("div",{className:"relative z-10 flex flex-col min-h-screen",children:[f.jsx(Hy,{lang:t,setLang:e,t:r}),f.jsx("main",{className:"flex-1",children:f.jsx(a,{t:r,lang:t,stats:n,userId:o})}),f.jsx(Vy,{t:r})]})]})}const ym=document.getElementById("pyxie-app")||document.getElementById("root");ym?(window.__PYXIE_REACT_ACTIVE__=!0,eu.createRoot(ym).render(f.jsx(Wx.StrictMode,{children:f.jsx(xb,{})}))):console.warn("[Pyxie] Mounting container #pyxie-app or #root not found.");
