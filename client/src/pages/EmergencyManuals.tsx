import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

export default function EmergencyManuals() {
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  
  const getText = (key: string) => {
    const texts: Record<string, Record<string, string>> = {
      ko: {
        title: '📋 재난별 응급 매뉴얼',
        subtitle: '각 재난 유형별 대응 방법을 확인하세요',
        back_to_dashboard: '대시보드로 돌아가기',
        earthquake: '지진',
        earthquake_desc: '지진 발생 시 대응 방법',
        fire: '화재',
        fire_desc: '화재 발생 시 대응 방법',
        flood: '홍수',
        flood_desc: '홍수 발생 시 대응 방법',
        typhoon: '태풍',
        typhoon_desc: '태풍 발생 시 대응 방법',
        landslide: '산사태',
        landslide_desc: '산사태 발생 시 대응 방법',
        gas_leak: '가스누출',
        gas_leak_desc: '가스 누출 시 대응 방법',
        terror: '테러',
        terror_desc: '테러 발생 시 대응 방법',
        blackout: '정전',
        blackout_desc: '대규모 정전 시 대응 방법',
        chemical: '화학사고',
        chemical_desc: '화학 사고 발생 시 대응 방법',
        nuclear: '원자력사고',
        nuclear_desc: '원자력 사고 발생 시 대응 방법',
        cold_wave: '한파',
        cold_wave_desc: '한파 발생 시 대응 방법',
        heat_wave: '폭염',
        heat_wave_desc: '폭염 발생 시 대응 방법',
        coming_soon: '곧 출시 예정',
        manual_placeholder: '이 매뉴얼은 현재 준비 중입니다'
      },
      en: {
        title: '📋 Emergency Manuals by Disaster Type',
        subtitle: 'Check response methods for each disaster type',
        back_to_dashboard: 'Back to Dashboard',
        earthquake: 'Earthquake',
        earthquake_desc: 'Response methods during earthquakes',
        fire: 'Fire',
        fire_desc: 'Response methods during fires',
        flood: 'Flood',
        flood_desc: 'Response methods during floods',
        typhoon: 'Typhoon',
        typhoon_desc: 'Response methods during typhoons',
        landslide: 'Landslide',
        landslide_desc: 'Response methods during landslides',
        gas_leak: 'Gas Leak',
        gas_leak_desc: 'Response methods during gas leaks',
        terror: 'Terrorism',
        terror_desc: 'Response methods during terrorist attacks',
        blackout: 'Blackout',
        blackout_desc: 'Response methods during blackouts',
        chemical: 'Chemical Accident',
        chemical_desc: 'Response methods during chemical accidents',
        nuclear: 'Nuclear Accident',
        nuclear_desc: 'Response methods during nuclear accidents',
        cold_wave: 'Cold Wave',
        cold_wave_desc: 'Response methods during cold waves',
        heat_wave: 'Heat Wave',
        heat_wave_desc: 'Response methods during heat waves',
        coming_soon: 'Coming Soon',
        manual_placeholder: 'This manual is currently being prepared'
      },
      vi: {
        title: '📋 Sổ tay Khẩn cấp theo Loại Thảm họa',
        subtitle: 'Kiểm tra phương pháp ứng phó cho từng loại thảm họa',
        back_to_dashboard: 'Quay về Bảng điều khiển',
        earthquake: 'Động đất',
        earthquake_desc: 'Phương pháp ứng phó khi động đất',
        fire: 'Hỏa hoạn',
        fire_desc: 'Phương pháp ứng phó khi hỏa hoạn',
        flood: 'Lũ lụt',
        flood_desc: 'Phương pháp ứng phó khi lũ lụt',
        typhoon: 'Bão',
        typhoon_desc: 'Phương pháp ứng phó khi bão',
        landslide: 'Sạt lở đất',
        landslide_desc: 'Phương pháp ứng phó khi sạt lở đất',
        gas_leak: 'Rò rỉ Khí gas',
        gas_leak_desc: 'Phương pháp ứng phó khi rò rỉ khí gas',
        terror: 'Khủng bố',
        terror_desc: 'Phương pháp ứng phó khi khủng bố',
        blackout: 'Mất điện',
        blackout_desc: 'Phương pháp ứng phó khi mất điện',
        chemical: 'Tai nạn Hóa chất',
        chemical_desc: 'Phương pháp ứng phó khi tai nạn hóa chất',
        nuclear: 'Tai nạn Hạt nhân',
        nuclear_desc: 'Phương pháp ứng phó khi tai nạn hạt nhân',
        cold_wave: 'Rét đậm',
        cold_wave_desc: 'Phương pháp ứng phó khi rét đậm',
        heat_wave: 'Nắng nóng',
        heat_wave_desc: 'Phương pháp ứng phó khi nắng nóng',
        coming_soon: 'Sắp ra mắt',
        manual_placeholder: 'Sổ tay này hiện đang được chuẩn bị'
      },
      zh: {
        title: '📋 各类灾害应急手册',
        subtitle: '查看各种灾害类型的应对方法',
        back_to_dashboard: '返回仪表板',
        earthquake: '地震',
        earthquake_desc: '地震发生时的应对方法',
        fire: '火灾',
        fire_desc: '火灾发生时的应对方法',
        flood: '洪水',
        flood_desc: '洪水发生时的应对方法',
        typhoon: '台风',
        typhoon_desc: '台风发生时的应对方法',
        landslide: '山体滑坡',
        landslide_desc: '山体滑坡发生时的应对方法',
        gas_leak: '燃气泄漏',
        gas_leak_desc: '燃气泄漏时的应对方法',
        terror: '恐怖袭击',
        terror_desc: '恐怖袭击发生时的应对方法',
        blackout: '停电',
        blackout_desc: '大规模停电时的应对方法',
        chemical: '化学事故',
        chemical_desc: '化学事故发生时的应对方法',
        nuclear: '核事故',
        nuclear_desc: '核事故发生时的应对方法',
        cold_wave: '寒潮',
        cold_wave_desc: '寒潮发生时的应对方法',
        heat_wave: '热浪',
        heat_wave_desc: '热浪发生时的应对方法',
        coming_soon: '即将推出',
        manual_placeholder: '此手册正在准备中'
      }
    };
    return texts[language]?.[key] || texts['ko'][key] || key;
  };

  const manualCategories = [
    {
      id: 'natural',
      title: language === 'ko' ? '자연재해' : 
             language === 'en' ? 'Natural Disasters' : 
             language === 'vi' ? 'Thảm họa Tự nhiên' : 
             '自然灾害',
      icon: '🌍',
      color: 'bg-green-100 border-green-300 hover:bg-green-200',
      items: [
        { key: 'earthquake', icon: '🏚️', severity: 'critical' },
        { key: 'flood', icon: '🌊', severity: 'high' },
        { key: 'typhoon', icon: '🌀', severity: 'high' },
        { key: 'landslide', icon: '⛰️', severity: 'high' },
        { key: 'cold_wave', icon: '❄️', severity: 'medium' },
        { key: 'heat_wave', icon: '🌡️', severity: 'medium' }
      ]
    },
    {
      id: 'man_made',
      title: language === 'ko' ? '인적재해' : 
             language === 'en' ? 'Man-made Disasters' : 
             language === 'vi' ? 'Thảm họa Nhân tạo' : 
             '人为灾害',
      icon: '🏭',
      color: 'bg-red-100 border-red-300 hover:bg-red-200',
      items: [
        { key: 'fire', icon: '🔥', severity: 'critical' },
        { key: 'gas_leak', icon: '💨', severity: 'critical' },
        { key: 'chemical', icon: '⚗️', severity: 'critical' },
        { key: 'nuclear', icon: '☢️', severity: 'critical' },
        { key: 'blackout', icon: '💡', severity: 'medium' }
      ]
    },
    {
      id: 'social',
      title: language === 'ko' ? '사회적재해' : 
             language === 'en' ? 'Social Disasters' : 
             language === 'vi' ? 'Thảm họa Xã hội' : 
             '社会灾害',
      icon: '🏢',
      color: 'bg-orange-100 border-orange-300 hover:bg-orange-200',
      items: [
        { key: 'terror', icon: '🚨', severity: 'critical' }
      ]
    }
  ];

  const getSeverityBadge = (severity: string) => {
    const config = {
      critical: { 
        color: 'bg-red-600 text-white', 
        text: language === 'ko' ? '매우위험' : 
              language === 'en' ? 'Critical' : 
              language === 'vi' ? 'Rất nguy hiểm' : 
              '极危险'
      },
      high: { 
        color: 'bg-orange-500 text-white', 
        text: language === 'ko' ? '위험' : 
              language === 'en' ? 'High Risk' : 
              language === 'vi' ? 'Nguy hiểm' : 
              '危险'
      },
      medium: { 
        color: 'bg-yellow-500 text-white', 
        text: language === 'ko' ? '주의' : 
              language === 'en' ? 'Medium Risk' : 
              language === 'vi' ? 'Cảnh báo' : 
              '注意'
      }
    };
    return config[severity as keyof typeof config] || config.medium;
  };

  const handleManualClick = (manualKey: string) => {
    // 현재는 UI만 구현하므로 바로 대시보드로 이동
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {getText('title')}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {getText('subtitle')}
              </p>
            </div>
            <Button 
              onClick={() => setLocation('/')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <i className="fas fa-arrow-left" aria-hidden="true"></i>
              {getText('back_to_dashboard')}
            </Button>
          </div>
        </div>

        {/* Manual Categories */}
        <div className="space-y-8">
          {manualCategories.map((category) => (
            <Card key={category.id} className={`${category.color} transition-all duration-200`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <span className="text-2xl">{category.icon}</span>
                  {category.title}
                  <Badge variant="secondary" className="ml-2">
                    {category.items.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.items.map((item) => {
                    const severityConfig = getSeverityBadge(item.severity);
                    return (
                      <Card 
                        key={item.key}
                        className="bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-blue-300"
                        onClick={() => handleManualClick(item.key)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-3xl">{item.icon}</span>
                              <div>
                                <CardTitle className="text-lg">
                                  {getText(item.key)}
                                </CardTitle>
                                <Badge className={`${severityConfig.color} text-xs mt-1`}>
                                  {severityConfig.text}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {getText(`${item.key}_desc`)}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {getText('coming_soon')}
                            </Badge>
                            <i className="fas fa-arrow-right text-blue-600" aria-hidden="true"></i>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <i className="fas fa-info-circle text-blue-600 dark:text-blue-400" aria-hidden="true"></i>
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                  {language === 'ko' ? '개발 진행 중' : 
                   language === 'en' ? 'Under Development' : 
                   language === 'vi' ? 'Đang phát triển' : 
                   '开发中'}
                </h3>
              </div>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                {getText('manual_placeholder')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}