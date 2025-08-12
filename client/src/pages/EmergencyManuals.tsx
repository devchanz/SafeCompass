import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/utils/i18n";
import { useLanguage } from "@/contexts/LanguageContext";

export default function EmergencyManuals() {
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  
  const { t } = useTranslation(language);

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