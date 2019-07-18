const express = require('express');
const router = express.Router();

const checkToken = require('../middleware/checkToken');
//Self-descriptive 함을 만족하기 위해 response를 잘 처리해주어야한다.

const locationController = require('../controllers/locationController');

//get all gps location stored in DB
router.get('/',locationController.location_get_all);
//router와 controller을 분리

//.post() 와 같은 메소드의 파라미터로 넘어가는 건 순서대로 실행된다
//중간에 넣고 싶은 메소드가 있으면 넣어준다

//register a gps location in DB
//authorization required
router.post('/',checkToken, locationController.location_register);

//:productID 는 변수명, 추출가능, 쿼리스트링 같은거임
//get information of a single specific gps location
router.get('/:locationID',locationController.location_get_one_info);

//따로 return 할 필요가 없다 뒤에 코드가 없어서, 뒤에 코드가 더 있다면 return으로 설정해주자
//edit information of a single specific gps location
//authorization required
router.put('/:locationID',checkToken, locationController.location_edit_info);

//delete data of a single specific gps location
//authorization required
router.delete('/:locationID',checkToken, locationController.location_delete_one);

module.exports=router;