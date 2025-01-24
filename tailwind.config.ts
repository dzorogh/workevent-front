import type { Config } from "tailwindcss";
/** @type {import('tailwindcss').Config} */


export default {
	darkMode: ["class"],
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					dark: 'hsl(var(--primary-dark))',
					darker: 'hsl(var(--primary-darker))',
					foreground: {
						DEFAULT: 'hsl(var(--primary-foreground))',
						dark: 'hsl(var(--primary-foreground-dark))'
					},
					background: {
						DEFAULT: 'hsl(var(--primary-background))',
						dark: 'hsl(var(--primary-background-dark))',
						darker: 'hsl(var(--primary-background-darker))'
					}
				},
				footer: {
					background: {
						DEFAULT: 'hsl(var(--footer-background))',
						dark: 'hsl(var(--footer-background-dark))'
					}
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: {
						DEFAULT: 'hsl(var(--muted-foreground))',
						dark: 'hsl(var(--muted-foreground-dark))'
					}
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))',
					dark: 'hsl(var(--success-dark))',
					darker: 'hsl(var(--success-darker))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: {
					DEFAULT: 'hsl(var(--input))',
					foreground: 'hsl(var(--input-foreground))',
					mutedForeground: 'hsl(var(--input-muted-foreground))'
				},
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			}
		}
	},
	plugins: [
		require("tailwindcss-animate"),
		require("@tailwindcss/typography"),
	],
} satisfies Config;
