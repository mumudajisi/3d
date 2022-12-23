//    获取积分
import scoreApi from "@/api/score";
export function amberBuried(item) {
    const params = {
        busiCode: "1001",
        bizCode: "1002",
        postScript: item.postScript,
        resourceId: item.resourceId,
        score: item.score || 1,
        remark: item.remark,
        scoreMode: item.scoreMode,
        scoreType: item.scoreType,
        tranCode: 361901,
    }
    scoreApi.integralAdd(params).then(res => {

    })
}
