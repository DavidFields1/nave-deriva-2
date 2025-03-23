import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
	private data: Record<
		number,
		{ specific_volume_liquid: number; specific_volume_vapor: number }
	> = {
		0.05: { specific_volume_liquid: 0.00105, specific_volume_vapor: 30.0 },
		10: { specific_volume_liquid: 0.0035, specific_volume_vapor: 0.0035 },
	};

	/*
	 ? Performs linear interpolation to estimate a value between two known points.
	 * @param P - The target pressure value for which interpolation is needed.
	 * @param P1 - The lower bound pressure value from known data.
	 * @param P2 - The upper bound pressure value from known data.
	 * @param v1 - The specific volume corresponding to P1.
	 * @param v2 - The specific volume corresponding to P2.
	 ! @returns The interpolated specific volume for the given pressure P.
	 */
	interpolate(
		P: number,
		P1: number,
		P2: number,
		v1: number,
		v2: number
	): number {
		return v1 + ((P - P1) * (v2 - v1)) / (P2 - P1);
	}

	getPhaseChange(pressure: string) {
		const pressureValue = parseFloat(pressure);

		if (isNaN(pressureValue)) {
			throw new BadRequestException('Invalid pressure value');
		}

		if (this.data[pressureValue]) {
			return this.data[pressureValue];
		} else {
			// Find the closest lower and upper bounds for interpolation
			const pressures = Object.keys(this.data)
				.map(Number)
				.sort((a, b) => a - b);
			const P1 =
				pressures.find((p) => p <= pressureValue) || pressures[0];
			const P2 =
				pressures.find((p) => p >= pressureValue) ||
				pressures[pressures.length - 1];

			if (P1 === P2) {
				return { error: 'Pressure value out of range' };
			}

			const v_f1 = this.data[P1].specific_volume_liquid;
			const v_f2 = this.data[P2].specific_volume_liquid;
			const v_g1 = this.data[P1].specific_volume_vapor;
			const v_g2 = this.data[P2].specific_volume_vapor;

			const v_f_interpolated = this.interpolate(
				pressureValue,
				P1,
				P2,
				v_f1,
				v_f2
			);
			const v_g_interpolated = this.interpolate(
				pressureValue,
				P1,
				P2,
				v_g1,
				v_g2
			);

			return {
				specific_volume_liquid: v_f_interpolated,
				specific_volume_vapor: v_g_interpolated,
			};
		}
	}
}
