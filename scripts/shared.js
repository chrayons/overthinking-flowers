// shared.js

function parseFlowerData(rawData) {
    return rawData.map(flower => ({
      id: String(flower.MetaphorID),
      text: flower.Metaphor,
      category: flower.Category,
      emotionalIntensity: parseFloat((flower["Emotional Intensity"] || "0").replace('%','')),
      dominantValence: flower["Dominant Valence"] || null,
      dominantEmotionName: flower["Dominant Emotion"] || null,
      emotions: {
        fear: parseFloat(flower.Fear.replace('%', '')),
        anger: parseFloat(flower.Anger.replace('%', '')),
        disgust: parseFloat(flower.Disgust.replace('%', '')),
        pessimism: parseFloat(flower.Pessimism.replace('%', '')),
        sadness: parseFloat(flower.Sadness.replace('%', '')),
        anticipation: parseFloat(flower.Anticipation.replace('%', '')),
        surprise: parseFloat(flower.Surprise.replace('%', '')),
        optimism: parseFloat(flower.Optimism.replace('%', '')),
        joy: parseFloat(flower.Joy.replace('%', '')),
        love: parseFloat(flower.Love.replace('%', '')),
        trust: parseFloat(flower.Trust.replace('%', ''))
      }
    }));
  }
  
  // 👉 Add these back so flower-renderer can use them
  const emotionAngles = {
    fear: 12, anger: 36, disgust: 60, pessimism: 84, sadness: 108,
    anticipation: 150, surprise: 210,
    optimism: 255, joy: 285, love: 315, trust: 345
  };
  
