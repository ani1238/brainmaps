#!/usr/bin/env python3
"""Builds concept_c67_sci_thermometer_measuring_temperature.json in the BrainMaps
v12 question architecture, and validates that every misconception tag / key-concept
referenced by an item exists in the concept glossaries."""
import json, sys, collections

concept = {
    "concept_id": "c67_sci_thermometer_measuring_temperature",
    "concept_name": "Thermometer and Measuring Temperature",
    "subject": "Class 6-7 Science (Curiosity)",
    "chapter": "Heat and Temperature",
    "source_section": "NCERT 'Measurement of Temperature' — degree of hotness, clinical vs laboratory thermometer, Celsius scale, kink/constriction, heat vs temperature; classroom activities on reading a thermometer at eye level.",
    "engine_version": "v12",
    "bloom_by_station": {
        "L1": "Remember",
        "L2": "Understand",
        "L3": "Apply",
        "Strengthen": "Mixed",
        "Revise": "Apply -> Analyse (spaced recall)",
    },
    "misconception_tag_glossary": {
        "confuses_heat_with_temperature": "Treats heat and temperature as the same thing, instead of temperature being the degree of hotness and heat being the energy that flows.",
        "bigger_means_hotter": "Assumes a larger object must have a higher temperature (confuses amount of heat with temperature).",
        "clinical_measures_anything": "Thinks a clinical thermometer can measure any temperature, including boiling water, ignoring its narrow 35-42 C range.",
        "ignores_kink_function": "Does not understand that the kink/constriction stops the mercury thread from slipping back so the reading holds after removal.",
        "reads_not_at_eye_level": "Reads the thermometer scale from an angle instead of keeping the eye level with the top of the liquid thread.",
        "confuses_celsius_fahrenheit": "Confuses the Celsius scale/units with Fahrenheit, or mixes up their values.",
        "thinks_normal_temp_is_100": "Believes normal human body temperature is around 100 (confuses degrees F with C, or with water's boiling point).",
        "lab_thermometer_for_body": "Thinks a laboratory thermometer is the right tool to measure human body temperature.",
        "touch_measures_temperature": "Believes touching or feeling an object gives an accurate measurement of its temperature.",
        "wrong_range_selection": "Chooses a thermometer whose measuring range does not fit the object being measured.",
        "reads_before_contact": "Reads the thermometer before it has been in contact long enough to reach the object's temperature.",
        "mercury_never_falls": "Thinks the mercury never falls back in any thermometer, not realising the lab thermometer has no kink so its thread does drop.",
    },
    "key_concept_glossary": {
        "kc_temperature_definition": "Temperature is the measure of the degree of hotness or coldness of an object.",
        "kc_heat_vs_temperature": "Heat is energy that flows from a hotter to a colder object; temperature is the degree of hotness — a large object can hold more heat yet be at a lower temperature.",
        "kc_celsius_scale": "Temperature is commonly measured in degrees Celsius (C); on this scale water freezes at 0 C and boils at 100 C.",
        "kc_clinical_thermometer": "A clinical thermometer measures human body temperature; its range is about 35 C to 42 C.",
        "kc_laboratory_thermometer": "A laboratory thermometer measures the temperature of objects and liquids; its range is wider, about -10 C to 110 C.",
        "kc_kink_function": "The clinical thermometer has a kink (constriction) that stops the mercury from slipping back, so the reading stays until shaken down.",
        "kc_normal_body_temp": "The normal temperature of the human body is about 37 C (98.6 F).",
        "kc_reading_thermometer": "Read a thermometer with the eye level with the top of the liquid thread, and keep it in contact until the reading stops rising.",
        "kc_tool_selection": "Pick the thermometer whose range fits the object: clinical for the body, laboratory for hot/cold liquids.",
    },
}

MISC = set(concept["misconception_tag_glossary"])
KC = set(concept["key_concept_glossary"])

def mcq(id, prompt, opts, hint, expl, kcs, correct, **extra):
    options = []
    for oid, text, tag in opts:
        o = {"id": oid, "text": text, "correct": (oid == correct)}
        if tag:
            o["tag"] = tag
        options.append(o)
    d = {"id": id, "type": "mcq", "prompt": prompt, "options": options,
         "correctOptionId": correct, "hint": hint, "explanation": expl, "key_concepts": kcs}
    d.update(extra)
    return d

stations = {}

# ── L1 · Remember (Easy) ─────────────────────────────────────────────────────
L1 = [
    mcq("L1_MCQ_01",
        "Riya wants to know how hot the water in a pan is. The 'how hot or cold' something is is called its —",
        [("a", "Temperature", None),
         ("b", "Heat -- because heat and hotness mean the same thing", "confuses_heat_with_temperature"),
         ("c", "Weight -- a hotter thing weighs more", "bigger_means_hotter"),
         ("d", "Touch -- you feel it with your hand", "touch_measures_temperature")],
        "The word means the DEGREE of hotness or coldness.",
        "Temperature is the measure of how hot or cold an object is. Heat is the energy that flows; temperature is the degree of hotness.",
        ["kc_temperature_definition"], "a"),
    mcq("L1_MCQ_02",
        "The doctor puts a special thermometer under Aarav's tongue to check his fever. Which thermometer is this?",
        [("a", "Clinical thermometer", None),
         ("b", "Laboratory thermometer -- it is used for people too", "lab_thermometer_for_body"),
         ("c", "Any thermometer works the same for the body", "wrong_range_selection"),
         ("d", "No thermometer -- the doctor just touches the forehead", "touch_measures_temperature")],
        "Which thermometer is made to measure the human body?",
        "A clinical thermometer is designed to measure human body temperature; its range is about 35 C to 42 C.",
        ["kc_clinical_thermometer", "kc_tool_selection"], "a"),
    mcq("L1_MCQ_03",
        "On the Celsius scale used on most thermometers, water freezes into ice at —",
        [("a", "0 C", None),
         ("b", "32 C -- that is the freezing mark", "confuses_celsius_fahrenheit"),
         ("c", "100 C", None),
         ("d", "37 C", None)],
        "Ice forms at the bottom of the Celsius scale.",
        "On the Celsius scale water freezes at 0 C and boils at 100 C. (32 is the freezing point on the Fahrenheit scale.)",
        ["kc_celsius_scale"], "a"),
    mcq("L1_MCQ_04",
        "What is the normal temperature of a healthy human body?",
        [("a", "About 37 C", None),
         ("b", "About 100 C -- that is why we say 'a hundred-degree fever'", "thinks_normal_temp_is_100"),
         ("c", "About 0 C", None),
         ("d", "About 50 C", None)],
        "It is close to 37 on the Celsius scale (98.6 on Fahrenheit).",
        "Normal human body temperature is about 37 C (98.6 F). '100' comes from the Fahrenheit scale, not Celsius.",
        ["kc_normal_body_temp", "kc_celsius_scale"], "a"),
    {
        "id": "L1_CLS_01", "type": "classify",
        "prompt": "Sort each job to the thermometer that should do it.",
        "categories": ["Clinical thermometer", "Laboratory thermometer"],
        "items": [
            {"text": "Check a child's fever", "correct_category": "Clinical thermometer"},
            {"text": "Measure the temperature of boiling milk", "correct_category": "Laboratory thermometer"},
            {"text": "Take a patient's body temperature", "correct_category": "Clinical thermometer"},
            {"text": "Measure how cold ice-cold water is", "correct_category": "Laboratory thermometer"},
            {"text": "Measure the temperature of warm water in a beaker", "correct_category": "Laboratory thermometer"},
        ],
        "explanation": "The clinical thermometer (35-42 C) is for the human body; the laboratory thermometer (-10 to 110 C) is for hot or cold objects and liquids.",
        "key_concepts": ["kc_clinical_thermometer", "kc_laboratory_thermometer", "kc_tool_selection"],
    },
    {
        "id": "L1_MATCH_01", "type": "match",
        "prompt": "Match each thermometer feature to what it means.",
        "pairs": [
            {"left": "Kink (constriction)", "right": "Stops mercury slipping back so the reading holds"},
            {"left": "Clinical range 35-42 C", "right": "Made to fit human body temperature"},
            {"left": "Celsius scale", "right": "Water freezes at 0 and boils at 100"},
        ],
        "distractor_rights": ["Makes the thermometer measure weight instead of temperature"],
        "explanation": "The kink holds the reading, the 35-42 C range fits the body, and Celsius sets 0 for freezing and 100 for boiling.",
        "key_concepts": ["kc_kink_function", "kc_clinical_thermometer", "kc_celsius_scale"],
    },
    {
        "id": "L1_SEQ_01", "type": "sequence",
        "prompt": "Put these steps in the correct order for measuring body temperature with a clinical thermometer.",
        "items_scrambled": [
            "Read the scale with your eye level with the top of the mercury thread",
            "Wash the thermometer and shake it so the mercury falls below 35 C",
            "Wait until the mercury stops rising",
            "Place the bulb under the tongue (or in the armpit)",
        ],
        "correct_order": [
            "Wash the thermometer and shake it so the mercury falls below 35 C",
            "Place the bulb under the tongue (or in the armpit)",
            "Wait until the mercury stops rising",
            "Read the scale with your eye level with the top of the mercury thread",
        ],
        "explanation": "Shake down first, then place it, wait for the reading to stop rising, and only then read at eye level.",
        "key_concepts": ["kc_reading_thermometer", "kc_kink_function"],
    },
    {
        "id": "L1_BLURT_01", "type": "blurt",
        "prompt": "In 30 seconds, blurt out everything you remember about a CLINICAL thermometer.",
        "recall_guide": "body, range, kink",
        "key_points": [
            "Measures human body temperature",
            "Range is about 35 C to 42 C",
            "Has a kink that holds the reading until shaken down",
        ],
        "key_concepts": ["kc_clinical_thermometer", "kc_kink_function"],
    },
    {
        "id": "L1_TFW_01", "type": "true_false_why",
        "statement": "You can tell exactly how hot water is just by putting your finger in it.",
        "verdict": "False",
        "reason_options": [
            {"id": "a", "text": "True -- your hand is an accurate thermometer", "correct": False, "tag": "touch_measures_temperature"},
            {"id": "b", "text": "False -- touch only gives a rough feeling; a thermometer is needed for an exact temperature", "correct": True},
            {"id": "c", "text": "False -- because water has no temperature", "correct": False, "tag": "confuses_heat_with_temperature"},
        ],
        "correct_reason": "b",
        "explanation": "Our sense of touch is unreliable and can even be misleading; temperature must be measured with a thermometer.",
        "key_concepts": ["kc_temperature_definition", "kc_reading_thermometer"],
    },
]
stations["L1"] = L1

# ── L2 · Understand ──────────────────────────────────────────────────────────
L2 = [
    mcq("L2_MCQ_01",
        "Why does a clinical thermometer have a kink (a narrow bend) just above the bulb?",
        [("a", "So the mercury does not slip back, letting you read the temperature after taking it out of the mouth", None),
         ("b", "So the thermometer can measure any temperature, even boiling water", "clinical_measures_anything"),
         ("c", "To make the thermometer look decorative", None),
         ("d", "So the mercury can never rise at all", "ignores_kink_function")],
        "Think about reading it AFTER it leaves the mouth.",
        "The kink stops the mercury thread from falling back on its own, so the reading holds until you shake it down.",
        ["kc_kink_function"], "a"),
    {
        "id": "L2_CLOZE_01", "type": "cloze",
        "prompt": "Fill each blank with the correct word.",
        "text": "Temperature is the degree of [1] of an object, measured in degrees [2]. A [3] thermometer measures body temperature and has a [4] to hold the reading, while a [5] thermometer measures hot and cold liquids over a wider range.",
        "blanks": [
            {"id": 1, "answer": "hotness"},
            {"id": 2, "answer": "Celsius"},
            {"id": 3, "answer": "clinical"},
            {"id": 4, "answer": "kink"},
            {"id": 5, "answer": "laboratory"},
        ],
        "word_bank": ["hotness", "Celsius", "clinical", "kink", "laboratory", "Fahrenheit", "weight"],
        "explanation": "Temperature = degree of hotness, in Celsius; the clinical thermometer (with a kink) reads the body, the laboratory thermometer reads liquids.",
        "key_concepts": ["kc_temperature_definition", "kc_celsius_scale", "kc_clinical_thermometer", "kc_kink_function", "kc_laboratory_thermometer"],
    },
    {
        "id": "L2_AR_01", "type": "assertion_reason",
        "assertion_text": "A clinical thermometer should not be used to measure the temperature of boiling water.",
        "reason_text": "A clinical thermometer's range is only about 35 C to 42 C.",
        "options": [
            {"id": "a", "text": "Both the Assertion and the Reason are true, and the Reason correctly explains the Assertion.", "correct": True},
            {"id": "b", "text": "Both are true, but the Reason does NOT explain the Assertion.", "correct": False, "tag": "wrong_range_selection"},
            {"id": "c", "text": "The Assertion is true, but the Reason is false.", "correct": False, "tag": "clinical_measures_anything"},
            {"id": "d", "text": "The Assertion is false, but the Reason is true.", "correct": False, "tag": "clinical_measures_anything"},
        ],
        "correctOptionId": "a",
        "explanation": "Boiling water is 100 C, far above the clinical thermometer's 42 C limit, so it would be off-scale and could break -- the narrow range is exactly why it must not be used.",
        "key_concepts": ["kc_clinical_thermometer", "kc_tool_selection"],
    },
    {
        "id": "L2_TFW_01", "type": "true_false_why",
        "statement": "A big bucket of warm water always has a higher temperature than a small cup of the same warm water.",
        "verdict": "False",
        "reason_options": [
            {"id": "a", "text": "True -- the bigger bucket is hotter because it is bigger", "correct": False, "tag": "bigger_means_hotter"},
            {"id": "b", "text": "False -- the bucket holds more heat energy, but both can be at the same temperature", "correct": True},
            {"id": "c", "text": "False -- bigger objects are always colder", "correct": False, "tag": "bigger_means_hotter"},
        ],
        "correct_reason": "b",
        "explanation": "Size affects how much heat is stored, not the temperature. Same warmth = same temperature, even though the bucket contains more heat energy.",
        "key_concepts": ["kc_heat_vs_temperature"],
    },
    {
        "id": "L2_SPOT_01", "type": "spot_it",
        "prompt": "Three students describe how to read a thermometer. One statement is wrong. Spot it.",
        "statements": [
            {"id": 1, "speaker": "Meera", "text": "Keep your eye level with the top of the mercury thread."},
            {"id": 2, "speaker": "Dev", "text": "Read it the instant you touch it to the object, before the mercury settles."},
            {"id": 3, "speaker": "Sara", "text": "Wait until the mercury stops rising, then read the mark."},
        ],
        "error_id": 2,
        "misconception_label": "reads_before_contact",
        "explanation": "You must wait until the mercury stops rising (thermal contact is complete) before reading -- reading too early gives a wrong, lower value.",
        "key_concepts": ["kc_reading_thermometer"],
    },
    {
        "id": "L2_PJ_01", "type": "predict_justify",
        "scenario": "Kabir reads that a laboratory thermometer has NO kink, unlike a clinical thermometer.",
        "prediction_question": "When Kabir lifts a laboratory thermometer out of hot water into the cool air, what will the liquid thread most likely do?",
        "prediction_options": [
            "Stay exactly where it was in the hot water",
            "Start falling back down as it cools",
            "Rise even higher out of the water",
            "Break the glass",
        ],
        "correct_prediction": "Start falling back down as it cools",
        "justify_question": "Why?",
        "justify_options": [
            {"id": "a", "text": "Because a lab thermometer has no kink to hold the thread, so it falls as the liquid cools -- that is why you read it while it is still in contact", "correct": True},
            {"id": "b", "text": "Because the mercury in any thermometer can never fall once it has risen", "correct": False, "tag": "mercury_never_falls"},
            {"id": "c", "text": "Because lifting it adds heat and pushes the thread up", "correct": False, "tag": "confuses_heat_with_temperature"},
        ],
        "correct_justify": "a",
        "key_concepts": ["kc_laboratory_thermometer", "kc_kink_function", "kc_reading_thermometer"],
    },
    {
        "id": "L2_FEY_01", "type": "feynman",
        "explanation_frame": "Your younger cousin asks: 'If heat and temperature both mean hotness, why are they two different words?' Explain the difference in a way she'll understand.",
        "rubric_points": [
            "States that temperature is the degree of hotness (how hot/cold something is)",
            "States that heat is the energy that flows from a hotter to a colder object",
            "Gives an example showing a big object can hold more heat but be at the same or lower temperature",
        ],
        "subtype": "teach_a_younger_child",
        "key_concepts": ["kc_temperature_definition", "kc_heat_vs_temperature"],
    },
    {
        "id": "L2_DESC_01", "type": "descriptive",
        "prompt": "Explain why a clinical thermometer can be read a few seconds AFTER it is taken out of the mouth, but a laboratory thermometer must be read while it is still in the liquid.",
        "rubric_points": [
            "Says the clinical thermometer has a kink/constriction",
            "Explains the kink stops the mercury from falling back, holding the reading",
            "Says the laboratory thermometer has no kink",
            "Concludes the lab thermometer's thread falls as it cools, so it must be read in contact",
        ],
        "example_answer": "A clinical thermometer has a kink that stops the mercury from slipping back, so the reading stays even after you remove it. A laboratory thermometer has no kink, so its liquid falls back as it cools -- you must read it while it is still in the liquid.",
        "key_concepts": ["kc_kink_function", "kc_laboratory_thermometer", "kc_reading_thermometer"],
    },
]
stations["L2"] = L2

# ── L3 · Apply ───────────────────────────────────────────────────────────────
L3 = [
    {
        "id": "L3_CD_01", "type": "conclusion_draw",
        "data_context": "Nina tries to measure the temperature of boiling water with a clinical thermometer. The mercury shoots to the very top (42 C) mark and the glass cracks.",
        "prompt": "Which conclusion is best supported by what happened?",
        "options": [
            {"id": "a", "text": "The clinical thermometer's range (35-42 C) is far too small for boiling water (100 C), so the wrong tool was used", "correct": True},
            {"id": "b", "text": "Boiling water is actually only 42 C", "correct": False, "misconception_tags": ["clinical_measures_anything"]},
            {"id": "c", "text": "All thermometers break in hot water, so none can measure it", "correct": False, "misconception_tags": ["wrong_range_selection"]},
            {"id": "d", "text": "The water was not really boiling", "correct": False, "misconception_tags": ["clinical_measures_anything"]},
        ],
        "correct_key": "a",
        "explanation": "Boiling water is 100 C, well beyond the clinical thermometer's 42 C limit. A laboratory thermometer (up to ~110 C) is the correct tool.",
        "key_concepts": ["kc_clinical_thermometer", "kc_laboratory_thermometer", "kc_tool_selection"],
    },
    {
        "id": "L3_CLUSTER_01", "type": "mcq_cluster",
        "scenario": "In the lab, Arjun has four tasks: (1) check his friend's fever, (2) measure the temperature of ice-cold water at about 2 C, (3) measure boiling water at 100 C, (4) read a thermometer whose thread has stopped rising.",
        "sub_questions": [
            {
                "id": "L3_CLUSTER_01_s1",
                "prompt": "For task 1 (check a fever), which thermometer should Arjun use?",
                "options": [
                    {"id": "a", "text": "Clinical thermometer", "correct": True},
                    {"id": "b", "text": "Laboratory thermometer", "correct": False, "tag": "lab_thermometer_for_body"},
                    {"id": "c", "text": "Either -- it makes no difference", "correct": False, "tag": "wrong_range_selection"},
                ],
                "correctOptionId": "a",
            },
            {
                "id": "L3_CLUSTER_01_s2",
                "prompt": "For tasks 2 and 3 (ice-cold water and boiling water), which thermometer fits both?",
                "options": [
                    {"id": "a", "text": "Laboratory thermometer (about -10 to 110 C)", "correct": True},
                    {"id": "b", "text": "Clinical thermometer (35 to 42 C)", "correct": False, "tag": "clinical_measures_anything"},
                    {"id": "c", "text": "Neither can measure liquids", "correct": False, "tag": "wrong_range_selection"},
                ],
                "correctOptionId": "a",
            },
            {
                "id": "L3_CLUSTER_01_s3",
                "prompt": "For task 4, how should Arjun take the reading?",
                "options": [
                    {"id": "a", "text": "With his eye level with the top of the thread", "correct": True},
                    {"id": "b", "text": "Looking down at it from above at an angle", "correct": False, "tag": "reads_not_at_eye_level"},
                    {"id": "c", "text": "Immediately, before the thread settles", "correct": False, "tag": "reads_before_contact"},
                ],
                "correctOptionId": "a",
            },
        ],
        "explanation": "Match the tool to the range (clinical for the body, lab for liquids) and read at eye level once the thread stops rising.",
        "key_concepts": ["kc_tool_selection", "kc_clinical_thermometer", "kc_laboratory_thermometer", "kc_reading_thermometer"],
    },
    {
        "id": "L3_PJ_01", "type": "predict_justify",
        "scenario": "Priya pours one cup of boiling water into a large bucket of water at room temperature.",
        "prediction_question": "What will most likely happen to the bucket's overall temperature?",
        "prediction_options": [
            "It will rise to 100 C like the boiling water",
            "It will rise only a little",
            "It will fall below room temperature",
            "Nothing changes because the cup was hot",
        ],
        "correct_prediction": "It will rise only a little",
        "justify_question": "Why?",
        "justify_options": [
            {"id": "a", "text": "The small amount of heat from one cup spreads through a large amount of water, so the temperature rises only slightly", "correct": True},
            {"id": "b", "text": "Because the boiling water makes everything it touches 100 C", "correct": False, "tag": "confuses_heat_with_temperature"},
            {"id": "c", "text": "Because the bigger bucket is always hotter", "correct": False, "tag": "bigger_means_hotter"},
        ],
        "correct_justify": "a",
        "key_concepts": ["kc_heat_vs_temperature"],
    },
    {
        "id": "L3_DESIGN_01", "type": "design_challenge",
        "prompt": "Design a short step-by-step checklist a Class 6 student could follow to correctly measure and record the temperature of any object -- from ice-cold water to a feverish patient. Justify why each step is included.",
        "rubric_points": [
            "Includes a step to choose the right thermometer for the object's range (clinical for body, laboratory for liquids)",
            "Includes shaking down / checking the starting level before use",
            "Includes keeping the thermometer in contact until the thread stops rising",
            "Includes reading at eye level with the top of the thread",
            "Justifies why the wrong-range thermometer or an early/angled reading would give a wrong result",
        ],
        "example_answer": "Step 1: Pick the right thermometer -- clinical for a body, laboratory for hot/cold liquids -- so the temperature is within its range. Step 2: Check/shake the starting level. Step 3: Put the bulb in contact and wait until the thread stops rising. Step 4: Read at eye level with the top of the thread. Each step avoids a common error: wrong range, early reading, or an angled (parallax) reading.",
        "key_concepts": ["kc_tool_selection", "kc_reading_thermometer", "kc_clinical_thermometer", "kc_laboratory_thermometer"],
    },
    {
        "id": "L3_DESC_01", "type": "descriptive",
        "prompt": "A shopkeeper says 'this hot jalebi has more heat than a whole warm swimming pool, so it must be at a higher temperature.' Is the reasoning about temperature correct? Explain using the difference between heat and temperature.",
        "rubric_points": [
            "Identifies that heat and temperature are being confused",
            "Explains the jalebi is at a higher temperature (hotter) than the pool",
            "Explains the pool holds far more total heat energy despite a lower temperature (because it is much larger)",
            "Concludes 'more heat' does not mean 'higher temperature'",
        ],
        "example_answer": "The reasoning mixes up heat and temperature. The jalebi is at a higher temperature (it feels much hotter). But the huge pool actually holds far more total heat energy because it is so large, even though its temperature is lower. So having more heat does not mean a higher temperature.",
        "key_concepts": ["kc_heat_vs_temperature", "kc_temperature_definition"],
    },
]
stations["L3"] = L3

# ── Strengthen · Mixed ───────────────────────────────────────────────────────
STR = [
    mcq("STR_MCQ_01",
        "Which list correctly gives the range of each thermometer?",
        [("a", "Clinical: 35-42 C; Laboratory: about -10 to 110 C", None),
         ("b", "Clinical: 0-100 C; Laboratory: 35-42 C", "wrong_range_selection"),
         ("c", "Both measure exactly 0 to 50 C", "wrong_range_selection"),
         ("d", "Clinical can measure any temperature", "clinical_measures_anything")],
        "The body's thermometer has the narrow range.",
        "A clinical thermometer covers roughly 35-42 C (body range); a laboratory thermometer covers a much wider range, about -10 to 110 C.",
        ["kc_clinical_thermometer", "kc_laboratory_thermometer"], "a"),
    {
        "id": "STR_CLS_01", "type": "classify",
        "prompt": "Sort each statement as being about HEAT or about TEMPERATURE.",
        "categories": ["Heat", "Temperature"],
        "items": [
            {"text": "The degree of hotness of an object", "correct_category": "Temperature"},
            {"text": "The energy that flows from a hotter body to a colder one", "correct_category": "Heat"},
            {"text": "Measured in degrees Celsius with a thermometer", "correct_category": "Temperature"},
            {"text": "A large pool can store a lot of it even when it is not very hot", "correct_category": "Heat"},
        ],
        "explanation": "Temperature is the degree of hotness (measured in C); heat is the energy that flows and depends on size/amount too.",
        "key_concepts": ["kc_heat_vs_temperature", "kc_temperature_definition"],
    },
    {
        "id": "STR_AR_01", "type": "assertion_reason",
        "assertion_text": "A laboratory thermometer must be kept inside the liquid while its temperature is being read.",
        "reason_text": "A laboratory thermometer has no kink, so its liquid thread falls back as soon as it starts to cool.",
        "options": [
            {"id": "a", "text": "Both are true, and the Reason correctly explains the Assertion.", "correct": True},
            {"id": "b", "text": "Both are true, but the Reason does NOT explain the Assertion.", "correct": False, "tag": "ignores_kink_function"},
            {"id": "c", "text": "The Assertion is true, but the Reason is false.", "correct": False, "tag": "mercury_never_falls"},
            {"id": "d", "text": "The Assertion is false, but the Reason is true.", "correct": False, "tag": "ignores_kink_function"},
        ],
        "correctOptionId": "a",
        "explanation": "With no kink, the thread drops as the liquid cools, so you must read it in contact -- the missing kink is exactly the reason.",
        "key_concepts": ["kc_laboratory_thermometer", "kc_kink_function", "kc_reading_thermometer"],
    },
    {
        "id": "STR_CLOZE_01", "type": "cloze",
        "prompt": "Complete the passage about reading a thermometer.",
        "text": "Keep your [1] level with the top of the thread. Wait until the liquid [2] rising before you read. On the [3] scale, the normal body temperature is about [4] C.",
        "blanks": [
            {"id": 1, "answer": "eye"},
            {"id": 2, "answer": "stops"},
            {"id": 3, "answer": "Celsius"},
            {"id": 4, "answer": "37"},
        ],
        "word_bank": ["eye", "stops", "Celsius", "37", "hand", "starts", "Fahrenheit", "100"],
        "explanation": "Read at eye level once the thread stops rising; normal body temperature is about 37 C.",
        "key_concepts": ["kc_reading_thermometer", "kc_normal_body_temp", "kc_celsius_scale"],
    },
    {
        "id": "STR_FIX_01", "type": "fix_it",
        "prompt": "Fix the mistake in this sentence: 'To check a fever, use a laboratory thermometer and read it by looking down on it from above.'",
        "rubric_points": [
            "Changes 'laboratory thermometer' to 'clinical thermometer' for a fever",
            "Changes the reading method to 'eye level with the top of the thread'",
            "Keeps the rest of the sentence sensible",
        ],
        "example_answer": "To check a fever, use a clinical thermometer and read it with your eye level with the top of the thread.",
        "key_concepts": ["kc_tool_selection", "kc_reading_thermometer"],
    },
]
stations["Strengthen"] = STR

# ── Revise · Apply -> Analyse (spaced recall) ────────────────────────────────
REV = [
    mcq("REV_MCQ_01",
        "A nurse needs one thermometer for patients' fevers and another for testing water temperatures in the ward. Which pairing is correct?",
        [("a", "Clinical for patients, laboratory for water", None),
         ("b", "Laboratory for patients, clinical for water", "wrong_range_selection"),
         ("c", "Clinical for both", "clinical_measures_anything"),
         ("d", "It does not matter which is used where", "wrong_range_selection")],
        "Match each tool to the range it covers.",
        "The clinical thermometer (35-42 C) fits body temperature; the laboratory thermometer (wider range) fits water and other liquids.",
        ["kc_tool_selection", "kc_clinical_thermometer", "kc_laboratory_thermometer"], "a"),
    {
        "id": "REV_CD_01", "type": "conclusion_draw",
        "data_context": "Two identical clinical thermometers are used on the same patient one minute apart. One nurse reads 37 C looking straight on at eye level; the other reads 36 C glancing down from above.",
        "prompt": "Which conclusion is best supported?",
        "options": [
            {"id": "a", "text": "The 37 C reading is more reliable because it was read at eye level; the angled reading introduced a parallax error", "correct": True},
            {"id": "b", "text": "The patient's temperature really dropped 1 C in a minute", "correct": False, "misconception_tags": ["reads_not_at_eye_level"]},
            {"id": "c", "text": "One thermometer must be broken", "correct": False, "misconception_tags": ["reads_not_at_eye_level"]},
            {"id": "d", "text": "Clinical thermometers cannot give the same reading twice", "correct": False, "misconception_tags": ["clinical_measures_anything"]},
        ],
        "correct_key": "a",
        "explanation": "Reading from an angle instead of eye level gives a slightly wrong value (parallax). The eye-level reading is the trustworthy one.",
        "key_concepts": ["kc_reading_thermometer"],
    },
    {
        "id": "REV_FEY_01", "type": "feynman",
        "explanation_frame": "A friend missed the lesson and asks: 'Why can't I just use one thermometer for everything -- my fever and boiling water?' Explain it to them.",
        "rubric_points": [
            "Explains each thermometer has a measuring range",
            "Says the clinical range (35-42 C) is too small for boiling water (100 C)",
            "Says you should pick the thermometer whose range fits the object (clinical for body, lab for liquids)",
        ],
        "subtype": "explain_to_a_friend",
        "key_concepts": ["kc_tool_selection", "kc_clinical_thermometer", "kc_laboratory_thermometer"],
    },
    {
        "id": "REV_DESC_01", "type": "descriptive",
        "prompt": "In your own words, explain the difference between heat and temperature, and give one everyday example that shows a bigger object can hold more heat without being at a higher temperature.",
        "rubric_points": [
            "Defines temperature as the degree of hotness",
            "Defines heat as energy that flows from hotter to colder",
            "Gives a valid example (e.g. warm pool vs hot cup) where the larger object holds more heat at a lower/equal temperature",
        ],
        "example_answer": "Temperature is how hot or cold something is; heat is the energy that flows from a hotter to a colder object. A warm swimming pool holds much more heat than a hot cup of tea, but the cup is at a higher temperature -- so more heat does not mean higher temperature.",
        "key_concepts": ["kc_heat_vs_temperature", "kc_temperature_definition"],
    },
]
stations["Revise"] = REV

# assemble stations with pool/session sizing
concept["stations"] = {}
for st, items in stations.items():
    concept["stations"][st] = {
        "pool_size": len(items),
        "session_size": min(6, len(items)),
        "items": items,
    }

# ── validation ───────────────────────────────────────────────────────────────
errors = []
seen_ids = set()

def check_kcs(where, kcs):
    for k in kcs:
        if k not in KC:
            errors.append(f"{where}: unknown key_concept '{k}'")

def check_tag(where, tag):
    if tag and tag not in MISC:
        errors.append(f"{where}: unknown misconception tag '{tag}'")

type_counts = collections.Counter()
for st, sv in concept["stations"].items():
    for it in sv["items"]:
        iid = it["id"]
        if iid in seen_ids:
            errors.append(f"duplicate id {iid}")
        seen_ids.add(iid)
        type_counts[it["type"]] += 1
        check_kcs(iid, it.get("key_concepts", []))
        for o in it.get("options", []):
            check_tag(iid, o.get("tag"))
            for t in o.get("misconception_tags", []):
                check_tag(iid, t)
        for o in it.get("reason_options", []) + it.get("justify_options", []):
            check_tag(iid, o.get("tag"))
        if it.get("misconception_label"):
            check_tag(iid, it["misconception_label"])
        for sub in it.get("sub_questions", []):
            for o in sub.get("options", []):
                check_tag(iid, o.get("tag"))
        if "options" in it and "correctOptionId" in it:
            ids = [o["id"] for o in it["options"]]
            if it["correctOptionId"] not in ids:
                errors.append(f"{iid}: correctOptionId not among options")
            if sum(1 for o in it["options"] if o.get("correct")) != 1:
                errors.append(f"{iid}: must have exactly one correct option")

if errors:
    print("VALIDATION FAILED:")
    for e in errors:
        print("  -", e)
    sys.exit(1)

import os
out = "/Users/anirbanmanna/Code/brainmaps/backend/content/concept_c67_sci_thermometer_measuring_temperature.json"
os.makedirs(os.path.dirname(out), exist_ok=True)
with open(out, "w") as f:
    json.dump(concept, f, indent=2, ensure_ascii=False)

total = sum(type_counts.values())
print(f"OK — wrote {out}")
print(f"{total} items across {len(concept['stations'])} stations; {len(MISC)} tags, {len(KC)} key-concepts")
print("type distribution:", dict(type_counts))
