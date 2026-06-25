"use server";

export async function optimizeDeliverySchedule(agenda) {
  // Extract parameters safely
  const { busyDays = [], peakHours = "14:00", sleepHours = 7 } = agenda;

  // 1. Calculate best delivery day (avoiding user busy days)
  const allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const availableDays = allDays.filter(day => !busyDays.includes(day));
  
  const primaryDeliveryDay = availableDays.length > 0 ? availableDays[0] : "Thursday";
  const backupDeliveryDay = availableDays.length > 1 ? availableDays[1] : "Saturday";

  // 2. Compute caffeine and brewing schedule based on peak hours and sleep hours
  const peakHourNum = parseInt(peakHours.split(":")[0]) || 14;
  const prePeakHour = peakHourNum - 1 >= 0 ? peakHourNum - 1 : 13;
  
  // Format peak pre-hour
  const prePeakHourFormatted = prePeakHour > 12 
    ? `${prePeakHour - 12}:30 PM` 
    : `${prePeakHour}:30 ${prePeakHour === 12 ? 'PM' : 'AM'}`;

  const brewTimeline = [
    {
      time: "08:30 AM",
      action: "Morning Kickstart Focus",
      recommendedBlend: sleepHours < 6 ? "Thodi Hard - Extra Intense (Intensity 90)" : "Thodi Hard - Medium Roast (Intensity 50)",
      rationale: sleepHours < 6 ? "Mitigates accumulated sleep debt deficits." : "Standard morning performance baseline."
    },
    {
      time: prePeakHourFormatted,
      action: "Pre-Workload Barrier",
      recommendedBlend: "Thodi Hard - Extra Intense (Intensity 90)",
      rationale: `Prevents adenosine binding 30 minutes before your peak workload hour at ${peakHours}.`
    }
  ];

  // 3. Compute logistical delivery adjustments
  const logisticalAdjustments = [
    {
      factor: "Office Hour Alignment",
      adjustment: `Automatic delivery windows scheduled on ${primaryDeliveryDay} mornings.`
    },
    {
      factor: "Freshness Window",
      adjustment: "Small-batch roast date locked to 48 hours prior to local dispatch."
    }
  ];

  return {
    success: true,
    matrix: {
      primaryDeliveryDay,
      backupDeliveryDay,
      brewTimeline,
      logisticalAdjustments,
      generatedAt: new Date().toISOString()
    }
  };
}
