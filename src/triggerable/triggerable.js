/**
 * Triggerable
 * @module      triggerable
 * @creator     ��<lifesinger@gmail.com>
 * @depends     kissy-core, yahoo-dom-event, event-mouseenter
 */
KISSY.add("triggerable", function(S) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
        BEFORE_SWITCH = "beforeSwitch",
        ON_SWITCH = "onSwitch";

    /**
     * Triggerable
     * @constructor
     * Լ����
     *   - this.config.triggerType   �������͡�Ĭ��Ϊ mouse
     *   - this.config.triggerDelay  �����ӳ١�Ĭ��Ϊ 0.1s
     *   - this.triggers
     *   - this.panels
     *   - this.activeIndex
     */
    function Triggerable() {
    }

    S.mix(Triggerable.prototype, {

        /**
         * ��ʼ�� triggers
         */
        _initTriggers: function() {
            var self = this;
            
            // create custom events
            self.createEvent(BEFORE_SWITCH);
            self.createEvent(ON_SWITCH);

            // bind triggers events
            self._bindTriggers();
        },

        /**
         * �� triggers �����¼�

         */
        _bindTriggers: function() {
            var self = this,
                cfg = self.config, triggers = self.triggers,
                i, len = triggers.length, trigger;

            for (i = 0; i < len; i++) {
                (function(index) {
                    trigger = triggers[index];

                    // ��Ӧ����� Tab ��
                    Event.on(trigger, "click", function() {
                        self._onFocusTrigger(index);
                    });
                    Event.on(trigger, "focus", function() {
                        self._onFocusTrigger(index);
                    });

                    // ��Ӧ�������
                    if (cfg.triggerType === "mouse") {
                        Event.on(trigger, "mouseenter", function() {
                            self._onMouseEnterTrigger(index);
                        });
                        Event.on(trigger, "mouseleave", function() {
                            self._onMouseLeaveTrigger(index);
                        });
                    }
                })(i);
            }
        },

        /**
         * click or tab ������ trigger ʱ�������¼�
         * @protected
         */
        _onFocusTrigger: function(index) {
            var self = this;
            if(self.activeIndex === index) return; // �ظ����
            if(self.showTimer) self.showTimer.cancel(); // ���磺�������������̵������ʱ�����¼�����ȡ����
            self.switchTo(index);
        },

        /**
         * ��������� trigger ��ʱ�������¼�
         * @protected
         */
        _onMouseEnterTrigger: function(index) {
            //S.log("Triggerable._onMouseEnterTrigger: index = " + index);
            var self = this;

            // ���ظ����������磺����ʾ����ʱ���������ٻ����ٻ����������ش���
            if (self.activeIndex !== index) {
                self.showTimer = Lang.later(self.config.triggerDelay * 1000, self, function() {
                    self.switchTo(index);
                });
            }
        },

        /**
         * ����Ƴ� trigger ʱ�������¼�
         * @protected
         */
        _onMouseLeaveTrigger: function() {
            var self = this;
            if (self.showTimer) self.showTimer.cancel();
        },

        /**
         * �л�����
         */
        switchTo: function(index) {
            var self = this, cfg = self.config,
                activeIndex  =self.activeIndex,
                triggers = self.triggers,
                panels = self.panels,
                fromPanel = panels[self.activeIndex],
                toPanel = panels[index];

            //S.log("Triggerable.switchTo: index = " + index);

            // fire beforeSwitch
            if(!self.fireEvent(BEFORE_SWITCH, index)) return self;
            // TODO: YUI 2.8.0r4 bug - don't pass multi args correctly
            //if(!self.fireEvent(BEFORE_SWITCH, fromPanel, toPanel, index)) return self;

            // �л� active trigger
            if(activeIndex >= 0) { // �п���Ϊ -1, ��ʾû�е�ǰ��
                Dom.removeClass(triggers[activeIndex], cfg.activeTriggerCls);
            }
            Dom.addClass(triggers[index], cfg.activeTriggerCls);

            // �����ӳ�����
            if (self.loadCustomLazyData && toPanel.nodeType === 1) {
                self.loadCustomLazyData(toPanel);
            }

            // �л� content
            self._switchContent(fromPanel, toPanel, index);

            // ���� activeIndex
            self.activeIndex = index;

            return self; // chain
        },

        /**
         * �л�����
         * @protected
         */
        _switchContent: function(fromPanel, toPanel, index) {
            var self = this;

            // ��򵥵��л�Ч����ֱ������/��ʾ
            fromPanel.style.display = "none";
            toPanel.style.display = "block";

            // fire onSwitch
            self.fireEvent(ON_SWITCH, index);
            // TODO: see above TODO
            //self.fireEvent(ON_SWITCH, toPanel, index);
        }
    });

    S.augment(Triggerable, Y.EventProvider);
    if(S.DataLazyload) {
        S.augment(Triggerable, S.DataLazyload, true, ["loadCustomLazyData"]);
    }

    S.Triggerable = Triggerable;
});