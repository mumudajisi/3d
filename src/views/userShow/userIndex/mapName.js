import china from "@/assets/mapJson/china.json";
import siChuan from "@/assets/mapJson/siChuan.json"
import suZhou from "@/assets/mapJson/suZhou.json"
import wuZhong from "@/assets/mapJson/wuZhong.json"
import yunNan from "@/assets/mapJson/yunNan.json"
import guangDong from "@/assets/mapJson/guangDong.json"
import shangHai from "@/assets/mapJson/shangHai.json"
import huBei from "@/assets/mapJson/huBei.json"
import beiJing from "@/assets/mapJson/beiJing.json"
import heBei from "@/assets/mapJson/heBei.json"

const mapDict = {
    "siChuan": "siChuan", // 四川
    "suZhou": "suZhou", // 苏州
    "wuZhong": "wuZhong", // 吴中
    "yunNan": "yunNan", // 云南
    "guangDong": "guangDong", // 广东
    "shangHai": "shangHai", // 上海
    "huBei": "huBei", // 湖北
    "beiJing": "beiJing", // 北京
    "heBei": "heBei", // 河北
}

const mapData = {
    siChuan,
    suZhou,
    wuZhong,
    yunNan,
    guangDong,
    shangHai,
    huBei,
    beiJing,
    heBei,
}

export function getMap(mapName) {
    const cityName = mapDict[mapName]
    if (cityName) {
        return [cityName, mapData[cityName]]
    }
    return ["china", china]
}
