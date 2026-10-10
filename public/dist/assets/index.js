var Px=Object.defineProperty;var Lx=(t,e,n)=>e in t?Px(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n;var Se=(t,e,n)=>Lx(t,typeof e!="symbol"?e+"":e,n);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&i(a)}).observe(document,{childList:!0,subtree:!0});function n(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(r){if(r.ep)return;r.ep=!0;const s=n(r);fetch(r.href,s)}})();function Dx(t){return t&&t.__esModule&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}var bm={exports:{}},Al={},Tm={exports:{}},je={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var ka=Symbol.for("react.element"),kx=Symbol.for("react.portal"),Ix=Symbol.for("react.fragment"),Ux=Symbol.for("react.strict_mode"),Fx=Symbol.for("react.profiler"),Ox=Symbol.for("react.provider"),zx=Symbol.for("react.context"),Bx=Symbol.for("react.forward_ref"),jx=Symbol.for("react.suspense"),Hx=Symbol.for("react.memo"),Vx=Symbol.for("react.lazy"),of=Symbol.iterator;function Gx(t){return t===null||typeof t!="object"?null:(t=of&&t[of]||t["@@iterator"],typeof t=="function"?t:null)}var Am={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},Cm=Object.assign,Rm={};function Rs(t,e,n){this.props=t,this.context=e,this.refs=Rm,this.updater=n||Am}Rs.prototype.isReactComponent={};Rs.prototype.setState=function(t,e){if(typeof t!="object"&&typeof t!="function"&&t!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,t,e,"setState")};Rs.prototype.forceUpdate=function(t){this.updater.enqueueForceUpdate(this,t,"forceUpdate")};function Nm(){}Nm.prototype=Rs.prototype;function Vd(t,e,n){this.props=t,this.context=e,this.refs=Rm,this.updater=n||Am}var Gd=Vd.prototype=new Nm;Gd.constructor=Vd;Cm(Gd,Rs.prototype);Gd.isPureReactComponent=!0;var lf=Array.isArray,Pm=Object.prototype.hasOwnProperty,Wd={current:null},Lm={key:!0,ref:!0,__self:!0,__source:!0};function Dm(t,e,n){var i,r={},s=null,a=null;if(e!=null)for(i in e.ref!==void 0&&(a=e.ref),e.key!==void 0&&(s=""+e.key),e)Pm.call(e,i)&&!Lm.hasOwnProperty(i)&&(r[i]=e[i]);var o=arguments.length-2;if(o===1)r.children=n;else if(1<o){for(var l=Array(o),u=0;u<o;u++)l[u]=arguments[u+2];r.children=l}if(t&&t.defaultProps)for(i in o=t.defaultProps,o)r[i]===void 0&&(r[i]=o[i]);return{$$typeof:ka,type:t,key:s,ref:a,props:r,_owner:Wd.current}}function Wx(t,e){return{$$typeof:ka,type:t.type,key:e,ref:t.ref,props:t.props,_owner:t._owner}}function Xd(t){return typeof t=="object"&&t!==null&&t.$$typeof===ka}function Xx(t){var e={"=":"=0",":":"=2"};return"$"+t.replace(/[=:]/g,function(n){return e[n]})}var cf=/\/+/g;function Zl(t,e){return typeof t=="object"&&t!==null&&t.key!=null?Xx(""+t.key):e.toString(36)}function ko(t,e,n,i,r){var s=typeof t;(s==="undefined"||s==="boolean")&&(t=null);var a=!1;if(t===null)a=!0;else switch(s){case"string":case"number":a=!0;break;case"object":switch(t.$$typeof){case ka:case kx:a=!0}}if(a)return a=t,r=r(a),t=i===""?"."+Zl(a,0):i,lf(r)?(n="",t!=null&&(n=t.replace(cf,"$&/")+"/"),ko(r,e,n,"",function(u){return u})):r!=null&&(Xd(r)&&(r=Wx(r,n+(!r.key||a&&a.key===r.key?"":(""+r.key).replace(cf,"$&/")+"/")+t)),e.push(r)),1;if(a=0,i=i===""?".":i+":",lf(t))for(var o=0;o<t.length;o++){s=t[o];var l=i+Zl(s,o);a+=ko(s,e,n,l,r)}else if(l=Gx(t),typeof l=="function")for(t=l.call(t),o=0;!(s=t.next()).done;)s=s.value,l=i+Zl(s,o++),a+=ko(s,e,n,l,r);else if(s==="object")throw e=String(t),Error("Objects are not valid as a React child (found: "+(e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)+"). If you meant to render a collection of children, use an array instead.");return a}function qa(t,e,n){if(t==null)return t;var i=[],r=0;return ko(t,i,"","",function(s){return e.call(n,s,r++)}),i}function qx(t){if(t._status===-1){var e=t._result;e=e(),e.then(function(n){(t._status===0||t._status===-1)&&(t._status=1,t._result=n)},function(n){(t._status===0||t._status===-1)&&(t._status=2,t._result=n)}),t._status===-1&&(t._status=0,t._result=e)}if(t._status===1)return t._result.default;throw t._result}var qt={current:null},Io={transition:null},$x={ReactCurrentDispatcher:qt,ReactCurrentBatchConfig:Io,ReactCurrentOwner:Wd};function km(){throw Error("act(...) is not supported in production builds of React.")}je.Children={map:qa,forEach:function(t,e,n){qa(t,function(){e.apply(this,arguments)},n)},count:function(t){var e=0;return qa(t,function(){e++}),e},toArray:function(t){return qa(t,function(e){return e})||[]},only:function(t){if(!Xd(t))throw Error("React.Children.only expected to receive a single React element child.");return t}};je.Component=Rs;je.Fragment=Ix;je.Profiler=Fx;je.PureComponent=Vd;je.StrictMode=Ux;je.Suspense=jx;je.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=$x;je.act=km;je.cloneElement=function(t,e,n){if(t==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+t+".");var i=Cm({},t.props),r=t.key,s=t.ref,a=t._owner;if(e!=null){if(e.ref!==void 0&&(s=e.ref,a=Wd.current),e.key!==void 0&&(r=""+e.key),t.type&&t.type.defaultProps)var o=t.type.defaultProps;for(l in e)Pm.call(e,l)&&!Lm.hasOwnProperty(l)&&(i[l]=e[l]===void 0&&o!==void 0?o[l]:e[l])}var l=arguments.length-2;if(l===1)i.children=n;else if(1<l){o=Array(l);for(var u=0;u<l;u++)o[u]=arguments[u+2];i.children=o}return{$$typeof:ka,type:t.type,key:r,ref:s,props:i,_owner:a}};je.createContext=function(t){return t={$$typeof:zx,_currentValue:t,_currentValue2:t,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},t.Provider={$$typeof:Ox,_context:t},t.Consumer=t};je.createElement=Dm;je.createFactory=function(t){var e=Dm.bind(null,t);return e.type=t,e};je.createRef=function(){return{current:null}};je.forwardRef=function(t){return{$$typeof:Bx,render:t}};je.isValidElement=Xd;je.lazy=function(t){return{$$typeof:Vx,_payload:{_status:-1,_result:t},_init:qx}};je.memo=function(t,e){return{$$typeof:Hx,type:t,compare:e===void 0?null:e}};je.startTransition=function(t){var e=Io.transition;Io.transition={};try{t()}finally{Io.transition=e}};je.unstable_act=km;je.useCallback=function(t,e){return qt.current.useCallback(t,e)};je.useContext=function(t){return qt.current.useContext(t)};je.useDebugValue=function(){};je.useDeferredValue=function(t){return qt.current.useDeferredValue(t)};je.useEffect=function(t,e){return qt.current.useEffect(t,e)};je.useId=function(){return qt.current.useId()};je.useImperativeHandle=function(t,e,n){return qt.current.useImperativeHandle(t,e,n)};je.useInsertionEffect=function(t,e){return qt.current.useInsertionEffect(t,e)};je.useLayoutEffect=function(t,e){return qt.current.useLayoutEffect(t,e)};je.useMemo=function(t,e){return qt.current.useMemo(t,e)};je.useReducer=function(t,e,n){return qt.current.useReducer(t,e,n)};je.useRef=function(t){return qt.current.useRef(t)};je.useState=function(t){return qt.current.useState(t)};je.useSyncExternalStore=function(t,e,n){return qt.current.useSyncExternalStore(t,e,n)};je.useTransition=function(){return qt.current.useTransition()};je.version="18.3.1";Tm.exports=je;var ae=Tm.exports;const Yx=Dx(ae);/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Kx=ae,Zx=Symbol.for("react.element"),Qx=Symbol.for("react.fragment"),Jx=Object.prototype.hasOwnProperty,ev=Kx.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,tv={key:!0,ref:!0,__self:!0,__source:!0};function Im(t,e,n){var i,r={},s=null,a=null;n!==void 0&&(s=""+n),e.key!==void 0&&(s=""+e.key),e.ref!==void 0&&(a=e.ref);for(i in e)Jx.call(e,i)&&!tv.hasOwnProperty(i)&&(r[i]=e[i]);if(t&&t.defaultProps)for(i in e=t.defaultProps,e)r[i]===void 0&&(r[i]=e[i]);return{$$typeof:Zx,type:t,key:s,ref:a,props:r,_owner:ev.current}}Al.Fragment=Qx;Al.jsx=Im;Al.jsxs=Im;bm.exports=Al;var c=bm.exports,iu={},Um={exports:{}},mn={},Fm={exports:{}},Om={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */(function(t){function e(L,K){var I=L.length;L.push(K);e:for(;0<I;){var q=I-1>>>1,fe=L[q];if(0<r(fe,K))L[q]=K,L[I]=fe,I=q;else break e}}function n(L){return L.length===0?null:L[0]}function i(L){if(L.length===0)return null;var K=L[0],I=L.pop();if(I!==K){L[0]=I;e:for(var q=0,fe=L.length,Te=fe>>>1;q<Te;){var W=2*(q+1)-1,te=L[W],le=W+1,ce=L[le];if(0>r(te,I))le<fe&&0>r(ce,te)?(L[q]=ce,L[le]=I,q=le):(L[q]=te,L[W]=I,q=W);else if(le<fe&&0>r(ce,I))L[q]=ce,L[le]=I,q=le;else break e}}return K}function r(L,K){var I=L.sortIndex-K.sortIndex;return I!==0?I:L.id-K.id}if(typeof performance=="object"&&typeof performance.now=="function"){var s=performance;t.unstable_now=function(){return s.now()}}else{var a=Date,o=a.now();t.unstable_now=function(){return a.now()-o}}var l=[],u=[],h=1,p=null,f=3,g=!1,v=!1,S=!1,m=typeof setTimeout=="function"?setTimeout:null,d=typeof clearTimeout=="function"?clearTimeout:null,_=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function x(L){for(var K=n(u);K!==null;){if(K.callback===null)i(u);else if(K.startTime<=L)i(u),K.sortIndex=K.expirationTime,e(l,K);else break;K=n(u)}}function M(L){if(S=!1,x(L),!v)if(n(l)!==null)v=!0,G(P);else{var K=n(u);K!==null&&Y(M,K.startTime-L)}}function P(L,K){v=!1,S&&(S=!1,d(N),N=-1),g=!0;var I=f;try{for(x(K),p=n(l);p!==null&&(!(p.expirationTime>K)||L&&!b());){var q=p.callback;if(typeof q=="function"){p.callback=null,f=p.priorityLevel;var fe=q(p.expirationTime<=K);K=t.unstable_now(),typeof fe=="function"?p.callback=fe:p===n(l)&&i(l),x(K)}else i(l);p=n(l)}if(p!==null)var Te=!0;else{var W=n(u);W!==null&&Y(M,W.startTime-K),Te=!1}return Te}finally{p=null,f=I,g=!1}}var T=!1,A=null,N=-1,H=5,y=-1;function b(){return!(t.unstable_now()-y<H)}function V(){if(A!==null){var L=t.unstable_now();y=L;var K=!0;try{K=A(!0,L)}finally{K?j():(T=!1,A=null)}}else T=!1}var j;if(typeof _=="function")j=function(){_(V)};else if(typeof MessageChannel<"u"){var $=new MessageChannel,Q=$.port2;$.port1.onmessage=V,j=function(){Q.postMessage(null)}}else j=function(){m(V,0)};function G(L){A=L,T||(T=!0,j())}function Y(L,K){N=m(function(){L(t.unstable_now())},K)}t.unstable_IdlePriority=5,t.unstable_ImmediatePriority=1,t.unstable_LowPriority=4,t.unstable_NormalPriority=3,t.unstable_Profiling=null,t.unstable_UserBlockingPriority=2,t.unstable_cancelCallback=function(L){L.callback=null},t.unstable_continueExecution=function(){v||g||(v=!0,G(P))},t.unstable_forceFrameRate=function(L){0>L||125<L?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):H=0<L?Math.floor(1e3/L):5},t.unstable_getCurrentPriorityLevel=function(){return f},t.unstable_getFirstCallbackNode=function(){return n(l)},t.unstable_next=function(L){switch(f){case 1:case 2:case 3:var K=3;break;default:K=f}var I=f;f=K;try{return L()}finally{f=I}},t.unstable_pauseExecution=function(){},t.unstable_requestPaint=function(){},t.unstable_runWithPriority=function(L,K){switch(L){case 1:case 2:case 3:case 4:case 5:break;default:L=3}var I=f;f=L;try{return K()}finally{f=I}},t.unstable_scheduleCallback=function(L,K,I){var q=t.unstable_now();switch(typeof I=="object"&&I!==null?(I=I.delay,I=typeof I=="number"&&0<I?q+I:q):I=q,L){case 1:var fe=-1;break;case 2:fe=250;break;case 5:fe=1073741823;break;case 4:fe=1e4;break;default:fe=5e3}return fe=I+fe,L={id:h++,callback:K,priorityLevel:L,startTime:I,expirationTime:fe,sortIndex:-1},I>q?(L.sortIndex=I,e(u,L),n(l)===null&&L===n(u)&&(S?(d(N),N=-1):S=!0,Y(M,I-q))):(L.sortIndex=fe,e(l,L),v||g||(v=!0,G(P))),L},t.unstable_shouldYield=b,t.unstable_wrapCallback=function(L){var K=f;return function(){var I=f;f=K;try{return L.apply(this,arguments)}finally{f=I}}}})(Om);Fm.exports=Om;var nv=Fm.exports;/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var iv=ae,pn=nv;function ie(t){for(var e="https://reactjs.org/docs/error-decoder.html?invariant="+t,n=1;n<arguments.length;n++)e+="&args[]="+encodeURIComponent(arguments[n]);return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var zm=new Set,fa={};function Cr(t,e){ps(t,e),ps(t+"Capture",e)}function ps(t,e){for(fa[t]=e,t=0;t<e.length;t++)zm.add(e[t])}var di=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),ru=Object.prototype.hasOwnProperty,rv=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,uf={},df={};function sv(t){return ru.call(df,t)?!0:ru.call(uf,t)?!1:rv.test(t)?df[t]=!0:(uf[t]=!0,!1)}function av(t,e,n,i){if(n!==null&&n.type===0)return!1;switch(typeof e){case"function":case"symbol":return!0;case"boolean":return i?!1:n!==null?!n.acceptsBooleans:(t=t.toLowerCase().slice(0,5),t!=="data-"&&t!=="aria-");default:return!1}}function ov(t,e,n,i){if(e===null||typeof e>"u"||av(t,e,n,i))return!0;if(i)return!1;if(n!==null)switch(n.type){case 3:return!e;case 4:return e===!1;case 5:return isNaN(e);case 6:return isNaN(e)||1>e}return!1}function $t(t,e,n,i,r,s,a){this.acceptsBooleans=e===2||e===3||e===4,this.attributeName=i,this.attributeNamespace=r,this.mustUseProperty=n,this.propertyName=t,this.type=e,this.sanitizeURL=s,this.removeEmptyString=a}var It={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(t){It[t]=new $t(t,0,!1,t,null,!1,!1)});[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(t){var e=t[0];It[e]=new $t(e,1,!1,t[1],null,!1,!1)});["contentEditable","draggable","spellCheck","value"].forEach(function(t){It[t]=new $t(t,2,!1,t.toLowerCase(),null,!1,!1)});["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(t){It[t]=new $t(t,2,!1,t,null,!1,!1)});"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(t){It[t]=new $t(t,3,!1,t.toLowerCase(),null,!1,!1)});["checked","multiple","muted","selected"].forEach(function(t){It[t]=new $t(t,3,!0,t,null,!1,!1)});["capture","download"].forEach(function(t){It[t]=new $t(t,4,!1,t,null,!1,!1)});["cols","rows","size","span"].forEach(function(t){It[t]=new $t(t,6,!1,t,null,!1,!1)});["rowSpan","start"].forEach(function(t){It[t]=new $t(t,5,!1,t.toLowerCase(),null,!1,!1)});var qd=/[\-:]([a-z])/g;function $d(t){return t[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(t){var e=t.replace(qd,$d);It[e]=new $t(e,1,!1,t,null,!1,!1)});"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(t){var e=t.replace(qd,$d);It[e]=new $t(e,1,!1,t,"http://www.w3.org/1999/xlink",!1,!1)});["xml:base","xml:lang","xml:space"].forEach(function(t){var e=t.replace(qd,$d);It[e]=new $t(e,1,!1,t,"http://www.w3.org/XML/1998/namespace",!1,!1)});["tabIndex","crossOrigin"].forEach(function(t){It[t]=new $t(t,1,!1,t.toLowerCase(),null,!1,!1)});It.xlinkHref=new $t("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1);["src","href","action","formAction"].forEach(function(t){It[t]=new $t(t,1,!1,t.toLowerCase(),null,!0,!0)});function Yd(t,e,n,i){var r=It.hasOwnProperty(e)?It[e]:null;(r!==null?r.type!==0:i||!(2<e.length)||e[0]!=="o"&&e[0]!=="O"||e[1]!=="n"&&e[1]!=="N")&&(ov(e,n,r,i)&&(n=null),i||r===null?sv(e)&&(n===null?t.removeAttribute(e):t.setAttribute(e,""+n)):r.mustUseProperty?t[r.propertyName]=n===null?r.type===3?!1:"":n:(e=r.attributeName,i=r.attributeNamespace,n===null?t.removeAttribute(e):(r=r.type,n=r===3||r===4&&n===!0?"":""+n,i?t.setAttributeNS(i,e,n):t.setAttribute(e,n))))}var xi=iv.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,$a=Symbol.for("react.element"),Xr=Symbol.for("react.portal"),qr=Symbol.for("react.fragment"),Kd=Symbol.for("react.strict_mode"),su=Symbol.for("react.profiler"),Bm=Symbol.for("react.provider"),jm=Symbol.for("react.context"),Zd=Symbol.for("react.forward_ref"),au=Symbol.for("react.suspense"),ou=Symbol.for("react.suspense_list"),Qd=Symbol.for("react.memo"),Ci=Symbol.for("react.lazy"),Hm=Symbol.for("react.offscreen"),hf=Symbol.iterator;function Is(t){return t===null||typeof t!="object"?null:(t=hf&&t[hf]||t["@@iterator"],typeof t=="function"?t:null)}var gt=Object.assign,Ql;function Ks(t){if(Ql===void 0)try{throw Error()}catch(n){var e=n.stack.trim().match(/\n( *(at )?)/);Ql=e&&e[1]||""}return`
`+Ql+t}var Jl=!1;function ec(t,e){if(!t||Jl)return"";Jl=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(e)if(e=function(){throw Error()},Object.defineProperty(e.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(e,[])}catch(u){var i=u}Reflect.construct(t,[],e)}else{try{e.call()}catch(u){i=u}t.call(e.prototype)}else{try{throw Error()}catch(u){i=u}t()}}catch(u){if(u&&i&&typeof u.stack=="string"){for(var r=u.stack.split(`
`),s=i.stack.split(`
`),a=r.length-1,o=s.length-1;1<=a&&0<=o&&r[a]!==s[o];)o--;for(;1<=a&&0<=o;a--,o--)if(r[a]!==s[o]){if(a!==1||o!==1)do if(a--,o--,0>o||r[a]!==s[o]){var l=`
`+r[a].replace(" at new "," at ");return t.displayName&&l.includes("<anonymous>")&&(l=l.replace("<anonymous>",t.displayName)),l}while(1<=a&&0<=o);break}}}finally{Jl=!1,Error.prepareStackTrace=n}return(t=t?t.displayName||t.name:"")?Ks(t):""}function lv(t){switch(t.tag){case 5:return Ks(t.type);case 16:return Ks("Lazy");case 13:return Ks("Suspense");case 19:return Ks("SuspenseList");case 0:case 2:case 15:return t=ec(t.type,!1),t;case 11:return t=ec(t.type.render,!1),t;case 1:return t=ec(t.type,!0),t;default:return""}}function lu(t){if(t==null)return null;if(typeof t=="function")return t.displayName||t.name||null;if(typeof t=="string")return t;switch(t){case qr:return"Fragment";case Xr:return"Portal";case su:return"Profiler";case Kd:return"StrictMode";case au:return"Suspense";case ou:return"SuspenseList"}if(typeof t=="object")switch(t.$$typeof){case jm:return(t.displayName||"Context")+".Consumer";case Bm:return(t._context.displayName||"Context")+".Provider";case Zd:var e=t.render;return t=t.displayName,t||(t=e.displayName||e.name||"",t=t!==""?"ForwardRef("+t+")":"ForwardRef"),t;case Qd:return e=t.displayName||null,e!==null?e:lu(t.type)||"Memo";case Ci:e=t._payload,t=t._init;try{return lu(t(e))}catch{}}return null}function cv(t){var e=t.type;switch(t.tag){case 24:return"Cache";case 9:return(e.displayName||"Context")+".Consumer";case 10:return(e._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return t=e.render,t=t.displayName||t.name||"",e.displayName||(t!==""?"ForwardRef("+t+")":"ForwardRef");case 7:return"Fragment";case 5:return e;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return lu(e);case 8:return e===Kd?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof e=="function")return e.displayName||e.name||null;if(typeof e=="string")return e}return null}function Wi(t){switch(typeof t){case"boolean":case"number":case"string":case"undefined":return t;case"object":return t;default:return""}}function Vm(t){var e=t.type;return(t=t.nodeName)&&t.toLowerCase()==="input"&&(e==="checkbox"||e==="radio")}function uv(t){var e=Vm(t)?"checked":"value",n=Object.getOwnPropertyDescriptor(t.constructor.prototype,e),i=""+t[e];if(!t.hasOwnProperty(e)&&typeof n<"u"&&typeof n.get=="function"&&typeof n.set=="function"){var r=n.get,s=n.set;return Object.defineProperty(t,e,{configurable:!0,get:function(){return r.call(this)},set:function(a){i=""+a,s.call(this,a)}}),Object.defineProperty(t,e,{enumerable:n.enumerable}),{getValue:function(){return i},setValue:function(a){i=""+a},stopTracking:function(){t._valueTracker=null,delete t[e]}}}}function Ya(t){t._valueTracker||(t._valueTracker=uv(t))}function Gm(t){if(!t)return!1;var e=t._valueTracker;if(!e)return!0;var n=e.getValue(),i="";return t&&(i=Vm(t)?t.checked?"true":"false":t.value),t=i,t!==n?(e.setValue(t),!0):!1}function Jo(t){if(t=t||(typeof document<"u"?document:void 0),typeof t>"u")return null;try{return t.activeElement||t.body}catch{return t.body}}function cu(t,e){var n=e.checked;return gt({},e,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:n??t._wrapperState.initialChecked})}function ff(t,e){var n=e.defaultValue==null?"":e.defaultValue,i=e.checked!=null?e.checked:e.defaultChecked;n=Wi(e.value!=null?e.value:n),t._wrapperState={initialChecked:i,initialValue:n,controlled:e.type==="checkbox"||e.type==="radio"?e.checked!=null:e.value!=null}}function Wm(t,e){e=e.checked,e!=null&&Yd(t,"checked",e,!1)}function uu(t,e){Wm(t,e);var n=Wi(e.value),i=e.type;if(n!=null)i==="number"?(n===0&&t.value===""||t.value!=n)&&(t.value=""+n):t.value!==""+n&&(t.value=""+n);else if(i==="submit"||i==="reset"){t.removeAttribute("value");return}e.hasOwnProperty("value")?du(t,e.type,n):e.hasOwnProperty("defaultValue")&&du(t,e.type,Wi(e.defaultValue)),e.checked==null&&e.defaultChecked!=null&&(t.defaultChecked=!!e.defaultChecked)}function pf(t,e,n){if(e.hasOwnProperty("value")||e.hasOwnProperty("defaultValue")){var i=e.type;if(!(i!=="submit"&&i!=="reset"||e.value!==void 0&&e.value!==null))return;e=""+t._wrapperState.initialValue,n||e===t.value||(t.value=e),t.defaultValue=e}n=t.name,n!==""&&(t.name=""),t.defaultChecked=!!t._wrapperState.initialChecked,n!==""&&(t.name=n)}function du(t,e,n){(e!=="number"||Jo(t.ownerDocument)!==t)&&(n==null?t.defaultValue=""+t._wrapperState.initialValue:t.defaultValue!==""+n&&(t.defaultValue=""+n))}var Zs=Array.isArray;function ss(t,e,n,i){if(t=t.options,e){e={};for(var r=0;r<n.length;r++)e["$"+n[r]]=!0;for(n=0;n<t.length;n++)r=e.hasOwnProperty("$"+t[n].value),t[n].selected!==r&&(t[n].selected=r),r&&i&&(t[n].defaultSelected=!0)}else{for(n=""+Wi(n),e=null,r=0;r<t.length;r++){if(t[r].value===n){t[r].selected=!0,i&&(t[r].defaultSelected=!0);return}e!==null||t[r].disabled||(e=t[r])}e!==null&&(e.selected=!0)}}function hu(t,e){if(e.dangerouslySetInnerHTML!=null)throw Error(ie(91));return gt({},e,{value:void 0,defaultValue:void 0,children:""+t._wrapperState.initialValue})}function mf(t,e){var n=e.value;if(n==null){if(n=e.children,e=e.defaultValue,n!=null){if(e!=null)throw Error(ie(92));if(Zs(n)){if(1<n.length)throw Error(ie(93));n=n[0]}e=n}e==null&&(e=""),n=e}t._wrapperState={initialValue:Wi(n)}}function Xm(t,e){var n=Wi(e.value),i=Wi(e.defaultValue);n!=null&&(n=""+n,n!==t.value&&(t.value=n),e.defaultValue==null&&t.defaultValue!==n&&(t.defaultValue=n)),i!=null&&(t.defaultValue=""+i)}function gf(t){var e=t.textContent;e===t._wrapperState.initialValue&&e!==""&&e!==null&&(t.value=e)}function qm(t){switch(t){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function fu(t,e){return t==null||t==="http://www.w3.org/1999/xhtml"?qm(e):t==="http://www.w3.org/2000/svg"&&e==="foreignObject"?"http://www.w3.org/1999/xhtml":t}var Ka,$m=function(t){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(e,n,i,r){MSApp.execUnsafeLocalFunction(function(){return t(e,n,i,r)})}:t}(function(t,e){if(t.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in t)t.innerHTML=e;else{for(Ka=Ka||document.createElement("div"),Ka.innerHTML="<svg>"+e.valueOf().toString()+"</svg>",e=Ka.firstChild;t.firstChild;)t.removeChild(t.firstChild);for(;e.firstChild;)t.appendChild(e.firstChild)}});function pa(t,e){if(e){var n=t.firstChild;if(n&&n===t.lastChild&&n.nodeType===3){n.nodeValue=e;return}}t.textContent=e}var na={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},dv=["Webkit","ms","Moz","O"];Object.keys(na).forEach(function(t){dv.forEach(function(e){e=e+t.charAt(0).toUpperCase()+t.substring(1),na[e]=na[t]})});function Ym(t,e,n){return e==null||typeof e=="boolean"||e===""?"":n||typeof e!="number"||e===0||na.hasOwnProperty(t)&&na[t]?(""+e).trim():e+"px"}function Km(t,e){t=t.style;for(var n in e)if(e.hasOwnProperty(n)){var i=n.indexOf("--")===0,r=Ym(n,e[n],i);n==="float"&&(n="cssFloat"),i?t.setProperty(n,r):t[n]=r}}var hv=gt({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function pu(t,e){if(e){if(hv[t]&&(e.children!=null||e.dangerouslySetInnerHTML!=null))throw Error(ie(137,t));if(e.dangerouslySetInnerHTML!=null){if(e.children!=null)throw Error(ie(60));if(typeof e.dangerouslySetInnerHTML!="object"||!("__html"in e.dangerouslySetInnerHTML))throw Error(ie(61))}if(e.style!=null&&typeof e.style!="object")throw Error(ie(62))}}function mu(t,e){if(t.indexOf("-")===-1)return typeof e.is=="string";switch(t){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var gu=null;function Jd(t){return t=t.target||t.srcElement||window,t.correspondingUseElement&&(t=t.correspondingUseElement),t.nodeType===3?t.parentNode:t}var xu=null,as=null,os=null;function xf(t){if(t=Fa(t)){if(typeof xu!="function")throw Error(ie(280));var e=t.stateNode;e&&(e=Ll(e),xu(t.stateNode,t.type,e))}}function Zm(t){as?os?os.push(t):os=[t]:as=t}function Qm(){if(as){var t=as,e=os;if(os=as=null,xf(t),e)for(t=0;t<e.length;t++)xf(e[t])}}function Jm(t,e){return t(e)}function e0(){}var tc=!1;function t0(t,e,n){if(tc)return t(e,n);tc=!0;try{return Jm(t,e,n)}finally{tc=!1,(as!==null||os!==null)&&(e0(),Qm())}}function ma(t,e){var n=t.stateNode;if(n===null)return null;var i=Ll(n);if(i===null)return null;n=i[e];e:switch(e){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(i=!i.disabled)||(t=t.type,i=!(t==="button"||t==="input"||t==="select"||t==="textarea")),t=!i;break e;default:t=!1}if(t)return null;if(n&&typeof n!="function")throw Error(ie(231,e,typeof n));return n}var vu=!1;if(di)try{var Us={};Object.defineProperty(Us,"passive",{get:function(){vu=!0}}),window.addEventListener("test",Us,Us),window.removeEventListener("test",Us,Us)}catch{vu=!1}function fv(t,e,n,i,r,s,a,o,l){var u=Array.prototype.slice.call(arguments,3);try{e.apply(n,u)}catch(h){this.onError(h)}}var ia=!1,el=null,tl=!1,_u=null,pv={onError:function(t){ia=!0,el=t}};function mv(t,e,n,i,r,s,a,o,l){ia=!1,el=null,fv.apply(pv,arguments)}function gv(t,e,n,i,r,s,a,o,l){if(mv.apply(this,arguments),ia){if(ia){var u=el;ia=!1,el=null}else throw Error(ie(198));tl||(tl=!0,_u=u)}}function Rr(t){var e=t,n=t;if(t.alternate)for(;e.return;)e=e.return;else{t=e;do e=t,e.flags&4098&&(n=e.return),t=e.return;while(t)}return e.tag===3?n:null}function n0(t){if(t.tag===13){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function vf(t){if(Rr(t)!==t)throw Error(ie(188))}function xv(t){var e=t.alternate;if(!e){if(e=Rr(t),e===null)throw Error(ie(188));return e!==t?null:t}for(var n=t,i=e;;){var r=n.return;if(r===null)break;var s=r.alternate;if(s===null){if(i=r.return,i!==null){n=i;continue}break}if(r.child===s.child){for(s=r.child;s;){if(s===n)return vf(r),t;if(s===i)return vf(r),e;s=s.sibling}throw Error(ie(188))}if(n.return!==i.return)n=r,i=s;else{for(var a=!1,o=r.child;o;){if(o===n){a=!0,n=r,i=s;break}if(o===i){a=!0,i=r,n=s;break}o=o.sibling}if(!a){for(o=s.child;o;){if(o===n){a=!0,n=s,i=r;break}if(o===i){a=!0,i=s,n=r;break}o=o.sibling}if(!a)throw Error(ie(189))}}if(n.alternate!==i)throw Error(ie(190))}if(n.tag!==3)throw Error(ie(188));return n.stateNode.current===n?t:e}function i0(t){return t=xv(t),t!==null?r0(t):null}function r0(t){if(t.tag===5||t.tag===6)return t;for(t=t.child;t!==null;){var e=r0(t);if(e!==null)return e;t=t.sibling}return null}var s0=pn.unstable_scheduleCallback,_f=pn.unstable_cancelCallback,vv=pn.unstable_shouldYield,_v=pn.unstable_requestPaint,yt=pn.unstable_now,yv=pn.unstable_getCurrentPriorityLevel,eh=pn.unstable_ImmediatePriority,a0=pn.unstable_UserBlockingPriority,nl=pn.unstable_NormalPriority,Sv=pn.unstable_LowPriority,o0=pn.unstable_IdlePriority,Cl=null,$n=null;function wv(t){if($n&&typeof $n.onCommitFiberRoot=="function")try{$n.onCommitFiberRoot(Cl,t,void 0,(t.current.flags&128)===128)}catch{}}var On=Math.clz32?Math.clz32:bv,Mv=Math.log,Ev=Math.LN2;function bv(t){return t>>>=0,t===0?32:31-(Mv(t)/Ev|0)|0}var Za=64,Qa=4194304;function Qs(t){switch(t&-t){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return t&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return t}}function il(t,e){var n=t.pendingLanes;if(n===0)return 0;var i=0,r=t.suspendedLanes,s=t.pingedLanes,a=n&268435455;if(a!==0){var o=a&~r;o!==0?i=Qs(o):(s&=a,s!==0&&(i=Qs(s)))}else a=n&~r,a!==0?i=Qs(a):s!==0&&(i=Qs(s));if(i===0)return 0;if(e!==0&&e!==i&&!(e&r)&&(r=i&-i,s=e&-e,r>=s||r===16&&(s&4194240)!==0))return e;if(i&4&&(i|=n&16),e=t.entangledLanes,e!==0)for(t=t.entanglements,e&=i;0<e;)n=31-On(e),r=1<<n,i|=t[n],e&=~r;return i}function Tv(t,e){switch(t){case 1:case 2:case 4:return e+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function Av(t,e){for(var n=t.suspendedLanes,i=t.pingedLanes,r=t.expirationTimes,s=t.pendingLanes;0<s;){var a=31-On(s),o=1<<a,l=r[a];l===-1?(!(o&n)||o&i)&&(r[a]=Tv(o,e)):l<=e&&(t.expiredLanes|=o),s&=~o}}function yu(t){return t=t.pendingLanes&-1073741825,t!==0?t:t&1073741824?1073741824:0}function l0(){var t=Za;return Za<<=1,!(Za&4194240)&&(Za=64),t}function nc(t){for(var e=[],n=0;31>n;n++)e.push(t);return e}function Ia(t,e,n){t.pendingLanes|=e,e!==536870912&&(t.suspendedLanes=0,t.pingedLanes=0),t=t.eventTimes,e=31-On(e),t[e]=n}function Cv(t,e){var n=t.pendingLanes&~e;t.pendingLanes=e,t.suspendedLanes=0,t.pingedLanes=0,t.expiredLanes&=e,t.mutableReadLanes&=e,t.entangledLanes&=e,e=t.entanglements;var i=t.eventTimes;for(t=t.expirationTimes;0<n;){var r=31-On(n),s=1<<r;e[r]=0,i[r]=-1,t[r]=-1,n&=~s}}function th(t,e){var n=t.entangledLanes|=e;for(t=t.entanglements;n;){var i=31-On(n),r=1<<i;r&e|t[i]&e&&(t[i]|=e),n&=~r}}var it=0;function c0(t){return t&=-t,1<t?4<t?t&268435455?16:536870912:4:1}var u0,nh,d0,h0,f0,Su=!1,Ja=[],Ii=null,Ui=null,Fi=null,ga=new Map,xa=new Map,Ni=[],Rv="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function yf(t,e){switch(t){case"focusin":case"focusout":Ii=null;break;case"dragenter":case"dragleave":Ui=null;break;case"mouseover":case"mouseout":Fi=null;break;case"pointerover":case"pointerout":ga.delete(e.pointerId);break;case"gotpointercapture":case"lostpointercapture":xa.delete(e.pointerId)}}function Fs(t,e,n,i,r,s){return t===null||t.nativeEvent!==s?(t={blockedOn:e,domEventName:n,eventSystemFlags:i,nativeEvent:s,targetContainers:[r]},e!==null&&(e=Fa(e),e!==null&&nh(e)),t):(t.eventSystemFlags|=i,e=t.targetContainers,r!==null&&e.indexOf(r)===-1&&e.push(r),t)}function Nv(t,e,n,i,r){switch(e){case"focusin":return Ii=Fs(Ii,t,e,n,i,r),!0;case"dragenter":return Ui=Fs(Ui,t,e,n,i,r),!0;case"mouseover":return Fi=Fs(Fi,t,e,n,i,r),!0;case"pointerover":var s=r.pointerId;return ga.set(s,Fs(ga.get(s)||null,t,e,n,i,r)),!0;case"gotpointercapture":return s=r.pointerId,xa.set(s,Fs(xa.get(s)||null,t,e,n,i,r)),!0}return!1}function p0(t){var e=hr(t.target);if(e!==null){var n=Rr(e);if(n!==null){if(e=n.tag,e===13){if(e=n0(n),e!==null){t.blockedOn=e,f0(t.priority,function(){d0(n)});return}}else if(e===3&&n.stateNode.current.memoizedState.isDehydrated){t.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}t.blockedOn=null}function Uo(t){if(t.blockedOn!==null)return!1;for(var e=t.targetContainers;0<e.length;){var n=wu(t.domEventName,t.eventSystemFlags,e[0],t.nativeEvent);if(n===null){n=t.nativeEvent;var i=new n.constructor(n.type,n);gu=i,n.target.dispatchEvent(i),gu=null}else return e=Fa(n),e!==null&&nh(e),t.blockedOn=n,!1;e.shift()}return!0}function Sf(t,e,n){Uo(t)&&n.delete(e)}function Pv(){Su=!1,Ii!==null&&Uo(Ii)&&(Ii=null),Ui!==null&&Uo(Ui)&&(Ui=null),Fi!==null&&Uo(Fi)&&(Fi=null),ga.forEach(Sf),xa.forEach(Sf)}function Os(t,e){t.blockedOn===e&&(t.blockedOn=null,Su||(Su=!0,pn.unstable_scheduleCallback(pn.unstable_NormalPriority,Pv)))}function va(t){function e(r){return Os(r,t)}if(0<Ja.length){Os(Ja[0],t);for(var n=1;n<Ja.length;n++){var i=Ja[n];i.blockedOn===t&&(i.blockedOn=null)}}for(Ii!==null&&Os(Ii,t),Ui!==null&&Os(Ui,t),Fi!==null&&Os(Fi,t),ga.forEach(e),xa.forEach(e),n=0;n<Ni.length;n++)i=Ni[n],i.blockedOn===t&&(i.blockedOn=null);for(;0<Ni.length&&(n=Ni[0],n.blockedOn===null);)p0(n),n.blockedOn===null&&Ni.shift()}var ls=xi.ReactCurrentBatchConfig,rl=!0;function Lv(t,e,n,i){var r=it,s=ls.transition;ls.transition=null;try{it=1,ih(t,e,n,i)}finally{it=r,ls.transition=s}}function Dv(t,e,n,i){var r=it,s=ls.transition;ls.transition=null;try{it=4,ih(t,e,n,i)}finally{it=r,ls.transition=s}}function ih(t,e,n,i){if(rl){var r=wu(t,e,n,i);if(r===null)hc(t,e,i,sl,n),yf(t,i);else if(Nv(r,t,e,n,i))i.stopPropagation();else if(yf(t,i),e&4&&-1<Rv.indexOf(t)){for(;r!==null;){var s=Fa(r);if(s!==null&&u0(s),s=wu(t,e,n,i),s===null&&hc(t,e,i,sl,n),s===r)break;r=s}r!==null&&i.stopPropagation()}else hc(t,e,i,null,n)}}var sl=null;function wu(t,e,n,i){if(sl=null,t=Jd(i),t=hr(t),t!==null)if(e=Rr(t),e===null)t=null;else if(n=e.tag,n===13){if(t=n0(e),t!==null)return t;t=null}else if(n===3){if(e.stateNode.current.memoizedState.isDehydrated)return e.tag===3?e.stateNode.containerInfo:null;t=null}else e!==t&&(t=null);return sl=t,null}function m0(t){switch(t){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(yv()){case eh:return 1;case a0:return 4;case nl:case Sv:return 16;case o0:return 536870912;default:return 16}default:return 16}}var Di=null,rh=null,Fo=null;function g0(){if(Fo)return Fo;var t,e=rh,n=e.length,i,r="value"in Di?Di.value:Di.textContent,s=r.length;for(t=0;t<n&&e[t]===r[t];t++);var a=n-t;for(i=1;i<=a&&e[n-i]===r[s-i];i++);return Fo=r.slice(t,1<i?1-i:void 0)}function Oo(t){var e=t.keyCode;return"charCode"in t?(t=t.charCode,t===0&&e===13&&(t=13)):t=e,t===10&&(t=13),32<=t||t===13?t:0}function eo(){return!0}function wf(){return!1}function gn(t){function e(n,i,r,s,a){this._reactName=n,this._targetInst=r,this.type=i,this.nativeEvent=s,this.target=a,this.currentTarget=null;for(var o in t)t.hasOwnProperty(o)&&(n=t[o],this[o]=n?n(s):s[o]);return this.isDefaultPrevented=(s.defaultPrevented!=null?s.defaultPrevented:s.returnValue===!1)?eo:wf,this.isPropagationStopped=wf,this}return gt(e.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=eo)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=eo)},persist:function(){},isPersistent:eo}),e}var Ns={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(t){return t.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},sh=gn(Ns),Ua=gt({},Ns,{view:0,detail:0}),kv=gn(Ua),ic,rc,zs,Rl=gt({},Ua,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:ah,button:0,buttons:0,relatedTarget:function(t){return t.relatedTarget===void 0?t.fromElement===t.srcElement?t.toElement:t.fromElement:t.relatedTarget},movementX:function(t){return"movementX"in t?t.movementX:(t!==zs&&(zs&&t.type==="mousemove"?(ic=t.screenX-zs.screenX,rc=t.screenY-zs.screenY):rc=ic=0,zs=t),ic)},movementY:function(t){return"movementY"in t?t.movementY:rc}}),Mf=gn(Rl),Iv=gt({},Rl,{dataTransfer:0}),Uv=gn(Iv),Fv=gt({},Ua,{relatedTarget:0}),sc=gn(Fv),Ov=gt({},Ns,{animationName:0,elapsedTime:0,pseudoElement:0}),zv=gn(Ov),Bv=gt({},Ns,{clipboardData:function(t){return"clipboardData"in t?t.clipboardData:window.clipboardData}}),jv=gn(Bv),Hv=gt({},Ns,{data:0}),Ef=gn(Hv),Vv={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},Gv={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},Wv={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function Xv(t){var e=this.nativeEvent;return e.getModifierState?e.getModifierState(t):(t=Wv[t])?!!e[t]:!1}function ah(){return Xv}var qv=gt({},Ua,{key:function(t){if(t.key){var e=Vv[t.key]||t.key;if(e!=="Unidentified")return e}return t.type==="keypress"?(t=Oo(t),t===13?"Enter":String.fromCharCode(t)):t.type==="keydown"||t.type==="keyup"?Gv[t.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:ah,charCode:function(t){return t.type==="keypress"?Oo(t):0},keyCode:function(t){return t.type==="keydown"||t.type==="keyup"?t.keyCode:0},which:function(t){return t.type==="keypress"?Oo(t):t.type==="keydown"||t.type==="keyup"?t.keyCode:0}}),$v=gn(qv),Yv=gt({},Rl,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),bf=gn(Yv),Kv=gt({},Ua,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:ah}),Zv=gn(Kv),Qv=gt({},Ns,{propertyName:0,elapsedTime:0,pseudoElement:0}),Jv=gn(Qv),e_=gt({},Rl,{deltaX:function(t){return"deltaX"in t?t.deltaX:"wheelDeltaX"in t?-t.wheelDeltaX:0},deltaY:function(t){return"deltaY"in t?t.deltaY:"wheelDeltaY"in t?-t.wheelDeltaY:"wheelDelta"in t?-t.wheelDelta:0},deltaZ:0,deltaMode:0}),t_=gn(e_),n_=[9,13,27,32],oh=di&&"CompositionEvent"in window,ra=null;di&&"documentMode"in document&&(ra=document.documentMode);var i_=di&&"TextEvent"in window&&!ra,x0=di&&(!oh||ra&&8<ra&&11>=ra),Tf=" ",Af=!1;function v0(t,e){switch(t){case"keyup":return n_.indexOf(e.keyCode)!==-1;case"keydown":return e.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function _0(t){return t=t.detail,typeof t=="object"&&"data"in t?t.data:null}var $r=!1;function r_(t,e){switch(t){case"compositionend":return _0(e);case"keypress":return e.which!==32?null:(Af=!0,Tf);case"textInput":return t=e.data,t===Tf&&Af?null:t;default:return null}}function s_(t,e){if($r)return t==="compositionend"||!oh&&v0(t,e)?(t=g0(),Fo=rh=Di=null,$r=!1,t):null;switch(t){case"paste":return null;case"keypress":if(!(e.ctrlKey||e.altKey||e.metaKey)||e.ctrlKey&&e.altKey){if(e.char&&1<e.char.length)return e.char;if(e.which)return String.fromCharCode(e.which)}return null;case"compositionend":return x0&&e.locale!=="ko"?null:e.data;default:return null}}var a_={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Cf(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e==="input"?!!a_[t.type]:e==="textarea"}function y0(t,e,n,i){Zm(i),e=al(e,"onChange"),0<e.length&&(n=new sh("onChange","change",null,n,i),t.push({event:n,listeners:e}))}var sa=null,_a=null;function o_(t){P0(t,0)}function Nl(t){var e=Zr(t);if(Gm(e))return t}function l_(t,e){if(t==="change")return e}var S0=!1;if(di){var ac;if(di){var oc="oninput"in document;if(!oc){var Rf=document.createElement("div");Rf.setAttribute("oninput","return;"),oc=typeof Rf.oninput=="function"}ac=oc}else ac=!1;S0=ac&&(!document.documentMode||9<document.documentMode)}function Nf(){sa&&(sa.detachEvent("onpropertychange",w0),_a=sa=null)}function w0(t){if(t.propertyName==="value"&&Nl(_a)){var e=[];y0(e,_a,t,Jd(t)),t0(o_,e)}}function c_(t,e,n){t==="focusin"?(Nf(),sa=e,_a=n,sa.attachEvent("onpropertychange",w0)):t==="focusout"&&Nf()}function u_(t){if(t==="selectionchange"||t==="keyup"||t==="keydown")return Nl(_a)}function d_(t,e){if(t==="click")return Nl(e)}function h_(t,e){if(t==="input"||t==="change")return Nl(e)}function f_(t,e){return t===e&&(t!==0||1/t===1/e)||t!==t&&e!==e}var Bn=typeof Object.is=="function"?Object.is:f_;function ya(t,e){if(Bn(t,e))return!0;if(typeof t!="object"||t===null||typeof e!="object"||e===null)return!1;var n=Object.keys(t),i=Object.keys(e);if(n.length!==i.length)return!1;for(i=0;i<n.length;i++){var r=n[i];if(!ru.call(e,r)||!Bn(t[r],e[r]))return!1}return!0}function Pf(t){for(;t&&t.firstChild;)t=t.firstChild;return t}function Lf(t,e){var n=Pf(t);t=0;for(var i;n;){if(n.nodeType===3){if(i=t+n.textContent.length,t<=e&&i>=e)return{node:n,offset:e-t};t=i}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=Pf(n)}}function M0(t,e){return t&&e?t===e?!0:t&&t.nodeType===3?!1:e&&e.nodeType===3?M0(t,e.parentNode):"contains"in t?t.contains(e):t.compareDocumentPosition?!!(t.compareDocumentPosition(e)&16):!1:!1}function E0(){for(var t=window,e=Jo();e instanceof t.HTMLIFrameElement;){try{var n=typeof e.contentWindow.location.href=="string"}catch{n=!1}if(n)t=e.contentWindow;else break;e=Jo(t.document)}return e}function lh(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e&&(e==="input"&&(t.type==="text"||t.type==="search"||t.type==="tel"||t.type==="url"||t.type==="password")||e==="textarea"||t.contentEditable==="true")}function p_(t){var e=E0(),n=t.focusedElem,i=t.selectionRange;if(e!==n&&n&&n.ownerDocument&&M0(n.ownerDocument.documentElement,n)){if(i!==null&&lh(n)){if(e=i.start,t=i.end,t===void 0&&(t=e),"selectionStart"in n)n.selectionStart=e,n.selectionEnd=Math.min(t,n.value.length);else if(t=(e=n.ownerDocument||document)&&e.defaultView||window,t.getSelection){t=t.getSelection();var r=n.textContent.length,s=Math.min(i.start,r);i=i.end===void 0?s:Math.min(i.end,r),!t.extend&&s>i&&(r=i,i=s,s=r),r=Lf(n,s);var a=Lf(n,i);r&&a&&(t.rangeCount!==1||t.anchorNode!==r.node||t.anchorOffset!==r.offset||t.focusNode!==a.node||t.focusOffset!==a.offset)&&(e=e.createRange(),e.setStart(r.node,r.offset),t.removeAllRanges(),s>i?(t.addRange(e),t.extend(a.node,a.offset)):(e.setEnd(a.node,a.offset),t.addRange(e)))}}for(e=[],t=n;t=t.parentNode;)t.nodeType===1&&e.push({element:t,left:t.scrollLeft,top:t.scrollTop});for(typeof n.focus=="function"&&n.focus(),n=0;n<e.length;n++)t=e[n],t.element.scrollLeft=t.left,t.element.scrollTop=t.top}}var m_=di&&"documentMode"in document&&11>=document.documentMode,Yr=null,Mu=null,aa=null,Eu=!1;function Df(t,e,n){var i=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;Eu||Yr==null||Yr!==Jo(i)||(i=Yr,"selectionStart"in i&&lh(i)?i={start:i.selectionStart,end:i.selectionEnd}:(i=(i.ownerDocument&&i.ownerDocument.defaultView||window).getSelection(),i={anchorNode:i.anchorNode,anchorOffset:i.anchorOffset,focusNode:i.focusNode,focusOffset:i.focusOffset}),aa&&ya(aa,i)||(aa=i,i=al(Mu,"onSelect"),0<i.length&&(e=new sh("onSelect","select",null,e,n),t.push({event:e,listeners:i}),e.target=Yr)))}function to(t,e){var n={};return n[t.toLowerCase()]=e.toLowerCase(),n["Webkit"+t]="webkit"+e,n["Moz"+t]="moz"+e,n}var Kr={animationend:to("Animation","AnimationEnd"),animationiteration:to("Animation","AnimationIteration"),animationstart:to("Animation","AnimationStart"),transitionend:to("Transition","TransitionEnd")},lc={},b0={};di&&(b0=document.createElement("div").style,"AnimationEvent"in window||(delete Kr.animationend.animation,delete Kr.animationiteration.animation,delete Kr.animationstart.animation),"TransitionEvent"in window||delete Kr.transitionend.transition);function Pl(t){if(lc[t])return lc[t];if(!Kr[t])return t;var e=Kr[t],n;for(n in e)if(e.hasOwnProperty(n)&&n in b0)return lc[t]=e[n];return t}var T0=Pl("animationend"),A0=Pl("animationiteration"),C0=Pl("animationstart"),R0=Pl("transitionend"),N0=new Map,kf="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function Yi(t,e){N0.set(t,e),Cr(e,[t])}for(var cc=0;cc<kf.length;cc++){var uc=kf[cc],g_=uc.toLowerCase(),x_=uc[0].toUpperCase()+uc.slice(1);Yi(g_,"on"+x_)}Yi(T0,"onAnimationEnd");Yi(A0,"onAnimationIteration");Yi(C0,"onAnimationStart");Yi("dblclick","onDoubleClick");Yi("focusin","onFocus");Yi("focusout","onBlur");Yi(R0,"onTransitionEnd");ps("onMouseEnter",["mouseout","mouseover"]);ps("onMouseLeave",["mouseout","mouseover"]);ps("onPointerEnter",["pointerout","pointerover"]);ps("onPointerLeave",["pointerout","pointerover"]);Cr("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));Cr("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));Cr("onBeforeInput",["compositionend","keypress","textInput","paste"]);Cr("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));Cr("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));Cr("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Js="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),v_=new Set("cancel close invalid load scroll toggle".split(" ").concat(Js));function If(t,e,n){var i=t.type||"unknown-event";t.currentTarget=n,gv(i,e,void 0,t),t.currentTarget=null}function P0(t,e){e=(e&4)!==0;for(var n=0;n<t.length;n++){var i=t[n],r=i.event;i=i.listeners;e:{var s=void 0;if(e)for(var a=i.length-1;0<=a;a--){var o=i[a],l=o.instance,u=o.currentTarget;if(o=o.listener,l!==s&&r.isPropagationStopped())break e;If(r,o,u),s=l}else for(a=0;a<i.length;a++){if(o=i[a],l=o.instance,u=o.currentTarget,o=o.listener,l!==s&&r.isPropagationStopped())break e;If(r,o,u),s=l}}}if(tl)throw t=_u,tl=!1,_u=null,t}function ct(t,e){var n=e[Ru];n===void 0&&(n=e[Ru]=new Set);var i=t+"__bubble";n.has(i)||(L0(e,t,2,!1),n.add(i))}function dc(t,e,n){var i=0;e&&(i|=4),L0(n,t,i,e)}var no="_reactListening"+Math.random().toString(36).slice(2);function Sa(t){if(!t[no]){t[no]=!0,zm.forEach(function(n){n!=="selectionchange"&&(v_.has(n)||dc(n,!1,t),dc(n,!0,t))});var e=t.nodeType===9?t:t.ownerDocument;e===null||e[no]||(e[no]=!0,dc("selectionchange",!1,e))}}function L0(t,e,n,i){switch(m0(e)){case 1:var r=Lv;break;case 4:r=Dv;break;default:r=ih}n=r.bind(null,e,n,t),r=void 0,!vu||e!=="touchstart"&&e!=="touchmove"&&e!=="wheel"||(r=!0),i?r!==void 0?t.addEventListener(e,n,{capture:!0,passive:r}):t.addEventListener(e,n,!0):r!==void 0?t.addEventListener(e,n,{passive:r}):t.addEventListener(e,n,!1)}function hc(t,e,n,i,r){var s=i;if(!(e&1)&&!(e&2)&&i!==null)e:for(;;){if(i===null)return;var a=i.tag;if(a===3||a===4){var o=i.stateNode.containerInfo;if(o===r||o.nodeType===8&&o.parentNode===r)break;if(a===4)for(a=i.return;a!==null;){var l=a.tag;if((l===3||l===4)&&(l=a.stateNode.containerInfo,l===r||l.nodeType===8&&l.parentNode===r))return;a=a.return}for(;o!==null;){if(a=hr(o),a===null)return;if(l=a.tag,l===5||l===6){i=s=a;continue e}o=o.parentNode}}i=i.return}t0(function(){var u=s,h=Jd(n),p=[];e:{var f=N0.get(t);if(f!==void 0){var g=sh,v=t;switch(t){case"keypress":if(Oo(n)===0)break e;case"keydown":case"keyup":g=$v;break;case"focusin":v="focus",g=sc;break;case"focusout":v="blur",g=sc;break;case"beforeblur":case"afterblur":g=sc;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":g=Mf;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":g=Uv;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":g=Zv;break;case T0:case A0:case C0:g=zv;break;case R0:g=Jv;break;case"scroll":g=kv;break;case"wheel":g=t_;break;case"copy":case"cut":case"paste":g=jv;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":g=bf}var S=(e&4)!==0,m=!S&&t==="scroll",d=S?f!==null?f+"Capture":null:f;S=[];for(var _=u,x;_!==null;){x=_;var M=x.stateNode;if(x.tag===5&&M!==null&&(x=M,d!==null&&(M=ma(_,d),M!=null&&S.push(wa(_,M,x)))),m)break;_=_.return}0<S.length&&(f=new g(f,v,null,n,h),p.push({event:f,listeners:S}))}}if(!(e&7)){e:{if(f=t==="mouseover"||t==="pointerover",g=t==="mouseout"||t==="pointerout",f&&n!==gu&&(v=n.relatedTarget||n.fromElement)&&(hr(v)||v[hi]))break e;if((g||f)&&(f=h.window===h?h:(f=h.ownerDocument)?f.defaultView||f.parentWindow:window,g?(v=n.relatedTarget||n.toElement,g=u,v=v?hr(v):null,v!==null&&(m=Rr(v),v!==m||v.tag!==5&&v.tag!==6)&&(v=null)):(g=null,v=u),g!==v)){if(S=Mf,M="onMouseLeave",d="onMouseEnter",_="mouse",(t==="pointerout"||t==="pointerover")&&(S=bf,M="onPointerLeave",d="onPointerEnter",_="pointer"),m=g==null?f:Zr(g),x=v==null?f:Zr(v),f=new S(M,_+"leave",g,n,h),f.target=m,f.relatedTarget=x,M=null,hr(h)===u&&(S=new S(d,_+"enter",v,n,h),S.target=x,S.relatedTarget=m,M=S),m=M,g&&v)t:{for(S=g,d=v,_=0,x=S;x;x=Pr(x))_++;for(x=0,M=d;M;M=Pr(M))x++;for(;0<_-x;)S=Pr(S),_--;for(;0<x-_;)d=Pr(d),x--;for(;_--;){if(S===d||d!==null&&S===d.alternate)break t;S=Pr(S),d=Pr(d)}S=null}else S=null;g!==null&&Uf(p,f,g,S,!1),v!==null&&m!==null&&Uf(p,m,v,S,!0)}}e:{if(f=u?Zr(u):window,g=f.nodeName&&f.nodeName.toLowerCase(),g==="select"||g==="input"&&f.type==="file")var P=l_;else if(Cf(f))if(S0)P=h_;else{P=u_;var T=c_}else(g=f.nodeName)&&g.toLowerCase()==="input"&&(f.type==="checkbox"||f.type==="radio")&&(P=d_);if(P&&(P=P(t,u))){y0(p,P,n,h);break e}T&&T(t,f,u),t==="focusout"&&(T=f._wrapperState)&&T.controlled&&f.type==="number"&&du(f,"number",f.value)}switch(T=u?Zr(u):window,t){case"focusin":(Cf(T)||T.contentEditable==="true")&&(Yr=T,Mu=u,aa=null);break;case"focusout":aa=Mu=Yr=null;break;case"mousedown":Eu=!0;break;case"contextmenu":case"mouseup":case"dragend":Eu=!1,Df(p,n,h);break;case"selectionchange":if(m_)break;case"keydown":case"keyup":Df(p,n,h)}var A;if(oh)e:{switch(t){case"compositionstart":var N="onCompositionStart";break e;case"compositionend":N="onCompositionEnd";break e;case"compositionupdate":N="onCompositionUpdate";break e}N=void 0}else $r?v0(t,n)&&(N="onCompositionEnd"):t==="keydown"&&n.keyCode===229&&(N="onCompositionStart");N&&(x0&&n.locale!=="ko"&&($r||N!=="onCompositionStart"?N==="onCompositionEnd"&&$r&&(A=g0()):(Di=h,rh="value"in Di?Di.value:Di.textContent,$r=!0)),T=al(u,N),0<T.length&&(N=new Ef(N,t,null,n,h),p.push({event:N,listeners:T}),A?N.data=A:(A=_0(n),A!==null&&(N.data=A)))),(A=i_?r_(t,n):s_(t,n))&&(u=al(u,"onBeforeInput"),0<u.length&&(h=new Ef("onBeforeInput","beforeinput",null,n,h),p.push({event:h,listeners:u}),h.data=A))}P0(p,e)})}function wa(t,e,n){return{instance:t,listener:e,currentTarget:n}}function al(t,e){for(var n=e+"Capture",i=[];t!==null;){var r=t,s=r.stateNode;r.tag===5&&s!==null&&(r=s,s=ma(t,n),s!=null&&i.unshift(wa(t,s,r)),s=ma(t,e),s!=null&&i.push(wa(t,s,r))),t=t.return}return i}function Pr(t){if(t===null)return null;do t=t.return;while(t&&t.tag!==5);return t||null}function Uf(t,e,n,i,r){for(var s=e._reactName,a=[];n!==null&&n!==i;){var o=n,l=o.alternate,u=o.stateNode;if(l!==null&&l===i)break;o.tag===5&&u!==null&&(o=u,r?(l=ma(n,s),l!=null&&a.unshift(wa(n,l,o))):r||(l=ma(n,s),l!=null&&a.push(wa(n,l,o)))),n=n.return}a.length!==0&&t.push({event:e,listeners:a})}var __=/\r\n?/g,y_=/\u0000|\uFFFD/g;function Ff(t){return(typeof t=="string"?t:""+t).replace(__,`
`).replace(y_,"")}function io(t,e,n){if(e=Ff(e),Ff(t)!==e&&n)throw Error(ie(425))}function ol(){}var bu=null,Tu=null;function Au(t,e){return t==="textarea"||t==="noscript"||typeof e.children=="string"||typeof e.children=="number"||typeof e.dangerouslySetInnerHTML=="object"&&e.dangerouslySetInnerHTML!==null&&e.dangerouslySetInnerHTML.__html!=null}var Cu=typeof setTimeout=="function"?setTimeout:void 0,S_=typeof clearTimeout=="function"?clearTimeout:void 0,Of=typeof Promise=="function"?Promise:void 0,w_=typeof queueMicrotask=="function"?queueMicrotask:typeof Of<"u"?function(t){return Of.resolve(null).then(t).catch(M_)}:Cu;function M_(t){setTimeout(function(){throw t})}function fc(t,e){var n=e,i=0;do{var r=n.nextSibling;if(t.removeChild(n),r&&r.nodeType===8)if(n=r.data,n==="/$"){if(i===0){t.removeChild(r),va(e);return}i--}else n!=="$"&&n!=="$?"&&n!=="$!"||i++;n=r}while(n);va(e)}function Oi(t){for(;t!=null;t=t.nextSibling){var e=t.nodeType;if(e===1||e===3)break;if(e===8){if(e=t.data,e==="$"||e==="$!"||e==="$?")break;if(e==="/$")return null}}return t}function zf(t){t=t.previousSibling;for(var e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="$"||n==="$!"||n==="$?"){if(e===0)return t;e--}else n==="/$"&&e++}t=t.previousSibling}return null}var Ps=Math.random().toString(36).slice(2),Wn="__reactFiber$"+Ps,Ma="__reactProps$"+Ps,hi="__reactContainer$"+Ps,Ru="__reactEvents$"+Ps,E_="__reactListeners$"+Ps,b_="__reactHandles$"+Ps;function hr(t){var e=t[Wn];if(e)return e;for(var n=t.parentNode;n;){if(e=n[hi]||n[Wn]){if(n=e.alternate,e.child!==null||n!==null&&n.child!==null)for(t=zf(t);t!==null;){if(n=t[Wn])return n;t=zf(t)}return e}t=n,n=t.parentNode}return null}function Fa(t){return t=t[Wn]||t[hi],!t||t.tag!==5&&t.tag!==6&&t.tag!==13&&t.tag!==3?null:t}function Zr(t){if(t.tag===5||t.tag===6)return t.stateNode;throw Error(ie(33))}function Ll(t){return t[Ma]||null}var Nu=[],Qr=-1;function Ki(t){return{current:t}}function dt(t){0>Qr||(t.current=Nu[Qr],Nu[Qr]=null,Qr--)}function ot(t,e){Qr++,Nu[Qr]=t.current,t.current=e}var Xi={},jt=Ki(Xi),tn=Ki(!1),Sr=Xi;function ms(t,e){var n=t.type.contextTypes;if(!n)return Xi;var i=t.stateNode;if(i&&i.__reactInternalMemoizedUnmaskedChildContext===e)return i.__reactInternalMemoizedMaskedChildContext;var r={},s;for(s in n)r[s]=e[s];return i&&(t=t.stateNode,t.__reactInternalMemoizedUnmaskedChildContext=e,t.__reactInternalMemoizedMaskedChildContext=r),r}function nn(t){return t=t.childContextTypes,t!=null}function ll(){dt(tn),dt(jt)}function Bf(t,e,n){if(jt.current!==Xi)throw Error(ie(168));ot(jt,e),ot(tn,n)}function D0(t,e,n){var i=t.stateNode;if(e=e.childContextTypes,typeof i.getChildContext!="function")return n;i=i.getChildContext();for(var r in i)if(!(r in e))throw Error(ie(108,cv(t)||"Unknown",r));return gt({},n,i)}function cl(t){return t=(t=t.stateNode)&&t.__reactInternalMemoizedMergedChildContext||Xi,Sr=jt.current,ot(jt,t),ot(tn,tn.current),!0}function jf(t,e,n){var i=t.stateNode;if(!i)throw Error(ie(169));n?(t=D0(t,e,Sr),i.__reactInternalMemoizedMergedChildContext=t,dt(tn),dt(jt),ot(jt,t)):dt(tn),ot(tn,n)}var si=null,Dl=!1,pc=!1;function k0(t){si===null?si=[t]:si.push(t)}function T_(t){Dl=!0,k0(t)}function Zi(){if(!pc&&si!==null){pc=!0;var t=0,e=it;try{var n=si;for(it=1;t<n.length;t++){var i=n[t];do i=i(!0);while(i!==null)}si=null,Dl=!1}catch(r){throw si!==null&&(si=si.slice(t+1)),s0(eh,Zi),r}finally{it=e,pc=!1}}return null}var Jr=[],es=0,ul=null,dl=0,_n=[],yn=0,wr=null,ai=1,oi="";function ar(t,e){Jr[es++]=dl,Jr[es++]=ul,ul=t,dl=e}function I0(t,e,n){_n[yn++]=ai,_n[yn++]=oi,_n[yn++]=wr,wr=t;var i=ai;t=oi;var r=32-On(i)-1;i&=~(1<<r),n+=1;var s=32-On(e)+r;if(30<s){var a=r-r%5;s=(i&(1<<a)-1).toString(32),i>>=a,r-=a,ai=1<<32-On(e)+r|n<<r|i,oi=s+t}else ai=1<<s|n<<r|i,oi=t}function ch(t){t.return!==null&&(ar(t,1),I0(t,1,0))}function uh(t){for(;t===ul;)ul=Jr[--es],Jr[es]=null,dl=Jr[--es],Jr[es]=null;for(;t===wr;)wr=_n[--yn],_n[yn]=null,oi=_n[--yn],_n[yn]=null,ai=_n[--yn],_n[yn]=null}var fn=null,hn=null,ft=!1,In=null;function U0(t,e){var n=wn(5,null,null,0);n.elementType="DELETED",n.stateNode=e,n.return=t,e=t.deletions,e===null?(t.deletions=[n],t.flags|=16):e.push(n)}function Hf(t,e){switch(t.tag){case 5:var n=t.type;return e=e.nodeType!==1||n.toLowerCase()!==e.nodeName.toLowerCase()?null:e,e!==null?(t.stateNode=e,fn=t,hn=Oi(e.firstChild),!0):!1;case 6:return e=t.pendingProps===""||e.nodeType!==3?null:e,e!==null?(t.stateNode=e,fn=t,hn=null,!0):!1;case 13:return e=e.nodeType!==8?null:e,e!==null?(n=wr!==null?{id:ai,overflow:oi}:null,t.memoizedState={dehydrated:e,treeContext:n,retryLane:1073741824},n=wn(18,null,null,0),n.stateNode=e,n.return=t,t.child=n,fn=t,hn=null,!0):!1;default:return!1}}function Pu(t){return(t.mode&1)!==0&&(t.flags&128)===0}function Lu(t){if(ft){var e=hn;if(e){var n=e;if(!Hf(t,e)){if(Pu(t))throw Error(ie(418));e=Oi(n.nextSibling);var i=fn;e&&Hf(t,e)?U0(i,n):(t.flags=t.flags&-4097|2,ft=!1,fn=t)}}else{if(Pu(t))throw Error(ie(418));t.flags=t.flags&-4097|2,ft=!1,fn=t}}}function Vf(t){for(t=t.return;t!==null&&t.tag!==5&&t.tag!==3&&t.tag!==13;)t=t.return;fn=t}function ro(t){if(t!==fn)return!1;if(!ft)return Vf(t),ft=!0,!1;var e;if((e=t.tag!==3)&&!(e=t.tag!==5)&&(e=t.type,e=e!=="head"&&e!=="body"&&!Au(t.type,t.memoizedProps)),e&&(e=hn)){if(Pu(t))throw F0(),Error(ie(418));for(;e;)U0(t,e),e=Oi(e.nextSibling)}if(Vf(t),t.tag===13){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(ie(317));e:{for(t=t.nextSibling,e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="/$"){if(e===0){hn=Oi(t.nextSibling);break e}e--}else n!=="$"&&n!=="$!"&&n!=="$?"||e++}t=t.nextSibling}hn=null}}else hn=fn?Oi(t.stateNode.nextSibling):null;return!0}function F0(){for(var t=hn;t;)t=Oi(t.nextSibling)}function gs(){hn=fn=null,ft=!1}function dh(t){In===null?In=[t]:In.push(t)}var A_=xi.ReactCurrentBatchConfig;function Bs(t,e,n){if(t=n.ref,t!==null&&typeof t!="function"&&typeof t!="object"){if(n._owner){if(n=n._owner,n){if(n.tag!==1)throw Error(ie(309));var i=n.stateNode}if(!i)throw Error(ie(147,t));var r=i,s=""+t;return e!==null&&e.ref!==null&&typeof e.ref=="function"&&e.ref._stringRef===s?e.ref:(e=function(a){var o=r.refs;a===null?delete o[s]:o[s]=a},e._stringRef=s,e)}if(typeof t!="string")throw Error(ie(284));if(!n._owner)throw Error(ie(290,t))}return t}function so(t,e){throw t=Object.prototype.toString.call(e),Error(ie(31,t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t))}function Gf(t){var e=t._init;return e(t._payload)}function O0(t){function e(d,_){if(t){var x=d.deletions;x===null?(d.deletions=[_],d.flags|=16):x.push(_)}}function n(d,_){if(!t)return null;for(;_!==null;)e(d,_),_=_.sibling;return null}function i(d,_){for(d=new Map;_!==null;)_.key!==null?d.set(_.key,_):d.set(_.index,_),_=_.sibling;return d}function r(d,_){return d=Hi(d,_),d.index=0,d.sibling=null,d}function s(d,_,x){return d.index=x,t?(x=d.alternate,x!==null?(x=x.index,x<_?(d.flags|=2,_):x):(d.flags|=2,_)):(d.flags|=1048576,_)}function a(d){return t&&d.alternate===null&&(d.flags|=2),d}function o(d,_,x,M){return _===null||_.tag!==6?(_=Sc(x,d.mode,M),_.return=d,_):(_=r(_,x),_.return=d,_)}function l(d,_,x,M){var P=x.type;return P===qr?h(d,_,x.props.children,M,x.key):_!==null&&(_.elementType===P||typeof P=="object"&&P!==null&&P.$$typeof===Ci&&Gf(P)===_.type)?(M=r(_,x.props),M.ref=Bs(d,_,x),M.return=d,M):(M=Wo(x.type,x.key,x.props,null,d.mode,M),M.ref=Bs(d,_,x),M.return=d,M)}function u(d,_,x,M){return _===null||_.tag!==4||_.stateNode.containerInfo!==x.containerInfo||_.stateNode.implementation!==x.implementation?(_=wc(x,d.mode,M),_.return=d,_):(_=r(_,x.children||[]),_.return=d,_)}function h(d,_,x,M,P){return _===null||_.tag!==7?(_=_r(x,d.mode,M,P),_.return=d,_):(_=r(_,x),_.return=d,_)}function p(d,_,x){if(typeof _=="string"&&_!==""||typeof _=="number")return _=Sc(""+_,d.mode,x),_.return=d,_;if(typeof _=="object"&&_!==null){switch(_.$$typeof){case $a:return x=Wo(_.type,_.key,_.props,null,d.mode,x),x.ref=Bs(d,null,_),x.return=d,x;case Xr:return _=wc(_,d.mode,x),_.return=d,_;case Ci:var M=_._init;return p(d,M(_._payload),x)}if(Zs(_)||Is(_))return _=_r(_,d.mode,x,null),_.return=d,_;so(d,_)}return null}function f(d,_,x,M){var P=_!==null?_.key:null;if(typeof x=="string"&&x!==""||typeof x=="number")return P!==null?null:o(d,_,""+x,M);if(typeof x=="object"&&x!==null){switch(x.$$typeof){case $a:return x.key===P?l(d,_,x,M):null;case Xr:return x.key===P?u(d,_,x,M):null;case Ci:return P=x._init,f(d,_,P(x._payload),M)}if(Zs(x)||Is(x))return P!==null?null:h(d,_,x,M,null);so(d,x)}return null}function g(d,_,x,M,P){if(typeof M=="string"&&M!==""||typeof M=="number")return d=d.get(x)||null,o(_,d,""+M,P);if(typeof M=="object"&&M!==null){switch(M.$$typeof){case $a:return d=d.get(M.key===null?x:M.key)||null,l(_,d,M,P);case Xr:return d=d.get(M.key===null?x:M.key)||null,u(_,d,M,P);case Ci:var T=M._init;return g(d,_,x,T(M._payload),P)}if(Zs(M)||Is(M))return d=d.get(x)||null,h(_,d,M,P,null);so(_,M)}return null}function v(d,_,x,M){for(var P=null,T=null,A=_,N=_=0,H=null;A!==null&&N<x.length;N++){A.index>N?(H=A,A=null):H=A.sibling;var y=f(d,A,x[N],M);if(y===null){A===null&&(A=H);break}t&&A&&y.alternate===null&&e(d,A),_=s(y,_,N),T===null?P=y:T.sibling=y,T=y,A=H}if(N===x.length)return n(d,A),ft&&ar(d,N),P;if(A===null){for(;N<x.length;N++)A=p(d,x[N],M),A!==null&&(_=s(A,_,N),T===null?P=A:T.sibling=A,T=A);return ft&&ar(d,N),P}for(A=i(d,A);N<x.length;N++)H=g(A,d,N,x[N],M),H!==null&&(t&&H.alternate!==null&&A.delete(H.key===null?N:H.key),_=s(H,_,N),T===null?P=H:T.sibling=H,T=H);return t&&A.forEach(function(b){return e(d,b)}),ft&&ar(d,N),P}function S(d,_,x,M){var P=Is(x);if(typeof P!="function")throw Error(ie(150));if(x=P.call(x),x==null)throw Error(ie(151));for(var T=P=null,A=_,N=_=0,H=null,y=x.next();A!==null&&!y.done;N++,y=x.next()){A.index>N?(H=A,A=null):H=A.sibling;var b=f(d,A,y.value,M);if(b===null){A===null&&(A=H);break}t&&A&&b.alternate===null&&e(d,A),_=s(b,_,N),T===null?P=b:T.sibling=b,T=b,A=H}if(y.done)return n(d,A),ft&&ar(d,N),P;if(A===null){for(;!y.done;N++,y=x.next())y=p(d,y.value,M),y!==null&&(_=s(y,_,N),T===null?P=y:T.sibling=y,T=y);return ft&&ar(d,N),P}for(A=i(d,A);!y.done;N++,y=x.next())y=g(A,d,N,y.value,M),y!==null&&(t&&y.alternate!==null&&A.delete(y.key===null?N:y.key),_=s(y,_,N),T===null?P=y:T.sibling=y,T=y);return t&&A.forEach(function(V){return e(d,V)}),ft&&ar(d,N),P}function m(d,_,x,M){if(typeof x=="object"&&x!==null&&x.type===qr&&x.key===null&&(x=x.props.children),typeof x=="object"&&x!==null){switch(x.$$typeof){case $a:e:{for(var P=x.key,T=_;T!==null;){if(T.key===P){if(P=x.type,P===qr){if(T.tag===7){n(d,T.sibling),_=r(T,x.props.children),_.return=d,d=_;break e}}else if(T.elementType===P||typeof P=="object"&&P!==null&&P.$$typeof===Ci&&Gf(P)===T.type){n(d,T.sibling),_=r(T,x.props),_.ref=Bs(d,T,x),_.return=d,d=_;break e}n(d,T);break}else e(d,T);T=T.sibling}x.type===qr?(_=_r(x.props.children,d.mode,M,x.key),_.return=d,d=_):(M=Wo(x.type,x.key,x.props,null,d.mode,M),M.ref=Bs(d,_,x),M.return=d,d=M)}return a(d);case Xr:e:{for(T=x.key;_!==null;){if(_.key===T)if(_.tag===4&&_.stateNode.containerInfo===x.containerInfo&&_.stateNode.implementation===x.implementation){n(d,_.sibling),_=r(_,x.children||[]),_.return=d,d=_;break e}else{n(d,_);break}else e(d,_);_=_.sibling}_=wc(x,d.mode,M),_.return=d,d=_}return a(d);case Ci:return T=x._init,m(d,_,T(x._payload),M)}if(Zs(x))return v(d,_,x,M);if(Is(x))return S(d,_,x,M);so(d,x)}return typeof x=="string"&&x!==""||typeof x=="number"?(x=""+x,_!==null&&_.tag===6?(n(d,_.sibling),_=r(_,x),_.return=d,d=_):(n(d,_),_=Sc(x,d.mode,M),_.return=d,d=_),a(d)):n(d,_)}return m}var xs=O0(!0),z0=O0(!1),hl=Ki(null),fl=null,ts=null,hh=null;function fh(){hh=ts=fl=null}function ph(t){var e=hl.current;dt(hl),t._currentValue=e}function Du(t,e,n){for(;t!==null;){var i=t.alternate;if((t.childLanes&e)!==e?(t.childLanes|=e,i!==null&&(i.childLanes|=e)):i!==null&&(i.childLanes&e)!==e&&(i.childLanes|=e),t===n)break;t=t.return}}function cs(t,e){fl=t,hh=ts=null,t=t.dependencies,t!==null&&t.firstContext!==null&&(t.lanes&e&&(en=!0),t.firstContext=null)}function Tn(t){var e=t._currentValue;if(hh!==t)if(t={context:t,memoizedValue:e,next:null},ts===null){if(fl===null)throw Error(ie(308));ts=t,fl.dependencies={lanes:0,firstContext:t}}else ts=ts.next=t;return e}var fr=null;function mh(t){fr===null?fr=[t]:fr.push(t)}function B0(t,e,n,i){var r=e.interleaved;return r===null?(n.next=n,mh(e)):(n.next=r.next,r.next=n),e.interleaved=n,fi(t,i)}function fi(t,e){t.lanes|=e;var n=t.alternate;for(n!==null&&(n.lanes|=e),n=t,t=t.return;t!==null;)t.childLanes|=e,n=t.alternate,n!==null&&(n.childLanes|=e),n=t,t=t.return;return n.tag===3?n.stateNode:null}var Ri=!1;function gh(t){t.updateQueue={baseState:t.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function j0(t,e){t=t.updateQueue,e.updateQueue===t&&(e.updateQueue={baseState:t.baseState,firstBaseUpdate:t.firstBaseUpdate,lastBaseUpdate:t.lastBaseUpdate,shared:t.shared,effects:t.effects})}function ui(t,e){return{eventTime:t,lane:e,tag:0,payload:null,callback:null,next:null}}function zi(t,e,n){var i=t.updateQueue;if(i===null)return null;if(i=i.shared,qe&2){var r=i.pending;return r===null?e.next=e:(e.next=r.next,r.next=e),i.pending=e,fi(t,n)}return r=i.interleaved,r===null?(e.next=e,mh(i)):(e.next=r.next,r.next=e),i.interleaved=e,fi(t,n)}function zo(t,e,n){if(e=e.updateQueue,e!==null&&(e=e.shared,(n&4194240)!==0)){var i=e.lanes;i&=t.pendingLanes,n|=i,e.lanes=n,th(t,n)}}function Wf(t,e){var n=t.updateQueue,i=t.alternate;if(i!==null&&(i=i.updateQueue,n===i)){var r=null,s=null;if(n=n.firstBaseUpdate,n!==null){do{var a={eventTime:n.eventTime,lane:n.lane,tag:n.tag,payload:n.payload,callback:n.callback,next:null};s===null?r=s=a:s=s.next=a,n=n.next}while(n!==null);s===null?r=s=e:s=s.next=e}else r=s=e;n={baseState:i.baseState,firstBaseUpdate:r,lastBaseUpdate:s,shared:i.shared,effects:i.effects},t.updateQueue=n;return}t=n.lastBaseUpdate,t===null?n.firstBaseUpdate=e:t.next=e,n.lastBaseUpdate=e}function pl(t,e,n,i){var r=t.updateQueue;Ri=!1;var s=r.firstBaseUpdate,a=r.lastBaseUpdate,o=r.shared.pending;if(o!==null){r.shared.pending=null;var l=o,u=l.next;l.next=null,a===null?s=u:a.next=u,a=l;var h=t.alternate;h!==null&&(h=h.updateQueue,o=h.lastBaseUpdate,o!==a&&(o===null?h.firstBaseUpdate=u:o.next=u,h.lastBaseUpdate=l))}if(s!==null){var p=r.baseState;a=0,h=u=l=null,o=s;do{var f=o.lane,g=o.eventTime;if((i&f)===f){h!==null&&(h=h.next={eventTime:g,lane:0,tag:o.tag,payload:o.payload,callback:o.callback,next:null});e:{var v=t,S=o;switch(f=e,g=n,S.tag){case 1:if(v=S.payload,typeof v=="function"){p=v.call(g,p,f);break e}p=v;break e;case 3:v.flags=v.flags&-65537|128;case 0:if(v=S.payload,f=typeof v=="function"?v.call(g,p,f):v,f==null)break e;p=gt({},p,f);break e;case 2:Ri=!0}}o.callback!==null&&o.lane!==0&&(t.flags|=64,f=r.effects,f===null?r.effects=[o]:f.push(o))}else g={eventTime:g,lane:f,tag:o.tag,payload:o.payload,callback:o.callback,next:null},h===null?(u=h=g,l=p):h=h.next=g,a|=f;if(o=o.next,o===null){if(o=r.shared.pending,o===null)break;f=o,o=f.next,f.next=null,r.lastBaseUpdate=f,r.shared.pending=null}}while(!0);if(h===null&&(l=p),r.baseState=l,r.firstBaseUpdate=u,r.lastBaseUpdate=h,e=r.shared.interleaved,e!==null){r=e;do a|=r.lane,r=r.next;while(r!==e)}else s===null&&(r.shared.lanes=0);Er|=a,t.lanes=a,t.memoizedState=p}}function Xf(t,e,n){if(t=e.effects,e.effects=null,t!==null)for(e=0;e<t.length;e++){var i=t[e],r=i.callback;if(r!==null){if(i.callback=null,i=n,typeof r!="function")throw Error(ie(191,r));r.call(i)}}}var Oa={},Yn=Ki(Oa),Ea=Ki(Oa),ba=Ki(Oa);function pr(t){if(t===Oa)throw Error(ie(174));return t}function xh(t,e){switch(ot(ba,e),ot(Ea,t),ot(Yn,Oa),t=e.nodeType,t){case 9:case 11:e=(e=e.documentElement)?e.namespaceURI:fu(null,"");break;default:t=t===8?e.parentNode:e,e=t.namespaceURI||null,t=t.tagName,e=fu(e,t)}dt(Yn),ot(Yn,e)}function vs(){dt(Yn),dt(Ea),dt(ba)}function H0(t){pr(ba.current);var e=pr(Yn.current),n=fu(e,t.type);e!==n&&(ot(Ea,t),ot(Yn,n))}function vh(t){Ea.current===t&&(dt(Yn),dt(Ea))}var pt=Ki(0);function ml(t){for(var e=t;e!==null;){if(e.tag===13){var n=e.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||n.data==="$?"||n.data==="$!"))return e}else if(e.tag===19&&e.memoizedProps.revealOrder!==void 0){if(e.flags&128)return e}else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return null;e=e.return}e.sibling.return=e.return,e=e.sibling}return null}var mc=[];function _h(){for(var t=0;t<mc.length;t++)mc[t]._workInProgressVersionPrimary=null;mc.length=0}var Bo=xi.ReactCurrentDispatcher,gc=xi.ReactCurrentBatchConfig,Mr=0,mt=null,Et=null,Rt=null,gl=!1,oa=!1,Ta=0,C_=0;function Ut(){throw Error(ie(321))}function yh(t,e){if(e===null)return!1;for(var n=0;n<e.length&&n<t.length;n++)if(!Bn(t[n],e[n]))return!1;return!0}function Sh(t,e,n,i,r,s){if(Mr=s,mt=e,e.memoizedState=null,e.updateQueue=null,e.lanes=0,Bo.current=t===null||t.memoizedState===null?L_:D_,t=n(i,r),oa){s=0;do{if(oa=!1,Ta=0,25<=s)throw Error(ie(301));s+=1,Rt=Et=null,e.updateQueue=null,Bo.current=k_,t=n(i,r)}while(oa)}if(Bo.current=xl,e=Et!==null&&Et.next!==null,Mr=0,Rt=Et=mt=null,gl=!1,e)throw Error(ie(300));return t}function wh(){var t=Ta!==0;return Ta=0,t}function Hn(){var t={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Rt===null?mt.memoizedState=Rt=t:Rt=Rt.next=t,Rt}function An(){if(Et===null){var t=mt.alternate;t=t!==null?t.memoizedState:null}else t=Et.next;var e=Rt===null?mt.memoizedState:Rt.next;if(e!==null)Rt=e,Et=t;else{if(t===null)throw Error(ie(310));Et=t,t={memoizedState:Et.memoizedState,baseState:Et.baseState,baseQueue:Et.baseQueue,queue:Et.queue,next:null},Rt===null?mt.memoizedState=Rt=t:Rt=Rt.next=t}return Rt}function Aa(t,e){return typeof e=="function"?e(t):e}function xc(t){var e=An(),n=e.queue;if(n===null)throw Error(ie(311));n.lastRenderedReducer=t;var i=Et,r=i.baseQueue,s=n.pending;if(s!==null){if(r!==null){var a=r.next;r.next=s.next,s.next=a}i.baseQueue=r=s,n.pending=null}if(r!==null){s=r.next,i=i.baseState;var o=a=null,l=null,u=s;do{var h=u.lane;if((Mr&h)===h)l!==null&&(l=l.next={lane:0,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null}),i=u.hasEagerState?u.eagerState:t(i,u.action);else{var p={lane:h,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null};l===null?(o=l=p,a=i):l=l.next=p,mt.lanes|=h,Er|=h}u=u.next}while(u!==null&&u!==s);l===null?a=i:l.next=o,Bn(i,e.memoizedState)||(en=!0),e.memoizedState=i,e.baseState=a,e.baseQueue=l,n.lastRenderedState=i}if(t=n.interleaved,t!==null){r=t;do s=r.lane,mt.lanes|=s,Er|=s,r=r.next;while(r!==t)}else r===null&&(n.lanes=0);return[e.memoizedState,n.dispatch]}function vc(t){var e=An(),n=e.queue;if(n===null)throw Error(ie(311));n.lastRenderedReducer=t;var i=n.dispatch,r=n.pending,s=e.memoizedState;if(r!==null){n.pending=null;var a=r=r.next;do s=t(s,a.action),a=a.next;while(a!==r);Bn(s,e.memoizedState)||(en=!0),e.memoizedState=s,e.baseQueue===null&&(e.baseState=s),n.lastRenderedState=s}return[s,i]}function V0(){}function G0(t,e){var n=mt,i=An(),r=e(),s=!Bn(i.memoizedState,r);if(s&&(i.memoizedState=r,en=!0),i=i.queue,Mh(q0.bind(null,n,i,t),[t]),i.getSnapshot!==e||s||Rt!==null&&Rt.memoizedState.tag&1){if(n.flags|=2048,Ca(9,X0.bind(null,n,i,r,e),void 0,null),Nt===null)throw Error(ie(349));Mr&30||W0(n,e,r)}return r}function W0(t,e,n){t.flags|=16384,t={getSnapshot:e,value:n},e=mt.updateQueue,e===null?(e={lastEffect:null,stores:null},mt.updateQueue=e,e.stores=[t]):(n=e.stores,n===null?e.stores=[t]:n.push(t))}function X0(t,e,n,i){e.value=n,e.getSnapshot=i,$0(e)&&Y0(t)}function q0(t,e,n){return n(function(){$0(e)&&Y0(t)})}function $0(t){var e=t.getSnapshot;t=t.value;try{var n=e();return!Bn(t,n)}catch{return!0}}function Y0(t){var e=fi(t,1);e!==null&&zn(e,t,1,-1)}function qf(t){var e=Hn();return typeof t=="function"&&(t=t()),e.memoizedState=e.baseState=t,t={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:Aa,lastRenderedState:t},e.queue=t,t=t.dispatch=P_.bind(null,mt,t),[e.memoizedState,t]}function Ca(t,e,n,i){return t={tag:t,create:e,destroy:n,deps:i,next:null},e=mt.updateQueue,e===null?(e={lastEffect:null,stores:null},mt.updateQueue=e,e.lastEffect=t.next=t):(n=e.lastEffect,n===null?e.lastEffect=t.next=t:(i=n.next,n.next=t,t.next=i,e.lastEffect=t)),t}function K0(){return An().memoizedState}function jo(t,e,n,i){var r=Hn();mt.flags|=t,r.memoizedState=Ca(1|e,n,void 0,i===void 0?null:i)}function kl(t,e,n,i){var r=An();i=i===void 0?null:i;var s=void 0;if(Et!==null){var a=Et.memoizedState;if(s=a.destroy,i!==null&&yh(i,a.deps)){r.memoizedState=Ca(e,n,s,i);return}}mt.flags|=t,r.memoizedState=Ca(1|e,n,s,i)}function $f(t,e){return jo(8390656,8,t,e)}function Mh(t,e){return kl(2048,8,t,e)}function Z0(t,e){return kl(4,2,t,e)}function Q0(t,e){return kl(4,4,t,e)}function J0(t,e){if(typeof e=="function")return t=t(),e(t),function(){e(null)};if(e!=null)return t=t(),e.current=t,function(){e.current=null}}function eg(t,e,n){return n=n!=null?n.concat([t]):null,kl(4,4,J0.bind(null,e,t),n)}function Eh(){}function tg(t,e){var n=An();e=e===void 0?null:e;var i=n.memoizedState;return i!==null&&e!==null&&yh(e,i[1])?i[0]:(n.memoizedState=[t,e],t)}function ng(t,e){var n=An();e=e===void 0?null:e;var i=n.memoizedState;return i!==null&&e!==null&&yh(e,i[1])?i[0]:(t=t(),n.memoizedState=[t,e],t)}function ig(t,e,n){return Mr&21?(Bn(n,e)||(n=l0(),mt.lanes|=n,Er|=n,t.baseState=!0),e):(t.baseState&&(t.baseState=!1,en=!0),t.memoizedState=n)}function R_(t,e){var n=it;it=n!==0&&4>n?n:4,t(!0);var i=gc.transition;gc.transition={};try{t(!1),e()}finally{it=n,gc.transition=i}}function rg(){return An().memoizedState}function N_(t,e,n){var i=ji(t);if(n={lane:i,action:n,hasEagerState:!1,eagerState:null,next:null},sg(t))ag(e,n);else if(n=B0(t,e,n,i),n!==null){var r=Gt();zn(n,t,i,r),og(n,e,i)}}function P_(t,e,n){var i=ji(t),r={lane:i,action:n,hasEagerState:!1,eagerState:null,next:null};if(sg(t))ag(e,r);else{var s=t.alternate;if(t.lanes===0&&(s===null||s.lanes===0)&&(s=e.lastRenderedReducer,s!==null))try{var a=e.lastRenderedState,o=s(a,n);if(r.hasEagerState=!0,r.eagerState=o,Bn(o,a)){var l=e.interleaved;l===null?(r.next=r,mh(e)):(r.next=l.next,l.next=r),e.interleaved=r;return}}catch{}finally{}n=B0(t,e,r,i),n!==null&&(r=Gt(),zn(n,t,i,r),og(n,e,i))}}function sg(t){var e=t.alternate;return t===mt||e!==null&&e===mt}function ag(t,e){oa=gl=!0;var n=t.pending;n===null?e.next=e:(e.next=n.next,n.next=e),t.pending=e}function og(t,e,n){if(n&4194240){var i=e.lanes;i&=t.pendingLanes,n|=i,e.lanes=n,th(t,n)}}var xl={readContext:Tn,useCallback:Ut,useContext:Ut,useEffect:Ut,useImperativeHandle:Ut,useInsertionEffect:Ut,useLayoutEffect:Ut,useMemo:Ut,useReducer:Ut,useRef:Ut,useState:Ut,useDebugValue:Ut,useDeferredValue:Ut,useTransition:Ut,useMutableSource:Ut,useSyncExternalStore:Ut,useId:Ut,unstable_isNewReconciler:!1},L_={readContext:Tn,useCallback:function(t,e){return Hn().memoizedState=[t,e===void 0?null:e],t},useContext:Tn,useEffect:$f,useImperativeHandle:function(t,e,n){return n=n!=null?n.concat([t]):null,jo(4194308,4,J0.bind(null,e,t),n)},useLayoutEffect:function(t,e){return jo(4194308,4,t,e)},useInsertionEffect:function(t,e){return jo(4,2,t,e)},useMemo:function(t,e){var n=Hn();return e=e===void 0?null:e,t=t(),n.memoizedState=[t,e],t},useReducer:function(t,e,n){var i=Hn();return e=n!==void 0?n(e):e,i.memoizedState=i.baseState=e,t={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:t,lastRenderedState:e},i.queue=t,t=t.dispatch=N_.bind(null,mt,t),[i.memoizedState,t]},useRef:function(t){var e=Hn();return t={current:t},e.memoizedState=t},useState:qf,useDebugValue:Eh,useDeferredValue:function(t){return Hn().memoizedState=t},useTransition:function(){var t=qf(!1),e=t[0];return t=R_.bind(null,t[1]),Hn().memoizedState=t,[e,t]},useMutableSource:function(){},useSyncExternalStore:function(t,e,n){var i=mt,r=Hn();if(ft){if(n===void 0)throw Error(ie(407));n=n()}else{if(n=e(),Nt===null)throw Error(ie(349));Mr&30||W0(i,e,n)}r.memoizedState=n;var s={value:n,getSnapshot:e};return r.queue=s,$f(q0.bind(null,i,s,t),[t]),i.flags|=2048,Ca(9,X0.bind(null,i,s,n,e),void 0,null),n},useId:function(){var t=Hn(),e=Nt.identifierPrefix;if(ft){var n=oi,i=ai;n=(i&~(1<<32-On(i)-1)).toString(32)+n,e=":"+e+"R"+n,n=Ta++,0<n&&(e+="H"+n.toString(32)),e+=":"}else n=C_++,e=":"+e+"r"+n.toString(32)+":";return t.memoizedState=e},unstable_isNewReconciler:!1},D_={readContext:Tn,useCallback:tg,useContext:Tn,useEffect:Mh,useImperativeHandle:eg,useInsertionEffect:Z0,useLayoutEffect:Q0,useMemo:ng,useReducer:xc,useRef:K0,useState:function(){return xc(Aa)},useDebugValue:Eh,useDeferredValue:function(t){var e=An();return ig(e,Et.memoizedState,t)},useTransition:function(){var t=xc(Aa)[0],e=An().memoizedState;return[t,e]},useMutableSource:V0,useSyncExternalStore:G0,useId:rg,unstable_isNewReconciler:!1},k_={readContext:Tn,useCallback:tg,useContext:Tn,useEffect:Mh,useImperativeHandle:eg,useInsertionEffect:Z0,useLayoutEffect:Q0,useMemo:ng,useReducer:vc,useRef:K0,useState:function(){return vc(Aa)},useDebugValue:Eh,useDeferredValue:function(t){var e=An();return Et===null?e.memoizedState=t:ig(e,Et.memoizedState,t)},useTransition:function(){var t=vc(Aa)[0],e=An().memoizedState;return[t,e]},useMutableSource:V0,useSyncExternalStore:G0,useId:rg,unstable_isNewReconciler:!1};function Dn(t,e){if(t&&t.defaultProps){e=gt({},e),t=t.defaultProps;for(var n in t)e[n]===void 0&&(e[n]=t[n]);return e}return e}function ku(t,e,n,i){e=t.memoizedState,n=n(i,e),n=n==null?e:gt({},e,n),t.memoizedState=n,t.lanes===0&&(t.updateQueue.baseState=n)}var Il={isMounted:function(t){return(t=t._reactInternals)?Rr(t)===t:!1},enqueueSetState:function(t,e,n){t=t._reactInternals;var i=Gt(),r=ji(t),s=ui(i,r);s.payload=e,n!=null&&(s.callback=n),e=zi(t,s,r),e!==null&&(zn(e,t,r,i),zo(e,t,r))},enqueueReplaceState:function(t,e,n){t=t._reactInternals;var i=Gt(),r=ji(t),s=ui(i,r);s.tag=1,s.payload=e,n!=null&&(s.callback=n),e=zi(t,s,r),e!==null&&(zn(e,t,r,i),zo(e,t,r))},enqueueForceUpdate:function(t,e){t=t._reactInternals;var n=Gt(),i=ji(t),r=ui(n,i);r.tag=2,e!=null&&(r.callback=e),e=zi(t,r,i),e!==null&&(zn(e,t,i,n),zo(e,t,i))}};function Yf(t,e,n,i,r,s,a){return t=t.stateNode,typeof t.shouldComponentUpdate=="function"?t.shouldComponentUpdate(i,s,a):e.prototype&&e.prototype.isPureReactComponent?!ya(n,i)||!ya(r,s):!0}function lg(t,e,n){var i=!1,r=Xi,s=e.contextType;return typeof s=="object"&&s!==null?s=Tn(s):(r=nn(e)?Sr:jt.current,i=e.contextTypes,s=(i=i!=null)?ms(t,r):Xi),e=new e(n,s),t.memoizedState=e.state!==null&&e.state!==void 0?e.state:null,e.updater=Il,t.stateNode=e,e._reactInternals=t,i&&(t=t.stateNode,t.__reactInternalMemoizedUnmaskedChildContext=r,t.__reactInternalMemoizedMaskedChildContext=s),e}function Kf(t,e,n,i){t=e.state,typeof e.componentWillReceiveProps=="function"&&e.componentWillReceiveProps(n,i),typeof e.UNSAFE_componentWillReceiveProps=="function"&&e.UNSAFE_componentWillReceiveProps(n,i),e.state!==t&&Il.enqueueReplaceState(e,e.state,null)}function Iu(t,e,n,i){var r=t.stateNode;r.props=n,r.state=t.memoizedState,r.refs={},gh(t);var s=e.contextType;typeof s=="object"&&s!==null?r.context=Tn(s):(s=nn(e)?Sr:jt.current,r.context=ms(t,s)),r.state=t.memoizedState,s=e.getDerivedStateFromProps,typeof s=="function"&&(ku(t,e,s,n),r.state=t.memoizedState),typeof e.getDerivedStateFromProps=="function"||typeof r.getSnapshotBeforeUpdate=="function"||typeof r.UNSAFE_componentWillMount!="function"&&typeof r.componentWillMount!="function"||(e=r.state,typeof r.componentWillMount=="function"&&r.componentWillMount(),typeof r.UNSAFE_componentWillMount=="function"&&r.UNSAFE_componentWillMount(),e!==r.state&&Il.enqueueReplaceState(r,r.state,null),pl(t,n,r,i),r.state=t.memoizedState),typeof r.componentDidMount=="function"&&(t.flags|=4194308)}function _s(t,e){try{var n="",i=e;do n+=lv(i),i=i.return;while(i);var r=n}catch(s){r=`
Error generating stack: `+s.message+`
`+s.stack}return{value:t,source:e,stack:r,digest:null}}function _c(t,e,n){return{value:t,source:null,stack:n??null,digest:e??null}}function Uu(t,e){try{console.error(e.value)}catch(n){setTimeout(function(){throw n})}}var I_=typeof WeakMap=="function"?WeakMap:Map;function cg(t,e,n){n=ui(-1,n),n.tag=3,n.payload={element:null};var i=e.value;return n.callback=function(){_l||(_l=!0,Xu=i),Uu(t,e)},n}function ug(t,e,n){n=ui(-1,n),n.tag=3;var i=t.type.getDerivedStateFromError;if(typeof i=="function"){var r=e.value;n.payload=function(){return i(r)},n.callback=function(){Uu(t,e)}}var s=t.stateNode;return s!==null&&typeof s.componentDidCatch=="function"&&(n.callback=function(){Uu(t,e),typeof i!="function"&&(Bi===null?Bi=new Set([this]):Bi.add(this));var a=e.stack;this.componentDidCatch(e.value,{componentStack:a!==null?a:""})}),n}function Zf(t,e,n){var i=t.pingCache;if(i===null){i=t.pingCache=new I_;var r=new Set;i.set(e,r)}else r=i.get(e),r===void 0&&(r=new Set,i.set(e,r));r.has(n)||(r.add(n),t=Y_.bind(null,t,e,n),e.then(t,t))}function Qf(t){do{var e;if((e=t.tag===13)&&(e=t.memoizedState,e=e!==null?e.dehydrated!==null:!0),e)return t;t=t.return}while(t!==null);return null}function Jf(t,e,n,i,r){return t.mode&1?(t.flags|=65536,t.lanes=r,t):(t===e?t.flags|=65536:(t.flags|=128,n.flags|=131072,n.flags&=-52805,n.tag===1&&(n.alternate===null?n.tag=17:(e=ui(-1,1),e.tag=2,zi(n,e,1))),n.lanes|=1),t)}var U_=xi.ReactCurrentOwner,en=!1;function Vt(t,e,n,i){e.child=t===null?z0(e,null,n,i):xs(e,t.child,n,i)}function ep(t,e,n,i,r){n=n.render;var s=e.ref;return cs(e,r),i=Sh(t,e,n,i,s,r),n=wh(),t!==null&&!en?(e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~r,pi(t,e,r)):(ft&&n&&ch(e),e.flags|=1,Vt(t,e,i,r),e.child)}function tp(t,e,n,i,r){if(t===null){var s=n.type;return typeof s=="function"&&!Lh(s)&&s.defaultProps===void 0&&n.compare===null&&n.defaultProps===void 0?(e.tag=15,e.type=s,dg(t,e,s,i,r)):(t=Wo(n.type,null,i,e,e.mode,r),t.ref=e.ref,t.return=e,e.child=t)}if(s=t.child,!(t.lanes&r)){var a=s.memoizedProps;if(n=n.compare,n=n!==null?n:ya,n(a,i)&&t.ref===e.ref)return pi(t,e,r)}return e.flags|=1,t=Hi(s,i),t.ref=e.ref,t.return=e,e.child=t}function dg(t,e,n,i,r){if(t!==null){var s=t.memoizedProps;if(ya(s,i)&&t.ref===e.ref)if(en=!1,e.pendingProps=i=s,(t.lanes&r)!==0)t.flags&131072&&(en=!0);else return e.lanes=t.lanes,pi(t,e,r)}return Fu(t,e,n,i,r)}function hg(t,e,n){var i=e.pendingProps,r=i.children,s=t!==null?t.memoizedState:null;if(i.mode==="hidden")if(!(e.mode&1))e.memoizedState={baseLanes:0,cachePool:null,transitions:null},ot(is,un),un|=n;else{if(!(n&1073741824))return t=s!==null?s.baseLanes|n:n,e.lanes=e.childLanes=1073741824,e.memoizedState={baseLanes:t,cachePool:null,transitions:null},e.updateQueue=null,ot(is,un),un|=t,null;e.memoizedState={baseLanes:0,cachePool:null,transitions:null},i=s!==null?s.baseLanes:n,ot(is,un),un|=i}else s!==null?(i=s.baseLanes|n,e.memoizedState=null):i=n,ot(is,un),un|=i;return Vt(t,e,r,n),e.child}function fg(t,e){var n=e.ref;(t===null&&n!==null||t!==null&&t.ref!==n)&&(e.flags|=512,e.flags|=2097152)}function Fu(t,e,n,i,r){var s=nn(n)?Sr:jt.current;return s=ms(e,s),cs(e,r),n=Sh(t,e,n,i,s,r),i=wh(),t!==null&&!en?(e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~r,pi(t,e,r)):(ft&&i&&ch(e),e.flags|=1,Vt(t,e,n,r),e.child)}function np(t,e,n,i,r){if(nn(n)){var s=!0;cl(e)}else s=!1;if(cs(e,r),e.stateNode===null)Ho(t,e),lg(e,n,i),Iu(e,n,i,r),i=!0;else if(t===null){var a=e.stateNode,o=e.memoizedProps;a.props=o;var l=a.context,u=n.contextType;typeof u=="object"&&u!==null?u=Tn(u):(u=nn(n)?Sr:jt.current,u=ms(e,u));var h=n.getDerivedStateFromProps,p=typeof h=="function"||typeof a.getSnapshotBeforeUpdate=="function";p||typeof a.UNSAFE_componentWillReceiveProps!="function"&&typeof a.componentWillReceiveProps!="function"||(o!==i||l!==u)&&Kf(e,a,i,u),Ri=!1;var f=e.memoizedState;a.state=f,pl(e,i,a,r),l=e.memoizedState,o!==i||f!==l||tn.current||Ri?(typeof h=="function"&&(ku(e,n,h,i),l=e.memoizedState),(o=Ri||Yf(e,n,o,i,f,l,u))?(p||typeof a.UNSAFE_componentWillMount!="function"&&typeof a.componentWillMount!="function"||(typeof a.componentWillMount=="function"&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount=="function"&&a.UNSAFE_componentWillMount()),typeof a.componentDidMount=="function"&&(e.flags|=4194308)):(typeof a.componentDidMount=="function"&&(e.flags|=4194308),e.memoizedProps=i,e.memoizedState=l),a.props=i,a.state=l,a.context=u,i=o):(typeof a.componentDidMount=="function"&&(e.flags|=4194308),i=!1)}else{a=e.stateNode,j0(t,e),o=e.memoizedProps,u=e.type===e.elementType?o:Dn(e.type,o),a.props=u,p=e.pendingProps,f=a.context,l=n.contextType,typeof l=="object"&&l!==null?l=Tn(l):(l=nn(n)?Sr:jt.current,l=ms(e,l));var g=n.getDerivedStateFromProps;(h=typeof g=="function"||typeof a.getSnapshotBeforeUpdate=="function")||typeof a.UNSAFE_componentWillReceiveProps!="function"&&typeof a.componentWillReceiveProps!="function"||(o!==p||f!==l)&&Kf(e,a,i,l),Ri=!1,f=e.memoizedState,a.state=f,pl(e,i,a,r);var v=e.memoizedState;o!==p||f!==v||tn.current||Ri?(typeof g=="function"&&(ku(e,n,g,i),v=e.memoizedState),(u=Ri||Yf(e,n,u,i,f,v,l)||!1)?(h||typeof a.UNSAFE_componentWillUpdate!="function"&&typeof a.componentWillUpdate!="function"||(typeof a.componentWillUpdate=="function"&&a.componentWillUpdate(i,v,l),typeof a.UNSAFE_componentWillUpdate=="function"&&a.UNSAFE_componentWillUpdate(i,v,l)),typeof a.componentDidUpdate=="function"&&(e.flags|=4),typeof a.getSnapshotBeforeUpdate=="function"&&(e.flags|=1024)):(typeof a.componentDidUpdate!="function"||o===t.memoizedProps&&f===t.memoizedState||(e.flags|=4),typeof a.getSnapshotBeforeUpdate!="function"||o===t.memoizedProps&&f===t.memoizedState||(e.flags|=1024),e.memoizedProps=i,e.memoizedState=v),a.props=i,a.state=v,a.context=l,i=u):(typeof a.componentDidUpdate!="function"||o===t.memoizedProps&&f===t.memoizedState||(e.flags|=4),typeof a.getSnapshotBeforeUpdate!="function"||o===t.memoizedProps&&f===t.memoizedState||(e.flags|=1024),i=!1)}return Ou(t,e,n,i,s,r)}function Ou(t,e,n,i,r,s){fg(t,e);var a=(e.flags&128)!==0;if(!i&&!a)return r&&jf(e,n,!1),pi(t,e,s);i=e.stateNode,U_.current=e;var o=a&&typeof n.getDerivedStateFromError!="function"?null:i.render();return e.flags|=1,t!==null&&a?(e.child=xs(e,t.child,null,s),e.child=xs(e,null,o,s)):Vt(t,e,o,s),e.memoizedState=i.state,r&&jf(e,n,!0),e.child}function pg(t){var e=t.stateNode;e.pendingContext?Bf(t,e.pendingContext,e.pendingContext!==e.context):e.context&&Bf(t,e.context,!1),xh(t,e.containerInfo)}function ip(t,e,n,i,r){return gs(),dh(r),e.flags|=256,Vt(t,e,n,i),e.child}var zu={dehydrated:null,treeContext:null,retryLane:0};function Bu(t){return{baseLanes:t,cachePool:null,transitions:null}}function mg(t,e,n){var i=e.pendingProps,r=pt.current,s=!1,a=(e.flags&128)!==0,o;if((o=a)||(o=t!==null&&t.memoizedState===null?!1:(r&2)!==0),o?(s=!0,e.flags&=-129):(t===null||t.memoizedState!==null)&&(r|=1),ot(pt,r&1),t===null)return Lu(e),t=e.memoizedState,t!==null&&(t=t.dehydrated,t!==null)?(e.mode&1?t.data==="$!"?e.lanes=8:e.lanes=1073741824:e.lanes=1,null):(a=i.children,t=i.fallback,s?(i=e.mode,s=e.child,a={mode:"hidden",children:a},!(i&1)&&s!==null?(s.childLanes=0,s.pendingProps=a):s=Ol(a,i,0,null),t=_r(t,i,n,null),s.return=e,t.return=e,s.sibling=t,e.child=s,e.child.memoizedState=Bu(n),e.memoizedState=zu,t):bh(e,a));if(r=t.memoizedState,r!==null&&(o=r.dehydrated,o!==null))return F_(t,e,a,i,o,r,n);if(s){s=i.fallback,a=e.mode,r=t.child,o=r.sibling;var l={mode:"hidden",children:i.children};return!(a&1)&&e.child!==r?(i=e.child,i.childLanes=0,i.pendingProps=l,e.deletions=null):(i=Hi(r,l),i.subtreeFlags=r.subtreeFlags&14680064),o!==null?s=Hi(o,s):(s=_r(s,a,n,null),s.flags|=2),s.return=e,i.return=e,i.sibling=s,e.child=i,i=s,s=e.child,a=t.child.memoizedState,a=a===null?Bu(n):{baseLanes:a.baseLanes|n,cachePool:null,transitions:a.transitions},s.memoizedState=a,s.childLanes=t.childLanes&~n,e.memoizedState=zu,i}return s=t.child,t=s.sibling,i=Hi(s,{mode:"visible",children:i.children}),!(e.mode&1)&&(i.lanes=n),i.return=e,i.sibling=null,t!==null&&(n=e.deletions,n===null?(e.deletions=[t],e.flags|=16):n.push(t)),e.child=i,e.memoizedState=null,i}function bh(t,e){return e=Ol({mode:"visible",children:e},t.mode,0,null),e.return=t,t.child=e}function ao(t,e,n,i){return i!==null&&dh(i),xs(e,t.child,null,n),t=bh(e,e.pendingProps.children),t.flags|=2,e.memoizedState=null,t}function F_(t,e,n,i,r,s,a){if(n)return e.flags&256?(e.flags&=-257,i=_c(Error(ie(422))),ao(t,e,a,i)):e.memoizedState!==null?(e.child=t.child,e.flags|=128,null):(s=i.fallback,r=e.mode,i=Ol({mode:"visible",children:i.children},r,0,null),s=_r(s,r,a,null),s.flags|=2,i.return=e,s.return=e,i.sibling=s,e.child=i,e.mode&1&&xs(e,t.child,null,a),e.child.memoizedState=Bu(a),e.memoizedState=zu,s);if(!(e.mode&1))return ao(t,e,a,null);if(r.data==="$!"){if(i=r.nextSibling&&r.nextSibling.dataset,i)var o=i.dgst;return i=o,s=Error(ie(419)),i=_c(s,i,void 0),ao(t,e,a,i)}if(o=(a&t.childLanes)!==0,en||o){if(i=Nt,i!==null){switch(a&-a){case 4:r=2;break;case 16:r=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:r=32;break;case 536870912:r=268435456;break;default:r=0}r=r&(i.suspendedLanes|a)?0:r,r!==0&&r!==s.retryLane&&(s.retryLane=r,fi(t,r),zn(i,t,r,-1))}return Ph(),i=_c(Error(ie(421))),ao(t,e,a,i)}return r.data==="$?"?(e.flags|=128,e.child=t.child,e=K_.bind(null,t),r._reactRetry=e,null):(t=s.treeContext,hn=Oi(r.nextSibling),fn=e,ft=!0,In=null,t!==null&&(_n[yn++]=ai,_n[yn++]=oi,_n[yn++]=wr,ai=t.id,oi=t.overflow,wr=e),e=bh(e,i.children),e.flags|=4096,e)}function rp(t,e,n){t.lanes|=e;var i=t.alternate;i!==null&&(i.lanes|=e),Du(t.return,e,n)}function yc(t,e,n,i,r){var s=t.memoizedState;s===null?t.memoizedState={isBackwards:e,rendering:null,renderingStartTime:0,last:i,tail:n,tailMode:r}:(s.isBackwards=e,s.rendering=null,s.renderingStartTime=0,s.last=i,s.tail=n,s.tailMode=r)}function gg(t,e,n){var i=e.pendingProps,r=i.revealOrder,s=i.tail;if(Vt(t,e,i.children,n),i=pt.current,i&2)i=i&1|2,e.flags|=128;else{if(t!==null&&t.flags&128)e:for(t=e.child;t!==null;){if(t.tag===13)t.memoizedState!==null&&rp(t,n,e);else if(t.tag===19)rp(t,n,e);else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break e;for(;t.sibling===null;){if(t.return===null||t.return===e)break e;t=t.return}t.sibling.return=t.return,t=t.sibling}i&=1}if(ot(pt,i),!(e.mode&1))e.memoizedState=null;else switch(r){case"forwards":for(n=e.child,r=null;n!==null;)t=n.alternate,t!==null&&ml(t)===null&&(r=n),n=n.sibling;n=r,n===null?(r=e.child,e.child=null):(r=n.sibling,n.sibling=null),yc(e,!1,r,n,s);break;case"backwards":for(n=null,r=e.child,e.child=null;r!==null;){if(t=r.alternate,t!==null&&ml(t)===null){e.child=r;break}t=r.sibling,r.sibling=n,n=r,r=t}yc(e,!0,n,null,s);break;case"together":yc(e,!1,null,null,void 0);break;default:e.memoizedState=null}return e.child}function Ho(t,e){!(e.mode&1)&&t!==null&&(t.alternate=null,e.alternate=null,e.flags|=2)}function pi(t,e,n){if(t!==null&&(e.dependencies=t.dependencies),Er|=e.lanes,!(n&e.childLanes))return null;if(t!==null&&e.child!==t.child)throw Error(ie(153));if(e.child!==null){for(t=e.child,n=Hi(t,t.pendingProps),e.child=n,n.return=e;t.sibling!==null;)t=t.sibling,n=n.sibling=Hi(t,t.pendingProps),n.return=e;n.sibling=null}return e.child}function O_(t,e,n){switch(e.tag){case 3:pg(e),gs();break;case 5:H0(e);break;case 1:nn(e.type)&&cl(e);break;case 4:xh(e,e.stateNode.containerInfo);break;case 10:var i=e.type._context,r=e.memoizedProps.value;ot(hl,i._currentValue),i._currentValue=r;break;case 13:if(i=e.memoizedState,i!==null)return i.dehydrated!==null?(ot(pt,pt.current&1),e.flags|=128,null):n&e.child.childLanes?mg(t,e,n):(ot(pt,pt.current&1),t=pi(t,e,n),t!==null?t.sibling:null);ot(pt,pt.current&1);break;case 19:if(i=(n&e.childLanes)!==0,t.flags&128){if(i)return gg(t,e,n);e.flags|=128}if(r=e.memoizedState,r!==null&&(r.rendering=null,r.tail=null,r.lastEffect=null),ot(pt,pt.current),i)break;return null;case 22:case 23:return e.lanes=0,hg(t,e,n)}return pi(t,e,n)}var xg,ju,vg,_g;xg=function(t,e){for(var n=e.child;n!==null;){if(n.tag===5||n.tag===6)t.appendChild(n.stateNode);else if(n.tag!==4&&n.child!==null){n.child.return=n,n=n.child;continue}if(n===e)break;for(;n.sibling===null;){if(n.return===null||n.return===e)return;n=n.return}n.sibling.return=n.return,n=n.sibling}};ju=function(){};vg=function(t,e,n,i){var r=t.memoizedProps;if(r!==i){t=e.stateNode,pr(Yn.current);var s=null;switch(n){case"input":r=cu(t,r),i=cu(t,i),s=[];break;case"select":r=gt({},r,{value:void 0}),i=gt({},i,{value:void 0}),s=[];break;case"textarea":r=hu(t,r),i=hu(t,i),s=[];break;default:typeof r.onClick!="function"&&typeof i.onClick=="function"&&(t.onclick=ol)}pu(n,i);var a;n=null;for(u in r)if(!i.hasOwnProperty(u)&&r.hasOwnProperty(u)&&r[u]!=null)if(u==="style"){var o=r[u];for(a in o)o.hasOwnProperty(a)&&(n||(n={}),n[a]="")}else u!=="dangerouslySetInnerHTML"&&u!=="children"&&u!=="suppressContentEditableWarning"&&u!=="suppressHydrationWarning"&&u!=="autoFocus"&&(fa.hasOwnProperty(u)?s||(s=[]):(s=s||[]).push(u,null));for(u in i){var l=i[u];if(o=r!=null?r[u]:void 0,i.hasOwnProperty(u)&&l!==o&&(l!=null||o!=null))if(u==="style")if(o){for(a in o)!o.hasOwnProperty(a)||l&&l.hasOwnProperty(a)||(n||(n={}),n[a]="");for(a in l)l.hasOwnProperty(a)&&o[a]!==l[a]&&(n||(n={}),n[a]=l[a])}else n||(s||(s=[]),s.push(u,n)),n=l;else u==="dangerouslySetInnerHTML"?(l=l?l.__html:void 0,o=o?o.__html:void 0,l!=null&&o!==l&&(s=s||[]).push(u,l)):u==="children"?typeof l!="string"&&typeof l!="number"||(s=s||[]).push(u,""+l):u!=="suppressContentEditableWarning"&&u!=="suppressHydrationWarning"&&(fa.hasOwnProperty(u)?(l!=null&&u==="onScroll"&&ct("scroll",t),s||o===l||(s=[])):(s=s||[]).push(u,l))}n&&(s=s||[]).push("style",n);var u=s;(e.updateQueue=u)&&(e.flags|=4)}};_g=function(t,e,n,i){n!==i&&(e.flags|=4)};function js(t,e){if(!ft)switch(t.tailMode){case"hidden":e=t.tail;for(var n=null;e!==null;)e.alternate!==null&&(n=e),e=e.sibling;n===null?t.tail=null:n.sibling=null;break;case"collapsed":n=t.tail;for(var i=null;n!==null;)n.alternate!==null&&(i=n),n=n.sibling;i===null?e||t.tail===null?t.tail=null:t.tail.sibling=null:i.sibling=null}}function Ft(t){var e=t.alternate!==null&&t.alternate.child===t.child,n=0,i=0;if(e)for(var r=t.child;r!==null;)n|=r.lanes|r.childLanes,i|=r.subtreeFlags&14680064,i|=r.flags&14680064,r.return=t,r=r.sibling;else for(r=t.child;r!==null;)n|=r.lanes|r.childLanes,i|=r.subtreeFlags,i|=r.flags,r.return=t,r=r.sibling;return t.subtreeFlags|=i,t.childLanes=n,e}function z_(t,e,n){var i=e.pendingProps;switch(uh(e),e.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return Ft(e),null;case 1:return nn(e.type)&&ll(),Ft(e),null;case 3:return i=e.stateNode,vs(),dt(tn),dt(jt),_h(),i.pendingContext&&(i.context=i.pendingContext,i.pendingContext=null),(t===null||t.child===null)&&(ro(e)?e.flags|=4:t===null||t.memoizedState.isDehydrated&&!(e.flags&256)||(e.flags|=1024,In!==null&&(Yu(In),In=null))),ju(t,e),Ft(e),null;case 5:vh(e);var r=pr(ba.current);if(n=e.type,t!==null&&e.stateNode!=null)vg(t,e,n,i,r),t.ref!==e.ref&&(e.flags|=512,e.flags|=2097152);else{if(!i){if(e.stateNode===null)throw Error(ie(166));return Ft(e),null}if(t=pr(Yn.current),ro(e)){i=e.stateNode,n=e.type;var s=e.memoizedProps;switch(i[Wn]=e,i[Ma]=s,t=(e.mode&1)!==0,n){case"dialog":ct("cancel",i),ct("close",i);break;case"iframe":case"object":case"embed":ct("load",i);break;case"video":case"audio":for(r=0;r<Js.length;r++)ct(Js[r],i);break;case"source":ct("error",i);break;case"img":case"image":case"link":ct("error",i),ct("load",i);break;case"details":ct("toggle",i);break;case"input":ff(i,s),ct("invalid",i);break;case"select":i._wrapperState={wasMultiple:!!s.multiple},ct("invalid",i);break;case"textarea":mf(i,s),ct("invalid",i)}pu(n,s),r=null;for(var a in s)if(s.hasOwnProperty(a)){var o=s[a];a==="children"?typeof o=="string"?i.textContent!==o&&(s.suppressHydrationWarning!==!0&&io(i.textContent,o,t),r=["children",o]):typeof o=="number"&&i.textContent!==""+o&&(s.suppressHydrationWarning!==!0&&io(i.textContent,o,t),r=["children",""+o]):fa.hasOwnProperty(a)&&o!=null&&a==="onScroll"&&ct("scroll",i)}switch(n){case"input":Ya(i),pf(i,s,!0);break;case"textarea":Ya(i),gf(i);break;case"select":case"option":break;default:typeof s.onClick=="function"&&(i.onclick=ol)}i=r,e.updateQueue=i,i!==null&&(e.flags|=4)}else{a=r.nodeType===9?r:r.ownerDocument,t==="http://www.w3.org/1999/xhtml"&&(t=qm(n)),t==="http://www.w3.org/1999/xhtml"?n==="script"?(t=a.createElement("div"),t.innerHTML="<script><\/script>",t=t.removeChild(t.firstChild)):typeof i.is=="string"?t=a.createElement(n,{is:i.is}):(t=a.createElement(n),n==="select"&&(a=t,i.multiple?a.multiple=!0:i.size&&(a.size=i.size))):t=a.createElementNS(t,n),t[Wn]=e,t[Ma]=i,xg(t,e,!1,!1),e.stateNode=t;e:{switch(a=mu(n,i),n){case"dialog":ct("cancel",t),ct("close",t),r=i;break;case"iframe":case"object":case"embed":ct("load",t),r=i;break;case"video":case"audio":for(r=0;r<Js.length;r++)ct(Js[r],t);r=i;break;case"source":ct("error",t),r=i;break;case"img":case"image":case"link":ct("error",t),ct("load",t),r=i;break;case"details":ct("toggle",t),r=i;break;case"input":ff(t,i),r=cu(t,i),ct("invalid",t);break;case"option":r=i;break;case"select":t._wrapperState={wasMultiple:!!i.multiple},r=gt({},i,{value:void 0}),ct("invalid",t);break;case"textarea":mf(t,i),r=hu(t,i),ct("invalid",t);break;default:r=i}pu(n,r),o=r;for(s in o)if(o.hasOwnProperty(s)){var l=o[s];s==="style"?Km(t,l):s==="dangerouslySetInnerHTML"?(l=l?l.__html:void 0,l!=null&&$m(t,l)):s==="children"?typeof l=="string"?(n!=="textarea"||l!=="")&&pa(t,l):typeof l=="number"&&pa(t,""+l):s!=="suppressContentEditableWarning"&&s!=="suppressHydrationWarning"&&s!=="autoFocus"&&(fa.hasOwnProperty(s)?l!=null&&s==="onScroll"&&ct("scroll",t):l!=null&&Yd(t,s,l,a))}switch(n){case"input":Ya(t),pf(t,i,!1);break;case"textarea":Ya(t),gf(t);break;case"option":i.value!=null&&t.setAttribute("value",""+Wi(i.value));break;case"select":t.multiple=!!i.multiple,s=i.value,s!=null?ss(t,!!i.multiple,s,!1):i.defaultValue!=null&&ss(t,!!i.multiple,i.defaultValue,!0);break;default:typeof r.onClick=="function"&&(t.onclick=ol)}switch(n){case"button":case"input":case"select":case"textarea":i=!!i.autoFocus;break e;case"img":i=!0;break e;default:i=!1}}i&&(e.flags|=4)}e.ref!==null&&(e.flags|=512,e.flags|=2097152)}return Ft(e),null;case 6:if(t&&e.stateNode!=null)_g(t,e,t.memoizedProps,i);else{if(typeof i!="string"&&e.stateNode===null)throw Error(ie(166));if(n=pr(ba.current),pr(Yn.current),ro(e)){if(i=e.stateNode,n=e.memoizedProps,i[Wn]=e,(s=i.nodeValue!==n)&&(t=fn,t!==null))switch(t.tag){case 3:io(i.nodeValue,n,(t.mode&1)!==0);break;case 5:t.memoizedProps.suppressHydrationWarning!==!0&&io(i.nodeValue,n,(t.mode&1)!==0)}s&&(e.flags|=4)}else i=(n.nodeType===9?n:n.ownerDocument).createTextNode(i),i[Wn]=e,e.stateNode=i}return Ft(e),null;case 13:if(dt(pt),i=e.memoizedState,t===null||t.memoizedState!==null&&t.memoizedState.dehydrated!==null){if(ft&&hn!==null&&e.mode&1&&!(e.flags&128))F0(),gs(),e.flags|=98560,s=!1;else if(s=ro(e),i!==null&&i.dehydrated!==null){if(t===null){if(!s)throw Error(ie(318));if(s=e.memoizedState,s=s!==null?s.dehydrated:null,!s)throw Error(ie(317));s[Wn]=e}else gs(),!(e.flags&128)&&(e.memoizedState=null),e.flags|=4;Ft(e),s=!1}else In!==null&&(Yu(In),In=null),s=!0;if(!s)return e.flags&65536?e:null}return e.flags&128?(e.lanes=n,e):(i=i!==null,i!==(t!==null&&t.memoizedState!==null)&&i&&(e.child.flags|=8192,e.mode&1&&(t===null||pt.current&1?bt===0&&(bt=3):Ph())),e.updateQueue!==null&&(e.flags|=4),Ft(e),null);case 4:return vs(),ju(t,e),t===null&&Sa(e.stateNode.containerInfo),Ft(e),null;case 10:return ph(e.type._context),Ft(e),null;case 17:return nn(e.type)&&ll(),Ft(e),null;case 19:if(dt(pt),s=e.memoizedState,s===null)return Ft(e),null;if(i=(e.flags&128)!==0,a=s.rendering,a===null)if(i)js(s,!1);else{if(bt!==0||t!==null&&t.flags&128)for(t=e.child;t!==null;){if(a=ml(t),a!==null){for(e.flags|=128,js(s,!1),i=a.updateQueue,i!==null&&(e.updateQueue=i,e.flags|=4),e.subtreeFlags=0,i=n,n=e.child;n!==null;)s=n,t=i,s.flags&=14680066,a=s.alternate,a===null?(s.childLanes=0,s.lanes=t,s.child=null,s.subtreeFlags=0,s.memoizedProps=null,s.memoizedState=null,s.updateQueue=null,s.dependencies=null,s.stateNode=null):(s.childLanes=a.childLanes,s.lanes=a.lanes,s.child=a.child,s.subtreeFlags=0,s.deletions=null,s.memoizedProps=a.memoizedProps,s.memoizedState=a.memoizedState,s.updateQueue=a.updateQueue,s.type=a.type,t=a.dependencies,s.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),n=n.sibling;return ot(pt,pt.current&1|2),e.child}t=t.sibling}s.tail!==null&&yt()>ys&&(e.flags|=128,i=!0,js(s,!1),e.lanes=4194304)}else{if(!i)if(t=ml(a),t!==null){if(e.flags|=128,i=!0,n=t.updateQueue,n!==null&&(e.updateQueue=n,e.flags|=4),js(s,!0),s.tail===null&&s.tailMode==="hidden"&&!a.alternate&&!ft)return Ft(e),null}else 2*yt()-s.renderingStartTime>ys&&n!==1073741824&&(e.flags|=128,i=!0,js(s,!1),e.lanes=4194304);s.isBackwards?(a.sibling=e.child,e.child=a):(n=s.last,n!==null?n.sibling=a:e.child=a,s.last=a)}return s.tail!==null?(e=s.tail,s.rendering=e,s.tail=e.sibling,s.renderingStartTime=yt(),e.sibling=null,n=pt.current,ot(pt,i?n&1|2:n&1),e):(Ft(e),null);case 22:case 23:return Nh(),i=e.memoizedState!==null,t!==null&&t.memoizedState!==null!==i&&(e.flags|=8192),i&&e.mode&1?un&1073741824&&(Ft(e),e.subtreeFlags&6&&(e.flags|=8192)):Ft(e),null;case 24:return null;case 25:return null}throw Error(ie(156,e.tag))}function B_(t,e){switch(uh(e),e.tag){case 1:return nn(e.type)&&ll(),t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 3:return vs(),dt(tn),dt(jt),_h(),t=e.flags,t&65536&&!(t&128)?(e.flags=t&-65537|128,e):null;case 5:return vh(e),null;case 13:if(dt(pt),t=e.memoizedState,t!==null&&t.dehydrated!==null){if(e.alternate===null)throw Error(ie(340));gs()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 19:return dt(pt),null;case 4:return vs(),null;case 10:return ph(e.type._context),null;case 22:case 23:return Nh(),null;case 24:return null;default:return null}}var oo=!1,Bt=!1,j_=typeof WeakSet=="function"?WeakSet:Set,ge=null;function ns(t,e){var n=t.ref;if(n!==null)if(typeof n=="function")try{n(null)}catch(i){vt(t,e,i)}else n.current=null}function Hu(t,e,n){try{n()}catch(i){vt(t,e,i)}}var sp=!1;function H_(t,e){if(bu=rl,t=E0(),lh(t)){if("selectionStart"in t)var n={start:t.selectionStart,end:t.selectionEnd};else e:{n=(n=t.ownerDocument)&&n.defaultView||window;var i=n.getSelection&&n.getSelection();if(i&&i.rangeCount!==0){n=i.anchorNode;var r=i.anchorOffset,s=i.focusNode;i=i.focusOffset;try{n.nodeType,s.nodeType}catch{n=null;break e}var a=0,o=-1,l=-1,u=0,h=0,p=t,f=null;t:for(;;){for(var g;p!==n||r!==0&&p.nodeType!==3||(o=a+r),p!==s||i!==0&&p.nodeType!==3||(l=a+i),p.nodeType===3&&(a+=p.nodeValue.length),(g=p.firstChild)!==null;)f=p,p=g;for(;;){if(p===t)break t;if(f===n&&++u===r&&(o=a),f===s&&++h===i&&(l=a),(g=p.nextSibling)!==null)break;p=f,f=p.parentNode}p=g}n=o===-1||l===-1?null:{start:o,end:l}}else n=null}n=n||{start:0,end:0}}else n=null;for(Tu={focusedElem:t,selectionRange:n},rl=!1,ge=e;ge!==null;)if(e=ge,t=e.child,(e.subtreeFlags&1028)!==0&&t!==null)t.return=e,ge=t;else for(;ge!==null;){e=ge;try{var v=e.alternate;if(e.flags&1024)switch(e.tag){case 0:case 11:case 15:break;case 1:if(v!==null){var S=v.memoizedProps,m=v.memoizedState,d=e.stateNode,_=d.getSnapshotBeforeUpdate(e.elementType===e.type?S:Dn(e.type,S),m);d.__reactInternalSnapshotBeforeUpdate=_}break;case 3:var x=e.stateNode.containerInfo;x.nodeType===1?x.textContent="":x.nodeType===9&&x.documentElement&&x.removeChild(x.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(ie(163))}}catch(M){vt(e,e.return,M)}if(t=e.sibling,t!==null){t.return=e.return,ge=t;break}ge=e.return}return v=sp,sp=!1,v}function la(t,e,n){var i=e.updateQueue;if(i=i!==null?i.lastEffect:null,i!==null){var r=i=i.next;do{if((r.tag&t)===t){var s=r.destroy;r.destroy=void 0,s!==void 0&&Hu(e,n,s)}r=r.next}while(r!==i)}}function Ul(t,e){if(e=e.updateQueue,e=e!==null?e.lastEffect:null,e!==null){var n=e=e.next;do{if((n.tag&t)===t){var i=n.create;n.destroy=i()}n=n.next}while(n!==e)}}function Vu(t){var e=t.ref;if(e!==null){var n=t.stateNode;switch(t.tag){case 5:t=n;break;default:t=n}typeof e=="function"?e(t):e.current=t}}function yg(t){var e=t.alternate;e!==null&&(t.alternate=null,yg(e)),t.child=null,t.deletions=null,t.sibling=null,t.tag===5&&(e=t.stateNode,e!==null&&(delete e[Wn],delete e[Ma],delete e[Ru],delete e[E_],delete e[b_])),t.stateNode=null,t.return=null,t.dependencies=null,t.memoizedProps=null,t.memoizedState=null,t.pendingProps=null,t.stateNode=null,t.updateQueue=null}function Sg(t){return t.tag===5||t.tag===3||t.tag===4}function ap(t){e:for(;;){for(;t.sibling===null;){if(t.return===null||Sg(t.return))return null;t=t.return}for(t.sibling.return=t.return,t=t.sibling;t.tag!==5&&t.tag!==6&&t.tag!==18;){if(t.flags&2||t.child===null||t.tag===4)continue e;t.child.return=t,t=t.child}if(!(t.flags&2))return t.stateNode}}function Gu(t,e,n){var i=t.tag;if(i===5||i===6)t=t.stateNode,e?n.nodeType===8?n.parentNode.insertBefore(t,e):n.insertBefore(t,e):(n.nodeType===8?(e=n.parentNode,e.insertBefore(t,n)):(e=n,e.appendChild(t)),n=n._reactRootContainer,n!=null||e.onclick!==null||(e.onclick=ol));else if(i!==4&&(t=t.child,t!==null))for(Gu(t,e,n),t=t.sibling;t!==null;)Gu(t,e,n),t=t.sibling}function Wu(t,e,n){var i=t.tag;if(i===5||i===6)t=t.stateNode,e?n.insertBefore(t,e):n.appendChild(t);else if(i!==4&&(t=t.child,t!==null))for(Wu(t,e,n),t=t.sibling;t!==null;)Wu(t,e,n),t=t.sibling}var Lt=null,kn=!1;function yi(t,e,n){for(n=n.child;n!==null;)wg(t,e,n),n=n.sibling}function wg(t,e,n){if($n&&typeof $n.onCommitFiberUnmount=="function")try{$n.onCommitFiberUnmount(Cl,n)}catch{}switch(n.tag){case 5:Bt||ns(n,e);case 6:var i=Lt,r=kn;Lt=null,yi(t,e,n),Lt=i,kn=r,Lt!==null&&(kn?(t=Lt,n=n.stateNode,t.nodeType===8?t.parentNode.removeChild(n):t.removeChild(n)):Lt.removeChild(n.stateNode));break;case 18:Lt!==null&&(kn?(t=Lt,n=n.stateNode,t.nodeType===8?fc(t.parentNode,n):t.nodeType===1&&fc(t,n),va(t)):fc(Lt,n.stateNode));break;case 4:i=Lt,r=kn,Lt=n.stateNode.containerInfo,kn=!0,yi(t,e,n),Lt=i,kn=r;break;case 0:case 11:case 14:case 15:if(!Bt&&(i=n.updateQueue,i!==null&&(i=i.lastEffect,i!==null))){r=i=i.next;do{var s=r,a=s.destroy;s=s.tag,a!==void 0&&(s&2||s&4)&&Hu(n,e,a),r=r.next}while(r!==i)}yi(t,e,n);break;case 1:if(!Bt&&(ns(n,e),i=n.stateNode,typeof i.componentWillUnmount=="function"))try{i.props=n.memoizedProps,i.state=n.memoizedState,i.componentWillUnmount()}catch(o){vt(n,e,o)}yi(t,e,n);break;case 21:yi(t,e,n);break;case 22:n.mode&1?(Bt=(i=Bt)||n.memoizedState!==null,yi(t,e,n),Bt=i):yi(t,e,n);break;default:yi(t,e,n)}}function op(t){var e=t.updateQueue;if(e!==null){t.updateQueue=null;var n=t.stateNode;n===null&&(n=t.stateNode=new j_),e.forEach(function(i){var r=Z_.bind(null,t,i);n.has(i)||(n.add(i),i.then(r,r))})}}function Rn(t,e){var n=e.deletions;if(n!==null)for(var i=0;i<n.length;i++){var r=n[i];try{var s=t,a=e,o=a;e:for(;o!==null;){switch(o.tag){case 5:Lt=o.stateNode,kn=!1;break e;case 3:Lt=o.stateNode.containerInfo,kn=!0;break e;case 4:Lt=o.stateNode.containerInfo,kn=!0;break e}o=o.return}if(Lt===null)throw Error(ie(160));wg(s,a,r),Lt=null,kn=!1;var l=r.alternate;l!==null&&(l.return=null),r.return=null}catch(u){vt(r,e,u)}}if(e.subtreeFlags&12854)for(e=e.child;e!==null;)Mg(e,t),e=e.sibling}function Mg(t,e){var n=t.alternate,i=t.flags;switch(t.tag){case 0:case 11:case 14:case 15:if(Rn(e,t),jn(t),i&4){try{la(3,t,t.return),Ul(3,t)}catch(S){vt(t,t.return,S)}try{la(5,t,t.return)}catch(S){vt(t,t.return,S)}}break;case 1:Rn(e,t),jn(t),i&512&&n!==null&&ns(n,n.return);break;case 5:if(Rn(e,t),jn(t),i&512&&n!==null&&ns(n,n.return),t.flags&32){var r=t.stateNode;try{pa(r,"")}catch(S){vt(t,t.return,S)}}if(i&4&&(r=t.stateNode,r!=null)){var s=t.memoizedProps,a=n!==null?n.memoizedProps:s,o=t.type,l=t.updateQueue;if(t.updateQueue=null,l!==null)try{o==="input"&&s.type==="radio"&&s.name!=null&&Wm(r,s),mu(o,a);var u=mu(o,s);for(a=0;a<l.length;a+=2){var h=l[a],p=l[a+1];h==="style"?Km(r,p):h==="dangerouslySetInnerHTML"?$m(r,p):h==="children"?pa(r,p):Yd(r,h,p,u)}switch(o){case"input":uu(r,s);break;case"textarea":Xm(r,s);break;case"select":var f=r._wrapperState.wasMultiple;r._wrapperState.wasMultiple=!!s.multiple;var g=s.value;g!=null?ss(r,!!s.multiple,g,!1):f!==!!s.multiple&&(s.defaultValue!=null?ss(r,!!s.multiple,s.defaultValue,!0):ss(r,!!s.multiple,s.multiple?[]:"",!1))}r[Ma]=s}catch(S){vt(t,t.return,S)}}break;case 6:if(Rn(e,t),jn(t),i&4){if(t.stateNode===null)throw Error(ie(162));r=t.stateNode,s=t.memoizedProps;try{r.nodeValue=s}catch(S){vt(t,t.return,S)}}break;case 3:if(Rn(e,t),jn(t),i&4&&n!==null&&n.memoizedState.isDehydrated)try{va(e.containerInfo)}catch(S){vt(t,t.return,S)}break;case 4:Rn(e,t),jn(t);break;case 13:Rn(e,t),jn(t),r=t.child,r.flags&8192&&(s=r.memoizedState!==null,r.stateNode.isHidden=s,!s||r.alternate!==null&&r.alternate.memoizedState!==null||(Ch=yt())),i&4&&op(t);break;case 22:if(h=n!==null&&n.memoizedState!==null,t.mode&1?(Bt=(u=Bt)||h,Rn(e,t),Bt=u):Rn(e,t),jn(t),i&8192){if(u=t.memoizedState!==null,(t.stateNode.isHidden=u)&&!h&&t.mode&1)for(ge=t,h=t.child;h!==null;){for(p=ge=h;ge!==null;){switch(f=ge,g=f.child,f.tag){case 0:case 11:case 14:case 15:la(4,f,f.return);break;case 1:ns(f,f.return);var v=f.stateNode;if(typeof v.componentWillUnmount=="function"){i=f,n=f.return;try{e=i,v.props=e.memoizedProps,v.state=e.memoizedState,v.componentWillUnmount()}catch(S){vt(i,n,S)}}break;case 5:ns(f,f.return);break;case 22:if(f.memoizedState!==null){cp(p);continue}}g!==null?(g.return=f,ge=g):cp(p)}h=h.sibling}e:for(h=null,p=t;;){if(p.tag===5){if(h===null){h=p;try{r=p.stateNode,u?(s=r.style,typeof s.setProperty=="function"?s.setProperty("display","none","important"):s.display="none"):(o=p.stateNode,l=p.memoizedProps.style,a=l!=null&&l.hasOwnProperty("display")?l.display:null,o.style.display=Ym("display",a))}catch(S){vt(t,t.return,S)}}}else if(p.tag===6){if(h===null)try{p.stateNode.nodeValue=u?"":p.memoizedProps}catch(S){vt(t,t.return,S)}}else if((p.tag!==22&&p.tag!==23||p.memoizedState===null||p===t)&&p.child!==null){p.child.return=p,p=p.child;continue}if(p===t)break e;for(;p.sibling===null;){if(p.return===null||p.return===t)break e;h===p&&(h=null),p=p.return}h===p&&(h=null),p.sibling.return=p.return,p=p.sibling}}break;case 19:Rn(e,t),jn(t),i&4&&op(t);break;case 21:break;default:Rn(e,t),jn(t)}}function jn(t){var e=t.flags;if(e&2){try{e:{for(var n=t.return;n!==null;){if(Sg(n)){var i=n;break e}n=n.return}throw Error(ie(160))}switch(i.tag){case 5:var r=i.stateNode;i.flags&32&&(pa(r,""),i.flags&=-33);var s=ap(t);Wu(t,s,r);break;case 3:case 4:var a=i.stateNode.containerInfo,o=ap(t);Gu(t,o,a);break;default:throw Error(ie(161))}}catch(l){vt(t,t.return,l)}t.flags&=-3}e&4096&&(t.flags&=-4097)}function V_(t,e,n){ge=t,Eg(t)}function Eg(t,e,n){for(var i=(t.mode&1)!==0;ge!==null;){var r=ge,s=r.child;if(r.tag===22&&i){var a=r.memoizedState!==null||oo;if(!a){var o=r.alternate,l=o!==null&&o.memoizedState!==null||Bt;o=oo;var u=Bt;if(oo=a,(Bt=l)&&!u)for(ge=r;ge!==null;)a=ge,l=a.child,a.tag===22&&a.memoizedState!==null?up(r):l!==null?(l.return=a,ge=l):up(r);for(;s!==null;)ge=s,Eg(s),s=s.sibling;ge=r,oo=o,Bt=u}lp(t)}else r.subtreeFlags&8772&&s!==null?(s.return=r,ge=s):lp(t)}}function lp(t){for(;ge!==null;){var e=ge;if(e.flags&8772){var n=e.alternate;try{if(e.flags&8772)switch(e.tag){case 0:case 11:case 15:Bt||Ul(5,e);break;case 1:var i=e.stateNode;if(e.flags&4&&!Bt)if(n===null)i.componentDidMount();else{var r=e.elementType===e.type?n.memoizedProps:Dn(e.type,n.memoizedProps);i.componentDidUpdate(r,n.memoizedState,i.__reactInternalSnapshotBeforeUpdate)}var s=e.updateQueue;s!==null&&Xf(e,s,i);break;case 3:var a=e.updateQueue;if(a!==null){if(n=null,e.child!==null)switch(e.child.tag){case 5:n=e.child.stateNode;break;case 1:n=e.child.stateNode}Xf(e,a,n)}break;case 5:var o=e.stateNode;if(n===null&&e.flags&4){n=o;var l=e.memoizedProps;switch(e.type){case"button":case"input":case"select":case"textarea":l.autoFocus&&n.focus();break;case"img":l.src&&(n.src=l.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(e.memoizedState===null){var u=e.alternate;if(u!==null){var h=u.memoizedState;if(h!==null){var p=h.dehydrated;p!==null&&va(p)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(ie(163))}Bt||e.flags&512&&Vu(e)}catch(f){vt(e,e.return,f)}}if(e===t){ge=null;break}if(n=e.sibling,n!==null){n.return=e.return,ge=n;break}ge=e.return}}function cp(t){for(;ge!==null;){var e=ge;if(e===t){ge=null;break}var n=e.sibling;if(n!==null){n.return=e.return,ge=n;break}ge=e.return}}function up(t){for(;ge!==null;){var e=ge;try{switch(e.tag){case 0:case 11:case 15:var n=e.return;try{Ul(4,e)}catch(l){vt(e,n,l)}break;case 1:var i=e.stateNode;if(typeof i.componentDidMount=="function"){var r=e.return;try{i.componentDidMount()}catch(l){vt(e,r,l)}}var s=e.return;try{Vu(e)}catch(l){vt(e,s,l)}break;case 5:var a=e.return;try{Vu(e)}catch(l){vt(e,a,l)}}}catch(l){vt(e,e.return,l)}if(e===t){ge=null;break}var o=e.sibling;if(o!==null){o.return=e.return,ge=o;break}ge=e.return}}var G_=Math.ceil,vl=xi.ReactCurrentDispatcher,Th=xi.ReactCurrentOwner,En=xi.ReactCurrentBatchConfig,qe=0,Nt=null,Mt=null,kt=0,un=0,is=Ki(0),bt=0,Ra=null,Er=0,Fl=0,Ah=0,ca=null,Qt=null,Ch=0,ys=1/0,ri=null,_l=!1,Xu=null,Bi=null,lo=!1,ki=null,yl=0,ua=0,qu=null,Vo=-1,Go=0;function Gt(){return qe&6?yt():Vo!==-1?Vo:Vo=yt()}function ji(t){return t.mode&1?qe&2&&kt!==0?kt&-kt:A_.transition!==null?(Go===0&&(Go=l0()),Go):(t=it,t!==0||(t=window.event,t=t===void 0?16:m0(t.type)),t):1}function zn(t,e,n,i){if(50<ua)throw ua=0,qu=null,Error(ie(185));Ia(t,n,i),(!(qe&2)||t!==Nt)&&(t===Nt&&(!(qe&2)&&(Fl|=n),bt===4&&Pi(t,kt)),rn(t,i),n===1&&qe===0&&!(e.mode&1)&&(ys=yt()+500,Dl&&Zi()))}function rn(t,e){var n=t.callbackNode;Av(t,e);var i=il(t,t===Nt?kt:0);if(i===0)n!==null&&_f(n),t.callbackNode=null,t.callbackPriority=0;else if(e=i&-i,t.callbackPriority!==e){if(n!=null&&_f(n),e===1)t.tag===0?T_(dp.bind(null,t)):k0(dp.bind(null,t)),w_(function(){!(qe&6)&&Zi()}),n=null;else{switch(c0(i)){case 1:n=eh;break;case 4:n=a0;break;case 16:n=nl;break;case 536870912:n=o0;break;default:n=nl}n=Lg(n,bg.bind(null,t))}t.callbackPriority=e,t.callbackNode=n}}function bg(t,e){if(Vo=-1,Go=0,qe&6)throw Error(ie(327));var n=t.callbackNode;if(us()&&t.callbackNode!==n)return null;var i=il(t,t===Nt?kt:0);if(i===0)return null;if(i&30||i&t.expiredLanes||e)e=Sl(t,i);else{e=i;var r=qe;qe|=2;var s=Ag();(Nt!==t||kt!==e)&&(ri=null,ys=yt()+500,vr(t,e));do try{q_();break}catch(o){Tg(t,o)}while(!0);fh(),vl.current=s,qe=r,Mt!==null?e=0:(Nt=null,kt=0,e=bt)}if(e!==0){if(e===2&&(r=yu(t),r!==0&&(i=r,e=$u(t,r))),e===1)throw n=Ra,vr(t,0),Pi(t,i),rn(t,yt()),n;if(e===6)Pi(t,i);else{if(r=t.current.alternate,!(i&30)&&!W_(r)&&(e=Sl(t,i),e===2&&(s=yu(t),s!==0&&(i=s,e=$u(t,s))),e===1))throw n=Ra,vr(t,0),Pi(t,i),rn(t,yt()),n;switch(t.finishedWork=r,t.finishedLanes=i,e){case 0:case 1:throw Error(ie(345));case 2:or(t,Qt,ri);break;case 3:if(Pi(t,i),(i&130023424)===i&&(e=Ch+500-yt(),10<e)){if(il(t,0)!==0)break;if(r=t.suspendedLanes,(r&i)!==i){Gt(),t.pingedLanes|=t.suspendedLanes&r;break}t.timeoutHandle=Cu(or.bind(null,t,Qt,ri),e);break}or(t,Qt,ri);break;case 4:if(Pi(t,i),(i&4194240)===i)break;for(e=t.eventTimes,r=-1;0<i;){var a=31-On(i);s=1<<a,a=e[a],a>r&&(r=a),i&=~s}if(i=r,i=yt()-i,i=(120>i?120:480>i?480:1080>i?1080:1920>i?1920:3e3>i?3e3:4320>i?4320:1960*G_(i/1960))-i,10<i){t.timeoutHandle=Cu(or.bind(null,t,Qt,ri),i);break}or(t,Qt,ri);break;case 5:or(t,Qt,ri);break;default:throw Error(ie(329))}}}return rn(t,yt()),t.callbackNode===n?bg.bind(null,t):null}function $u(t,e){var n=ca;return t.current.memoizedState.isDehydrated&&(vr(t,e).flags|=256),t=Sl(t,e),t!==2&&(e=Qt,Qt=n,e!==null&&Yu(e)),t}function Yu(t){Qt===null?Qt=t:Qt.push.apply(Qt,t)}function W_(t){for(var e=t;;){if(e.flags&16384){var n=e.updateQueue;if(n!==null&&(n=n.stores,n!==null))for(var i=0;i<n.length;i++){var r=n[i],s=r.getSnapshot;r=r.value;try{if(!Bn(s(),r))return!1}catch{return!1}}}if(n=e.child,e.subtreeFlags&16384&&n!==null)n.return=e,e=n;else{if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return!0;e=e.return}e.sibling.return=e.return,e=e.sibling}}return!0}function Pi(t,e){for(e&=~Ah,e&=~Fl,t.suspendedLanes|=e,t.pingedLanes&=~e,t=t.expirationTimes;0<e;){var n=31-On(e),i=1<<n;t[n]=-1,e&=~i}}function dp(t){if(qe&6)throw Error(ie(327));us();var e=il(t,0);if(!(e&1))return rn(t,yt()),null;var n=Sl(t,e);if(t.tag!==0&&n===2){var i=yu(t);i!==0&&(e=i,n=$u(t,i))}if(n===1)throw n=Ra,vr(t,0),Pi(t,e),rn(t,yt()),n;if(n===6)throw Error(ie(345));return t.finishedWork=t.current.alternate,t.finishedLanes=e,or(t,Qt,ri),rn(t,yt()),null}function Rh(t,e){var n=qe;qe|=1;try{return t(e)}finally{qe=n,qe===0&&(ys=yt()+500,Dl&&Zi())}}function br(t){ki!==null&&ki.tag===0&&!(qe&6)&&us();var e=qe;qe|=1;var n=En.transition,i=it;try{if(En.transition=null,it=1,t)return t()}finally{it=i,En.transition=n,qe=e,!(qe&6)&&Zi()}}function Nh(){un=is.current,dt(is)}function vr(t,e){t.finishedWork=null,t.finishedLanes=0;var n=t.timeoutHandle;if(n!==-1&&(t.timeoutHandle=-1,S_(n)),Mt!==null)for(n=Mt.return;n!==null;){var i=n;switch(uh(i),i.tag){case 1:i=i.type.childContextTypes,i!=null&&ll();break;case 3:vs(),dt(tn),dt(jt),_h();break;case 5:vh(i);break;case 4:vs();break;case 13:dt(pt);break;case 19:dt(pt);break;case 10:ph(i.type._context);break;case 22:case 23:Nh()}n=n.return}if(Nt=t,Mt=t=Hi(t.current,null),kt=un=e,bt=0,Ra=null,Ah=Fl=Er=0,Qt=ca=null,fr!==null){for(e=0;e<fr.length;e++)if(n=fr[e],i=n.interleaved,i!==null){n.interleaved=null;var r=i.next,s=n.pending;if(s!==null){var a=s.next;s.next=r,i.next=a}n.pending=i}fr=null}return t}function Tg(t,e){do{var n=Mt;try{if(fh(),Bo.current=xl,gl){for(var i=mt.memoizedState;i!==null;){var r=i.queue;r!==null&&(r.pending=null),i=i.next}gl=!1}if(Mr=0,Rt=Et=mt=null,oa=!1,Ta=0,Th.current=null,n===null||n.return===null){bt=1,Ra=e,Mt=null;break}e:{var s=t,a=n.return,o=n,l=e;if(e=kt,o.flags|=32768,l!==null&&typeof l=="object"&&typeof l.then=="function"){var u=l,h=o,p=h.tag;if(!(h.mode&1)&&(p===0||p===11||p===15)){var f=h.alternate;f?(h.updateQueue=f.updateQueue,h.memoizedState=f.memoizedState,h.lanes=f.lanes):(h.updateQueue=null,h.memoizedState=null)}var g=Qf(a);if(g!==null){g.flags&=-257,Jf(g,a,o,s,e),g.mode&1&&Zf(s,u,e),e=g,l=u;var v=e.updateQueue;if(v===null){var S=new Set;S.add(l),e.updateQueue=S}else v.add(l);break e}else{if(!(e&1)){Zf(s,u,e),Ph();break e}l=Error(ie(426))}}else if(ft&&o.mode&1){var m=Qf(a);if(m!==null){!(m.flags&65536)&&(m.flags|=256),Jf(m,a,o,s,e),dh(_s(l,o));break e}}s=l=_s(l,o),bt!==4&&(bt=2),ca===null?ca=[s]:ca.push(s),s=a;do{switch(s.tag){case 3:s.flags|=65536,e&=-e,s.lanes|=e;var d=cg(s,l,e);Wf(s,d);break e;case 1:o=l;var _=s.type,x=s.stateNode;if(!(s.flags&128)&&(typeof _.getDerivedStateFromError=="function"||x!==null&&typeof x.componentDidCatch=="function"&&(Bi===null||!Bi.has(x)))){s.flags|=65536,e&=-e,s.lanes|=e;var M=ug(s,o,e);Wf(s,M);break e}}s=s.return}while(s!==null)}Rg(n)}catch(P){e=P,Mt===n&&n!==null&&(Mt=n=n.return);continue}break}while(!0)}function Ag(){var t=vl.current;return vl.current=xl,t===null?xl:t}function Ph(){(bt===0||bt===3||bt===2)&&(bt=4),Nt===null||!(Er&268435455)&&!(Fl&268435455)||Pi(Nt,kt)}function Sl(t,e){var n=qe;qe|=2;var i=Ag();(Nt!==t||kt!==e)&&(ri=null,vr(t,e));do try{X_();break}catch(r){Tg(t,r)}while(!0);if(fh(),qe=n,vl.current=i,Mt!==null)throw Error(ie(261));return Nt=null,kt=0,bt}function X_(){for(;Mt!==null;)Cg(Mt)}function q_(){for(;Mt!==null&&!vv();)Cg(Mt)}function Cg(t){var e=Pg(t.alternate,t,un);t.memoizedProps=t.pendingProps,e===null?Rg(t):Mt=e,Th.current=null}function Rg(t){var e=t;do{var n=e.alternate;if(t=e.return,e.flags&32768){if(n=B_(n,e),n!==null){n.flags&=32767,Mt=n;return}if(t!==null)t.flags|=32768,t.subtreeFlags=0,t.deletions=null;else{bt=6,Mt=null;return}}else if(n=z_(n,e,un),n!==null){Mt=n;return}if(e=e.sibling,e!==null){Mt=e;return}Mt=e=t}while(e!==null);bt===0&&(bt=5)}function or(t,e,n){var i=it,r=En.transition;try{En.transition=null,it=1,$_(t,e,n,i)}finally{En.transition=r,it=i}return null}function $_(t,e,n,i){do us();while(ki!==null);if(qe&6)throw Error(ie(327));n=t.finishedWork;var r=t.finishedLanes;if(n===null)return null;if(t.finishedWork=null,t.finishedLanes=0,n===t.current)throw Error(ie(177));t.callbackNode=null,t.callbackPriority=0;var s=n.lanes|n.childLanes;if(Cv(t,s),t===Nt&&(Mt=Nt=null,kt=0),!(n.subtreeFlags&2064)&&!(n.flags&2064)||lo||(lo=!0,Lg(nl,function(){return us(),null})),s=(n.flags&15990)!==0,n.subtreeFlags&15990||s){s=En.transition,En.transition=null;var a=it;it=1;var o=qe;qe|=4,Th.current=null,H_(t,n),Mg(n,t),p_(Tu),rl=!!bu,Tu=bu=null,t.current=n,V_(n),_v(),qe=o,it=a,En.transition=s}else t.current=n;if(lo&&(lo=!1,ki=t,yl=r),s=t.pendingLanes,s===0&&(Bi=null),wv(n.stateNode),rn(t,yt()),e!==null)for(i=t.onRecoverableError,n=0;n<e.length;n++)r=e[n],i(r.value,{componentStack:r.stack,digest:r.digest});if(_l)throw _l=!1,t=Xu,Xu=null,t;return yl&1&&t.tag!==0&&us(),s=t.pendingLanes,s&1?t===qu?ua++:(ua=0,qu=t):ua=0,Zi(),null}function us(){if(ki!==null){var t=c0(yl),e=En.transition,n=it;try{if(En.transition=null,it=16>t?16:t,ki===null)var i=!1;else{if(t=ki,ki=null,yl=0,qe&6)throw Error(ie(331));var r=qe;for(qe|=4,ge=t.current;ge!==null;){var s=ge,a=s.child;if(ge.flags&16){var o=s.deletions;if(o!==null){for(var l=0;l<o.length;l++){var u=o[l];for(ge=u;ge!==null;){var h=ge;switch(h.tag){case 0:case 11:case 15:la(8,h,s)}var p=h.child;if(p!==null)p.return=h,ge=p;else for(;ge!==null;){h=ge;var f=h.sibling,g=h.return;if(yg(h),h===u){ge=null;break}if(f!==null){f.return=g,ge=f;break}ge=g}}}var v=s.alternate;if(v!==null){var S=v.child;if(S!==null){v.child=null;do{var m=S.sibling;S.sibling=null,S=m}while(S!==null)}}ge=s}}if(s.subtreeFlags&2064&&a!==null)a.return=s,ge=a;else e:for(;ge!==null;){if(s=ge,s.flags&2048)switch(s.tag){case 0:case 11:case 15:la(9,s,s.return)}var d=s.sibling;if(d!==null){d.return=s.return,ge=d;break e}ge=s.return}}var _=t.current;for(ge=_;ge!==null;){a=ge;var x=a.child;if(a.subtreeFlags&2064&&x!==null)x.return=a,ge=x;else e:for(a=_;ge!==null;){if(o=ge,o.flags&2048)try{switch(o.tag){case 0:case 11:case 15:Ul(9,o)}}catch(P){vt(o,o.return,P)}if(o===a){ge=null;break e}var M=o.sibling;if(M!==null){M.return=o.return,ge=M;break e}ge=o.return}}if(qe=r,Zi(),$n&&typeof $n.onPostCommitFiberRoot=="function")try{$n.onPostCommitFiberRoot(Cl,t)}catch{}i=!0}return i}finally{it=n,En.transition=e}}return!1}function hp(t,e,n){e=_s(n,e),e=cg(t,e,1),t=zi(t,e,1),e=Gt(),t!==null&&(Ia(t,1,e),rn(t,e))}function vt(t,e,n){if(t.tag===3)hp(t,t,n);else for(;e!==null;){if(e.tag===3){hp(e,t,n);break}else if(e.tag===1){var i=e.stateNode;if(typeof e.type.getDerivedStateFromError=="function"||typeof i.componentDidCatch=="function"&&(Bi===null||!Bi.has(i))){t=_s(n,t),t=ug(e,t,1),e=zi(e,t,1),t=Gt(),e!==null&&(Ia(e,1,t),rn(e,t));break}}e=e.return}}function Y_(t,e,n){var i=t.pingCache;i!==null&&i.delete(e),e=Gt(),t.pingedLanes|=t.suspendedLanes&n,Nt===t&&(kt&n)===n&&(bt===4||bt===3&&(kt&130023424)===kt&&500>yt()-Ch?vr(t,0):Ah|=n),rn(t,e)}function Ng(t,e){e===0&&(t.mode&1?(e=Qa,Qa<<=1,!(Qa&130023424)&&(Qa=4194304)):e=1);var n=Gt();t=fi(t,e),t!==null&&(Ia(t,e,n),rn(t,n))}function K_(t){var e=t.memoizedState,n=0;e!==null&&(n=e.retryLane),Ng(t,n)}function Z_(t,e){var n=0;switch(t.tag){case 13:var i=t.stateNode,r=t.memoizedState;r!==null&&(n=r.retryLane);break;case 19:i=t.stateNode;break;default:throw Error(ie(314))}i!==null&&i.delete(e),Ng(t,n)}var Pg;Pg=function(t,e,n){if(t!==null)if(t.memoizedProps!==e.pendingProps||tn.current)en=!0;else{if(!(t.lanes&n)&&!(e.flags&128))return en=!1,O_(t,e,n);en=!!(t.flags&131072)}else en=!1,ft&&e.flags&1048576&&I0(e,dl,e.index);switch(e.lanes=0,e.tag){case 2:var i=e.type;Ho(t,e),t=e.pendingProps;var r=ms(e,jt.current);cs(e,n),r=Sh(null,e,i,t,r,n);var s=wh();return e.flags|=1,typeof r=="object"&&r!==null&&typeof r.render=="function"&&r.$$typeof===void 0?(e.tag=1,e.memoizedState=null,e.updateQueue=null,nn(i)?(s=!0,cl(e)):s=!1,e.memoizedState=r.state!==null&&r.state!==void 0?r.state:null,gh(e),r.updater=Il,e.stateNode=r,r._reactInternals=e,Iu(e,i,t,n),e=Ou(null,e,i,!0,s,n)):(e.tag=0,ft&&s&&ch(e),Vt(null,e,r,n),e=e.child),e;case 16:i=e.elementType;e:{switch(Ho(t,e),t=e.pendingProps,r=i._init,i=r(i._payload),e.type=i,r=e.tag=J_(i),t=Dn(i,t),r){case 0:e=Fu(null,e,i,t,n);break e;case 1:e=np(null,e,i,t,n);break e;case 11:e=ep(null,e,i,t,n);break e;case 14:e=tp(null,e,i,Dn(i.type,t),n);break e}throw Error(ie(306,i,""))}return e;case 0:return i=e.type,r=e.pendingProps,r=e.elementType===i?r:Dn(i,r),Fu(t,e,i,r,n);case 1:return i=e.type,r=e.pendingProps,r=e.elementType===i?r:Dn(i,r),np(t,e,i,r,n);case 3:e:{if(pg(e),t===null)throw Error(ie(387));i=e.pendingProps,s=e.memoizedState,r=s.element,j0(t,e),pl(e,i,null,n);var a=e.memoizedState;if(i=a.element,s.isDehydrated)if(s={element:i,isDehydrated:!1,cache:a.cache,pendingSuspenseBoundaries:a.pendingSuspenseBoundaries,transitions:a.transitions},e.updateQueue.baseState=s,e.memoizedState=s,e.flags&256){r=_s(Error(ie(423)),e),e=ip(t,e,i,n,r);break e}else if(i!==r){r=_s(Error(ie(424)),e),e=ip(t,e,i,n,r);break e}else for(hn=Oi(e.stateNode.containerInfo.firstChild),fn=e,ft=!0,In=null,n=z0(e,null,i,n),e.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling;else{if(gs(),i===r){e=pi(t,e,n);break e}Vt(t,e,i,n)}e=e.child}return e;case 5:return H0(e),t===null&&Lu(e),i=e.type,r=e.pendingProps,s=t!==null?t.memoizedProps:null,a=r.children,Au(i,r)?a=null:s!==null&&Au(i,s)&&(e.flags|=32),fg(t,e),Vt(t,e,a,n),e.child;case 6:return t===null&&Lu(e),null;case 13:return mg(t,e,n);case 4:return xh(e,e.stateNode.containerInfo),i=e.pendingProps,t===null?e.child=xs(e,null,i,n):Vt(t,e,i,n),e.child;case 11:return i=e.type,r=e.pendingProps,r=e.elementType===i?r:Dn(i,r),ep(t,e,i,r,n);case 7:return Vt(t,e,e.pendingProps,n),e.child;case 8:return Vt(t,e,e.pendingProps.children,n),e.child;case 12:return Vt(t,e,e.pendingProps.children,n),e.child;case 10:e:{if(i=e.type._context,r=e.pendingProps,s=e.memoizedProps,a=r.value,ot(hl,i._currentValue),i._currentValue=a,s!==null)if(Bn(s.value,a)){if(s.children===r.children&&!tn.current){e=pi(t,e,n);break e}}else for(s=e.child,s!==null&&(s.return=e);s!==null;){var o=s.dependencies;if(o!==null){a=s.child;for(var l=o.firstContext;l!==null;){if(l.context===i){if(s.tag===1){l=ui(-1,n&-n),l.tag=2;var u=s.updateQueue;if(u!==null){u=u.shared;var h=u.pending;h===null?l.next=l:(l.next=h.next,h.next=l),u.pending=l}}s.lanes|=n,l=s.alternate,l!==null&&(l.lanes|=n),Du(s.return,n,e),o.lanes|=n;break}l=l.next}}else if(s.tag===10)a=s.type===e.type?null:s.child;else if(s.tag===18){if(a=s.return,a===null)throw Error(ie(341));a.lanes|=n,o=a.alternate,o!==null&&(o.lanes|=n),Du(a,n,e),a=s.sibling}else a=s.child;if(a!==null)a.return=s;else for(a=s;a!==null;){if(a===e){a=null;break}if(s=a.sibling,s!==null){s.return=a.return,a=s;break}a=a.return}s=a}Vt(t,e,r.children,n),e=e.child}return e;case 9:return r=e.type,i=e.pendingProps.children,cs(e,n),r=Tn(r),i=i(r),e.flags|=1,Vt(t,e,i,n),e.child;case 14:return i=e.type,r=Dn(i,e.pendingProps),r=Dn(i.type,r),tp(t,e,i,r,n);case 15:return dg(t,e,e.type,e.pendingProps,n);case 17:return i=e.type,r=e.pendingProps,r=e.elementType===i?r:Dn(i,r),Ho(t,e),e.tag=1,nn(i)?(t=!0,cl(e)):t=!1,cs(e,n),lg(e,i,r),Iu(e,i,r,n),Ou(null,e,i,!0,t,n);case 19:return gg(t,e,n);case 22:return hg(t,e,n)}throw Error(ie(156,e.tag))};function Lg(t,e){return s0(t,e)}function Q_(t,e,n,i){this.tag=t,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=e,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=i,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function wn(t,e,n,i){return new Q_(t,e,n,i)}function Lh(t){return t=t.prototype,!(!t||!t.isReactComponent)}function J_(t){if(typeof t=="function")return Lh(t)?1:0;if(t!=null){if(t=t.$$typeof,t===Zd)return 11;if(t===Qd)return 14}return 2}function Hi(t,e){var n=t.alternate;return n===null?(n=wn(t.tag,e,t.key,t.mode),n.elementType=t.elementType,n.type=t.type,n.stateNode=t.stateNode,n.alternate=t,t.alternate=n):(n.pendingProps=e,n.type=t.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=t.flags&14680064,n.childLanes=t.childLanes,n.lanes=t.lanes,n.child=t.child,n.memoizedProps=t.memoizedProps,n.memoizedState=t.memoizedState,n.updateQueue=t.updateQueue,e=t.dependencies,n.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext},n.sibling=t.sibling,n.index=t.index,n.ref=t.ref,n}function Wo(t,e,n,i,r,s){var a=2;if(i=t,typeof t=="function")Lh(t)&&(a=1);else if(typeof t=="string")a=5;else e:switch(t){case qr:return _r(n.children,r,s,e);case Kd:a=8,r|=8;break;case su:return t=wn(12,n,e,r|2),t.elementType=su,t.lanes=s,t;case au:return t=wn(13,n,e,r),t.elementType=au,t.lanes=s,t;case ou:return t=wn(19,n,e,r),t.elementType=ou,t.lanes=s,t;case Hm:return Ol(n,r,s,e);default:if(typeof t=="object"&&t!==null)switch(t.$$typeof){case Bm:a=10;break e;case jm:a=9;break e;case Zd:a=11;break e;case Qd:a=14;break e;case Ci:a=16,i=null;break e}throw Error(ie(130,t==null?t:typeof t,""))}return e=wn(a,n,e,r),e.elementType=t,e.type=i,e.lanes=s,e}function _r(t,e,n,i){return t=wn(7,t,i,e),t.lanes=n,t}function Ol(t,e,n,i){return t=wn(22,t,i,e),t.elementType=Hm,t.lanes=n,t.stateNode={isHidden:!1},t}function Sc(t,e,n){return t=wn(6,t,null,e),t.lanes=n,t}function wc(t,e,n){return e=wn(4,t.children!==null?t.children:[],t.key,e),e.lanes=n,e.stateNode={containerInfo:t.containerInfo,pendingChildren:null,implementation:t.implementation},e}function ey(t,e,n,i,r){this.tag=e,this.containerInfo=t,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=nc(0),this.expirationTimes=nc(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=nc(0),this.identifierPrefix=i,this.onRecoverableError=r,this.mutableSourceEagerHydrationData=null}function Dh(t,e,n,i,r,s,a,o,l){return t=new ey(t,e,n,o,l),e===1?(e=1,s===!0&&(e|=8)):e=0,s=wn(3,null,null,e),t.current=s,s.stateNode=t,s.memoizedState={element:i,isDehydrated:n,cache:null,transitions:null,pendingSuspenseBoundaries:null},gh(s),t}function ty(t,e,n){var i=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:Xr,key:i==null?null:""+i,children:t,containerInfo:e,implementation:n}}function Dg(t){if(!t)return Xi;t=t._reactInternals;e:{if(Rr(t)!==t||t.tag!==1)throw Error(ie(170));var e=t;do{switch(e.tag){case 3:e=e.stateNode.context;break e;case 1:if(nn(e.type)){e=e.stateNode.__reactInternalMemoizedMergedChildContext;break e}}e=e.return}while(e!==null);throw Error(ie(171))}if(t.tag===1){var n=t.type;if(nn(n))return D0(t,n,e)}return e}function kg(t,e,n,i,r,s,a,o,l){return t=Dh(n,i,!0,t,r,s,a,o,l),t.context=Dg(null),n=t.current,i=Gt(),r=ji(n),s=ui(i,r),s.callback=e??null,zi(n,s,r),t.current.lanes=r,Ia(t,r,i),rn(t,i),t}function zl(t,e,n,i){var r=e.current,s=Gt(),a=ji(r);return n=Dg(n),e.context===null?e.context=n:e.pendingContext=n,e=ui(s,a),e.payload={element:t},i=i===void 0?null:i,i!==null&&(e.callback=i),t=zi(r,e,a),t!==null&&(zn(t,r,a,s),zo(t,r,a)),a}function wl(t){if(t=t.current,!t.child)return null;switch(t.child.tag){case 5:return t.child.stateNode;default:return t.child.stateNode}}function fp(t,e){if(t=t.memoizedState,t!==null&&t.dehydrated!==null){var n=t.retryLane;t.retryLane=n!==0&&n<e?n:e}}function kh(t,e){fp(t,e),(t=t.alternate)&&fp(t,e)}function ny(){return null}var Ig=typeof reportError=="function"?reportError:function(t){console.error(t)};function Ih(t){this._internalRoot=t}Bl.prototype.render=Ih.prototype.render=function(t){var e=this._internalRoot;if(e===null)throw Error(ie(409));zl(t,e,null,null)};Bl.prototype.unmount=Ih.prototype.unmount=function(){var t=this._internalRoot;if(t!==null){this._internalRoot=null;var e=t.containerInfo;br(function(){zl(null,t,null,null)}),e[hi]=null}};function Bl(t){this._internalRoot=t}Bl.prototype.unstable_scheduleHydration=function(t){if(t){var e=h0();t={blockedOn:null,target:t,priority:e};for(var n=0;n<Ni.length&&e!==0&&e<Ni[n].priority;n++);Ni.splice(n,0,t),n===0&&p0(t)}};function Uh(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)}function jl(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11&&(t.nodeType!==8||t.nodeValue!==" react-mount-point-unstable "))}function pp(){}function iy(t,e,n,i,r){if(r){if(typeof i=="function"){var s=i;i=function(){var u=wl(a);s.call(u)}}var a=kg(e,i,t,0,null,!1,!1,"",pp);return t._reactRootContainer=a,t[hi]=a.current,Sa(t.nodeType===8?t.parentNode:t),br(),a}for(;r=t.lastChild;)t.removeChild(r);if(typeof i=="function"){var o=i;i=function(){var u=wl(l);o.call(u)}}var l=Dh(t,0,!1,null,null,!1,!1,"",pp);return t._reactRootContainer=l,t[hi]=l.current,Sa(t.nodeType===8?t.parentNode:t),br(function(){zl(e,l,n,i)}),l}function Hl(t,e,n,i,r){var s=n._reactRootContainer;if(s){var a=s;if(typeof r=="function"){var o=r;r=function(){var l=wl(a);o.call(l)}}zl(e,a,t,r)}else a=iy(n,e,t,r,i);return wl(a)}u0=function(t){switch(t.tag){case 3:var e=t.stateNode;if(e.current.memoizedState.isDehydrated){var n=Qs(e.pendingLanes);n!==0&&(th(e,n|1),rn(e,yt()),!(qe&6)&&(ys=yt()+500,Zi()))}break;case 13:br(function(){var i=fi(t,1);if(i!==null){var r=Gt();zn(i,t,1,r)}}),kh(t,1)}};nh=function(t){if(t.tag===13){var e=fi(t,134217728);if(e!==null){var n=Gt();zn(e,t,134217728,n)}kh(t,134217728)}};d0=function(t){if(t.tag===13){var e=ji(t),n=fi(t,e);if(n!==null){var i=Gt();zn(n,t,e,i)}kh(t,e)}};h0=function(){return it};f0=function(t,e){var n=it;try{return it=t,e()}finally{it=n}};xu=function(t,e,n){switch(e){case"input":if(uu(t,n),e=n.name,n.type==="radio"&&e!=null){for(n=t;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll("input[name="+JSON.stringify(""+e)+'][type="radio"]'),e=0;e<n.length;e++){var i=n[e];if(i!==t&&i.form===t.form){var r=Ll(i);if(!r)throw Error(ie(90));Gm(i),uu(i,r)}}}break;case"textarea":Xm(t,n);break;case"select":e=n.value,e!=null&&ss(t,!!n.multiple,e,!1)}};Jm=Rh;e0=br;var ry={usingClientEntryPoint:!1,Events:[Fa,Zr,Ll,Zm,Qm,Rh]},Hs={findFiberByHostInstance:hr,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},sy={bundleType:Hs.bundleType,version:Hs.version,rendererPackageName:Hs.rendererPackageName,rendererConfig:Hs.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:xi.ReactCurrentDispatcher,findHostInstanceByFiber:function(t){return t=i0(t),t===null?null:t.stateNode},findFiberByHostInstance:Hs.findFiberByHostInstance||ny,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var co=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!co.isDisabled&&co.supportsFiber)try{Cl=co.inject(sy),$n=co}catch{}}mn.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=ry;mn.createPortal=function(t,e){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!Uh(e))throw Error(ie(200));return ty(t,e,null,n)};mn.createRoot=function(t,e){if(!Uh(t))throw Error(ie(299));var n=!1,i="",r=Ig;return e!=null&&(e.unstable_strictMode===!0&&(n=!0),e.identifierPrefix!==void 0&&(i=e.identifierPrefix),e.onRecoverableError!==void 0&&(r=e.onRecoverableError)),e=Dh(t,1,!1,null,null,n,!1,i,r),t[hi]=e.current,Sa(t.nodeType===8?t.parentNode:t),new Ih(e)};mn.findDOMNode=function(t){if(t==null)return null;if(t.nodeType===1)return t;var e=t._reactInternals;if(e===void 0)throw typeof t.render=="function"?Error(ie(188)):(t=Object.keys(t).join(","),Error(ie(268,t)));return t=i0(e),t=t===null?null:t.stateNode,t};mn.flushSync=function(t){return br(t)};mn.hydrate=function(t,e,n){if(!jl(e))throw Error(ie(200));return Hl(null,t,e,!0,n)};mn.hydrateRoot=function(t,e,n){if(!Uh(t))throw Error(ie(405));var i=n!=null&&n.hydratedSources||null,r=!1,s="",a=Ig;if(n!=null&&(n.unstable_strictMode===!0&&(r=!0),n.identifierPrefix!==void 0&&(s=n.identifierPrefix),n.onRecoverableError!==void 0&&(a=n.onRecoverableError)),e=kg(e,null,t,1,n??null,r,!1,s,a),t[hi]=e.current,Sa(t),i)for(t=0;t<i.length;t++)n=i[t],r=n._getVersion,r=r(n._source),e.mutableSourceEagerHydrationData==null?e.mutableSourceEagerHydrationData=[n,r]:e.mutableSourceEagerHydrationData.push(n,r);return new Bl(e)};mn.render=function(t,e,n){if(!jl(e))throw Error(ie(200));return Hl(null,t,e,!1,n)};mn.unmountComponentAtNode=function(t){if(!jl(t))throw Error(ie(40));return t._reactRootContainer?(br(function(){Hl(null,null,t,!1,function(){t._reactRootContainer=null,t[hi]=null})}),!0):!1};mn.unstable_batchedUpdates=Rh;mn.unstable_renderSubtreeIntoContainer=function(t,e,n,i){if(!jl(n))throw Error(ie(200));if(t==null||t._reactInternals===void 0)throw Error(ie(38));return Hl(t,e,n,!1,i)};mn.version="18.3.1-next-f1338f8080-20240426";function Ug(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Ug)}catch(t){console.error(t)}}Ug(),Um.exports=mn;var ay=Um.exports,mp=ay;iu.createRoot=mp.createRoot,iu.hydrateRoot=mp.hydrateRoot;var gp="1.3.26";function Fg(t,e,n){return Math.max(t,Math.min(e,n))}function oy(t,e,n){return(1-n)*t+n*e}function ly(t,e,n,i){return oy(t,e,1-Math.exp(-n*i))}function cy(t,e){return(t%e+e)%e}var uy=class{constructor(){Se(this,"isRunning",!1);Se(this,"value",0);Se(this,"from",0);Se(this,"to",0);Se(this,"currentTime",0);Se(this,"lerp");Se(this,"duration");Se(this,"easing");Se(this,"onUpdate")}advance(t){var n;if(!this.isRunning)return;let e=!1;if(this.duration&&this.easing){this.currentTime+=t;const i=Fg(0,this.currentTime/this.duration,1);e=i>=1;const r=e?1:this.easing(i);this.value=this.from+(this.to-this.from)*r}else this.lerp?(this.value=ly(this.value,this.to,this.lerp*60,t),Math.round(this.value)===Math.round(this.to)&&(this.value=this.to,e=!0)):(this.value=this.to,e=!0);e&&this.stop(),(n=this.onUpdate)==null||n.call(this,this.value,e)}stop(){this.isRunning=!1}fromTo(t,e,{lerp:n,duration:i,easing:r,onStart:s,onUpdate:a}){this.from=this.value=t,this.to=e,this.lerp=n,this.duration=i,this.easing=r,this.currentTime=0,this.isRunning=!0,s==null||s(),this.onUpdate=a}};function dy(t,e){let n;return function(...i){clearTimeout(n),n=setTimeout(()=>{n=void 0,t.apply(this,i)},e)}}var hy=class{constructor(t,e,{autoResize:n=!0,debounce:i=250}={}){Se(this,"width",0);Se(this,"height",0);Se(this,"scrollHeight",0);Se(this,"scrollWidth",0);Se(this,"debouncedResize");Se(this,"wrapperResizeObserver");Se(this,"contentResizeObserver");Se(this,"resize",()=>{this.onWrapperResize(),this.onContentResize()});Se(this,"onWrapperResize",()=>{this.wrapper instanceof Window?(this.width=window.innerWidth,this.height=window.innerHeight):(this.width=this.wrapper.clientWidth,this.height=this.wrapper.clientHeight)});Se(this,"onContentResize",()=>{this.wrapper instanceof Window?(this.scrollHeight=this.content.scrollHeight,this.scrollWidth=this.content.scrollWidth):(this.scrollHeight=this.wrapper.scrollHeight,this.scrollWidth=this.wrapper.scrollWidth)});this.wrapper=t,this.content=e,n&&(this.debouncedResize=dy(this.resize,i),this.wrapper instanceof Window?window.addEventListener("resize",this.debouncedResize):(this.wrapperResizeObserver=new ResizeObserver(this.debouncedResize),this.wrapperResizeObserver.observe(this.wrapper)),this.contentResizeObserver=new ResizeObserver(this.debouncedResize),this.contentResizeObserver.observe(this.content)),this.resize()}destroy(){var t,e;(t=this.wrapperResizeObserver)==null||t.disconnect(),(e=this.contentResizeObserver)==null||e.disconnect(),this.wrapper===window&&this.debouncedResize&&window.removeEventListener("resize",this.debouncedResize)}get limit(){return{x:this.scrollWidth-this.width,y:this.scrollHeight-this.height}}},Og=class{constructor(){Se(this,"events",{})}emit(t,...e){var i;const n=this.events[t]||[];for(let r=0,s=n.length;r<s;r++)(i=n[r])==null||i.call(n,...e)}on(t,e){return this.events[t]?this.events[t].push(e):this.events[t]=[e],()=>{var n;this.events[t]=(n=this.events[t])==null?void 0:n.filter(i=>e!==i)}}off(t,e){var n;this.events[t]=(n=this.events[t])==null?void 0:n.filter(i=>e!==i)}destroy(){this.events={}}};const fy=100/6,Si={passive:!1};function xp(t,e){return t===1?fy:t===2?e:1}var py=class{constructor(t,e={wheelMultiplier:1,touchMultiplier:1}){Se(this,"touchStart",{x:0,y:0});Se(this,"lastDelta",{x:0,y:0});Se(this,"window",{width:0,height:0});Se(this,"emitter",new Og);Se(this,"onTouchStart",t=>{const{clientX:e,clientY:n}=t.targetTouches?t.targetTouches[0]:t;this.touchStart.x=e,this.touchStart.y=n,this.lastDelta={x:0,y:0},this.emitter.emit("scroll",{deltaX:0,deltaY:0,event:t})});Se(this,"onTouchMove",t=>{const{clientX:e,clientY:n}=t.targetTouches?t.targetTouches[0]:t,i=-(e-this.touchStart.x)*this.options.touchMultiplier,r=-(n-this.touchStart.y)*this.options.touchMultiplier;this.touchStart.x=e,this.touchStart.y=n,this.lastDelta={x:i,y:r},this.emitter.emit("scroll",{deltaX:i,deltaY:r,event:t})});Se(this,"onTouchEnd",t=>{this.emitter.emit("scroll",{deltaX:this.lastDelta.x,deltaY:this.lastDelta.y,event:t})});Se(this,"onWheel",t=>{let{deltaX:e,deltaY:n,deltaMode:i}=t;const r=xp(i,this.window.width),s=xp(i,this.window.height);e*=r,n*=s,e*=this.options.wheelMultiplier,n*=this.options.wheelMultiplier,this.emitter.emit("scroll",{deltaX:e,deltaY:n,event:t})});Se(this,"onWindowResize",()=>{this.window={width:window.innerWidth,height:window.innerHeight}});this.element=t,this.options=e,window.addEventListener("resize",this.onWindowResize),this.onWindowResize(),this.element.addEventListener("wheel",this.onWheel,Si),this.element.addEventListener("touchstart",this.onTouchStart,Si),this.element.addEventListener("touchmove",this.onTouchMove,Si),this.element.addEventListener("touchend",this.onTouchEnd,Si)}on(t,e){return this.emitter.on(t,e)}destroy(){this.emitter.destroy(),window.removeEventListener("resize",this.onWindowResize),this.element.removeEventListener("wheel",this.onWheel,Si),this.element.removeEventListener("touchstart",this.onTouchStart,Si),this.element.removeEventListener("touchmove",this.onTouchMove,Si),this.element.removeEventListener("touchend",this.onTouchEnd,Si)}};const vp=t=>Math.min(1,1.001-2**(-10*t));var my=class{constructor({wrapper:t=window,content:e=document.documentElement,eventsTarget:n=t,smoothWheel:i=!0,syncTouch:r=!1,syncTouchLerp:s=.075,touchInertiaExponent:a=1.7,duration:o,easing:l,lerp:u=.1,infinite:h=!1,orientation:p="vertical",gestureOrientation:f=p==="horizontal"?"both":"vertical",touchMultiplier:g=1,wheelMultiplier:v=1,autoResize:S=!0,prevent:m,virtualScroll:d,overscroll:_=!0,autoRaf:x=!1,anchors:M=!1,autoToggle:P=!1,allowNestedScroll:T=!1,__experimental__naiveDimensions:A=!1,naiveDimensions:N=A,stopInertiaOnNavigate:H=!1,respectReducedMotion:y=!0}={}){Se(this,"_isScrolling",!1);Se(this,"_isStopped",!1);Se(this,"_isLocked",!1);Se(this,"_preventNextNativeScrollEvent",!1);Se(this,"_resetVelocityTimeout",null);Se(this,"_rafId",null);Se(this,"_isDraggingSelection",!1);Se(this,"reducedMotionMediaQuery",window.matchMedia("(prefers-reduced-motion: reduce)"));Se(this,"isTouching");Se(this,"isIos");Se(this,"time",0);Se(this,"userData",{});Se(this,"lastVelocity",0);Se(this,"velocity",0);Se(this,"direction",0);Se(this,"options");Se(this,"targetScroll");Se(this,"animatedScroll");Se(this,"animate",new uy);Se(this,"emitter",new Og);Se(this,"dimensions");Se(this,"virtualScroll");Se(this,"onScrollEnd",t=>{t instanceof CustomEvent||(this.isScrolling==="smooth"||this.isScrolling===!1)&&t.stopPropagation()});Se(this,"dispatchScrollendEvent",()=>{this.options.wrapper.dispatchEvent(new CustomEvent("scrollend",{bubbles:this.options.wrapper===window,detail:{lenisScrollEnd:!0}}))});Se(this,"onTransitionEnd",t=>{var e;(e=t.propertyName)!=null&&e.includes("overflow")&&t.target===this.rootElement&&this.checkOverflow()});Se(this,"onClick",t=>{const e=t.composedPath().filter(i=>i instanceof HTMLAnchorElement&&i.href).map(i=>new URL(i.href)),n=new URL(window.location.href);if(this.options.anchors){const i=e.find(r=>n.host===r.host&&n.pathname===r.pathname&&r.hash);if(i){const r=typeof this.options.anchors=="object"&&this.options.anchors?this.options.anchors:void 0,s=decodeURIComponent(i.hash);this.scrollTo(s,r);return}}if(this.options.stopInertiaOnNavigate&&e.some(i=>n.host===i.host&&n.pathname!==i.pathname)){this.reset();return}});Se(this,"onPointerDown",t=>{t.button===1&&this.reset()});Se(this,"onVirtualScroll",t=>{if(typeof this.options.virtualScroll=="function"&&this.options.virtualScroll(t)===!1)return;const{deltaX:e,deltaY:n,event:i}=t;if(this.emitter.emit("virtual-scroll",{deltaX:e,deltaY:n,event:i}),i.ctrlKey||i.lenisStopPropagation)return;const r=i.type.includes("touch"),s=i.type.includes("wheel");if(r&&this.isIos&&(i.type==="touchstart"&&(this._isDraggingSelection=this.isTouchOnSelectionHandle(i)),this._isDraggingSelection)){i.type==="touchend"&&(this._isDraggingSelection=!1);return}this.isTouching=i.type==="touchstart"||i.type==="touchmove";const a=e===0&&n===0;if(this.options.syncTouch&&r&&i.type==="touchstart"&&a&&!this.isStopped&&!this.isLocked){this.reset();return}const o=this.options.gestureOrientation==="vertical"&&n===0||this.options.gestureOrientation==="horizontal"&&e===0;if(a||o)return;let l=i.composedPath();l=l.slice(0,l.indexOf(this.rootElement));const u=this.options.prevent,h=Math.abs(e)>=Math.abs(n)?"horizontal":"vertical";if(l.find(v=>{var S,m,d,_,x;return v instanceof HTMLElement&&(typeof u=="function"&&(u==null?void 0:u(v))||((S=v.hasAttribute)==null?void 0:S.call(v,"data-lenis-prevent"))||h==="vertical"&&((m=v.hasAttribute)==null?void 0:m.call(v,"data-lenis-prevent-vertical"))||h==="horizontal"&&((d=v.hasAttribute)==null?void 0:d.call(v,"data-lenis-prevent-horizontal"))||r&&((_=v.hasAttribute)==null?void 0:_.call(v,"data-lenis-prevent-touch"))||s&&((x=v.hasAttribute)==null?void 0:x.call(v,"data-lenis-prevent-wheel"))||this.options.allowNestedScroll&&this.hasNestedScroll(v,{deltaX:e,deltaY:n}))}))return;if(this.isStopped||this.isLocked){i.cancelable&&i.preventDefault();return}if(!(this.options.syncTouch&&r||this.options.smoothWheel&&s)){this.isScrolling="native",this.animate.stop(),i.lenisStopPropagation=!0;return}let p=n;this.options.gestureOrientation==="both"?p=Math.abs(n)>Math.abs(e)?n:e:this.options.gestureOrientation==="horizontal"&&(p=e),(!this.options.overscroll||this.options.infinite||this.options.wrapper!==window&&this.limit>0&&(this.animatedScroll>0&&this.animatedScroll<this.limit||this.animatedScroll===0&&n>0||this.animatedScroll===this.limit&&n<0))&&(i.lenisStopPropagation=!0),i.cancelable&&i.preventDefault();const f=r&&this.options.syncTouch,g=r&&i.type==="touchend";g&&(p=Math.sign(p)*Math.abs(this.velocity)**this.options.touchInertiaExponent),this.scrollTo(this.targetScroll+p,{programmatic:!1,...f?{lerp:g?this.options.syncTouchLerp:1}:{lerp:this.options.lerp,duration:this.options.duration,easing:this.options.easing}})});Se(this,"onNativeScroll",()=>{if(this._resetVelocityTimeout!==null&&(clearTimeout(this._resetVelocityTimeout),this._resetVelocityTimeout=null),this._preventNextNativeScrollEvent){this._preventNextNativeScrollEvent=!1;return}if(this.isScrolling===!1||this.isScrolling==="native"){const t=this.animatedScroll;this.animatedScroll=this.targetScroll=this.actualScroll,this.lastVelocity=this.velocity,this.velocity=this.animatedScroll-t,this.direction=Math.sign(this.animatedScroll-t),this.isStopped||(this.isScrolling="native"),this.emit(),this.velocity!==0&&(this._resetVelocityTimeout=setTimeout(()=>{this.lastVelocity=this.velocity,this.velocity=0,this.isScrolling=!1,this.emit()},400))}});Se(this,"raf",t=>{const e=t-(this.time||t);this.time=t,this.animate.advance(e*.001),this.options.autoRaf&&(this._rafId=requestAnimationFrame(this.raf))});window.lenisVersion=gp,window.lenis||(window.lenis={}),window.lenis.version=gp,p==="horizontal"&&(window.lenis.horizontal=!0),r===!0&&(window.lenis.touch=!0),this.isIos=/(iPad|iPhone|iPod)/g.test(navigator.userAgent),(!t||t===document.documentElement)&&(t=window),typeof o=="number"&&typeof l!="function"?l=vp:typeof l=="function"&&typeof o!="number"&&(o=1),this.options={wrapper:t,content:e,eventsTarget:n,smoothWheel:i,syncTouch:r,syncTouchLerp:s,touchInertiaExponent:a,duration:o,easing:l,lerp:u,infinite:h,gestureOrientation:f,orientation:p,touchMultiplier:g,wheelMultiplier:v,autoResize:S,prevent:m,virtualScroll:d,overscroll:_,autoRaf:x,anchors:M,autoToggle:P,allowNestedScroll:T,naiveDimensions:N,stopInertiaOnNavigate:H,respectReducedMotion:y},this.dimensions=new hy(t,e,{autoResize:S}),this.updateClassName(),this.targetScroll=this.animatedScroll=this.actualScroll,this.options.wrapper.addEventListener("scroll",this.onNativeScroll),this.options.wrapper.addEventListener("scrollend",this.onScrollEnd,{capture:!0}),(this.options.anchors||this.options.stopInertiaOnNavigate)&&this.options.wrapper.addEventListener("click",this.onClick),this.options.wrapper.addEventListener("pointerdown",this.onPointerDown),this.virtualScroll=new py(n,{touchMultiplier:g,wheelMultiplier:v}),this.virtualScroll.on("scroll",this.onVirtualScroll),this.options.autoToggle&&(this.checkOverflow(),this.rootElement.addEventListener("transitionend",this.onTransitionEnd)),this.options.autoRaf&&(this._rafId=requestAnimationFrame(this.raf))}destroy(){this.emitter.destroy(),this.options.wrapper.removeEventListener("scroll",this.onNativeScroll),this.options.wrapper.removeEventListener("scrollend",this.onScrollEnd,{capture:!0}),this.options.wrapper.removeEventListener("pointerdown",this.onPointerDown),(this.options.anchors||this.options.stopInertiaOnNavigate)&&this.options.wrapper.removeEventListener("click",this.onClick),this.virtualScroll.destroy(),this.dimensions.destroy(),this.cleanUpClassName(),this._rafId&&cancelAnimationFrame(this._rafId)}on(t,e){return this.emitter.on(t,e)}off(t,e){return this.emitter.off(t,e)}get overflow(){const t=this.isHorizontal?"overflow-x":"overflow-y";return getComputedStyle(this.rootElement)[t]}checkOverflow(){["hidden","clip"].includes(this.overflow)?this.internalStop():this.internalStart()}setScroll(t){this.isHorizontal?this.options.wrapper.scrollTo({left:t,behavior:"instant"}):this.options.wrapper.scrollTo({top:t,behavior:"instant"})}isTouchOnSelectionHandle(t){const e=window.getSelection();if(!e||e.isCollapsed||e.rangeCount===0)return!1;const n=t.targetTouches[0]??t.changedTouches[0];if(!n)return!1;const i=e.getRangeAt(0).getClientRects();if(i.length===0)return!1;const r=i[0],s=i[i.length-1],a=40,o=Math.hypot(n.clientX-r.left,n.clientY-r.top)<=a,l=Math.hypot(n.clientX-s.right,n.clientY-s.bottom)<=a;return o||l}resize(){this.dimensions.resize(),this.animatedScroll=this.targetScroll=this.actualScroll,this.emit()}emit(){this.emitter.emit("scroll",this)}reset(){this.isLocked=!1,this.isScrolling=!1,this.animatedScroll=this.targetScroll=this.actualScroll,this.lastVelocity=this.velocity=0,this.animate.stop()}start(){if(this.isStopped){if(this.options.autoToggle){this.rootElement.style.removeProperty("overflow");return}this.internalStart()}}internalStart(){this.isStopped&&(this.reset(),this.isStopped=!1,this.emit())}stop(){if(!this.isStopped){if(this.options.autoToggle){this.rootElement.style.setProperty("overflow","clip");return}this.internalStop()}}internalStop(){this.isStopped||(this.reset(),this.isStopped=!0,this.emit())}scrollTo(t,{offset:e=0,immediate:n=!1,lock:i=!1,programmatic:r=!0,lerp:s=r?this.options.lerp:void 0,duration:a=r?this.options.duration:void 0,easing:o=r?this.options.easing:void 0,onStart:l,onComplete:u,force:h=!1,userData:p}={}){if(this.prefersReducedMotion&&(r?n=!0:(s=1,a=void 0,o=void 0)),(this.isStopped||this.isLocked)&&!h)return;let f=t,g=e;if(typeof f=="string"&&["top","left","start","#"].includes(f))f=0;else if(typeof f=="string"&&["bottom","right","end"].includes(f))f=this.limit;else{let v=null;if(typeof f=="string"?(v=f.startsWith("#")?document.getElementById(f.slice(1)):document.querySelector(f),v||(f==="#top"?f=0:console.warn("Lenis: Target not found",f))):f instanceof HTMLElement&&(f!=null&&f.nodeType)&&(v=f),v){if(this.options.wrapper!==window){const M=this.rootElement.getBoundingClientRect();g-=this.isHorizontal?M.left:M.top}const S=v.getBoundingClientRect(),m=getComputedStyle(v),d=this.isHorizontal?Number.parseFloat(m.scrollMarginLeft):Number.parseFloat(m.scrollMarginTop),_=getComputedStyle(this.rootElement),x=this.isHorizontal?Number.parseFloat(_.scrollPaddingLeft):Number.parseFloat(_.scrollPaddingTop);f=(this.isHorizontal?S.left:S.top)+this.animatedScroll-(Number.isNaN(d)?0:d)-(Number.isNaN(x)?0:x)}}if(typeof f=="number"){if(f+=g,this.options.infinite){if(r){this.targetScroll=this.animatedScroll=this.scroll;const v=f-this.animatedScroll;v>this.limit/2?f-=this.limit:v<-this.limit/2&&(f+=this.limit)}}else f=Fg(0,f,this.limit);if(f===this.targetScroll){l==null||l(this),u==null||u(this);return}if(this.userData=p??{},n){this.animatedScroll=this.targetScroll=f,this.setScroll(this.scroll),this.reset(),this.preventNextNativeScrollEvent(),this.emit(),u==null||u(this),this.userData={},requestAnimationFrame(()=>{this.dispatchScrollendEvent()});return}r||(this.targetScroll=f),typeof a=="number"&&typeof o!="function"?o=vp:typeof o=="function"&&typeof a!="number"&&(a=1),this.animate.fromTo(this.animatedScroll,f,{duration:a,easing:o,lerp:s,onStart:()=>{i&&(this.isLocked=!0),this.isScrolling="smooth",l==null||l(this)},onUpdate:(v,S)=>{this.isScrolling="smooth",this.lastVelocity=this.velocity,this.velocity=v-this.animatedScroll,this.direction=Math.sign(this.velocity),this.animatedScroll=v,this.setScroll(this.scroll),r&&(this.targetScroll=v),S||this.emit(),S&&(this.reset(),this.emit(),u==null||u(this),this.userData={},requestAnimationFrame(()=>{this.dispatchScrollendEvent()}),this.preventNextNativeScrollEvent())}})}}preventNextNativeScrollEvent(){this._preventNextNativeScrollEvent=!0,requestAnimationFrame(()=>{this._preventNextNativeScrollEvent=!1})}hasNestedScroll(t,{deltaX:e,deltaY:n}){const i=Date.now();t._lenis||(t._lenis={});const r=t._lenis;let s,a,o,l,u,h,p,f,g,v;if(i-(r.time??0)>2e3){r.time=Date.now();const T=window.getComputedStyle(t);if(r.computedStyle=T,s=["auto","overlay","scroll"].includes(T.overflowX),a=["auto","overlay","scroll"].includes(T.overflowY),u=["auto"].includes(T.overscrollBehaviorX),h=["auto"].includes(T.overscrollBehaviorY),r.hasOverflowX=s,r.hasOverflowY=a,!(s||a))return!1;p=t.scrollWidth,f=t.scrollHeight,g=t.clientWidth,v=t.clientHeight,o=p>g,l=f>v,r.isScrollableX=o,r.isScrollableY=l,r.scrollWidth=p,r.scrollHeight=f,r.clientWidth=g,r.clientHeight=v,r.hasOverscrollBehaviorX=u,r.hasOverscrollBehaviorY=h}else o=r.isScrollableX,l=r.isScrollableY,s=r.hasOverflowX,a=r.hasOverflowY,p=r.scrollWidth,f=r.scrollHeight,g=r.clientWidth,v=r.clientHeight,u=r.hasOverscrollBehaviorX,h=r.hasOverscrollBehaviorY;if(!(s&&o||a&&l))return!1;const S=Math.abs(e)>=Math.abs(n)?"horizontal":"vertical";let m,d,_,x,M,P;if(S==="horizontal")m=Math.round(t.scrollLeft),d=p-g,_=e,x=s,M=o,P=u;else if(S==="vertical")m=Math.round(t.scrollTop),d=f-v,_=n,x=a,M=l,P=h;else return!1;return!P&&(m>=d||m<=0)?!0:(_>0?m<d:m>0)&&x&&M}get rootElement(){return this.options.wrapper===window?document.documentElement:this.options.wrapper}get limit(){return this.options.naiveDimensions?this.isHorizontal?this.rootElement.scrollWidth-this.rootElement.clientWidth:this.rootElement.scrollHeight-this.rootElement.clientHeight:this.dimensions.limit[this.isHorizontal?"x":"y"]}get isHorizontal(){return this.options.orientation==="horizontal"}get actualScroll(){const t=this.options.wrapper;return this.isHorizontal?t.scrollX??t.scrollLeft:t.scrollY??t.scrollTop}get scroll(){return this.options.infinite?cy(this.animatedScroll,this.limit):this.animatedScroll}get progress(){return this.limit===0?1:this.scroll/this.limit}get isScrolling(){return this._isScrolling}set isScrolling(t){this._isScrolling!==t&&(this._isScrolling=t,this.updateClassName())}get isStopped(){return this._isStopped}set isStopped(t){this._isStopped!==t&&(this._isStopped=t,this.updateClassName())}get isLocked(){return this._isLocked}set isLocked(t){this._isLocked!==t&&(this._isLocked=t,this.updateClassName())}get isSmooth(){return this.isScrolling==="smooth"}get prefersReducedMotion(){return this.options.respectReducedMotion&&this.reducedMotionMediaQuery.matches}get className(){let t="lenis";return this.options.autoToggle&&(t+=" lenis-autoToggle"),this.isStopped&&(t+=" lenis-stopped"),this.isLocked&&(t+=" lenis-locked"),this.isScrolling&&(t+=" lenis-scrolling"),this.isScrolling==="smooth"&&(t+=" lenis-smooth"),t}updateClassName(){this.cleanUpClassName(),this.className.split(" ").forEach(t=>{this.rootElement.classList.add(t)})}cleanUpClassName(){for(const t of Array.from(this.rootElement.classList))(t==="lenis"||t.startsWith("lenis-"))&&this.rootElement.classList.remove(t)}};/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const gy=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),zg=(...t)=>t.filter((e,n,i)=>!!e&&e.trim()!==""&&i.indexOf(e)===n).join(" ").trim();/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var xy={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const vy=ae.forwardRef(({color:t="currentColor",size:e=24,strokeWidth:n=2,absoluteStrokeWidth:i,className:r="",children:s,iconNode:a,...o},l)=>ae.createElement("svg",{ref:l,...xy,width:e,height:e,stroke:t,strokeWidth:i?Number(n)*24/Number(e):n,className:zg("lucide",r),...o},[...a.map(([u,h])=>ae.createElement(u,h)),...Array.isArray(s)?s:[s]]));/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Re=(t,e)=>{const n=ae.forwardRef(({className:i,...r},s)=>ae.createElement(vy,{ref:s,iconNode:e,className:zg(`lucide-${gy(t)}`,i),...r}));return n.displayName=`${t}`,n};/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _y=Re("Activity",[["path",{d:"M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",key:"169zse"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Bg=Re("Award",[["path",{d:"m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526",key:"1yiouv"}],["circle",{cx:"12",cy:"8",r:"6",key:"1vp47v"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const yy=Re("Baby",[["path",{d:"M9 12h.01",key:"157uk2"}],["path",{d:"M15 12h.01",key:"1k8ypt"}],["path",{d:"M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5",key:"1u7htd"}],["path",{d:"M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1",key:"5yv0yz"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Na=Re("BookOpen",[["path",{d:"M12 7v14",key:"1akyts"}],["path",{d:"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",key:"ruj8y"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Sy=Re("Brain",[["path",{d:"M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z",key:"l5xja"}],["path",{d:"M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z",key:"ep3f8r"}],["path",{d:"M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4",key:"1p4c4q"}],["path",{d:"M17.599 6.5a3 3 0 0 0 .399-1.375",key:"tmeiqw"}],["path",{d:"M6.003 5.125A3 3 0 0 0 6.401 6.5",key:"105sqy"}],["path",{d:"M3.477 10.896a4 4 0 0 1 .585-.396",key:"ql3yin"}],["path",{d:"M19.938 10.5a4 4 0 0 1 .585.396",key:"1qfode"}],["path",{d:"M6 18a4 4 0 0 1-1.967-.516",key:"2e4loj"}],["path",{d:"M19.967 17.484A4 4 0 0 1 18 18",key:"159ez6"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const da=Re("Briefcase",[["path",{d:"M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16",key:"jecpp"}],["rect",{width:"20",height:"14",x:"2",y:"6",rx:"2",key:"i6l2r4"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const wy=Re("Calendar",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Pa=Re("Check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const My=Re("ChevronLeft",[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const jg=Re("ChevronRight",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ey=Re("CircleAlert",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ku=Re("CircleCheck",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const by=Re("CircleHelp",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3",key:"1u773s"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ty=Re("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ss=Re("Coins",[["circle",{cx:"8",cy:"8",r:"6",key:"3yglwk"}],["path",{d:"M18.09 10.37A6 6 0 1 1 10.34 18",key:"t5s6rm"}],["path",{d:"M7 6h1v4",key:"1obek4"}],["path",{d:"m16.71 13.88.7.71-2.82 2.82",key:"1rbuyh"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Zu=Re("Compass",[["path",{d:"m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z",key:"9ktpf1"}],["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Hg=Re("Copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ay=Re("CornerDownLeft",[["polyline",{points:"9 10 4 15 9 20",key:"r3jprv"}],["path",{d:"M20 4v7a4 4 0 0 1-4 4H4",key:"6o5b7l"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Cy=Re("ExternalLink",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ry=Re("Gamepad2",[["line",{x1:"6",x2:"10",y1:"11",y2:"11",key:"1gktln"}],["line",{x1:"8",x2:"8",y1:"9",y2:"13",key:"qnk9ow"}],["line",{x1:"15",x2:"15.01",y1:"12",y2:"12",key:"krot7o"}],["line",{x1:"18",x2:"18.01",y1:"10",y2:"10",key:"1lcuu1"}],["path",{d:"M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z",key:"mfqc10"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Qu=Re("Gift",[["rect",{x:"3",y:"8",width:"18",height:"4",rx:"1",key:"bkv52"}],["path",{d:"M12 8v13",key:"1c76mn"}],["path",{d:"M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7",key:"6wjy6b"}],["path",{d:"M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5",key:"1ihvrl"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ny=Re("Globe",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",key:"13o1zl"}],["path",{d:"M2 12h20",key:"9i4pu4"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const mr=Re("Heart",[["path",{d:"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",key:"c3ymky"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Py=Re("LayoutGrid",[["rect",{width:"7",height:"7",x:"3",y:"3",rx:"1",key:"1g98yp"}],["rect",{width:"7",height:"7",x:"14",y:"3",rx:"1",key:"6d4xhi"}],["rect",{width:"7",height:"7",x:"14",y:"14",rx:"1",key:"nxv5o0"}],["rect",{width:"7",height:"7",x:"3",y:"14",rx:"1",key:"1bb6yr"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ly=Re("Lock",[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Dy=Re("Menu",[["line",{x1:"4",x2:"20",y1:"12",y2:"12",key:"1e0a9i"}],["line",{x1:"4",x2:"20",y1:"6",y2:"6",key:"1owob3"}],["line",{x1:"4",x2:"20",y1:"18",y2:"18",key:"yk5zj1"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ky=Re("MessageCircle",[["path",{d:"M7.9 20A9 9 0 1 0 4 16.1L2 22Z",key:"vv11sd"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Iy=Re("MessageSquare",[["path",{d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",key:"1lielz"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Uy=Re("PenLine",[["path",{d:"M12 20h9",key:"t2du7b"}],["path",{d:"M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z",key:"1ykcvy"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Fh=Re("Search",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ha=Re("Share2",[["circle",{cx:"18",cy:"5",r:"3",key:"gq8acd"}],["circle",{cx:"6",cy:"12",r:"3",key:"w7nqdw"}],["circle",{cx:"18",cy:"19",r:"3",key:"1xt0gg"}],["line",{x1:"8.59",x2:"15.42",y1:"13.51",y2:"17.49",key:"47mynk"}],["line",{x1:"15.41",x2:"8.59",y1:"6.51",y2:"10.49",key:"1n3mei"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Vg=Re("ShieldAlert",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"M12 8v4",key:"1got3b"}],["path",{d:"M12 16h.01",key:"1drbdi"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Gg=Re("ShieldCheck",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _p=Re("Shield",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Fy=Re("ShoppingBag",[["path",{d:"M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z",key:"hou9p0"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M16 10a4 4 0 0 1-8 0",key:"1ltviw"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Dt=Re("Sparkles",[["path",{d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",key:"4pj2yx"}],["path",{d:"M20 3v4",key:"1olli1"}],["path",{d:"M22 5h-4",key:"1gvqau"}],["path",{d:"M4 17v2",key:"vumght"}],["path",{d:"M5 18H3",key:"zchphs"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Oy=Re("Tag",[["path",{d:"M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z",key:"vktsd0"}],["circle",{cx:"7.5",cy:"7.5",r:".5",fill:"currentColor",key:"kqv944"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const mi=Re("Terminal",[["polyline",{points:"4 17 10 11 4 5",key:"akl6gq"}],["line",{x1:"12",x2:"20",y1:"19",y2:"19",key:"q2wloq"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const zy=Re("Trash2",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const By=Re("TreePine",[["path",{d:"m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z",key:"cpyugq"}],["path",{d:"M12 22v-3",key:"kmzjlo"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Wg=Re("User",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const jy=Re("Vault",[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["circle",{cx:"7.5",cy:"7.5",r:".5",fill:"currentColor",key:"kqv944"}],["path",{d:"m7.9 7.9 2.7 2.7",key:"hpeyl3"}],["circle",{cx:"16.5",cy:"7.5",r:".5",fill:"currentColor",key:"w0ekpg"}],["path",{d:"m13.4 10.6 2.7-2.7",key:"264c1n"}],["circle",{cx:"7.5",cy:"16.5",r:".5",fill:"currentColor",key:"nkw3mc"}],["path",{d:"m7.9 16.1 2.7-2.7",key:"p81g5e"}],["circle",{cx:"16.5",cy:"16.5",r:".5",fill:"currentColor",key:"fubopw"}],["path",{d:"m13.4 13.4 2.7 2.7",key:"abhel3"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Hy=Re("Volume2",[["path",{d:"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",key:"uqj9uw"}],["path",{d:"M16 9a5 5 0 0 1 0 6",key:"1q6k2b"}],["path",{d:"M19.364 18.364a9 9 0 0 0 0-12.728",key:"ijwkga"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Vy=Re("VolumeX",[["path",{d:"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",key:"uqj9uw"}],["line",{x1:"22",x2:"16",y1:"9",y2:"15",key:"1ewh16"}],["line",{x1:"16",x2:"22",y1:"9",y2:"15",key:"5ykzw1"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ws=Re("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Gy=Re("Zap",[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",key:"1xq2db"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Wy=Re("ZoomIn",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["line",{x1:"21",x2:"16.65",y1:"21",y2:"16.65",key:"13gj7c"}],["line",{x1:"11",x2:"11",y1:"8",y2:"14",key:"1vmskp"}],["line",{x1:"8",x2:"14",y1:"11",y2:"11",key:"durymu"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Xy=Re("ZoomOut",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["line",{x1:"21",x2:"16.65",y1:"21",y2:"16.65",key:"13gj7c"}],["line",{x1:"8",x2:"14",y1:"11",y2:"11",key:"durymu"}]]);function qy({lang:t,setLang:e,t:n}){const[i,r]=ae.useState(!1),s=()=>{const a=t==="pt"?"en":"pt";e(a),localStorage.setItem("pyxie_lang",a);const o=new URL(window.location.href);o.searchParams.set("lang",a),window.history.replaceState({},"",o)};return c.jsxs("header",{className:"sticky top-0 z-50 w-full bg-[#080410]/80 backdrop-blur-2xl border-b border-purple-500/15 transition-all",children:[c.jsxs("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between",children:[c.jsxs("a",{href:"/",className:"flex items-center gap-3 group",children:[c.jsxs("div",{className:"relative",children:[c.jsx("img",{src:"/assets/pyxie/pyxie_pixelart_face.png",alt:"Pyxie Mascot",className:"w-10 h-10 object-contain rounded-xl border border-pink-500/30 group-hover:border-pink-500/60 transition-all shadow-neon-pink"}),c.jsx("span",{className:"absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#080410] animate-pulse"})]}),c.jsxs("div",{className:"flex flex-col",children:[c.jsx("span",{className:"font-title font-extrabold text-xl tracking-tight text-white group-hover:text-pink-400 transition-colors",children:"Pyxie"}),c.jsx("span",{className:"text-[10px] font-mono font-medium text-purple-300/70 tracking-wider uppercase",children:"Discord.js v14"})]})]}),c.jsxs("nav",{className:"hidden md:flex items-center gap-1.5 lg:gap-2",children:[c.jsx("a",{href:"/#pilares",className:"px-3 py-1.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all",children:n("nav.features")}),c.jsxs("a",{href:"/#comandos",className:"px-3 py-1.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5",children:[c.jsx(mi,{className:"w-3.5 h-3.5 text-pink-400"}),n("nav.commands")]}),c.jsxs("a",{href:"/wiki",className:"px-3 py-1.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5",children:[c.jsx(Na,{className:"w-3.5 h-3.5 text-purple-400"}),n("nav.wiki")]}),c.jsxs("a",{href:"/museu",className:"px-3 py-1.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5",children:[c.jsx(Dt,{className:"w-3.5 h-3.5 text-pink-400"}),n("nav.museum")]}),c.jsxs("a",{href:"/bonus",className:"px-3 py-1.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5",children:[c.jsx(Qu,{className:"w-3.5 h-3.5 text-amber-400"}),n("nav.bonus"),c.jsx("span",{className:"ml-1 text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30",children:"10s"})]}),c.jsx("a",{href:"/discord",target:"_blank",rel:"noopener noreferrer",className:"px-3 py-1.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all",children:n("nav.support")})]}),c.jsxs("div",{className:"flex items-center gap-3",children:[c.jsxs("button",{onClick:s,className:"px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-purple-500/20 hover:border-purple-500/40 transition-all flex items-center gap-1.5",title:"Switch Language / Alternar Idioma",children:[c.jsx(Ny,{className:"w-3.5 h-3.5 text-pink-400"}),c.jsx("span",{children:t==="pt"?"PT-BR":"EN"})]}),c.jsxs("a",{href:"/invite",target:"_blank",rel:"noopener noreferrer",className:"hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 shadow-neon-pink transition-all transform hover:-translate-y-0.5 active:translate-y-0",children:[c.jsx(Dt,{className:"w-4 h-4 text-pink-200"}),c.jsx("span",{children:n("nav.invite")})]}),c.jsx("button",{onClick:()=>r(!i),className:"md:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-white/5 border border-purple-500/20","aria-label":"Toggle menu",children:i?c.jsx(ws,{className:"w-5 h-5"}):c.jsx(Dy,{className:"w-5 h-5"})})]})]}),i&&c.jsxs("div",{className:"md:hidden bg-[#080410]/95 backdrop-blur-2xl border-b border-purple-500/20 px-4 pt-3 pb-6 flex flex-col gap-2 animate-fadeIn",children:[c.jsx("a",{href:"/#pilares",onClick:()=>r(!1),className:"px-4 py-2.5 rounded-xl text-base font-semibold text-slate-200 hover:bg-white/5",children:n("nav.features")}),c.jsxs("a",{href:"/#comandos",onClick:()=>r(!1),className:"px-4 py-2.5 rounded-xl text-base font-semibold text-slate-200 hover:bg-white/5 flex items-center justify-between",children:[c.jsx("span",{children:n("nav.commands")}),c.jsx(mi,{className:"w-4 h-4 text-pink-400"})]}),c.jsxs("a",{href:"/wiki",onClick:()=>r(!1),className:"px-4 py-2.5 rounded-xl text-base font-semibold text-slate-200 hover:bg-white/5 flex items-center justify-between",children:[c.jsx("span",{children:n("nav.wiki")}),c.jsx(Na,{className:"w-4 h-4 text-purple-400"})]}),c.jsxs("a",{href:"/museu",onClick:()=>r(!1),className:"px-4 py-2.5 rounded-xl text-base font-semibold text-slate-200 hover:bg-white/5 flex items-center justify-between",children:[c.jsx("span",{children:n("nav.museum")}),c.jsx(Dt,{className:"w-4 h-4 text-pink-400"})]}),c.jsxs("a",{href:"/bonus",onClick:()=>r(!1),className:"px-4 py-2.5 rounded-xl text-base font-semibold text-slate-200 hover:bg-white/5 flex items-center justify-between",children:[c.jsx("span",{children:n("nav.bonus")}),c.jsx(Qu,{className:"w-4 h-4 text-amber-400"})]}),c.jsx("a",{href:"/discord",target:"_blank",rel:"noopener noreferrer",className:"px-4 py-2.5 rounded-xl text-base font-semibold text-slate-200 hover:bg-white/5",children:n("nav.support")}),c.jsx("div",{className:"pt-2 border-t border-purple-500/15 flex flex-col gap-2",children:c.jsx("a",{href:"/invite",target:"_blank",rel:"noopener noreferrer",className:"w-full text-center py-3 rounded-xl font-bold text-white bg-gradient-to-r from-pink-600 to-purple-600 shadow-neon-pink",children:n("nav.invite")})})]})]})}function $y({t}){return c.jsx("footer",{className:"w-full bg-[#06030c] border-t border-purple-500/15 py-12 px-4 sm:px-6 lg:px-8 mt-20",children:c.jsxs("div",{className:"max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left",children:[c.jsxs("div",{className:"flex items-center gap-3",children:[c.jsx("img",{src:"/assets/pyxie/pyxie_pixelart_face.png",alt:"Pyxie Mascot Mini",className:"w-8 h-8 rounded-lg border border-purple-500/30"}),c.jsxs("div",{children:[c.jsx("span",{className:"font-title font-bold text-white text-base",children:"Pyxie"}),c.jsx("p",{className:"text-xs text-slate-400",children:t("footer.rights")})]})]}),c.jsxs("div",{className:"flex flex-wrap items-center justify-center gap-5 text-sm font-medium text-slate-300",children:[c.jsx("a",{href:"/wiki",className:"hover:text-pink-400 transition-colors",children:t("footer.wiki")}),c.jsx("a",{href:"/museu",className:"hover:text-pink-400 transition-colors",children:t("footer.museum")}),c.jsx("a",{href:"/bonus",className:"hover:text-pink-400 transition-colors",children:t("footer.bonus")}),c.jsxs("a",{href:"/termos",className:"hover:text-pink-400 transition-colors flex items-center gap-1.5",children:[c.jsx(Gg,{className:"w-3.5 h-3.5 text-purple-400"}),t("footer.terms")]}),c.jsx("a",{href:"/promo",target:"_blank",rel:"noopener noreferrer",className:"hover:text-pink-400 transition-colors",children:"Shopee"}),c.jsx("a",{href:"/discord",target:"_blank",rel:"noopener noreferrer",className:"hover:text-pink-400 transition-colors",children:"Discord"})]})]})})}function Yy({t}){const[e,n]=ae.useState("work"),[i,r]=ae.useState(null),[s,a]=ae.useState(""),[o,l]=ae.useState(!1);return ae.useEffect(()=>{if(e==="tarot"){const u=t("terminal.tarotDesc");let h=0;a(""),l(!1);const p=setInterval(()=>{h<u.length?(a(u.slice(0,h+1)),h++):(l(!0),clearInterval(p))},25);return()=>clearInterval(p)}},[e,t]),c.jsxs("div",{className:"w-full max-w-xl mx-auto rounded-2xl glass-panel border border-purple-500/25 overflow-hidden shadow-2xl backdrop-blur-2xl",children:[c.jsxs("div",{className:"px-4 py-3 bg-[#0d071b]/90 border-b border-purple-500/15 flex items-center justify-between",children:[c.jsxs("div",{className:"flex items-center gap-2",children:[c.jsx("span",{className:"w-3 h-3 rounded-full bg-rose-500 inline-block"}),c.jsx("span",{className:"w-3 h-3 rounded-full bg-amber-500 inline-block"}),c.jsx("span",{className:"w-3 h-3 rounded-full bg-emerald-500 inline-block"}),c.jsxs("span",{className:"ml-2 font-mono text-xs text-purple-300/60 font-semibold flex items-center gap-1.5",children:[c.jsx(mi,{className:"w-3.5 h-3.5 text-pink-400"})," pyxie-simulator@discord:~"]})]}),c.jsxs("div",{className:"flex items-center gap-1",children:[c.jsx("span",{className:"w-2 h-2 rounded-full bg-emerald-400 animate-ping"}),c.jsx("span",{className:"text-[10px] font-mono text-emerald-300 font-bold",children:"READY"})]})]}),c.jsxs("div",{className:"flex border-b border-purple-500/15 bg-[#0a0515]/60 px-2 pt-2 gap-1 overflow-x-auto",children:[c.jsxs("button",{onClick:()=>{n("work"),r(null)},className:`px-3 py-1.5 rounded-t-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${e==="work"?"bg-[#180d2d] text-pink-300 border-t-2 border-pink-500":"text-slate-400 hover:text-white hover:bg-white/5"}`,children:[c.jsx(da,{className:"w-3 h-3 text-pink-400"}),t("terminal.tabWork")]}),c.jsxs("button",{onClick:()=>n("marriage"),className:`px-3 py-1.5 rounded-t-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${e==="marriage"?"bg-[#180d2d] text-purple-300 border-t-2 border-purple-500":"text-slate-400 hover:text-white hover:bg-white/5"}`,children:[c.jsx(mr,{className:"w-3 h-3 text-rose-400"}),t("terminal.tabMarriage")]}),c.jsxs("button",{onClick:()=>n("tarot"),className:`px-3 py-1.5 rounded-t-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${e==="tarot"?"bg-[#180d2d] text-cyan-300 border-t-2 border-cyan-400":"text-slate-400 hover:text-white hover:bg-white/5"}`,children:[c.jsx(Dt,{className:"w-3 h-3 text-cyan-400"}),t("terminal.tabTarot")]})]}),c.jsxs("div",{className:"p-5 font-mono text-xs sm:text-sm min-h-[260px] flex flex-col justify-between bg-gradient-to-b from-[#120824]/90 to-[#0a0416]/95",children:[e==="work"&&c.jsxs("div",{className:"space-y-3 animate-fadeIn",children:[c.jsxs("div",{className:"text-pink-400 font-bold flex items-center gap-2",children:[c.jsx("span",{className:"text-slate-500",children:"$"})," /py-work"]}),c.jsx("div",{className:"text-slate-200 font-semibold",children:t("terminal.workTitle")}),c.jsx("p",{className:"text-slate-400 text-xs leading-relaxed",children:t("terminal.workDesc")}),c.jsx("div",{className:"space-y-2 pt-1",children:[{id:1,label:t("terminal.opt1")},{id:2,label:t("terminal.opt2")},{id:3,label:t("terminal.opt3")}].map(u=>c.jsxs("button",{onClick:()=>r(u.id),className:`w-full text-left px-3 py-2 rounded-xl border text-xs transition-all flex items-center justify-between ${i===u.id?"bg-pink-500/20 border-pink-500 text-white shadow-neon-pink":"bg-white/5 border-purple-500/20 text-slate-300 hover:bg-white/10 hover:border-pink-500/40"}`,children:[c.jsx("span",{children:u.label}),i===u.id&&c.jsx(Ku,{className:"w-4 h-4 text-emerald-400"})]},u.id))}),i&&c.jsxs("div",{className:"mt-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold animate-scaleIn flex items-center gap-2",children:[c.jsx(Ss,{className:"w-4 h-4 text-amber-400 shrink-0"}),c.jsx("span",{children:t("terminal.workResult")})]})]}),e==="marriage"&&c.jsxs("div",{className:"space-y-4 animate-fadeIn",children:[c.jsxs("div",{className:"text-purple-400 font-bold flex items-center gap-2",children:[c.jsx("span",{className:"text-slate-500",children:"$"})," /py-casamento status"]}),c.jsxs("div",{className:"text-slate-200 font-bold flex items-center gap-2",children:[c.jsx("span",{children:t("terminal.marriageTitle")}),c.jsx("span",{className:"text-rose-400 animate-pulse",children:"💖"})]}),c.jsxs("div",{children:[c.jsxs("div",{className:"flex justify-between text-xs font-semibold text-rose-300 mb-1",children:[c.jsx("span",{children:t("terminal.loveBar")}),c.jsx("span",{children:"100%"})]}),c.jsx("div",{className:"w-full h-3 bg-purple-950/80 rounded-full overflow-hidden border border-purple-500/30 p-0.5",children:c.jsx("div",{className:"h-full bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 rounded-full animate-pulse w-full"})})]}),c.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs",children:[c.jsx("div",{className:"p-2.5 rounded-xl bg-white/5 border border-purple-500/20 text-slate-300",children:t("terminal.loveTree")}),c.jsx("div",{className:"p-2.5 rounded-xl bg-white/5 border border-purple-500/20 text-amber-300",children:t("terminal.loveVault")})]})]}),e==="tarot"&&c.jsxs("div",{className:"space-y-3 animate-fadeIn",children:[c.jsxs("div",{className:"text-cyan-400 font-bold flex items-center gap-2",children:[c.jsx("span",{className:"text-slate-500",children:"$"})," /py-tarot daily"]}),c.jsxs("div",{className:"text-amber-300 font-bold flex items-center gap-2",children:[c.jsx("span",{children:t("terminal.tarotTitle")}),c.jsx("span",{className:"text-cyan-300",children:"✦"})]}),c.jsxs("div",{className:"p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 space-y-2",children:[c.jsxs("div",{className:"text-pink-400 font-bold text-sm tracking-wide",children:["🔮 ",t("terminal.tarotCard")]}),c.jsxs("p",{className:"text-slate-300 text-xs italic leading-relaxed min-h-[48px]",children:[s,!o&&c.jsx("span",{className:"inline-block w-1.5 h-3.5 bg-pink-400 ml-1 animate-pulse"})]})]})]}),c.jsxs("div",{className:"pt-3 border-t border-purple-500/10 text-[11px] text-slate-500 flex justify-between items-center",children:[c.jsx("span",{children:"Pyxie Discord Engine v14"}),c.jsx("span",{className:"text-purple-400/80 font-semibold",children:"100% Interativo"})]})]})]})}function Ky({t,stats:e}){return c.jsxs("section",{className:"relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden",children:[c.jsx("div",{className:"absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none"}),c.jsx("div",{className:"absolute top-1/3 right-10 w-[450px] h-[450px] bg-pink-600/15 rounded-full blur-[130px] pointer-events-none"}),c.jsx("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10",children:c.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center",children:[c.jsxs("div",{className:"lg:col-span-7 text-center lg:text-left space-y-6",children:[c.jsxs("div",{className:"inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wide shadow-sm",children:[c.jsx("span",{className:"w-2 h-2 rounded-full bg-emerald-400 animate-ping"}),c.jsx("span",{children:t("hero.badge")})]}),c.jsxs("h1",{className:"font-title font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.12]",children:[c.jsx("span",{className:"text-white",children:"Pyxie"})," •"," ",c.jsx("span",{className:"text-slate-200",children:t("hero.titlePrefix")})," ",c.jsx("span",{className:"gradient-text-pink",children:t("hero.titleHighlight")})]}),c.jsx("p",{className:"text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal",children:t("hero.subtitle")}),c.jsxs("div",{className:"flex flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-2",children:[c.jsxs("div",{className:"flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-amber-500/25 text-xs font-semibold text-amber-300",children:[c.jsx(Ss,{className:"w-4 h-4 text-amber-400"}),c.jsx("span",{children:t("hero.badgeEconomy")})]}),c.jsxs("div",{className:"flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-purple-500/25 text-xs font-semibold text-purple-300",children:[c.jsx(da,{className:"w-4 h-4 text-purple-400"}),c.jsx("span",{children:t("hero.badgeCareers")})]}),c.jsxs("div",{className:"flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-emerald-500/25 text-xs font-semibold text-emerald-300",children:[c.jsx(_y,{className:"w-4 h-4 text-emerald-400"}),c.jsx("span",{children:(e==null?void 0:e.uptime)||"99.9% Uptime"})]})]}),c.jsxs("div",{className:"flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4",children:[c.jsxs("a",{href:"/invite",target:"_blank",rel:"noopener noreferrer",className:"w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-extrabold text-white bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 shadow-neon-pink transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3 border border-pink-400/30",children:[c.jsx(Dt,{className:"w-5 h-5 text-pink-200"}),c.jsx("span",{children:t("hero.btnInvite")})]}),c.jsxs("a",{href:"/discord",target:"_blank",rel:"noopener noreferrer",className:"w-full sm:w-auto px-7 py-4 rounded-2xl text-base font-bold text-slate-200 bg-white/5 hover:bg-white/10 border border-purple-500/30 hover:border-purple-500/60 transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2.5 backdrop-blur-xl",children:[c.jsx(ky,{className:"w-5 h-5 text-purple-400"}),c.jsx("span",{children:t("hero.btnSupport")})]})]})]}),c.jsx("div",{className:"lg:col-span-5 flex justify-center",children:c.jsx(Yy,{t})})]})})]})}/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Oh="169",Zy=0,yp=1,Qy=2,Xg=1,Jy=2,ii=3,qi=0,sn=1,Xn=2,Vi=0,ds=1,Ju=2,Sp=3,wp=4,eS=5,ur=100,tS=101,nS=102,iS=103,rS=104,sS=200,aS=201,oS=202,lS=203,ed=204,td=205,cS=206,uS=207,dS=208,hS=209,fS=210,pS=211,mS=212,gS=213,xS=214,nd=0,id=1,rd=2,Ms=3,sd=4,ad=5,od=6,ld=7,qg=0,vS=1,_S=2,Gi=0,yS=1,SS=2,wS=3,MS=4,ES=5,bS=6,TS=7,$g=300,Es=301,bs=302,cd=303,ud=304,Vl=306,dd=1e3,gr=1001,hd=1002,Mn=1003,AS=1004,uo=1005,Sn=1006,Mc=1007,xr=1008,gi=1009,Yg=1010,Kg=1011,La=1012,zh=1013,Tr=1014,li=1015,za=1016,Bh=1017,jh=1018,Ts=1020,Zg=35902,Qg=1021,Jg=1022,Fn=1023,ex=1024,tx=1025,hs=1026,As=1027,nx=1028,Hh=1029,ix=1030,Vh=1031,Gh=1033,Xo=33776,qo=33777,$o=33778,Yo=33779,fd=35840,pd=35841,md=35842,gd=35843,xd=36196,vd=37492,_d=37496,yd=37808,Sd=37809,wd=37810,Md=37811,Ed=37812,bd=37813,Td=37814,Ad=37815,Cd=37816,Rd=37817,Nd=37818,Pd=37819,Ld=37820,Dd=37821,Ko=36492,kd=36494,Id=36495,rx=36283,Ud=36284,Fd=36285,Od=36286,CS=3200,RS=3201,sx=0,NS=1,Li="",Vn="srgb",Qi="srgb-linear",Wh="display-p3",Gl="display-p3-linear",Ml="linear",ut="srgb",El="rec709",bl="p3",Lr=7680,Mp=519,PS=512,LS=513,DS=514,ax=515,kS=516,IS=517,US=518,FS=519,Ep=35044,bp="300 es",ci=2e3,Tl=2001;class Ls{addEventListener(e,n){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(n)===-1&&i[e].push(n)}hasEventListener(e,n){if(this._listeners===void 0)return!1;const i=this._listeners;return i[e]!==void 0&&i[e].indexOf(n)!==-1}removeEventListener(e,n){if(this._listeners===void 0)return;const r=this._listeners[e];if(r!==void 0){const s=r.indexOf(n);s!==-1&&r.splice(s,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const i=this._listeners[e.type];if(i!==void 0){e.target=this;const r=i.slice(0);for(let s=0,a=r.length;s<a;s++)r[s].call(this,e);e.target=null}}}const Ot=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Ec=Math.PI/180,zd=180/Math.PI;function Ba(){const t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Ot[t&255]+Ot[t>>8&255]+Ot[t>>16&255]+Ot[t>>24&255]+"-"+Ot[e&255]+Ot[e>>8&255]+"-"+Ot[e>>16&15|64]+Ot[e>>24&255]+"-"+Ot[n&63|128]+Ot[n>>8&255]+"-"+Ot[n>>16&255]+Ot[n>>24&255]+Ot[i&255]+Ot[i>>8&255]+Ot[i>>16&255]+Ot[i>>24&255]).toLowerCase()}function Jt(t,e,n){return Math.max(e,Math.min(n,t))}function OS(t,e){return(t%e+e)%e}function bc(t,e,n){return(1-n)*t+n*e}function Vs(t,e){switch(e.constructor){case Float32Array:return t;case Uint32Array:return t/4294967295;case Uint16Array:return t/65535;case Uint8Array:return t/255;case Int32Array:return Math.max(t/2147483647,-1);case Int16Array:return Math.max(t/32767,-1);case Int8Array:return Math.max(t/127,-1);default:throw new Error("Invalid component type.")}}function Zt(t,e){switch(e.constructor){case Float32Array:return t;case Uint32Array:return Math.round(t*4294967295);case Uint16Array:return Math.round(t*65535);case Uint8Array:return Math.round(t*255);case Int32Array:return Math.round(t*2147483647);case Int16Array:return Math.round(t*32767);case Int8Array:return Math.round(t*127);default:throw new Error("Invalid component type.")}}class Ke{constructor(e=0,n=0){Ke.prototype.isVector2=!0,this.x=e,this.y=n}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,n){return this.x=e,this.y=n,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const n=this.x,i=this.y,r=e.elements;return this.x=r[0]*n+r[3]*i+r[6],this.y=r[1]*n+r[4]*i+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,n){return this.x=Math.max(e.x,Math.min(n.x,this.x)),this.y=Math.max(e.y,Math.min(n.y,this.y)),this}clampScalar(e,n){return this.x=Math.max(e,Math.min(n,this.x)),this.y=Math.max(e,Math.min(n,this.y)),this}clampLength(e,n){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(n,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const n=Math.sqrt(this.lengthSq()*e.lengthSq());if(n===0)return Math.PI/2;const i=this.dot(e)/n;return Math.acos(Jt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const n=this.x-e.x,i=this.y-e.y;return n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this}lerpVectors(e,n,i){return this.x=e.x+(n.x-e.x)*i,this.y=e.y+(n.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this}rotateAround(e,n){const i=Math.cos(n),r=Math.sin(n),s=this.x-e.x,a=this.y-e.y;return this.x=s*i-a*r+e.x,this.y=s*r+a*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Be{constructor(e,n,i,r,s,a,o,l,u){Be.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,n,i,r,s,a,o,l,u)}set(e,n,i,r,s,a,o,l,u){const h=this.elements;return h[0]=e,h[1]=r,h[2]=o,h[3]=n,h[4]=s,h[5]=l,h[6]=i,h[7]=a,h[8]=u,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const n=this.elements,i=e.elements;return n[0]=i[0],n[1]=i[1],n[2]=i[2],n[3]=i[3],n[4]=i[4],n[5]=i[5],n[6]=i[6],n[7]=i[7],n[8]=i[8],this}extractBasis(e,n,i){return e.setFromMatrix3Column(this,0),n.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const n=e.elements;return this.set(n[0],n[4],n[8],n[1],n[5],n[9],n[2],n[6],n[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,n){const i=e.elements,r=n.elements,s=this.elements,a=i[0],o=i[3],l=i[6],u=i[1],h=i[4],p=i[7],f=i[2],g=i[5],v=i[8],S=r[0],m=r[3],d=r[6],_=r[1],x=r[4],M=r[7],P=r[2],T=r[5],A=r[8];return s[0]=a*S+o*_+l*P,s[3]=a*m+o*x+l*T,s[6]=a*d+o*M+l*A,s[1]=u*S+h*_+p*P,s[4]=u*m+h*x+p*T,s[7]=u*d+h*M+p*A,s[2]=f*S+g*_+v*P,s[5]=f*m+g*x+v*T,s[8]=f*d+g*M+v*A,this}multiplyScalar(e){const n=this.elements;return n[0]*=e,n[3]*=e,n[6]*=e,n[1]*=e,n[4]*=e,n[7]*=e,n[2]*=e,n[5]*=e,n[8]*=e,this}determinant(){const e=this.elements,n=e[0],i=e[1],r=e[2],s=e[3],a=e[4],o=e[5],l=e[6],u=e[7],h=e[8];return n*a*h-n*o*u-i*s*h+i*o*l+r*s*u-r*a*l}invert(){const e=this.elements,n=e[0],i=e[1],r=e[2],s=e[3],a=e[4],o=e[5],l=e[6],u=e[7],h=e[8],p=h*a-o*u,f=o*l-h*s,g=u*s-a*l,v=n*p+i*f+r*g;if(v===0)return this.set(0,0,0,0,0,0,0,0,0);const S=1/v;return e[0]=p*S,e[1]=(r*u-h*i)*S,e[2]=(o*i-r*a)*S,e[3]=f*S,e[4]=(h*n-r*l)*S,e[5]=(r*s-o*n)*S,e[6]=g*S,e[7]=(i*l-u*n)*S,e[8]=(a*n-i*s)*S,this}transpose(){let e;const n=this.elements;return e=n[1],n[1]=n[3],n[3]=e,e=n[2],n[2]=n[6],n[6]=e,e=n[5],n[5]=n[7],n[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const n=this.elements;return e[0]=n[0],e[1]=n[3],e[2]=n[6],e[3]=n[1],e[4]=n[4],e[5]=n[7],e[6]=n[2],e[7]=n[5],e[8]=n[8],this}setUvTransform(e,n,i,r,s,a,o){const l=Math.cos(s),u=Math.sin(s);return this.set(i*l,i*u,-i*(l*a+u*o)+a+e,-r*u,r*l,-r*(-u*a+l*o)+o+n,0,0,1),this}scale(e,n){return this.premultiply(Tc.makeScale(e,n)),this}rotate(e){return this.premultiply(Tc.makeRotation(-e)),this}translate(e,n){return this.premultiply(Tc.makeTranslation(e,n)),this}makeTranslation(e,n){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,n,0,0,1),this}makeRotation(e){const n=Math.cos(e),i=Math.sin(e);return this.set(n,-i,0,i,n,0,0,0,1),this}makeScale(e,n){return this.set(e,0,0,0,n,0,0,0,1),this}equals(e){const n=this.elements,i=e.elements;for(let r=0;r<9;r++)if(n[r]!==i[r])return!1;return!0}fromArray(e,n=0){for(let i=0;i<9;i++)this.elements[i]=e[i+n];return this}toArray(e=[],n=0){const i=this.elements;return e[n]=i[0],e[n+1]=i[1],e[n+2]=i[2],e[n+3]=i[3],e[n+4]=i[4],e[n+5]=i[5],e[n+6]=i[6],e[n+7]=i[7],e[n+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const Tc=new Be;function ox(t){for(let e=t.length-1;e>=0;--e)if(t[e]>=65535)return!0;return!1}function Da(t){return document.createElementNS("http://www.w3.org/1999/xhtml",t)}function zS(){const t=Da("canvas");return t.style.display="block",t}const Tp={};function Zo(t){t in Tp||(Tp[t]=!0,console.warn(t))}function BS(t,e,n){return new Promise(function(i,r){function s(){switch(t.clientWaitSync(e,t.SYNC_FLUSH_COMMANDS_BIT,0)){case t.WAIT_FAILED:r();break;case t.TIMEOUT_EXPIRED:setTimeout(s,n);break;default:i()}}setTimeout(s,n)})}function jS(t){const e=t.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function HS(t){const e=t.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const Ap=new Be().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),Cp=new Be().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),Gs={[Qi]:{transfer:Ml,primaries:El,luminanceCoefficients:[.2126,.7152,.0722],toReference:t=>t,fromReference:t=>t},[Vn]:{transfer:ut,primaries:El,luminanceCoefficients:[.2126,.7152,.0722],toReference:t=>t.convertSRGBToLinear(),fromReference:t=>t.convertLinearToSRGB()},[Gl]:{transfer:Ml,primaries:bl,luminanceCoefficients:[.2289,.6917,.0793],toReference:t=>t.applyMatrix3(Cp),fromReference:t=>t.applyMatrix3(Ap)},[Wh]:{transfer:ut,primaries:bl,luminanceCoefficients:[.2289,.6917,.0793],toReference:t=>t.convertSRGBToLinear().applyMatrix3(Cp),fromReference:t=>t.applyMatrix3(Ap).convertLinearToSRGB()}},VS=new Set([Qi,Gl]),tt={enabled:!0,_workingColorSpace:Qi,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(t){if(!VS.has(t))throw new Error(`Unsupported working color space, "${t}".`);this._workingColorSpace=t},convert:function(t,e,n){if(this.enabled===!1||e===n||!e||!n)return t;const i=Gs[e].toReference,r=Gs[n].fromReference;return r(i(t))},fromWorkingColorSpace:function(t,e){return this.convert(t,this._workingColorSpace,e)},toWorkingColorSpace:function(t,e){return this.convert(t,e,this._workingColorSpace)},getPrimaries:function(t){return Gs[t].primaries},getTransfer:function(t){return t===Li?Ml:Gs[t].transfer},getLuminanceCoefficients:function(t,e=this._workingColorSpace){return t.fromArray(Gs[e].luminanceCoefficients)}};function fs(t){return t<.04045?t*.0773993808:Math.pow(t*.9478672986+.0521327014,2.4)}function Ac(t){return t<.0031308?t*12.92:1.055*Math.pow(t,.41666)-.055}let Dr;class GS{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Dr===void 0&&(Dr=Da("canvas")),Dr.width=e.width,Dr.height=e.height;const i=Dr.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),n=Dr}return n.width>2048||n.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),n.toDataURL("image/jpeg",.6)):n.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const n=Da("canvas");n.width=e.width,n.height=e.height;const i=n.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const r=i.getImageData(0,0,e.width,e.height),s=r.data;for(let a=0;a<s.length;a++)s[a]=fs(s[a]/255)*255;return i.putImageData(r,0,0),n}else if(e.data){const n=e.data.slice(0);for(let i=0;i<n.length;i++)n instanceof Uint8Array||n instanceof Uint8ClampedArray?n[i]=Math.floor(fs(n[i]/255)*255):n[i]=fs(n[i]);return{data:n,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let WS=0;class lx{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:WS++}),this.uuid=Ba(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const n=e===void 0||typeof e=="string";if(!n&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let a=0,o=r.length;a<o;a++)r[a].isDataTexture?s.push(Cc(r[a].image)):s.push(Cc(r[a]))}else s=Cc(r);i.url=s}return n||(e.images[this.uuid]=i),i}}function Cc(t){return typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap?GS.getDataURL(t):t.data?{data:Array.from(t.data),width:t.width,height:t.height,type:t.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let XS=0;class Wt extends Ls{constructor(e=Wt.DEFAULT_IMAGE,n=Wt.DEFAULT_MAPPING,i=gr,r=gr,s=Sn,a=xr,o=Fn,l=gi,u=Wt.DEFAULT_ANISOTROPY,h=Li){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:XS++}),this.uuid=Ba(),this.name="",this.source=new lx(e),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=i,this.wrapT=r,this.magFilter=s,this.minFilter=a,this.anisotropy=u,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Ke(0,0),this.repeat=new Ke(1,1),this.center=new Ke(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Be,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const n=e===void 0||typeof e=="string";if(!n&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),n||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==$g)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case dd:e.x=e.x-Math.floor(e.x);break;case gr:e.x=e.x<0?0:1;break;case hd:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case dd:e.y=e.y-Math.floor(e.y);break;case gr:e.y=e.y<0?0:1;break;case hd:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Wt.DEFAULT_IMAGE=null;Wt.DEFAULT_MAPPING=$g;Wt.DEFAULT_ANISOTROPY=1;class st{constructor(e=0,n=0,i=0,r=1){st.prototype.isVector4=!0,this.x=e,this.y=n,this.z=i,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,n,i,r){return this.x=e,this.y=n,this.z=i,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;case 3:this.w=n;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this.z=e.z+n.z,this.w=e.w+n.w,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this.z+=e.z*n,this.w+=e.w*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this.z=e.z-n.z,this.w=e.w-n.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const n=this.x,i=this.y,r=this.z,s=this.w,a=e.elements;return this.x=a[0]*n+a[4]*i+a[8]*r+a[12]*s,this.y=a[1]*n+a[5]*i+a[9]*r+a[13]*s,this.z=a[2]*n+a[6]*i+a[10]*r+a[14]*s,this.w=a[3]*n+a[7]*i+a[11]*r+a[15]*s,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const n=Math.sqrt(1-e.w*e.w);return n<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/n,this.y=e.y/n,this.z=e.z/n),this}setAxisAngleFromRotationMatrix(e){let n,i,r,s;const l=e.elements,u=l[0],h=l[4],p=l[8],f=l[1],g=l[5],v=l[9],S=l[2],m=l[6],d=l[10];if(Math.abs(h-f)<.01&&Math.abs(p-S)<.01&&Math.abs(v-m)<.01){if(Math.abs(h+f)<.1&&Math.abs(p+S)<.1&&Math.abs(v+m)<.1&&Math.abs(u+g+d-3)<.1)return this.set(1,0,0,0),this;n=Math.PI;const x=(u+1)/2,M=(g+1)/2,P=(d+1)/2,T=(h+f)/4,A=(p+S)/4,N=(v+m)/4;return x>M&&x>P?x<.01?(i=0,r=.707106781,s=.707106781):(i=Math.sqrt(x),r=T/i,s=A/i):M>P?M<.01?(i=.707106781,r=0,s=.707106781):(r=Math.sqrt(M),i=T/r,s=N/r):P<.01?(i=.707106781,r=.707106781,s=0):(s=Math.sqrt(P),i=A/s,r=N/s),this.set(i,r,s,n),this}let _=Math.sqrt((m-v)*(m-v)+(p-S)*(p-S)+(f-h)*(f-h));return Math.abs(_)<.001&&(_=1),this.x=(m-v)/_,this.y=(p-S)/_,this.z=(f-h)/_,this.w=Math.acos((u+g+d-1)/2),this}setFromMatrixPosition(e){const n=e.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this.w=n[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,n){return this.x=Math.max(e.x,Math.min(n.x,this.x)),this.y=Math.max(e.y,Math.min(n.y,this.y)),this.z=Math.max(e.z,Math.min(n.z,this.z)),this.w=Math.max(e.w,Math.min(n.w,this.w)),this}clampScalar(e,n){return this.x=Math.max(e,Math.min(n,this.x)),this.y=Math.max(e,Math.min(n,this.y)),this.z=Math.max(e,Math.min(n,this.z)),this.w=Math.max(e,Math.min(n,this.w)),this}clampLength(e,n){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(n,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this.z+=(e.z-this.z)*n,this.w+=(e.w-this.w)*n,this}lerpVectors(e,n,i){return this.x=e.x+(n.x-e.x)*i,this.y=e.y+(n.y-e.y)*i,this.z=e.z+(n.z-e.z)*i,this.w=e.w+(n.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this.z=e[n+2],this.w=e[n+3],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e[n+2]=this.z,e[n+3]=this.w,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this.z=e.getZ(n),this.w=e.getW(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class qS extends Ls{constructor(e=1,n=1,i={}){super(),this.isRenderTarget=!0,this.width=e,this.height=n,this.depth=1,this.scissor=new st(0,0,e,n),this.scissorTest=!1,this.viewport=new st(0,0,e,n);const r={width:e,height:n,depth:1};i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Sn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},i);const s=new Wt(r,i.mapping,i.wrapS,i.wrapT,i.magFilter,i.minFilter,i.format,i.type,i.anisotropy,i.colorSpace);s.flipY=!1,s.generateMipmaps=i.generateMipmaps,s.internalFormat=i.internalFormat,this.textures=[];const a=i.count;for(let o=0;o<a;o++)this.textures[o]=s.clone(),this.textures[o].isRenderTargetTexture=!0;this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.depthTexture=i.depthTexture,this.samples=i.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,n,i=1){if(this.width!==e||this.height!==n||this.depth!==i){this.width=e,this.height=n,this.depth=i;for(let r=0,s=this.textures.length;r<s;r++)this.textures[r].image.width=e,this.textures[r].image.height=n,this.textures[r].image.depth=i;this.dispose()}this.viewport.set(0,0,e,n),this.scissor.set(0,0,e,n)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let i=0,r=e.textures.length;i<r;i++)this.textures[i]=e.textures[i].clone(),this.textures[i].isRenderTargetTexture=!0;const n=Object.assign({},e.texture.image);return this.texture.source=new lx(n),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Ar extends qS{constructor(e=1,n=1,i={}){super(e,n,i),this.isWebGLRenderTarget=!0}}class cx extends Wt{constructor(e=null,n=1,i=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:n,height:i,depth:r},this.magFilter=Mn,this.minFilter=Mn,this.wrapR=gr,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class $S extends Wt{constructor(e=null,n=1,i=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:n,height:i,depth:r},this.magFilter=Mn,this.minFilter=Mn,this.wrapR=gr,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class ja{constructor(e=0,n=0,i=0,r=1){this.isQuaternion=!0,this._x=e,this._y=n,this._z=i,this._w=r}static slerpFlat(e,n,i,r,s,a,o){let l=i[r+0],u=i[r+1],h=i[r+2],p=i[r+3];const f=s[a+0],g=s[a+1],v=s[a+2],S=s[a+3];if(o===0){e[n+0]=l,e[n+1]=u,e[n+2]=h,e[n+3]=p;return}if(o===1){e[n+0]=f,e[n+1]=g,e[n+2]=v,e[n+3]=S;return}if(p!==S||l!==f||u!==g||h!==v){let m=1-o;const d=l*f+u*g+h*v+p*S,_=d>=0?1:-1,x=1-d*d;if(x>Number.EPSILON){const P=Math.sqrt(x),T=Math.atan2(P,d*_);m=Math.sin(m*T)/P,o=Math.sin(o*T)/P}const M=o*_;if(l=l*m+f*M,u=u*m+g*M,h=h*m+v*M,p=p*m+S*M,m===1-o){const P=1/Math.sqrt(l*l+u*u+h*h+p*p);l*=P,u*=P,h*=P,p*=P}}e[n]=l,e[n+1]=u,e[n+2]=h,e[n+3]=p}static multiplyQuaternionsFlat(e,n,i,r,s,a){const o=i[r],l=i[r+1],u=i[r+2],h=i[r+3],p=s[a],f=s[a+1],g=s[a+2],v=s[a+3];return e[n]=o*v+h*p+l*g-u*f,e[n+1]=l*v+h*f+u*p-o*g,e[n+2]=u*v+h*g+o*f-l*p,e[n+3]=h*v-o*p-l*f-u*g,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,n,i,r){return this._x=e,this._y=n,this._z=i,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,n=!0){const i=e._x,r=e._y,s=e._z,a=e._order,o=Math.cos,l=Math.sin,u=o(i/2),h=o(r/2),p=o(s/2),f=l(i/2),g=l(r/2),v=l(s/2);switch(a){case"XYZ":this._x=f*h*p+u*g*v,this._y=u*g*p-f*h*v,this._z=u*h*v+f*g*p,this._w=u*h*p-f*g*v;break;case"YXZ":this._x=f*h*p+u*g*v,this._y=u*g*p-f*h*v,this._z=u*h*v-f*g*p,this._w=u*h*p+f*g*v;break;case"ZXY":this._x=f*h*p-u*g*v,this._y=u*g*p+f*h*v,this._z=u*h*v+f*g*p,this._w=u*h*p-f*g*v;break;case"ZYX":this._x=f*h*p-u*g*v,this._y=u*g*p+f*h*v,this._z=u*h*v-f*g*p,this._w=u*h*p+f*g*v;break;case"YZX":this._x=f*h*p+u*g*v,this._y=u*g*p+f*h*v,this._z=u*h*v-f*g*p,this._w=u*h*p-f*g*v;break;case"XZY":this._x=f*h*p-u*g*v,this._y=u*g*p-f*h*v,this._z=u*h*v+f*g*p,this._w=u*h*p+f*g*v;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return n===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,n){const i=n/2,r=Math.sin(i);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const n=e.elements,i=n[0],r=n[4],s=n[8],a=n[1],o=n[5],l=n[9],u=n[2],h=n[6],p=n[10],f=i+o+p;if(f>0){const g=.5/Math.sqrt(f+1);this._w=.25/g,this._x=(h-l)*g,this._y=(s-u)*g,this._z=(a-r)*g}else if(i>o&&i>p){const g=2*Math.sqrt(1+i-o-p);this._w=(h-l)/g,this._x=.25*g,this._y=(r+a)/g,this._z=(s+u)/g}else if(o>p){const g=2*Math.sqrt(1+o-i-p);this._w=(s-u)/g,this._x=(r+a)/g,this._y=.25*g,this._z=(l+h)/g}else{const g=2*Math.sqrt(1+p-i-o);this._w=(a-r)/g,this._x=(s+u)/g,this._y=(l+h)/g,this._z=.25*g}return this._onChangeCallback(),this}setFromUnitVectors(e,n){let i=e.dot(n)+1;return i<Number.EPSILON?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*n.z-e.z*n.y,this._y=e.z*n.x-e.x*n.z,this._z=e.x*n.y-e.y*n.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Jt(this.dot(e),-1,1)))}rotateTowards(e,n){const i=this.angleTo(e);if(i===0)return this;const r=Math.min(1,n/i);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,n){const i=e._x,r=e._y,s=e._z,a=e._w,o=n._x,l=n._y,u=n._z,h=n._w;return this._x=i*h+a*o+r*u-s*l,this._y=r*h+a*l+s*o-i*u,this._z=s*h+a*u+i*l-r*o,this._w=a*h-i*o-r*l-s*u,this._onChangeCallback(),this}slerp(e,n){if(n===0)return this;if(n===1)return this.copy(e);const i=this._x,r=this._y,s=this._z,a=this._w;let o=a*e._w+i*e._x+r*e._y+s*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=i,this._y=r,this._z=s,this;const l=1-o*o;if(l<=Number.EPSILON){const g=1-n;return this._w=g*a+n*this._w,this._x=g*i+n*this._x,this._y=g*r+n*this._y,this._z=g*s+n*this._z,this.normalize(),this}const u=Math.sqrt(l),h=Math.atan2(u,o),p=Math.sin((1-n)*h)/u,f=Math.sin(n*h)/u;return this._w=a*p+this._w*f,this._x=i*p+this._x*f,this._y=r*p+this._y*f,this._z=s*p+this._z*f,this._onChangeCallback(),this}slerpQuaternions(e,n,i){return this.copy(e).slerp(n,i)}random(){const e=2*Math.PI*Math.random(),n=2*Math.PI*Math.random(),i=Math.random(),r=Math.sqrt(1-i),s=Math.sqrt(i);return this.set(r*Math.sin(e),r*Math.cos(e),s*Math.sin(n),s*Math.cos(n))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,n=0){return this._x=e[n],this._y=e[n+1],this._z=e[n+2],this._w=e[n+3],this._onChangeCallback(),this}toArray(e=[],n=0){return e[n]=this._x,e[n+1]=this._y,e[n+2]=this._z,e[n+3]=this._w,e}fromBufferAttribute(e,n){return this._x=e.getX(n),this._y=e.getY(n),this._z=e.getZ(n),this._w=e.getW(n),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class F{constructor(e=0,n=0,i=0){F.prototype.isVector3=!0,this.x=e,this.y=n,this.z=i}set(e,n,i){return i===void 0&&(i=this.z),this.x=e,this.y=n,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this.z=e.z+n.z,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this.z+=e.z*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this.z=e.z-n.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,n){return this.x=e.x*n.x,this.y=e.y*n.y,this.z=e.z*n.z,this}applyEuler(e){return this.applyQuaternion(Rp.setFromEuler(e))}applyAxisAngle(e,n){return this.applyQuaternion(Rp.setFromAxisAngle(e,n))}applyMatrix3(e){const n=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*n+s[3]*i+s[6]*r,this.y=s[1]*n+s[4]*i+s[7]*r,this.z=s[2]*n+s[5]*i+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const n=this.x,i=this.y,r=this.z,s=e.elements,a=1/(s[3]*n+s[7]*i+s[11]*r+s[15]);return this.x=(s[0]*n+s[4]*i+s[8]*r+s[12])*a,this.y=(s[1]*n+s[5]*i+s[9]*r+s[13])*a,this.z=(s[2]*n+s[6]*i+s[10]*r+s[14])*a,this}applyQuaternion(e){const n=this.x,i=this.y,r=this.z,s=e.x,a=e.y,o=e.z,l=e.w,u=2*(a*r-o*i),h=2*(o*n-s*r),p=2*(s*i-a*n);return this.x=n+l*u+a*p-o*h,this.y=i+l*h+o*u-s*p,this.z=r+l*p+s*h-a*u,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const n=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*n+s[4]*i+s[8]*r,this.y=s[1]*n+s[5]*i+s[9]*r,this.z=s[2]*n+s[6]*i+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,n){return this.x=Math.max(e.x,Math.min(n.x,this.x)),this.y=Math.max(e.y,Math.min(n.y,this.y)),this.z=Math.max(e.z,Math.min(n.z,this.z)),this}clampScalar(e,n){return this.x=Math.max(e,Math.min(n,this.x)),this.y=Math.max(e,Math.min(n,this.y)),this.z=Math.max(e,Math.min(n,this.z)),this}clampLength(e,n){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(n,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this.z+=(e.z-this.z)*n,this}lerpVectors(e,n,i){return this.x=e.x+(n.x-e.x)*i,this.y=e.y+(n.y-e.y)*i,this.z=e.z+(n.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,n){const i=e.x,r=e.y,s=e.z,a=n.x,o=n.y,l=n.z;return this.x=r*l-s*o,this.y=s*a-i*l,this.z=i*o-r*a,this}projectOnVector(e){const n=e.lengthSq();if(n===0)return this.set(0,0,0);const i=e.dot(this)/n;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return Rc.copy(this).projectOnVector(e),this.sub(Rc)}reflect(e){return this.sub(Rc.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const n=Math.sqrt(this.lengthSq()*e.lengthSq());if(n===0)return Math.PI/2;const i=this.dot(e)/n;return Math.acos(Jt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const n=this.x-e.x,i=this.y-e.y,r=this.z-e.z;return n*n+i*i+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,n,i){const r=Math.sin(n)*e;return this.x=r*Math.sin(i),this.y=Math.cos(n)*e,this.z=r*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,n,i){return this.x=e*Math.sin(n),this.y=i,this.z=e*Math.cos(n),this}setFromMatrixPosition(e){const n=e.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this}setFromMatrixScale(e){const n=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=n,this.y=i,this.z=r,this}setFromMatrixColumn(e,n){return this.fromArray(e.elements,n*4)}setFromMatrix3Column(e,n){return this.fromArray(e.elements,n*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this.z=e[n+2],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e[n+2]=this.z,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this.z=e.getZ(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,n=Math.random()*2-1,i=Math.sqrt(1-n*n);return this.x=i*Math.cos(e),this.y=n,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Rc=new F,Rp=new ja;class Ha{constructor(e=new F(1/0,1/0,1/0),n=new F(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=n}set(e,n){return this.min.copy(e),this.max.copy(n),this}setFromArray(e){this.makeEmpty();for(let n=0,i=e.length;n<i;n+=3)this.expandByPoint(Nn.fromArray(e,n));return this}setFromBufferAttribute(e){this.makeEmpty();for(let n=0,i=e.count;n<i;n++)this.expandByPoint(Nn.fromBufferAttribute(e,n));return this}setFromPoints(e){this.makeEmpty();for(let n=0,i=e.length;n<i;n++)this.expandByPoint(e[n]);return this}setFromCenterAndSize(e,n){const i=Nn.copy(n).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,n=!1){return this.makeEmpty(),this.expandByObject(e,n)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,n=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0){const s=i.getAttribute("position");if(n===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=s.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,Nn):Nn.fromBufferAttribute(s,a),Nn.applyMatrix4(e.matrixWorld),this.expandByPoint(Nn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),ho.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),ho.copy(i.boundingBox)),ho.applyMatrix4(e.matrixWorld),this.union(ho)}const r=e.children;for(let s=0,a=r.length;s<a;s++)this.expandByObject(r[s],n);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,n){return n.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Nn),Nn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let n,i;return e.normal.x>0?(n=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(n=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(n+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(n+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(n+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(n+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),n<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Ws),fo.subVectors(this.max,Ws),kr.subVectors(e.a,Ws),Ir.subVectors(e.b,Ws),Ur.subVectors(e.c,Ws),wi.subVectors(Ir,kr),Mi.subVectors(Ur,Ir),er.subVectors(kr,Ur);let n=[0,-wi.z,wi.y,0,-Mi.z,Mi.y,0,-er.z,er.y,wi.z,0,-wi.x,Mi.z,0,-Mi.x,er.z,0,-er.x,-wi.y,wi.x,0,-Mi.y,Mi.x,0,-er.y,er.x,0];return!Nc(n,kr,Ir,Ur,fo)||(n=[1,0,0,0,1,0,0,0,1],!Nc(n,kr,Ir,Ur,fo))?!1:(po.crossVectors(wi,Mi),n=[po.x,po.y,po.z],Nc(n,kr,Ir,Ur,fo))}clampPoint(e,n){return n.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Nn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Nn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Qn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Qn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Qn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Qn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Qn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Qn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Qn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Qn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Qn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const Qn=[new F,new F,new F,new F,new F,new F,new F,new F],Nn=new F,ho=new Ha,kr=new F,Ir=new F,Ur=new F,wi=new F,Mi=new F,er=new F,Ws=new F,fo=new F,po=new F,tr=new F;function Nc(t,e,n,i,r){for(let s=0,a=t.length-3;s<=a;s+=3){tr.fromArray(t,s);const o=r.x*Math.abs(tr.x)+r.y*Math.abs(tr.y)+r.z*Math.abs(tr.z),l=e.dot(tr),u=n.dot(tr),h=i.dot(tr);if(Math.max(-Math.max(l,u,h),Math.min(l,u,h))>o)return!1}return!0}const YS=new Ha,Xs=new F,Pc=new F;class Wl{constructor(e=new F,n=-1){this.isSphere=!0,this.center=e,this.radius=n}set(e,n){return this.center.copy(e),this.radius=n,this}setFromPoints(e,n){const i=this.center;n!==void 0?i.copy(n):YS.setFromPoints(e).getCenter(i);let r=0;for(let s=0,a=e.length;s<a;s++)r=Math.max(r,i.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const n=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=n*n}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,n){const i=this.center.distanceToSquared(e);return n.copy(e),i>this.radius*this.radius&&(n.sub(this.center).normalize(),n.multiplyScalar(this.radius).add(this.center)),n}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Xs.subVectors(e,this.center);const n=Xs.lengthSq();if(n>this.radius*this.radius){const i=Math.sqrt(n),r=(i-this.radius)*.5;this.center.addScaledVector(Xs,r/i),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Pc.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Xs.copy(e.center).add(Pc)),this.expandByPoint(Xs.copy(e.center).sub(Pc))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const Jn=new F,Lc=new F,mo=new F,Ei=new F,Dc=new F,go=new F,kc=new F;class Xh{constructor(e=new F,n=new F(0,0,-1)){this.origin=e,this.direction=n}set(e,n){return this.origin.copy(e),this.direction.copy(n),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,n){return n.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Jn)),this}closestPointToPoint(e,n){n.subVectors(e,this.origin);const i=n.dot(this.direction);return i<0?n.copy(this.origin):n.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const n=Jn.subVectors(e,this.origin).dot(this.direction);return n<0?this.origin.distanceToSquared(e):(Jn.copy(this.origin).addScaledVector(this.direction,n),Jn.distanceToSquared(e))}distanceSqToSegment(e,n,i,r){Lc.copy(e).add(n).multiplyScalar(.5),mo.copy(n).sub(e).normalize(),Ei.copy(this.origin).sub(Lc);const s=e.distanceTo(n)*.5,a=-this.direction.dot(mo),o=Ei.dot(this.direction),l=-Ei.dot(mo),u=Ei.lengthSq(),h=Math.abs(1-a*a);let p,f,g,v;if(h>0)if(p=a*l-o,f=a*o-l,v=s*h,p>=0)if(f>=-v)if(f<=v){const S=1/h;p*=S,f*=S,g=p*(p+a*f+2*o)+f*(a*p+f+2*l)+u}else f=s,p=Math.max(0,-(a*f+o)),g=-p*p+f*(f+2*l)+u;else f=-s,p=Math.max(0,-(a*f+o)),g=-p*p+f*(f+2*l)+u;else f<=-v?(p=Math.max(0,-(-a*s+o)),f=p>0?-s:Math.min(Math.max(-s,-l),s),g=-p*p+f*(f+2*l)+u):f<=v?(p=0,f=Math.min(Math.max(-s,-l),s),g=f*(f+2*l)+u):(p=Math.max(0,-(a*s+o)),f=p>0?s:Math.min(Math.max(-s,-l),s),g=-p*p+f*(f+2*l)+u);else f=a>0?-s:s,p=Math.max(0,-(a*f+o)),g=-p*p+f*(f+2*l)+u;return i&&i.copy(this.origin).addScaledVector(this.direction,p),r&&r.copy(Lc).addScaledVector(mo,f),g}intersectSphere(e,n){Jn.subVectors(e.center,this.origin);const i=Jn.dot(this.direction),r=Jn.dot(Jn)-i*i,s=e.radius*e.radius;if(r>s)return null;const a=Math.sqrt(s-r),o=i-a,l=i+a;return l<0?null:o<0?this.at(l,n):this.at(o,n)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const n=e.normal.dot(this.direction);if(n===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/n;return i>=0?i:null}intersectPlane(e,n){const i=this.distanceToPlane(e);return i===null?null:this.at(i,n)}intersectsPlane(e){const n=e.distanceToPoint(this.origin);return n===0||e.normal.dot(this.direction)*n<0}intersectBox(e,n){let i,r,s,a,o,l;const u=1/this.direction.x,h=1/this.direction.y,p=1/this.direction.z,f=this.origin;return u>=0?(i=(e.min.x-f.x)*u,r=(e.max.x-f.x)*u):(i=(e.max.x-f.x)*u,r=(e.min.x-f.x)*u),h>=0?(s=(e.min.y-f.y)*h,a=(e.max.y-f.y)*h):(s=(e.max.y-f.y)*h,a=(e.min.y-f.y)*h),i>a||s>r||((s>i||isNaN(i))&&(i=s),(a<r||isNaN(r))&&(r=a),p>=0?(o=(e.min.z-f.z)*p,l=(e.max.z-f.z)*p):(o=(e.max.z-f.z)*p,l=(e.min.z-f.z)*p),i>l||o>r)||((o>i||i!==i)&&(i=o),(l<r||r!==r)&&(r=l),r<0)?null:this.at(i>=0?i:r,n)}intersectsBox(e){return this.intersectBox(e,Jn)!==null}intersectTriangle(e,n,i,r,s){Dc.subVectors(n,e),go.subVectors(i,e),kc.crossVectors(Dc,go);let a=this.direction.dot(kc),o;if(a>0){if(r)return null;o=1}else if(a<0)o=-1,a=-a;else return null;Ei.subVectors(this.origin,e);const l=o*this.direction.dot(go.crossVectors(Ei,go));if(l<0)return null;const u=o*this.direction.dot(Dc.cross(Ei));if(u<0||l+u>a)return null;const h=-o*Ei.dot(kc);return h<0?null:this.at(h/a,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class ht{constructor(e,n,i,r,s,a,o,l,u,h,p,f,g,v,S,m){ht.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,n,i,r,s,a,o,l,u,h,p,f,g,v,S,m)}set(e,n,i,r,s,a,o,l,u,h,p,f,g,v,S,m){const d=this.elements;return d[0]=e,d[4]=n,d[8]=i,d[12]=r,d[1]=s,d[5]=a,d[9]=o,d[13]=l,d[2]=u,d[6]=h,d[10]=p,d[14]=f,d[3]=g,d[7]=v,d[11]=S,d[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new ht().fromArray(this.elements)}copy(e){const n=this.elements,i=e.elements;return n[0]=i[0],n[1]=i[1],n[2]=i[2],n[3]=i[3],n[4]=i[4],n[5]=i[5],n[6]=i[6],n[7]=i[7],n[8]=i[8],n[9]=i[9],n[10]=i[10],n[11]=i[11],n[12]=i[12],n[13]=i[13],n[14]=i[14],n[15]=i[15],this}copyPosition(e){const n=this.elements,i=e.elements;return n[12]=i[12],n[13]=i[13],n[14]=i[14],this}setFromMatrix3(e){const n=e.elements;return this.set(n[0],n[3],n[6],0,n[1],n[4],n[7],0,n[2],n[5],n[8],0,0,0,0,1),this}extractBasis(e,n,i){return e.setFromMatrixColumn(this,0),n.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,n,i){return this.set(e.x,n.x,i.x,0,e.y,n.y,i.y,0,e.z,n.z,i.z,0,0,0,0,1),this}extractRotation(e){const n=this.elements,i=e.elements,r=1/Fr.setFromMatrixColumn(e,0).length(),s=1/Fr.setFromMatrixColumn(e,1).length(),a=1/Fr.setFromMatrixColumn(e,2).length();return n[0]=i[0]*r,n[1]=i[1]*r,n[2]=i[2]*r,n[3]=0,n[4]=i[4]*s,n[5]=i[5]*s,n[6]=i[6]*s,n[7]=0,n[8]=i[8]*a,n[9]=i[9]*a,n[10]=i[10]*a,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromEuler(e){const n=this.elements,i=e.x,r=e.y,s=e.z,a=Math.cos(i),o=Math.sin(i),l=Math.cos(r),u=Math.sin(r),h=Math.cos(s),p=Math.sin(s);if(e.order==="XYZ"){const f=a*h,g=a*p,v=o*h,S=o*p;n[0]=l*h,n[4]=-l*p,n[8]=u,n[1]=g+v*u,n[5]=f-S*u,n[9]=-o*l,n[2]=S-f*u,n[6]=v+g*u,n[10]=a*l}else if(e.order==="YXZ"){const f=l*h,g=l*p,v=u*h,S=u*p;n[0]=f+S*o,n[4]=v*o-g,n[8]=a*u,n[1]=a*p,n[5]=a*h,n[9]=-o,n[2]=g*o-v,n[6]=S+f*o,n[10]=a*l}else if(e.order==="ZXY"){const f=l*h,g=l*p,v=u*h,S=u*p;n[0]=f-S*o,n[4]=-a*p,n[8]=v+g*o,n[1]=g+v*o,n[5]=a*h,n[9]=S-f*o,n[2]=-a*u,n[6]=o,n[10]=a*l}else if(e.order==="ZYX"){const f=a*h,g=a*p,v=o*h,S=o*p;n[0]=l*h,n[4]=v*u-g,n[8]=f*u+S,n[1]=l*p,n[5]=S*u+f,n[9]=g*u-v,n[2]=-u,n[6]=o*l,n[10]=a*l}else if(e.order==="YZX"){const f=a*l,g=a*u,v=o*l,S=o*u;n[0]=l*h,n[4]=S-f*p,n[8]=v*p+g,n[1]=p,n[5]=a*h,n[9]=-o*h,n[2]=-u*h,n[6]=g*p+v,n[10]=f-S*p}else if(e.order==="XZY"){const f=a*l,g=a*u,v=o*l,S=o*u;n[0]=l*h,n[4]=-p,n[8]=u*h,n[1]=f*p+S,n[5]=a*h,n[9]=g*p-v,n[2]=v*p-g,n[6]=o*h,n[10]=S*p+f}return n[3]=0,n[7]=0,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromQuaternion(e){return this.compose(KS,e,ZS)}lookAt(e,n,i){const r=this.elements;return ln.subVectors(e,n),ln.lengthSq()===0&&(ln.z=1),ln.normalize(),bi.crossVectors(i,ln),bi.lengthSq()===0&&(Math.abs(i.z)===1?ln.x+=1e-4:ln.z+=1e-4,ln.normalize(),bi.crossVectors(i,ln)),bi.normalize(),xo.crossVectors(ln,bi),r[0]=bi.x,r[4]=xo.x,r[8]=ln.x,r[1]=bi.y,r[5]=xo.y,r[9]=ln.y,r[2]=bi.z,r[6]=xo.z,r[10]=ln.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,n){const i=e.elements,r=n.elements,s=this.elements,a=i[0],o=i[4],l=i[8],u=i[12],h=i[1],p=i[5],f=i[9],g=i[13],v=i[2],S=i[6],m=i[10],d=i[14],_=i[3],x=i[7],M=i[11],P=i[15],T=r[0],A=r[4],N=r[8],H=r[12],y=r[1],b=r[5],V=r[9],j=r[13],$=r[2],Q=r[6],G=r[10],Y=r[14],L=r[3],K=r[7],I=r[11],q=r[15];return s[0]=a*T+o*y+l*$+u*L,s[4]=a*A+o*b+l*Q+u*K,s[8]=a*N+o*V+l*G+u*I,s[12]=a*H+o*j+l*Y+u*q,s[1]=h*T+p*y+f*$+g*L,s[5]=h*A+p*b+f*Q+g*K,s[9]=h*N+p*V+f*G+g*I,s[13]=h*H+p*j+f*Y+g*q,s[2]=v*T+S*y+m*$+d*L,s[6]=v*A+S*b+m*Q+d*K,s[10]=v*N+S*V+m*G+d*I,s[14]=v*H+S*j+m*Y+d*q,s[3]=_*T+x*y+M*$+P*L,s[7]=_*A+x*b+M*Q+P*K,s[11]=_*N+x*V+M*G+P*I,s[15]=_*H+x*j+M*Y+P*q,this}multiplyScalar(e){const n=this.elements;return n[0]*=e,n[4]*=e,n[8]*=e,n[12]*=e,n[1]*=e,n[5]*=e,n[9]*=e,n[13]*=e,n[2]*=e,n[6]*=e,n[10]*=e,n[14]*=e,n[3]*=e,n[7]*=e,n[11]*=e,n[15]*=e,this}determinant(){const e=this.elements,n=e[0],i=e[4],r=e[8],s=e[12],a=e[1],o=e[5],l=e[9],u=e[13],h=e[2],p=e[6],f=e[10],g=e[14],v=e[3],S=e[7],m=e[11],d=e[15];return v*(+s*l*p-r*u*p-s*o*f+i*u*f+r*o*g-i*l*g)+S*(+n*l*g-n*u*f+s*a*f-r*a*g+r*u*h-s*l*h)+m*(+n*u*p-n*o*g-s*a*p+i*a*g+s*o*h-i*u*h)+d*(-r*o*h-n*l*p+n*o*f+r*a*p-i*a*f+i*l*h)}transpose(){const e=this.elements;let n;return n=e[1],e[1]=e[4],e[4]=n,n=e[2],e[2]=e[8],e[8]=n,n=e[6],e[6]=e[9],e[9]=n,n=e[3],e[3]=e[12],e[12]=n,n=e[7],e[7]=e[13],e[13]=n,n=e[11],e[11]=e[14],e[14]=n,this}setPosition(e,n,i){const r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=n,r[14]=i),this}invert(){const e=this.elements,n=e[0],i=e[1],r=e[2],s=e[3],a=e[4],o=e[5],l=e[6],u=e[7],h=e[8],p=e[9],f=e[10],g=e[11],v=e[12],S=e[13],m=e[14],d=e[15],_=p*m*u-S*f*u+S*l*g-o*m*g-p*l*d+o*f*d,x=v*f*u-h*m*u-v*l*g+a*m*g+h*l*d-a*f*d,M=h*S*u-v*p*u+v*o*g-a*S*g-h*o*d+a*p*d,P=v*p*l-h*S*l-v*o*f+a*S*f+h*o*m-a*p*m,T=n*_+i*x+r*M+s*P;if(T===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const A=1/T;return e[0]=_*A,e[1]=(S*f*s-p*m*s-S*r*g+i*m*g+p*r*d-i*f*d)*A,e[2]=(o*m*s-S*l*s+S*r*u-i*m*u-o*r*d+i*l*d)*A,e[3]=(p*l*s-o*f*s-p*r*u+i*f*u+o*r*g-i*l*g)*A,e[4]=x*A,e[5]=(h*m*s-v*f*s+v*r*g-n*m*g-h*r*d+n*f*d)*A,e[6]=(v*l*s-a*m*s-v*r*u+n*m*u+a*r*d-n*l*d)*A,e[7]=(a*f*s-h*l*s+h*r*u-n*f*u-a*r*g+n*l*g)*A,e[8]=M*A,e[9]=(v*p*s-h*S*s-v*i*g+n*S*g+h*i*d-n*p*d)*A,e[10]=(a*S*s-v*o*s+v*i*u-n*S*u-a*i*d+n*o*d)*A,e[11]=(h*o*s-a*p*s-h*i*u+n*p*u+a*i*g-n*o*g)*A,e[12]=P*A,e[13]=(h*S*r-v*p*r+v*i*f-n*S*f-h*i*m+n*p*m)*A,e[14]=(v*o*r-a*S*r-v*i*l+n*S*l+a*i*m-n*o*m)*A,e[15]=(a*p*r-h*o*r+h*i*l-n*p*l-a*i*f+n*o*f)*A,this}scale(e){const n=this.elements,i=e.x,r=e.y,s=e.z;return n[0]*=i,n[4]*=r,n[8]*=s,n[1]*=i,n[5]*=r,n[9]*=s,n[2]*=i,n[6]*=r,n[10]*=s,n[3]*=i,n[7]*=r,n[11]*=s,this}getMaxScaleOnAxis(){const e=this.elements,n=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(n,i,r))}makeTranslation(e,n,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,n,0,0,1,i,0,0,0,1),this}makeRotationX(e){const n=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,n,-i,0,0,i,n,0,0,0,0,1),this}makeRotationY(e){const n=Math.cos(e),i=Math.sin(e);return this.set(n,0,i,0,0,1,0,0,-i,0,n,0,0,0,0,1),this}makeRotationZ(e){const n=Math.cos(e),i=Math.sin(e);return this.set(n,-i,0,0,i,n,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,n){const i=Math.cos(n),r=Math.sin(n),s=1-i,a=e.x,o=e.y,l=e.z,u=s*a,h=s*o;return this.set(u*a+i,u*o-r*l,u*l+r*o,0,u*o+r*l,h*o+i,h*l-r*a,0,u*l-r*o,h*l+r*a,s*l*l+i,0,0,0,0,1),this}makeScale(e,n,i){return this.set(e,0,0,0,0,n,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,n,i,r,s,a){return this.set(1,i,s,0,e,1,a,0,n,r,1,0,0,0,0,1),this}compose(e,n,i){const r=this.elements,s=n._x,a=n._y,o=n._z,l=n._w,u=s+s,h=a+a,p=o+o,f=s*u,g=s*h,v=s*p,S=a*h,m=a*p,d=o*p,_=l*u,x=l*h,M=l*p,P=i.x,T=i.y,A=i.z;return r[0]=(1-(S+d))*P,r[1]=(g+M)*P,r[2]=(v-x)*P,r[3]=0,r[4]=(g-M)*T,r[5]=(1-(f+d))*T,r[6]=(m+_)*T,r[7]=0,r[8]=(v+x)*A,r[9]=(m-_)*A,r[10]=(1-(f+S))*A,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,n,i){const r=this.elements;let s=Fr.set(r[0],r[1],r[2]).length();const a=Fr.set(r[4],r[5],r[6]).length(),o=Fr.set(r[8],r[9],r[10]).length();this.determinant()<0&&(s=-s),e.x=r[12],e.y=r[13],e.z=r[14],Pn.copy(this);const u=1/s,h=1/a,p=1/o;return Pn.elements[0]*=u,Pn.elements[1]*=u,Pn.elements[2]*=u,Pn.elements[4]*=h,Pn.elements[5]*=h,Pn.elements[6]*=h,Pn.elements[8]*=p,Pn.elements[9]*=p,Pn.elements[10]*=p,n.setFromRotationMatrix(Pn),i.x=s,i.y=a,i.z=o,this}makePerspective(e,n,i,r,s,a,o=ci){const l=this.elements,u=2*s/(n-e),h=2*s/(i-r),p=(n+e)/(n-e),f=(i+r)/(i-r);let g,v;if(o===ci)g=-(a+s)/(a-s),v=-2*a*s/(a-s);else if(o===Tl)g=-a/(a-s),v=-a*s/(a-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=u,l[4]=0,l[8]=p,l[12]=0,l[1]=0,l[5]=h,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=g,l[14]=v,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,n,i,r,s,a,o=ci){const l=this.elements,u=1/(n-e),h=1/(i-r),p=1/(a-s),f=(n+e)*u,g=(i+r)*h;let v,S;if(o===ci)v=(a+s)*p,S=-2*p;else if(o===Tl)v=s*p,S=-1*p;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=2*u,l[4]=0,l[8]=0,l[12]=-f,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-g,l[2]=0,l[6]=0,l[10]=S,l[14]=-v,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const n=this.elements,i=e.elements;for(let r=0;r<16;r++)if(n[r]!==i[r])return!1;return!0}fromArray(e,n=0){for(let i=0;i<16;i++)this.elements[i]=e[i+n];return this}toArray(e=[],n=0){const i=this.elements;return e[n]=i[0],e[n+1]=i[1],e[n+2]=i[2],e[n+3]=i[3],e[n+4]=i[4],e[n+5]=i[5],e[n+6]=i[6],e[n+7]=i[7],e[n+8]=i[8],e[n+9]=i[9],e[n+10]=i[10],e[n+11]=i[11],e[n+12]=i[12],e[n+13]=i[13],e[n+14]=i[14],e[n+15]=i[15],e}}const Fr=new F,Pn=new ht,KS=new F(0,0,0),ZS=new F(1,1,1),bi=new F,xo=new F,ln=new F,Np=new ht,Pp=new ja;class Kn{constructor(e=0,n=0,i=0,r=Kn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=n,this._z=i,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,n,i,r=this._order){return this._x=e,this._y=n,this._z=i,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,n=this._order,i=!0){const r=e.elements,s=r[0],a=r[4],o=r[8],l=r[1],u=r[5],h=r[9],p=r[2],f=r[6],g=r[10];switch(n){case"XYZ":this._y=Math.asin(Jt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,g),this._z=Math.atan2(-a,s)):(this._x=Math.atan2(f,u),this._z=0);break;case"YXZ":this._x=Math.asin(-Jt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,g),this._z=Math.atan2(l,u)):(this._y=Math.atan2(-p,s),this._z=0);break;case"ZXY":this._x=Math.asin(Jt(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-p,g),this._z=Math.atan2(-a,u)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-Jt(p,-1,1)),Math.abs(p)<.9999999?(this._x=Math.atan2(f,g),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-a,u));break;case"YZX":this._z=Math.asin(Jt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,u),this._y=Math.atan2(-p,s)):(this._x=0,this._y=Math.atan2(o,g));break;case"XZY":this._z=Math.asin(-Jt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(f,u),this._y=Math.atan2(o,s)):(this._x=Math.atan2(-h,g),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+n)}return this._order=n,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,n,i){return Np.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Np,n,i)}setFromVector3(e,n=this._order){return this.set(e.x,e.y,e.z,n)}reorder(e){return Pp.setFromEuler(this),this.setFromQuaternion(Pp,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],n=0){return e[n]=this._x,e[n+1]=this._y,e[n+2]=this._z,e[n+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Kn.DEFAULT_ORDER="XYZ";class qh{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let QS=0;const Lp=new F,Or=new ja,ei=new ht,vo=new F,qs=new F,JS=new F,e1=new ja,Dp=new F(1,0,0),kp=new F(0,1,0),Ip=new F(0,0,1),Up={type:"added"},t1={type:"removed"},zr={type:"childadded",child:null},Ic={type:"childremoved",child:null};class Xt extends Ls{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:QS++}),this.uuid=Ba(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Xt.DEFAULT_UP.clone();const e=new F,n=new Kn,i=new ja,r=new F(1,1,1);function s(){i.setFromEuler(n,!1)}function a(){n.setFromQuaternion(i,void 0,!1)}n._onChange(s),i._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new ht},normalMatrix:{value:new Be}}),this.matrix=new ht,this.matrixWorld=new ht,this.matrixAutoUpdate=Xt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Xt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new qh,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,n){this.quaternion.setFromAxisAngle(e,n)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,n){return Or.setFromAxisAngle(e,n),this.quaternion.multiply(Or),this}rotateOnWorldAxis(e,n){return Or.setFromAxisAngle(e,n),this.quaternion.premultiply(Or),this}rotateX(e){return this.rotateOnAxis(Dp,e)}rotateY(e){return this.rotateOnAxis(kp,e)}rotateZ(e){return this.rotateOnAxis(Ip,e)}translateOnAxis(e,n){return Lp.copy(e).applyQuaternion(this.quaternion),this.position.add(Lp.multiplyScalar(n)),this}translateX(e){return this.translateOnAxis(Dp,e)}translateY(e){return this.translateOnAxis(kp,e)}translateZ(e){return this.translateOnAxis(Ip,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(ei.copy(this.matrixWorld).invert())}lookAt(e,n,i){e.isVector3?vo.copy(e):vo.set(e,n,i);const r=this.parent;this.updateWorldMatrix(!0,!1),qs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ei.lookAt(qs,vo,this.up):ei.lookAt(vo,qs,this.up),this.quaternion.setFromRotationMatrix(ei),r&&(ei.extractRotation(r.matrixWorld),Or.setFromRotationMatrix(ei),this.quaternion.premultiply(Or.invert()))}add(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.add(arguments[n]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Up),zr.child=e,this.dispatchEvent(zr),zr.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const n=this.children.indexOf(e);return n!==-1&&(e.parent=null,this.children.splice(n,1),e.dispatchEvent(t1),Ic.child=e,this.dispatchEvent(Ic),Ic.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),ei.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),ei.multiply(e.parent.matrixWorld)),e.applyMatrix4(ei),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Up),zr.child=e,this.dispatchEvent(zr),zr.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,n){if(this[e]===n)return this;for(let i=0,r=this.children.length;i<r;i++){const a=this.children[i].getObjectByProperty(e,n);if(a!==void 0)return a}}getObjectsByProperty(e,n,i=[]){this[e]===n&&i.push(this);const r=this.children;for(let s=0,a=r.length;s<a;s++)r[s].getObjectsByProperty(e,n,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(qs,e,JS),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(qs,e1,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const n=this.matrixWorld.elements;return e.set(n[8],n[9],n[10]).normalize()}raycast(){}traverse(e){e(this);const n=this.children;for(let i=0,r=n.length;i<r;i++)n[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const n=this.children;for(let i=0,r=n.length;i<r;i++)n[i].traverseVisible(e)}traverseAncestors(e){const n=this.parent;n!==null&&(e(n),n.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const n=this.children;for(let i=0,r=n.length;i<r;i++)n[i].updateMatrixWorld(e)}updateWorldMatrix(e,n){const i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),n===!0){const r=this.children;for(let s=0,a=r.length;s<a;s++)r[s].updateWorldMatrix(!1,!0)}}toJSON(e){const n=e===void 0||typeof e=="string",i={};n&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.visibility=this._visibility,r.active=this._active,r.bounds=this._bounds.map(o=>({boxInitialized:o.boxInitialized,boxMin:o.box.min.toArray(),boxMax:o.box.max.toArray(),sphereInitialized:o.sphereInitialized,sphereRadius:o.sphere.radius,sphereCenter:o.sphere.center.toArray()})),r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.geometryCount=this._geometryCount,r.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere={center:r.boundingSphere.center.toArray(),radius:r.boundingSphere.radius}),this.boundingBox!==null&&(r.boundingBox={min:r.boundingBox.min.toArray(),max:r.boundingBox.max.toArray()}));function s(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let u=0,h=l.length;u<h;u++){const p=l[u];s(e.shapes,p)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,u=this.material.length;l<u;l++)o.push(s(e.materials,this.material[l]));r.material=o}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let o=0;o<this.children.length;o++)r.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];r.animations.push(s(e.animations,l))}}if(n){const o=a(e.geometries),l=a(e.materials),u=a(e.textures),h=a(e.images),p=a(e.shapes),f=a(e.skeletons),g=a(e.animations),v=a(e.nodes);o.length>0&&(i.geometries=o),l.length>0&&(i.materials=l),u.length>0&&(i.textures=u),h.length>0&&(i.images=h),p.length>0&&(i.shapes=p),f.length>0&&(i.skeletons=f),g.length>0&&(i.animations=g),v.length>0&&(i.nodes=v)}return i.object=r,i;function a(o){const l=[];for(const u in o){const h=o[u];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,n=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),n===!0)for(let i=0;i<e.children.length;i++){const r=e.children[i];this.add(r.clone())}return this}}Xt.DEFAULT_UP=new F(0,1,0);Xt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Xt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Ln=new F,ti=new F,Uc=new F,ni=new F,Br=new F,jr=new F,Fp=new F,Fc=new F,Oc=new F,zc=new F,Bc=new st,jc=new st,Hc=new st;class Un{constructor(e=new F,n=new F,i=new F){this.a=e,this.b=n,this.c=i}static getNormal(e,n,i,r){r.subVectors(i,n),Ln.subVectors(e,n),r.cross(Ln);const s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,n,i,r,s){Ln.subVectors(r,n),ti.subVectors(i,n),Uc.subVectors(e,n);const a=Ln.dot(Ln),o=Ln.dot(ti),l=Ln.dot(Uc),u=ti.dot(ti),h=ti.dot(Uc),p=a*u-o*o;if(p===0)return s.set(0,0,0),null;const f=1/p,g=(u*l-o*h)*f,v=(a*h-o*l)*f;return s.set(1-g-v,v,g)}static containsPoint(e,n,i,r){return this.getBarycoord(e,n,i,r,ni)===null?!1:ni.x>=0&&ni.y>=0&&ni.x+ni.y<=1}static getInterpolation(e,n,i,r,s,a,o,l){return this.getBarycoord(e,n,i,r,ni)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,ni.x),l.addScaledVector(a,ni.y),l.addScaledVector(o,ni.z),l)}static getInterpolatedAttribute(e,n,i,r,s,a){return Bc.setScalar(0),jc.setScalar(0),Hc.setScalar(0),Bc.fromBufferAttribute(e,n),jc.fromBufferAttribute(e,i),Hc.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(Bc,s.x),a.addScaledVector(jc,s.y),a.addScaledVector(Hc,s.z),a}static isFrontFacing(e,n,i,r){return Ln.subVectors(i,n),ti.subVectors(e,n),Ln.cross(ti).dot(r)<0}set(e,n,i){return this.a.copy(e),this.b.copy(n),this.c.copy(i),this}setFromPointsAndIndices(e,n,i,r){return this.a.copy(e[n]),this.b.copy(e[i]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,n,i,r){return this.a.fromBufferAttribute(e,n),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Ln.subVectors(this.c,this.b),ti.subVectors(this.a,this.b),Ln.cross(ti).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return Un.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,n){return Un.getBarycoord(e,this.a,this.b,this.c,n)}getInterpolation(e,n,i,r,s){return Un.getInterpolation(e,this.a,this.b,this.c,n,i,r,s)}containsPoint(e){return Un.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return Un.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,n){const i=this.a,r=this.b,s=this.c;let a,o;Br.subVectors(r,i),jr.subVectors(s,i),Fc.subVectors(e,i);const l=Br.dot(Fc),u=jr.dot(Fc);if(l<=0&&u<=0)return n.copy(i);Oc.subVectors(e,r);const h=Br.dot(Oc),p=jr.dot(Oc);if(h>=0&&p<=h)return n.copy(r);const f=l*p-h*u;if(f<=0&&l>=0&&h<=0)return a=l/(l-h),n.copy(i).addScaledVector(Br,a);zc.subVectors(e,s);const g=Br.dot(zc),v=jr.dot(zc);if(v>=0&&g<=v)return n.copy(s);const S=g*u-l*v;if(S<=0&&u>=0&&v<=0)return o=u/(u-v),n.copy(i).addScaledVector(jr,o);const m=h*v-g*p;if(m<=0&&p-h>=0&&g-v>=0)return Fp.subVectors(s,r),o=(p-h)/(p-h+(g-v)),n.copy(r).addScaledVector(Fp,o);const d=1/(m+S+f);return a=S*d,o=f*d,n.copy(i).addScaledVector(Br,a).addScaledVector(jr,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const ux={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ti={h:0,s:0,l:0},_o={h:0,s:0,l:0};function Vc(t,e,n){return n<0&&(n+=1),n>1&&(n-=1),n<1/6?t+(e-t)*6*n:n<1/2?e:n<2/3?t+(e-t)*6*(2/3-n):t}class Xe{constructor(e,n,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,n,i)}set(e,n,i){if(n===void 0&&i===void 0){const r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,n,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,n=Vn){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,tt.toWorkingColorSpace(this,n),this}setRGB(e,n,i,r=tt.workingColorSpace){return this.r=e,this.g=n,this.b=i,tt.toWorkingColorSpace(this,r),this}setHSL(e,n,i,r=tt.workingColorSpace){if(e=OS(e,1),n=Jt(n,0,1),i=Jt(i,0,1),n===0)this.r=this.g=this.b=i;else{const s=i<=.5?i*(1+n):i+n-i*n,a=2*i-s;this.r=Vc(a,s,e+1/3),this.g=Vc(a,s,e),this.b=Vc(a,s,e-1/3)}return tt.toWorkingColorSpace(this,r),this}setStyle(e,n=Vn){function i(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s;const a=r[1],o=r[2];switch(a){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,n);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,n);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,n);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){const s=r[1],a=s.length;if(a===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,n);if(a===6)return this.setHex(parseInt(s,16),n);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,n);return this}setColorName(e,n=Vn){const i=ux[e.toLowerCase()];return i!==void 0?this.setHex(i,n):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=fs(e.r),this.g=fs(e.g),this.b=fs(e.b),this}copyLinearToSRGB(e){return this.r=Ac(e.r),this.g=Ac(e.g),this.b=Ac(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Vn){return tt.fromWorkingColorSpace(zt.copy(this),e),Math.round(Jt(zt.r*255,0,255))*65536+Math.round(Jt(zt.g*255,0,255))*256+Math.round(Jt(zt.b*255,0,255))}getHexString(e=Vn){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,n=tt.workingColorSpace){tt.fromWorkingColorSpace(zt.copy(this),n);const i=zt.r,r=zt.g,s=zt.b,a=Math.max(i,r,s),o=Math.min(i,r,s);let l,u;const h=(o+a)/2;if(o===a)l=0,u=0;else{const p=a-o;switch(u=h<=.5?p/(a+o):p/(2-a-o),a){case i:l=(r-s)/p+(r<s?6:0);break;case r:l=(s-i)/p+2;break;case s:l=(i-r)/p+4;break}l/=6}return e.h=l,e.s=u,e.l=h,e}getRGB(e,n=tt.workingColorSpace){return tt.fromWorkingColorSpace(zt.copy(this),n),e.r=zt.r,e.g=zt.g,e.b=zt.b,e}getStyle(e=Vn){tt.fromWorkingColorSpace(zt.copy(this),e);const n=zt.r,i=zt.g,r=zt.b;return e!==Vn?`color(${e} ${n.toFixed(3)} ${i.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(n*255)},${Math.round(i*255)},${Math.round(r*255)})`}offsetHSL(e,n,i){return this.getHSL(Ti),this.setHSL(Ti.h+e,Ti.s+n,Ti.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,n){return this.r=e.r+n.r,this.g=e.g+n.g,this.b=e.b+n.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,n){return this.r+=(e.r-this.r)*n,this.g+=(e.g-this.g)*n,this.b+=(e.b-this.b)*n,this}lerpColors(e,n,i){return this.r=e.r+(n.r-e.r)*i,this.g=e.g+(n.g-e.g)*i,this.b=e.b+(n.b-e.b)*i,this}lerpHSL(e,n){this.getHSL(Ti),e.getHSL(_o);const i=bc(Ti.h,_o.h,n),r=bc(Ti.s,_o.s,n),s=bc(Ti.l,_o.l,n);return this.setHSL(i,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const n=this.r,i=this.g,r=this.b,s=e.elements;return this.r=s[0]*n+s[3]*i+s[6]*r,this.g=s[1]*n+s[4]*i+s[7]*r,this.b=s[2]*n+s[5]*i+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,n=0){return this.r=e[n],this.g=e[n+1],this.b=e[n+2],this}toArray(e=[],n=0){return e[n]=this.r,e[n+1]=this.g,e[n+2]=this.b,e}fromBufferAttribute(e,n){return this.r=e.getX(n),this.g=e.getY(n),this.b=e.getZ(n),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const zt=new Xe;Xe.NAMES=ux;let n1=0;class Ds extends Ls{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:n1++}),this.uuid=Ba(),this.name="",this.type="Material",this.blending=ds,this.side=qi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=ed,this.blendDst=td,this.blendEquation=ur,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Xe(0,0,0),this.blendAlpha=0,this.depthFunc=Ms,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Mp,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Lr,this.stencilZFail=Lr,this.stencilZPass=Lr,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const n in e){const i=e[n];if(i===void 0){console.warn(`THREE.Material: parameter '${n}' has value of undefined.`);continue}const r=this[n];if(r===void 0){console.warn(`THREE.Material: '${n}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(i):r&&r.isVector3&&i&&i.isVector3?r.copy(i):this[n]=i}}toJSON(e){const n=e===void 0||typeof e=="string";n&&(e={textures:{},images:{}});const i={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==ds&&(i.blending=this.blending),this.side!==qi&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==ed&&(i.blendSrc=this.blendSrc),this.blendDst!==td&&(i.blendDst=this.blendDst),this.blendEquation!==ur&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==Ms&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Mp&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Lr&&(i.stencilFail=this.stencilFail),this.stencilZFail!==Lr&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==Lr&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function r(s){const a=[];for(const o in s){const l=s[o];delete l.metadata,a.push(l)}return a}if(n){const s=r(e.textures),a=r(e.images);s.length>0&&(i.textures=s),a.length>0&&(i.images=a)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const n=e.clippingPlanes;let i=null;if(n!==null){const r=n.length;i=new Array(r);for(let s=0;s!==r;++s)i[s]=n[s].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class dx extends Ds{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Xe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Kn,this.combine=qg,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const wt=new F,yo=new Ke;class bn{constructor(e,n,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=n,this.count=e!==void 0?e.length/n:0,this.normalized=i,this.usage=Ep,this.updateRanges=[],this.gpuType=li,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,n){this.updateRanges.push({start:e,count:n})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,n,i){e*=this.itemSize,i*=n.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=n.array[i+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let n=0,i=this.count;n<i;n++)yo.fromBufferAttribute(this,n),yo.applyMatrix3(e),this.setXY(n,yo.x,yo.y);else if(this.itemSize===3)for(let n=0,i=this.count;n<i;n++)wt.fromBufferAttribute(this,n),wt.applyMatrix3(e),this.setXYZ(n,wt.x,wt.y,wt.z);return this}applyMatrix4(e){for(let n=0,i=this.count;n<i;n++)wt.fromBufferAttribute(this,n),wt.applyMatrix4(e),this.setXYZ(n,wt.x,wt.y,wt.z);return this}applyNormalMatrix(e){for(let n=0,i=this.count;n<i;n++)wt.fromBufferAttribute(this,n),wt.applyNormalMatrix(e),this.setXYZ(n,wt.x,wt.y,wt.z);return this}transformDirection(e){for(let n=0,i=this.count;n<i;n++)wt.fromBufferAttribute(this,n),wt.transformDirection(e),this.setXYZ(n,wt.x,wt.y,wt.z);return this}set(e,n=0){return this.array.set(e,n),this}getComponent(e,n){let i=this.array[e*this.itemSize+n];return this.normalized&&(i=Vs(i,this.array)),i}setComponent(e,n,i){return this.normalized&&(i=Zt(i,this.array)),this.array[e*this.itemSize+n]=i,this}getX(e){let n=this.array[e*this.itemSize];return this.normalized&&(n=Vs(n,this.array)),n}setX(e,n){return this.normalized&&(n=Zt(n,this.array)),this.array[e*this.itemSize]=n,this}getY(e){let n=this.array[e*this.itemSize+1];return this.normalized&&(n=Vs(n,this.array)),n}setY(e,n){return this.normalized&&(n=Zt(n,this.array)),this.array[e*this.itemSize+1]=n,this}getZ(e){let n=this.array[e*this.itemSize+2];return this.normalized&&(n=Vs(n,this.array)),n}setZ(e,n){return this.normalized&&(n=Zt(n,this.array)),this.array[e*this.itemSize+2]=n,this}getW(e){let n=this.array[e*this.itemSize+3];return this.normalized&&(n=Vs(n,this.array)),n}setW(e,n){return this.normalized&&(n=Zt(n,this.array)),this.array[e*this.itemSize+3]=n,this}setXY(e,n,i){return e*=this.itemSize,this.normalized&&(n=Zt(n,this.array),i=Zt(i,this.array)),this.array[e+0]=n,this.array[e+1]=i,this}setXYZ(e,n,i,r){return e*=this.itemSize,this.normalized&&(n=Zt(n,this.array),i=Zt(i,this.array),r=Zt(r,this.array)),this.array[e+0]=n,this.array[e+1]=i,this.array[e+2]=r,this}setXYZW(e,n,i,r,s){return e*=this.itemSize,this.normalized&&(n=Zt(n,this.array),i=Zt(i,this.array),r=Zt(r,this.array),s=Zt(s,this.array)),this.array[e+0]=n,this.array[e+1]=i,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Ep&&(e.usage=this.usage),e}}class hx extends bn{constructor(e,n,i){super(new Uint16Array(e),n,i)}}class fx extends bn{constructor(e,n,i){super(new Uint32Array(e),n,i)}}class yr extends bn{constructor(e,n,i){super(new Float32Array(e),n,i)}}let i1=0;const vn=new ht,Gc=new Xt,Hr=new F,cn=new Ha,$s=new Ha,Ct=new F;class vi extends Ls{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:i1++}),this.uuid=Ba(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(ox(e)?fx:hx)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,n){return this.attributes[e]=n,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,n,i=0){this.groups.push({start:e,count:n,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,n){this.drawRange.start=e,this.drawRange.count=n}applyMatrix4(e){const n=this.attributes.position;n!==void 0&&(n.applyMatrix4(e),n.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const s=new Be().getNormalMatrix(e);i.applyNormalMatrix(s),i.needsUpdate=!0}const r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return vn.makeRotationFromQuaternion(e),this.applyMatrix4(vn),this}rotateX(e){return vn.makeRotationX(e),this.applyMatrix4(vn),this}rotateY(e){return vn.makeRotationY(e),this.applyMatrix4(vn),this}rotateZ(e){return vn.makeRotationZ(e),this.applyMatrix4(vn),this}translate(e,n,i){return vn.makeTranslation(e,n,i),this.applyMatrix4(vn),this}scale(e,n,i){return vn.makeScale(e,n,i),this.applyMatrix4(vn),this}lookAt(e){return Gc.lookAt(e),Gc.updateMatrix(),this.applyMatrix4(Gc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Hr).negate(),this.translate(Hr.x,Hr.y,Hr.z),this}setFromPoints(e){const n=[];for(let i=0,r=e.length;i<r;i++){const s=e[i];n.push(s.x,s.y,s.z||0)}return this.setAttribute("position",new yr(n,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Ha);const e=this.attributes.position,n=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new F(-1/0,-1/0,-1/0),new F(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),n)for(let i=0,r=n.length;i<r;i++){const s=n[i];cn.setFromBufferAttribute(s),this.morphTargetsRelative?(Ct.addVectors(this.boundingBox.min,cn.min),this.boundingBox.expandByPoint(Ct),Ct.addVectors(this.boundingBox.max,cn.max),this.boundingBox.expandByPoint(Ct)):(this.boundingBox.expandByPoint(cn.min),this.boundingBox.expandByPoint(cn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Wl);const e=this.attributes.position,n=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new F,1/0);return}if(e){const i=this.boundingSphere.center;if(cn.setFromBufferAttribute(e),n)for(let s=0,a=n.length;s<a;s++){const o=n[s];$s.setFromBufferAttribute(o),this.morphTargetsRelative?(Ct.addVectors(cn.min,$s.min),cn.expandByPoint(Ct),Ct.addVectors(cn.max,$s.max),cn.expandByPoint(Ct)):(cn.expandByPoint($s.min),cn.expandByPoint($s.max))}cn.getCenter(i);let r=0;for(let s=0,a=e.count;s<a;s++)Ct.fromBufferAttribute(e,s),r=Math.max(r,i.distanceToSquared(Ct));if(n)for(let s=0,a=n.length;s<a;s++){const o=n[s],l=this.morphTargetsRelative;for(let u=0,h=o.count;u<h;u++)Ct.fromBufferAttribute(o,u),l&&(Hr.fromBufferAttribute(e,u),Ct.add(Hr)),r=Math.max(r,i.distanceToSquared(Ct))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,n=this.attributes;if(e===null||n.position===void 0||n.normal===void 0||n.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=n.position,r=n.normal,s=n.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new bn(new Float32Array(4*i.count),4));const a=this.getAttribute("tangent"),o=[],l=[];for(let N=0;N<i.count;N++)o[N]=new F,l[N]=new F;const u=new F,h=new F,p=new F,f=new Ke,g=new Ke,v=new Ke,S=new F,m=new F;function d(N,H,y){u.fromBufferAttribute(i,N),h.fromBufferAttribute(i,H),p.fromBufferAttribute(i,y),f.fromBufferAttribute(s,N),g.fromBufferAttribute(s,H),v.fromBufferAttribute(s,y),h.sub(u),p.sub(u),g.sub(f),v.sub(f);const b=1/(g.x*v.y-v.x*g.y);isFinite(b)&&(S.copy(h).multiplyScalar(v.y).addScaledVector(p,-g.y).multiplyScalar(b),m.copy(p).multiplyScalar(g.x).addScaledVector(h,-v.x).multiplyScalar(b),o[N].add(S),o[H].add(S),o[y].add(S),l[N].add(m),l[H].add(m),l[y].add(m))}let _=this.groups;_.length===0&&(_=[{start:0,count:e.count}]);for(let N=0,H=_.length;N<H;++N){const y=_[N],b=y.start,V=y.count;for(let j=b,$=b+V;j<$;j+=3)d(e.getX(j+0),e.getX(j+1),e.getX(j+2))}const x=new F,M=new F,P=new F,T=new F;function A(N){P.fromBufferAttribute(r,N),T.copy(P);const H=o[N];x.copy(H),x.sub(P.multiplyScalar(P.dot(H))).normalize(),M.crossVectors(T,H);const b=M.dot(l[N])<0?-1:1;a.setXYZW(N,x.x,x.y,x.z,b)}for(let N=0,H=_.length;N<H;++N){const y=_[N],b=y.start,V=y.count;for(let j=b,$=b+V;j<$;j+=3)A(e.getX(j+0)),A(e.getX(j+1)),A(e.getX(j+2))}}computeVertexNormals(){const e=this.index,n=this.getAttribute("position");if(n!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new bn(new Float32Array(n.count*3),3),this.setAttribute("normal",i);else for(let f=0,g=i.count;f<g;f++)i.setXYZ(f,0,0,0);const r=new F,s=new F,a=new F,o=new F,l=new F,u=new F,h=new F,p=new F;if(e)for(let f=0,g=e.count;f<g;f+=3){const v=e.getX(f+0),S=e.getX(f+1),m=e.getX(f+2);r.fromBufferAttribute(n,v),s.fromBufferAttribute(n,S),a.fromBufferAttribute(n,m),h.subVectors(a,s),p.subVectors(r,s),h.cross(p),o.fromBufferAttribute(i,v),l.fromBufferAttribute(i,S),u.fromBufferAttribute(i,m),o.add(h),l.add(h),u.add(h),i.setXYZ(v,o.x,o.y,o.z),i.setXYZ(S,l.x,l.y,l.z),i.setXYZ(m,u.x,u.y,u.z)}else for(let f=0,g=n.count;f<g;f+=3)r.fromBufferAttribute(n,f+0),s.fromBufferAttribute(n,f+1),a.fromBufferAttribute(n,f+2),h.subVectors(a,s),p.subVectors(r,s),h.cross(p),i.setXYZ(f+0,h.x,h.y,h.z),i.setXYZ(f+1,h.x,h.y,h.z),i.setXYZ(f+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let n=0,i=e.count;n<i;n++)Ct.fromBufferAttribute(e,n),Ct.normalize(),e.setXYZ(n,Ct.x,Ct.y,Ct.z)}toNonIndexed(){function e(o,l){const u=o.array,h=o.itemSize,p=o.normalized,f=new u.constructor(l.length*h);let g=0,v=0;for(let S=0,m=l.length;S<m;S++){o.isInterleavedBufferAttribute?g=l[S]*o.data.stride+o.offset:g=l[S]*h;for(let d=0;d<h;d++)f[v++]=u[g++]}return new bn(f,h,p)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const n=new vi,i=this.index.array,r=this.attributes;for(const o in r){const l=r[o],u=e(l,i);n.setAttribute(o,u)}const s=this.morphAttributes;for(const o in s){const l=[],u=s[o];for(let h=0,p=u.length;h<p;h++){const f=u[h],g=e(f,i);l.push(g)}n.morphAttributes[o]=l}n.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const u=a[o];n.addGroup(u.start,u.count,u.materialIndex)}return n}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const u in l)l[u]!==void 0&&(e[u]=l[u]);return e}e.data={attributes:{}};const n=this.index;n!==null&&(e.data.index={type:n.array.constructor.name,array:Array.prototype.slice.call(n.array)});const i=this.attributes;for(const l in i){const u=i[l];e.data.attributes[l]=u.toJSON(e.data)}const r={};let s=!1;for(const l in this.morphAttributes){const u=this.morphAttributes[l],h=[];for(let p=0,f=u.length;p<f;p++){const g=u[p];h.push(g.toJSON(e.data))}h.length>0&&(r[l]=h,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const n={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone(n));const r=e.attributes;for(const u in r){const h=r[u];this.setAttribute(u,h.clone(n))}const s=e.morphAttributes;for(const u in s){const h=[],p=s[u];for(let f=0,g=p.length;f<g;f++)h.push(p[f].clone(n));this.morphAttributes[u]=h}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let u=0,h=a.length;u<h;u++){const p=a[u];this.addGroup(p.start,p.count,p.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Op=new ht,nr=new Xh,So=new Wl,zp=new F,wo=new F,Mo=new F,Eo=new F,Wc=new F,bo=new F,Bp=new F,To=new F;class qn extends Xt{constructor(e=new vi,n=new dx){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=n,this.updateMorphTargets()}copy(e,n){return super.copy(e,n),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const n=this.geometry.morphAttributes,i=Object.keys(n);if(i.length>0){const r=n[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=r.length;s<a;s++){const o=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}getVertexPosition(e,n){const i=this.geometry,r=i.attributes.position,s=i.morphAttributes.position,a=i.morphTargetsRelative;n.fromBufferAttribute(r,e);const o=this.morphTargetInfluences;if(s&&o){bo.set(0,0,0);for(let l=0,u=s.length;l<u;l++){const h=o[l],p=s[l];h!==0&&(Wc.fromBufferAttribute(p,e),a?bo.addScaledVector(Wc,h):bo.addScaledVector(Wc.sub(n),h))}n.add(bo)}return n}raycast(e,n){const i=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),So.copy(i.boundingSphere),So.applyMatrix4(s),nr.copy(e.ray).recast(e.near),!(So.containsPoint(nr.origin)===!1&&(nr.intersectSphere(So,zp)===null||nr.origin.distanceToSquared(zp)>(e.far-e.near)**2))&&(Op.copy(s).invert(),nr.copy(e.ray).applyMatrix4(Op),!(i.boundingBox!==null&&nr.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,n,nr)))}_computeIntersections(e,n,i){let r;const s=this.geometry,a=this.material,o=s.index,l=s.attributes.position,u=s.attributes.uv,h=s.attributes.uv1,p=s.attributes.normal,f=s.groups,g=s.drawRange;if(o!==null)if(Array.isArray(a))for(let v=0,S=f.length;v<S;v++){const m=f[v],d=a[m.materialIndex],_=Math.max(m.start,g.start),x=Math.min(o.count,Math.min(m.start+m.count,g.start+g.count));for(let M=_,P=x;M<P;M+=3){const T=o.getX(M),A=o.getX(M+1),N=o.getX(M+2);r=Ao(this,d,e,i,u,h,p,T,A,N),r&&(r.faceIndex=Math.floor(M/3),r.face.materialIndex=m.materialIndex,n.push(r))}}else{const v=Math.max(0,g.start),S=Math.min(o.count,g.start+g.count);for(let m=v,d=S;m<d;m+=3){const _=o.getX(m),x=o.getX(m+1),M=o.getX(m+2);r=Ao(this,a,e,i,u,h,p,_,x,M),r&&(r.faceIndex=Math.floor(m/3),n.push(r))}}else if(l!==void 0)if(Array.isArray(a))for(let v=0,S=f.length;v<S;v++){const m=f[v],d=a[m.materialIndex],_=Math.max(m.start,g.start),x=Math.min(l.count,Math.min(m.start+m.count,g.start+g.count));for(let M=_,P=x;M<P;M+=3){const T=M,A=M+1,N=M+2;r=Ao(this,d,e,i,u,h,p,T,A,N),r&&(r.faceIndex=Math.floor(M/3),r.face.materialIndex=m.materialIndex,n.push(r))}}else{const v=Math.max(0,g.start),S=Math.min(l.count,g.start+g.count);for(let m=v,d=S;m<d;m+=3){const _=m,x=m+1,M=m+2;r=Ao(this,a,e,i,u,h,p,_,x,M),r&&(r.faceIndex=Math.floor(m/3),n.push(r))}}}}function r1(t,e,n,i,r,s,a,o){let l;if(e.side===sn?l=i.intersectTriangle(a,s,r,!0,o):l=i.intersectTriangle(r,s,a,e.side===qi,o),l===null)return null;To.copy(o),To.applyMatrix4(t.matrixWorld);const u=n.ray.origin.distanceTo(To);return u<n.near||u>n.far?null:{distance:u,point:To.clone(),object:t}}function Ao(t,e,n,i,r,s,a,o,l,u){t.getVertexPosition(o,wo),t.getVertexPosition(l,Mo),t.getVertexPosition(u,Eo);const h=r1(t,e,n,i,wo,Mo,Eo,Bp);if(h){const p=new F;Un.getBarycoord(Bp,wo,Mo,Eo,p),r&&(h.uv=Un.getInterpolatedAttribute(r,o,l,u,p,new Ke)),s&&(h.uv1=Un.getInterpolatedAttribute(s,o,l,u,p,new Ke)),a&&(h.normal=Un.getInterpolatedAttribute(a,o,l,u,p,new F),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));const f={a:o,b:l,c:u,normal:new F,materialIndex:0};Un.getNormal(wo,Mo,Eo,f.normal),h.face=f,h.barycoord=p}return h}class Va extends vi{constructor(e=1,n=1,i=1,r=1,s=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:n,depth:i,widthSegments:r,heightSegments:s,depthSegments:a};const o=this;r=Math.floor(r),s=Math.floor(s),a=Math.floor(a);const l=[],u=[],h=[],p=[];let f=0,g=0;v("z","y","x",-1,-1,i,n,e,a,s,0),v("z","y","x",1,-1,i,n,-e,a,s,1),v("x","z","y",1,1,e,i,n,r,a,2),v("x","z","y",1,-1,e,i,-n,r,a,3),v("x","y","z",1,-1,e,n,i,r,s,4),v("x","y","z",-1,-1,e,n,-i,r,s,5),this.setIndex(l),this.setAttribute("position",new yr(u,3)),this.setAttribute("normal",new yr(h,3)),this.setAttribute("uv",new yr(p,2));function v(S,m,d,_,x,M,P,T,A,N,H){const y=M/A,b=P/N,V=M/2,j=P/2,$=T/2,Q=A+1,G=N+1;let Y=0,L=0;const K=new F;for(let I=0;I<G;I++){const q=I*b-j;for(let fe=0;fe<Q;fe++){const Te=fe*y-V;K[S]=Te*_,K[m]=q*x,K[d]=$,u.push(K.x,K.y,K.z),K[S]=0,K[m]=0,K[d]=T>0?1:-1,h.push(K.x,K.y,K.z),p.push(fe/A),p.push(1-I/N),Y+=1}}for(let I=0;I<N;I++)for(let q=0;q<A;q++){const fe=f+q+Q*I,Te=f+q+Q*(I+1),W=f+(q+1)+Q*(I+1),te=f+(q+1)+Q*I;l.push(fe,Te,te),l.push(Te,W,te),L+=6}o.addGroup(g,L,H),g+=L,f+=Y}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Va(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Cs(t){const e={};for(const n in t){e[n]={};for(const i in t[n]){const r=t[n][i];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[n][i]=null):e[n][i]=r.clone():Array.isArray(r)?e[n][i]=r.slice():e[n][i]=r}}return e}function Ht(t){const e={};for(let n=0;n<t.length;n++){const i=Cs(t[n]);for(const r in i)e[r]=i[r]}return e}function s1(t){const e=[];for(let n=0;n<t.length;n++)e.push(t[n].clone());return e}function px(t){const e=t.getRenderTarget();return e===null?t.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:tt.workingColorSpace}const a1={clone:Cs,merge:Ht};var o1=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,l1=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class $i extends Ds{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=o1,this.fragmentShader=l1,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Cs(e.uniforms),this.uniformsGroups=s1(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const n=super.toJSON(e);n.glslVersion=this.glslVersion,n.uniforms={};for(const r in this.uniforms){const a=this.uniforms[r].value;a&&a.isTexture?n.uniforms[r]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?n.uniforms[r]={type:"c",value:a.getHex()}:a&&a.isVector2?n.uniforms[r]={type:"v2",value:a.toArray()}:a&&a.isVector3?n.uniforms[r]={type:"v3",value:a.toArray()}:a&&a.isVector4?n.uniforms[r]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?n.uniforms[r]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?n.uniforms[r]={type:"m4",value:a.toArray()}:n.uniforms[r]={value:a}}Object.keys(this.defines).length>0&&(n.defines=this.defines),n.vertexShader=this.vertexShader,n.fragmentShader=this.fragmentShader,n.lights=this.lights,n.clipping=this.clipping;const i={};for(const r in this.extensions)this.extensions[r]===!0&&(i[r]=!0);return Object.keys(i).length>0&&(n.extensions=i),n}}class mx extends Xt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ht,this.projectionMatrix=new ht,this.projectionMatrixInverse=new ht,this.coordinateSystem=ci}copy(e,n){return super.copy(e,n),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,n){super.updateWorldMatrix(e,n),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Ai=new F,jp=new Ke,Hp=new Ke;class dn extends mx{constructor(e=50,n=1,i=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=r,this.focus=10,this.aspect=n,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,n){return super.copy(e,n),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const n=.5*this.getFilmHeight()/e;this.fov=zd*2*Math.atan(n),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Ec*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return zd*2*Math.atan(Math.tan(Ec*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,n,i){Ai.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Ai.x,Ai.y).multiplyScalar(-e/Ai.z),Ai.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Ai.x,Ai.y).multiplyScalar(-e/Ai.z)}getViewSize(e,n){return this.getViewBounds(e,jp,Hp),n.subVectors(Hp,jp)}setViewOffset(e,n,i,r,s,a){this.aspect=e/n,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=n,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let n=e*Math.tan(Ec*.5*this.fov)/this.zoom,i=2*n,r=this.aspect*i,s=-.5*r;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,u=a.fullHeight;s+=a.offsetX*r/l,n-=a.offsetY*i/u,r*=a.width/l,i*=a.height/u}const o=this.filmOffset;o!==0&&(s+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,n,n-i,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const n=super.toJSON(e);return n.object.fov=this.fov,n.object.zoom=this.zoom,n.object.near=this.near,n.object.far=this.far,n.object.focus=this.focus,n.object.aspect=this.aspect,this.view!==null&&(n.object.view=Object.assign({},this.view)),n.object.filmGauge=this.filmGauge,n.object.filmOffset=this.filmOffset,n}}const Vr=-90,Gr=1;class c1 extends Xt{constructor(e,n,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const r=new dn(Vr,Gr,e,n);r.layers=this.layers,this.add(r);const s=new dn(Vr,Gr,e,n);s.layers=this.layers,this.add(s);const a=new dn(Vr,Gr,e,n);a.layers=this.layers,this.add(a);const o=new dn(Vr,Gr,e,n);o.layers=this.layers,this.add(o);const l=new dn(Vr,Gr,e,n);l.layers=this.layers,this.add(l);const u=new dn(Vr,Gr,e,n);u.layers=this.layers,this.add(u)}updateCoordinateSystem(){const e=this.coordinateSystem,n=this.children.concat(),[i,r,s,a,o,l]=n;for(const u of n)this.remove(u);if(e===ci)i.up.set(0,1,0),i.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Tl)i.up.set(0,-1,0),i.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const u of n)this.add(u),u.updateMatrixWorld()}update(e,n){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[s,a,o,l,u,h]=this.children,p=e.getRenderTarget(),f=e.getActiveCubeFace(),g=e.getActiveMipmapLevel(),v=e.xr.enabled;e.xr.enabled=!1;const S=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,r),e.render(n,s),e.setRenderTarget(i,1,r),e.render(n,a),e.setRenderTarget(i,2,r),e.render(n,o),e.setRenderTarget(i,3,r),e.render(n,l),e.setRenderTarget(i,4,r),e.render(n,u),i.texture.generateMipmaps=S,e.setRenderTarget(i,5,r),e.render(n,h),e.setRenderTarget(p,f,g),e.xr.enabled=v,i.texture.needsPMREMUpdate=!0}}class gx extends Wt{constructor(e,n,i,r,s,a,o,l,u,h){e=e!==void 0?e:[],n=n!==void 0?n:Es,super(e,n,i,r,s,a,o,l,u,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class u1 extends Ar{constructor(e=1,n={}){super(e,e,n),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},r=[i,i,i,i,i,i];this.texture=new gx(r,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=n.generateMipmaps!==void 0?n.generateMipmaps:!1,this.texture.minFilter=n.minFilter!==void 0?n.minFilter:Sn}fromEquirectangularTexture(e,n){this.texture.type=n.type,this.texture.colorSpace=n.colorSpace,this.texture.generateMipmaps=n.generateMipmaps,this.texture.minFilter=n.minFilter,this.texture.magFilter=n.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},r=new Va(5,5,5),s=new $i({name:"CubemapFromEquirect",uniforms:Cs(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:sn,blending:Vi});s.uniforms.tEquirect.value=n;const a=new qn(r,s),o=n.minFilter;return n.minFilter===xr&&(n.minFilter=Sn),new c1(1,10,this).update(e,a),n.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,n,i,r){const s=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(n,i,r);e.setRenderTarget(s)}}const Xc=new F,d1=new F,h1=new Be;class lr{constructor(e=new F(1,0,0),n=0){this.isPlane=!0,this.normal=e,this.constant=n}set(e,n){return this.normal.copy(e),this.constant=n,this}setComponents(e,n,i,r){return this.normal.set(e,n,i),this.constant=r,this}setFromNormalAndCoplanarPoint(e,n){return this.normal.copy(e),this.constant=-n.dot(this.normal),this}setFromCoplanarPoints(e,n,i){const r=Xc.subVectors(i,n).cross(d1.subVectors(e,n)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,n){return n.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,n){const i=e.delta(Xc),r=this.normal.dot(i);if(r===0)return this.distanceToPoint(e.start)===0?n.copy(e.start):null;const s=-(e.start.dot(this.normal)+this.constant)/r;return s<0||s>1?null:n.copy(e.start).addScaledVector(i,s)}intersectsLine(e){const n=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return n<0&&i>0||i<0&&n>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,n){const i=n||h1.getNormalMatrix(e),r=this.coplanarPoint(Xc).applyMatrix4(e),s=this.normal.applyMatrix3(i).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const ir=new Wl,Co=new F;class $h{constructor(e=new lr,n=new lr,i=new lr,r=new lr,s=new lr,a=new lr){this.planes=[e,n,i,r,s,a]}set(e,n,i,r,s,a){const o=this.planes;return o[0].copy(e),o[1].copy(n),o[2].copy(i),o[3].copy(r),o[4].copy(s),o[5].copy(a),this}copy(e){const n=this.planes;for(let i=0;i<6;i++)n[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,n=ci){const i=this.planes,r=e.elements,s=r[0],a=r[1],o=r[2],l=r[3],u=r[4],h=r[5],p=r[6],f=r[7],g=r[8],v=r[9],S=r[10],m=r[11],d=r[12],_=r[13],x=r[14],M=r[15];if(i[0].setComponents(l-s,f-u,m-g,M-d).normalize(),i[1].setComponents(l+s,f+u,m+g,M+d).normalize(),i[2].setComponents(l+a,f+h,m+v,M+_).normalize(),i[3].setComponents(l-a,f-h,m-v,M-_).normalize(),i[4].setComponents(l-o,f-p,m-S,M-x).normalize(),n===ci)i[5].setComponents(l+o,f+p,m+S,M+x).normalize();else if(n===Tl)i[5].setComponents(o,p,S,x).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+n);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),ir.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const n=e.geometry;n.boundingSphere===null&&n.computeBoundingSphere(),ir.copy(n.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(ir)}intersectsSprite(e){return ir.center.set(0,0,0),ir.radius=.7071067811865476,ir.applyMatrix4(e.matrixWorld),this.intersectsSphere(ir)}intersectsSphere(e){const n=this.planes,i=e.center,r=-e.radius;for(let s=0;s<6;s++)if(n[s].distanceToPoint(i)<r)return!1;return!0}intersectsBox(e){const n=this.planes;for(let i=0;i<6;i++){const r=n[i];if(Co.x=r.normal.x>0?e.max.x:e.min.x,Co.y=r.normal.y>0?e.max.y:e.min.y,Co.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Co)<0)return!1}return!0}containsPoint(e){const n=this.planes;for(let i=0;i<6;i++)if(n[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function xx(){let t=null,e=!1,n=null,i=null;function r(s,a){n(s,a),i=t.requestAnimationFrame(r)}return{start:function(){e!==!0&&n!==null&&(i=t.requestAnimationFrame(r),e=!0)},stop:function(){t.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(s){n=s},setContext:function(s){t=s}}}function f1(t){const e=new WeakMap;function n(o,l){const u=o.array,h=o.usage,p=u.byteLength,f=t.createBuffer();t.bindBuffer(l,f),t.bufferData(l,u,h),o.onUploadCallback();let g;if(u instanceof Float32Array)g=t.FLOAT;else if(u instanceof Uint16Array)o.isFloat16BufferAttribute?g=t.HALF_FLOAT:g=t.UNSIGNED_SHORT;else if(u instanceof Int16Array)g=t.SHORT;else if(u instanceof Uint32Array)g=t.UNSIGNED_INT;else if(u instanceof Int32Array)g=t.INT;else if(u instanceof Int8Array)g=t.BYTE;else if(u instanceof Uint8Array)g=t.UNSIGNED_BYTE;else if(u instanceof Uint8ClampedArray)g=t.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+u);return{buffer:f,type:g,bytesPerElement:u.BYTES_PER_ELEMENT,version:o.version,size:p}}function i(o,l,u){const h=l.array,p=l.updateRanges;if(t.bindBuffer(u,o),p.length===0)t.bufferSubData(u,0,h);else{p.sort((g,v)=>g.start-v.start);let f=0;for(let g=1;g<p.length;g++){const v=p[f],S=p[g];S.start<=v.start+v.count+1?v.count=Math.max(v.count,S.start+S.count-v.start):(++f,p[f]=S)}p.length=f+1;for(let g=0,v=p.length;g<v;g++){const S=p[g];t.bufferSubData(u,S.start*h.BYTES_PER_ELEMENT,h,S.start,S.count)}l.clearUpdateRanges()}l.onUploadCallback()}function r(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function s(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=e.get(o);l&&(t.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const h=e.get(o);(!h||h.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const u=e.get(o);if(u===void 0)e.set(o,n(o,l));else if(u.version<o.version){if(u.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(u.buffer,o,l),u.version=o.version}}return{get:r,remove:s,update:a}}class Ga extends vi{constructor(e=1,n=1,i=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:n,widthSegments:i,heightSegments:r};const s=e/2,a=n/2,o=Math.floor(i),l=Math.floor(r),u=o+1,h=l+1,p=e/o,f=n/l,g=[],v=[],S=[],m=[];for(let d=0;d<h;d++){const _=d*f-a;for(let x=0;x<u;x++){const M=x*p-s;v.push(M,-_,0),S.push(0,0,1),m.push(x/o),m.push(1-d/l)}}for(let d=0;d<l;d++)for(let _=0;_<o;_++){const x=_+u*d,M=_+u*(d+1),P=_+1+u*(d+1),T=_+1+u*d;g.push(x,M,T),g.push(M,P,T)}this.setIndex(g),this.setAttribute("position",new yr(v,3)),this.setAttribute("normal",new yr(S,3)),this.setAttribute("uv",new yr(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ga(e.width,e.height,e.widthSegments,e.heightSegments)}}var p1=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,m1=`#ifdef USE_ALPHAHASH
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
#endif`,g1=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,x1=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,v1=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,_1=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,y1=`#ifdef USE_AOMAP
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
#endif`,S1=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,w1=`#ifdef USE_BATCHING
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
#endif`,M1=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,E1=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,b1=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,T1=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,A1=`#ifdef USE_IRIDESCENCE
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
#endif`,C1=`#ifdef USE_BUMPMAP
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
#endif`,R1=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,N1=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,P1=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,L1=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,D1=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,k1=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,I1=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,U1=`#if defined( USE_COLOR_ALPHA )
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
#endif`,F1=`#define PI 3.141592653589793
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
} // validated`,O1=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,z1=`vec3 transformedNormal = objectNormal;
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
#endif`,B1=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,j1=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,H1=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,V1=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,G1="gl_FragColor = linearToOutputTexel( gl_FragColor );",W1=`
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
}`,X1=`#ifdef USE_ENVMAP
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
#endif`,q1=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,$1=`#ifdef USE_ENVMAP
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
#endif`,Y1=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,K1=`#ifdef USE_ENVMAP
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
#endif`,Z1=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Q1=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,J1=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,ew=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,tw=`#ifdef USE_GRADIENTMAP
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
}`,nw=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,iw=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,rw=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,sw=`uniform bool receiveShadow;
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
#endif`,aw=`#ifdef USE_ENVMAP
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
#endif`,ow=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lw=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,cw=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,uw=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,dw=`PhysicalMaterial material;
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
#endif`,hw=`struct PhysicalMaterial {
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
}`,fw=`
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
#endif`,pw=`#if defined( RE_IndirectDiffuse )
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
#endif`,mw=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,gw=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,xw=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,vw=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,_w=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,yw=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Sw=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,ww=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Mw=`#if defined( USE_POINTS_UV )
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
#endif`,Ew=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,bw=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Tw=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Aw=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Cw=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Rw=`#ifdef USE_MORPHTARGETS
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
#endif`,Nw=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Pw=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Lw=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Dw=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,kw=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Iw=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Uw=`#ifdef USE_NORMALMAP
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
#endif`,Fw=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Ow=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,zw=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Bw=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,jw=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Hw=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Vw=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Gw=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Ww=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Xw=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,qw=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,$w=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Yw=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Kw=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Zw=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Qw=`float getShadowMask() {
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
}`,Jw=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,eM=`#ifdef USE_SKINNING
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
#endif`,tM=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,nM=`#ifdef USE_SKINNING
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
#endif`,iM=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,rM=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,sM=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,aM=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,oM=`#ifdef USE_TRANSMISSION
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
#endif`,lM=`#ifdef USE_TRANSMISSION
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
#endif`,cM=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,uM=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,dM=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,hM=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const fM=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,pM=`uniform sampler2D t2D;
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
}`,mM=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,gM=`#ifdef ENVMAP_TYPE_CUBE
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
}`,xM=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,vM=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,_M=`#include <common>
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
}`,yM=`#if DEPTH_PACKING == 3200
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
}`,SM=`#define DISTANCE
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
}`,wM=`#define DISTANCE
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
}`,MM=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,EM=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,bM=`uniform float scale;
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
}`,TM=`uniform vec3 diffuse;
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
}`,AM=`#include <common>
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
}`,CM=`uniform vec3 diffuse;
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
}`,RM=`#define LAMBERT
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
}`,NM=`#define LAMBERT
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
}`,PM=`#define MATCAP
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
}`,LM=`#define MATCAP
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
}`,DM=`#define NORMAL
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
}`,kM=`#define NORMAL
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
}`,IM=`#define PHONG
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
}`,UM=`#define PHONG
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
}`,FM=`#define STANDARD
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
}`,OM=`#define STANDARD
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
}`,zM=`#define TOON
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
}`,BM=`#define TOON
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
}`,jM=`uniform float size;
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
}`,HM=`uniform vec3 diffuse;
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
}`,VM=`#include <common>
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
}`,GM=`uniform vec3 color;
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
}`,WM=`uniform float rotation;
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
}`,XM=`uniform vec3 diffuse;
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
}`,ze={alphahash_fragment:p1,alphahash_pars_fragment:m1,alphamap_fragment:g1,alphamap_pars_fragment:x1,alphatest_fragment:v1,alphatest_pars_fragment:_1,aomap_fragment:y1,aomap_pars_fragment:S1,batching_pars_vertex:w1,batching_vertex:M1,begin_vertex:E1,beginnormal_vertex:b1,bsdfs:T1,iridescence_fragment:A1,bumpmap_pars_fragment:C1,clipping_planes_fragment:R1,clipping_planes_pars_fragment:N1,clipping_planes_pars_vertex:P1,clipping_planes_vertex:L1,color_fragment:D1,color_pars_fragment:k1,color_pars_vertex:I1,color_vertex:U1,common:F1,cube_uv_reflection_fragment:O1,defaultnormal_vertex:z1,displacementmap_pars_vertex:B1,displacementmap_vertex:j1,emissivemap_fragment:H1,emissivemap_pars_fragment:V1,colorspace_fragment:G1,colorspace_pars_fragment:W1,envmap_fragment:X1,envmap_common_pars_fragment:q1,envmap_pars_fragment:$1,envmap_pars_vertex:Y1,envmap_physical_pars_fragment:aw,envmap_vertex:K1,fog_vertex:Z1,fog_pars_vertex:Q1,fog_fragment:J1,fog_pars_fragment:ew,gradientmap_pars_fragment:tw,lightmap_pars_fragment:nw,lights_lambert_fragment:iw,lights_lambert_pars_fragment:rw,lights_pars_begin:sw,lights_toon_fragment:ow,lights_toon_pars_fragment:lw,lights_phong_fragment:cw,lights_phong_pars_fragment:uw,lights_physical_fragment:dw,lights_physical_pars_fragment:hw,lights_fragment_begin:fw,lights_fragment_maps:pw,lights_fragment_end:mw,logdepthbuf_fragment:gw,logdepthbuf_pars_fragment:xw,logdepthbuf_pars_vertex:vw,logdepthbuf_vertex:_w,map_fragment:yw,map_pars_fragment:Sw,map_particle_fragment:ww,map_particle_pars_fragment:Mw,metalnessmap_fragment:Ew,metalnessmap_pars_fragment:bw,morphinstance_vertex:Tw,morphcolor_vertex:Aw,morphnormal_vertex:Cw,morphtarget_pars_vertex:Rw,morphtarget_vertex:Nw,normal_fragment_begin:Pw,normal_fragment_maps:Lw,normal_pars_fragment:Dw,normal_pars_vertex:kw,normal_vertex:Iw,normalmap_pars_fragment:Uw,clearcoat_normal_fragment_begin:Fw,clearcoat_normal_fragment_maps:Ow,clearcoat_pars_fragment:zw,iridescence_pars_fragment:Bw,opaque_fragment:jw,packing:Hw,premultiplied_alpha_fragment:Vw,project_vertex:Gw,dithering_fragment:Ww,dithering_pars_fragment:Xw,roughnessmap_fragment:qw,roughnessmap_pars_fragment:$w,shadowmap_pars_fragment:Yw,shadowmap_pars_vertex:Kw,shadowmap_vertex:Zw,shadowmask_pars_fragment:Qw,skinbase_vertex:Jw,skinning_pars_vertex:eM,skinning_vertex:tM,skinnormal_vertex:nM,specularmap_fragment:iM,specularmap_pars_fragment:rM,tonemapping_fragment:sM,tonemapping_pars_fragment:aM,transmission_fragment:oM,transmission_pars_fragment:lM,uv_pars_fragment:cM,uv_pars_vertex:uM,uv_vertex:dM,worldpos_vertex:hM,background_vert:fM,background_frag:pM,backgroundCube_vert:mM,backgroundCube_frag:gM,cube_vert:xM,cube_frag:vM,depth_vert:_M,depth_frag:yM,distanceRGBA_vert:SM,distanceRGBA_frag:wM,equirect_vert:MM,equirect_frag:EM,linedashed_vert:bM,linedashed_frag:TM,meshbasic_vert:AM,meshbasic_frag:CM,meshlambert_vert:RM,meshlambert_frag:NM,meshmatcap_vert:PM,meshmatcap_frag:LM,meshnormal_vert:DM,meshnormal_frag:kM,meshphong_vert:IM,meshphong_frag:UM,meshphysical_vert:FM,meshphysical_frag:OM,meshtoon_vert:zM,meshtoon_frag:BM,points_vert:jM,points_frag:HM,shadow_vert:VM,shadow_frag:GM,sprite_vert:WM,sprite_frag:XM},oe={common:{diffuse:{value:new Xe(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Be},alphaMap:{value:null},alphaMapTransform:{value:new Be},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Be}},envmap:{envMap:{value:null},envMapRotation:{value:new Be},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Be}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Be}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Be},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Be},normalScale:{value:new Ke(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Be},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Be}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Be}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Be}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Xe(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Xe(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Be},alphaTest:{value:0},uvTransform:{value:new Be}},sprite:{diffuse:{value:new Xe(16777215)},opacity:{value:1},center:{value:new Ke(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Be},alphaMap:{value:null},alphaMapTransform:{value:new Be},alphaTest:{value:0}}},Gn={basic:{uniforms:Ht([oe.common,oe.specularmap,oe.envmap,oe.aomap,oe.lightmap,oe.fog]),vertexShader:ze.meshbasic_vert,fragmentShader:ze.meshbasic_frag},lambert:{uniforms:Ht([oe.common,oe.specularmap,oe.envmap,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.fog,oe.lights,{emissive:{value:new Xe(0)}}]),vertexShader:ze.meshlambert_vert,fragmentShader:ze.meshlambert_frag},phong:{uniforms:Ht([oe.common,oe.specularmap,oe.envmap,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.fog,oe.lights,{emissive:{value:new Xe(0)},specular:{value:new Xe(1118481)},shininess:{value:30}}]),vertexShader:ze.meshphong_vert,fragmentShader:ze.meshphong_frag},standard:{uniforms:Ht([oe.common,oe.envmap,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.roughnessmap,oe.metalnessmap,oe.fog,oe.lights,{emissive:{value:new Xe(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:ze.meshphysical_vert,fragmentShader:ze.meshphysical_frag},toon:{uniforms:Ht([oe.common,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.gradientmap,oe.fog,oe.lights,{emissive:{value:new Xe(0)}}]),vertexShader:ze.meshtoon_vert,fragmentShader:ze.meshtoon_frag},matcap:{uniforms:Ht([oe.common,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.fog,{matcap:{value:null}}]),vertexShader:ze.meshmatcap_vert,fragmentShader:ze.meshmatcap_frag},points:{uniforms:Ht([oe.points,oe.fog]),vertexShader:ze.points_vert,fragmentShader:ze.points_frag},dashed:{uniforms:Ht([oe.common,oe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:ze.linedashed_vert,fragmentShader:ze.linedashed_frag},depth:{uniforms:Ht([oe.common,oe.displacementmap]),vertexShader:ze.depth_vert,fragmentShader:ze.depth_frag},normal:{uniforms:Ht([oe.common,oe.bumpmap,oe.normalmap,oe.displacementmap,{opacity:{value:1}}]),vertexShader:ze.meshnormal_vert,fragmentShader:ze.meshnormal_frag},sprite:{uniforms:Ht([oe.sprite,oe.fog]),vertexShader:ze.sprite_vert,fragmentShader:ze.sprite_frag},background:{uniforms:{uvTransform:{value:new Be},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:ze.background_vert,fragmentShader:ze.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Be}},vertexShader:ze.backgroundCube_vert,fragmentShader:ze.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:ze.cube_vert,fragmentShader:ze.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:ze.equirect_vert,fragmentShader:ze.equirect_frag},distanceRGBA:{uniforms:Ht([oe.common,oe.displacementmap,{referencePosition:{value:new F},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:ze.distanceRGBA_vert,fragmentShader:ze.distanceRGBA_frag},shadow:{uniforms:Ht([oe.lights,oe.fog,{color:{value:new Xe(0)},opacity:{value:1}}]),vertexShader:ze.shadow_vert,fragmentShader:ze.shadow_frag}};Gn.physical={uniforms:Ht([Gn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Be},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Be},clearcoatNormalScale:{value:new Ke(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Be},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Be},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Be},sheen:{value:0},sheenColor:{value:new Xe(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Be},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Be},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Be},transmissionSamplerSize:{value:new Ke},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Be},attenuationDistance:{value:0},attenuationColor:{value:new Xe(0)},specularColor:{value:new Xe(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Be},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Be},anisotropyVector:{value:new Ke},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Be}}]),vertexShader:ze.meshphysical_vert,fragmentShader:ze.meshphysical_frag};const Ro={r:0,b:0,g:0},rr=new Kn,qM=new ht;function $M(t,e,n,i,r,s,a){const o=new Xe(0);let l=s===!0?0:1,u,h,p=null,f=0,g=null;function v(_){let x=_.isScene===!0?_.background:null;return x&&x.isTexture&&(x=(_.backgroundBlurriness>0?n:e).get(x)),x}function S(_){let x=!1;const M=v(_);M===null?d(o,l):M&&M.isColor&&(d(M,1),x=!0);const P=t.xr.getEnvironmentBlendMode();P==="additive"?i.buffers.color.setClear(0,0,0,1,a):P==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,a),(t.autoClear||x)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil))}function m(_,x){const M=v(x);M&&(M.isCubeTexture||M.mapping===Vl)?(h===void 0&&(h=new qn(new Va(1,1,1),new $i({name:"BackgroundCubeMaterial",uniforms:Cs(Gn.backgroundCube.uniforms),vertexShader:Gn.backgroundCube.vertexShader,fragmentShader:Gn.backgroundCube.fragmentShader,side:sn,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(P,T,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(h)),rr.copy(x.backgroundRotation),rr.x*=-1,rr.y*=-1,rr.z*=-1,M.isCubeTexture&&M.isRenderTargetTexture===!1&&(rr.y*=-1,rr.z*=-1),h.material.uniforms.envMap.value=M,h.material.uniforms.flipEnvMap.value=M.isCubeTexture&&M.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=x.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=x.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(qM.makeRotationFromEuler(rr)),h.material.toneMapped=tt.getTransfer(M.colorSpace)!==ut,(p!==M||f!==M.version||g!==t.toneMapping)&&(h.material.needsUpdate=!0,p=M,f=M.version,g=t.toneMapping),h.layers.enableAll(),_.unshift(h,h.geometry,h.material,0,0,null)):M&&M.isTexture&&(u===void 0&&(u=new qn(new Ga(2,2),new $i({name:"BackgroundMaterial",uniforms:Cs(Gn.background.uniforms),vertexShader:Gn.background.vertexShader,fragmentShader:Gn.background.fragmentShader,side:qi,depthTest:!1,depthWrite:!1,fog:!1})),u.geometry.deleteAttribute("normal"),Object.defineProperty(u.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(u)),u.material.uniforms.t2D.value=M,u.material.uniforms.backgroundIntensity.value=x.backgroundIntensity,u.material.toneMapped=tt.getTransfer(M.colorSpace)!==ut,M.matrixAutoUpdate===!0&&M.updateMatrix(),u.material.uniforms.uvTransform.value.copy(M.matrix),(p!==M||f!==M.version||g!==t.toneMapping)&&(u.material.needsUpdate=!0,p=M,f=M.version,g=t.toneMapping),u.layers.enableAll(),_.unshift(u,u.geometry,u.material,0,0,null))}function d(_,x){_.getRGB(Ro,px(t)),i.buffers.color.setClear(Ro.r,Ro.g,Ro.b,x,a)}return{getClearColor:function(){return o},setClearColor:function(_,x=1){o.set(_),l=x,d(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(_){l=_,d(o,l)},render:S,addToRenderList:m}}function YM(t,e){const n=t.getParameter(t.MAX_VERTEX_ATTRIBS),i={},r=f(null);let s=r,a=!1;function o(y,b,V,j,$){let Q=!1;const G=p(j,V,b);s!==G&&(s=G,u(s.object)),Q=g(y,j,V,$),Q&&v(y,j,V,$),$!==null&&e.update($,t.ELEMENT_ARRAY_BUFFER),(Q||a)&&(a=!1,M(y,b,V,j),$!==null&&t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,e.get($).buffer))}function l(){return t.createVertexArray()}function u(y){return t.bindVertexArray(y)}function h(y){return t.deleteVertexArray(y)}function p(y,b,V){const j=V.wireframe===!0;let $=i[y.id];$===void 0&&($={},i[y.id]=$);let Q=$[b.id];Q===void 0&&(Q={},$[b.id]=Q);let G=Q[j];return G===void 0&&(G=f(l()),Q[j]=G),G}function f(y){const b=[],V=[],j=[];for(let $=0;$<n;$++)b[$]=0,V[$]=0,j[$]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:b,enabledAttributes:V,attributeDivisors:j,object:y,attributes:{},index:null}}function g(y,b,V,j){const $=s.attributes,Q=b.attributes;let G=0;const Y=V.getAttributes();for(const L in Y)if(Y[L].location>=0){const I=$[L];let q=Q[L];if(q===void 0&&(L==="instanceMatrix"&&y.instanceMatrix&&(q=y.instanceMatrix),L==="instanceColor"&&y.instanceColor&&(q=y.instanceColor)),I===void 0||I.attribute!==q||q&&I.data!==q.data)return!0;G++}return s.attributesNum!==G||s.index!==j}function v(y,b,V,j){const $={},Q=b.attributes;let G=0;const Y=V.getAttributes();for(const L in Y)if(Y[L].location>=0){let I=Q[L];I===void 0&&(L==="instanceMatrix"&&y.instanceMatrix&&(I=y.instanceMatrix),L==="instanceColor"&&y.instanceColor&&(I=y.instanceColor));const q={};q.attribute=I,I&&I.data&&(q.data=I.data),$[L]=q,G++}s.attributes=$,s.attributesNum=G,s.index=j}function S(){const y=s.newAttributes;for(let b=0,V=y.length;b<V;b++)y[b]=0}function m(y){d(y,0)}function d(y,b){const V=s.newAttributes,j=s.enabledAttributes,$=s.attributeDivisors;V[y]=1,j[y]===0&&(t.enableVertexAttribArray(y),j[y]=1),$[y]!==b&&(t.vertexAttribDivisor(y,b),$[y]=b)}function _(){const y=s.newAttributes,b=s.enabledAttributes;for(let V=0,j=b.length;V<j;V++)b[V]!==y[V]&&(t.disableVertexAttribArray(V),b[V]=0)}function x(y,b,V,j,$,Q,G){G===!0?t.vertexAttribIPointer(y,b,V,$,Q):t.vertexAttribPointer(y,b,V,j,$,Q)}function M(y,b,V,j){S();const $=j.attributes,Q=V.getAttributes(),G=b.defaultAttributeValues;for(const Y in Q){const L=Q[Y];if(L.location>=0){let K=$[Y];if(K===void 0&&(Y==="instanceMatrix"&&y.instanceMatrix&&(K=y.instanceMatrix),Y==="instanceColor"&&y.instanceColor&&(K=y.instanceColor)),K!==void 0){const I=K.normalized,q=K.itemSize,fe=e.get(K);if(fe===void 0)continue;const Te=fe.buffer,W=fe.type,te=fe.bytesPerElement,le=W===t.INT||W===t.UNSIGNED_INT||K.gpuType===zh;if(K.isInterleavedBufferAttribute){const ce=K.data,De=ce.stride,Ce=K.offset;if(ce.isInstancedInterleavedBuffer){for(let He=0;He<L.locationSize;He++)d(L.location+He,ce.meshPerAttribute);y.isInstancedMesh!==!0&&j._maxInstanceCount===void 0&&(j._maxInstanceCount=ce.meshPerAttribute*ce.count)}else for(let He=0;He<L.locationSize;He++)m(L.location+He);t.bindBuffer(t.ARRAY_BUFFER,Te);for(let He=0;He<L.locationSize;He++)x(L.location+He,q/L.locationSize,W,I,De*te,(Ce+q/L.locationSize*He)*te,le)}else{if(K.isInstancedBufferAttribute){for(let ce=0;ce<L.locationSize;ce++)d(L.location+ce,K.meshPerAttribute);y.isInstancedMesh!==!0&&j._maxInstanceCount===void 0&&(j._maxInstanceCount=K.meshPerAttribute*K.count)}else for(let ce=0;ce<L.locationSize;ce++)m(L.location+ce);t.bindBuffer(t.ARRAY_BUFFER,Te);for(let ce=0;ce<L.locationSize;ce++)x(L.location+ce,q/L.locationSize,W,I,q*te,q/L.locationSize*ce*te,le)}}else if(G!==void 0){const I=G[Y];if(I!==void 0)switch(I.length){case 2:t.vertexAttrib2fv(L.location,I);break;case 3:t.vertexAttrib3fv(L.location,I);break;case 4:t.vertexAttrib4fv(L.location,I);break;default:t.vertexAttrib1fv(L.location,I)}}}}_()}function P(){N();for(const y in i){const b=i[y];for(const V in b){const j=b[V];for(const $ in j)h(j[$].object),delete j[$];delete b[V]}delete i[y]}}function T(y){if(i[y.id]===void 0)return;const b=i[y.id];for(const V in b){const j=b[V];for(const $ in j)h(j[$].object),delete j[$];delete b[V]}delete i[y.id]}function A(y){for(const b in i){const V=i[b];if(V[y.id]===void 0)continue;const j=V[y.id];for(const $ in j)h(j[$].object),delete j[$];delete V[y.id]}}function N(){H(),a=!0,s!==r&&(s=r,u(s.object))}function H(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:o,reset:N,resetDefaultState:H,dispose:P,releaseStatesOfGeometry:T,releaseStatesOfProgram:A,initAttributes:S,enableAttribute:m,disableUnusedAttributes:_}}function KM(t,e,n){let i;function r(u){i=u}function s(u,h){t.drawArrays(i,u,h),n.update(h,i,1)}function a(u,h,p){p!==0&&(t.drawArraysInstanced(i,u,h,p),n.update(h,i,p))}function o(u,h,p){if(p===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,u,0,h,0,p);let g=0;for(let v=0;v<p;v++)g+=h[v];n.update(g,i,1)}function l(u,h,p,f){if(p===0)return;const g=e.get("WEBGL_multi_draw");if(g===null)for(let v=0;v<u.length;v++)a(u[v],h[v],f[v]);else{g.multiDrawArraysInstancedWEBGL(i,u,0,h,0,f,0,p);let v=0;for(let S=0;S<p;S++)v+=h[S];for(let S=0;S<f.length;S++)n.update(v,i,f[S])}}this.setMode=r,this.render=s,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function ZM(t,e,n,i){let r;function s(){if(r!==void 0)return r;if(e.has("EXT_texture_filter_anisotropic")===!0){const A=e.get("EXT_texture_filter_anisotropic");r=t.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function a(A){return!(A!==Fn&&i.convert(A)!==t.getParameter(t.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(A){const N=A===za&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(A!==gi&&i.convert(A)!==t.getParameter(t.IMPLEMENTATION_COLOR_READ_TYPE)&&A!==li&&!N)}function l(A){if(A==="highp"){if(t.getShaderPrecisionFormat(t.VERTEX_SHADER,t.HIGH_FLOAT).precision>0&&t.getShaderPrecisionFormat(t.FRAGMENT_SHADER,t.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&t.getShaderPrecisionFormat(t.VERTEX_SHADER,t.MEDIUM_FLOAT).precision>0&&t.getShaderPrecisionFormat(t.FRAGMENT_SHADER,t.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let u=n.precision!==void 0?n.precision:"highp";const h=l(u);h!==u&&(console.warn("THREE.WebGLRenderer:",u,"not supported, using",h,"instead."),u=h);const p=n.logarithmicDepthBuffer===!0,f=n.reverseDepthBuffer===!0&&e.has("EXT_clip_control");if(f===!0){const A=e.get("EXT_clip_control");A.clipControlEXT(A.LOWER_LEFT_EXT,A.ZERO_TO_ONE_EXT)}const g=t.getParameter(t.MAX_TEXTURE_IMAGE_UNITS),v=t.getParameter(t.MAX_VERTEX_TEXTURE_IMAGE_UNITS),S=t.getParameter(t.MAX_TEXTURE_SIZE),m=t.getParameter(t.MAX_CUBE_MAP_TEXTURE_SIZE),d=t.getParameter(t.MAX_VERTEX_ATTRIBS),_=t.getParameter(t.MAX_VERTEX_UNIFORM_VECTORS),x=t.getParameter(t.MAX_VARYING_VECTORS),M=t.getParameter(t.MAX_FRAGMENT_UNIFORM_VECTORS),P=v>0,T=t.getParameter(t.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:u,logarithmicDepthBuffer:p,reverseDepthBuffer:f,maxTextures:g,maxVertexTextures:v,maxTextureSize:S,maxCubemapSize:m,maxAttributes:d,maxVertexUniforms:_,maxVaryings:x,maxFragmentUniforms:M,vertexTextures:P,maxSamples:T}}function QM(t){const e=this;let n=null,i=0,r=!1,s=!1;const a=new lr,o=new Be,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(p,f){const g=p.length!==0||f||i!==0||r;return r=f,i=p.length,g},this.beginShadows=function(){s=!0,h(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(p,f){n=h(p,f,0)},this.setState=function(p,f,g){const v=p.clippingPlanes,S=p.clipIntersection,m=p.clipShadows,d=t.get(p);if(!r||v===null||v.length===0||s&&!m)s?h(null):u();else{const _=s?0:i,x=_*4;let M=d.clippingState||null;l.value=M,M=h(v,f,x,g);for(let P=0;P!==x;++P)M[P]=n[P];d.clippingState=M,this.numIntersection=S?this.numPlanes:0,this.numPlanes+=_}};function u(){l.value!==n&&(l.value=n,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function h(p,f,g,v){const S=p!==null?p.length:0;let m=null;if(S!==0){if(m=l.value,v!==!0||m===null){const d=g+S*4,_=f.matrixWorldInverse;o.getNormalMatrix(_),(m===null||m.length<d)&&(m=new Float32Array(d));for(let x=0,M=g;x!==S;++x,M+=4)a.copy(p[x]).applyMatrix4(_,o),a.normal.toArray(m,M),m[M+3]=a.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=S,e.numIntersection=0,m}}function JM(t){let e=new WeakMap;function n(a,o){return o===cd?a.mapping=Es:o===ud&&(a.mapping=bs),a}function i(a){if(a&&a.isTexture){const o=a.mapping;if(o===cd||o===ud)if(e.has(a)){const l=e.get(a).texture;return n(l,a.mapping)}else{const l=a.image;if(l&&l.height>0){const u=new u1(l.height);return u.fromEquirectangularTexture(t,a),e.set(a,u),a.addEventListener("dispose",r),n(u.texture,a.mapping)}else return null}}return a}function r(a){const o=a.target;o.removeEventListener("dispose",r);const l=e.get(o);l!==void 0&&(e.delete(o),l.dispose())}function s(){e=new WeakMap}return{get:i,dispose:s}}class eE extends mx{constructor(e=-1,n=1,i=1,r=-1,s=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=n,this.top=i,this.bottom=r,this.near=s,this.far=a,this.updateProjectionMatrix()}copy(e,n){return super.copy(e,n),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,n,i,r,s,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=n,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),n=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,r=(this.top+this.bottom)/2;let s=i-e,a=i+e,o=r+n,l=r-n;if(this.view!==null&&this.view.enabled){const u=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=u*this.view.offsetX,a=s+u*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(s,a,o,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const n=super.toJSON(e);return n.object.zoom=this.zoom,n.object.left=this.left,n.object.right=this.right,n.object.top=this.top,n.object.bottom=this.bottom,n.object.near=this.near,n.object.far=this.far,this.view!==null&&(n.object.view=Object.assign({},this.view)),n}}const rs=4,Vp=[.125,.215,.35,.446,.526,.582],dr=20,qc=new eE,Gp=new Xe;let $c=null,Yc=0,Kc=0,Zc=!1;const cr=(1+Math.sqrt(5))/2,Wr=1/cr,Wp=[new F(-cr,Wr,0),new F(cr,Wr,0),new F(-Wr,0,cr),new F(Wr,0,cr),new F(0,cr,-Wr),new F(0,cr,Wr),new F(-1,1,-1),new F(1,1,-1),new F(-1,1,1),new F(1,1,1)];class Xp{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,n=0,i=.1,r=100){$c=this._renderer.getRenderTarget(),Yc=this._renderer.getActiveCubeFace(),Kc=this._renderer.getActiveMipmapLevel(),Zc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,i,r,s),n>0&&this._blur(s,0,0,n),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,n=null){return this._fromTexture(e,n)}fromCubemap(e,n=null){return this._fromTexture(e,n)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Yp(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=$p(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget($c,Yc,Kc),this._renderer.xr.enabled=Zc,e.scissorTest=!1,No(e,0,0,e.width,e.height)}_fromTexture(e,n){e.mapping===Es||e.mapping===bs?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),$c=this._renderer.getRenderTarget(),Yc=this._renderer.getActiveCubeFace(),Kc=this._renderer.getActiveMipmapLevel(),Zc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=n||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),n=4*this._cubeSize,i={magFilter:Sn,minFilter:Sn,generateMipmaps:!1,type:za,format:Fn,colorSpace:Qi,depthBuffer:!1},r=qp(e,n,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==n){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=qp(e,n,i);const{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=tE(s)),this._blurMaterial=nE(s,e,n)}return r}_compileMaterial(e){const n=new qn(this._lodPlanes[0],e);this._renderer.compile(n,qc)}_sceneToCubeUV(e,n,i,r){const o=new dn(90,1,n,i),l=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],h=this._renderer,p=h.autoClear,f=h.toneMapping;h.getClearColor(Gp),h.toneMapping=Gi,h.autoClear=!1;const g=new dx({name:"PMREM.Background",side:sn,depthWrite:!1,depthTest:!1}),v=new qn(new Va,g);let S=!1;const m=e.background;m?m.isColor&&(g.color.copy(m),e.background=null,S=!0):(g.color.copy(Gp),S=!0);for(let d=0;d<6;d++){const _=d%3;_===0?(o.up.set(0,l[d],0),o.lookAt(u[d],0,0)):_===1?(o.up.set(0,0,l[d]),o.lookAt(0,u[d],0)):(o.up.set(0,l[d],0),o.lookAt(0,0,u[d]));const x=this._cubeSize;No(r,_*x,d>2?x:0,x,x),h.setRenderTarget(r),S&&h.render(v,o),h.render(e,o)}v.geometry.dispose(),v.material.dispose(),h.toneMapping=f,h.autoClear=p,e.background=m}_textureToCubeUV(e,n){const i=this._renderer,r=e.mapping===Es||e.mapping===bs;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=Yp()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=$p());const s=r?this._cubemapMaterial:this._equirectMaterial,a=new qn(this._lodPlanes[0],s),o=s.uniforms;o.envMap.value=e;const l=this._cubeSize;No(n,0,0,3*l,2*l),i.setRenderTarget(n),i.render(a,qc)}_applyPMREM(e){const n=this._renderer,i=n.autoClear;n.autoClear=!1;const r=this._lodPlanes.length;for(let s=1;s<r;s++){const a=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),o=Wp[(r-s-1)%Wp.length];this._blur(e,s-1,s,a,o)}n.autoClear=i}_blur(e,n,i,r,s){const a=this._pingPongRenderTarget;this._halfBlur(e,a,n,i,r,"latitudinal",s),this._halfBlur(a,e,i,i,r,"longitudinal",s)}_halfBlur(e,n,i,r,s,a,o){const l=this._renderer,u=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,p=new qn(this._lodPlanes[r],u),f=u.uniforms,g=this._sizeLods[i]-1,v=isFinite(s)?Math.PI/(2*g):2*Math.PI/(2*dr-1),S=s/v,m=isFinite(s)?1+Math.floor(h*S):dr;m>dr&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${dr}`);const d=[];let _=0;for(let A=0;A<dr;++A){const N=A/S,H=Math.exp(-N*N/2);d.push(H),A===0?_+=H:A<m&&(_+=2*H)}for(let A=0;A<d.length;A++)d[A]=d[A]/_;f.envMap.value=e.texture,f.samples.value=m,f.weights.value=d,f.latitudinal.value=a==="latitudinal",o&&(f.poleAxis.value=o);const{_lodMax:x}=this;f.dTheta.value=v,f.mipInt.value=x-i;const M=this._sizeLods[r],P=3*M*(r>x-rs?r-x+rs:0),T=4*(this._cubeSize-M);No(n,P,T,3*M,2*M),l.setRenderTarget(n),l.render(p,qc)}}function tE(t){const e=[],n=[],i=[];let r=t;const s=t-rs+1+Vp.length;for(let a=0;a<s;a++){const o=Math.pow(2,r);n.push(o);let l=1/o;a>t-rs?l=Vp[a-t+rs-1]:a===0&&(l=0),i.push(l);const u=1/(o-2),h=-u,p=1+u,f=[h,h,p,h,p,p,h,h,p,p,h,p],g=6,v=6,S=3,m=2,d=1,_=new Float32Array(S*v*g),x=new Float32Array(m*v*g),M=new Float32Array(d*v*g);for(let T=0;T<g;T++){const A=T%3*2/3-1,N=T>2?0:-1,H=[A,N,0,A+2/3,N,0,A+2/3,N+1,0,A,N,0,A+2/3,N+1,0,A,N+1,0];_.set(H,S*v*T),x.set(f,m*v*T);const y=[T,T,T,T,T,T];M.set(y,d*v*T)}const P=new vi;P.setAttribute("position",new bn(_,S)),P.setAttribute("uv",new bn(x,m)),P.setAttribute("faceIndex",new bn(M,d)),e.push(P),r>rs&&r--}return{lodPlanes:e,sizeLods:n,sigmas:i}}function qp(t,e,n){const i=new Ar(t,e,n);return i.texture.mapping=Vl,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function No(t,e,n,i,r){t.viewport.set(e,n,i,r),t.scissor.set(e,n,i,r)}function nE(t,e,n){const i=new Float32Array(dr),r=new F(0,1,0);return new $i({name:"SphericalGaussianBlur",defines:{n:dr,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${t}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:Yh(),fragmentShader:`

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
		`,blending:Vi,depthTest:!1,depthWrite:!1})}function $p(){return new $i({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Yh(),fragmentShader:`

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
		`,blending:Vi,depthTest:!1,depthWrite:!1})}function Yp(){return new $i({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Yh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Vi,depthTest:!1,depthWrite:!1})}function Yh(){return`

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
	`}function iE(t){let e=new WeakMap,n=null;function i(o){if(o&&o.isTexture){const l=o.mapping,u=l===cd||l===ud,h=l===Es||l===bs;if(u||h){let p=e.get(o);const f=p!==void 0?p.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==f)return n===null&&(n=new Xp(t)),p=u?n.fromEquirectangular(o,p):n.fromCubemap(o,p),p.texture.pmremVersion=o.pmremVersion,e.set(o,p),p.texture;if(p!==void 0)return p.texture;{const g=o.image;return u&&g&&g.height>0||h&&g&&r(g)?(n===null&&(n=new Xp(t)),p=u?n.fromEquirectangular(o):n.fromCubemap(o),p.texture.pmremVersion=o.pmremVersion,e.set(o,p),o.addEventListener("dispose",s),p.texture):null}}}return o}function r(o){let l=0;const u=6;for(let h=0;h<u;h++)o[h]!==void 0&&l++;return l===u}function s(o){const l=o.target;l.removeEventListener("dispose",s);const u=e.get(l);u!==void 0&&(e.delete(l),u.dispose())}function a(){e=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:i,dispose:a}}function rE(t){const e={};function n(i){if(e[i]!==void 0)return e[i];let r;switch(i){case"WEBGL_depth_texture":r=t.getExtension("WEBGL_depth_texture")||t.getExtension("MOZ_WEBGL_depth_texture")||t.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":r=t.getExtension("EXT_texture_filter_anisotropic")||t.getExtension("MOZ_EXT_texture_filter_anisotropic")||t.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":r=t.getExtension("WEBGL_compressed_texture_s3tc")||t.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||t.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":r=t.getExtension("WEBGL_compressed_texture_pvrtc")||t.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:r=t.getExtension(i)}return e[i]=r,r}return{has:function(i){return n(i)!==null},init:function(){n("EXT_color_buffer_float"),n("WEBGL_clip_cull_distance"),n("OES_texture_float_linear"),n("EXT_color_buffer_half_float"),n("WEBGL_multisampled_render_to_texture"),n("WEBGL_render_shared_exponent")},get:function(i){const r=n(i);return r===null&&Zo("THREE.WebGLRenderer: "+i+" extension not supported."),r}}}function sE(t,e,n,i){const r={},s=new WeakMap;function a(p){const f=p.target;f.index!==null&&e.remove(f.index);for(const v in f.attributes)e.remove(f.attributes[v]);for(const v in f.morphAttributes){const S=f.morphAttributes[v];for(let m=0,d=S.length;m<d;m++)e.remove(S[m])}f.removeEventListener("dispose",a),delete r[f.id];const g=s.get(f);g&&(e.remove(g),s.delete(f)),i.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,n.memory.geometries--}function o(p,f){return r[f.id]===!0||(f.addEventListener("dispose",a),r[f.id]=!0,n.memory.geometries++),f}function l(p){const f=p.attributes;for(const v in f)e.update(f[v],t.ARRAY_BUFFER);const g=p.morphAttributes;for(const v in g){const S=g[v];for(let m=0,d=S.length;m<d;m++)e.update(S[m],t.ARRAY_BUFFER)}}function u(p){const f=[],g=p.index,v=p.attributes.position;let S=0;if(g!==null){const _=g.array;S=g.version;for(let x=0,M=_.length;x<M;x+=3){const P=_[x+0],T=_[x+1],A=_[x+2];f.push(P,T,T,A,A,P)}}else if(v!==void 0){const _=v.array;S=v.version;for(let x=0,M=_.length/3-1;x<M;x+=3){const P=x+0,T=x+1,A=x+2;f.push(P,T,T,A,A,P)}}else return;const m=new(ox(f)?fx:hx)(f,1);m.version=S;const d=s.get(p);d&&e.remove(d),s.set(p,m)}function h(p){const f=s.get(p);if(f){const g=p.index;g!==null&&f.version<g.version&&u(p)}else u(p);return s.get(p)}return{get:o,update:l,getWireframeAttribute:h}}function aE(t,e,n){let i;function r(f){i=f}let s,a;function o(f){s=f.type,a=f.bytesPerElement}function l(f,g){t.drawElements(i,g,s,f*a),n.update(g,i,1)}function u(f,g,v){v!==0&&(t.drawElementsInstanced(i,g,s,f*a,v),n.update(g,i,v))}function h(f,g,v){if(v===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,g,0,s,f,0,v);let m=0;for(let d=0;d<v;d++)m+=g[d];n.update(m,i,1)}function p(f,g,v,S){if(v===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let d=0;d<f.length;d++)u(f[d]/a,g[d],S[d]);else{m.multiDrawElementsInstancedWEBGL(i,g,0,s,f,0,S,0,v);let d=0;for(let _=0;_<v;_++)d+=g[_];for(let _=0;_<S.length;_++)n.update(d,i,S[_])}}this.setMode=r,this.setIndex=o,this.render=l,this.renderInstances=u,this.renderMultiDraw=h,this.renderMultiDrawInstances=p}function oE(t){const e={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function i(s,a,o){switch(n.calls++,a){case t.TRIANGLES:n.triangles+=o*(s/3);break;case t.LINES:n.lines+=o*(s/2);break;case t.LINE_STRIP:n.lines+=o*(s-1);break;case t.LINE_LOOP:n.lines+=o*s;break;case t.POINTS:n.points+=o*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function r(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:e,render:n,programs:null,autoReset:!0,reset:r,update:i}}function lE(t,e,n){const i=new WeakMap,r=new st;function s(a,o,l){const u=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,p=h!==void 0?h.length:0;let f=i.get(o);if(f===void 0||f.count!==p){let y=function(){N.dispose(),i.delete(o),o.removeEventListener("dispose",y)};var g=y;f!==void 0&&f.texture.dispose();const v=o.morphAttributes.position!==void 0,S=o.morphAttributes.normal!==void 0,m=o.morphAttributes.color!==void 0,d=o.morphAttributes.position||[],_=o.morphAttributes.normal||[],x=o.morphAttributes.color||[];let M=0;v===!0&&(M=1),S===!0&&(M=2),m===!0&&(M=3);let P=o.attributes.position.count*M,T=1;P>e.maxTextureSize&&(T=Math.ceil(P/e.maxTextureSize),P=e.maxTextureSize);const A=new Float32Array(P*T*4*p),N=new cx(A,P,T,p);N.type=li,N.needsUpdate=!0;const H=M*4;for(let b=0;b<p;b++){const V=d[b],j=_[b],$=x[b],Q=P*T*4*b;for(let G=0;G<V.count;G++){const Y=G*H;v===!0&&(r.fromBufferAttribute(V,G),A[Q+Y+0]=r.x,A[Q+Y+1]=r.y,A[Q+Y+2]=r.z,A[Q+Y+3]=0),S===!0&&(r.fromBufferAttribute(j,G),A[Q+Y+4]=r.x,A[Q+Y+5]=r.y,A[Q+Y+6]=r.z,A[Q+Y+7]=0),m===!0&&(r.fromBufferAttribute($,G),A[Q+Y+8]=r.x,A[Q+Y+9]=r.y,A[Q+Y+10]=r.z,A[Q+Y+11]=$.itemSize===4?r.w:1)}}f={count:p,texture:N,size:new Ke(P,T)},i.set(o,f),o.addEventListener("dispose",y)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(t,"morphTexture",a.morphTexture,n);else{let v=0;for(let m=0;m<u.length;m++)v+=u[m];const S=o.morphTargetsRelative?1:1-v;l.getUniforms().setValue(t,"morphTargetBaseInfluence",S),l.getUniforms().setValue(t,"morphTargetInfluences",u)}l.getUniforms().setValue(t,"morphTargetsTexture",f.texture,n),l.getUniforms().setValue(t,"morphTargetsTextureSize",f.size)}return{update:s}}function cE(t,e,n,i){let r=new WeakMap;function s(l){const u=i.render.frame,h=l.geometry,p=e.get(l,h);if(r.get(p)!==u&&(e.update(p),r.set(p,u)),l.isInstancedMesh&&(l.hasEventListener("dispose",o)===!1&&l.addEventListener("dispose",o),r.get(l)!==u&&(n.update(l.instanceMatrix,t.ARRAY_BUFFER),l.instanceColor!==null&&n.update(l.instanceColor,t.ARRAY_BUFFER),r.set(l,u))),l.isSkinnedMesh){const f=l.skeleton;r.get(f)!==u&&(f.update(),r.set(f,u))}return p}function a(){r=new WeakMap}function o(l){const u=l.target;u.removeEventListener("dispose",o),n.remove(u.instanceMatrix),u.instanceColor!==null&&n.remove(u.instanceColor)}return{update:s,dispose:a}}class vx extends Wt{constructor(e,n,i,r,s,a,o,l,u,h=hs){if(h!==hs&&h!==As)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");i===void 0&&h===hs&&(i=Tr),i===void 0&&h===As&&(i=Ts),super(null,r,s,a,o,l,h,i,u),this.isDepthTexture=!0,this.image={width:e,height:n},this.magFilter=o!==void 0?o:Mn,this.minFilter=l!==void 0?l:Mn,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const n=super.toJSON(e);return this.compareFunction!==null&&(n.compareFunction=this.compareFunction),n}}const _x=new Wt,Kp=new vx(1,1),yx=new cx,Sx=new $S,wx=new gx,Zp=[],Qp=[],Jp=new Float32Array(16),em=new Float32Array(9),tm=new Float32Array(4);function ks(t,e,n){const i=t[0];if(i<=0||i>0)return t;const r=e*n;let s=Zp[r];if(s===void 0&&(s=new Float32Array(r),Zp[r]=s),e!==0){i.toArray(s,0);for(let a=1,o=0;a!==e;++a)o+=n,t[a].toArray(s,o)}return s}function Tt(t,e){if(t.length!==e.length)return!1;for(let n=0,i=t.length;n<i;n++)if(t[n]!==e[n])return!1;return!0}function At(t,e){for(let n=0,i=e.length;n<i;n++)t[n]=e[n]}function Xl(t,e){let n=Qp[e];n===void 0&&(n=new Int32Array(e),Qp[e]=n);for(let i=0;i!==e;++i)n[i]=t.allocateTextureUnit();return n}function uE(t,e){const n=this.cache;n[0]!==e&&(t.uniform1f(this.addr,e),n[0]=e)}function dE(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(t.uniform2f(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(Tt(n,e))return;t.uniform2fv(this.addr,e),At(n,e)}}function hE(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(t.uniform3f(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else if(e.r!==void 0)(n[0]!==e.r||n[1]!==e.g||n[2]!==e.b)&&(t.uniform3f(this.addr,e.r,e.g,e.b),n[0]=e.r,n[1]=e.g,n[2]=e.b);else{if(Tt(n,e))return;t.uniform3fv(this.addr,e),At(n,e)}}function fE(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(t.uniform4f(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(Tt(n,e))return;t.uniform4fv(this.addr,e),At(n,e)}}function pE(t,e){const n=this.cache,i=e.elements;if(i===void 0){if(Tt(n,e))return;t.uniformMatrix2fv(this.addr,!1,e),At(n,e)}else{if(Tt(n,i))return;tm.set(i),t.uniformMatrix2fv(this.addr,!1,tm),At(n,i)}}function mE(t,e){const n=this.cache,i=e.elements;if(i===void 0){if(Tt(n,e))return;t.uniformMatrix3fv(this.addr,!1,e),At(n,e)}else{if(Tt(n,i))return;em.set(i),t.uniformMatrix3fv(this.addr,!1,em),At(n,i)}}function gE(t,e){const n=this.cache,i=e.elements;if(i===void 0){if(Tt(n,e))return;t.uniformMatrix4fv(this.addr,!1,e),At(n,e)}else{if(Tt(n,i))return;Jp.set(i),t.uniformMatrix4fv(this.addr,!1,Jp),At(n,i)}}function xE(t,e){const n=this.cache;n[0]!==e&&(t.uniform1i(this.addr,e),n[0]=e)}function vE(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(t.uniform2i(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(Tt(n,e))return;t.uniform2iv(this.addr,e),At(n,e)}}function _E(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(t.uniform3i(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else{if(Tt(n,e))return;t.uniform3iv(this.addr,e),At(n,e)}}function yE(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(t.uniform4i(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(Tt(n,e))return;t.uniform4iv(this.addr,e),At(n,e)}}function SE(t,e){const n=this.cache;n[0]!==e&&(t.uniform1ui(this.addr,e),n[0]=e)}function wE(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(t.uniform2ui(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(Tt(n,e))return;t.uniform2uiv(this.addr,e),At(n,e)}}function ME(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(t.uniform3ui(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else{if(Tt(n,e))return;t.uniform3uiv(this.addr,e),At(n,e)}}function EE(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(t.uniform4ui(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(Tt(n,e))return;t.uniform4uiv(this.addr,e),At(n,e)}}function bE(t,e,n){const i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(t.uniform1i(this.addr,r),i[0]=r);let s;this.type===t.SAMPLER_2D_SHADOW?(Kp.compareFunction=ax,s=Kp):s=_x,n.setTexture2D(e||s,r)}function TE(t,e,n){const i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(t.uniform1i(this.addr,r),i[0]=r),n.setTexture3D(e||Sx,r)}function AE(t,e,n){const i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(t.uniform1i(this.addr,r),i[0]=r),n.setTextureCube(e||wx,r)}function CE(t,e,n){const i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(t.uniform1i(this.addr,r),i[0]=r),n.setTexture2DArray(e||yx,r)}function RE(t){switch(t){case 5126:return uE;case 35664:return dE;case 35665:return hE;case 35666:return fE;case 35674:return pE;case 35675:return mE;case 35676:return gE;case 5124:case 35670:return xE;case 35667:case 35671:return vE;case 35668:case 35672:return _E;case 35669:case 35673:return yE;case 5125:return SE;case 36294:return wE;case 36295:return ME;case 36296:return EE;case 35678:case 36198:case 36298:case 36306:case 35682:return bE;case 35679:case 36299:case 36307:return TE;case 35680:case 36300:case 36308:case 36293:return AE;case 36289:case 36303:case 36311:case 36292:return CE}}function NE(t,e){t.uniform1fv(this.addr,e)}function PE(t,e){const n=ks(e,this.size,2);t.uniform2fv(this.addr,n)}function LE(t,e){const n=ks(e,this.size,3);t.uniform3fv(this.addr,n)}function DE(t,e){const n=ks(e,this.size,4);t.uniform4fv(this.addr,n)}function kE(t,e){const n=ks(e,this.size,4);t.uniformMatrix2fv(this.addr,!1,n)}function IE(t,e){const n=ks(e,this.size,9);t.uniformMatrix3fv(this.addr,!1,n)}function UE(t,e){const n=ks(e,this.size,16);t.uniformMatrix4fv(this.addr,!1,n)}function FE(t,e){t.uniform1iv(this.addr,e)}function OE(t,e){t.uniform2iv(this.addr,e)}function zE(t,e){t.uniform3iv(this.addr,e)}function BE(t,e){t.uniform4iv(this.addr,e)}function jE(t,e){t.uniform1uiv(this.addr,e)}function HE(t,e){t.uniform2uiv(this.addr,e)}function VE(t,e){t.uniform3uiv(this.addr,e)}function GE(t,e){t.uniform4uiv(this.addr,e)}function WE(t,e,n){const i=this.cache,r=e.length,s=Xl(n,r);Tt(i,s)||(t.uniform1iv(this.addr,s),At(i,s));for(let a=0;a!==r;++a)n.setTexture2D(e[a]||_x,s[a])}function XE(t,e,n){const i=this.cache,r=e.length,s=Xl(n,r);Tt(i,s)||(t.uniform1iv(this.addr,s),At(i,s));for(let a=0;a!==r;++a)n.setTexture3D(e[a]||Sx,s[a])}function qE(t,e,n){const i=this.cache,r=e.length,s=Xl(n,r);Tt(i,s)||(t.uniform1iv(this.addr,s),At(i,s));for(let a=0;a!==r;++a)n.setTextureCube(e[a]||wx,s[a])}function $E(t,e,n){const i=this.cache,r=e.length,s=Xl(n,r);Tt(i,s)||(t.uniform1iv(this.addr,s),At(i,s));for(let a=0;a!==r;++a)n.setTexture2DArray(e[a]||yx,s[a])}function YE(t){switch(t){case 5126:return NE;case 35664:return PE;case 35665:return LE;case 35666:return DE;case 35674:return kE;case 35675:return IE;case 35676:return UE;case 5124:case 35670:return FE;case 35667:case 35671:return OE;case 35668:case 35672:return zE;case 35669:case 35673:return BE;case 5125:return jE;case 36294:return HE;case 36295:return VE;case 36296:return GE;case 35678:case 36198:case 36298:case 36306:case 35682:return WE;case 35679:case 36299:case 36307:return XE;case 35680:case 36300:case 36308:case 36293:return qE;case 36289:case 36303:case 36311:case 36292:return $E}}class KE{constructor(e,n,i){this.id=e,this.addr=i,this.cache=[],this.type=n.type,this.setValue=RE(n.type)}}class ZE{constructor(e,n,i){this.id=e,this.addr=i,this.cache=[],this.type=n.type,this.size=n.size,this.setValue=YE(n.type)}}class QE{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,n,i){const r=this.seq;for(let s=0,a=r.length;s!==a;++s){const o=r[s];o.setValue(e,n[o.id],i)}}}const Qc=/(\w+)(\])?(\[|\.)?/g;function nm(t,e){t.seq.push(e),t.map[e.id]=e}function JE(t,e,n){const i=t.name,r=i.length;for(Qc.lastIndex=0;;){const s=Qc.exec(i),a=Qc.lastIndex;let o=s[1];const l=s[2]==="]",u=s[3];if(l&&(o=o|0),u===void 0||u==="["&&a+2===r){nm(n,u===void 0?new KE(o,t,e):new ZE(o,t,e));break}else{let p=n.map[o];p===void 0&&(p=new QE(o),nm(n,p)),n=p}}}class Qo{constructor(e,n){this.seq=[],this.map={};const i=e.getProgramParameter(n,e.ACTIVE_UNIFORMS);for(let r=0;r<i;++r){const s=e.getActiveUniform(n,r),a=e.getUniformLocation(n,s.name);JE(s,a,this)}}setValue(e,n,i,r){const s=this.map[n];s!==void 0&&s.setValue(e,i,r)}setOptional(e,n,i){const r=n[i];r!==void 0&&this.setValue(e,i,r)}static upload(e,n,i,r){for(let s=0,a=n.length;s!==a;++s){const o=n[s],l=i[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,r)}}static seqWithValue(e,n){const i=[];for(let r=0,s=e.length;r!==s;++r){const a=e[r];a.id in n&&i.push(a)}return i}}function im(t,e,n){const i=t.createShader(e);return t.shaderSource(i,n),t.compileShader(i),i}const eb=37297;let tb=0;function nb(t,e){const n=t.split(`
`),i=[],r=Math.max(e-6,0),s=Math.min(e+6,n.length);for(let a=r;a<s;a++){const o=a+1;i.push(`${o===e?">":" "} ${o}: ${n[a]}`)}return i.join(`
`)}function ib(t){const e=tt.getPrimaries(tt.workingColorSpace),n=tt.getPrimaries(t);let i;switch(e===n?i="":e===bl&&n===El?i="LinearDisplayP3ToLinearSRGB":e===El&&n===bl&&(i="LinearSRGBToLinearDisplayP3"),t){case Qi:case Gl:return[i,"LinearTransferOETF"];case Vn:case Wh:return[i,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",t),[i,"LinearTransferOETF"]}}function rm(t,e,n){const i=t.getShaderParameter(e,t.COMPILE_STATUS),r=t.getShaderInfoLog(e).trim();if(i&&r==="")return"";const s=/ERROR: 0:(\d+)/.exec(r);if(s){const a=parseInt(s[1]);return n.toUpperCase()+`

`+r+`

`+nb(t.getShaderSource(e),a)}else return r}function rb(t,e){const n=ib(e);return`vec4 ${t}( vec4 value ) { return ${n[0]}( ${n[1]}( value ) ); }`}function sb(t,e){let n;switch(e){case yS:n="Linear";break;case SS:n="Reinhard";break;case wS:n="Cineon";break;case MS:n="ACESFilmic";break;case bS:n="AgX";break;case TS:n="Neutral";break;case ES:n="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),n="Linear"}return"vec3 "+t+"( vec3 color ) { return "+n+"ToneMapping( color ); }"}const Po=new F;function ab(){tt.getLuminanceCoefficients(Po);const t=Po.x.toFixed(4),e=Po.y.toFixed(4),n=Po.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${t}, ${e}, ${n} );`,"	return dot( weights, rgb );","}"].join(`
`)}function ob(t){return[t.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",t.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(ea).join(`
`)}function lb(t){const e=[];for(const n in t){const i=t[n];i!==!1&&e.push("#define "+n+" "+i)}return e.join(`
`)}function cb(t,e){const n={},i=t.getProgramParameter(e,t.ACTIVE_ATTRIBUTES);for(let r=0;r<i;r++){const s=t.getActiveAttrib(e,r),a=s.name;let o=1;s.type===t.FLOAT_MAT2&&(o=2),s.type===t.FLOAT_MAT3&&(o=3),s.type===t.FLOAT_MAT4&&(o=4),n[a]={type:s.type,location:t.getAttribLocation(e,a),locationSize:o}}return n}function ea(t){return t!==""}function sm(t,e){const n=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return t.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function am(t,e){return t.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const ub=/^[ \t]*#include +<([\w\d./]+)>/gm;function Bd(t){return t.replace(ub,hb)}const db=new Map;function hb(t,e){let n=ze[e];if(n===void 0){const i=db.get(e);if(i!==void 0)n=ze[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return Bd(n)}const fb=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function om(t){return t.replace(fb,pb)}function pb(t,e,n,i){let r="";for(let s=parseInt(e);s<parseInt(n);s++)r+=i.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function lm(t){let e=`precision ${t.precision} float;
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
#define LOW_PRECISION`),e}function mb(t){let e="SHADOWMAP_TYPE_BASIC";return t.shadowMapType===Xg?e="SHADOWMAP_TYPE_PCF":t.shadowMapType===Jy?e="SHADOWMAP_TYPE_PCF_SOFT":t.shadowMapType===ii&&(e="SHADOWMAP_TYPE_VSM"),e}function gb(t){let e="ENVMAP_TYPE_CUBE";if(t.envMap)switch(t.envMapMode){case Es:case bs:e="ENVMAP_TYPE_CUBE";break;case Vl:e="ENVMAP_TYPE_CUBE_UV";break}return e}function xb(t){let e="ENVMAP_MODE_REFLECTION";if(t.envMap)switch(t.envMapMode){case bs:e="ENVMAP_MODE_REFRACTION";break}return e}function vb(t){let e="ENVMAP_BLENDING_NONE";if(t.envMap)switch(t.combine){case qg:e="ENVMAP_BLENDING_MULTIPLY";break;case vS:e="ENVMAP_BLENDING_MIX";break;case _S:e="ENVMAP_BLENDING_ADD";break}return e}function _b(t){const e=t.envMapCubeUVHeight;if(e===null)return null;const n=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,n),7*16)),texelHeight:i,maxMip:n}}function yb(t,e,n,i){const r=t.getContext(),s=n.defines;let a=n.vertexShader,o=n.fragmentShader;const l=mb(n),u=gb(n),h=xb(n),p=vb(n),f=_b(n),g=ob(n),v=lb(s),S=r.createProgram();let m,d,_=n.glslVersion?"#version "+n.glslVersion+`
`:"";n.isRawShaderMaterial?(m=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,v].filter(ea).join(`
`),m.length>0&&(m+=`
`),d=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,v].filter(ea).join(`
`),d.length>0&&(d+=`
`)):(m=[lm(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,v,n.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",n.batching?"#define USE_BATCHING":"",n.batchingColor?"#define USE_BATCHING_COLOR":"",n.instancing?"#define USE_INSTANCING":"",n.instancingColor?"#define USE_INSTANCING_COLOR":"",n.instancingMorph?"#define USE_INSTANCING_MORPH":"",n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.map?"#define USE_MAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+h:"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.displacementMap?"#define USE_DISPLACEMENTMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.mapUv?"#define MAP_UV "+n.mapUv:"",n.alphaMapUv?"#define ALPHAMAP_UV "+n.alphaMapUv:"",n.lightMapUv?"#define LIGHTMAP_UV "+n.lightMapUv:"",n.aoMapUv?"#define AOMAP_UV "+n.aoMapUv:"",n.emissiveMapUv?"#define EMISSIVEMAP_UV "+n.emissiveMapUv:"",n.bumpMapUv?"#define BUMPMAP_UV "+n.bumpMapUv:"",n.normalMapUv?"#define NORMALMAP_UV "+n.normalMapUv:"",n.displacementMapUv?"#define DISPLACEMENTMAP_UV "+n.displacementMapUv:"",n.metalnessMapUv?"#define METALNESSMAP_UV "+n.metalnessMapUv:"",n.roughnessMapUv?"#define ROUGHNESSMAP_UV "+n.roughnessMapUv:"",n.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+n.anisotropyMapUv:"",n.clearcoatMapUv?"#define CLEARCOATMAP_UV "+n.clearcoatMapUv:"",n.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+n.clearcoatNormalMapUv:"",n.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+n.clearcoatRoughnessMapUv:"",n.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+n.iridescenceMapUv:"",n.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+n.iridescenceThicknessMapUv:"",n.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+n.sheenColorMapUv:"",n.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+n.sheenRoughnessMapUv:"",n.specularMapUv?"#define SPECULARMAP_UV "+n.specularMapUv:"",n.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+n.specularColorMapUv:"",n.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+n.specularIntensityMapUv:"",n.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+n.transmissionMapUv:"",n.thicknessMapUv?"#define THICKNESSMAP_UV "+n.thicknessMapUv:"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.flatShading?"#define FLAT_SHADED":"",n.skinning?"#define USE_SKINNING":"",n.morphTargets?"#define USE_MORPHTARGETS":"",n.morphNormals&&n.flatShading===!1?"#define USE_MORPHNORMALS":"",n.morphColors?"#define USE_MORPHCOLORS":"",n.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+n.morphTextureStride:"",n.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+n.morphTargetsCount:"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+l:"",n.sizeAttenuation?"#define USE_SIZEATTENUATION":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",n.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(ea).join(`
`),d=[lm(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,v,n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",n.map?"#define USE_MAP":"",n.matcap?"#define USE_MATCAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+u:"",n.envMap?"#define "+h:"",n.envMap?"#define "+p:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoat?"#define USE_CLEARCOAT":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.dispersion?"#define USE_DISPERSION":"",n.iridescence?"#define USE_IRIDESCENCE":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaTest?"#define USE_ALPHATEST":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.sheen?"#define USE_SHEEN":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors||n.instancingColor||n.batchingColor?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.gradientMap?"#define USE_GRADIENTMAP":"",n.flatShading?"#define FLAT_SHADED":"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+l:"",n.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",n.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",n.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",n.toneMapping!==Gi?"#define TONE_MAPPING":"",n.toneMapping!==Gi?ze.tonemapping_pars_fragment:"",n.toneMapping!==Gi?sb("toneMapping",n.toneMapping):"",n.dithering?"#define DITHERING":"",n.opaque?"#define OPAQUE":"",ze.colorspace_pars_fragment,rb("linearToOutputTexel",n.outputColorSpace),ab(),n.useDepthPacking?"#define DEPTH_PACKING "+n.depthPacking:"",`
`].filter(ea).join(`
`)),a=Bd(a),a=sm(a,n),a=am(a,n),o=Bd(o),o=sm(o,n),o=am(o,n),a=om(a),o=om(o),n.isRawShaderMaterial!==!0&&(_=`#version 300 es
`,m=[g,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,d=["#define varying in",n.glslVersion===bp?"":"layout(location = 0) out highp vec4 pc_fragColor;",n.glslVersion===bp?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d);const x=_+m+a,M=_+d+o,P=im(r,r.VERTEX_SHADER,x),T=im(r,r.FRAGMENT_SHADER,M);r.attachShader(S,P),r.attachShader(S,T),n.index0AttributeName!==void 0?r.bindAttribLocation(S,0,n.index0AttributeName):n.morphTargets===!0&&r.bindAttribLocation(S,0,"position"),r.linkProgram(S);function A(b){if(t.debug.checkShaderErrors){const V=r.getProgramInfoLog(S).trim(),j=r.getShaderInfoLog(P).trim(),$=r.getShaderInfoLog(T).trim();let Q=!0,G=!0;if(r.getProgramParameter(S,r.LINK_STATUS)===!1)if(Q=!1,typeof t.debug.onShaderError=="function")t.debug.onShaderError(r,S,P,T);else{const Y=rm(r,P,"vertex"),L=rm(r,T,"fragment");console.error("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(S,r.VALIDATE_STATUS)+`

Material Name: `+b.name+`
Material Type: `+b.type+`

Program Info Log: `+V+`
`+Y+`
`+L)}else V!==""?console.warn("THREE.WebGLProgram: Program Info Log:",V):(j===""||$==="")&&(G=!1);G&&(b.diagnostics={runnable:Q,programLog:V,vertexShader:{log:j,prefix:m},fragmentShader:{log:$,prefix:d}})}r.deleteShader(P),r.deleteShader(T),N=new Qo(r,S),H=cb(r,S)}let N;this.getUniforms=function(){return N===void 0&&A(this),N};let H;this.getAttributes=function(){return H===void 0&&A(this),H};let y=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return y===!1&&(y=r.getProgramParameter(S,eb)),y},this.destroy=function(){i.releaseStatesOfProgram(this),r.deleteProgram(S),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=tb++,this.cacheKey=e,this.usedTimes=1,this.program=S,this.vertexShader=P,this.fragmentShader=T,this}let Sb=0;class wb{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const n=e.vertexShader,i=e.fragmentShader,r=this._getShaderStage(n),s=this._getShaderStage(i),a=this._getShaderCacheForMaterial(e);return a.has(r)===!1&&(a.add(r),r.usedTimes++),a.has(s)===!1&&(a.add(s),s.usedTimes++),this}remove(e){const n=this.materialCache.get(e);for(const i of n)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const n=this.materialCache;let i=n.get(e);return i===void 0&&(i=new Set,n.set(e,i)),i}_getShaderStage(e){const n=this.shaderCache;let i=n.get(e);return i===void 0&&(i=new Mb(e),n.set(e,i)),i}}class Mb{constructor(e){this.id=Sb++,this.code=e,this.usedTimes=0}}function Eb(t,e,n,i,r,s,a){const o=new qh,l=new wb,u=new Set,h=[],p=r.logarithmicDepthBuffer,f=r.reverseDepthBuffer,g=r.vertexTextures;let v=r.precision;const S={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function m(y){return u.add(y),y===0?"uv":`uv${y}`}function d(y,b,V,j,$){const Q=j.fog,G=$.geometry,Y=y.isMeshStandardMaterial?j.environment:null,L=(y.isMeshStandardMaterial?n:e).get(y.envMap||Y),K=L&&L.mapping===Vl?L.image.height:null,I=S[y.type];y.precision!==null&&(v=r.getMaxPrecision(y.precision),v!==y.precision&&console.warn("THREE.WebGLProgram.getParameters:",y.precision,"not supported, using",v,"instead."));const q=G.morphAttributes.position||G.morphAttributes.normal||G.morphAttributes.color,fe=q!==void 0?q.length:0;let Te=0;G.morphAttributes.position!==void 0&&(Te=1),G.morphAttributes.normal!==void 0&&(Te=2),G.morphAttributes.color!==void 0&&(Te=3);let W,te,le,ce;if(I){const Kt=Gn[I];W=Kt.vertexShader,te=Kt.fragmentShader}else W=y.vertexShader,te=y.fragmentShader,l.update(y),le=l.getVertexShaderID(y),ce=l.getFragmentShaderID(y);const De=t.getRenderTarget(),Ce=$.isInstancedMesh===!0,He=$.isBatchedMesh===!0,Qe=!!y.map,Ve=!!y.matcap,R=!!L,$e=!!y.aoMap,Ue=!!y.lightMap,Oe=!!y.bumpMap,Ae=!!y.normalMap,rt=!!y.displacementMap,Pe=!!y.emissiveMap,C=!!y.metalnessMap,w=!!y.roughnessMap,O=y.anisotropy>0,J=y.clearcoat>0,ne=y.dispersion>0,Z=y.iridescence>0,Me=y.sheen>0,ue=y.transmission>0,xe=O&&!!y.anisotropyMap,Ye=J&&!!y.clearcoatMap,re=J&&!!y.clearcoatNormalMap,ve=J&&!!y.clearcoatRoughnessMap,ke=Z&&!!y.iridescenceMap,Ie=Z&&!!y.iridescenceThicknessMap,_e=Me&&!!y.sheenColorMap,Ge=Me&&!!y.sheenRoughnessMap,Fe=!!y.specularMap,at=!!y.specularColorMap,D=!!y.specularIntensityMap,pe=ue&&!!y.transmissionMap,X=ue&&!!y.thicknessMap,ee=!!y.gradientMap,de=!!y.alphaMap,me=y.alphaTest>0,We=!!y.alphaHash,St=!!y.extensions;let Yt=Gi;y.toneMapped&&(De===null||De.isXRRenderTarget===!0)&&(Yt=t.toneMapping);const Ze={shaderID:I,shaderType:y.type,shaderName:y.name,vertexShader:W,fragmentShader:te,defines:y.defines,customVertexShaderID:le,customFragmentShaderID:ce,isRawShaderMaterial:y.isRawShaderMaterial===!0,glslVersion:y.glslVersion,precision:v,batching:He,batchingColor:He&&$._colorsTexture!==null,instancing:Ce,instancingColor:Ce&&$.instanceColor!==null,instancingMorph:Ce&&$.morphTexture!==null,supportsVertexTextures:g,outputColorSpace:De===null?t.outputColorSpace:De.isXRRenderTarget===!0?De.texture.colorSpace:Qi,alphaToCoverage:!!y.alphaToCoverage,map:Qe,matcap:Ve,envMap:R,envMapMode:R&&L.mapping,envMapCubeUVHeight:K,aoMap:$e,lightMap:Ue,bumpMap:Oe,normalMap:Ae,displacementMap:g&&rt,emissiveMap:Pe,normalMapObjectSpace:Ae&&y.normalMapType===NS,normalMapTangentSpace:Ae&&y.normalMapType===sx,metalnessMap:C,roughnessMap:w,anisotropy:O,anisotropyMap:xe,clearcoat:J,clearcoatMap:Ye,clearcoatNormalMap:re,clearcoatRoughnessMap:ve,dispersion:ne,iridescence:Z,iridescenceMap:ke,iridescenceThicknessMap:Ie,sheen:Me,sheenColorMap:_e,sheenRoughnessMap:Ge,specularMap:Fe,specularColorMap:at,specularIntensityMap:D,transmission:ue,transmissionMap:pe,thicknessMap:X,gradientMap:ee,opaque:y.transparent===!1&&y.blending===ds&&y.alphaToCoverage===!1,alphaMap:de,alphaTest:me,alphaHash:We,combine:y.combine,mapUv:Qe&&m(y.map.channel),aoMapUv:$e&&m(y.aoMap.channel),lightMapUv:Ue&&m(y.lightMap.channel),bumpMapUv:Oe&&m(y.bumpMap.channel),normalMapUv:Ae&&m(y.normalMap.channel),displacementMapUv:rt&&m(y.displacementMap.channel),emissiveMapUv:Pe&&m(y.emissiveMap.channel),metalnessMapUv:C&&m(y.metalnessMap.channel),roughnessMapUv:w&&m(y.roughnessMap.channel),anisotropyMapUv:xe&&m(y.anisotropyMap.channel),clearcoatMapUv:Ye&&m(y.clearcoatMap.channel),clearcoatNormalMapUv:re&&m(y.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ve&&m(y.clearcoatRoughnessMap.channel),iridescenceMapUv:ke&&m(y.iridescenceMap.channel),iridescenceThicknessMapUv:Ie&&m(y.iridescenceThicknessMap.channel),sheenColorMapUv:_e&&m(y.sheenColorMap.channel),sheenRoughnessMapUv:Ge&&m(y.sheenRoughnessMap.channel),specularMapUv:Fe&&m(y.specularMap.channel),specularColorMapUv:at&&m(y.specularColorMap.channel),specularIntensityMapUv:D&&m(y.specularIntensityMap.channel),transmissionMapUv:pe&&m(y.transmissionMap.channel),thicknessMapUv:X&&m(y.thicknessMap.channel),alphaMapUv:de&&m(y.alphaMap.channel),vertexTangents:!!G.attributes.tangent&&(Ae||O),vertexColors:y.vertexColors,vertexAlphas:y.vertexColors===!0&&!!G.attributes.color&&G.attributes.color.itemSize===4,pointsUvs:$.isPoints===!0&&!!G.attributes.uv&&(Qe||de),fog:!!Q,useFog:y.fog===!0,fogExp2:!!Q&&Q.isFogExp2,flatShading:y.flatShading===!0,sizeAttenuation:y.sizeAttenuation===!0,logarithmicDepthBuffer:p,reverseDepthBuffer:f,skinning:$.isSkinnedMesh===!0,morphTargets:G.morphAttributes.position!==void 0,morphNormals:G.morphAttributes.normal!==void 0,morphColors:G.morphAttributes.color!==void 0,morphTargetsCount:fe,morphTextureStride:Te,numDirLights:b.directional.length,numPointLights:b.point.length,numSpotLights:b.spot.length,numSpotLightMaps:b.spotLightMap.length,numRectAreaLights:b.rectArea.length,numHemiLights:b.hemi.length,numDirLightShadows:b.directionalShadowMap.length,numPointLightShadows:b.pointShadowMap.length,numSpotLightShadows:b.spotShadowMap.length,numSpotLightShadowsWithMaps:b.numSpotLightShadowsWithMaps,numLightProbes:b.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:y.dithering,shadowMapEnabled:t.shadowMap.enabled&&V.length>0,shadowMapType:t.shadowMap.type,toneMapping:Yt,decodeVideoTexture:Qe&&y.map.isVideoTexture===!0&&tt.getTransfer(y.map.colorSpace)===ut,premultipliedAlpha:y.premultipliedAlpha,doubleSided:y.side===Xn,flipSided:y.side===sn,useDepthPacking:y.depthPacking>=0,depthPacking:y.depthPacking||0,index0AttributeName:y.index0AttributeName,extensionClipCullDistance:St&&y.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(St&&y.extensions.multiDraw===!0||He)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:y.customProgramCacheKey()};return Ze.vertexUv1s=u.has(1),Ze.vertexUv2s=u.has(2),Ze.vertexUv3s=u.has(3),u.clear(),Ze}function _(y){const b=[];if(y.shaderID?b.push(y.shaderID):(b.push(y.customVertexShaderID),b.push(y.customFragmentShaderID)),y.defines!==void 0)for(const V in y.defines)b.push(V),b.push(y.defines[V]);return y.isRawShaderMaterial===!1&&(x(b,y),M(b,y),b.push(t.outputColorSpace)),b.push(y.customProgramCacheKey),b.join()}function x(y,b){y.push(b.precision),y.push(b.outputColorSpace),y.push(b.envMapMode),y.push(b.envMapCubeUVHeight),y.push(b.mapUv),y.push(b.alphaMapUv),y.push(b.lightMapUv),y.push(b.aoMapUv),y.push(b.bumpMapUv),y.push(b.normalMapUv),y.push(b.displacementMapUv),y.push(b.emissiveMapUv),y.push(b.metalnessMapUv),y.push(b.roughnessMapUv),y.push(b.anisotropyMapUv),y.push(b.clearcoatMapUv),y.push(b.clearcoatNormalMapUv),y.push(b.clearcoatRoughnessMapUv),y.push(b.iridescenceMapUv),y.push(b.iridescenceThicknessMapUv),y.push(b.sheenColorMapUv),y.push(b.sheenRoughnessMapUv),y.push(b.specularMapUv),y.push(b.specularColorMapUv),y.push(b.specularIntensityMapUv),y.push(b.transmissionMapUv),y.push(b.thicknessMapUv),y.push(b.combine),y.push(b.fogExp2),y.push(b.sizeAttenuation),y.push(b.morphTargetsCount),y.push(b.morphAttributeCount),y.push(b.numDirLights),y.push(b.numPointLights),y.push(b.numSpotLights),y.push(b.numSpotLightMaps),y.push(b.numHemiLights),y.push(b.numRectAreaLights),y.push(b.numDirLightShadows),y.push(b.numPointLightShadows),y.push(b.numSpotLightShadows),y.push(b.numSpotLightShadowsWithMaps),y.push(b.numLightProbes),y.push(b.shadowMapType),y.push(b.toneMapping),y.push(b.numClippingPlanes),y.push(b.numClipIntersection),y.push(b.depthPacking)}function M(y,b){o.disableAll(),b.supportsVertexTextures&&o.enable(0),b.instancing&&o.enable(1),b.instancingColor&&o.enable(2),b.instancingMorph&&o.enable(3),b.matcap&&o.enable(4),b.envMap&&o.enable(5),b.normalMapObjectSpace&&o.enable(6),b.normalMapTangentSpace&&o.enable(7),b.clearcoat&&o.enable(8),b.iridescence&&o.enable(9),b.alphaTest&&o.enable(10),b.vertexColors&&o.enable(11),b.vertexAlphas&&o.enable(12),b.vertexUv1s&&o.enable(13),b.vertexUv2s&&o.enable(14),b.vertexUv3s&&o.enable(15),b.vertexTangents&&o.enable(16),b.anisotropy&&o.enable(17),b.alphaHash&&o.enable(18),b.batching&&o.enable(19),b.dispersion&&o.enable(20),b.batchingColor&&o.enable(21),y.push(o.mask),o.disableAll(),b.fog&&o.enable(0),b.useFog&&o.enable(1),b.flatShading&&o.enable(2),b.logarithmicDepthBuffer&&o.enable(3),b.reverseDepthBuffer&&o.enable(4),b.skinning&&o.enable(5),b.morphTargets&&o.enable(6),b.morphNormals&&o.enable(7),b.morphColors&&o.enable(8),b.premultipliedAlpha&&o.enable(9),b.shadowMapEnabled&&o.enable(10),b.doubleSided&&o.enable(11),b.flipSided&&o.enable(12),b.useDepthPacking&&o.enable(13),b.dithering&&o.enable(14),b.transmission&&o.enable(15),b.sheen&&o.enable(16),b.opaque&&o.enable(17),b.pointsUvs&&o.enable(18),b.decodeVideoTexture&&o.enable(19),b.alphaToCoverage&&o.enable(20),y.push(o.mask)}function P(y){const b=S[y.type];let V;if(b){const j=Gn[b];V=a1.clone(j.uniforms)}else V=y.uniforms;return V}function T(y,b){let V;for(let j=0,$=h.length;j<$;j++){const Q=h[j];if(Q.cacheKey===b){V=Q,++V.usedTimes;break}}return V===void 0&&(V=new yb(t,b,y,s),h.push(V)),V}function A(y){if(--y.usedTimes===0){const b=h.indexOf(y);h[b]=h[h.length-1],h.pop(),y.destroy()}}function N(y){l.remove(y)}function H(){l.dispose()}return{getParameters:d,getProgramCacheKey:_,getUniforms:P,acquireProgram:T,releaseProgram:A,releaseShaderCache:N,programs:h,dispose:H}}function bb(){let t=new WeakMap;function e(a){return t.has(a)}function n(a){let o=t.get(a);return o===void 0&&(o={},t.set(a,o)),o}function i(a){t.delete(a)}function r(a,o,l){t.get(a)[o]=l}function s(){t=new WeakMap}return{has:e,get:n,remove:i,update:r,dispose:s}}function Tb(t,e){return t.groupOrder!==e.groupOrder?t.groupOrder-e.groupOrder:t.renderOrder!==e.renderOrder?t.renderOrder-e.renderOrder:t.material.id!==e.material.id?t.material.id-e.material.id:t.z!==e.z?t.z-e.z:t.id-e.id}function cm(t,e){return t.groupOrder!==e.groupOrder?t.groupOrder-e.groupOrder:t.renderOrder!==e.renderOrder?t.renderOrder-e.renderOrder:t.z!==e.z?e.z-t.z:t.id-e.id}function um(){const t=[];let e=0;const n=[],i=[],r=[];function s(){e=0,n.length=0,i.length=0,r.length=0}function a(p,f,g,v,S,m){let d=t[e];return d===void 0?(d={id:p.id,object:p,geometry:f,material:g,groupOrder:v,renderOrder:p.renderOrder,z:S,group:m},t[e]=d):(d.id=p.id,d.object=p,d.geometry=f,d.material=g,d.groupOrder=v,d.renderOrder=p.renderOrder,d.z=S,d.group=m),e++,d}function o(p,f,g,v,S,m){const d=a(p,f,g,v,S,m);g.transmission>0?i.push(d):g.transparent===!0?r.push(d):n.push(d)}function l(p,f,g,v,S,m){const d=a(p,f,g,v,S,m);g.transmission>0?i.unshift(d):g.transparent===!0?r.unshift(d):n.unshift(d)}function u(p,f){n.length>1&&n.sort(p||Tb),i.length>1&&i.sort(f||cm),r.length>1&&r.sort(f||cm)}function h(){for(let p=e,f=t.length;p<f;p++){const g=t[p];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:n,transmissive:i,transparent:r,init:s,push:o,unshift:l,finish:h,sort:u}}function Ab(){let t=new WeakMap;function e(i,r){const s=t.get(i);let a;return s===void 0?(a=new um,t.set(i,[a])):r>=s.length?(a=new um,s.push(a)):a=s[r],a}function n(){t=new WeakMap}return{get:e,dispose:n}}function Cb(){const t={};return{get:function(e){if(t[e.id]!==void 0)return t[e.id];let n;switch(e.type){case"DirectionalLight":n={direction:new F,color:new Xe};break;case"SpotLight":n={position:new F,direction:new F,color:new Xe,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":n={position:new F,color:new Xe,distance:0,decay:0};break;case"HemisphereLight":n={direction:new F,skyColor:new Xe,groundColor:new Xe};break;case"RectAreaLight":n={color:new Xe,position:new F,halfWidth:new F,halfHeight:new F};break}return t[e.id]=n,n}}}function Rb(){const t={};return{get:function(e){if(t[e.id]!==void 0)return t[e.id];let n;switch(e.type){case"DirectionalLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ke};break;case"SpotLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ke};break;case"PointLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ke,shadowCameraNear:1,shadowCameraFar:1e3};break}return t[e.id]=n,n}}}let Nb=0;function Pb(t,e){return(e.castShadow?2:0)-(t.castShadow?2:0)+(e.map?1:0)-(t.map?1:0)}function Lb(t){const e=new Cb,n=Rb(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let u=0;u<9;u++)i.probe.push(new F);const r=new F,s=new ht,a=new ht;function o(u){let h=0,p=0,f=0;for(let H=0;H<9;H++)i.probe[H].set(0,0,0);let g=0,v=0,S=0,m=0,d=0,_=0,x=0,M=0,P=0,T=0,A=0;u.sort(Pb);for(let H=0,y=u.length;H<y;H++){const b=u[H],V=b.color,j=b.intensity,$=b.distance,Q=b.shadow&&b.shadow.map?b.shadow.map.texture:null;if(b.isAmbientLight)h+=V.r*j,p+=V.g*j,f+=V.b*j;else if(b.isLightProbe){for(let G=0;G<9;G++)i.probe[G].addScaledVector(b.sh.coefficients[G],j);A++}else if(b.isDirectionalLight){const G=e.get(b);if(G.color.copy(b.color).multiplyScalar(b.intensity),b.castShadow){const Y=b.shadow,L=n.get(b);L.shadowIntensity=Y.intensity,L.shadowBias=Y.bias,L.shadowNormalBias=Y.normalBias,L.shadowRadius=Y.radius,L.shadowMapSize=Y.mapSize,i.directionalShadow[g]=L,i.directionalShadowMap[g]=Q,i.directionalShadowMatrix[g]=b.shadow.matrix,_++}i.directional[g]=G,g++}else if(b.isSpotLight){const G=e.get(b);G.position.setFromMatrixPosition(b.matrixWorld),G.color.copy(V).multiplyScalar(j),G.distance=$,G.coneCos=Math.cos(b.angle),G.penumbraCos=Math.cos(b.angle*(1-b.penumbra)),G.decay=b.decay,i.spot[S]=G;const Y=b.shadow;if(b.map&&(i.spotLightMap[P]=b.map,P++,Y.updateMatrices(b),b.castShadow&&T++),i.spotLightMatrix[S]=Y.matrix,b.castShadow){const L=n.get(b);L.shadowIntensity=Y.intensity,L.shadowBias=Y.bias,L.shadowNormalBias=Y.normalBias,L.shadowRadius=Y.radius,L.shadowMapSize=Y.mapSize,i.spotShadow[S]=L,i.spotShadowMap[S]=Q,M++}S++}else if(b.isRectAreaLight){const G=e.get(b);G.color.copy(V).multiplyScalar(j),G.halfWidth.set(b.width*.5,0,0),G.halfHeight.set(0,b.height*.5,0),i.rectArea[m]=G,m++}else if(b.isPointLight){const G=e.get(b);if(G.color.copy(b.color).multiplyScalar(b.intensity),G.distance=b.distance,G.decay=b.decay,b.castShadow){const Y=b.shadow,L=n.get(b);L.shadowIntensity=Y.intensity,L.shadowBias=Y.bias,L.shadowNormalBias=Y.normalBias,L.shadowRadius=Y.radius,L.shadowMapSize=Y.mapSize,L.shadowCameraNear=Y.camera.near,L.shadowCameraFar=Y.camera.far,i.pointShadow[v]=L,i.pointShadowMap[v]=Q,i.pointShadowMatrix[v]=b.shadow.matrix,x++}i.point[v]=G,v++}else if(b.isHemisphereLight){const G=e.get(b);G.skyColor.copy(b.color).multiplyScalar(j),G.groundColor.copy(b.groundColor).multiplyScalar(j),i.hemi[d]=G,d++}}m>0&&(t.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=oe.LTC_FLOAT_1,i.rectAreaLTC2=oe.LTC_FLOAT_2):(i.rectAreaLTC1=oe.LTC_HALF_1,i.rectAreaLTC2=oe.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=p,i.ambient[2]=f;const N=i.hash;(N.directionalLength!==g||N.pointLength!==v||N.spotLength!==S||N.rectAreaLength!==m||N.hemiLength!==d||N.numDirectionalShadows!==_||N.numPointShadows!==x||N.numSpotShadows!==M||N.numSpotMaps!==P||N.numLightProbes!==A)&&(i.directional.length=g,i.spot.length=S,i.rectArea.length=m,i.point.length=v,i.hemi.length=d,i.directionalShadow.length=_,i.directionalShadowMap.length=_,i.pointShadow.length=x,i.pointShadowMap.length=x,i.spotShadow.length=M,i.spotShadowMap.length=M,i.directionalShadowMatrix.length=_,i.pointShadowMatrix.length=x,i.spotLightMatrix.length=M+P-T,i.spotLightMap.length=P,i.numSpotLightShadowsWithMaps=T,i.numLightProbes=A,N.directionalLength=g,N.pointLength=v,N.spotLength=S,N.rectAreaLength=m,N.hemiLength=d,N.numDirectionalShadows=_,N.numPointShadows=x,N.numSpotShadows=M,N.numSpotMaps=P,N.numLightProbes=A,i.version=Nb++)}function l(u,h){let p=0,f=0,g=0,v=0,S=0;const m=h.matrixWorldInverse;for(let d=0,_=u.length;d<_;d++){const x=u[d];if(x.isDirectionalLight){const M=i.directional[p];M.direction.setFromMatrixPosition(x.matrixWorld),r.setFromMatrixPosition(x.target.matrixWorld),M.direction.sub(r),M.direction.transformDirection(m),p++}else if(x.isSpotLight){const M=i.spot[g];M.position.setFromMatrixPosition(x.matrixWorld),M.position.applyMatrix4(m),M.direction.setFromMatrixPosition(x.matrixWorld),r.setFromMatrixPosition(x.target.matrixWorld),M.direction.sub(r),M.direction.transformDirection(m),g++}else if(x.isRectAreaLight){const M=i.rectArea[v];M.position.setFromMatrixPosition(x.matrixWorld),M.position.applyMatrix4(m),a.identity(),s.copy(x.matrixWorld),s.premultiply(m),a.extractRotation(s),M.halfWidth.set(x.width*.5,0,0),M.halfHeight.set(0,x.height*.5,0),M.halfWidth.applyMatrix4(a),M.halfHeight.applyMatrix4(a),v++}else if(x.isPointLight){const M=i.point[f];M.position.setFromMatrixPosition(x.matrixWorld),M.position.applyMatrix4(m),f++}else if(x.isHemisphereLight){const M=i.hemi[S];M.direction.setFromMatrixPosition(x.matrixWorld),M.direction.transformDirection(m),S++}}}return{setup:o,setupView:l,state:i}}function dm(t){const e=new Lb(t),n=[],i=[];function r(h){u.camera=h,n.length=0,i.length=0}function s(h){n.push(h)}function a(h){i.push(h)}function o(){e.setup(n)}function l(h){e.setupView(n,h)}const u={lightsArray:n,shadowsArray:i,camera:null,lights:e,transmissionRenderTarget:{}};return{init:r,state:u,setupLights:o,setupLightsView:l,pushLight:s,pushShadow:a}}function Db(t){let e=new WeakMap;function n(r,s=0){const a=e.get(r);let o;return a===void 0?(o=new dm(t),e.set(r,[o])):s>=a.length?(o=new dm(t),a.push(o)):o=a[s],o}function i(){e=new WeakMap}return{get:n,dispose:i}}class kb extends Ds{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=CS,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class Ib extends Ds{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const Ub=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Fb=`uniform sampler2D shadow_pass;
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
}`;function Ob(t,e,n){let i=new $h;const r=new Ke,s=new Ke,a=new st,o=new kb({depthPacking:RS}),l=new Ib,u={},h=n.maxTextureSize,p={[qi]:sn,[sn]:qi,[Xn]:Xn},f=new $i({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Ke},radius:{value:4}},vertexShader:Ub,fragmentShader:Fb}),g=f.clone();g.defines.HORIZONTAL_PASS=1;const v=new vi;v.setAttribute("position",new bn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const S=new qn(v,f),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Xg;let d=this.type;this.render=function(T,A,N){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||T.length===0)return;const H=t.getRenderTarget(),y=t.getActiveCubeFace(),b=t.getActiveMipmapLevel(),V=t.state;V.setBlending(Vi),V.buffers.color.setClear(1,1,1,1),V.buffers.depth.setTest(!0),V.setScissorTest(!1);const j=d!==ii&&this.type===ii,$=d===ii&&this.type!==ii;for(let Q=0,G=T.length;Q<G;Q++){const Y=T[Q],L=Y.shadow;if(L===void 0){console.warn("THREE.WebGLShadowMap:",Y,"has no shadow.");continue}if(L.autoUpdate===!1&&L.needsUpdate===!1)continue;r.copy(L.mapSize);const K=L.getFrameExtents();if(r.multiply(K),s.copy(L.mapSize),(r.x>h||r.y>h)&&(r.x>h&&(s.x=Math.floor(h/K.x),r.x=s.x*K.x,L.mapSize.x=s.x),r.y>h&&(s.y=Math.floor(h/K.y),r.y=s.y*K.y,L.mapSize.y=s.y)),L.map===null||j===!0||$===!0){const q=this.type!==ii?{minFilter:Mn,magFilter:Mn}:{};L.map!==null&&L.map.dispose(),L.map=new Ar(r.x,r.y,q),L.map.texture.name=Y.name+".shadowMap",L.camera.updateProjectionMatrix()}t.setRenderTarget(L.map),t.clear();const I=L.getViewportCount();for(let q=0;q<I;q++){const fe=L.getViewport(q);a.set(s.x*fe.x,s.y*fe.y,s.x*fe.z,s.y*fe.w),V.viewport(a),L.updateMatrices(Y,q),i=L.getFrustum(),M(A,N,L.camera,Y,this.type)}L.isPointLightShadow!==!0&&this.type===ii&&_(L,N),L.needsUpdate=!1}d=this.type,m.needsUpdate=!1,t.setRenderTarget(H,y,b)};function _(T,A){const N=e.update(S);f.defines.VSM_SAMPLES!==T.blurSamples&&(f.defines.VSM_SAMPLES=T.blurSamples,g.defines.VSM_SAMPLES=T.blurSamples,f.needsUpdate=!0,g.needsUpdate=!0),T.mapPass===null&&(T.mapPass=new Ar(r.x,r.y)),f.uniforms.shadow_pass.value=T.map.texture,f.uniforms.resolution.value=T.mapSize,f.uniforms.radius.value=T.radius,t.setRenderTarget(T.mapPass),t.clear(),t.renderBufferDirect(A,null,N,f,S,null),g.uniforms.shadow_pass.value=T.mapPass.texture,g.uniforms.resolution.value=T.mapSize,g.uniforms.radius.value=T.radius,t.setRenderTarget(T.map),t.clear(),t.renderBufferDirect(A,null,N,g,S,null)}function x(T,A,N,H){let y=null;const b=N.isPointLight===!0?T.customDistanceMaterial:T.customDepthMaterial;if(b!==void 0)y=b;else if(y=N.isPointLight===!0?l:o,t.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0){const V=y.uuid,j=A.uuid;let $=u[V];$===void 0&&($={},u[V]=$);let Q=$[j];Q===void 0&&(Q=y.clone(),$[j]=Q,A.addEventListener("dispose",P)),y=Q}if(y.visible=A.visible,y.wireframe=A.wireframe,H===ii?y.side=A.shadowSide!==null?A.shadowSide:A.side:y.side=A.shadowSide!==null?A.shadowSide:p[A.side],y.alphaMap=A.alphaMap,y.alphaTest=A.alphaTest,y.map=A.map,y.clipShadows=A.clipShadows,y.clippingPlanes=A.clippingPlanes,y.clipIntersection=A.clipIntersection,y.displacementMap=A.displacementMap,y.displacementScale=A.displacementScale,y.displacementBias=A.displacementBias,y.wireframeLinewidth=A.wireframeLinewidth,y.linewidth=A.linewidth,N.isPointLight===!0&&y.isMeshDistanceMaterial===!0){const V=t.properties.get(y);V.light=N}return y}function M(T,A,N,H,y){if(T.visible===!1)return;if(T.layers.test(A.layers)&&(T.isMesh||T.isLine||T.isPoints)&&(T.castShadow||T.receiveShadow&&y===ii)&&(!T.frustumCulled||i.intersectsObject(T))){T.modelViewMatrix.multiplyMatrices(N.matrixWorldInverse,T.matrixWorld);const j=e.update(T),$=T.material;if(Array.isArray($)){const Q=j.groups;for(let G=0,Y=Q.length;G<Y;G++){const L=Q[G],K=$[L.materialIndex];if(K&&K.visible){const I=x(T,K,H,y);T.onBeforeShadow(t,T,A,N,j,I,L),t.renderBufferDirect(N,null,j,I,T,L),T.onAfterShadow(t,T,A,N,j,I,L)}}}else if($.visible){const Q=x(T,$,H,y);T.onBeforeShadow(t,T,A,N,j,Q,null),t.renderBufferDirect(N,null,j,Q,T,null),T.onAfterShadow(t,T,A,N,j,Q,null)}}const V=T.children;for(let j=0,$=V.length;j<$;j++)M(V[j],A,N,H,y)}function P(T){T.target.removeEventListener("dispose",P);for(const N in u){const H=u[N],y=T.target.uuid;y in H&&(H[y].dispose(),delete H[y])}}}const zb={[nd]:id,[rd]:od,[sd]:ld,[Ms]:ad,[id]:nd,[od]:rd,[ld]:sd,[ad]:Ms};function Bb(t){function e(){let D=!1;const pe=new st;let X=null;const ee=new st(0,0,0,0);return{setMask:function(de){X!==de&&!D&&(t.colorMask(de,de,de,de),X=de)},setLocked:function(de){D=de},setClear:function(de,me,We,St,Yt){Yt===!0&&(de*=St,me*=St,We*=St),pe.set(de,me,We,St),ee.equals(pe)===!1&&(t.clearColor(de,me,We,St),ee.copy(pe))},reset:function(){D=!1,X=null,ee.set(-1,0,0,0)}}}function n(){let D=!1,pe=!1,X=null,ee=null,de=null;return{setReversed:function(me){pe=me},setTest:function(me){me?le(t.DEPTH_TEST):ce(t.DEPTH_TEST)},setMask:function(me){X!==me&&!D&&(t.depthMask(me),X=me)},setFunc:function(me){if(pe&&(me=zb[me]),ee!==me){switch(me){case nd:t.depthFunc(t.NEVER);break;case id:t.depthFunc(t.ALWAYS);break;case rd:t.depthFunc(t.LESS);break;case Ms:t.depthFunc(t.LEQUAL);break;case sd:t.depthFunc(t.EQUAL);break;case ad:t.depthFunc(t.GEQUAL);break;case od:t.depthFunc(t.GREATER);break;case ld:t.depthFunc(t.NOTEQUAL);break;default:t.depthFunc(t.LEQUAL)}ee=me}},setLocked:function(me){D=me},setClear:function(me){de!==me&&(t.clearDepth(me),de=me)},reset:function(){D=!1,X=null,ee=null,de=null}}}function i(){let D=!1,pe=null,X=null,ee=null,de=null,me=null,We=null,St=null,Yt=null;return{setTest:function(Ze){D||(Ze?le(t.STENCIL_TEST):ce(t.STENCIL_TEST))},setMask:function(Ze){pe!==Ze&&!D&&(t.stencilMask(Ze),pe=Ze)},setFunc:function(Ze,Kt,Zn){(X!==Ze||ee!==Kt||de!==Zn)&&(t.stencilFunc(Ze,Kt,Zn),X=Ze,ee=Kt,de=Zn)},setOp:function(Ze,Kt,Zn){(me!==Ze||We!==Kt||St!==Zn)&&(t.stencilOp(Ze,Kt,Zn),me=Ze,We=Kt,St=Zn)},setLocked:function(Ze){D=Ze},setClear:function(Ze){Yt!==Ze&&(t.clearStencil(Ze),Yt=Ze)},reset:function(){D=!1,pe=null,X=null,ee=null,de=null,me=null,We=null,St=null,Yt=null}}}const r=new e,s=new n,a=new i,o=new WeakMap,l=new WeakMap;let u={},h={},p=new WeakMap,f=[],g=null,v=!1,S=null,m=null,d=null,_=null,x=null,M=null,P=null,T=new Xe(0,0,0),A=0,N=!1,H=null,y=null,b=null,V=null,j=null;const $=t.getParameter(t.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let Q=!1,G=0;const Y=t.getParameter(t.VERSION);Y.indexOf("WebGL")!==-1?(G=parseFloat(/^WebGL (\d)/.exec(Y)[1]),Q=G>=1):Y.indexOf("OpenGL ES")!==-1&&(G=parseFloat(/^OpenGL ES (\d)/.exec(Y)[1]),Q=G>=2);let L=null,K={};const I=t.getParameter(t.SCISSOR_BOX),q=t.getParameter(t.VIEWPORT),fe=new st().fromArray(I),Te=new st().fromArray(q);function W(D,pe,X,ee){const de=new Uint8Array(4),me=t.createTexture();t.bindTexture(D,me),t.texParameteri(D,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(D,t.TEXTURE_MAG_FILTER,t.NEAREST);for(let We=0;We<X;We++)D===t.TEXTURE_3D||D===t.TEXTURE_2D_ARRAY?t.texImage3D(pe,0,t.RGBA,1,1,ee,0,t.RGBA,t.UNSIGNED_BYTE,de):t.texImage2D(pe+We,0,t.RGBA,1,1,0,t.RGBA,t.UNSIGNED_BYTE,de);return me}const te={};te[t.TEXTURE_2D]=W(t.TEXTURE_2D,t.TEXTURE_2D,1),te[t.TEXTURE_CUBE_MAP]=W(t.TEXTURE_CUBE_MAP,t.TEXTURE_CUBE_MAP_POSITIVE_X,6),te[t.TEXTURE_2D_ARRAY]=W(t.TEXTURE_2D_ARRAY,t.TEXTURE_2D_ARRAY,1,1),te[t.TEXTURE_3D]=W(t.TEXTURE_3D,t.TEXTURE_3D,1,1),r.setClear(0,0,0,1),s.setClear(1),a.setClear(0),le(t.DEPTH_TEST),s.setFunc(Ms),Ue(!1),Oe(yp),le(t.CULL_FACE),R(Vi);function le(D){u[D]!==!0&&(t.enable(D),u[D]=!0)}function ce(D){u[D]!==!1&&(t.disable(D),u[D]=!1)}function De(D,pe){return h[D]!==pe?(t.bindFramebuffer(D,pe),h[D]=pe,D===t.DRAW_FRAMEBUFFER&&(h[t.FRAMEBUFFER]=pe),D===t.FRAMEBUFFER&&(h[t.DRAW_FRAMEBUFFER]=pe),!0):!1}function Ce(D,pe){let X=f,ee=!1;if(D){X=p.get(pe),X===void 0&&(X=[],p.set(pe,X));const de=D.textures;if(X.length!==de.length||X[0]!==t.COLOR_ATTACHMENT0){for(let me=0,We=de.length;me<We;me++)X[me]=t.COLOR_ATTACHMENT0+me;X.length=de.length,ee=!0}}else X[0]!==t.BACK&&(X[0]=t.BACK,ee=!0);ee&&t.drawBuffers(X)}function He(D){return g!==D?(t.useProgram(D),g=D,!0):!1}const Qe={[ur]:t.FUNC_ADD,[tS]:t.FUNC_SUBTRACT,[nS]:t.FUNC_REVERSE_SUBTRACT};Qe[iS]=t.MIN,Qe[rS]=t.MAX;const Ve={[sS]:t.ZERO,[aS]:t.ONE,[oS]:t.SRC_COLOR,[ed]:t.SRC_ALPHA,[fS]:t.SRC_ALPHA_SATURATE,[dS]:t.DST_COLOR,[cS]:t.DST_ALPHA,[lS]:t.ONE_MINUS_SRC_COLOR,[td]:t.ONE_MINUS_SRC_ALPHA,[hS]:t.ONE_MINUS_DST_COLOR,[uS]:t.ONE_MINUS_DST_ALPHA,[pS]:t.CONSTANT_COLOR,[mS]:t.ONE_MINUS_CONSTANT_COLOR,[gS]:t.CONSTANT_ALPHA,[xS]:t.ONE_MINUS_CONSTANT_ALPHA};function R(D,pe,X,ee,de,me,We,St,Yt,Ze){if(D===Vi){v===!0&&(ce(t.BLEND),v=!1);return}if(v===!1&&(le(t.BLEND),v=!0),D!==eS){if(D!==S||Ze!==N){if((m!==ur||x!==ur)&&(t.blendEquation(t.FUNC_ADD),m=ur,x=ur),Ze)switch(D){case ds:t.blendFuncSeparate(t.ONE,t.ONE_MINUS_SRC_ALPHA,t.ONE,t.ONE_MINUS_SRC_ALPHA);break;case Ju:t.blendFunc(t.ONE,t.ONE);break;case Sp:t.blendFuncSeparate(t.ZERO,t.ONE_MINUS_SRC_COLOR,t.ZERO,t.ONE);break;case wp:t.blendFuncSeparate(t.ZERO,t.SRC_COLOR,t.ZERO,t.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",D);break}else switch(D){case ds:t.blendFuncSeparate(t.SRC_ALPHA,t.ONE_MINUS_SRC_ALPHA,t.ONE,t.ONE_MINUS_SRC_ALPHA);break;case Ju:t.blendFunc(t.SRC_ALPHA,t.ONE);break;case Sp:t.blendFuncSeparate(t.ZERO,t.ONE_MINUS_SRC_COLOR,t.ZERO,t.ONE);break;case wp:t.blendFunc(t.ZERO,t.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",D);break}d=null,_=null,M=null,P=null,T.set(0,0,0),A=0,S=D,N=Ze}return}de=de||pe,me=me||X,We=We||ee,(pe!==m||de!==x)&&(t.blendEquationSeparate(Qe[pe],Qe[de]),m=pe,x=de),(X!==d||ee!==_||me!==M||We!==P)&&(t.blendFuncSeparate(Ve[X],Ve[ee],Ve[me],Ve[We]),d=X,_=ee,M=me,P=We),(St.equals(T)===!1||Yt!==A)&&(t.blendColor(St.r,St.g,St.b,Yt),T.copy(St),A=Yt),S=D,N=!1}function $e(D,pe){D.side===Xn?ce(t.CULL_FACE):le(t.CULL_FACE);let X=D.side===sn;pe&&(X=!X),Ue(X),D.blending===ds&&D.transparent===!1?R(Vi):R(D.blending,D.blendEquation,D.blendSrc,D.blendDst,D.blendEquationAlpha,D.blendSrcAlpha,D.blendDstAlpha,D.blendColor,D.blendAlpha,D.premultipliedAlpha),s.setFunc(D.depthFunc),s.setTest(D.depthTest),s.setMask(D.depthWrite),r.setMask(D.colorWrite);const ee=D.stencilWrite;a.setTest(ee),ee&&(a.setMask(D.stencilWriteMask),a.setFunc(D.stencilFunc,D.stencilRef,D.stencilFuncMask),a.setOp(D.stencilFail,D.stencilZFail,D.stencilZPass)),rt(D.polygonOffset,D.polygonOffsetFactor,D.polygonOffsetUnits),D.alphaToCoverage===!0?le(t.SAMPLE_ALPHA_TO_COVERAGE):ce(t.SAMPLE_ALPHA_TO_COVERAGE)}function Ue(D){H!==D&&(D?t.frontFace(t.CW):t.frontFace(t.CCW),H=D)}function Oe(D){D!==Zy?(le(t.CULL_FACE),D!==y&&(D===yp?t.cullFace(t.BACK):D===Qy?t.cullFace(t.FRONT):t.cullFace(t.FRONT_AND_BACK))):ce(t.CULL_FACE),y=D}function Ae(D){D!==b&&(Q&&t.lineWidth(D),b=D)}function rt(D,pe,X){D?(le(t.POLYGON_OFFSET_FILL),(V!==pe||j!==X)&&(t.polygonOffset(pe,X),V=pe,j=X)):ce(t.POLYGON_OFFSET_FILL)}function Pe(D){D?le(t.SCISSOR_TEST):ce(t.SCISSOR_TEST)}function C(D){D===void 0&&(D=t.TEXTURE0+$-1),L!==D&&(t.activeTexture(D),L=D)}function w(D,pe,X){X===void 0&&(L===null?X=t.TEXTURE0+$-1:X=L);let ee=K[X];ee===void 0&&(ee={type:void 0,texture:void 0},K[X]=ee),(ee.type!==D||ee.texture!==pe)&&(L!==X&&(t.activeTexture(X),L=X),t.bindTexture(D,pe||te[D]),ee.type=D,ee.texture=pe)}function O(){const D=K[L];D!==void 0&&D.type!==void 0&&(t.bindTexture(D.type,null),D.type=void 0,D.texture=void 0)}function J(){try{t.compressedTexImage2D.apply(t,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function ne(){try{t.compressedTexImage3D.apply(t,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Z(){try{t.texSubImage2D.apply(t,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Me(){try{t.texSubImage3D.apply(t,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function ue(){try{t.compressedTexSubImage2D.apply(t,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function xe(){try{t.compressedTexSubImage3D.apply(t,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Ye(){try{t.texStorage2D.apply(t,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function re(){try{t.texStorage3D.apply(t,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function ve(){try{t.texImage2D.apply(t,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function ke(){try{t.texImage3D.apply(t,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Ie(D){fe.equals(D)===!1&&(t.scissor(D.x,D.y,D.z,D.w),fe.copy(D))}function _e(D){Te.equals(D)===!1&&(t.viewport(D.x,D.y,D.z,D.w),Te.copy(D))}function Ge(D,pe){let X=l.get(pe);X===void 0&&(X=new WeakMap,l.set(pe,X));let ee=X.get(D);ee===void 0&&(ee=t.getUniformBlockIndex(pe,D.name),X.set(D,ee))}function Fe(D,pe){const ee=l.get(pe).get(D);o.get(pe)!==ee&&(t.uniformBlockBinding(pe,ee,D.__bindingPointIndex),o.set(pe,ee))}function at(){t.disable(t.BLEND),t.disable(t.CULL_FACE),t.disable(t.DEPTH_TEST),t.disable(t.POLYGON_OFFSET_FILL),t.disable(t.SCISSOR_TEST),t.disable(t.STENCIL_TEST),t.disable(t.SAMPLE_ALPHA_TO_COVERAGE),t.blendEquation(t.FUNC_ADD),t.blendFunc(t.ONE,t.ZERO),t.blendFuncSeparate(t.ONE,t.ZERO,t.ONE,t.ZERO),t.blendColor(0,0,0,0),t.colorMask(!0,!0,!0,!0),t.clearColor(0,0,0,0),t.depthMask(!0),t.depthFunc(t.LESS),t.clearDepth(1),t.stencilMask(4294967295),t.stencilFunc(t.ALWAYS,0,4294967295),t.stencilOp(t.KEEP,t.KEEP,t.KEEP),t.clearStencil(0),t.cullFace(t.BACK),t.frontFace(t.CCW),t.polygonOffset(0,0),t.activeTexture(t.TEXTURE0),t.bindFramebuffer(t.FRAMEBUFFER,null),t.bindFramebuffer(t.DRAW_FRAMEBUFFER,null),t.bindFramebuffer(t.READ_FRAMEBUFFER,null),t.useProgram(null),t.lineWidth(1),t.scissor(0,0,t.canvas.width,t.canvas.height),t.viewport(0,0,t.canvas.width,t.canvas.height),u={},L=null,K={},h={},p=new WeakMap,f=[],g=null,v=!1,S=null,m=null,d=null,_=null,x=null,M=null,P=null,T=new Xe(0,0,0),A=0,N=!1,H=null,y=null,b=null,V=null,j=null,fe.set(0,0,t.canvas.width,t.canvas.height),Te.set(0,0,t.canvas.width,t.canvas.height),r.reset(),s.reset(),a.reset()}return{buffers:{color:r,depth:s,stencil:a},enable:le,disable:ce,bindFramebuffer:De,drawBuffers:Ce,useProgram:He,setBlending:R,setMaterial:$e,setFlipSided:Ue,setCullFace:Oe,setLineWidth:Ae,setPolygonOffset:rt,setScissorTest:Pe,activeTexture:C,bindTexture:w,unbindTexture:O,compressedTexImage2D:J,compressedTexImage3D:ne,texImage2D:ve,texImage3D:ke,updateUBOMapping:Ge,uniformBlockBinding:Fe,texStorage2D:Ye,texStorage3D:re,texSubImage2D:Z,texSubImage3D:Me,compressedTexSubImage2D:ue,compressedTexSubImage3D:xe,scissor:Ie,viewport:_e,reset:at}}function hm(t,e,n,i){const r=jb(i);switch(n){case Qg:return t*e;case ex:return t*e;case tx:return t*e*2;case nx:return t*e/r.components*r.byteLength;case Hh:return t*e/r.components*r.byteLength;case ix:return t*e*2/r.components*r.byteLength;case Vh:return t*e*2/r.components*r.byteLength;case Jg:return t*e*3/r.components*r.byteLength;case Fn:return t*e*4/r.components*r.byteLength;case Gh:return t*e*4/r.components*r.byteLength;case Xo:case qo:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*8;case $o:case Yo:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*16;case pd:case gd:return Math.max(t,16)*Math.max(e,8)/4;case fd:case md:return Math.max(t,8)*Math.max(e,8)/2;case xd:case vd:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*8;case _d:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*16;case yd:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*16;case Sd:return Math.floor((t+4)/5)*Math.floor((e+3)/4)*16;case wd:return Math.floor((t+4)/5)*Math.floor((e+4)/5)*16;case Md:return Math.floor((t+5)/6)*Math.floor((e+4)/5)*16;case Ed:return Math.floor((t+5)/6)*Math.floor((e+5)/6)*16;case bd:return Math.floor((t+7)/8)*Math.floor((e+4)/5)*16;case Td:return Math.floor((t+7)/8)*Math.floor((e+5)/6)*16;case Ad:return Math.floor((t+7)/8)*Math.floor((e+7)/8)*16;case Cd:return Math.floor((t+9)/10)*Math.floor((e+4)/5)*16;case Rd:return Math.floor((t+9)/10)*Math.floor((e+5)/6)*16;case Nd:return Math.floor((t+9)/10)*Math.floor((e+7)/8)*16;case Pd:return Math.floor((t+9)/10)*Math.floor((e+9)/10)*16;case Ld:return Math.floor((t+11)/12)*Math.floor((e+9)/10)*16;case Dd:return Math.floor((t+11)/12)*Math.floor((e+11)/12)*16;case Ko:case kd:case Id:return Math.ceil(t/4)*Math.ceil(e/4)*16;case rx:case Ud:return Math.ceil(t/4)*Math.ceil(e/4)*8;case Fd:case Od:return Math.ceil(t/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${n} format.`)}function jb(t){switch(t){case gi:case Yg:return{byteLength:1,components:1};case La:case Kg:case za:return{byteLength:2,components:1};case Bh:case jh:return{byteLength:2,components:4};case Tr:case zh:case li:return{byteLength:4,components:1};case Zg:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${t}.`)}function Hb(t,e,n,i,r,s,a){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),u=new Ke,h=new WeakMap;let p;const f=new WeakMap;let g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function v(C,w){return g?new OffscreenCanvas(C,w):Da("canvas")}function S(C,w,O){let J=1;const ne=Pe(C);if((ne.width>O||ne.height>O)&&(J=O/Math.max(ne.width,ne.height)),J<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){const Z=Math.floor(J*ne.width),Me=Math.floor(J*ne.height);p===void 0&&(p=v(Z,Me));const ue=w?v(Z,Me):p;return ue.width=Z,ue.height=Me,ue.getContext("2d").drawImage(C,0,0,Z,Me),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+ne.width+"x"+ne.height+") to ("+Z+"x"+Me+")."),ue}else return"data"in C&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+ne.width+"x"+ne.height+")."),C;return C}function m(C){return C.generateMipmaps&&C.minFilter!==Mn&&C.minFilter!==Sn}function d(C){t.generateMipmap(C)}function _(C,w,O,J,ne=!1){if(C!==null){if(t[C]!==void 0)return t[C];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let Z=w;if(w===t.RED&&(O===t.FLOAT&&(Z=t.R32F),O===t.HALF_FLOAT&&(Z=t.R16F),O===t.UNSIGNED_BYTE&&(Z=t.R8)),w===t.RED_INTEGER&&(O===t.UNSIGNED_BYTE&&(Z=t.R8UI),O===t.UNSIGNED_SHORT&&(Z=t.R16UI),O===t.UNSIGNED_INT&&(Z=t.R32UI),O===t.BYTE&&(Z=t.R8I),O===t.SHORT&&(Z=t.R16I),O===t.INT&&(Z=t.R32I)),w===t.RG&&(O===t.FLOAT&&(Z=t.RG32F),O===t.HALF_FLOAT&&(Z=t.RG16F),O===t.UNSIGNED_BYTE&&(Z=t.RG8)),w===t.RG_INTEGER&&(O===t.UNSIGNED_BYTE&&(Z=t.RG8UI),O===t.UNSIGNED_SHORT&&(Z=t.RG16UI),O===t.UNSIGNED_INT&&(Z=t.RG32UI),O===t.BYTE&&(Z=t.RG8I),O===t.SHORT&&(Z=t.RG16I),O===t.INT&&(Z=t.RG32I)),w===t.RGB_INTEGER&&(O===t.UNSIGNED_BYTE&&(Z=t.RGB8UI),O===t.UNSIGNED_SHORT&&(Z=t.RGB16UI),O===t.UNSIGNED_INT&&(Z=t.RGB32UI),O===t.BYTE&&(Z=t.RGB8I),O===t.SHORT&&(Z=t.RGB16I),O===t.INT&&(Z=t.RGB32I)),w===t.RGBA_INTEGER&&(O===t.UNSIGNED_BYTE&&(Z=t.RGBA8UI),O===t.UNSIGNED_SHORT&&(Z=t.RGBA16UI),O===t.UNSIGNED_INT&&(Z=t.RGBA32UI),O===t.BYTE&&(Z=t.RGBA8I),O===t.SHORT&&(Z=t.RGBA16I),O===t.INT&&(Z=t.RGBA32I)),w===t.RGB&&O===t.UNSIGNED_INT_5_9_9_9_REV&&(Z=t.RGB9_E5),w===t.RGBA){const Me=ne?Ml:tt.getTransfer(J);O===t.FLOAT&&(Z=t.RGBA32F),O===t.HALF_FLOAT&&(Z=t.RGBA16F),O===t.UNSIGNED_BYTE&&(Z=Me===ut?t.SRGB8_ALPHA8:t.RGBA8),O===t.UNSIGNED_SHORT_4_4_4_4&&(Z=t.RGBA4),O===t.UNSIGNED_SHORT_5_5_5_1&&(Z=t.RGB5_A1)}return(Z===t.R16F||Z===t.R32F||Z===t.RG16F||Z===t.RG32F||Z===t.RGBA16F||Z===t.RGBA32F)&&e.get("EXT_color_buffer_float"),Z}function x(C,w){let O;return C?w===null||w===Tr||w===Ts?O=t.DEPTH24_STENCIL8:w===li?O=t.DEPTH32F_STENCIL8:w===La&&(O=t.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):w===null||w===Tr||w===Ts?O=t.DEPTH_COMPONENT24:w===li?O=t.DEPTH_COMPONENT32F:w===La&&(O=t.DEPTH_COMPONENT16),O}function M(C,w){return m(C)===!0||C.isFramebufferTexture&&C.minFilter!==Mn&&C.minFilter!==Sn?Math.log2(Math.max(w.width,w.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?w.mipmaps.length:1}function P(C){const w=C.target;w.removeEventListener("dispose",P),A(w),w.isVideoTexture&&h.delete(w)}function T(C){const w=C.target;w.removeEventListener("dispose",T),H(w)}function A(C){const w=i.get(C);if(w.__webglInit===void 0)return;const O=C.source,J=f.get(O);if(J){const ne=J[w.__cacheKey];ne.usedTimes--,ne.usedTimes===0&&N(C),Object.keys(J).length===0&&f.delete(O)}i.remove(C)}function N(C){const w=i.get(C);t.deleteTexture(w.__webglTexture);const O=C.source,J=f.get(O);delete J[w.__cacheKey],a.memory.textures--}function H(C){const w=i.get(C);if(C.depthTexture&&C.depthTexture.dispose(),C.isWebGLCubeRenderTarget)for(let J=0;J<6;J++){if(Array.isArray(w.__webglFramebuffer[J]))for(let ne=0;ne<w.__webglFramebuffer[J].length;ne++)t.deleteFramebuffer(w.__webglFramebuffer[J][ne]);else t.deleteFramebuffer(w.__webglFramebuffer[J]);w.__webglDepthbuffer&&t.deleteRenderbuffer(w.__webglDepthbuffer[J])}else{if(Array.isArray(w.__webglFramebuffer))for(let J=0;J<w.__webglFramebuffer.length;J++)t.deleteFramebuffer(w.__webglFramebuffer[J]);else t.deleteFramebuffer(w.__webglFramebuffer);if(w.__webglDepthbuffer&&t.deleteRenderbuffer(w.__webglDepthbuffer),w.__webglMultisampledFramebuffer&&t.deleteFramebuffer(w.__webglMultisampledFramebuffer),w.__webglColorRenderbuffer)for(let J=0;J<w.__webglColorRenderbuffer.length;J++)w.__webglColorRenderbuffer[J]&&t.deleteRenderbuffer(w.__webglColorRenderbuffer[J]);w.__webglDepthRenderbuffer&&t.deleteRenderbuffer(w.__webglDepthRenderbuffer)}const O=C.textures;for(let J=0,ne=O.length;J<ne;J++){const Z=i.get(O[J]);Z.__webglTexture&&(t.deleteTexture(Z.__webglTexture),a.memory.textures--),i.remove(O[J])}i.remove(C)}let y=0;function b(){y=0}function V(){const C=y;return C>=r.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+C+" texture units while this GPU supports only "+r.maxTextures),y+=1,C}function j(C){const w=[];return w.push(C.wrapS),w.push(C.wrapT),w.push(C.wrapR||0),w.push(C.magFilter),w.push(C.minFilter),w.push(C.anisotropy),w.push(C.internalFormat),w.push(C.format),w.push(C.type),w.push(C.generateMipmaps),w.push(C.premultiplyAlpha),w.push(C.flipY),w.push(C.unpackAlignment),w.push(C.colorSpace),w.join()}function $(C,w){const O=i.get(C);if(C.isVideoTexture&&Ae(C),C.isRenderTargetTexture===!1&&C.version>0&&O.__version!==C.version){const J=C.image;if(J===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(J.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Te(O,C,w);return}}n.bindTexture(t.TEXTURE_2D,O.__webglTexture,t.TEXTURE0+w)}function Q(C,w){const O=i.get(C);if(C.version>0&&O.__version!==C.version){Te(O,C,w);return}n.bindTexture(t.TEXTURE_2D_ARRAY,O.__webglTexture,t.TEXTURE0+w)}function G(C,w){const O=i.get(C);if(C.version>0&&O.__version!==C.version){Te(O,C,w);return}n.bindTexture(t.TEXTURE_3D,O.__webglTexture,t.TEXTURE0+w)}function Y(C,w){const O=i.get(C);if(C.version>0&&O.__version!==C.version){W(O,C,w);return}n.bindTexture(t.TEXTURE_CUBE_MAP,O.__webglTexture,t.TEXTURE0+w)}const L={[dd]:t.REPEAT,[gr]:t.CLAMP_TO_EDGE,[hd]:t.MIRRORED_REPEAT},K={[Mn]:t.NEAREST,[AS]:t.NEAREST_MIPMAP_NEAREST,[uo]:t.NEAREST_MIPMAP_LINEAR,[Sn]:t.LINEAR,[Mc]:t.LINEAR_MIPMAP_NEAREST,[xr]:t.LINEAR_MIPMAP_LINEAR},I={[PS]:t.NEVER,[FS]:t.ALWAYS,[LS]:t.LESS,[ax]:t.LEQUAL,[DS]:t.EQUAL,[US]:t.GEQUAL,[kS]:t.GREATER,[IS]:t.NOTEQUAL};function q(C,w){if(w.type===li&&e.has("OES_texture_float_linear")===!1&&(w.magFilter===Sn||w.magFilter===Mc||w.magFilter===uo||w.magFilter===xr||w.minFilter===Sn||w.minFilter===Mc||w.minFilter===uo||w.minFilter===xr)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),t.texParameteri(C,t.TEXTURE_WRAP_S,L[w.wrapS]),t.texParameteri(C,t.TEXTURE_WRAP_T,L[w.wrapT]),(C===t.TEXTURE_3D||C===t.TEXTURE_2D_ARRAY)&&t.texParameteri(C,t.TEXTURE_WRAP_R,L[w.wrapR]),t.texParameteri(C,t.TEXTURE_MAG_FILTER,K[w.magFilter]),t.texParameteri(C,t.TEXTURE_MIN_FILTER,K[w.minFilter]),w.compareFunction&&(t.texParameteri(C,t.TEXTURE_COMPARE_MODE,t.COMPARE_REF_TO_TEXTURE),t.texParameteri(C,t.TEXTURE_COMPARE_FUNC,I[w.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(w.magFilter===Mn||w.minFilter!==uo&&w.minFilter!==xr||w.type===li&&e.has("OES_texture_float_linear")===!1)return;if(w.anisotropy>1||i.get(w).__currentAnisotropy){const O=e.get("EXT_texture_filter_anisotropic");t.texParameterf(C,O.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(w.anisotropy,r.getMaxAnisotropy())),i.get(w).__currentAnisotropy=w.anisotropy}}}function fe(C,w){let O=!1;C.__webglInit===void 0&&(C.__webglInit=!0,w.addEventListener("dispose",P));const J=w.source;let ne=f.get(J);ne===void 0&&(ne={},f.set(J,ne));const Z=j(w);if(Z!==C.__cacheKey){ne[Z]===void 0&&(ne[Z]={texture:t.createTexture(),usedTimes:0},a.memory.textures++,O=!0),ne[Z].usedTimes++;const Me=ne[C.__cacheKey];Me!==void 0&&(ne[C.__cacheKey].usedTimes--,Me.usedTimes===0&&N(w)),C.__cacheKey=Z,C.__webglTexture=ne[Z].texture}return O}function Te(C,w,O){let J=t.TEXTURE_2D;(w.isDataArrayTexture||w.isCompressedArrayTexture)&&(J=t.TEXTURE_2D_ARRAY),w.isData3DTexture&&(J=t.TEXTURE_3D);const ne=fe(C,w),Z=w.source;n.bindTexture(J,C.__webglTexture,t.TEXTURE0+O);const Me=i.get(Z);if(Z.version!==Me.__version||ne===!0){n.activeTexture(t.TEXTURE0+O);const ue=tt.getPrimaries(tt.workingColorSpace),xe=w.colorSpace===Li?null:tt.getPrimaries(w.colorSpace),Ye=w.colorSpace===Li||ue===xe?t.NONE:t.BROWSER_DEFAULT_WEBGL;t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,w.flipY),t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),t.pixelStorei(t.UNPACK_ALIGNMENT,w.unpackAlignment),t.pixelStorei(t.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ye);let re=S(w.image,!1,r.maxTextureSize);re=rt(w,re);const ve=s.convert(w.format,w.colorSpace),ke=s.convert(w.type);let Ie=_(w.internalFormat,ve,ke,w.colorSpace,w.isVideoTexture);q(J,w);let _e;const Ge=w.mipmaps,Fe=w.isVideoTexture!==!0,at=Me.__version===void 0||ne===!0,D=Z.dataReady,pe=M(w,re);if(w.isDepthTexture)Ie=x(w.format===As,w.type),at&&(Fe?n.texStorage2D(t.TEXTURE_2D,1,Ie,re.width,re.height):n.texImage2D(t.TEXTURE_2D,0,Ie,re.width,re.height,0,ve,ke,null));else if(w.isDataTexture)if(Ge.length>0){Fe&&at&&n.texStorage2D(t.TEXTURE_2D,pe,Ie,Ge[0].width,Ge[0].height);for(let X=0,ee=Ge.length;X<ee;X++)_e=Ge[X],Fe?D&&n.texSubImage2D(t.TEXTURE_2D,X,0,0,_e.width,_e.height,ve,ke,_e.data):n.texImage2D(t.TEXTURE_2D,X,Ie,_e.width,_e.height,0,ve,ke,_e.data);w.generateMipmaps=!1}else Fe?(at&&n.texStorage2D(t.TEXTURE_2D,pe,Ie,re.width,re.height),D&&n.texSubImage2D(t.TEXTURE_2D,0,0,0,re.width,re.height,ve,ke,re.data)):n.texImage2D(t.TEXTURE_2D,0,Ie,re.width,re.height,0,ve,ke,re.data);else if(w.isCompressedTexture)if(w.isCompressedArrayTexture){Fe&&at&&n.texStorage3D(t.TEXTURE_2D_ARRAY,pe,Ie,Ge[0].width,Ge[0].height,re.depth);for(let X=0,ee=Ge.length;X<ee;X++)if(_e=Ge[X],w.format!==Fn)if(ve!==null)if(Fe){if(D)if(w.layerUpdates.size>0){const de=hm(_e.width,_e.height,w.format,w.type);for(const me of w.layerUpdates){const We=_e.data.subarray(me*de/_e.data.BYTES_PER_ELEMENT,(me+1)*de/_e.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(t.TEXTURE_2D_ARRAY,X,0,0,me,_e.width,_e.height,1,ve,We,0,0)}w.clearLayerUpdates()}else n.compressedTexSubImage3D(t.TEXTURE_2D_ARRAY,X,0,0,0,_e.width,_e.height,re.depth,ve,_e.data,0,0)}else n.compressedTexImage3D(t.TEXTURE_2D_ARRAY,X,Ie,_e.width,_e.height,re.depth,0,_e.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Fe?D&&n.texSubImage3D(t.TEXTURE_2D_ARRAY,X,0,0,0,_e.width,_e.height,re.depth,ve,ke,_e.data):n.texImage3D(t.TEXTURE_2D_ARRAY,X,Ie,_e.width,_e.height,re.depth,0,ve,ke,_e.data)}else{Fe&&at&&n.texStorage2D(t.TEXTURE_2D,pe,Ie,Ge[0].width,Ge[0].height);for(let X=0,ee=Ge.length;X<ee;X++)_e=Ge[X],w.format!==Fn?ve!==null?Fe?D&&n.compressedTexSubImage2D(t.TEXTURE_2D,X,0,0,_e.width,_e.height,ve,_e.data):n.compressedTexImage2D(t.TEXTURE_2D,X,Ie,_e.width,_e.height,0,_e.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Fe?D&&n.texSubImage2D(t.TEXTURE_2D,X,0,0,_e.width,_e.height,ve,ke,_e.data):n.texImage2D(t.TEXTURE_2D,X,Ie,_e.width,_e.height,0,ve,ke,_e.data)}else if(w.isDataArrayTexture)if(Fe){if(at&&n.texStorage3D(t.TEXTURE_2D_ARRAY,pe,Ie,re.width,re.height,re.depth),D)if(w.layerUpdates.size>0){const X=hm(re.width,re.height,w.format,w.type);for(const ee of w.layerUpdates){const de=re.data.subarray(ee*X/re.data.BYTES_PER_ELEMENT,(ee+1)*X/re.data.BYTES_PER_ELEMENT);n.texSubImage3D(t.TEXTURE_2D_ARRAY,0,0,0,ee,re.width,re.height,1,ve,ke,de)}w.clearLayerUpdates()}else n.texSubImage3D(t.TEXTURE_2D_ARRAY,0,0,0,0,re.width,re.height,re.depth,ve,ke,re.data)}else n.texImage3D(t.TEXTURE_2D_ARRAY,0,Ie,re.width,re.height,re.depth,0,ve,ke,re.data);else if(w.isData3DTexture)Fe?(at&&n.texStorage3D(t.TEXTURE_3D,pe,Ie,re.width,re.height,re.depth),D&&n.texSubImage3D(t.TEXTURE_3D,0,0,0,0,re.width,re.height,re.depth,ve,ke,re.data)):n.texImage3D(t.TEXTURE_3D,0,Ie,re.width,re.height,re.depth,0,ve,ke,re.data);else if(w.isFramebufferTexture){if(at)if(Fe)n.texStorage2D(t.TEXTURE_2D,pe,Ie,re.width,re.height);else{let X=re.width,ee=re.height;for(let de=0;de<pe;de++)n.texImage2D(t.TEXTURE_2D,de,Ie,X,ee,0,ve,ke,null),X>>=1,ee>>=1}}else if(Ge.length>0){if(Fe&&at){const X=Pe(Ge[0]);n.texStorage2D(t.TEXTURE_2D,pe,Ie,X.width,X.height)}for(let X=0,ee=Ge.length;X<ee;X++)_e=Ge[X],Fe?D&&n.texSubImage2D(t.TEXTURE_2D,X,0,0,ve,ke,_e):n.texImage2D(t.TEXTURE_2D,X,Ie,ve,ke,_e);w.generateMipmaps=!1}else if(Fe){if(at){const X=Pe(re);n.texStorage2D(t.TEXTURE_2D,pe,Ie,X.width,X.height)}D&&n.texSubImage2D(t.TEXTURE_2D,0,0,0,ve,ke,re)}else n.texImage2D(t.TEXTURE_2D,0,Ie,ve,ke,re);m(w)&&d(J),Me.__version=Z.version,w.onUpdate&&w.onUpdate(w)}C.__version=w.version}function W(C,w,O){if(w.image.length!==6)return;const J=fe(C,w),ne=w.source;n.bindTexture(t.TEXTURE_CUBE_MAP,C.__webglTexture,t.TEXTURE0+O);const Z=i.get(ne);if(ne.version!==Z.__version||J===!0){n.activeTexture(t.TEXTURE0+O);const Me=tt.getPrimaries(tt.workingColorSpace),ue=w.colorSpace===Li?null:tt.getPrimaries(w.colorSpace),xe=w.colorSpace===Li||Me===ue?t.NONE:t.BROWSER_DEFAULT_WEBGL;t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,w.flipY),t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),t.pixelStorei(t.UNPACK_ALIGNMENT,w.unpackAlignment),t.pixelStorei(t.UNPACK_COLORSPACE_CONVERSION_WEBGL,xe);const Ye=w.isCompressedTexture||w.image[0].isCompressedTexture,re=w.image[0]&&w.image[0].isDataTexture,ve=[];for(let ee=0;ee<6;ee++)!Ye&&!re?ve[ee]=S(w.image[ee],!0,r.maxCubemapSize):ve[ee]=re?w.image[ee].image:w.image[ee],ve[ee]=rt(w,ve[ee]);const ke=ve[0],Ie=s.convert(w.format,w.colorSpace),_e=s.convert(w.type),Ge=_(w.internalFormat,Ie,_e,w.colorSpace),Fe=w.isVideoTexture!==!0,at=Z.__version===void 0||J===!0,D=ne.dataReady;let pe=M(w,ke);q(t.TEXTURE_CUBE_MAP,w);let X;if(Ye){Fe&&at&&n.texStorage2D(t.TEXTURE_CUBE_MAP,pe,Ge,ke.width,ke.height);for(let ee=0;ee<6;ee++){X=ve[ee].mipmaps;for(let de=0;de<X.length;de++){const me=X[de];w.format!==Fn?Ie!==null?Fe?D&&n.compressedTexSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ee,de,0,0,me.width,me.height,Ie,me.data):n.compressedTexImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ee,de,Ge,me.width,me.height,0,me.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Fe?D&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ee,de,0,0,me.width,me.height,Ie,_e,me.data):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ee,de,Ge,me.width,me.height,0,Ie,_e,me.data)}}}else{if(X=w.mipmaps,Fe&&at){X.length>0&&pe++;const ee=Pe(ve[0]);n.texStorage2D(t.TEXTURE_CUBE_MAP,pe,Ge,ee.width,ee.height)}for(let ee=0;ee<6;ee++)if(re){Fe?D&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ee,0,0,0,ve[ee].width,ve[ee].height,Ie,_e,ve[ee].data):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ee,0,Ge,ve[ee].width,ve[ee].height,0,Ie,_e,ve[ee].data);for(let de=0;de<X.length;de++){const We=X[de].image[ee].image;Fe?D&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ee,de+1,0,0,We.width,We.height,Ie,_e,We.data):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ee,de+1,Ge,We.width,We.height,0,Ie,_e,We.data)}}else{Fe?D&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ee,0,0,0,Ie,_e,ve[ee]):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ee,0,Ge,Ie,_e,ve[ee]);for(let de=0;de<X.length;de++){const me=X[de];Fe?D&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ee,de+1,0,0,Ie,_e,me.image[ee]):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ee,de+1,Ge,Ie,_e,me.image[ee])}}}m(w)&&d(t.TEXTURE_CUBE_MAP),Z.__version=ne.version,w.onUpdate&&w.onUpdate(w)}C.__version=w.version}function te(C,w,O,J,ne,Z){const Me=s.convert(O.format,O.colorSpace),ue=s.convert(O.type),xe=_(O.internalFormat,Me,ue,O.colorSpace);if(!i.get(w).__hasExternalTextures){const re=Math.max(1,w.width>>Z),ve=Math.max(1,w.height>>Z);ne===t.TEXTURE_3D||ne===t.TEXTURE_2D_ARRAY?n.texImage3D(ne,Z,xe,re,ve,w.depth,0,Me,ue,null):n.texImage2D(ne,Z,xe,re,ve,0,Me,ue,null)}n.bindFramebuffer(t.FRAMEBUFFER,C),Oe(w)?o.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,J,ne,i.get(O).__webglTexture,0,Ue(w)):(ne===t.TEXTURE_2D||ne>=t.TEXTURE_CUBE_MAP_POSITIVE_X&&ne<=t.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&t.framebufferTexture2D(t.FRAMEBUFFER,J,ne,i.get(O).__webglTexture,Z),n.bindFramebuffer(t.FRAMEBUFFER,null)}function le(C,w,O){if(t.bindRenderbuffer(t.RENDERBUFFER,C),w.depthBuffer){const J=w.depthTexture,ne=J&&J.isDepthTexture?J.type:null,Z=x(w.stencilBuffer,ne),Me=w.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,ue=Ue(w);Oe(w)?o.renderbufferStorageMultisampleEXT(t.RENDERBUFFER,ue,Z,w.width,w.height):O?t.renderbufferStorageMultisample(t.RENDERBUFFER,ue,Z,w.width,w.height):t.renderbufferStorage(t.RENDERBUFFER,Z,w.width,w.height),t.framebufferRenderbuffer(t.FRAMEBUFFER,Me,t.RENDERBUFFER,C)}else{const J=w.textures;for(let ne=0;ne<J.length;ne++){const Z=J[ne],Me=s.convert(Z.format,Z.colorSpace),ue=s.convert(Z.type),xe=_(Z.internalFormat,Me,ue,Z.colorSpace),Ye=Ue(w);O&&Oe(w)===!1?t.renderbufferStorageMultisample(t.RENDERBUFFER,Ye,xe,w.width,w.height):Oe(w)?o.renderbufferStorageMultisampleEXT(t.RENDERBUFFER,Ye,xe,w.width,w.height):t.renderbufferStorage(t.RENDERBUFFER,xe,w.width,w.height)}}t.bindRenderbuffer(t.RENDERBUFFER,null)}function ce(C,w){if(w&&w.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(n.bindFramebuffer(t.FRAMEBUFFER,C),!(w.depthTexture&&w.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!i.get(w.depthTexture).__webglTexture||w.depthTexture.image.width!==w.width||w.depthTexture.image.height!==w.height)&&(w.depthTexture.image.width=w.width,w.depthTexture.image.height=w.height,w.depthTexture.needsUpdate=!0),$(w.depthTexture,0);const J=i.get(w.depthTexture).__webglTexture,ne=Ue(w);if(w.depthTexture.format===hs)Oe(w)?o.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,t.DEPTH_ATTACHMENT,t.TEXTURE_2D,J,0,ne):t.framebufferTexture2D(t.FRAMEBUFFER,t.DEPTH_ATTACHMENT,t.TEXTURE_2D,J,0);else if(w.depthTexture.format===As)Oe(w)?o.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,t.DEPTH_STENCIL_ATTACHMENT,t.TEXTURE_2D,J,0,ne):t.framebufferTexture2D(t.FRAMEBUFFER,t.DEPTH_STENCIL_ATTACHMENT,t.TEXTURE_2D,J,0);else throw new Error("Unknown depthTexture format")}function De(C){const w=i.get(C),O=C.isWebGLCubeRenderTarget===!0;if(w.__boundDepthTexture!==C.depthTexture){const J=C.depthTexture;if(w.__depthDisposeCallback&&w.__depthDisposeCallback(),J){const ne=()=>{delete w.__boundDepthTexture,delete w.__depthDisposeCallback,J.removeEventListener("dispose",ne)};J.addEventListener("dispose",ne),w.__depthDisposeCallback=ne}w.__boundDepthTexture=J}if(C.depthTexture&&!w.__autoAllocateDepthBuffer){if(O)throw new Error("target.depthTexture not supported in Cube render targets");ce(w.__webglFramebuffer,C)}else if(O){w.__webglDepthbuffer=[];for(let J=0;J<6;J++)if(n.bindFramebuffer(t.FRAMEBUFFER,w.__webglFramebuffer[J]),w.__webglDepthbuffer[J]===void 0)w.__webglDepthbuffer[J]=t.createRenderbuffer(),le(w.__webglDepthbuffer[J],C,!1);else{const ne=C.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,Z=w.__webglDepthbuffer[J];t.bindRenderbuffer(t.RENDERBUFFER,Z),t.framebufferRenderbuffer(t.FRAMEBUFFER,ne,t.RENDERBUFFER,Z)}}else if(n.bindFramebuffer(t.FRAMEBUFFER,w.__webglFramebuffer),w.__webglDepthbuffer===void 0)w.__webglDepthbuffer=t.createRenderbuffer(),le(w.__webglDepthbuffer,C,!1);else{const J=C.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,ne=w.__webglDepthbuffer;t.bindRenderbuffer(t.RENDERBUFFER,ne),t.framebufferRenderbuffer(t.FRAMEBUFFER,J,t.RENDERBUFFER,ne)}n.bindFramebuffer(t.FRAMEBUFFER,null)}function Ce(C,w,O){const J=i.get(C);w!==void 0&&te(J.__webglFramebuffer,C,C.texture,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,0),O!==void 0&&De(C)}function He(C){const w=C.texture,O=i.get(C),J=i.get(w);C.addEventListener("dispose",T);const ne=C.textures,Z=C.isWebGLCubeRenderTarget===!0,Me=ne.length>1;if(Me||(J.__webglTexture===void 0&&(J.__webglTexture=t.createTexture()),J.__version=w.version,a.memory.textures++),Z){O.__webglFramebuffer=[];for(let ue=0;ue<6;ue++)if(w.mipmaps&&w.mipmaps.length>0){O.__webglFramebuffer[ue]=[];for(let xe=0;xe<w.mipmaps.length;xe++)O.__webglFramebuffer[ue][xe]=t.createFramebuffer()}else O.__webglFramebuffer[ue]=t.createFramebuffer()}else{if(w.mipmaps&&w.mipmaps.length>0){O.__webglFramebuffer=[];for(let ue=0;ue<w.mipmaps.length;ue++)O.__webglFramebuffer[ue]=t.createFramebuffer()}else O.__webglFramebuffer=t.createFramebuffer();if(Me)for(let ue=0,xe=ne.length;ue<xe;ue++){const Ye=i.get(ne[ue]);Ye.__webglTexture===void 0&&(Ye.__webglTexture=t.createTexture(),a.memory.textures++)}if(C.samples>0&&Oe(C)===!1){O.__webglMultisampledFramebuffer=t.createFramebuffer(),O.__webglColorRenderbuffer=[],n.bindFramebuffer(t.FRAMEBUFFER,O.__webglMultisampledFramebuffer);for(let ue=0;ue<ne.length;ue++){const xe=ne[ue];O.__webglColorRenderbuffer[ue]=t.createRenderbuffer(),t.bindRenderbuffer(t.RENDERBUFFER,O.__webglColorRenderbuffer[ue]);const Ye=s.convert(xe.format,xe.colorSpace),re=s.convert(xe.type),ve=_(xe.internalFormat,Ye,re,xe.colorSpace,C.isXRRenderTarget===!0),ke=Ue(C);t.renderbufferStorageMultisample(t.RENDERBUFFER,ke,ve,C.width,C.height),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+ue,t.RENDERBUFFER,O.__webglColorRenderbuffer[ue])}t.bindRenderbuffer(t.RENDERBUFFER,null),C.depthBuffer&&(O.__webglDepthRenderbuffer=t.createRenderbuffer(),le(O.__webglDepthRenderbuffer,C,!0)),n.bindFramebuffer(t.FRAMEBUFFER,null)}}if(Z){n.bindTexture(t.TEXTURE_CUBE_MAP,J.__webglTexture),q(t.TEXTURE_CUBE_MAP,w);for(let ue=0;ue<6;ue++)if(w.mipmaps&&w.mipmaps.length>0)for(let xe=0;xe<w.mipmaps.length;xe++)te(O.__webglFramebuffer[ue][xe],C,w,t.COLOR_ATTACHMENT0,t.TEXTURE_CUBE_MAP_POSITIVE_X+ue,xe);else te(O.__webglFramebuffer[ue],C,w,t.COLOR_ATTACHMENT0,t.TEXTURE_CUBE_MAP_POSITIVE_X+ue,0);m(w)&&d(t.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(Me){for(let ue=0,xe=ne.length;ue<xe;ue++){const Ye=ne[ue],re=i.get(Ye);n.bindTexture(t.TEXTURE_2D,re.__webglTexture),q(t.TEXTURE_2D,Ye),te(O.__webglFramebuffer,C,Ye,t.COLOR_ATTACHMENT0+ue,t.TEXTURE_2D,0),m(Ye)&&d(t.TEXTURE_2D)}n.unbindTexture()}else{let ue=t.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(ue=C.isWebGL3DRenderTarget?t.TEXTURE_3D:t.TEXTURE_2D_ARRAY),n.bindTexture(ue,J.__webglTexture),q(ue,w),w.mipmaps&&w.mipmaps.length>0)for(let xe=0;xe<w.mipmaps.length;xe++)te(O.__webglFramebuffer[xe],C,w,t.COLOR_ATTACHMENT0,ue,xe);else te(O.__webglFramebuffer,C,w,t.COLOR_ATTACHMENT0,ue,0);m(w)&&d(ue),n.unbindTexture()}C.depthBuffer&&De(C)}function Qe(C){const w=C.textures;for(let O=0,J=w.length;O<J;O++){const ne=w[O];if(m(ne)){const Z=C.isWebGLCubeRenderTarget?t.TEXTURE_CUBE_MAP:t.TEXTURE_2D,Me=i.get(ne).__webglTexture;n.bindTexture(Z,Me),d(Z),n.unbindTexture()}}}const Ve=[],R=[];function $e(C){if(C.samples>0){if(Oe(C)===!1){const w=C.textures,O=C.width,J=C.height;let ne=t.COLOR_BUFFER_BIT;const Z=C.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,Me=i.get(C),ue=w.length>1;if(ue)for(let xe=0;xe<w.length;xe++)n.bindFramebuffer(t.FRAMEBUFFER,Me.__webglMultisampledFramebuffer),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+xe,t.RENDERBUFFER,null),n.bindFramebuffer(t.FRAMEBUFFER,Me.__webglFramebuffer),t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0+xe,t.TEXTURE_2D,null,0);n.bindFramebuffer(t.READ_FRAMEBUFFER,Me.__webglMultisampledFramebuffer),n.bindFramebuffer(t.DRAW_FRAMEBUFFER,Me.__webglFramebuffer);for(let xe=0;xe<w.length;xe++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(ne|=t.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(ne|=t.STENCIL_BUFFER_BIT)),ue){t.framebufferRenderbuffer(t.READ_FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.RENDERBUFFER,Me.__webglColorRenderbuffer[xe]);const Ye=i.get(w[xe]).__webglTexture;t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,Ye,0)}t.blitFramebuffer(0,0,O,J,0,0,O,J,ne,t.NEAREST),l===!0&&(Ve.length=0,R.length=0,Ve.push(t.COLOR_ATTACHMENT0+xe),C.depthBuffer&&C.resolveDepthBuffer===!1&&(Ve.push(Z),R.push(Z),t.invalidateFramebuffer(t.DRAW_FRAMEBUFFER,R)),t.invalidateFramebuffer(t.READ_FRAMEBUFFER,Ve))}if(n.bindFramebuffer(t.READ_FRAMEBUFFER,null),n.bindFramebuffer(t.DRAW_FRAMEBUFFER,null),ue)for(let xe=0;xe<w.length;xe++){n.bindFramebuffer(t.FRAMEBUFFER,Me.__webglMultisampledFramebuffer),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+xe,t.RENDERBUFFER,Me.__webglColorRenderbuffer[xe]);const Ye=i.get(w[xe]).__webglTexture;n.bindFramebuffer(t.FRAMEBUFFER,Me.__webglFramebuffer),t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0+xe,t.TEXTURE_2D,Ye,0)}n.bindFramebuffer(t.DRAW_FRAMEBUFFER,Me.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.resolveDepthBuffer===!1&&l){const w=C.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT;t.invalidateFramebuffer(t.DRAW_FRAMEBUFFER,[w])}}}function Ue(C){return Math.min(r.maxSamples,C.samples)}function Oe(C){const w=i.get(C);return C.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&w.__useRenderToTexture!==!1}function Ae(C){const w=a.render.frame;h.get(C)!==w&&(h.set(C,w),C.update())}function rt(C,w){const O=C.colorSpace,J=C.format,ne=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||O!==Qi&&O!==Li&&(tt.getTransfer(O)===ut?(J!==Fn||ne!==gi)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",O)),w}function Pe(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(u.width=C.naturalWidth||C.width,u.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(u.width=C.displayWidth,u.height=C.displayHeight):(u.width=C.width,u.height=C.height),u}this.allocateTextureUnit=V,this.resetTextureUnits=b,this.setTexture2D=$,this.setTexture2DArray=Q,this.setTexture3D=G,this.setTextureCube=Y,this.rebindTextures=Ce,this.setupRenderTarget=He,this.updateRenderTargetMipmap=Qe,this.updateMultisampleRenderTarget=$e,this.setupDepthRenderbuffer=De,this.setupFrameBufferTexture=te,this.useMultisampledRTT=Oe}function Vb(t,e){function n(i,r=Li){let s;const a=tt.getTransfer(r);if(i===gi)return t.UNSIGNED_BYTE;if(i===Bh)return t.UNSIGNED_SHORT_4_4_4_4;if(i===jh)return t.UNSIGNED_SHORT_5_5_5_1;if(i===Zg)return t.UNSIGNED_INT_5_9_9_9_REV;if(i===Yg)return t.BYTE;if(i===Kg)return t.SHORT;if(i===La)return t.UNSIGNED_SHORT;if(i===zh)return t.INT;if(i===Tr)return t.UNSIGNED_INT;if(i===li)return t.FLOAT;if(i===za)return t.HALF_FLOAT;if(i===Qg)return t.ALPHA;if(i===Jg)return t.RGB;if(i===Fn)return t.RGBA;if(i===ex)return t.LUMINANCE;if(i===tx)return t.LUMINANCE_ALPHA;if(i===hs)return t.DEPTH_COMPONENT;if(i===As)return t.DEPTH_STENCIL;if(i===nx)return t.RED;if(i===Hh)return t.RED_INTEGER;if(i===ix)return t.RG;if(i===Vh)return t.RG_INTEGER;if(i===Gh)return t.RGBA_INTEGER;if(i===Xo||i===qo||i===$o||i===Yo)if(a===ut)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(i===Xo)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===qo)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===$o)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Yo)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(i===Xo)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===qo)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===$o)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Yo)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===fd||i===pd||i===md||i===gd)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(i===fd)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===pd)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===md)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===gd)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===xd||i===vd||i===_d)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(i===xd||i===vd)return a===ut?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(i===_d)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===yd||i===Sd||i===wd||i===Md||i===Ed||i===bd||i===Td||i===Ad||i===Cd||i===Rd||i===Nd||i===Pd||i===Ld||i===Dd)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(i===yd)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Sd)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===wd)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Md)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===Ed)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===bd)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Td)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Ad)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Cd)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Rd)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Nd)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Pd)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Ld)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Dd)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Ko||i===kd||i===Id)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(i===Ko)return a===ut?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===kd)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===Id)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===rx||i===Ud||i===Fd||i===Od)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(i===Ko)return s.COMPRESSED_RED_RGTC1_EXT;if(i===Ud)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Fd)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Od)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===Ts?t.UNSIGNED_INT_24_8:t[i]!==void 0?t[i]:null}return{convert:n}}class Gb extends dn{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class ta extends Xt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Wb={type:"move"};class Jc{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new ta,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new ta,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new F,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new F),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new ta,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new F,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new F),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const n=this._hand;if(n)for(const i of e.hand.values())this._getHandJoint(n,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,n,i){let r=null,s=null,a=null;const o=this._targetRay,l=this._grip,u=this._hand;if(e&&n.session.visibilityState!=="visible-blurred"){if(u&&e.hand){a=!0;for(const S of e.hand.values()){const m=n.getJointPose(S,i),d=this._getHandJoint(u,S);m!==null&&(d.matrix.fromArray(m.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,d.jointRadius=m.radius),d.visible=m!==null}const h=u.joints["index-finger-tip"],p=u.joints["thumb-tip"],f=h.position.distanceTo(p.position),g=.02,v=.005;u.inputState.pinching&&f>g+v?(u.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!u.inputState.pinching&&f<=g-v&&(u.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=n.getPose(e.gripSpace,i),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(r=n.getPose(e.targetRaySpace,i),r===null&&s!==null&&(r=s),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Wb)))}return o!==null&&(o.visible=r!==null),l!==null&&(l.visible=s!==null),u!==null&&(u.visible=a!==null),this}_getHandJoint(e,n){if(e.joints[n.jointName]===void 0){const i=new ta;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[n.jointName]=i,e.add(i)}return e.joints[n.jointName]}}const Xb=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,qb=`
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

}`;class $b{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,n,i){if(this.texture===null){const r=new Wt,s=e.properties.get(r);s.__webglTexture=n.texture,(n.depthNear!=i.depthNear||n.depthFar!=i.depthFar)&&(this.depthNear=n.depthNear,this.depthFar=n.depthFar),this.texture=r}}getMesh(e){if(this.texture!==null&&this.mesh===null){const n=e.cameras[0].viewport,i=new $i({vertexShader:Xb,fragmentShader:qb,uniforms:{depthColor:{value:this.texture},depthWidth:{value:n.z},depthHeight:{value:n.w}}});this.mesh=new qn(new Ga(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Yb extends Ls{constructor(e,n){super();const i=this;let r=null,s=1,a=null,o="local-floor",l=1,u=null,h=null,p=null,f=null,g=null,v=null;const S=new $b,m=n.getContextAttributes();let d=null,_=null;const x=[],M=[],P=new Ke;let T=null;const A=new dn;A.layers.enable(1),A.viewport=new st;const N=new dn;N.layers.enable(2),N.viewport=new st;const H=[A,N],y=new Gb;y.layers.enable(1),y.layers.enable(2);let b=null,V=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(W){let te=x[W];return te===void 0&&(te=new Jc,x[W]=te),te.getTargetRaySpace()},this.getControllerGrip=function(W){let te=x[W];return te===void 0&&(te=new Jc,x[W]=te),te.getGripSpace()},this.getHand=function(W){let te=x[W];return te===void 0&&(te=new Jc,x[W]=te),te.getHandSpace()};function j(W){const te=M.indexOf(W.inputSource);if(te===-1)return;const le=x[te];le!==void 0&&(le.update(W.inputSource,W.frame,u||a),le.dispatchEvent({type:W.type,data:W.inputSource}))}function $(){r.removeEventListener("select",j),r.removeEventListener("selectstart",j),r.removeEventListener("selectend",j),r.removeEventListener("squeeze",j),r.removeEventListener("squeezestart",j),r.removeEventListener("squeezeend",j),r.removeEventListener("end",$),r.removeEventListener("inputsourceschange",Q);for(let W=0;W<x.length;W++){const te=M[W];te!==null&&(M[W]=null,x[W].disconnect(te))}b=null,V=null,S.reset(),e.setRenderTarget(d),g=null,f=null,p=null,r=null,_=null,Te.stop(),i.isPresenting=!1,e.setPixelRatio(T),e.setSize(P.width,P.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(W){s=W,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(W){o=W,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return u||a},this.setReferenceSpace=function(W){u=W},this.getBaseLayer=function(){return f!==null?f:g},this.getBinding=function(){return p},this.getFrame=function(){return v},this.getSession=function(){return r},this.setSession=async function(W){if(r=W,r!==null){if(d=e.getRenderTarget(),r.addEventListener("select",j),r.addEventListener("selectstart",j),r.addEventListener("selectend",j),r.addEventListener("squeeze",j),r.addEventListener("squeezestart",j),r.addEventListener("squeezeend",j),r.addEventListener("end",$),r.addEventListener("inputsourceschange",Q),m.xrCompatible!==!0&&await n.makeXRCompatible(),T=e.getPixelRatio(),e.getSize(P),r.renderState.layers===void 0){const te={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:s};g=new XRWebGLLayer(r,n,te),r.updateRenderState({baseLayer:g}),e.setPixelRatio(1),e.setSize(g.framebufferWidth,g.framebufferHeight,!1),_=new Ar(g.framebufferWidth,g.framebufferHeight,{format:Fn,type:gi,colorSpace:e.outputColorSpace,stencilBuffer:m.stencil})}else{let te=null,le=null,ce=null;m.depth&&(ce=m.stencil?n.DEPTH24_STENCIL8:n.DEPTH_COMPONENT24,te=m.stencil?As:hs,le=m.stencil?Ts:Tr);const De={colorFormat:n.RGBA8,depthFormat:ce,scaleFactor:s};p=new XRWebGLBinding(r,n),f=p.createProjectionLayer(De),r.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),_=new Ar(f.textureWidth,f.textureHeight,{format:Fn,type:gi,depthTexture:new vx(f.textureWidth,f.textureHeight,le,void 0,void 0,void 0,void 0,void 0,void 0,te),stencilBuffer:m.stencil,colorSpace:e.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1})}_.isXRRenderTarget=!0,this.setFoveation(l),u=null,a=await r.requestReferenceSpace(o),Te.setContext(r),Te.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return S.getDepthTexture()};function Q(W){for(let te=0;te<W.removed.length;te++){const le=W.removed[te],ce=M.indexOf(le);ce>=0&&(M[ce]=null,x[ce].disconnect(le))}for(let te=0;te<W.added.length;te++){const le=W.added[te];let ce=M.indexOf(le);if(ce===-1){for(let Ce=0;Ce<x.length;Ce++)if(Ce>=M.length){M.push(le),ce=Ce;break}else if(M[Ce]===null){M[Ce]=le,ce=Ce;break}if(ce===-1)break}const De=x[ce];De&&De.connect(le)}}const G=new F,Y=new F;function L(W,te,le){G.setFromMatrixPosition(te.matrixWorld),Y.setFromMatrixPosition(le.matrixWorld);const ce=G.distanceTo(Y),De=te.projectionMatrix.elements,Ce=le.projectionMatrix.elements,He=De[14]/(De[10]-1),Qe=De[14]/(De[10]+1),Ve=(De[9]+1)/De[5],R=(De[9]-1)/De[5],$e=(De[8]-1)/De[0],Ue=(Ce[8]+1)/Ce[0],Oe=He*$e,Ae=He*Ue,rt=ce/(-$e+Ue),Pe=rt*-$e;if(te.matrixWorld.decompose(W.position,W.quaternion,W.scale),W.translateX(Pe),W.translateZ(rt),W.matrixWorld.compose(W.position,W.quaternion,W.scale),W.matrixWorldInverse.copy(W.matrixWorld).invert(),De[10]===-1)W.projectionMatrix.copy(te.projectionMatrix),W.projectionMatrixInverse.copy(te.projectionMatrixInverse);else{const C=He+rt,w=Qe+rt,O=Oe-Pe,J=Ae+(ce-Pe),ne=Ve*Qe/w*C,Z=R*Qe/w*C;W.projectionMatrix.makePerspective(O,J,ne,Z,C,w),W.projectionMatrixInverse.copy(W.projectionMatrix).invert()}}function K(W,te){te===null?W.matrixWorld.copy(W.matrix):W.matrixWorld.multiplyMatrices(te.matrixWorld,W.matrix),W.matrixWorldInverse.copy(W.matrixWorld).invert()}this.updateCamera=function(W){if(r===null)return;let te=W.near,le=W.far;S.texture!==null&&(S.depthNear>0&&(te=S.depthNear),S.depthFar>0&&(le=S.depthFar)),y.near=N.near=A.near=te,y.far=N.far=A.far=le,(b!==y.near||V!==y.far)&&(r.updateRenderState({depthNear:y.near,depthFar:y.far}),b=y.near,V=y.far);const ce=W.parent,De=y.cameras;K(y,ce);for(let Ce=0;Ce<De.length;Ce++)K(De[Ce],ce);De.length===2?L(y,A,N):y.projectionMatrix.copy(A.projectionMatrix),I(W,y,ce)};function I(W,te,le){le===null?W.matrix.copy(te.matrixWorld):(W.matrix.copy(le.matrixWorld),W.matrix.invert(),W.matrix.multiply(te.matrixWorld)),W.matrix.decompose(W.position,W.quaternion,W.scale),W.updateMatrixWorld(!0),W.projectionMatrix.copy(te.projectionMatrix),W.projectionMatrixInverse.copy(te.projectionMatrixInverse),W.isPerspectiveCamera&&(W.fov=zd*2*Math.atan(1/W.projectionMatrix.elements[5]),W.zoom=1)}this.getCamera=function(){return y},this.getFoveation=function(){if(!(f===null&&g===null))return l},this.setFoveation=function(W){l=W,f!==null&&(f.fixedFoveation=W),g!==null&&g.fixedFoveation!==void 0&&(g.fixedFoveation=W)},this.hasDepthSensing=function(){return S.texture!==null},this.getDepthSensingMesh=function(){return S.getMesh(y)};let q=null;function fe(W,te){if(h=te.getViewerPose(u||a),v=te,h!==null){const le=h.views;g!==null&&(e.setRenderTargetFramebuffer(_,g.framebuffer),e.setRenderTarget(_));let ce=!1;le.length!==y.cameras.length&&(y.cameras.length=0,ce=!0);for(let Ce=0;Ce<le.length;Ce++){const He=le[Ce];let Qe=null;if(g!==null)Qe=g.getViewport(He);else{const R=p.getViewSubImage(f,He);Qe=R.viewport,Ce===0&&(e.setRenderTargetTextures(_,R.colorTexture,f.ignoreDepthValues?void 0:R.depthStencilTexture),e.setRenderTarget(_))}let Ve=H[Ce];Ve===void 0&&(Ve=new dn,Ve.layers.enable(Ce),Ve.viewport=new st,H[Ce]=Ve),Ve.matrix.fromArray(He.transform.matrix),Ve.matrix.decompose(Ve.position,Ve.quaternion,Ve.scale),Ve.projectionMatrix.fromArray(He.projectionMatrix),Ve.projectionMatrixInverse.copy(Ve.projectionMatrix).invert(),Ve.viewport.set(Qe.x,Qe.y,Qe.width,Qe.height),Ce===0&&(y.matrix.copy(Ve.matrix),y.matrix.decompose(y.position,y.quaternion,y.scale)),ce===!0&&y.cameras.push(Ve)}const De=r.enabledFeatures;if(De&&De.includes("depth-sensing")){const Ce=p.getDepthInformation(le[0]);Ce&&Ce.isValid&&Ce.texture&&S.init(e,Ce,r.renderState)}}for(let le=0;le<x.length;le++){const ce=M[le],De=x[le];ce!==null&&De!==void 0&&De.update(ce,te,u||a)}q&&q(W,te),te.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:te}),v=null}const Te=new xx;Te.setAnimationLoop(fe),this.setAnimationLoop=function(W){q=W},this.dispose=function(){}}}const sr=new Kn,Kb=new ht;function Zb(t,e){function n(m,d){m.matrixAutoUpdate===!0&&m.updateMatrix(),d.value.copy(m.matrix)}function i(m,d){d.color.getRGB(m.fogColor.value,px(t)),d.isFog?(m.fogNear.value=d.near,m.fogFar.value=d.far):d.isFogExp2&&(m.fogDensity.value=d.density)}function r(m,d,_,x,M){d.isMeshBasicMaterial||d.isMeshLambertMaterial?s(m,d):d.isMeshToonMaterial?(s(m,d),p(m,d)):d.isMeshPhongMaterial?(s(m,d),h(m,d)):d.isMeshStandardMaterial?(s(m,d),f(m,d),d.isMeshPhysicalMaterial&&g(m,d,M)):d.isMeshMatcapMaterial?(s(m,d),v(m,d)):d.isMeshDepthMaterial?s(m,d):d.isMeshDistanceMaterial?(s(m,d),S(m,d)):d.isMeshNormalMaterial?s(m,d):d.isLineBasicMaterial?(a(m,d),d.isLineDashedMaterial&&o(m,d)):d.isPointsMaterial?l(m,d,_,x):d.isSpriteMaterial?u(m,d):d.isShadowMaterial?(m.color.value.copy(d.color),m.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function s(m,d){m.opacity.value=d.opacity,d.color&&m.diffuse.value.copy(d.color),d.emissive&&m.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(m.map.value=d.map,n(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,n(d.alphaMap,m.alphaMapTransform)),d.bumpMap&&(m.bumpMap.value=d.bumpMap,n(d.bumpMap,m.bumpMapTransform),m.bumpScale.value=d.bumpScale,d.side===sn&&(m.bumpScale.value*=-1)),d.normalMap&&(m.normalMap.value=d.normalMap,n(d.normalMap,m.normalMapTransform),m.normalScale.value.copy(d.normalScale),d.side===sn&&m.normalScale.value.negate()),d.displacementMap&&(m.displacementMap.value=d.displacementMap,n(d.displacementMap,m.displacementMapTransform),m.displacementScale.value=d.displacementScale,m.displacementBias.value=d.displacementBias),d.emissiveMap&&(m.emissiveMap.value=d.emissiveMap,n(d.emissiveMap,m.emissiveMapTransform)),d.specularMap&&(m.specularMap.value=d.specularMap,n(d.specularMap,m.specularMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest);const _=e.get(d),x=_.envMap,M=_.envMapRotation;x&&(m.envMap.value=x,sr.copy(M),sr.x*=-1,sr.y*=-1,sr.z*=-1,x.isCubeTexture&&x.isRenderTargetTexture===!1&&(sr.y*=-1,sr.z*=-1),m.envMapRotation.value.setFromMatrix4(Kb.makeRotationFromEuler(sr)),m.flipEnvMap.value=x.isCubeTexture&&x.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=d.reflectivity,m.ior.value=d.ior,m.refractionRatio.value=d.refractionRatio),d.lightMap&&(m.lightMap.value=d.lightMap,m.lightMapIntensity.value=d.lightMapIntensity,n(d.lightMap,m.lightMapTransform)),d.aoMap&&(m.aoMap.value=d.aoMap,m.aoMapIntensity.value=d.aoMapIntensity,n(d.aoMap,m.aoMapTransform))}function a(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,d.map&&(m.map.value=d.map,n(d.map,m.mapTransform))}function o(m,d){m.dashSize.value=d.dashSize,m.totalSize.value=d.dashSize+d.gapSize,m.scale.value=d.scale}function l(m,d,_,x){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.size.value=d.size*_,m.scale.value=x*.5,d.map&&(m.map.value=d.map,n(d.map,m.uvTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,n(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function u(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.rotation.value=d.rotation,d.map&&(m.map.value=d.map,n(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,n(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function h(m,d){m.specular.value.copy(d.specular),m.shininess.value=Math.max(d.shininess,1e-4)}function p(m,d){d.gradientMap&&(m.gradientMap.value=d.gradientMap)}function f(m,d){m.metalness.value=d.metalness,d.metalnessMap&&(m.metalnessMap.value=d.metalnessMap,n(d.metalnessMap,m.metalnessMapTransform)),m.roughness.value=d.roughness,d.roughnessMap&&(m.roughnessMap.value=d.roughnessMap,n(d.roughnessMap,m.roughnessMapTransform)),d.envMap&&(m.envMapIntensity.value=d.envMapIntensity)}function g(m,d,_){m.ior.value=d.ior,d.sheen>0&&(m.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),m.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(m.sheenColorMap.value=d.sheenColorMap,n(d.sheenColorMap,m.sheenColorMapTransform)),d.sheenRoughnessMap&&(m.sheenRoughnessMap.value=d.sheenRoughnessMap,n(d.sheenRoughnessMap,m.sheenRoughnessMapTransform))),d.clearcoat>0&&(m.clearcoat.value=d.clearcoat,m.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(m.clearcoatMap.value=d.clearcoatMap,n(d.clearcoatMap,m.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,n(d.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(m.clearcoatNormalMap.value=d.clearcoatNormalMap,n(d.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===sn&&m.clearcoatNormalScale.value.negate())),d.dispersion>0&&(m.dispersion.value=d.dispersion),d.iridescence>0&&(m.iridescence.value=d.iridescence,m.iridescenceIOR.value=d.iridescenceIOR,m.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap&&(m.iridescenceMap.value=d.iridescenceMap,n(d.iridescenceMap,m.iridescenceMapTransform)),d.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=d.iridescenceThicknessMap,n(d.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),d.transmission>0&&(m.transmission.value=d.transmission,m.transmissionSamplerMap.value=_.texture,m.transmissionSamplerSize.value.set(_.width,_.height),d.transmissionMap&&(m.transmissionMap.value=d.transmissionMap,n(d.transmissionMap,m.transmissionMapTransform)),m.thickness.value=d.thickness,d.thicknessMap&&(m.thicknessMap.value=d.thicknessMap,n(d.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=d.attenuationDistance,m.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(m.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(m.anisotropyMap.value=d.anisotropyMap,n(d.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=d.specularIntensity,m.specularColor.value.copy(d.specularColor),d.specularColorMap&&(m.specularColorMap.value=d.specularColorMap,n(d.specularColorMap,m.specularColorMapTransform)),d.specularIntensityMap&&(m.specularIntensityMap.value=d.specularIntensityMap,n(d.specularIntensityMap,m.specularIntensityMapTransform))}function v(m,d){d.matcap&&(m.matcap.value=d.matcap)}function S(m,d){const _=e.get(d).light;m.referencePosition.value.setFromMatrixPosition(_.matrixWorld),m.nearDistance.value=_.shadow.camera.near,m.farDistance.value=_.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:r}}function Qb(t,e,n,i){let r={},s={},a=[];const o=t.getParameter(t.MAX_UNIFORM_BUFFER_BINDINGS);function l(_,x){const M=x.program;i.uniformBlockBinding(_,M)}function u(_,x){let M=r[_.id];M===void 0&&(v(_),M=h(_),r[_.id]=M,_.addEventListener("dispose",m));const P=x.program;i.updateUBOMapping(_,P);const T=e.render.frame;s[_.id]!==T&&(f(_),s[_.id]=T)}function h(_){const x=p();_.__bindingPointIndex=x;const M=t.createBuffer(),P=_.__size,T=_.usage;return t.bindBuffer(t.UNIFORM_BUFFER,M),t.bufferData(t.UNIFORM_BUFFER,P,T),t.bindBuffer(t.UNIFORM_BUFFER,null),t.bindBufferBase(t.UNIFORM_BUFFER,x,M),M}function p(){for(let _=0;_<o;_++)if(a.indexOf(_)===-1)return a.push(_),_;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(_){const x=r[_.id],M=_.uniforms,P=_.__cache;t.bindBuffer(t.UNIFORM_BUFFER,x);for(let T=0,A=M.length;T<A;T++){const N=Array.isArray(M[T])?M[T]:[M[T]];for(let H=0,y=N.length;H<y;H++){const b=N[H];if(g(b,T,H,P)===!0){const V=b.__offset,j=Array.isArray(b.value)?b.value:[b.value];let $=0;for(let Q=0;Q<j.length;Q++){const G=j[Q],Y=S(G);typeof G=="number"||typeof G=="boolean"?(b.__data[0]=G,t.bufferSubData(t.UNIFORM_BUFFER,V+$,b.__data)):G.isMatrix3?(b.__data[0]=G.elements[0],b.__data[1]=G.elements[1],b.__data[2]=G.elements[2],b.__data[3]=0,b.__data[4]=G.elements[3],b.__data[5]=G.elements[4],b.__data[6]=G.elements[5],b.__data[7]=0,b.__data[8]=G.elements[6],b.__data[9]=G.elements[7],b.__data[10]=G.elements[8],b.__data[11]=0):(G.toArray(b.__data,$),$+=Y.storage/Float32Array.BYTES_PER_ELEMENT)}t.bufferSubData(t.UNIFORM_BUFFER,V,b.__data)}}}t.bindBuffer(t.UNIFORM_BUFFER,null)}function g(_,x,M,P){const T=_.value,A=x+"_"+M;if(P[A]===void 0)return typeof T=="number"||typeof T=="boolean"?P[A]=T:P[A]=T.clone(),!0;{const N=P[A];if(typeof T=="number"||typeof T=="boolean"){if(N!==T)return P[A]=T,!0}else if(N.equals(T)===!1)return N.copy(T),!0}return!1}function v(_){const x=_.uniforms;let M=0;const P=16;for(let A=0,N=x.length;A<N;A++){const H=Array.isArray(x[A])?x[A]:[x[A]];for(let y=0,b=H.length;y<b;y++){const V=H[y],j=Array.isArray(V.value)?V.value:[V.value];for(let $=0,Q=j.length;$<Q;$++){const G=j[$],Y=S(G),L=M%P,K=L%Y.boundary,I=L+K;M+=K,I!==0&&P-I<Y.storage&&(M+=P-I),V.__data=new Float32Array(Y.storage/Float32Array.BYTES_PER_ELEMENT),V.__offset=M,M+=Y.storage}}}const T=M%P;return T>0&&(M+=P-T),_.__size=M,_.__cache={},this}function S(_){const x={boundary:0,storage:0};return typeof _=="number"||typeof _=="boolean"?(x.boundary=4,x.storage=4):_.isVector2?(x.boundary=8,x.storage=8):_.isVector3||_.isColor?(x.boundary=16,x.storage=12):_.isVector4?(x.boundary=16,x.storage=16):_.isMatrix3?(x.boundary=48,x.storage=48):_.isMatrix4?(x.boundary=64,x.storage=64):_.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",_),x}function m(_){const x=_.target;x.removeEventListener("dispose",m);const M=a.indexOf(x.__bindingPointIndex);a.splice(M,1),t.deleteBuffer(r[x.id]),delete r[x.id],delete s[x.id]}function d(){for(const _ in r)t.deleteBuffer(r[_]);a=[],r={},s={}}return{bind:l,update:u,dispose:d}}class Jb{constructor(e={}){const{canvas:n=zS(),context:i=null,depth:r=!0,stencil:s=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:u=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:p=!1}=e;this.isWebGLRenderer=!0;let f;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=i.getContextAttributes().alpha}else f=a;const g=new Uint32Array(4),v=new Int32Array(4);let S=null,m=null;const d=[],_=[];this.domElement=n,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Vn,this.toneMapping=Gi,this.toneMappingExposure=1;const x=this;let M=!1,P=0,T=0,A=null,N=-1,H=null;const y=new st,b=new st;let V=null;const j=new Xe(0);let $=0,Q=n.width,G=n.height,Y=1,L=null,K=null;const I=new st(0,0,Q,G),q=new st(0,0,Q,G);let fe=!1;const Te=new $h;let W=!1,te=!1;const le=new ht,ce=new ht,De=new F,Ce=new st,He={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Qe=!1;function Ve(){return A===null?Y:1}let R=i;function $e(E,k){return n.getContext(E,k)}try{const E={alpha:!0,depth:r,stencil:s,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:u,powerPreference:h,failIfMajorPerformanceCaveat:p};if("setAttribute"in n&&n.setAttribute("data-engine",`three.js r${Oh}`),n.addEventListener("webglcontextlost",ee,!1),n.addEventListener("webglcontextrestored",de,!1),n.addEventListener("webglcontextcreationerror",me,!1),R===null){const k="webgl2";if(R=$e(k,E),R===null)throw $e(k)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(E){throw console.error("THREE.WebGLRenderer: "+E.message),E}let Ue,Oe,Ae,rt,Pe,C,w,O,J,ne,Z,Me,ue,xe,Ye,re,ve,ke,Ie,_e,Ge,Fe,at,D;function pe(){Ue=new rE(R),Ue.init(),Fe=new Vb(R,Ue),Oe=new ZM(R,Ue,e,Fe),Ae=new Bb(R),Oe.reverseDepthBuffer&&Ae.buffers.depth.setReversed(!0),rt=new oE(R),Pe=new bb,C=new Hb(R,Ue,Ae,Pe,Oe,Fe,rt),w=new JM(x),O=new iE(x),J=new f1(R),at=new YM(R,J),ne=new sE(R,J,rt,at),Z=new cE(R,ne,J,rt),Ie=new lE(R,Oe,C),re=new QM(Pe),Me=new Eb(x,w,O,Ue,Oe,at,re),ue=new Zb(x,Pe),xe=new Ab,Ye=new Db(Ue),ke=new $M(x,w,O,Ae,Z,f,l),ve=new Ob(x,Z,Oe),D=new Qb(R,rt,Oe,Ae),_e=new KM(R,Ue,rt),Ge=new aE(R,Ue,rt),rt.programs=Me.programs,x.capabilities=Oe,x.extensions=Ue,x.properties=Pe,x.renderLists=xe,x.shadowMap=ve,x.state=Ae,x.info=rt}pe();const X=new Yb(x,R);this.xr=X,this.getContext=function(){return R},this.getContextAttributes=function(){return R.getContextAttributes()},this.forceContextLoss=function(){const E=Ue.get("WEBGL_lose_context");E&&E.loseContext()},this.forceContextRestore=function(){const E=Ue.get("WEBGL_lose_context");E&&E.restoreContext()},this.getPixelRatio=function(){return Y},this.setPixelRatio=function(E){E!==void 0&&(Y=E,this.setSize(Q,G,!1))},this.getSize=function(E){return E.set(Q,G)},this.setSize=function(E,k,z=!0){if(X.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}Q=E,G=k,n.width=Math.floor(E*Y),n.height=Math.floor(k*Y),z===!0&&(n.style.width=E+"px",n.style.height=k+"px"),this.setViewport(0,0,E,k)},this.getDrawingBufferSize=function(E){return E.set(Q*Y,G*Y).floor()},this.setDrawingBufferSize=function(E,k,z){Q=E,G=k,Y=z,n.width=Math.floor(E*z),n.height=Math.floor(k*z),this.setViewport(0,0,E,k)},this.getCurrentViewport=function(E){return E.copy(y)},this.getViewport=function(E){return E.copy(I)},this.setViewport=function(E,k,z,B){E.isVector4?I.set(E.x,E.y,E.z,E.w):I.set(E,k,z,B),Ae.viewport(y.copy(I).multiplyScalar(Y).round())},this.getScissor=function(E){return E.copy(q)},this.setScissor=function(E,k,z,B){E.isVector4?q.set(E.x,E.y,E.z,E.w):q.set(E,k,z,B),Ae.scissor(b.copy(q).multiplyScalar(Y).round())},this.getScissorTest=function(){return fe},this.setScissorTest=function(E){Ae.setScissorTest(fe=E)},this.setOpaqueSort=function(E){L=E},this.setTransparentSort=function(E){K=E},this.getClearColor=function(E){return E.copy(ke.getClearColor())},this.setClearColor=function(){ke.setClearColor.apply(ke,arguments)},this.getClearAlpha=function(){return ke.getClearAlpha()},this.setClearAlpha=function(){ke.setClearAlpha.apply(ke,arguments)},this.clear=function(E=!0,k=!0,z=!0){let B=0;if(E){let U=!1;if(A!==null){const se=A.texture.format;U=se===Gh||se===Vh||se===Hh}if(U){const se=A.texture.type,he=se===gi||se===Tr||se===La||se===Ts||se===Bh||se===jh,ye=ke.getClearColor(),we=ke.getClearAlpha(),Ne=ye.r,Le=ye.g,Ee=ye.b;he?(g[0]=Ne,g[1]=Le,g[2]=Ee,g[3]=we,R.clearBufferuiv(R.COLOR,0,g)):(v[0]=Ne,v[1]=Le,v[2]=Ee,v[3]=we,R.clearBufferiv(R.COLOR,0,v))}else B|=R.COLOR_BUFFER_BIT}k&&(B|=R.DEPTH_BUFFER_BIT,R.clearDepth(this.capabilities.reverseDepthBuffer?0:1)),z&&(B|=R.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),R.clear(B)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){n.removeEventListener("webglcontextlost",ee,!1),n.removeEventListener("webglcontextrestored",de,!1),n.removeEventListener("webglcontextcreationerror",me,!1),xe.dispose(),Ye.dispose(),Pe.dispose(),w.dispose(),O.dispose(),Z.dispose(),at.dispose(),D.dispose(),Me.dispose(),X.dispose(),X.removeEventListener("sessionstart",Qh),X.removeEventListener("sessionend",Jh),Ji.stop()};function ee(E){E.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),M=!0}function de(){console.log("THREE.WebGLRenderer: Context Restored."),M=!1;const E=rt.autoReset,k=ve.enabled,z=ve.autoUpdate,B=ve.needsUpdate,U=ve.type;pe(),rt.autoReset=E,ve.enabled=k,ve.autoUpdate=z,ve.needsUpdate=B,ve.type=U}function me(E){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",E.statusMessage)}function We(E){const k=E.target;k.removeEventListener("dispose",We),St(k)}function St(E){Yt(E),Pe.remove(E)}function Yt(E){const k=Pe.get(E).programs;k!==void 0&&(k.forEach(function(z){Me.releaseProgram(z)}),E.isShaderMaterial&&Me.releaseShaderCache(E))}this.renderBufferDirect=function(E,k,z,B,U,se){k===null&&(k=He);const he=U.isMesh&&U.matrixWorld.determinant()<0,ye=Ax(E,k,z,B,U);Ae.setMaterial(B,he);let we=z.index,Ne=1;if(B.wireframe===!0){if(we=ne.getWireframeAttribute(z),we===void 0)return;Ne=2}const Le=z.drawRange,Ee=z.attributes.position;let nt=Le.start*Ne,lt=(Le.start+Le.count)*Ne;se!==null&&(nt=Math.max(nt,se.start*Ne),lt=Math.min(lt,(se.start+se.count)*Ne)),we!==null?(nt=Math.max(nt,0),lt=Math.min(lt,we.count)):Ee!=null&&(nt=Math.max(nt,0),lt=Math.min(lt,Ee.count));const xt=lt-nt;if(xt<0||xt===1/0)return;at.setup(U,B,ye,z,we);let an,Je=_e;if(we!==null&&(an=J.get(we),Je=Ge,Je.setIndex(an)),U.isMesh)B.wireframe===!0?(Ae.setLineWidth(B.wireframeLinewidth*Ve()),Je.setMode(R.LINES)):Je.setMode(R.TRIANGLES);else if(U.isLine){let be=B.linewidth;be===void 0&&(be=1),Ae.setLineWidth(be*Ve()),U.isLineSegments?Je.setMode(R.LINES):U.isLineLoop?Je.setMode(R.LINE_LOOP):Je.setMode(R.LINE_STRIP)}else U.isPoints?Je.setMode(R.POINTS):U.isSprite&&Je.setMode(R.TRIANGLES);if(U.isBatchedMesh)if(U._multiDrawInstances!==null)Je.renderMultiDrawInstances(U._multiDrawStarts,U._multiDrawCounts,U._multiDrawCount,U._multiDrawInstances);else if(Ue.get("WEBGL_multi_draw"))Je.renderMultiDraw(U._multiDrawStarts,U._multiDrawCounts,U._multiDrawCount);else{const be=U._multiDrawStarts,Pt=U._multiDrawCounts,et=U._multiDrawCount,Cn=we?J.get(we).bytesPerElement:1,Nr=Pe.get(B).currentProgram.getUniforms();for(let on=0;on<et;on++)Nr.setValue(R,"_gl_DrawID",on),Je.render(be[on]/Cn,Pt[on])}else if(U.isInstancedMesh)Je.renderInstances(nt,xt,U.count);else if(z.isInstancedBufferGeometry){const be=z._maxInstanceCount!==void 0?z._maxInstanceCount:1/0,Pt=Math.min(z.instanceCount,be);Je.renderInstances(nt,xt,Pt)}else Je.render(nt,xt)};function Ze(E,k,z){E.transparent===!0&&E.side===Xn&&E.forceSinglePass===!1?(E.side=sn,E.needsUpdate=!0,Xa(E,k,z),E.side=qi,E.needsUpdate=!0,Xa(E,k,z),E.side=Xn):Xa(E,k,z)}this.compile=function(E,k,z=null){z===null&&(z=E),m=Ye.get(z),m.init(k),_.push(m),z.traverseVisible(function(U){U.isLight&&U.layers.test(k.layers)&&(m.pushLight(U),U.castShadow&&m.pushShadow(U))}),E!==z&&E.traverseVisible(function(U){U.isLight&&U.layers.test(k.layers)&&(m.pushLight(U),U.castShadow&&m.pushShadow(U))}),m.setupLights();const B=new Set;return E.traverse(function(U){if(!(U.isMesh||U.isPoints||U.isLine||U.isSprite))return;const se=U.material;if(se)if(Array.isArray(se))for(let he=0;he<se.length;he++){const ye=se[he];Ze(ye,z,U),B.add(ye)}else Ze(se,z,U),B.add(se)}),_.pop(),m=null,B},this.compileAsync=function(E,k,z=null){const B=this.compile(E,k,z);return new Promise(U=>{function se(){if(B.forEach(function(he){Pe.get(he).currentProgram.isReady()&&B.delete(he)}),B.size===0){U(E);return}setTimeout(se,10)}Ue.get("KHR_parallel_shader_compile")!==null?se():setTimeout(se,10)})};let Kt=null;function Zn(E){Kt&&Kt(E)}function Qh(){Ji.stop()}function Jh(){Ji.start()}const Ji=new xx;Ji.setAnimationLoop(Zn),typeof self<"u"&&Ji.setContext(self),this.setAnimationLoop=function(E){Kt=E,X.setAnimationLoop(E),E===null?Ji.stop():Ji.start()},X.addEventListener("sessionstart",Qh),X.addEventListener("sessionend",Jh),this.render=function(E,k){if(k!==void 0&&k.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(M===!0)return;if(E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),k.parent===null&&k.matrixWorldAutoUpdate===!0&&k.updateMatrixWorld(),X.enabled===!0&&X.isPresenting===!0&&(X.cameraAutoUpdate===!0&&X.updateCamera(k),k=X.getCamera()),E.isScene===!0&&E.onBeforeRender(x,E,k,A),m=Ye.get(E,_.length),m.init(k),_.push(m),ce.multiplyMatrices(k.projectionMatrix,k.matrixWorldInverse),Te.setFromProjectionMatrix(ce),te=this.localClippingEnabled,W=re.init(this.clippingPlanes,te),S=xe.get(E,d.length),S.init(),d.push(S),X.enabled===!0&&X.isPresenting===!0){const se=x.xr.getDepthSensingMesh();se!==null&&ql(se,k,-1/0,x.sortObjects)}ql(E,k,0,x.sortObjects),S.finish(),x.sortObjects===!0&&S.sort(L,K),Qe=X.enabled===!1||X.isPresenting===!1||X.hasDepthSensing()===!1,Qe&&ke.addToRenderList(S,E),this.info.render.frame++,W===!0&&re.beginShadows();const z=m.state.shadowsArray;ve.render(z,E,k),W===!0&&re.endShadows(),this.info.autoReset===!0&&this.info.reset();const B=S.opaque,U=S.transmissive;if(m.setupLights(),k.isArrayCamera){const se=k.cameras;if(U.length>0)for(let he=0,ye=se.length;he<ye;he++){const we=se[he];tf(B,U,E,we)}Qe&&ke.render(E);for(let he=0,ye=se.length;he<ye;he++){const we=se[he];ef(S,E,we,we.viewport)}}else U.length>0&&tf(B,U,E,k),Qe&&ke.render(E),ef(S,E,k);A!==null&&(C.updateMultisampleRenderTarget(A),C.updateRenderTargetMipmap(A)),E.isScene===!0&&E.onAfterRender(x,E,k),at.resetDefaultState(),N=-1,H=null,_.pop(),_.length>0?(m=_[_.length-1],W===!0&&re.setGlobalState(x.clippingPlanes,m.state.camera)):m=null,d.pop(),d.length>0?S=d[d.length-1]:S=null};function ql(E,k,z,B){if(E.visible===!1)return;if(E.layers.test(k.layers)){if(E.isGroup)z=E.renderOrder;else if(E.isLOD)E.autoUpdate===!0&&E.update(k);else if(E.isLight)m.pushLight(E),E.castShadow&&m.pushShadow(E);else if(E.isSprite){if(!E.frustumCulled||Te.intersectsSprite(E)){B&&Ce.setFromMatrixPosition(E.matrixWorld).applyMatrix4(ce);const he=Z.update(E),ye=E.material;ye.visible&&S.push(E,he,ye,z,Ce.z,null)}}else if((E.isMesh||E.isLine||E.isPoints)&&(!E.frustumCulled||Te.intersectsObject(E))){const he=Z.update(E),ye=E.material;if(B&&(E.boundingSphere!==void 0?(E.boundingSphere===null&&E.computeBoundingSphere(),Ce.copy(E.boundingSphere.center)):(he.boundingSphere===null&&he.computeBoundingSphere(),Ce.copy(he.boundingSphere.center)),Ce.applyMatrix4(E.matrixWorld).applyMatrix4(ce)),Array.isArray(ye)){const we=he.groups;for(let Ne=0,Le=we.length;Ne<Le;Ne++){const Ee=we[Ne],nt=ye[Ee.materialIndex];nt&&nt.visible&&S.push(E,he,nt,z,Ce.z,Ee)}}else ye.visible&&S.push(E,he,ye,z,Ce.z,null)}}const se=E.children;for(let he=0,ye=se.length;he<ye;he++)ql(se[he],k,z,B)}function ef(E,k,z,B){const U=E.opaque,se=E.transmissive,he=E.transparent;m.setupLightsView(z),W===!0&&re.setGlobalState(x.clippingPlanes,z),B&&Ae.viewport(y.copy(B)),U.length>0&&Wa(U,k,z),se.length>0&&Wa(se,k,z),he.length>0&&Wa(he,k,z),Ae.buffers.depth.setTest(!0),Ae.buffers.depth.setMask(!0),Ae.buffers.color.setMask(!0),Ae.setPolygonOffset(!1)}function tf(E,k,z,B){if((z.isScene===!0?z.overrideMaterial:null)!==null)return;m.state.transmissionRenderTarget[B.id]===void 0&&(m.state.transmissionRenderTarget[B.id]=new Ar(1,1,{generateMipmaps:!0,type:Ue.has("EXT_color_buffer_half_float")||Ue.has("EXT_color_buffer_float")?za:gi,minFilter:xr,samples:4,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:tt.workingColorSpace}));const se=m.state.transmissionRenderTarget[B.id],he=B.viewport||y;se.setSize(he.z,he.w);const ye=x.getRenderTarget();x.setRenderTarget(se),x.getClearColor(j),$=x.getClearAlpha(),$<1&&x.setClearColor(16777215,.5),x.clear(),Qe&&ke.render(z);const we=x.toneMapping;x.toneMapping=Gi;const Ne=B.viewport;if(B.viewport!==void 0&&(B.viewport=void 0),m.setupLightsView(B),W===!0&&re.setGlobalState(x.clippingPlanes,B),Wa(E,z,B),C.updateMultisampleRenderTarget(se),C.updateRenderTargetMipmap(se),Ue.has("WEBGL_multisampled_render_to_texture")===!1){let Le=!1;for(let Ee=0,nt=k.length;Ee<nt;Ee++){const lt=k[Ee],xt=lt.object,an=lt.geometry,Je=lt.material,be=lt.group;if(Je.side===Xn&&xt.layers.test(B.layers)){const Pt=Je.side;Je.side=sn,Je.needsUpdate=!0,nf(xt,z,B,an,Je,be),Je.side=Pt,Je.needsUpdate=!0,Le=!0}}Le===!0&&(C.updateMultisampleRenderTarget(se),C.updateRenderTargetMipmap(se))}x.setRenderTarget(ye),x.setClearColor(j,$),Ne!==void 0&&(B.viewport=Ne),x.toneMapping=we}function Wa(E,k,z){const B=k.isScene===!0?k.overrideMaterial:null;for(let U=0,se=E.length;U<se;U++){const he=E[U],ye=he.object,we=he.geometry,Ne=B===null?he.material:B,Le=he.group;ye.layers.test(z.layers)&&nf(ye,k,z,we,Ne,Le)}}function nf(E,k,z,B,U,se){E.onBeforeRender(x,k,z,B,U,se),E.modelViewMatrix.multiplyMatrices(z.matrixWorldInverse,E.matrixWorld),E.normalMatrix.getNormalMatrix(E.modelViewMatrix),U.onBeforeRender(x,k,z,B,E,se),U.transparent===!0&&U.side===Xn&&U.forceSinglePass===!1?(U.side=sn,U.needsUpdate=!0,x.renderBufferDirect(z,k,B,U,E,se),U.side=qi,U.needsUpdate=!0,x.renderBufferDirect(z,k,B,U,E,se),U.side=Xn):x.renderBufferDirect(z,k,B,U,E,se),E.onAfterRender(x,k,z,B,U,se)}function Xa(E,k,z){k.isScene!==!0&&(k=He);const B=Pe.get(E),U=m.state.lights,se=m.state.shadowsArray,he=U.state.version,ye=Me.getParameters(E,U.state,se,k,z),we=Me.getProgramCacheKey(ye);let Ne=B.programs;B.environment=E.isMeshStandardMaterial?k.environment:null,B.fog=k.fog,B.envMap=(E.isMeshStandardMaterial?O:w).get(E.envMap||B.environment),B.envMapRotation=B.environment!==null&&E.envMap===null?k.environmentRotation:E.envMapRotation,Ne===void 0&&(E.addEventListener("dispose",We),Ne=new Map,B.programs=Ne);let Le=Ne.get(we);if(Le!==void 0){if(B.currentProgram===Le&&B.lightsStateVersion===he)return sf(E,ye),Le}else ye.uniforms=Me.getUniforms(E),E.onBeforeCompile(ye,x),Le=Me.acquireProgram(ye,we),Ne.set(we,Le),B.uniforms=ye.uniforms;const Ee=B.uniforms;return(!E.isShaderMaterial&&!E.isRawShaderMaterial||E.clipping===!0)&&(Ee.clippingPlanes=re.uniform),sf(E,ye),B.needsLights=Rx(E),B.lightsStateVersion=he,B.needsLights&&(Ee.ambientLightColor.value=U.state.ambient,Ee.lightProbe.value=U.state.probe,Ee.directionalLights.value=U.state.directional,Ee.directionalLightShadows.value=U.state.directionalShadow,Ee.spotLights.value=U.state.spot,Ee.spotLightShadows.value=U.state.spotShadow,Ee.rectAreaLights.value=U.state.rectArea,Ee.ltc_1.value=U.state.rectAreaLTC1,Ee.ltc_2.value=U.state.rectAreaLTC2,Ee.pointLights.value=U.state.point,Ee.pointLightShadows.value=U.state.pointShadow,Ee.hemisphereLights.value=U.state.hemi,Ee.directionalShadowMap.value=U.state.directionalShadowMap,Ee.directionalShadowMatrix.value=U.state.directionalShadowMatrix,Ee.spotShadowMap.value=U.state.spotShadowMap,Ee.spotLightMatrix.value=U.state.spotLightMatrix,Ee.spotLightMap.value=U.state.spotLightMap,Ee.pointShadowMap.value=U.state.pointShadowMap,Ee.pointShadowMatrix.value=U.state.pointShadowMatrix),B.currentProgram=Le,B.uniformsList=null,Le}function rf(E){if(E.uniformsList===null){const k=E.currentProgram.getUniforms();E.uniformsList=Qo.seqWithValue(k.seq,E.uniforms)}return E.uniformsList}function sf(E,k){const z=Pe.get(E);z.outputColorSpace=k.outputColorSpace,z.batching=k.batching,z.batchingColor=k.batchingColor,z.instancing=k.instancing,z.instancingColor=k.instancingColor,z.instancingMorph=k.instancingMorph,z.skinning=k.skinning,z.morphTargets=k.morphTargets,z.morphNormals=k.morphNormals,z.morphColors=k.morphColors,z.morphTargetsCount=k.morphTargetsCount,z.numClippingPlanes=k.numClippingPlanes,z.numIntersection=k.numClipIntersection,z.vertexAlphas=k.vertexAlphas,z.vertexTangents=k.vertexTangents,z.toneMapping=k.toneMapping}function Ax(E,k,z,B,U){k.isScene!==!0&&(k=He),C.resetTextureUnits();const se=k.fog,he=B.isMeshStandardMaterial?k.environment:null,ye=A===null?x.outputColorSpace:A.isXRRenderTarget===!0?A.texture.colorSpace:Qi,we=(B.isMeshStandardMaterial?O:w).get(B.envMap||he),Ne=B.vertexColors===!0&&!!z.attributes.color&&z.attributes.color.itemSize===4,Le=!!z.attributes.tangent&&(!!B.normalMap||B.anisotropy>0),Ee=!!z.morphAttributes.position,nt=!!z.morphAttributes.normal,lt=!!z.morphAttributes.color;let xt=Gi;B.toneMapped&&(A===null||A.isXRRenderTarget===!0)&&(xt=x.toneMapping);const an=z.morphAttributes.position||z.morphAttributes.normal||z.morphAttributes.color,Je=an!==void 0?an.length:0,be=Pe.get(B),Pt=m.state.lights;if(W===!0&&(te===!0||E!==H)){const xn=E===H&&B.id===N;re.setState(B,E,xn)}let et=!1;B.version===be.__version?(be.needsLights&&be.lightsStateVersion!==Pt.state.version||be.outputColorSpace!==ye||U.isBatchedMesh&&be.batching===!1||!U.isBatchedMesh&&be.batching===!0||U.isBatchedMesh&&be.batchingColor===!0&&U.colorTexture===null||U.isBatchedMesh&&be.batchingColor===!1&&U.colorTexture!==null||U.isInstancedMesh&&be.instancing===!1||!U.isInstancedMesh&&be.instancing===!0||U.isSkinnedMesh&&be.skinning===!1||!U.isSkinnedMesh&&be.skinning===!0||U.isInstancedMesh&&be.instancingColor===!0&&U.instanceColor===null||U.isInstancedMesh&&be.instancingColor===!1&&U.instanceColor!==null||U.isInstancedMesh&&be.instancingMorph===!0&&U.morphTexture===null||U.isInstancedMesh&&be.instancingMorph===!1&&U.morphTexture!==null||be.envMap!==we||B.fog===!0&&be.fog!==se||be.numClippingPlanes!==void 0&&(be.numClippingPlanes!==re.numPlanes||be.numIntersection!==re.numIntersection)||be.vertexAlphas!==Ne||be.vertexTangents!==Le||be.morphTargets!==Ee||be.morphNormals!==nt||be.morphColors!==lt||be.toneMapping!==xt||be.morphTargetsCount!==Je)&&(et=!0):(et=!0,be.__version=B.version);let Cn=be.currentProgram;et===!0&&(Cn=Xa(B,k,U));let Nr=!1,on=!1,$l=!1;const _t=Cn.getUniforms(),_i=be.uniforms;if(Ae.useProgram(Cn.program)&&(Nr=!0,on=!0,$l=!0),B.id!==N&&(N=B.id,on=!0),Nr||H!==E){Oe.reverseDepthBuffer?(le.copy(E.projectionMatrix),jS(le),HS(le),_t.setValue(R,"projectionMatrix",le)):_t.setValue(R,"projectionMatrix",E.projectionMatrix),_t.setValue(R,"viewMatrix",E.matrixWorldInverse);const xn=_t.map.cameraPosition;xn!==void 0&&xn.setValue(R,De.setFromMatrixPosition(E.matrixWorld)),Oe.logarithmicDepthBuffer&&_t.setValue(R,"logDepthBufFC",2/(Math.log(E.far+1)/Math.LN2)),(B.isMeshPhongMaterial||B.isMeshToonMaterial||B.isMeshLambertMaterial||B.isMeshBasicMaterial||B.isMeshStandardMaterial||B.isShaderMaterial)&&_t.setValue(R,"isOrthographic",E.isOrthographicCamera===!0),H!==E&&(H=E,on=!0,$l=!0)}if(U.isSkinnedMesh){_t.setOptional(R,U,"bindMatrix"),_t.setOptional(R,U,"bindMatrixInverse");const xn=U.skeleton;xn&&(xn.boneTexture===null&&xn.computeBoneTexture(),_t.setValue(R,"boneTexture",xn.boneTexture,C))}U.isBatchedMesh&&(_t.setOptional(R,U,"batchingTexture"),_t.setValue(R,"batchingTexture",U._matricesTexture,C),_t.setOptional(R,U,"batchingIdTexture"),_t.setValue(R,"batchingIdTexture",U._indirectTexture,C),_t.setOptional(R,U,"batchingColorTexture"),U._colorsTexture!==null&&_t.setValue(R,"batchingColorTexture",U._colorsTexture,C));const Yl=z.morphAttributes;if((Yl.position!==void 0||Yl.normal!==void 0||Yl.color!==void 0)&&Ie.update(U,z,Cn),(on||be.receiveShadow!==U.receiveShadow)&&(be.receiveShadow=U.receiveShadow,_t.setValue(R,"receiveShadow",U.receiveShadow)),B.isMeshGouraudMaterial&&B.envMap!==null&&(_i.envMap.value=we,_i.flipEnvMap.value=we.isCubeTexture&&we.isRenderTargetTexture===!1?-1:1),B.isMeshStandardMaterial&&B.envMap===null&&k.environment!==null&&(_i.envMapIntensity.value=k.environmentIntensity),on&&(_t.setValue(R,"toneMappingExposure",x.toneMappingExposure),be.needsLights&&Cx(_i,$l),se&&B.fog===!0&&ue.refreshFogUniforms(_i,se),ue.refreshMaterialUniforms(_i,B,Y,G,m.state.transmissionRenderTarget[E.id]),Qo.upload(R,rf(be),_i,C)),B.isShaderMaterial&&B.uniformsNeedUpdate===!0&&(Qo.upload(R,rf(be),_i,C),B.uniformsNeedUpdate=!1),B.isSpriteMaterial&&_t.setValue(R,"center",U.center),_t.setValue(R,"modelViewMatrix",U.modelViewMatrix),_t.setValue(R,"normalMatrix",U.normalMatrix),_t.setValue(R,"modelMatrix",U.matrixWorld),B.isShaderMaterial||B.isRawShaderMaterial){const xn=B.uniformsGroups;for(let Kl=0,Nx=xn.length;Kl<Nx;Kl++){const af=xn[Kl];D.update(af,Cn),D.bind(af,Cn)}}return Cn}function Cx(E,k){E.ambientLightColor.needsUpdate=k,E.lightProbe.needsUpdate=k,E.directionalLights.needsUpdate=k,E.directionalLightShadows.needsUpdate=k,E.pointLights.needsUpdate=k,E.pointLightShadows.needsUpdate=k,E.spotLights.needsUpdate=k,E.spotLightShadows.needsUpdate=k,E.rectAreaLights.needsUpdate=k,E.hemisphereLights.needsUpdate=k}function Rx(E){return E.isMeshLambertMaterial||E.isMeshToonMaterial||E.isMeshPhongMaterial||E.isMeshStandardMaterial||E.isShadowMaterial||E.isShaderMaterial&&E.lights===!0}this.getActiveCubeFace=function(){return P},this.getActiveMipmapLevel=function(){return T},this.getRenderTarget=function(){return A},this.setRenderTargetTextures=function(E,k,z){Pe.get(E.texture).__webglTexture=k,Pe.get(E.depthTexture).__webglTexture=z;const B=Pe.get(E);B.__hasExternalTextures=!0,B.__autoAllocateDepthBuffer=z===void 0,B.__autoAllocateDepthBuffer||Ue.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),B.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(E,k){const z=Pe.get(E);z.__webglFramebuffer=k,z.__useDefaultFramebuffer=k===void 0},this.setRenderTarget=function(E,k=0,z=0){A=E,P=k,T=z;let B=!0,U=null,se=!1,he=!1;if(E){const we=Pe.get(E);if(we.__useDefaultFramebuffer!==void 0)Ae.bindFramebuffer(R.FRAMEBUFFER,null),B=!1;else if(we.__webglFramebuffer===void 0)C.setupRenderTarget(E);else if(we.__hasExternalTextures)C.rebindTextures(E,Pe.get(E.texture).__webglTexture,Pe.get(E.depthTexture).__webglTexture);else if(E.depthBuffer){const Ee=E.depthTexture;if(we.__boundDepthTexture!==Ee){if(Ee!==null&&Pe.has(Ee)&&(E.width!==Ee.image.width||E.height!==Ee.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");C.setupDepthRenderbuffer(E)}}const Ne=E.texture;(Ne.isData3DTexture||Ne.isDataArrayTexture||Ne.isCompressedArrayTexture)&&(he=!0);const Le=Pe.get(E).__webglFramebuffer;E.isWebGLCubeRenderTarget?(Array.isArray(Le[k])?U=Le[k][z]:U=Le[k],se=!0):E.samples>0&&C.useMultisampledRTT(E)===!1?U=Pe.get(E).__webglMultisampledFramebuffer:Array.isArray(Le)?U=Le[z]:U=Le,y.copy(E.viewport),b.copy(E.scissor),V=E.scissorTest}else y.copy(I).multiplyScalar(Y).floor(),b.copy(q).multiplyScalar(Y).floor(),V=fe;if(Ae.bindFramebuffer(R.FRAMEBUFFER,U)&&B&&Ae.drawBuffers(E,U),Ae.viewport(y),Ae.scissor(b),Ae.setScissorTest(V),se){const we=Pe.get(E.texture);R.framebufferTexture2D(R.FRAMEBUFFER,R.COLOR_ATTACHMENT0,R.TEXTURE_CUBE_MAP_POSITIVE_X+k,we.__webglTexture,z)}else if(he){const we=Pe.get(E.texture),Ne=k||0;R.framebufferTextureLayer(R.FRAMEBUFFER,R.COLOR_ATTACHMENT0,we.__webglTexture,z||0,Ne)}N=-1},this.readRenderTargetPixels=function(E,k,z,B,U,se,he){if(!(E&&E.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let ye=Pe.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&he!==void 0&&(ye=ye[he]),ye){Ae.bindFramebuffer(R.FRAMEBUFFER,ye);try{const we=E.texture,Ne=we.format,Le=we.type;if(!Oe.textureFormatReadable(Ne)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Oe.textureTypeReadable(Le)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}k>=0&&k<=E.width-B&&z>=0&&z<=E.height-U&&R.readPixels(k,z,B,U,Fe.convert(Ne),Fe.convert(Le),se)}finally{const we=A!==null?Pe.get(A).__webglFramebuffer:null;Ae.bindFramebuffer(R.FRAMEBUFFER,we)}}},this.readRenderTargetPixelsAsync=async function(E,k,z,B,U,se,he){if(!(E&&E.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let ye=Pe.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&he!==void 0&&(ye=ye[he]),ye){const we=E.texture,Ne=we.format,Le=we.type;if(!Oe.textureFormatReadable(Ne))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Oe.textureTypeReadable(Le))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(k>=0&&k<=E.width-B&&z>=0&&z<=E.height-U){Ae.bindFramebuffer(R.FRAMEBUFFER,ye);const Ee=R.createBuffer();R.bindBuffer(R.PIXEL_PACK_BUFFER,Ee),R.bufferData(R.PIXEL_PACK_BUFFER,se.byteLength,R.STREAM_READ),R.readPixels(k,z,B,U,Fe.convert(Ne),Fe.convert(Le),0);const nt=A!==null?Pe.get(A).__webglFramebuffer:null;Ae.bindFramebuffer(R.FRAMEBUFFER,nt);const lt=R.fenceSync(R.SYNC_GPU_COMMANDS_COMPLETE,0);return R.flush(),await BS(R,lt,4),R.bindBuffer(R.PIXEL_PACK_BUFFER,Ee),R.getBufferSubData(R.PIXEL_PACK_BUFFER,0,se),R.deleteBuffer(Ee),R.deleteSync(lt),se}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(E,k=null,z=0){E.isTexture!==!0&&(Zo("WebGLRenderer: copyFramebufferToTexture function signature has changed."),k=arguments[0]||null,E=arguments[1]);const B=Math.pow(2,-z),U=Math.floor(E.image.width*B),se=Math.floor(E.image.height*B),he=k!==null?k.x:0,ye=k!==null?k.y:0;C.setTexture2D(E,0),R.copyTexSubImage2D(R.TEXTURE_2D,z,0,0,he,ye,U,se),Ae.unbindTexture()},this.copyTextureToTexture=function(E,k,z=null,B=null,U=0){E.isTexture!==!0&&(Zo("WebGLRenderer: copyTextureToTexture function signature has changed."),B=arguments[0]||null,E=arguments[1],k=arguments[2],U=arguments[3]||0,z=null);let se,he,ye,we,Ne,Le;z!==null?(se=z.max.x-z.min.x,he=z.max.y-z.min.y,ye=z.min.x,we=z.min.y):(se=E.image.width,he=E.image.height,ye=0,we=0),B!==null?(Ne=B.x,Le=B.y):(Ne=0,Le=0);const Ee=Fe.convert(k.format),nt=Fe.convert(k.type);C.setTexture2D(k,0),R.pixelStorei(R.UNPACK_FLIP_Y_WEBGL,k.flipY),R.pixelStorei(R.UNPACK_PREMULTIPLY_ALPHA_WEBGL,k.premultiplyAlpha),R.pixelStorei(R.UNPACK_ALIGNMENT,k.unpackAlignment);const lt=R.getParameter(R.UNPACK_ROW_LENGTH),xt=R.getParameter(R.UNPACK_IMAGE_HEIGHT),an=R.getParameter(R.UNPACK_SKIP_PIXELS),Je=R.getParameter(R.UNPACK_SKIP_ROWS),be=R.getParameter(R.UNPACK_SKIP_IMAGES),Pt=E.isCompressedTexture?E.mipmaps[U]:E.image;R.pixelStorei(R.UNPACK_ROW_LENGTH,Pt.width),R.pixelStorei(R.UNPACK_IMAGE_HEIGHT,Pt.height),R.pixelStorei(R.UNPACK_SKIP_PIXELS,ye),R.pixelStorei(R.UNPACK_SKIP_ROWS,we),E.isDataTexture?R.texSubImage2D(R.TEXTURE_2D,U,Ne,Le,se,he,Ee,nt,Pt.data):E.isCompressedTexture?R.compressedTexSubImage2D(R.TEXTURE_2D,U,Ne,Le,Pt.width,Pt.height,Ee,Pt.data):R.texSubImage2D(R.TEXTURE_2D,U,Ne,Le,se,he,Ee,nt,Pt),R.pixelStorei(R.UNPACK_ROW_LENGTH,lt),R.pixelStorei(R.UNPACK_IMAGE_HEIGHT,xt),R.pixelStorei(R.UNPACK_SKIP_PIXELS,an),R.pixelStorei(R.UNPACK_SKIP_ROWS,Je),R.pixelStorei(R.UNPACK_SKIP_IMAGES,be),U===0&&k.generateMipmaps&&R.generateMipmap(R.TEXTURE_2D),Ae.unbindTexture()},this.copyTextureToTexture3D=function(E,k,z=null,B=null,U=0){E.isTexture!==!0&&(Zo("WebGLRenderer: copyTextureToTexture3D function signature has changed."),z=arguments[0]||null,B=arguments[1]||null,E=arguments[2],k=arguments[3],U=arguments[4]||0);let se,he,ye,we,Ne,Le,Ee,nt,lt;const xt=E.isCompressedTexture?E.mipmaps[U]:E.image;z!==null?(se=z.max.x-z.min.x,he=z.max.y-z.min.y,ye=z.max.z-z.min.z,we=z.min.x,Ne=z.min.y,Le=z.min.z):(se=xt.width,he=xt.height,ye=xt.depth,we=0,Ne=0,Le=0),B!==null?(Ee=B.x,nt=B.y,lt=B.z):(Ee=0,nt=0,lt=0);const an=Fe.convert(k.format),Je=Fe.convert(k.type);let be;if(k.isData3DTexture)C.setTexture3D(k,0),be=R.TEXTURE_3D;else if(k.isDataArrayTexture||k.isCompressedArrayTexture)C.setTexture2DArray(k,0),be=R.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}R.pixelStorei(R.UNPACK_FLIP_Y_WEBGL,k.flipY),R.pixelStorei(R.UNPACK_PREMULTIPLY_ALPHA_WEBGL,k.premultiplyAlpha),R.pixelStorei(R.UNPACK_ALIGNMENT,k.unpackAlignment);const Pt=R.getParameter(R.UNPACK_ROW_LENGTH),et=R.getParameter(R.UNPACK_IMAGE_HEIGHT),Cn=R.getParameter(R.UNPACK_SKIP_PIXELS),Nr=R.getParameter(R.UNPACK_SKIP_ROWS),on=R.getParameter(R.UNPACK_SKIP_IMAGES);R.pixelStorei(R.UNPACK_ROW_LENGTH,xt.width),R.pixelStorei(R.UNPACK_IMAGE_HEIGHT,xt.height),R.pixelStorei(R.UNPACK_SKIP_PIXELS,we),R.pixelStorei(R.UNPACK_SKIP_ROWS,Ne),R.pixelStorei(R.UNPACK_SKIP_IMAGES,Le),E.isDataTexture||E.isData3DTexture?R.texSubImage3D(be,U,Ee,nt,lt,se,he,ye,an,Je,xt.data):k.isCompressedArrayTexture?R.compressedTexSubImage3D(be,U,Ee,nt,lt,se,he,ye,an,xt.data):R.texSubImage3D(be,U,Ee,nt,lt,se,he,ye,an,Je,xt),R.pixelStorei(R.UNPACK_ROW_LENGTH,Pt),R.pixelStorei(R.UNPACK_IMAGE_HEIGHT,et),R.pixelStorei(R.UNPACK_SKIP_PIXELS,Cn),R.pixelStorei(R.UNPACK_SKIP_ROWS,Nr),R.pixelStorei(R.UNPACK_SKIP_IMAGES,on),U===0&&k.generateMipmaps&&R.generateMipmap(be),Ae.unbindTexture()},this.initRenderTarget=function(E){Pe.get(E).__webglFramebuffer===void 0&&C.setupRenderTarget(E)},this.initTexture=function(E){E.isCubeTexture?C.setTextureCube(E,0):E.isData3DTexture?C.setTexture3D(E,0):E.isDataArrayTexture||E.isCompressedArrayTexture?C.setTexture2DArray(E,0):C.setTexture2D(E,0),Ae.unbindTexture()},this.resetState=function(){P=0,T=0,A=null,Ae.reset(),at.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return ci}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const n=this.getContext();n.drawingBufferColorSpace=e===Wh?"display-p3":"srgb",n.unpackColorSpace=tt.workingColorSpace===Gl?"display-p3":"srgb"}}class Kh{constructor(e,n=25e-5){this.isFogExp2=!0,this.name="",this.color=new Xe(e),this.density=n}clone(){return new Kh(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}}class eT extends Xt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Kn,this.environmentIntensity=1,this.environmentRotation=new Kn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,n){return super.copy(e,n),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const n=super.toJSON(e);return this.fog!==null&&(n.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(n.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(n.object.backgroundIntensity=this.backgroundIntensity),n.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(n.object.environmentIntensity=this.environmentIntensity),n.object.environmentRotation=this.environmentRotation.toArray(),n}}class Mx extends Ds{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Xe(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const fm=new ht,jd=new Xh,Lo=new Wl,Do=new F;class tT extends Xt{constructor(e=new vi,n=new Mx){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=n,this.updateMorphTargets()}copy(e,n){return super.copy(e,n),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,n){const i=this.geometry,r=this.matrixWorld,s=e.params.Points.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Lo.copy(i.boundingSphere),Lo.applyMatrix4(r),Lo.radius+=s,e.ray.intersectsSphere(Lo)===!1)return;fm.copy(r).invert(),jd.copy(e.ray).applyMatrix4(fm);const o=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,u=i.index,p=i.attributes.position;if(u!==null){const f=Math.max(0,a.start),g=Math.min(u.count,a.start+a.count);for(let v=f,S=g;v<S;v++){const m=u.getX(v);Do.fromBufferAttribute(p,m),pm(Do,m,l,r,e,n,this)}}else{const f=Math.max(0,a.start),g=Math.min(p.count,a.start+a.count);for(let v=f,S=g;v<S;v++)Do.fromBufferAttribute(p,v),pm(Do,v,l,r,e,n,this)}}updateMorphTargets(){const n=this.geometry.morphAttributes,i=Object.keys(n);if(i.length>0){const r=n[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=r.length;s<a;s++){const o=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}}function pm(t,e,n,i,r,s,a){const o=jd.distanceSqToPoint(t);if(o<n){const l=new F;jd.closestPointToPoint(t,l),l.applyMatrix4(i);const u=r.ray.origin.distanceTo(l);if(u<r.near||u>r.far)return;s.push({distance:u,distanceToRay:Math.sqrt(o),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}class nT extends Ds{constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new Xe(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Xe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=sx,this.normalScale=new Ke(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Kn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}const mm={enabled:!1,files:{},add:function(t,e){this.enabled!==!1&&(this.files[t]=e)},get:function(t){if(this.enabled!==!1)return this.files[t]},remove:function(t){delete this.files[t]},clear:function(){this.files={}}};class iT{constructor(e,n,i){const r=this;let s=!1,a=0,o=0,l;const u=[];this.onStart=void 0,this.onLoad=e,this.onProgress=n,this.onError=i,this.itemStart=function(h){o++,s===!1&&r.onStart!==void 0&&r.onStart(h,a,o),s=!0},this.itemEnd=function(h){a++,r.onProgress!==void 0&&r.onProgress(h,a,o),a===o&&(s=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(h){r.onError!==void 0&&r.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,p){return u.push(h,p),this},this.removeHandler=function(h){const p=u.indexOf(h);return p!==-1&&u.splice(p,2),this},this.getHandler=function(h){for(let p=0,f=u.length;p<f;p+=2){const g=u[p],v=u[p+1];if(g.global&&(g.lastIndex=0),g.test(h))return v}return null}}}const rT=new iT;class Zh{constructor(e){this.manager=e!==void 0?e:rT,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,n){const i=this;return new Promise(function(r,s){i.load(e,r,n,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}}Zh.DEFAULT_MATERIAL_NAME="__DEFAULT";class sT extends Zh{constructor(e){super(e)}load(e,n,i,r){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=this,a=mm.get(e);if(a!==void 0)return s.manager.itemStart(e),setTimeout(function(){n&&n(a),s.manager.itemEnd(e)},0),a;const o=Da("img");function l(){h(),mm.add(e,this),n&&n(this),s.manager.itemEnd(e)}function u(p){h(),r&&r(p),s.manager.itemError(e),s.manager.itemEnd(e)}function h(){o.removeEventListener("load",l,!1),o.removeEventListener("error",u,!1)}return o.addEventListener("load",l,!1),o.addEventListener("error",u,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),s.manager.itemStart(e),o.src=e,o}}class aT extends Zh{constructor(e){super(e)}load(e,n,i,r){const s=new Wt,a=new sT(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(o){s.image=o,s.needsUpdate=!0,n!==void 0&&n(s)},i,r),s}}class Ex extends Xt{constructor(e,n=1){super(),this.isLight=!0,this.type="Light",this.color=new Xe(e),this.intensity=n}dispose(){}copy(e,n){return super.copy(e,n),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const n=super.toJSON(e);return n.object.color=this.color.getHex(),n.object.intensity=this.intensity,this.groundColor!==void 0&&(n.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(n.object.distance=this.distance),this.angle!==void 0&&(n.object.angle=this.angle),this.decay!==void 0&&(n.object.decay=this.decay),this.penumbra!==void 0&&(n.object.penumbra=this.penumbra),this.shadow!==void 0&&(n.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(n.object.target=this.target.uuid),n}}const eu=new ht,gm=new F,xm=new F;class oT{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Ke(512,512),this.map=null,this.mapPass=null,this.matrix=new ht,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new $h,this._frameExtents=new Ke(1,1),this._viewportCount=1,this._viewports=[new st(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const n=this.camera,i=this.matrix;gm.setFromMatrixPosition(e.matrixWorld),n.position.copy(gm),xm.setFromMatrixPosition(e.target.matrixWorld),n.lookAt(xm),n.updateMatrixWorld(),eu.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(eu),i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(eu)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}const vm=new ht,Ys=new F,tu=new F;class lT extends oT{constructor(){super(new dn(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new Ke(4,2),this._viewportCount=6,this._viewports=[new st(2,1,1,1),new st(0,1,1,1),new st(3,1,1,1),new st(1,1,1,1),new st(3,0,1,1),new st(1,0,1,1)],this._cubeDirections=[new F(1,0,0),new F(-1,0,0),new F(0,0,1),new F(0,0,-1),new F(0,1,0),new F(0,-1,0)],this._cubeUps=[new F(0,1,0),new F(0,1,0),new F(0,1,0),new F(0,1,0),new F(0,0,1),new F(0,0,-1)]}updateMatrices(e,n=0){const i=this.camera,r=this.matrix,s=e.distance||i.far;s!==i.far&&(i.far=s,i.updateProjectionMatrix()),Ys.setFromMatrixPosition(e.matrixWorld),i.position.copy(Ys),tu.copy(i.position),tu.add(this._cubeDirections[n]),i.up.copy(this._cubeUps[n]),i.lookAt(tu),i.updateMatrixWorld(),r.makeTranslation(-Ys.x,-Ys.y,-Ys.z),vm.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse),this._frustum.setFromProjectionMatrix(vm)}}class _m extends Ex{constructor(e,n,i=0,r=2){super(e,n),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=r,this.shadow=new lT}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,n){return super.copy(e,n),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class cT extends Ex{constructor(e,n){super(e,n),this.isAmbientLight=!0,this.type="AmbientLight"}}class uT{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=ym(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const n=ym();e=(n-this.oldTime)/1e3,this.oldTime=n,this.elapsedTime+=e}return e}}function ym(){return performance.now()}const Sm=new ht;class dT{constructor(e,n,i=0,r=1/0){this.ray=new Xh(e,n),this.near=i,this.far=r,this.camera=null,this.layers=new qh,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,n){this.ray.set(e,n)}setFromCamera(e,n){n.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(n.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(n).sub(this.ray.origin).normalize(),this.camera=n):n.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(n.near+n.far)/(n.near-n.far)).unproject(n),this.ray.direction.set(0,0,-1).transformDirection(n.matrixWorld),this.camera=n):console.error("THREE.Raycaster: Unsupported camera type: "+n.type)}setFromXRController(e){return Sm.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Sm),this}intersectObject(e,n=!0,i=[]){return Hd(e,this,i,n),i.sort(wm),i}intersectObjects(e,n=!0,i=[]){for(let r=0,s=e.length;r<s;r++)Hd(e[r],this,i,n);return i.sort(wm),i}}function wm(t,e){return t.distance-e.distance}function Hd(t,e,n,i){let r=!0;if(t.layers.test(e.layers)&&t.raycast(e,n)===!1&&(r=!1),r===!0&&i===!0){const s=t.children;for(let a=0,o=s.length;a<o;a++)Hd(s[a],e,n,!0)}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Oh}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Oh);function hT({t}){const e=ae.useRef(null),n=ae.useRef(null),[i,r]=ae.useState([]),[s,a]=ae.useState(null),[o,l]=ae.useState(!1),[u,h]=ae.useState(!1),[p,f]=ae.useState(!0),g=[{id:"art-01",author:"Pyxie Core",description:"Astaroth no Portal Arcano • Ilustração oficial do Bosque Violeta.",imageUrl:"/assets/pyxie/pyxie_space_banner.jpg",createdAt:new Date().toISOString()},{id:"art-02",author:"Melody Labs",description:"O Arcano O Mago • Pintura digital inspirada nos 78 arcanos da Pyxie.",imageUrl:"/assets/pyxie/og_banner_hd.png",createdAt:new Date().toISOString()},{id:"art-03",author:"Cringelândia Art",description:"Pyxie Tsundere Rebelde • Mascote da comunidade em alta resolução.",imageUrl:"/assets/pyxie/pyxie_mascot.png",createdAt:new Date().toISOString()},{id:"art-04",author:"Pixel Guild",description:"Pixelart Nostálgica • Render retrô em 32x32 da fada gótica.",imageUrl:"/assets/pyxie/pyxie_pixelart.png",createdAt:new Date().toISOString()}];ae.useEffect(()=>{fetch("/api/museum/arts?limit=12").then(S=>S.json()).then(S=>{S&&S.success&&Array.isArray(S.arts)&&S.arts.length>0?r(S.arts):r(g)}).catch(()=>{r(g)})},[]),ae.useEffect(()=>{const S=new IntersectionObserver(m=>{m[0].isIntersecting&&h(!0)},{rootMargin:"200px"});return e.current&&S.observe(e.current),()=>S.disconnect()},[]),ae.useEffect(()=>{if(!u||!n.current||i.length===0)return;let S;try{S=new Jb({canvas:n.current,alpha:!0,antialias:!0,powerPreference:"high-performance"})}catch(R){console.warn("WebGL não suportado:",R),f(!1);return}const m=new eT;m.fog=new Kh(459789,.04);const d=new dn(50,1,.1,100);d.position.set(0,0,7.5);const _=()=>{if(!e.current||!S)return;const R=e.current.clientWidth,$e=Math.min(Math.max(R*.55,380),540);d.aspect=R/$e,d.updateProjectionMatrix(),S.setSize(R,$e),S.setPixelRatio(Math.min(window.devicePixelRatio,2))};_(),window.addEventListener("resize",_);const x=400,M=new vi,P=new Float32Array(x*3),T=new Float32Array(x*3);for(let R=0;R<x*3;R+=3){P[R]=(Math.random()-.5)*20,P[R+1]=(Math.random()-.5)*12,P[R+2]=(Math.random()-.5)*15;const $e=Math.random()>.5;T[R]=$e?.95:.55,T[R+1]=$e?.2:.35,T[R+2]=$e?.6:.95}M.setAttribute("position",new bn(P,3)),M.setAttribute("color",new bn(T,3));const A=new Mx({size:.08,vertexColors:!0,transparent:!0,opacity:.7,blending:Ju}),N=new tT(M,A);m.add(N);const H=new cT(16777215,.85);m.add(H);const y=new _m(15073383,3,20);y.position.set(0,3,5),m.add(y);const b=new _m(9133302,3,20);b.position.set(0,-3,3),m.add(b);const V=new ta;m.add(V);const j=new Ga(1.6,2.3),$=new aT,Q=[],G=4.2,Y=i.slice(0,8),L=Y.length;Y.forEach((R,$e)=>{const Ue=$e/L*Math.PI*2,Oe=Math.sin(Ue)*G,Ae=Math.cos(Ue)*G-G,rt=$.load(R.imageUrl||"/assets/pyxie/og_banner_hd.png");rt.minFilter=Sn;const Pe=new nT({map:rt,roughness:.35,metalness:.1,side:Xn}),C=new qn(j,Pe);C.position.set(Oe,0,Ae),C.rotation.y=Ue+Math.PI,C.userData={art:R,initialZ:Ae,initialY:C.rotation.y},V.add(C),Q.push(C)});let K=!1,I=0,q=.003;const fe=.95,Te=new dT,W=new Ke(-100,-100),te=R=>{K=!0,I=R.clientX||R.touches&&R.touches[0].clientX||0,q=0},le=R=>{const $e=R.clientX||R.touches&&R.touches[0].clientX||0,Ue=R.clientY||R.touches&&R.touches[0].clientY||0;if(K&&(q=($e-I)*.005,V.rotation.y+=q,I=$e),e.current){const Oe=e.current.getBoundingClientRect();W.x=($e-Oe.left)/Oe.width*2-1,W.y=-((Ue-Oe.top)/Oe.height)*2+1}},ce=()=>{K=!1},De=()=>{Te.setFromCamera(W,d);const R=Te.intersectObjects(Q);if(R.length>0){const $e=R[0].object.userData.art;$e&&a($e)}},Ce=n.current;Ce.addEventListener("pointerdown",te),window.addEventListener("pointermove",le),window.addEventListener("pointerup",ce),Ce.addEventListener("click",De);let He;const Qe=new uT,Ve=()=>{He=requestAnimationFrame(Ve);const R=Qe.getElapsedTime();K||(V.rotation.y+=q,q*=fe,Math.abs(q)<8e-4&&(q=.0018)),N.rotation.y=R*.02,N.rotation.x=Math.sin(R*.05)*.05,Te.setFromCamera(W,d);const $e=Te.intersectObjects(Q);Q.forEach(Ue=>{const Ae=$e.length>0&&$e[0].object===Ue?1.15:1;Ue.scale.lerp(new F(Ae,Ae,Ae),.1)}),S.render(m,d)};return Ve(),()=>{cancelAnimationFrame(He),window.removeEventListener("resize",_),window.removeEventListener("pointermove",le),window.removeEventListener("pointerup",ce),Ce.removeEventListener("pointerdown",te),Ce.removeEventListener("click",De),S.dispose()}},[u,i]);const v=S=>{S.preventDefault(),l(!0)};return c.jsxs("section",{id:"museu-deck",className:"relative py-16 md:py-24 overflow-hidden border-t border-purple-500/10",children:[c.jsxs("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-8",children:[c.jsxs("div",{className:"inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-bold mb-3 shadow-sm",children:[c.jsx(Dt,{className:"w-3.5 h-3.5 text-pink-400"}),c.jsx("span",{children:"The Holographic Community Deck"})]}),c.jsx("h2",{className:"font-title font-black text-3xl sm:text-4xl text-white tracking-tight",children:t("museum.title")}),c.jsx("p",{className:"text-slate-300 text-sm sm:text-base max-w-xl mx-auto mt-2",children:t("museum.subtitle")})]}),c.jsxs("div",{ref:e,onContextMenu:v,className:"art-shield relative w-full max-w-6xl mx-auto h-[380px] sm:h-[480px] lg:h-[540px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none",children:[p?c.jsx("canvas",{ref:n,className:"w-full h-full block"}):c.jsx("div",{className:"flex gap-4 overflow-x-auto px-4 py-8 w-full scrollbar-none snap-x",children:i.map(S=>c.jsxs("div",{onClick:()=>a(S),className:"shrink-0 w-64 h-88 rounded-2xl glass-panel p-3 border border-pink-500/30 snap-center cursor-pointer shadow-lg transform hover:scale-105 transition-all",children:[c.jsx("img",{src:S.imageUrl,alt:S.author||"Arte da Comunidade",className:"w-full h-64 object-cover rounded-xl"}),c.jsxs("div",{className:"mt-3 text-left",children:[c.jsxs("div",{className:"text-pink-400 font-bold text-sm",children:["@",S.author]}),c.jsx("div",{className:"text-slate-300 text-xs truncate",children:S.description})]})]},S.id))}),c.jsx("div",{className:"absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#07040D] to-transparent pointer-events-none"}),c.jsx("div",{className:"absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#07040D] to-transparent pointer-events-none"})]}),c.jsx("div",{className:"mt-8 text-center",children:c.jsxs("a",{href:"/museu",className:"inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-extrabold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-neon-violet transition-all transform hover:-translate-y-1 active:translate-y-0 border border-purple-400/30",children:[c.jsx(Dt,{className:"w-4 h-4 text-pink-300"}),c.jsx("span",{children:t("museum.exploreAll")})]})}),s&&c.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn",children:c.jsxs("div",{onContextMenu:v,className:"art-shield relative w-full max-w-2xl rounded-3xl glass-panel border border-pink-500/30 p-6 shadow-2xl overflow-hidden",children:[c.jsx("button",{onClick:()=>a(null),className:"absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all",children:c.jsx(ws,{className:"w-5 h-5"})}),c.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-6 items-center",children:[c.jsxs("div",{className:"relative rounded-2xl overflow-hidden border border-purple-500/30 shadow-neon-pink",children:[c.jsx("img",{src:s.imageUrl,alt:s.author||"Arte da Comunidade",className:"w-full h-80 object-cover pointer-events-none select-none"}),c.jsxs("div",{className:"absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-mono text-pink-300 border border-pink-500/30",children:["✦ ",s.id]})]}),c.jsxs("div",{className:"space-y-4 text-left",children:[c.jsxs("div",{children:[c.jsx("span",{className:"text-xs font-mono font-bold text-pink-400 uppercase tracking-wider",children:t("museum.author")}),c.jsxs("h3",{className:"font-title font-extrabold text-2xl text-white",children:["@",s.author]})]}),c.jsx("p",{className:"text-slate-300 text-sm leading-relaxed",children:s.description||"Obra compartilhada na galeria oficial da comunidade Pyxie."}),c.jsxs("div",{className:"pt-2 border-t border-purple-500/15 flex items-center gap-2 text-xs text-purple-300/80",children:[c.jsx(wy,{className:"w-4 h-4 text-pink-400"}),c.jsx("span",{children:new Date(s.createdAt||Date.now()).toLocaleDateString("pt-BR")})]}),c.jsx("div",{className:"pt-3",children:c.jsxs("a",{href:"/museu",className:"inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-purple-500/30 hover:border-pink-500/50 transition-all",children:[c.jsx("span",{children:"Ver no Fórum do Museu"}),c.jsx(Cy,{className:"w-3.5 h-3.5"})]})})]})]})]})}),o&&c.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn",children:c.jsxs("div",{className:"max-w-md w-full rounded-2xl glass-panel border border-pink-500/40 p-6 text-center shadow-2xl space-y-4",children:[c.jsx("div",{className:"w-12 h-12 rounded-full bg-pink-500/20 border border-pink-500/50 flex items-center justify-center mx-auto text-pink-400",children:c.jsx(Vg,{className:"w-6 h-6"})}),c.jsx("h4",{className:"font-title font-bold text-xl text-white",children:"Proteção de Propriedade Visual"}),c.jsx("p",{className:"text-slate-300 text-sm leading-relaxed",children:t("museum.artShield")}),c.jsx("button",{onClick:()=>l(!1),className:"px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-neon-pink",children:"Compreendi"})]})})]})}function fT({t}){const e=[{id:1,title:"Tarot dos 78 Arcanos & Álbum",desc:"Tire cartas dos 78 arcanos ilustrados com arte em Canvas HD, consulte oráculos diários, interpretações diretas e invertidas e complete seu álbum colecionável.",icon:Dt,iconColor:"text-pink-400",podBg:"bg-pink-500/10 border-pink-500/30"},{id:2,title:"Economia Viva & 16 Vocações",desc:"Acumule moedinhas e feijões mágicos, escolha entre 16 carreiras dinâmicas com minigames em cada turno de trabalho e escale o ranking de riqueza.",icon:Ss,iconColor:"text-amber-400",podBg:"bg-amber-500/10 border-amber-500/30"},{id:3,title:"Matrimônio, Casa & Dinâmica Familiar",desc:"Casamentos bilaterais permanentes, compra de casas, cultivo da Árvore da Vida, cofre de amor com juros e herdeiros que estagiam e trazem moedas.",icon:mr,iconColor:"text-rose-400",podBg:"bg-rose-500/10 border-rose-500/30"},{id:4,title:"Quiz & Desafios da Comunidade",desc:"Desafie seus amigos com centenas de perguntas de cultura pop, conhecimentos gerais e lógica com recompensas automáticas por agilidade e acerto.",icon:Sy,iconColor:"text-purple-400",podBg:"bg-purple-500/10 border-purple-500/30"},{id:5,title:"Minigames & Lazer Social",desc:"Dispute Jokenpô, quebre o Biscoito da Sorte, descubra afinidade no /py-ship, brinque de Quem é Mais Provável e personalize temas visuais no perfil.",icon:Ry,iconColor:"text-cyan-400",podBg:"bg-cyan-500/10 border-cyan-500/30"}];return c.jsxs("section",{id:"pilares",className:"py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-purple-500/10",children:[c.jsxs("div",{className:"text-center mb-12",children:[c.jsxs("div",{className:"inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold mb-3 shadow-sm",children:[c.jsx(Dt,{className:"w-3.5 h-3.5 text-pink-400"}),c.jsx("span",{children:"Pilares Oficiais"})]}),c.jsx("h2",{className:"font-title font-black text-3xl sm:text-4xl text-white tracking-tight",children:"Explore o Universo da Pyxie"}),c.jsx("p",{className:"text-slate-300 text-sm sm:text-base max-w-xl mx-auto mt-2",children:"Desenvolvida para transformar servidores do Discord em comunidades ativas, divertidas e engajadas."})]}),c.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",children:e.map(n=>{const i=n.icon;return c.jsx("div",{className:"rounded-3xl glass-panel border border-purple-500/20 hover:border-pink-500/50 p-6 transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-neon-pink flex flex-col justify-between",children:c.jsxs("div",{children:[c.jsx("div",{className:`w-12 h-12 rounded-2xl flex items-center justify-center border mb-5 ${n.podBg}`,children:c.jsx(i,{className:`w-6 h-6 ${n.iconColor}`})}),c.jsx("h3",{className:"font-title font-bold text-lg text-white mb-2",children:n.title}),c.jsx("p",{className:"text-slate-300 text-xs sm:text-sm leading-relaxed",children:n.desc})]})},n.id)})})]})}function pT({command:t,onSelect:e,t:n}){const[i,r]=ae.useState(!1),s=t.name||"",a=s.startsWith("/")?s:`/${s}`,o=s.replace(/^\/+/,""),l=h=>{var f;h.stopPropagation();const p=s?a:`py!${((f=t.aliases)==null?void 0:f[0])||""}`;navigator.clipboard.writeText(p),r(!0),setTimeout(()=>r(!1),2e3)},u=`cmd-${o}`;return c.jsxs("div",{id:u,onClick:()=>e&&e(t),className:"group rounded-2xl glass-panel border border-purple-500/20 hover:border-pink-500/50 p-5 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-neon-pink cursor-pointer flex flex-col justify-between relative overflow-hidden",children:[c.jsx("div",{className:"absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl group-hover:bg-pink-500/15 transition-all"}),c.jsxs("div",{className:"space-y-2.5 relative z-10",children:[c.jsxs("div",{className:"flex items-center justify-between",children:[c.jsxs("div",{className:"font-mono font-bold text-sm text-pink-400 group-hover:text-pink-300 transition-colors flex items-center gap-2",children:[c.jsx(mi,{className:"w-3.5 h-3.5 text-purple-400 group-hover:rotate-12 transition-transform"}),c.jsx("span",{children:a})]}),c.jsx("div",{className:"flex items-center gap-1.5",children:c.jsx("button",{onClick:l,className:`p-1.5 rounded-lg border text-xs transition-all flex items-center gap-1 ${i?"bg-emerald-500/20 border-emerald-500/40 text-emerald-300":"bg-white/5 border-purple-500/20 text-slate-400 group-hover:text-white group-hover:border-pink-500/30"}`,title:"Copiar comando",children:i?c.jsx(Pa,{className:"w-3.5 h-3.5 text-emerald-400"}):c.jsx(Hg,{className:"w-3.5 h-3.5"})})})]}),c.jsx("p",{className:"text-slate-300 text-xs leading-relaxed line-clamp-3",children:t.description})]}),c.jsxs("div",{className:"mt-4 pt-3 border-t border-purple-500/15 flex items-center justify-between relative z-10",children:[t.aliases&&t.aliases.length>0?c.jsxs("div",{className:"flex flex-wrap gap-1.5",children:[t.aliases.slice(0,2).map((h,p)=>c.jsxs("span",{className:"font-mono text-[11px] px-2 py-0.5 rounded-md bg-white/5 border border-purple-500/20 text-cyan-300 tracking-wider",style:{letterSpacing:"0.05em"},children:["py!",h]},p)),t.aliases.length>2&&c.jsxs("span",{className:"font-mono text-[10px] px-1.5 py-0.5 rounded text-slate-400",children:["+",t.aliases.length-2]})]}):c.jsx("span",{className:"text-[11px] text-slate-500 font-mono",children:"Slash Oficial"}),c.jsxs("span",{className:"text-[11px] font-bold text-purple-300 group-hover:text-pink-300 transition-colors flex items-center gap-0.5",children:[c.jsx("span",{children:"Detalhes"}),c.jsx(jg,{className:"w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform"})]})]})]})}function mT({command:t,lang:e="pt"}){const n=e==="en",r=(s=>{var o;const a=s.name||"";return a.includes("daily")?{color:"#E60067",title:n?"✨ Cosmic Daily Reward":"✨ Recompensa Diária Cósmica",desc:n?"You channeled the astral energy and claimed your daily coins!":"Você canalizou a energia astral e resgatou suas moedas diárias!",fields:[{name:n?"🪙 Coins":"🪙 Recompensa",value:"+100 moedas",inline:!0},{name:n?"🔥 Daily Streak":"🔥 Sequência",value:"7 dias (+25 bônus)",inline:!0}],footer:"Pyxie Bot • Discord.js v14"}:a.includes("work")||a.includes("trabalho")?{color:"#8B5CF6",title:n?"💼 Professional Shift: Alchemist":"💼 Expediente: Alquimista Místico",desc:n?"You combined the essence of the Arcane Rose with stardust. Perfect synthesis!":"Você combinou a essência da Rosa Arcana com pó estelar. Síntese perfeita!",fields:[{name:n?"💰 Earnings":"💰 Rendimento",value:"+95 moedas",inline:!0},{name:n?"⭐ Experience":"⭐ Experiência",value:"+15 XP Alquimia",inline:!0}],footer:"Pyxie Carreiras • Cooldown: 3h"}:a.includes("tarot")?{color:"#A855F7",title:n?"🔮 Daily Arcana: The Magician":"🔮 Arcano do Dia: O Mago (I)",desc:n?'"The power of creation and transmutation is alive in your hands today."':'"O poder da criação e transmutação está vivo em suas mãos hoje. Molde seu destino."',fields:[{name:n?"🧭 Orientation":"🧭 Orientação",value:n?"Upright (Direct)":"Em Pé (Direta)",inline:!0},{name:n?"⭐ Arcana Type":"⭐ Tipo de Arcano",value:n?"Major Arcana (01/22)":"Arcano Maior (01/22)",inline:!0}],footer:"Pyxie Tarot • 78 Arcanos em Canvas HD"}:a.includes("casamento")||a.includes("marry")?{color:"#EC4899",title:n?"💍 Matrimonial Bond: Pyxie & Astaroth":"💍 Laço Matrimonial: Pyxie & Astaroth",desc:n?"Eternal union blessed by the cosmic fairies under the Tree of Life.":"União eterna abençoada pelas fadas cósmicas sob a Árvore da Vida.",fields:[{name:n?"💖 Love Bar":"💖 Barra do Amor",value:"100% [██████████]",inline:!0},{name:n?"🌳 Tree Level":"🌳 Nível da Árvore",value:"Nível 3 (+30% Amor)",inline:!0}],footer:"Pyxie Matrimônio & Família"}:{color:"#3B82F6",title:`✨ ${(o=s.name)!=null&&o.startsWith("/")?s.name:`/${s.name||""}`}`,desc:s.description||(n?"Command executed successfully.":"Comando executado com sucesso."),fields:[{name:"Status",value:"✅ Operacional",inline:!0},{name:n?"Cooldown":"Recarga",value:s.cooldown?`${s.cooldown}s`:"3s",inline:!0}],footer:"Pyxie Discord Bot • 2026"}})(t);return c.jsxs("div",{className:"rounded-xl bg-[#2b2d31] border border-[#1e1f22] p-4 text-[#dbdee1] font-sans text-sm shadow-xl select-none",children:[c.jsxs("div",{className:"flex items-center gap-2.5 mb-3",children:[c.jsx("div",{className:"w-8 h-8 rounded-full overflow-hidden bg-purple-900 border border-purple-500/30 flex-shrink-0",children:c.jsx("img",{src:"/assets/pyxie/pyxie_pixelart_face.png",alt:"Pyxie Avatar",className:"w-full h-full object-contain"})}),c.jsxs("div",{className:"flex items-center gap-1.5 leading-none",children:[c.jsx("span",{className:"font-bold text-white text-sm",children:"Pyxie"}),c.jsx("span",{className:"px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#5865F2] text-white tracking-wide uppercase",children:"BOT"}),c.jsx("span",{className:"text-[11px] text-[#949ba4] ml-1",children:"hoje às 14:32"})]})]}),c.jsxs("div",{className:"rounded-lg bg-[#232428] p-3.5 pl-4 border-l-4 space-y-2.5 transition-all",style:{borderLeftColor:r.color},children:[c.jsx("h4",{className:"font-bold text-white text-sm tracking-tight",children:r.title}),c.jsx("p",{className:"text-xs text-[#dbdee1] leading-relaxed",children:r.desc}),r.fields&&r.fields.length>0&&c.jsx("div",{className:"grid grid-cols-2 gap-3 pt-1",children:r.fields.map((s,a)=>c.jsxs("div",{className:"space-y-0.5",children:[c.jsx("span",{className:"text-[11px] font-bold text-[#b5bac1] block",children:s.name}),c.jsx("span",{className:"text-xs text-white font-medium block",children:s.value})]},a))}),c.jsxs("div",{className:"pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-[#949ba4]",children:[c.jsx("span",{children:r.footer}),c.jsx("span",{className:"font-mono text-[9px] opacity-70",children:"Embed v2"})]})]})]})}function gT({command:t,onClose:e,lang:n="pt",t:i}){const[r,s]=ae.useState(!1),[a,o]=ae.useState(!1);if(!t)return null;const l=t.name||"",u=l.startsWith("/")?l:`/${l}`,h=l.replace(/^\/+/,""),p=()=>{navigator.clipboard.writeText(u),s(!0),setTimeout(()=>s(!1),2e3)},f=()=>{const g=`${window.location.origin}/wiki#${h}`;navigator.clipboard.writeText(g),o(!0),setTimeout(()=>o(!1),2e3)};return c.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in",children:c.jsxs("div",{className:"relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0e071a] border border-purple-500/30 p-6 sm:p-8 shadow-2xl space-y-6",onClick:g=>g.stopPropagation(),children:[c.jsx("button",{onClick:e,className:"absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors",title:"Fechar (ESC)",children:c.jsx(ws,{className:"w-5 h-5"})}),c.jsxs("div",{className:"space-y-2",children:[c.jsxs("div",{className:"inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 font-mono font-bold text-xs",children:[c.jsx(mi,{className:"w-3.5 h-3.5"}),c.jsx("span",{children:u})]}),c.jsx("h3",{className:"font-title font-extrabold text-2xl text-white tracking-tight",children:u}),c.jsx("p",{className:"text-slate-300 text-sm leading-relaxed",children:t.description})]}),c.jsxs("div",{className:"flex flex-wrap items-center gap-3 pt-1",children:[c.jsxs("button",{onClick:p,className:`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${r?"bg-emerald-500/20 border border-emerald-500/40 text-emerald-300":"bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-neon-pink"}`,children:[r?c.jsx(Pa,{className:"w-4 h-4 text-emerald-300"}):c.jsx(Hg,{className:"w-4 h-4"}),c.jsx("span",{children:r?"Comando Copiado! ✨":"Copiar Sintaxe"})]}),c.jsxs("button",{onClick:f,className:`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${a?"bg-emerald-500/20 border-emerald-500/40 text-emerald-300":"bg-white/5 border-purple-500/25 text-purple-200 hover:bg-white/10 hover:text-white"}`,children:[a?c.jsx(Pa,{className:"w-4 h-4 text-emerald-300"}):c.jsx(ha,{className:"w-4 h-4"}),c.jsx("span",{children:a?"Link Copiado! 🔗":"Copiar Deep Link"})]})]}),c.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white/5 border border-purple-500/15 text-xs",children:[c.jsxs("div",{className:"flex items-center gap-2.5",children:[c.jsx(Ty,{className:"w-4 h-4 text-amber-400 flex-shrink-0"}),c.jsxs("div",{children:[c.jsx("span",{className:"text-[10px] text-slate-400 uppercase tracking-wider block font-bold",children:"Cooldown"}),c.jsx("span",{className:"font-semibold text-slate-200",children:t.cooldown?`${t.cooldown}s`:"3 segundos"})]})]}),c.jsxs("div",{className:"flex items-center gap-2.5",children:[c.jsx(Gg,{className:"w-4 h-4 text-emerald-400 flex-shrink-0"}),c.jsxs("div",{children:[c.jsx("span",{className:"text-[10px] text-slate-400 uppercase tracking-wider block font-bold",children:"Permissões"}),c.jsx("span",{className:"font-semibold text-slate-200",children:"@everyone"})]})]}),c.jsxs("div",{className:"flex items-center gap-2.5",children:[c.jsx(mi,{className:"w-4 h-4 text-cyan-400 flex-shrink-0"}),c.jsxs("div",{children:[c.jsx("span",{className:"text-[10px] text-slate-400 uppercase tracking-wider block font-bold",children:"Plataforma"}),c.jsx("span",{className:"font-semibold text-slate-200",children:"Slash & Prefixo"})]})]})]}),t.aliases&&t.aliases.length>0&&c.jsxs("div",{className:"space-y-2",children:[c.jsx("span",{className:"text-xs font-bold text-slate-400 uppercase tracking-wider block",children:"Prefixos Alternativos (py!)"}),c.jsx("div",{className:"flex flex-wrap gap-2",children:t.aliases.map((g,v)=>c.jsxs("span",{className:"px-2.5 py-1 rounded-lg bg-purple-900/40 border border-purple-500/30 text-cyan-300 font-mono text-xs font-medium tracking-wider",style:{letterSpacing:"0.05em"},children:["py!",g]},v))})]}),c.jsxs("div",{className:"space-y-2 pt-2",children:[c.jsxs("div",{className:"flex items-center justify-between",children:[c.jsx("span",{className:"text-xs font-bold text-slate-400 uppercase tracking-wider",children:"Resposta Real no Discord"}),c.jsx("span",{className:"text-[11px] text-purple-400 font-mono",children:"Live Simulation"})]}),c.jsx(mT,{command:t,lang:n})]})]})})}function xT({isOpen:t,onClose:e,commands:n=[],onSelectCommand:i}){const[r,s]=ae.useState(""),[a,o]=ae.useState(0),l=ae.useRef(null);ae.useEffect(()=>{t&&(s(""),o(0),setTimeout(()=>{var h;return(h=l.current)==null?void 0:h.focus()},50))},[t]);const u=n.filter(h=>{var m,d,_,x;const p=r.toLowerCase().trim();if(!p)return!0;const f=(m=h.name)==null?void 0:m.toLowerCase().includes(p),g=(d=h.description)==null?void 0:d.toLowerCase().includes(p),v=(_=h.aliases)==null?void 0:_.some(M=>M.toLowerCase().includes(p)),S=(x=h.category)==null?void 0:x.toLowerCase().includes(p);return f||g||v||S}).slice(0,8);return ae.useEffect(()=>{if(!t)return;const h=p=>{p.key==="Escape"?e():p.key==="ArrowDown"?(p.preventDefault(),o(f=>(f+1)%Math.max(1,u.length))):p.key==="ArrowUp"?(p.preventDefault(),o(f=>(f-1+u.length)%Math.max(1,u.length))):p.key==="Enter"&&(p.preventDefault(),u[a]&&(i(u[a]),e()))};return window.addEventListener("keydown",h),()=>window.removeEventListener("keydown",h)},[t,u,a,e,i]),t?c.jsx("div",{className:"fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-fade-in",onClick:e,children:c.jsxs("div",{className:"relative w-full max-w-xl rounded-2xl bg-[#0e071a] border border-purple-500/30 shadow-2xl overflow-hidden",onClick:h=>h.stopPropagation(),children:[c.jsxs("div",{className:"flex items-center px-4 py-3.5 border-b border-purple-500/20 bg-white/5",children:[c.jsx(Fh,{className:"w-5 h-5 text-pink-400 mr-3 flex-shrink-0"}),c.jsx("input",{ref:l,type:"text",value:r,onChange:h=>{s(h.target.value),o(0)},placeholder:"Buscar comandos por nome, palavra-chave ou categoria...",className:"w-full bg-transparent text-sm text-white placeholder-slate-400 outline-none font-sans"}),c.jsx("button",{onClick:e,className:"p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors",children:c.jsx(ws,{className:"w-4 h-4"})})]}),c.jsx("div",{className:"max-h-80 overflow-y-auto p-2 divide-y divide-white/5",children:u.length>0?u.map((h,p)=>{var f;return c.jsxs("div",{onClick:()=>{i(h),e()},onMouseEnter:()=>o(p),className:`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all ${a===p?"bg-gradient-to-r from-pink-600/30 to-purple-600/30 border border-pink-500/40 text-white":"hover:bg-white/5 text-slate-300"}`,children:[c.jsxs("div",{className:"flex items-center gap-3 min-w-0",children:[c.jsx("div",{className:"w-8 h-8 rounded-lg bg-white/5 border border-purple-500/20 flex items-center justify-center text-pink-400 flex-shrink-0",children:c.jsx(mi,{className:"w-4 h-4"})}),c.jsxs("div",{className:"min-w-0",children:[c.jsx("span",{className:"font-mono font-bold text-sm text-white block truncate",children:(f=h.name)!=null&&f.startsWith("/")?h.name:`/${h.name||""}`}),c.jsx("span",{className:"text-xs text-slate-400 truncate block",children:h.description})]})]}),c.jsxs("div",{className:"flex items-center gap-2 flex-shrink-0 ml-3",children:[h.aliases&&h.aliases[0]&&c.jsxs("span",{className:"hidden sm:inline-block font-mono text-[10px] px-2 py-0.5 rounded bg-white/5 text-cyan-300",children:["py!",h.aliases[0]]}),c.jsx(Ay,{className:"w-4 h-4 text-purple-400 opacity-60"})]})]},h.name||p)}):c.jsxs("div",{className:"p-8 text-center text-slate-400 text-sm",children:['Nenhum comando encontrado para "',r,'".']})}),c.jsxs("div",{className:"px-4 py-2.5 bg-black/40 border-t border-purple-500/15 flex items-center justify-between text-[11px] text-slate-400 font-mono",children:[c.jsxs("div",{className:"flex items-center gap-3",children:[c.jsx("span",{children:"↑↓ Navegar"}),c.jsx("span",{children:"↵ Abrir Detalhes"})]}),c.jsx("span",{children:"ESC para fechar"})]})]})}):null}function bx({t,lang:e}){var S;const[n,i]=ae.useState([]),[r,s]=ae.useState("todos"),[a,o]=ae.useState(""),[l,u]=ae.useState(null),[h,p]=ae.useState(!1);ae.useEffect(()=>{fetch(`/api/commands?lang=${e}`).then(m=>m.json()).then(m=>{if(m&&m.success&&Array.isArray(m.modules)){const d=m.modules.filter(_=>_.commands&&_.commands.length>0);i(d)}}).catch(m=>console.error("Erro ao buscar comandos:",m))},[e]),ae.useEffect(()=>{const m=d=>{(d.metaKey||d.ctrlKey)&&d.key==="k"&&(d.preventDefault(),p(!0))};return window.addEventListener("keydown",m),()=>window.removeEventListener("keydown",m)},[]),ae.useEffect(()=>{if(n.length===0)return;const m=window.location.hash.replace("#","").toLowerCase();if(!m)return;const _=n.flatMap(x=>x.commands||[]).find(x=>{var M,P;return((M=x.name)==null?void 0:M.toLowerCase())===m||`py-${x.name}`.toLowerCase()===m||((P=x.aliases)==null?void 0:P.some(T=>T.toLowerCase()===m))});if(_){u(_);const x=(_.name||"").replace(/^\/+/,""),M=document.getElementById(`cmd-${x}`)||document.getElementById(`cmd-${_.name}`);M&&setTimeout(()=>M.scrollIntoView({behavior:"smooth",block:"center"}),300)}},[n]);const f=n.flatMap(m=>m.commands||[]),v=(r==="todos"?f:((S=n.find(m=>m.id===r))==null?void 0:S.commands)||[]).filter(m=>{var P,T,A;const d=a.toLowerCase(),_=(P=m.name)==null?void 0:P.toLowerCase().includes(d),x=(T=m.description)==null?void 0:T.toLowerCase().includes(d),M=(A=m.aliases)==null?void 0:A.some(N=>N.toLowerCase().includes(d));return _||x||M});return c.jsxs("section",{id:"comandos",className:"py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:[c.jsxs("div",{className:"text-center mb-10",children:[c.jsxs("div",{className:"inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold mb-3 shadow-sm",children:[c.jsx(Na,{className:"w-3.5 h-3.5 text-pink-400"}),c.jsx("span",{children:"Guia Completo & Documentação Oficial"})]}),c.jsx("h2",{className:"font-title font-black text-3xl sm:text-5xl text-white tracking-tight",children:t("wiki.title")}),c.jsx("p",{className:"text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mt-3",children:t("wiki.subtitle")})]}),c.jsx("div",{className:"max-w-2xl mx-auto mb-8 relative",children:c.jsxs("div",{onClick:()=>p(!0),className:"relative flex items-center cursor-pointer group",children:[c.jsx(Fh,{className:"absolute left-4 w-5 h-5 text-slate-400 group-hover:text-pink-400 transition-colors pointer-events-none"}),c.jsx("input",{type:"text",readOnly:!0,value:a,onClick:()=>p(!0),placeholder:t("wiki.searchPlaceholder"),className:"w-full pl-12 pr-24 py-3.5 rounded-2xl bg-white/5 border border-purple-500/25 group-hover:border-pink-500/60 text-sm text-white placeholder-slate-400 outline-none backdrop-blur-xl transition-all shadow-lg cursor-pointer"}),c.jsxs("div",{className:"absolute right-3.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-[11px] font-mono font-bold text-slate-300 flex items-center gap-1",children:[c.jsx("span",{children:"Ctrl"}),c.jsx("span",{children:"K"})]})]})}),c.jsxs("div",{className:"flex flex-wrap items-center justify-center gap-2 mb-10",children:[c.jsxs("button",{onClick:()=>s("todos"),className:`px-4 py-2 rounded-xl text-xs font-bold transition-all ${r==="todos"?"bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-neon-pink scale-105":"bg-white/5 border border-purple-500/20 text-slate-300 hover:bg-white/10 hover:text-white"}`,children:["Todos (",f.length,")"]}),n.map(m=>{var d;return c.jsxs("button",{onClick:()=>s(m.id),className:`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${r===m.id?"bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-neon-pink scale-105":"bg-white/5 border border-purple-500/20 text-slate-300 hover:bg-white/10 hover:text-white"}`,children:[c.jsx("span",{children:m.title||m.name}),c.jsxs("span",{className:"text-[10px] opacity-75 font-mono",children:["(",((d=m.commands)==null?void 0:d.length)||0,")"]})]},m.id)})]}),v.length>0?c.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5",children:v.map(m=>c.jsx(pT,{command:m,onSelect:d=>u(d),t},m.name))}):c.jsx("div",{className:"text-center py-16 text-slate-400 text-sm",children:"Nenhum comando encontrado para esta categoria."}),c.jsx(xT,{isOpen:h,onClose:()=>p(!1),commands:f,onSelectCommand:m=>u(m)}),l&&c.jsx(gT,{command:l,onClose:()=>u(null),lang:e,t})]})}function Tx({t,lang:e}){const[n,i]=ae.useState([]),r=[{id:"23798670825",titulo:"Kuromi Sanrio Boneca de pelúcia fofa 25cm Kuromi Sanrio",titulo_en:"Kuromi Sanrio 25cm Cute Plush Doll",preco:"R$ 55,99",preco_en:"$10.77",tag:"Pelúcia Sanrio",tag_en:"Sanrio Plush",link:"https://s.shopee.com.br/1BMdNQEU79",imagem:"https://down-br.img.susercontent.com/file/br-11134207-7r98o-mbe0k65jvlov9d"},{id:"58265449372",titulo:"Camiseta Feminina Premium Hello Kitty Kuromi 100% Algodão",titulo_en:"Premium Hello Kitty Kuromi 100% Cotton Women T-Shirt",preco:"R$ 34,90",preco_en:"$6.71",tag:"Moda & Estilo",tag_en:"Fashion & Goth",link:"https://s.shopee.com.br/1AfzHIvTw",imagem:"https://down-br.img.susercontent.com/file/sg-11134201-8257t-mrez4efi09vpc3"},{id:"28812198611",titulo:"EEBR Vintage Goth Espinhos Casal Anéis Para Homens Mulheres",titulo_en:"Vintage Goth Thorn Couple Rings for Men & Women",preco:"R$ 12,06",preco_en:"$2.32",tag:"Acessório Goth",tag_en:"Goth Jewelry",link:"https://s.shopee.com.br/LnWNtHeo2",imagem:"https://down-br.img.susercontent.com/file/sg-11134201-7rdy7-m0j7wbk9ta7y39"},{id:"58212898323",titulo:"Anel gótico camafeu roxo pedra roxa oval moldura ornamental",titulo_en:"Gothic Purple Cameo Ring with Oval Stone",preco:"R$ 29,90",preco_en:"$5.75",tag:"Acessório Goth",tag_en:"Goth Jewelry",link:"https://s.shopee.com.br/W6waCH1T5",imagem:"https://down-br.img.susercontent.com/file/br-11134207-820ly-mppd70swjy81c9"}];ae.useEffect(()=>{fetch("/api/showcase").then(a=>a.json()).then(a=>{a&&a.success&&Array.isArray(a.items)&&a.items.length>0?i(a.items.slice(0,4)):i(r)}).catch(()=>{fetch("/api/shopee/showcase").then(a=>a.json()).then(a=>{a&&a.success&&Array.isArray(a.items)&&a.items.length>0?i(a.items.slice(0,4)):i(r)}).catch(()=>i(r))})},[]);const s=e==="pt";return c.jsx("section",{className:"py-16 md:py-24 border-t border-purple-500/10 relative",children:c.jsxs("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:[c.jsxs("div",{className:"text-center mb-12",children:[c.jsxs("div",{className:"inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-3 shadow-sm",children:[c.jsx(Fy,{className:"w-3.5 h-3.5 text-amber-400"}),c.jsx("span",{children:"Setup & Lifestyle"})]}),c.jsx("h2",{className:"font-title font-black text-3xl sm:text-4xl text-white tracking-tight",children:t("shopee.title")}),c.jsx("p",{className:"text-slate-300 text-sm sm:text-base max-w-xl mx-auto mt-2",children:t("shopee.subtitle")})]}),c.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6",children:n.map((a,o)=>{const l=s?a.titulo:a.titulo_en||a.titulo,u=s?a.preco:a.preco_en||a.preco,h=s?a.tag:a.tag_en||a.tag;return c.jsxs("a",{href:a.link||"/promo",target:"_blank",rel:"noopener noreferrer",className:"group rounded-3xl glass-panel border border-purple-500/20 hover:border-pink-500/50 p-4 transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-neon-pink flex flex-col justify-between overflow-hidden",children:[c.jsxs("div",{className:"relative rounded-2xl overflow-hidden aspect-square mb-4 bg-purple-950/40",children:[c.jsx("img",{src:a.imagem,alt:l,className:"w-full h-full object-cover group-hover:scale-105 transition-transform duration-500",loading:"lazy"}),c.jsxs("div",{className:"absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[11px] font-bold text-pink-300 border border-pink-500/30 flex items-center gap-1",children:[c.jsx(Oy,{className:"w-3 h-3 text-pink-400"}),c.jsx("span",{children:h})]})]}),c.jsxs("div",{className:"space-y-2",children:[c.jsx("h3",{className:"font-title font-bold text-sm text-slate-100 group-hover:text-pink-300 transition-colors line-clamp-2",children:l}),c.jsxs("div",{className:"flex items-center justify-between pt-2 border-t border-purple-500/15",children:[c.jsx("span",{className:"font-title font-black text-lg text-amber-300",children:u}),c.jsx("span",{className:"text-xs font-bold text-slate-300 group-hover:text-white flex items-center gap-1",children:t("shopee.cta")})]})]})]},a.id||o)})})]})})}function vT({t,lang:e,stats:n}){return c.jsxs("div",{className:"space-y-6",children:[c.jsx(Ky,{t,stats:n}),c.jsx(hT,{t}),c.jsx(fT,{t}),c.jsx(bx,{t,lang:e}),c.jsx(Tx,{t,lang:e})]})}function _T({t,lang:e}){const n=e==="en",[i,r]=ae.useState(()=>{const o=window.location.hash.toLowerCase();return o.includes("comando")||o.includes("cmd")||o.includes("py-")?"commands":o.includes("eco")||o.includes("moeda")?"economy":o.includes("trabalho")||o.includes("carreira")||o.includes("vocacao")?"careers":o.includes("tarot")||o.includes("album")||o.includes("arcano")?"tarot":o.includes("casamento")||o.includes("social")||o.includes("familia")?"marriage":o.includes("faq")||o.includes("duvida")?"faq":"overview"});ae.useEffect(()=>{document.title=n?"Pyxie Official Wiki & Community Guide | Discord Bot":"Wiki Oficial & Enciclopédia da Pyxie | Discord Bot"},[n]),ae.useEffect(()=>{const o=()=>{const l=window.location.hash.toLowerCase();l.includes("comando")||l.includes("cmd")||l.includes("py-")?r("commands"):l.includes("eco")||l.includes("moeda")?r("economy"):l.includes("trabalho")||l.includes("carreira")?r("careers"):l.includes("tarot")||l.includes("album")?r("tarot"):l.includes("casamento")||l.includes("social")?r("marriage"):l.includes("faq")&&r("faq")};return window.addEventListener("hashchange",o),()=>window.removeEventListener("hashchange",o)},[]);const s=[{id:"overview",label:n?"Community & Sanctuary":"Comunidade & Santuário",icon:Zu,badge:"Lore"},{id:"economy",label:n?"Living Economy":"Economia Viva",icon:Ss,badge:"Coins"},{id:"careers",label:n?"16 Vocations & Work":"16 Vocações & Trabalho",icon:da,badge:"Minigames"},{id:"tarot",label:n?"78 Arcana Tarot":"Tarot dos 78 Arcanos",icon:Dt,badge:"HD Canvas"},{id:"marriage",label:n?"Marriage & Family":"Casamento & Família",icon:mr,badge:"Social"},{id:"commands",label:n?"Commands Catalog":"Catálogo de Comandos",icon:mi,badge:"Ctrl+K"},{id:"faq",label:n?"FAQ & Help":"Dúvidas & FAQ",icon:by,badge:"Guia"}],a=n?[{q:"How do I add Pyxie to my Discord server?",a:'Click on the "Add Pyxie" button in the navbar or visit /invite to authorize Pyxie with slash commands and message attachments permissions.'},{q:"Do slash commands work in all channels?",a:"Yes, unless server administrators restrict command permissions in Server Settings > Integrations."},{q:"What is the daily economy reset time?",a:"Daily rewards (/py-daily) reset every 24 hours per user. Daily streaks have a 48h grace window."},{q:"Are all 78 Tarot cards available in the Album?",a:"Yes! All 22 Major Arcana and 56 Minor Arcana can be collected, viewed, and shared in HD via /py-album."},{q:"How does the Marriage Tree of Life work?",a:"Married partners can water the Tree of Life every 12h, granting +10% love and unlocking permanent rewards."},{q:"Is Pyxie completely free to use?",a:"100% free! All economic commands, minigames, tarot cards, and careers are accessible without any paywalls."}]:[{q:"Como adiciono a Pyxie ao meu servidor?",a:'Basta clicar no botão "Adicionar Pyxie" no topo da página ou acessar /invite para conceder permissões de comandos slash.'},{q:"Os comandos funcionam por barra (/) e prefixo (py!)?",a:"Sim! Todos os comandos possuem registro oficial por barra no Discord e aliases por prefixo py! correspondentes."},{q:"Como funciona o Álbum de Tarot dos 78 Arcanos?",a:"Ao tirar sua carta do dia (/py-tarot), você pode colá-la no seu álbum (/py-album). Colecionar cartas desbloqueia conquistas e moedinhas!"},{q:"Como evoluir o casamento no bot?",a:"Após casar (/py-casamento), você e seu cônjuge podem regar a Árvore da Vida a cada 12h, depositar no Cofre do Casal e ter encontros românticos!"},{q:"Com que frequência posso trabalhar?",a:"O expediente (/py-work) tem recarga de 3 horas. Cada profissão possui minigames técnicos com perguntas interativas de 45 segundos."},{q:"A Pyxie é totalmente gratuita?",a:"Sim! Todos os 37 comandos, sistemas de economia, minigames, tarot e casamento são 100% acessíveis e gratuitos."}];return c.jsxs("div",{className:"min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12",children:[c.jsxs("div",{className:"text-center space-y-4 max-w-3xl mx-auto",children:[c.jsxs("div",{className:"inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold shadow-sm",children:[c.jsx(Na,{className:"w-3.5 h-3.5 text-pink-400"}),c.jsx("span",{children:n?"Official Documentation • Pyxie & Cringelândia":"Enciclopédia Oficial • Pyxie & Cringelândia"})]}),c.jsx("h1",{className:"font-title font-black text-3xl sm:text-5xl md:text-6xl bg-gradient-to-r from-white via-pink-200 to-purple-300 bg-clip-text text-transparent tracking-tight",children:n?"Official Guide & Interactive Wiki":"Guia Oficial & Enciclopédia Interativa"}),c.jsx("p",{className:"text-slate-300 text-sm sm:text-base leading-relaxed",children:n?"Explore deep documentation for Pyxie: live economy, 16 careers, 78 Tarot Arcana, marriage dynamics and command catalog.":"Explore explicações detalhadas sobre a economia mágica, 16 vocações profissionais, o oráculo de tarot dos 78 arcanos, matrimônio e comandos oficiais."}),c.jsxs("div",{className:"flex flex-wrap items-center justify-center gap-3 pt-2",children:[c.jsxs("span",{className:"px-3 py-1 rounded-xl bg-white/5 border border-purple-500/20 text-xs font-mono text-pink-300 flex items-center gap-1.5",children:[c.jsx(Dt,{className:"w-3 h-3"})," 78 Arcanos em HD"]}),c.jsxs("span",{className:"px-3 py-1 rounded-xl bg-white/5 border border-purple-500/20 text-xs font-mono text-purple-300 flex items-center gap-1.5",children:[c.jsx(da,{className:"w-3 h-3"})," 16 Vocações Únicas"]}),c.jsxs("span",{className:"px-3 py-1 rounded-xl bg-white/5 border border-purple-500/20 text-xs font-mono text-emerald-300 flex items-center gap-1.5",children:[c.jsx(_p,{className:"w-3 h-3"})," 100% Gratuita & Segura"]}),c.jsxs("span",{className:"px-3 py-1 rounded-xl bg-white/5 border border-purple-500/20 text-xs font-mono text-amber-300 flex items-center gap-1.5",children:[c.jsx(Gy,{className:"w-3 h-3"})," Bilíngue PT-BR & EN"]})]})]}),c.jsx("div",{className:"flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-purple-500/20",children:s.map(o=>{const l=o.icon,u=i===o.id;return c.jsxs("button",{onClick:()=>{r(o.id),window.location.hash=o.id==="commands"?"comandos":o.id},className:`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${u?"bg-gradient-to-r from-pink-600 to-purple-600 text-white border-pink-400/50 shadow-neon-pink":"bg-white/5 border-purple-500/15 text-slate-300 hover:text-white hover:bg-white/10"}`,children:[c.jsx(l,{className:`w-4 h-4 ${u?"text-white":"text-purple-400"}`}),c.jsx("span",{children:o.label}),o.badge&&c.jsx("span",{className:`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${u?"bg-black/30 text-pink-200":"bg-purple-500/20 text-purple-300"}`,children:o.badge})]},o.id)})}),i==="overview"&&c.jsx("div",{className:"space-y-8 animate-fadeIn",children:c.jsxs("div",{className:"p-6 sm:p-8 rounded-3xl glass-panel border border-purple-500/20 space-y-6",children:[c.jsxs("div",{className:"flex items-center gap-3",children:[c.jsx("div",{className:"p-3 rounded-2xl bg-pink-500/15 text-pink-400 border border-pink-500/30",children:c.jsx(Zu,{className:"w-6 h-6"})}),c.jsxs("div",{children:[c.jsx("h2",{className:"font-title font-extrabold text-2xl sm:text-3xl text-white",children:n?"A Welcoming Sanctuary for Neurodivergent Minds":"Um Santuário para Mentes Neurodivergentes"}),c.jsx("p",{className:"text-slate-400 text-xs sm:text-sm",children:n?"Compassionate community culture & safe haven on Discord":"Cultura comunitária, empatia e ambiente acolhedor"})]})]}),c.jsx("p",{className:"text-slate-200 text-sm sm:text-base leading-relaxed",children:n?"The official Pyxie community (Cringelândia) was created to be a warm, gentle, and judgment-free home. We proudly embrace neurodivergent individuals — autistic people (ASD), ADHD, bipolarity, depression, anxiety, and unique perception styles. Special interests (hyperfocus), creative minds, and honest conversations are celebrated.":"A comunidade oficial da Pyxie (Cringelândia) nasceu com um propósito genuíno: ser um porto seguro, caloroso e livre de julgamentos. Abrigamos com orgulho mentes neurodivergentes — pessoas no espectro autista (TEA), TDAH, bipolaridade, depressão, ansiedade e hiperfocos. Acreditamos que quem enxerga o mundo por ângulos singulares enriquece profundamente a nossa vivência."}),c.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4 pt-2",children:[c.jsxs("div",{className:"p-4 rounded-2xl bg-white/5 border border-purple-500/15 space-y-2",children:[c.jsxs("div",{className:"flex items-center gap-2 text-pink-300 font-title font-bold text-sm",children:[c.jsx(_p,{className:"w-4 h-4 text-pink-400"}),c.jsx("span",{children:n?"Zero Tolerance for Ableism":"Tolerância Zero contra Capacitismo"})]}),c.jsx("p",{className:"text-xs text-slate-300 leading-relaxed",children:n?"Hostility, harassment, mockery, or disrespect towards neurodivergent traits result in swift and irrevocable removal.":"Preconceito, piadas de mau gosto ou qualquer hostilidade contra características neurodivergentes resultam em banimento imediato."})]}),c.jsxs("div",{className:"p-4 rounded-2xl bg-white/5 border border-purple-500/15 space-y-2",children:[c.jsxs("div",{className:"flex items-center gap-2 text-purple-300 font-title font-bold text-sm",children:[c.jsx(mr,{className:"w-4 h-4 text-purple-400"}),c.jsx("span",{children:n?"Respect for Autistic Creators":"Proteção à Arte e Expressão"})]}),c.jsx("p",{className:"text-xs text-slate-300 leading-relaxed",children:n?"Member artwork in the Museum is protected by community copyright. Creative projects and personal boundaries are safeguarded.":"Obras compartilhadas no Museu possuem proteção visual contra cópia indevida. Respeitamos a autoria e os limites de cada criador."})]})]}),c.jsxs("div",{className:"space-y-3 pt-4",children:[c.jsxs("h3",{className:"font-title font-bold text-lg text-white flex items-center gap-2",children:[c.jsx(Bg,{className:"w-4 h-4 text-pink-400"}),c.jsx("span",{children:n?"One-Word Identity Roles":"Cargos Concisos de Uma Palavra"})]}),c.jsx("p",{className:"text-xs text-slate-400",children:n?"In our guild, community roles honor individuality without bureaucratic titles:":"Nossos cargos comunitários adotam títulos elegantes e poéticos que traduzem a energia de cada membro:"}),c.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-3 gap-3",children:[c.jsxs("div",{className:"p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20",children:[c.jsx("span",{className:"font-mono font-bold text-pink-400 text-sm",children:"Peculiar"}),c.jsx("p",{className:"text-xs text-slate-300 mt-1",children:n?"For minds with authentic and unique perspectives.":"Para mentes que enxergam a vida com autenticidade única."})]}),c.jsxs("div",{className:"p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20",children:[c.jsx("span",{className:"font-mono font-bold text-purple-400 text-sm",children:"Mágico"}),c.jsx("p",{className:"text-xs text-slate-300 mt-1",children:n?"For those who bring creativity and joy to daily talks.":"Para quem traz encantamento, ideias e boas energias."})]}),c.jsxs("div",{className:"p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20",children:[c.jsx("span",{className:"font-mono font-bold text-amber-400 text-sm",children:"Travesso"}),c.jsx("p",{className:"text-xs text-slate-300 mt-1",children:n?"Playful spirit reflecting Pyxie’s rebel energy.":"O espírito rebelde e divertido da própria Pyxie."})]})]})]})]})}),i==="economy"&&c.jsx("div",{className:"space-y-6 animate-fadeIn",children:c.jsxs("div",{className:"p-6 sm:p-8 rounded-3xl glass-panel border border-purple-500/20 space-y-6",children:[c.jsxs("div",{className:"flex items-center gap-3",children:[c.jsx("div",{className:"p-3 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30",children:c.jsx(Ss,{className:"w-6 h-6"})}),c.jsxs("div",{children:[c.jsx("h2",{className:"font-title font-extrabold text-2xl sm:text-3xl text-white",children:n?"Living Economy: Coins, Magic Beans & Vaults":"Economia Viva: Moedinhas, Feijões e Cofres"}),c.jsx("p",{className:"text-slate-400 text-xs sm:text-sm",children:n?"Dual-currency mechanics, inventory, market and daily earnings":"Duas moedas, inventário, mercado e rendimentos diários"})]})]}),c.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-5",children:[c.jsxs("div",{className:"p-5 rounded-2xl bg-white/5 border border-purple-500/15 space-y-3",children:[c.jsxs("div",{className:"flex items-center gap-2 text-amber-300 font-title font-bold text-base",children:[c.jsx("span",{children:"🪙"}),c.jsx("span",{children:n?"Moedinhas (Gold Coins)":"Moedinhas Mágicas"})]}),c.jsx("p",{className:"text-xs text-slate-300 leading-relaxed",children:n?"The primary currency used for day-to-day shopping, career shifts, wedding rings, gifts, and games. Earned via /py-daily, /py-work shifts, and Tarot album milestones.":"A moeda principal para compras na loja, salários de profissão, alianças de casamento, minigames e presentes. Obtida no /py-daily, nos turnos de /py-work e no portal de bônus web."}),c.jsx("div",{className:"font-mono text-[11px] text-pink-300 bg-black/40 px-3 py-1.5 rounded-lg border border-pink-500/20",children:"/py-carteira • /py-daily • /py-loja"})]}),c.jsxs("div",{className:"p-5 rounded-2xl bg-white/5 border border-purple-500/15 space-y-3",children:[c.jsxs("div",{className:"flex items-center gap-2 text-emerald-300 font-title font-bold text-base",children:[c.jsx("span",{children:"🫘"}),c.jsx("span",{children:n?"Feijões Mágicos (Rare Beans)":"Feijões Mágicos Raros"})]}),c.jsx("p",{className:"text-xs text-slate-300 leading-relaxed",children:n?"Rare, precious mystical beans required for advanced career promotions, Arcane Bribes in the Tarot Album, and special relics.":"A moeda sagrada e rara necessária para promoções nos escalões mais altos de carreira, subornos arcanos de cartas no Álbum de Tarot e artefatos lendários."}),c.jsx("div",{className:"font-mono text-[11px] text-emerald-300 bg-black/40 px-3 py-1.5 rounded-lg border border-emerald-500/20",children:"/py-work • /py-suborno • Recompensas de Streaks"})]})]}),c.jsxs("div",{className:"p-5 rounded-2xl bg-gradient-to-r from-pink-950/40 via-purple-950/40 to-indigo-950/40 border border-pink-500/30 flex flex-col sm:flex-row items-center justify-between gap-4",children:[c.jsxs("div",{className:"space-y-1 text-left",children:[c.jsxs("h4",{className:"font-title font-bold text-white text-sm flex items-center gap-2",children:[c.jsx(Dt,{className:"w-4 h-4 text-pink-400"}),c.jsx("span",{children:n?"Daily 10-Second Web Reward Portal":"Bônus Mágico Web de 10 Segundos"})]}),c.jsx("p",{className:"text-xs text-slate-300",children:n?"Claim extra coins daily through the secure waiting portal in 10 seconds!":"Ganhe moedinhas adicionais todos os dias aguardando 10 segundos no portal oficial de recompensas!"})]}),c.jsx("a",{href:"/bonus",className:"px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-neon-pink whitespace-nowrap transition-all",children:n?"Claim 10s Bonus ➔":"Resgatar Bônus 10s ➔"})]})]})}),i==="careers"&&c.jsx("div",{className:"space-y-6 animate-fadeIn",children:c.jsxs("div",{className:"p-6 sm:p-8 rounded-3xl glass-panel border border-purple-500/20 space-y-6",children:[c.jsxs("div",{className:"flex items-center gap-3",children:[c.jsx("div",{className:"p-3 rounded-2xl bg-purple-500/15 text-purple-400 border border-purple-500/30",children:c.jsx(da,{className:"w-6 h-6"})}),c.jsxs("div",{children:[c.jsx("h2",{className:"font-title font-extrabold text-2xl sm:text-3xl text-white",children:n?"16 Unique Vocations & 45s Technical Minigames":"16 Carreiras Únicas & Minigames de 45s"}),c.jsx("p",{className:"text-slate-400 text-xs sm:text-sm",children:n?"Interactive questions every 3 hours, career promotions and XP":"Perguntas técnicas a cada 3h, hierarquia salarial e XP"})]})]}),c.jsx("p",{className:"text-slate-200 text-sm sm:text-base leading-relaxed",children:n?"Every 3 hours, you can clock in with /py-work. Each of the 16 careers features a custom thematic challenge with 45-second timer. Correct choices grant bonuses, XP, and unlock senior promotions with higher salaries!":"A cada 3 horas você pode bater ponto com o comando /py-work. Cada uma das 16 vocações possui desafios técnicos imersivos com cronômetro de 45 segundos. Acertos perfeitos garantem bônus salariais, XP de carreira e abrem caminho para promoções de alto nível!"}),c.jsx("div",{className:"grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2",children:[{name:"Alquimista Místico",icon:"🧪",desc:"Poções & Transmutação"},{name:"Guarda da Penumbra",icon:"🛡️",desc:"Defesa & Sentinela"},{name:"Bibliotecário Astral",icon:"📜",desc:"Grimórios & Histórias"},{name:"Ferreiro Rúnico",icon:"⚒️",desc:"Forja & Runas Arcanas"},{name:"Chef Confeiteiro",icon:"🧁",desc:"Doces & Encantamentos"},{name:"Herbalista Fada",icon:"🌿",desc:"Plantas Raras & Ervas"},{name:"Astrólogo Cósmico",icon:"🔭",desc:"Constelações & Mapas"},{name:"Detetive Arcano",icon:"🔍",desc:"Enigmas & Mistérios"},{name:"Domador de Sombras",icon:"🦇",desc:"Familires & Morcegos"},{name:"Bardo Encantado",icon:"🪕",desc:"Canções & Lendas"},{name:"Necromante Amigável",icon:"💀",desc:"Almas & Crânios Fofos"},{name:"Navegador Estelar",icon:"🌌",desc:"Rotas pelo Espaço"},{name:"Costureiro Gótico",icon:"🧵",desc:"Roupas Punk & Fitas"},{name:"Mercador Nômade",icon:"🪙",desc:"Trocas & Negócios"},{name:"Cultivador de Cristais",icon:"💎",desc:"Gemas de Mana"},{name:"Guardião de Portais",icon:"🌀",desc:"Fendas Dimensionais"}].map((o,l)=>c.jsxs("div",{className:"p-3 rounded-2xl bg-white/5 border border-purple-500/15 hover:border-pink-500/30 transition-all",children:[c.jsx("span",{className:"text-xl",children:o.icon}),c.jsx("div",{className:"font-title font-bold text-xs text-white mt-1",children:o.name}),c.jsx("div",{className:"text-[10px] text-slate-400 truncate",children:o.desc})]},l))}),c.jsx("div",{className:"pt-2 text-center",children:c.jsx("span",{className:"text-xs font-mono text-purple-300",children:n?"Commands: /py-profissao • /py-work":"Comandos: /py-profissao (escolher) • /py-work (trabalhar)"})})]})}),i==="tarot"&&c.jsx("div",{className:"space-y-6 animate-fadeIn",children:c.jsxs("div",{className:"p-6 sm:p-8 rounded-3xl glass-panel border border-purple-500/20 space-y-6",children:[c.jsxs("div",{className:"flex items-center gap-3",children:[c.jsx("div",{className:"p-3 rounded-2xl bg-pink-500/15 text-pink-400 border border-pink-500/30",children:c.jsx(Dt,{className:"w-6 h-6"})}),c.jsxs("div",{children:[c.jsx("h2",{className:"font-title font-extrabold text-2xl sm:text-3xl text-white",children:n?"The 78 Tarot Arcana & Collector’s Album":"Tarot dos 78 Arcanos & Álbum Colecionável"}),c.jsx("p",{className:"text-slate-400 text-xs sm:text-sm",children:n?"Daily oracle readings, HD canvas generation, achievements and bribes":"Tiragens diárias, renderização em canvas HD e álbum com suborno"})]})]}),c.jsx("p",{className:"text-slate-200 text-sm sm:text-base leading-relaxed",children:n?"Draw your daily guidance with /py-tarot! Each card is generated dynamically in HD canvas with mystical interpretations. Stick your card into your personal album (/py-album) to build your collection, unlock achievements, and use Arcane Bribes for missing cards.":"Consulte a sabedoria do oráculo com /py-tarot! Cada tiragem gera uma carta em alta resolução com reflexões para o seu dia. Cole sua carta no seu Álbum Colecionável (/py-album) para completar os 22 Arcanos Maiores e 56 Menores, ganhando conquistas exclusivas e moedinhas!"}),c.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2",children:[c.jsxs("div",{className:"p-4 rounded-2xl bg-white/5 border border-purple-500/15 space-y-2",children:[c.jsx("div",{className:"text-pink-400 font-title font-bold text-sm",children:"🔮 Tiragem Diária"}),c.jsx("p",{className:"text-xs text-slate-300",children:n?"1 free card draw every 24h with personalized insight.":"1 tiragem gratuita por dia com reflexão inspiradora."}),c.jsx("div",{className:"font-mono text-[10px] text-purple-300",children:"/py-tarot"})]}),c.jsxs("div",{className:"p-4 rounded-2xl bg-white/5 border border-purple-500/15 space-y-2",children:[c.jsx("div",{className:"text-purple-400 font-title font-bold text-sm",children:"📖 Álbum de Coleção"}),c.jsx("p",{className:"text-xs text-slate-300",children:n?"Organize your cards and showcase your public web deck.":"Cole suas cartas, consulte estatísticas e exiba seu perfil web."}),c.jsx("div",{className:"font-mono text-[10px] text-purple-300",children:"/py-album"})]}),c.jsxs("div",{className:"p-4 rounded-2xl bg-white/5 border border-purple-500/15 space-y-2",children:[c.jsx("div",{className:"text-amber-400 font-title font-bold text-sm",children:"💰 Suborno Arcano"}),c.jsx("p",{className:"text-xs text-slate-300",children:n?"Spend magic beans to summon a guaranteed missing card!":"Gaste Feijões Mágicos para invocar cartas faltantes no álbum!"}),c.jsx("div",{className:"font-mono text-[10px] text-purple-300",children:"/py-suborno"})]})]})]})}),i==="marriage"&&c.jsx("div",{className:"space-y-6 animate-fadeIn",children:c.jsxs("div",{className:"p-6 sm:p-8 rounded-3xl glass-panel border border-purple-500/20 space-y-6",children:[c.jsxs("div",{className:"flex items-center gap-3",children:[c.jsx("div",{className:"p-3 rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/30",children:c.jsx(mr,{className:"w-6 h-6"})}),c.jsxs("div",{children:[c.jsx("h2",{className:"font-title font-extrabold text-2xl sm:text-3xl text-white",children:n?"Marriage, Family & Social Dynamics":"Matrimônio, Família & Dinâmica Social"}),c.jsx("p",{className:"text-slate-400 text-xs sm:text-sm",children:n?"Tree of life, shared bank vault, romantic dates and children":"Árvore da vida, cofre conjunto, encontros românticos e filhos"})]})]}),c.jsx("p",{className:"text-slate-200 text-sm sm:text-base leading-relaxed",children:n?"Form an eternal bond with another member! Once married, couples nurture an active Love Gauge that decays lazily if neglected. Together you water the Tree of Life every 12h, invest in the Family Vault with daily interest, enjoy Date Nights, and adopt children who work internships for family income!":"Celebre um vínculo eterno com outro membro do Discord! Casais nutrem uma Barra do Amor que exige carinho diário. Vocês podem regar a Árvore da Vida a cada 12h, acumular economias no Cofre do Casal com juros diários, ter encontros românticos e adotar filhos que fazem estágios e trazem moedas para o lar!"}),c.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2",children:[c.jsxs("div",{className:"p-4 rounded-2xl bg-white/5 border border-purple-500/15 space-y-1.5",children:[c.jsx(By,{className:"w-5 h-5 text-emerald-400"}),c.jsx("div",{className:"font-title font-bold text-white text-sm",children:"Árvore da Vida"}),c.jsx("p",{className:"text-[11px] text-slate-300",children:n?"Water every 12h to gain +10% Love and tree levels.":"Rega a cada 12h rende +10% de amor e sobe o nível da árvore."})]}),c.jsxs("div",{className:"p-4 rounded-2xl bg-white/5 border border-purple-500/15 space-y-1.5",children:[c.jsx(jy,{className:"w-5 h-5 text-amber-400"}),c.jsx("div",{className:"font-title font-bold text-white text-sm",children:"Cofre do Casal"}),c.jsx("p",{className:"text-[11px] text-slate-300",children:n?"Deposit shared coins with up to 5%/day interest.":"Depósitos conjuntos com rendimento diário de até 5% ao dia."})]}),c.jsxs("div",{className:"p-4 rounded-2xl bg-white/5 border border-purple-500/15 space-y-1.5",children:[c.jsx(mr,{className:"w-5 h-5 text-rose-400"}),c.jsx("div",{className:"font-title font-bold text-white text-sm",children:"Date Night"}),c.jsx("p",{className:"text-[11px] text-slate-300",children:n?"Answer 3 date questions together for love boosts.":"Encontros com 3 perguntas de sintonia a dois com prêmios."})]}),c.jsxs("div",{className:"p-4 rounded-2xl bg-white/5 border border-purple-500/15 space-y-1.5",children:[c.jsx(yy,{className:"w-5 h-5 text-pink-400"}),c.jsx("div",{className:"font-title font-bold text-white text-sm",children:"Filhos & Estágio"}),c.jsx("p",{className:"text-[11px] text-slate-300",children:n?"Adopt up to 5 children who work 24h internships.":"Adote até 5 filhos que fazem estágio remunerado para a família."})]})]}),c.jsx("div",{className:"pt-2 text-center font-mono text-xs text-pink-300",children:"/py-casamento • /py-filho • /py-divorcio • /py-ship"})]})}),i==="commands"&&c.jsxs("div",{className:"space-y-6 animate-fadeIn",children:[c.jsxs("div",{className:"p-4 rounded-2xl bg-white/5 border border-purple-500/20 flex items-center justify-between gap-4",children:[c.jsxs("div",{className:"flex items-center gap-2.5 text-xs text-slate-300",children:[c.jsx(mi,{className:"w-4 h-4 text-pink-400 flex-shrink-0"}),c.jsx("span",{children:n?"Showing all registered commands. Press Ctrl+K anytime to open the instant search command palette.":"Catálogo oficial de todos os comandos registrados. Pressione Ctrl+K a qualquer momento para abrir o buscador rápido."})]}),c.jsxs("div",{className:"hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-[10px] font-mono text-purple-300",children:[c.jsx("span",{children:"Ctrl"})," + ",c.jsx("span",{children:"K"})]})]}),c.jsx(bx,{t,lang:e})]}),i==="faq"&&c.jsxs("div",{className:"space-y-6 animate-fadeIn",children:[c.jsxs("div",{className:"text-center mb-6",children:[c.jsx("h3",{className:"font-title font-extrabold text-2xl sm:text-3xl text-white",children:n?"Frequently Asked Questions & Guidelines":"Perguntas Frequentes & Diretrizes"}),c.jsx("p",{className:"text-slate-400 text-xs sm:text-sm mt-1",children:n?"Quick answers to common questions about Pyxie":"Respostas rápidas sobre comandos, permissões e economia"})]}),c.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-5",children:a.map((o,l)=>c.jsxs("div",{className:"p-5 rounded-2xl glass-panel border border-purple-500/20 space-y-2 hover:border-pink-500/40 transition-colors",children:[c.jsxs("h4",{className:"font-title font-bold text-base text-white flex items-center gap-2",children:[c.jsx("span",{className:"text-pink-400",children:"Q."}),c.jsx("span",{children:o.q})]}),c.jsx("p",{className:"text-xs sm:text-sm text-slate-300 leading-relaxed pl-6",children:o.a})]},l))})]})]})}const yT=t=>(t==null?void 0:t.authorName)||(t==null?void 0:t.author)||(t==null?void 0:t.authorUsername)||"Artista",nu=t=>{const e=(t==null?void 0:t.authorUsername)||(t==null?void 0:t.authorName)||(t==null?void 0:t.author)||"Artista",n=String(e).trim().replace(/^@+/,"");return n&&n.toLowerCase()!=="artista"?`@${n}`:t!=null&&t.userId?"@Membro":"@Artista"};function ST({t,lang:e}){var K;const[n,i]=ae.useState([]),[r,s]=ae.useState(1),[a,o]=ae.useState(1),[l,u]=ae.useState(""),[h,p]=ae.useState(""),[f,g]=ae.useState("grid"),[v,S]=ae.useState(""),[m,d]=ae.useState(null),[_,x]=ae.useState(1),[M,P]=ae.useState(null),[T,A]=ae.useState(""),[N,H]=ae.useState(!1),[y,b]=ae.useState(!1);ae.useEffect(()=>{const I=localStorage.getItem("pyxie_admin_token")||"";S(I)},[]);const V=(I=1,q=l)=>{let fe=`/api/museum/arts?page=${I}&limit=24`;q&&(fe+=`&user=${encodeURIComponent(q)}`),fetch(fe).then(Te=>Te.json()).then(Te=>{if(Te&&Te.success){i(Te.arts||[]),s(Te.page||1),o(Te.totalPages||1);const te=new URLSearchParams(window.location.search).get("art");if(te){const le=(Te.arts||[]).find(ce=>ce.id===te);le&&d(le)}}}).catch(Te=>console.error(Te))};ae.useEffect(()=>{V(1)},[l]);const j=ae.useMemo(()=>{const I=new Map;return n.forEach(q=>{const fe=q.authorUsername||q.authorName||q.author;q.userId&&fe&&!I.has(q.userId)&&I.set(q.userId,String(fe).trim().replace(/^@+/,""))}),Array.from(I.entries()).map(([q,fe])=>({userId:q,name:fe}))},[n]),$=ae.useMemo(()=>{if(!h.trim())return n;const I=h.toLowerCase();return n.filter(q=>{var fe,Te,W,te;return((fe=q.description)==null?void 0:fe.toLowerCase().includes(I))||((Te=q.authorName)==null?void 0:Te.toLowerCase().includes(I))||((W=q.author)==null?void 0:W.toLowerCase().includes(I))||((te=q.authorUsername)==null?void 0:te.toLowerCase().includes(I))})},[n,h]),Q=(I,q)=>{q&&q.stopPropagation();const fe=`${window.location.origin}/museu?art=${I.id}`;navigator.clipboard.writeText(fe),b(!0),setTimeout(()=>b(!1),2e3)},G=async(I,q)=>{if(q.stopPropagation(),!!confirm("Deseja realmente remover esta arte da galeria?"))try{(await(await fetch(`/api/museum/art/${I}`,{method:"DELETE",headers:{"x-admin-token":v}})).json()).success?((m==null?void 0:m.id)===I&&d(null),V(r)):alert("Falha ao remover arte.")}catch{alert("Erro na requisição.")}},Y=async()=>{if(M)try{(await(await fetch(`/api/museum/art/${M.id}`,{method:"PATCH",headers:{"Content-Type":"application/json","x-admin-token":v},body:JSON.stringify({description:T})})).json()).success?(P(null),V(r)):alert("Falha ao atualizar descrição.")}catch{alert("Erro na requisição.")}},L=I=>{I.preventDefault(),H(!0)};return c.jsxs("div",{className:"min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10",children:[c.jsxs("div",{className:"text-center space-y-4 max-w-3xl mx-auto pt-2",children:[c.jsxs("div",{className:"inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-bold shadow-sm",children:[c.jsx(Dt,{className:"w-3.5 h-3.5 text-pink-400"}),c.jsx("span",{children:t("museum.badge")})]}),c.jsx("h1",{className:"font-title font-black text-3xl sm:text-5xl md:text-6xl bg-gradient-to-r from-white via-pink-200 to-purple-300 bg-clip-text text-transparent tracking-tight",children:t("museum.title")}),c.jsx("p",{className:"text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto",children:t("museum.subtitle")})]}),c.jsxs("div",{className:"flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-purple-500/20",children:[c.jsxs("div",{className:"relative w-full md:w-80 flex items-center",children:[c.jsx(Fh,{className:"absolute left-3.5 w-4 h-4 text-slate-400"}),c.jsx("input",{type:"text",value:h,onChange:I=>p(I.target.value),placeholder:"Buscar por obra ou artista...",className:"w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-purple-500/20 text-xs text-white placeholder-slate-400 outline-none focus:border-pink-500 transition-colors"}),h&&c.jsx("button",{onClick:()=>p(""),className:"absolute right-3 text-slate-400 hover:text-white",children:c.jsx(ws,{className:"w-3.5 h-3.5"})})]}),c.jsxs("div",{className:"flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-purple-500/20",children:[c.jsxs("button",{onClick:()=>g("grid"),className:`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${f==="grid"?"bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-sm":"text-slate-400 hover:text-white"}`,children:[c.jsx(Py,{className:"w-3.5 h-3.5"}),c.jsx("span",{children:"Mural Grid"})]}),c.jsxs("button",{onClick:()=>g("forum"),className:`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${f==="forum"?"bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-sm":"text-slate-400 hover:text-white"}`,children:[c.jsx(Iy,{className:"w-3.5 h-3.5"}),c.jsx("span",{children:"Modo Fórum"})]})]})]}),j.length>0&&c.jsxs("div",{className:"flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none",children:[c.jsx("button",{onClick:()=>u(""),className:`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${l?"bg-white/5 border border-purple-500/20 text-slate-300 hover:bg-white/10":"bg-pink-600 text-white shadow-neon-pink"}`,children:"Todos os Artistas"}),j.map(({userId:I,name:q})=>c.jsxs("button",{onClick:()=>u(l===I?"":I),className:`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${l===I?"bg-pink-600 text-white shadow-neon-pink":"bg-white/5 border border-purple-500/20 text-slate-300 hover:bg-white/10"}`,children:[c.jsx(Wg,{className:"w-3 h-3 text-purple-400"}),c.jsxs("span",{children:["@",q]})]},I))]}),$.length>0?f==="grid"?c.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6",children:$.map(I=>c.jsxs("div",{onClick:()=>{d(I),x(1)},className:"group relative rounded-2xl glass-panel border border-purple-500/20 hover:border-pink-500/50 overflow-hidden cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-neon-pink flex flex-col justify-between",children:[c.jsxs("div",{onContextMenu:L,className:"relative aspect-square overflow-hidden bg-black/40 select-none art-shield",children:[c.jsx("img",{src:I.imageUrl||`/api/museum/art-image/${I.id}`,alt:I.description||"Arte da Comunidade",loading:"lazy",className:"w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"}),c.jsx("div",{className:"absolute inset-0 bg-gradient-to-t from-[#0e071a] via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity"}),c.jsx("button",{onClick:q=>Q(I,q),className:"absolute top-2.5 right-2.5 p-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110",title:"Compartilhar Obra",children:c.jsx(ha,{className:"w-3.5 h-3.5"})})]}),c.jsxs("div",{className:"p-4 space-y-2",children:[c.jsxs("div",{className:"flex items-center justify-between text-xs",children:[c.jsx("span",{className:"font-title font-bold text-pink-300 truncate max-w-[150px]",children:nu(I)}),c.jsx("span",{className:"text-[11px] font-mono text-slate-400",children:I.createdAt?new Date(I.createdAt).toLocaleDateString("pt-BR"):""})]}),I.description&&c.jsx("p",{className:"text-slate-300 text-xs line-clamp-2 leading-relaxed",children:I.description})]}),v&&c.jsxs("div",{className:"p-3 border-t border-purple-500/15 flex items-center justify-end gap-2 bg-black/30",children:[c.jsx("button",{onClick:q=>{q.stopPropagation(),P(I),A(I.description||"")},className:"p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-purple-300",children:c.jsx(Uy,{className:"w-3.5 h-3.5"})}),c.jsx("button",{onClick:q=>G(I.id,q),className:"p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300",children:c.jsx(zy,{className:"w-3.5 h-3.5"})})]})]},I.id))}):c.jsx("div",{className:"space-y-6 max-w-4xl mx-auto",children:$.map(I=>c.jsxs("div",{className:"rounded-3xl glass-panel border border-purple-500/20 p-6 space-y-4 hover:border-pink-500/40 transition-colors",children:[c.jsxs("div",{className:"flex items-center justify-between border-b border-purple-500/15 pb-4",children:[c.jsxs("div",{className:"flex items-center gap-3",children:[c.jsx("div",{className:"w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 p-0.5 shadow-sm",children:c.jsx("div",{className:"w-full h-full rounded-full bg-[#0e071a] flex items-center justify-center text-pink-300 font-bold font-mono text-xs",children:yT(I)[0].toUpperCase()})}),c.jsxs("div",{children:[c.jsx("span",{className:"font-title font-bold text-white text-sm block",children:nu(I)}),c.jsxs("span",{className:"text-[11px] font-mono text-purple-300/70",children:["Publicado em ",I.createdAt?new Date(I.createdAt).toLocaleDateString("pt-BR"):"Data cósmica"]})]})]}),c.jsxs("button",{onClick:()=>Q(I),className:"p-2 rounded-xl bg-white/5 hover:bg-white/10 text-purple-300 flex items-center gap-1.5 text-xs font-semibold",children:[c.jsx(ha,{className:"w-3.5 h-3.5"}),c.jsx("span",{children:"Compartilhar"})]})]}),I.description&&c.jsx("p",{className:"text-slate-200 text-sm leading-relaxed",children:I.description}),c.jsx("div",{onContextMenu:L,onClick:()=>{d(I),x(1)},className:"rounded-2xl overflow-hidden bg-black/60 max-h-[500px] flex items-center justify-center cursor-pointer select-none art-shield border border-purple-500/15",children:c.jsx("img",{src:I.imageUrl||`/api/museum/art-image/${I.id}`,alt:I.description||"Arte da Comunidade",loading:"lazy",className:"w-full h-full object-contain max-h-[500px] pointer-events-none"})})]},I.id))}):c.jsx("div",{className:"text-center py-24 text-slate-400 text-sm",children:"Nenhuma obra encontrada para esta pesquisa ou artista."}),a>1&&c.jsxs("div",{className:"flex items-center justify-center gap-3 pt-6",children:[c.jsx("button",{onClick:()=>V(r-1),disabled:r<=1,className:"p-2.5 rounded-xl bg-white/5 border border-purple-500/20 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10",children:c.jsx(My,{className:"w-4 h-4"})}),c.jsxs("span",{className:"font-mono text-xs text-slate-300",children:["Página ",r," de ",a]}),c.jsx("button",{onClick:()=>V(r+1),disabled:r>=a,className:"p-2.5 rounded-xl bg-white/5 border border-purple-500/20 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10",children:c.jsx(jg,{className:"w-4 h-4"})})]}),m&&c.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in",onClick:()=>d(null),children:c.jsxs("div",{className:"relative max-w-5xl max-h-[92vh] w-full flex flex-col items-center justify-center",onClick:I=>I.stopPropagation(),children:[c.jsxs("div",{className:"w-full flex items-center justify-between mb-3 px-2 text-white",children:[c.jsxs("div",{className:"flex items-center gap-3",children:[c.jsx("span",{className:"font-title font-bold text-sm text-pink-300",children:nu(m)}),c.jsxs("span",{className:"text-xs font-mono text-slate-400",children:["ID: ",(K=m.id)==null?void 0:K.slice(0,10),"..."]})]}),c.jsxs("div",{className:"flex items-center gap-2",children:[c.jsx("button",{onClick:()=>x(I=>Math.min(I+.25,2.5)),className:"p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white",title:"Aumentar Zoom",children:c.jsx(Wy,{className:"w-4 h-4"})}),c.jsx("button",{onClick:()=>x(I=>Math.max(I-.25,.75)),className:"p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white",title:"Diminuir Zoom",children:c.jsx(Xy,{className:"w-4 h-4"})}),c.jsxs("button",{onClick:I=>Q(m,I),className:"px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 text-xs font-bold",title:"Copiar Link",children:[y?c.jsx(Pa,{className:"w-4 h-4 text-emerald-400"}):c.jsx(ha,{className:"w-4 h-4"}),c.jsx("span",{children:y?"Copiado!":"Compartilhar"})]}),c.jsx("button",{onClick:()=>d(null),className:"p-2 rounded-xl bg-white/10 hover:bg-rose-600 text-white ml-2 transition-colors",title:"Fechar (ESC)",children:c.jsx(ws,{className:"w-4 h-4"})})]})]}),c.jsx("div",{onContextMenu:L,className:"relative max-h-[75vh] max-w-full overflow-hidden rounded-2xl select-none art-shield flex items-center justify-center bg-black/50 p-2",children:c.jsx("img",{src:m.imageUrl||`/api/museum/art-image/${m.id}`,alt:m.description||"Arte da Comunidade",style:{transform:`scale(${_})`,transition:"transform 0.2s ease-out"},className:"max-h-[72vh] max-w-full object-contain pointer-events-none rounded-lg"})}),m.description&&c.jsxs("p",{className:"mt-4 text-center text-slate-300 text-sm max-w-2xl px-4",children:['"',m.description,'"']})]})}),M&&c.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md",children:c.jsxs("div",{className:"bg-[#0e071a] border border-purple-500/30 rounded-2xl p-6 w-full max-w-md space-y-4",children:[c.jsx("h3",{className:"font-title font-bold text-white text-lg",children:"Editar Descrição"}),c.jsx("textarea",{value:T,onChange:I=>A(I.target.value),className:"w-full h-32 p-3 rounded-xl bg-white/5 border border-purple-500/25 text-white text-sm outline-none focus:border-pink-500",placeholder:"Digite a nova descrição da obra..."}),c.jsxs("div",{className:"flex justify-end gap-2",children:[c.jsx("button",{onClick:()=>P(null),className:"px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-bold",children:"Cancelar"}),c.jsx("button",{onClick:Y,className:"px-4 py-2 rounded-xl bg-pink-600 text-white text-xs font-bold shadow-neon-pink",children:"Salvar Alterações"})]})]})}),N&&c.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md",onClick:()=>H(!1),children:c.jsxs("div",{className:"bg-[#0e071a] border border-pink-500/40 rounded-3xl p-6 max-w-md text-center space-y-4 shadow-neon-pink",onClick:I=>I.stopPropagation(),children:[c.jsx("div",{className:"w-12 h-12 mx-auto rounded-full bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400",children:c.jsx(Vg,{className:"w-6 h-6"})}),c.jsx("h4",{className:"font-title font-bold text-white text-lg",children:"Proteção de Autoria"}),c.jsx("p",{className:"text-xs text-slate-300 leading-relaxed",children:t("museum.artShield")||"Esta obra foi criada com amor por um membro da nossa comunidade. O download direto é bloqueado para proteger a autoria do artista. Compartilhe o link do museu!"}),c.jsx("button",{onClick:()=>H(!1),className:"w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold shadow-neon-pink",children:"Compreendido ✨"})]})})]})}function wT({t,lang:e}){const[n,i]=ae.useState(10),[r,s]=ae.useState(!1),[a,o]=ae.useState(!1),[l,u]=ae.useState(null),[h,p]=ae.useState(!1),[f,g]=ae.useState(!0),v=ae.useRef(null),m=new URLSearchParams(window.location.search).get("token")||"",d=()=>{if(f)try{const N=new(window.AudioContext||window.webkitAudioContext),H=N.createOscillator(),y=N.createGain();H.type="sine",H.frequency.setValueAtTime(587.33,N.currentTime),H.frequency.exponentialRampToValueAtTime(880,N.currentTime+.3),y.gain.setValueAtTime(.18,N.currentTime),y.gain.exponentialRampToValueAtTime(.001,N.currentTime+.5),H.connect(y),y.connect(N.destination),H.start(),H.stop(N.currentTime+.5)}catch{}};ae.useEffect(()=>{if(n>0){const N=setTimeout(()=>{i(H=>H-1)},1e3);return()=>clearTimeout(N)}else s(!0),d(),_()},[n]);const _=()=>{var Q,G;const N=v.current;if(!N)return;const H=N.getContext("2d"),y=N.width=((Q=N.parentElement)==null?void 0:Q.clientWidth)||300,b=N.height=((G=N.parentElement)==null?void 0:G.clientHeight)||300,V=Array.from({length:40},()=>({x:y/2,y:b/2,vx:(Math.random()-.5)*8,vy:(Math.random()-.5)*8-2,radius:Math.random()*3+2,color:["#f472b6","#c084fc","#38bdf8","#fbbf24","#34d399"][Math.floor(Math.random()*5)],alpha:1}));let j=0;function $(){H.clearRect(0,0,y,b),V.forEach(Y=>{Y.x+=Y.vx,Y.y+=Y.vy,Y.alpha-=.02,H.beginPath(),H.arc(Y.x,Y.y,Y.radius,0,Math.PI*2),H.fillStyle=Y.color,H.globalAlpha=Math.max(0,Y.alpha),H.fill()}),j++,j<60?requestAnimationFrame($):H.clearRect(0,0,y,b)}$()},x=()=>a?"Moedinhas entregues no seu cofre com sucesso! Volte amanhã para mais! 🎉":n>7?"Canalizando a energia estelar do seu cofre mágico... ⚡":n>3?"Quase lá! As moedas estão brilhando na penumbra cósmica... ✨":n>0?"Sintonização quase concluída! Prepare seu cofre! 🌟":"Energia cósmica pronta! Clique no botão abaixo para resgatar! 🎁",M=async()=>{if(!m){alert("Token de bônus não informado na URL. Abra o link gerado pelo comando /py-bonus no Discord.");return}p(!0);try{const H=await(await fetch("/api/bonus/claim",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:m})})).json();p(!1),H&&H.success?(o(!0),u(H),d()):alert(H.error||"Falha ao reivindicar bônus.")}catch{p(!1),alert("Erro na requisição com o servidor.")}},P=54,T=2*Math.PI*P,A=T-(10-n)/10*T;return c.jsxs("div",{className:"min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12",children:[c.jsxs("div",{className:"text-center space-y-3",children:[c.jsxs("div",{className:"inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-bold shadow-sm",children:[c.jsx(Dt,{className:"w-3.5 h-3.5 text-pink-400"}),c.jsx("span",{children:"Canalização de Recompensas Cósmicas"})]}),c.jsx("h1",{className:"font-title font-black text-3xl sm:text-5xl text-white tracking-tight",children:t("bonus.title")}),c.jsx("p",{className:"text-slate-300 text-sm sm:text-base max-w-xl mx-auto",children:t("bonus.subtitle")})]}),c.jsxs("div",{className:"max-w-2xl mx-auto relative rounded-3xl glass-panel border border-purple-500/30 p-8 sm:p-10 shadow-2xl flex flex-col items-center text-center space-y-8 overflow-hidden",children:[c.jsx("canvas",{ref:v,className:"absolute inset-0 pointer-events-none z-20"}),c.jsx("button",{onClick:()=>g(!f),className:"absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors z-30",title:f?"Silenciar Áudio":"Ativar Efeitos Sonoros",children:f?c.jsx(Hy,{className:"w-4 h-4 text-pink-400"}):c.jsx(Vy,{className:"w-4 h-4"})}),c.jsxs("div",{className:"flex flex-col sm:flex-row items-center gap-4 relative z-10 max-w-lg",children:[c.jsx("div",{className:"relative w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-pink-500 to-purple-600 shadow-neon-pink flex-shrink-0 animate-bounce-slow",children:c.jsx("img",{src:"/assets/pyxie/pyxie_mascot.png",alt:"Mascote Pyxie",className:"w-full h-full object-contain rounded-full bg-[#0e071a] p-1.5"})}),c.jsxs("div",{className:"relative p-3.5 rounded-2xl bg-white/10 border border-purple-500/30 text-xs sm:text-sm text-slate-100 font-medium text-left shadow-lg",children:[x(),c.jsx("div",{className:"hidden sm:block absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-white/10 border-l border-b border-purple-500/30 rotate-45"})]})]}),c.jsxs("div",{className:"relative w-44 h-44 flex items-center justify-center z-10",children:[c.jsxs("svg",{className:"w-full h-full transform -rotate-90",children:[c.jsx("circle",{cx:"88",cy:"88",r:P,stroke:"rgba(255, 255, 255, 0.08)",strokeWidth:"10",fill:"transparent"}),c.jsx("circle",{cx:"88",cy:"88",r:P,stroke:"url(#gradient-ring)",strokeWidth:"10",fill:"transparent",strokeDasharray:T,strokeDashoffset:A,strokeLinecap:"round",className:"transition-all duration-1000 ease-linear"}),c.jsx("defs",{children:c.jsxs("linearGradient",{id:"gradient-ring",x1:"0%",y1:"0%",x2:"100%",y2:"100%",children:[c.jsx("stop",{offset:"0%",stopColor:"#f43f5e"}),c.jsx("stop",{offset:"50%",stopColor:"#ec4899"}),c.jsx("stop",{offset:"100%",stopColor:"#8b5cf6"})]})})]}),c.jsxs("div",{className:"absolute inset-0 flex flex-col items-center justify-center font-title",children:[a?c.jsx(Ku,{className:"w-12 h-12 text-emerald-400 animate-pulse"}):r?c.jsx(Dt,{className:"w-12 h-12 text-pink-400 animate-spin-slow"}):c.jsxs("span",{className:"font-black text-4xl sm:text-5xl text-white tracking-tighter",children:[n,"s"]}),c.jsx("span",{className:"text-[11px] font-mono text-purple-300/80 uppercase tracking-widest mt-1",children:a?"Resgatado":r?"Pronto!":"Canalizando"})]})]}),c.jsxs("div",{className:"w-full max-w-sm space-y-3 z-10",children:[!m&&c.jsxs("div",{className:"p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 text-left",children:[c.jsx(Ey,{className:"w-4 h-4 flex-shrink-0"}),c.jsxs("span",{children:["Abra o link enviado pelo comando ",c.jsx("strong",{children:"/py-bonus"})," no Discord para validar seu token."]})]}),a?c.jsxs("div",{className:"p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold text-sm flex items-center justify-center gap-2",children:[c.jsx(Ku,{className:"w-5 h-5 text-emerald-400"}),c.jsx("span",{children:t("bonus.claimed")})]}):c.jsxs("button",{onClick:M,disabled:!r||h||!m,className:`w-full py-4 rounded-2xl font-title font-black text-sm tracking-wide transition-all transform flex items-center justify-center gap-2 ${r&&m?"bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-neon-pink hover:scale-102 cursor-pointer":"bg-white/5 border border-purple-500/20 text-slate-500 cursor-not-allowed opacity-60"}`,children:[c.jsx(Qu,{className:"w-4 h-4"}),c.jsx("span",{children:h?"Creditando no cofre...":r?t("bonus.claim"):`Aguarde ${n}s para liberar ✨`})]})]})]}),c.jsx(Tx,{t,lang:e})]})}function MT({t,lang:e,userId:n}){const[i,r]=ae.useState(null),[s,a]=ae.useState([]),[o,l]=ae.useState(null),[u,h]=ae.useState("tarot"),[p,f]=ae.useState(!1),[g,v]=ae.useState(!0),S=n||window.location.pathname.split("/u/")[1]||"";ae.useEffect(()=>{S&&(v(!0),fetch(`/api/profile/${S}`).then(T=>T.json()).then(T=>{T&&T.success&&r(T),v(!1)}).catch(T=>{console.error("Erro ao buscar perfil:",T),v(!1)}))},[S]),ae.useEffect(()=>{fetch("/api/tarot/cards").then(T=>T.json()).then(T=>{T&&T.success&&Array.isArray(T.cards)&&a(T.cards)}).catch(T=>console.error("Erro ao buscar cartas:",T))},[]);const m=()=>{const T=window.location.href;navigator.share?navigator.share({title:"Perfil de Membro da Pyxie",text:"Confira minha coleção de Tarot e status na Pyxie!",url:T}).catch(()=>{}):(navigator.clipboard.writeText(T),f(!0),setTimeout(()=>f(!1),2e3))};if(g)return c.jsxs("div",{className:"min-h-screen flex items-center justify-center text-slate-400 font-mono text-sm",children:[c.jsx(Dt,{className:"w-5 h-5 text-pink-400 animate-spin mr-2"}),c.jsx("span",{children:"Sintonizando perfil cósmico..."})]});if(!i)return c.jsxs("div",{className:"min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4",children:[c.jsx("div",{className:"w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400",children:c.jsx(Wg,{className:"w-8 h-8"})}),c.jsx("h2",{className:"font-title font-bold text-2xl text-white",children:"Perfil Não Encontrado"}),c.jsxs("p",{className:"text-slate-400 text-sm max-w-md",children:["Nenhum registro cósmico associado ao ID ",S," foi localizado no banco de dados."]}),c.jsx("a",{href:"/",className:"px-6 py-2.5 rounded-xl bg-pink-600 text-white font-bold text-xs shadow-neon-pink",children:"Voltar para o Início"})]});const{account:d,marriage:_,tarot:x,achievements:M}=i,P=new Set(x.discoveredCards||[]);return c.jsxs("div",{className:"min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10",children:[c.jsxs("div",{className:"relative rounded-3xl glass-panel border border-purple-500/30 p-6 sm:p-10 shadow-2xl overflow-hidden",children:[c.jsx("div",{className:"absolute top-0 right-0 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"}),c.jsxs("div",{className:"flex flex-col md:flex-row items-center justify-between gap-6 relative z-10",children:[c.jsxs("div",{className:"flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left",children:[c.jsxs("div",{className:"relative w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-pink-500 via-purple-600 to-cyan-400 shadow-neon-pink flex-shrink-0",children:[c.jsx("img",{src:"/assets/pyxie/pyxie_mascot.png",alt:"Avatar",className:"w-full h-full object-cover rounded-full bg-[#0e071a]"}),c.jsx("span",{className:"absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-400 border-2 border-[#0e071a] flex items-center justify-center text-[10px] text-black font-bold",children:"✓"})]}),c.jsxs("div",{className:"space-y-1.5",children:[c.jsxs("div",{className:"flex flex-wrap items-center justify-center sm:justify-start gap-2",children:[c.jsxs("h1",{className:"font-title font-black text-2xl sm:text-3xl text-white",children:["Membro (",S.slice(-4),")"]}),d.activeTitle&&c.jsxs("span",{className:"px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold",children:["👑 ",d.activeTitle]})]}),c.jsxs("div",{className:"flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-300",children:[c.jsxs("span",{className:"flex items-center gap-1 text-pink-300",children:[c.jsx(Zu,{className:"w-3.5 h-3.5"}),c.jsxs("span",{children:["Profissão: ",d.profession||"Aventureiro Místico"]})]}),c.jsx("span",{children:"•"}),c.jsxs("span",{className:"flex items-center gap-1 text-amber-300",children:[c.jsx(Ss,{className:"w-3.5 h-3.5"}),c.jsxs("span",{children:[d.balance.toLocaleString("pt-BR")," Moedas"]})]}),d.dailyStreak>0&&c.jsxs(c.Fragment,{children:[c.jsx("span",{children:"•"}),c.jsxs("span",{className:"text-orange-400 font-bold",children:["🔥 ",d.dailyStreak," dias"]})]})]})]})]}),c.jsxs("button",{onClick:m,className:"px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-purple-500/30 text-white font-title font-bold text-xs flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg",children:[p?c.jsx(Pa,{className:"w-4 h-4 text-emerald-400"}):c.jsx(ha,{className:"w-4 h-4 text-pink-400"}),c.jsx("span",{children:p?"Link Copiado! 🔗":"Compartilhar Perfil"})]})]}),_&&_.isMarried&&c.jsxs("div",{className:"mt-8 pt-6 border-t border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 bg-pink-500/5 p-4 rounded-2xl",children:[c.jsxs("div",{className:"flex items-center gap-3",children:[c.jsx("div",{className:"w-10 h-10 rounded-full bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400",children:c.jsx(mr,{className:"w-5 h-5 fill-pink-500"})}),c.jsxs("div",{children:[c.jsx("span",{className:"font-title font-bold text-sm text-white block",children:"Laço Matrimonial Ativo"}),c.jsxs("span",{className:"text-xs text-purple-300/80",children:["Árvore da Vida: Nível ",_.treeLevel," • Cofre: ",_.vaultCoins," 🪙"]})]})]}),c.jsxs("div",{className:"w-full sm:w-60 space-y-1",children:[c.jsxs("div",{className:"flex justify-between text-[11px] font-mono text-pink-300 font-bold",children:[c.jsx("span",{children:"Barra do Amor"}),c.jsxs("span",{children:[_.love,"%"]})]}),c.jsx("div",{className:"w-full h-2 rounded-full bg-white/10 overflow-hidden",children:c.jsx("div",{className:"h-full bg-gradient-to-r from-pink-500 to-rose-400 rounded-full transition-all duration-1000 shadow-neon-pink",style:{width:`${Math.min(_.love,100)}%`}})})]})]})]}),c.jsxs("div",{className:"flex items-center justify-center gap-3",children:[c.jsxs("button",{onClick:()=>h("tarot"),className:`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${u==="tarot"?"bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-neon-pink":"bg-white/5 border border-purple-500/20 text-slate-300 hover:bg-white/10"}`,children:[c.jsx(Na,{className:"w-4 h-4"}),c.jsxs("span",{children:["Álbum de Tarot (",x.discoveredCount,"/78)"]})]}),c.jsxs("button",{onClick:()=>h("achievements"),className:`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${u==="achievements"?"bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-neon-pink":"bg-white/5 border border-purple-500/20 text-slate-300 hover:bg-white/10"}`,children:[c.jsx(Bg,{className:"w-4 h-4"}),c.jsx("span",{children:"Conquistas Arcanas"})]})]}),u==="tarot"&&c.jsxs("section",{className:"space-y-6",children:[c.jsxs("div",{className:"flex items-center justify-between text-xs text-slate-400 px-2 font-mono",children:[c.jsxs("span",{children:["Progresso da Coleção: ",x.discoveredCount," de 78 cartas (",Math.round(x.discoveredCount/78*100),"%)"]}),c.jsx("span",{children:"Clique na carta para inspecionar"})]}),c.jsx("div",{className:"grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4",children:s.map((T,A)=>{const N=A+1,H=P.has(N);return c.jsxs("div",{onClick:()=>H&&l(T),className:`group relative rounded-2xl p-2.5 border transition-all duration-300 transform flex flex-col items-center justify-between aspect-[2/3] ${H?"bg-[#140a28]/80 border-purple-500/40 hover:border-pink-500 hover:shadow-neon-pink hover:-translate-y-1.5 cursor-pointer":"bg-black/40 border-white/5 opacity-50 cursor-not-allowed"}`,style:{perspective:"1000px"},children:[c.jsx("div",{className:"w-full h-full relative rounded-xl overflow-hidden flex items-center justify-center bg-black/60",children:H?c.jsx("img",{src:`/api/tarot/card-image?id=${T.id}`,alt:T.name,loading:"lazy",className:"w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform"}):c.jsxs("div",{className:"flex flex-col items-center justify-center p-3 text-center space-y-2 text-slate-500",children:[c.jsx(Ly,{className:"w-5 h-5 text-slate-600"}),c.jsxs("span",{className:"font-mono text-[10px] tracking-wider",children:["#",String(N).padStart(2,"0")]}),c.jsx("span",{className:"text-[9px] uppercase tracking-widest text-slate-600",children:"Bloqueado"})]})}),c.jsx("div",{className:"w-full pt-2 text-center",children:c.jsx("span",{className:`text-[11px] font-bold block truncate ${H?"text-white group-hover:text-pink-300":"text-slate-600"}`,children:H?T.name:"???"})})]},T.id||A)})})]}),u==="achievements"&&c.jsx("section",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:M.map(T=>c.jsxs("div",{className:`p-5 rounded-2xl border transition-all flex items-start gap-4 ${T.completed?"bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-pink-500/40":"bg-white/5 border-white/5 opacity-60"}`,children:[c.jsx("div",{className:`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${T.completed?"bg-pink-500/20 border border-pink-500/40 text-pink-400":"bg-white/5 text-slate-500"}`,children:T.completed?"🏆":"🔒"}),c.jsxs("div",{className:"space-y-1 min-w-0 flex-1",children:[c.jsxs("div",{className:"flex items-center justify-between",children:[c.jsx("h4",{className:"font-title font-bold text-sm text-white truncate",children:e==="en"?T.nameEn:T.namePt}),c.jsxs("span",{className:"text-[11px] font-mono text-amber-300 font-bold",children:["+",T.rewardCoins," 🪙"]})]}),c.jsx("p",{className:"text-xs text-slate-300 leading-relaxed",children:e==="en"?T.descEn:T.descPt}),c.jsxs("div",{className:"pt-2 flex items-center gap-2 text-[10px] font-mono text-slate-400",children:[c.jsx("div",{className:"flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden",children:c.jsx("div",{className:"h-full bg-pink-500 rounded-full",style:{width:`${Math.min(T.current/T.target*100,100)}%`}})}),c.jsxs("span",{children:[T.current,"/",T.target]})]})]})]},T.id))}),o&&c.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in",onClick:()=>l(null),children:c.jsxs("div",{className:"relative max-w-md w-full rounded-3xl bg-[#0e071a] border border-purple-500/40 p-6 shadow-2xl space-y-4",onClick:T=>T.stopPropagation(),children:[c.jsxs("div",{className:"flex items-center justify-between border-b border-purple-500/15 pb-3",children:[c.jsx("span",{className:"font-title font-bold text-lg text-white",children:o.name}),c.jsx("button",{onClick:()=>l(null),className:"p-1 rounded-lg text-slate-400 hover:text-white",children:"✕"})]}),c.jsx("div",{className:"aspect-[2/3] max-h-72 mx-auto rounded-xl overflow-hidden border border-purple-500/30",children:c.jsx("img",{src:`/api/tarot/card-image?id=${o.id}`,alt:o.name,className:"w-full h-full object-cover"})}),c.jsxs("div",{className:"space-y-2 text-xs text-slate-300",children:[c.jsxs("div",{children:[c.jsx("span",{className:"font-bold text-pink-300 block mb-0.5",children:"Significado Direto:"}),c.jsx("p",{className:"leading-relaxed",children:o.upright})]}),c.jsxs("div",{children:[c.jsx("span",{className:"font-bold text-purple-300 block mb-0.5",children:"Significado Invertido:"}),c.jsx("p",{className:"leading-relaxed",children:o.reversed})]})]})]})})]})}const Mm={pt:{"nav.features":"Recursos","nav.commands":"Comandos","nav.wiki":"Wiki Oficial","nav.museum":"Museu 3D","nav.bonus":"Bônus 10s","nav.support":"Servidor de Suporte","nav.invite":"Adicionar Pyxie","hero.badge":"Online & Operacional • Discord.js v14","hero.titlePrefix":"A Fada Companheira do seu","hero.titleHighlight":"Servidor Discord","hero.subtitle":"Economia Mágica com moedinhas e feijões, Tarot dos 78 Arcanos em Canvas HD, 16 Carreiras e Dinâmica Social imersiva no Discord.","hero.btnInvite":"Adicionar ao Discord","hero.btnSupport":"Servidor de Suporte","hero.badgeEconomy":"Economia Viva","hero.badgeCareers":"16 Carreiras & Vocações","hero.badgeUptime":"Uptime Permanente","terminal.tabWork":"/py-work (Expediente)","terminal.tabMarriage":"/py-casamento (Amor)","terminal.tabTarot":"/py-tarot (Oráculo)","terminal.workTitle":"💼 Expediente Profissional: Alquimista Místico","terminal.workDesc":"Você precisa misturar a essência da Rosa Arcana com pó estelar. Qual proporção você escolhe?","terminal.opt1":"1. Proporção Áurea (Equilíbrio)","terminal.opt2":"2. Sobrecarga Mística (Alto Risco)","terminal.opt3":"3. Destilação Serena (Conservador)","terminal.workResult":"✨ Sucesso Perfeito! A poção brilhou em néon rosa. +95 moedinhas e +15 XP de Alquimia!","terminal.marriageTitle":"💍 Status Matrimonial: Pyxie & Astaroth","terminal.loveBar":"Barra do Amor Eterno","terminal.loveTree":"🌳 Árvore da Vida: Nível 3 (+30% Amor / 12h)","terminal.loveVault":"🏦 Cofre do Casal: 12.450 moedas (Rendimento +5%/dia)","terminal.tarotTitle":"🔮 Tiragem do Dia: Os 78 Arcanos","terminal.tarotCard":"O Mago (The Magician)","terminal.tarotDesc":'"O poder da criação e transmutação está vivo em suas mãos hoje. Use a astúcia e a determinação para moldar seu destino."',"museum.badge":"Acervo Cultural da Comunidade","museum.title":"Galeria Holográfica da Comunidade","museum.subtitle":"Acervo 3D e galeria permanente de ilustrações, fanarts e criações visuais da comunidade.","museum.exploreAll":"Explorar Galeria Completa da Comunidade ➔","museum.artShield":"🛡️ Obra protegida por direitos autorais da comunidade. Respeite os artistas!","museum.inspect":"Inspecionar Obra","museum.author":"Artista","museum.id":"ID da Peça","wiki.badge":"Enciclopédia Oficial • Pyxie & Cringelândia","wiki.title":"Guia Oficial & Enciclopédia Interativa","wiki.subtitle":"Explore lore, regras, economia viva, as 16 vocações, oráculo de tarot e comandos oficiais.","wiki.tabCommunity":"Comunidade & Acolhimento","wiki.tabEconomy":"Economia Mágica","wiki.tabCareers":"16 Vocações & Trabalho","wiki.tabTarot":"Tarot dos 78 Arcanos","wiki.tabMarriage":"Social & Família","wiki.tabCommands":"Catálogo de Comandos","wiki.tabFaq":"Dúvidas & FAQ","wiki.searchPlaceholder":"Pressione Ctrl+K ou digite para buscar comandos...","wiki.copied":"Copiado para a área de transferência!","wiki.copyBtn":"Copiar comando","shopee.title":"Achadinhos da Pyxie: Mimos de Setup & Papelaria","shopee.subtitle":"Curadoria exclusiva de pelúcias, iluminação RGB, papelaria gótica e mimos para seu quarto.","shopee.cta":"Ver na Shopee ➔","bonus.title":"Portal Encantado de Recompensas","bonus.subtitle":"Aguarde os 10 segundos mágicos de conexão cósmica para resgatar suas moedas diárias.","bonus.ready":"Bônus Pronto para Resgate!","bonus.claim":"Reivindicar Moedas Mágicas ✨","bonus.claimed":"🎉 Recompensa reivindicada com sucesso!","footer.rights":"Pyxie © 2026 • Feita com carinho para comunidades do mundo todo.","footer.terms":"Termos & Proteção a Menores","footer.wiki":"Wiki Oficial","footer.bonus":"Bônus Web","footer.museum":"Museu de Arte"},en:{"nav.features":"Features","nav.commands":"Commands","nav.wiki":"Official Wiki","nav.museum":"3D Museum","nav.bonus":"10s Bonus","nav.support":"Support Server","nav.invite":"Add Pyxie","hero.badge":"Online & Operational • Discord.js v14","hero.titlePrefix":"The Companion Fairy for Your","hero.titleHighlight":"Discord Server","hero.subtitle":"Living Economy with magic coins and beans, 78 Tarot Arcana in HD Canvas, 16 Careers, and immersive Social Dynamics on Discord.","hero.btnInvite":"Add to Discord","hero.btnSupport":"Support Server","hero.badgeEconomy":"Living Economy","hero.badgeCareers":"16 Unique Vocations","hero.badgeUptime":"Permanent Uptime","terminal.tabWork":"/py-work (Shift)","terminal.tabMarriage":"/py-casamento (Family)","terminal.tabTarot":"/py-tarot (Oracle)","terminal.workTitle":"💼 Career Shift: Mystic Alchemist","terminal.workDesc":"You need to blend Arcane Rose essence with stardust. Which ratio do you choose?","terminal.opt1":"1. Golden Ratio (Balance)","terminal.opt2":"2. Mystic Surge (High Risk)","terminal.opt3":"3. Serene Distillation (Safe)","terminal.workResult":"✨ Perfect Outcome! The potion flared in neon pink. +95 coins and +15 Alchemy XP!","terminal.marriageTitle":"💍 Marriage Status: Pyxie & Astaroth","terminal.loveBar":"Eternal Love Gauge","terminal.loveTree":"🌳 Tree of Life: Level 3 (+30% Love / 12h)","terminal.loveVault":"🏦 Love Vault: 12,450 coins (+5%/day interest)","terminal.tarotTitle":"🔮 Daily Card Draw: The 78 Arcana","terminal.tarotCard":"The Magician","terminal.tarotDesc":'"The power of creation and transmutation is alive in your hands today. Use wit and determination to shape reality."',"museum.badge":"Community Cultural Archive","museum.title":"The Holographic Community Deck","museum.subtitle":"3D Holographic Chamber with community artworks orbiting in deep space.","museum.exploreAll":"Explore Full Community Gallery ➔","museum.artShield":"🛡️ Artwork protected by community copyright. Respect the creators!","museum.inspect":"Inspect Artwork","museum.author":"Artist","museum.id":"Piece ID","wiki.badge":"Official Encyclopedia • Pyxie & Cringelândia","wiki.title":"Official Guide & Interactive Encyclopedia","wiki.subtitle":"Explore lore, guidelines, live economy, 16 vocations, tarot oracle and official bot commands.","wiki.tabCommunity":"Community & Sanctuary","wiki.tabEconomy":"Living Economy","wiki.tabCareers":"16 Vocations & Work","wiki.tabTarot":"78 Arcana Tarot","wiki.tabMarriage":"Social & Marriage","wiki.tabCommands":"Commands Catalog","wiki.tabFaq":"Questions & FAQ","wiki.searchPlaceholder":"Press Ctrl+K or type to search commands...","wiki.copied":"Copied to clipboard!","wiki.copyBtn":"Copy command","shopee.title":"Pyxie's Finds: Cozy Setup & Stationery","shopee.subtitle":"Handpicked plushies, RGB ambiance, cyber-goth stationery and desk accessories.","shopee.cta":"Check on Shopee ➔","bonus.title":"Enchanted Reward Portal","bonus.subtitle":"Wait for the 10-second cosmic alignment to claim your daily coins.","bonus.ready":"Bonus Ready to Claim!","bonus.claim":"Claim Magic Coins ✨","bonus.claimed":"🎉 Reward claimed successfully!","footer.rights":"Pyxie © 2026 • Crafted with love for communities worldwide.","footer.terms":"Terms & Child Safety","footer.wiki":"Official Wiki","footer.bonus":"Web Bonus","footer.museum":"Art Museum"}};function ET(){const[t,e]=ae.useState(()=>{const u=new URLSearchParams(window.location.search).get("lang");if(u==="pt"||u==="en")return u;const h=localStorage.getItem("pyxie_lang");return h==="pt"||h==="en"?h:navigator.language&&navigator.language.startsWith("en")?"en":"pt"}),[n,i]=ae.useState({guilds:18,users:2450,uptime:"99.9%"}),r=l=>{var u,h;return((u=Mm[t])==null?void 0:u[l])||((h=Mm.pt)==null?void 0:h[l])||l};ae.useEffect(()=>{const l=new my({duration:1.2,easing:p=>Math.min(1,1.001-Math.pow(2,-10*p)),orientation:"vertical",gestureOrientation:"vertical",smoothWheel:!0,wheelMultiplier:1,touchMultiplier:2});function u(p){l.raf(p),requestAnimationFrame(u)}const h=requestAnimationFrame(u);return()=>{cancelAnimationFrame(h),l.destroy()}},[]),ae.useEffect(()=>{fetch("/api/stats").then(l=>l.json()).then(l=>{l&&l.success&&i({guilds:l.guilds||18,users:l.users||2450,uptime:l.uptimeFormatted||"99.9%"})}).catch(()=>{fetch("/api/status").then(l=>l.json()).then(l=>{l&&l.online&&i(u=>({...u,guilds:l.guilds||u.guilds}))}).catch(()=>{})})},[]),ae.useEffect(()=>{document.documentElement.lang=t==="pt"?"pt-BR":"en"},[t]);const s=window.location.pathname.toLowerCase();let a=vT,o="";if(s.includes("wiki"))a=_T;else if(s.includes("museu")||s.includes("museum"))a=ST;else if(s.includes("bonus"))a=wT;else if(s.startsWith("/u/")||s.includes("/u/")){a=MT;const l=window.location.pathname.split(/\/u\/?/i);l.length>1&&(o=l[1].split("/")[0])}return c.jsxs("div",{className:"bg-[#080410] text-slate-100 min-h-screen flex flex-col font-sans selection:bg-pink-500 selection:text-white relative overflow-x-hidden",children:[c.jsxs("div",{className:"fixed inset-0 pointer-events-none z-0 overflow-hidden",children:[c.jsx("div",{className:"absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[128px]"}),c.jsx("div",{className:"absolute top-[30%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px]"}),c.jsx("div",{className:"absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-[120px]"})]}),c.jsxs("div",{className:"relative z-10 flex flex-col min-h-screen",children:[c.jsx(qy,{lang:t,setLang:e,t:r}),c.jsx("main",{className:"flex-1",children:c.jsx(a,{t:r,lang:t,stats:n,userId:o})}),c.jsx($y,{t:r})]})]})}const Em=document.getElementById("pyxie-app")||document.getElementById("root");Em?(window.__PYXIE_REACT_ACTIVE__=!0,iu.createRoot(Em).render(c.jsx(Yx.StrictMode,{children:c.jsx(ET,{})}))):console.warn("[Pyxie] Mounting container #pyxie-app or #root not found.");
