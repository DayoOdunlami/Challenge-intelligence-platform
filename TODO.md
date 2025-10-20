# Innovation Exchange Platform - TODO

## 🎨 Color Scheme Selector - Future Enhancement

**Status:** Work in Progress  
**Priority:** Low (Nice-to-have feature)

### Issue
The ColorSchemeSelector component currently only sets CSS custom properties but doesn't apply them to page elements. The UI shows theme options but visual changes don't take effect.

### Current Behavior
- ✅ Dropdown works and shows theme options
- ✅ Saves selection to localStorage
- ❌ Visual theme changes don't apply to page elements

### Solution Needed
Implement one of these approaches:
1. **CSS Classes Approach:** Use Tailwind's dynamic class switching
2. **CSS Custom Properties:** Properly wire up the CSS variables to component styles
3. **Context-based Theming:** Use React Context to manage theme state

### Files Involved
- `src/components/ui/ColorSchemeSelector.tsx` - Main component
- `src/styles/cpc-theme.css` - Theme definitions (partially implemented)

### CPC Brand Colors (Ready to Use)
```css
--primary-teal: #006E51;     /* Deep Teal - Brand identity */
--secondary-mint: #CCE2DC;   /* Mint Green - Backgrounds */
--tertiary-charcoal: #2E2D2B; /* Charcoal - Text, icons */
--background-light: #F9F9F9;  /* Off-White - Main background */
--info-blue: #4A90E2;        /* Slate Blue - Hyperlinks */
--warning-amber: #F5A623;    /* Amber - Notifications */
--success-green: #50C878;    /* Fresh Green - Success */
```

### Notes
- Feature is marked as "Coming soon" in the UI
- Amber indicator shows work-in-progress status
- Core platform functionality is complete and working
- This is a cosmetic enhancement for future development

---

## ✅ Completed Features

- Landing page with animations
- Interactive pitch deck (`/pitch`)
- 5 visualization types (Network, Heatmap, Chord, Sunburst, Sankey)
- Profile examples (Buyer & SME)
- QuickNavSidebar navigation
- Professional animations and interactions
- Vercel deployment ready
## 🎯 Chord
 Diagram Enhancement
**Priority: Medium**
**Feature**: Interactive chord selection with detailed connection analysis

### Requirements:
- Fix chord arc clicking to properly update insights panel
- Show detailed analysis when specific chord connections are selected
- Display shared problem types between selected sector pairs
- Show collaboration opportunities and funding flows
- Add visual highlighting of selected chord connections

### Expected Insights Format:
"Transport ↔ Energy connection: 8 shared problem types including 'Smart Infrastructure' and 'Data Analytics'. Total funding: £12M across 15 challenges. Key collaboration opportunities: IoT sensor networks, predictive maintenance platforms."
