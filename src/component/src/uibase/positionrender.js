/**
 * @fileOverview position and visible extension，可定位的隐藏层
 * @author  yiminghe@gmail.com
 */
KISSY.add("component/uibase/positionrender", function () {

    var Z_INDEX = 9999;

    function Position() {
    }

    Position.ATTRS = {
        x:{
            // 水平方向绝对位置
            valueFn:function () {
                var self = this;
                // 读到这里时，el 一定是已经加到 dom 树中了，否则报未知错误
                // el 不在 dom 树中 offset 报错的
                // 最早读就是在 syncUI 中，一点重复设置(读取自身 X 再调用 _uiSetX)无所谓了
                return self.get("el") && self.get("el").offset().left;
            }
        },
        y:{
            // 垂直方向绝对位置
            valueFn:function () {
                var self = this;
                return self.get("el") && self.get("el").offset().top;
            }
        },
        Z_INDEX:{
            value:Z_INDEX
        }
    };


    Position.prototype = {

        __createDom:function () {
            this.get("el").addClass("ks-ext-position");
        },

        _uiSetZ_INDEX:function (x) {
            this.get("el").css("z-index", x);
        },

        _uiSetX:function (x) {
            if (x != null) {
                this.get("el").offset({
                    left:x
                });
            }
        },

        _uiSetY:function (y) {
            if (y != null) {
                this.get("el").offset({
                    top:y
                });
            }
        }
    };

    return Position;
});