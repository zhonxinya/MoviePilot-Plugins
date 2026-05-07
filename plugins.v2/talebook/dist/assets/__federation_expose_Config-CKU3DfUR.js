import { importShared } from './__federation_fn_import-JrT3xvdd.js';
import { _ as _export_sfc } from './_plugin-vue_export-helper-pcqpp-6-.js';

const {defineComponent:_defineComponent} = await importShared('vue');

const {createTextVNode:_createTextVNode,resolveComponent:_resolveComponent,withCtx:_withCtx,createVNode:_createVNode,toDisplayString:_toDisplayString,openBlock:_openBlock,createBlock:_createBlock,createCommentVNode:_createCommentVNode,withModifiers:_withModifiers} = await importShared('vue');

const {ref,onMounted} = await importShared('vue');

const PLUGIN_ID = "Talebook";
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
      username: "",
      password: "",
      verify_ssl: true
      // 默认启用 SSL 验证
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
                username: response.data.username || "",
                password: response.data.password || "",
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
        if (!config.value.username || !config.value.password) {
          showSaveMessage("error", "用户名和密码不能为空");
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
      testing.value = true;
      testResult.value = null;
      try {
        const testUrl = `${config.value.server_url}/api/search?name=test`;
        const response = await fetch(testUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        });
        if (response.ok) {
          testResult.value = {
            success: true,
            message: "连接成功!可以正常访问 Talebook 服务器"
          };
        } else {
          testResult.value = {
            success: false,
            message: `连接失败: HTTP ${response.status}`
          };
        }
      } catch (error) {
        testResult.value = {
          success: false,
          message: `连接失败: ${error instanceof Error ? error.message : "未知错误"}`
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
      const _component_v_col = _resolveComponent("v-col");
      const _component_v_row = _resolveComponent("v-row");
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
                    default: _withCtx(() => [..._cache[6] || (_cache[6] = [
                      _createTextVNode("mdi-cog-outline", -1)
                    ])]),
                    _: 1
                  }),
                  _cache[7] || (_cache[7] = _createTextVNode(" Talebook 插件配置 ", -1))
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
                        label: "Talebook 服务器地址",
                        placeholder: "http://192.168.1.100:8080",
                        "prepend-inner-icon": "mdi-server",
                        variant: "outlined",
                        class: "mb-4",
                        rules: [rules.required, rules.url]
                      }, null, 8, ["modelValue", "rules"]),
                      _createVNode(_component_v_row, null, {
                        default: _withCtx(() => [
                          _createVNode(_component_v_col, {
                            cols: "12",
                            md: "6"
                          }, {
                            default: _withCtx(() => [
                              _createVNode(_component_v_text_field, {
                                modelValue: config.value.username,
                                "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => config.value.username = $event),
                                label: "用户名",
                                "prepend-inner-icon": "mdi-account",
                                variant: "outlined",
                                rules: [rules.required]
                              }, null, 8, ["modelValue", "rules"])
                            ]),
                            _: 1
                          }),
                          _createVNode(_component_v_col, {
                            cols: "12",
                            md: "6"
                          }, {
                            default: _withCtx(() => [
                              _createVNode(_component_v_text_field, {
                                modelValue: config.value.password,
                                "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => config.value.password = $event),
                                label: "密码",
                                type: "password",
                                "prepend-inner-icon": "mdi-lock",
                                variant: "outlined",
                                rules: [rules.required]
                              }, null, 8, ["modelValue", "rules"])
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }),
                      _createVNode(_component_v_switch, {
                        modelValue: config.value.verify_ssl,
                        "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => config.value.verify_ssl = $event),
                        label: "启用 SSL 证书验证",
                        hint: "如果 Talebook 使用自签名证书,请关闭此选项",
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
                            default: _withCtx(() => [..._cache[8] || (_cache[8] = [
                              _createTextVNode("mdi-connection", -1)
                            ])]),
                            _: 1
                          }),
                          _cache[9] || (_cache[9] = _createTextVNode(" 连接测试 ", -1))
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
                            default: _withCtx(() => [..._cache[10] || (_cache[10] = [
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

const Config = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-2650cbc2"]]);

export { Config as default };
