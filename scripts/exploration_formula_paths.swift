// Export the fixed logo expression as outlines in the native STIX math font.
// Run with: swift scripts/exploration_formula_paths.swift > scripts/exploration-formulas.json
import Foundation
import CoreText
import CoreGraphics

let descriptor = CTFontDescriptorCreateWithAttributes([
    kCTFontURLAttribute: URL(fileURLWithPath: "/System/Library/Fonts/Supplemental/STIXTwoMath.otf")
] as CFDictionary)
let font = CTFontCreateWithFontDescriptor(descriptor, 100, nil)
func number(_ value: CGFloat) -> String { String(format: "%.3f", Double(value)) }

func outline(_ text: String) -> CGPath {
    let attributes = [NSAttributedString.Key(kCTFontAttributeName as String): font]
    let line = CTLineCreateWithAttributedString(NSAttributedString(string: text, attributes: attributes))
    let result = CGMutablePath()
    for run in CTLineGetGlyphRuns(line) as! [CTRun] {
        let count = CTRunGetGlyphCount(run)
        var glyphs = [CGGlyph](repeating: 0, count: count)
        var positions = [CGPoint](repeating: .zero, count: count)
        CTRunGetGlyphs(run, CFRange(location: 0, length: 0), &glyphs)
        CTRunGetPositions(run, CFRange(location: 0, length: 0), &positions)
        let runFont = (CTRunGetAttributes(run) as NSDictionary)[kCTFontAttributeName] as! CTFont
        for index in 0..<count {
            if let glyph = CTFontCreatePathForGlyph(runFont, glyphs[index], nil) {
                result.addPath(glyph, transform: CGAffineTransform(translationX: positions[index].x, y: positions[index].y))
            }
        }
    }
    return result
}

func pathData(_ path: CGPath) -> String {
    var commands: [String] = []
    path.applyWithBlock { element in
        let item = element.pointee
        func point(_ index: Int) -> String { "\(number(item.points[index].x)) \(number(item.points[index].y))" }
        switch item.type {
        case .moveToPoint: commands.append("M\(point(0))")
        case .addLineToPoint: commands.append("L\(point(0))")
        case .addQuadCurveToPoint: commands.append("Q\(point(0)) \(point(1))")
        case .addCurveToPoint: commands.append("C\(point(0)) \(point(1)) \(point(2))")
        case .closeSubpath: commands.append("Z")
        @unknown default: fatalError("Unsupported glyph path element")
        }
    }
    return commands.joined(separator: " ")
}

func entry(_ path: CGPath, tex: String) -> [String: Any] {
    let bounds = path.boundingBoxOfPath
    return ["tex": tex, "path": pathData(path), "bounds": [bounds.minX, bounds.minY, bounds.width, bounds.height]]
}

// Mathematical italic letters, upright delimiters, and explicit conditional spacing.
let conditional = outline("𝑃(𝐴 ∣ 𝐵)")
let data = try JSONSerialization.data(withJSONObject: [
    "conditional": entry(conditional, tex: "P(A\\mid B)")
], options: [.prettyPrinted, .sortedKeys])
FileHandle.standardOutput.write(data)
