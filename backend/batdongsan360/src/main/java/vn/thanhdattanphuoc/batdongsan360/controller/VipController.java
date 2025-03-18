package vn.thanhdattanphuoc.batdongsan360.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import vn.thanhdattanphuoc.batdongsan360.domain.Vip;
import vn.thanhdattanphuoc.batdongsan360.service.VipService;
import vn.thanhdattanphuoc.batdongsan360.util.error.IdInvalidException;

@RestController
public class VipController {
    private final VipService vipService;

    public VipController(VipService vipService) {
        this.vipService = vipService;
    }

    @GetMapping("api/vips")
    public ResponseEntity<List<Vip>> getAllVips() {
        List<Vip> vips = vipService.getAllVips();
        return ResponseEntity.ok(vips);
    }

    @PutMapping("api/admin/vips/{id}/price")
    public ResponseEntity<Vip> updateVipPrice(@PathVariable Long id, @RequestParam long newPrice)
            throws IdInvalidException {
        Vip updatedVip = vipService.updateVipPrice(id, newPrice);
        return ResponseEntity.ok(updatedVip);
    }
}
