"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@actions/core");
const webhook_1 = require("@slack/webhook");
const axios_1 = require("axios");
const qs = require("querystring");
(async () => {
    var _a;
    // Validate parameters
    const [productId, scheduleId, seatId, webhookUrl] = [
        "product-id",
        "schedule-id",
        "seat-id",
        "slack-incoming-webhook-url",
    ].map((name) => {
        const value = core.getInput(name);
        if (!value) {
            throw new Error(`melon-ticket-actions: Please set ${name} input parameter`);
        }
        return value;
    });
    const message = (_a = core.getInput("message")) !== null && _a !== void 0 ? _a : "티켓사세요";
    const webhook = new webhook_1.IncomingWebhook(webhookUrl);
    const res = await axios_1.default({
        method: "POST",
        url: "https://ticket.melon.com/tktapi/product/seatStateInfo.json",
        params: {
            v: "1",
        },
         headers: { // <--- 添加这一段
            'Accept': 'application/json, text/javascript, */*; q=0.01', // 尝试一个更像浏览器发送的 Accept 头
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36', // 模拟一个常见的浏览器 User-Agent
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', // 明确指定请求体格式，axios 通常会自动处理，但明确指定无害
            'X-Requested-With': 'XMLHttpRequest' // 很多网站的 AJAX 请求会带这个头
        },
        data: qs.stringify({
            prodId: productId,
            scheduleNo: scheduleId,
            seatId,
            volume: 1,
            selectedGradeVolume: 1,
        }),
    });
    // tslint:disable-next-line
    console.log("Got response: ", res.data);
    if (res.data.chkResult) {
        const link = `http://ticket.melon.com/performance/index.htm?${qs.stringify({
            prodId: productId,
        })}`;
        await webhook.send(`${message} ${link}`);
    }
})().catch((e) => {
    console.error(e.stack); // tslint:disable-line
    core.setFailed(e.message);
});
