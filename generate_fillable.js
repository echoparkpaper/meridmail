'use strict';
// Generate fillable ACORD 125 PDF using incremental update
// This script uses only Node.js built-ins (fs, path)
// Run: node generate_fillable.js

const fs = require('fs');
const path = require('path');

const INPUT = '/Users/Meridian/meridmail/acord-125.pdf';
const OUTPUT = '/Users/Meridian/meridmail/acord-125-fillable.pdf';

// Read original PDF
const originalBytes = fs.readFileSync(INPUT);
const baseOffset = originalBytes.length; // 343864

function h(topFromTop, pageH) {
  pageH = pageH || 792;
  return pageH - topFromTop;
}

// Field definitions: [type, name, page(0-indexed), x0, y0, x1, y1]
// type: 'tx' = text field, 'cb' = checkbox, 'ml' = multiline text
const FIELDS = [
  // ===== PAGE 1 =====
  ['tx','date',0, 490,h(40),594,h(25)],
  ['ml','producer',0, 18,h(105),275,h(42)],
  ['tx','carrier',0, 280,h(65),510,h(42)],
  ['tx','naic_code',0, 515,h(65),594,h(42)],
  ['tx','program_name',0, 280,h(90),510,h(68)],
  ['tx','program_code',0, 515,h(90),594,h(68)],
  ['tx','policy_number',0, 280,h(110),594,h(93)],
  ['tx','contact_name',0, 18,h(135),275,h(112)],
  ['tx','underwriter',0, 280,h(135),450,h(112)],
  ['tx','underwriter_office',0, 455,h(135),594,h(112)],
  ['tx','phone',0, 18,h(157),275,h(137)],
  ['tx','fax',0, 18,h(176),275,h(158)],
  ['tx','email',0, 18,h(196),275,h(177)],
  ['tx','code',0, 18,h(213),120,h(197)],
  ['tx','subcode',0, 125,h(213),200,h(197)],
  ['tx','agency_customer_id',0, 18,h(230),275,h(214)],
  ['cb','status_quote',0, 350,h(170),362,h(158)],
  ['cb','status_issue_policy',0, 415,h(170),427,h(158)],
  ['cb','status_renew',0, 488,h(170),500,h(158)],
  ['cb','status_bound',0, 350,h(186),362,h(174)],
  ['tx','bound_date',0, 365,h(186),460,h(174)],
  ['tx','bound_time',0, 465,h(186),530,h(174)],
  ['cb','bound_am',0, 533,h(186),545,h(174)],
  ['cb','bound_pm',0, 533,h(196),545,h(186)],
  ['cb','status_change',0, 350,h(207),362,h(195)],
  ['tx','change_date',0, 365,h(207),460,h(195)],
  ['tx','change_time',0, 465,h(207),530,h(195)],
  ['cb','status_cancel',0, 350,h(222),362,h(210)],
  // Lines of Business col 1
  ['cb','cb_boiler',0, 20,h(292),31,h(282)],
  ['tx','prem_boiler',0, 98,h(292),172,h(282)],
  ['cb','cb_biz_auto',0, 20,h(306),31,h(296)],
  ['tx','prem_biz_auto',0, 98,h(306),172,h(296)],
  ['cb','cb_biz_owners',0, 20,h(320),31,h(310)],
  ['tx','prem_biz_owners',0, 98,h(320),172,h(310)],
  ['cb','cb_cgl',0, 20,h(334),31,h(324)],
  ['tx','prem_cgl',0, 98,h(334),172,h(324)],
  ['cb','cb_inland_marine',0, 20,h(348),31,h(338)],
  ['tx','prem_inland_marine',0, 98,h(348),172,h(338)],
  ['cb','cb_comm_prop',0, 20,h(362),31,h(352)],
  ['tx','prem_comm_prop',0, 98,h(362),172,h(352)],
  ['cb','cb_crime',0, 20,h(376),31,h(366)],
  ['tx','prem_crime',0, 98,h(376),172,h(366)],
  // Lines of Business col 2
  ['cb','cb_cyber',0, 200,h(292),211,h(282)],
  ['tx','prem_cyber',0, 270,h(292),355,h(282)],
  ['cb','cb_fiduciary',0, 200,h(306),211,h(296)],
  ['tx','prem_fiduciary',0, 270,h(306),355,h(296)],
  ['cb','cb_garage',0, 200,h(320),211,h(310)],
  ['tx','prem_garage',0, 270,h(320),355,h(310)],
  ['cb','cb_liquor',0, 200,h(334),211,h(324)],
  ['tx','prem_liquor',0, 270,h(334),355,h(324)],
  ['cb','cb_motor_carrier',0, 200,h(348),211,h(338)],
  ['tx','prem_motor_carrier',0, 270,h(348),355,h(338)],
  ['cb','cb_truckers',0, 200,h(362),211,h(352)],
  ['tx','prem_truckers',0, 270,h(362),355,h(352)],
  ['cb','cb_umbrella',0, 200,h(376),211,h(366)],
  ['tx','prem_umbrella',0, 270,h(376),355,h(366)],
  // Lines of Business col 3
  ['cb','cb_yacht',0, 378,h(292),389,h(282)],
  ['tx','prem_yacht',0, 440,h(292),594,h(282)],
  ['tx','prem_c3r2',0, 440,h(306),594,h(296)],
  ['tx','prem_c3r3',0, 440,h(320),594,h(310)],
  ['tx','prem_c3r4',0, 440,h(334),594,h(324)],
  ['tx','prem_c3r5',0, 440,h(348),594,h(338)],
  ['tx','prem_c3r6',0, 440,h(362),594,h(352)],
  ['tx','prem_c3r7',0, 440,h(376),594,h(366)],
  // Attachments
  ['cb','att_accts_recv',0, 20,h(408),30,h(399)],
  ['cb','att_addl_int',0, 20,h(421),30,h(412)],
  ['cb','att_addl_prem',0, 20,h(434),30,h(425)],
  ['cb','att_apartment',0, 20,h(447),30,h(438)],
  ['cb','att_condo',0, 20,h(460),30,h(451)],
  ['cb','att_contractors',0, 20,h(473),30,h(464)],
  ['cb','att_coverages',0, 20,h(486),30,h(477)],
  ['cb','att_dealers',0, 20,h(499),30,h(490)],
  ['cb','att_driver_info',0, 20,h(512),30,h(503)],
  ['cb','att_edp',0, 20,h(525),30,h(516)],
  ['cb','att_glass',0, 205,h(408),215,h(399)],
  ['cb','att_hotel',0, 205,h(421),215,h(412)],
  ['cb','att_install',0, 205,h(434),215,h(425)],
  ['cb','att_intl_liab',0, 205,h(447),215,h(438)],
  ['cb','att_intl_prop',0, 205,h(460),215,h(451)],
  ['cb','att_loss_sum',0, 205,h(473),215,h(464)],
  ['cb','att_open_cargo',0, 205,h(486),215,h(477)],
  ['cb','att_prem_pay',0, 205,h(499),215,h(490)],
  ['cb','att_prof_liab',0, 205,h(512),215,h(503)],
  ['cb','att_restaurant',0, 205,h(525),215,h(516)],
  ['cb','att_stmt_vals',0, 390,h(408),400,h(399)],
  ['cb','att_state_supp',0, 390,h(421),400,h(412)],
  ['cb','att_vacant',0, 390,h(434),400,h(425)],
  ['cb','att_vehicle',0, 390,h(447),400,h(438)],
  // Policy Information
  ['tx','eff_date',0, 20,h(556),88,h(540)],
  ['tx','exp_date',0, 90,h(556),158,h(540)],
  ['tx','billing_plan',0, 160,h(556),235,h(540)],
  ['cb','billing_direct',0, 162,h(568),173,h(558)],
  ['cb','billing_agency',0, 192,h(568),203,h(558)],
  ['tx','payment_plan',0, 240,h(556),320,h(540)],
  ['tx','method_payment',0, 325,h(556),405,h(540)],
  ['tx','audit',0, 410,h(556),440,h(540)],
  ['tx','deposit',0, 445,h(568),500,h(540)],
  ['tx','min_premium',0, 505,h(568),548,h(540)],
  ['tx','policy_premium',0, 550,h(568),594,h(540)],
  // First Named Insured
  ['ml','fni_name_addr',0, 18,h(650),310,h(582)],
  ['tx','gl_code',0, 315,h(606),375,h(582)],
  ['tx','sic',0, 380,h(606),435,h(582)],
  ['tx','naics',0, 440,h(606),505,h(582)],
  ['tx','fein',0, 510,h(606),594,h(582)],
  ['tx','biz_phone',0, 315,h(624),594,h(608)],
  ['tx','website',0, 315,h(642),594,h(626)],
  ['cb','ent_corp',0, 20,h(668),31,h(657)],
  ['cb','ent_jv',0, 95,h(668),106,h(657)],
  ['cb','ent_nfp',0, 195,h(668),206,h(657)],
  ['cb','ent_sub_s',0, 310,h(668),321,h(657)],
  ['cb','ent_indiv',0, 20,h(681),31,h(670)],
  ['cb','ent_llc',0, 95,h(681),106,h(670)],
  ['tx','no_members',0, 115,h(681),175,h(670)],
  ['cb','ent_partner',0, 195,h(681),206,h(670)],
  ['cb','ent_trust',0, 310,h(681),321,h(670)],
  ['cb','ent_other',0, 430,h(681),441,h(670)],
  // Other Named Insured (bottom page 1)
  ['ml','oni_name_addr',0, 18,h(755),310,h(693)],
  ['tx','oni_gl_code',0, 315,h(718),375,h(693)],
  ['tx','oni_sic',0, 380,h(718),435,h(693)],
  ['tx','oni_naics',0, 440,h(718),505,h(693)],
  ['tx','oni_fein',0, 510,h(718),594,h(693)],
  ['tx','oni_biz_phone',0, 315,h(735),594,h(719)],
  ['tx','oni_website',0, 315,h(752),594,h(736)],
  ['cb','oni_ent_corp',0, 20,h(760),31,h(749)],
  ['cb','oni_ent_jv',0, 95,h(760),106,h(749)],
  ['cb','oni_ent_nfp',0, 195,h(760),206,h(749)],
  ['cb','oni_ent_sub_s',0, 310,h(760),321,h(749)],
  ['cb','oni_ent_indiv',0, 20,h(772),31,h(761)],
  ['cb','oni_ent_llc',0, 95,h(772),106,h(761)],
  ['tx','oni_no_members',0, 115,h(772),175,h(761)],
  ['cb','oni_ent_partner',0, 195,h(772),206,h(761)],
  ['cb','oni_ent_trust',0, 310,h(772),321,h(761)],
  ['cb','oni_ent_other',0, 430,h(772),441,h(761)],

  // ===== PAGE 2 =====
  ['tx','p2_cust_id',1, 350,h(28),594,h(18)],
  // Other Named Insured continuation top of p2
  ['ml','p2_oni_addr',1, 18,h(100),310,h(35)],
  ['tx','p2_oni_gl',1, 315,h(62),375,h(38)],
  ['tx','p2_oni_sic',1, 380,h(62),435,h(38)],
  ['tx','p2_oni_naics',1, 440,h(62),505,h(38)],
  ['tx','p2_oni_fein',1, 510,h(62),594,h(38)],
  ['tx','p2_oni_phone',1, 315,h(80),594,h(64)],
  ['tx','p2_oni_web',1, 315,h(98),594,h(82)],
  ['cb','p2_ent_corp',1, 20,h(108),31,h(97)],
  ['cb','p2_ent_jv',1, 95,h(108),106,h(97)],
  ['cb','p2_ent_nfp',1, 195,h(108),206,h(97)],
  ['cb','p2_ent_sub_s',1, 310,h(108),321,h(97)],
  ['cb','p2_ent_indiv',1, 20,h(120),31,h(109)],
  ['cb','p2_ent_llc',1, 95,h(120),106,h(109)],
  ['tx','p2_no_members',1, 115,h(120),175,h(109)],
  ['cb','p2_ent_partner',1, 195,h(120),206,h(109)],
  ['cb','p2_ent_trust',1, 310,h(120),321,h(109)],
  ['cb','p2_ent_other',1, 430,h(120),441,h(109)],
  // Contact 1
  ['tx','c1_type',1, 18,h(148),200,h(133)],
  ['tx','c1_name',1, 18,h(163),200,h(150)],
  ['tx','c1_prim_phone',1, 18,h(180),58,h(169)],
  ['cb','c1_ph_home',1, 60,h(180),71,h(169)],
  ['cb','c1_ph_bus',1, 85,h(180),96,h(169)],
  ['cb','c1_ph_cell',1, 110,h(180),121,h(169)],
  ['tx','c1_sec_phone',1, 125,h(180),148,h(169)],
  ['cb','c1_sph_home',1, 150,h(180),161,h(169)],
  ['cb','c1_sph_bus',1, 175,h(180),186,h(169)],
  ['cb','c1_sph_cell',1, 200,h(180),211,h(169)],
  ['tx','c1_prim_email',1, 18,h(196),280,h(183)],
  ['tx','c1_sec_email',1, 18,h(210),280,h(197)],
  // Contact 2
  ['tx','c2_type',1, 295,h(148),594,h(133)],
  ['tx','c2_name',1, 295,h(163),594,h(150)],
  ['tx','c2_prim_phone',1, 295,h(180),343,h(169)],
  ['cb','c2_ph_home',1, 345,h(180),356,h(169)],
  ['cb','c2_ph_bus',1, 370,h(180),381,h(169)],
  ['cb','c2_ph_cell',1, 395,h(180),406,h(169)],
  ['tx','c2_sec_phone',1, 410,h(180),433,h(169)],
  ['cb','c2_sph_home',1, 435,h(180),446,h(169)],
  ['cb','c2_sph_bus',1, 460,h(180),471,h(169)],
  ['cb','c2_sph_cell',1, 485,h(180),496,h(169)],
  ['tx','c2_prim_email',1, 295,h(196),594,h(183)],
  ['tx','c2_sec_email',1, 295,h(210),594,h(197)],
  // Premises locations 1-4
  ['tx','loc1_num',1, 18,h(231),50,h(218)],
  ['tx','loc1_street',1, 55,h(231),320,h(218)],
  ['cb','loc1_inside',1, 325,h(227),336,h(218)],
  ['cb','loc1_outside',1, 325,h(240),336,h(231)],
  ['cb','loc1_owner',1, 365,h(227),376,h(218)],
  ['cb','loc1_tenant',1, 365,h(240),376,h(231)],
  ['tx','loc1_ft_empl',1, 390,h(227),450,h(218)],
  ['tx','loc1_revenues',1, 455,h(227),594,h(218)],
  ['tx','loc1_bld',1, 18,h(244),50,h(232)],
  ['tx','loc1_city',1, 55,h(244),250,h(232)],
  ['tx','loc1_state',1, 255,h(244),310,h(232)],
  ['tx','loc1_pt_empl',1, 390,h(244),450,h(232)],
  ['tx','loc1_occ_area',1, 455,h(244),550,h(232)],
  ['tx','loc1_county',1, 55,h(257),250,h(245)],
  ['tx','loc1_zip',1, 255,h(257),310,h(245)],
  ['tx','loc1_open_pub',1, 455,h(257),550,h(245)],
  ['tx','loc1_tot_bldg',1, 455,h(270),550,h(258)],
  ['cb','loc1_leased_y',1, 555,h(270),566,h(258)],
  ['cb','loc1_leased_n',1, 570,h(270),581,h(258)],
  ['tx','loc1_desc',1, 18,h(275),450,h(261)],
  ['tx','loc2_num',1, 18,h(289),50,h(276)],
  ['tx','loc2_street',1, 55,h(289),320,h(276)],
  ['cb','loc2_inside',1, 325,h(285),336,h(276)],
  ['cb','loc2_outside',1, 325,h(298),336,h(289)],
  ['cb','loc2_owner',1, 365,h(285),376,h(276)],
  ['cb','loc2_tenant',1, 365,h(298),376,h(289)],
  ['tx','loc2_ft_empl',1, 390,h(285),450,h(276)],
  ['tx','loc2_revenues',1, 455,h(285),594,h(276)],
  ['tx','loc2_bld',1, 18,h(302),50,h(290)],
  ['tx','loc2_city',1, 55,h(302),250,h(290)],
  ['tx','loc2_state',1, 255,h(302),310,h(290)],
  ['tx','loc2_pt_empl',1, 390,h(302),450,h(290)],
  ['tx','loc2_occ_area',1, 455,h(302),550,h(290)],
  ['tx','loc2_county',1, 55,h(315),250,h(303)],
  ['tx','loc2_zip',1, 255,h(315),310,h(303)],
  ['tx','loc2_open_pub',1, 455,h(315),550,h(303)],
  ['tx','loc2_tot_bldg',1, 455,h(328),550,h(316)],
  ['tx','loc2_desc',1, 18,h(333),450,h(319)],
  ['tx','loc3_num',1, 18,h(347),50,h(334)],
  ['tx','loc3_street',1, 55,h(347),320,h(334)],
  ['cb','loc3_inside',1, 325,h(343),336,h(334)],
  ['cb','loc3_outside',1, 325,h(356),336,h(347)],
  ['cb','loc3_owner',1, 365,h(343),376,h(334)],
  ['cb','loc3_tenant',1, 365,h(356),376,h(347)],
  ['tx','loc3_ft_empl',1, 390,h(343),450,h(334)],
  ['tx','loc3_revenues',1, 455,h(343),594,h(334)],
  ['tx','loc3_bld',1, 18,h(360),50,h(348)],
  ['tx','loc3_city',1, 55,h(360),250,h(348)],
  ['tx','loc3_state',1, 255,h(360),310,h(348)],
  ['tx','loc3_pt_empl',1, 390,h(360),450,h(348)],
  ['tx','loc3_occ_area',1, 455,h(360),550,h(348)],
  ['tx','loc3_county',1, 55,h(373),250,h(361)],
  ['tx','loc3_zip',1, 255,h(373),310,h(361)],
  ['tx','loc3_open_pub',1, 455,h(373),550,h(361)],
  ['tx','loc3_tot_bldg',1, 455,h(386),550,h(374)],
  ['tx','loc3_desc',1, 18,h(391),450,h(377)],
  ['tx','loc4_num',1, 18,h(405),50,h(392)],
  ['tx','loc4_street',1, 55,h(405),320,h(392)],
  ['cb','loc4_inside',1, 325,h(401),336,h(392)],
  ['cb','loc4_outside',1, 325,h(414),336,h(405)],
  ['cb','loc4_owner',1, 365,h(401),376,h(392)],
  ['cb','loc4_tenant',1, 365,h(414),376,h(405)],
  ['tx','loc4_ft_empl',1, 390,h(401),450,h(392)],
  ['tx','loc4_revenues',1, 455,h(401),594,h(392)],
  ['tx','loc4_bld',1, 18,h(418),50,h(406)],
  ['tx','loc4_city',1, 55,h(418),250,h(406)],
  ['tx','loc4_state',1, 255,h(418),310,h(406)],
  ['tx','loc4_pt_empl',1, 390,h(418),450,h(406)],
  ['tx','loc4_occ_area',1, 455,h(418),550,h(406)],
  ['tx','loc4_county',1, 55,h(431),250,h(419)],
  ['tx','loc4_zip',1, 255,h(431),310,h(419)],
  ['tx','loc4_open_pub',1, 455,h(431),550,h(419)],
  ['tx','loc4_tot_bldg',1, 455,h(444),550,h(432)],
  ['tx','loc4_desc',1, 18,h(449),450,h(435)],
  // Nature of Business
  ['cb','nob_apts',1, 20,h(489),31,h(480)],
  ['cb','nob_contr',1, 95,h(489),106,h(480)],
  ['cb','nob_mfg',1, 175,h(489),186,h(480)],
  ['cb','nob_rest',1, 270,h(489),281,h(480)],
  ['cb','nob_svc',1, 360,h(489),371,h(480)],
  ['cb','nob_condo',1, 20,h(502),31,h(493)],
  ['cb','nob_inst',1, 95,h(502),106,h(493)],
  ['cb','nob_office',1, 175,h(502),186,h(493)],
  ['cb','nob_retail',1, 270,h(502),281,h(493)],
  ['cb','nob_wholesale',1, 360,h(502),371,h(493)],
  ['tx','nob_other_txt',1, 400,h(502),465,h(493)],
  ['tx','biz_started',1, 470,h(502),594,h(478)],
  ['ml','desc_prim_ops',1, 18,h(560),594,h(497)],
  ['tx','retail_pct',1, 18,h(577),200,h(563)],
  ['tx','install_pct',1, 265,h(577),350,h(563)],
  ['tx','offprem_pct',1, 455,h(577),594,h(563)],
  ['ml','desc_other_ops',1, 18,h(660),594,h(580)],

  // ===== PAGE 3 =====
  ['tx','p3_cust_id',2, 350,h(28),594,h(18)],
  // Additional Interest
  ['cb','ai_addl_ins',2, 20,h(76),31,h(68)],
  ['cb','ai_bow',2, 20,h(88),31,h(80)],
  ['cb','ai_co_owner',2, 20,h(100),31,h(92)],
  ['cb','ai_emp_lessor',2, 20,h(112),31,h(104)],
  ['cb','ai_leaseback',2, 20,h(124),31,h(116)],
  ['cb','ai_lenders',2, 20,h(136),31,h(128)],
  ['cb','ai_lienholder',2, 80,h(76),91,h(68)],
  ['cb','ai_loss_payee',2, 80,h(88),91,h(80)],
  ['cb','ai_mortgagee',2, 80,h(100),91,h(92)],
  ['cb','ai_owner',2, 80,h(112),91,h(104)],
  ['cb','ai_registrant',2, 80,h(124),91,h(116)],
  ['cb','ai_trustee',2, 80,h(136),91,h(128)],
  ['tx','ai_name_addr',2, 140,h(120),330,h(42)],
  ['tx','ai_rank',2, 335,h(50),380,h(42)],
  ['cb','ai_cert',2, 390,h(62),401,h(52)],
  ['cb','ai_policy',2, 420,h(62),431,h(52)],
  ['cb','ai_send_bill',2, 450,h(62),461,h(52)],
  ['tx','ai_location',2, 480,h(52),560,h(42)],
  ['tx','ai_building',2, 565,h(52),594,h(42)],
  ['tx','ai_vehicle',2, 480,h(65),560,h(53)],
  ['tx','ai_boat',2, 565,h(65),594,h(53)],
  ['tx','ai_airport',2, 480,h(78),560,h(66)],
  ['tx','ai_aircraft',2, 565,h(78),594,h(66)],
  ['tx','ai_item_class',2, 480,h(91),560,h(79)],
  ['tx','ai_item',2, 565,h(91),594,h(79)],
  ['tx','ai_item_desc',2, 480,h(130),594,h(92)],
  ['tx','ai_ref_loan',2, 140,h(140),350,h(130)],
  ['tx','ai_int_end',2, 355,h(140),480,h(130)],
  ['tx','ai_lien_amt',2, 140,h(155),350,h(141)],
  ['tx','ai_phone',2, 355,h(155),480,h(141)],
  ['tx','ai_fax',2, 485,h(155),594,h(141)],
  ['tx','ai_reason',2, 140,h(170),370,h(157)],
  ['tx','ai_email',2, 375,h(170),594,h(157)],
  // General Info questions
  ['cb','q1a_yn',2, 580,h(198),594,h(188)],
  ['tx','q1a_parent',2, 20,h(218),380,h(205)],
  ['tx','q1a_rel',2, 385,h(218),510,h(205)],
  ['tx','q1a_pct',2, 515,h(218),594,h(205)],
  ['cb','q1b_yn',2, 580,h(232),594,h(222)],
  ['tx','q1b_sub',2, 20,h(252),380,h(239)],
  ['tx','q1b_rel',2, 385,h(252),510,h(239)],
  ['tx','q1b_pct',2, 515,h(252),594,h(239)],
  ['cb','q2_yn',2, 580,h(268),594,h(258)],
  ['cb','q2_manual',2, 20,h(284),31,h(273)],
  ['cb','q2_position',2, 95,h(284),106,h(273)],
  ['cb','q2_meetings',2, 185,h(284),196,h(273)],
  ['cb','q2_osha',2, 275,h(284),286,h(273)],
  ['cb','q3_yn',2, 580,h(298),594,h(288)],
  ['ml','q3_expl',2, 20,h(320),594,h(300)],
  ['cb','q4_yn',2, 580,h(334),594,h(324)],
  ['tx','q4_lob1',2, 20,h(356),140,h(338)],
  ['tx','q4_pol1',2, 145,h(356),295,h(338)],
  ['tx','q4_lob2',2, 300,h(356),430,h(338)],
  ['tx','q4_pol2',2, 435,h(356),594,h(338)],
  ['tx','q4_lob3',2, 20,h(370),140,h(358)],
  ['tx','q4_pol3',2, 145,h(370),295,h(358)],
  ['tx','q4_lob4',2, 300,h(370),430,h(358)],
  ['tx','q4_pol4',2, 435,h(370),594,h(358)],
  ['cb','q5_yn',2, 580,h(388),594,h(378)],
  ['cb','q5_nonpay',2, 20,h(406),31,h(395)],
  ['cb','q5_no_agent',2, 95,h(406),106,h(395)],
  ['cb','q5_nonrenew',2, 20,h(420),31,h(409)],
  ['cb','q5_underwr',2, 95,h(420),106,h(409)],
  ['tx','q5_cond',2, 200,h(420),594,h(409)],
  ['cb','q6_yn',2, 580,h(434),594,h(424)],
  ['ml','q6_expl',2, 20,h(455),594,h(436)],
  ['cb','q7_yn',2, 580,h(490),594,h(480)],
  ['ml','q7_expl',2, 20,h(520),594,h(492)],
  ['cb','q8_yn',2, 580,h(534),594,h(524)],
  ['tx','q8_occur1',2, 20,h(558),85,h(548)],
  ['tx','q8_expl1',2, 90,h(558),370,h(548)],
  ['tx','q8_res1',2, 375,h(558),530,h(548)],
  ['tx','q8_rdate1',2, 535,h(558),594,h(548)],
  ['tx','q8_occur2',2, 20,h(570),85,h(560)],
  ['tx','q8_expl2',2, 90,h(570),370,h(560)],
  ['tx','q8_res2',2, 375,h(570),530,h(560)],
  ['tx','q8_rdate2',2, 535,h(570),594,h(560)],
  ['cb','q9_yn',2, 580,h(580),594,h(570)],
  ['tx','q9_occur1',2, 20,h(604),85,h(594)],
  ['tx','q9_expl1',2, 90,h(604),370,h(594)],
  ['tx','q9_res1',2, 375,h(604),530,h(594)],
  ['tx','q9_rdate1',2, 535,h(604),594,h(594)],
  ['tx','q9_occur2',2, 20,h(616),85,h(606)],
  ['tx','q9_expl2',2, 90,h(616),370,h(606)],
  ['tx','q9_res2',2, 375,h(616),530,h(606)],
  ['tx','q9_rdate2',2, 535,h(616),594,h(606)],
  ['cb','q10_yn',2, 580,h(626),594,h(616)],
  ['tx','q10_occur1',2, 20,h(650),85,h(640)],
  ['tx','q10_expl1',2, 90,h(650),370,h(640)],
  ['tx','q10_res1',2, 375,h(650),530,h(640)],
  ['tx','q10_rdate1',2, 535,h(650),594,h(640)],
  ['tx','q10_occur2',2, 20,h(662),85,h(652)],
  ['tx','q10_expl2',2, 90,h(662),370,h(652)],
  ['tx','q10_res2',2, 375,h(662),530,h(652)],
  ['tx','q10_rdate2',2, 535,h(662),594,h(652)],
  ['cb','q11_yn',2, 580,h(668),594,h(658)],
  ['tx','q11_trust',2, 250,h(668),575,h(658)],
  ['cb','q12_yn',2, 580,h(682),594,h(672)],
  ['cb','q13_yn',2, 580,h(714),594,h(704)],
  ['ml','q13_expl',2, 20,h(730),594,h(716)],
  ['cb','q14_yn',2, 580,h(744),594,h(734)],
  ['tx','q14_desc',2, 200,h(756),594,h(746)],
  ['cb','q15_yn',2, 580,h(762),594,h(752)],
  ['tx','q15_desc',2, 200,h(773),594,h(763)],

  // ===== PAGE 4 =====
  ['tx','p4_cust_id',3, 350,h(28),594,h(18)],
  ['ml','remarks',3, 18,h(75),594,h(32)],
  // Prior carrier info - year 1
  ['tx','yr1_yr',3, 18,h(108),55,h(95)],
  ['tx','yr1_carr_gl',3, 148,h(108),280,h(95)],
  ['tx','yr1_carr_auto',3, 283,h(108),415,h(95)],
  ['tx','yr1_carr_prop',3, 418,h(108),510,h(95)],
  ['tx','yr1_carr_oth',3, 513,h(108),594,h(95)],
  ['tx','yr1_pol_gl',3, 148,h(121),280,h(109)],
  ['tx','yr1_pol_auto',3, 283,h(121),415,h(109)],
  ['tx','yr1_pol_prop',3, 418,h(121),510,h(109)],
  ['tx','yr1_pol_oth',3, 513,h(121),594,h(109)],
  ['tx','yr1_prem_gl',3, 148,h(134),280,h(122)],
  ['tx','yr1_prem_auto',3, 283,h(134),415,h(122)],
  ['tx','yr1_prem_prop',3, 418,h(134),510,h(122)],
  ['tx','yr1_prem_oth',3, 513,h(134),594,h(122)],
  ['tx','yr1_eff_gl',3, 148,h(147),280,h(135)],
  ['tx','yr1_eff_auto',3, 283,h(147),415,h(135)],
  ['tx','yr1_eff_prop',3, 418,h(147),510,h(135)],
  ['tx','yr1_eff_oth',3, 513,h(147),594,h(135)],
  ['tx','yr1_exp_gl',3, 148,h(160),280,h(148)],
  ['tx','yr1_exp_auto',3, 283,h(160),415,h(148)],
  ['tx','yr1_exp_prop',3, 418,h(160),510,h(148)],
  ['tx','yr1_exp_oth',3, 513,h(160),594,h(148)],
  // Year 2
  ['tx','yr2_yr',3, 18,h(178),55,h(165)],
  ['tx','yr2_carr_gl',3, 148,h(178),280,h(165)],
  ['tx','yr2_carr_auto',3, 283,h(178),415,h(165)],
  ['tx','yr2_carr_prop',3, 418,h(178),510,h(165)],
  ['tx','yr2_carr_oth',3, 513,h(178),594,h(165)],
  ['tx','yr2_pol_gl',3, 148,h(191),280,h(179)],
  ['tx','yr2_pol_auto',3, 283,h(191),415,h(179)],
  ['tx','yr2_pol_prop',3, 418,h(191),510,h(179)],
  ['tx','yr2_pol_oth',3, 513,h(191),594,h(179)],
  ['tx','yr2_prem_gl',3, 148,h(204),280,h(192)],
  ['tx','yr2_prem_auto',3, 283,h(204),415,h(192)],
  ['tx','yr2_prem_prop',3, 418,h(204),510,h(192)],
  ['tx','yr2_prem_oth',3, 513,h(204),594,h(192)],
  ['tx','yr2_eff_gl',3, 148,h(217),280,h(205)],
  ['tx','yr2_eff_auto',3, 283,h(217),415,h(205)],
  ['tx','yr2_eff_prop',3, 418,h(217),510,h(205)],
  ['tx','yr2_eff_oth',3, 513,h(217),594,h(205)],
  ['tx','yr2_exp_gl',3, 148,h(230),280,h(218)],
  ['tx','yr2_exp_auto',3, 283,h(230),415,h(218)],
  ['tx','yr2_exp_prop',3, 418,h(230),510,h(218)],
  ['tx','yr2_exp_oth',3, 513,h(230),594,h(218)],
  // Year 3
  ['tx','yr3_yr',3, 18,h(248),55,h(235)],
  ['tx','yr3_carr_gl',3, 148,h(248),280,h(235)],
  ['tx','yr3_carr_auto',3, 283,h(248),415,h(235)],
  ['tx','yr3_carr_prop',3, 418,h(248),510,h(235)],
  ['tx','yr3_carr_oth',3, 513,h(248),594,h(235)],
  ['tx','yr3_pol_gl',3, 148,h(261),280,h(249)],
  ['tx','yr3_pol_auto',3, 283,h(261),415,h(249)],
  ['tx','yr3_pol_prop',3, 418,h(261),510,h(249)],
  ['tx','yr3_pol_oth',3, 513,h(261),594,h(249)],
  ['tx','yr3_prem_gl',3, 148,h(274),280,h(262)],
  ['tx','yr3_prem_auto',3, 283,h(274),415,h(262)],
  ['tx','yr3_prem_prop',3, 418,h(274),510,h(262)],
  ['tx','yr3_prem_oth',3, 513,h(274),594,h(262)],
  ['tx','yr3_eff_gl',3, 148,h(287),280,h(275)],
  ['tx','yr3_eff_auto',3, 283,h(287),415,h(275)],
  ['tx','yr3_eff_prop',3, 418,h(287),510,h(275)],
  ['tx','yr3_eff_oth',3, 513,h(287),594,h(275)],
  ['tx','yr3_exp_gl',3, 148,h(300),280,h(288)],
  ['tx','yr3_exp_auto',3, 283,h(300),415,h(288)],
  ['tx','yr3_exp_prop',3, 418,h(300),510,h(288)],
  ['tx','yr3_exp_oth',3, 513,h(300),594,h(288)],
  // Loss history
  ['tx','loss_yrs',3, 235,h(307),270,h(297)],
  ['tx','loss_total',3, 430,h(316),594,h(305)],
  ['cb','loss_none',3, 145,h(316),156,h(305)],
  ['tx','loss1_occur',3, 18,h(330),75,h(318)],
  ['tx','loss1_line',3, 78,h(330),120,h(318)],
  ['tx','loss1_desc',3, 123,h(330),360,h(318)],
  ['tx','loss1_cdate',3, 363,h(330),425,h(318)],
  ['tx','loss1_paid',3, 428,h(330),490,h(318)],
  ['tx','loss1_resv',3, 493,h(330),545,h(318)],
  ['cb','loss1_sub_y',3, 548,h(330),558,h(318)],
  ['cb','loss1_sub_n',3, 560,h(330),570,h(318)],
  ['cb','loss1_open_y',3, 573,h(330),583,h(318)],
  ['cb','loss1_open_n',3, 585,h(330),594,h(318)],
  ['tx','loss2_occur',3, 18,h(344),75,h(332)],
  ['tx','loss2_line',3, 78,h(344),120,h(332)],
  ['tx','loss2_desc',3, 123,h(344),360,h(332)],
  ['tx','loss2_cdate',3, 363,h(344),425,h(332)],
  ['tx','loss2_paid',3, 428,h(344),490,h(332)],
  ['tx','loss2_resv',3, 493,h(344),545,h(332)],
  ['cb','loss2_sub_y',3, 548,h(344),558,h(332)],
  ['cb','loss2_sub_n',3, 560,h(344),570,h(332)],
  ['cb','loss2_open_y',3, 573,h(344),583,h(332)],
  ['cb','loss2_open_n',3, 585,h(344),594,h(332)],
  ['tx','loss3_occur',3, 18,h(358),75,h(346)],
  ['tx','loss3_line',3, 78,h(358),120,h(346)],
  ['tx','loss3_desc',3, 123,h(358),360,h(346)],
  ['tx','loss3_cdate',3, 363,h(358),425,h(346)],
  ['tx','loss3_paid',3, 428,h(358),490,h(346)],
  ['tx','loss3_resv',3, 493,h(358),545,h(346)],
  ['cb','loss3_sub_y',3, 548,h(358),558,h(346)],
  ['cb','loss3_sub_n',3, 560,h(358),570,h(346)],
  ['cb','loss3_open_y',3, 573,h(358),583,h(346)],
  ['cb','loss3_open_n',3, 585,h(358),594,h(346)],
  ['cb','privacy_notice',3, 18,h(372),29,h(362)],
  ['tx','appl_initials',3, 540,h(420),594,h(410)],

  // ===== PAGE 5 =====
  ['tx','p5_cust_id',4, 350,h(28),594,h(18)],
  ['tx','prod_sig',4, 18,h(670),240,h(655)],
  ['tx','prod_name',4, 245,h(670),470,h(655)],
  ['tx','state_lic',4, 475,h(670),594,h(655)],
  ['tx','appl_sig',4, 18,h(694),370,h(679)],
  ['tx','sig_date',4, 375,h(694),490,h(679)],
  ['tx','natl_prod_num',4, 495,h(694),594,h(679)],
];

// Build the incremental update
let parts = [];
let currentOffset = baseOffset;
const fieldOffsets = [];
const fieldObjectIds = [];
const fieldsByPage = {0:[], 1:[], 2:[], 3:[], 4:[]};
const startObjectId = 1068;

function fmtRect(x0, y0, x1, y1) {
  return x0 + ' ' + y0 + ' ' + x1 + ' ' + y1;
}

function buildTextFieldObj(id, name, x0, y0, x1, y1, multiline) {
  const ff = multiline ? ' /Ff 4096' : ' /Ff 0';
  return id + ' 0 obj\n<</Type /Annot /Subtype /Widget /FT /Tx /T (' + name +
    ') /Rect [' + fmtRect(x0, y0, x1, y1) + '] /F 4 /DA (/Helv 7 Tf 0 g)' + ff +
    ' /BS <</W 0 /S /S>> /MK <<>>>>\nendobj\n';
}

function buildCheckboxObj(id, name, x0, y0, x1, y1) {
  return id + ' 0 obj\n<</Type /Annot /Subtype /Widget /FT /Btn /T (' + name +
    ') /Rect [' + fmtRect(x0, y0, x1, y1) + '] /F 4 /V /Off /AS /Off' +
    ' /DA (/ZaDb 0 Tf 0 g) /MK <</CA (4)>>>>\nendobj\n';
}

// Generate all widget objects
FIELDS.forEach(function(f, i) {
  const type = f[0], name = f[1], page = f[2];
  const x0 = f[3], y0 = f[4], x1 = f[5], y1 = f[6];
  const id = startObjectId + i;
  fieldObjectIds.push(id);
  fieldOffsets.push(currentOffset);
  fieldsByPage[page].push(id);

  let obj;
  if (type === 'cb') {
    obj = buildCheckboxObj(id, name, x0, y0, x1, y1);
  } else {
    const ml = (type === 'ml');
    obj = buildTextFieldObj(id, name, x0, y0, x1, y1, ml);
  }
  parts.push(obj);
  currentOffset += Buffer.byteLength(obj, 'utf8');
});

const totalFields = FIELDS.length;
const acroformId = startObjectId + totalFields;
const acroformOffset = currentOffset;

// We need the page objects to find their original IDs.
// From looking at the PDF: Page 1 = obj 2, Page 2 = obj 3, etc.
// Actually we need to parse the PDF to find page object IDs.
// We'll use a heuristic: read the Kids array from the Pages object.
// For ACORD 125, pages are objects 2,3,4,5,6 (standard sequential)
// Let's parse the PDF to find actual page object IDs

const pdfText = originalBytes.toString('binary');

// Find the page IDs from the PDF
function findPageObjectIds(pdfText) {
  // Look for /Type /Page entries and their object IDs
  const pageIds = [];
  const regex = /(\d+)\s+0\s+obj[\s\S]*?\/Type\s*\/Page\b/g;
  let m;
  while ((m = regex.exec(pdfText)) !== null) {
    pageIds.push(parseInt(m[1]));
  }
  return pageIds.sort((a, b) => a - b);
}

const pageObjectIds = findPageObjectIds(pdfText);
console.log('Found page object IDs:', pageObjectIds);

// Also need original page object byte offsets
function findObjectOffset(pdfText, objId) {
  // Look in xref for the offset
  const xrefMatch = pdfText.match(/xref[\s\S]*?startxref\s*(\d+)/);
  if (!xrefMatch) return -1;

  // Simple: search for "objId 0 obj" in the PDF
  const pattern = new RegExp('\\b' + objId + '\\s+0\\s+obj\\b');
  const m = pattern.exec(pdfText);
  if (!m) return -1;
  return m.index;
}

// Build page objects (updated with /Annots)
const pageObjectOffsets = {};
const pageObjectNewIds = []; // These keep their original IDs

// For incremental update, page objects keep their original IDs
// We need to write updated versions at new byte offsets

let pageUpdateObjs = [];

for (let p = 0; p < 5; p++) {
  if (pageObjectIds[p] === undefined) continue;
  const pageId = pageObjectIds[p];
  const widgets = fieldsByPage[p];
  if (widgets.length === 0) continue;

  pageObjectNewIds.push(pageId);
  pageObjectOffsets[pageId] = currentOffset;

  // Build the Annots array
  const annotsRefs = widgets.map(id => id + ' 0 R').join(' ');

  // Build a minimal page object that preserves structure but adds Annots
  // We need to copy the original page's content but add /Annots
  // Find original page object content
  const pagePattern = new RegExp('\\b' + pageId + '\\s+0\\s+obj\\b([\\s\\S]*?)\\bendobj\\b');
  const pageMatch = pagePattern.exec(pdfText);

  let pageContent;
  if (pageMatch) {
    let orig = pageMatch[1].trim();
    // Add or replace /Annots
    if (orig.includes('/Annots')) {
      // Replace existing Annots
      orig = orig.replace(/\/Annots\s*\[([^\]]*)\]/, '/Annots [' + annotsRefs + ' $1]');
    } else {
      // Add Annots before closing >>
      orig = orig.replace(/>>(\s*)$/, '/Annots [' + annotsRefs + ']>>\n');
    }
    pageContent = pageId + ' 0 obj\n' + orig + '\nendobj\n';
  } else {
    // Fallback: minimal page dict (should not happen)
    pageContent = pageId + ' 0 obj\n<</Type /Page /Annots [' + annotsRefs + ']>>\nendobj\n';
  }

  pageUpdateObjs.push({id: pageId, offset: currentOffset, content: pageContent});
  parts.push(pageContent);
  currentOffset += Buffer.byteLength(pageContent, 'utf8');
}

// Build AcroForm object
const fieldRefs = fieldObjectIds.map(id => id + ' 0 R').join(' ');
const acroformContent = acroformId + ' 0 obj\n<</Fields [' + fieldRefs +
  '] /DA (/Helv 7 Tf 0 g) /DR <</Font <</Helv <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>> /ZaDb <</Type /Font /Subtype /Type1 /BaseFont /ZapfDingbats>>>>>> /NeedAppearances true>>\nendobj\n';
parts.push(acroformContent);
const acroformActualOffset = currentOffset;
currentOffset += Buffer.byteLength(acroformContent, 'utf8');

// Build updated Catalog (object 1)
const catalogId = 1;
const catalogOffset = currentOffset;
// Find original catalog
const catalogPattern = /\b1\s+0\s+obj\b([\s\S]*?)\bendobj\b/;
const catalogMatch = catalogPattern.exec(pdfText);
let catalogContent;
if (catalogMatch) {
  let orig = catalogMatch[1].trim();
  if (orig.includes('/AcroForm')) {
    orig = orig.replace(/\/AcroForm\s+\d+\s+0\s+R/, '/AcroForm ' + acroformId + ' 0 R');
  } else {
    orig = orig.replace(/>>(\s*)$/, '/AcroForm ' + acroformId + ' 0 R>>\n');
  }
  catalogContent = '1 0 obj\n' + orig + '\nendobj\n';
} else {
  catalogContent = '1 0 obj\n<</Type /Catalog /AcroForm ' + acroformId + ' 0 R>>\nendobj\n';
}
parts.push(catalogContent);
currentOffset += Buffer.byteLength(catalogContent, 'utf8');

// Build xref table
// Collect all new/updated object IDs and their offsets
const xrefEntries = [];
// Field widgets
for (let i = 0; i < totalFields; i++) {
  xrefEntries.push({id: startObjectId + i, offset: fieldOffsets[i]});
}
// AcroForm
xrefEntries.push({id: acroformId, offset: acroformActualOffset});
// Updated pages
for (const pu of pageUpdateObjs) {
  xrefEntries.push({id: pu.id, offset: pu.offset});
}
// Updated catalog
xrefEntries.push({id: catalogId, offset: catalogOffset});

// Sort by ID
xrefEntries.sort((a, b) => a.id - b.id);

// Build xref as individual subsections to avoid needing sequential IDs
const xrefOffset = currentOffset;
let xrefStr = 'xref\n';

// Group into subsections
let groups = [];
let currentGroup = null;
for (const e of xrefEntries) {
  if (!currentGroup || e.id !== currentGroup.start + currentGroup.entries.length) {
    currentGroup = {start: e.id, entries: []};
    groups.push(currentGroup);
  }
  currentGroup.entries.push(e);
}

for (const g of groups) {
  xrefStr += g.start + ' ' + g.entries.length + '\n';
  for (const e of g.entries) {
    const offStr = e.offset.toString().padStart(10, '0');
    xrefStr += offStr + ' 00000 n\r\n';
  }
}

parts.push(xrefStr);

// Build new trailer
const newSize = 1 + acroformId + 1; // max object id + 1
const trailerStr = 'trailer\n<</Size ' + newSize + ' /Prev 322433 /Root 1 0 R /Info 552 0 R>>\nstartxref\n' + xrefOffset + '\n%%EOF\n';
parts.push(trailerStr);

// Write output
const updateContent = parts.join('');
const outputBuffer = Buffer.concat([originalBytes, Buffer.from(updateContent, 'utf8')]);
fs.writeFileSync(OUTPUT, outputBuffer);

console.log('Fields added: ' + totalFields);
console.log('Output: ' + OUTPUT);
console.log('File size: ' + outputBuffer.length + ' bytes');
