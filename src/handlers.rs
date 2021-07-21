use super::comment::Comment;
use super::doctype::Doctype;
use super::document_end::DocumentEnd;
use super::element::Element;
use super::text_chunk::TextChunk;
use super::*;
use js_sys::{Function as JsFunction, Promise as JsPromise};
use lol_html::{
    DocumentContentHandlers as NativeDocumentContentHandlers,
    ElementContentHandlers as NativeElementContentHandlers,
};
use std::mem;
use thiserror::Error;
use wasm_bindgen::JsCast;

// NOTE: Display is noop, because we'll unwrap JSValue error when it will be propagated to
// `write()` or `end()`.
#[derive(Error, Debug)]
#[error("JS handler error")]
pub struct HandlerJsErrorWrap(pub JsValue);
// Probably horribly unsafe, but it works™
unsafe impl Send for HandlerJsErrorWrap {}
unsafe impl Sync for HandlerJsErrorWrap {}

#[wasm_bindgen(raw_module = "./asyncify.js")]
extern "C" {
    #[wasm_bindgen(js_name = awaitPromise)]
    fn await_promise(stack_ptr: *mut u8, promise: &JsPromise);
}

macro_rules! make_handler {
    ($handler:ident, $JsArgType:ident, $stack_ptr:ident) => {
        move |arg: &mut _| {
            let (js_arg, anchor) = $JsArgType::from_native(arg);
            let this = JsValue::NULL;
            let js_arg = JsValue::from(js_arg);

            let res = match $handler.call1(&this, &js_arg) {
                Ok(res) => {
                    if let Some(promise) = res.dyn_ref::<JsPromise>() {
                        await_promise($stack_ptr, promise);
                    }
                    Ok(())
                }
                Err(e) => Err(HandlerJsErrorWrap(e).into()),
            };

            mem::drop(anchor);

            res
        }
    };
}

pub trait IntoNativeHandlers<T> {
    fn into_native(self, stack_ptr: *mut u8) -> T;
}

#[wasm_bindgen]
extern "C" {
    pub type ElementContentHandlers;

    #[wasm_bindgen(method, getter)]
    fn element(this: &ElementContentHandlers) -> Option<JsFunction>;

    #[wasm_bindgen(method, getter)]
    fn comments(this: &ElementContentHandlers) -> Option<JsFunction>;

    #[wasm_bindgen(method, getter)]
    fn text(this: &ElementContentHandlers) -> Option<JsFunction>;
}

impl IntoNativeHandlers<NativeElementContentHandlers<'static>> for ElementContentHandlers {
    fn into_native(self, stack_ptr: *mut u8) -> NativeElementContentHandlers<'static> {
        let mut native = NativeElementContentHandlers::default();

        if let Some(handler) = self.element() {
            native = native.element(make_handler!(handler, Element, stack_ptr));
        }

        if let Some(handler) = self.comments() {
            native = native.comments(make_handler!(handler, Comment, stack_ptr));
        }

        if let Some(handler) = self.text() {
            native = native.text(make_handler!(handler, TextChunk, stack_ptr));
        }

        native
    }
}

#[wasm_bindgen]
extern "C" {
    pub type DocumentContentHandlers;

    #[wasm_bindgen(method, getter)]
    fn doctype(this: &DocumentContentHandlers) -> Option<JsFunction>;

    #[wasm_bindgen(method, getter)]
    fn comments(this: &DocumentContentHandlers) -> Option<JsFunction>;

    #[wasm_bindgen(method, getter)]
    fn text(this: &DocumentContentHandlers) -> Option<JsFunction>;

    #[wasm_bindgen(method, getter)]
    fn end(this: &DocumentContentHandlers) -> Option<JsFunction>;
}

impl IntoNativeHandlers<NativeDocumentContentHandlers<'static>> for DocumentContentHandlers {
    fn into_native(self, stack_ptr: *mut u8) -> NativeDocumentContentHandlers<'static> {
        let mut native = NativeDocumentContentHandlers::default();

        if let Some(handler) = self.doctype() {
            native = native.doctype(make_handler!(handler, Doctype, stack_ptr));
        }

        if let Some(handler) = self.comments() {
            native = native.comments(make_handler!(handler, Comment, stack_ptr));
        }

        if let Some(handler) = self.text() {
            native = native.text(make_handler!(handler, TextChunk, stack_ptr));
        }

        if let Some(handler) = self.end() {
            native = native.end(make_handler!(handler, DocumentEnd, stack_ptr));
        }

        native
    }
}
