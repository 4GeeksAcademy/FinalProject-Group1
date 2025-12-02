CONVERSION_FACTORS = {
    "g": {"base": "g", "factor": 1.0},
    "kg": {"base": "g", "factor": 1000.0},
    "lb": {"base": "g", "factor": 453.592},
    "oz": {"base": "g", "factor": 28.35},
    "ml": {"base": "ml", "factor": 1.0},
    "l": {"base": "ml", "factor": 1000.0},
    "tbsp": {"base": "ml", "factor": 14.787},
    "tsp": {"base": "ml", "factor": 4.929},
    "tazas": {"base": "ml", "factor": 236.588},
    "unidades": {"base": "none", "factor": 1.0},
    "pizca": {"base": "none", "factor": 1.0},
}


class UnitConverter:
    def __init__(self, conversion_factors):
        self.factors = conversion_factors

    def convert_ingredient(self, quantity: float, unit_from: str, unit_to: str, ingredient_model=None) -> float:
        info_from = self.factors.get(unit_from)
        info_to = self.factors.get(unit_to)

        if not info_from or not info_to:
            return quantity, unit_from

        base_from = info_from["base"]
        base_to = info_to["base"]

        UNCONVERTIBLE_BASES = ["none"] 
        MASA_BASES = ["g"]
        VOLUMEN_BASES = ["ml"]

        if base_from in VOLUMEN_BASES and base_to in MASA_BASES and ingredient_model and ingredient_model.volume_to_mass_factor:
            factor_density = ingredient_model.volume_to_mass_factor
            quantity_in_base = quantity * info_from["factor"]
            quantity_converted = (quantity_in_base * factor_density) / info_to["factor"]
            return quantity_converted, unit_to 
        
        if base_from in MASA_BASES and base_to in VOLUMEN_BASES and ingredient_model and ingredient_model.volume_to_mass_factor:
            factor_density = ingredient_model.volume_to_mass_factor
            quantity_in_base = quantity * info_from["factor"]
            quantity_converted = (quantity_in_base / factor_density) / info_to["factor"]
            return quantity_converted, unit_to 
        
        if base_from != base_to:
            return quantity, unit_from 
        
        if base_from in UNCONVERTIBLE_BASES:
            return quantity, unit_from 
        
        quantity_in_base = quantity * info_from["factor"]
        quantity_converted = quantity_in_base / info_to["factor"]
        return quantity_converted, unit_to


converter = UnitConverter(CONVERSION_FACTORS)
