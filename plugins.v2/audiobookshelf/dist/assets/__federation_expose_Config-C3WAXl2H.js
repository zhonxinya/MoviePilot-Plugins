import { importShared } from './__federation_fn_import-DxkyMxrD.js';
import { _ as _export_sfc } from './_plugin-vue_export-helper-pcqpp-6-.js';

const {defineComponent:_defineComponent} = await importShared('vue');

const {createTextVNode:_createTextVNode,resolveComponent:_resolveComponent,withCtx:_withCtx,createVNode:_createVNode,toDisplayString:_toDisplayString,openBlock:_openBlock,createBlock:_createBlock,createCommentVNode:_createCommentVNode,withModifiers:_withModifiers} = await importShared('vue');

const {ref,onMounted} = await importShared('vue');

const PLUGIN_ID = "Audiobookshelf";
const _sfc_main = /* @__PURE__ */ _defineComponent({
  __name: "Config",
  props: {
    model: {
      type: Object,
      default: () => ({})
    },
    api: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ["update:model"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const config = ref({
      enabled: false,
      server_url: "",
      api_key: "",
      verify_ssl: true
    });
    const isLoading = ref(false);
    const isSaving = ref(false);
    const saveMessage = ref("");
    const saveMessageType = ref("info");
    const testing = ref(false);
    const testResult = ref(null);
    const rules = {
      required: (value) => !!value || "此项为必填项",
      url: (value) => {
        if (!value) return true;
        try {
          new URL(value);
          return true;
        } catch {
          return "请输入有效的 URL 地址";
        }
      }
    };
    async function loadConfig() {
      isLoading.value = true;
      try {
        if (props.model && Object.keys(props.model).length > 0) {
          config.value = { ...config.value, ...props.model };
          console.log("[Config] 从 props 加载配置:", config.value);
        } else {
          try {
            const response = await props.api.get(`plugin/${PLUGIN_ID}/config`);
            if (response.code === 200 && response.data) {
              config.value = {
                enabled: response.data.enabled || false,
                server_url: response.data.server_url || "",
                api_key: response.data.api_key || "",
                verify_ssl: response.data.verify_ssl !== void 0 ? response.data.verify_ssl : true
              };
              console.log("[Config] 从 API 加载配置:", config.value);
            }
          } catch (apiError) {
            console.warn("[Config] API 获取配置失败，使用默认值:", apiError);
          }
        }
      } catch (err) {
        console.error("[Config] 加载配置失败:", err);
      } finally {
        isLoading.value = false;
      }
    }
    async function saveConfig() {
      isSaving.value = true;
      saveMessage.value = "";
      try {
        if (!config.value.server_url) {
          showSaveMessage("error", "服务器地址不能为空");
          isSaving.value = false;
          return;
        }
        if (!isValidUrl(config.value.server_url)) {
          showSaveMessage("error", "服务器地址格式不正确");
          isSaving.value = false;
          return;
        }
        if (!config.value.api_key) {
          showSaveMessage("error", "API 密钥不能为空");
          isSaving.value = false;
          return;
        }
        const response = await props.api.post(`plugin/${PLUGIN_ID}/config`, config.value);
        if (response.code === 200) {
          showSaveMessage("success", "配置保存成功");
          emit("update:model", config.value);
        } else {
          showSaveMessage("error", response.message || "保存失败");
        }
      } catch (error) {
        console.error("[Config] 保存配置失败:", error);
        showSaveMessage("error", error.message || "保存失败");
      } finally {
        isSaving.value = false;
      }
    }
    function showSaveMessage(type, message) {
      saveMessageType.value = type;
      saveMessage.value = message;
      setTimeout(() => {
        saveMessage.value = "";
      }, 3e3);
    }
    function isValidUrl(url) {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    }
    async function testConnection() {
      if (!config.value.server_url) {
        testResult.value = {
          success: false,
          message: "请先填写服务器地址"
        };
        return;
      }
      if (!config.value.api_key) {
        testResult.value = {
          success: false,
          message: "请先填写 API 密钥"
        };
        return;
      }
      testing.value = true;
      testResult.value = null;
      try {
        await saveConfig();
        const response = await props.api.get(`plugin/${PLUGIN_ID}/libraries`);
        if (response.code === 200) {
          const libraries = response.data?.libraries || [];
          testResult.value = {
            success: true,
            message: `✅ 连接成功! 找到 ${libraries.length} 个库`
          };
        } else {
          testResult.value = {
            success: false,
            message: `❌ 请求失败: ${response.message}`
          };
        }
      } catch (error) {
        console.error("[Config] 测试连接失败:", error);
        testResult.value = {
          success: false,
          message: `❌ 测试失败: ${error.message || "未知错误"}`
        };
      } finally {
        testing.value = false;
      }
    }
    onMounted(() => {
      loadConfig();
    });
    return (_ctx, _cache) => {
      const _component_v_icon = _resolveComponent("v-icon");
      const _component_v_card_title = _resolveComponent("v-card-title");
      const _component_v_divider = _resolveComponent("v-divider");
      const _component_v_alert = _resolveComponent("v-alert");
      const _component_v_switch = _resolveComponent("v-switch");
      const _component_v_text_field = _resolveComponent("v-text-field");
      const _component_v_form = _resolveComponent("v-form");
      const _component_v_btn = _resolveComponent("v-btn");
      const _component_v_card_text = _resolveComponent("v-card-text");
      const _component_v_card = _resolveComponent("v-card");
      const _component_v_spacer = _resolveComponent("v-spacer");
      const _component_v_card_actions = _resolveComponent("v-card-actions");
      const _component_v_container = _resolveComponent("v-container");
      return _openBlock(), _createBlock(_component_v_container, {
        fluid: "",
        class: "pa-6"
      }, {
        default: _withCtx(() => [
          _createVNode(_component_v_card, {
            elevation: "2",
            loading: isLoading.value
          }, {
            default: _withCtx(() => [
              _createVNode(_component_v_card_title, { class: "text-h5 font-weight-bold" }, {
                default: _withCtx(() => [
                  _createVNode(_component_v_icon, {
                    start: "",
                    color: "primary"
                  }, {
                    default: _withCtx(() => [..._cache[5] || (_cache[5] = [
                      _createTextVNode("mdi-cog-outline", -1)
                    ])]),
                    _: 1
                  }),
                  _cache[6] || (_cache[6] = _createTextVNode(" Audiobookshelf 插件配置 ", -1))
                ]),
                _: 1
              }),
              _createVNode(_component_v_divider),
              _createVNode(_component_v_card_text, null, {
                default: _withCtx(() => [
                  saveMessage.value ? (_openBlock(), _createBlock(_component_v_alert, {
                    key: 0,
                    type: saveMessageType.value,
                    variant: "tonal",
                    density: "compact",
                    closable: "",
                    class: "mb-4",
                    "onClick:close": _cache[0] || (_cache[0] = ($event) => saveMessage.value = "")
                  }, {
                    default: _withCtx(() => [
                      _createTextVNode(_toDisplayString(saveMessage.value), 1)
                    ]),
                    _: 1
                  }, 8, ["type"])) : _createCommentVNode("", true),
                  _createVNode(_component_v_form, {
                    onSubmit: _withModifiers(saveConfig, ["prevent"])
                  }, {
                    default: _withCtx(() => [
                      _createVNode(_component_v_switch, {
                        modelValue: config.value.enabled,
                        "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => config.value.enabled = $event),
                        label: "启用插件",
                        color: "primary",
                        inset: "",
                        class: "mb-4"
                      }, null, 8, ["modelValue"]),
                      _createVNode(_component_v_text_field, {
                        modelValue: config.value.server_url,
                        "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => config.value.server_url = $event),
                        label: "Audiobookshelf 服务器地址",
                        placeholder: "http://192.168.1.100:3000",
                        "prepend-inner-icon": "mdi-server",
                        variant: "outlined",
                        class: "mb-4",
                        rules: [rules.required, rules.url]
                      }, null, 8, ["modelValue", "rules"]),
                      _createVNode(_component_v_text_field, {
                        modelValue: config.value.api_key,
                        "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => config.value.api_key = $event),
                        label: "API 密钥",
                        placeholder: "在 Audiobookshelf 设置中获取",
                        "prepend-inner-icon": "mdi-key",
                        type: "password",
                        variant: "outlined",
                        class: "mb-4",
                        rules: [rules.required]
                      }, null, 8, ["modelValue", "rules"]),
                      _createVNode(_component_v_switch, {
                        modelValue: config.value.verify_ssl,
                        "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => config.value.verify_ssl = $event),
                        label: "启用 SSL 证书验证",
                        hint: "如果 Audiobookshelf 使用自签名证书,请关闭此选项",
                        "persistent-hint": "",
                        color: "primary",
                        class: "mb-4"
                      }, null, 8, ["modelValue"])
                    ]),
                    _: 1
                  }),
                  config.value.server_url ? (_openBlock(), _createBlock(_component_v_card, {
                    key: 1,
                    variant: "tonal",
                    class: "mt-4"
                  }, {
                    default: _withCtx(() => [
                      _createVNode(_component_v_card_title, { class: "text-subtitle-1" }, {
                        default: _withCtx(() => [
                          _createVNode(_component_v_icon, {
                            start: "",
                            color: "primary"
                          }, {
                            default: _withCtx(() => [..._cache[7] || (_cache[7] = [
                              _createTextVNode("mdi-connection", -1)
                            ])]),
                            _: 1
                          }),
                          _cache[8] || (_cache[8] = _createTextVNode(" 连接测试 ", -1))
                        ]),
                        _: 1
                      }),
                      _createVNode(_component_v_card_text, null, {
                        default: _withCtx(() => [
                          _createVNode(_component_v_btn, {
                            color: "success",
                            variant: "tonal",
                            "prepend-icon": "mdi-test-tube",
                            loading: testing.value,
                            onClick: testConnection
                          }, {
                            default: _withCtx(() => [..._cache[9] || (_cache[9] = [
                              _createTextVNode(" 测试连接 ", -1)
                            ])]),
                            _: 1
                          }, 8, ["loading"]),
                          testResult.value ? (_openBlock(), _createBlock(_component_v_alert, {
                            key: 0,
                            type: testResult.value.success ? "success" : "error",
                            variant: "tonal",
                            density: "compact",
                            class: "mt-3"
                          }, {
                            default: _withCtx(() => [
                              _createTextVNode(_toDisplayString(testResult.value.message), 1)
                            ]),
                            _: 1
                          }, 8, ["type"])) : _createCommentVNode("", true)
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  })) : _createCommentVNode("", true)
                ]),
                _: 1
              }),
              _createVNode(_component_v_divider),
              _createVNode(_component_v_card_actions, null, {
                default: _withCtx(() => [
                  _createVNode(_component_v_spacer),
                  _createVNode(_component_v_btn, {
                    color: "primary",
                    variant: "flat",
                    "prepend-icon": "mdi-content-save",
                    loading: isSaving.value,
                    disabled: isSaving.value,
                    onClick: saveConfig
                  }, {
                    default: _withCtx(() => [
                      _createTextVNode(_toDisplayString(isSaving.value ? "保存中..." : "保存配置"), 1)
                    ]),
                    _: 1
                  }, 8, ["loading", "disabled"])
                ]),
                _: 1
              })
            ]),
            _: 1
          }, 8, ["loading"])
        ]),
        _: 1
      });
    };
  }
});

const Config = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-1c38d776"]]);

export { Config as default };
