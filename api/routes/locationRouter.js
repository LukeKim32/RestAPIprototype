const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

/** Login 성공 시 토큰 발행 */
const checkToken = require('../middleware/checkToken');


/** DB 내 모든 location 데이터 가져옴 */
router.get('/',locationController.location_get_all);


/** User가 보낸 새 location 데이터 => DB에 저장 
 * 로그인 필요 (토큰 인증)
 * 메소드의 퍼리미터 순서대로(--->) 실행
*/
router.post('/',checkToken, locationController.location_register);


/** User가 보낸 데이터 id => DB에 해당 데이터 가져옴 */
router.get('/:locationID',locationController.location_get_one_info);


/** User가 보낸 수정할 데이터 & id ==> DB에 변경, 저장
 * 로그인 필요 (토큰 인증)
 */
router.put('/:locationID',checkToken, locationController.location_edit_info);


/** User가 보낸 데이터 id ==> DB에서 삭제
 * 로그인 필요 (토큰 인증)
*/
router.delete('/:locationID',checkToken, locationController.location_delete_one);

module.exports=router;