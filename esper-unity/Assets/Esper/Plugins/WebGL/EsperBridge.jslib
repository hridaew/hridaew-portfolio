mergeInto(LibraryManager.library, {
  EsperEmit: function (evt, payload) {
    var detail = { event: UTF8ToString(evt), payload: UTF8ToString(payload) };
    window.dispatchEvent(new CustomEvent("esper", { detail: detail }));
  },
});
