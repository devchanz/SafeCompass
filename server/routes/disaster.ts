/**
 * 실제 긴급재난문자 API 통합 엔드포인트
 */
import { Router } from 'express';
import { disasterMessageAPI } from '../services/disasterMessageAPI.js';

const router = Router();

/**
 * 실시간 긴급재난문자 조회
 */
router.get('/messages/recent', async (req, res) => {
  try {
    const { page = 1, size = 20 } = req.query;
    const messages = await disasterMessageAPI.getRecentMessages(
      Number(page),
      Number(size)
    );
    
    res.json({
      success: true,
      data: messages,
      count: messages.length,
      apiStatus: disasterMessageAPI.getStatus()
    });
  } catch (error) {
    console.error('긴급재난문자 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '긴급재난문자 조회에 실패했습니다.',
      apiStatus: disasterMessageAPI.getStatus()
    });
  }
});

/**
 * 지진 관련 재난문자만 조회
 */
router.get('/messages/earthquake', async (req, res) => {
  try {
    const earthquakeMessages = await disasterMessageAPI.getEarthquakeMessages();
    
    res.json({
      success: true,
      data: earthquakeMessages,
      count: earthquakeMessages.length,
      apiStatus: disasterMessageAPI.getStatus()
    });
  } catch (error) {
    console.error('지진 재난문자 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '지진 재난문자 조회에 실패했습니다.'
    });
  }
});

/**
 * 특정 지역 재난문자 조회
 */
router.get('/messages/location/:location', async (req, res) => {
  try {
    const { location } = req.params;
    const messages = await disasterMessageAPI.getMessagesByLocation(location);
    
    res.json({
      success: true,
      data: messages,
      count: messages.length,
      location: location
    });
  } catch (error) {
    console.error('지역별 재난문자 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '지역별 재난문자 조회에 실패했습니다.'
    });
  }
});

/**
 * 현재 활성 재난 상황 확인
 */
router.get('/status/active', async (req, res) => {
  try {
    const activeStatus = await disasterMessageAPI.hasActiveDisaster();
    
    res.json({
      success: true,
      data: activeStatus,
      apiStatus: disasterMessageAPI.getStatus()
    });
  } catch (error) {
    console.error('활성 재난 상태 확인 오류:', error);
    res.status(500).json({
      success: false,
      error: '활성 재난 상태 확인에 실패했습니다.'
    });
  }
});

/**
 * API 상태 및 설정 확인
 */
router.get('/api/status', async (req, res) => {
  try {
    const status = disasterMessageAPI.getStatus();
    
    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('API 상태 확인 오류:', error);
    res.status(500).json({
      success: false,
      error: 'API 상태 확인에 실패했습니다.'
    });
  }
});

export default router;