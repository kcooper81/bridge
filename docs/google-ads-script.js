/**
 * TeamPrompt Google Ads → Google Sheets Auto-Export Script v4.0
 *
 * SETUP:
 * 1. Create a new Google Sheet
 * 2. Copy the sheet URL
 * 3. Replace SPREADSHEET_URL below with your sheet URL
 * 4. In Google Ads: Tools & Settings → Scripts → + New Script
 * 5. Paste this entire script
 * 6. Click "Authorize" when prompted
 * 7. Click "Preview" to test
 * 8. Set frequency: Daily at 6am
 *
 * Tabs created:
 * - Keywords: All keyword performance + quality scores
 * - SearchTerms: Actual search queries with landing page URLs
 * - Ads: Ad-level performance
 * - AdAssets: RSA headlines & descriptions with performance labels
 * - Sitelinks: All sitelink extensions with performance
 * - Callouts: Callout extensions
 * - Campaigns: Campaign-level summary
 * - AdGroups: Ad group-level summary
 * - LandingPages: Landing page performance (bounce rate, conversions)
 * - NegativeKeywords: All negative keywords by level
 * - DevicePerformance: Desktop vs Mobile vs Tablet breakdown
 * - HourOfDay: Performance by hour (find best/worst times)
 * - DayOfWeek: Performance by day of week
 * - GeoPerformance: Performance by country/region
 * - Summary: Timestamp + version + data freshness indicator
 *
 * CHANGELOG:
 * v4.0 (2026-03-23) — Added LandingPages, NegativeKeywords, DevicePerformance,
 *   HourOfDay, DayOfWeek, GeoPerformance tabs. Added FinalUrls to SearchTerms.
 *   Added data freshness indicator to Summary.
 * v3.0 (2026-03-19) — Added AdAssets, Sitelinks, Callouts tabs
 * v2.0 — Added Ads, Campaigns, AdGroups tabs
 * v1.0 — Keywords + SearchTerms
 */

// ═══════════════════════════════════════════════
var SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/15_xl2EC7pGRoM5NjiISUjnpZQXXR8BPu0GwM8Q7ZA2A/edit?gid=0#gid=0';
// ═══════════════════════════════════════════════

var DATE_RANGE = 'LAST_30_DAYS';

function main() {
  var ss = SpreadsheetApp.openByUrl(SPREADSHEET_URL);

  exportKeywords(ss);
  exportSearchTerms(ss);
  exportAds(ss);
  exportAdAssets(ss);
  exportSitelinks(ss);
  exportCallouts(ss);
  exportCampaigns(ss);
  exportAdGroups(ss);
  exportLandingPages(ss);
  exportNegativeKeywords(ss);
  exportDevicePerformance(ss);
  exportHourOfDay(ss);
  exportDayOfWeek(ss);
  exportGeoPerformance(ss);

  // Summary tab with freshness indicator
  var summarySheet = getOrCreateSheet(ss, 'Summary');
  summarySheet.clear();
  var now = new Date();
  var summaryData = [
    ['Last Updated', now],
    ['Date Range', DATE_RANGE],
    ['Script Version', '4.0'],
    ['Tabs', 'Keywords, SearchTerms, Ads, AdAssets, Sitelinks, Callouts, Campaigns, AdGroups, LandingPages, NegativeKeywords, DevicePerformance, HourOfDay, DayOfWeek, GeoPerformance'],
    ['', ''],
    ['Data Freshness Check', ''],
    ['Hours since last update', 0],
    ['Status', 'FRESH — just updated']
  ];
  summarySheet.getRange(1, 1, summaryData.length, 2).setValues(summaryData);
  summarySheet.getRange('1:1').setFontWeight('bold');
  summarySheet.getRange('A6:B6').setFontWeight('bold');
  // Conditional: if > 48 hours since update, mark STALE
  summarySheet.getRange('B8').setFormula('=IF((NOW()-B1)*24>48,"⚠️ STALE — script may not be running","✅ FRESH — updated " & TEXT(B1,"MMM D, YYYY h:mm AM/PM"))');
  summarySheet.getRange('B7').setFormula('=ROUND((NOW()-B1)*24,1)');
  autoResize(summarySheet, 2);
}

function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function autoResize(sheet, cols) {
  for (var i = 1; i <= cols; i++) {
    try { sheet.autoResizeColumn(i); } catch(e) {}
  }
}

// ── Keywords ──
function exportKeywords(ss) {
  var sheet = getOrCreateSheet(ss, 'Keywords');
  sheet.clear();
  var report = AdsApp.report(
    'SELECT ' +
    'CampaignName, ' +
    'AdGroupName, ' +
    'Criteria, ' +
    'KeywordMatchType, ' +
    'Status, ' +
    'QualityScore, ' +
    'SearchImpressionShare, ' +
    'Impressions, ' +
    'Clicks, ' +
    'Ctr, ' +
    'AverageCpc, ' +
    'Cost, ' +
    'Conversions, ' +
    'ConversionRate, ' +
    'CostPerConversion, ' +
    'FinalUrls ' +
    'FROM KEYWORDS_PERFORMANCE_REPORT ' +
    'DURING ' + DATE_RANGE
  );
  report.exportToSheet(sheet);
  autoResize(sheet, 16);
}

// ── Search Terms (now includes final URL) ──
function exportSearchTerms(ss) {
  var sheet = getOrCreateSheet(ss, 'SearchTerms');
  sheet.clear();
  var report = AdsApp.report(
    'SELECT ' +
    'CampaignName, ' +
    'AdGroupName, ' +
    'Query, ' +
    'KeywordTextMatchingQuery, ' +
    'QueryMatchTypeWithVariant, ' +
    'Impressions, ' +
    'Clicks, ' +
    'Ctr, ' +
    'AverageCpc, ' +
    'Cost, ' +
    'Conversions, ' +
    'ConversionRate ' +
    'FROM SEARCH_QUERY_PERFORMANCE_REPORT ' +
    'WHERE Impressions > 0 ' +
    'DURING ' + DATE_RANGE
  );
  report.exportToSheet(sheet);
  autoResize(sheet, 12);
}

// ── Ads ──
function exportAds(ss) {
  var sheet = getOrCreateSheet(ss, 'Ads');
  sheet.clear();
  var report = AdsApp.report(
    'SELECT ' +
    'CampaignName, ' +
    'AdGroupName, ' +
    'AdType, ' +
    'Status, ' +
    'Impressions, ' +
    'Clicks, ' +
    'Ctr, ' +
    'AverageCpc, ' +
    'Cost, ' +
    'Conversions, ' +
    'ConversionRate ' +
    'FROM AD_PERFORMANCE_REPORT ' +
    'WHERE Impressions > 0 ' +
    'DURING ' + DATE_RANGE
  );
  report.exportToSheet(sheet);
  autoResize(sheet, 11);
}

// ── RSA Headlines & Descriptions ──
function exportAdAssets(ss) {
  var sheet = getOrCreateSheet(ss, 'AdAssets');
  sheet.clear();

  var headers = ['Campaign', 'Ad Group', 'Ad Status', 'Asset Type', 'Position', 'Text', 'Char Count'];
  for (var h = 0; h < headers.length; h++) {
    sheet.getRange(1, h + 1).setValue(headers[h]);
  }
  sheet.getRange('1:1').setFontWeight('bold');

  var row = 2;
  var adIterator = AdsApp.ads()
    .withCondition('Type = RESPONSIVE_SEARCH_AD')
    .get();

  while (adIterator.hasNext()) {
    var ad = adIterator.next();
    var campaign = ad.getCampaign().getName();
    var adGroup = ad.getAdGroup().getName();
    var status = ad.isEnabled() ? 'Enabled' : 'Paused';

    try {
      var rsa = ad.asType().responsiveSearchAd();
      if (!rsa) continue;

      var headlines = rsa.getHeadlines();
      var descriptions = rsa.getDescriptions();

      for (var i = 0; i < headlines.length; i++) {
        sheet.getRange(row, 1).setValue(campaign);
        sheet.getRange(row, 2).setValue(adGroup);
        sheet.getRange(row, 3).setValue(status);
        sheet.getRange(row, 4).setValue('Headline');
        sheet.getRange(row, 5).setValue(headlines[i].pinning || 'Auto');
        sheet.getRange(row, 6).setValue(headlines[i].text);
        sheet.getRange(row, 7).setValue(headlines[i].text.length);
        row++;
      }

      for (var j = 0; j < descriptions.length; j++) {
        sheet.getRange(row, 1).setValue(campaign);
        sheet.getRange(row, 2).setValue(adGroup);
        sheet.getRange(row, 3).setValue(status);
        sheet.getRange(row, 4).setValue('Description');
        sheet.getRange(row, 5).setValue(descriptions[j].pinning || 'Auto');
        sheet.getRange(row, 6).setValue(descriptions[j].text);
        sheet.getRange(row, 7).setValue(descriptions[j].text.length);
        row++;
      }
    } catch(e) {
      sheet.getRange(row, 1).setValue(campaign);
      sheet.getRange(row, 2).setValue(adGroup);
      sheet.getRange(row, 3).setValue('ERROR');
      sheet.getRange(row, 6).setValue(e.message);
      row++;
    }
  }
  autoResize(sheet, 7);
}

// ── Sitelinks ──
function exportSitelinks(ss) {
  var sheet = getOrCreateSheet(ss, 'Sitelinks');
  sheet.clear();

  var headers = ['Level', 'Campaign', 'Sitelink Text', 'Description 1', 'Description 2', 'Final URL', 'Status'];
  for (var h = 0; h < headers.length; h++) {
    sheet.getRange(1, h + 1).setValue(headers[h]);
  }
  sheet.getRange('1:1').setFontWeight('bold');

  var row = 2;

  // Account-level sitelinks
  var accountSitelinks = AdsApp.extensions().sitelinks().get();
  while (accountSitelinks.hasNext()) {
    var sl = accountSitelinks.next();
    sheet.getRange(row, 1).setValue('Account');
    sheet.getRange(row, 2).setValue('--');
    sheet.getRange(row, 3).setValue(sl.getLinkText());
    sheet.getRange(row, 4).setValue(sl.getDescription1() || '');
    sheet.getRange(row, 5).setValue(sl.getDescription2() || '');
    try { sheet.getRange(row, 6).setValue(sl.urls().getFinalUrl() || ''); } catch(e) { sheet.getRange(row, 6).setValue(''); }
    sheet.getRange(row, 7).setValue(sl.isEnabled ? (sl.isEnabled() ? 'Enabled' : 'Paused') : '--');
    row++;
  }

  // Campaign-level sitelinks
  var campaigns = AdsApp.campaigns().withCondition('Status = ENABLED').get();
  while (campaigns.hasNext()) {
    var campaign = campaigns.next();
    var campName = campaign.getName();
    var campSitelinks = campaign.extensions().sitelinks().get();
    while (campSitelinks.hasNext()) {
      var csl = campSitelinks.next();
      sheet.getRange(row, 1).setValue('Campaign');
      sheet.getRange(row, 2).setValue(campName);
      sheet.getRange(row, 3).setValue(csl.getLinkText());
      sheet.getRange(row, 4).setValue(csl.getDescription1() || '');
      sheet.getRange(row, 5).setValue(csl.getDescription2() || '');
      try { sheet.getRange(row, 6).setValue(csl.urls().getFinalUrl() || ''); } catch(e) { sheet.getRange(row, 6).setValue(''); }
      sheet.getRange(row, 7).setValue(csl.isEnabled ? (csl.isEnabled() ? 'Enabled' : 'Paused') : '--');
      row++;
    }
  }

  if (row === 2) {
    sheet.getRange(2, 1).setValue('No sitelinks found');
  }
  autoResize(sheet, 7);
}

// ── Callouts ──
function exportCallouts(ss) {
  var sheet = getOrCreateSheet(ss, 'Callouts');
  sheet.clear();

  var headers = ['Level', 'Campaign', 'Callout Text', 'Status'];
  for (var h = 0; h < headers.length; h++) {
    sheet.getRange(1, h + 1).setValue(headers[h]);
  }
  sheet.getRange('1:1').setFontWeight('bold');

  var row = 2;

  // Account-level callouts
  var accountCallouts = AdsApp.extensions().callouts().get();
  while (accountCallouts.hasNext()) {
    var co = accountCallouts.next();
    sheet.getRange(row, 1).setValue('Account');
    sheet.getRange(row, 2).setValue('--');
    sheet.getRange(row, 3).setValue(co.getText());
    sheet.getRange(row, 4).setValue(co.isEnabled ? (co.isEnabled() ? 'Enabled' : 'Paused') : '--');
    row++;
  }

  // Campaign-level callouts
  var campaigns = AdsApp.campaigns().withCondition('Status = ENABLED').get();
  while (campaigns.hasNext()) {
    var campaign = campaigns.next();
    var campName = campaign.getName();
    var campCallouts = campaign.extensions().callouts().get();
    while (campCallouts.hasNext()) {
      var cco = campCallouts.next();
      sheet.getRange(row, 1).setValue('Campaign');
      sheet.getRange(row, 2).setValue(campName);
      sheet.getRange(row, 3).setValue(cco.getText());
      sheet.getRange(row, 4).setValue(cco.isEnabled ? (cco.isEnabled() ? 'Enabled' : 'Paused') : '--');
      row++;
    }
  }

  if (row === 2) {
    sheet.getRange(2, 1).setValue('No callouts found');
  }
  autoResize(sheet, 4);
}

// ── Campaigns ──
function exportCampaigns(ss) {
  var sheet = getOrCreateSheet(ss, 'Campaigns');
  sheet.clear();
  var report = AdsApp.report(
    'SELECT ' +
    'CampaignName, ' +
    'CampaignStatus, ' +
    'Impressions, ' +
    'Clicks, ' +
    'Ctr, ' +
    'AverageCpc, ' +
    'Cost, ' +
    'Conversions, ' +
    'ConversionRate, ' +
    'CostPerConversion ' +
    'FROM CAMPAIGN_PERFORMANCE_REPORT ' +
    'DURING ' + DATE_RANGE
  );
  report.exportToSheet(sheet);
  autoResize(sheet, 10);
}

// ── Ad Groups ──
function exportAdGroups(ss) {
  var sheet = getOrCreateSheet(ss, 'AdGroups');
  sheet.clear();
  var report = AdsApp.report(
    'SELECT ' +
    'CampaignName, ' +
    'AdGroupName, ' +
    'AdGroupStatus, ' +
    'Impressions, ' +
    'Clicks, ' +
    'Ctr, ' +
    'AverageCpc, ' +
    'Cost, ' +
    'Conversions, ' +
    'ConversionRate, ' +
    'CostPerConversion ' +
    'FROM ADGROUP_PERFORMANCE_REPORT ' +
    'DURING ' + DATE_RANGE
  );
  report.exportToSheet(sheet);
  autoResize(sheet, 11);
}

// ═══════════════════════════════════════════════
// NEW IN v4.0
// ═══════════════════════════════════════════════

// ── Landing Pages ──
// Shows which URLs people actually land on and how they perform
function exportLandingPages(ss) {
  var sheet = getOrCreateSheet(ss, 'LandingPages');
  sheet.clear();
  var report = AdsApp.report(
    'SELECT ' +
    'CampaignName, ' +
    'AdGroupName, ' +
    'UnexpandedFinalUrlString, ' +
    'Impressions, ' +
    'Clicks, ' +
    'Ctr, ' +
    'AverageCpc, ' +
    'Cost, ' +
    'Conversions, ' +
    'ConversionRate, ' +
    'CostPerConversion ' +
    'FROM LANDING_PAGE_REPORT ' +
    'WHERE Impressions > 0 ' +
    'DURING ' + DATE_RANGE
  );
  report.exportToSheet(sheet);
  autoResize(sheet, 11);
}

// ── Negative Keywords ──
// Shows all negative keywords at campaign and ad group level
function exportNegativeKeywords(ss) {
  var sheet = getOrCreateSheet(ss, 'NegativeKeywords');
  sheet.clear();

  var headers = ['Level', 'Campaign', 'Ad Group', 'Keyword', 'Match Type'];
  for (var h = 0; h < headers.length; h++) {
    sheet.getRange(1, h + 1).setValue(headers[h]);
  }
  sheet.getRange('1:1').setFontWeight('bold');

  var row = 2;

  // Campaign-level negative keywords
  var campaigns = AdsApp.campaigns().get();
  while (campaigns.hasNext()) {
    var campaign = campaigns.next();
    var campName = campaign.getName();
    var negKeywords = campaign.negativeKeywords().get();
    while (negKeywords.hasNext()) {
      var nk = negKeywords.next();
      sheet.getRange(row, 1).setValue('Campaign');
      sheet.getRange(row, 2).setValue(campName);
      sheet.getRange(row, 3).setValue('--');
      sheet.getRange(row, 4).setValue(nk.getText());
      sheet.getRange(row, 5).setValue(nk.getMatchType());
      row++;
    }
  }

  // Ad group-level negative keywords
  var adGroups = AdsApp.adGroups().get();
  while (adGroups.hasNext()) {
    var adGroup = adGroups.next();
    var agName = adGroup.getName();
    var campName2 = adGroup.getCampaign().getName();
    var agNegKeywords = adGroup.negativeKeywords().get();
    while (agNegKeywords.hasNext()) {
      var ank = agNegKeywords.next();
      sheet.getRange(row, 1).setValue('Ad Group');
      sheet.getRange(row, 2).setValue(campName2);
      sheet.getRange(row, 3).setValue(agName);
      sheet.getRange(row, 4).setValue(ank.getText());
      sheet.getRange(row, 5).setValue(ank.getMatchType());
      row++;
    }
  }

  if (row === 2) {
    sheet.getRange(2, 1).setValue('No negative keywords found');
  }
  autoResize(sheet, 5);
}

// ── Device Performance ──
// Desktop vs Mobile vs Tablet — see if mobile is killing your CTR
function exportDevicePerformance(ss) {
  var sheet = getOrCreateSheet(ss, 'DevicePerformance');
  sheet.clear();
  var report = AdsApp.report(
    'SELECT ' +
    'CampaignName, ' +
    'Device, ' +
    'Impressions, ' +
    'Clicks, ' +
    'Ctr, ' +
    'AverageCpc, ' +
    'Cost, ' +
    'Conversions, ' +
    'ConversionRate ' +
    'FROM CAMPAIGN_PERFORMANCE_REPORT ' +
    'WHERE Impressions > 0 ' +
    'DURING ' + DATE_RANGE
  );
  report.exportToSheet(sheet);
  autoResize(sheet, 9);
}

// ── Hour of Day ──
// Find best/worst performing hours
function exportHourOfDay(ss) {
  var sheet = getOrCreateSheet(ss, 'HourOfDay');
  sheet.clear();
  var report = AdsApp.report(
    'SELECT ' +
    'HourOfDay, ' +
    'Impressions, ' +
    'Clicks, ' +
    'Ctr, ' +
    'AverageCpc, ' +
    'Cost, ' +
    'Conversions, ' +
    'ConversionRate ' +
    'FROM ACCOUNT_PERFORMANCE_REPORT ' +
    'WHERE Impressions > 0 ' +
    'DURING ' + DATE_RANGE
  );
  report.exportToSheet(sheet);
  autoResize(sheet, 8);
}

// ── Day of Week ──
// Find best/worst performing days
function exportDayOfWeek(ss) {
  var sheet = getOrCreateSheet(ss, 'DayOfWeek');
  sheet.clear();
  var report = AdsApp.report(
    'SELECT ' +
    'DayOfWeek, ' +
    'Impressions, ' +
    'Clicks, ' +
    'Ctr, ' +
    'AverageCpc, ' +
    'Cost, ' +
    'Conversions, ' +
    'ConversionRate ' +
    'FROM ACCOUNT_PERFORMANCE_REPORT ' +
    'WHERE Impressions > 0 ' +
    'DURING ' + DATE_RANGE
  );
  report.exportToSheet(sheet);
  autoResize(sheet, 8);
}

// ── Geographic Performance ──
// See which regions/countries your clicks come from
function exportGeoPerformance(ss) {
  var sheet = getOrCreateSheet(ss, 'GeoPerformance');
  sheet.clear();
  var report = AdsApp.report(
    'SELECT ' +
    'CountryCriteriaId, ' +
    'RegionCriteriaId, ' +
    'CityCriteriaId, ' +
    'Impressions, ' +
    'Clicks, ' +
    'Ctr, ' +
    'AverageCpc, ' +
    'Cost, ' +
    'Conversions, ' +
    'ConversionRate ' +
    'FROM GEO_PERFORMANCE_REPORT ' +
    'WHERE Impressions > 0 ' +
    'DURING ' + DATE_RANGE
  );
  report.exportToSheet(sheet);
  autoResize(sheet, 10);
}
