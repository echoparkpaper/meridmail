"""
Create a fillable version of the ACORD 125 Commercial Insurance Application.
Adds AcroForm interactive fields (text boxes, checkboxes) to the flat PDF.
"""

from pypdf import PdfReader, PdfWriter
from pypdf.generic import (
    DictionaryObject, ArrayObject, NameObject, NumberObject,
    StringObject, BooleanObject
)
import os

INPUT_PDF = "/Users/Meridian/meridmail/acord-125.pdf"
OUTPUT_PDF = "/Users/Meridian/meridmail/acord-125-fillable.pdf"

all_fields = []


def h(top_from_top, page_h=792):
    """Convert measurement-from-top to PDF y coordinate (bottom-left origin)."""
    return page_h - top_from_top


def add_text_field(writer, page_num, field_name, rect, font_size=7, multiline=False):
    """Add an interactive text field. rect = (x0, y0, x1, y1) in PDF coords."""
    page = writer.pages[page_num]
    flags = 4096 if multiline else 0

    field = DictionaryObject({
        NameObject("/Type"): NameObject("/Annot"),
        NameObject("/Subtype"): NameObject("/Widget"),
        NameObject("/FT"): NameObject("/Tx"),
        NameObject("/T"): StringObject(field_name),
        NameObject("/Rect"): ArrayObject([
            NumberObject(rect[0]), NumberObject(rect[1]),
            NumberObject(rect[2]), NumberObject(rect[3])
        ]),
        NameObject("/F"): NumberObject(4),
        NameObject("/DA"): StringObject(f"/Helv {font_size} Tf 0 g"),
        NameObject("/Ff"): NumberObject(flags),
        NameObject("/BS"): DictionaryObject({
            NameObject("/W"): NumberObject(0),
            NameObject("/S"): NameObject("/S")
        }),
        NameObject("/MK"): DictionaryObject({}),
    })

    writer._add_object(field)

    if "/Annots" not in page:
        page[NameObject("/Annots")] = ArrayObject()
    page["/Annots"].append(field.indirect_reference)
    all_fields.append(field.indirect_reference)


def add_checkbox(writer, page_num, field_name, rect):
    """Add an interactive checkbox. rect = (x0, y0, x1, y1) in PDF coords."""
    page = writer.pages[page_num]

    field = DictionaryObject({
        NameObject("/Type"): NameObject("/Annot"),
        NameObject("/Subtype"): NameObject("/Widget"),
        NameObject("/FT"): NameObject("/Btn"),
        NameObject("/T"): StringObject(field_name),
        NameObject("/Rect"): ArrayObject([
            NumberObject(rect[0]), NumberObject(rect[1]),
            NumberObject(rect[2]), NumberObject(rect[3])
        ]),
        NameObject("/F"): NumberObject(4),
        NameObject("/V"): NameObject("/Off"),
        NameObject("/AS"): NameObject("/Off"),
        NameObject("/DA"): StringObject("/ZaDb 0 Tf 0 g"),
        NameObject("/MK"): DictionaryObject({
            NameObject("/CA"): StringObject("4")
        }),
    })

    writer._add_object(field)

    if "/Annots" not in page:
        page[NameObject("/Annots")] = ArrayObject()
    page["/Annots"].append(field.indirect_reference)
    all_fields.append(field.indirect_reference)


# ============================================================
# PAGE 1
# ============================================================

def build_page1(writer):
    p = 0

    # DATE (top right)
    add_text_field(writer, p, "date", (490, h(40), 594, h(25)))

    # PRODUCER block (left column)
    add_text_field(writer, p, "producer_name_address", (18, h(105), 275, h(42)), font_size=7, multiline=True)

    # CARRIER / NAIC CODE
    add_text_field(writer, p, "carrier", (280, h(65), 510, h(42)))
    add_text_field(writer, p, "naic_code", (515, h(65), 594, h(42)))

    # COMPANY POLICY OR PROGRAM NAME / PROGRAM CODE
    add_text_field(writer, p, "program_name", (280, h(90), 510, h(68)))
    add_text_field(writer, p, "program_code", (515, h(90), 594, h(68)))

    # POLICY NUMBER
    add_text_field(writer, p, "policy_number", (280, h(110), 594, h(93)))

    # CONTACT NAME / UNDERWRITER
    add_text_field(writer, p, "contact_name", (18, h(135), 275, h(112)))
    add_text_field(writer, p, "underwriter", (280, h(135), 450, h(112)))
    add_text_field(writer, p, "underwriter_office", (455, h(135), 594, h(112)))

    # PHONE
    add_text_field(writer, p, "phone", (18, h(157), 275, h(137)))

    # FAX / EMAIL / CODE / SUBCODE / AGENCY CUSTOMER ID
    add_text_field(writer, p, "fax", (18, h(176), 275, h(158)))
    add_text_field(writer, p, "email_address", (18, h(196), 275, h(177)))
    add_text_field(writer, p, "code", (18, h(213), 120, h(197)))
    add_text_field(writer, p, "subcode", (125, h(213), 200, h(197)))
    add_text_field(writer, p, "agency_customer_id_p1", (18, h(230), 275, h(214)))

    # STATUS OF TRANSACTION checkboxes
    add_checkbox(writer, p, "status_quote", (350, h(170), 362, h(158)))
    add_checkbox(writer, p, "status_issue_policy", (415, h(170), 427, h(158)))
    add_checkbox(writer, p, "status_renew", (488, h(170), 500, h(158)))
    add_checkbox(writer, p, "status_bound", (350, h(186), 362, h(174)))
    add_text_field(writer, p, "bound_date", (365, h(186), 460, h(174)))
    add_text_field(writer, p, "bound_time", (465, h(186), 530, h(174)))
    add_checkbox(writer, p, "status_bound_am", (533, h(186), 545, h(174)))
    add_checkbox(writer, p, "status_bound_pm", (533, h(196), 545, h(186)))
    add_checkbox(writer, p, "status_change", (350, h(207), 362, h(195)))
    add_text_field(writer, p, "change_date", (365, h(207), 460, h(195)))
    add_text_field(writer, p, "change_time", (465, h(207), 530, h(195)))
    add_checkbox(writer, p, "status_cancel", (350, h(222), 362, h(210)))

    # LINES OF BUSINESS — Col 1
    lob_rows_col1 = [
        ("lob_boiler_machinery", 282),
        ("lob_business_auto", 296),
        ("lob_business_owners", 310),
        ("lob_cgl", 324),
        ("lob_inland_marine", 338),
        ("lob_commercial_property", 352),
        ("lob_crime", 366),
    ]
    for name, top in lob_rows_col1:
        add_checkbox(writer, p, "cb_" + name, (20, h(top+10), 31, h(top)))
        add_text_field(writer, p, "prem_" + name, (98, h(top+10), 172, h(top)))

    # LINES OF BUSINESS — Col 2
    lob_rows_col2 = [
        ("lob_cyber_privacy", 282),
        ("lob_fiduciary", 296),
        ("lob_garage_dealers", 310),
        ("lob_liquor", 324),
        ("lob_motor_carrier", 338),
        ("lob_truckers", 352),
        ("lob_umbrella", 366),
    ]
    for name, top in lob_rows_col2:
        add_checkbox(writer, p, "cb_" + name, (200, h(top+10), 211, h(top)))
        add_text_field(writer, p, "prem_" + name, (270, h(top+10), 355, h(top)))

    # LINES OF BUSINESS — Col 3
    lob_rows_col3 = [
        ("lob_yacht", 282),
        ("lob_c3_r2", 296),
        ("lob_c3_r3", 310),
        ("lob_c3_r4", 324),
        ("lob_c3_r5", 338),
        ("lob_c3_r6", 352),
        ("lob_c3_r7", 366),
    ]
    for name, top in lob_rows_col3:
        add_checkbox(writer, p, "cb_" + name, (378, h(top+10), 389, h(top)))
        add_text_field(writer, p, "prem_" + name, (440, h(top+10), 594, h(top)))

    # ATTACHMENTS — Col 1
    attach_col1 = [
        ("attach_accts_receivable", 399),
        ("attach_addl_interest", 412),
        ("attach_addl_premises", 425),
        ("attach_apartment", 438),
        ("attach_condo_bylaws", 451),
        ("attach_contractors", 464),
        ("attach_coverages_sched", 477),
        ("attach_dealers", 490),
        ("attach_driver_info", 503),
        ("attach_electronic_data", 516),
    ]
    for name, top in attach_col1:
        add_checkbox(writer, p, "cb_" + name, (20, h(top+9), 30, h(top)))

    # ATTACHMENTS — Col 2
    attach_col2 = [
        ("attach_glass_sign", 399),
        ("attach_hotel_motel", 412),
        ("attach_installation_builders", 425),
        ("attach_intl_liability", 438),
        ("attach_intl_property", 451),
        ("attach_loss_summary", 464),
        ("attach_open_cargo", 477),
        ("attach_prem_payment", 490),
        ("attach_prof_liability", 503),
        ("attach_restaurant", 516),
    ]
    for name, top in attach_col2:
        add_checkbox(writer, p, "cb_" + name, (205, h(top+9), 215, h(top)))

    # ATTACHMENTS — Col 3
    attach_col3 = [
        ("attach_statement_values", 399),
        ("attach_state_supplement", 412),
        ("attach_vacant_building", 425),
        ("attach_vehicle_sched", 438),
    ]
    for name, top in attach_col3:
        add_checkbox(writer, p, "cb_" + name, (390, h(top+9), 400, h(top)))

    # POLICY INFORMATION
    add_text_field(writer, p, "proposed_eff_date", (20, h(556), 88, h(540)))
    add_text_field(writer, p, "proposed_exp_date", (90, h(556), 158, h(540)))
    add_text_field(writer, p, "billing_plan", (160, h(556), 235, h(540)))
    add_checkbox(writer, p, "billing_direct", (162, h(568), 173, h(558)))
    add_checkbox(writer, p, "billing_agency", (192, h(568), 203, h(558)))
    add_text_field(writer, p, "payment_plan", (240, h(556), 320, h(540)))
    add_text_field(writer, p, "method_of_payment", (325, h(556), 405, h(540)))
    add_text_field(writer, p, "audit", (410, h(556), 440, h(540)))
    add_text_field(writer, p, "deposit", (445, h(568), 500, h(540)))
    add_text_field(writer, p, "minimum_premium", (505, h(568), 548, h(540)))
    add_text_field(writer, p, "policy_premium", (550, h(568), 594, h(540)))

    # APPLICANT INFORMATION — First Named Insured
    add_text_field(writer, p, "first_named_insured_name_addr", (18, h(650), 310, h(582)), font_size=7, multiline=True)
    add_text_field(writer, p, "gl_code", (315, h(606), 375, h(582)))
    add_text_field(writer, p, "sic", (380, h(606), 435, h(582)))
    add_text_field(writer, p, "naics", (440, h(606), 505, h(582)))
    add_text_field(writer, p, "fein", (510, h(606), 594, h(582)))
    add_text_field(writer, p, "business_phone", (315, h(624), 594, h(608)))
    add_text_field(writer, p, "website_address", (315, h(642), 594, h(626)))

    # Entity type checkboxes — First Named Insured
    add_checkbox(writer, p, "entity_corporation", (20, h(668), 31, h(657)))
    add_checkbox(writer, p, "entity_joint_venture", (95, h(668), 106, h(657)))
    add_checkbox(writer, p, "entity_not_for_profit", (195, h(668), 206, h(657)))
    add_checkbox(writer, p, "entity_subchapter_s", (310, h(668), 321, h(657)))
    add_checkbox(writer, p, "entity_individual", (20, h(681), 31, h(670)))
    add_checkbox(writer, p, "entity_llc", (95, h(681), 106, h(670)))
    add_text_field(writer, p, "no_of_members", (115, h(681), 175, h(670)))
    add_checkbox(writer, p, "entity_partnership", (195, h(681), 206, h(670)))
    add_checkbox(writer, p, "entity_trust", (310, h(681), 321, h(670)))
    add_checkbox(writer, p, "entity_other", (430, h(681), 441, h(670)))

    # Other Named Insured block (bottom of page 1)
    add_text_field(writer, p, "other_named_insured_name_addr", (18, h(755), 310, h(693)), font_size=7, multiline=True)
    add_text_field(writer, p, "other_gl_code", (315, h(718), 375, h(693)))
    add_text_field(writer, p, "other_sic", (380, h(718), 435, h(693)))
    add_text_field(writer, p, "other_naics", (440, h(718), 505, h(693)))
    add_text_field(writer, p, "other_fein", (510, h(718), 594, h(693)))
    add_text_field(writer, p, "other_business_phone", (315, h(735), 594, h(719)))
    add_text_field(writer, p, "other_website_address", (315, h(752), 594, h(736)))

    add_checkbox(writer, p, "other_entity_corporation", (20, h(760), 31, h(749)))
    add_checkbox(writer, p, "other_entity_joint_venture", (95, h(760), 106, h(749)))
    add_checkbox(writer, p, "other_entity_not_for_profit", (195, h(760), 206, h(749)))
    add_checkbox(writer, p, "other_entity_subchapter_s", (310, h(760), 321, h(749)))
    add_checkbox(writer, p, "other_entity_individual", (20, h(772), 31, h(761)))
    add_checkbox(writer, p, "other_entity_llc", (95, h(772), 106, h(761)))
    add_text_field(writer, p, "other_no_of_members", (115, h(772), 175, h(761)))
    add_checkbox(writer, p, "other_entity_partnership", (195, h(772), 206, h(761)))
    add_checkbox(writer, p, "other_entity_trust", (310, h(772), 321, h(761)))
    add_checkbox(writer, p, "other_entity_other", (430, h(772), 441, h(761)))


# ============================================================
# PAGE 2
# ============================================================

def build_page2(writer):
    p = 1

    # Agency Customer ID
    add_text_field(writer, p, "p2_agency_customer_id", (350, h(28), 594, h(18)))

    # Another Other Named Insured at top of page 2
    add_text_field(writer, p, "p2_other_named_insured_addr", (18, h(100), 310, h(35)), font_size=7, multiline=True)
    add_text_field(writer, p, "p2_other_gl_code", (315, h(62), 375, h(38)))
    add_text_field(writer, p, "p2_other_sic", (380, h(62), 435, h(38)))
    add_text_field(writer, p, "p2_other_naics", (440, h(62), 505, h(38)))
    add_text_field(writer, p, "p2_other_fein", (510, h(62), 594, h(38)))
    add_text_field(writer, p, "p2_other_bus_phone", (315, h(80), 594, h(64)))
    add_text_field(writer, p, "p2_other_website", (315, h(98), 594, h(82)))

    add_checkbox(writer, p, "p2_entity_corporation", (20, h(108), 31, h(97)))
    add_checkbox(writer, p, "p2_entity_joint_venture", (95, h(108), 106, h(97)))
    add_checkbox(writer, p, "p2_entity_not_for_profit", (195, h(108), 206, h(97)))
    add_checkbox(writer, p, "p2_entity_subchapter_s", (310, h(108), 321, h(97)))
    add_checkbox(writer, p, "p2_entity_individual", (20, h(120), 31, h(109)))
    add_checkbox(writer, p, "p2_entity_llc", (95, h(120), 106, h(109)))
    add_text_field(writer, p, "p2_no_of_members", (115, h(120), 175, h(109)))
    add_checkbox(writer, p, "p2_entity_partnership", (195, h(120), 206, h(109)))
    add_checkbox(writer, p, "p2_entity_trust", (310, h(120), 321, h(109)))
    add_checkbox(writer, p, "p2_entity_other", (430, h(120), 441, h(109)))

    # CONTACT INFORMATION — Contact 1 (left half)
    add_text_field(writer, p, "contact1_type", (18, h(148), 200, h(133)))
    add_text_field(writer, p, "contact1_name", (18, h(163), 200, h(150)))
    add_text_field(writer, p, "contact1_primary_phone", (18, h(180), 58, h(169)))
    add_checkbox(writer, p, "contact1_phone_home", (60, h(180), 71, h(169)))
    add_checkbox(writer, p, "contact1_phone_bus", (85, h(180), 96, h(169)))
    add_checkbox(writer, p, "contact1_phone_cell", (110, h(180), 121, h(169)))
    add_text_field(writer, p, "contact1_secondary_phone", (125, h(180), 148, h(169)))
    add_checkbox(writer, p, "contact1_sec_phone_home", (150, h(180), 161, h(169)))
    add_checkbox(writer, p, "contact1_sec_phone_bus", (175, h(180), 186, h(169)))
    add_checkbox(writer, p, "contact1_sec_phone_cell", (200, h(180), 211, h(169)))
    add_text_field(writer, p, "contact1_primary_email", (18, h(196), 280, h(183)))
    add_text_field(writer, p, "contact1_secondary_email", (18, h(210), 280, h(197)))

    # CONTACT INFORMATION — Contact 2 (right half)
    add_text_field(writer, p, "contact2_type", (295, h(148), 594, h(133)))
    add_text_field(writer, p, "contact2_name", (295, h(163), 594, h(150)))
    add_text_field(writer, p, "contact2_primary_phone", (295, h(180), 343, h(169)))
    add_checkbox(writer, p, "contact2_phone_home", (345, h(180), 356, h(169)))
    add_checkbox(writer, p, "contact2_phone_bus", (370, h(180), 381, h(169)))
    add_checkbox(writer, p, "contact2_phone_cell", (395, h(180), 406, h(169)))
    add_text_field(writer, p, "contact2_secondary_phone", (410, h(180), 433, h(169)))
    add_checkbox(writer, p, "contact2_sec_phone_home", (435, h(180), 446, h(169)))
    add_checkbox(writer, p, "contact2_sec_phone_bus", (460, h(180), 471, h(169)))
    add_checkbox(writer, p, "contact2_sec_phone_cell", (485, h(180), 496, h(169)))
    add_text_field(writer, p, "contact2_primary_email", (295, h(196), 594, h(183)))
    add_text_field(writer, p, "contact2_secondary_email", (295, h(210), 594, h(197)))

    # PREMISES INFORMATION — 4 location blocks
    for loc_num in range(1, 5):
        base_top = 218 + (loc_num - 1) * 58

        add_text_field(writer, p, "loc" + str(loc_num) + "_num", (18, h(base_top+13), 50, h(base_top)))
        add_text_field(writer, p, "loc" + str(loc_num) + "_street", (55, h(base_top+13), 320, h(base_top)))
        add_checkbox(writer, p, "loc" + str(loc_num) + "_city_inside", (325, h(base_top+9), 336, h(base_top)))
        add_checkbox(writer, p, "loc" + str(loc_num) + "_city_outside", (325, h(base_top+22), 336, h(base_top+13)))
        add_checkbox(writer, p, "loc" + str(loc_num) + "_interest_owner", (365, h(base_top+9), 376, h(base_top)))
        add_checkbox(writer, p, "loc" + str(loc_num) + "_interest_tenant", (365, h(base_top+22), 376, h(base_top+13)))
        add_text_field(writer, p, "loc" + str(loc_num) + "_full_time_empl", (390, h(base_top+9), 450, h(base_top)))
        add_text_field(writer, p, "loc" + str(loc_num) + "_annual_revenues", (455, h(base_top+9), 594, h(base_top)))
        add_text_field(writer, p, "loc" + str(loc_num) + "_bld_num", (18, h(base_top+26), 50, h(base_top+14)))
        add_text_field(writer, p, "loc" + str(loc_num) + "_city", (55, h(base_top+26), 250, h(base_top+14)))
        add_text_field(writer, p, "loc" + str(loc_num) + "_state", (255, h(base_top+26), 310, h(base_top+14)))
        add_text_field(writer, p, "loc" + str(loc_num) + "_part_time_empl", (390, h(base_top+26), 450, h(base_top+14)))
        add_text_field(writer, p, "loc" + str(loc_num) + "_occupied_area", (455, h(base_top+26), 550, h(base_top+14)))
        add_text_field(writer, p, "loc" + str(loc_num) + "_county", (55, h(base_top+39), 250, h(base_top+27)))
        add_text_field(writer, p, "loc" + str(loc_num) + "_zip", (255, h(base_top+39), 310, h(base_top+27)))
        add_text_field(writer, p, "loc" + str(loc_num) + "_open_to_public", (455, h(base_top+39), 550, h(base_top+27)))
        add_text_field(writer, p, "loc" + str(loc_num) + "_total_bldg_area", (455, h(base_top+52), 550, h(base_top+40)))
        add_checkbox(writer, p, "loc" + str(loc_num) + "_area_leased_y", (555, h(base_top+52), 566, h(base_top+40)))
        add_checkbox(writer, p, "loc" + str(loc_num) + "_area_leased_n", (570, h(base_top+52), 581, h(base_top+40)))
        add_text_field(writer, p, "loc" + str(loc_num) + "_description", (18, h(base_top+57), 450, h(base_top+43)))

    # NATURE OF BUSINESS checkboxes
    nob_items = [
        ("nob_apartments",     480, 20),
        ("nob_contractor",     480, 95),
        ("nob_manufacturing",  480, 175),
        ("nob_restaurant",     480, 270),
        ("nob_service",        480, 360),
        ("nob_condominiums",   493, 20),
        ("nob_institutional",  493, 95),
        ("nob_office",         493, 175),
        ("nob_retail",         493, 270),
        ("nob_wholesale",      493, 360),
    ]
    for name, top, x in nob_items:
        add_checkbox(writer, p, "cb_" + name, (x, h(top+9), x+11, h(top)))

    add_text_field(writer, p, "nob_other_text", (400, h(493), 465, h(478)))
    add_text_field(writer, p, "date_business_started", (470, h(493), 594, h(478)))

    # Description of Primary Operations
    add_text_field(writer, p, "desc_primary_operations", (18, h(560), 594, h(497)), font_size=7, multiline=True)

    # Installation / retail % fields
    add_text_field(writer, p, "retail_pct_total_sales", (18, h(577), 200, h(563)))
    add_text_field(writer, p, "install_service_repair_pct", (265, h(577), 350, h(563)))
    add_text_field(writer, p, "off_premises_pct", (455, h(577), 594, h(563)))

    # Description of Operations of Other Named Insureds
    add_text_field(writer, p, "desc_other_named_ops", (18, h(660), 594, h(580)), font_size=7, multiline=True)


# ============================================================
# PAGE 3
# ============================================================

def build_page3(writer):
    p = 2

    # Agency Customer ID
    add_text_field(writer, p, "p3_agency_customer_id", (350, h(28), 594, h(18)))

    # ADDITIONAL INTEREST — interest type checkboxes (left side)
    interest_left = [
        ("ai_additional_insured", 68),
        ("ai_breach_of_warranty", 80),
        ("ai_co_owner",           92),
        ("ai_employee_as_lessor", 104),
        ("ai_leaseback_owner",    116),
        ("ai_lenders_loss_payable", 128),
    ]
    for name, top in interest_left:
        add_checkbox(writer, p, "cb_" + name, (20, h(top+8), 31, h(top)))

    interest_right = [
        ("ai_lienholder",  68),
        ("ai_loss_payee",  80),
        ("ai_mortgagee",   92),
        ("ai_owner",       104),
        ("ai_registrant",  116),
        ("ai_trustee",     128),
    ]
    for name, top in interest_right:
        add_checkbox(writer, p, "cb_" + name, (80, h(top+8), 91, h(top)))

    add_text_field(writer, p, "ai_name_address", (140, h(120), 330, h(42)))
    add_text_field(writer, p, "ai_rank", (335, h(50), 380, h(42)))
    add_checkbox(writer, p, "ai_evidence_certificate", (390, h(62), 401, h(52)))
    add_checkbox(writer, p, "ai_evidence_policy", (420, h(62), 431, h(52)))
    add_checkbox(writer, p, "ai_evidence_send_bill", (450, h(62), 461, h(52)))
    add_text_field(writer, p, "ai_location", (480, h(52), 560, h(42)))
    add_text_field(writer, p, "ai_building", (565, h(52), 594, h(42)))
    add_text_field(writer, p, "ai_vehicle", (480, h(65), 560, h(53)))
    add_text_field(writer, p, "ai_boat", (565, h(65), 594, h(53)))
    add_text_field(writer, p, "ai_airport", (480, h(78), 560, h(66)))
    add_text_field(writer, p, "ai_aircraft", (565, h(78), 594, h(66)))
    add_text_field(writer, p, "ai_item_class", (480, h(91), 560, h(79)))
    add_text_field(writer, p, "ai_item", (565, h(91), 594, h(79)))
    add_text_field(writer, p, "ai_item_description", (480, h(130), 594, h(92)))
    add_text_field(writer, p, "ai_reference_loan_num", (140, h(140), 350, h(130)))
    add_text_field(writer, p, "ai_interest_end_date", (355, h(140), 480, h(130)))
    add_text_field(writer, p, "ai_lien_amount", (140, h(155), 350, h(141)))
    add_text_field(writer, p, "ai_phone", (355, h(155), 480, h(141)))
    add_text_field(writer, p, "ai_fax", (485, h(155), 594, h(141)))
    add_text_field(writer, p, "ai_reason_for_interest", (140, h(170), 370, h(157)))
    add_text_field(writer, p, "ai_email_address", (375, h(170), 594, h(157)))

    # GENERAL INFORMATION — Y/N questions

    # Q1a: Subsidiary of another entity
    add_checkbox(writer, p, "q1a_yn", (580, h(198), 594, h(188)))
    add_text_field(writer, p, "q1a_parent_company", (20, h(218), 380, h(205)))
    add_text_field(writer, p, "q1a_relationship", (385, h(218), 510, h(205)))
    add_text_field(writer, p, "q1a_pct_owned", (515, h(218), 594, h(205)))

    # Q1b: Has subsidiaries
    add_checkbox(writer, p, "q1b_yn", (580, h(232), 594, h(222)))
    add_text_field(writer, p, "q1b_subsidiary_name", (20, h(252), 380, h(239)))
    add_text_field(writer, p, "q1b_relationship", (385, h(252), 510, h(239)))
    add_text_field(writer, p, "q1b_pct_owned", (515, h(252), 594, h(239)))

    # Q2: Formal safety program
    add_checkbox(writer, p, "q2_yn", (580, h(268), 594, h(258)))
    add_checkbox(writer, p, "q2_safety_manual", (20, h(284), 31, h(273)))
    add_checkbox(writer, p, "q2_safety_position", (95, h(284), 106, h(273)))
    add_checkbox(writer, p, "q2_monthly_meetings", (185, h(284), 196, h(273)))
    add_checkbox(writer, p, "q2_osha", (275, h(284), 286, h(273)))

    # Q3: Flammables/explosives/chemicals
    add_checkbox(writer, p, "q3_yn", (580, h(298), 594, h(288)))
    add_text_field(writer, p, "q3_explanation", (20, h(320), 594, h(300)), multiline=True)

    # Q4: Other insurance with this company
    add_checkbox(writer, p, "q4_yn", (580, h(334), 594, h(324)))
    add_text_field(writer, p, "q4_lob1", (20, h(356), 140, h(338)))
    add_text_field(writer, p, "q4_policy1", (145, h(356), 295, h(338)))
    add_text_field(writer, p, "q4_lob2", (300, h(356), 430, h(338)))
    add_text_field(writer, p, "q4_policy2", (435, h(356), 594, h(338)))
    add_text_field(writer, p, "q4_lob3", (20, h(370), 140, h(358)))
    add_text_field(writer, p, "q4_policy3", (145, h(370), 295, h(358)))
    add_text_field(writer, p, "q4_lob4", (300, h(370), 430, h(358)))
    add_text_field(writer, p, "q4_policy4", (435, h(370), 594, h(358)))

    # Q5: Policy declined/cancelled/non-renewed
    add_checkbox(writer, p, "q5_yn", (580, h(388), 594, h(378)))
    add_checkbox(writer, p, "q5_nonpayment", (20, h(406), 31, h(395)))
    add_checkbox(writer, p, "q5_agent_no_longer", (95, h(406), 106, h(395)))
    add_checkbox(writer, p, "q5_nonrenewal", (20, h(420), 31, h(409)))
    add_checkbox(writer, p, "q5_underwriting", (95, h(420), 106, h(409)))
    add_text_field(writer, p, "q5_condition_corrected", (200, h(420), 594, h(409)))

    # Q6: Past losses / sexual abuse / molestation
    add_checkbox(writer, p, "q6_yn", (580, h(434), 594, h(424)))
    add_text_field(writer, p, "q6_explanation", (20, h(455), 594, h(436)), multiline=True)

    # Q7: Fraud/bribery/arson conviction
    add_checkbox(writer, p, "q7_yn", (580, h(490), 594, h(480)))
    add_text_field(writer, p, "q7_explanation", (20, h(520), 594, h(492)), multiline=True)

    # Q8: Fire/safety code violations — 2 detail rows
    add_checkbox(writer, p, "q8_yn", (580, h(534), 594, h(524)))
    for i, by in enumerate([548, 560]):
        sfx = str(i+1)
        add_text_field(writer, p, "q8_occur_date_" + sfx, (20, h(by+10), 85, h(by)))
        add_text_field(writer, p, "q8_explanation_" + sfx, (90, h(by+10), 370, h(by)))
        add_text_field(writer, p, "q8_resolution_" + sfx, (375, h(by+10), 530, h(by)))
        add_text_field(writer, p, "q8_resolve_date_" + sfx, (535, h(by+10), 594, h(by)))

    # Q9: Foreclosure/bankruptcy
    add_checkbox(writer, p, "q9_yn", (580, h(580), 594, h(570)))
    for i, by in enumerate([594, 606]):
        sfx = str(i+1)
        add_text_field(writer, p, "q9_occur_date_" + sfx, (20, h(by+10), 85, h(by)))
        add_text_field(writer, p, "q9_explanation_" + sfx, (90, h(by+10), 370, h(by)))
        add_text_field(writer, p, "q9_resolution_" + sfx, (375, h(by+10), 530, h(by)))
        add_text_field(writer, p, "q9_resolve_date_" + sfx, (535, h(by+10), 594, h(by)))

    # Q10: Judgement or lien
    add_checkbox(writer, p, "q10_yn", (580, h(626), 594, h(616)))
    for i, by in enumerate([640, 652]):
        sfx = str(i+1)
        add_text_field(writer, p, "q10_occur_date_" + sfx, (20, h(by+10), 85, h(by)))
        add_text_field(writer, p, "q10_explanation_" + sfx, (90, h(by+10), 370, h(by)))
        add_text_field(writer, p, "q10_resolution_" + sfx, (375, h(by+10), 530, h(by)))
        add_text_field(writer, p, "q10_resolve_date_" + sfx, (535, h(by+10), 594, h(by)))

    # Q11: Business in trust
    add_checkbox(writer, p, "q11_yn", (580, h(668), 594, h(658)))
    add_text_field(writer, p, "q11_trust_name", (250, h(668), 575, h(658)))

    # Q12: Foreign operations
    add_checkbox(writer, p, "q12_yn", (580, h(682), 594, h(672)))

    # Q13: Other business ventures
    add_checkbox(writer, p, "q13_yn", (580, h(714), 594, h(704)))
    add_text_field(writer, p, "q13_explanation", (20, h(730), 594, h(716)), multiline=True)

    # Q14: Drones owned/operated
    add_checkbox(writer, p, "q14_yn", (580, h(744), 594, h(734)))
    add_text_field(writer, p, "q14_description", (200, h(756), 594, h(746)))

    # Q15: Hire others to operate drones
    add_checkbox(writer, p, "q15_yn", (580, h(762), 594, h(752)))
    add_text_field(writer, p, "q15_description", (200, h(773), 594, h(763)))


# ============================================================
# PAGE 4
# ============================================================

def build_page4(writer):
    p = 3

    # Agency Customer ID
    add_text_field(writer, p, "p4_agency_customer_id", (350, h(28), 594, h(18)))

    # Remarks / Processing Instructions
    add_text_field(writer, p, "remarks", (18, h(75), 594, h(32)), font_size=7, multiline=True)

    # PRIOR CARRIER INFORMATION — 3 years x 4 columns
    col_gl_x   = (148, 280)
    col_auto_x = (283, 415)
    col_prop_x = (418, 510)
    col_oth_x  = (513, 594)

    for yr in range(1, 4):
        base = 95 + (yr - 1) * 70
        y = str(yr)

        add_text_field(writer, p, "yr" + y + "_year",           (18, h(base+13), 55, h(base)))
        add_text_field(writer, p, "yr" + y + "_carrier_gl",     (col_gl_x[0],   h(base+13), col_gl_x[1],   h(base)))
        add_text_field(writer, p, "yr" + y + "_carrier_auto",   (col_auto_x[0], h(base+13), col_auto_x[1], h(base)))
        add_text_field(writer, p, "yr" + y + "_carrier_prop",   (col_prop_x[0], h(base+13), col_prop_x[1], h(base)))
        add_text_field(writer, p, "yr" + y + "_carrier_other",  (col_oth_x[0],  h(base+13), col_oth_x[1],  h(base)))

        add_text_field(writer, p, "yr" + y + "_policy_gl",      (col_gl_x[0],   h(base+26), col_gl_x[1],   h(base+14)))
        add_text_field(writer, p, "yr" + y + "_policy_auto",    (col_auto_x[0], h(base+26), col_auto_x[1], h(base+14)))
        add_text_field(writer, p, "yr" + y + "_policy_prop",    (col_prop_x[0], h(base+26), col_prop_x[1], h(base+14)))
        add_text_field(writer, p, "yr" + y + "_policy_other",   (col_oth_x[0],  h(base+26), col_oth_x[1],  h(base+14)))

        add_text_field(writer, p, "yr" + y + "_premium_gl",     (col_gl_x[0],   h(base+39), col_gl_x[1],   h(base+27)))
        add_text_field(writer, p, "yr" + y + "_premium_auto",   (col_auto_x[0], h(base+39), col_auto_x[1], h(base+27)))
        add_text_field(writer, p, "yr" + y + "_premium_prop",   (col_prop_x[0], h(base+39), col_prop_x[1], h(base+27)))
        add_text_field(writer, p, "yr" + y + "_premium_other",  (col_oth_x[0],  h(base+39), col_oth_x[1],  h(base+27)))

        add_text_field(writer, p, "yr" + y + "_eff_date_gl",    (col_gl_x[0],   h(base+52), col_gl_x[1],   h(base+40)))
        add_text_field(writer, p, "yr" + y + "_eff_date_auto",  (col_auto_x[0], h(base+52), col_auto_x[1], h(base+40)))
        add_text_field(writer, p, "yr" + y + "_eff_date_prop",  (col_prop_x[0], h(base+52), col_prop_x[1], h(base+40)))
        add_text_field(writer, p, "yr" + y + "_eff_date_other", (col_oth_x[0],  h(base+52), col_oth_x[1],  h(base+40)))

        add_text_field(writer, p, "yr" + y + "_exp_date_gl",    (col_gl_x[0],   h(base+65), col_gl_x[1],   h(base+53)))
        add_text_field(writer, p, "yr" + y + "_exp_date_auto",  (col_auto_x[0], h(base+65), col_auto_x[1], h(base+53)))
        add_text_field(writer, p, "yr" + y + "_exp_date_prop",  (col_prop_x[0], h(base+65), col_prop_x[1], h(base+53)))
        add_text_field(writer, p, "yr" + y + "_exp_date_other", (col_oth_x[0],  h(base+65), col_oth_x[1],  h(base+53)))

    # LOSS HISTORY
    add_text_field(writer, p, "loss_history_years", (235, h(307), 270, h(297)))
    add_text_field(writer, p, "loss_history_total", (430, h(316), 594, h(305)))
    add_checkbox(writer, p, "loss_history_none", (145, h(316), 156, h(305)))

    for row in range(1, 4):
        by = 318 + (row - 1) * 14
        r = str(row)
        add_text_field(writer, p, "loss" + r + "_occur_date",      (18,  h(by+12), 75,  h(by)))
        add_text_field(writer, p, "loss" + r + "_line",            (78,  h(by+12), 120, h(by)))
        add_text_field(writer, p, "loss" + r + "_description",     (123, h(by+12), 360, h(by)))
        add_text_field(writer, p, "loss" + r + "_claim_date",      (363, h(by+12), 425, h(by)))
        add_text_field(writer, p, "loss" + r + "_amount_paid",     (428, h(by+12), 490, h(by)))
        add_text_field(writer, p, "loss" + r + "_amount_reserved", (493, h(by+12), 545, h(by)))
        add_checkbox(writer, p, "loss" + r + "_subrogation_y",  (548, h(by+12), 558, h(by)))
        add_checkbox(writer, p, "loss" + r + "_subrogation_n",  (560, h(by+12), 570, h(by)))
        add_checkbox(writer, p, "loss" + r + "_claim_open_y",   (573, h(by+12), 583, h(by)))
        add_checkbox(writer, p, "loss" + r + "_claim_open_n",   (585, h(by+12), 594, h(by)))

    # Signature section
    add_checkbox(writer, p, "privacy_notice_given", (18, h(372), 29, h(362)))
    add_text_field(writer, p, "applicants_initials_p4", (540, h(420), 594, h(410)))


# ============================================================
# PAGE 5
# ============================================================

def build_page5(writer):
    p = 4

    # Agency Customer ID
    add_text_field(writer, p, "p5_agency_customer_id", (350, h(28), 594, h(18)))

    # Producer signature block
    add_text_field(writer, p, "producers_signature", (18, h(670), 240, h(655)))
    add_text_field(writer, p, "producers_name_print", (245, h(670), 470, h(655)))
    add_text_field(writer, p, "state_producer_license_no", (475, h(670), 594, h(655)))

    # Applicant signature block
    add_text_field(writer, p, "applicants_signature", (18, h(694), 370, h(679)))
    add_text_field(writer, p, "applicants_sig_date", (375, h(694), 490, h(679)))
    add_text_field(writer, p, "national_producer_number", (495, h(694), 594, h(679)))


# ============================================================
# MAIN
# ============================================================

def main():
    print("Reading " + INPUT_PDF + "...")
    reader = PdfReader(INPUT_PDF)
    num_pages = len(reader.pages)
    print("Found " + str(num_pages) + " pages")

    writer = PdfWriter()
    for page in reader.pages:
        writer.add_page(page)

    # Set up AcroForm dictionary with font resources
    acroform = DictionaryObject({
        NameObject("/Fields"): ArrayObject([]),
        NameObject("/DA"): StringObject("/Helv 7 Tf 0 g"),
        NameObject("/DR"): DictionaryObject({
            NameObject("/Font"): DictionaryObject({
                NameObject("/Helv"): DictionaryObject({
                    NameObject("/Type"): NameObject("/Font"),
                    NameObject("/Subtype"): NameObject("/Type1"),
                    NameObject("/BaseFont"): NameObject("/Helvetica"),
                }),
                NameObject("/ZaDb"): DictionaryObject({
                    NameObject("/Type"): NameObject("/Font"),
                    NameObject("/Subtype"): NameObject("/Type1"),
                    NameObject("/BaseFont"): NameObject("/ZapfDingbats"),
                }),
            })
        }),
        NameObject("/NeedAppearances"): BooleanObject(True),
    })
    writer._root_object[NameObject("/AcroForm")] = acroform

    print("Building Page 1 fields...")
    build_page1(writer)
    print("Building Page 2 fields...")
    build_page2(writer)
    print("Building Page 3 fields...")
    build_page3(writer)
    print("Building Page 4 fields...")
    build_page4(writer)
    print("Building Page 5 fields...")
    build_page5(writer)

    # Populate AcroForm Fields list
    acroform[NameObject("/Fields")] = ArrayObject(all_fields)

    print("Total fields added: " + str(len(all_fields)))
    print("Saving to " + OUTPUT_PDF + "...")

    with open(OUTPUT_PDF, "wb") as f:
        writer.write(f)

    size = os.path.getsize(OUTPUT_PDF)
    print("Done! File size: " + str(size) + " bytes (" + str(round(size/1024, 1)) + " KB)")
    print("Saved to: " + OUTPUT_PDF)


if __name__ == "__main__":
    main()
